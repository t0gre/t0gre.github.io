import { m4fromPositionAndEuler, m4multiply, Mat4 } from "./mat4";
import { Mesh } from "./mesh";
import { POS_ORIGIN, ROT_NONE } from "./vec";


export type SceneNode = {
   _localTransform: Mat4;
   _worldTransform: Mat4; // should not be set directly
   parent?: SceneNode;
   children: SceneNode[]; // empty array if no children
   mesh?: Mesh;
   name?: string
}

export type Scene = SceneNode[]


export function updateWorldTransform(node: SceneNode) {
   // n.b. this assumes the parent world transform is always up-to-date so we must keep it that way
   const parentWorldTransform = node.parent?._worldTransform ?? m4fromPositionAndEuler(POS_ORIGIN, ROT_NONE);
   node._worldTransform = m4multiply(parentWorldTransform, node._localTransform);

   node.children.forEach(child => updateWorldTransform(child))
}

export function updateTransform(node: SceneNode, transform: Mat4) {
   node._localTransform = transform
   updateWorldTransform(node)
}

export function initSceneNode(transform: Mat4, mesh?: Mesh, name?: string) {
   const node: SceneNode = {
   _localTransform: transform,
   _worldTransform: transform, // actually valid since there's no parent
   children: [], // empty array if no children
   mesh,
   name
}

   updateWorldTransform(node)
   return node
}

export function setParent(node: SceneNode, parent: SceneNode) {
   
   // Remove node from its current parent's children array
   if (node.parent) {
      node.parent.children = node.parent.children.filter(child => child !== node); // might be slow, but it's simple
   }

   node.parent = parent;
   updateWorldTransform(node)
   parent.children.push(node);
}

