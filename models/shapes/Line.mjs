import { Observable, filter, of } from "rxjs";
import { convertWebGLToCanvas2DPoint, getLineSelectBoundary, isPointInsideFrame, isinSelectBoundaryLine, transformPointByMatrix3 } from "../../shared/common.mjs";
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
            startPixels.x / scale, startPixels.y / scale,
            endPixels.x / scale, endPixels.y / scale
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
        return isinSelectBoundaryLine(mouse, this.start, this.end);
    }

    setSelectBoundary() {

        this.selectBoundary = getLineSelectBoundary(this.start, this.end);
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

    getBreakPoints(mouse, shapes_) {
        let bs, be;
        const shapes = shapes_.filter(shape => shape.type === 'line');
        shapes.forEach(shape => {
            switch (shape.type) {
                case 'line':
                    let selectedLine = this;
                    let closestLines = this.findClosestLines(mouse, shapes, 1);
                    for (let line of closestLines) {
                        if (this.doLinesIntersect(selectedLine, line)) {
                            let intersectionPoint = this.findIntersectionPoint(selectedLine, line);
                            if (!bs) {
                                bs = intersectionPoint;
                            } else {
                                be = intersectionPoint;
                            }
                        }
                    }

                    break;
            }
        });
        if (bs.x>be.x) {
            let temp;
            temp = {...be};
            be = {...bs};
            bs = {...temp};

        }
        return { bs: bs, be: be };
    }



    findIntersectionPoint(line1, line2) {
        const x1 = line1.start.x;
        const y1 = line1.start.y;
        const x2 = line1.end.x;
        const y2 = line1.end.y;

        const x3 = line2.start.x;
        const y3 = line2.start.y;
        const x4 = line2.end.x;
        const y4 = line2.end.y;

        const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

        if (denominator === 0) {
            return null; // Lines are parallel or coincident
        }

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            const x = x1 + ua * (x2 - x1);
            const y = y1 + ua * (y2 - y1);
            return new Point(x,y);
        } else {
            return null; // Intersection point is outside the line segments
        }
    }
    doLinesIntersect(line1, line2) {
        const x1 = line1.start.x;
        const y1 = line1.start.y;
        const x2 = line1.end.x;
        const y2 = line1.end.y;

        const x3 = line2.start.x;
        const y3 = line2.start.y;
        const x4 = line2.end.x;
        const y4 = line2.end.y;

        const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denominator === 0) {
            return false; // Lines are parallel
        }

        const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }

    findClosestLines(mouse, shapes, count) {
        const linesLeft = shapes.filter(shape => {
            const intersectionLeft = this.findIntersectionPoint(this, shape);
            if (!intersectionLeft) {
                return false;
            }
            if (intersectionLeft.x <= mouse.x) {
                return true;
            }
            return false;
        })
            .map(line => ({ line, distance: this.calculateDistance(mouse, line) }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, count)
            .map(item => item.line);

        const linesRight = shapes.filter(shape => {
            const intersectionRight = this.findIntersectionPoint(this, shape);
            if (!intersectionRight) {
                return false;
            }

            if (intersectionRight.x >= mouse.x) {
                return true;
            }
            return false;
        })
            .map(line => ({ line, distance: this.calculateDistance(mouse, line) }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, count)
            .map(item => item.line);
        const result = [...linesLeft, ...linesRight].sort((a,b)=>a.start.x-b.start.x);
        return result;
    }

    calculateDistance(mouse, line) {
        const result = Math.hypot(mouse.x - line.start.x, mouse.y - line.start.y)
        return result;
    }



}