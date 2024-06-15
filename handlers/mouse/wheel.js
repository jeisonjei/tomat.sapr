
import {drawShapes, updateActiveShapes, updateShapesPanZoom } from "../../shared/render/shapes";
import { mat3 } from "gl-matrix";
import { g } from "../../shared/globalState/g";
import { a } from "../../shared/globalState/a";
import { t } from "../../shared/globalState/t";
import { applyTransformationToPoint, getRealScale } from "../../shared/common.mjs";


// --- rxjs
import { fromEvent } from "rxjs";
import { clearTooltipAll } from "../../services/tooltip";

function handleMouseWheel(ev) {
    clearTooltipAll();
    a.zl = ev.deltaY > 0 ? 0.90 : 1.1;
    a.zlc *= a.zl;
    updateShapesPanZoom('zoom');
    drawShapes();

    updateActiveShapes();

    let scaleElem = document.getElementById('real-scale');
    var realScale = getRealScale();
    scaleElem.innerHTML = `<span class='text-slate-600'>масштаб <code>1:${realScale.toFixed(2)}</code></span>`;


}

function registerMouseWheelEvent() {
    const wheel$ = fromEvent(document, 'wheel');
    wheel$.subscribe(handleMouseWheel);
}

export {handleMouseWheel, registerMouseWheelEvent}