import { a } from "../../shared/globalState/a";
import { t } from "../../shared/globalState/t";
import { g } from "../../shared/globalState/g.js";
import { gm } from "../../page.mjs";
import { getMoveMatrix } from "../../shared/transform.mjs";
import { getRotateMatrix } from "../../shared/transform.mjs";
import { getScaleMatrix } from "../../shared/transform.mjs";
import { getMirrorMatrix } from "../../shared/transform.mjs";

import { magnetsCheckbox } from "../../page.mjs";

import { editModeObserver } from "../../services/moveObservers";
import { colorMagnetsObserver } from "../../services/moveObservers";
import { boundaryModeObserver } from "../../services/moveObservers";
import { observeMagnet } from "../../shared/magnets.mjs";

import { drawShapes, drawSingle } from "../../shared/render/shapes";

import { Point } from "../../models/Point.mjs";

import { canvasGetWebglCoordinates, canvasGetMouse, getLowerLeftPoint } from "../../shared/common.mjs";

import { getAnglePosition } from "../../shared/magnets.mjs";

import { mat3 } from "gl-matrix";

import { textLinesCollection } from "../../libs/canvas-text/src/shared/state.js";


// --- rxjs
import { fromEvent, map } from "rxjs";
import { rerender } from "../../libs/canvas-text/src/index.js";
import { cnv } from "../../libs/canvas-text/src/shared/cnv.js";
import { addTooltipLength } from "../../services/tooltip.js";

// --- other libraries --------------------------------
import { v4 as uuidv4 } from "uuid";


