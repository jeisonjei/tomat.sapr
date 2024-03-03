import { canvasGetWebglCoordinates, convertPixelToWebGLCoordinate, getAngleDegrees, getAngleRadians } from "./common.mjs";
import { mat3 } from "gl-matrix";
import { s } from './settings.mjs';

export function getRotateSnap(angle_rad) {
    const angleDeg = Math.round(getAngleDegrees(angle_rad));
    const angle30Deg = Math.round((angleDeg / 30)) * 30;
    const angle45Deg = Math.round((angleDeg / 45)) * 45;
    const angle90Deg = Math.round((angleDeg / 90)) * 90;
    const angle30Rad = getAngleRadians(angle30Deg);
    const angle45Rad = getAngleRadians(angle45Deg);
    const angle90Rad = getAngleRadians(angle90Deg);
    let snappedAngleRad;

    if (Math.abs(angleDeg - angle30Deg) <= Math.abs(angleDeg - angle45Deg) && Math.abs(angleDeg - angle30Deg) <= Math.abs(angleDeg - angle90Deg)) {
        snappedAngleRad = angle30Rad;
    } else if (Math.abs(angleDeg - angle45Deg) <= Math.abs(angleDeg - angle90Deg)) {
        snappedAngleRad = angle45Rad;
    } else {
        snappedAngleRad = angle90Rad;
    }
    return snappedAngleRad;
}

export function getMoveMatrix(p1, p2) {
    // матрицы продолжают быть в webgl
    const point1 = canvasGetWebglCoordinates(p1, s.webglContext.canvas);
    const point2 = canvasGetWebglCoordinates(p2, s.webglContext.canvas);
    const tx = point2.x - point1.x;
    const ty = point2.y - point1.y;

    const move_mat = mat3.fromTranslation(mat3.create(), [tx, ty, 1]);
    mat3.transpose(move_mat, move_mat);
    return move_mat;
}

export function getRotateMatrix(c, m) {
    // матрицы продолжают быть в webgl
    const center = canvasGetWebglCoordinates(c, s.webglContext.canvas);
    const mouse = canvasGetWebglCoordinates(m, s.webglContext.canvas);

    const mouse_dx = mouse.x - center.x;
    const mouse_dy = mouse.y - center.y;
    const mouse_angle_rad = Math.atan2(mouse_dy, mouse_dx);

    const angle = getRotateSnap(mouse_angle_rad);

    const translate_before_matrix = mat3.fromTranslation(mat3.create(), [-center.x, -center.y, 0]);
    mat3.transpose(translate_before_matrix, translate_before_matrix);
    const aspect_before_matrix = mat3.fromScaling(mat3.create(), [1 / s.aspectRatio, 1, 1]);
    const rotate_matrix = mat3.fromRotation(mat3.create(), -angle, [0, 0, 1]);
    const aspect_after_matrix = mat3.invert(mat3.create(), aspect_before_matrix);
    const translate_after_matrix = mat3.invert(mat3.create(), translate_before_matrix);

    let cum_matrix = mat3.create();

    mat3.multiply(cum_matrix, cum_matrix, translate_before_matrix);
    mat3.multiply(cum_matrix, cum_matrix, aspect_before_matrix);
    mat3.multiply(cum_matrix, cum_matrix, rotate_matrix);
    mat3.multiply(cum_matrix, cum_matrix, aspect_after_matrix);
    mat3.multiply(cum_matrix, cum_matrix, translate_after_matrix);
    return cum_matrix;
}

export function getMirrorMatrix(c, m) {
    // матрицы продолжают быть в webgl
    const center = canvasGetWebglCoordinates(c, s.webglContext.canvas);
    const mouse = canvasGetWebglCoordinates(m, s.webglContext.canvas);

    const mouse_dx = mouse.x - center.x;
    const mouse_dy = mouse.y - center.y;
    const mouse_angle_rad = Math.atan2(mouse_dy, mouse_dx);

    const angle = getRotateSnap(mouse_angle_rad);

    const translate_before_matrix = mat3.fromTranslation(mat3.create(), [-center.x, -center.y, 0]);
    mat3.transpose(translate_before_matrix, translate_before_matrix);
    const aspect_before_matrix = mat3.fromScaling(mat3.create(), [1 / s.aspectRatio, 1, 1]);
    const rotate_matrix = mat3.fromRotation(mat3.create(), -angle, [0, 0, 1]);
    const aspect_after_matrix = mat3.invert(mat3.create(), aspect_before_matrix);
    const translate_after_matrix = mat3.invert(mat3.create(), translate_before_matrix);

    const mirror_matrix = mat3.fromValues(
        -1, 0, 0,
        0, 1, 0,
        0, 0, 1,
    );
    let cum_matrix = mat3.create();

    mat3.multiply(cum_matrix, cum_matrix, translate_before_matrix);
    mat3.multiply(cum_matrix, cum_matrix, aspect_before_matrix);
    mat3.multiply(cum_matrix, cum_matrix, rotate_matrix);
    mat3.multiply(cum_matrix, cum_matrix, mirror_matrix); // Add the mirror matrix here
    mat3.multiply(cum_matrix, cum_matrix, aspect_after_matrix);
    mat3.multiply(cum_matrix, cum_matrix, translate_after_matrix);
    return cum_matrix;
}

export function getScaleMatrix(centerPixels, distX,distY, baseDistancePixels, shapeDistancePixels) {
    const center = canvasGetWebglCoordinates(centerPixels, s.webglContext.canvas);

    const ratio = baseDistancePixels / shapeDistancePixels;

    const currentDistancePixels = Math.hypot(distX, distY);

    const z = currentDistancePixels / ratio / shapeDistancePixels;
    
    const translate_before_matrix = mat3.fromTranslation(mat3.create(), [-center.x, -center.y, 0]);
    mat3.transpose(translate_before_matrix, translate_before_matrix);
    const aspect_before_matrix = mat3.fromScaling(mat3.create(), [1/s.aspectRatio, 1, 1]);
    const scale_mat = mat3.fromScaling(mat3.create(), [z, z, 1]);
    const aspect_after_matrix = mat3.invert(mat3.create(), aspect_before_matrix);
    const translate_after_matrix = mat3.invert(mat3.create(), translate_before_matrix);

    let cum_matrix = mat3.create();

    mat3.multiply(cum_matrix, cum_matrix, translate_before_matrix);
    mat3.multiply(cum_matrix, cum_matrix, aspect_before_matrix);
    mat3.multiply(cum_matrix, cum_matrix, scale_mat);
    mat3.multiply(cum_matrix, cum_matrix, aspect_after_matrix);
    mat3.multiply(cum_matrix, cum_matrix, translate_after_matrix);
    return cum_matrix;

}