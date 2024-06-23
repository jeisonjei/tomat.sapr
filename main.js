/**
 * TODO
 * ВНИМАНИЕ!!! Программа не должна превращаться во Франкенштейна!
 * разрыв линий по прямоугольнику
 * прямоугольник не поворачивается!
 * толщина линий для круга
 * Длина круга
 * специальные символы в тексте
 * zoom окном
 * отмена действий
 * перенести события кнопок из page.js в Svelte
 * области печати до вывода в PDF
 * модуль отопления
 * модуль вентиляции
 * PWA и скачивание программы на локальный компьютер
 * при попытке разорвать линию пропадает половина чертежа (случается редко, разобраться с функцией break)
 * 
 * 
 * DONE
 * dxf текст. Нужно было использовать шрифт cyrillic_ii
 * При панорамировании иногда съезжает текст, разобраться. Похоже, что текст съезжает, если быстро нажать и отпустить space и при этом быстро передвинуть мышь. Проблему это не решает, но хотя бы теперь вроде бы известна причина. Если держать space дольше, текст не съезжает. Причина была в том, что для webgl в функции move использовалась функция requestAnimationFrame, а для canvas-text - нет. В итоге функции handleMouseMove двух модулей выполнялись с разной частотой. То есть в какой-то момент функция handleMouseMove какого-то из модулей выполнялась дополнительное число раз, что и приводило к разности смещений pan.tx/pan.ty.*/

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
// --- canvas-text
import { initCanvasText } from './libs/canvas-text/src/index.js';
import { TextBlock } from './libs/canvas-text/src/models/TextBlock.js';
import { textLinesCollection$ } from './libs/canvas-text/src/shared/state.js';
import { cnv } from './libs/canvas-text/src/shared/cnv.js';
// --- database
import { list as dbList, initialize as dbInitialize } from './services/database.js'

import { inject } from "@vercel/analytics"
import { getRealScale } from './shared/common.mjs';



/**
 * В этой версии программы попробуем осущещствлять вызовы к webgl только из текущего файла.
 * Когда вызовы к webgl осуществляются из различных классов, возникает серьёзная путаница.
 * В этой версии есть потенциал серьёзного увеличения производительности из-за того,
 * что можно исключить проход функцией drawShapes в цикле по массиву a.shapes,
 * а отрисовывать вершины a.vertices. 
 * При всяком изменении массива a.shapes, например при операциях pan, zoom ... 
 * обновляется и массив вершин a.vertices
 * 
 * ЗАМЕТКИ ПО СТРУКТУРЕ ПРОГРАММЫ
 * Обработчики событий разбиты на файлы. В том же файле располагается функция регистрации обработчика события.
 * Больше нигде обработчики событий не регистрируются, исключение составляет файл page.js, в котором регистрируются
 * обработчики для кнопок и клавиш. Чтобы узнать все места, где регистрируются обработчики, можно выполнить глобальный поиск.
 * Для текста используется отдельная билиотека canvas-text. Коллекция строк текста в этой библиотеке располагается
 * в массиве textLinesCollection. В главной программе этот массив можно менять непосредственно, но добавлять и удалять элементы
 * в нём допускается только через вызов издателя textLinesCollection$, что привёдет к вызову соответствующих функций внутри canvas-text
 * Узнать все места, где производятся операции над массивом textLinesCollection можно простым поиском.
 * Библиотека canvas-text регистрирует свои собственные события. Получается, что на какие-то события появляется две функции-обработчика.
 * События главной программы обычно должны выполнятся первыми,
 * в том числе потому что функции магнитов располагаются в главной программе. И вот в этом случае регистрировать события главной программы
 * также нужно первыми.
 * 
 */

// аналитика vercel.com
inject();

// намеренно регистрируется раньше, чем initCanvasText, чтобы собственное событие mousedown срабатывало раньше
registerMouseDownEvent();

// инициализация webgl canvas
g.init();
// инициализация библиотеки canvas-text
initCanvasText('.text',g.context.canvas.width, g.context.canvas.height, 'gost_type_a');

(function init() {
    s.tolerance = 10;
    s.aspectRatio = g.canvas.height / g.canvas.width;
    s.format = 'a4';
    
    
})();

// resizeObserver
var resizeObserver = new ResizeObserver((entries) => {

    // TODO: при проблемах с производительностью это можно оптимизировать. Пока предполагается, что 
    // размер окна будет меняться нечасто
    g.init();
    cnv.init('canvas.text',g.canvas.width,g.canvas.height,'gost_type_a');
    

    s.aspectRatio = g.canvas.height / g.canvas.width;
    

});

resizeObserver.observe(g.canvas);

// --- events registration
registerMouseMoveEvent();
registerMouseUpEvent();
registerMouseWheelEvent();
registerSpacebarEvents();

// --- buttons
registerButtonSavePdfEvent();

// --- Database: Переменная, хранящая объекты из базы данных, если таковые имеются
dbInitialize();
dbList();

a.storedShapes$.subscribe((storedShapes) => {
    if (storedShapes.length > 0) {
        for (const shape of storedShapes) {
            switch (shape.type) {
                case 'line':
                    
                    const start = shape._start;
                    const end = shape._end;
                    const line = new Line(shape.aspectRatio,start, end,shape.color, shape.thickness);
                    a.shapes.push(line);
                    break;
                case 'rectangle':
                    const p1 = shape._p1;
                    const p2 = shape._p2;
                    const p3 = shape._p3;
                    const p4 = shape._p4;
                    const width = shape._width;
                    const height = shape._height;
    
                    const rectangle = new Rectangle(shape.aspectRatio,p1,p2,p3,p4,width,height,shape.color, shape.thickness);
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

});
a.storedText$.subscribe((storedText) => {
    if (storedText.length > 0) {
        for (const textObject of storedText) {
            let textBlock = new TextBlock(textObject.start, textObject.textArray, textObject.fontSize, textObject.color);
            textLinesCollection$.next({ fnName: 'push', line: textBlock });
        }
    }
});

a.zlc = !localStorage.getItem('zlc') ? 1 : localStorage.getItem('zlc');
a.realScale$.next(getRealScale());




