export function getVertexshaderSource() {
    return `#version 300 es
    in vec2 a_position;

    uniform vec2 u_resolution;

    uniform mat3 u_pan;
    uniform mat3 u_move;
    uniform mat3 u_rotate;
    uniform mat3 u_scale;
    
    void main() {

        // convert the position from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // convert from 0-> to -1->+1 (clip space)
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(vec3(clipSpace * vec2(1,-1),1.0)* u_scale * u_pan * u_move * u_rotate, 1.0);
    }
`;
}
export function getFragmentShaderSource() {
    return `#version 300 es
    precision mediump float;
    uniform vec4 u_color;
    out vec4 out_color;
    void main() {
        out_color = u_color;
    }
`;
}
