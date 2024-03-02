import { BasicMagnet } from "../BasicMagnet.mjs";
import { s } from "../../shared/settings.mjs";

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
        this.width = s.tolerance;
        this.height = s.tolerance;

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

    isin(point, mouse) {
        const minX = point.x - s.tolerance ;
        const maxX = point.x + s.tolerance ;
        const minY = point.y - s.tolerance;
        const maxY = point.y + s.tolerance;

        return (mouse.x >= minX && mouse.x <= maxX && mouse.y >= minY && mouse.y <= maxY);
    }



}