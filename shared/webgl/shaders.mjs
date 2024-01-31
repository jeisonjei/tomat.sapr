export function getVertexshaderSource() {
    return `#version 300 es
    in vec2 a_position;
    uniform mat3 u_move;

    void main() {
        gl_Position = vec4(vec3(a_position, 1.0) * u_move, 1.0);
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
