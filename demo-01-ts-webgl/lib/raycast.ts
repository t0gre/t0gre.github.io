import { Vec3 } from "./vec";

export type Triangle = [Vec3, Vec3, Vec3]

export type Ray = {
    origin: Vec3,
    direction: Vec3 
}

export function rayIntersectsTriangle(ray: Ray, triangle: Triangle): Vec3 {
    return [0,0,0]
}