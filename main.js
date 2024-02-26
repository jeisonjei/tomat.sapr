/**
 * TODO
 * разрыв линий
 * заполнение основной надписи, нужно сделать красиво и удобно
 * размер текста при печати - проблема осталась
 * области печати до вывода в PDF
 * мультитекст
 * специальные символы в тексте
 * операция scale
 * resize canvas
 */

'use strict'
import { Point } from "./models/Point.mjs"
import { createProgram } from "./shared/webgl/program.mjs";
import { getFragmentShaderSource, getVertexshaderSource } from "./shared/webgl/shaders.mjs";
import { applyTransformationToPoint, canvasGetMouse, convertWebGLToCanvas2DPoint, isHorizontal, resizeCanvasToDisplaySize, transformPointByMatrix3 } from "./shared/common.mjs";
import { Line } from "./models/shapes/Line.mjs";
import { boundaryModeObserver, colorMagnetsObserver, drawPrintArea, editModeObserver, gm, magnetsCheckbox, mode_elem, outputCheckbox, setMode } from "./page.mjs";
import { AbstractFrame } from "./models/frames/AbstractFrame.mjs";
import { getMirrorMatrix, getMoveMatrix, getRotateMatrix } from "./shared/transform.mjs";
import { observeMagnet, magnetState$, getExtensionCoordDraw, getAnglePosition } from "./shared/magnets.mjs";
import { mat3 } from 'gl-matrix';
import { getNewVertices, pushVertices, replaceVertices } from "./shared/webgl/reshape.mjs";
import { s } from './shared/settings.mjs';

// rxjs
import { Subject, filter, fromEvent, map } from "rxjs";
import { Rectangle } from "./models/shapes/Rectangle.mjs";
import { Circle } from "./models/shapes/Circle.mjs";
import { SymLine } from "./models/shapes/SymLine.mjs";
import { filterText } from "./services/textFilter";
import { Text } from "./models/shapes/Text.mjs";
import { Grip } from "./models/snaps/Grip.mjs";

/**
 * В этой версии программы попробуем осущещствлять вызовы к webgl только из текущего файла.
 * Когда вызовы к webgl осуществляются из различных классов, возникает серьёзная путаница.
 * В этой версии серьёзно увеличилась производительности из-за того,
 * что теперь функция drawShapes не выполняет проход в цикле по массиву a.shapes,
 * а отрисовывает вершины из массива a.vertices. 
 * При всяком изменении массива a.shapes, например при операциях pan, zoom ... 
 * обновляется и массив вершин a.vertices
 */

// --------- WEBGL ---------
const canvas = document.querySelector('canvas.drawing');
resizeCanvasToDisplaySize(canvas);
const gl = canvas.getContext('webgl2');
const program = createProgram(gl, getVertexshaderSource(), getFragmentShaderSource());
gl.useProgram(program);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

const a_position = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);


const u_color = gl.getUniformLocation(program, 'u_color');
const u_pan = gl.getUniformLocation(program, 'u_pan');
const u_move = gl.getUniformLocation(program, 'u_move');
const u_rotate = gl.getUniformLocation(program, 'u_rotate');
gl.uniform4f(u_color, 1, 0, 0, 1);
gl.uniformMatrix3fv(u_move, false, mat3.create());
gl.uniformMatrix3fv(u_pan, false, mat3.create());
gl.uniformMatrix3fv(u_rotate, false, mat3.create());
// --------- WEBGL ---------

s.setAspectRatio(canvas.width, canvas.height);







// --------- GLOBALS ---------
export const a = {

    shapes: [],
    shapes$: new Subject(),
    selected: false,

    isMouseDown: false,
    magnetPosition: null,
    anglePosition: null,

    clickMoveStart: null,
    clickCopyStart: null,
    clickRotateStart: null,
    clickMirrorStart: null,

    start: null,
    end: null,

    // shapes
    line: new Line(s.aspectRatio, new Point(0, 0), new Point(0, 0), [1, 0, 0, 1]),
    symline: new SymLine(s.aspectRatio, new Point(0, 0), new Point(0, 0), [1, 0, 0, 1]),
    circle: new Circle(s.aspectRatio, new Point(0, 0), 0, [1, 0, 0, 1]),
    rectangle: new Rectangle(s.aspectRatio, new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), 0, 0, [1, 0, 0, 1]),
    selectFrame: new AbstractFrame(new Point(0, 0), new Point(0, 0), [0, 1, 0, 1]),

    // zoom
    zl: null,
    zlc: 1,

    // pan
    pan: false,
    isPanning: false,
    pan_tx: null,
    pan_ty: null,
    pan_start_x: null,
    pan_start_y: null,
    pan_mat: null,

    // angle snap
    angle_snap: false,

    vertices: [],

    // ctrl
    ctrl: false
}

export const t = {
    utext: [],
    utext$: new Subject(),
    textPosition: new Point(0, 0),

    translateX: 0,
    translateY: 0,
    scale: 1,

    mouseClick: false,

    isPanning: false,
    panStartPoint: new Point(0, 0),

    fontSize: 36,
    fontName: 'gost_type_a',

    offset: 6,

    editId: null,
    editBoundary: false /**эта переменная нужна чтобы отключить магниты
                            если указатель наведён на текст в режиме text */

}

// --------- GLOBALS ---------


// --------- TEXTCONTEXT ---------
const canvasText = document.querySelector('canvas.text');
resizeCanvasToDisplaySize(canvasText);
const context = canvasText.getContext('2d');

context.font = `${t.fontSize}px ${t.fontName}`;

// --------- TEXTCONTEXT ---------


// --------- INIT ---------
function init() {
    s.tolerance = 0.02;


    const fontSize = document.getElementById('fontSize').value;
    t.fontSize = fontSize;

    // --- назначение параметров, которые будут использоваться в других модулях
    s.setCanvasSize(canvas.width, canvas.height);
    s.setWebglContext(gl);
    s.setTextContext(context);

}
init();
// --------- INIT ---------




