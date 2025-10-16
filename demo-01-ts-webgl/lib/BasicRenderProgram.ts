import { AttributeBinding, createProgramFromRaw } from "./shaderUtils"
import { AmbientLight, DirectionalLight, PointLight } from "./light";
import {  m4fromPositionAndEuler, m4inverse, m4multiply, m4orthographic, m4perspective, m4PositionMultiply, m4xRotation, Mat4 } from "./mat4";
import { Camera } from "./camera";
import { InputState } from "./input";


import basicVertexSource from "./shaders/basic.vert?raw"
import basicFragmentSource from "./shaders/basic.frag?raw"

import shadowVertexSource from "./shaders/depth-only.vert?raw"
import shadowFragmentSource from "./shaders/depth-only.frag?raw"

import { GlState } from "./gl";
import { Mesh } from "./mesh";
import { SceneNode } from "./scene";
import { Vec3 } from "./vec";

function guaranteeUniformLocation(
    gl: WebGL2RenderingContext, 
    program: WebGLProgram,
    uniformName: string
): WebGLUniformLocation {
    const location = gl.getUniformLocation(program, uniformName);
    if (!location) {
        throw new Error(`failed to create uniform ${uniformName}, 
                     are you sure the shader uses it?`)
    } else {
        return location
    } 


}

export type MaterialUniform = {
      colorLocation: WebGLUniformLocation;
      specularColorLocation: WebGLUniformLocation;
      shininessLocation: WebGLUniformLocation;
}

export type AmbientLightUniform = {
      colorLocation: WebGLUniformLocation;
} 

export type DirectionalLightUniform = {
      colorLocation: WebGLUniformLocation;
      rotationLocation: WebGLUniformLocation;
      
} 

type ShadowUniform = {
    shadowMapLocation: WebGLUniformLocation;
    lightViewLocation: WebGLUniformLocation;
}

export type PointLightUniform = {
      colorLocation: WebGLUniformLocation;
      positionLocation: WebGLUniformLocation;
      constantLocation: WebGLUniformLocation;
      linearLocation: WebGLUniformLocation;
      quadraticLocation: WebGLUniformLocation;
} 


export type MainRenderProgram = {
    program: WebGLProgram;
    gl: WebGL2RenderingContext;
    worldMatrixUniformLocation: WebGLUniformLocation;
    viewUniformLocation:WebGLUniformLocation;
    projectionUniformLocation:WebGLUniformLocation;
    viewPositionUniformLocation: WebGLUniformLocation;
    materialUniform: MaterialUniform;
    ambientLightUniform: AmbientLightUniform;
    directionalLightUniform: DirectionalLightUniform;
    pointLightUniform: PointLightUniform;
    shadowUniform: ShadowUniform;
    // pointerLocation: WebGLUniformLocation;
    // canvasLocation: WebGLUniformLocation;
       }


export function updateUniforms(
    renderProgram: MainRenderProgram, 
    glState: GlState, 
    ambientLight: AmbientLight, 
    directionalLight: DirectionalLight,
    pointLight: PointLight, 
    camera: Camera, 
    shapeWorld: Mat4,
    mesh: Mesh, 
    lightViewProjectionMatrix: Mat4,
    // @ts-ignore not using input but might be useful in the future
    input?: InputState,
) {

        const gl = glState.gl;
        gl.useProgram(renderProgram.program)
        
        // update camera uniforms
        const viewMatrix = m4inverse(camera.transform);
        const projectionMatrix = m4perspective(
            camera.fieldOfViewRadians, 
            camera.aspect, 
            camera.near, 
            camera.far)
        gl.uniformMatrix4fv(renderProgram.worldMatrixUniformLocation, false, shapeWorld);  
        gl.uniformMatrix4fv(renderProgram.viewUniformLocation, false, viewMatrix); 
        gl.uniformMatrix4fv(renderProgram.projectionUniformLocation, false, projectionMatrix);
        
        // update material uniforms
        gl.uniform3fv(renderProgram.materialUniform.colorLocation, mesh.material.color);
        gl.uniform3fv(renderProgram.materialUniform.specularColorLocation, mesh.material.specularColor);
        gl.uniform1f(renderProgram.materialUniform.shininessLocation, mesh.material.shininess);


        // update light uniforms
        // set ambient light
        gl.uniform3fv(renderProgram.ambientLightUniform.colorLocation,ambientLight.color);
        // set directional light
        gl.uniform3fv(renderProgram.directionalLightUniform.colorLocation,directionalLight.color);
        gl.uniform3fv(renderProgram.directionalLightUniform.rotationLocation,directionalLight.rotation);

        // shadows
        // shadow map must be bound
        gl.uniformMatrix4fv(renderProgram.shadowUniform.lightViewLocation, false, lightViewProjectionMatrix);


        // set point light
        gl.uniform3fv(renderProgram.pointLightUniform.colorLocation,pointLight.color);
        gl.uniform3fv(renderProgram.pointLightUniform.positionLocation,pointLight.position);
        gl.uniform1f(renderProgram.pointLightUniform.constantLocation,pointLight.constant);
        gl.uniform1f(renderProgram.pointLightUniform.linearLocation,pointLight.linear);
        gl.uniform1f(renderProgram.pointLightUniform.quadraticLocation,pointLight.quadratic); 
       

        // gl.uniform2fv(renderProgram.pointerLocation, input.pointerPosition!)
        // gl.uniform2fv(renderProgram.canvasLocation, [gl.canvas.width, gl.canvas.height])
    }

