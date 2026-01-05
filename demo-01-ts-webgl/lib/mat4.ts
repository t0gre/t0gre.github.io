import { Ray } from './raycast';
import { Vec3, Vec4, normalize, subtractVectors, cross, vec3ToArray, vec4ToArray } from './vec'


export type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
]

export function m4lookAt(cameraPosition: Vec3, target: Vec3, up: Vec3): Mat4 {
        const zAxis = normalize(
            subtractVectors(cameraPosition, target));
        const xAxis = normalize(cross(up, zAxis));
        const yAxis = normalize(cross(zAxis, xAxis));

        return [
            xAxis.x, xAxis.y, xAxis.z, 0,
            yAxis.x, yAxis.y, yAxis.z, 0,
            zAxis.x, zAxis.y, zAxis.z, 0,
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z,
            1,
        ];
    }

export function m4perspective(fieldOfViewInRadians: number, aspect: number, near: number, far: number): Mat4 {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        const rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }



export function m4orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    return [
        -2 * lr, 0, 0, 0,
        0, -2 * bt, 0, 0,
        0, 0, 2 * nf, 0,
        (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1
    ];
}

export function m4projection(width: number, height: number, depth: number): Mat4 {
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
            2 / width, 0, 0, 0,
            0, -2 / height, 0, 0,
            0, 0, 2 / depth, 0,
            -1, 1, 0, 1,
        ];
    }

export function m4multiply(a: Mat4, b: Mat4): Mat4 {

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
    }

export function m4translation(tx: number, ty: number, tz: number): Mat4 {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    }

export function m4xRotation(angleInRadians: number): Mat4 {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    }

export function m4yRotation(angleInRadians: number): Mat4 {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    }

export function m4zRotation(angleInRadians: number): Mat4 {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }

export function m4scaling(sx: number, sy: number, sz: number): Mat4 {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    }

    export function m4translate(m: Mat4, tx: number, ty: number, tz: number) {
        return m4multiply(m, m4translation(tx, ty, tz));
    }

    export function m4xRotate(m: Mat4, angleInRadians: number) {
        return m4multiply(m, m4xRotation(angleInRadians));
    }

    export function m4yRotate(m: Mat4, angleInRadians: number) {
        return m4multiply(m, m4yRotation(angleInRadians));
    }

    export function m4zRotate(m: Mat4, angleInRadians: number) {
        return m4multiply(m, m4zRotation(angleInRadians));
    }

    export function m4scale(m: Mat4, sx: number, sy: number, sz: number) {
        return m4multiply(m, m4scaling(sx, sy, sz));
    
    }
    
/**
   * Transposes a matrix.
   * @param {Matrix4} m matrix to transpose.
   * @param {Matrix4} [dst] optional matrix to store result
   * @return {Matrix4} dst or a new matrix if none provided
   * @memberOf module:webgl-3d-math
   */
export function m4transpose(m: Mat4) {
    const dst: Mat4 = [
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
    ];

    dst[ 0] = m[0];
    dst[ 1] = m[4];
    dst[ 2] = m[8];
    dst[ 3] = m[12];
    dst[ 4] = m[1];
    dst[ 5] = m[5];
    dst[ 6] = m[9];
    dst[ 7] = m[13];
    dst[ 8] = m[2];
    dst[ 9] = m[6];
    dst[10] = m[10];
    dst[11] = m[14];
    dst[12] = m[3];
    dst[13] = m[7];
    dst[14] = m[11];
    dst[15] = m[15];

    return dst;
  }

export function m4inverse(m: Mat4): Mat4 {
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
    }

export function m4vectorMultiply(v: Vec4, m: Mat4): Vec4 {
        const dst: [number, number, number, number] = [0,0,0,0];
        const vArray = vec4ToArray(v)
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                dst[i]! += vArray[j]! * m[j * 4 + i]!; // ts is not smart enough to see that we set dst[i] to a number already
            }
        }
        return { x: dst[0], y: dst[1], z: dst[2], w: dst[3] };

    }

export function m4PositionMultiply(v: Vec3, m: Mat4): Vec3 {
        
        const vArray: [number, number, number, number ] = [...vec3ToArray(v), 1]
        const dst: [number, number, number, number] = [0,0,0,0];
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                dst[i]! += vArray[j]! * m[j * 4 + i]!; // ts is not smart enough to see that we set dst[i] to a number already
            }
        }

        return {x: dst[0]/dst[3], y: dst[1]/dst[3], z: dst[2]/dst[3] }
    }

export function m4DirectionMultiply(v: Vec3, m: Mat4): Vec3 {
        
        const vArray: [number, number, number, number ] = [...vec3ToArray(v), 0]
        const dst: [number, number, number, number] = [0,0,0,0];
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                dst[i]! += vArray[j]! * m[j * 4 + i]!; // ts is not smart enough to see that we set dst[i] to a number already
            }
        }

        return { x: dst[0], y: dst[1], z: dst[2] };

    }

export function m4RayMultiply(ray: Ray, m: Mat4) {
    return {
        origin: m4PositionMultiply(ray.origin, m),
        direction: m4DirectionMultiply(ray.direction, m)
        
    }
}

export function m4fromPositionAndEuler(position: Vec3, euler: Vec3): Mat4 {
    let mat4 = m4translate(m4yRotation(0), position.x, position.y, position.z) ;
    mat4 = m4xRotate(mat4, euler.x);
    mat4 = m4yRotate(mat4, euler.y);
    mat4 = m4zRotate(mat4, euler.z);
    return mat4;
}