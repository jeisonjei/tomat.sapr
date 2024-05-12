import { a } from "../../shared/globalState/a";
import { t } from "../../shared/globalState/t";
import { g } from "../../shared/globalState/g";
import { s } from "../../shared/globalState/settings.mjs";

import { gm } from "../../page.mjs";
import { drawShapes, drawSingle, addShapes, updateActiveShapes, updateShapesPanZoom } from "../../shared/render/shapes";
import { transformPointByMatrix3 } from "../../shared/common.mjs";
import { getMoveMatrix } from "../../shared/transform.mjs";
import { getRotateMatrix } from "../../shared/transform.mjs";
import { getScaleMatrix } from "../../shared/transform.mjs";
import { getMirrorMatrix } from "../../shared/transform.mjs";

import { textLinesCollection, textLinesCollection$ } from "../../libs/canvas-text/src/shared/state";

import { mat3 } from "gl-matrix";

// --- rxjs
import { fromEvent, map } from "rxjs";

import { getSideOfMouseRelativeToLine, canvasGetMouse } from "../../shared/common.mjs";
import { replaceVertices } from "../../shared/webgl/reshape.mjs";

import { Point } from "../../models/Point.mjs";
import { cnv } from "../../libs/canvas-text/src/shared/cnv";
import { rerender } from "../../libs/canvas-text/src";

import { magnet$ } from "../../libs/canvas-text/src/shared/state";


