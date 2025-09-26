import { drawScene, initSceneNode, setParent, updateTransform } from './lib/scene'
import { degToRad } from './lib/mathUtils'
import { Vertices } from './lib/mesh'
import { createDirectionalLight } from './lib/light'
import { Camera, getProjectionMatrix } from './lib/camera'
import { initRenderProgram } from './lib/BasicRenderProgram'
import { loadObj } from './lib/loaders/ObjLoader'
import { InputState } from './lib/input'
import { m4fromPositionAndEuler, m4inverse, m4multiply, m4PositionMultiply, m4RayMultiply, m4yRotate, Mat4 } from './lib/mat4'
import { initGlState } from './lib/gl'
import { Ray, rayIntersectsScene } from './lib/raycast'
import { Vec3 } from './lib/vec'

// const ROTATION_SPEED = 1.2;

export async function main(canvas: HTMLCanvasElement): Promise<1> {

    
    let gl = canvas.getContext("webgl2");


    if (!gl) {
        alert('it looks like you dont have webgl available')
        return 1;
    } else {

        const glState = initGlState(gl)

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

            const shape = initSceneNode(m4fromPositionAndEuler( [0,0,0], [0, Math.PI /2, 0]),
                   {
                    vertices,
                    material: {
                        color:  [1, 1, 0.2, 1]
                    }},
                "yellow tree")

            
            const shape1 = initSceneNode(
                m4fromPositionAndEuler( [5,0,0], [0, Math.PI /2, 0]),
                { 
                    vertices, 
                    material: {
                        color:  [1, 0.5, 0.2, 1]
                    }},
                "orange tree")

            const shape2  = initSceneNode(
                 m4fromPositionAndEuler( [5,0,0], [0, Math.PI /2, 0]),
                 {
                    vertices,
                    material: {
                        color:  [0.1, 0.5, 0.2, 1]
                    }},
                "green tree")

            setParent(shape1, shape);
            setParent(shape2, shape1);

            if (!shape) {
                console.log('failed to create shape')
                return 1
            }
    
            /////////// floor
            const floorPositionsData = new Float32Array([
            -10 ,0, -10, // back left
            -10 ,0, 10, // front left
            10  ,0, -10, // back right
            -10 ,0, 10, // front left
             10  ,0, 10, // front right
             10  ,0, -10, // back right
            ])

           
            const floorNormalsData = new Float32Array([
                    0,1, 0,
                    0,1, 0,
                    0,1, 0,
                    0,1, 0,
                    0,1, 0,
                    0,1, 0,
            ])


           const floorVertices: Vertices = {
             positions: floorPositionsData,
             normals: floorNormalsData
           } 
        

            const floorNode = initSceneNode(m4fromPositionAndEuler( [0,0.1,0], [0, 0, 0]),
                    {
                    vertices: floorVertices,
                    material: {
                        color:  [0.1, 0.1, 0.2, 1]
                    }},
                "floor")

            ///////////

            const scene = [shape, floorNode]
          
            
            const light = createDirectionalLight([0, 0.5, 0.5], [0.5, 0.5, 0.5])
            const camera: Camera = {
                fieldOfViewRadians:  degToRad(60), 
                aspect: canvas.clientWidth / canvas.clientHeight,
                near: 1, 
                far:2000, 
                up: [0, 1, 0], 
                transform: m4fromPositionAndEuler([0, 3.5, 10], [0,0,0])
            } 
           
            ///////////////// 
            const input: InputState = {
                pointerPosition: [0,0]
            }

            canvas.addEventListener('pointerdown', (e) => {
                const rect = canvas.getBoundingClientRect();
            
                let x = e.clientX - rect.left;
                let y = e.clientY - rect.top;

                // these are both 0-1
                x = x * canvas.width / canvas.clientWidth
                y = y * canvas.height / canvas.clientHeight

                // convert to webgl clip space
                x = x / gl!.canvas.width * 2 -1;
                y = y  / gl!.canvas.height * -2 + 1;


                

                // calculate ray in world space
                const nearPoint: Vec3 = [x, y, -1];
                const farPoint: Vec3  = [x, y,  1];

                const viewMatrix = m4inverse(camera.transform);
                const projectionMatrix = getProjectionMatrix(camera);
                const viewProjInverse = m4inverse(m4multiply(projectionMatrix, viewMatrix));

                const worldNear = m4PositionMultiply(nearPoint, viewProjInverse);
                const worldFar  = m4PositionMultiply(farPoint, viewProjInverse);

       

                const rayOrigin = worldNear
                const rayDirection: Vec3 = [
                    worldFar[0] - worldNear[0],
                    worldFar[1] - worldNear[1],
                    worldFar[2] - worldNear[2]
                ];
                const len = Math.hypot(...rayDirection);
                const rayDirNorm = rayDirection.map(v => v / len);

                const worldRay: Ray = {
                    origin: rayOrigin,
                    direction: rayDirNorm as Vec3
                };

                const hits = rayIntersectsScene(worldRay, scene)
                // console.log('ray', mouseRay)
                console.log('worldRay', worldRay)
                console.log('hits', ...hits)
            })


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

                    // rotate the shapes transform
                    // shape.pose.rotation[1] += e.movementX / 100;
                    updateTransform(shape, m4yRotate(shape._localTransform, e.movementX / 100));

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
                const drawError = drawScene(glState!, scene, light, camera, input, basicRenderProgram!);
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

