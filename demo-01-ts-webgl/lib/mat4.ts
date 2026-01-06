import { Vec3, subtractVectors, cross, normalize, Vec4 } from './vec'


export type Mat4Array = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
]

export type Mat4Scaling = [
    [number, 0,      0,      0],
    [0,      number, 0,      0],
    [0,      0,      number, 0],
    [0,      0,      0,      1]
]

export type Mat4Translation = [
    [1,      0,      0,      0],
    [0,      1,      0,      0],
    [0,      0,      1,      0],
    [number, number, number, 1]
]

export type Mat4XRotation = [
    [1,      0,      0,      0],
    [0,      number, number, 0],
    [0,      number, number, 0],
    [0,      0,      0,      1],
]

export type Mat4YRotation = [
    [number, 0,      number, 0],
    [0,      1,      0,      0],
    [number, 0,      number, 0],
    [0,      0,      0,      1],
]

export type Mat4ZRotation = [
    [number, number, 0,      0],
    [number, number, 0,      0],
    [0,      0,      1,      0],
    [0,      0,      0,      1],
]

export type Mat4 = [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
]

export function m4ToArray(p: Mat4): Mat4Array {
        
    const m: Mat4Array = [
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
        0,0,0,0,
    ]
 
    m[0] = p[0][0]
    m[1] = p[0][1]
    m[2] = p[0][2] 
    m[3] = p[0][3]
    m[4] = p[1][0]
    m[5] = p[1][1] 
    m[6] = p[1][2] 
    m[7] = p[1][3] 
    m[8] = p[2][0] 
    m[9] = p[2][1] 
    m[10] = p[2][2] 
    m[11] = p[2][3] 
    m[12] = p[3][0] 
    m[13] = p[3][1] 
    m[14] = p[3][2] 
    m[15] = p[3][3] 

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
            [xAxis.x,          xAxis.y,          xAxis.z,          0],
            [yAxis.x,          yAxis.y,          yAxis.z,          0],
            [zAxis.x,          zAxis.y,          zAxis.z,          0],
            [cameraPosition.x, cameraPosition.y, cameraPosition.z, 1]
        ];
    }

export type Mat4Projection = [
    [number, 0,      0,      0],
    [0,      number, 0,      0],
    [0,      0,      number,-1|0],
    [number, number, number, 0|1],
]

export function m4perspective(fieldOfViewInRadians: number, aspect: number, near: number, far: number): Mat4Projection {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        const rangeInv = 1.0 / (near - far);

        return [
            [f / aspect, 0,  0,                          0],
            [0,          f,  0,                          0],
            [0,          0,  (near + far) * rangeInv,   -1],
            [0,          0,  near * far * rangeInv * 2,  0]
        ];
    }



export function m4orthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4Projection {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    return [
        [-2 * lr,             0,                   0,                 0],
        [0,                   -2 * bt,             0,                 0],
        [0,                   0,                   2 * nf,            0],
        [(left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1]
    ];
}

export function m4multiply(a: Mat4, b: Mat4): Mat4 {
        
        return [
       
        [   b[0][0] * a[0][0] + b[0][1] * a[1][0] + b[0][2] * a[2][0] + b[0][3] * a[3][0],
            b[0][0] * a[0][1] + b[0][1] * a[1][1] + b[0][2] * a[2][1] + b[0][3] * a[3][1],
            b[0][0] * a[0][2] + b[0][1] * a[1][2] + b[0][2] * a[2][2] + b[0][3] * a[3][2],
            b[0][0] * a[0][3] + b[0][1] * a[1][3] + b[0][2] * a[2][3] + b[0][3] * a[3][3]
        ],
        [   b[1][0] * a[0][0] + b[1][1] * a[1][0] + b[1][2] * a[2][0] + b[1][3] * a[3][0],
            b[1][0] * a[0][1] + b[1][1] * a[1][1] + b[1][2] * a[2][1] + b[1][3] * a[3][1],
            b[1][0] * a[0][2] + b[1][1] * a[1][2] + b[1][2] * a[2][2] + b[1][3] * a[3][2],
            b[1][0] * a[0][3] + b[1][1] * a[1][3] + b[1][2] * a[2][3] + b[1][3] * a[3][3]
        ],
        [   b[2][0] * a[0][0] + b[2][1] * a[1][0] + b[2][2] * a[2][0] + b[2][3] * a[3][0],
            b[2][0] * a[0][1] + b[2][1] * a[1][1] + b[2][2] * a[2][1] + b[2][3] * a[3][1],
            b[2][0] * a[0][2] + b[2][1] * a[1][2] + b[2][2] * a[2][2] + b[2][3] * a[3][2],
            b[2][0] * a[0][3] + b[2][1] * a[1][3] + b[2][2] * a[2][3] + b[2][3] * a[3][3]
        ],
        [   b[3][0] * a[0][0] + b[3][1] * a[1][0] + b[3][2] * a[2][0] + b[3][3] * a[3][0],
            b[3][0] * a[0][1] + b[3][1] * a[1][1] + b[3][2] * a[2][1] + b[3][3] * a[3][1],
            b[3][0] * a[0][2] + b[3][1] * a[1][2] + b[3][2] * a[2][2] + b[3][3] * a[3][2],
            b[3][0] * a[0][3] + b[3][1] * a[1][3] + b[3][2] * a[2][3] + b[3][3] * a[3][3]
        ]
        ]

    }


export function m4translation(tx: number, ty: number, tz: number): Mat4Translation {
        return [
            [1,  0,  0,  0],
            [0,  1,  0,  0],
            [0,  0,  1,  0],
            [tx, ty, tz, 1],
        ];
    }

export function m4xRotation(angleInRadians: number): Mat4XRotation {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            [1,  0, 0, 0],
            [0,  c, s, 0],
            [0, -s, c, 0],
            [0,  0, 0, 1],
        ];
    }

