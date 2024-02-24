import { canvasGetWebglCoordinates, isPointInsideFrame } from "../../shared/common.mjs";
import { BasicShape } from "../BasicShape.mjs";
import { Point } from "../Point.mjs";

export class Text extends BasicShape {

    get start() {
        return this._start;
    }

    set start(point) {
        this._start = { ...point };
    }

    constructor(aspectRatio, start, textArray, context) {
        super(aspectRatio);
        this.type = 'text';
        this._start = start;

        this.textArray = [...textArray];
        this.text = this.getText(textArray);

        this.context = context;

        this.update(textArray);

    }

    update(textArray) {
        this.text = this.getText(textArray);
        const metrics = this.context.measureText(this.text);
        this.width = metrics.width;
        this.height = metrics.fontBoundingBoxAscent;

        this.p1 = new Point(this.start.x, this.start.y);
        this.p2 = new Point(this.start.x + this.width, this.start.y);
        this.p3 = new Point(this.start.x + this.width, this.start.y - this.height);
        this.p4 = new Point(this.start.x, this.start.y - this.height);
    }


    isinSelectFrame(frame) {
        this.update(this.textArray);
        if (
            isPointInsideFrame(frame, this.p1.x, this.p1.y) &&
            isPointInsideFrame(frame, this.p2.x, this.p2.y) &&
            isPointInsideFrame(frame, this.p3.x, this.p3.y) &&
            isPointInsideFrame(frame, this.p4.x, this.p4.y)
        ) {
            return true;
        }

        return false;
    }

    isinSelectBoundary(mouse, pixels=false) {
        /**
         * Функция проверяет, находится ли мышь внутри selectBoundary.
         * Так как отрисовка selectBoundary выполняется через webgl,
         * и соответственно эта функция используется только в связи с отрисовкой selectBoundary,
         * то переведём координаты webgl в pixels прямо здесь
         */
        this.update(this.textArray);

        let p1, p2, p4;
        if (!pixels) {
            p1 = canvasGetWebglCoordinates(this.p1,this.context.canvas);
            p2 = canvasGetWebglCoordinates(this.p2, this.context.canvas);
            p4 = canvasGetWebglCoordinates(this.p3, this.context.canvas);
    
        }
        else {
            p1 = this.p1;
            p2 = this.p2;
            p4 = this.p3;
        }

        
        if (mouse.x > p1.x && mouse.x < p2.x) {
            if ((mouse.y > p1.y && mouse.y < p4.y) || (mouse.y< p1.y && mouse.y > p4.y)) {
                return true;
            }
        }
        return false;
    }

    setSelectBoundary() {
        /**
         * Функция устанавливает точки для selectBoundary.
         * Так как selectBoundary отрисовывается в webgl, то сразу переведём координаты в webgl
         */
        const p1 = canvasGetWebglCoordinates(this.p1,this.context.canvas);
        const p2 = canvasGetWebglCoordinates(this.p2, this.context.canvas);
        const p3 = canvasGetWebglCoordinates(this.p3, this.context.canvas);
        const p4 = canvasGetWebglCoordinates(this.p4, this.context.canvas);
        
        this.selectBoundary.p1 = p1;
        this.selectBoundary.p2 = p2;
        this.selectBoundary.p3 = p3;
        this.selectBoundary.p4 = p4;

    }

    isinGripStart(mouse) {
        const s = canvasGetWebglCoordinates(this.start, this.context.canvas);
        return this.grip.isin(s, mouse);
    }

    isinTripHstart(mouse) {
        const s = canvasGetWebglCoordinates(this.start, this.context.canvas)
        return this.tripH.isin(s, mouse);
    }

    isinTripVstart(mouse) {
        const s = canvasGetWebglCoordinates(this.start, this.context.canvas);
        return this.tripV.isin(s, mouse);
    }

    pan(tx, ty) {

    }
    zoom(z) {

    }

    add(char, index) {
        if (index >= 0 && index <= this.textArray.length) {
            this.textArray.splice(index, 0, char);
        } else {
            this.textArray.push(char);
        }
        this.update(this.textArray);
    }
    delete(index) {
        if (index >= 0 && index < this.textArray.length) {
            let text = this.textArray.join('');
            text = text.substring(0, index) + text.substring(index + 1);
            this.textArray = text.split('');
        }
        else {
            this.textArray.pop();            
        }
        this.update(this.textArray);
    }

    getText(textArray) {
        return textArray?.join('');
    }

    getClone() {
        const text = new Text(this.aspectRatio, { ...this.start }, this.textArray, this.context);
        return text;
    }
}