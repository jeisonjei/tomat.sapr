import { Subject } from "rxjs";
import { Line } from "../../models/shapes/Line.mjs";
import { Rectangle } from "../../models/shapes/Rectangle.mjs";
import { Circle } from "../../models/shapes/Circle.mjs";
import { SymLine } from "../../models/shapes/SymLine.mjs";
import { AbstractFrame } from "../../models/frames/AbstractFrame.mjs";
import { Point } from "../../models/Point.mjs";
import { s } from "./settings.mjs";

const a = {

    shapes: [],
    activeShapes: [],
    shapes$: new Subject(),
    storedShapes$: new Subject(),
    storedText$: new Subject(),
    selected: false,

    isMouseDown: false,
    magnetPosition: null,
    anglePosition: null,

    clickMoveStart: null,
    clickCopyStart: null,
    clickRotateStart: null,
    clickMirrorStart: null,
    clickScaleStart1: null,
    clickScaleStart2: null,
    clickScaleBaseDistanceX: null,
    clickScaleBaseDistanceY: null,
    clickScaleBaseDistance: null,
    clickScaleShapeDistance: null,

    start: null,
    end: null,

    // shapes
    line: new Line(s.aspectRatio, new Point(0, 0), new Point(0, 0), [1, 0, 0, 1]),
    symline: new SymLine(s.aspectRatio, new Point(0, 0), new Point(0, 0), [1, 0, 0, 1]),
    circle: new Circle(s.aspectRatio, new Point(0, 0), 0, [1, 0, 0, 1]),
    rectangle: new Rectangle(s.aspectRatio, new Point(0, 0), new Point(0, 0), new Point(0, 0), new Point(0, 0), 0, 0, [1, 0, 0, 1]),
    selectFrame: new AbstractFrame(new Point(0, 0), null, [0, 1, 0, 1]),

    // zoom
    zl: null,
    zlc: 1,

    // pan
    pan: false,
    isPanning: false,
    pan_tx: null,
    pan_ty: null,
    pan_start_x: null,
    pan_start_y: null,
    pan_mat: null,

    // angle snap
    angle_snap: false,

    vertices: [],

    // ctrl
    ctrl: false,

    // ui settings
    isPrintAreaVisible: false,
    isStampVisible: true,
}

export {a}



