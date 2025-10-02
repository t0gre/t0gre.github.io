
import { Vec3 } from "./vec";

export type Vertices = {
    positions: Float32Array,
    normals?: Float32Array,
    texcoords?: Float32Array,
    indices?: Uint16Array,
  }

export type Material = {
    color: Vec3
    specularColor: Vec3
    shininess: number
}

export type Mesh = {
    vertices: Vertices;
    material: Material;
    _id?: number    // undefined means it does not have a vao initialised, 
    // draw function will check it and set it. not to be set manually 
}
