import { a, drawShapes } from "./main.mjs";

const mode_elem = document.getElementById('mode');
setMode(mode_elem, 'select');


export function setMode(mode_elem, mode) {
    mode_elem.innerHTML = 'mode: '+ mode;
}

export function gm() {
    return mode_elem.innerHTML.split(' ')[1];
}

// --------- KEY EVENTS ---------
document.addEventListener('keydown', (ev) => {
    if (ev.key === 's' || ev.key === 'ы') {
        setMode(mode_elem, 'select');
    }
});

document.addEventListener('keydown', (ev) => {
    if (ev.key === 'l' || ev.key === 'д') {
        setMode(mode_elem, 'line');
    }
});

document.addEventListener('keydown', (ev) => {
    if (ev.key === 'm' || ev.key === 'ь') {
        setMode(mode_elem, 'move');
    }
});

document.addEventListener('keydown', (ev) => {
    if (ev.key === 'c' || ev.key === 'с') {
        setMode(mode_elem, 'copy');
    }
});

document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { // Check for 'Escape' key
        a.shapes.filter(shape=>shape.isSelected).forEach(shape => {
            shape.isSelected = false;
        });
        setMode(mode_elem, 'select');
        drawShapes();
    }
});
