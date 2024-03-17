
function registerButtonTextEvent() {
    const textButton = document.getElementById('text');
    textButton.addEventListener('click', () => setMode(mode_elem, 'text'));
}