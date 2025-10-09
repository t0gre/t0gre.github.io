import { 
    Scene, 
    PerspectiveCamera, 
    AmbientLight, 
    DirectionalLight, 
    WebGLRenderer, 
    Mesh,
    Group,
    Vector3,
    PlaneGeometry,
    MeshStandardMaterial,
    Fog,
    Color,
    Object3D,
    SkinnedMesh} from "three";

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils";
import { disposeMaterial, isSkinnedMesh } from "./helpers";
import { lerp } from "three/src/math/MathUtils";


const SPAWN_LOCATIONS = [
    new Vector3(9, 0.5, 0),
    new Vector3(9, 4, 0),
    new Vector3(9, 2, 3),
    new Vector3(9, 2, 6),
    new Vector3(9, 2, -2),
    new Vector3(9, 0.7, 5),
    new Vector3(9, 4, -3),
]




function updateFish(fishGtlf: Object3D, newTimestamp: number, dt: number) {
    const fishMesh =  fishGtlf.children[0]!.children[1]!

        if (!isSkinnedMesh(fishMesh)) {
            return
        }

        const fishJawBone = fishMesh.skeleton.bones[5]!
        const fishSpineBone = fishMesh.skeleton.bones[10]!

        if (!fishSpineBone) {
             console.log("something went wrong on loading, fish spine bone not found")
        }
    

        const spineRotation = lerp(fishSpineRange[0], fishSpineRange[1], (Math.sin(newTimestamp/(dt*200)) + 1)/2)
        fishSpineBone.rotation.set(0,0,spineRotation)

        const jawRotation = lerp(fishJawRange[0], fishJawRange[1], (Math.sin(newTimestamp/(dt*1000)) + 1)/2)
        fishJawBone.rotation.set(jawRotation - 0.9, 0, 0)
}

function updateLittleFish(fishGtlf: Object3D, newTimestamp: number, dt: number) {
    updateFish(fishGtlf, newTimestamp, dt)

    // move it
    fishGtlf.translateZ(0.05)

    
}

function cleanUpLittleFishes(littleFishes: Group) {

    for (const fishGtlf of littleFishes.children) {
         if (fishGtlf.position.x < - 10) {
        littleFishes.remove(fishGtlf)
        fishGtlf.visible = false
        const fishMesh =  fishGtlf.children[0]!.children[1]! as SkinnedMesh
        
        disposeMaterial(fishMesh.material)
    }
    }
   
   
}

function spawnLittleFish(fish: Group, littleFishes: Group) {
    const littleFish = cloneSkeleton(fish)
     
    const spawnLocationIdx = Math.round(Math.random() * 6)
    const spawnLocation = SPAWN_LOCATIONS[spawnLocationIdx]!

    littleFish.scale.multiplyScalar(0.1)
    littleFish.rotateY(Math.PI)
    littleFish.position.copy(spawnLocation)
    littleFishes.add(littleFish)
}

const CAMERA_START = new Vector3(0, 3.5, 10);
const BACKGROUND_COLOR = 0x444488
const fishSpineRange: [number, number] = [-0.1, 0.1]
const fishJawRange: [number, number] = [0, 0.2]


export async function main(canvas: HTMLCanvasElement) {

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const renderer = new WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor('white');
    renderer.shadowMap.enabled = true;
    const scene = new Scene();
    const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight);
   

    const controls = new OrbitControls(camera, canvas);
    controls.maxPolarAngle = Math.PI / 2

    camera.position.copy(CAMERA_START);
    
    

    let fish: Group | undefined = undefined;
    let littleFishes: Group = new Group()
    scene.add(littleFishes)
    
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/striped-seabream.glb', (gltf: GLTF) => {

        
        gltf.scene.traverse((child: Mesh) => {
        
            child.castShadow = true;   
          
    })
      
        fish = gltf.scene;

        fish.rotateY(Math.PI/2)
        fish.translateY(2)
        fish.scale.multiplyScalar(30)
        controls.target.set(0,CAMERA_START.y/2, 0)
        controls.update()
        scene.add(fish)

    });

    

    const ambientLight = new AmbientLight(0xffffff, 0.1);
    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.translateY(5);
    directionalLight.castShadow =true;
    // these values are pure trial an error 
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.bottom = 0
    directionalLight.shadow.camera.top = 50
    directionalLight.shadow.camera.near = 0.1
    directionalLight.shadow.camera.zoom = 1
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.translateZ(4);
    

    

    const floor = new Mesh(new PlaneGeometry(400, 400), new MeshStandardMaterial({color: 0xffee55}))
    floor.rotateX(-Math.PI/2)
    floor.receiveShadow = true;

    scene.background = new Color(BACKGROUND_COLOR);
    scene.add(ambientLight, directionalLight, camera, floor);
    scene.fog = new Fog( BACKGROUND_COLOR, 10, 15 );

    let oldTimestamp = 0;
    function animate(newTimestamp: number): void {
        if (!oldTimestamp) {
            oldTimestamp = newTimestamp;
        } else {
            
            const dt = newTimestamp/oldTimestamp
            // animate the fish 
            if (!fish) {
                // hasn't loaded yet
            } else {

               updateFish(fish, newTimestamp, dt)
            
            
               if (Math.abs(Math.sin(newTimestamp)) < 0.01) {
                // console.log("spawn", Math.abs(Math.sin(newTimestamp)))
                spawnLittleFish(fish, littleFishes)
               }
               
               for (const littleFish of littleFishes.children) {
                updateLittleFish(littleFish, newTimestamp, dt/10)
               }

               cleanUpLittleFishes(littleFishes)
                 
            }

            
            renderer.render(scene, camera);
            oldTimestamp = newTimestamp;
        }
       
        requestAnimationFrame(animate)
    }
    
    requestAnimationFrame(animate)
    window.addEventListener('resize', () => {
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newHeight, newHeight, false)
    })



}