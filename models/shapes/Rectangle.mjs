import { BasicShape } from "../BasicShape.mjs";
import { getMid } from "../../shared/common.mjs";

export class Rectangle extends BasicShape {
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
        this.isSelected = false;
        this._p1 = p1;
        this._p2 = p2;
        this._p3 = p3;
        this._p4 = p4;
        this.width = width;
        this.height = height;
        this.color = [...color];

        this.updateMid();
    }

    updateMid() {
        this.m1 = getMid(this.p1, this.p2);
        this.m2 = getMid(this.p2, this.p3);
        this.m3 = getMid(this.p3, this.p4);
        this.m4 = getMid(this.p4, this.p1);
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
            isPointInsideFrame(frame, this.p1) &&
            isPointInsideFrame(frame, this.p2) &&
            isPointInsideFrame(frame, this.p3) &&
            isPointInsideFrame(frame, this.p4)
        ) {
            return true;
        }

        return false;
    }

    // --------- MAGNETS ---------
    isinGripP1 = (mouse) => this.grip.isin(this.p1, mouse);
    isinGripP2 = (mouse) => this.grip.isin(this.p2, mouse);
    isinGripP3 = (mouse) => this.grip.isin(this.p3, mouse);
    isinGripP4 = (mouse) => this.grip.isin(this.p4, mouse);
    isinTripTop = (mouse) => this.tripH.isin(this.m1, mouse);
    isinTripBottom = (mouse) => this.tripH.isin(this.m3, mouse);
    isinTripLeft = (mouse) => this.tripV.isin(this.m4, mouse);
    isinTripRight = (mouse) => this.tripV.isin(this.m2, mouse);
    // --------- MAGNETS ---------

    zoom(zl) {
        const zoom_mat = mat3.fromScaling(mat3.create(), [zl, zl, 1]);
        this.p1 = transformPointByMatrix3(zoom_mat, this.p1);
        this.p2 = transformPointByMatrix3(zoom_mat, this.p2);
        this.p3 = transformPointByMatrix3(zoom_mat, this.p3);
        this.p4 = transformPointByMatrix3(zoom_mat, this.p4);
    }

    pan(tx, ty) {
        const pan_mat = mat3.fromTranslation(mat3.create(), [tx, ty, 0]);
        mat3.transpose(pan_mat, pan_mat);
        this.p1 = transformPointByMatrix3(pan_mat, this.p1);
        this.p2 = transformPointByMatrix3(pan_mat, this.p2);
        this.p3 = transformPointByMatrix3(pan_mat, this.p3);
        this.p4 = transformPointByMatrix3(pan_mat, this.p4);
    }


}