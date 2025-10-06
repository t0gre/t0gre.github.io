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
    AnimationMixer} from "three";

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls'


const CAMERA_START = new Vector3(0, 3.5, 10);


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
    
    

    let model: Group | undefined = undefined;
    
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/striped-seabream.glb', (gltf: GLTF) => {

        
        gltf.scene.traverse((child: Mesh) => {
        
            
            child.castShadow = true;   
            // child.receiveShadow = true;
    })
        // root.children.forEach()
        // root.castShadow = true;
        // root.receiveShadow = true;
        model = gltf.scene;
    
        model.rotateY(Math.PI/2)
        model.translateY(2)
        model.scale.multiplyScalar(30)
        controls.target.set(0,CAMERA_START.y/2, 0)
        controls.update()
        scene.add(model)

        const mixer = new AnimationMixer( model );

        gltf.animations.forEach( ( clip ) => {
          
            mixer.clipAction( clip ).play();
          
        } );
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

    scene.background = new Color(0xccccff);
    scene.add(ambientLight, directionalLight, camera, floor);
    scene.fog = new Fog( 0xccccff, 10, 15 );

    let oldTimestamp = 0;
    function animate(newTimestamp: number): void {
        if (!oldTimestamp) {
            oldTimestamp = newTimestamp;
        } else {
            
            
            // model.po
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