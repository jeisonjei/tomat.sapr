import { resizeCanvasToDisplaySize } from "../common.mjs";
import { getVertexshaderSource, getFragmentShaderSource } from "../webgl/shaders.mjs";
import { createProgram } from "../webgl/program.mjs";
import { mat3 } from "gl-matrix";

export class g{

    static get canvas() {
        return this._glCanvas;
    }

    static set canvas(v) {
        this._glCanvas = v;
    }

    static get context() {
        return this._webglContext;
    }
    static set context(v) {
        this._webglContext = v;
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


    static get u_color() {
        return this._u_color;
    }
    static set u_color(v) {
        this._u_color = v;
    }

    static get u_pan() {
        return this._u_pan;
    }
    static set u_pan(v) {
        this._u_pan = v;
    }

    static get u_move() {
        return this._u_move;
    }
    static set u_move(v) {
        this._u_move = v;
    }

    static get u_rotate() {
        return this._u_rotate;
    }
    static set u_rotate(v) {
        this._u_rotate = v;
    }

    static get u_scale() {
        return this._u_scale;
    }
    static set u_scale(v) {
        this._u_scale = v;
    }

    static get u_resolution() {
        return this._u_resolution;
    }
    static set u_resolution(v) {
        this._u_resolution = v;
    }

    static init() {
        this.canvas = document.querySelector('canvas.drawing');
        resizeCanvasToDisplaySize(this.canvas);
        this.context = this.canvas.getContext('webgl2');
        const program = createProgram(this.context, getVertexshaderSource(), getFragmentShaderSource());
        this.context.useProgram(program);
        this.context.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.context.enable(this.context.BLEND);
        this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);
    
        const vertex_buffer = this.context.createBuffer();
        this.context.bindBuffer(this.context.ARRAY_BUFFER, vertex_buffer);
    
        const a_position = this.context.getAttribLocation(program, 'a_position');
        this.context.enableVertexAttribArray(a_position);
        this.context.vertexAttribPointer(a_position, 2, this.context.FLOAT, false, 0, 0); // это переключение буфера на указатель a_position
    
    
        this.u_color = this.context.getUniformLocation(program, 'u_color');
        this.u_pan = this.context.getUniformLocation(program, 'u_pan');
        this.u_move = this.context.getUniformLocation(program, 'u_move');
        this.u_rotate = this.context.getUniformLocation(program, 'u_rotate');
        this.u_scale = this.context.getUniformLocation(program, 'u_scale');
        this.u_resolution = this.context.getUniformLocation(program, 'u_resolution');
    
        this.context.uniform4f(this.u_color, 1, 0, 0, 1);
        this.context.uniformMatrix3fv(this.u_move, false, mat3.create());
        this.context.uniformMatrix3fv(this.u_pan, false, mat3.create());
        this.context.uniformMatrix3fv(this.u_rotate, false, mat3.create());
        this.context.uniformMatrix3fv(this.u_scale, false, mat3.create());
        this.context.uniform2f(this.u_resolution, this.context.canvas.width, this.context.canvas.height);
}

}