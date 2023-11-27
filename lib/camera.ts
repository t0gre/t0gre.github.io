import { Vec3 } from "./vec"


export type Camera = {
    fieldOfViewRadians: number
    aspect: number
    near: number
    far: number
    up: Vec3
    position: Vec3
    rotation: Vec3
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
                position,
                rotation,
        }

    return camera
    
}