
import { Material } from "./shaders/shaderUtils";
import { Vec3 } from "./vec";

export type Vertices = {
    positions: Float32Array,
    normals?: Float32Array,
    texcoords?: Float32Array,
    indices?: Uint16Array,
  }

export type Mesh = {
    material: Material;
    vao: WebGLVertexArrayObject;
    count: number;
    uniforms: {
        colorLocation?: WebGLUniformLocation;
        shininessLocation?: WebGLUniformLocation;
        worldLocation: WebGLUniformLocation;
        worldViewProjectionLocation: WebGLUniformLocation;
        worldInverseTransposeLocation: WebGLUniformLocation;
        viewWorldPositionLocation: WebGLUniformLocation;
        worldPositionLocation: WebGLUniformLocation,
        lightColorLocation: WebGLUniformLocation,
        specularColorLocation: WebGLUniformLocation
    }
    position: Vec3;
    rotation: Vec3;
}


export function createMesh(
        gl: WebGL2RenderingContext, 
        position: Vec3, 
        rotation: Vec3, 
        material: Material, 
        vertices: Vertices): Mesh | undefined {
    
    const {positions, normals, texcoords, indices} = vertices;

    const vao = gl.createVertexArray()
    gl.bindVertexArray(vao);

    const program = material.program;


    // positions are always present
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
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
    
        const texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");
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
        const normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
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


    const worldLocation = gl.getUniformLocation(program, "u_world");
    const worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
    const worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
    
    // setup uniforms for camera
    const viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");

     // setup uniforms for lights
     const lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
     const lightColorLocation = gl.getUniformLocation(program, "u_lightColor");
     const specularColorLocation = gl.getUniformLocation(program, "u_specularColor");

    // extra uniforms

    let colorLocation;
    if (material.extraUniforms?.color) {
        const result = gl.getUniformLocation(program, "u_color");
        if (result) {
            colorLocation = result
        }
    }
    
    let shininessLocation;
    if (material.extraUniforms) {
        const result = gl.getUniformLocation(program, "u_shininess");
        if (result) {
            shininessLocation = result;
        } 
    }

    
    let mesh: Mesh | undefined;
     if (vao && 
        worldLocation &&
        worldViewProjectionLocation &&
        worldInverseTransposeLocation &&
        viewWorldPositionLocation &&
        lightWorldPositionLocation &&
        lightColorLocation &&
        specularColorLocation) {
        mesh = {
                material,
                vao: vao,
                count: positions.length,
                uniforms: {
                colorLocation: colorLocation,
                shininessLocation: shininessLocation,
                worldLocation: worldLocation,
                worldViewProjectionLocation: worldViewProjectionLocation,
                worldInverseTransposeLocation: worldInverseTransposeLocation,
                viewWorldPositionLocation: viewWorldPositionLocation,
                worldPositionLocation: lightWorldPositionLocation,
                lightColorLocation: lightColorLocation,
                specularColorLocation: specularColorLocation,
                },
                
                position,
                rotation
                
            }
        }

    return mesh
}