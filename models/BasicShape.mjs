export class BasicShape{
    constructor(gl, program, aspectRatio) {
        this.gl = gl;
        this.program = program;
        this.aspectRatio = aspectRatio;

        this.selectionZoneWidth = 0.02;
    }
}