import { c } from "../globalState/c";
import {t} from "../globalState/t";
import { outputCheckbox } from "../../page.mjs";
import { Point } from "../../models/Point.mjs";
import { Text } from "../../models/shapes/Text.mjs";

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

function deleteText(text) {
    t.utext = t.utext.filter(text => !text.isSelected);
}

function getStringUpToIndex(text, index) {
    if (index >= 0 && index < text.length) {
        const newString = text.substring(0, index);
        return newString;
    } else {
        return text;
    }
}





function drawTextSingle(text, point) {
    const textArray = [text];
    const canvasPoint = convertWebGLToCanvas2DPoint(point, c.canvas.width, c.canvas.height);
    const newText = new Text(s.aspectRatio, canvasPoint, textArray, c.context);
    t.utext.push(newText);
    drawText();
}


// --------- UTEXT ---------

let editId = 1;

function addText(textLine) {
    textLine.id = editId++;

    t.utext.push(textLine);
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

function getPoint(mouseEvent) {
    return new Point(mouseEvent.clientX - 7, mouseEvent.clientY - 8);
}

function getLetterSize(letter) {
    const measure = c.context.measureText(letter);


    return {
        width: measure.width,
        height: measure.fontBoundingBoxAscent
    };
}




export {drawCursor, drawText,addText,deleteText,getCurrentTextObject, getStringUpToIndex, drawTextSingle}