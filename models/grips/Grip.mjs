import { BasicMagnet } from "../BasicMagnet.mjs";

export class Grip extends BasicMagnet{
    constructor(aspectRatio, tolerance, center, width, color) {
        this.aspectRatio = aspectRatio;
        this.tolerance = tolerance;

        this.center = { ...center };
        this.width = width;
        this.height = width;
        this.color = color;
    }

    getVertices() {
        return new Float32Array([
            this.center.x-this.width/2, this.center.y+this.height/2,
            this.center.x + this.width/2, this.center.y+this.height/2,
            this.center.x + this.width/2, this.center.y - this.height/2,
            this.center.x - this.width/2, this.center.y - this.height/2,
        ]);

    }



}