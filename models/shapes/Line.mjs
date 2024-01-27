import { BasicShape } from "../BasicShape.mjs";
import { Point } from "../Point.mjs";

export class Line extends BasicShape{

    get start() {
        return this._start;
    }
    set start(point) {
        this._start = {...point};
    }
    get end() {
        return this._end;
    }
    set end(point) {
        this._end = {...point};
    }

    constructor(gl, program, aspectRatio, start, end, color) {
        super(gl, program, aspectRatio);
        this.type = 'line';
        this.isSelected = false;
        this._start = {...start};
        this._end = {...end};
        this.color = [...color];
    }

    getVertices() {
        return new Float32Array([
            this.start.x, this.start.y,
            this.end.x, this.end.y
        ]);
    }

    getClone() {
        const line = new Line(this.gl, this.program, this.aspectRatio, this.start, this.end, this.color);
        return line;
    }

    isinSelectFrame(frame) {

        // Calculate the length and angle of the line
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);

        // Calculate the offset for the rectangle based on the line angle
        const offsetX = this.selectionZoneWidth * Math.sin(angle) * this.aspectRatio;
        const offsetY = this.selectionZoneWidth * Math.cos(angle);

        // Calculate the coordinates of the rectangle vertices
        const point1 = new Point(this.start.x - offsetX, this.start.y + offsetY);
        const point2 = new Point(this.end.x - offsetX, this.end.y + offsetY);
        const point3 = new Point(this.end.x + offsetX, this.end.y - offsetY);
        const point4 = new Point(this.start.x + offsetX, this.start.y - offsetY);

        // Check if all inside rectangle points are inside the outside rectangle
        if (
            this.isPointInsideFrame(frame, point1.x, point1.y) &&
            this.isPointInsideFrame(frame, point2.x, point2.y) &&
            this.isPointInsideFrame(frame, point3.x, point3.y) &&
            this.isPointInsideFrame(frame, point4.x, point4.y)
        ) {
            return true;
        }

        return false;
    }

    isPointInsideFrame(frame, x, y) {
        const { point1, point2, point3 } = frame;
        if (x > point1.x && x < point2.x && y > point3.y && y < point2.y) {
            return true;
        }
        return false;
    }
}