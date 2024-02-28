import { createProgramFromRaw } from "./shaderUtils"
import { DirectionalLight } from "../light";
import { m4fromPositionAndEuler, m4inverse, m4perspective } from "../mat4";
import { Mesh } from "../mesh";
import { Camera } from "../camera";
import { Vec4 } from "../vec";
import { InputState } from "lib/input";

const vertexShaderSource = `#version 300 es
    in vec4 a_position;
    in vec3 a_normal;

    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform mat4 u_world;

    out vec3 v_normal;

    void main() {
    gl_Position = u_projection * u_view * u_world * a_position;
    v_normal = mat3(u_world) * a_normal;
    }
    `

const fragmentShaderSource = `#version 300 es
    precision highp float;

    in vec3 v_normal;
   

    uniform vec4 u_diffuse;
    uniform vec3 u_lightDirection;
    uniform vec2 u_pointer;
    uniform vec2 u_canvas;

    out vec4 outColor;

    float RADIUS = 100.0;

    void main () {
    vec3 normal = normalize(v_normal);
    float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
    outColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);

    // get the normalised pointer position into gl_FragCoord space
    vec2 offsetFromPointer = vec2(gl_FragCoord.x - (u_pointer.x + 1.0) * (u_canvas.x / 2.0),gl_FragCoord.y - (-u_pointer.y - 1.0) * (u_canvas.y / -2.0));

    float distanceFromPointer = sqrt(dot(offsetFromPointer, offsetFromPointer));
    bool pointerIsActive = !((u_pointer.x == 0.0) && (u_pointer.y == 0.0));
    if (pointerIsActive && distanceFromPointer < RADIUS) {
      outColor *= distanceFromPointer / RADIUS;
    }

    }
    `



class BasicMaterial {
    public    program: WebGLProgram;
    private    gl: WebGL2RenderingContext;
    private    worldLocation: WebGLUniformLocation;
    private    viewLocation:WebGLUniformLocation;
    private    projectionLocation:WebGLUniformLocation;
    private    diffuseLocation:WebGLUniformLocation;
    private    lightDirectionLocation: WebGLUniformLocation;
    private    pointerLocation: WebGLUniformLocation;
    private     canvasLocation: WebGLUniformLocation;
    constructor(
        gl: WebGL2RenderingContext,
        color: Vec4,
        program: WebGLProgram, 
        worldLocation: WebGLUniformLocation,
        viewLocation:WebGLUniformLocation,
        projectionLocation:WebGLUniformLocation,
        diffuseLocation:WebGLUniformLocation,
        lightDirectionLocation: WebGLUniformLocation,
        pointerLocation: WebGLUniformLocation,
        canvasLocation: WebGLUniformLocation
        ) {

        this.gl = gl
        this.program = program
        this.worldLocation = worldLocation
        this.viewLocation = viewLocation
        this.projectionLocation = projectionLocation
        this.diffuseLocation = diffuseLocation
        this.lightDirectionLocation = lightDirectionLocation
        this.pointerLocation = pointerLocation
        this.canvasLocation = canvasLocation

        this.gl.useProgram(this.program)
        this.gl.uniform4fv(this.diffuseLocation, color); 


    }

    updateUniforms(mesh: Mesh, light: DirectionalLight, camera: Camera, input: InputState) {

        this.gl.useProgram(this.program)
        const shapeWorld = m4fromPositionAndEuler(mesh.position, mesh.rotation);
        this.gl.uniformMatrix4fv(this.worldLocation, false, shapeWorld);

    
        const viewMatrix = m4inverse(m4fromPositionAndEuler(camera.position, camera.rotation));
        this.gl.uniformMatrix4fv(this.viewLocation, false, viewMatrix);

        const projectionMatrix = m4perspective(camera.fieldOfViewRadians, camera.aspect, camera.near, camera.far)
        this.gl.uniformMatrix4fv(this.projectionLocation, false, projectionMatrix);
        
        this.gl.uniform3fv(this.lightDirectionLocation, light.rotation);

        this.gl.uniform2fv(this.pointerLocation, input.pointerPosition!)

        this.gl.uniform2fv(this.canvasLocation, [this.gl.canvas.width, this.gl.canvas.height])
    }

   
}


export function createBasicMaterial(gl: WebGL2RenderingContext, color: Vec4)  {

    const program = createProgramFromRaw(gl, vertexShaderSource, fragmentShaderSource);

    if (!program) {
        console.log('failed to create basic material program, something wrong with the shaders?')
        return undefined
    }

    const worldLocation = gl.getUniformLocation(program, "u_world");
    if (!worldLocation) {
        console.log('failed to create uniform "u_world", are you sure the shader uses it?')
        return undefined
    }

    const viewLocation = gl.getUniformLocation(program, "u_view");
    if (!viewLocation) {
        console.log('failed to create uniform "u_view", are you sure the shader uses it?')
        return undefined
    }

    const projectionLocation = gl.getUniformLocation(program, "u_projection");
    if (!projectionLocation) {
        console.log('failed to create uniform "u_projection", are you sure the shader uses it?')
        return undefined
    }

   
    const diffuseLocation = gl.getUniformLocation(program, "u_diffuse");
    if (!diffuseLocation) {
        console.log('failed to create uniform "u_diffuse", are you sure the shader uses it?')
        return undefined
    } 

   
    const lightDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
    if (!lightDirectionLocation) {
        console.log('failed to create uniform "u_lightDirection", are you sure the shader uses it?')
        return undefined
    } 

    const pointerLocation = gl.getUniformLocation(program, "u_pointer");
    if (!pointerLocation) {
        console.log('failed to create uniform "u_pointer", are you sure the shader uses it?')
        return undefined
    } 

    const canvasLocation = gl.getUniformLocation(program, "u_canvas");
    if (!canvasLocation) {
        console.log('failed to create uniform "u_canvas", are you sure the shader uses it?')
        return undefined
    } 

    return new BasicMaterial(gl, color, program, worldLocation, viewLocation, projectionLocation, diffuseLocation, lightDirectionLocation, pointerLocation, canvasLocation)
        
    } 
        