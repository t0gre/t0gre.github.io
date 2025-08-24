import { Camera } from "./camera";
import { InputState } from "./input";
import { DirectionalLight } from "./light";
import { m4fromPositionAndEuler, m4multiply, Mat4 } from "./mat4";
import { drawMesh, Mesh } from "./mesh";
import { RenderProgram } from "./BasicRenderProgram";


export type SceneNode = {
   localTransform: Mat4;
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




export function drawSceneNode(
   node: SceneNode, 
   glState: glState, 
   renderProgram: RenderProgram,
   light: DirectionalLight,
   camera: Camera,
   input: InputState,
   parentWorldTransform?: Mat4   
) {
      parentWorldTransform = parentWorldTransform || m4fromPositionAndEuler([0,0,0], [0,0,0]);
      
      const worldMatrix = m4multiply(parentWorldTransform, node.localTransform);
      
      if (node.mesh) {
         drawMesh(node.mesh, glState, renderProgram, light, camera, input, worldMatrix);
      }

      if (node.children) {
         node.children.forEach(child => {
            drawSceneNode(
               child, 
               glState, 
               renderProgram, 
               light, 
               camera, 
               input, 
               worldMatrix)
            });
      }
}
