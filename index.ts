import {
    m4perspective,
    m4inverse,
    m4multiply,
    m4transpose,
    m4fromPositionAndEuler
} from './lib/mat4'

import { Vec3 } from './lib/vec'

import { degToRad } from './lib/mathUtils'
import { Mesh, createMesh } from './lib/mesh'
import { Light, createLight } from './lib/light'
import { Camera, createCamera } from './lib/camera'
import { createFVertices } from './lib/shapePrimitives/fShape'
import { createShinyMaterial } from './lib/shaders/shinyMaterial'
import { createTriangleVertices } from './lib/shapePrimitives/triangle'


const ROTATION_SPEED = 1.2;



export const main = (canvas: HTMLCanvasElement): 1 | undefined => {

    
    let gl = canvas.getContext("webgl2");

    if (!gl) {
        alert('it looks like you dont have webgl available')
        return 1;
    } else {
        resizeCanvasToDisplaySize(canvas);


        const material = createShinyMaterial(gl, [0.2, 1, 0.2, 1], 150)

        if (material) {

            const shape = createMesh(gl, 
                [0,0,0], 
                [0, 0, 0],  
                material, 
                createTriangleVertices());

            if (!shape) {
                console.log('failed to create shape')
                return 1
            }
    
            const light = createLight([0, 0, -200], [0,0, -100], [1, 0.6, 0.6], [1, 0.2, 0.2])
          
            const fieldOfViewRadians = degToRad(60);
            const aspect = canvas.clientWidth / canvas.clientHeight;
            const near = 1;
            const far = 2000;
            const up: Vec3 = [0, 1, 0]; 
            const position: Vec3 = [0, 0, -300];
            const rotation: Vec3 = [0,0,0];
            
            const camera = createCamera(fieldOfViewRadians, aspect, near, far, up, position, rotation)
            

            let lastTime = 0;
            function animate(time: DOMHighResTimeStamp) {
                time *= 0.001 // convert from millis to seconds
                const dt = time - lastTime;
                lastTime = time;
                updateShape(shape!, dt)
                const drawError = drawShape(gl!, shape!, light, camera, canvas)
                if (drawError) {
                    console.log('draw error')
                }
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
    gl.useProgram(shape.material.program);

    // Bind the shape vao.
    gl.bindVertexArray(shape.vao);

    // set uniforms
    // uniform mat4 u_world;
    const shapeWorld = m4fromPositionAndEuler(shape.position, shape.rotation);
    gl.uniformMatrix4fv(shape.uniforms.worldLocation, false, shapeWorld);

    // uniform mat4 u_worldViewProjection;
    const viewMatrix = m4fromPositionAndEuler(camera.position, camera.rotation);
    const projectionMatrix = m4perspective(camera.fieldOfViewRadians, camera.aspect, camera.near, camera.far)
    const viewProjectionMatrix = m4multiply(projectionMatrix, viewMatrix);
       
    const shapeWorldViewProjection = m4multiply(viewProjectionMatrix, shapeWorld);
    gl.uniformMatrix4fv(shape.uniforms.worldViewProjectionLocation, false, shapeWorldViewProjection);

    // uniform mat4 u_worldInverseTranspose;
    const shapeWorldInverseTranspose = m4transpose(m4inverse(shapeWorld));
    gl.uniformMatrix4fv(shape.uniforms.worldInverseTransposeLocation, false, shapeWorldInverseTranspose);

    // uniform vec3 u_viewWorldPosition;
    gl.uniform3fv(shape.uniforms.viewWorldPositionLocation, camera.position);

    // uniform vec3 u_lightWorldPosition;
    gl.uniform3fv(shape.uniforms.worldPositionLocation, light.position);

    // uniform vec3 u_lightColor;
    gl.uniform3fv(shape.uniforms.lightColorLocation, light.color);  // red light
    
    // uniform vec3 u_specularColor;
    gl.uniform3fv(shape.uniforms.specularColorLocation, light.specularColor);  // red light

    // draw the shape
    // gl.drawElements(gl.TRIANGLES, shape.count, gl.UNSIGNED_SHORT,  0);
    gl.drawArrays(gl.TRIANGLES, 0, shape.count );

    // optional extra uniforms
    // uniform vec4 u_color;
    if (shape.material.extraUniforms?.color) {
        if (shape.uniforms.colorLocation) {
            gl.uniform4fv(shape.uniforms.colorLocation, shape.material.extraUniforms.color)
        } else {
            return 1
        }
    
    }
    
    // uniform float u_shininess;
    if (shape.material.extraUniforms?.shininess) { 
        if (shape.uniforms.shininessLocation) {
            gl.uniform1f(shape.uniforms.shininessLocation,  shape.material.extraUniforms.shininess);
        } else {
            return 1
        }
    
    }

    return 0
    
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




