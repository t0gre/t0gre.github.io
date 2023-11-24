import {
    m4perspective,
    m4inverse,
    m4multiply,
    m4transpose,
    m4fromPositionAndEuler
} from './lib/mat4'

import { Vec3 } from './lib/vec3'

import { degToRad } from './lib/mathUtils'
import { createProgramFromRaw } from './lib/shaderUtils'
import { Mesh, createMesh } from './lib/mesh'
import { Light, createLight } from './lib/light'
import { Camera, createCamera } from './lib/camera'
import { createFVertices } from './lib/primitives/fShape'


const ROTATION_SPEED = 1.2;

const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec3 a_normal;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;

uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

// constyings to pass values to the fragment shader
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_worldViewProjection * a_position;

  // orient the normals and pass to the fragment shader
  v_normal = mat3(u_worldInverseTranspose) * a_normal;

  // compute the world position of the surfoace
  vec3 surfaceWorldPosition = (u_world * a_position).xyz;

  // compute the vector of the surface to the light
  // and pass it to the fragment shader
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

  // compute the vector of the surface to the view/camera
  // and pass it to the fragment shader
  v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}
`

const fragmentShaderSource = `#version 300 es

    precision highp float;
    
    // Passed in and constied from the vertex shader.
    in vec3 v_normal;
    in vec3 v_surfaceToLight;
    in vec3 v_surfaceToView;
    
    uniform vec4 u_color;
    uniform float u_shininess;
    uniform vec3 u_lightColor;
    uniform vec3 u_specularColor;
    
    // we need to declare an output for the fragment shader
    out vec4 outColor;
    
    void main() {
      // because v_normal is a constying it's interpolated
      // so it will not be a uint vector. Normalizing it
      // will make it a unit vector again
      vec3 normal = normalize(v_normal);
    
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
      vec3 surfaceToViewDirection = normalize(v_surfaceToView);
      vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
    
      // compute the light by taking the dot product
      // of the normal to the light's reverse direction
      float light = dot(normal, surfaceToLightDirection);
      float specular = 0.0;
      if (light > 0.0) {
        specular = pow(dot(normal, halfVector), u_shininess);
      }
    
      outColor = u_color;
    
      // Lets multiply just the color portion (not the alpha)
      // by the light
      outColor.rgb *= light * u_lightColor;
    
      // Just add in the specular
      outColor.rgb += specular * u_specularColor;
    }
    `

export const main = (canvas: HTMLCanvasElement): void => {

    
    let gl = canvas.getContext("webgl2");

    if (!gl) {
        alert('it looks like you dont have webgl available')
        return;
    } else {
        resizeCanvasToDisplaySize(canvas);


        const program = createProgramFromRaw(gl, vertexShaderSource, fragmentShaderSource)

        if (program) {

            const shape = createMesh(gl, 
                [0,0,0], 
                [degToRad(190), degToRad(40), degToRad(320)],  
                program, 
                createFVertices());
    
            const light = createLight(gl, program, [0, 0, -60], [0,0,0])
          
            const fieldOfViewRadians = degToRad(60);
            const aspect = canvas.clientWidth / canvas.clientHeight;
            const near = 1;
            const far = 2000;
            const up: Vec3 = [0, 1, 0]; 
            const position: Vec3 = [0, 0, -600];
            const rotation: Vec3 = [0,0,0];
            
            const camera = createCamera(gl, program, fieldOfViewRadians, aspect, near, far, up, position, rotation)
            

            let lastTime = 0;
            function animate(time: DOMHighResTimeStamp) {
                time *= 0.001 // convert from millis to seconds
                const dt = time - lastTime;
                lastTime = time;
                updateShape(shape, dt)
                drawShape(gl!, shape, light, camera, canvas)
                requestAnimationFrame(animate)    
            }

            
            requestAnimationFrame(animate)
            

        }
    }
}

function updateShape(shape: Mesh, dt: number) {
    shape.rotation[1] += ROTATION_SPEED * dt;
    shape.position = [Math.sin(1 * dt) * 100, Math.cos(1 * dt) * 100, 0]
}


// Draw the scene.
function drawShape(gl: WebGL2RenderingContext, shape: Mesh, light: Light, camera: Camera, canvas: HTMLCanvasElement) {
    
    resizeCanvasToDisplaySize(canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Turn on culling. By default backfacing triangles
    // will be culled.
    gl.enable(gl.CULL_FACE);

    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(shape.material);

    // Bind the shape vao.
    gl.bindVertexArray(shape.vao);

    // set uniforms
    // uniform mat4 u_world;
    const shapeWorld = m4fromPositionAndEuler(shape.position, shape.rotation);
    gl.uniformMatrix4fv(shape.worldLocation, false, shapeWorld);

    // uniform mat4 u_worldViewProjection;
    const viewMatrix = m4fromPositionAndEuler(camera.position, camera.rotation);
    const projectionMatrix = m4perspective(camera.fieldOfViewRadians, camera.aspect, camera.near, camera.far)
    const viewProjectionMatrix = m4multiply(projectionMatrix, viewMatrix);
       
    const shapeWorldViewProjection = m4multiply(viewProjectionMatrix, shapeWorld);
    gl.uniformMatrix4fv(shape.worldViewProjectionLocation, false, shapeWorldViewProjection);

    // uniform mat4 u_worldInverseTranspose;
    const shapeWorldInverseTranspose = m4transpose(m4inverse(shapeWorld));
    gl.uniformMatrix4fv(shape.worldInverseTransposeLocation, false, shapeWorldInverseTranspose);

    // uniform vec3 u_viewWorldPosition;
    gl.uniform3fv(camera.viewWorldPositionLocation, camera.position);
    
    // uniform vec4 u_color;
    gl.uniform4fv(shape.colorLocation, [0.2, 1, 0.2, 1])

    // uniform float u_shininess;
    gl.uniform1f(shape.shininessLocation,  150);

    // uniform vec3 u_lightWorldPosition;
    gl.uniform3fv(light.worldPositionLocation, light.position);

    // uniform vec3 u_lightColor;
    gl.uniform3fv(light.colorLocation, [1, 0.6, 0.6]);  // red light
    
    // uniform vec3 u_specularColor;
    gl.uniform3fv(light.specularColorLocation, [1, 0.2, 0.2]);  // red light

    // draw the shape
    // gl.drawElements(gl.TRIANGLES, shape.count, gl.UNSIGNED_SHORT,  0);
    gl.drawArrays(gl.TRIANGLES, 0, shape.count );
    
}



function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement): void {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width !== displayWidth ||
        canvas.height !== displayHeight;

    if (needResize) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

}




