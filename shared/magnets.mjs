import { filter, from, map, switchMap, tap, of } from "rxjs";
import { canvasGetMouse } from "./common.mjs";

// --------- MAGNETS ---------
export function assignGripPositionAndGetGrip(shape, mouseEvent, canvas) {
    /**
     * Получаем фигуру, а возвращаем фигуру-ручку, которую нужно отрисовать
     */
    const mouse = canvasGetMouse(mouseEvent, canvas);
    switch (shape.type) {
        case 'line':
            if (shape.isMouseInGripAtStart(mouse)) {
                shape.grip.center = { ...shape.start };
                return { grip: shape.grip, position: {...shape.start} };
            }
            else if (shape.isMouseInGripAtMid(mouse)) {
                shape.grip.center = { ...shape.mid };
                return {grip: shape.grip, position: {...shape.mid}};
            }
            else if (shape.isMouseInGripAtEnd(mouse)) {
                shape.grip.center = { ...shape.end };
                return {grip: shape.grip, position: {...shape.end}};
            }
            else {
                return null;
            }

        default:
            break;

    }
}

export function assignProjectionEndPointAndGetProjection(shape, mouseEvent, canvas) {
    
}

export function getGrip$(shapes, mouse) {
    return from(shapes).pipe(
        filter(shape => (shape.isMouseInGripAtStart(mouse) || shape.isMouseInGripAtMid(mouse) || shape.isMouseInGripAtEnd(mouse))),
        switchMap(shape => {
            if (shape.isMouseInGripAtStart(mouse)) {
                shape.grip.center = shape.start;
            }
            else if (shape.isMouseInGripAtMid(mouse)) {
                shape.grip.center = shape.mid;
            }
            else if (shape.isMouseInGripAtEnd(mouse)) {
                shape.grip.center = shape.end;
            }
            return of(shape.grip);
        })
    )
}