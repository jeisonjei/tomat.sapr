import { fromEvent } from "rxjs";
import { a, canvas, deleteShapes, deleteText, drawShapes, drawSingle, drawText, gl } from "./main.js";
import { checkFunction } from "./shared/common.mjs";
import { generateDXFContent } from "./shared/export/dxf.mjs";
import { t } from "./main.js";
import jsPDF from "jspdf";


export const mode_elem = document.getElementById('mode');
setMode(mode_elem, 'select');


export function setMode(mode_elem, mode) {
    mode_elem.innerHTML = 'mode: ' + mode;
}

export function gm() {
    return mode_elem.innerHTML.split(' ')[1];
}

export function editModeObserver(mouse) {
    if (a.isMouseDown) {
        return;
    }
    if (gm() === 'select' || gm() === 'edit' || gm() === 'boundary') {
        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
            switch (shape.type) {
                case 'line':
                    if (shape.isinGripStart(mouse)) {
                        setMode(mode_elem, 'edit');
                    }
                    else if (shape.isinGripEnd(mouse)) {
                        setMode(mode_elem, 'edit');
                    }
                    else {
                        if (!a.isMouseDown) {
                            setMode(mode_elem, 'select');
                        }
                    }
                    break;

                default:
                    break;
            }
        });
    }
}

export function boundaryModeObserver(mouse) {
    if (a.isMouseDown) {
        return;
    }
    if (gm() === 'select' || gm() === 'boundary') {
        const isinSelectBoundary = a.shapes.filter(shape => checkFunction(shape, 'isinSelectBoundary', mouse));
        if (isinSelectBoundary.length > 0) {
            setMode(mode_elem, 'boundary');
            isinSelectBoundary.forEach(shape => {
                shape.setSelectBoundary();
                drawSingle(shape.selectBoundary);
            })
        }
        else {
            setMode(mode_elem, 'select');
        }
    }
}

// --------- KEY EVENTS ---------

const keyDown$ = fromEvent(document, 'keydown');
const keyUp$ = fromEvent(document, 'keyup');
keyDown$.subscribe(event => {
    if (gm() === 'text' && event.key !== 'Escape') {
        return;
    }
    canvasText.style.cursor = 'crosshair';
    if (event.altKey) {
        switch (event.key) {
            case 'l':
            case 'д':
                setMode(mode_elem, 'symline');
                break;
            case 'r':
            case 'к':
                setMode(mode_elem, 'rotatecopy');
                break;
            default:
                break;
        }
        return;
    }

    // Handle key down events
    switch (event.key) {
        case 's':
        case 'ы':
            a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                shape.isSelected = false;
            });
            reset();
            setMode(mode_elem, 'select');
            drawShapes();
            t.text.forEach(text => {
                text.isSelected = false;
            });
            drawText();
            break;
        case 'l':
        case 'д':
            setMode(mode_elem, 'line');
            break;
        case 'k':
        case 'л':
            setMode(mode_elem, 'rectangle');
            break;
        case 'q':
        case 'й':
            setMode(mode_elem, 'square');
            break;
        case 'e':
        case 'у':
            setMode(mode_elem, 'circle');
            break;
        case 'm':
        case 'ь':
            setMode(mode_elem, 'move');
            break;
        case 'c':
        case 'с':
            setMode(mode_elem, 'copy');
            break;
        case 'r':
        case 'к':
            setMode(mode_elem, 'rotate');
            break;
        case 'i':
        case 'ш':
            setMode(mode_elem, 'mirror');
            break;
        case 't':
        case 'е':
            setMode(mode_elem, 'text');

        case 'Escape':
            a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                shape.isSelected = false;
            });
            reset();
            setMode(mode_elem, 'select');
            drawShapes();

            // --- text
            t.text.filter(text => text.isSelected).forEach(text => {
                text.isSelected = false;
            })
            drawText();
            break;
        case 'Delete':
            deleteShapes();
            drawShapes();

            // --- text
            deleteText();
            drawText();

            break;

        case 'Shift':
            a.angle_snap = true;
            break;
    }
});

keyUp$.subscribe(event => {
    // Handle key up events
    if (!event.shiftKey) {
        a.angle_snap = false;
    }
});

const canvasText = document.querySelector('canvas.text');
const canvasBody = document.querySelector('body');

fromEvent(canvasBody, 'keydown').subscribe(event => {
    if ((event.key === 't' || event.key === 'е') && gm() !== 'text') {
        setMode(mode_elem, 'text');
        canvasText.style.cursor = 'default';
        t.textPosition = null;
    }
});
// --------- KEY EVENTS ---------



// --------- BUTTONS ---------
const lineButton = document.getElementById('line');
const rectangleButton = document.getElementById('rectangle');
const circleButton = document.getElementById('circle');
const selectButton = document.getElementById('select');
const deleteButton = document.getElementById('delete');
const moveButton = document.getElementById('move');
const copyButton = document.getElementById('copy');
const rotateButton = document.getElementById('rotate');
const mirrorButton = document.getElementById('mirror');
const saveDxfButton = document.getElementById('saveDxf');
const savePdfButton = document.getElementById('savePdf');

const buttons = [lineButton, rectangleButton, circleButton, selectButton, deleteButton, moveButton, copyButton, rotateButton, mirrorButton, saveDxfButton, savePdfButton];
buttons.forEach(button => {
    button.addEventListener('mouseover', function () {
        setMode(mode_elem, 'none');
    });
    button.setAttribute('tabindex', '-1');
    button.addEventListener('mouseleave', function () {
        button.blur();
    })
})

lineButton.addEventListener('click', function () {
    setMode(mode_elem, 'line');
});
rectangleButton.addEventListener('click', function () {
    setMode(mode_elem, 'rectangle');
});
circleButton.addEventListener('click', function () {
    setMode(mode_elem, 'circle');
});
selectButton.addEventListener('click', function () {
    setMode(mode_elem, 'select');
});
deleteButton.addEventListener('click', function () {
    deleteShapes();
    drawShapes();

    // --- text
    deleteText();
    drawText();

});
moveButton.addEventListener('click', function () {
    setMode(mode_elem, 'move');
});
copyButton.addEventListener('click', function () {
    setMode(mode_elem, 'copy');
});
rotateButton.addEventListener('click', function () {
    setMode(mode_elem, 'rotate');
});
mirrorButton.addEventListener('click', function () {
    setMode(mode_elem, 'mirror');
});

saveDxfButton.addEventListener('click', function () {
    generateDXFContent();
});

savePdfButton.addEventListener('click', function () {
    let width = canvas.width;
    let height = canvas.height;
    //set the orientation
    let pdf;
    pdf = new jsPDF({
        unit: 'px',
        format: 'a4',
        orientation: "l",
        userUnit: 300
    });
    //then we get the dimensions from the 'pdf' file itself
    width = pdf.internal.pageSize.getWidth();
    height = pdf.internal.pageSize.getHeight();
    pdf.addImage(canvas, 'PNG', 0, 0, width, height);
    pdf.addImage(canvasText, 'PNG', 0, 0, width, height);
    pdf.save("download.pdf");
}, false);

// --------- BUTTONS ---------

function reset() {
    a.clickCopyStart = null;
    a.clickMoveStart = null;
    a.clickRotateStart = null;
    a.clickMirrorStart = null;
    a.magnetPosition = null;
    a.anglePosition = null;
}



