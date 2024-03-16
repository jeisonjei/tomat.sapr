import { s } from "../globalState/settings.mjs";
import { a } from '../globalState/a.js';

import { mat3 } from "gl-matrix";

function drawShapes() {

    // это для того, чтобы фигуры раздваивались
    s.webglContext.uniformMatrix3fv(s.u_move, false, mat3.create());
    s.webglContext.uniformMatrix3fv(s.u_rotate, false, mat3.create());
    s.webglContext.uniformMatrix3fv(s.u_scale, false, mat3.create());




    // НЕ УДАЛЯТЬ !!!
    // if (a.vertices.length === 0) {
    //     return;
    // }
    // gl.uniform4f(u_color, 1, 0, 0, 1);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a.vertices), gl.DYNAMIC_DRAW);
    // gl.drawArrays(gl.LINES, 0, a.vertices.length / 2);



    s.webglContext.clearColor(1, 1, 1, 1);
    // закомментировать если где-то нужно нарисовать что-то локально, ручку например функцией drawSingle()
    s.webglContext.clear(s.webglContext.COLOR_BUFFER_BIT);

    a.shapes.forEach(shape => {
        drawSingle(shape);
    })
}


function drawSingle(shape) {
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
        s.webglContext.uniform4f(s.u_color, 0.5, 0.5, 0.5, 1);
    }
    else {
        s.webglContext.uniform4f(s.u_color, a, b, c, d);
    }
    s.webglContext.bufferData(s.webglContext.ARRAY_BUFFER, vertices, s.webglContext.DYNAMIC_DRAW);

    switch (shape.type) {
        case 'select_frame':
            s.webglContext.drawArrays(s.webglContext.LINE_LOOP, 0, size / 2);

            break;
        case 'selectBoundary':
            s.webglContext.drawArrays(s.webglContext.LINE_LOOP, 0, size / 2);
            break;
        case 'm_grip':
            s.webglContext.drawArrays(s.webglContext.LINE_LOOP, 0, size / 2);
            break;
        case 'm_triph':
        case 'm_tripv':
            s.webglContext.drawArrays(s.webglContext.LINES, 0, size / 2);
            break;
        case 'line':
        case 'symline':
            s.webglContext.drawArrays(s.webglContext.LINES, 0, size / 2);
            break;
        case 'rectangle':
            s.webglContext.drawArrays(s.webglContext.LINE_LOOP, 0, size / 2);
            break;
        case 'circle':
            s.webglContext.drawArrays(s.webglContext.LINE_LOOP, 0, size / 2);

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

export { drawShapes, drawSingle }