// --------- MOUSE EVENTS ---------
function handleMouseDown(mouse) {
    /**
     * Функция выполняется при нажатии мыши. В зависимости от режима select, move, copy, rotate, mirror, line, circle ...
     * выполняются разные блоки. 
     */
    if (a.pan) {
        return;
    }

    a.isMouseDown = true;


    if (a.magnetPosition) {
        a.start = { ...a.magnetPosition };
    }
    else {
        a.start = { ...mouse };
    }


    switch (gm()) {

        case 'break':
            const filteredShapes = a.shapes.filter(shape => shape.isinSelectBoundary(mouse));
            // выбрана 1 линия
            if (filteredShapes.length === 1) {
                filteredShapes.forEach(shape => {
                    switch (shape.type) {
                        case 'line':
                            const breakPoints = shape.getBreakPoints(mouse, a.shapes);
                            if (!breakPoints.bs) {
                                return;
                            }
                            else if (breakPoints.bs.isEqual(breakPoints.be)) {
                                // если bs.isEqual(be), то найдена только одна точка

                                if (mouse.x <= breakPoints.bs.x) {
                                    if (shape.start.x === shape.end.x) {
                                        if (mouse.y > breakPoints.bs.y) {
                                            if (shape.start.y > breakPoints.bs.y) {
                                                shape.start = breakPoints.bs;
                                            }
                                            else {
                                                shape.end = breakPoints.bs;
                                            }
                                        }
                                        else if (mouse.y < breakPoints.bs.y) {
                                            if (shape.start.y < breakPoints.bs.y) {
                                                shape.start = breakPoints.bs;
                                            }
                                            else { 
                                                shape.end = breakPoints.bs;
                                            }
                                        }
                                    }
                                    else {

                                        if (shape.start.x <= breakPoints.bs.x) {
                                            shape.start = breakPoints.bs;
                                        }
                                        else if (shape.end.x <= breakPoints.bs.x) {
                                            shape.end = breakPoints.bs;
                                        }
                                    }
                                }
                                else if (mouse.x > breakPoints.bs.x) {
                                    if (shape.start.x > breakPoints.bs.x) {
                                        shape.start = breakPoints.bs;
                                    }
                                    else if (shape.end.x > breakPoints.bs.x) {
                                        shape.end = breakPoints.bs;
                                    }
                                }
                            }
                            else {
                                const line1 = shape.getClone();
                                const line2 = shape.getClone();
                                if (shape.start.x < shape.end.x) {
                                    line1.end = breakPoints.bs;
                                    line2.start = breakPoints.be;
                                }
                                else if (shape.start.x > shape.end.x) {
                                    line1.end = breakPoints.be;
                                    line2.start = breakPoints.bs;
                                }
                                else {
                                    if (shape.start.y < shape.end.y) {
                                        line1.end = breakPoints.bs;
                                        line2.start = breakPoints.be;
                                    }
                                    else if (shape.start.y > shape.end.y) {
                                        line1.end = breakPoints.be;
                                        line2.start = breakPoints.bs;
                                    }
                                }
                                addShapes(line1);
                                addShapes(line2);
                                a.shapes = a.shapes.filter(s => s.id !== shape.id);
                            }
                            break;

                        default:
                            break;
                    }
                })

            }
            // выбрано 2 пересекающихся линии
            else if (filteredShapes.length === 2) {
                const [l1, l2] = filteredShapes;
                const horizontalLine = isHorizontal(l1, l2);
                const breakPoints = horizontalLine.getBreakPoints(mouse, filteredShapes);
                const line1 = horizontalLine.getClone();
                line1.end = new Point(breakPoints.bs.x - s.tolerance, line1.start.y);
                const line2 = horizontalLine.getClone();
                line2.start = new Point(breakPoints.bs.x + s.tolerance, line2.end.y);
                addShapes(line1);
                addShapes(line2);
                a.shapes = a.shapes.filter(s => s.id !== horizontalLine.id);

            }
            break;

        case 'select':
            a.selectFrame.start = a.start;
            break;
        case 'boundary':
            const isinSelectBoundary = a.shapes.filter(shape => shape.type !== 'text').filter(shape => shape.isinSelectBoundary(mouse));
            if (isinSelectBoundary.length > 0) {
                isinSelectBoundary.forEach(shape => {
                    shape.isSelected = !shape.isSelected;
                })
            }

            // --- text
            const isinSelectBoundaryText = t.utext.filter(t => t.isinSelectBoundary(mouse));
            if (isinSelectBoundaryText.length > 0) {
                isinSelectBoundaryText.forEach(t => {
                    t.isSelected = !t.isSelected;
                })
            }

            drawText();
            break;
        case 'line':
            a.line.start = a.start;
            break;
        case 'symline':
            a.symline.start = a.start;
            break;
        case 'rectangle':
            a.rectangle.p1 = a.start;
            break;
        case 'square':
            a.rectangle.p1 = a.start;
            break;
        case 'circle':
            a.circle.center = a.start;
            break;
        case 'move':
            if (!a.clickMoveStart) {
                a.clickMoveStart = { ...a.start };

                // --- text
                /**
                 * так как в отличие от фигур, для которых используется uniformMatrix3fv,
                 * в операции с текстом меняется позиция самих точек, 
                 * нужно при первом клике запомнить для каждой строки текста расстояние 
                 * от позиции текста до щелчка мыши
                 */
                t.utext.filter(t => t.isSelected).forEach(t => {
                    t.moveXclick = t.start.x;
                    t.moveYclick = t.start.y;
                })
            }
            else if (a.clickMoveStart) {
                const move_mat = getMoveMatrix(a.clickMoveStart, a.start);
                a.shapes.filter(shape => shape.type !== 'text').filter(shape => shape.isSelected).forEach(shape => {
                    switch (shape.type) {
                        case 'line':
                            shape.start = transformPointByMatrix3(move_mat, shape.start);
                            shape.end = transformPointByMatrix3(move_mat, shape.end);
                            a.vertices = replaceVertices(shape, a.vertices);

                            break;
                        case 'rectangle':
                            shape.p1 = transformPointByMatrix3(move_mat, shape.p1);
                            shape.p2 = transformPointByMatrix3(move_mat, shape.p2);
                            shape.p3 = transformPointByMatrix3(move_mat, shape.p3);
                            shape.p4 = transformPointByMatrix3(move_mat, shape.p4);

                            shape.updateCenter();
                            // TODO: replaceVertices
                            break;
                        case 'circle':
                            shape.center = transformPointByMatrix3(move_mat, shape.center);
                            // TODO: replaceVertices
                            break;
                        default:
                            break;
                    }
                    shape.isSelected = false;
                });

                // --- text
                t.utext.filter(t => t.isSelected).forEach(text => {
                    const astart = convertWebGLToCanvas2DPoint(a.start, canvasText.width, canvasText.height);
                    const aclickMoveStart = convertWebGLToCanvas2DPoint(a.clickMoveStart, canvasText.width, canvasText.height);
                    const deltaX = aclickMoveStart.x - astart.x;
                    const deltaY = aclickMoveStart.y - astart.y;
                    text.start.x = text.moveXclick - deltaX;
                    text.start.y = text.moveYclick - deltaY;
                    text.edit = null;
                })
                drawText();

                a.clickMoveStart = null;
                gl.uniformMatrix3fv(u_move, false, mat3.create());
            }
            break;
        case 'copy':
            if (!a.clickCopyStart) {
                a.clickCopyStart = { ...a.start };
                a.shapes.filter(shape => shape.type !== 'text').filter(shape => shape.isSelected).forEach(shape => {
                    addShapes(shape.getClone());
                });

                // --- text
                let array = [];
                t.utext.filter(t => t.isSelected).forEach(t => {
                    array.push(t.getClone());
                    t.copyClick = { ...t.start };

                });

                array.forEach(item => {
                    addText(item);
                    // это нужно для работы magnetObserver и boundaryModeObserver
                    a.shapes.push(item);
                });

            }
            else if (a.clickCopyStart) {
                const move_mat = getMoveMatrix(a.clickCopyStart, a.start);
                a.shapes.filter(shape => shape.type !== 'text').filter(shape => shape.isSelected).forEach(shape => {
                    switch (shape.type) {
                        case 'line':
                            shape.start = transformPointByMatrix3(move_mat, shape.start);
                            shape.end = transformPointByMatrix3(move_mat, shape.end);
                            a.vertices = replaceVertices(shape, a.vertices);
                            break;
                        case 'rectangle':
                            shape.p1 = transformPointByMatrix3(move_mat, shape.p1);
                            shape.p2 = transformPointByMatrix3(move_mat, shape.p2);
                            shape.p3 = transformPointByMatrix3(move_mat, shape.p3);
                            shape.p4 = transformPointByMatrix3(move_mat, shape.p4);

                            shape.updateCenter();
                            // TODO replaceVertices
                            break;
                        case 'circle':
                            shape.center = transformPointByMatrix3(move_mat, shape.center);
                            // TODO replaceVertices
                            break;
                        default:
                            break;
                    }
                });

                // --- text
                t.utext.filter(t => t.isSelected).forEach(text => {
                    const astart = convertWebGLToCanvas2DPoint(a.start, canvasText.width, canvasText.height);
                    const aclickMoveStart = convertWebGLToCanvas2DPoint(a.clickCopyStart, canvasText.width, canvasText.height);
                    const deltaX = aclickMoveStart.x - astart.x;
                    const deltaY = aclickMoveStart.y - astart.y;
                    text.start.x = text.copyClick.x - deltaX;
                    text.start.y = text.copyClick.y - deltaY;
                    text.edit = null;
                })
                drawText();


                a.clickCopyStart = null;
                gl.uniformMatrix3fv(u_move, false, mat3.create());
            }
            break;
        case 'rotate':
            if (!a.clickRotateStart) {
                a.clickRotateStart = { ...a.start };
            }
            else {
                const rotate_mat = getRotateMatrix(a.clickRotateStart, mouse);

                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    switch (shape.type) {
                        case 'line':
                            shape.start = transformPointByMatrix3(rotate_mat, shape.start);
                            shape.end = transformPointByMatrix3(rotate_mat, shape.end);
                            a.vertices = replaceVertices(shape, a.vertices);

                            break;
                        case 'rectangle':
                            shape.p1 = transformPointByMatrix3(rotate_mat, shape.p1);
                            shape.p2 = transformPointByMatrix3(rotate_mat, shape.p2);
                            shape.p3 = transformPointByMatrix3(rotate_mat, shape.p3);
                            shape.p4 = transformPointByMatrix3(rotate_mat, shape.p4);
                            // TODO replaceVertices
                            shape.updatePoints();

                            break;
                        case 'circle':
                            shape.center = transformPointByMatrix3(rotate_mat, shape.center);
                            // TODO replaceVertices
                            break;
                        default:
                            break;
                    }
                })
                a.clickRotateStart = null;
                gl.uniformMatrix3fv(u_rotate, false, mat3.create());
            }
            break;
        case 'rotatecopy':
            if (!a.clickRotateStart) {
                a.clickRotateStart = { ...a.start };
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    addShapes(shape.getClone());
                });

            }
            else {
                const rotate_mat = getRotateMatrix(a.clickRotateStart, mouse);

                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    switch (shape.type) {
                        case 'line':
                            shape.start = transformPointByMatrix3(rotate_mat, shape.start);
                            shape.end = transformPointByMatrix3(rotate_mat, shape.end);
                            a.vertices = replaceVertices(shape, a.vertices);

                            break;
                        case 'rectangle':
                            shape.p1 = transformPointByMatrix3(rotate_mat, shape.p1);
                            shape.p2 = transformPointByMatrix3(rotate_mat, shape.p2);
                            shape.p3 = transformPointByMatrix3(rotate_mat, shape.p3);
                            shape.p4 = transformPointByMatrix3(rotate_mat, shape.p4);
                            // TODO replaceVertices
                            shape.updatePoints();


                            break;
                        case 'circle':
                            shape.center = transformPointByMatrix3(rotate_mat, shape.center);
                            // TODO replaceVertices
                            break;
                        default:
                            break;
                    }
                })
                a.clickRotateStart = null;
                gl.uniformMatrix3fv(u_rotate, false, mat3.create());
            }
            break;
        case 'mirror':
            if (!a.clickMirrorStart) {
                a.clickMirrorStart = { ...a.start };
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    addShapes(shape.getClone());
                });

            }
            else {
                const mirror_mat = getMirrorMatrix(a.clickMirrorStart, mouse);

                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    switch (shape.type) {
                        case 'line':
                            shape.start = transformPointByMatrix3(mirror_mat, shape.start);
                            shape.end = transformPointByMatrix3(mirror_mat, shape.end);
                            a.vertices = replaceVertices(shape, a.vertices);

                            break;
                        case 'rectangle':
                            shape.p1 = transformPointByMatrix3(mirror_mat, shape.p1);
                            shape.p2 = transformPointByMatrix3(mirror_mat, shape.p2);
                            shape.p3 = transformPointByMatrix3(mirror_mat, shape.p3);
                            shape.p4 = transformPointByMatrix3(mirror_mat, shape.p4);

                            // TODO replaceVertices
                            shape.updatePoints();


                            break;
                        case 'circle':
                            shape.center = transformPointByMatrix3(mirror_mat, shape.center);
                            // TODO replaceVertices
                            break;
                        default:
                            break;
                    }
                });
                a.clickMirrorStart = null;
                gl.uniformMatrix3fv(u_rotate, false, mat3.create());
            }
            break;
        case 'edit':
            a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                switch (shape.type) {
                    case 'line':
                        if (shape.isinGripStart(mouse)) {
                            shape.edit = 'start';
                        }
                        else if (shape.isinGripEnd(mouse)) {
                            shape.edit = 'end';
                        }
                        break;
                    case 'rectangle':
                        if (shape.isinGripP1(mouse)) {
                            shape.edit = 'p1';
                        }
                        else if (shape.isinGripP2(mouse)) {
                            shape.edit = 'p2';
                        }
                        else if (shape.isinGripP3(mouse)) {
                            shape.edit = 'p3';
                        }
                        else if (shape.isinGripP4(mouse)) {
                            shape.edit = 'p4';
                        }
                        break;
                    case 'circle':
                        if (shape.isinGripQ1(mouse)) {
                            shape.edit = 'q1';
                        }
                        else if (shape.isinGripQ2(mouse)) {
                            shape.edit = 'q2';
                        }
                        else if (shape.isinGripQ3(mouse)) {
                            shape.edit = 'q3';
                        }
                        else if (shape.isinGripQ4(mouse)) {
                            shape.edit = 'q4';
                        }
                        break;
                    default:
                        break;
                }
            })
            break;
        default:
            break;
    }

    drawShapes();
}




