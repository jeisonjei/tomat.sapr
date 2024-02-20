import { canvasGetWebglCoordinates, isPointInsideFrame } from "../../shared/common.mjs";
import { BasicShape } from "../BasicShape.mjs";
import { canvas, canvasText } from "../../main.js";

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
        this.startInit = this.start;
    }


    isinSelectFrame(frame) {
        this.update(this.textArray);
        if (
            isPointInsideFrame(frame, this.start.x, this.start.y) &&
            isPointInsideFrame(frame, this.start.x + this.width, this.start.y) &&
            isPointInsideFrame(frame, this.start.x + this.width, this.start.y - this.height) &&
            isPointInsideFrame(frame, this.start.x, this.start.y - this.height)
        ) {
            return true;
        }

        return false;
    }

    isinGripStart(mouse) {
        const s = canvasGetWebglCoordinates(this.start, this.context.canvas);
        return this.grip.isin(s,mouse);
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
        const text = new Text(this.aspectRatio, {...this.start}, this.textArray, this.context);
        return text;
    }
}