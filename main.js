/**
 * TODO
 * чтение, рефакторинг ...
 * заполнение основной надписи, нужно сделать красиво и удобно
 * подключение rxdb для сохранения данных
 * текст
 * zoom окном
 * авто-зум когда выбрана рамка печати
 * неудобно, что рамка выбора линии распространяется не на всю линию
 * перемещение и копирование строго по горизонтали или вертикали
 * области печати до вывода в PDF
 * специальные символы в тексте
 * resize canvas
 * дизайн
 * сайт
 * модуль отопления
 */


import { t } from './shared/globalState/t.js';
import { s } from './shared/globalState/settings.mjs';
import { g } from "./shared/globalState/g.js";
import { c } from "./shared/globalState/c.js";

import { registerMouseMoveEvent } from "./handlers/mouse/move.js";
import { registerMouseUpEvent } from "./handlers/mouse/up.js";
import { registerMouseWheelEvent } from "./handlers/mouse/wheel.js";
import { registerSpacebarEvents } from "./handlers/keyboard/spacebar.js";
import { registerMouseDownEvent } from "./handlers/mouse/down.js";
import {registerKeyboardAnyTextEvent} from "./handlers/keyboard/anyText";


/**
 * В этой версии программы попробуем осущещствлять вызовы к webgl только из текущего файла.
 * Когда вызовы к webgl осуществляются из различных классов, возникает серьёзная путаница.
 * В этой версии есть потенциал серьёзного увеличения производительности из-за того,
 * что можно исключить проход функцией drawShapes в цикле по массиву a.shapes,
 * а отрисовывать вершины a.vertices. 
 * При всяком изменении массива a.shapes, например при операциях pan, zoom ... 
 * обновляется и массив вершин a.vertices
 */

g.init();
c.init();

(function init() {
    s.tolerance = 10;
    s.aspectRatio = g.canvas.height / g.canvas.width;

    t.fontSize = document.getElementById('fontSize').value;

})();


// --- events registration
registerMouseDownEvent();
registerMouseMoveEvent();
registerMouseUpEvent();
registerMouseWheelEvent();
registerSpacebarEvents();
registerKeyboardAnyTextEvent();
