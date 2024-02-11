import { a, deleteShapes, drawShapes, drawSingle } from "./main.js";
import { checkFunction } from "./shared/common.mjs";

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
    if (gm() === 'select' || gm() === 'edit') {
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
        if (isinSelectBoundary.length>0) {
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
// RECTANGLE
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'k' || ev.key === 'л') {
        setMode(mode_elem, 'rectangle');
    }
})
// SQUARE
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'q' || ev.key === 'й') {
        setMode(mode_elem, 'square');
    }
})
// CIRCLE
document.addEventListener('keydown', (ev) => {
    if (ev.key === 'e' || ev.key === 'у') {
        setMode(mode_elem, 'circle');
    }
})
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
// DELETE
document.querySelector('body').addEventListener('keydown', function (event) {
    if (event.key === 'Delete') {
        deleteShapes();
        drawShapes();
    }
})

function reset() {
    a.clickCopyStart = null;
    a.clickMoveStart = null;
    a.clickRotateStart = null;
    a.clickMirrorStart = null;
    a.magnetPosition = null;
    a.anglePosition = null;
}
