
import { Camera } from "./camera";
import { DirectionalLight, PointLight, AmbientLight } from "./light";
import { InputState } from "./input";

import { Mat4 } from "./mat4";
import { Vec3 } from "./vec";
import { RenderProgram, updateUniforms } from "./BasicRenderProgram";
import { GlState } from "./gl";

export type Vertices = {
    positions: Float32Array,
    normals?: Float32Array,
    texcoords?: Float32Array,
    indices?: Uint16Array,
  }

export type Material = {
    color: Vec3
    specularColor: Vec3
    shininess: number
}

export type Mesh = {
    vertices: Vertices;
    material: Material;
    _id?: number    // undefined means it does not have a vao initialised, 
    // draw function will check it and set it. not to be set manually 
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
                mesh);

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

