import { fromEvent } from "rxjs";
import { a, canvas, deleteShapes, deleteText, drawShapes, drawSingle, drawText, gl } from "./main.js";
import { canvasGetWebglCoordinates, checkFunction, convertWebGLToCanvas2DPoint } from "./shared/common.mjs";
import { generateDXFContent } from "./shared/export/dxf.mjs";
import { t } from "./main.js";
import jsPDF from "jspdf";
import { s } from "./shared/settings.mjs";
import { font } from "./fonts/GOST type A-normal.js";
import { Line } from "./models/shapes/Line.mjs";
import { Point } from "./models/Point.mjs";


export const mode_elem = document.getElementById('mode');
setMode(mode_elem, 'select');


export function setMode(mode_elem, mode) {


    mode_elem.innerHTML = 'mode: ' + mode;
    if (!s.textContext) {
        return;
    }
    if (mode === 'select' || mode === 'boundary') {
        s.textContext.canvas.style.cursor = 'pointer';
    }
    else if (mode === 'text') {
        s.textContext.canvas.style.cursor = 'default';
    }
    else if (mode === 'textEdit') {
        s.textContext.canvas.style.cursor = 'text';
    }
    else if (mode === 'break') {
        s.textContext.canvas.style.cursor = 'cell'
    }
    else {
        s.textContext.canvas.style.cursor = 'crosshair';
    }

}

export function gm() {
    return mode_elem.innerHTML.split(' ')[1];
}

export function copyModeObserver(mouse) {
    /**
     * Функция нужна для раскрашивания ручек
     */
    if (a.isMouseDown) {
        return;
    }

    else if (gm() === 'move' || gm() === 'copy') {
        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
            switch (shape.type) {
                case 'line':
                    if (shape.isinGripStart(mouse) || shape.isinGripEnd(mouse)) {
                        shape.grip.color = [1, 0, 0, 1];
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];
                    }
                    break;
                case 'rectangle':
                    if (shape.isinGripP1(mouse) || shape.isinGripP2(mouse) || shape.isinGripP3(mouse) || shape.isinGripP4(mouse)) {
                        shape.grip.color = [1, 0, 0, 1];
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];
                    }
                    break;
                case 'circle':
                    if (shape.isinGripQ1(mouse) || shape.isinGripQ2(mouse) || shape.isinGripQ3(mouse) || shape.isinGripQ4(mouse)) {
                        shape.grip.color = [1, 0, 0, 1];
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];
                    }
                    break;
                default:
                    break;
            }
        });

    }

}

