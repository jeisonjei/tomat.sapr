import { BasicMagnet } from "../BasicMagnet.mjs";
import {s} from '../../shared/globalState/settings.mjs';
import { convertVerticesToPoints } from "../../shared/common.mjs";
import { Point } from "../Point.mjs";

export class TripH extends BasicMagnet{
    get start() {
        return this._start;
    }
    set start(point) {
        this._start = {...point};
    }

    get mouse() {
        return this._mouse;
    }
    set mouse(point) {
        this._mouse = {...point};
    }


    
    constructor(aspectRatio, start) {
        super(aspectRatio)
        this._start = start;
        this._mouse = null;

        this.type = 'm_triph';

        this.color = [0, 0, 1, 0.4];

    }

    getVertices() {
        if (this.mouse.x <= this.start.x) {
            return new Float32Array([
                this.start.x, this.start.y,
                this.start.x - s.tripLen, this.start.y
            ]);            
        }
        else {
            return new Float32Array([
                this.start.x, this.start.y,
                this.start.x + s.tripLen, this.start.y
            ]);            
        }
    }

    isin(point, mouse) {
        const minY = point.y - s.tolerance;
        const maxY = point.y + s.tolerance;
        const points = convertVerticesToPoints([
            -1, maxY,
            1, maxY,
            1, minY,
            -1, minY
        ]);
        const p2 = points[1];
        const p3 = points[2];

        return (mouse.y >= p3.y && mouse.y <= p2.y);
    }

}