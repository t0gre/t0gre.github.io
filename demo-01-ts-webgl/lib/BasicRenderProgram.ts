import { createProgramFromRaw } from "./shaderUtils"
import { AmbientLight, DirectionalLight, PointLight } from "./light";
import {  m4inverse, m4perspective, Mat4 } from "./mat4";
import { Camera } from "./camera";
import { Vec4 } from "./vec";
import { InputState } from "./input";


import vertexShaderSource from "./shaders/basic.vert?raw"
import fragmentShaderSource from "./shaders/basic.frag?raw"
import { GlState } from "./gl";
import { Mesh } from "./mesh";

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
        