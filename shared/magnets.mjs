import { filter, from, tap, ReplaySubject } from "rxjs";
import { scan, map } from "rxjs";
import { checkFunction } from "./common.mjs";
import { s } from './globalState/settings.mjs';
import { a } from "./globalState/a.js";
import { Point } from "../models/Point.mjs";
import { getRotateSnap } from "./transform.mjs";

import { drawSingle, drawShapes, updateActiveShapes, updateShapesPanZoom, addShapes } from "./render/shapes.js";

// --------- MAGNETS ---------
export const magnetState$ = new ReplaySubject();


export function observeMagnet(shapes, mouse) {
    return from(shapes).pipe(
        filter(shape => (
            checkFunction(shape, 'isinGripStart', mouse) ||
            checkFunction(shape, 'isinGripMid', mouse) ||
            checkFunction(shape, 'isinGripEnd', mouse) ||
            checkFunction(shape, 'isinTripHstart', mouse) ||
            checkFunction(shape, 'isinTripHend', mouse) ||
            checkFunction(shape, 'isinTripVstart', mouse) ||
            checkFunction(shape, 'isinTripVend', mouse) ||
            checkFunction(shape, 'isinGripP1', mouse) ||
            checkFunction(shape, 'isinGripP2', mouse) ||
            checkFunction(shape, 'isinGripP3', mouse) ||
            checkFunction(shape, 'isinGripP4', mouse) ||
            checkFunction(shape, 'isinGripM1', mouse) ||
            checkFunction(shape, 'isinGripM2', mouse) ||
            checkFunction(shape, 'isinGripM3', mouse) ||
            checkFunction(shape, 'isinGripM4', mouse) ||
            checkFunction(shape, 'isinTripHtop', mouse) ||
            checkFunction(shape, 'isinTripHbottom', mouse) ||
            checkFunction(shape, 'isinTripVleft', mouse) ||
            checkFunction(shape, 'isinTripVright', mouse) ||
            checkFunction(shape, 'isinGripCenter', mouse) ||
            checkFunction(shape, 'isinGripQ1', mouse) ||
            checkFunction(shape, 'isinGripQ2', mouse) ||
            checkFunction(shape, 'isinGripQ3', mouse) ||
            checkFunction(shape, 'isinGripQ4', mouse) ||
            checkFunction(shape, 'isinTripHcenter', mouse) ||
            checkFunction(shape, 'isinTripVcenter', mouse) ||
            checkFunction(shape, 'isinTripHq1', mouse) ||
            checkFunction(shape, 'isinTripHq3', mouse) ||
            checkFunction(shape, 'isinTripVq4', mouse) ||
            checkFunction(shape, 'isinTripVq2', mouse) ||
            checkFunction(shape, 'isinTripHmid', mouse) ||
            checkFunction(shape, 'isinTripVMtop', mouse) ||
            checkFunction(shape, 'isinTripVMbottom', mouse) ||
            checkFunction(shape, 'isinTripHMright', mouse) ||
            checkFunction(shape, 'isinTripHMleft', mouse) ||
            checkFunction(shape, 'isinTripVmid', mouse)
        )),
        scan((acc, shape) => {
            switch (shape.type) {
                case 'line':
                    switch (true) {
                        case shape.isinGripStart(mouse):
                            shape.grip.center = shape.start;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripMid(mouse):
                            shape.grip.center = shape.mid;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripEnd(mouse):
                            shape.grip.center = shape.end;
                            acc.push(shape.grip);
                            return acc;
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
                        case shape.isinTripHmid(mouse):
                            shape.tripH.mouse = mouse;
                            shape.tripH.start = shape.mid;
                            acc.push(shape.tripH);
                            break;
                        case shape.isinTripVmid(mouse):
                            shape.tripV.mouse = mouse;
                            shape.tripV.start = shape.mid;
                            acc.push(shape.tripV);
                            break;
                        default:
                            break;

                    }
                    break;
                case 'rectangle':
                    switch (true) {
                        case shape.isinGripP1(mouse):
                            shape.grip.center = shape.p1;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripP2(mouse):
                            shape.grip.center = shape.p2;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripP3(mouse):
                            shape.grip.center = shape.p3;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripP4(mouse):
                            shape.grip.center = shape.p4;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripM1(mouse):
                            shape.grip.center = shape.m1;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripM2(mouse):
                            shape.grip.center = shape.m2;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripM3(mouse):
                            shape.grip.center = shape.m3;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripM4(mouse):
                            shape.grip.center = shape.m4;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripCenter(mouse):
                            shape.grip.center = shape.center;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinTripHtop(mouse):
                            shape.tripH.mouse = mouse;
                            shape.tripH.start = shape.m1;
                            acc.push(shape.tripH);
                            break;
                        case shape.isinTripHbottom(mouse):
                            shape.tripH.mouse = mouse;
                            shape.tripH.start = shape.m3;
                            acc.push(shape.tripH);

                            break;
                        case shape.isinTripVleft(mouse):
                            shape.tripV.mouse = mouse;
                            shape.tripV.start = shape.m4;
                            acc.push(shape.tripV);
                            break;
                        case shape.isinTripVright(mouse):
                            shape.tripV.mouse = mouse;
                            shape.tripV.start = shape.m2;
                            acc.push(shape.tripV);
                            break;
                        case shape.isinTripVMtop(mouse):
                            shape.tripV.mouse = mouse;
                            shape.tripV.start = shape.m1;
                            acc.push(shape.tripV);
                            break;
                        case shape.isinTripVMbottom(mouse):
                            shape.tripV.mouse = mouse;
                            shape.tripV.start = shape.m3;
                            acc.push(shape.tripV);
                            break;
                        case shape.isinTripHMleft(mouse):
                            shape.tripH.mouse = mouse;
                            shape.tripH.start = shape.m2;
                            acc.push(shape.tripH);
                            break;
                        case shape.isinTripHMright(mouse):
                            shape.tripH.mouse = mouse;
                            shape.tripH.start = shape.m4;
                            acc.push(shape.tripH);
                            break;
                        
                        default:
                            break;
                    }
                    break;

                case 'circle':
                    switch (true) {
                        case shape.isinGripCenter(mouse):
                            shape.grip.center = shape.center;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripQ1(mouse):
                            shape.grip.center = shape.quad1;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripQ2(mouse):
                            shape.grip.center = shape.quad2;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripQ3(mouse):
                            shape.grip.center = shape.quad3;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinGripQ4(mouse):
                            shape.grip.center = shape.quad4;
                            acc.push(shape.grip);
                            return acc;
                        case shape.isinTripHcenter(mouse):
                            shape.tripH.mouse = mouse;
                            shape.tripH.start = shape.center;
                            acc.push(shape.tripH);
                            break;
                        case shape.isinTripVcenter(mouse):
                            shape.tripV.mouse = mouse;
                            shape.tripV.start = shape.center;
                            acc.push(shape.tripV);
                            break;
                        case shape.isinTripHq1(mouse):
                            shape.tripH.mouse = mouse;
                            shape.tripH.start = shape.quad1;
                            acc.push(shape.tripH);
                            break;

                        case shape.isinTripHq3(mouse):
                            shape.tripH.mouse = mouse;
                            shape.tripH.start = shape.quad3;
                            acc.push(shape.tripH);
                            break;
                        case shape.isinTripVq4(mouse):
                            shape.tripV.mouse = mouse;
                            shape.tripV.start = shape.quad4;
                            acc.push(shape.tripV);
                            break;
                        case shape.isinTripVq2(mouse):
                            shape.tripV.mouse = mouse;
                            shape.tripV.start = shape.quad2;
                            acc.push(shape.tripV);
                            break;
                        default:
                            break;
                    }
                    break;
                case 'text':
                    switch (true) {
                        case shape.isinGripStart(mouse):
                            shape.grip.center = shape.start;
                            shape.grip.center.x = shape.grip.center.x - s.textOffset;
                            shape.grip.center.y = shape.grip.center.y + s.textOffset;
                            acc.push(shape.grip);
                            return acc;

                        case shape.isinTripHstart(mouse):
                            shape.tripH.mouse = mouse;
                            shape.tripH.start = shape.start;
                            shape.tripH.start.x = shape.tripH.start.x - s.textOffset;
                            shape.tripH.start.y = shape.tripH.start.y + s.textOffset;
                            acc.push(shape.tripH);
                            break;
                        case shape.isinTripVstart(mouse):
                            shape.tripV.mouse = mouse;
                            shape.tripV.start = shape.start;
                            shape.tripV.start.x = shape.tripV.start.x - s.textOffset;
                            shape.tripV.start.y = shape.tripV.start.y + s.textOffset;
                            acc.push(shape.tripV);
                            break;
                        default:
                            break;
                    }
                    break;
            }
            return acc;
        }, []),
        tap(acc => {
            magnetState$.next([...acc, { 'mouse': mouse }]);
        }),
    )
}


