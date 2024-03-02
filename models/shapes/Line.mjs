import { Observable, filter, of } from "rxjs";
import { convertWebGLToCanvas2DPoint, findClosestPoints, getLineSelectBoundary, getProjection, getSideOfMouseRelativeToLine, isPointInsideFrame, isinSelectBoundaryLine, transformPointByMatrix3 } from "../../shared/common.mjs";
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


    getClone() {
        const line = new Line(this.aspectRatio, this.start, this.end, this.color);
        return line;
    }

    isinSelectFrame(frame) {
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const offsetX = s.tolerance * Math.sin(angle) ;
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

        for (const shape of shapesCircle) {
            const intersectionPoints = this.findCircleLineIntersections(shape, this);
            if (intersectionPoints.length > 0) {
                if (intersectionPoints.length === 1) {
                    bs = intersectionPoints[0];
                    be = null;
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
            else {
                continue;
            }

            return { bs, be }; // Return immediately if circle condition is met
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
        const lineVector = line.end.subtract(line.start);
        const circleCenter = circle.center;
        const angleRad = Math.atan2(circle.center.y - line.start.y, circle.center.x - line.start.x);
    
        const circleRadius = circle.radius;
    
        const dx = line.end.x - line.start.x;
        const dy = line.end.y - line.start.y;
    
        const a = dx * dx + dy * dy;
        const b = 2 * (dx * (line.start.x - circleCenter.x) + dy * (line.start.y - circleCenter.y));
        const c = circleCenter.x * circleCenter.x + circleCenter.y * circleCenter.y + line.start.x * line.start.x + line.start.y * line.start.y - 2 * (circleCenter.x * line.start.x + circleCenter.y * line.start.y) - circleRadius * circleRadius;
    
        const discriminant = b * b - 4 * a * c;

        if (discriminant < 0) {
            return []; // No intersection, return empty array
        } else {
            // Two intersection points
            const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            const intersection1 = new Point(line.start.x + t1 * dx, line.start.y + t1 * dy);
            const intersection2 = new Point(line.start.x + t2 * dx, line.start.y + t2 * dy);
            if (this.isinCircle(circle,line.start) || this.isinCircle(circle, line.end)) {
                if (this.isinCircle(circle,line.start)) {
                    const side = getSideOfMouseRelativeToLine(line.start, intersection1, line);
                    if (side === 'start') {
                        return [intersection1];
                    }
                    else {
                        return [intersection2];
                    }
                    
                }
                else if (this.isinCircle(circle, line.end)) {
                    const side = getSideOfMouseRelativeToLine(line.end, intersection1, line);
                    if (side === 'start') {
                        return [intersection1];
                    }
                    else {
                        return [intersection2];
                    }
                }
            }
            else {
                return [intersection1, intersection2];
                
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