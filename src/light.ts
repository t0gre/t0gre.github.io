import { Vec3 } from "./vec";


export type PointLight = {
    color: Vec3;
    specularColor: Vec3;
    rotation: Vec3;
    position: Vec3;
}


export function createPointLight(
    position: Vec3, 
    rotation: Vec3, 
    color: Vec3, 
    specularColor: Vec3): PointLight {

    const light: PointLight = {
        position,
        rotation,
        color,
        specularColor
    }

    return light
}


export type DirectionalLight = {
    color: Vec3;
    rotation: Vec3; 
}


export function createDirectionalLight(
    rotation: Vec3, 
    color: Vec3): DirectionalLight {

    const light: DirectionalLight = {
        rotation,
        color,     
    }

    return light
}