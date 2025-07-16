
import { Camera } from "./camera";
import { DirectionalLight } from "./light";
import { InputState } from "./input";
import { Pose } from "./scene";

import { m4fromPositionAndEuler, m4multiply, Mat4 } from "./mat4";
import { Vec4 } from "./vec";
import { RenderProgram, updateUniforms } from "./shaders/BasicRenderProgram";
import { UUID } from "crypto";

export type Vertices = {
    positions: Float32Array,
    normals?: Float32Array,
    texcoords?: Float32Array,
    indices?: Uint16Array,
  }

export type Material = {
    color: Vec4
}

export type Mesh = {
    
    vertices: Vertices;
    material: Material;
    id: UUID
        
}

export function drawMesh(
    mesh: Mesh, 
    glState: glState, 
    renderProgram: RenderProgram, 
    light: DirectionalLight, 
    camera: Camera, 
    input: InputState, 
    worldMatrix: Mat4 ){
      
        const gl = glState.gl;
        const vao = glState.vaos.get(mesh.id)!;
        gl.useProgram(renderProgram.program);
        gl.bindVertexArray(vao);

        updateUniforms(renderProgram, glState, light, camera, input, worldMatrix, mesh.material.color);

        if (mesh.vertices.indices) {
            gl.drawElements(glState.gl.TRIANGLES, mesh.vertices.indices.length, gl.UNSIGNED_SHORT,  0);
        } else {
            gl.drawArrays(glState.gl.TRIANGLES, 0, mesh.vertices.positions.length /3 );
        }
        
    }



export function createMesh(
        glState: glState, 
        material: Material,
        vertices: Vertices,
        program: RenderProgram): Mesh | undefined {
    
    const {positions, normals, texcoords: _, indices} = vertices;
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
    
    const mesh = { vertices, material, id: crypto.randomUUID()}
    glState.vaos.set(mesh.id, vao);

    
    return mesh
}

