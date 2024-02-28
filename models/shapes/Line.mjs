import { Observable, filter, of } from "rxjs";
import { convertWebGLToCanvas2DPoint, findClosestPoints, getLineSelectBoundary, getProjection, isPointInsideFrame, isinSelectBoundaryLine, transformPointByMatrix3 } from "../../shared/common.mjs";
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
        let bs, be
        const shapesCircle = shapes_.filter(shape => shape.type === 'circle');
        const shapesLine = shapes_.filter(shape => shape.type === 'line');
        let selectedLine = this;

        for (const shape of shapesCircle) {
            if (this.isinCircle(shape, mouse)) {
                const intersectionPoints = this.findCircleLineIntersections(shape, selectedLine);
                console.log('intersectionPoints',intersectionPoints);
                if (intersectionPoints.length > 0) {
                    if (intersectionPoints.length === 1) {
                        bs = intersectionPoints[0];
                        be = bs;
                    }
                    else {
                        for (let point of intersectionPoints) {
                            if (!bs) {
                                bs = point;
                            } else {
                                be = point;
                            }
                        }
                    }

                }

                return { bs, be }; // Return immediately if circle condition is met

            }
        }

        let closest = this.findClosest(mouse, shapesLine, 1);
        if (closest.length === 0) {
            return { bs: null, be: null };
        }
        if (closest.length === 1) {
            return { bs: closest[0], be: null }
        }
        else {
            return { bs: closest[0], be: closest[1] }
        }


    }

    isinCircle(circle, point) {
        const dx = point.x - circle.center.x;
        const dy = point.y - circle.center.y;
        return dx * dx + dy * dy < circle.radius * circle.radius;
    }



    findIntersectionPoint(selectedLine, line2) {
        const x1 = selectedLine.start.x;
        const y1 = selectedLine.start.y;
        const x2 = selectedLine.end.x;
        const y2 = selectedLine.end.y;

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
            return new Point(x, y);
        } else {
            return null; // Intersection point is outside the line segments
        }
    }

    findCircleLineIntersections(circle, line) {
        const cx = circle.center.x;
        const cy = circle.center.y;

        
        const angleRad = Math.atan2(circle.center.y - line.start.y, circle.center.x - line.start.x);
        const aspectCoeff = s.aspectRatio + (1 - s.aspectRatio) * (1 - Math.abs(Math.cos(angleRad)));
        const r = circle.radius * aspectCoeff;


        let x1, y1, x2, y2;
        if (line.start.x === line.end.x) {
            if ((line.start.y > cy - r && line.start.y < cy + r)) {
                x1 = line.start.x;
                y1 = line.start.y;
                x2 = line.end.x;
                y2 = line.end.y;

            }
            else if ((line.end.y > cy - r && line.end.y < cy + r)) {
                x1 = line.end.x;
                y1 = line.end.y;
                x2 = line.start.x;
                y2 = line.start.y;
            }
            else {
                x1 = line.start.x;
                y1 = line.start.y;
                x2 = line.end.x;
                y2 = line.end.y;

            }
        }
        else {
            if ((line.start.x > cx - r && line.start.x < cx + r)) {
                x1 = line.start.x;
                y1 = line.start.y;
                x2 = line.end.x;
                y2 = line.end.y;

            }
            else if ((line.end.x > cx - r && line.end.x < cx + r)) {
                x1 = line.end.x;
                y1 = line.end.y;
                x2 = line.start.x;
                y2 = line.start.y;
            }
            else {
                x1 = line.start.x;
                y1 = line.start.y;
                x2 = line.end.x;
                y2 = line.end.y;

            }

        }

        // Calculate the coefficients for the quadratic formula
        const dx = x2 - x1;
        const dy = y2 - y1;
        const a = dx * dx + dy * dy;
        const b = 2 * (dx * (x1 - cx) + dy * (y1 - cy));
        const c = cx * cx + cy * cy + x1 * x1 + y1 * y1 - 2 * (cx * x1 + cy * y1) - r * r;

        // Calculate the discriminant
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return []; // No intersection, return empty array
        } else if (discriminant === 0) {
            // One intersection point
            const t = -b / (2 * a);
            const intersectionX = x1 + t * dx;
            const intersectionY = y1 + t * dy;
            return [new Point(intersectionX, intersectionY)];
        } else {
            // Two intersection points
            const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            const intersection1 = new Point(x1 + t1 * dx, y1 + t1 * dy);
            const intersection2 = new Point(x1 + t2 * dx, y1 + t2 * dy);

            // Adjust intersection points for WebGl coordinate system
            if (dx < 0) {
                intersection1.x = x1 - Math.abs(t1) * Math.abs(dx);
                intersection2.x = x1 - Math.abs(t2) * Math.abs(dx);
            }
            if (dy < 0) {
                intersection1.y = y1 - Math.abs(t1) * Math.abs(dy);
                intersection2.y = y1 - Math.abs(t2) * Math.abs(dy);
            }

            if (intersection1.isEqual(intersection2)) {
                return [intersection1]; // Return one intersection point if they are equal
            } else {
                return [intersection1, intersection2]; // Return both intersection points if they are different
            }
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

    findClosest(mouse, shapes) {
        const mouseProjection = getProjection(mouse, this);
        const intersections = shapes.map(shape => {
            return this.findIntersectionPoint(this, shape);
        }).filter(item => item);
        const closestPoints = findClosestPoints(mouseProjection, intersections);
        return closestPoints;
    }

    calculateDistance(mouse, line) {
        const result = Math.hypot(mouse.x - line.start.x, mouse.y - line.start.y)
        return result;
    }

    isEqual(anotherLine) {
        if (this.start.isEqual(anotherLine.start) && this.end.isEqual(anotherLine.end)) {
            return true;
        }
        return false;
    }



}