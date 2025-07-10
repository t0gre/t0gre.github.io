import { Mesh } from "./mesh";
import { Vec3 } from "./vec";

export type Pose = {
   position: Vec3;
   rotation: Vec3;
}

export type Object3D = {
   pose: Pose;
   parent?: Object3D;
   mesh?: Mesh;
}