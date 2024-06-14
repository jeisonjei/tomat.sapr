import { Point } from "../models/Point.mjs";
import { a } from './../shared/globalState/a.js';
import { t } from './../shared/globalState/t.js';
import { s } from '../shared/globalState/settings.mjs'
import { gm, setMode, mode_elem } from "../page.mjs";
import { checkFunction, getColor, getLowerLeftPoint } from "../shared/common.mjs";
import { drawSingle } from "../shared/render/shapes.js";
import { addTooltipInfo, clearTooltipAll } from "./tooltip.js";

export function colorMagnetsObserver(mouse, shapes) {
    /**
     * Функция нужна для раскрашивания ручек
     */
    if (a.isMouseDown) {
        return;
    }

    else if (['move', 'copy', 'rotate', 'rotatecopy', 'mirror', 'scale'].includes(gm())) {
        const color = getColor(212, 39, 216, 1);
        shapes.filter(shape => shape.isSelected).forEach(shape => {
            switch (shape.type) {
                case 'line':
                    if (shape.isinGripStart(mouse) || shape.isinGripEnd(mouse)) {
                        shape.grip.color = color;
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];
                    }
                    break;
                case 'rectangle':
                    if (shape.isinGripP1(mouse) || shape.isinGripP2(mouse) || shape.isinGripP3(mouse) || shape.isinGripP4(mouse)
                    ) {
                        shape.grip.color = color;
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];
                    }
                    break;
                case 'circle':
                    if (shape.isinGripQ1(mouse) || shape.isinGripQ2(mouse) || shape.isinGripQ3(mouse) || shape.isinGripQ4(mouse)) {
                        shape.grip.color = color;
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];
                    }
                    break;
                default:
                    break;
            }
        });

    }

}

export function editModeObserver(mouse, shapes) {
    if (a.isMouseDown) {
        return;
    }

    else if (gm() === 'select' || gm() === 'edit' || gm() === 'boundary') {
        shapes.filter(shape => shape.isSelected).forEach(shape => {
            switch (shape.type) {
                case 'line':
                    if (shape.isinGripStart(mouse) || shape.isinGripEnd(mouse)) {
                        shape.grip.color = [0, 0, 1, 1];
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];
                        setMode(mode_elem, 'edit');
                    }
                    else {
                        if (!a.isMouseDown) {
                            setMode(mode_elem, 'select');

                        }
                    }
                    break;
                case 'rectangle':
                    if (shape.isinGripP1(mouse) || shape.isinGripP2(mouse) || shape.isinGripP3(mouse) || shape.isinGripP4(mouse)) {
                        shape.grip.color = [0, 0, 1, 1];
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];
                        setMode(mode_elem, 'edit');
                    }
                    else {
                        if (!a.isMouseDown) {
                            setMode(mode_elem, 'select');
                        }
                    }
                    break;
                case 'circle':
                    if (shape.isinGripQ1(mouse) || shape.isinGripQ2(mouse) || shape.isinGripQ3(mouse) || shape.isinGripQ4(mouse)) {
                        shape.grip.color = [0, 0, 1, 1];
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];

                        setMode(mode_elem, 'edit');
                    }
                    else {
                        if (!a.isMouseDown) {
                            setMode(mode_elem, 'select');
                        }
                    }
                    break;
                default:
                    break;
            }
        });

    }

}

export function boundaryModeObserver(mouse, shapes) {
    if (a.isMouseDown) {
        return;
    }

    t.editBoundary = false;

    if (['select', 'boundary', 'break'].includes(gm())) {
        const isinSelectBoundary = shapes.filter(shape => checkFunction(shape, 'isinSelectBoundary', mouse));
        if (isinSelectBoundary.length > 0) {
            if (gm() !== 'break') {
                setMode(mode_elem, 'boundary');
            }
            isinSelectBoundary.forEach(shape => {
                shape.setSelectBoundary();
                drawSingle(shape.selectBoundary);

                // create div element absolutely positioned according to the element position
                if (!shape.isSelected) {
                    let htmlMessage = null;
                    if (shape.type === 'line') {
                        let length = (shape.getLength() / a.zlc).toFixed(1) + ' мм';
                        htmlMessage = `<div>
                                            <p><b>длина</b></p>
                                       </div>
                                       <div>
                                           <p>${length}</p>
                                       </div>`;

                    }
                    else if (shape.type === 'rectangle') {
                        let width = (shape.getWidth() / a.zlc).toFixed(1) + ' мм';
                        let height = (shape.getHeight() / a.zlc).toFixed(1) + ' мм';
                        htmlMessage = `<div>
                                           <p><b>ширина</b></p>
                                           <p><b>высота</b></p>
                                       </div>
                                       <div>
                                           <p>${width}</p>
                                           <p>${height}</p>
                                       </div>`;
                    }
                    addTooltipInfo(shape.id, shape.selectBoundary, htmlMessage);
                }
                else {
                    clearTooltipAll();
                }
            })
        }
        else {
            if (gm() !== 'break') {
                setMode(mode_elem, 'select');
            }
            else {
                setMode(mode_elem, 'break');
            }
            clearTooltipAll();

        }

    }
}