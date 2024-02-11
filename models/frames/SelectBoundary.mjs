export class SelectBoundary{
    
    get p1() {
        return this._p1;
    }
    set p1(point) {
        this._p1 = { ...point };
    }
    get p2() {
        return this._p2;
    }
    set p2(point) {
        this._p2 = { ...point };
    }
    get p3() {
        return this._p3;
    }
    set p3(point) {
        this._p3 = { ...point };
    }
    get p4() {
        return this._p4;
    }
    set p4(point) {
        this._p4 = { ...point };
    }

    
    constructor(aspectRatio,p1, p2, p3, p4) {
        this.type = 'selectBoundary';
        this.aspectRatio = aspectRatio;
        this._p1 = p1;
        this._p2 = p2;
        this._p3 = p3;
        this._p4 = p4;
        this.color = [0.75,0.75,0.75,1];
    }

    getVertices() {
        return new Float32Array([
            this.p1.x, this.p1.y,
            this.p2.x, this.p2.y,
            this.p3.x, this.p3.y,
            this.p4.x, this.p4.y
        ])
    }
    getVerticesArray() {
        return [
            this.p1.x, this.p1.y,
            this.p2.x, this.p2.y,
            this.p3.x, this.p3.y,
            this.p4.x, this.p4.y
        ];
    }
}