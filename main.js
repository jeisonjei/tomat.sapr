/**
 * TODO
 * панель шрифта
 * сохранение и отмена действий!
 * при попытке разорвать линию пропадает половина чертежа (случается редко, разобраться с функцией break)
 * назначение размера для нескольких строк текста
 * zoom окном
 * авто-зум когда выбрана рамка печати
 * перемещение и копирование строго по горизонтали или вертикали
 * области печати до вывода в PDF
 * специальные символы в тексте
 * resize canvas
 * дизайн
 * сайт
 * модуль отопления
 * модуль вентиляции
 */

import {a} from './shared/globalState/a';
import { t } from './shared/globalState/t.js';
import { s } from './shared/globalState/settings.mjs';
import { g } from "./shared/globalState/g.js";

import { registerMouseMoveEvent } from "./handlers/mouse/move.js";
import { registerMouseUpEvent } from "./handlers/mouse/up.js";
import { registerMouseWheelEvent } from "./handlers/mouse/wheel.js";
import { registerSpacebarEvents } from "./handlers/keyboard/spacebar.js";
import { registerMouseDownEvent } from "./handlers/mouse/down.js";
import { registerButtonSavePdfEvent } from './handlers/buttons/pdf.js';
import { Line } from './models/shapes/Line.mjs';
import { Rectangle } from './models/shapes/Rectangle.mjs';
import { Circle } from './models/shapes/Circle.mjs';
import { drawShapes } from './shared/render/shapes.js';
import { initCanvasText } from './libs/canvas-text/src/index.js';



/**
 * В этой версии программы попробуем осущещствлять вызовы к webgl только из текущего файла.
 * Когда вызовы к webgl осуществляются из различных классов, возникает серьёзная путаница.
 * В этой версии есть потенциал серьёзного увеличения производительности из-за того,
 * что можно исключить проход функцией drawShapes в цикле по массиву a.shapes,
 * а отрисовывать вершины a.vertices. 
 * При всяком изменении массива a.shapes, например при операциях pan, zoom ... 
 * обновляется и массив вершин a.vertices
 */


// --- init globalState and canvas-text library
registerMouseDownEvent();

g.init();
initCanvasText('.text',g.context.canvas.width, g.context.canvas.height, 'gost_type_a');

(function init() {
    s.tolerance = 10;
    s.aspectRatio = g.canvas.height / g.canvas.width;
    s.format = 'a4';


})();

// --- events registration
registerMouseMoveEvent();
registerMouseUpEvent();
registerMouseWheelEvent();
registerSpacebarEvents();

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


