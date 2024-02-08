import { Grip } from "./snaps/Grip.mjs";
import { Point } from "./Point.mjs";

export class BasicShape {
    constructor(aspectRatio) {
        this.aspectRatio = aspectRatio;

        this.tolerance = 0.02;

        this.move_mat = null;

        this.grip = new Grip(aspectRatio, this.tolerance, new Point(0, 0), 0);

    }
}