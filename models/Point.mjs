export function Point(x, y) {
    this.x = x;
    this.y = y;

    // ---
    this.dot = (otherVector) => {
        return this.x * otherVector.x + this.y * otherVector.y;
    }
}

