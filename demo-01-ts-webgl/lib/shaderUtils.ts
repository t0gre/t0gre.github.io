type ShaderType = WebGLRenderingContextBase["VERTEX_SHADER"] | WebGLRenderingContextBase["FRAGMENT_SHADER"]


function createShader(gl: WebGLRenderingContext, type: ShaderType, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (shader) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        } else {
            throw new Error(`Error: ${gl.getShaderInfoLog(shader)})`);
        }
    } else {
        throw new Error('Failed to create shader')
    }
}

export type AttributeBinding = {
    name: string
    location: number // integer
}

type ShaderProgramWithAttributes = {
    vertexShader: WebGLShader, 
    fragmentShader: WebGLShader
    attributeBindings: AttributeBinding[]
}

function createProgram(gl: WebGLRenderingContext, shaderProgramWithAttributes: ShaderProgramWithAttributes): WebGLProgram {
    const program = gl.createProgram();

    const { vertexShader, fragmentShader, attributeBindings } = shaderProgramWithAttributes
    if (program) {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // Bind attribute locations before linking
        if (attributeBindings) {
            for (const {name, location} of attributeBindings) {
                gl.bindAttribLocation(program, location, name);
            }
        }

        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        } else {
            throw new Error(`Error: ${gl.getProgramInfoLog(program)}`);
            
        }
    } else {
        throw new Error('Failed to create WebGL program')
    }
}

// type WebGLProgramWithAttributes = {
//     vertexShader: WebGLShader, 
//     fragmentShader: WebGLShader
//     attributeBindings: AttributeBinding[]
// }


export function createProgramFromRaw(
    gl: WebGLRenderingContext, 
    vertexShaderSource: string, 
    fragmentShaderSource: string, 
    attributeBindings: AttributeBinding[]
) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (vertexShader && fragmentShader) {
        return createProgram(gl, {vertexShader, fragmentShader, attributeBindings })

    } else {
        throw new Error("failed to create ")
    }
}
