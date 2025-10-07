export type Vec2 = [number, number]
export type Vec3 = [number, number, number]
export type Vec4 = [number, number, number, number]

export function subtractVectors(a: Vec3, b: Vec3): Vec3 {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function addVectors(a: Vec3, b: Vec3): Vec3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function scaleVector(vec: Vec3, scalar: number): Vec3 {
    return [vec[0] * scalar, vec[1] * scalar, vec[2] * scalar]
}

export function normalize(v: Vec3): Vec3 {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
}

export function cross(a: Vec3, b: Vec3): Vec3 {
    return [a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]];
}

export function dot(a: Vec3, b: Vec3): number {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
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
    const x = orbitTarget[0] + orbitRadius * Math.sin(elevation) * Math.sin(azimuth);
    const y = orbitTarget[1] + orbitRadius * Math.cos(elevation);
    const z = orbitTarget[2] + orbitRadius * Math.sin(elevation) * Math.cos(azimuth);

    return [x,y,z]
}