// --------- MAGNETS ---------
magnetState$.pipe(
    /**
     * Функция получает начальную или конечную привязку.
     * Переменная a.gripPosition назначается только здесь
     */
    map(state => {
        const mouse = state.find(object => object.hasOwnProperty('mouse')).mouse;
        const grips = state.filter(magnet => magnet.type === 'm_grip');

        if (grips.length > 0) {
            return { mouse, magnet: grips[0] };
        }

        // If grips.length <= 0, return tripsH or tripsV if available
        const tripsH = state.filter(magnet => magnet.type === 'm_triph');
        const tripsV = state.filter(magnet => magnet.type === 'm_tripv');

        if (tripsH.length > 0 && tripsV.length > 0) {
            return { mouse, magnet: [tripsH[0], tripsV[0]] };
        }
        else if (tripsH.length > 0) {
            return { mouse, magnet: tripsH[0] };
        }
        else if (tripsV.length > 0) {
            return { mouse, magnet: tripsV[0] };
        }

        // If no valid magnets found, return null or handle as needed
        return null;
    })
)
    .subscribe(magnet => {
        if (magnet && a.start) {
            if (magnet.magnet instanceof Array) {
                a.magnetPosition = getExtensionCoordDraw(magnet.magnet, a.start, magnet.mouse);
                magnet.magnet.forEach(magnet => drawSingle(magnet));
            }
            else {

                a.magnetPosition = magnet.magnet.center ?? getExtensionCoordDraw(magnet.magnet, a.start, magnet.mouse);

                drawSingle(magnet.magnet);

            }
        }
    });
