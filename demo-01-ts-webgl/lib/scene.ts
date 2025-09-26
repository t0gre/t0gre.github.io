import { Camera } from "./camera";
import { InputState } from "./input";
import { DirectionalLight } from "./light";
import { m4fromPositionAndEuler, m4multiply, Mat4 } from "./mat4";
import { drawMesh, Mesh } from "./mesh";
import { RenderProgram } from "./BasicRenderProgram";
import { GlState } from "./gl";


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
   const parentWorldTransform = node.parent?._worldTransform ?? m4fromPositionAndEuler([0,0,0], [0,0,0]);
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


export function drawSceneNode(
   node: SceneNode, 
   glState: GlState, 
   renderProgram: RenderProgram,
   light: DirectionalLight,
   camera: Camera,
   input: InputState,
) {
      
      
      if (node.mesh) {
         drawMesh(node.mesh, glState, renderProgram, light, camera, input, node._worldTransform);
      }

      if (node.children) {
         node.children.forEach(child => {
            drawSceneNode(
               child, 
               glState, 
               renderProgram, 
               light, 
               camera, 
               input)
            });
      }
}

export function drawScene(
    glState: GlState,  
    scene: SceneNode[], 
    light: DirectionalLight, 
    camera: Camera, 
    input: InputState, 
    renderProgram: RenderProgram) {

    const gl = glState.gl;

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
   

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    scene.forEach(node => {
        drawSceneNode(node, glState, renderProgram, light, camera, input);
    })
        
    return 0
    
}