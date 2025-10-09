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
    Color} from "three";

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils";
import { isSkinnedMesh } from "./helpers";
import { lerp } from "three/src/math/MathUtils";

function updateFish(fishGtlf: Group, newTimestamp: number, dt: number) {
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
          
        const littleFish = cloneSkeleton(fish)
        

        littleFish.scale.multiplyScalar(5)
        littleFishes.add(littleFish)
        

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