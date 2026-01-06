import { Ray } from './raycast';
import { Vec3, Vec4, subtractVectors, cross, vec3ToArray, vec4ToArray, normalize } from './vec'


export type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
]

export type Mat4Scaling = [
    number, 0,      0,      0,
    0,      number, 0,      0,
    0,      0,      number, 0,
    0,      0,      0,      1,
]

export type Mat4Translation = [
    1,      0,      0,      0,
    0,      1,      0,      0,
    0,      0,      1,      0,
    number, number, number, 1,
]

export type Mat4XRotation = [
    1,      0,      0,      0,
    0,      number, number, 0,
    0,      number, number, 0,
    0,      0,      0,      1,
]

export type Mat4YRotation = [
    number, 0,      number, 0,
    0,      1,      0,      0,
    number, 0,      number, 0,
    0,      0,      0,      1,
]

export type Mat4ZRotation = [
    number, number, 0,      0,
    number, number, 0,      0,
    0,      0,      1,      0,
    0,      0,      0,      1,
]

type Mat4Positions = {
    m00: number
    m01: number
    m02: number
    m03: number
    m10: number
    m11: number
    m12: number
    m13: number
    m20: number
    m21: number
    m22: number
    m23: number
    m30: number
    m31: number
    m32: number
    m33: number
}

function m4AsPositions(m: Mat4): Mat4Positions {
        return {
             // row 0
             m00 : m[0 * 4 + 0]!,
             m01 : m[0 * 4 + 1]!,
             m02 : m[0 * 4 + 2]!,
             m03 : m[0 * 4 + 3]!,
             // row 1
             m10 : m[1 * 4 + 0]!,
             m11 : m[1 * 4 + 1]!,
             m12 : m[1 * 4 + 2]!,
             m13 : m[1 * 4 + 3]!,
             // row 2
             m20 : m[2 * 4 + 0]!,
             m21 : m[2 * 4 + 1]!,
             m22 : m[2 * 4 + 2]!,
             m23 : m[2 * 4 + 3]!,
             // row 3
             m30 : m[3 * 4 + 0]!,
             m31 : m[3 * 4 + 1]!,
             m32 : m[3 * 4 + 2]!,
             m33 : m[3 * 4 + 3]!,
        }  
}

function m4FromPositions(p: Mat4Positions): Mat4 {
        
    const m: Mat4 = [
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
    ]

    // row 0
    m[0 * 4 + 0] = p.m00
    m[0 * 4 + 1] = p.m01
    m[0 * 4 + 2] = p.m02 
    m[0 * 4 + 3] = p.m03
    // row 1 p.
    m[1 * 4 + 0] = p.m10
    m[1 * 4 + 1] = p.m11 
    m[1 * 4 + 2] = p.m12 
    m[1 * 4 + 3] = p.m13 
    // row 2 p.
    m[2 * 4 + 0] = p.m20 
    m[2 * 4 + 1] = p.m21 
    m[2 * 4 + 2] = p.m22 
    m[2 * 4 + 3] = p.m23 
    // row 3 p.
    m[3 * 4 + 0] = p.m30 
    m[3 * 4 + 1] = p.m31 
    m[3 * 4 + 2] = p.m32 
    m[3 * 4 + 3] = p.m33 

    return m
    
      
}


