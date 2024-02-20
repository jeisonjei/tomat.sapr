import { canvasGetWebglCoordinates, isPointInsideFrame } from "../../shared/common.mjs";
import { BasicShape } from "../BasicShape.mjs";
import { canvas, canvasText } from "../../main.js";
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

    isinSelectBoundary() {

    }

    setSelectBoundary() {

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

    add(char) {
        this.textArray.push(char);
        this.update(this.textArray);
    }
    delete() {
        this.textArray.pop();
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