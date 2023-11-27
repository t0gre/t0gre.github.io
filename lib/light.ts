import { Vec3 } from "./vec";


export type Light = {
    color: Vec3;
    specularColor: Vec3;
    rotation: Vec3;
    position: Vec3;
}


export function createLight(position: Vec3, rotation: Vec3, color: Vec3, specularColor: Vec3): Light {

    const light: Light = {
        position,
        rotation,
        color,
        specularColor
    }

    return light
}