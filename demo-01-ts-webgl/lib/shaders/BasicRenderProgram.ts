import { createProgramFromRaw } from "./shaderUtils"
import { DirectionalLight } from "../light";
import { m4fromPositionAndEuler, m4inverse, m4perspective, Mat4 } from "../mat4";
import { Camera } from "../camera";
import { Vec4 } from "../vec";
import { InputState } from "../input";


const vertexShaderSource = `#version 300 es

    #pragma vscode_glsllint_stage : vert //pragma to set STAGE to 'vert' 

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

    #pragma vscode_glsllint_stage : frag //pragma to set STAGE to 'frag'

    precision highp float;

    in vec3 v_normal;
   

    uniform vec4 u_diffuse;
    uniform vec3 u_lightDirection;
    uniform vec2 u_pointer;
    uniform vec2 u_canvas;

    out vec4 outColor;

    float RADIUS = 100.0;
    float AMBIENT_LIGHT = 0.5;
    float TORCH_STRENGTH = 0.4;

    void main () {
    vec3 normal = normalize(v_normal);
    float light = dot(u_lightDirection, normal) * .5 + AMBIENT_LIGHT;
    // get the normalised pointer position into gl_FragCoord space
    vec2 offsetFromPointer = vec2(gl_FragCoord.x - (u_pointer.x + 1.0) * (u_canvas.x / 2.0),gl_FragCoord.y - (-u_pointer.y - 1.0) * (u_canvas.y / -2.0));
    float distanceFromPointer = sqrt(dot(offsetFromPointer, offsetFromPointer));
    bool pointerIsActive = !((u_pointer.x == 0.0) && (u_pointer.y == 0.0));
    if (pointerIsActive && distanceFromPointer < RADIUS) {
      float normalizedTorchLight = (RADIUS - distanceFromPointer )  / RADIUS;
      light += TORCH_STRENGTH * normalizedTorchLight;
    }
    outColor = vec4(u_diffuse.rgb * light, u_diffuse.a);

   

    }
    `



export type RenderProgram = {
    program: WebGLProgram;
    gl: WebGL2RenderingContext;
    worldLocation: WebGLUniformLocation;
    viewLocation:WebGLUniformLocation;
    projectionLocation:WebGLUniformLocation;
    diffuseLocation:WebGLUniformLocation;
    lightDirectionLocation: WebGLUniformLocation;
    pointerLocation: WebGLUniformLocation;
    canvasLocation: WebGLUniformLocation;
       }

    

   


export function updateUniforms(renderProgram: RenderProgram, glState: glState, light: DirectionalLight, camera: Camera, input: InputState, shapeWorld: Mat4, color: Vec4) {

        const gl = glState.gl;
        gl.useProgram(renderProgram.program)
        gl.uniformMatrix4fv(renderProgram.worldLocation, false, shapeWorld);

    
        const viewMatrix = m4inverse(m4fromPositionAndEuler(camera.position, camera.rotation));
        gl.uniformMatrix4fv(renderProgram.viewLocation, false, viewMatrix);

        const projectionMatrix = m4perspective(camera.fieldOfViewRadians, camera.aspect, camera.near, camera.far)
        gl.uniformMatrix4fv(renderProgram.projectionLocation, false, projectionMatrix);
        gl.uniform3fv(renderProgram.lightDirectionLocation, light.rotation);
        gl.uniform2fv(renderProgram.pointerLocation, input.pointerPosition!)
        gl.uniform2fv(renderProgram.canvasLocation, [gl.canvas.width, gl.canvas.height])
        gl.uniform4fv(renderProgram.diffuseLocation, color); 
    }

export function initRenderProgram(gl: WebGL2RenderingContext)  {

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

    const renderProgram: RenderProgram = {
        gl, 
        program, 
        worldLocation, 
        viewLocation, 
        projectionLocation, 
        diffuseLocation, 
        lightDirectionLocation, 
        pointerLocation, 
        canvasLocation
    }

    return renderProgram
        
    } 
        