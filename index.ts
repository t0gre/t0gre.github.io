import { Vec3} from './src/vec'

import { degToRad } from './src/mathUtils'
import { Mesh, createMesh } from './src/mesh'
import { DirectionalLight, createDirectionalLight } from './src/light'
import { Camera, createCamera } from './src/camera'
import { createBasicMaterial } from './src/shaders/BasicMaterial'
import { loadObj } from './src/loaders/ObjLoader'


const ROTATION_SPEED = 1.2;



export async function main(canvas: HTMLCanvasElement): Promise<1 | undefined> {

    
    let gl = canvas.getContext("webgl2");

    if (!gl) {
        alert('it looks like you dont have webgl available')
        return 1;
    } else {
        resizeCanvasToDisplaySize(canvas);


        const material = createBasicMaterial(gl, [1, 1, 0.2, 1])

        if (material) {

            const vertices = await loadObj('rainbowtree.obj');
            const shape = createMesh(gl, 
                [0,0,0], 
                [0, 0, 0],  
                material, 
                vertices);

            if (!shape) {
                console.log('failed to create shape')
                return 1
            }
    
            
          
            const fieldOfViewRadians = degToRad(60);
            const aspect = canvas.clientWidth / canvas.clientHeight;
            const near = 1;
            const far = 2000;
            const up: Vec3 = [0, 1, 0]; 
            const position: Vec3 = [0, 0, -20];
            const rotation: Vec3 = [0,0,0];
            
            const light = createDirectionalLight([0, 0, 0.5], [0.5, 0.5, 0.5])
            const camera = createCamera(fieldOfViewRadians, aspect, near, far, up, position, rotation)
            

            let lastTime = 0;
            function animate(time: DOMHighResTimeStamp) {
                time *= 0.001 // convert from millis to seconds
                const dt = time - lastTime;
                lastTime = time;
                updateShape(shape!, dt)
                resizeCanvasToDisplaySize(canvas);
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                const drawError = drawScene(gl!, [shape!], light, camera)
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
    // shape.position = [Math.sin(1 * dt) * 100, Math.cos(1 * dt) * 100, 0]
}

type Scene = Mesh[]

// Draw the scene.
function drawScene(gl: WebGL2RenderingContext, scene: Scene, light: DirectionalLight, camera: Camera) {


    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Turn on culling. By default backfacing triangles
    // will be culled.
    gl.enable(gl.CULL_FACE);

    // Enable the depth buffer
    gl.enable(gl.DEPTH_TEST);

    scene.map(mesh => mesh.render(light, camera))
     

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