function handleMouseMove(mouse) {
    /**
     * Функция выполняется при движении мыши. В зависимости от режима выполняются разные операции.
     * В то время, как вся отрисовка выполняется в функции drawSingle, в этой функции в зависимости
     * от режима могут выполняться трансформации.
     * ДЛЯ УЛУЧШЕНИЯ ПРОИЗВОДИТЕЛЬНОСТИ ОБРАТИТЬСЯ К ЭТОЙ ФУНКЦИИ - НАИБОЛЕЕ ВЕРОЯТНО СПОСОБЫ УЛУЧШЕНИЯ НАХОДЯТСЯ ЗДЕСЬ
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




        // filter active shapes

        // magnets
        if (magnetsCheckbox.checked) {
            if (!['select', 'boundary', 'textEdit', 'none', 'break'].includes(gm())) {
                if (!a.pan) {
                    if (!t.editBoundary) {
                        // disabling magnets for currently edited shape
                        observeMagnet(a.activeShapes.filter(shape => (shape.edit === null)), mouse).subscribe();
                    }
                }
            }
        }



        // pan
        if (a.pan) {
            const mouseWebgl = canvasGetWebglCoordinates(mouse, g.canvas);

            if (a.isPanning) {
                a.pan_start_x = mouseWebgl.x;
                a.pan_start_y = mouseWebgl.y;
                a.isPanning = false;
            }

            a.pan_tx = mouseWebgl.x - a.pan_start_x;
            a.pan_ty = mouseWebgl.y - a.pan_start_y;



            const pan_mat = mat3.fromTranslation(mat3.create(), [a.pan_tx, a.pan_ty, 0]);
            a.pan_mat = [...pan_mat];
            mat3.transpose(pan_mat, pan_mat);
            g.context.uniformMatrix3fv(g.u_pan, false, pan_mat);




        }

        // enable edit mode
        editModeObserver(mouse, a.activeShapes);
        // color grips on move and copy mode
        colorMagnetsObserver(mouse, a.activeShapes);
        // enable boundary mode
        boundaryModeObserver(mouse, a.activeShapes);


        if (a.isMouseDown || a.clickLineStart || a.clickRectangleStart || a.clickCircleStart || a.clickSquareStart) {
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
                                        const newRadius = Math.hypot((mouse.x - shape.center.x), mouse.y - shape.center.y);
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

                    a.line.setSelectBoundary();
                    addTooltipLength(uuidv4(), a.line.selectBoundary, (a.line.getLength()/a.zlc), a.line.end, getLowerLeftPoint);
                    
    

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
                        a.rectangle.height = a.rectangle.width;
                    } else if (height < 0 && a.rectangle.width > 0) {
                        a.rectangle.height = -a.rectangle.width;
                    } else if (height > 0 && a.rectangle.width < 0) {
                        a.rectangle.height = -a.rectangle.width;
                    } else if (height > 0 && a.rectangle.width > 0) {
                        a.rectangle.height = a.rectangle.width;
                    }
                    a.rectangle.p2 = new Point(a.start.x + a.rectangle.width, a.start.y);
                    a.rectangle.p3 = new Point(a.start.x + a.rectangle.width, a.start.y + a.rectangle.height);
                    a.rectangle.p4 = new Point(a.start.x, a.start.y + a.rectangle.height);


                    drawSingle(a.rectangle);
                    break;

                case 'circle':
                    a.circle.radius = Math.hypot((mouse.x - a.start.x), mouse.y - a.start.y);
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
                        g.context.uniformMatrix3fv(g.u_move, false, move_mat);
                        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                            drawSingle(shape);
                        });

                        // --- text

                        const tx = move_mat[2] * cnv.context.canvas.width / 2;
                        const ty = move_mat[5] * cnv.context.canvas.height / 2;

                        textLinesCollection.filter(t => t.selected).forEach(t => {
                            t.edit = 1;
                            t.start.x = t.moveXclick + tx;
                            t.start.y = t.moveYclick - ty;
                        });
                        cnv.clear();
                        rerender();



                    }
                    break;
                case 'copy':
                    if (a.clickCopyStart) {
                        const move_mat = getMoveMatrix(a.clickCopyStart, mouse);
                        g.context.uniformMatrix3fv(g.u_move, false, move_mat);
                        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                            drawSingle(shape);
                        });

                        // --- text

                        const tx = move_mat[2] * cnv.context.canvas.width / 2;
                        const ty = move_mat[5] * cnv.context.canvas.height / 2;

                        textLinesCollection.filter(t => t.selected).forEach(t => {
                            t.edit = 1;
                            t.start.x = t.copyClick.x + tx;
                            t.start.y = t.copyClick.y - ty;
                        });

                        cnv.clear();
                        rerender();



                    }
                    break;
                case 'rotate':
                case 'rotatecopy':
                    if (a.clickRotateStart) {

                        const rotate_mat = getRotateMatrix(a.clickRotateStart, mouse);
                        g.context.uniformMatrix3fv(g.u_rotate, false, rotate_mat);
                        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                            drawSingle(shape);
                        })
                    }
                    break;
                case 'mirror':
                    if (a.clickMirrorStart) {
                        const mirror_mat = getMirrorMatrix(a.clickMirrorStart, mouse);
                        g.context.uniformMatrix3fv(g.u_rotate, false, mirror_mat);
                        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                            drawSingle(shape);
                        })
                    }
                    break;
                case 'scale':
                    if (a.clickScaleStart1 && a.clickScaleStart2) {
                        const dx = (mouse.x - a.clickScaleStart2.x);
                        const dy = (mouse.y - a.clickScaleStart2.y);

                        const distX = a.clickScaleBaseDistanceX + dx;
                        const distY = a.clickScaleBaseDistanceY + dy;


                        const scale_mat = getScaleMatrix(a.clickScaleStart1, distX, distY, a.clickScaleBaseDistance, a.clickScaleShapeDistance);
                        g.context.uniformMatrix3fv(g.u_scale, false, scale_mat);
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

function registerMouseMoveEvent() {
    const mouseMove$ = fromEvent(document, 'mousemove').pipe(map(ev => canvasGetMouse(ev, g.canvas)));
    mouseMove$.subscribe(handleMouseMove);
}


export { handleMouseMove, registerMouseMoveEvent }