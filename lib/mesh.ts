
import { Camera } from "./camera";
import { DirectionalLight } from "./light";
import { Vec3 } from "./vec";

export type Vertices = {
    positions: Float32Array,
    normals?: Float32Array,
    texcoords?: Float32Array,
    indices?: Uint16Array,
  }

export class Mesh  {
    public position: Vec3;
    public rotation: Vec3;
    private gl: WebGL2RenderingContext;
    private vertices: Vertices;
    private material: Material;
    private vao: WebGLVertexArrayObject 
    constructor(
        gl: WebGL2RenderingContext,
        position: Vec3,
        rotation: Vec3,
        vertices: Vertices,
        material: Material,
        vao: WebGLVertexArrayObject) {
            
        this.position = position;
        this.rotation = rotation;
        this.vertices = vertices;
        this.material = material;
        this.gl = gl;
        this.vao = vao;
    }  
    
    render(light: DirectionalLight, camera: Camera) {
    
        this.gl.useProgram(this.material.program);
        this.gl.bindVertexArray(this.vao);

        this.material.updateUniforms(this, light, camera);

        if (this.vertices.indices) {
            this.gl.drawElements(this.gl.TRIANGLES, this.vertices.indices.length, this.gl.UNSIGNED_SHORT,  0);
        } else {
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertices.positions.length );
        }
        
    }
}

interface Material {
    program: WebGLProgram;
    updateUniforms: (mesh: Mesh, light: DirectionalLight, camera: Camera) => void;
}

export function createMesh(
        gl: WebGL2RenderingContext, 
        position: Vec3, 
        rotation: Vec3,  
        material: Material,
        vertices: Vertices): Mesh | undefined {
    
    const {positions, normals, texcoords: _, indices} = vertices;

    const vao = gl.createVertexArray()
    if (!vao) {
        console.log('failed to create vao - thats bad')
        return undefined
    }
    gl.bindVertexArray(vao);

    const program = material.program;


    // positions are always present
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
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
        const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
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
        gl.ARRAY_BUFFER,
        indices,
        gl.STATIC_DRAW); 
    }
    


    gl.bindVertexArray(null);

    
    return new Mesh(gl, position, rotation, vertices, material, vao)
}

