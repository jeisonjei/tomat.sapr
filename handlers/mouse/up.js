import { a } from "../../shared/globalState/a";
import { t } from "../../shared/globalState/t";
import { gm } from "../../page.mjs";
import { transformPointByMatrix3, canvasGetMouse } from "../../shared/common.mjs";
import { g } from "../../shared/globalState/g";
import { c } from "../../shared/globalState/c";
import { getMoveMatrix } from "../../shared/transform.mjs";
import { getRotateMatrix } from "../../shared/transform.mjs";
import { getScaleMatrix } from "../../shared/transform.mjs";
import {drawText} from "../../shared/render/text";

import { s } from "../../shared/globalState/settings.mjs";
import { Point } from "../../models/Point.mjs";

import { drawShapes, drawSingle, addShapes, updateActiveShapes, updateShapesPanZoom } from "../../shared/render/shapes";

// --- rxjs
import { fromEvent, map } from "rxjs";

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
            a.selectFrame.convertToCanvas2d(c.canvas.width, c.canvas.height);
            t.utext.forEach(text => {
                if (text.isinSelectFrame(a.selectFrame)) {
                    text.isSelected = !text.isSelected;
                }
            });
            drawText();
            a.selectFrame.start = 0;
            a.selectFrame.end = 0;
                

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

            addShapes(a.rectangle.getClone());
            break;
        case 'circle':
            a.circle.radius = Math.hypot((a.end.x - a.start.x), a.end.y - a.start.y);;
            addShapes(a.circle.getClone());
            break;
        default:
            break;
    }

    // reset all edits
    a.shapes.filter(shape => shape.edit !== null).forEach(shape => shape.edit = null);


    drawShapes();

    // проверить какие фигуры находятся в области полотна
    updateActiveShapes();


}

function registerMouseUpEvent() {
    const mouseUp$ = fromEvent(document, 'mouseup').pipe(map(ev => canvasGetMouse(ev, g.canvas)));
    mouseUp$.subscribe(handleMouseUp);
}


export { handleMouseUp, registerMouseUpEvent }