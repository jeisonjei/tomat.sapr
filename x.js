import { mat3 } from "gl-matrix";
function convertMatrixToPixelCoordinates(matrix, canvasWidth, canvasHeight) {
    // Calculate the scaling factors for x and y axes
    const scaleX = canvasWidth / 2;
    const scaleY = canvasHeight / 2;

    // Create a translation matrix to align with pixel coordinates
    const translationMatrix = mat3.fromValues(
        1, 0, 0,
        0, -1, 0,
        0, 0, 1
    );

    // Scale the transformation matrix to pixel coordinates
    const scaledMatrix = mat3.scale(mat3.create(), matrix, [scaleX, scaleY, 1]);

    // Apply translation to align with pixel coordinates
    const pixelMatrix = mat3.multiply(mat3.create(), translationMatrix, scaledMatrix);

    return pixelMatrix;
}

// Example usage
const matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]; // Example transformation matrix
const canvasWidth = 800; // Width of the canvas in pixels
const canvasHeight = 600; // Height of the canvas in pixels

const pixelMatrix = convertMatrixToPixelCoordinates(matrix, canvasWidth, canvasHeight);

console.log(pixelMatrix)