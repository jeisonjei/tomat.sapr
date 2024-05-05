import { drawShapes, drawSingle, updateShapesPanZoom, updateActiveShapes } from "../../shared/render/shapes";

import { a } from "../../shared/globalState/a";
import { t } from "../../shared/globalState/t";
import { g } from "../../shared/globalState/g";

import { mat3 } from "gl-matrix";


function handleSpacebarDown() {
    a.pan = true;
    a.isPanning = true;
}
function handleSpacebarUp() {
    a.pan = false;
    g.context.uniformMatrix3fv(g.u_pan, false, mat3.create());
    updateShapesPanZoom('pan');



    a.pan_tx = 0;
    a.pan_ty = 0;
    drawShapes();

    // проверить какие фигуры находятся в области полотна
    updateActiveShapes();


}


let spacebarPressed = false;

function registerSpacebarEvents() {
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
}

export { handleSpacebarDown, handleSpacebarUp, registerSpacebarEvents }