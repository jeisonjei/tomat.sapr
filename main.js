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

import {a} from './shared/globalState/a';
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
import { registerButtonSavePdfEvent } from './handlers/buttons/pdf.js';

import { Line } from './models/shapes/Line.mjs';
import { Rectangle } from './models/shapes/Rectangle.mjs';
import { Circle } from './models/shapes/Circle.mjs';
import { drawShapes } from './shared/render/shapes.js';


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
    s.format = 'a4';

    t.fontSize = document.getElementById('fontSize').value;

})();


// --- events registration
registerMouseDownEvent();
registerMouseMoveEvent();
registerMouseUpEvent();
registerMouseWheelEvent();
registerSpacebarEvents();
registerKeyboardAnyTextEvent();

// --- buttons
registerButtonSavePdfEvent();

// --- restore a.shapes from localStorage
if (localStorage.shapes) {
    const storedShapes = JSON.parse(localStorage.shapes);
    
    for (const shape of storedShapes) {
        switch (shape.type) {
            case 'line':
                
                const start = shape._start;
                const end = shape._end;
                const line = new Line(shape.aspectRatio,start, end,shape.color)
                a.shapes.push(line);
                break;
            case 'rectangle':
                const p1 = shape._p1;
                const p2 = shape._p2;
                const p3 = shape._p3;
                const p4 = shape._p4;
                const width = shape._width;
                const height = shape._height;

                const rectangle = new Rectangle(shape.aspectRatio,p1,p2,p3,p4,width,height,shape.color);
                a.shapes.push(rectangle);
                break;
            case 'circle':
                const circle = new Circle(shape.aspectRatio, shape._center, shape._radius, shape.color);
                a.shapes.push(circle);
                break;
            default:
                break;
        }
    }
    drawShapes();
}