export function getExtensionCoordDraw(magnet, start, mouse) {
    let angle = null;
    if (a.angle_snap) {
        if (!a.anglePosition) {
            return;
        }
        angle = Math.atan2(a.anglePosition.y - start.y, a.anglePosition.x - start.x);
    }
    else {
        angle = Math.atan2(mouse.y - start.y, mouse.x - start.x);
    }

    if (magnet instanceof Array) {
        return new Point(magnet[1].start.x, magnet[0].start.y);
    }

    if (magnet.type === 'm_triph') {
        if (Math.abs(start.y - magnet.start.y) <= s.tolerance) {
            return new Point(mouse.x, magnet.start.y);
        }
        let dy = magnet.start.y - start.y;
        let dx = dy / Math.tan(angle);
        return new Point(start.x + dx, magnet.start.y);

    }
    else if (magnet.type === 'm_tripv') {
        if (Math.abs(start.x - magnet.start.x) <= s.tolerance) {
            return new Point(magnet.start.x, mouse.y);
        }
        let dx = magnet.start.x - start.x;
        let dy = dx * Math.tan(angle);
        return new Point(magnet.start.x, start.y + dy);
    }
}

export function getAnglePosition(mouse, start) {
    if (!start) {
        return;
    }
    const dx = (mouse.x - start.x) ;
    const dy = mouse.y - start.y;
    const angle = -Math.atan2(dy, dx);
    const distance = Math.hypot(dx, dy);
    const snappedAngleRad = getRotateSnap(angle);
    const snappedDistance = distance / Math.cos(angle - snappedAngleRad);
    const snappedDx = snappedDistance * Math.cos(snappedAngleRad) ;
    const snappedDy = snappedDistance * Math.sin(snappedAngleRad);
    return new Point(start.x + snappedDx, start.y - snappedDy);
}



