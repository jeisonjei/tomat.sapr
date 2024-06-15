
function registerButtonTextEvent() {
    const textButton = document.getElementById('text');
    textButton.addEventListener('click', () => setMode('text'));
}