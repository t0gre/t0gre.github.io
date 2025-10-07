import { m4perspective, Mat4 } from "./mat4"
import { Vec3 } from "./vec"


export type Camera = {
    fieldOfViewRadians: number
    aspect: number
    near: number
    far: number
    up: Vec3
    transform: Mat4
}

export function getProjectionMatrix(camera: Camera) {
    return m4perspective(camera.fieldOfViewRadians, camera.aspect, camera.near, camera.far)
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