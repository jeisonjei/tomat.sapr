import { Grip } from "./snaps/Grip.mjs";
import { Point } from "./Point.mjs";
import { TripH } from "./snaps/TripH.mjs";
import { TripV } from "./snaps/TripV.mjs";

export class BasicShape {

    set id(id) {
        this._id = id;
    }
    get id() {
        return this._id;
    }

    constructor(aspectRatio) {
        this.aspectRatio = aspectRatio;

        this.move_mat = null;

        this.grip = new Grip(aspectRatio, new Point(0, 0), 0);
        this.tripH = new TripH(aspectRatio, new Point(0, 0));
        this.tripV = new TripV(aspectRatio, new Point(0,0));

    }
}