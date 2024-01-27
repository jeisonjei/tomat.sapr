'use strict'
import { Point } from "./models/Point.mjs"
import { createProgram } from "./shared/webgl/program.mjs";
import { getFragmentShaderSource, getVertexshaderSource } from "./shared/webgl/shaders.mjs";
import { canvasGetMouse } from "./common.mjs";
import { Line } from "./models/shapes/Line.mjs";
import { gm, setMode } from "./page.mjs";



// --------- WEBGL ---------
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');
const program = createProgram(gl, getVertexshaderSource(), getFragmentShaderSource());
gl.useProgram(program);
gl.viewport(0, 0, canvas.width, canvas.height);
const a_position = gl.getAttribLocation(program, 'a_position');
const vertex_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(a_position);

const u_color = gl.getUniformLocation(program, 'u_color');
gl.uniform4f(u_color, 1, 0, 0, 1);
// --------- WEBGL ---------


// --------- INIT ---------
function init() {
}
init();


// --------- GLOBALS ---------
const a = {
    shapes: [],
    isMouseDown: false,

    start: null,
    end: null,

    // shapes
    line: new Line(gl, program, canvas.height / canvas.width, new Point(0, 0), new Point(0, 0), [1, 0, 0, 1])
}
// --------- GLOBALS ---------




// --------- MOUSE EVENTS ---------
function handleMouseDown(mouseEvent) {
    a.isMouseDown = true;
    a.line.start = canvasGetMouse(mouseEvent, canvas);
}
function handleMouseMove(mouseEvent) {
    drawShapes();

    if (a.isMouseDown) {
        a.line.end = canvasGetMouse(mouseEvent, canvas);
        drawShape(a.line, gl.DYNAMIC_DRAW);
    }
}
function handleMouseUp(mouseEvent) {
    a.isMouseDown = false;
    const line = a.line.getClone();
    a.shapes.push(line);
}

document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);
// --------- MOUSE EVENTS ---------




// --------- SHAPES ---------
function drawShapes() {
    for (const shape of a.shapes) {
        drawShape(shape, gl.STATIC_DRAW);
    }
}

function drawShape(shape, glMode) {

    const vertices = shape.getVertices();
    const size = vertices.length;
    const [a, b, c, d] = shape.color;
    gl.uniform4f(u_color, a, b, c, d);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, glMode);

    switch (shape.type) {
        case 'line':
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




// --------- MODES ---------


