type ShaderType = WebGLRenderingContextBase["VERTEX_SHADER"] | WebGLRenderingContextBase["FRAGMENT_SHADER"]


function createShader(gl: WebGLRenderingContext, type: ShaderType, source: string): WebGLShader | undefined {
    const shader = gl.createShader(type);
    if (shader) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        } else {
            alert(`Error: ${gl.getShaderInfoLog(shader)})`);
            gl.deleteShader(shader);
            return undefined
        }
    } else {
        alert('Failed to create shader')
        return undefined
    }
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | undefined {
    const program = gl.createProgram();
    if (program) {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        } else {
            alert(`Error: ${gl.getProgramInfoLog(program)}`);
            gl.deleteProgram(program);
            return undefined
        }
    } else {
        alert('Failed to create WebGL program')
        return undefined
    }
}

export function createProgramFromRaw(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (vertexShader && fragmentShader) {
        return createProgram(gl, vertexShader, fragmentShader)

    } else {
        return undefined
    }
}
