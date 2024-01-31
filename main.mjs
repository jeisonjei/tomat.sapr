'use strict'
import { Point } from "./models/Point.mjs"
import { createProgram } from "./shared/webgl/program.mjs";
import { getFragmentShaderSource, getVertexshaderSource } from "./shared/webgl/shaders.mjs";
import { canvasGetMouse, transformPointByMatrix3, transformPointByMatrix4 } from "./shared/common.mjs";
import { Line } from "./models/shapes/Line.mjs";
import { gm, setMode } from "./page.mjs";
import { AbstractFrame } from "./models/frames/AbstractFrame.mjs";
import { getMoveMatrix } from "./shared/transform.mjs";

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
const u_move = gl.getUniformLocation(program, 'u_move');
gl.uniform4f(u_color, 1, 0, 0, 1);
gl.uniformMatrix3fv(u_move, false, mat3.create());
// --------- WEBGL ---------


// --------- INIT ---------
function init() {
}
init();


// --------- GLOBALS ---------
export const a = {
    shapes: [],
    isMouseDown: false,

    clickMoveStart: null,
    clickCopyStart: null,

    start: null,
    end: null,

    // shapes
    line: new Line(gl, program, canvas.height / canvas.width, new Point(0, 0), new Point(0, 0), [1, 0, 0, 1]),
    selectFrame: new AbstractFrame(new Point(0, 0), new Point(0, 0), [0, 1, 0, 1])
}
// --------- GLOBALS ---------




// --------- MOUSE EVENTS ---------
function handleMouseDown(mouseEvent) {
    a.isMouseDown = true;
    a.start = canvasGetMouse(mouseEvent, canvas);
    switch (gm()) {
        case 'select':
            a.selectFrame.start = a.start;
            break;
        case 'line':
            a.line.start = a.start;
            break;
        case 'move':
            if (!a.clickMoveStart) {
                a.clickMoveStart = a.start;
            }
            else if (a.clickMoveStart) {
                const move_mat = getMoveMatrix(a.clickMoveStart, a.start);
                a.clickMoveStart = null;
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    shape.start = transformPointByMatrix3(move_mat, shape.start);
                    shape.end = transformPointByMatrix3(move_mat, shape.end);
                    shape.isSelected = false;
                });
                gl.uniformMatrix3fv(u_move, false, mat3.create());
            }
            break;
        case 'copy':
            if (!a.clickCopyStart) {
                a.clickCopyStart = a.start;
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    a.shapes.push(shape.getClone());
                });
            }
            else if (a.clickCopyStart) {
                const move_mat = getMoveMatrix(a.clickCopyStart, a.start);
                a.clickCopyStart = null;
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    shape.start = transformPointByMatrix3(move_mat, shape.start);
                    shape.end = transformPointByMatrix3(move_mat, shape.end);
                });
                gl.uniformMatrix3fv(u_move, false, mat3.create());
            }
            break;
        default:
            break;
    }

    drawShapes();
}

function handleMouseMove(mouseEvent) {
    drawShapes();

    if (a.isMouseDown) {
      switch (gm()) {
        case 'select':
          a.selectFrame.end = canvasGetMouse(mouseEvent, canvas);
          drawShape(a.selectFrame, gl.DYNAMIC_DRAW);
          break;
        case 'line':
          a.line.end = canvasGetMouse(mouseEvent, canvas);
          drawShape(a.line, gl.DYNAMIC_DRAW);
          break;
        default:
          break;
      }
    } else {
      switch (gm()) {
        case 'move':
          if (a.clickMoveStart) {
            const move_mat = getMoveMatrix(a.clickMoveStart, canvasGetMouse(mouseEvent, canvas));
            gl.uniformMatrix3fv(u_move, false, move_mat);
            a.shapes.filter(shape => shape.isSelected).forEach(shape => {
              drawShape(shape, gl.DYNAMIC_DRAW);
            });
          }
          break;
        case 'copy':
          if (a.clickCopyStart) {
            const move_mat = getMoveMatrix(a.clickCopyStart, canvasGetMouse(mouseEvent, canvas));
            gl.uniformMatrix3fv(u_move, false, move_mat);
            a.shapes.filter(shape => shape.isSelected).forEach(shape => {
              drawShape(shape, gl.DYNAMIC_DRAW);
            });
          }
          break;
        default:
          break;
      }
    }
}

function handleMouseUp(mouseEvent) {
    console.log('shapes',a.shapes.length);
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

            break;
        default:
            break;
    }

    drawShapes();
}

document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);
// --------- MOUSE EVENTS ---------




// --------- DRAW ---------
export function drawShapes() {
    gl.uniformMatrix3fv(u_move, false, mat3.create());
    for (const shape of a.shapes) {
        drawShape(shape, gl.DYNAMIC_DRAW);
    }
}

function drawShape(shape, glMode) {
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


function drawMagnets(shape) {

}
// --------- SHAPES ---------

