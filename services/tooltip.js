import { findThirdPoint, g, getAngleDegrees, getLowerLeftPoint } from "../shared/common.mjs";
import { a } from "../shared/globalState/a";
import { addShapes, drawShapes, updateActiveShapes } from "../shared/render/shapes";
import { g as webgl } from "../shared/globalState/g";
import { Point } from "../models/Point.mjs";

/**
 * Должны ли одновременно отображаться несколько марок, будь то информация или ввод данных? Наверное нет,
 * поэтому для всех марок на фигурах будет один класс, по которому они и будут выбираться
 */
const ttcname = "shape-tooltip";
const gridcname = "grid-tooltip";


/**
 * Функция добавления всплывающих сообщений.
 * Главным образом функция предназначается отображения информации объектов, например такой как длина линии.
 * @param {string} id - id объекта, которому принадлежит подсказка
 * @param {string} type - тип объекта - это может быть линия, прямоугольник и так далее - "line, rectangle ..."
 * @param {object} selectBoundary - область объекта. На данный момент все объекты - линии, прямоугольники и круги имеют объект "selectBoundary", который является прямоугольником из точек p1, p2, p3, p4
 */
function addTooltipInfo(id, selectBoundary, htmlMessage) {
    if (a.pan) {
        return;
    }
    var existingTooltip = document.querySelector(`.${ttcname}`);
    if (existingTooltip) {
        clearTooltipAll();
    }
    var tooltip = document.createElement("div");
    tooltip.classList.add(ttcname);
    tooltip.classList.add(gridcname);
    tooltip.setAttribute("id", id);
    var anchor = getLowerLeftPoint(selectBoundary);
    var padding = 25;
    var offset = 5;

    if (anchor.x > padding && anchor.y < window.innerHeight - padding) {
        var anchorX = anchor.x + offset;
        var anchorY = anchor.y + offset;
        tooltip.style.left = anchorX + "px";
        tooltip.style.top = anchorY + "px";
        tooltip.innerHTML = htmlMessage;
    
        document.body.appendChild(tooltip);
        
    }

}
/**
 * Функция добавления поля ввода длины для линий
 * @param {string} id - id объекта
 * @param {number} length - длина линии
 */