function handleMouseDown(mouse) {
    /**
     * @desc Функция выполняется при нажатии мыши. В зависимости от режима, который узнаётся через функцию gm(), выполняются разные блоки
     * @property {Point} a.start - Переменная назначается однажды, в самом начале функции и используется
     * как начальная точка. В зависимости от того, назначена ли точка a.magnetPosition, может быть или равна
     * текущему положению мыши, или точке a.magnetPosition
     * @property {Point} a.magnetPosition - Переменная назначается только в одном месте всей программы
     * через наблюдатель magnetState$ в функции handleMouseMove.
     * 
     * 
     * 
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

    magnet$.next(a.start);

    switch (gm()) {

        case 'break':
            const filteredShapes = a.shapes.filter(shape => shape.isinSelectBoundary(mouse));

            // выбрана 1 линия
            if (filteredShapes.length === 1) {
                filteredShapes.forEach(shape => {
                    // так как массив длиной 1, то этот блок выполняется только один раз
                    switch (shape.type) {
                        case 'line':
                            const { bs, be } = shape.getBreakPoints(mouse, a.shapes);

                            if (!bs) {
                                return;
                            }
                            else if ((bs && !be) || (bs?.x === be.x && bs?.y === be.y)) {
                                const side = getSideOfMouseRelativeToLine(mouse, bs, shape);
                                if (side === 'start') {
                                    shape.start = bs;
                                }
                                else if (side === 'end') {
                                    shape.end = bs;
                                }

                            }
                            else {
                                const side = getSideOfMouseRelativeToLine(mouse, bs, shape);
                                const line1 = shape.getClone();
                                const line2 = shape.getClone();
                                if (side === 'start') {
                                    line1.end = be;
                                    line2.start = bs;
                                }
                                else if (side === 'end') {
                                    line1.start = be;
                                    line2.end = bs;
                                }



                                addShapes(line1);
                                addShapes(line2);
                                a.shapes = a.shapes.filter(s => s.id !== shape.id);
                                updateActiveShapes();
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
                updateActiveShapes();


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
                textLinesCollection.filter(t => t.selected).forEach(t => {
                    t.moveXclick = t.start.x;
                    t.moveYclick = t.start.y;
                });

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
                /**
                 * Здесь участок от предыдущей версии, когда операции с текстом ещё не были вынесены в отдельную библиотеку.
                 * А ведь массив textLinesCollection, который здесь можно представить как utext, можно изменять
                 * из любого места программы. Получается, что пока что и не нужно удалять код, который
                 * перемещал и копировал текст, просто эти операции будут производиться над другим массивом. 
                 * Нарушает ли это изолированность библиотеки canvas-text? Как бы и нет, просто в программу получается
                 * вносятся дополнительные операции над коллекциями из другого места. Библиотека же сама
                 * так же остаётся способной работать автономно, просто без этих функций, например без функций перемещения и копирования.
                 * В будущем можно предусмотреть эти функции и в самой библиотеке, но всё равно останется необходимость взаимодействовать
                 * с магнитами и рамкой основной программы.
                 */
                textLinesCollection.filter(t => t.selected).forEach(text => {
                    const deltaX = a.clickMoveStart.x - a.start.x;
                    const deltaY = a.clickMoveStart.y - a.start.y;
                    text.start.x = text.moveXclick - deltaX;
                    text.start.y = text.moveYclick - deltaY;
                    text.edit = null;
                });

                cnv.clear();
                rerender();

                a.clickMoveStart = null;
                g.context.uniformMatrix3fv(g.u_move, false, mat3.create());
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
                textLinesCollection.filter(t => t.selected).forEach(t => {
                    array.push(t.clone());
                    t.copyClick = { ...t.start };
                });

                array.forEach(item => {
                    item.selected = false;
                    textLinesCollection$.next({ fnName: 'push', line: item });
                    // это нужно для работы magnetObserver и boundaryModeObserver
                    // a.shapes.push(item);
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
                textLinesCollection.filter(t => t.selected).forEach(text => {
                    const deltaX = a.clickCopyStart.x - a.start.x;
                    const deltaY = a.clickCopyStart.y - a.start.y;
                    text.start.x = text.copyClick.x - deltaX;
                    text.start.y = text.copyClick.y - deltaY;
                    text.edit = null;
                });

                cnv.clear();
                rerender();



                a.clickCopyStart = null;
                g.context.uniformMatrix3fv(g.u_move, false, mat3.create());
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
                g.context.uniformMatrix3fv(g.u_rotate, false, mat3.create());
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
                g.context.uniformMatrix3fv(g.u_rotate, false, mat3.create());
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
                g.context.uniformMatrix3fv(g.u_rotate, false, mat3.create());
            }
            break;
        case 'scale':
            if (!a.clickScaleStart1 && !a.clickScaleStart2) {
                a.clickScaleStart1 = { ...a.start };
            }
            else if (a.clickScaleStart1 && !a.clickScaleStart2) {
                a.clickScaleStart2 = { ...a.start };
                a.clickScaleBaseDistanceX = a.clickScaleStart2.x - a.clickScaleStart1.x;
                a.clickScaleBaseDistanceY = a.clickScaleStart2.y - a.clickScaleStart1.y;
                a.clickScaleBaseDistance = Math.hypot(a.clickScaleBaseDistanceX, a.clickScaleBaseDistanceY);
                let minX = 10000;
                let maxX = 0;

                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    switch (shape.constructor.name) {
                        case 'Line':
                            if (shape.start.x < minX) {
                                minX = shape.start.x;
                            }
                            if (shape.end.x < minX) {
                                minX = shape.end.x;
                            }
                            if (shape.start.x > maxX) {
                                maxX = shape.start.x;
                            }
                            if (shape.end.x > maxX) {
                                maxX = shape.end.x;
                            }
                            break;
                        case 'Rectangle':
                            let points = [shape.p1, shape.p2, shape.p3, shape.p4];
                            points.forEach(point => {
                                if (point.x < minX) {
                                    minX = point.x;
                                }
                                if (point.x > maxX) {
                                    maxX = point.x;
                                }
                            });
                            break;
                        case 'Circle':
                            let circleMinX = shape.center.x - shape.radius;
                            let circleMaxX = shape.center.x + shape.radius;
                            if (circleMinX < minX) {
                                minX = circleMinX;
                            }
                            if (circleMaxX > maxX) {
                                maxX = circleMaxX;
                            }
                            break;
                        default:
                            break;
                    }
                });
                a.clickScaleShapeDistance = maxX - minX;
            }

            else if (a.clickScaleStart1 && a.clickScaleStart2) {
                const dx = (mouse.x - a.clickScaleStart2.x);
                const dy = (mouse.y - a.clickScaleStart2.y);

                const distX = a.clickScaleBaseDistanceX + dx;
                const distY = a.clickScaleBaseDistanceY + dy;


                const scale_mat = getScaleMatrix(a.clickScaleStart1, distX, distY, a.clickScaleBaseDistance, a.clickScaleShapeDistance);
                g.context.uniformMatrix3fv(g.u_scale, false, scale_mat);
                a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                    switch (shape.type) {
                        case 'line':
                            shape.start = transformPointByMatrix3(scale_mat, shape.start);
                            shape.end = transformPointByMatrix3(scale_mat, shape.end);
                            break;
                        case 'rectangle':
                            shape.p1 = transformPointByMatrix3(scale_mat, shape.p1);
                            shape.p2 = transformPointByMatrix3(scale_mat, shape.p2);
                            shape.p3 = transformPointByMatrix3(scale_mat, shape.p3);
                            shape.p4 = transformPointByMatrix3(scale_mat, shape.p4);
                            shape.updateCenter();
                            break;
                        case 'circle':
                            shape.center = transformPointByMatrix3(scale_mat, shape.center);
                            // Calculate the new radius based on the scale factor
                            let distanceFromCenter = Math.hypot(distX, distY);
                            shape.radius = shape.radius * (distanceFromCenter / a.clickScaleBaseDistance);
                            break;
                        default:

                            break;
                    }
                })

                a.clickScaleStart1 = null;
                a.clickScaleStart2 = null;
                g.context.uniformMatrix3fv(g.u_scale, false, mat3.create());
            }
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




function registerMouseDownEvent() {
    const mouseDown$ = fromEvent(document, 'mousedown').pipe(map(ev => canvasGetMouse(ev, g.canvas)));
    mouseDown$.subscribe(handleMouseDown);


}
export { handleMouseDown, registerMouseDownEvent };