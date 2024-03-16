import { fromEvent, filter, map } from "rxjs";
import { filterText } from "../../services/textFilter";
import { gm } from "../../page.mjs";

import {a} from "../../shared/globalState/a";
import { t } from "../../shared/globalState/t";
import {s} from "../../shared/globalState/settings.mjs";
import { c } from "../../shared/globalState/c";

import { getCurrentTextObject } from "../../shared/render/text";

import { drawCursor, drawText, addText } from "../../shared/render/text";

import { Point } from "../../models/Point.mjs";
import { Text } from "../../models/shapes/Text.mjs";


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
            if (t.currentLetterIndex === current.text.length) {
                t.currentLetterIndex = t.currentLetterIndex - 2;
            }
            else if (t.currentLetterIndex < current.text.length) {
                t.currentLetterIndex = t.currentLetterIndex - 1;
            }
            else if (t.currentLetterIndex < -1) {
                t.currentLetterIndex = -1;
            }
        }
        else if (key === 'ArrowRight') {
            t.currentLetterIndex = t.currentLetterIndex + 1;
            if (t.currentLetterIndex > current.text.length - 1) {
                t.currentLetterIndex = current.text.length - 1;
            }
        }
    }
    else if (['End', 'Home'].includes(key)) {
        if (key === 'End') {
            t.currentLetterIndex = current.text.length - 1;
        }
        else if (key === 'Home') {
            t.currentLetterIndex = -1;
        }
    }
    else if (key === 'Backspace') {

        current.delete(t.currentLetterIndex);
        t.currentLetterIndex = t.currentLetterIndex - 1;
        if (t.currentLetterIndex < -1) {
            t.currentLetterIndex = -1;
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
        t.currentLetterIndex = t.currentLetterIndex + 1;
        current.add(key, t.currentLetterIndex);
    }

    drawCursor(t.currentLetterIndex, current.id);
    drawText(false);
}

function registerKeyboardAnyTextEvent() {
    const keyPress$ = fromEvent(document, 'keydown').pipe(
        filter(ev => filterText(ev)),
        map(ev => ev.key)
    );
    
    keyPress$.subscribe(handleKeyPress);
    
}

export {registerKeyboardAnyTextEvent}