import { BasicMagnet } from "../BasicMagnet.mjs";
import { s } from '../../shared/globalState/settings.mjs';
import { convertVerticesToPoints } from "../../shared/common.mjs";
import { Point } from "../Point.mjs";

export class TripV extends BasicMagnet {
    set start(point) {
        this._start = { ...point };
    }
    get start() {
        return this._start;
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
        
        this.type = 'm_tripv';

        this.color = [0, 0, 1, 0.4];

    }

    getVertices() {

        if (this.mouse.y <= this.start.y) {
            return new Float32Array([
                this.start.x, this.start.y,
                this.start.x, this.start.y - s.tripLen
            ]);            
        }
        else {
            return new Float32Array([
                this.start.x, this.start.y,
                this.start.x, this.start.y + s.tripLen
            ]);            

        }
    }

    isin(point, mouse) {
        const minX = point.x - s.tolerance ;
        const maxX = point.x + s.tolerance ;
        const points = convertVerticesToPoints([
            minX, 1,
            maxX, 1,
            maxX, -1,
            minX, -1
        ]);
        const p1 = points[0];
        const p2 = points[1];
        return (mouse.x >= p1.x && mouse.x <= p2.x);

    }

}