import { Vec3 } from "./vec3";


export type Light = {
    worldPositionLocation: WebGLUniformLocation;
    colorLocation: WebGLUniformLocation;
    specularColorLocation: WebGLUniformLocation;
    rotation: Vec3;
    position: Vec3;
}


export function createLight(gl: WebGL2RenderingContext, material: WebGLProgram, position: Vec3, rotation: Vec3): Light {
    // setup uniforms
    const lightWorldPositionLocation =
    gl.getUniformLocation(material, "u_lightWorldPosition");
    const lightColorLocation =
    gl.getUniformLocation(material, "u_lightColor");
    const specularColorLocation =
    gl.getUniformLocation(material, "u_specularColor");

    const light: Light = {
        worldPositionLocation: lightWorldPositionLocation!,
        colorLocation: lightColorLocation!,
        specularColorLocation: specularColorLocation!,
        position,
        rotation
    }

    return light
}