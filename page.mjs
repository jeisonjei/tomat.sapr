import { fromEvent } from "rxjs";
import { canvas, deleteShapes, deleteText, drawText, gl, updateActiveShapes } from "./main.js";
import { drawShapes,drawSingle } from "./shared/render/shapes.js";
import { a } from './shared/globalState/a.js';
import { t } from './shared/globalState/t.js';
import { s } from "./shared/globalState/settings.mjs";
import { canvasGetWebglCoordinates, checkFunction, convertWebGLToCanvas2DPoint } from "./shared/common.mjs";
import { generateDXFContent } from "./shared/export/dxf.mjs";
import jsPDF from "jspdf";
import { font } from "./fonts/GOST type A-normal.js";
import { Line } from "./models/shapes/Line.mjs";
import { Point } from "./models/Point.mjs";

// rxdb
import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";


const mode_elem = document.getElementById('mode');

setMode(mode_elem, 'select');


function setMode(mode_elem, mode) {


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

function gm() {
    return mode_elem.innerHTML.split(' ')[1];
}



// --------- KEY EVENTS ---------
const magnetsCheckbox = document.getElementById('magnets');
const outputCheckbox = document.getElementById('output');
const angleSnapCheckbox = document.getElementById('angleSnap');
const ctrlCheckbox = document.getElementById('ctrl');

const keyDown$ = fromEvent(document, 'keydown');
const keyUp$ = fromEvent(document, 'keyup');
keyDown$.subscribe(event => {



    // --- эфки - эфки не включают никакой режим mode
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


    // --- сочетания клавиш с alt
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

    // --- сочетания клавиш с SHIFT
    if (event.shiftKey) {
        switch (true) {
            case (event.key === 'F'):
                magnetsCheckbox.checked = !magnetsCheckbox.checked;
                break;

            default:
                break;
        }
    }



    // --- Handle key down events
    switch (event.key) {
        case 'w':
        case 'ц':
            setMode(mode_elem, 'scale');
            break;
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
            updateActiveShapes();

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
const breakButton = document.getElementById('break');
const scaleButton = document.getElementById('scale');
const saveDxfButton = document.getElementById('saveDxf');
const savePdfButton = document.getElementById('savePdf');
const formatSelect = document.getElementById('format');

const helpTable = document.querySelector('table');


const buttons = [textButton, fontSelect, lineButton, rectangleButton, circleButton, selectButton, deleteButton, moveButton, copyButton, rotateButton, mirrorButton, breakButton, scaleButton, saveDxfButton, savePdfButton];

buttons.forEach(button => {
    const id = button.id;
    button.addEventListener('mouseover', function () {
        setMode(mode_elem, 'none');
    });
    button.addEventListener('mouseleave', function () {
        button.blur();
        if (['text', 'line', 'rectangle', 'circle', 'select', 'delete', 'move', 'copy', 'rotate', 'mirror', 'break', 'scale'].includes(id)) {
            setMode(mode_elem, id);
        }
        else {
            setMode(mode_elem, 'select');
        }
    })
})

textButton.addEventListener('click', () => setMode(mode_elem, 'text'))
lineButton.addEventListener('click', () => setMode(mode_elem, 'line'));
rectangleButton.addEventListener('click', () => setMode(mode_elem, 'rectangle'));
circleButton.addEventListener('click', () => setMode(mode_elem, 'circle'));
selectButton.addEventListener('click', () => setMode(mode_elem, 'select'));
deleteButton.addEventListener('click', function () {
    deleteShapes();
    drawShapes();

    // --- text
    deleteText();
    drawText();

});
moveButton.addEventListener('click',()=>setMode(mode_elem, 'move'));
copyButton.addEventListener('click',()=>setMode(mode_elem, 'copy'));
rotateButton.addEventListener('click', ()=>setMode(mode_elem, 'rotate'));
mirrorButton.addEventListener('click', ()=>setMode(mode_elem, 'mirror'));
scaleButton.addEventListener('click', ()=>setMode(mode_elem, 'scale'));
breakButton.addEventListener('click', ()=>setMode(mode_elem, 'break'))
saveDxfButton.addEventListener('click', generateDXFContent);



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

function drawPrintArea() {
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

function removePrintArea() {
    s.textContext.clearRect(0, 0, s.canvasWidth, s.canvasHeight);
    drawText();
}


// --------- PDF ---------

savePdfButton.addEventListener('click', function () {

    const stamps = s.myDatabase.stamps;

    const doc = stamps.findOne({
        selector: {
            id: 'stamp1'
        }
    }).exec();

    doc.then((v) => {

        const designer = v.get('designer');
        const checker = v.get('checker');
        const normChecker = v.get('norm_checker');
        const gip = v.get('gip');

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

                const verticesPixels = shape.getVerticesArray();
                switch (shape.type) {
                    case 'line':
                        // TODO
                        /**
                         * к линиям относится то же самое, что и к прямоугольникам
                         */
                        pdf.line(verticesPixels[0] / scaleX, verticesPixels[1] / scaleX, verticesPixels[2] / scaleX, verticesPixels[3] / scaleX);
                        break;
                    case 'rectangle':
                        /**
                         * при операциях поворота и зеркального отображения прямоугольника нужно переназначать точки p1,p2,p3,p4
                         * чтобы точка p1 была всегда в верхнем левом углу
                         */
                        const width = (shape.p3.x - shape.p1.x) / scaleX;
                        const height = (shape.p1.y - shape.p4.y) / scaleX;
                        pdf.rect(verticesPixels[6] / scaleX, verticesPixels[7] / scaleX, width, height);

                        break;
                    case 'circle':
                        const center = shape.center;
                        const x = center.x / scaleX;
                        const y = center.y / scaleX;
                        const radius = shape.radius / scaleX;
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
        pdf.setFontSize(12);

        const topX = pdfWidth - 190;
        const topY = pdfHeight - 60;
        const row = 5;
        const col = row * 2;
        const of = 0.5;

        // Define points for cells in rows 1 to 11 and columns 1 to 6
        const cellPoints = [];
        for (let i = 1; i <= 11; i++) {
            for (let j = 1; j <= 10; j++) {
                const cell = new Point(topX + col * (j - 1) + of, topY + row * i - of);
                cellPoints.push(cell);
                const cellVariable = `cell_${i}_${j}`;
                cellPoints[cellVariable] = cell;

            }
        }

        pdf.text('Разработал', cellPoints['cell_6_1'].x, cellPoints['cell_6_1'].y);
        pdf.text('Проверил', cellPoints['cell_7_1'].x, cellPoints['cell_7_1'].y);
        pdf.text('Н.контроль', cellPoints['cell_8_1'].x, cellPoints['cell_8_1'].y);
        pdf.text('ГИП', cellPoints['cell_9_1'].x, cellPoints['cell_9_1'].y);
        pdf.text(designer, cellPoints['cell_6_3'].x, cellPoints['cell_6_3'].y);
        pdf.text(checker, cellPoints['cell_7_3'].x, cellPoints['cell_7_3'].y);
        pdf.text(normChecker, cellPoints['cell_8_3'].x, cellPoints['cell_8_3'].y);
        pdf.text(gip, cellPoints['cell_9_3'].x, cellPoints['cell_9_3'].y);
        pdf.text('Изм.', cellPoints['cell_5_1'].x, cellPoints['cell_5_1'].y);
        pdf.text('Кол.уч.', cellPoints['cell_5_2'].x, cellPoints['cell_5_2'].y);
        pdf.text('Лист', cellPoints['cell_5_3'].x, cellPoints['cell_5_3'].y);
        pdf.text('№ док.', cellPoints['cell_5_4'].x, cellPoints['cell_5_4'].y);
        pdf.text('Подпись', cellPoints['cell_5_5'].x, cellPoints['cell_5_5'].y);
        pdf.text('Дата', cellPoints['cell_5_6'].x + row, cellPoints['cell_5_6'].y);


        pdf.rect(0, 0, pdfWidth, pdfHeight, 'S');
        pdf.rect(20, 5, pdfWidth - 25, pdfHeight - 10, 'S');
        pdf.rect(topX, topY, 185, 55);
        // ---
        pdf.rect(topX, topY, 10, 5);
        pdf.rect(topX, topY + row, 10, 5);
        pdf.rect(topX, topY + row * 2, 10, 5);
        pdf.rect(topX, topY + row * 3, 10, 5);
        pdf.rect(topX, topY + row * 4, 10, 5);

        // ---
        pdf.rect(topX + row * 2, topY, 10, 5);
        pdf.rect(topX + row * 2, topY + row, 10, 5);
        pdf.rect(topX + row * 2, topY + row * 2, 10, 5);
        pdf.rect(topX + row * 2, topY + row * 3, 10, 5);
        pdf.rect(topX + row * 2, topY + row * 4, 10, 5);

        pdf.rect(topX + row * 4, topY, 10, 5);
        pdf.rect(topX + row * 4, topY + row, 10, 5);
        pdf.rect(topX + row * 4, topY + row * 2, 10, 5);
        pdf.rect(topX + row * 4, topY + row * 3, 10, 5);
        pdf.rect(topX + row * 4, topY + row * 4, 10, 5);

        pdf.rect(topX + row * 6, topY, 10, 5);
        pdf.rect(topX + row * 6, topY + row, 10, 5);
        pdf.rect(topX + row * 6, topY + row * 2, 10, 5);
        pdf.rect(topX + row * 6, topY + row * 3, 10, 5);
        pdf.rect(topX + row * 6, topY + row * 4, 10, 5);
        // --- 
        pdf.rect(topX, topY + row * 5, 20, 5);
        pdf.rect(topX, topY + row * 6, 20, 5);
        pdf.rect(topX, topY + row * 7, 20, 5);
        pdf.rect(topX, topY + row * 8, 20, 5);
        pdf.rect(topX, topY + row * 9, 20, 5);
        pdf.rect(topX, topY + row * 10, 20, 5);
        // ---
        pdf.rect(topX + row * 4, topY + row * 5, 20, 5);
        pdf.rect(topX + row * 4, topY + row * 6, 20, 5);
        pdf.rect(topX + row * 4, topY + row * 7, 20, 5);
        pdf.rect(topX + row * 4, topY + row * 8, 20, 5);
        pdf.rect(topX + row * 4, topY + row * 9, 20, 5);
        pdf.rect(topX + row * 4, topY + row * 10, 20, 5);
        // ---
        pdf.rect(topX + row * 8, topY, 15, 5);
        pdf.rect(topX + row * 8, topY + row, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 2, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 3, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 4, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 5, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 6, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 7, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 8, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 9, 15, 5);
        pdf.rect(topX + row * 8, topY + row * 10, 15, 5);
        // ---
        pdf.rect(topX + row * 11, topY, 10, 5);
        pdf.rect(topX + row * 11, topY + row, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 2, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 3, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 4, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 5, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 6, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 7, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 8, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 9, 10, 5);
        pdf.rect(topX + row * 11, topY + row * 10, 10, 5);
        // ---
        pdf.rect(topX + row * 13, topY, 120, 10);
        pdf.rect(topX + row * 13, topY + row * 2, 120, 15);
        pdf.rect(topX + row * 13, topY + row * 5, 70, 15);
        pdf.rect(topX + row * 13, topY + row * 8, 70, 15);
        // ---
        pdf.rect(topX + row * 27, topY + row * 5, 15, 5);
        pdf.rect(topX + row * 27, topY + row * 6, 15, 10);
        // --- 
        pdf.rect(topX + row * 30, topY + row * 5, 15, 5);
        pdf.rect(topX + row * 30, topY + row * 6, 15, 10);
        // ---
        pdf.rect(topX + row * 33, topY + row * 5, 20, 5);
        pdf.rect(topX + row * 33, topY + row * 6, 20, 10);




        // Save the PDF file
        pdf.save("download.pdf");

    })


}, false);



// --------- BUTTONS ---------

function reset() {
    a.clickCopyStart = null;
    a.clickMoveStart = null;
    a.clickRotateStart = null;
    a.clickMirrorStart = null;
    a.magnetPosition = null;
    a.anglePosition = null;

    a.clickScaleStart1 = null;
    a.clickScaleStart2 = null;
}

export { mode_elem, setMode, gm, magnetsCheckbox, outputCheckbox, drawPrintArea, removePrintArea }



