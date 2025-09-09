import { Mat4 } from "./mat4"
import { Vec3 } from "./vec"


export type Camera = {
    fieldOfViewRadians: number
    aspect: number
    near: number
    far: number
    up: Vec3
    transform: Mat4
}
