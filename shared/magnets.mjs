import { filter, from, map, switchMap, tap, of, Subject } from "rxjs";
import { scan } from "rxjs";
import { canvasGetClientX, canvasGetClientY, canvasGetMouse } from "./common.mjs";
import { s } from './settings.mjs';
import { a } from '../main.js';
import { ms } from "../models/snaps/MagnetState.mjs";
import { Point } from "../models/Point.mjs";

// --------- MAGNETS ---------
export const magnetState$ = new Subject();


export function observeMagnet(shapes, mouse) {
    return from(shapes).pipe(
        filter(shape => (
            shape.isinGripStart(mouse) || shape.isinGripMid(mouse) || shape.isinGripEnd(mouse) ||
            shape.isinTripHstart(mouse) || shape.isinTripHend(mouse) ||
            shape.isinTripVstart(mouse) || shape.isinTripVend(mouse)
        )),
        scan((acc, shape) => {
            switch (true) {
                case shape.isinGripStart(mouse):
                    shape.grip.center = shape.start;
                    acc.push(shape.grip);
                    break;
                case shape.isinGripMid(mouse):
                    shape.grip.center = shape.mid;
                    acc.push(shape.grip);
                    break;
                case shape.isinGripEnd(mouse):
                    shape.grip.center = shape.end;
                    acc.push(shape.grip);
                    break;
                case shape.isinTripHstart(mouse):
                    shape.tripH.mouse = mouse;
                    shape.tripH.start = shape.start;
                    acc.push(shape.tripH);
                    break;
                case shape.isinTripHend(mouse):
                    shape.tripH.mouse = mouse;
                    shape.tripH.start = shape.end;
                    acc.push(shape.tripH);
                    break;
                case shape.isinTripVstart(mouse):
                    shape.tripV.mouse = mouse;
                    shape.tripV.start = shape.start;
                    acc.push(shape.tripV);
                    break;
                case shape.isinTripVend(mouse):
                    shape.tripV.mouse = mouse;
                    shape.tripV.start = shape.end;
                    acc.push(shape.tripV);
                    break;
                default:
                    break;
            }
            return acc;
        }, []),
        tap(acc => {
            acc.push({'mouse':mouse});
            magnetState$.next(acc);
        }),
    )
}


export function getExtensionCoordDraw(mouse, trip, start, end) {

    let angle = Math.atan2(end.y - start.y, end.x - start.x);

    if (trip.type === 'm_triph') {
        if (Math.abs(start.y - trip.start.y) <= s.tolerance) {
         return   new Point(mouse.x, trip.start.y);
        }
        let dy = trip.start.y - start.y;
        let dx = dy / Math.tan(angle);
        return new Point(start.x + dx,trip.start.y);

    }
    else if (trip.type === 'm_tripv') {
        if (Math.abs(start.x - trip.start.x) <= s.tolerance) {
            return new Point(trip.start.x, mouse.y);
        }
        let dx = trip.start.x - start.x;
        let dy = dx * Math.tan(angle);
        return new Point(trip.start.x, start.y + dy);

    }
}

function getExtensionCoordEdit(mouseEvent, canvas, tripPoint, snapMode) {

    const mouse = canvasGetMouse(mouseEvent, canvas);
    const x = canvasGetClientX(mouseEvent, canvas);
    const y = canvasGetClientY(mouseEvent, canvas);


    if (a.editStartY === tripPoint.x && a.editStartY === tripPoint.y) {
        if (snapMode === 'h') {
            return canvasGetClientX(mouseEvent, canvas);
        } else if (snapMode === 'v') {
            return canvasGetClientY(mouseEvent, canvas);
        }
    }

    if (a.ANGLE_SNAP) {
        if (snapMode === 'h') {
            let clientX = a.endX;
            let clientY = a.endY;
            let dx = clientX - a.editStartY;
            let dy = clientY - a.editStartY;
            let angle = Math.atan2(dy, dx);
            let ddy = projectionY - a.editStartY;
            let ddx = ddy / Math.tan(angle);
            extensionX = a.editStartY + ddx;
            return extensionX;
        } else if (snapMode === 'v') {
            let clientX = a.endX;
            let clientY = a.endY;
            let dx = clientX - a.editStartY;
            let dy = clientY - a.editStartY;
            let angle = Math.atan2(dy, dx);
            let ddx = projectionX - a.editStartY;
            let ddy = ddx * Math.tan(angle);
            extensionY = a.editStartY + ddy;
            return extensionY;
        }
    } else {
        if (snapMode === 'h') {
            let clientX = mouse.x;
            let clientY = mouse.y;
            let dx = clientX - a.editStartY;
            let dy = clientY - a.editStartY;
            let angle = Math.atan2(dy, dx);
            let ddy = projectionY - a.editStartY;
            let ddx = ddy / Math.tan(angle);
            extensionX = a.editStartY + ddx;
            return extensionX;
        } else if (snapMode === 'v') {
            let clientX = mouse.x;
            let clientY = mouse.y;
            let dx = clientX - a.editStartY;
            let dy = clientY - a.editStartY;
            let angle = Math.atan2(dy, dx);
            let ddx = projectionX - a.editStartY;
            let ddy = ddx * Math.tan(angle);
            extensionY = a.editStartY + ddy;
            return extensionY;
        }
    }
}