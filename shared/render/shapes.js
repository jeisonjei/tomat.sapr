import { s } from "../globalState/settings.mjs";
import { g } from "../globalState/g.js";
import { a } from '../globalState/a.js';

import { mat3 } from "gl-matrix";

import { Point } from "../../models/Point.mjs";
import { AbstractFrame } from "../../models/frames/AbstractFrame.mjs";

import { getNewVertices, pushVertices } from "../webgl/reshape.mjs";

function drawShapes() {

    // это для того, чтобы фигуры раздваивались
    g.context.uniformMatrix3fv(g.u_move, false, mat3.create());
    g.context.uniformMatrix3fv(g.u_rotate, false, mat3.create());
    g.context.uniformMatrix3fv(g.u_scale, false, mat3.create());




    // НЕ УДАЛЯТЬ !!!
    // if (a.vertices.length === 0) {
    //     return;
    // }
    // gl.uniform4f(u_color, 1, 0, 0, 1);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(a.vertices), gl.DYNAMIC_DRAW);
    // gl.drawArrays(gl.LINES, 0, a.vertices.length / 2);



    g.context.clearColor(1, 1, 1, 1);
    // закомментировать если где-то нужно нарисовать что-то локально, ручку например функцией drawSingle()
    g.context.clear(g.context.COLOR_BUFFER_BIT);

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
    var vertices = shape.getVertices();
    var size = vertices.length;
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
        g.context.uniform4f(g.u_color, 0.5, 0.5, 0.5, 1);
    }
    else {
        g.context.uniform4f(g.u_color, a, b, c, d);
    }


    g.context.bufferData(g.context.ARRAY_BUFFER, vertices, g.context.DYNAMIC_DRAW);

    switch (shape.type) {
        case 'select_frame':
            g.context.drawArrays(g.context.LINE_LOOP, 0, size / 2);

            break;
        case 'selectBoundary':
            g.context.drawArrays(g.context.LINE_LOOP, 0, size / 2);
            break;
        case 'm_grip':
            g.context.drawArrays(g.context.LINE_LOOP, 0, size / 2);
            break;
        case 'm_triph':
        case 'm_tripv':
            g.context.drawArrays(g.context.LINES, 0, size / 2);
            break;
        case 'line':
        case 'symline':
            g.context.drawArrays(g.context.TRIANGLES, 0, size / 2);
            break;
        case 'rectangle':
            g.context.drawArrays(g.context.TRIANGLES, 0, size / 2);
            break;
        case 'circle':
            g.context.drawArrays(g.context.TRIANGLES, 0, size / 2);

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

function updateActiveShapes() {
    /**
     * Фигура считается активной, если хотя бы какая-то её часть находится в области видимости
     */
    const p1 = new Point(0, 0);
    const p2 = new Point(g.canvas.width, g.canvas.height);
    const frame = new AbstractFrame(p1, p2, [0, 0, 0, 0]);
    frame.setPoints();
    a.shapes.forEach(shape => {
        if (shape.isinSelectFrameAtLeast(frame)) {
            shape.isinArea = true;
        }
        else {
            shape.isinArea = false;
        }
    });
    a.activeShapes = a.shapes.filter(shape => shape.isinArea);

}

function addShapes(shape) {
    /**
     * Функция используется всегда, когда требуется добавление фигуры
     */
    a.shapes.push(shape);
    a.shapes$.next(a.shapes);
}

function deleteShapes(shapes) {
    /**
     * Функция используется всегда, когда требуется удаление фигуры
     */
    a.shapes = a.shapes.filter(shape => !shape.isSelected);
    a.shapes$.next(a.shapes);
}
function deleteShape(selectedShape) {
    /**
     * Функция используется всегда, когда требуется удаление фигуры
     */
    a.shapes = a.shapes.filter(shape => shape.id!== selectedShape.id);
    a.shapes$.next(a.shapes);
}

a.shapes$.subscribe((shapes) => {
    a.vertices = getNewVertices(shapes);
});


function updateShapesPanZoom(mode) {
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








export { drawShapes, drawSingle, updateActiveShapes, addShapes, updateShapesPanZoom, deleteShapes, deleteShape }