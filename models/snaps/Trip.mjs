import { BasicMagnet } from "../BasicMagnet.mjs";

export class Trip extends BasicMagnet{
    set start(point) {
        this._start = {...point};
    }
    get start() {
        return this._start;
    }
    
    constructor(aspectRatio, start) {
        super(aspectRatio)
        this._start = start;
    }
}