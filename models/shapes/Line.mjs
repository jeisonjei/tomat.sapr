import { transformPointByMatrix3 } from "../../shared/common.mjs";
import { getMoveMatrix } from "../../shared/transform.mjs";
import { BasicShape } from "../BasicShape.mjs";
import { Point } from "../Point.mjs";

export class Line extends BasicShape {

    get start() {
        return this._start;
    }
    set start(point) {
        this._start = { ...point };
        this.mid = this.getMid(this.start, this.end);
    }
    get end() {
        return this._end;
    }
    set end(point) {
        this._end = { ...point };
        this.mid = this.getMid(this.start, this.end);
    }

    constructor(aspectRatio, start, end, color) {
        super(aspectRatio);
        this.type = 'line';
        this.isSelected = false;
        this._start = { ...start };
        this._end = { ...end };
        this.mid = this.getMid(start, end);
        this.color = [...color];
    }

    getMid(start, end) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        return new Point(midX, midY);
    }


    getVertices() {
        return new Float32Array([
            this.start.x, this.start.y,
            this.end.x, this.end.y
        ]);
    }
    getVerticesArray() {
        return [
            this.start.x, this.start.y,
            this.end.x, this.end.y
        ];
    }

    getClone() {
        const line = new Line(this.aspectRatio, this.start, this.end, this.color);
        return line;
    }

    isinSelectFrame(frame) {

        // Calculate the length and angle of the line
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);

        // Calculate the offset for the rectangle based on the line angle
        const offsetX = this.tolerance * Math.sin(angle) * this.aspectRatio;
        const offsetY = this.tolerance * Math.cos(angle);

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

    isMouseInGripAtStart(mouse) {
        const minX = this.start.x - this.tolerance * this.aspectRatio;
        const maxX = this.start.x + this.tolerance * this.aspectRatio;
        const minY = this.start.y - this.tolerance;
        const maxY = this.start.y + this.tolerance;

        return (mouse.x >= minX && mouse.x <= maxX && mouse.y >= minY && mouse.y <= maxY);
    }
    isMouseInGripAtEnd(mouse) {
        const minX = this.end.x - this.tolerance * this.aspectRatio;
        const maxX = this.end.x + this.tolerance * this.aspectRatio;
        const minY = this.end.y - this.tolerance;
        const maxY = this.end.y + this.tolerance;

        return (mouse.x >= minX && mouse.x <= maxX && mouse.y >= minY && mouse.y <= maxY);
    }

    isMouseInGripAtMid(mouse) {
        const minX = this.mid.x - this.tolerance * this.aspectRatio;
        const maxX = this.mid.x + this.tolerance * this.aspectRatio;
        const minY = this.mid.y - this.tolerance;
        const maxY = this.mid.y + this.tolerance;

        return (mouse.x >= minX && mouse.x <= maxX && mouse.y >= minY && mouse.y <= maxY);
    }

    zoom(zl) {
        const zoom_mat = mat3.fromScaling(mat3.create(), [zl, zl, 1]);
        this.start = transformPointByMatrix3(zoom_mat, this.start);
        this.mid = transformPointByMatrix3(zoom_mat, this.mid);
        this.end = transformPointByMatrix3(zoom_mat, this.end);
    }

    pan(tx, ty) {
        const pan_mat = mat3.fromTranslation(mat3.create(), [tx, ty, 0]);
        mat3.transpose(pan_mat, pan_mat);
        this.start = transformPointByMatrix3(pan_mat, this.start);
        this.mid = transformPointByMatrix3(pan_mat, this.mid);
        this.end = transformPointByMatrix3(pan_mat, this.end);
    }

}