export function initBasicRenderProgram(gl: WebGL2RenderingContext)  {

    const attributeBindings: AttributeBinding[] = [
        {name: "a_position", location: 0},
        {name: "a_normal", location: 1}
    ]

    const program = createProgramFromRaw(gl, basicVertexSource, basicFragmentSource, attributeBindings);

    if (!program) {
        throw new Error('failed to create basic material program, something wrong with the shaders?')
    }

    const worldMatrixUniformLocation = guaranteeUniformLocation(gl, program, "u_model")
    const viewUniformLocation = guaranteeUniformLocation(gl, program, "u_view")
    const viewPositionUniformLocation = guaranteeUniformLocation(gl, program, "u_view_position")
   
    const projectionUniformLocation = guaranteeUniformLocation(gl, program, "u_projection")
    
    const materialUniform: MaterialUniform = {
    colorLocation: guaranteeUniformLocation(gl, program, "u_material.color"),
    specularColorLocation: guaranteeUniformLocation(gl, program, "u_material.specular_color"),
    shininessLocation: guaranteeUniformLocation(gl, program, "u_material.shininess")
    }

    const ambientLightUniform: AmbientLightUniform = {
        colorLocation: guaranteeUniformLocation(gl, program, "u_ambient_light.color")
    }

    const directionalLightUniform: DirectionalLightUniform = {
        colorLocation: guaranteeUniformLocation(gl, program, "u_directional_light.color"),
        rotationLocation: guaranteeUniformLocation(gl, program, "u_directional_light.rotation"),
    }

    const shadowUniform: ShadowUniform = {
        shadowMapLocation: guaranteeUniformLocation(gl, program, "u_shadowMap"),
        lightViewLocation: guaranteeUniformLocation(gl, program, "u_lightViewProj")
    }

    const pointLightUniform: PointLightUniform = {
        colorLocation: guaranteeUniformLocation(gl, program, "u_point_light.color"),
        positionLocation: guaranteeUniformLocation(gl, program, "u_point_light.position"),
        constantLocation: guaranteeUniformLocation(gl, program, "u_point_light.constant"),
        linearLocation: guaranteeUniformLocation(gl, program, "u_point_light.linear"),
        quadraticLocation: guaranteeUniformLocation(gl, program, "u_point_light.quadratic")
    }


    ///////////////////
    // const pointerLocation = gl.getUniformLocation(program, "u_pointer");
    // if (!pointerLocation) {
    //     console.log('failed to create uniform "u_pointer", are you sure the shader uses it?')
    //     return undefined
    // } 

    // const canvasLocation = gl.getUniformLocation(program, "u_canvas");
    // if (!canvasLocation) {
    //     console.log('failed to create uniform "u_canvas", are you sure the shader uses it?')
    //     return undefined
    // } 

    const renderProgram: MainRenderProgram = {
        gl, 
        program, 
        worldMatrixUniformLocation, 
        viewUniformLocation, 
        viewPositionUniformLocation,
        projectionUniformLocation, 
        materialUniform,
        ambientLightUniform,
        directionalLightUniform,
        pointLightUniform, 
        shadowUniform
        // pointerLocation, 
        // canvasLocation
    }

    return renderProgram
        
    } 
        


export function drawMesh(
    mesh: Mesh, 
    glState: GlState, 
    renderProgram: MainRenderProgram, 
    ambientLight: AmbientLight,
    directionalLight: DirectionalLight,
    pointLight: PointLight, 
    camera: Camera, 
    worldMatrix: Mat4,
    lightViewProjectionMatrix: Mat4,
    input?: InputState){
      
        const drawInitializedMesh = (mesh: Mesh) => {
            const gl = glState.gl;
            const vao = glState.vaos.get(mesh._id!)!; // if the mesh has been inited then id will be present
            gl.useProgram(renderProgram.program);
            gl.bindVertexArray(vao);

            
            updateUniforms(
                renderProgram, 
                glState, 
                ambientLight,
                directionalLight,
                pointLight, 
                camera, 
                worldMatrix, 
                mesh,
                lightViewProjectionMatrix,
                input);

            if (mesh.vertices.indices) {
                gl.drawElements(glState.gl.TRIANGLES, mesh.vertices.indices.length, gl.UNSIGNED_SHORT,  0);
            } else {
                gl.drawArrays(glState.gl.TRIANGLES, 0, mesh.vertices.positions.length /3 );
            }
        } 

        if (!mesh._id) {
            // initialise the mesh 
            initMesh(mesh, glState, renderProgram)
            drawInitializedMesh(mesh)
        } else {
            // alre
            drawInitializedMesh(mesh)
        }
    }



