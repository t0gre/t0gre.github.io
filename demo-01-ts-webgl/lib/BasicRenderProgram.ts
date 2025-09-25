import { createProgramFromRaw } from "./shaderUtils"
import { DirectionalLight } from "./light";
import {  m4inverse, m4perspective, Mat4 } from "./mat4";
import { Camera } from "./camera";
import { Vec4 } from "./vec";
import { InputState } from "./input";


import vertexShaderSource from "./shaders/basic.vert?raw"
import fragmentShaderSource from "./shaders/basic.frag?raw"
import { GlState } from "./gl";

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


export function updateUniforms(renderProgram: RenderProgram, glState: GlState, light: DirectionalLight, camera: Camera, input: InputState, shapeWorld: Mat4, color: Vec4) {

        const gl = glState.gl;
        gl.useProgram(renderProgram.program)
        gl.uniformMatrix4fv(renderProgram.worldLocation, false, shapeWorld);

    
        const viewMatrix = m4inverse(camera.transform);
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
        