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
    Vector3} from "three";

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
        }       })
        
        model = root;
    
        model.rotateY(Math.PI/2)
        controls.target.set(0,CAMERA_START.y, 0)
        scene.add(model)
    });

    const ambientLight = new AmbientLight(0xffffff, 0.1);
    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.translateZ(0.3);
    

    scene.add(ambientLight, directionalLight, camera);

    let oldTimestamp = 0;
    function animate(newTimestamp: number): void {
        if (!oldTimestamp) {
            oldTimestamp = newTimestamp;
        } else {
            directionalLight.translateX(DIRECTIONAL_LIGHT_MOTION_RANGE*Math.sin(newTimestamp*DIRECTIONAL_LIGHT_MOTION_FREQUENCY)); // move light
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