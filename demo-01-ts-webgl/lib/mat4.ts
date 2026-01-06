import { Vec3, subtractVectors, cross, vec3ToArray, normalize, Vec4, vec4ToArray } from './vec'


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

type Row4 = [number, number, number, number]
type Mat4D = [
    Row4, Row4, Row4, Row4
]

function m4AsPositions(m: Mat4): Mat4D {
        return [
             
            [m[0 * 4 + 0]!,
             m[0 * 4 + 1]!,
             m[0 * 4 + 2]!,
             m[0 * 4 + 3]!
            ],

            [m[1 * 4 + 0]!,
             m[1 * 4 + 1]!,
             m[1 * 4 + 2]!,
             m[1 * 4 + 3]!
            ],

            [m[2 * 4 + 0]!,
             m[2 * 4 + 1]!,
             m[2 * 4 + 2]!,
             m[2 * 4 + 3]!
            ],
            [m[3 * 4 + 0]!,
             m[3 * 4 + 1]!,
             m[3 * 4 + 2]!,
             m[3 * 4 + 3]!
            ],
        ]  
}

function m4FromPositions(p: Mat4D): Mat4 {
        
    const m: Mat4 = [
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
    ]

    
    m[0 * 4 + 0] = p[0][0]
    m[0 * 4 + 1] = p[0][1]
    m[0 * 4 + 2] = p[0][2] 
    m[0 * 4 + 3] = p[0][3]
    m[1 * 4 + 0] = p[1][0]
    m[1 * 4 + 1] = p[1][1] 
    m[1 * 4 + 2] = p[1][2] 
    m[1 * 4 + 3] = p[1][3] 
    m[2 * 4 + 0] = p[2][0] 
    m[2 * 4 + 1] = p[2][1] 
    m[2 * 4 + 2] = p[2][2] 
    m[2 * 4 + 3] = p[2][3] 
    m[3 * 4 + 0] = p[3][0] 
    m[3 * 4 + 1] = p[3][1] 
    m[3 * 4 + 2] = p[3][2] 
    m[3 * 4 + 3] = p[3][3] 

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
        
        const p: Mat4D = [
       
            [bp[0][0] * ap[0][0] + bp[0][1] * ap[1][0] + bp[0][2] * ap[2][0] + bp[0][3] * ap[3][0],
            bp[0][0] * ap[0][1] + bp[0][1] * ap[1][1] + bp[0][2] * ap[2][1] + bp[0][3] * ap[3][1],
            bp[0][0] * ap[0][2] + bp[0][1] * ap[1][2] + bp[0][2] * ap[2][2] + bp[0][3] * ap[3][2],
            bp[0][0] * ap[0][3] + bp[0][1] * ap[1][3] + bp[0][2] * ap[2][3] + bp[0][3] * ap[3][3],
            ],
            [bp[1][0] * ap[0][0] + bp[1][1] * ap[1][0] + bp[1][2] * ap[2][0] + bp[1][3] * ap[3][0],
            bp[1][0] * ap[0][1] + bp[1][1] * ap[1][1] + bp[1][2] * ap[2][1] + bp[1][3] * ap[3][1],
            bp[1][0] * ap[0][2] + bp[1][1] * ap[1][2] + bp[1][2] * ap[2][2] + bp[1][3] * ap[3][2],
            bp[1][0] * ap[0][3] + bp[1][1] * ap[1][3] + bp[1][2] * ap[2][3] + bp[1][3] * ap[3][3],
            ],
            [bp[2][0] * ap[0][0] + bp[2][1] * ap[1][0] + bp[2][2] * ap[2][0] + bp[2][3] * ap[3][0],
            bp[2][0] * ap[0][1] + bp[2][1] * ap[1][1] + bp[2][2] * ap[2][1] + bp[2][3] * ap[3][1],
            bp[2][0] * ap[0][2] + bp[2][1] * ap[1][2] + bp[2][2] * ap[2][2] + bp[2][3] * ap[3][2],
            bp[2][0] * ap[0][3] + bp[2][1] * ap[1][3] + bp[2][2] * ap[2][3] + bp[2][3] * ap[3][3],
            ],
            [bp[3][0] * ap[0][0] + bp[3][1] * ap[1][0] + bp[3][2] * ap[2][0] + bp[3][3] * ap[3][0],
            bp[3][0] * ap[0][1] + bp[3][1] * ap[1][1] + bp[3][2] * ap[2][1] + bp[3][3] * ap[3][1],
            bp[3][0] * ap[0][2] + bp[3][1] * ap[1][2] + bp[3][2] * ap[2][2] + bp[3][3] * ap[3][2],
            bp[3][0] * ap[0][3] + bp[3][1] * ap[1][3] + bp[3][2] * ap[2][3] + bp[3][3] * ap[3][3],
            ]
        ]

        return m4FromPositions(p)
    }





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

        const tmp_0 =  p[2][2] * p[3][3];
        const tmp_1 =  p[3][2] * p[2][3];
        const tmp_2 =  p[1][2] * p[3][3];
        const tmp_3 =  p[3][2] * p[1][3];
        const tmp_4 =  p[1][2] * p[2][3];
        const tmp_5 =  p[2][2] * p[1][3];
        const tmp_6 =  p[0][2] * p[3][3];
        const tmp_7 =  p[3][2] * p[0][3];
        const tmp_8 =  p[0][2] * p[2][3];
        const tmp_9 =  p[2][2] * p[0][3];
        const tmp_10 = p[0][2] * p[1][3];
        const tmp_11 = p[1][2] * p[0][3];
        const tmp_12 = p[2][0] * p[3][1];
        const tmp_13 = p[3][0] * p[2][1];
        const tmp_14 = p[1][0] * p[3][1];
        const tmp_15 = p[3][0] * p[1][1];
        const tmp_16 = p[1][0] * p[2][1];
        const tmp_17 = p[2][0] * p[1][1];
        const tmp_18 = p[0][0] * p[3][1];
        const tmp_19 = p[3][0] * p[0][1];
        const tmp_20 = p[0][0] * p[2][1];
        const tmp_21 = p[2][0] * p[0][1];
        const tmp_22 = p[0][0] * p[1][1];
        const tmp_23 = p[1][0] * p[0][1];

        const t0 =  (tmp_0 * p[1][1] + tmp_3 *  p[2][1] + tmp_4 *   p[3][1]) -
                    (tmp_1 * p[1][1] + tmp_2 * p[2][1] + tmp_5 *  p[3][1]);
        const t1 =  (tmp_1 * p[0][1] + tmp_6 * p[2][1] + tmp_9 *  p[3][1]) -
                    (tmp_0 * p[0][1] + tmp_7 * p[2][1] + tmp_8 *  p[3][1]);
        const t2 =  (tmp_2 * p[0][1] + tmp_7 * p[1][1] + tmp_10 * p[3][1]) -
                    (tmp_3 * p[0][1] + tmp_6 * p[1][1] + tmp_11 * p[3][1]);
        const t3 =  (tmp_5 * p[0][1] + tmp_8 * p[1][1] + tmp_11 * p[2][1]) -
                    (tmp_4 * p[0][1] + tmp_9 * p[1][1] + tmp_10 * p[2][1]);

        const d = 1.0 / (p[0][0] * t0 + p[1][0] * t1 + p[2][0] * t2 + p[3][0] * t3);

        return [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 *  p[1][0] + tmp_2 *  p[2][0] + tmp_5 *  p[3][0]) -
                (tmp_0 *   p[1][0] + tmp_3 *  p[2][0] + tmp_4 *  p[3][0])),
            d * ((tmp_0 *  p[0][0] + tmp_7 *  p[2][0] + tmp_8 *  p[3][0]) -
                (tmp_1 *   p[0][0] + tmp_6 *  p[2][0] + tmp_9 *  p[3][0])),
            d * ((tmp_3 *  p[0][0] + tmp_6 *  p[1][0] + tmp_11 * p[3][0]) -
                (tmp_2 *   p[0][0] + tmp_7 *  p[1][0] + tmp_10 * p[3][0])),
            d * ((tmp_4 *  p[0][0] + tmp_9 *  p[1][0] + tmp_10 * p[2][0]) -
                (tmp_5 *   p[0][0] + tmp_8 *  p[1][0] + tmp_11 * p[2][0])),
            d * ((tmp_12 * p[1][3] + tmp_15 * p[2][3] + tmp_16 * p[3][3]) -
                (tmp_13 *  p[1][3] + tmp_14 * p[2][3] + tmp_17 * p[3][3])),
            d * ((tmp_13 * p[0][3] + tmp_18 * p[2][3] + tmp_21 * p[3][3]) -
                (tmp_12 *  p[0][3] + tmp_19 * p[2][3] + tmp_20 * p[3][3])),
            d * ((tmp_14 * p[0][3] + tmp_19 * p[1][3] + tmp_22 * p[3][3]) -
                (tmp_15 *  p[0][3] + tmp_18 * p[1][3] + tmp_23 * p[3][3])),
            d * ((tmp_17 * p[0][3] + tmp_20 * p[1][3] + tmp_23 * p[2][3]) -
                (tmp_16 *  p[0][3] + tmp_21 * p[1][3] + tmp_22 * p[2][3])),
            d * ((tmp_14 * p[2][2] + tmp_17 * p[3][2] + tmp_13 * p[1][2]) -
                (tmp_16 *  p[3][2] + tmp_12 * p[1][2] + tmp_15 * p[2][2])),
            d * ((tmp_20 * p[3][2] + tmp_12 * p[0][2] + tmp_19 * p[2][2]) -
                (tmp_18 *  p[2][2] + tmp_21 * p[3][2] + tmp_13 * p[0][2])),
            d * ((tmp_18 * p[1][2] + tmp_23 * p[3][2] + tmp_15 * p[0][2]) -
                (tmp_22 *  p[3][2] + tmp_14 * p[0][2] + tmp_19 * p[1][2])),
            d * ((tmp_22 * p[2][2] + tmp_16 * p[0][2] + tmp_21 * p[1][2]) -
                (tmp_20 *  p[1][2] + tmp_23 * p[2][2] + tmp_17 * p[0][2]))
        ];
    }


