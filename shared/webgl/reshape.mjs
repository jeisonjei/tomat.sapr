export function construct(params) {

}

export function deconstruct(vertices, shapes) {

}

export function getNewVertices(shapes) {
    let result = [];
    for (const shape of shapes.filter(shape=>shape.type!=='text')) {
        const vertices = shape.getVerticesArray();
        for (const v of vertices) {
            result.push(v);
        }
    }
    return result;
}

export function pushVertices(shape, avertices) {
    const vertices = shape.getVerticesArray();
    for (const v of vertices) {
        avertices.push(v);
    }
    return avertices;
}

export function replaceVertices(shape, vertices) {
    const id = shape.id;
    const newVertices = shape.getVerticesArray();

    const startIndex = id * 4;

    for (let i = 0; i < 4; i++) {
        vertices[startIndex + i] = newVertices[i];
    }
    return vertices;
}

function findIndexWithTolerance(number, array, tolerance) {
    for (let i = 0; i < array.length; i++) {
        const diff = Math.abs(array[i] - number);
        if (diff <= tolerance) {
            return i;
        }
    }
    return -1; // Return -1 if the number is not found within the tolerance
}
