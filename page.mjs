
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
})
