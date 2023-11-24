import { Vec3 } from "./vec3"


export type Camera = {
    fieldOfViewRadians: number
    aspect: number
    near: number
    far: number
    up: Vec3
    position: Vec3
    rotation: Vec3
    viewWorldPositionLocation: WebGLUniformLocation    
}

export function createCamera(
    gl: WebGL2RenderingContext, 
    material: WebGLProgram, 
    fieldOfViewRadians: number,
    aspect: number,
    near: number,
    far: number,
    up: Vec3, 
    position: Vec3,
    rotation: Vec3,) {
    const viewWorldPositionLocation = gl.getUniformLocation(material, "u_viewWorldPosition");
            

    const camera: Camera =  { 
                viewWorldPositionLocation: viewWorldPositionLocation!,
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