import { BasicShape } from "../BasicShape.mjs";
import { convertWebGLToCanvas2DPoint, getMid, getSelectBoundaryRectangle, isPointInsideFrame, isinSelectBoundaryLine } from "../../shared/common.mjs";
import { Point } from "../Point.mjs";
import { mat3 } from "gl-matrix";
import { transformPointByMatrix3 } from "../../shared/common.mjs";
import { s } from '../../shared/globalState/settings.mjs';
// --- rxjs
import { min } from "rxjs";


export class Rectangle extends BasicShape {
    /**
     * Класс фигуры Прямоугольник.
     * Поля width и height используются только при первой отрисовке прямоугольника, 
     * на их основе вычисляются позиции точек p2, p3, p4. Далее поля width и height не используются
     */
    get width() {
        return this._width;
    }
    set width(value) {
        this._width = value;
    }
    get height() {
        return this._height;
    }
    set height(value) {
        this._height = value;
    }
    get p1() {
        return this._p1;
    }
    set p1(point) {
        this._p1 = { ...point };
        this.updateMid();
    }
    get p2() {
        return this._p2;
    }
    set p2(point) {
        this._p2 = { ...point };
        this.updateMid();
    }
    get p3() {
        return this._p3;
    }
    set p3(point) {
        this._p3 = { ...point };
        this.updateMid();
    }
    get p4() {
        return this._p4;
    }
    set p4(point) {
        this._p4 = { ...point };
        this.updateMid();
    }

    constructor(aspectRatio, p1, p2, p3, p4, width, height, color) {
        super(aspectRatio);
        this.type = 'rectangle';
        this._p1 = p1;
        this._p2 = p2;
        this._p3 = p3;
        this._p4 = p4;
        this.width = width;
        this.height = height;
        this.color = [...color];

        this.updateMid();
        this.updateCenter();
    }

    updateMid() {
        this.m1 = getMid(this.p1, this.p2);
        this.m2 = getMid(this.p2, this.p3);
        this.m3 = getMid(this.p3, this.p4);
        this.m4 = getMid(this.p4, this.p1);
    }

    updateCenter() {
        const dx = (this.p2.x - this.p1.x) / 2;
        const dy = (this.p3.y - this.p2.y) / 2;
        const x = this.p1.x + dx;
        const y = this.p1.y + dy;
        this.center = new Point(x, y);
    }

    getVertices() {
        return new Float32Array([
            this.p1.x, this.p1.y,
            this.p2.x, this.p2.y,
            this.p3.x, this.p3.y,
            this.p4.x, this.p4.y,
        ]);
    }

    getVerticesArray() {
        return [
            this.p1.x, this.p1.y,
            this.p2.x, this.p2.y,
            this.p3.x, this.p3.y,
            this.p4.x, this.p4.y,
        ];
    }

    getVerticesPixels(scale) {
        const p1 = convertWebGLToCanvas2DPoint(this.p1, s.canvasWidth, s.canvasHeight);
        const p2 = convertWebGLToCanvas2DPoint(this.p2, s.canvasWidth, s.canvasHeight);
        const p3 = convertWebGLToCanvas2DPoint(this.p3, s.canvasWidth, s.canvasHeight);
        const p4 = convertWebGLToCanvas2DPoint(this.p4, s.canvasWidth, s.canvasHeight);
        return [
            p1.x / scale, p1.y / scale,
            p2.x / scale, p2.y / scale,
            p3.x / scale, p3.y / scale,
            p4.x / scale, p4.y / scale,
        ];

    }

    updatePoints() {
        /**
         * Эта функция нужна для того, чтобы точка p1 оставалась всегда в верхнем-левом углу.
         * Соответственно обновляются и остальные точки.
         * Функцию нужно выполнять во всех операциях с прямоугольником,
         * где меняются позиции точек - это поворот и зеркальное отображение
         */
        const array = [this.p1, this.p2, this.p3, this.p4];

        const minX = Math.min(...array.map(p => p.x));

        const minY = Math.min(...array.map(p => p.y));

        const maxX = Math.max(...array.map(p => p.x));
        const maxY = Math.max(...array.map(p => p.y));

        const newP1 = new Point(minX, maxY);
        const newP2 = new Point(maxX, maxY);
        const newP3 = new Point(maxX, minY);
        const newP4 = new Point(minX, minY);

        this.p1 = newP1;
        this.p2 = newP2;
        this.p3 = newP3;
        this.p4 = newP4;
    }

