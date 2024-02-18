'use strict'
import { Point } from "./models/Point.mjs"
import { createProgram } from "./shared/webgl/program.mjs";
import { getFragmentShaderSource, getVertexshaderSource } from "./shared/webgl/shaders.mjs";
import { canvasGetClientX, canvasGetClientY, canvasGetMouse, checkFunction, convertCanvas2DToWebGLPoint, convertWebGLToCanvas2DPoint, getAngleDegrees, getAngleRadians, resizeCanvasToDisplaySize, transformPointByMatrix3, transformPointByMatrix4 } from "./shared/common.mjs";
import { Line } from "./models/shapes/Line.mjs";
import { boundaryModeObserver, editModeObserver, gm, mode_elem, setMode } from "./page.mjs";
import { AbstractFrame } from "./models/frames/AbstractFrame.mjs";
import { getMirrorMatrix, getMoveMatrix, getRotateMatrix, getRotateSnap } from "./shared/transform.mjs";
import { observeMagnet, magnetState$, getExtensionCoordDraw, getAnglePosition } from "./shared/magnets.mjs";
import { mat3 } from 'gl-matrix';
import { getNewVertices, pushVertices, replaceVertices } from "./shared/webgl/reshape.mjs";
import { s } from './shared/settings.mjs';

// rxjs
import { Subject, filter, fromEvent, map, takeUntil } from "rxjs";
import { Rectangle } from "./models/shapes/Rectangle.mjs";
import { Circle } from "./models/shapes/Circle.mjs";
import { SymLine } from "./models/shapes/SymLine.mjs";
import { filterText } from "./services/textFilter";
import { Text } from "./models/shapes/Text.mjs";

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
export const canvas = document.querySelector('canvas.drawing');
resizeCanvasToDisplaySize(canvas);
export const gl = canvas.getContext('webgl2');
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
}

export const t = {
    text: [],
    textPosition: new Point(0, 0),

    translateX: 0,
    translateY: 0,
    scale: 1,

    mouseClick: false,

    isPanning: false,
    panStartPoint: new Point(0, 0),

    fontSize: 36,
    // fontName: 'Courier New'
    fontName: 'Arial'
}

// --------- GLOBALS ---------




