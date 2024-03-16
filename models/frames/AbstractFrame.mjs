import { convertCanvas2DToWebGLPoint, convertWebGLToCanvas2DPoint } from "../../shared/common.mjs";
import { Point } from "../Point.mjs";

export class AbstractFrame {

    get start() {
        return this._start;
    }
    set start(point) {
        this._start = { ...point };
        this.setPoints();
    }
    get end() {
        return this._end;
    }
    set end(point) {
        this._end = { ...point };
        this.setPoints();
    }


    constructor(start, end, color) {
        this.type = 'select_frame';

        this.color = [...color];
        this._start = {...start};
        this._end = { ...end };
        
    }

    setPoints() {
        const width = this.end.x - this.start.x;
        const height = this.end.y - this.start.y;
        
        if (width >= 0 && height >= 0) {
            // Positive width and height, draw from top left to bottom right
            this.point1 = new Point(this.start.x, this.start.y + height);
            this.point2 = new Point(this.start.x + width, this.start.y + height);
            this.point3 = new Point(this.start.x + width, this.start.y);
            this.point4 = new Point(this.start.x, this.start.y);
        } else if (width < 0 && height >= 0) {
            // Negative width, positive height, draw from top right to bottom left
            this.point1 = new Point(this.start.x + width, this.start.y + height);
            this.point2 = new Point(this.start.x, this.start.y + height);
            this.point3 = new Point(this.start.x, this.start.y);
            this.point4 = new Point(this.start.x + width, this.start.y);
        } else if (width >= 0 && height < 0) {
            // Positive width, negative height, draw from bottom left to top right
            this.point1 = new Point(this.start.x, this.start.y);
            this.point2 = new Point(this.start.x + width, this.start.y);
            this.point3 = new Point(this.start.x + width, this.start.y + height);
            this.point4 = new Point(this.start.x, this.start.y + height);
        } else {
            // Negative width and height, draw from bottom right to top left
            this.point1 = new Point(this.start.x + width, this.start.y);
            this.point2 = new Point(this.start.x, this.start.y);
            this.point3 = new Point(this.start.x, this.start.y + height);
            this.point4 = new Point(this.start.x + width, this.start.y + height);
        }


    }

    convertToCanvas2d(canvasWidth, canvasHeight) {
        this.point1 = convertWebGLToCanvas2DPoint(this.point1, canvasWidth, canvasHeight);
        this.point2 = convertWebGLToCanvas2DPoint(this.point2, canvasWidth, canvasHeight);
        this.point3 = convertWebGLToCanvas2DPoint(this.point3, canvasWidth, canvasHeight);
        this.point4 = convertWebGLToCanvas2DPoint(this.point4, canvasWidth, canvasHeight);

    }

    deconvert(canvasWidth, canvasHeight) {
        this.point1 = convertCanvas2DToWebGLPoint(this.point1, canvasWidth, canvasHeight);
        this.point2 = convertCanvas2DToWebGLPoint(this.point2, canvasWidth, canvasHeight);
        this.point3 = convertCanvas2DToWebGLPoint(this.point3, canvasWidth, canvasHeight);
        this.point4 = convertCanvas2DToWebGLPoint(this.point4,canvasWidth,canvasHeight);
    }

    getVertices() {
        return new Float32Array([
            this.point1.x, this.point1.y,
            this.point2.x, this.point2.y,
            this.point3.x, this.point3.y,
            this.point4.x, this.point4.y
        ])
    }
}