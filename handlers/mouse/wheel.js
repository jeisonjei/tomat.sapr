import {text} from "../../shared/render/text";
import {drawShapes, updateActiveShapes, updateShapesPanZoom } from "../../shared/render/shapes";
import { mat3 } from "gl-matrix";
import { g } from "../../shared/globalState/g";
import { c } from "../../shared/globalState/c";
import { a } from "../../shared/globalState/a";
import { t } from "../../shared/globalState/t";
import { applyTransformationToPoint } from "../../shared/common.mjs";

import {drawText} from "../../shared/render/text";

// --- rxjs
import { fromEvent } from "rxjs";

function handleMouseWheel(ev) {
    a.zl = ev.deltaY > 0 ? 0.90 : 1.1;
    a.zlc *= a.zl;
    updateShapesPanZoom('zoom');
    drawShapes();



    // --- text ---
    const scalingMatrix = mat3.fromScaling(mat3.create(), [a.zl, a.zl]);
    const translationMatrix = mat3.fromTranslation(mat3.create(), [
        -(a.zl - 1) * c.canvas.width / 2,
        -(a.zl - 1) * c.canvas.height / 2
    ]);
    const transformationMatrix = mat3.multiply(mat3.create(), translationMatrix, scalingMatrix);

    t.utext.forEach(line => {
        line.start = applyTransformationToPoint(line.start.x, line.start.y, transformationMatrix);
    });

    t.fontSize = t.fontSize * a.zl;
    c.context.font = `${t.fontSize}px ${t.fontName}`;

    drawText();
    updateActiveShapes();


}

function registerMouseWheelEvent() {
    const wheel$ = fromEvent(document, 'wheel');
    wheel$.subscribe(handleMouseWheel);
}

export {handleMouseWheel, registerMouseWheelEvent}