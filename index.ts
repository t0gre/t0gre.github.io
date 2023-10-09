type ShaderType = WebGLRenderingContextBase["VERTEX_SHADER"] | WebGLRenderingContextBase["FRAGMENT_SHADER"]

export const renderScene = (canvas: HTMLCanvasElement): void => {

    const vertexShaderSource = `
    attribute vec4 a_position;
 
    // all shaders have a main function
    void main() {
 
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;
    }`

    const fragmentShaderSource = `
     // fragment shaders don't have a default precision so we need
    // to pick one. mediump is a good default
    precision mediump float;

    void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = vec4(1, 0, 0.5, 1); // return reddish-purple
    }
    `

    var gl = canvas.getContext("webgl");


    if (!gl) {
        alert('it looks like you dont have webgl available')
    } else {
        resizeCanvasToDisplaySize(canvas);
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (vertexShader && fragmentShader) {
            const program = createProgram(gl, vertexShader, fragmentShader)
            if (program) {
                const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
                const positionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                // three 2d points
                const positions = [
                    0, 0,
                    0, 0.5,
                    0.7, 0,
                ];
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
                gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.useProgram(program);

                gl.enableVertexAttribArray(positionAttributeLocation);

                // Bind the position buffer.
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

                // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
                var size = 2;          // 2 components per iteration
                var type = gl.FLOAT;   // the data is 32bit floats
                var normalize = false; // don't normalize the data
                var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
                var offset = 0;        // start at the beginning of the buffer
                gl.vertexAttribPointer(
                    positionAttributeLocation, size, type, normalize, stride, offset)

                var primitiveType = gl.TRIANGLES;
                var offset = 0;
                var count = 3;
                gl.drawArrays(primitiveType, offset, count);


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



export const sayHello = () => console.log('hello')