magnetState$.pipe(
    /**
     * Функция получает начальную или конечную привязку.
     * Переменная a.gripPosition назначается только здесь
     */
    map(state => {
        const mouse = state.find(object => object.hasOwnProperty('mouse')).mouse;
        const grips = state.filter(magnet => magnet.type === 'm_grip');
        if (grips.length > 0) {
            return { mouse, magnet: grips[0] };
        }

        // If grips.length <= 0, return tripsH or tripsV if available
        const tripsH = state.filter(magnet => magnet.type === 'm_triph');
        const tripsV = state.filter(magnet => magnet.type === 'm_tripv');

        if (tripsH.length > 0 && tripsV.length > 0) {
            return { mouse, magnet: [tripsH[0], tripsV[0]] };
        }
        else if (tripsH.length > 0) {
            return { mouse, magnet: tripsH[0] };
        }
        else if (tripsV.length > 0) {
            return { mouse, magnet: tripsV[0] };
        }

        // If no valid magnets found, return null or handle as needed
        return null;
    })
)
    .subscribe(magnet => {
        if (magnet && a.start) {
            if (magnet.magnet instanceof Array) {
                a.magnetPosition = getExtensionCoordDraw(magnet.magnet, a.start, magnet.mouse);
                magnet.magnet.forEach(magnet => drawSingle(magnet));
            }
            else {

                a.magnetPosition = magnet.magnet.center ?? getExtensionCoordDraw(magnet.magnet, a.start, magnet.mouse);

                drawSingle(magnet.magnet);

            }
        }
    });
