import { Camera } from "./camera";
import { InputState } from "./input";
import { DirectionalLight } from "./light";
import { m4fromPositionAndEuler, m4multiply, Mat4 } from "./mat4";
import { drawMesh, Mesh } from "./mesh";
import { RenderProgram } from "./BasicRenderProgram";
import { GlState } from "./gl";


export type SceneNode = {
   localTransform: Mat4;
   parent?: SceneNode;
   children: SceneNode[]; // empty array if no children
   mesh?: Mesh;
}

export type Scene = SceneNode[]

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
   glState: GlState, 
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