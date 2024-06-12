import { g, getLowerLeftPoint } from "../shared/common.mjs";

/**
 * Функция добавления всплывающих сообщений.
 * Главным образом функция предназначается отображения информации объектов, например такой как длина линии.
 * @param {string} id - id объекта, которому принадлежит подсказка
 * @param {string} type - тип объекта - это может быть линия, прямоугольник и так далее - "line, rectangle ..."
 * @param {object} selectBoundary - область объекта. На данный момент все объекты - линии, прямоугольники и круги имеют объект "selectBoundary", который является прямоугольником из точек p1, p2, p3, p4
 */
function addTooltip(id, type, selectBoundary, message, tooltipName) {
    var existingTooltip = document.getElementById(id);
    if (existingTooltip) {
        return;
    }
    var tooltip = document.createElement("div");
    tooltip.classList.add("shape-tooltip");
    tooltip.setAttribute("id", id);
    var anchor = getLowerLeftPoint(selectBoundary);
    
    var offset = 5;
    var anchorX = anchor.x + offset;
    var anchorY = anchor.y + offset;
    tooltip.style.left = anchorX + "px";
    tooltip.style.top = anchorY + "px";
    tooltip.innerHTML = `<div><b>${tooltipName}</b></div></div>${message}</div>`;

    document.body.appendChild(tooltip);
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

export { addTooltip, clearTooltipAll };