// --------- MAGNETS ---------




function handleMouseMove(mouse) {
    /**
     * Функция выполняется при движении мыши. В зависимости от режима выполняются разные операции.
     * В то время, как вся отрисовка выполняется в функции drawSingle, в этой функции в зависимости
     * от режима могут выполняться трансформации.
     */
    requestAnimationFrame(() => {

        drawShapes();

        /**
         * есть только две глобальные переменные такого рода - вот они, причём a.magnetPosition назначается
         * только в magnetState$ и больше нигде, а a.anglePosition назначается только в блоке ниже и больше нигде.
         * Вот что значит хорошая архитектура программы
         */
        a.magnetPosition = null;
        a.anglePosition = null;


        // angle snap depends on edit mode
        if (a.angle_snap) {
            let start = null;
            if (gm() === 'edit') {
                const editShapes = a.shapes.filter(shape => shape.edit !== null);
                editShapes.forEach(shape => {
                    switch (shape.type) {
                        case 'line':
                            if (shape.edit === 'start') {
                                start = shape.end;
                            }
                            else if (shape.edit === 'end') {
                                start = shape.start;
                            }

                            break;

                        default:
                            break;
                    }
                })
            }
            else {
                start = a.start;
            }
            a.anglePosition = getAnglePosition(mouse, start);
        }



        // magnets
        if (magnetsCheckbox.checked) {
            if (!['select', 'boundary', 'textEdit', 'none', 'break'].includes(gm())) {
                if (!a.pan) {
                    if (!t.editBoundary) {
                        // disabling magnets for currently edited shape
                        observeMagnet(a.shapes.filter(shape => (shape.edit === null)), mouse).subscribe();
                    }
                }
            }
        }



        // pan
        if (a.pan) {

            if (a.isPanning) {
                a.pan_start_x = mouse.x;
                a.pan_start_y = mouse.y;
                a.isPanning = false;
            }

            a.pan_tx = mouse.x - a.pan_start_x;
            a.pan_ty = mouse.y - a.pan_start_y;
            const pan_mat = mat3.fromTranslation(mat3.create(), [a.pan_tx, a.pan_ty, 0]);
            a.pan_mat = [...pan_mat];
            mat3.transpose(pan_mat, pan_mat);
            gl.uniformMatrix3fv(u_pan, false, pan_mat);

            // --- text
            const scalex = 1 / canvasText.width;
            const scaley = 1 / canvasText.height;
            const tx = a.pan_tx / scalex / 2;
            const ty = a.pan_ty / scaley / 2;

            const matrix = new DOMMatrix([1, 0, 0, 1, tx, -ty]);
            context.setTransform(matrix);
            drawText();


        }

        // enable edit mode
        editModeObserver(mouse);
        // color grips on move and copy mode
        colorMagnetsObserver(mouse);
        // enable boundary mode
        boundaryModeObserver(mouse);


        if (a.isMouseDown) {
            switch (gm()) {
                case 'edit':
                    const editShapes = a.shapes.filter(shape => shape.edit !== null);
                    if (editShapes.length > 0) {
                        editShapes.forEach(shape => {
                            switch (shape.type) {
                                case 'line':
                                    if (shape.edit === 'start') {
                                        if (a.angle_snap) {
                                            shape.start.x = a.anglePosition.x;
                                            shape.start.y = a.anglePosition.y;
                                        }
                                        else {

                                            shape.start = mouse;
                                        }
                                    } else if (shape.edit === 'end') {
                                        if (a.angle_snap) {
                                            shape.end.x = a.anglePosition.x;
                                            shape.end.y = a.anglePosition.y;
                                        }
                                        else {
                                            shape.end = mouse;

                                        }
                                    }

                                    break;
                                case 'rectangle':
                                    if (a.ctrl) {
                                        if (['p1', 'p2', 'p3', 'p4'].includes(shape.edit)) {

                                            const dx = mouse.x - shape.center.x;
                                            const dy = mouse.y - shape.center.y;

                                            shape.p1.x = shape.center.x - dx;
                                            shape.p1.y = shape.center.y - dy;

                                            shape.p2.x = shape.center.x + dx;
                                            shape.p2.y = shape.center.y - dy;

                                            shape.p3.x = shape.center.x + dx;
                                            shape.p3.y = shape.center.y + dy;

                                            shape.p4.x = shape.center.x - dx;
                                            shape.p4.y = shape.center.y + dy;

                                            shape.updateMid();

                                        }
                                    }
                                    else {


                                        if (shape.edit === 'p1') {
                                            shape.p1 = { ...mouse };
                                            shape.p4.x = mouse.x;
                                            shape.p2.y = mouse.y;
                                        }
                                        else if (shape.edit === 'p2') {
                                            shape.p2 = { ...mouse };
                                            shape.p3.x = mouse.x;
                                            shape.p1.y = mouse.y;
                                        }
                                        else if (shape.edit === 'p3') {
                                            shape.p3 = { ...mouse };
                                            shape.p2.x = mouse.x;
                                            shape.p4.y = mouse.y;
                                        }
                                        else if (shape.edit === 'p4') {
                                            shape.p4 = { ...mouse };
                                            shape.p1.x = mouse.x;
                                            shape.p3.y = mouse.y;
                                        }
                                        shape.updateMid();

                                    }

                                    break;
                                case 'circle':
                                    if (['q1', 'q2', 'q3', 'q4'].includes(shape.edit)) {
                                        const newRadius = Math.hypot((mouse.x - shape.center.x) / s.aspectRatio, mouse.y - shape.center.y);
                                        shape.radius = newRadius;
                                    }
                                default:
                                    break;
                            }
                        });
                    }
                    break;
                case 'select':
                    a.selectFrame.end = mouse;
                    drawSingle(a.selectFrame);
                    break;
                case 'line':

                    if (a.angle_snap) {

                        a.line.end.x = a.anglePosition.x;
                        a.line.end.y = a.anglePosition.y;
                    } else {
                        a.line.end = mouse;
                    }
                    drawSingle(a.line);
                    break;
                case 'symline':
                    if (a.angle_snap) {
                        a.symline.start = a.start;
                        a.symline.end.x = a.anglePosition.x;
                        a.symline.end.y = a.anglePosition.y;

                    }
                    else {
                        a.symline.end = mouse;
                    }
                    drawSingle(a.symline);
                    break;
                case 'rectangle':
                    a.rectangle.width = mouse.x - a.start.x;
                    a.rectangle.height = mouse.y - a.start.y;

                    a.rectangle.p2 = new Point(a.start.x + a.rectangle.width, a.start.y);
                    a.rectangle.p3 = new Point(a.start.x + a.rectangle.width, a.start.y + a.rectangle.height);
                    a.rectangle.p4 = new Point(a.start.x, a.start.y + a.rectangle.height);



                    drawSingle(a.rectangle);
                    break;

                case 'square':
                    a.rectangle.width = (mouse.x - a.start.x);

                    const height = (mouse.y - a.start.y);
                    if (height < 0 && a.rectangle.width < 0) {
                        a.rectangle.height = a.rectangle.width / s.aspectRatio;
                    } else if (height < 0 && a.rectangle.width > 0) {
                        a.rectangle.height = -a.rectangle.width / s.aspectRatio;
                    } else if (height > 0 && a.rectangle.width < 0) {
                        a.rectangle.height = -a.rectangle.width / s.aspectRatio;
                    } else if (height > 0 && a.rectangle.width > 0) {
                        a.rectangle.height = a.rectangle.width / s.aspectRatio;
                    }
                    a.rectangle.p2 = new Point(a.start.x + a.rectangle.width, a.start.y);
                    a.rectangle.p3 = new Point(a.start.x + a.rectangle.width, a.start.y + a.rectangle.height);
                    a.rectangle.p4 = new Point(a.start.x, a.start.y + a.rectangle.height);


                    drawSingle(a.rectangle);
                    break;

                case 'circle':
                    a.circle.radius = Math.hypot((mouse.x - a.start.x) / s.aspectRatio, mouse.y - a.start.y);
                    drawSingle(a.circle);
                    break;

                default:
                    break;
            }
        } else {
            switch (gm()) {
                case 'move':
                    if (a.clickMoveStart) {
                        const move_mat = getMoveMatrix(a.clickMoveStart, mouse);
                        gl.uniformMatrix3fv(u_move, false, move_mat);
                        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                            drawSingle(shape);
                        });

                        // --- text

                        const tx = move_mat[2] * canvasText.width / 2;
                        const ty = move_mat[5] * canvasText.height / 2;

                        t.utext.filter(t => t.isSelected).forEach(t => {
                            t.edit = 1;
                            t.start.x = t.moveXclick + tx;
                            t.start.y = t.moveYclick - ty;
                        });

                        drawText();
                    }
                    break;
                case 'copy':
                    if (a.clickCopyStart) {
                        const move_mat = getMoveMatrix(a.clickCopyStart, mouse);
                        gl.uniformMatrix3fv(u_move, false, move_mat);
                        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                            drawSingle(shape);
                        });

                        // --- text

                        const tx = move_mat[2] * canvasText.width / 2;
                        const ty = move_mat[5] * canvasText.height / 2;

                        t.utext.filter(t => t.isSelected).forEach(t => {
                            t.edit = 1;
                            t.start.x = t.copyClick.x + tx;
                            t.start.y = t.copyClick.y - ty;
                        });

                        drawText();


                    }
                    break;
                case 'rotate':
                case 'rotatecopy':
                    if (a.clickRotateStart) {

                        const rotate_mat = getRotateMatrix(a.clickRotateStart, mouse);
                        gl.uniformMatrix3fv(u_rotate, false, rotate_mat);
                        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                            drawSingle(shape);
                        })
                    }
                    break;
                case 'mirror':
                    if (a.clickMirrorStart) {
                        const mirror_mat = getMirrorMatrix(a.clickMirrorStart, mouse);
                        gl.uniformMatrix3fv(u_rotate, false, mirror_mat);
                        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                            drawSingle(shape);
                        })
                    }
                    break;
                default:
                    break;
            }
        }

    });
}




