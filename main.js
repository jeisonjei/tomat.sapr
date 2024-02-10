'use strict'
import { Point } from "./models/Point.mjs"
import { createProgram } from "./shared/webgl/program.mjs";
import { getFragmentShaderSource, getVertexshaderSource } from "./shared/webgl/shaders.mjs";
import { canvasGetClientX, canvasGetClientY, canvasGetMouse, getAngleDegrees, getAngleRadians, transformPointByMatrix3, transformPointByMatrix4 } from "./shared/common.mjs";
import { Line } from "./models/shapes/Line.mjs";
import { gm, setMode } from "./page.mjs";
import { AbstractFrame } from "./models/frames/AbstractFrame.mjs";
import { getMoveMatrix, getRotateSnap } from "./shared/transform.mjs";
import { observeMagnet, magnetState$, getExtensionCoordDraw } from "./shared/magnets.mjs";
import { mat3 } from 'gl-matrix';
import { getNewVertices, pushVertices, replaceVertices } from "./shared/webgl/reshape.mjs";
import { s } from './shared/settings.mjs';

// rxjs
import { Subject, filter, map } from "rxjs";

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
const canvas = document.querySelector('canvas');
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
gl.uniform4f(u_color, 1, 0, 0, 1);
gl.uniformMatrix3fv(u_move, false, mat3.create());
gl.uniformMatrix3fv(u_pan, false, mat3.create());
// --------- WEBGL ---------


// --------- INIT ---------
function init() {
    s.tolerance = 0.02;
}
init();

// --------- GLOBALS ---------
export const a = {

    aspectRatio: canvas.height / canvas.width,

    shapes: [],
    shapes$: new Subject(),

    isMouseDown: false,
    gripPosition: null,
    anglePosition: null,

    clickMoveStart: null,
    clickCopyStart: null,

    start: null,
    end: null,

    // shapes
    line: new Line(canvas.height / canvas.width, new Point(0, 0), new Point(0, 0), [1, 0, 0, 1]),
    selectFrame: new AbstractFrame(new Point(0, 0), new Point(0, 0), [0, 1, 0, 1]),

    // zoom
    zl: null,
    zlc: null,

    // pan
    pan: false,
    isPanning: false,
    pan_tx: null,
    pan_ty: null,
    pan_start_x: null,
    pan_start_y: null,

    // angle snap
    angle_snap: false,

    vertices: []
}
// --------- GLOBALS ---------





// --------- MOUSE EVENTS ---------
function handleMouseDown(mouseEvent) {
    /**
     * Функция выполняется при нажатии мыши. В зависимости от режима select, move, copy, rotate, mirror, line, circle ...
     * выполняются разные блоки. 
     */
    if (a.pan) {
        return;
    }

    a.isMouseDown = true;


    if (a.gripPosition) {
        a.start = { ...a.gripPosition };
    }
    else {
        a.start = canvasGetMouse(mouseEvent, canvas);
    }

    switch (gm()) {
        case 'select':
            a.selectFrame.start = { ...a.start };
            break;
        case 'line':
            a.line.start = { ...a.start };
            break;
        case 'move':
            if (!a.clickMoveStart) {
                a.clickMoveStart = { ...a.start };
            }
            else if (a.clickMoveStart) {
                const move_mat = getMoveMatrix(a.clickMoveStart, a.start);
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    shape.start = transformPointByMatrix3(move_mat, shape.start);
                    shape.end = transformPointByMatrix3(move_mat, shape.end);
                    a.vertices = replaceVertices(shape, a.vertices);
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
            }
            else if (a.clickCopyStart) {
                const move_mat = getMoveMatrix(a.clickCopyStart, a.start);
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    shape.start = transformPointByMatrix3(move_mat, shape.start);
                    shape.end = transformPointByMatrix3(move_mat, shape.end);
                    a.vertices = replaceVertices(shape, a.vertices);
                });
                a.clickCopyStart = null;
                gl.uniformMatrix3fv(u_move, false, mat3.create());
            }
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
    a.gripPosition = null;
    if (magnet) {
        if (magnet.magnet instanceof Array) {
            a.gripPosition = getExtensionCoordDraw(magnet.magnet, a.start, magnet.mouse);
            magnet.magnet.forEach(magnet => drawSingle(magnet, gl.DYNAMIC_DRAW));
        }
        else {
            a.gripPosition = magnet.magnet.center ?? getExtensionCoordDraw( magnet.magnet, a.start, magnet.mouse);
            drawSingle(magnet.magnet, gl.DYNAMIC_DRAW);
        }
    }
});

