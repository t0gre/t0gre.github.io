import { Mat4, m4fromPositionAndEuler } from "./mat4"
import { Vec3 } from "./vec"


export type Camera = {
    fieldOfViewRadians: number
    aspect: number
    near: number
    far: number
    up: Vec3
    transform: Mat4
}

export function createCamera(
    fieldOfViewRadians: number,
    aspect: number,
    near: number,
    far: number,
    up: Vec3, 
    position: Vec3,
    rotation: Vec3,) {          

    const camera: Camera =  { 
                fieldOfViewRadians,
                aspect,
                near,
                far,
                up, 
                transform: m4fromPositionAndEuler(position, rotation)
        }

    return camera
    
}