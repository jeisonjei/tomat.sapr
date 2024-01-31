export function getMoveMatrix(point1, point2) {
    const tx = point2.x - point1.x;
    const ty = point2.y - point1.y;

    const move_mat = mat3.fromTranslation(mat3.create(), [tx, ty, 1]);
    mat3.transpose(move_mat, move_mat);
    return move_mat;
}