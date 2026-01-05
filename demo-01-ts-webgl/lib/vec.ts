export type Vec2 = { x: number, y: number }
export type Vec3 = { x: number, y: number, z: number }
export type Vec4 = { x: number, y: number, z: number, w: number }

export type Euler = Vec3
export type Color = { r: number, g: number, b: number }

export const QUAT_ORIGIN: Vec4 = { x: 0, y: 0, z: 0, w: 0 } 
export const POS_ORIGIN: Vec3 = { x: 0, y: 0, z: 0 } 
export const ROT_NONE: Vec3 = { x: 0, y: 0, z: 0 }

export function colorToArray(col: Color): [number, number, number] {
    return [col.r, col.g, col.b]
}

export function eulerToArray(eul: Euler): [number, number, number] {
    return [eul.x, eul.y, eul.z]
}

export function vec3ToArray(vec: Vec3): [number, number, number] {
    return [vec.x, vec.y, vec.z]
}

export function vec4ToArray(vec: Vec4): [number, number, number, number] {
    return [vec.x, vec.y, vec.z, vec.w]
}

export function subtractVectors(a: Vec3, b: Vec3): Vec3 {
    return {
        x: a.x - b.x, 
        y: a.y - b.y, 
        z: a.z - b.z
    };
}

export function addVectors(a: Vec3, b: Vec3): Vec3 {
    return {
        x: a.x + b.x, 
        y: a.y + b.y, 
        z: a.z + b.z
    };
}

export function scaleVector(vec: Vec3, scalar: number): Vec3 {
    return {
        x: vec.x * scalar, 
        y: vec.y * scalar, 
        z: vec.z * scalar
    }
}

export function normalize(v: Vec3): Vec3 {
    const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        return {
            x: v.x / length, 
            y: v.y / length, 
            z: v.z / length
        };
    } else {
        return {x: 0, y: 0, z: 0};
    }
}

export function cross(a: Vec3, b: Vec3): Vec3 {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}

export function dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function calculateOrbitPosition(
    azimuth: number, 
    elevation: number, 
    orbitTarget: Vec3,
    orbitRadius: number
): Vec3 {
    // Clamp elevation to avoid flipping
    elevation = Math.max(0.01, Math.min(Math.PI / 2 - 0.01, elevation));

    // Spherical to Cartesian
    const x = orbitTarget.x + orbitRadius * Math.sin(elevation) * Math.sin(azimuth);
    const y = orbitTarget.y + orbitRadius * Math.cos(elevation);
    const z = orbitTarget.z + orbitRadius * Math.sin(elevation) * Math.cos(azimuth);

    return {x,y,z}
}