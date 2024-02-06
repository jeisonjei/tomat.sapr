import { getAngleDegrees, getAngleRadians } from "./common.mjs";

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

export function getMoveMatrix(point1, point2) {
    const tx = point2.x - point1.x;
    const ty = point2.y - point1.y;

    const move_mat = mat3.fromTranslation(mat3.create(), [tx, ty, 1]);
    mat3.transpose(move_mat, move_mat);
    return move_mat;
}