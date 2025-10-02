import { createProgramFromRaw } from "./shaderUtils"
import { AmbientLight, DirectionalLight, PointLight } from "./light";
import {  m4inverse, m4perspective, Mat4 } from "./mat4";
import { Camera } from "./camera";
import { InputState } from "./input";


import vertexShaderSource from "./shaders/basic.vert?raw"
import fragmentShaderSource from "./shaders/basic.frag?raw"
import { GlState } from "./gl";
import { Mesh } from "./mesh";
import { SceneNode } from "./scene";

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

export type PointLightUniform = {
      colorLocation: WebGLUniformLocation;
      positionLocation: WebGLUniformLocation;
      constantLocation: WebGLUniformLocation;
      linearLocation: WebGLUniformLocation;
      quadraticLocation: WebGLUniformLocation;
} 


export type RenderProgram = {
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
    // pointerLocation: WebGLUniformLocation;
    // canvasLocation: WebGLUniformLocation;
       }


export function updateUniforms(
    renderProgram: RenderProgram, 
    glState: GlState, 
    ambientLight: AmbientLight, 
    directionalLight: DirectionalLight,
    pointLight: PointLight, 
    camera: Camera, 
    shapeWorld: Mat4,
    mesh: Mesh, 
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
        // set point light
        gl.uniform3fv(renderProgram.pointLightUniform.colorLocation,pointLight.color);
        gl.uniform3fv(renderProgram.pointLightUniform.positionLocation,pointLight.position);
        gl.uniform1f(renderProgram.pointLightUniform.constantLocation,pointLight.constant);
        gl.uniform1f(renderProgram.pointLightUniform.linearLocation,pointLight.linear);
        gl.uniform1f(renderProgram.pointLightUniform.quadraticLocation,pointLight.quadratic); 
       

        // gl.uniform2fv(renderProgram.pointerLocation, input.pointerPosition!)
        // gl.uniform2fv(renderProgram.canvasLocation, [gl.canvas.width, gl.canvas.height])
    }

export function initRenderProgram(gl: WebGL2RenderingContext)  {

    const program = createProgramFromRaw(gl, vertexShaderSource, fragmentShaderSource);

    if (!program) {
        console.log('failed to create basic material program, something wrong with the shaders?')
        return undefined
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

    const renderProgram: RenderProgram = {
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
        // pointerLocation, 
        // canvasLocation
    }

    return renderProgram
        
    } 
        


export function drawMesh(
    mesh: Mesh, 
    glState: GlState, 
    renderProgram: RenderProgram, 
    ambientLight: AmbientLight,
    directionalLight: DirectionalLight,
    pointLight: PointLight, 
    camera: Camera, 
    worldMatrix: Mat4,
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
        program: RenderProgram): Mesh | undefined {
    
    if (mesh._id) {
        console.log("mesh is already init, you shouldn't be trying to reinit it")
        return mesh
    }
    
    const {positions, normals, texcoords: _, indices} = mesh.vertices;
    const gl = glState.gl;
    const vao = gl.createVertexArray()
    if (!vao) {
        console.log('failed to create vao - thats bad')
        return undefined
    }
    gl.bindVertexArray(vao);

    
    // positions are always present
    const positionAttributeLocation = gl.getAttribLocation(program.program, "a_position");
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
        const normalAttributeLocation = gl.getAttribLocation(program.program, "a_normal");
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
    


    gl.bindVertexArray(null);
    
    mesh._id = glState.nextVaoId;
    glState.vaos.set(mesh._id!, vao); // _id is set above
    glState.nextVaoId += 1; // the id is just an ascending int
    
    return mesh
}


export function drawSceneNode(
   node: SceneNode, 
   glState: GlState, 
   renderProgram: RenderProgram,
   ambientLight: AmbientLight, 
   directionalLight: DirectionalLight,
   pointLight: PointLight, 
   camera: Camera,
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
            node._worldTransform);
      }

      if (node.children) {
         node.children.forEach(child => {
            drawSceneNode(
               child, 
               glState, 
               renderProgram, 
               ambientLight,
               directionalLight,
               pointLight, 
               camera, 
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
    renderProgram: RenderProgram,
    input?: InputState,) {

    const gl = glState.gl;

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
   

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    scene.forEach(node => {
        drawSceneNode(
         node, 
         glState, 
         renderProgram, 
         ambientLight,
         directionalLight,
         pointLight, 
         camera, 
         input);
    })
        
    return 0
    
}