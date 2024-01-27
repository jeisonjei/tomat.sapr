import { BasicShape } from "../BasicShape.mjs";

export class Line extends BasicShape{
    constructor(gl, program, aspectRatio, start, end, color) {
        super(gl, program, aspectRatio);
        this.type = 'line';
        this.isSelected = false;
        this.start = {...start};
        this.end = {...end};
        this.color = [...color];
    }

    getVertices() {
        return new Float32Array([
            this.start.x, this.start.y,
            this.end.x, this.end.y
        ]);
    }

    getClone() {
        const line = new Line(this.gl, this.program, this.aspectRatio, this.start, this.end, this.color);
        return line;
    }
}