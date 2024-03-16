import { resizeCanvasToDisplaySize } from "../common.mjs";
import {t} from '../globalState/t.js'

export class c {

    static get canvas() {
        return this._canvas;
    }
    static set canvas(v) {
        this._canvas = v;
    }


    static get context() {
        return this._textContext;
    }
    static set context(v) {
        this._textContext = v;
    }
    static get canvasWidth() {
        return this._canvasWidth;
    }

    static set canvasWidth(v) {
        this._canvasWidth = v;
    }

    static get canvasHeight() {
        return this._canvasHeight;
    }

    static set canvasHeight(v) {
        this._canvasHeight = v;
    }


    static init() {
        this.canvas = document.querySelector('canvas.text');

        resizeCanvasToDisplaySize(this.canvas);
        this.context = this.canvas.getContext('2d');

        this.context.font = `${t.fontSize}px ${t.fontName}`

    }
}