import { a, drawShapes } from "./main.js";

const mode_elem = document.getElementById('mode');
setMode(mode_elem, 'select');


export function setMode(mode_elem, mode) {
    mode_elem.innerHTML = 'mode: ' + mode;
}

export function gm() {
    return mode_elem.innerHTML.split(' ')[1];
}

// --------- KEY EVENTS ---------
// SELECT
document.addEventListener('keydown', (ev) => {
    if (ev.key === 's' || ev.key === 'ы') {
        a.shapes.filter(shape=>shape.isSelected).forEach(shape => {
            shape.isSelected = false;
        });
        reset();
        setMode(mode_elem, 'select');
        drawShapes();
    }

});
// LINE
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'l' || ev.key === 'д') {
        setMode(mode_elem, 'line');
    }
});
// MOVE
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'm' || ev.key === 'ь') {
        setMode(mode_elem, 'move');
    }
});
// COPY
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'c' || ev.key === 'с') {
        setMode(mode_elem, 'copy');
    }
});
// ROTATE
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'r' || ev.key === 'к') {
        setMode(mode_elem, 'rotate');
    }
})
// MIRROR
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'i' || ev.key === 'ш') {
        setMode(mode_elem, 'mirror');
    }
})
// ESCAPE
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { // Check for 'Escape' key
        a.shapes.filter(shape=>shape.isSelected).forEach(shape => {
            shape.isSelected = false;
        });
        reset();
        setMode(mode_elem, 'select');
        drawShapes();
    }
});
// SHIFT
document.querySelector('body').addEventListener('keydown', function (event) {
    if (event.shiftKey) {
        a.angle_snap = true;
    }
});

document.querySelector('body').addEventListener('keyup', function (event) {
    if (!event.shiftKey) {
        a.angle_snap = false;
    }
});

function reset() {
    a.clickCopyStart = null;
    a.clickMoveStart = null;
    a.clickRotateStart = null;
    a.clickMirrorStart = null;
    a.isMouseDown = false;
    a.magnetPosition = null;
}