    getClone() {
        return new Rectangle(this.aspectRatio, this.p1, this.p2, this.p3, this.p4, this.width, this.height, this.color);
    }

    getBoundary() {
        return {
            p1: this.p1,
            p2: this.p2,
            p3: this.p3,
            p4: this.p4
        }

    }

    isinSelectFrame(frame) {
        if (
            isPointInsideFrame(frame, this.p1.x, this.p1.y) &&
            isPointInsideFrame(frame, this.p2.x, this.p2.y) &&
            isPointInsideFrame(frame, this.p3.x, this.p3.y) &&
            isPointInsideFrame(frame, this.p4.x, this.p4.y)
        ) {
            return true;
        }

        return false;
    }

    isinSelectFrameAtLeast(frame) {
        if (
            isPointInsideFrame(frame, this.p1.x, this.p1.y) ||
            isPointInsideFrame(frame, this.p2.x, this.p2.y) ||
            isPointInsideFrame(frame, this.p3.x, this.p3.y) ||
            isPointInsideFrame(frame, this.p4.x, this.p4.y)
        ) {
            return true;
        }

        return false;
    }

    isinSelectBoundary(mouse) {
        const isinTop = isinSelectBoundaryLine(mouse, this.p1, this.p2);
        const isinRight = isinSelectBoundaryLine(mouse, this.p2, this.p3);
        const isinBottom = isinSelectBoundaryLine(mouse, this.p4, this.p3);
        const isinLeft = isinSelectBoundaryLine(mouse, this.p1,this.p4);

        
        if (isinTop || isinBottom || isinRight || isinLeft) {
            return true;
        }
        return false;
    }

    setSelectBoundary() {
        this.selectBoundary = getSelectBoundaryRectangle(this.p1,this.p2,this.p3,this.p4);
    }

    // --------- MAGNETS ---------
    isinGripP1 = (mouse) => this.grip.isin(this.p1, mouse);
    isinGripP2 = (mouse) => this.grip.isin(this.p2, mouse);
    isinGripP3 = (mouse) => this.grip.isin(this.p3, mouse);
    isinGripP4 = (mouse) => this.grip.isin(this.p4, mouse);
    isinGripM1 = (mouse) => this.grip.isin(this.m1, mouse);
    isinGripM2 = (mouse) => this.grip.isin(this.m2, mouse);
    isinGripM3 = (mouse) => this.grip.isin(this.m3, mouse);
    isinGripM4 = (mouse) => this.grip.isin(this.m4, mouse);
    isinGripCenter = (mouse) => this.grip.isin(this.center, mouse);
    isinTripHtop = (mouse) => this.tripH.isin(this.m1, mouse);
    isinTripHbottom = (mouse) => this.tripH.isin(this.m3, mouse);
    isinTripVleft = (mouse) => this.tripV.isin(this.m4, mouse);
    isinTripVright = (mouse) => this.tripV.isin(this.m2, mouse);
    isinTripVMtop = (mouse) => this.tripV.isin(this.m1, mouse);
    isinTripVMbottom = (mouse) => this.tripV.isin(this.m3, mouse);
    isinTripHMright = (mouse) => this.tripH.isin(this.m2, mouse);
    isinTripHMleft = (mouse) => this.tripH.isin(this.m4, mouse);
    // --------- MAGNETS ---------

    zoom(zl) {
        const zoom_mat = mat3.fromScaling(mat3.create(), [zl, zl, 1]);
        this.p1 = transformPointByMatrix3(zoom_mat, this.p1);
        this.p2 = transformPointByMatrix3(zoom_mat, this.p2);
        this.p3 = transformPointByMatrix3(zoom_mat, this.p3);
        this.p4 = transformPointByMatrix3(zoom_mat, this.p4);
        this.width = this.width * zl;
        this.height = this.height * zl;
        this.updateCenter();
    }

    pan(tx, ty) {
        const pan_mat = mat3.fromTranslation(mat3.create(), [tx, ty, 0]);
        mat3.transpose(pan_mat, pan_mat);
        this.p1 = transformPointByMatrix3(pan_mat, this.p1);
        this.p2 = transformPointByMatrix3(pan_mat, this.p2);
        this.p3 = transformPointByMatrix3(pan_mat, this.p3);
        this.p4 = transformPointByMatrix3(pan_mat, this.p4);
        this.updateCenter();
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }

}