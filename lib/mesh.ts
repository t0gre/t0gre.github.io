
import { Vec3 } from "./vec3";

export type Vertices = {
    positions: Float32Array,
    normals?: Float32Array,
    texcoords?: Float32Array,
    indices?: Uint16Array,
  }

export type Mesh = {
    material: WebGLProgram;
    vao: WebGLVertexArrayObject;
    count: number;
    colorLocation: WebGLUniformLocation;
    shininessLocation: WebGLUniformLocation;
    worldLocation: WebGLUniformLocation;
    worldViewProjectionLocation: WebGLUniformLocation;
    worldInverseTransposeLocation: WebGLUniformLocation;
    position: Vec3;
    rotation: Vec3;
}


export function createMesh(gl: WebGL2RenderingContext, position: Vec3, rotation: Vec3, material: WebGLProgram, vertices: Vertices): Mesh {
    
    const {positions, normals, texcoords, indices} = vertices;

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao);


    // positions are always present
    const positionAttributeLocation = gl.getAttribLocation(material, "a_position");
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


    if (texcoords) {
        // create the buffer
    
        const texcoordAttributeLocation = gl.getAttribLocation(material, "a_texcoord");
        const normalBuffer = gl.createBuffer();
        // turn on the attribute
        gl.enableVertexAttribArray(texcoordAttributeLocation);
        // make it the current ARRAY_BUFFER
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        // Put stuff data into buffer
        gl.bufferData(
            gl.ARRAY_BUFFER,
            texcoords,
            gl.STATIC_DRAW); 
        // Tell the attribute how to get data out of the buffer
        gl.vertexAttribPointer(
            texcoordAttributeLocation, 3, gl.FLOAT, true, 0, 0);
    
    }

    // create the buffer
    if (normals) {
        const normalAttributeLocation = gl.getAttribLocation(material, "a_normal");
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


    const worldLocation = gl.getUniformLocation(material, "u_world");
    const worldViewProjectionLocation = gl.getUniformLocation(material, "u_worldViewProjection");
    const worldInverseTransposeLocation = gl.getUniformLocation(material, "u_worldInverseTranspose");
    const colorLocation = gl.getUniformLocation(material, "u_color");
    const shininessLocation = gl.getUniformLocation(material, "u_shininess");

    
    

    

    const mesh: Mesh = {
        material,
        vao: vao!,
        count: positions.length,
        colorLocation: colorLocation!,
        shininessLocation: shininessLocation!,
        worldLocation: worldLocation!,
        worldViewProjectionLocation: worldViewProjectionLocation!,
        worldInverseTransposeLocation: worldInverseTransposeLocation!,
        position,
        rotation
        
    }

    return mesh
}