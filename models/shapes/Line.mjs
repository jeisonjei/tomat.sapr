import { Observable, filter, of } from "rxjs";
import { convertWebGLToCanvas2DPoint, isPointInsideFrame, transformPointByMatrix3 } from "../../shared/common.mjs";
import { getMoveMatrix } from "../../shared/transform.mjs";
import { BasicShape } from "../BasicShape.mjs";
import { Point } from "../Point.mjs";
import { mat3 } from "gl-matrix";
import { BasicMagnet } from "../BasicMagnet.mjs";

import { s } from "../../shared/settings.mjs";

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
            this.end.x, this.end.y,
        ]);
    }
    getVerticesArray() {
        return [
            this.start.x, this.start.y,
            this.end.x, this.end.y,
        ];
    }
    getVerticesPixels(scale) {

        const startPixels = convertWebGLToCanvas2DPoint(this.start, s.canvasWidth, s.canvasHeight);
        const endPixels = convertWebGLToCanvas2DPoint(this.end, s.canvasWidth, s.canvasHeight);

        return [
            startPixels.x/scale, startPixels.y/scale,
            endPixels.x/scale,endPixels.y/scale
        ]
    }

    getClone() {
        const line = new Line(this.aspectRatio, this.start, this.end, this.color);
        return line;
    }

    isinSelectFrame(frame) {
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const offsetX = s.tolerance * Math.sin(angle) * this.aspectRatio;
        const offsetY = s.tolerance * Math.cos(angle);
        const point1 = new Point(this.start.x - offsetX, this.start.y + offsetY);
        const point2 = new Point(this.end.x - offsetX, this.end.y + offsetY);
        const point3 = new Point(this.end.x + offsetX, this.end.y - offsetY);
        const point4 = new Point(this.start.x + offsetX, this.start.y - offsetY);
        if (
            isPointInsideFrame(frame, point1.x, point1.y) &&
            isPointInsideFrame(frame, point2.x, point2.y) &&
            isPointInsideFrame(frame, point3.x, point3.y) &&
            isPointInsideFrame(frame, point4.x, point4.y)
        ) {
            return true;
        }

        return false;
    }

    isinSelectBoundary(mouse) {
        const width = s.tolerance / 2;
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const offsetX = width * Math.sin(angle);
        const offsetY = width * Math.cos(angle);

        const point1 = new Point(this.start.x - offsetX + width * Math.cos(angle), this.start.y + offsetY + width * Math.sin(angle));
        const point2 = new Point(this.end.x - offsetX - width * Math.cos(angle), this.end.y + offsetY - width * Math.sin(angle));
        const point3 = new Point(this.end.x + offsetX - width * Math.cos(angle), this.end.y - offsetY - width * Math.sin(angle));
        const point4 = new Point(this.start.x + offsetX + width * Math.cos(angle), this.start.y - offsetY + width * Math.sin(angle));

        const vertices = [
            point1.x, point1.y,
            point2.x, point2.y,
            point3.x, point3.y,
            point4.x, point4.y
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
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const offsetX = width * Math.sin(angle) * this.aspectRatio;
        const offsetY = width * Math.cos(angle);

        this.selectBoundary.p1 = new Point(this.start.x - offsetX + width * Math.cos(angle), this.start.y + offsetY + width * Math.sin(angle));
        this.selectBoundary.p2 = new Point(this.end.x - offsetX - width * Math.cos(angle), this.end.y + offsetY - width * Math.sin(angle));
        this.selectBoundary.p3 = new Point(this.end.x + offsetX - width * Math.cos(angle), this.end.y - offsetY - width * Math.sin(angle));
        this.selectBoundary.p4 = new Point(this.start.x + offsetX + width * Math.cos(angle), this.start.y - offsetY + width * Math.sin(angle));
    }
    // --------- MAGNETS ---------
    isinGripStart = (mouse) => this.grip.isin(this.start, mouse);
    isinGripEnd = (mouse) => this.grip.isin(this.end, mouse);
    isinGripMid = (mouse) => this.grip.isin(this.mid, mouse);
    isinTripHstart = (mouse) => this.tripH.isin(this.start, mouse);
    isinTripHmid = (mouse) => this.tripH.isin(this.mid, mouse);
    isinTripHend = (mouse) => this.tripH.isin(this.end, mouse);
    isinTripVstart = (mouse) => this.tripV.isin(this.start, mouse);
    isinTripVmid = (mouse) => this.tripV.isin(this.mid, mouse);
    isinTripVend = (mouse) => this.tripV.isin(this.end, mouse);
    // --------- MAGENTS ---------


    zoom(zl) {
        const zoom_mat = mat3.fromScaling(mat3.create(), [zl, zl, 1]);
        this.start = transformPointByMatrix3(zoom_mat, this.start);
        this.mid = transformPointByMatrix3(zoom_mat, this.mid);
        this.end = transformPointByMatrix3(zoom_mat, this.end);
        // s.tolerance = s.tolerance * zl;
    }

    pan(tx, ty) {
        const pan_mat = mat3.fromTranslation(mat3.create(), [tx, ty, 0]);
        mat3.transpose(pan_mat, pan_mat);
        this.start = transformPointByMatrix3(pan_mat, this.start);
        this.mid = transformPointByMatrix3(pan_mat, this.mid);
        this.end = transformPointByMatrix3(pan_mat, this.end);
    }


}