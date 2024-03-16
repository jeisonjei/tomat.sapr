import { drawShapes, drawSingle, updateShapes, updateActiveShapes } from "../../shared/render/shapes";
import { drawText } from "../../main";

import { a } from "../../shared/globalState/a";
import { t } from "../../shared/globalState/t";
import { g } from "../../shared/globalState/g";
import { c } from "../../shared/globalState/c";

import { mat3 } from "gl-matrix";


function handleSpacebarDown() {
    a.pan = true;
    a.isPanning = true;
}
function handleSpacebarUp() {
    a.pan = false;
    g.context.uniformMatrix3fv(g.u_pan, false, mat3.create());
    updateShapes('pan');

    // --- text
    const scalex = 1 / c.canvas.width;
    const scaley = 1 / c.canvas.height;
    const tx = a.pan_tx / scalex / 2;
    const ty = a.pan_ty / scaley / 2;

    t.utext.forEach(textLine => {
        textLine.start.x = textLine.start.x + tx;
        textLine.start.y = textLine.start.y - ty;

    });
    c.context.setTransform(new DOMMatrix([1, 0, 0, 1, 0, 0]));
    drawText();

    // --- text

    a.pan_tx = 0;
    a.pan_ty = 0;
    drawShapes();

    // проверить какие фигуры находятся в области полотна
    updateActiveShapes();


}


let spacebarPressed = false;

document.addEventListener('keydown', (ev) => {
    if (ev.key === ' ' && !spacebarPressed) {
        handleSpacebarDown();
        spacebarPressed = true;
    }
});

document.addEventListener('keyup', (ev) => {
    if (ev.key === ' ') {
        handleSpacebarUp();
        spacebarPressed = false;
    }
});

export { handleSpacebarDown, handleSpacebarUp }