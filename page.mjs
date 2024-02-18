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
        case 'o':
        case 'щ':
            setMode(mode_elem, 'output');
            
            break;
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

const context = canvasText.getContext('2d');

savePdfButton.addEventListener('click', function () {
    const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: "l",
        userUnit: 300
    });

    // Get the dimensions of the PDF page
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Get the dimensions of the canvases
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasTextWidth = canvasText.width;
    const canvasTextHeight = canvasText.height;

    // Calculate the scaling factors for both canvases
    const scale = Math.min(pdfWidth / canvasWidth, pdfHeight / canvasHeight);
    const scaleText = Math.min(pdfWidth / canvasTextWidth, pdfHeight / canvasTextHeight);

    // Calculate the scaled dimensions of the canvases
    const scaledWidth = canvasWidth * scale;
    const scaledHeight = canvasHeight * scale;
    const scaledTextWidth = canvasTextWidth * scaleText;
    const scaledTextHeight = canvasTextHeight * scaleText;

    // Add the scaled images to the PDF
    
    // drawBordersGost(canvasTextWidth,canvasTextHeight);
    
    pdf.addImage(canvas, 'PNG', 0, 0, scaledWidth, scaledHeight);
    pdf.addImage(canvasText, 'PNG', 0, 0, scaledTextWidth, scaledTextHeight);


    // --- border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(2);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'S');
    pdf.rect(20, 5, pdfWidth - 25, pdfHeight - 10, 'S');
    pdf.rect(pdfWidth-190,pdfHeight-60,185,55);


    // Save the PDF file
    pdf.save("download.pdf");
}, false);

function drawBordersGost(pdfWidth, pdfHeight) {
    const pxmm = 3.78;
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    const smallb = 5 * pxmm;
    const bigb = 20 * pxmm;
    const descw = 185*pxmm;
    const desch = 55*pxmm;
    context.strokeRect(0, 0, pdfWidth, pdfHeight);
    context.strokeRect(bigb, smallb, pdfWidth - bigb-smallb, pdfHeight - 2*smallb);
    context.strokeRect(pdfWidth-descw-smallb,pdfHeight-desch-smallb,descw,desch);
}

// --------- BUTTONS ---------

function reset() {
    a.clickCopyStart = null;
    a.clickMoveStart = null;
    a.clickRotateStart = null;
    a.clickMirrorStart = null;
    a.magnetPosition = null;
    a.anglePosition = null;
}



