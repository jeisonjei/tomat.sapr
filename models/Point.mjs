export function Point(x, y) {
    this.x = x;
    this.y = y;
    this.isEqual = (point)=>{
        if (this.x===point.x && this.y === point.y) {
            return true;
        }
        else {
            return false;
        }

    }
}