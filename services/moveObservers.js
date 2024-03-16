import { Point } from "../models/Point.mjs";
import { a } from "../main.js";
import { t } from "../main.js";
import { s } from '../shared/globalState/settings.mjs'
import { gm, setMode, mode_elem } from "../page.mjs";
import { checkFunction, getColor } from "../shared/common.mjs";
import { drawSingle } from "../shared/render/shapes.js";

export function colorMagnetsObserver(mouse, shapes) {
    /**
     * Функция нужна для раскрашивания ручек
     */
    if (a.isMouseDown) {
        return;
    }

    else if (['move', 'copy', 'rotate', 'rotatecopy', 'mirror','scale'].includes(gm())) {
        const color = getColor(212, 39, 216,1);
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

export function editModeObserver(mouse,shapes) {
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

export function boundaryModeObserver(mouse,shapes) {
    if (a.isMouseDown) {
        return;
    }

    t.editBoundary = false;

    
    if (gm() === 'text') {
        const isinSelectBoundary = t.utext.filter(t => t.isinSelectBoundary(mouse));

        if (isinSelectBoundary.length > 0) {
            for (const textLine of isinSelectBoundary) {
                textLine.setSelectBoundary();
                textLine.selectBoundary.color = [0, 0, 1, 1];
                drawSingle(textLine.selectBoundary);
                textLine.selectBoundary.color = [0.75, 0.75, 0.75, 1];
                t.editBoundary = true;
                return;
            }
        }

    }

    else if (['select','boundary','break'].includes(gm())) {
        const isinSelectBoundary = shapes.filter(shape => checkFunction(shape, 'isinSelectBoundary', mouse));
        if (isinSelectBoundary.length > 0) {
            if (gm()!=='break') {
                setMode(mode_elem, 'boundary');
            }
            isinSelectBoundary.forEach(shape => {
                shape.setSelectBoundary();
                drawSingle(shape.selectBoundary);

            })
        }
        else {
            if (gm()!=='break') {
                setMode(mode_elem, 'select');
            }
            else {
                setMode(mode_elem, 'break');
            }
        }

    }
}