function handleMouseUp(mouse) {
    console.log('shapes', a.shapes.length);
    a.isMouseDown = false;

    if (a.magnetPosition) {
        a.end = { ...a.magnetPosition };
    }
    else if (a.anglePosition) {
        a.end = { ...a.anglePosition };
    }
    else {
        a.end = mouse;
    }


    switch (gm()) {
        case 'edit':
            const editShapes = a.shapes.filter(shape => shape.edit !== null);
            if (editShapes.length > 0) {
                editShapes.forEach(shape => {
                    switch (shape.type) {
                        case 'line':
                            if (shape.edit === 'start') {
                                shape.start = a.end;
                            }
                            else if (shape.edit === 'end') {
                                shape.end = a.end;
                            }
                            break;
                        case 'rectangle':
                            if (a.ctrl) {
                                if (['p1', 'p2', 'p3', 'p4'].includes(shape.edit)) {

                                    const dx = a.end.x - shape.center.x;
                                    const dy = a.end.y - shape.center.y;

                                    shape.p1.x = shape.center.x - dx;
                                    shape.p1.y = shape.center.y - dy;

                                    shape.p2.x = shape.center.x + dx;
                                    shape.p2.y = shape.center.y - dy;

                                    shape.p3.x = shape.center.x + dx;
                                    shape.p3.y = shape.center.y + dy;

                                    shape.p4.x = shape.center.x - dx;
                                    shape.p4.y = shape.center.y + dy;

                                    shape.updateMid();
                                    shape.updateCenter();
                                    shape.setSelectBoundary();

                                }
                            }
                            else {
                                if (shape.edit === 'p1') {
                                    shape.p1 = a.end;
                                    shape.p4.x = a.end.x;
                                    shape.p2.y = a.end.y;
                                }
                                else if (shape.edit === 'p2') {
                                    shape.p2 = a.end;
                                    shape.p3.x = a.end.x;
                                    shape.p1.y = a.end.y;
                                }
                                else if (shape.edit === 'p3') {
                                    shape.p3 = a.end;
                                    shape.p2.x = a.end.x;
                                    shape.p4.y = a.end.y;
                                }
                                else if (shape.edit === 'p4') {
                                    shape.p4 = a.end;
                                    shape.p1.x = a.end.x;
                                    shape.p3.y = a.end.y;
                                }
                                shape.updateMid();
                                shape.updateCenter();
                                shape.setSelectBoundary();
                            }
                            break;
                        default:
                            break;
                    }
                })
            }

            break;
        case 'select':
            a.shapes.forEach(shape => {
                if (shape.isinSelectFrame(a.selectFrame)) {
                    shape.isSelected = true;
                }
            });

            // --- text
            a.selectFrame.convertToCanvas2d(canvasText.width, canvasText.height);
            t.utext.forEach(text => {
                if (text.isinSelectFrame(a.selectFrame)) {
                    text.isSelected = !text.isSelected;
                }
            });
            drawText();

            break;
        case 'line':
            a.line.end = a.end;
            addShapes(a.line.getClone());
            break;
        case 'symline':
            a.symline.end = a.end;
            a.line.start = a.symline.end;
            a.line.end = a.symline.symend;
            addShapes(a.line.getClone());
            break;
        case 'rectangle':

            a.rectangle.width = a.end.x - a.start.x;
            a.rectangle.height = a.end.y - a.start.y;

            a.rectangle.p2 = new Point(a.start.x + a.rectangle.width, a.start.y);
            a.rectangle.p3 = new Point(a.start.x + a.rectangle.width, a.start.y + a.rectangle.height);
            a.rectangle.p4 = new Point(a.start.x, a.start.y + a.rectangle.height);

            a.rectangle.updateCenter();

            addShapes(a.rectangle.getClone());

            break;
        case 'square':
            a.rectangle.width = (a.end.x - a.start.x);

            const height = (a.end.y - a.start.y);
            if (height < 0 && a.rectangle.width < 0) {
                a.rectangle.height = a.rectangle.width / s.aspectRatio;
            } else if (height < 0 && a.rectangle.width > 0) {
                a.rectangle.height = -a.rectangle.width / s.aspectRatio;
            } else if (height > 0 && a.rectangle.width < 0) {
                a.rectangle.height = -a.rectangle.width / s.aspectRatio;
            } else if (height > 0 && a.rectangle.width > 0) {
                a.rectangle.height = a.rectangle.width / s.aspectRatio;
            }
            a.rectangle.p2 = new Point(a.start.x + a.rectangle.width, a.start.y);
            a.rectangle.p3 = new Point(a.start.x + a.rectangle.width, a.start.y + a.rectangle.height);
            a.rectangle.p4 = new Point(a.start.x, a.start.y + a.rectangle.height);

            addShapes(a.rectangle.getClone());
            break;
        case 'circle':
            a.circle.radius = Math.hypot((a.end.x - a.start.x) / s.aspectRatio, a.end.y - a.start.y);;
            addShapes(a.circle.getClone());
            break;
        default:
            break;
    }

    // reset all edits
    a.shapes.filter(shape => shape.edit !== null).forEach(shape => shape.edit = null);


    drawShapes();

}