export function initMesh(
        mesh: Mesh,
        glState: GlState,
        renderProgram: MainRenderProgram,
    ): Mesh | undefined {
    
    if (mesh._id) {
        console.log("mesh is already init, you shouldn't be trying to reinit it")
        return mesh
    }
    
    const {positions, normals, texcoords: _, indices} = mesh.vertices;
    const gl = glState.gl;
    const vao = gl.createVertexArray()
    if (!vao) {
        throw new Error('failed to create vao - thats bad')
    }
    gl.bindVertexArray(vao);

    
    // positions are always present
    const positionAttributeLocation = gl.getAttribLocation(renderProgram.program, "a_position");
    if (positionAttributeLocation === -1) {
        console.log('failed to create attribute "a_position" are you sure the shader uses it?')
        return undefined
    }
    // create the buffer
    const positionBuffer = gl.createBuffer();
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    // make it the current ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put stuff data into buffer
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(
        positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);


    // if (texcoords) {
    //     // create the buffer
    
    //     const texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
    //     if (texcoordAttributeLocation === -1) {
    //         console.log('failed to create attribute "a_texcoord" are you sure the shader uses it?')
    //         return undefined
    //     }
    //     const normalBuffer = gl.createBuffer();
    //     // turn on the attribute
    //     gl.enableVertexAttribArray(texcoordAttributeLocation);
    //     // make it the current ARRAY_BUFFER
    //     gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    //     // Put stuff data into buffer
    //     gl.bufferData(
    //         gl.ARRAY_BUFFER,
    //         texcoords,
    //         gl.STATIC_DRAW); 
    //     // Tell the attribute how to get data out of the buffer
    //     gl.vertexAttribPointer(
    //         texcoordAttributeLocation, 2, gl.FLOAT, true, 0, 0);
    
    // }

    // create the buffer
    if (normals) {
        const normalAttributeLocation = gl.getAttribLocation(renderProgram.program, "a_normal");
        if (normalAttributeLocation === -1) {
            console.log('failed to create attribute "a_normal" are you sure the shader uses it?')
            return undefined
        }
        const normalBuffer = gl.createBuffer();
        // turn on the attribute
        gl.enableVertexAttribArray(normalAttributeLocation);
        // make it the current ARRAY_BUFFER
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        // Put stuff data into buffer
        gl.bufferData(
            gl.ARRAY_BUFFER,
            normals,
            gl.STATIC_DRAW); 
        // Tell the attribute how to get data out of the buffer
        gl.vertexAttribPointer(
            normalAttributeLocation, 3, gl.FLOAT, true, 0, 0);
    }
    
    // indices are setuip differently, since they're not an attribute
    // if the geometry has indices create the buffer
    if (indices) {
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        indices,
        gl.STATIC_DRAW); 
    }
    

    // bind the shadow map 


    gl.bindVertexArray(null);
    
    mesh._id = glState.nextVaoId;
    glState.vaos.set(mesh._id!, vao); // _id is set above
    glState.nextVaoId += 1; // the id is just an ascending int
    
    return mesh
}


export function drawSceneNode(
   node: SceneNode, 
   glState: GlState, 
   renderProgram: MainRenderProgram,
   shadowProgram: ShadowRenderProgram,
   ambientLight: AmbientLight, 
   directionalLight: DirectionalLight,
   pointLight: PointLight, 
   camera: Camera,
   lightViewProjectionMatrix: Mat4,
   input?: InputState,
) {
      
      
      if (node.mesh) {
         drawMesh(
            node.mesh, 
            glState, 
            renderProgram, 
            ambientLight,
            directionalLight,
            pointLight, 
            camera, 
            node._worldTransform,
            lightViewProjectionMatrix);
      }

      if (node.children) {
         node.children.forEach(child => {
            drawSceneNode(
               child, 
               glState, 
               renderProgram, 
               shadowProgram,
               ambientLight,
               directionalLight,
               pointLight, 
               camera, 
               lightViewProjectionMatrix,
               input)
            });
      }
}

