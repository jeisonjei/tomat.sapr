export class s{
    static tolerance = 0.02;
    static tripLen = 10;
    static aspectRatio = 1;
    static setAspectRatio(width,height) {
        this.aspectRatio = height / width;
    }
}