function handleMouseWheel(ev) {
    a.zl = ev.deltaY > 0 ? 0.95 : 1.05;
    a.zlc *= a.zl;
    updateShapes('zoom');
    drawShapes();



    // --- text ---
    const scalingMatrix = mat3.fromScaling(mat3.create(), [a.zl, a.zl]);
    const translationMatrix = mat3.fromTranslation(mat3.create(), [
        -(a.zl - 1) * context.canvas.width / 2,
        -(a.zl - 1) * context.canvas.height / 2
    ]);
    const transformationMatrix = mat3.multiply(mat3.create(), translationMatrix, scalingMatrix);

    t.utext.forEach(line => {
        line.start = applyTransformationToPoint(line.start.x, line.start.y, transformationMatrix);
    });

    t.fontSize = t.fontSize * a.zl;
    context.font = `${t.fontSize}px ${t.fontName}`;

    drawText();


}

function handleSpacebarDown() {
    a.pan = true;
    a.isPanning = true;
}
function handleSpacebarUp() {
    a.pan = false;
    gl.uniformMatrix3fv(u_pan, false, mat3.create());
    updateShapes('pan');

    // --- text
    const scalex = 1 / canvasText.width;
    const scaley = 1 / canvasText.height;
    const tx = a.pan_tx / scalex / 2;
    const ty = a.pan_ty / scaley / 2;

    t.utext.forEach(textLine => {
        textLine.start.x = textLine.start.x + tx;
        textLine.start.y = textLine.start.y - ty;

    });
    context.setTransform(new DOMMatrix([1, 0, 0, 1, 0, 0]));
    drawText();

    // --- text

    a.pan_tx = 0;
    a.pan_ty = 0;
    drawShapes();

}

