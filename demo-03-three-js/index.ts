import { 
    Scene, 
    PerspectiveCamera, 
    AmbientLight, 
    DirectionalLight, 
    WebGLRenderer, 
    Group} from "three";

import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';

export async function main(canvas: HTMLCanvasElement) {

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const renderer = new WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor('white');
    const scene = new Scene();
    const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight);
    camera.translateZ(10)
    camera.translateY(3.5)

    let model: Group | undefined = undefined;
    
    const objLoader = new OBJLoader();
    objLoader.load('/rainbowtree.obj', (root) => {
        console.log(root)
        model = root;
        scene.add(model)
    });

    const ambientLight = new AmbientLight();
    const directionalLight = new DirectionalLight();

    scene.add(ambientLight, directionalLight, camera);

    let oldTimestamp = 0;
    function animate(newTimestamp: number): void {
        if (!oldTimestamp) {
            oldTimestamp = newTimestamp;
        } else {
            model?.rotateY(0.01)
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