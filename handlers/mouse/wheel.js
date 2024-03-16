import { drawText } from "../../main.js";
import {drawShapes, updateActiveShapes, updateShapes } from "../../shared/render/shapes.js";
import { mat3 } from "gl-matrix";
import { g } from "../../shared/globalState/g.js";
import { c } from "../../shared/globalState/c.js";
import { a } from "../../shared/globalState/a.js";
import { t } from "../../shared/globalState/t.js";
import { applyTransformationToPoint } from "../../shared/common.mjs";

function handleMouseWheel(ev) {
    a.zl = ev.deltaY > 0 ? 0.90 : 1.1;
    a.zlc *= a.zl;
    updateShapes('zoom');
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

document.addEventListener('wheel', handleMouseWheel);

export {handleMouseWheel}