const mouseDown$ = fromEvent(document, 'mousedown').pipe(map(ev => canvasGetMouse(ev, canvas)));
const mouseMove$ = fromEvent(document, 'mousemove').pipe(map(ev => canvasGetMouse(ev, canvas)));
const mouseUp$ = fromEvent(document, 'mouseup').pipe(map(ev => canvasGetMouse(ev, canvas)));
mouseDown$.subscribe(handleMouseDown);
mouseMove$.subscribe(handleMouseMove);
mouseUp$.subscribe(handleMouseUp);

document.addEventListener('wheel', handleMouseWheel);


let spacebarPressed = false;

document.addEventListener('keydown', (ev) => {
    if (ev.key === ' ' && !spacebarPressed) {
        handleSpacebarDown();
        spacebarPressed = true;
    }
});

document.addEventListener('keyup', (ev) => {
    if (ev.key === ' ') {
        handleSpacebarUp();
        spacebarPressed = false;
    }
});
// --------- MOUSE EVENTS ---------



// --------- DRAW ---------
a.shapes$.subscribe((shapes) => {
    a.vertices = getNewVertices(shapes);
});

let id = 0;

function addShapes(shape) {
    shape.id = id++;
    a.shapes.push(shape);
    a.vertices = pushVertices(shape, a.vertices);
}

function updateShapes(mode) {
    switch (mode) {
        case 'zoom':
            a.shapes.forEach(shape => {
                shape.zoom(a.zl);
            })

            break;
        case 'pan':
            a.shapes.forEach(shape => {
                shape.pan(a.pan_tx, a.pan_ty);
            });

            break;
        default:
            break;
    }
    a.shapes$.next(a.shapes);
}

export function deleteShapes(shapes) {
    // ...
    a.shapes = a.shapes.filter(shape => !shape.isSelected);
    a.shapes$.next(a.shapes);
}

export function deleteText(text) {
    t.utext = t.utext.filter(text => !text.isSelected);
}


export function drawShapes() {
    gl.uniformMatrix3fv(u_move, false, mat3.create());
    gl.uniformMatrix3fv(u_rotate, false, mat3.create());
    // if (a.vertices.length === 0) {
    //     return;
    // }
    // gl.uniform4f(u_color, 1, 0, 0, 1);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a.vertices), gl.DYNAMIC_DRAW);
    // gl.drawArrays(gl.LINES, 0, a.vertices.length / 2);

    gl.clearColor(1, 1, 1, 1);
    // закомментировать если где-то нужно нарисовать что-то локально, ручку например функцией drawSingle()
    gl.clear(gl.COLOR_BUFFER_BIT);

    a.shapes.forEach(shape => {
        drawSingle(shape);
    })
}


export function drawSingle(shape) {
    /**
     * Предполагается, что основное общение с webgl будет происходить через эту функцию.
     * В то же время трансформации происходят также через функцию handleMouseMove
     * @param {Line, Grip, Projection, Circle, Rectangle} shape - фигура, которую нужно отрисовать.
     * В качестве фигуры также могут выступать и магниты
    */

    if (shape.type === 'text') {
        return;
    }
    const vertices = shape.getVertices();
    const size = vertices.length;
    const [a, b, c, d] = shape.color;
    if (shape.isSelected) {
        switch (shape.type) {
            case 'line':
                shape.grip.center = shape.start;
                drawSingle(shape.grip);
                shape.grip.center = shape.end;
                drawSingle(shape.grip);
                break;
            case 'rectangle':
                shape.grip.center = shape.p1;
                drawSingle(shape.grip);
                shape.grip.center = shape.p2;
                drawSingle(shape.grip);
                shape.grip.center = shape.p3;
                drawSingle(shape.grip);
                shape.grip.center = shape.p4;
                drawSingle(shape.grip);
                break;
            case 'circle':
                shape.grip.center = shape.quad1;
                drawSingle(shape.grip);
                shape.grip.center = shape.quad2;
                drawSingle(shape.grip);
                shape.grip.center = shape.quad3;
                drawSingle(shape.grip);
                shape.grip.center = shape.quad4;
                drawSingle(shape.grip);
                break;
            default:
                break;
        }
        gl.uniform4f(u_color, 0.5, 0.5, 0.5, 1);
    }
    else {
        gl.uniform4f(u_color, a, b, c, d);
    }
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    switch (shape.type) {
        case 'select_frame':
            gl.drawArrays(gl.LINE_LOOP, 0, size / 2);

            break;
        case 'selectBoundary':
            gl.drawArrays(gl.LINE_LOOP, 0, size / 2);
            break;
        case 'm_grip':
            gl.drawArrays(gl.LINE_LOOP, 0, size / 2);
            break;
        case 'm_triph':
        case 'm_tripv':
            gl.drawArrays(gl.LINES, 0, size / 2);
            break;
        case 'line':
        case 'symline':
            gl.drawArrays(gl.LINES, 0, size / 2);
            break;
        case 'rectangle':
            gl.drawArrays(gl.LINE_LOOP, 0, size / 2);
            break;
        case 'circle':
            gl.drawArrays(gl.LINE_LOOP, 0, size / 2);

            break;
        case 'symline':

            break;
        case 'rectangle':

            break;
        case 'circle':

            break;
        default:
            break;
    }
}
// --------- SHAPES ---------



// --------- UTEXT ---------
let currentLetterIndex;
let editId = 1;

function addText(textLine) {
    textLine.id = editId++;

    t.utext.push(textLine);
}

function removeText() {

}

