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

import { convertWebGLToCanvas2DPoint } from "./shared/common.mjs";
import { drawPrintArea, gm, outputCheckbox } from "./page.mjs";
import { getNewVertices } from "./shared/webgl/reshape.mjs";

import { a } from './shared/globalState/a.js';
import { t } from './shared/globalState/t.js';
import { s } from './shared/globalState/settings.mjs';
import { g } from "./shared/globalState/g.js";
import { c } from "./shared/globalState/c.js";

// --- rxjs
import { filter, fromEvent, map } from "rxjs";

// --- shapes
import { Point } from "./models/Point.mjs"
import { filterText } from "./services/textFilter";
import { Text } from "./models/shapes/Text.mjs";

// --- events (регистрация событий)

import { registerMouseMoveEvent } from "./handlers/mouse/move.js";
import { registerMouseUpEvent } from "./handlers/mouse/up.js";
import { registerMouseWheelEvent } from "./handlers/mouse/wheel.js";
import { registerSpacebarEvents } from "./handlers/keyboard/spacebar.js";
import { registerMouseDownEvent } from "./handlers/mouse/down.js";
import {registerKeyboardAnyTextEvent} from "./handlers/keyboard/anyText";





/**
 * В этой версии программы попробуем осущещствлять вызовы к webgl только из текущего файла.
 * Когда вызовы к webgl осуществляются из различных классов, возникает серьёзная путаница.
 * В этой версии серьёзно увеличилась производительности из-за того,
 * что теперь функция drawShapes не выполняет проход в цикле по массиву a.shapes,
 * а отрисовывает вершины из массива a.vertices. 
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
