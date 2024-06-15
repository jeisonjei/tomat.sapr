import { fromEvent } from "rxjs";
import { drawShapes,updateActiveShapes,deleteShapes } from "./shared/render/shapes.js";
import { a } from './shared/globalState/a.js';
import { t } from './shared/globalState/t.js';
import { s } from "./shared/globalState/settings.mjs";
import { generateDXFContent } from "./shared/export/dxf.mjs";
import jsPDF from "jspdf";
import { cnv } from "./libs/canvas-text/src/shared/cnv.js";
import { rerender } from "./libs/canvas-text/src/index.js";
import { clearTooltipAll } from "./services/tooltip.js";


function setMode(mode) {
    a.mode = mode;
    a.mode$.next(mode);

    if (!cnv.context) {
        return;
    }
    if (mode === 'select' || mode === 'boundary') {
        cnv.context.canvas.style.cursor = 'pointer';
    }
    
    else if (mode === 'break') {
        cnv.context.canvas.style.cursor = 'cell'
    }
    else {
        cnv.context.canvas.style.cursor = 'crosshair';
    }

}

function gm() {
    return a.mode;
}



// --------- KEY EVENTS ---------
const magnetsCheckbox = document.getElementById('magnets');
const angleSnapCheckbox = document.getElementById('angleSnap');
const ctrlCheckbox = document.getElementById('ctrl');

const keyDown$ = fromEvent(document, 'keydown');
const keyUp$ = fromEvent(document, 'keyup');
keyDown$.subscribe(event => {


    // --- эфки - эфки не включают никакой режим mode
    if (['F1', 'F3', 'F4'].includes(event.key)) {
        event.preventDefault();
        if (event.key === 'F3') {
            magnetsCheckbox.checked = !magnetsCheckbox.checked;
        }
        else if (event.key === 'F4') {
            angleSnapCheckbox.checked =!angleSnapCheckbox.checked;   
            a.angle_snap = !a.angle_snap;
        }
        else if (event.key === 'F1') {
            a.isPrintAreaVisible =!a.isPrintAreaVisible;
            if (a.isPrintAreaVisible) {
                removePrintArea();

            }
            else {
                drawPrintArea();
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
            case 'L':
            case 'д':
            case 'Д':
                setMode('symline');
                break;
            case 'r':
            case 'R':
            case 'к':
            case 'К':
                setMode('rotatecopy');
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
        case 'W':
        case 'ц':
        case 'Ц':
            setMode('scale');
            break;
        case 'b':
        case 'B':
        case 'и':
        case 'И':
            setMode('break');
            break;
        case 's':
        case 'S':
        case 'ы':
        case 'Ы':
            a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                shape.isSelected = false;
            });
            reset();
            setMode('select');
            drawShapes();


            break;
        case 'l':
        case 'L':
        case 'д':
        case 'Д':
            setMode('line');
            break;
        case 'k':
        case 'K':
        case 'л':
        case 'Л':
            setMode('rectangle');
            break;
        case 'q':
        case 'Q':
        case 'й':
        case 'Й':
            setMode('square');
            break;
        case 'e':
        case 'E':
        case 'у':
        case 'У':
            setMode('circle');
            break;
        case 'm':
        case 'M':
        case 'ь':
        case 'Ь':
            setMode('move');
            break;
        case 'c':
        case 'C':
        case 'с':
        case 'С':
            setMode('copy');
            break;
        case 'r':
        case 'R':
        case 'к':
        case 'К':
            setMode('rotate');
            break;
        case 'i':
        case 'I':
        case 'ш':
        case 'Ш':
            setMode('mirror');
            break;


            break;
        case 'Escape':
            a.shapes.filter(shape => shape.isSelected).forEach(shape => {
                shape.isSelected = false;
            });
            reset();
            drawShapes();
            /**
             * Здесь есть конфликт с библиотекой canvas-text. 
             * Если установить селект, то в библиотеке не будет выхода из режима текста. Поэтому строка закомментирована
             */
            // setMode(mode_elem, 'select');
            a.selectFrame.start = null;
            a.selectFrame.end = null;


            t.editId = null;
            a.isMouseDown = false;
            a.clickLineStart = false;
            a.clickRectangleStart = false;
            a.clickCircleStart = false;
            a.clickSquareStart = false;
            clearTooltipAll();
            // режим 'select' устанавливается в библиотеке canvas-text
            // setMode(mode_elem, 'select');
            break;
        case 'Delete':
            deleteShapes();
            drawShapes();
            updateActiveShapes();
            clearTooltipAll();


            break;

        case 'Shift':
            a.angle_snap = true;

            break;
    }
});

