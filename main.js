/**
 * TODO
 * чтение, рефакторинг ...
 * заполнение основной надписи, нужно сделать красиво и удобно
 * подключение rxdb для сохранения данных
 * текст
 * zoom окном
 * авто-зум когда выбрана рамка печати
 * неудобно, что рамка выбора линии распространяется не на всю линию
 * перемещение и копирование строго по горизонтали или вертикали
 * области печати до вывода в PDF
 * специальные символы в тексте
 * resize canvas
 * дизайн
 * сайт
 * модуль отопления
 */

import { Point } from "./models/Point.mjs"
import { createProgram } from "./shared/webgl/program.mjs";
import { getFragmentShaderSource, getVertexshaderSource } from "./shared/webgl/shaders.mjs";
import { applyTransformationToPoint, canvasGetMouse, canvasGetMouseWebgl, canvasGetWebglCoordinates, convertPixelToWebGLCoordinate, convertWebGLToCanvas2DPoint, getSideOfMouse, getSideOfMouseRelativeToLine, isHorizontal, resizeCanvasToDisplaySize, transformPointByMatrix3 } from "./shared/common.mjs";
import { Line } from "./models/shapes/Line.mjs";
import { drawPrintArea, gm, magnetsCheckbox, mode_elem, outputCheckbox, setMode } from "./page.mjs";
import { editModeObserver, boundaryModeObserver, colorMagnetsObserver } from "./services/moveObservers";
import { AbstractFrame } from "./models/frames/AbstractFrame.mjs";
import { getMirrorMatrix, getMoveMatrix, getRotateMatrix, getScaleMatrix } from "./shared/transform.mjs";
import { observeMagnet, magnetState$, getExtensionCoordDraw, getAnglePosition } from "./shared/magnets.mjs";
import { mat3 } from 'gl-matrix';
import { getNewVertices, pushVertices, replaceVertices } from "./shared/webgl/reshape.mjs";

import { a } from './shared/globalState/a.js';
import { t } from './shared/globalState/t.js';
import { s } from './shared/globalState/settings.mjs';
import { g } from "./shared/globalState/g.js";
import { c } from "./shared/globalState/c.js";

// rxjs
import { Subject, filter, fromEvent, map, share } from "rxjs";
import { Rectangle } from "./models/shapes/Rectangle.mjs";
import { Circle } from "./models/shapes/Circle.mjs";
import { SymLine } from "./models/shapes/SymLine.mjs";
import { filterText } from "./services/textFilter";
import { Text } from "./models/shapes/Text.mjs";
import { Grip } from "./models/snaps/Grip.mjs";

import { drawShapes, drawSingle, updateActiveShapes, updateShapes } from "./shared/render/shapes.js";

// --- mouse
import { handleMouseDown } from "./handlers/mouse/down.js";
import { handleMouseMove } from "./handlers/mouse/move.js";
import { handleMouseUp } from "./handlers/mouse/up.js";



/**
 * В этой версии программы попробуем осущещствлять вызовы к webgl только из текущего файла.
 * Когда вызовы к webgl осуществляются из различных классов, возникает серьёзная путаница.
 * В этой версии серьёзно увеличилась производительности из-за того,
 * что теперь функция drawShapes не выполняет проход в цикле по массиву a.shapes,
 * а отрисовывает вершины из массива a.vertices. 
 * При всяком изменении массива a.shapes, например при операциях pan, zoom ... 
 * обновляется и массив вершин a.vertices
 */

g.init();
c.init();

// --------- INIT ---------
(function init() {
    s.tolerance = 10;
    s.aspectRatio = g.canvas.height / g.canvas.width;

    const fontSize = document.getElementById('fontSize').value;
    t.fontSize = fontSize;

    // --- назначение параметров, которые будут использоваться в других модулях
    // --- text


})();
// --------- INIT ---------




// --------- MAGNETS ---------
magnetState$.pipe(
    /**
     * Функция получает начальную или конечную привязку.
     * Переменная a.gripPosition назначается только здесь
     */
    map(state => {
        const mouse = state.find(object => object.hasOwnProperty('mouse')).mouse;
        const grips = state.filter(magnet => magnet.type === 'm_grip');
        if (grips.length > 0) {
            return { mouse, magnet: grips[0] };
        }

        // If grips.length <= 0, return tripsH or tripsV if available
        const tripsH = state.filter(magnet => magnet.type === 'm_triph');
        const tripsV = state.filter(magnet => magnet.type === 'm_tripv');

        if (tripsH.length > 0 && tripsV.length > 0) {
            return { mouse, magnet: [tripsH[0], tripsV[0]] };
        }
        else if (tripsH.length > 0) {
            return { mouse, magnet: tripsH[0] };
        }
        else if (tripsV.length > 0) {
            return { mouse, magnet: tripsV[0] };
        }

        // If no valid magnets found, return null or handle as needed
        return null;
    })
)
    .subscribe(magnet => {
        if (magnet && a.start) {
            if (magnet.magnet instanceof Array) {
                a.magnetPosition = getExtensionCoordDraw(magnet.magnet, a.start, magnet.mouse);
                magnet.magnet.forEach(magnet => drawSingle(magnet));
            }
            else {

                a.magnetPosition = magnet.magnet.center ?? getExtensionCoordDraw(magnet.magnet, a.start, magnet.mouse);

                drawSingle(magnet.magnet);

            }
        }
    });