export function m4lookAt(cameraPosition: Vec3, target: Vec3, up: Vec3): Mat4 {
        const zAxis = subtractVectors(cameraPosition, target)
        normalize(zAxis)

        const xAxis = cross(up, zAxis);
        normalize(xAxis)

        const yAxis = cross(zAxis, xAxis);
        normalize(yAxis)
      

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

export type Mat4Projection = [
    number, 0,      0,      0,
    0,      number, 0,      0,
    0,      0,      number,-1|0,
    number, number, number, 0|1,
]

export function m4perspective(fieldOfViewInRadians: number, aspect: number, near: number, far: number): Mat4Projection {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        const rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }



export function m4orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4Projection {
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

export function m4multiply(a: Mat4, b: Mat4): Mat4 {

        const ap = m4AsPositions(a);
        const bp = m4AsPositions(b);
        
        const p: Mat4Positions = {
            // row 0
            m00 : bp.m00 * ap.m00 + bp.m01 * ap.m10 + bp.m02 * ap.m20 + bp.m03 * ap.m30,
            m01 : bp.m00 * ap.m01 + bp.m01 * ap.m11 + bp.m02 * ap.m21 + bp.m03 * ap.m31,
            m02 : bp.m00 * ap.m02 + bp.m01 * ap.m12 + bp.m02 * ap.m22 + bp.m03 * ap.m32,
            m03 : bp.m00 * ap.m03 + bp.m01 * ap.m13 + bp.m02 * ap.m23 + bp.m03 * ap.m33,
            // row 1
            m10 : bp.m10 * ap.m00 + bp.m11 * ap.m10 + bp.m12 * ap.m20 + bp.m13 * ap.m30,
            m11 : bp.m10 * ap.m01 + bp.m11 * ap.m11 + bp.m12 * ap.m21 + bp.m13 * ap.m31,
            m12 : bp.m10 * ap.m02 + bp.m11 * ap.m12 + bp.m12 * ap.m22 + bp.m13 * ap.m32,
            m13 : bp.m10 * ap.m03 + bp.m11 * ap.m13 + bp.m12 * ap.m23 + bp.m13 * ap.m33,
            // row 2
            m20 : bp.m20 * ap.m00 + bp.m21 * ap.m10 + bp.m22 * ap.m20 + bp.m23 * ap.m30,
            m21 : bp.m20 * ap.m01 + bp.m21 * ap.m11 + bp.m22 * ap.m21 + bp.m23 * ap.m31,
            m22 : bp.m20 * ap.m02 + bp.m21 * ap.m12 + bp.m22 * ap.m22 + bp.m23 * ap.m32,
            m23 : bp.m20 * ap.m03 + bp.m21 * ap.m13 + bp.m22 * ap.m23 + bp.m23 * ap.m33,
            // row 3
            m30 : bp.m30 * ap.m00 + bp.m31 * ap.m10 + bp.m32 * ap.m20 + bp.m33 * ap.m30,
            m31 : bp.m30 * ap.m01 + bp.m31 * ap.m11 + bp.m32 * ap.m21 + bp.m33 * ap.m31,
            m32 : bp.m30 * ap.m02 + bp.m31 * ap.m12 + bp.m32 * ap.m22 + bp.m33 * ap.m32,
            m33 : bp.m30 * ap.m03 + bp.m31 * ap.m13 + bp.m32 * ap.m23 + bp.m33 * ap.m33,
        }

        return m4FromPositions(p)
    }

// export function m4multiply(a: Mat4, b: Mat4): Mat4 {

//         const ap = m4AsPositions(a);
//         const bp = m4AsPositions(b);
        
//         return [
//             bp.m00 * ap.m00 + bp.m01 * ap.m10 + bp.m02 * ap.m20 + bp.m03 * ap.m30,
//             bp.m00 * ap.m01 + bp.m01 * ap.m11 + bp.m02 * ap.m21 + bp.m03 * ap.m31,
//             bp.m00 * ap.m02 + bp.m01 * ap.m12 + bp.m02 * ap.m22 + bp.m03 * ap.m32,
//             bp.m00 * ap.m03 + bp.m01 * ap.m13 + bp.m02 * ap.m23 + bp.m03 * ap.m33,
//             bp.m10 * ap.m00 + bp.m11 * ap.m10 + bp.m12 * ap.m20 + bp.m13 * ap.m30,
//             bp.m10 * ap.m01 + bp.m11 * ap.m11 + bp.m12 * ap.m21 + bp.m13 * ap.m31,
//             bp.m10 * ap.m02 + bp.m11 * ap.m12 + bp.m12 * ap.m22 + bp.m13 * ap.m32,
//             bp.m10 * ap.m03 + bp.m11 * ap.m13 + bp.m12 * ap.m23 + bp.m13 * ap.m33,
//             bp.m20 * ap.m00 + bp.m21 * ap.m10 + bp.m22 * ap.m20 + bp.m23 * ap.m30,
//             bp.m20 * ap.m01 + bp.m21 * ap.m11 + bp.m22 * ap.m21 + bp.m23 * ap.m31,
//             bp.m20 * ap.m02 + bp.m21 * ap.m12 + bp.m22 * ap.m22 + bp.m23 * ap.m32,
//             bp.m20 * ap.m03 + bp.m21 * ap.m13 + bp.m22 * ap.m23 + bp.m23 * ap.m33,
//             bp.m30 * ap.m00 + bp.m31 * ap.m10 + bp.m32 * ap.m20 + bp.m33 * ap.m30,
//             bp.m30 * ap.m01 + bp.m31 * ap.m11 + bp.m32 * ap.m21 + bp.m33 * ap.m31,
//             bp.m30 * ap.m02 + bp.m31 * ap.m12 + bp.m32 * ap.m22 + bp.m33 * ap.m32,
//             bp.m30 * ap.m03 + bp.m31 * ap.m13 + bp.m32 * ap.m23 + bp.m33 * ap.m33,
//         ];
//     }

// export function m4Vec4multiply(m: Mat4, v: Vec4): Vec4 {

//         const mp = m4AsPositions(m);
    
        
//         return [
//             //
//             ap.m00 * bp.m00 + ap.m01 * bp.m10 + ap.m02 * bp.m20 + ap.m03 * bp.m30,
//             ap.m00 * bp.m01 + ap.m01 * bp.m11 + ap.m02 * bp.m21 + ap.m03 * bp.m31,
//             ap.m00 * bp.m02 + ap.m01 * bp.m12 + ap.m02 * bp.m22 + ap.m03 * bp.m32,
//             ap.m00 * bp.m03 + ap.m01 * bp.m13 + ap.m02 * bp.m23 + ap.m03 * bp.m33,
//             ap.m10 * bp.m00 + ap.m11 * bp.m10 + ap.m12 * bp.m20 + ap.m13 * bp.m30,
//             ap.m10 * bp.m01 + ap.m11 * bp.m11 + ap.m12 * bp.m21 + ap.m13 * bp.m31,
//             ap.m10 * bp.m02 + ap.m11 * bp.m12 + ap.m12 * bp.m22 + ap.m13 * bp.m32,
//             ap.m10 * bp.m03 + ap.m11 * bp.m13 + ap.m12 * bp.m23 + ap.m13 * bp.m33,
//             ap.m20 * bp.m00 + ap.m21 * bp.m10 + ap.m22 * bp.m20 + ap.m23 * bp.m30,
//             ap.m20 * bp.m01 + ap.m21 * bp.m11 + ap.m22 * bp.m21 + ap.m23 * bp.m31,
//             ap.m20 * bp.m02 + ap.m21 * bp.m12 + ap.m22 * bp.m22 + ap.m23 * bp.m32,
//             ap.m20 * bp.m03 + ap.m21 * bp.m13 + ap.m22 * bp.m23 + ap.m23 * bp.m33,
//             ap.m30 * bp.m00 + ap.m31 * bp.m10 + ap.m32 * bp.m20 + ap.m33 * bp.m30,
//             ap.m30 * bp.m01 + ap.m31 * bp.m11 + ap.m32 * bp.m21 + ap.m33 * bp.m31,
//             ap.m30 * bp.m02 + ap.m31 * bp.m12 + ap.m32 * bp.m22 + ap.m33 * bp.m32,
//             ap.m30 * bp.m03 + ap.m31 * bp.m13 + ap.m32 * bp.m23 + ap.m33 * bp.m33,
//         ];
//     }

export function m4translation(tx: number, ty: number, tz: number): Mat4Translation {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    }

export function m4xRotation(angleInRadians: number): Mat4XRotation {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    }

export function m4yRotation(angleInRadians: number): Mat4YRotation {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    }

export function m4zRotation(angleInRadians: number): Mat4ZRotation {
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
        const p = m4AsPositions(m)

        const tmp_0 =  p.m22 * p.m33;
        const tmp_1 =  p.m32 * p.m23;
        const tmp_2 =  p.m12 * p.m33;
        const tmp_3 =  p.m32 * p.m13;
        const tmp_4 =  p.m12 * p.m23;
        const tmp_5 =  p.m22 * p.m13;
        const tmp_6 =  p.m02 * p.m33;
        const tmp_7 =  p.m32 * p.m03;
        const tmp_8 =  p.m02 * p.m23;
        const tmp_9 =  p.m22 * p.m03;
        const tmp_10 = p.m02 * p.m13;
        const tmp_11 = p.m12 * p.m03;
        const tmp_12 = p.m20 * p.m31;
        const tmp_13 = p.m30 * p.m21;
        const tmp_14 = p.m10 * p.m31;
        const tmp_15 = p.m30 * p.m11;
        const tmp_16 = p.m10 * p.m21;
        const tmp_17 = p.m20 * p.m11;
        const tmp_18 = p.m00 * p.m31;
        const tmp_19 = p.m30 * p.m01;
        const tmp_20 = p.m00 * p.m21;
        const tmp_21 = p.m20 * p.m01;
        const tmp_22 = p.m00 * p.m11;
        const tmp_23 = p.m10 * p.m01;

        const t0 = (tmp_0 * p.m11 + tmp_3 * p.m21 + tmp_4 * p.m31) -
            (tmp_1 * p.m11 + tmp_2 * p.m21 + tmp_5 * p.m31);
        const t1 = (tmp_1 * p.m01 + tmp_6 * p.m21 + tmp_9 * p.m31) -
            (tmp_0 * p.m01 + tmp_7 * p.m21 + tmp_8 * p.m31);
        const t2 = (tmp_2 * p.m01 + tmp_7 * p.m11 + tmp_10 * p.m31) -
            (tmp_3 * p.m01 + tmp_6 * p.m11 + tmp_11 * p.m31);
        const t3 = (tmp_5 * p.m01 + tmp_8 * p.m11 + tmp_11 * p.m21) -
            (tmp_4 * p.m01 + tmp_9 * p.m11 + tmp_10 * p.m21);

        const d = 1.0 / (p.m00 * t0 + p.m10 * t1 + p.m20 * t2 + p.m30 * t3);

        return [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 *  p.m10 + tmp_2 *  p.m20 + tmp_5 *  p.m30) -
                (tmp_0 *   p.m10 + tmp_3 *  p.m20 + tmp_4 *  p.m30)),
            d * ((tmp_0 *  p.m00 + tmp_7 *  p.m20 + tmp_8 *  p.m30) -
                (tmp_1 *   p.m00 + tmp_6 *  p.m20 + tmp_9 *  p.m30)),
            d * ((tmp_3 *  p.m00 + tmp_6 *  p.m10 + tmp_11 * p.m30) -
                (tmp_2 *   p.m00 + tmp_7 *  p.m10 + tmp_10 * p.m30)),
            d * ((tmp_4 *  p.m00 + tmp_9 *  p.m10 + tmp_10 * p.m20) -
                (tmp_5 *   p.m00 + tmp_8 *  p.m10 + tmp_11 * p.m20)),
            d * ((tmp_12 * p.m13 + tmp_15 * p.m23 + tmp_16 * p.m33) -
                (tmp_13 *  p.m13 + tmp_14 * p.m23 + tmp_17 * p.m33)),
            d * ((tmp_13 * p.m03 + tmp_18 * p.m23 + tmp_21 * p.m33) -
                (tmp_12 *  p.m03 + tmp_19 * p.m23 + tmp_20 * p.m33)),
            d * ((tmp_14 * p.m03 + tmp_19 * p.m13 + tmp_22 * p.m33) -
                (tmp_15 *  p.m03 + tmp_18 * p.m13 + tmp_23 * p.m33)),
            d * ((tmp_17 * p.m03 + tmp_20 * p.m13 + tmp_23 * p.m23) -
                (tmp_16 *  p.m03 + tmp_21 * p.m13 + tmp_22 * p.m23)),
            d * ((tmp_14 * p.m22 + tmp_17 * p.m32 + tmp_13 * p.m12) -
                (tmp_16 *  p.m32 + tmp_12 * p.m12 + tmp_15 * p.m22)),
            d * ((tmp_20 * p.m32 + tmp_12 * p.m02 + tmp_19 * p.m22) -
                (tmp_18 *  p.m22 + tmp_21 * p.m32 + tmp_13 * p.m02)),
            d * ((tmp_18 * p.m12 + tmp_23 * p.m32 + tmp_15 * p.m02) -
                (tmp_22 *  p.m32 + tmp_14 * p.m02 + tmp_19 * p.m12)),
            d * ((tmp_22 * p.m22 + tmp_16 * p.m02 + tmp_21 * p.m12) -
                (tmp_20 *  p.m12 + tmp_23 * p.m22 + tmp_17 * p.m02))
        ];
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



export function m4fromPositionAndEuler(position: Vec3, euler: Vec3): Mat4 {
    let mat4 = m4translate(m4yRotation(0), position.x, position.y, position.z) ;
    mat4 = m4xRotate(mat4, euler.x);
    mat4 = m4yRotate(mat4, euler.y);
    mat4 = m4zRotate(mat4, euler.z);
    return mat4;
}