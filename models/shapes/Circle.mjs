import { isPointInsideFrame } from "../../shared/common.mjs";
import { BasicShape } from "../BasicShape.mjs";
import { Point } from "../Point.mjs";
import { mat3 } from "gl-matrix";
import { transformPointByMatrix3 } from "../../shared/common.mjs";
import { s } from "../../shared/settings.mjs";

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
    getVerticesPixels(scale) {
        
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
    isinSelectBoundary(mouse) {
        const width = s.tolerance / 2;

        const topLineP1 = new Point(this.center.x - this.radius, this.center.y + this.radius);
        const topLineP2 = new Point(this.center.x + this.radius, this.center.y + this.radius);
        const bottomLineP1 = new Point(this.center.x + this.radius, this.center.y - this.radius);
        const bottomLineP2 = new Point(this.center.x - this.radius, this.center.y - this.radius);
        


        const vertices = [
            point1.x, point1.y,
            point2.x, point2.y,
            point3.x, point3.y,
            point4.x, point4.y,
            point9.x, point9.y,
            point10.x, point10.y,
            point11.x, point11.y,
            point12.x, point12.y,
        ];

        let isInside = false;
        let j = vertices.length - 2;
        
        for (let i = 0; i < vertices.length; i += 2) {
            const vertexX1 = vertices[i];
            const vertexY1 = vertices[i + 1];
            const vertexX2 = vertices[j];
            const vertexY2 = vertices[j + 1];
        
            if ((vertexY1 > mouse.y) !== (vertexY2 > mouse.y) &&
                mouse.x < ((vertexX2 - vertexX1) * (mouse.y - vertexY1)) / (vertexY2 - vertexY1) + vertexX1) {
                isInside = !isInside;
            }
        
            j = i;
        }
        return isInside;
    }

    setSelectBoundary() {
        const width = s.tolerance / 2;
        const angle = Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x);
        const offsetX = width * Math.sin(angle) * this.aspectRatio;
        const offsetY = width * Math.cos(angle);

        this.selectBoundary.p1 = new Point(this.p1.x - offsetX + width * Math.cos(angle), this.p1.y + offsetY + width * Math.sin(angle));
        this.selectBoundary.p2 = new Point(this.p2.x - offsetX - width * Math.cos(angle), this.p2.y + offsetY - width * Math.sin(angle));
        this.selectBoundary.p3 = new Point(this.p3.x + offsetX - width * Math.cos(angle), this.p3.y - offsetY - width * Math.sin(angle));
        this.selectBoundary.p4 = new Point(this.p4.x + offsetX + width * Math.cos(angle), this.p4.y - offsetY + width * Math.sin(angle));
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