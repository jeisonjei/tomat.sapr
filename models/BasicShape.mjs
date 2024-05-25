import { Grip } from "./snaps/Grip.mjs";
import { Point } from "./Point.mjs";
import { TripH } from "./snaps/TripH.mjs";
import { TripV } from "./snaps/TripV.mjs";
import { SelectBoundary } from "./frames/SelectBoundary.mjs";
// --- other libraries --------------------------------
import { v4 as uuidv4 } from "uuid";


export class BasicShape {

    set id(id) {
        this._id = id;
    }
    get id() {
        return this._id;
    }

    constructor(aspectRatio) {
        this.aspectRatio = aspectRatio;
        this.isSelected = false;
        this.isinArea = true; // is in active area (a.activeShapes)
        this.edit = null;

        this.move_mat = null;

        this.grip = new Grip(aspectRatio, new Point(0, 0), 0);
        this.tripH = new TripH(aspectRatio, new Point(0, 0));
        this.tripV = new TripV(aspectRatio, new Point(0,0));
        this.selectBoundary = new SelectBoundary(aspectRatio, new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0));
        
        this.id = uuidv4();

    }

    getObject() {
        let json = JSON.stringify(this);
        let result = JSON.parse(json);
        result.id = this.id;
        return result;
    }

}