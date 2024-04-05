import { 
    Scene, 
    PerspectiveCamera, 
    AmbientLight, 
    DirectionalLight, 
    WebGLRenderer, 
    Mesh,
    Group,
    MeshPhongMaterial,
    Color,
    Vector3,
    PlaneGeometry,
    MeshStandardMaterial} from "three";

import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

const CAMERA_START = new Vector3(0, 3.5, 10);
const DIRECTIONAL_LIGHT_MOTION_RANGE = 0.02;
const DIRECTIONAL_LIGHT_MOTION_FREQUENCY = 1/700;

export async function main(canvas: HTMLCanvasElement) {

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const renderer = new WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor('white');
    renderer.shadowMap.enabled = true;
    const scene = new Scene();
    const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight);
   

    const controls = new OrbitControls(camera, canvas);

    camera.position.copy(CAMERA_START);
    
    

    let model: Group | undefined = undefined;
    const modelColor = new Color(0.2, 0.9, 1.0);
    
    const objLoader = new OBJLoader();
    objLoader.load('/rainbowtree.obj', (root: Group) => {
        root.children.forEach((child: Mesh) => {
        
            if (Array.isArray(child.material)) {
                child.material.forEach((material: MeshPhongMaterial) => material.color = modelColor)
            }  else {
                // @ts-ignore this is just true for the rainbow model, probably unsafe for others
                const material: MeshPhongMaterial = child.material; 
                material.color  = modelColor;
            }    
            child.castShadow = true;   
            child.receiveShadow = true;
    })
        root.castShadow = true;
        root.receiveShadow = true;
        model = root;
    
        model.rotateY(Math.PI/2)
        controls.target.set(0,CAMERA_START.y, 0)
        scene.add(model)
    });

    const ambientLight = new AmbientLight(0xffffff, 0.1);
    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.translateY(1);
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
    

    const floor = new Mesh(new PlaneGeometry(40, 40), new MeshStandardMaterial({color: 0xffffff}))
    floor.rotateX(-Math.PI/2)
    floor.receiveShadow = true;

    scene.add(ambientLight, directionalLight, camera, floor);

    let oldTimestamp = 0;
    function animate(newTimestamp: number): void {
        if (!oldTimestamp) {
            oldTimestamp = newTimestamp;
        } else {
            directionalLight.translateX(DIRECTIONAL_LIGHT_MOTION_RANGE*Math.cos(newTimestamp*DIRECTIONAL_LIGHT_MOTION_FREQUENCY)); // move light
            if (model) {
                directionalLight.lookAt(model.position)
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