function addTooltipLength(id, selectBoundary, length, anchorFunction) {

    var anchor = anchorFunction(selectBoundary);
    var { tooltip, inputField } = createTooltipWithInput(length, id, anchor);

    var existingTooltip = document.querySelector(`.${ttcname}`);
    
    if (!existingTooltip) {
        
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
/**
 * Функция добавления двух марок - для ширины и длины. Используется для прямоугольников
 */
function addTooltipWidthAndHeight(id, width,height, anchor, mouse) {
    var { tooltip:mark1, inputField:inputField1 } = createTooltipWithInput(width, id+1, anchor);
    var emark1 = document.getElementById(id + 1);
    if (!emark1) {
        document.body.appendChild(mark1);
        emark1 = document.getElementById(id + 1);
        mark1.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                console.log(`** width assigned`)
                if (a.magnetPosition) {
                    a.end = { ...a.magnetPosition };
                }
                else {
                    a.end = {...mouse};
                }
                a.rectangle.width = inputField1.value*a.zlc;
                a.rectangle.height = inputField2.value*a.zlc;
    
                a.rectangle.p2 = new Point(a.rectangle.p1.x + a.rectangle.width, a.rectangle.p1.y);
                a.rectangle.p3 = new Point(a.rectangle.p1.x + a.rectangle.width, a.rectangle.p1.y + a.rectangle.height);
                a.rectangle.p4 = new Point(a.rectangle.p1.x, a.rectangle.p1.y + a.rectangle.height);
    
                a.rectangle.updateCenter();
    
                addShapes(a.rectangle.getClone());
    
    
                a.clickRectangleStart = false;
                a.isMouseDown = false;
                updateActiveShapes();
                drawShapes();
                clearTooltipAll();
    
           } 
        });
    
    }
    var top = parseFloat(mark1.style.top.split('px')[0]);
    var left = parseFloat(mark1.style.left.split('px')[0]);
    var offset = mark1.clientHeight;
    var anchor2 = g(left, top+offset);
    var { tooltip: mark2, inputField: inputField2 } = createTooltipWithInput(height, id+2, anchor2);
    var emark2 = document.getElementById(id + 2);
    if (!emark2) {
        document.body.appendChild(mark2);   
        emark2 = document.getElementById(id + 2);
        mark2.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                console.log(`** width assigned`)
                if (a.magnetPosition) {
                    a.end = { ...a.magnetPosition };
                }
                else {
                    a.end = {...mouse};
                }
                a.rectangle.width = inputField1.value*a.zlc;
                a.rectangle.height = inputField2.value*a.zlc;
    
                a.rectangle.p2 = new Point(a.rectangle.p1.x + a.rectangle.width, a.rectangle.p1.y);
                a.rectangle.p3 = new Point(a.rectangle.p1.x + a.rectangle.width, a.rectangle.p1.y + a.rectangle.height);
                a.rectangle.p4 = new Point(a.rectangle.p1.x, a.rectangle.p1.y + a.rectangle.height);
    
                a.rectangle.updateCenter();
    
                addShapes(a.rectangle.getClone());
    
    
                a.clickRectangleStart = false;
                a.isMouseDown = false;
                updateActiveShapes();
                drawShapes();
                clearTooltipAll();
    
           } 
        });

        
    }

    var newTop = parseFloat(mark1.style.top.split('px')[0]) - mark1.clientHeight * 2 -10;
    mark1.style.top = newTop + 'px';
    mark2.style.top = (newTop + offset)+ 'px';
    
    
    
    emark1.firstChild.value = width;
    emark1.firstChild.focus();
    emark1.firstChild.select();
    emark2.firstChild.value = height;


    emark2.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            

        }
    });

}
/**
 * Функция добавляет поля для ввода радиуса для круга
 */
function addTooltipRadius(id, selectBoundary, radius, anchorFunction) {
    var anchor = anchorFunction(selectBoundary);
    var { tooltip, inputField } = createTooltipWithInput(radius, id, anchor);
    var existingTooltip = document.querySelector(`.${ttcname}`);
    if (!existingTooltip) {
        inputField.value = radius;
        inputField.focus();
        inputField.select();
        document.body.appendChild(tooltip);
        inputField.addEventListener("keydown", function (e) {
            if (e.key === 'Enter') {
                a.circle.radius = parseFloat(inputField.value*a.zlc);
                a.circle.setSelectBoundary();
                addShapes(a.circle.getClone());
                drawShapes();
                updateActiveShapes();
                a.clickCircleStart = false;
                a.isMouseDown = false;
                clearTooltipAll();
            }
        });
    }
    else {
        let input = existingTooltip.firstChild;
        input.value = radius;
        input.focus();
        input.select();
    }
}
function createTooltipWithInput(length, id, anchor) {
    var tooltip = document.createElement("div");
    var inputField = document.createElement("input");
    
    inputField.setAttribute("type", "text");
    inputField.setAttribute("value", length);
    inputField.setAttribute("id", id);
    inputField.classList.add("shape-tooltip-input");

    tooltip.classList.add(ttcname);
    tooltip.setAttribute("id", id);

    var anchorX = anchor.x
    var anchorY = anchor.y
    tooltip.style.left = anchorX + "px";
    tooltip.style.top = anchorY + "px";
    inputField.value = length;
    tooltip.appendChild(inputField);
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
    let tooltips = document.querySelectorAll(`.${ttcname}`);
    for (let i = 0; i < tooltips.length; i++) {
        document.body.removeChild(tooltips[i]);
    }
}

export { addTooltipInfo, clearTooltipAll, addTooltipLength, addTooltipWidthAndHeight, addTooltipRadius };