// --------- MAGNETS ---------












function handleMouseWheel(ev) {
    a.zl = ev.deltaY > 0 ? 0.90 : 1.1;
    a.zlc *= a.zl;
    updateShapes('zoom');
    drawShapes();



    // --- text ---
    const scalingMatrix = mat3.fromScaling(mat3.create(), [a.zl, a.zl]);
    const translationMatrix = mat3.fromTranslation(mat3.create(), [
        -(a.zl - 1) * c.context.canvas.width / 2,
        -(a.zl - 1) * c.context.canvas.height / 2
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

const mouseDown$ = fromEvent(document, 'mousedown').pipe(map(ev => canvasGetMouse(ev, g.canvas)));
const mouseMove$ = fromEvent(document, 'mousemove').pipe(map(ev => canvasGetMouse(ev, g.canvas)));
const mouseUp$ = fromEvent(document, 'mouseup').pipe(map(ev => canvasGetMouse(ev, g.canvas)));
mouseDown$.subscribe(handleMouseDown);
mouseMove$.subscribe(handleMouseMove);
mouseUp$.subscribe(handleMouseUp);

document.addEventListener('wheel', handleMouseWheel);


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
// --------- MOUSE EVENTS ---------



// --------- DRAW ---------
a.shapes$.subscribe((shapes) => {
    a.vertices = getNewVertices(shapes);
});



function deleteShapes(shapes) {
    // ...
    a.shapes = a.shapes.filter(shape => !shape.isSelected);
    a.shapes$.next(a.shapes);
}

function deleteText(text) {
    t.utext = t.utext.filter(text => !text.isSelected);
}


// --------- UTEXT ---------
let currentLetterIndex;
let editId = 1;

function addText(textLine) {
    textLine.id = editId++;

    t.utext.push(textLine);
}



function handleMouseDownText(mouse) {
    t.offset = Number.parseInt(t.fontSize) * 0.2;


    currentLetterIndex = 0;




    if (!['text'].includes(gm())) {
        return;
    }


    for (const textLine of t.utext) {
        if (textLine.isinSelectBoundary(mouse)) {
            t.editId = textLine.id;
            t.textPosition = { ...textLine.start };
            drawCursor(0, t.editId);
            drawText(false);
            t.utext = t.utext.filter(t => t.text !== '');

            return;
        }
        t.editId = null;

    }


    if (a.magnetPosition) {
        t.textPosition = { ...a.magnetPosition };
    }
    else {
        t.textPosition = new Point(mouse.x, mouse.y);
    }

    t.textPosition.y = t.textPosition.y - t.offset;
    t.textPosition.x = t.textPosition.x + t.offset;


    if (a.magnetPosition) {
        c.context.strokeStyle = 'orange';
    }
    else {
        c.context.strokeStyle = 'gray';
    }

    const textLine = new Text(s.aspectRatio, t.textPosition, [], c.context);

    t.utext = t.utext.filter(t => t.text !== '');

    addText(textLine);


    const textHeight = c.context.measureText(textLine.text).fontBoundingBoxAscent;

    c.context.clearRect(0, 0, c.canvas.width, c.canvas.height);
    c.context.save();

    c.context.beginPath();
    c.context.moveTo(t.textPosition.x, t.textPosition.y);
    c.context.lineTo(t.textPosition.x + 100, t.textPosition.y);
    c.context.moveTo(t.textPosition.x, t.textPosition.y - textHeight);
    c.context.lineTo(t.textPosition.x + 100, t.textPosition.y - textHeight);
    c.context.moveTo(t.textPosition.x, t.textPosition.y);
    c.context.lineTo(t.textPosition.x, t.textPosition.y - textHeight);
    c.context.stroke();

    drawText(false);

    a.shapes = a.shapes.filter(t => (t.type !== 'text' || t.text !== ''));

    // только для magnetsObserver, также используется в boundaryModeObserver для отрисовки рамки
    a.shapes.push(...t.utext);



}


function handleKeyPress(key) {

    if (!['text'].includes(gm())) {
        return;
    }
    if (!t.textPosition) {
        return;
    }

    const edit = t.utext.filter(textLine => textLine.id === t.editId);
    let current;
    if (edit.length > 0) {
        current = edit[0];
    }
    else {
        current = getCurrentTextObject();
    }




    if (['ArrowLeft', 'ArrowRight'].includes(key)) {
        if (key === 'ArrowLeft') {
            if (currentLetterIndex === current.text.length) {
                currentLetterIndex = currentLetterIndex - 2;
            }
            else if (currentLetterIndex < current.text.length) {
                currentLetterIndex = currentLetterIndex - 1;
            }
            else if (currentLetterIndex < -1) {
                currentLetterIndex = -1;
            }
        }
        else if (key === 'ArrowRight') {
            currentLetterIndex = currentLetterIndex + 1;
            if (currentLetterIndex > current.text.length - 1) {
                currentLetterIndex = current.text.length - 1;
            }
        }
    }
    else if (['End', 'Home'].includes(key)) {
        if (key === 'End') {
            currentLetterIndex = current.text.length - 1;
        }
        else if (key === 'Home') {
            currentLetterIndex = -1;
        }
    }
    else if (key === 'Backspace') {

        current.delete(currentLetterIndex);
        currentLetterIndex = currentLetterIndex - 1;
        if (currentLetterIndex < -1) {
            currentLetterIndex = -1;
        }


    }
    else if (key === 'Enter') {
        const lineSpace = Number.parseInt(t.fontSize);

        const positionY = t.textPosition.y + lineSpace;

        t.textPosition = new Point(t.textPosition.x, positionY);
        const textLine = new Text(s.aspectRatio, t.textPosition, [], c.context);

        t.utext = t.utext.filter(t => t.text !== '');

        addText(textLine);

        c.context.clearRect(0, 0, c.canvas.width, c.canvas.height);
        c.context.save();

        drawCursor(0, 0);
        drawText(false);


        a.shapes = a.shapes.filter(t => (t.type !== 'text' || t.text !== ''));

        // только для magnetsObserver, также используется в boundaryModeObserver для отрисовки рамки
        a.shapes.push(...t.utext);
        return;

    }

    else if (key) {
        currentLetterIndex = currentLetterIndex + 1;
        current.add(key, currentLetterIndex);
    }

    drawCursor(currentLetterIndex, current.id);
    drawText(false);
}




const mouseDownText$ = fromEvent(c.canvas, 'mousedown').pipe(map(ev => getPoint(ev)));
const keyPress$ = fromEvent(document, 'keydown').pipe(
    filter(ev => filterText(ev)),
    map(ev => ev.key)
);

mouseDownText$.subscribe(handleMouseDownText);
keyPress$.subscribe(handleKeyPress);

function getLetterSize(letter) {
    const measure = c.context.measureText(letter);


    return {
        width: measure.width,
        height: measure.fontBoundingBoxAscent
    };
}

function drawCursor(index = 0, id) {
    c.context.clearRect(0, 0, c.canvas.width, c.canvas.height);
    c.context.strokeStyle = 'blue';
    c.context.lineWidth = 2;

    const currentTextObject = getCurrentTextObject(id);
    let w, h;
    const letter = getStringUpToIndex(currentTextObject.text, index + 1);

    w = getLetterSize(letter).width;
    h = getLetterSize(letter).height;


    const p = new Point(currentTextObject.start.x + w, currentTextObject.start.y);
    c.context.beginPath();
    c.context.moveTo(p.x, p.y);
    c.context.lineTo(p.x, p.y - h);
    c.context.stroke();
}

function getStringUpToIndex(text, index) {
    if (index >= 0 && index < text.length) {
        const newString = text.substring(0, index);
        return newString;
    } else {
        return text;
    }
}

function getCurrentTextObject(editId) {
    /**
     * Функция возвращает "текущий" объект класса Text из массива t.utext
     * @param {Number} editId - идентификатор экземпляра текста, который предполагается редактировать.
     * Этот параметр назначается в функции handleMouseDownText, 
     * если указатель мыши попадает на какую-то строку уже существующего текста. А
     * если не попадает, то t.editId назначается null.
     * Таким образом, если параметр editId не определён, из текущей функцц возвращается последний
     * объект массива t.utext, а если параметр editId назначен, то возвращается 
     * массив с индексом (editId - 1)
    */
    if (!editId) {
        const textObject = t.utext[t.utext.length - 1];
        return textObject;
    }
    else {
        const textObject = t.utext.filter(textLine => textLine.id === editId)[0]
        return textObject;
    }
}

function drawText(clear = true) {

    if (clear) {
        c.context.clearRect(0, 0, c.canvas.width, c.canvas.height);
    }

    c.context.save();

    t.utext.forEach(textLine => {
        if (textLine.isSelected) {
            c.context.fillStyle = '#7B7272';
        }
        else {
            c.context.fillStyle = '#000000';
        }
        c.context.fillText(textLine.text, textLine.start.x, textLine.start.y);
    });

    if (outputCheckbox.checked) {
        c.context.resetTransform();

        drawPrintArea();
    }

    c.context.restore();
}

function drawTextSingle(text, point) {
    const textArray = [text];
    const canvasPoint = convertWebGLToCanvas2DPoint(point, c.canvas.width, c.canvas.height);
    const newText = new Text(s.aspectRatio, canvasPoint, textArray, c.context);
    t.utext.push(newText);
    drawText();
}

// --------- UTEXT ---------



// --------- HELPERS ---------
function getPoint(mouseEvent) {
    return new Point(mouseEvent.clientX - 7, mouseEvent.clientY - 8);
}
// --------- HELPERS ---------

export { deleteShapes, deleteText, drawText, drawCursor }