// --------- INIT ---------
function init() {
    s.tolerance = 0.02;
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
        a.start = mouse
    }

    switch (gm()) {
        case 'select':
            a.selectFrame.start = a.start;
            break;
        case 'boundary':
            const isinSelectBoundary = a.shapes.filter(shape => shape.isinSelectBoundary(mouse));
            if (isinSelectBoundary.length > 0) {
                isinSelectBoundary.forEach(shape => {
                    shape.isSelected = !shape.isSelected;
                })
            }
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
            }
            else if (a.clickMoveStart) {
                const move_mat = getMoveMatrix(a.clickMoveStart, a.start);
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
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
                a.clickMoveStart = null;
                gl.uniformMatrix3fv(u_move, false, mat3.create());
            }
            break;
        case 'copy':
            if (!a.clickCopyStart) {
                a.clickCopyStart = { ...a.start };
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    addShapes(shape.getClone());
                });
                
                // --- text
                t.text.filter(text => text.isSelected).forEach(text => {
                    t.text.push(text);
                });
            }
            else if (a.clickCopyStart) {
                const move_mat = getMoveMatrix(a.clickCopyStart, a.start);
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
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

magnetState$.pipe(
    /**
     * Функция получает начальную или конечную привязку.
     * Переменная a.gripPosition назначается только здесь
     */
    map(state => {
        
        const mouse = state.filter(object => object.hasOwnProperty('mouse'))[0].mouse;
        const grips = state.filter(magnet => magnet.type === 'm_grip');
        const tripsH = state.filter(magnet => magnet.type === 'm_triph');
        const tripsV = state.filter(magnet => magnet.type === 'm_tripv');

        if (grips.length > 0) {
            return { mouse: mouse, magnet: grips[0] };
        }
        else if (tripsH.length > 0 && tripsV.length > 0) {
            return { mouse: mouse, magnet: [tripsH[0], tripsV[0]] };
        }
        else if (tripsH.length > 0) {
            return { mouse: mouse, magnet: tripsH[0] };
        }
        else if (tripsV.length > 0) {
            return { mouse: mouse, magnet: tripsV[0] };
        }

    })
).subscribe(magnet => {
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
        if (gm() !== 'select' && gm() !== 'boundary') {
            if (!a.pan) {
                // disabling magnets for currently edited shape
                observeMagnet(a.shapes.filter(shape => shape.edit === null), mouse).subscribe();
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
        // enable boundary mode
        boundaryModeObserver(mouse);


        if (a.isMouseDown) {
            switch (gm()) {
                case 'edit':
                    const editShapes = a.shapes.filter(shape => shape.edit !== null);
                    if (editShapes.length > 0) {
                        editShapes.forEach(shape => {
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
                        });
                    }
                    break;
                case 'select':
                case 'boundary':
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
                    a.circle.radius = Math.hypot((mouse.x - a.start.x) / s.aspectRatio, mouse.y - a.start.y);;
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
                    }
                    break;
                case 'copy':
                    if (a.clickCopyStart) {
                        const move_mat = getMoveMatrix(a.clickCopyStart, mouse);
                        gl.uniformMatrix3fv(u_move, false, move_mat);
                        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                            drawSingle(shape);
                        });
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

                        default:
                            break;
                    }
                })
            }

            break;
        case 'select':
            a.shapes.forEach(shape => {
                if (shape.isinSelectFrame(a.selectFrame)) {
                    shape.isSelected = !shape.isSelected;
                }
            });

            // --- text
            a.selectFrame.convertToCanvas2d(canvasText.width,canvasText.height);
            t.text.forEach(text => {
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
    a.zl = ev.deltaY > 0 ? 0.9 : 1.1;
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

    t.text.forEach(line => {
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

    t.text.forEach(textLine => {
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
    t.text = t.text.filter(text => !text.isSelected);
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
    if (shape.type==='text') {
        return;
    }
    const vertices = shape.getVertices();
    const size = vertices.length;
    const [a, b, c, d] = shape.color;
    if (shape.isSelected) {
        gl.uniform4f(u_color, 0.1, 0.1, 0.1, 1);
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
            gl.drawArrays(gl.LINES, 0, size / 2);
            break;
        case 'm_grip':
            gl.drawArrays(gl.LINE_LOOP, 0, size / 2);
        case 'm_triph':
        case 'm_tripv':
            gl.drawArrays(gl.LINES, 0, size / 2);
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



// --------- NEW ---------
export const canvasText = document.querySelector('canvas.text');
resizeCanvasToDisplaySize(canvasText);
const context = canvasText.getContext('2d');
t.fontSize = 36;
context.font = `${t.fontSize}px ${t.fontName}`;

function handleMouseDownText(mouse) {

    if (gm() !== 'text') {
        return;
    }

    if (a.magnetPosition) {
        t.textPosition = { ...convertWebGLToCanvas2DPoint(a.magnetPosition,canvasText.width,canvasText.height) };
    }
    else {
        t.textPosition = {...mouse}
    }

    const textLine = new Text(s.aspectRatio, t.textPosition, [], context);
    t.text.push(textLine);
    a.shapes.push(...t.text);
}

function handleKeyPress(key) {

    if (gm() !== 'text') {
        return;
    }
    if (!t.textPosition) {
        return;
    }

    else if (key === 'Backspace') {
        t.text[t.text.length - 1].delete();
    } else if (key) {
        t.text[t.text.length - 1].add(key);
    }

    drawText();
}




const mouseDownText$ = fromEvent(canvasText, 'mousedown').pipe(map(ev => getPoint(ev)));
const keyPress$ = fromEvent(document, 'keyup').pipe(
    filter(ev => filterText(ev)),
    map(ev => ev.key)
);

mouseDownText$.subscribe(handleMouseDownText);
keyPress$.subscribe(handleKeyPress);

// --------- EVENTS ---------

// --------- TEXT ---------

export function drawText() {
    context.clearRect(0, 0, canvasText.width, canvasText.height);
    context.save();

    t.text.forEach(textLine => {
        if (textLine.isSelected) {
            context.fillStyle = '#7B7272';
        }
        else {
            context.fillStyle = '#000000';
        }
        context.fillText(textLine.text, textLine.start.x, textLine.start.y);
    });

    context.restore();
}

function applyTransformationToPoint(x, y, matrix) {
    const newX = matrix[0] * x + matrix[3] * y + matrix[6];
    const newY = matrix[1] * x + matrix[4] * y + matrix[7];
    return new Point(newX, newY);
}

// --------- TEXT ---------



// --------- HELPERS ---------
function getPoint(mouseEvent) {
    return new Point(mouseEvent.clientX - 7, mouseEvent.clientY - 2);
}
// --------- HELPERS ---------