keyUp$.subscribe(event => {
    // Handle key up events
    if (!event.shiftKey && !angleSnapCheckbox.checked) {
        a.angle_snap = false;
    }
    if (!event.ctrlKey) {
        ctrlCheckbox.checked = false;
        a.ctrl = false;
    }

});



// --------- KEY EVENTS ---------



// --------- BUTTONS ---------

const textButton = document.getElementById('text');
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
const isStampVisibleCheckbox = document.getElementById('is-stamp-visible');
const fontSizeInput = document.getElementById('font-size-field');


// --- text
const fontSizeUpButton = document.getElementById('font-size-up');
const fontSizeDownButton = document.getElementById('font-size-down');
// --- text

const formatSelect = document.getElementById('format');

const helpTable = document.querySelector('table');

const saveButton = document.getElementById('save');


const buttons = [textButton, lineButton, rectangleButton, circleButton, selectButton, deleteButton, moveButton, copyButton, rotateButton, mirrorButton, breakButton, scaleButton, saveDxfButton, document.getElementById('savePdf'), isStampVisibleCheckbox, saveButton, fontSizeInput, angleSnapCheckbox];

buttons.forEach(button => {
    const id = button.id;
    button.addEventListener('mouseover', function () {
        setMode('none');
    });
    button.addEventListener('mouseleave', function () {
        button.blur();
        if (['text', 'line', 'rectangle', 'circle', 'select', 'delete', 'move', 'copy', 'rotate', 'mirror', 'break', 'scale'].includes(id)) {
            setMode(id);
        }
        else if (['font-size-up', 'font-size-down', 'font-size-field'].includes(id)) {
            setMode('text');
        }
        else {
            setMode('select');
        }
    })
})

textButton.addEventListener('click', () => setMode('text'))
lineButton.addEventListener('click', () => setMode('line'));
rectangleButton.addEventListener('click', () => setMode('rectangle'));
circleButton.addEventListener('click', () => setMode('circle'));
selectButton.addEventListener('click', () => setMode('select'));
deleteButton.addEventListener('click', function () {
    deleteShapes();
    drawShapes();

    // --- text
    deleteText();
    drawText();

});
moveButton.addEventListener('click',()=>setMode('move'));
copyButton.addEventListener('click',()=>setMode('copy'));
rotateButton.addEventListener('click', ()=>setMode('rotate'));
mirrorButton.addEventListener('click', ()=>setMode('mirror'));
scaleButton.addEventListener('click', ()=>setMode('scale'));
breakButton.addEventListener('click', ()=>setMode('break'))
saveDxfButton.addEventListener('click', generateDXFContent);



// --- select


formatSelect.addEventListener('change', (event) => {
    s.format = event.target.value.toLowerCase();
    formatSelect.blur();
})

function drawPrintArea() {
    const pdf = new jsPDF({
        unit: 'mm',
        format: s.format,
        orientation: 'landscape'
    });

    const pdfMock = new jsPDF({
        unit: 'px',
        format: s.format,
        orientation: 'landscape'
    });
    

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfMockWidth = pdfMock.internal.pageSize.getWidth();

    const mmpx = pdfMockWidth / pdfWidth;


    const scaleX = cnv.context.canvas.height / pdfMockWidth;

    const topPadding = (5 * mmpx) * scaleX;
    const rightPadding = 5 * mmpx * scaleX;
    const bottomPadding = 5 * mmpx * scaleX;
    const leftPadding = 20 * mmpx * scaleX;

    const p1x = leftPadding;
    const p1y = topPadding;
    const p2x = cnv.context.canvas.width - leftPadding - rightPadding;
    const p2y = p1y;
    const p3x = p2x;
    const p3y = cnv.context.canvas.height - topPadding;
    const p4x = p1x;
    const p4y = p3y;

    cnv.context.save();

    cnv.context.strokeStyle = "rgba(0,0,255,0.5)";
    cnv.context.lineWidth = 4;

    cnv.context.strokeRect(p1x, p1y, p2x, p3y);

    cnv.context.restore();


}

function removePrintArea() {
    cnv.clear();
    rerender();
    
}


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

export {setMode, gm, magnetsCheckbox, drawPrintArea, removePrintArea }



