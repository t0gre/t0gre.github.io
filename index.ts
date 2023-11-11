import {
    Mat4,
    m4perspective,
    m4inverse,
    m4yRotation,
    m4multiply,
    m4lookAt,
    m4translate,
    m4xRotation,
    m4vectorMultiply
} from './lib/mat4'

import { Vec3 } from 'lib/vec3'

type ShaderType = WebGLRenderingContextBase["VERTEX_SHADER"] | WebGLRenderingContextBase["FRAGMENT_SHADER"]


class Camera {
    private projectionMatrix: Mat4
    private matrix: Mat4
    private viewMatrix: Mat4
    public viewProjectionMatrix: Mat4
    private up: Vec3
    private position: Vec3
    constructor(fieldOfViewRadians = degToRad(60),
        aspect = 1,
        near = 1,
        far = 2000,
        up: Vec3 = [0, 1, 0], position: Vec3 = [0, 0, 0]) {

        this.position = position
        this.projectionMatrix = m4perspective(fieldOfViewRadians, aspect, near, far);
        this.matrix = m4yRotation(0);
        this.viewMatrix = m4inverse(this.matrix);
        this.viewProjectionMatrix = m4multiply(this.projectionMatrix, this.viewMatrix);
        this.up = up;
    }

    lookAt(position: Vec3): void {
        this.matrix = m4lookAt(this.position, position, this.up);
    }

    setPosition(position: Vec3): void {
        this.position = position;
        // all matrices apart from projection must be updated
        this.matrix = m4translate(this.matrix, position[0], position[1], position[2]);
        this.viewMatrix = m4inverse(this.matrix);
        this.viewProjectionMatrix = m4multiply(this.projectionMatrix, this.viewMatrix);

    }

}
// function radToDeg(r: number) {
//     return r * 180 / Math.PI;
// }

function degToRad(d: number) {
    return d * Math.PI / 180;
}

