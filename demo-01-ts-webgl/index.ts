import { initSceneNode, setParent } from './lib/scene'
import { degToRad } from './lib/mathUtils'
import { Vertices } from './lib/mesh'
import { DirectionalLight, AmbientLight, PointLight } from './lib/light'
import { Camera } from './lib/camera'
import { initBasicRenderProgram, drawScene, createShadowMap, initShadowRenderProgram } from './lib/BasicRenderProgram'
import { loadObj } from './lib/loaders/ObjLoader'
import { InputState } from './lib/input'
import { m4fromPositionAndEuler, m4lookAt, m4vectorMultiply, m4yRotation } from './lib/mat4'
import { initGlState } from './lib/gl'
import { getWorldRayFromClipSpaceAndCamera, rayIntersectsScene, sortBySceneDepth } from './lib/raycast'
import { getPointerClickInClipSpace } from './lib/events'
import { Color, POS_ORIGIN, ROT_NONE, Vec3, Vec4, calculateOrbitPosition } from './lib/vec'


type NodeName = "yellow tree" | "orange tree" | "green tree" | "floor";

const meshColorMap: Record<NodeName, Color> = {
  "yellow tree":    { r: 0.7, g: 0.7, b: 0.01 },
  "orange tree":    { r: 0.6, g: 0.3, b: 0.001 },
  "green tree":     { r: 0.1, g: 0.6, b: 0.1 },
  "floor":          { r: 0.2, g: 0.2, b: 0.4}
};

type Orbit = {
    azimuth: number
    elevation: number
    radius: number 
    target: Vec3
    sensitivity: number
}
const orbit: Orbit = {
    azimuth: Math.PI * -0.2,  // horizontal angle, in radians
    elevation: 3 * Math.PI / 4,  // vertical angle, in radians
    radius: 15,
    target: {x: -3, y: 2, z: -2},
    sensitivity: 0.01,
} 

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

gl.clearColor(0.1, 0.1, 0.1 ,1);


const basicRenderProgram = initBasicRenderProgram(gl)

 // Shadow map setup
const shadowMap = createShadowMap(gl);
const shadowRenderProgram = initShadowRenderProgram(gl);

if (!basicRenderProgram) {
     alert('failed to compile shader')
    return 1;
}


const vertices = await loadObj('/rainbowtree.obj');

const yellowTree = initSceneNode(m4fromPositionAndEuler( POS_ORIGIN, { x: 0, y: Math.PI /2, z: 0}),
        {
        vertices,
        material: {
            color:  meshColorMap["yellow tree"],
            specularColor: { r: 0.2, g: 0.2, b:0.2 },
            shininess: 0.9
        }},
    "yellow tree")


const orangeTree = initSceneNode(
    m4fromPositionAndEuler( { x: 5, y: 0, z: 0 }, { x: 0, y: Math.PI /2, z: 0 }),
    { 
        vertices, 
        material: {
            color:  meshColorMap["orange tree"],
            specularColor: { r: 0.2, g: 0.2, b: 0.2},
            shininess: 0.9
        }},
    "orange tree")

const greenTree  = initSceneNode(
        m4fromPositionAndEuler( { x: 5, y: 0, z: 0}, { x: 0, y: Math.PI /2, z: 0 }),
        {
        vertices,
        material: {
            color:  meshColorMap["green tree"],
            specularColor: { r: 0.2, g: 0.2, b: 0.2},
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
-1000 ,0, -1000, // back left
-1000 ,0, 1000, // front left
1000  ,0, -1000, // back right
-1000 ,0, 1000, // front left
    1000  ,0, 1000, // front right
    1000  ,0, -1000, // back right
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


const floorNode = initSceneNode(m4fromPositionAndEuler( { x: 0, y: 0.1, z: 0}, ROT_NONE),
        {
        vertices: floorVertices,
        material: {
            color:  meshColorMap["floor"],
            specularColor: { r: 0.2, g: 0.2, b: 0.2},
            shininess: 0.9
        }},
    "floor")


const scene = [yellowTree, floorNode]


// create lights
const ambientLight: AmbientLight = {
        color: { r: 0.2, g: 0.2, b: 0.2 }
    };

const directionalLight: DirectionalLight = {
        rotation : { x: 0,  y: -0.8 , z: -0.5},
        color : { r: 0.6,  g: 0.6,  b: 0.6 },
    };

const pointLight: PointLight = {
        position: { x:  0, y: 5.0, z: 5 },
        color: {r: 0.7, g: 0.7, b: 0.7 },
        constant: 1.0,
        linear: 0.009,
        quadratic: 0.032
    };

const cameraPosition = calculateOrbitPosition(
        orbit.azimuth, 
        orbit.elevation, 
        orbit.target, 
        orbit.radius
    );

const up: Vec3 = {x: 0, y: 1, z: 0 }
const camera: Camera = {
    fieldOfViewRadians:  degToRad(60), 
    aspect: canvas.clientWidth / canvas.clientHeight,
    near: 1, 
    far:2000, 
    up, 
    transform: m4lookAt(cameraPosition, orbit.target, up)
} 



const input: InputState = {
    pointerPosition: {x: 0, y: 0 }
}



canvas.addEventListener('pointerdown', (e) => {
    
    const clickPoint = getPointerClickInClipSpace(canvas, e)

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
       
        orbit.azimuth += -e.movementX * orbit.sensitivity;
        orbit.elevation -= e.movementY * orbit.sensitivity; 

        const newCameraPosition = calculateOrbitPosition(
        orbit.azimuth, 
        orbit.elevation, 
        orbit.target, 
        orbit.radius
    );

        camera.transform = m4lookAt(newCameraPosition, orbit.target, camera.up);

        input.pointerPosition = getPointerClickInClipSpace(canvas, e);
    }
    canvas.addEventListener('pointerup', () => {
        canvas.removeEventListener('pointermove', handler)
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
    // updateDirectionalLight(directionalLight, time)
    resizeCanvasToDisplaySize(canvas);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;

    

    const drawError = drawScene(
        glState, 
        scene, 
        ambientLight,
        directionalLight,
        pointLight, 
        camera, 
        basicRenderProgram!,
        shadowMap,
        shadowRenderProgram
    );
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
// function updateDirectionalLight(light: DirectionalLight, time: number) {
    
//     const oldRotation = light.rotation
      
   
//     light.rotation = [oldRotation[0], Math.sin(time), oldRotation[2]]
    
// }

function updateLight(pointLight: PointLight, dt: number) {
      const rotator = m4yRotation(Math.PI / (dt * 10000));
      const oldTransform: Vec4 = {
        ...pointLight.position,
        w: 0.0
      };
   
    const newTransform = m4vectorMultiply(oldTransform, rotator);
    pointLight.position = { x: newTransform.x, y: newTransform.y, z: newTransform.z }
}