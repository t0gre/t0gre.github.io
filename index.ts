type ShaderType = WebGLRenderingContextBase["VERTEX_SHADER"] | WebGLRenderingContextBase["FRAGMENT_SHADER"]
type Vec3 = [number, number, number]
type Vec4 = [number, number, number, number]
type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
]

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

    var gl = canvas.getContext("webgl");


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
            var colorBuffer = gl.createBuffer();
            // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            // Put color data into buffer
            setColors(gl);

            function radToDeg(r: number) {
                return r * 180 / Math.PI;
            }

            function degToRad(d: number) {
                return d * Math.PI / 180;
            }

            var cameraAngleRadians = degToRad(0);
            var fieldOfViewRadians = degToRad(60);

            drawScene(gl, program);


            // Draw the scene.
            function drawScene(gl: WebGLRenderingContext, program: WebGLProgram) {
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
                var size = 3;          // 3 components per iteration
                var type: number = gl.FLOAT;   // the data is 32bit floats
                var normalize = false; // don't normalize the data
                var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
                var offset = 0;        // start at the beginning of the buffer
                gl.vertexAttribPointer(
                    positionLocation, size, type, normalize, stride, offset);

                // Turn on the color attribute
                gl.enableVertexAttribArray(colorLocation);

                // Bind the color buffer.
                gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

                // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
                var size = 3;                 // 3 components per iteration
                var type: number = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
                var normalize = true;         // normalize the data (convert from 0-255 to 0-1)
                var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
                var offset = 0;               // start at the beginning of the buffer
                gl.vertexAttribPointer(
                    colorLocation, size, type, normalize, stride, offset);


                var numFs = 5;
                var radius = 200;

                // Compute the projection matrix
                var aspect = canvas.clientWidth / canvas.clientHeight;
                var zNear = 1;
                var zFar = 2000;
                var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

                // Compute the position of the first F
                var fPosition: Vec3 = [radius, 0, 0];

                // Use matrix math to compute a position on a circle where
                // the camera is
                var cameraMatrix = m4.yRotation(cameraAngleRadians);
                cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);

                // Get the camera's position from the matrix we computed
                var cameraPosition: Vec3 = [
                    cameraMatrix[12],
                    cameraMatrix[13],
                    cameraMatrix[14],
                ];

                var up: Vec3 = [0, 1, 0];

                // Compute the camera's matrix using look at.
                var cameraMatrix = m4.lookAt(cameraPosition, fPosition, up);

                // Make a view matrix from the camera matrix
                var viewMatrix = m4.inverse(cameraMatrix);

                // Compute a view projection matrix
                var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

                for (var ii = 0; ii < numFs; ++ii) {
                    var angle = ii * Math.PI * 2 / numFs;
                    var x = Math.cos(angle) * radius;
                    var y = Math.sin(angle) * radius;

                    // starting with the view projection matrix
                    // compute a matrix for the F
                    var matrix = m4.translate(viewProjectionMatrix, x, 0, y);

                    // Set the matrix.
                    gl.uniformMatrix4fv(matrixLocation, false, matrix);

                    // Draw the geometry.
                    var primitiveType = gl.TRIANGLES;
                    var offset = 0;
                    var count = 16 * 6;
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

function subtractVectors(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v: Vec3): Vec3 {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
}

function cross(a: Vec3, b: Vec3): Vec3 {
    return [a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]];
}



