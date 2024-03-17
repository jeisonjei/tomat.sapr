import { fromEvent } from "rxjs";
import { drawText, deleteText } from "./shared/render/text.js";
import { drawShapes,updateActiveShapes,deleteShapes } from "./shared/render/shapes.js";
import { a } from './shared/globalState/a.js';
import { t } from './shared/globalState/t.js';
import { s } from "./shared/globalState/settings.mjs";
import { c } from "./shared/globalState/c.js";
import { generateDXFContent } from "./shared/export/dxf.mjs";
import jsPDF from "jspdf";

// rxdb
const mode_elem = document.getElementById('mode');

function setMode(mode_elem, mode) {

    mode_elem.innerHTML = 'mode: ' + mode;
    if (!c.context) {
        return;
    }
    if (mode === 'select' || mode === 'boundary') {
        c.context.canvas.style.cursor = 'pointer';
    }
    else if (mode === 'text') {
        c.context.canvas.style.cursor = 'default';
    }
    else if (mode === 'textEdit') {
        c.context.canvas.style.cursor = 'text';
    }
    else if (mode === 'break') {
        c.context.canvas.style.cursor = 'cell'
    }
    else {
        c.context.canvas.style.cursor = 'crosshair';
    }

}


setMode(mode_elem, 'select');



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

const formatSelect = document.getElementById('format');

const helpTable = document.querySelector('table');


const buttons = [textButton, lineButton, rectangleButton, circleButton, selectButton, deleteButton, moveButton, copyButton, rotateButton, mirrorButton, breakButton, scaleButton, saveDxfButton, document.getElementById('savePdf')];

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
    c.context.font = `${t.fontSize}px ${t.fontName}`;
    drawText();
    fontSelect.blur();
});

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


    const scaleX = c.canvas.height / pdfMockWidth;

    const topPadding = (5 * mmpx) * scaleX;
    const rightPadding = 5 * mmpx * scaleX;
    const bottomPadding = 5 * mmpx * scaleX;
    const leftPadding = 20 * mmpx * scaleX;

    const p1x = leftPadding;
    const p1y = topPadding;
    const p2x = c.canvas.width - leftPadding - rightPadding;
    const p2y = p1y;
    const p3x = p2x;
    const p3y = c.canvas.height - topPadding;
    const p4x = p1x;
    const p4y = p3y;

    c.context.save();

    c.context.strokeStyle = "rgba(0,0,255,0.5)";
    c.context.lineWidth = 4;

    c.context.strokeRect(p1x, p1y, p2x, p3y);

    c.context.restore();


}

function removePrintArea() {
    c.context.clearRect(0, 0, c.canvas.height, c.canvas.width);
    drawText();
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

export { mode_elem, setMode, gm, magnetsCheckbox, outputCheckbox, drawPrintArea, removePrintArea }



