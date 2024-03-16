import { g } from '../shared/globalState/g.js';
import { resizeCanvasToDisplaySize } from '../shared/common.mjs';
import { getVertexshaderSource, getFragmentShaderSource } from '../shared/webgl/shaders.mjs';
import { createProgram } from '../shared/webgl/program.mjs';
import { mat3 } from 'gl-matrix';

function initWebgl() {
    const canvas = document.querySelector('canvas.drawing');
    resizeCanvasToDisplaySize(canvas);
    g.gl = canvas.getContext('webgl2');
    const program = createProgram(g.gl, getVertexshaderSource(), getFragmentShaderSource());
    g.gl.useProgram(program);
    g.gl.viewport(0, 0, canvas.width, canvas.height);
    g.gl.enable(g.gl.BLEND);
    g.gl.blendFunc(g.gl.SRC_ALPHA, g.gl.ONE_MINUS_SRC_ALPHA);

    const vertex_buffer = g.gl.createBuffer();
    g.gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    const a_position = g.gl.getAttribLocation(program, 'a_position');
    g.gl.enableVertexAttribArray(a_position);
    g.gl.vertexAttribPointer(a_position, 2, g.gl.FLOAT, false, 0, 0);


    g.u_color = gl.getUniformLocation(program, 'u_color');
    g.u_pan = gl.getUniformLocation(program, 'u_pan');
    g.u_move = gl.getUniformLocation(program, 'u_move');
    g.u_rotate = gl.getUniformLocation(program, 'u_rotate');
    g.u_scale = gl.getUniformLocation(program, 'u_scale');
    g.u_resolution = gl.getUniformLocation(program, 'u_resolution');

    g.gl.uniform4f(g.u_color, 1, 0, 0, 1);
    g.gl.uniformMatrix3fv(g.u_move, false, mat3.create());
    g.gl.uniformMatrix3fv(g.u_pan, false, mat3.create());
    g.gl.uniformMatrix3fv(g.u_rotate, false, mat3.create());
    g.gl.uniformMatrix3fv(g.u_scale, false, mat3.create());
    g.gl.uniform2f(g.u_resolution, g.gl.canvas.width, g.gl.canvas.height);

}

