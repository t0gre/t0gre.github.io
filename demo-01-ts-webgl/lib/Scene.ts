import { Mesh } from "./mesh";
import { Vec3 } from "./vec";

export type Pose = {
   position: Vec3;
   rotation: Vec3;
}

export type SceneNode = {
   pose: Pose;
   parent?: SceneNode;
   children: SceneNode[]; // empty array if no children
   mesh?: Mesh;
}

export function setParent(node: SceneNode, parent: SceneNode) {
   
   // Remove node from its current parent's children array
   if (node.parent) {
      node.parent.children = node.parent.children.filter(child => child !== node); // might be slow, but it's simple
   }

   node.parent = parent;
   parent.children.push(node);
}

export type Scene = SceneNode[];