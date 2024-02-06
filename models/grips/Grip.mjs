import { BasicMagnet } from "../BasicMagnet.mjs";

export class Grip extends BasicMagnet {

    get center() {
        return this._center;
    }
    set center(point) {
        this._center = { ...point };
    }

    constructor(aspectRatio, center) {
        super(aspectRatio);

        this._center = { ...center };
        this.width = this.tolerance * this.aspectRatio;
        this.height = this.tolerance;

        this.type = 'm_grip';

        this.color = [0, 1, 0, 1];
    }

    getVertices() {
        return new Float32Array([
            this.center.x - this.width / 2, this.center.y + this.height / 2,
            this.center.x + this.width / 2, this.center.y + this.height / 2,
            this.center.x + this.width / 2, this.center.y - this.height / 2,
            this.center.x - this.width / 2, this.center.y - this.height / 2,
        ]);

    }



}