function handleMouseMove(mouseEvent) {
    /**
     * Функция выполняется при движении мыши. В зависимости от режима выполняются разные операции.
     * В то время, как вся отрисовка выполняется в функции drawSingle, в этой функции в зависимости
     * от режима могут выполняться трансформации.
     */
    requestAnimationFrame(() => {

        const mouse = canvasGetMouse(mouseEvent, canvas);

        drawShapes();

        // magnets
        if (gm() !== 'select') {
            if (!a.pan) {
                observeMagnet(a.shapes, mouse).subscribe();
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
            mat3.transpose(pan_mat, pan_mat);
            gl.uniformMatrix3fv(u_pan, false, pan_mat);
        }


        if (a.isMouseDown) {
            switch (gm()) {
                case 'select':
                    a.selectFrame.end = mouse;
                    drawSingle(a.selectFrame, gl.DYNAMIC_DRAW);
                    break;
                case 'line':

                    if (a.angle_snap) {

                        const dx = (mouse.x - a.start.x) / a.aspectRatio;
                        const dy = mouse.y - a.start.y;
                        const angle = -Math.atan2(dy, dx);
                        const distance = Math.hypot(dx, dy);
                        const snappedAngleRad = getRotateSnap(angle);
                        const snappedDistance = distance / Math.cos(angle - snappedAngleRad);
                        const snappedDx = snappedDistance * Math.cos(snappedAngleRad) * a.aspectRatio;
                        const snappedDy = snappedDistance * Math.sin(snappedAngleRad);
                        a.line.end.x = (a.start.x + snappedDx);
                        a.line.end.y = (a.start.y - snappedDy);
                        a.anglePosition = new Point(a.start.x + snappedDx,a.start.y - snappedDy);
                    } else {
                        a.line.end = mouse;
                    }
                    drawSingle(a.line, gl.DYNAMIC_DRAW);
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
                            drawSingle(shape, gl.DYNAMIC_DRAW);
                        });
                    }
                    break;
                case 'copy':
                    if (a.clickCopyStart) {
                        const move_mat = getMoveMatrix(a.clickCopyStart, mouse);
                        gl.uniformMatrix3fv(u_move, false, move_mat);
                        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                            drawSingle(shape, gl.DYNAMIC_DRAW);
                        });
                    }
                    break;
                default:
                    break;
            }
        }

    });
}

function handleMouseUp(mouseEvent) {
    console.log('shapes', a.shapes.length);
    const mouse = canvasGetMouse(mouseEvent, canvas);
    a.isMouseDown = false;
    
    if (a.gripPosition) {
        a.end = { ...a.gripPosition };
    }
    else if (a.anglePosition) {
        a.end = {...a.anglePosition};
    }
    else {
        a.end = mouse;
    }

    switch (gm()) {
        case 'select':
            a.shapes.forEach(shape => {
                if (shape.isinSelectFrame(a.selectFrame)) {
                    shape.isSelected = !shape.isSelected;
                }
            });

            break;
        case 'line':
            a.line.end = a.end;
            addShapes(a.line.getClone());
            break;
        default:
            break;
    }

    drawShapes();
}


function handleMouseWheel(ev) {
    a.zl = ev.deltaY > 0 ? 0.9 : 1.1;
    a.zlc *= a.zl;
    updateShapes('zoom');
    drawShapes();
}

function handleSpacebarDown() {
    a.pan = true;
    a.isPanning = true;
}
function handleSpacebarUp() {
    a.pan = false;
    gl.uniformMatrix3fv(u_pan, false, mat3.create());
    updateShapes('pan');
    a.pan_tx = 0;
    a.pan_ty = 0;

    drawShapes();
}


canvas.addEventListener('mousedown', handleMouseDown);
canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('mouseup', handleMouseUp);
canvas.addEventListener('wheel', handleMouseWheel);

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

function deleteShapes(shapes) {
    // ...
    a.shapes$.next(a.shapes);
}


export function drawShapes() {
    gl.uniformMatrix3fv(u_move, false, mat3.create());
    if (a.vertices.length === 0) {
        return;
    }
    gl.uniform4f(u_color, 1, 0, 0, 1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a.vertices), gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.LINES, 0, a.vertices.length / 2);
}


function drawSingle(shape, glMode) {
    /**
     * Предполагается, что основное общение с webgl будет происходить через эту функцию.
     * В то же время трансформации происходят также через функцию handleMouseMove
     * @param {Line, Grip, Projection, Circle, rectangle} shape - фигура, которую нужно отрисовать.
     * В качестве фигуры также могут выступать и магниты
     * @param {WebGL enum} glMode - Режим отрисовки - gl.STATIC_DRAW или gl.DYNAMIC_DRAW
     */
    const vertices = shape.getVertices();
    const size = vertices.length;
    const [a, b, c, d] = shape.color;
    if (shape.isSelected) {
        gl.uniform4f(u_color, 0.1, 0.1, 0.1, 1);
    }
    else {
        gl.uniform4f(u_color, a, b, c, d);
    }
    gl.bufferData(gl.ARRAY_BUFFER, vertices, glMode);

    switch (shape.type) {
        case 'select_frame':
            gl.drawArrays(gl.LINE_LOOP, 0, size / 2);

            break;
        case 'm_grip':
            gl.drawArrays(gl.LINE_LOOP, 0, size / 2);
        case 'm_triph':
        case 'm_tripv':
            gl.drawArrays(gl.LINES, 0, size / 2);
        case 'line':
        case 'move':
            gl.drawArrays(gl.LINES, 0, size / 2);

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
