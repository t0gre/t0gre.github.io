import { Vec3 } from './lib/vec'

import { Scene, SceneNode } from './lib/Scene'
import { degToRad } from './lib/mathUtils'
import { Mesh, createMesh, drawMesh } from './lib/mesh'
import { DirectionalLight, createDirectionalLight } from './lib/light'
import { Camera, createCamera } from './lib/camera'
import { initRenderProgram, RenderProgram } from './lib/shaders/BasicMaterial'
import { loadObj } from './lib/loaders/ObjLoader'
import { InputState } from './lib/input'
import { m4fromPositionAndEuler } from './lib/mat4'


// const ROTATION_SPEED = 1.2;

export async function main(canvas: HTMLCanvasElement): Promise<1> {

    
    let gl = canvas.getContext("webgl2");


    if (!gl) {
        alert('it looks like you dont have webgl available')
        return 1;
    } else {
        resizeCanvasToDisplaySize(canvas);

        gl.enableVertexAttribArray(0);

        // Turn on culling. By default backfacing triangles
        // will be culled.
        gl.enable(gl.CULL_FACE);

        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);


        const basicRenderProgram = initRenderProgram(gl)
    


        if (basicRenderProgram) {

            const vertices = await loadObj('/rainbowtree.obj');
            const shape: SceneNode = {
                pose: {
                    position: [0,0,0], 
                    rotation: [0, Math.PI /2, 0],
                },  
                mesh: createMesh(gl, {color:  [1, 1, 0.2, 1]}, vertices, basicRenderProgram )
            }  ;

            
            const shape1: SceneNode = {
                pose: {
                    position: [0,1,0], 
                    rotation: [0, Math.PI /2, 0],
                },  
                mesh: createMesh(gl, {color:  [1, 0.5, 0.2, 1]}, vertices, basicRenderProgram ),
                parent: shape
            }  ;


            if (!shape) {
                console.log('failed to create shape')
                return 1
            }
    
            
          
            const fieldOfViewRadians = degToRad(60);
            const aspect = canvas.clientWidth / canvas.clientHeight;
            const near = 1;
            const far = 2000;
            const up: Vec3 = [1, 0, 0]; 
            const position: Vec3 = [0, 3.5, 10];
            const rotation: Vec3 = [0,0,0];
            
            const light = createDirectionalLight([0, 0.5, 0.5], [0.5, 0.5, 0.5])
            const camera = createCamera(fieldOfViewRadians, aspect, near, far, up, position, rotation)
           
            ///////////////// 
            const input: InputState = {
                pointerPosition: [0,0]
            }

            canvas.addEventListener('pointerdown', () => {
                const handler = (e: PointerEvent) => {
                    const rect = canvas.getBoundingClientRect();
            
                    let x = e.clientX - rect.left;
                    let y = e.clientY - rect.top;
    
                    // these are both 0-1
                    x = x * canvas.width / canvas.clientWidth
                    y = y * canvas.height / canvas.clientHeight
    
                    // convert to webgl clip space
                    x = x / gl!.canvas.width * 2 -1;
                    y = y  / gl!.canvas.height * -2 + 1;
    
                    shape.pose.rotation[1] += e.movementX / 100;

                    input.pointerPosition = [x,y];
                }
                canvas.addEventListener('pointerup', () => {
                    canvas.removeEventListener('pointermove', handler)
                    // input.pointerPosition = [0,0] N.B this is also omitted in  the C version
                })
                canvas.addEventListener('pointermove', handler )
            })

            ///////////////////////////
            // let lastTime = 0;
            function animate(time: DOMHighResTimeStamp) {
                time *= 0.001 // convert from millis to seconds
                // const dt = time - lastTime;
                // lastTime = time;
                // updateShape(shape!, dt)
                resizeCanvasToDisplaySize(canvas);
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                const drawError = drawScene(gl!, [shape, shape1], light, camera, input, basicRenderProgram!);
                if (drawError) {
                    console.log('draw error')
                }
                requestAnimationFrame(animate)    
            }

            
            requestAnimationFrame(animate)
            

        }
    }

    return 1
}

// function updateShape(shape: Mesh, dt: number) {
//     // shape.rotation[1] += ROTATION_SPEED * dt;
//     // shape.position = [Math.sin(1 * dt) * 100, Math.cos(1 * dt) * 100, 0]
// }



// Draw the scene.
function drawScene(
    gl: WebGL2RenderingContext,  
    scene: Scene, 
    light: DirectionalLight, 
    camera: Camera, 
    input: InputState, 
    renderProgram: RenderProgram) {

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
   

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    scene.map(object => {
        if (object.mesh) {
             const parentWorldTransform = object.parent ? 
                m4fromPositionAndEuler(object.parent.pose.position, object.parent.pose.rotation) : 
                undefined
             drawMesh(object.mesh, gl, renderProgram, light, camera, input, object.pose, parentWorldTransform)
        }
       
        // object.mesh?.render(light, camera, input, object.pose, object.parent ? m4fromPositionAndEuler(object.parent.pose.position, object.parent.pose.rotation) : undefined)
    });
     

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