var m4 = {

    lookAt: function (cameraPosition: Vec3, target: Vec3, up: Vec3): Mat4 {
        var zAxis = normalize(
            subtractVectors(cameraPosition, target));
        var xAxis = normalize(cross(up, zAxis));
        var yAxis = normalize(cross(zAxis, xAxis));

        return [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPosition[0],
            cameraPosition[1],
            cameraPosition[2],
            1,
        ];
    },

    perspective: function (fieldOfViewInRadians: number, aspect: number, near: number, far: number): Mat4 {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },

    projection: function (width: number, height: number, depth: number): Mat4 {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1,
        ];
    },

    multiply: function (a: Mat4, b: Mat4): Mat4 {
        const a00 = a[0 * 4 + 0]!;
        const a01 = a[0 * 4 + 1]!;
        const a02 = a[0 * 4 + 2]!;
        const a03 = a[0 * 4 + 3]!;
        const a10 = a[1 * 4 + 0]!;
        const a11 = a[1 * 4 + 1]!;
        const a12 = a[1 * 4 + 2]!;
        const a13 = a[1 * 4 + 3]!;
        const a20 = a[2 * 4 + 0]!;
        const a21 = a[2 * 4 + 1]!;
        const a22 = a[2 * 4 + 2]!;
        const a23 = a[2 * 4 + 3]!;
        const a30 = a[3 * 4 + 0]!;
        const a31 = a[3 * 4 + 1]!;
        const a32 = a[3 * 4 + 2]!;
        const a33 = a[3 * 4 + 3]!;
        const b00 = b[0 * 4 + 0]!;
        const b01 = b[0 * 4 + 1]!;
        const b02 = b[0 * 4 + 2]!;
        const b03 = b[0 * 4 + 3]!;
        const b10 = b[1 * 4 + 0]!;
        const b11 = b[1 * 4 + 1]!;
        const b12 = b[1 * 4 + 2]!;
        const b13 = b[1 * 4 + 3]!;
        const b20 = b[2 * 4 + 0]!;
        const b21 = b[2 * 4 + 1]!;
        const b22 = b[2 * 4 + 2]!;
        const b23 = b[2 * 4 + 3]!;
        const b30 = b[3 * 4 + 0]!;
        const b31 = b[3 * 4 + 1]!;
        const b32 = b[3 * 4 + 2]!;
        const b33 = b[3 * 4 + 3]!;
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    translation: function (tx: number, ty: number, tz: number): Mat4 {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    },

    xRotation: function (angleInRadians: number): Mat4 {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },

    yRotation: function (angleInRadians: number): Mat4 {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },

    zRotation: function (angleInRadians: number): Mat4 {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    scaling: function (sx: number, sy: number, sz: number): Mat4 {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    },

    translate: function (m: Mat4, tx: number, ty: number, tz: number) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },

    xRotate: function (m: Mat4, angleInRadians: number) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },

    yRotate: function (m: Mat4, angleInRadians: number) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },

    zRotate: function (m: Mat4, angleInRadians: number) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },

    scale: function (m: Mat4, sx: number, sy: number, sz: number) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

    inverse: function (m: Mat4): Mat4 {
        const m00 = m[0 * 4 + 0]!;
        const m01 = m[0 * 4 + 1]!;
        const m02 = m[0 * 4 + 2]!;
        const m03 = m[0 * 4 + 3]!;
        const m10 = m[1 * 4 + 0]!;
        const m11 = m[1 * 4 + 1]!;
        const m12 = m[1 * 4 + 2]!;
        const m13 = m[1 * 4 + 3]!;
        const m20 = m[2 * 4 + 0]!;
        const m21 = m[2 * 4 + 1]!;
        const m22 = m[2 * 4 + 2]!;
        const m23 = m[2 * 4 + 3]!;
        const m30 = m[3 * 4 + 0]!;
        const m31 = m[3 * 4 + 1]!;
        const m32 = m[3 * 4 + 2]!;
        const m33 = m[3 * 4 + 3]!;
        const tmp_0 = m22 * m33;
        const tmp_1 = m32 * m23;
        const tmp_2 = m12 * m33;
        const tmp_3 = m32 * m13;
        const tmp_4 = m12 * m23;
        const tmp_5 = m22 * m13;
        const tmp_6 = m02 * m33;
        const tmp_7 = m32 * m03;
        const tmp_8 = m02 * m23;
        const tmp_9 = m22 * m03;
        const tmp_10 = m02 * m13;
        const tmp_11 = m12 * m03;
        const tmp_12 = m20 * m31;
        const tmp_13 = m30 * m21;
        const tmp_14 = m10 * m31;
        const tmp_15 = m30 * m11;
        const tmp_16 = m10 * m21;
        const tmp_17 = m20 * m11;
        const tmp_18 = m00 * m31;
        const tmp_19 = m30 * m01;
        const tmp_20 = m00 * m21;
        const tmp_21 = m20 * m01;
        const tmp_22 = m00 * m11;
        const tmp_23 = m10 * m01;

        const t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        const t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        const t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        const t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        return [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
    },

    vectorMultiply: function (v: Vec4, m: Mat4) {
        var dst = [];
        for (var i = 0; i < 4; ++i) {
            dst[i] = 0.0;
            for (var j = 0; j < 4; ++j) {
                dst[i] += v[j]! * m[j * 4 + i]!;
            }
        }
        return dst;
    },

};

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl: WebGLRenderingContext) {
    var positions = new Float32Array([
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
    var matrix = m4.xRotation(Math.PI);
    matrix = m4.translate(matrix, -50, -75, -15);

    for (var ii = 0; ii < positions.length; ii += 3) {
        var vector = m4.vectorMultiply([positions[ii + 0]!, positions[ii + 1]!, positions[ii + 2]!, 1], matrix);
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

export const sayHello = () => console.log('hello')
