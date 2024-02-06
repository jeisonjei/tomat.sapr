'use strict'
import { Point } from "./models/Point.mjs"
import { createProgram } from "./shared/webgl/program.mjs";
import { getFragmentShaderSource, getVertexshaderSource } from "./shared/webgl/shaders.mjs";
import { canvasGetClientX, canvasGetClientY, canvasGetMouse, getAngleDegrees, getAngleRadians, transformPointByMatrix3, transformPointByMatrix4 } from "./shared/common.mjs";
import { Line } from "./models/shapes/Line.mjs";
import { gm, setMode } from "./page.mjs";
import { AbstractFrame } from "./models/frames/AbstractFrame.mjs";
import { getMoveMatrix, getRotateSnap } from "./shared/transform.mjs";

/**
 * В этой версии программы попробуем осущещствлять вызовы к webgl только из текущего файла.
 * Когда вызовы к webgl осуществляются из различных классов, возникает серьёзная путаница.
 */



// --------- WEBGL ---------
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');
const program = createProgram(gl, getVertexshaderSource(), getFragmentShaderSource());
gl.useProgram(program);
gl.viewport(0, 0, canvas.width, canvas.height);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const a_position = gl.getAttribLocation(program, 'a_position');
const vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(a_position);

const u_color = gl.getUniformLocation(program, 'u_color');
const u_pan = gl.getUniformLocation(program, 'u_pan');
const u_move = gl.getUniformLocation(program, 'u_move');
gl.uniform4f(u_color, 1, 0, 0, 1);
gl.uniformMatrix3fv(u_move, false, mat3.create());
gl.uniformMatrix3fv(u_pan, false, mat3.create());
// --------- WEBGL ---------


// --------- INIT ---------
function init() {
}
init();


// --------- GLOBALS ---------
export const a = {

    aspectRatio: canvas.height / canvas.width,

    shapes: [],
    isMouseDown: false,
    gripPosition: null,

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
                a.clickMoveStart = null;
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    shape.start = transformPointByMatrix3(move_mat, shape.start);
                    shape.end = transformPointByMatrix3(move_mat, shape.end);
                    shape.isSelected = false;
                    pushVertices(shape);
                });
                gl.uniformMatrix3fv(u_move, false, mat3.create());
            }
            break;
        case 'copy':
            if (!a.clickCopyStart) {
                a.clickCopyStart = { ...a.start };
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    a.shapes.push(shape.getClone());
                    // ---
                    pushVertices(shape);
                });
            }
            else if (a.clickCopyStart) {
                const move_mat = getMoveMatrix(a.clickCopyStart, a.start);
                a.clickCopyStart = null;
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    shape.start = transformPointByMatrix3(move_mat, shape.start);
                    shape.end = transformPointByMatrix3(move_mat, shape.end);
                    pushVertices(shape);
                });
                gl.uniformMatrix3fv(u_move, false, mat3.create());
            }
            break;
        default:
            break;
    }

    drawShapes();
}

function pushVertices(shape) {
    const vertices = shape.getVerticesArray();
    for (const v of vertices) {
        a.vertices.push(v);
    }
}

function handleMouseMove(mouseEvent) {
    requestAnimationFrame(() => {


        drawShapes();

        const mouse = canvasGetMouse(mouseEvent, canvas);

        // magnet observer
        if (gm() !== 'select') {
            if (!a.pan) {
                for (const shape of a.shapes) {
                    const grip = assignGripPositionAndGetGrip(shape, mouseEvent);
                    if (grip) {
                        drawSingle(grip, gl.DYNAMIC_DRAW);
                        // если ручка найдена, выход, чтобы в текущем цикле 'mousemove' a.gripPosition не переписывалась
                        break;
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
            mat3.transpose(pan_mat, pan_mat);
            gl.uniformMatrix3fv(u_pan, false, pan_mat);
        }

        if (a.gripPosition) {
            a.end = { ...a.gripPosition };
        }
        else {
            a.end = mouse;
        }

        if (a.isMouseDown) {
            switch (gm()) {
                case 'select':
                    a.selectFrame.end = mouse;
                    drawSingle(a.selectFrame, gl.DYNAMIC_DRAW);
                    break;
                case 'line':

                    if (a.angle_snap) {

                        const dx = (canvasGetClientX(mouseEvent, canvas) - a.start.x) / a.aspectRatio;
                        const dy = canvasGetClientY(mouseEvent, canvas) - a.start.y;
                        const angle = -Math.atan2(dy, dx);
                        const distance = Math.hypot(dx, dy);
                        const snappedAngleRad = getRotateSnap(angle);
                        const snappedDistance = distance / Math.cos(angle - snappedAngleRad);
                        const snappedDx = snappedDistance * Math.cos(snappedAngleRad) * a.aspectRatio;
                        const snappedDy = snappedDistance * Math.sin(snappedAngleRad);
                        a.line.end.x = (a.start.x + snappedDx);
                        a.line.end.y = (a.start.y - snappedDy);
                    } else {
                        a.line.end = { ...a.end };
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

    a.isMouseDown = false;

    switch (gm()) {
        case 'select':
            a.shapes.forEach(shape => {
                if (shape.isinSelectFrame(a.selectFrame)) {
                    shape.isSelected = !shape.isSelected;
                }
            });

            break;
        case 'line':
            const line = a.line.getClone();
            a.shapes.push(line);
            // ---
            pushVertices(line);
            break;
        default:
            break;
    }

    drawShapes();
}

function handleMouseWheel(ev) {
    a.zl = ev.deltaY > 0 ? 0.9 : 1.1;
    a.zlc *= a.zl;

    a.shapes.forEach(shape => {
        shape.zoom(a.zl);
    })

    drawShapes();
}

function handleSpacebarDown() {
    a.pan = true;
    a.isPanning = true;
}
function handleSpacebarUp() {
    a.pan = false;
    gl.uniformMatrix3fv(u_pan, false, mat3.create());
    a.shapes.forEach(shape => {
        shape.pan(a.pan_tx, a.pan_ty);
    });
    a.pan_tx = 0;
    a.pan_ty = 0;
}


document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);
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



// --------- DRAW ---------
export function drawShapes() {
    // if (a.vertices.length === 0) {
    //     return;
    // }
    gl.uniformMatrix3fv(u_move, false, mat3.create());
    // gl.uniform4f(u_color,1,0,0,1);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a.vertices), gl.DYNAMIC_DRAW);
    // gl.drawArrays(gl.LINES, 0, a.vertices.length / 2);
    for (const shape of a.shapes) {
        drawSingle(shape, gl.DYNAMIC_DRAW);
    }
}

function drawSingle(shape, glMode) {
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


function assignGripPositionAndGetGrip(shape, mouseEvent) {
    /**
     * Получаем фигуру, а возвращаем фигуру-ручку, которую нужно отрисовать
     */
    const mouse = canvasGetMouse(mouseEvent, canvas);
    switch (shape.type) {
        case 'line':
            if (shape.isMouseInGripAtStart(mouse)) {
                a.gripPosition = { ...shape.start };
                shape.grip.center = { ...shape.start };
                return shape.grip;
            }
            else if (shape.isMouseInGripAtMid(mouse)) {
                a.gripPosition = { ...shape.mid };
                shape.grip.center = { ...shape.mid };
                return shape.grip;
            }
            else if (shape.isMouseInGripAtEnd(mouse)) {
                a.gripPosition = { ...shape.end };
                shape.grip.center = { ...shape.end };
                return shape.grip;
            }
            else {
                a.gripPosition = null;
                return null;
            }

        default:
            break;

    }
}
// --------- SHAPES ---------

