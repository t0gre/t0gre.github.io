
import { Camera } from "./camera";
import { DirectionalLight } from "./light";
import { InputState } from "./input";
import { Pose } from "./Scene";

import { m4fromPositionAndEuler, m4multiply, Mat4 } from "./mat4";
import { Vec4 } from "./vec";
import { RenderProgram } from "./shaders/BasicMaterial";

export type Vertices = {
    positions: Float32Array,
    normals?: Float32Array,
    texcoords?: Float32Array,
    indices?: Uint16Array,
  }

export type Material = {
    color: Vec4
}

export class Mesh  {
    
    public vertices: Vertices;
    public material: Material;
    public vao: WebGLVertexArrayObject 
    constructor(
       
        vertices: Vertices,
        material: Material,
        vao: WebGLVertexArrayObject) {
            
        this.vertices = vertices;
        this.material = material;

        this.vao = vao;
    }  
    
    
}

export function drawMesh(mesh: Mesh, gl: WebGL2RenderingContext, renderProgram: RenderProgram, light: DirectionalLight, camera: Camera, input: InputState, pose: Pose, parentWorldTransform?: Mat4 ){
    
        gl.useProgram(renderProgram.program);
        gl.bindVertexArray(mesh.vao);

        if (!parentWorldTransform) {
            parentWorldTransform = m4fromPositionAndEuler([0,0,0], [0,0,0]);
        }
        
        const shapeMatrix= m4fromPositionAndEuler(pose.position, pose.rotation);
        const worldMatrix = m4multiply(parentWorldTransform, shapeMatrix);

        renderProgram.updateUniforms(light, camera, input, worldMatrix, mesh.material.color);

        if (mesh.vertices.indices) {
            gl.drawElements(gl.TRIANGLES, mesh.vertices.indices.length, gl.UNSIGNED_SHORT,  0);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, mesh.vertices.positions.length /3 );
        }
        
    }



export function createMesh(
        gl: WebGL2RenderingContext, 
        material: Material,
        vertices: Vertices,
        program: RenderProgram): Mesh | undefined {
    
    const {positions, normals, texcoords: _, indices} = vertices;

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

    
    return new Mesh(vertices, material, vao)
}