function handleMouseDownText(mouse) {



    currentLetterIndex = 0;




    if (!['text'].includes(gm())) {
        return;
    }


    for (const textLine of t.utext) {
        if (textLine.isinSelectBoundary(mouse, true)) {
            t.editId = textLine.id;
            t.textPosition = { ...textLine.start };
            drawCursor(0, t.editId);
            drawText(false);
            t.utext = t.utext.filter(t => t.text !== '');

            return;
        }
        t.editId = null;

    }


    if (a.magnetPosition) {
        t.textPosition = { ...convertWebGLToCanvas2DPoint(a.magnetPosition, canvasText.width, canvasText.height) };
    }
    else {
        t.textPosition = new Point(mouse.x, mouse.y);
    }

    t.textPosition.y = t.textPosition.y - t.offset;


    if (a.magnetPosition) {
        context.strokeStyle = 'orange';
    }
    else {
        context.strokeStyle = 'gray';
    }

    const textLine = new Text(s.aspectRatio, t.textPosition, [], context);

    t.utext = t.utext.filter(t => t.text !== '');

    addText(textLine);


    const textHeight = context.measureText(textLine.text).fontBoundingBoxAscent;

    context.clearRect(0, 0, canvasText.width, canvasText.height);
    context.save();

    context.beginPath();
    context.moveTo(t.textPosition.x, t.textPosition.y);
    context.lineTo(t.textPosition.x + 100, t.textPosition.y);
    context.moveTo(t.textPosition.x, t.textPosition.y - textHeight);
    context.lineTo(t.textPosition.x + 100, t.textPosition.y - textHeight);
    context.moveTo(t.textPosition.x, t.textPosition.y);
    context.lineTo(t.textPosition.x, t.textPosition.y - textHeight);
    context.stroke();

    drawText(false);

    a.shapes = a.shapes.filter(t => (t.type !== 'text' || t.text !== ''));

    // только для magnetsObserver, также используется в boundaryModeObserver для отрисовки рамки
    a.shapes.push(...t.utext);


}


function handleKeyPress(key) {

    if (!['text'].includes(gm())) {
        return;
    }
    if (!t.textPosition) {
        return;
    }

    const edit = t.utext.filter(textLine => textLine.id === t.editId);
    let current;
    if (edit.length > 0) {
        current = edit[0];
    }
    else {
        current = getCurrentTextObject();
    }




    if (['ArrowLeft', 'ArrowRight'].includes(key)) {
        if (key === 'ArrowLeft') {
            if (currentLetterIndex === current.text.length) {
                currentLetterIndex = currentLetterIndex - 2;
            }
            else if (currentLetterIndex < current.text.length) {
                currentLetterIndex = currentLetterIndex - 1;
            }
            else if (currentLetterIndex < -1) {
                currentLetterIndex = -1;
            }
        }
        else if (key === 'ArrowRight') {
            currentLetterIndex = currentLetterIndex + 1;
            if (currentLetterIndex > current.text.length - 1) {
                currentLetterIndex = current.text.length - 1;
            }
        }
    }
    else if (['End', 'Home'].includes(key)) {
        if (key === 'End') {
            currentLetterIndex = current.text.length - 1;
        }
        else if (key === 'Home') {
            currentLetterIndex = -1;
        }
    }
    else if (key === 'Backspace') {

        current.delete(currentLetterIndex);
        currentLetterIndex = currentLetterIndex - 1;
        if (currentLetterIndex < -1) {
            currentLetterIndex = -1;
        }


    }

    else if (key) {
        currentLetterIndex = currentLetterIndex + 1;
        current.add(key, currentLetterIndex);
    }

    drawCursor(currentLetterIndex, current.id);
    drawText(false);
}




const mouseDownText$ = fromEvent(canvasText, 'mousedown').pipe(map(ev => getPoint(ev)));
const keyPress$ = fromEvent(document, 'keydown').pipe(
    filter(ev => filterText(ev)),
    map(ev => ev.key)
);

mouseDownText$.subscribe(handleMouseDownText);
keyPress$.subscribe(handleKeyPress);

function getLetterSize(letter) {
    const measure = context.measureText(letter);


    return {
        width: measure.width,
        height: measure.fontBoundingBoxAscent
    };
}

export function drawCursor(index = 0, id) {
    context.clearRect(0, 0, canvasText.width, canvasText.height);
    context.strokeStyle = 'blue';
    context.lineWidth = 2;

    const currentTextObject = getCurrentTextObject(id);
    let w, h;
    const letter = getStringUpToIndex(currentTextObject.text, index + 1);

    w = getLetterSize(letter).width;
    h = getLetterSize(letter).height;


    const p = new Point(currentTextObject.start.x + w, currentTextObject.start.y);
    context.beginPath();
    context.moveTo(p.x, p.y);
    context.lineTo(p.x, p.y - h);
    context.stroke();
}

function getStringUpToIndex(text, index) {
    if (index >= 0 && index < text.length) {
        const newString = text.substring(0, index);
        return newString;
    } else {
        return text;
    }
}

function getCurrentTextObject(editId) {
    /**
     * Функция возвращает "текущий" объект класса Text из массива t.utext
     * @param {Number} editId - идентификатор экземпляра текста, который предполагается редактировать.
     * Этот параметр назначается в функции handleMouseDownText, 
     * если указатель мыши попадает на какую-то строку уже существующего текста. А
     * если не попадает, то t.editId назначается null.
     * Таким образом, если параметр editId не определён, из текущей функцц возвращается последний
     * объект массива t.utext, а если параметр editId назначен, то возвращается 
     * массив с индексом (editId - 1)
    */
    if (!editId) {
        const textObject = t.utext[t.utext.length - 1];
        return textObject;
    }
    else {
        const textObject = t.utext.filter(textLine => textLine.id === editId)[0]
        return textObject;
    }
}

export function drawText(clear = true) {

    if (clear) {
        context.clearRect(0, 0, canvasText.width, canvasText.height);
    }

    context.save();

    t.utext.forEach(textLine => {
        if (textLine.isSelected) {
            context.fillStyle = '#7B7272';
        }
        else {
            context.fillStyle = '#000000';
        }
        context.fillText(textLine.text, textLine.start.x, textLine.start.y);
    });

    if (outputCheckbox.checked) {
        context.resetTransform();

        drawPrintArea();
    }

    context.restore();
}

function drawTextSingle(text, point) {
    const textArray = [text];
    const canvasPoint = convertWebGLToCanvas2DPoint(point, canvasText.width, canvasText.height);
    const newText = new Text(s.aspectRatio, canvasPoint, textArray, context);
    t.utext.push(newText);
    drawText();
}

// --------- UTEXT ---------



// --------- HELPERS ---------
function getPoint(mouseEvent) {
    return new Point(mouseEvent.clientX - 7, mouseEvent.clientY - 8);
}
// --------- HELPERS ---------