export function m4yRotation(angleInRadians: number): Mat4YRotation {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            [c, 0, -s, 0],
            [0, 1,  0, 0],
            [s, 0,  c, 0],
            [0, 0,  0, 1],
        ];
    }

export function m4zRotation(angleInRadians: number): Mat4ZRotation {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            [ c, s, 0, 0],
            [-s, c, 0, 0],
            [ 0, 0, 1, 0],
            [ 0, 0, 0, 1],
        ];
    }

export function m4scaling(sx: number, sy: number, sz: number): Mat4 {
        return [
            [sx, 0, 0, 0],
            [0, sy, 0, 0],
            [0, 0, sz, 0],
            [0, 0, 0,  1],
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
    

export function m4transpose(m: Mat4) {
    const dst: Mat4 = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
    ];

    dst[0][0] = m[0][0];
    dst[0][1] = m[1][0];
    dst[0][2] = m[2][0];
    dst[0][3] = m[3][0];

    dst[1][0] = m[0][1];
    dst[1][1] = m[1][1];
    dst[1][2] = m[2][1];
    dst[1][3] = m[3][1];

    dst[2][0] = m[0][2];
    dst[2][1] = m[1][2];
    dst[2][2] = m[2][2];
    dst[2][3] = m[3][2];

    dst[3][0] = m[0][3];
    dst[3][1] = m[1][3];
    dst[3][2] = m[2][3];
    dst[3][3] = m[3][3];

    return dst;
  }

export function m4inverse(m: Mat4): Mat4 {
        
        const tmp_0 =  m[2][2] * m[3][3];
        const tmp_1 =  m[3][2] * m[2][3];
        const tmp_2 =  m[1][2] * m[3][3];
        const tmp_3 =  m[3][2] * m[1][3];
        const tmp_4 =  m[1][2] * m[2][3];
        const tmp_5 =  m[2][2] * m[1][3];
        const tmp_6 =  m[0][2] * m[3][3];
        const tmp_7 =  m[3][2] * m[0][3];
        const tmp_8 =  m[0][2] * m[2][3];
        const tmp_9 =  m[2][2] * m[0][3];
        const tmp_10 = m[0][2] * m[1][3];
        const tmp_11 = m[1][2] * m[0][3];
        const tmp_12 = m[2][0] * m[3][1];
        const tmp_13 = m[3][0] * m[2][1];
        const tmp_14 = m[1][0] * m[3][1];
        const tmp_15 = m[3][0] * m[1][1];
        const tmp_16 = m[1][0] * m[2][1];
        const tmp_17 = m[2][0] * m[1][1];
        const tmp_18 = m[0][0] * m[3][1];
        const tmp_19 = m[3][0] * m[0][1];
        const tmp_20 = m[0][0] * m[2][1];
        const tmp_21 = m[2][0] * m[0][1];
        const tmp_22 = m[0][0] * m[1][1];
        const tmp_23 = m[1][0] * m[0][1];

        const t0 =  (tmp_0 * m[1][1] + tmp_3 *  m[2][1] + tmp_4 *   m[3][1]) -
                    (tmp_1 * m[1][1] + tmp_2 * m[2][1] + tmp_5 *  m[3][1]);
        const t1 =  (tmp_1 * m[0][1] + tmp_6 * m[2][1] + tmp_9 *  m[3][1]) -
                    (tmp_0 * m[0][1] + tmp_7 * m[2][1] + tmp_8 *  m[3][1]);
        const t2 =  (tmp_2 * m[0][1] + tmp_7 * m[1][1] + tmp_10 * m[3][1]) -
                    (tmp_3 * m[0][1] + tmp_6 * m[1][1] + tmp_11 * m[3][1]);
        const t3 =  (tmp_5 * m[0][1] + tmp_8 * m[1][1] + tmp_11 * m[2][1]) -
                    (tmp_4 * m[0][1] + tmp_9 * m[1][1] + tmp_10 * m[2][1]);

        const d = 1.0 / (m[0][0] * t0 + m[1][0] * t1 + m[2][0] * t2 + m[3][0] * t3);

        return [
            [
                d * t0,
                d * t1,
                d * t2,
                d * t3,
            ],
            [
                d * ((tmp_1 *  m[1][0] + tmp_2 *  m[2][0] + tmp_5 *  m[3][0]) -
                    (tmp_0 *   m[1][0] + tmp_3 *  m[2][0] + tmp_4 *  m[3][0])),
                d * ((tmp_0 *  m[0][0] + tmp_7 *  m[2][0] + tmp_8 *  m[3][0]) -
                    (tmp_1 *   m[0][0] + tmp_6 *  m[2][0] + tmp_9 *  m[3][0])),
                d * ((tmp_3 *  m[0][0] + tmp_6 *  m[1][0] + tmp_11 * m[3][0]) -
                    (tmp_2 *   m[0][0] + tmp_7 *  m[1][0] + tmp_10 * m[3][0])),
                d * ((tmp_4 *  m[0][0] + tmp_9 *  m[1][0] + tmp_10 * m[2][0]) -
                    (tmp_5 *   m[0][0] + tmp_8 *  m[1][0] + tmp_11 * m[2][0])),
            ],
            [
                d * ((tmp_12 * m[1][3] + tmp_15 * m[2][3] + tmp_16 * m[3][3]) -
                    (tmp_13 *  m[1][3] + tmp_14 * m[2][3] + tmp_17 * m[3][3])),
                d * ((tmp_13 * m[0][3] + tmp_18 * m[2][3] + tmp_21 * m[3][3]) -
                    (tmp_12 *  m[0][3] + tmp_19 * m[2][3] + tmp_20 * m[3][3])),
                d * ((tmp_14 * m[0][3] + tmp_19 * m[1][3] + tmp_22 * m[3][3]) -
                    (tmp_15 *  m[0][3] + tmp_18 * m[1][3] + tmp_23 * m[3][3])),
                d * ((tmp_17 * m[0][3] + tmp_20 * m[1][3] + tmp_23 * m[2][3]) -
                    (tmp_16 *  m[0][3] + tmp_21 * m[1][3] + tmp_22 * m[2][3])),
            ],
            [
                d * ((tmp_14 * m[2][2] + tmp_17 * m[3][2] + tmp_13 * m[1][2]) -
                    (tmp_16 *  m[3][2] + tmp_12 * m[1][2] + tmp_15 * m[2][2])),
                d * ((tmp_20 * m[3][2] + tmp_12 * m[0][2] + tmp_19 * m[2][2]) -
                    (tmp_18 *  m[2][2] + tmp_21 * m[3][2] + tmp_13 * m[0][2])),
                d * ((tmp_18 * m[1][2] + tmp_23 * m[3][2] + tmp_15 * m[0][2]) -
                    (tmp_22 *  m[3][2] + tmp_14 * m[0][2] + tmp_19 * m[1][2])),
                d * ((tmp_22 * m[2][2] + tmp_16 * m[0][2] + tmp_21 * m[1][2]) -
                    (tmp_20 *  m[1][2] + tmp_23 * m[2][2] + tmp_17 * m[0][2]))
            ]
        ]
        
    }


export function m4Vec4multiply(m: Mat4, v: Vec4): Vec4 {

        return { 
            x: v.x * m[0][0] + v.y * m[1][0] + v.z * m[2][0] + v.w * m[3][0],
            y: v.x * m[0][1] + v.y * m[1][1] + v.z * m[2][1] + v.w * m[3][1], 
            z: v.x * m[0][2] + v.y * m[1][2] + v.z * m[2][2] + v.w * m[3][2], 
            w: v.x * m[0][3] + v.y * m[1][3] + v.z * m[2][3] + v.w * m[3][3]
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