export function editModeObserver(mouse) {
    if (a.isMouseDown) {
        return;
    }

    else if (gm() === 'select' || gm() === 'edit' || gm() === 'boundary') {
        a.shapes.filter(shape => shape.isSelected).forEach(shape => {
            switch (shape.type) {
                case 'line':
                    if (shape.isinGripStart(mouse) || shape.isinGripEnd(mouse)) {
                        shape.grip.color = [0, 0, 1, 1];
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];
                        setMode(mode_elem, 'edit');
                    }
                    else {
                        if (!a.isMouseDown) {
                            setMode(mode_elem, 'select');

                        }
                    }
                    break;
                case 'rectangle':
                    if (shape.isinGripP1(mouse) || shape.isinGripP2(mouse) || shape.isinGripP3(mouse) || shape.isinGripP4(mouse)) {
                        shape.grip.color = [0, 0, 1, 1];
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];
                        setMode(mode_elem, 'edit');
                    }
                    else {
                        if (!a.isMouseDown) {
                            setMode(mode_elem, 'select');
                        }
                    }
                    break;
                case 'circle':
                    if (shape.isinGripQ1(mouse) || shape.isinGripQ2(mouse) || shape.isinGripQ3(mouse) || shape.isinGripQ4(mouse)) {
                        shape.grip.color = [0, 0, 1, 1];
                        drawSingle(shape.grip);
                        shape.grip.color = [0, 1, 0, 1];

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

    t.editBoundary = false;

    if (gm() === 'text') {
        const isinSelectBoundary = t.utext.filter(t => t.isinSelectBoundary(mouse));
        if (isinSelectBoundary.length > 0) {
            for (const textLine of isinSelectBoundary) {
                textLine.setSelectBoundary();
                textLine.selectBoundary.color = [0, 0, 1, 1];
                drawSingle(textLine.selectBoundary);
                textLine.selectBoundary.color = [0.75, 0.75, 0.75, 1];
                t.editBoundary = true;
                return;
            }
        }

    }

    else if (gm() === 'select' || gm() === 'boundary') {
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
export const magnetsCheckbox = document.getElementById('magnets');
export const outputCheckbox = document.getElementById('output');
const angleSnapCheckbox = document.getElementById('angleSnap');
const ctrlCheckbox = document.getElementById('ctrl');

const keyDown$ = fromEvent(document, 'keydown');
const keyUp$ = fromEvent(document, 'keyup');
keyDown$.subscribe(event => {
    // эфки - эфки не включают никакой режим mode
    if (['F1', 'F3'].includes(event.key)) {
        event.preventDefault();
        if (event.key === 'F3') {
            magnetsCheckbox.checked = !magnetsCheckbox.checked;
        }
        else if (event.key === 'F1') {
            if (outputCheckbox.checked) {
                outputCheckbox.checked = false;
                removePrintArea();

            }
            else {
                outputCheckbox.checked = true;
                drawPrintArea()
            }

        }
        return;

    }

    if (['text', 'textEdit'].includes(gm()) && event.key !== 'Escape') {
        return;
    }

    if (event.altKey) {
        event.preventDefault();
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
    else if (event.ctrlKey) {
        a.ctrl = true;
        ctrlCheckbox.checked = true;
    }

    // Handle key down events
    switch (event.key) {
        case 'b':
        case 'и':
            setMode(mode_elem, 'break');
            break;
        case 's':
        case 'ы':
            a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                shape.isSelected = false;
            });
            reset();
            setMode(mode_elem, 'select');
            drawShapes();
            t.utext.forEach(text => {
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
            drawShapes();

            // --- text

            t.utext.filter(t => t.isSelected).forEach(text => {
                text.isSelected = false;
                text.edit = false;
            })
            drawText();

            t.editId = null;
            setMode(mode_elem, 'select');
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
            angleSnapCheckbox.checked = true

            break;
    }
});

keyUp$.subscribe(event => {
    // Handle key up events
    if (!event.shiftKey) {
        a.angle_snap = false;
        angleSnapCheckbox.checked = false;
    }
    if (!event.ctrlKey) {
        ctrlCheckbox.checked = false;
        a.ctrl = false;
    }

});


fromEvent(document, 'keydown').subscribe(event => {
    if ((event.key === 't' || event.key === 'е') && gm() !== 'text') {
        setMode(mode_elem, 'text');
        t.textPosition = null;
    }
});
// --------- KEY EVENTS ---------



// --------- BUTTONS ---------
const textButton = document.getElementById('text');
const fontSelect = document.getElementById('fontSize');
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
const formatSelect = document.getElementById('format');


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

textButton.addEventListener('click', function () {
    setMode(mode_elem, 'text');
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



// --- select
fontSelect.addEventListener("change", (event) => {
    t.fontSize = event.target.value;
    s.textContext.font = `${t.fontSize}px ${t.fontName}`;
    drawText();
    fontSelect.blur();
});

let format = 'a4';
formatSelect.addEventListener('change', (event) => {
    format = event.target.value.toLowerCase();
    formatSelect.blur();
})

export function drawPrintArea() {
    const pdf = new jsPDF({
        unit: 'mm',
        format: format,
        orientation: 'landscape'
    });

    const pdfMock = new jsPDF({
        unit: 'px',
        format: format,
        orientation: 'landscape'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfMockWidth = pdfMock.internal.pageSize.getWidth();

    const mmpx = pdfMockWidth / pdfWidth;


    const scaleX = s.canvasWidth / pdfMockWidth;

    const topPadding = (5 * mmpx) * scaleX;
    const rightPadding = 5 * mmpx * scaleX;
    const bottomPadding = 5 * mmpx * scaleX;
    const leftPadding = 20 * mmpx * scaleX;

    const p1x = leftPadding;
    const p1y = topPadding;
    const p2x = s.canvasWidth - leftPadding - rightPadding;
    const p2y = p1y;
    const p3x = p2x;
    const p3y = s.canvasHeight - topPadding;
    const p4x = p1x;
    const p4y = p3y;

    s.textContext.save();

    s.textContext.strokeStyle = "rgba(0,0,255,0.5)";
    s.textContext.lineWidth = 4;

    s.textContext.strokeRect(p1x, p1y, p2x, p3y);

    s.textContext.restore();


}

export function removePrintArea() {
    s.textContext.clearRect(0, 0, s.canvasWidth, s.canvasHeight);
    drawText();
}


// --------- PDF ---------

savePdfButton.addEventListener('click', function () {
    const pdf = new jsPDF({
        unit: 'mm',
        format: format,
        orientation: "l",
    });

    const pdfMock = new jsPDF({
        unit: 'px',
        format: format,
        orientation: 'landscape'
    });

    const pdfMockWidth = pdfMock.internal.pageSize.getWidth();

    // draw shapes from a.shapes to canvas2d
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);


    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const scaleX = s.canvasWidth / pdfWidth;
    const scaleY = s.canvasHeight / pdfHeight;

    const mmtopx = pdfMockWidth / pdfWidth;


    const filteredShapes = a.shapes.filter(shape => shape.type !== 'text');
    if (filteredShapes.length > 0) {
        filteredShapes.forEach(shape => {

            const verticesPixels = shape.getVerticesPixels(scaleX);
            switch (shape.type) {
                case 'line':
                    // TODO
                    /**
                     * к линиям относится то же самое, что и к прямоугольникам
                     */
                    pdf.line(verticesPixels[0], verticesPixels[1], verticesPixels[2], verticesPixels[3]);
                    break;
                case 'rectangle':
                    /**
                     * при операциях поворота и зеркального отображения прямоугольника нужно переназначать точки p1,p2,p3,p4
                     * чтобы точка p1 была всегда в верхнем левом углу
                     */
                    const width = (shape.p2.x - shape.p1.x) / (1 / s.canvasWidth * 2) / scaleX;
                    const height = (shape.p3.y - shape.p2.y) / (1 / s.canvasHeight * 2) / scaleX;
                    pdf.rect(verticesPixels[6], verticesPixels[7], width, height);

                    break;
                case 'circle':
                    const center = convertWebGLToCanvas2DPoint(shape.center, s.canvasWidth, s.canvasHeight);
                    const x = center.x / scaleX;
                    const y = center.y / scaleX;
                    const radius = shape.radius * s.aspectRatio / (1 / s.canvasWidth * 2) / scaleX;
                    pdf.circle(x, y, radius);

                    break;
                default:
                    break;
            }
        });

    }


    const f = font;


    pdf.setFont('GOST type A');

    const mmtopoints = 0.75

    const scaleYmm = (pdfWidth * mmtopx / s.canvasWidth) / mmtopoints;
    const fontSizemm = t.fontSize * scaleYmm;
    pdf.setFontSize(fontSizemm);


    t.utext.forEach(t => {
        // TODO текст не масштабируется, нужно брать текущее значение из mouseWheel
        pdf.text(t.text, t.start.x / scaleX, t.start.y / scaleX);
    })





    // --- border
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.75);

    const topX = pdfWidth - 190;
    const topY = pdfHeight - 60;
    const b = 5;


    pdf.rect(0, 0, pdfWidth, pdfHeight, 'S');
    pdf.rect(20, 5, pdfWidth - 25, pdfHeight - 10, 'S');
    pdf.rect(topX, topY, 185, 55);
    // ---
    pdf.rect(topX, topY, 10, 5);
    pdf.rect(topX, topY + b, 10, 5);
    pdf.rect(topX, topY + b * 2, 10, 5);
    pdf.rect(topX, topY + b * 3, 10, 5);
    pdf.rect(topX, topY + b * 4, 10, 5);
    // ---
    pdf.rect(topX + b * 2, topY, 10, 5);
    pdf.rect(topX + b * 2, topY + b, 10, 5);
    pdf.rect(topX + b * 2, topY + b * 2, 10, 5);
    pdf.rect(topX + b * 2, topY + b * 3, 10, 5);
    pdf.rect(topX + b * 2, topY + b * 4, 10, 5);

    pdf.rect(topX + b * 4, topY, 10, 5);
    pdf.rect(topX + b * 4, topY + b, 10, 5);
    pdf.rect(topX + b * 4, topY + b * 2, 10, 5);
    pdf.rect(topX + b * 4, topY + b * 3, 10, 5);
    pdf.rect(topX + b * 4, topY + b * 4, 10, 5);

    pdf.rect(topX + b * 6, topY, 10, 5);
    pdf.rect(topX + b * 6, topY + b, 10, 5);
    pdf.rect(topX + b * 6, topY + b * 2, 10, 5);
    pdf.rect(topX + b * 6, topY + b * 3, 10, 5);
    pdf.rect(topX + b * 6, topY + b * 4, 10, 5);
    // --- 
    pdf.rect(topX, topY + b * 5, 20, 5);
    pdf.rect(topX, topY + b * 6, 20, 5);
    pdf.rect(topX, topY + b * 7, 20, 5);
    pdf.rect(topX, topY + b * 8, 20, 5);
    pdf.rect(topX, topY + b * 9, 20, 5);
    pdf.rect(topX, topY + b * 10, 20, 5);
    // ---
    pdf.rect(topX + b * 4, topY + b * 5, 20, 5);
    pdf.rect(topX + b * 4, topY + b * 6, 20, 5);
    pdf.rect(topX + b * 4, topY + b * 7, 20, 5);
    pdf.rect(topX + b * 4, topY + b * 8, 20, 5);
    pdf.rect(topX + b * 4, topY + b * 9, 20, 5);
    pdf.rect(topX + b * 4, topY + b * 10, 20, 5);
    // ---
    pdf.rect(topX + b * 8, topY, 15, 5);
    pdf.rect(topX + b * 8, topY + b, 15, 5);
    pdf.rect(topX + b * 8, topY + b * 2, 15, 5);
    pdf.rect(topX + b * 8, topY + b * 3, 15, 5);
    pdf.rect(topX + b * 8, topY + b * 4, 15, 5);
    pdf.rect(topX + b * 8, topY + b * 5, 15, 5);
    pdf.rect(topX + b * 8, topY + b * 6, 15, 5);
    pdf.rect(topX + b * 8, topY + b * 7, 15, 5);
    pdf.rect(topX + b * 8, topY + b * 8, 15, 5);
    pdf.rect(topX + b * 8, topY + b * 9, 15, 5);
    pdf.rect(topX + b * 8, topY + b * 10, 15, 5);
    // ---
    pdf.rect(topX + b * 11, topY, 10, 5);
    pdf.rect(topX + b * 11, topY + b, 10, 5);
    pdf.rect(topX + b * 11, topY + b * 2, 10, 5);
    pdf.rect(topX + b * 11, topY + b * 3, 10, 5);
    pdf.rect(topX + b * 11, topY + b * 4, 10, 5);
    pdf.rect(topX + b * 11, topY + b * 5, 10, 5);
    pdf.rect(topX + b * 11, topY + b * 6, 10, 5);
    pdf.rect(topX + b * 11, topY + b * 7, 10, 5);
    pdf.rect(topX + b * 11, topY + b * 8, 10, 5);
    pdf.rect(topX + b * 11, topY + b * 9, 10, 5);
    pdf.rect(topX + b * 11, topY + b * 10, 10, 5);
    // ---
    pdf.rect(topX + b * 13, topY, 120, 10);
    pdf.rect(topX + b * 13, topY + b * 2, 120, 15);
    pdf.rect(topX + b * 13, topY + b * 5, 70, 15);
    pdf.rect(topX + b * 13, topY + b * 8, 70, 15);
    // ---
    pdf.rect(topX + b * 27, topY + b * 5, 15, 5);
    pdf.rect(topX + b * 27, topY + b * 6, 15, 10);
    // --- 
    pdf.rect(topX + b * 30, topY + b * 5, 15, 5);
    pdf.rect(topX + b * 30, topY + b * 6, 15, 10);
    // ---
    pdf.rect(topX + b * 33, topY + b * 5, 20, 5);
    pdf.rect(topX + b * 33, topY + b * 6, 20, 10);




    // Save the PDF file
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