export function m4Vec4multiply(m: Mat4, v: Vec4): Vec4 {

        const mm = m4AsPositions(m)

        return { 
            x: v.x * mm[0][0] + v.y * mm[1][0]! + v.z * mm[2][0]! + v.w * mm[3][0]!,
            y: v.x * mm[0][1] + v.y * mm[1][1]! + v.z * mm[2][1]! + v.w * mm[3][1]!, 
            z: v.x * mm[0][2] + v.y * mm[1][2]! + v.z * mm[2][2]! + v.w * mm[3][2]!, 
            w: v.x * mm[0][3] + v.y * mm[1][3]! + v.z * mm[2][3]! + v.w * mm[3][3]!

        }
    }


export function m4PositionMultiply(v: Vec3, m: Mat4): Vec3 {
    
    const v4 = {...v, w: 1}
    const dst = m4Vec4multiply(m, v4)

    return {x: dst.x/dst.w, y: dst.y/dst.w, z: dst.z/dst.w }
}

export function m4DirectionMultiply(v: Vec3, m: Mat4): Vec3 {
    
    const v4 = {...v, w: 0}
    const dst = m4Vec4multiply(m, v4)

    return { x: dst.x, y: dst.y, z: dst.z };

}


export function m4fromPositionAndEuler(position: Vec3, euler: Vec3): Mat4 {
    let mat4 = m4translate(m4yRotation(0), position.x, position.y, position.z) ;
    mat4 = m4xRotate(mat4, euler.x);
    mat4 = m4yRotate(mat4, euler.y);
    mat4 = m4zRotate(mat4, euler.z);
    return mat4;
}