import { findThirdPoint, g, getAngleDegrees, getLowerLeftPoint } from "../shared/common.mjs";
import { a } from "../shared/globalState/a";
import { addShapes, drawShapes, updateActiveShapes } from "../shared/render/shapes";
import { g as webgl } from "../shared/globalState/g";
import { Point } from "../models/Point.mjs";


/**
 * Функция добавления всплывающих сообщений.
 * Главным образом функция предназначается отображения информации объектов, например такой как длина линии.
 * @param {string} id - id объекта, которому принадлежит подсказка
 * @param {string} type - тип объекта - это может быть линия, прямоугольник и так далее - "line, rectangle ..."
 * @param {object} selectBoundary - область объекта. На данный момент все объекты - линии, прямоугольники и круги имеют объект "selectBoundary", который является прямоугольником из точек p1, p2, p3, p4
 */
function addTooltipInfo(id, type, selectBoundary, message, tooltipName) {
    var existingTooltip = document.getElementById(id);
    if (existingTooltip) {
        return;
    }
    var tooltip = document.createElement("div");
    tooltip.classList.add("shape-tooltip");
    tooltip.classList.add("grid-tooltip");
    tooltip.setAttribute("id", id);
    var anchor = getLowerLeftPoint(selectBoundary);
    var padding = 25;
    var offset = 5;

    if (anchor.x > padding && anchor.y < window.innerHeight - padding) {
        var anchorX = anchor.x + offset;
        var anchorY = anchor.y + offset;
        tooltip.style.left = anchorX + "px";
        tooltip.style.top = anchorY + "px";
        tooltip.innerHTML = `<div><b>${tooltipName}</b></div></div>${message}</div>`;
    
        document.body.appendChild(tooltip);
        
    }

}
/**
 * Функция добавления поля ввода длины для линий
 * @param {string} id - id объекта
 * @param {number} length - длина линии
 */
function addTooltipLength(id, selectBoundary, length, lineEndPoint, anchorFunction) {
    
    
    var { tooltip, inputField } = createTooltipWithInput(length, id, selectBoundary, anchorFunction);

    var existingTooltip = document.querySelector('.shape-tooltip');
    
    if (!existingTooltip) {
        tooltip.appendChild(inputField);
        document.body.appendChild(tooltip);
        inputField.focus();
        inputField.select();
        inputField.addEventListener("keydown", function (e) {
            if (e.key === 'Enter') {
                /**
                 * Это очевидно, но просто напоминание - этот блок выполняется только если во время черчения нажат Enter,
                 * то есть на текущую функциональность он никак не влияет
                 */
                let virtualLineEnd = g(0, 0);
                if (a.magnetPosition) {
                    virtualLineEnd = { ...a.magnetPosition };
                }
                else {
                    virtualLineEnd = { ...a.line.end };
                }
            
                let point3 = findThirdPoint(a.line.start, virtualLineEnd, inputField.value*a.zlc);
                a.line.end = point3;
                addShapes(a.line.getClone());
                a.clickLineStart = false;
                a.isMouseDown = false;
                clearTooltipAll();
                updateActiveShapes();
                drawShapes();
            }
        });

    }
    else {
        let input = existingTooltip.firstChild;
        input.value = length;
        input.focus();
        input.select();


    }




}
function createTooltipWithInput(length, id, selectBoundary, anchorFunction) {
    var tooltip = document.createElement("div");
    var inputField = document.createElement("input");

    inputField.setAttribute("type", "text");
    inputField.setAttribute("value", length);
    inputField.setAttribute("id", id);
    inputField.classList.add("shape-tooltip-input");

    tooltip.classList.add("shape-tooltip");
    tooltip.setAttribute("id", id);
    var anchor = anchorFunction(selectBoundary);

    var offset = 5;
    var anchorX = anchor.x + offset;
    var anchorY = anchor.y + offset;
    tooltip.style.left = anchorX + "px";
    tooltip.style.top = anchorY + "px";
    inputField.value = length;
    return { tooltip, inputField };
}

/**
 * Функция удаления подсказки. У объекта одновременно может отображаться только одна подсказка
 */
function removeTooltip(id) {
    let tooltip = document.getElementById(id);
    document.body.removeChild(tooltip);
}

/**
 * Функция удаляет все подсказки shape-tooltip из документа
 */
function clearTooltipAll() {
    let tooltips = document.getElementsByClassName("shape-tooltip");
    for (let i = 0; i < tooltips.length; i++) {
        document.body.removeChild(tooltips[i]);
    }
}

export { addTooltipInfo, clearTooltipAll, addTooltipLength };