export function drawScene(
    glState: GlState,  
    scene: SceneNode[], 
    ambientLight: AmbientLight, 
    directionalLight: DirectionalLight,
    pointLight: PointLight,  
    camera: Camera, 
    renderProgram: MainRenderProgram,
    shadowMap: ShadowMap,
    shadowRenderProgram: ShadowRenderProgram,
    input?: InputState,) {

    const gl = glState.gl;


    // Compute light's view-projection matrix (for directional light)
    
    // Example: look from above, orthographic
    // You may want to use your own matrix utilities here
    const [x,y,z] = directionalLight.rotation

    const xMatrix = m4xRotation(x)
    const yMatrix = m4xRotation(y)
    const zMatrix = m4xRotation(z)

    const imaginaryCameraPosition: Vec3 = [10,10,10]
    let effectiveCameraPosition = m4PositionMultiply(imaginaryCameraPosition,xMatrix)
    effectiveCameraPosition = m4PositionMultiply(effectiveCameraPosition,yMatrix)
    effectiveCameraPosition = m4PositionMultiply(effectiveCameraPosition,zMatrix)

    const lightView = m4fromPositionAndEuler(effectiveCameraPosition, directionalLight.rotation);
    // const lightPosition: Vec3 = [100, 100, 100];
    // const target: Vec3 = [0, 0, 0]; // or your scene's center
    // const up: Vec3 = [0, 1, 0];
    // const lightView = m4lookAt(lightPosition, target, up);
    const lightProj = m4orthographic(-20, 20, -20, 20, 1, 100);
    const lightViewProjectionMatrix = m4multiply(lightProj, lightView);
    
    // 1. Render to shadow map
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMap.framebuffer);
    gl.viewport(0, 0, shadowMap.size, shadowMap.size);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    drawShadowScene(glState, scene, renderProgram, shadowRenderProgram, lightViewProjectionMatrix);

    // 2. Render main scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Bind shadow map texture to texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, shadowMap.depthTexture);

    // Pass shadowMap.depthTexture and getLightViewProj() to your main render program

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
   

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    scene.forEach(node => {
        drawSceneNode(
         node, 
         glState, 
         renderProgram, 
         shadowRenderProgram,
         ambientLight,
         directionalLight,
         pointLight, 
         camera, 
         lightViewProjectionMatrix,
         input);
    })
        
    return 0
    
}


///////////////////// shadows

type ShadowMap = { 
    framebuffer: WebGLFramebuffer; 
    depthTexture: WebGLTexture;
    size: number

}
export function createShadowMap(gl: WebGL2RenderingContext, size = 2048): ShadowMap {
    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return { framebuffer, depthTexture, size };
}

type ShadowRenderProgram = {
        gl: WebGL2RenderingContext
        program: WebGLProgram
        u_model: WebGLUniformLocation,
        u_lightViewProj: WebGLUniformLocation,
    };


export function initShadowRenderProgram(gl: WebGL2RenderingContext): ShadowRenderProgram {

    const attribBindings: AttributeBinding[] = [
        { name: "a_position", location: 0}

    ]
    const program = createProgramFromRaw(gl, shadowVertexSource, shadowFragmentSource, attribBindings);

     if (!program) {
        throw new Error("failed to create shadow render program")
    }

    return {
        gl,
        program,
        u_model: guaranteeUniformLocation(gl, program, "u_model"),
        u_lightViewProj: guaranteeUniformLocation(gl ,program, "u_lightViewProj"),
    };
}

export function drawShadowScene(
    glState: GlState,
    scene: SceneNode[],
    renderProgram: MainRenderProgram,
    shadowProgram: ShadowRenderProgram,
    lightViewProj: Mat4
) {
    const gl = glState.gl;
    
    gl.useProgram(shadowProgram.program);
    scene.forEach(node => {
        if (node.mesh) {

            const drawInitializedMesh = (mesh: Mesh) => {
                const vao = glState.vaos.get(mesh._id!)!;
                gl.bindVertexArray(vao);
                gl.uniformMatrix4fv(shadowProgram.u_model, false, node._worldTransform);
                gl.uniformMatrix4fv(shadowProgram.u_lightViewProj, false, lightViewProj);
                if (mesh.vertices.indices) {
                    gl.drawElements(gl.TRIANGLES, mesh.vertices.indices.length, gl.UNSIGNED_SHORT, 0);
                } else {
                    gl.drawArrays(gl.TRIANGLES, 0, mesh.vertices.positions.length / 3);
                }
            }



             if (!node.mesh._id) {
            // initialise the mesh 
            initMesh(node.mesh, glState, renderProgram)
            drawInitializedMesh(node.mesh)
        } else {
            // alre
            drawInitializedMesh(node.mesh)
        }
          
        }
        if (node.children) {
            node.children.forEach(child => drawShadowScene(glState, [child], renderProgram, shadowProgram, lightViewProj));
        }
    });
}