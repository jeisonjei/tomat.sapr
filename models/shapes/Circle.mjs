import { isPointInsideFrame } from "../../shared/common.mjs";
import { BasicShape } from "../BasicShape.mjs";
import { Point } from "../Point.mjs";
import { mat3 } from "gl-matrix";
import { transformPointByMatrix3 } from "../../shared/common.mjs";

export class Circle extends BasicShape {
    set center(point) {
        this._center = { ...point };
        this.updateBoundary();
    }

    get center() {
        return this._center;
    }

    set radius(value) {
        this._radius = value;
        this.updateBoundary();
    }

    get radius() {
        return this._radius;
    }


    constructor(aspectRatio, center, radius, color) {
        super(aspectRatio);
        this.type = 'circle';
        this.center = { ...center };
        this.radius = radius;
        this.color = [...color];
        this.updateBoundary();
    }

    getVertices() {
        const circleVertices = [];
        for (let i = 0; i <= 360; i++) {
            const angle = i * Math.PI / 180;
            const x = this.center.x + this.radius * Math.cos(angle) * this.aspectRatio;
            const y = this.center.y + this.radius * Math.sin(angle);
            circleVertices.push(x, y);
        }
        return new Float32Array(circleVertices);
    }
    getVerticesArray() {
        const circleVertices = [];
        for (let i = 0; i <= 360; i++) {
            const angle = i * Math.PI / 180;
            const x = this.center.x + this.radius * Math.cos(angle) * this.aspectRatio;
            const y = this.center.y + this.radius * Math.sin(angle);
            circleVertices.push(x, y);
        }
        return circleVertices;
    }

    getClone() {
        return new Circle(this.aspectRatio, this.center, this.radius, this.color);
    }


    updateBoundary() {
        const center = this.center;
        const radius = this.radius;

        this.quad1 = new Point(center.x, center.y + radius); // top point
        this.quad2 = new Point(center.x + radius * this.aspectRatio, center.y); // right point
        this.quad3 = new Point(center.x, center.y - radius); // bottom point
        this.quad4 = new Point(center.x - radius * this.aspectRatio, center.y); // left point
    }

    isinSelectFrame(frame) {
        if (
            isPointInsideFrame(frame, this.center.x, this.center.y) &&
            isPointInsideFrame(frame, this.quad1.x, this.quad1.y) &&
            isPointInsideFrame(frame, this.quad2.x, this.quad2.y) &&
            isPointInsideFrame(frame, this.quad3.x, this.quad3.y) &&
            isPointInsideFrame(frame, this.quad4.x, this.quad4.y)
        ) {
            return true;
        }

        return false;
    }

    // --------- MAGNETS ---------
    isinGripCenter = (mouse) => this.grip.isin(this.center, mouse);
    isinGripQ1 = (mouse) => this.grip.isin(this.quad1, mouse);
    isinGripQ2 = (mouse) => this.grip.isin(this.quad2, mouse);
    isinGripQ3 = (mouse) => this.grip.isin(this.quad3, mouse);
    isinGripQ4 = (mouse) => this.grip.isin(this.quad4, mouse);
    isinTripHcenter = (mouse) => this.tripH.isin(this.center, mouse);
    isinTripVcenter = (mouse) => this.tripV.isin(this.center, mouse);
    isinTripHq1 = (mouse) => this.tripH.isin(this.quad1, mouse);
    isinTripHq3 = (mouse) => this.tripH.isin(this.quad3, mouse);
    isinTripVq4 = (mouse) => this.tripV.isin(this.quad4, mouse);
    isinTripVq2 = (mouse) => this.tripV.isin(this.quad2, mouse);
    // --------- MAGNETS ---------

    zoom(zl) {
        const zoom_mat = mat3.fromScaling(mat3.create(), [zl, zl, 1]);
        this.center = transformPointByMatrix3(zoom_mat, this.center);
        this.radius = this.radius * zl;
    }

    pan(tx, ty) {
        const pan_mat = mat3.fromTranslation(mat3.create(), [tx, ty, 0]);
        mat3.transpose(pan_mat, pan_mat);
        this.center = transformPointByMatrix3(pan_mat, this.center);
    }
}