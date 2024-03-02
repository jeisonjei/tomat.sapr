export class s{
    static tolerance = 20;
    static tripLen = 200;
    static aspectRatio = 1;
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