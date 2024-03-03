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

    // ---
    this.add = (otherPoint) => {
        return new Point(this.x+otherPoint.x,this.y+otherPoint.y);
    }
    this.subtract = (otherPoint) => {
        return new Point(this.x - otherPoint.x, this.y - otherPoint.y);
    }
    this.dot = (otherVector) =>{
        return this.x * otherVector.x + this.y * otherVector.y;
      }
}