import { drawScene, initSceneNode, setParent, updateTransform } from './lib/scene'
import { degToRad } from './lib/mathUtils'
import { Vertices } from './lib/mesh'
import { DirectionalLight, AmbientLight, PointLight } from './lib/light'
import { Camera } from './lib/camera'
import { initRenderProgram } from './lib/BasicRenderProgram'
import { loadObj } from './lib/loaders/ObjLoader'
import { InputState } from './lib/input'
import { m4fromPositionAndEuler, m4vectorMultiply, m4yRotate, m4yRotation } from './lib/mat4'
import { initGlState } from './lib/gl'
import { getWorldRayFromClipSpaceAndCamera, rayIntersectsScene, sortBySceneDepth } from './lib/raycast'
import { getPointerClickInClipSpace } from './lib/events'
import { Vec3, Vec4 } from './lib/vec'


type NodeName = "yellow tree" | "orange tree" | "green tree" | "floor";

const meshColorMap: Record<NodeName, Vec3> = {
  "yellow tree": [0.7, 0.7, 0.01 ],
  "orange tree": [0.6, 0.3, 0.001],
  "green tree": [0.1, 0.6, 0.1],
  "floor": [0.2, 0.2, 0.4]
};


export async function main(canvas: HTMLCanvasElement): Promise<1> {

    
let gl = canvas.getContext("webgl2");


if (!gl) {
    alert('it looks like you dont have webgl available')
    return 1;
} 

const glState = initGlState(gl)

resizeCanvasToDisplaySize(canvas);

gl.enableVertexAttribArray(0);

// Turn on culling. By default backfacing triangles
// will be culled.
gl.enable(gl.CULL_FACE);

// Enable the depth buffer
gl.enable(gl.DEPTH_TEST);


const basicRenderProgram = initRenderProgram(gl)

if (!basicRenderProgram) {
     alert('failed to compile shader')
    return 1;
}

const vertices = await loadObj('/rainbowtree.obj');

const yellowTree = initSceneNode(m4fromPositionAndEuler( [0,0,0], [0, Math.PI /2, 0]),
        {
        vertices,
        material: {
            color:  meshColorMap["yellow tree"],
            specularColor: [0.2,0.2,0.2],
            shininess: 0.9
        }},
    "yellow tree")


const orangeTree = initSceneNode(
    m4fromPositionAndEuler( [5,0,0], [0, Math.PI /2, 0]),
    { 
        vertices, 
        material: {
            color:  meshColorMap["orange tree"],
            specularColor: [0.2,0.2,0.2],
            shininess: 0.9
        }},
    "orange tree")

const greenTree  = initSceneNode(
        m4fromPositionAndEuler( [5,0,0], [0, Math.PI /2, 0]),
        {
        vertices,
        material: {
            color:  meshColorMap["green tree"],
            specularColor: [0.2,0.2,0.2],
            shininess: 0.5
        }},
    "green tree")

setParent(orangeTree, yellowTree);
setParent(greenTree, orangeTree);

if (!yellowTree) {
    console.log('failed to create shape')
    return 1
}

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
            color:  meshColorMap["floor"],
            specularColor: [0.2,0.2,0.2],
            shininess: 0.9
        }},
    "floor")


const scene = [yellowTree, floorNode]


// create lights
const ambientLight: AmbientLight = {
        color: [0.2, 0.2, 0.2]
    };

const directionalLight: DirectionalLight = {
        rotation : [ 0.0,  -0.8 , -0.5],
        color : [0.5,  0.5,  0.5],
    };

const pointLight: PointLight = {
        position: [ 0, 5.0, 5],
        color: [ 0.7, 0.7, 0.7],
        constant: 1.0,
        linear: 0.009,
        quadratic: 0.032
    };


const camera: Camera = {
    fieldOfViewRadians:  degToRad(60), 
    aspect: canvas.clientWidth / canvas.clientHeight,
    near: 1, 
    far:2000, 
    up: [0, 1, 0], 
    transform: m4fromPositionAndEuler([0, 3.5, 10], [0,0,0])
} 


const input: InputState = {
    pointerPosition: [0,0]
}

canvas.addEventListener('pointerdown', (e) => {
    
    const clickPoint = getPointerClickInClipSpace(canvas, e, gl!)

    // calculate ray in world space
    const worldRay = getWorldRayFromClipSpaceAndCamera(clickPoint, camera)

    const hits = rayIntersectsScene(worldRay, scene)
    
    if (hits.length > 0) {
         // sort hits by scene depth
    const sortedHits = sortBySceneDepth(hits, camera)

    const clicked = sortedHits[0]?.nodeName 

    if (clicked) {
        floorNode.mesh!.material.color = meshColorMap[clicked as NodeName]
    }
    }
   
})


canvas.addEventListener('pointerdown', () => {
    const handler = (e: PointerEvent) => {
       
        // rotate the shapes transform
        // shape.pose.rotation[1] += e.movementX / 100;
        updateTransform(yellowTree, m4yRotate(yellowTree._localTransform, e.movementX / 100));

        input.pointerPosition = getPointerClickInClipSpace(canvas, e, gl!);
    }
    canvas.addEventListener('pointerup', () => {
        canvas.removeEventListener('pointermove', handler)
        // input.pointerPosition = [0,0] N.B this is also omitted in  the C version
    })
    canvas.addEventListener('pointermove', handler )
})

///////////////////////////

let lastTime = 0;
function animate(time: DOMHighResTimeStamp) {
    time *= 0.001 // convert from millis to seconds
    const dt = time - lastTime;
    lastTime = time;
    updateLight(pointLight, dt)
    resizeCanvasToDisplaySize(canvas);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    const drawError = drawScene(
        glState, 
        scene, 
        ambientLight,
        directionalLight,
        pointLight, 
        camera, 
        basicRenderProgram!);
    if (drawError) {
        console.log('draw error')
    }
    requestAnimationFrame(animate)    
}


requestAnimationFrame(animate)
    
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

function updateLight(pointLight: PointLight, dt: number) {
      const rotator = m4yRotation(Math.PI / (dt * 10000));
      const oldTransform: Vec4 = [
        pointLight.position[0],
        pointLight.position[1],
        pointLight.position[2],
         0.0
      ];
   
    const newTransform = m4vectorMultiply(oldTransform, rotator);
    pointLight.position = [newTransform[0],newTransform[1],newTransform[2]]
}