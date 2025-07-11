import { Mesh } from "./mesh";
import { Vec3 } from "./vec";

export type Pose = {
   position: Vec3;
   rotation: Vec3;
}

export type SceneNode = {
   pose: Pose;
   parent?: SceneNode;
   mesh?: Mesh;
}

export type Scene = SceneNode[];