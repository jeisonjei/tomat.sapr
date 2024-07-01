export function getVertexshaderSource() {
    return `#version 300 es
    in vec2 a_position;

    uniform vec2 u_resolution;

    uniform mat3 u_pan;
    uniform mat3 u_move;
    uniform mat3 u_rotate;
    uniform mat3 u_scale;

    vec2 getGlPosition(vec2 position){
        vec2 zeroToOne = position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        return clipSpace * vec2(1.0, -1.0); // flip y-axis
    }
    
    void main() {

        
        vec3 glPosition = vec3(getGlPosition(a_position) , 1.0);

        mat3 projection = u_scale * u_pan * u_move * u_rotate; // порядок умножения матриц важен

        gl_Position = vec4(glPosition * projection, 1.0);
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
