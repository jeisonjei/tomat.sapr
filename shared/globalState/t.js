import { Subject } from "rxjs"
import { Point } from "../../models/Point.mjs"

const t = {
    utext: [],
    utext$: new Subject(),
    textPosition: new Point(0, 0),

    translateX: 0,
    translateY: 0,
    scale: 1,

    mouseClick: false,

    isPanning: false,
    panStartPoint: new Point(0, 0),

    fontSize: 36,
    fontName: 'gost_type_a',

    offset: 6,

    editId: null,
    editBoundary: false, /**эта переменная нужна чтобы отключить магниты
                            если указатель наведён на текст в режиме text */
    currentLetterIndex: null,

}

export { t }