export const main = (canvas: HTMLCanvasElement): void => {

    const vertexShaderSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;

    uniform mat4 u_matrix;

    varying vec4 v_color;

    void main() {
    // Multiply the position by the matrix.
    gl_Position = u_matrix * a_position;

    // Pass the color to the fragment shader.
    v_color = a_color;
    }
    `

    const fragmentShaderSource = `
    precision mediump float;

    // Passed in from the vertex shader.
    varying vec4 v_color;

    void main() {
    gl_FragColor = v_color;
    }
    `

    let gl = canvas.getContext("webgl");

    if (!gl) {
        alert('it looks like you dont have webgl available')
    } else {
        resizeCanvasToDisplaySize(canvas);
        const program = createProgramFromRaw(gl, vertexShaderSource, fragmentShaderSource)

        if (program) {
            const positionLocation = gl.getAttribLocation(program, "a_position");
            const colorLocation = gl.getAttribLocation(program, "a_color");

            // lookup uniforms
            const matrixLocation = gl.getUniformLocation(program, "u_matrix");

            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            // Put geometry data into buffer
            setGeometry(gl);


            // Create a buffer to put colors in
            let colorBuffer = gl.createBuffer();
            // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            // Put color data into buffer
            setColors(gl);

            const camera = new Camera(degToRad(60), canvas.clientWidth / canvas.clientHeight, 1, 2000, [0, 1, 0]);
            // put the camera somewhere it can see all the fs
            camera.setPosition([0, 0, 600]);

            drawScene(gl, program, camera);


            // Draw the scene.
            function drawScene(gl: WebGLRenderingContext, program: WebGLProgram, camera: Camera) {
                resizeCanvasToDisplaySize(canvas);

                // Tell WebGL how to convert from clip space to pixels
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

                // Clear the canvas AND the depth buffer.
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

                // Turn on culling. By default backfacing triangles
                // will be culled.
                gl.enable(gl.CULL_FACE);

                // Enable the depth buffer
                gl.enable(gl.DEPTH_TEST);

                // Tell it to use our program (pair of shaders)
                gl.useProgram(program);

                // Turn on the position attribute
                gl.enableVertexAttribArray(positionLocation);

                // Bind the position buffer.
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

                // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
                const positionBufferOptions = {
                    size: 3,
                    type: gl.FLOAT,  // the data is 32bit floats
                    normalize: false,
                    stride: 0, // 0 = move forward size * sizeof(type) each iteration to get the next position
                    offset: 0 // start at the beginning of the buffer
                }

                gl.vertexAttribPointer(
                    positionLocation, positionBufferOptions.size, positionBufferOptions.type, positionBufferOptions.normalize, positionBufferOptions.stride, positionBufferOptions.offset);

                // Turn on the color attribute
                gl.enableVertexAttribArray(colorLocation);

                // Bind the color buffer.
                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

                const colorBufferOptions = {
                    size: 3,  // 3 components per iteration
                    type: gl.UNSIGNED_BYTE, // the data is 8bit unsigned values
                    normalize: true, // normalize the data (convert from 0-255 to 0-1)
                    stride: 0,
                    offset: 0
                }

                gl.vertexAttribPointer(
                    colorLocation, colorBufferOptions.size, colorBufferOptions.type, colorBufferOptions.normalize, colorBufferOptions.stride, colorBufferOptions.offset);


                const numFs = 10;
                const radius = 200;

                // Compute the position of the first F
                const fPosition: Vec3 = [radius, 0, 0];




                camera.lookAt(fPosition);

                for (let ii = 0; ii < numFs; ++ii) {
                    const angle = ii * Math.PI * 2 / numFs;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;

                    // starting with the view projection matrix
                    // compute a matrix for the F
                    const matrix = m4translate(camera.viewProjectionMatrix, x, 0, y);

                    // Set the matrix.
                    gl.uniformMatrix4fv(matrixLocation, false, matrix);

                    // Draw the geometry.
                    const primitiveType = gl.TRIANGLES;
                    const offset = 0;
                    const count = 16 * 6;
                    gl.drawArrays(primitiveType, offset, count);
                }
            }

        }
    }
}



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

function createProgramFromRaw(gl: WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (vertexShader && fragmentShader) {
        return createProgram(gl, vertexShader, fragmentShader)

    } else {
        return undefined
    }
}

function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): void {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width !== displayWidth ||
        canvas.height !== displayHeight;

    if (needResize) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

}

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl: WebGLRenderingContext) {
    const positions = new Float32Array([
        // left column front
        0, 0, 0,
        0, 150, 0,
        30, 0, 0,
        0, 150, 0,
        30, 150, 0,
        30, 0, 0,

        // top rung front
        30, 0, 0,
        30, 30, 0,
        100, 0, 0,
        30, 30, 0,
        100, 30, 0,
        100, 0, 0,

        // middle rung front
        30, 60, 0,
        30, 90, 0,
        67, 60, 0,
        30, 90, 0,
        67, 90, 0,
        67, 60, 0,

        // left column back
        0, 0, 30,
        30, 0, 30,
        0, 150, 30,
        0, 150, 30,
        30, 0, 30,
        30, 150, 30,

        // top rung back
        30, 0, 30,
        100, 0, 30,
        30, 30, 30,
        30, 30, 30,
        100, 0, 30,
        100, 30, 30,

        // middle rung back
        30, 60, 30,
        67, 60, 30,
        30, 90, 30,
        30, 90, 30,
        67, 60, 30,
        67, 90, 30,

        // top
        0, 0, 0,
        100, 0, 0,
        100, 0, 30,
        0, 0, 0,
        100, 0, 30,
        0, 0, 30,

        // top rung right
        100, 0, 0,
        100, 30, 0,
        100, 30, 30,
        100, 0, 0,
        100, 30, 30,
        100, 0, 30,

        // under top rung
        30, 30, 0,
        30, 30, 30,
        100, 30, 30,
        30, 30, 0,
        100, 30, 30,
        100, 30, 0,

        // between top rung and middle
        30, 30, 0,
        30, 60, 30,
        30, 30, 30,
        30, 30, 0,
        30, 60, 0,
        30, 60, 30,

        // top of middle rung
        30, 60, 0,
        67, 60, 30,
        30, 60, 30,
        30, 60, 0,
        67, 60, 0,
        67, 60, 30,

        // right of middle rung
        67, 60, 0,
        67, 90, 30,
        67, 60, 30,
        67, 60, 0,
        67, 90, 0,
        67, 90, 30,

        // bottom of middle rung.
        30, 90, 0,
        30, 90, 30,
        67, 90, 30,
        30, 90, 0,
        67, 90, 30,
        67, 90, 0,

        // right of bottom
        30, 90, 0,
        30, 150, 30,
        30, 90, 30,
        30, 90, 0,
        30, 150, 0,
        30, 150, 30,

        // bottom
        0, 150, 0,
        0, 150, 30,
        30, 150, 30,
        0, 150, 0,
        30, 150, 30,
        30, 150, 0,

        // left side
        0, 0, 0,
        0, 0, 30,
        0, 150, 30,
        0, 0, 0,
        0, 150, 30,
        0, 150, 0]);

    // Center the F around the origin and Flip it around. We do this because
    // we're in 3D now with and +Y is up where as before when we started with 2D
    // we had +Y as down.

    // We could do by changing all the values above but I'm lazy.
    // We could also do it with a matrix at draw time but you should
    // never do stuff at draw time if you can do it at init time.
    let matrix = m4xRotation(Math.PI);
    matrix = m4translate(matrix, -50, -75, -15);

    for (let ii = 0; ii < positions.length; ii += 3) {
        const vector = m4vectorMultiply([positions[ii + 0]!, positions[ii + 1]!, positions[ii + 2]!, 1], matrix);
        positions[ii + 0] = vector[0]!;
        positions[ii + 1] = vector[1]!;
        positions[ii + 2] = vector[2]!;
    }

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

// Fill the buffer with colors for the 'F'.
function setColors(gl: WebGLRenderingContext) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Uint8Array([
            // left column front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // top rung front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // middle rung front
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,
            200, 70, 120,

            // left column back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // top rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // middle rung back
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,
            80, 70, 200,

            // top
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,
            70, 200, 210,

            // top rung right
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,
            200, 200, 70,

            // under top rung
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,
            210, 100, 70,

            // between top rung and middle
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,
            210, 160, 70,

            // top of middle rung
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,
            70, 180, 210,

            // right of middle rung
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,
            100, 70, 210,

            // bottom of middle rung.
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,
            76, 210, 100,

            // right of bottom
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,
            140, 210, 80,

            // bottom
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,
            90, 130, 110,

            // left side
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220,
            160, 160, 220]),
        gl.STATIC_DRAW);
}


