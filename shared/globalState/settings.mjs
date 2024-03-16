export class s{
    static tolerance = 20;
    static tripLen = 2000;
    static aspectRatio = 1;
    static textOffset = 6;
    static canvasWidth = null;
    static canvasHeight = null;
    static webglContext = null;
    static textContext = null;
    static setAspectRatio(width,height) {
        this.aspectRatio = height / width;
    }
    static setCanvasSize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
    static setWebglContext(gl) {
        this.webglContext = gl;
    }
    static setTextContext(context) {
        this.textContext = context;
    }
}