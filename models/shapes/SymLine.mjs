import { BasicShape } from "../BasicShape.mjs";
import { Point } from "../Point.mjs";

export class SymLine extends BasicShape {

    get start() {
        return this._start;
    }
    set start(point) {
        this._start = {...point};
        this.symend = this.getSymend(this.start, this.end);
    }
    get end() {
        return this._end;
    }
    set end(point) {
        this._end = {...point};
        this.symend = this.getSymend(this.start, this.end);
    }


    constructor(aspectRatio, start, end, color) {
        super(aspectRatio);
        this.type = 'symline';
        this._start = start;
        this._end = end;
        this.mid = this.getMid(start, end);
        this.color = [...color];


        this.symend = this.getSymend(start,end);


    }
    getMid(start, end) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        return new Point(midX, midY);
    }
    getSymend(start, end) {
        const dx = start.x - end.x;
        const dy = start.y - end.y;
        return new Point(start.x + dx, start.y + dy)        ;
    }

    getVertices() {
        return new Float32Array([
            this.end.x, this.end.y,
            this.symend.x, this.symend.y
        ]);
    }




}
