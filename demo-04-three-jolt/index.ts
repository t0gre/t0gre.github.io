import  { 
    AmbientLight, 
    BoxGeometry, 
    Color, 
    DirectionalLight, 
    Fog, 
    InstancedMesh, 
    Matrix4, 
    Mesh, 
    MeshBasicMaterial, 
    MeshLambertMaterial, 
    MeshStandardMaterial, 
    PerspectiveCamera, 
    PlaneGeometry, 
    Scene, 
    Vector3, 
    WebGLRenderer 
} from "three";

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { JoltPhysics } from './joltThree'



const CAMERA_START = new Vector3(0, 3.5, 10);
const BACKGROUND_COLOR = 0x7799ff

export async function main(canvas: HTMLCanvasElement) {

    const physics = await JoltPhysics()
    const position = new Vector3()

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const renderer = new WebGLRenderer({ canvas, antialias: true });
    
    renderer.shadowMap.enabled = true;
    const scene = new Scene();
    const camera = new PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight);
   

    const controls = new OrbitControls(camera, canvas);
    controls.maxPolarAngle = Math.PI / 2 - 0.01
    controls.maxDistance = 13
    controls.minDistance = 3.5
    controls.enablePan = false

    camera.position.copy(CAMERA_START);
 

   
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
  

    const floor = new Mesh(new PlaneGeometry(4, 4), new MeshStandardMaterial({color: 0xddcc99}))
    floor.rotateX(-Math.PI/2)
    floor.receiveShadow = true;

    scene.background = new Color(BACKGROUND_COLOR);
    scene.add(ambientLight, directionalLight, camera, floor);
    scene.fog = new Fog( BACKGROUND_COLOR, 10, 100 );

    const floorCollider = new Mesh(
					new BoxGeometry( 4, 5, 4 ),
					new MeshBasicMaterial( { color: 0x666666 } )
				);
				floorCollider.position.y = - 2.5;
				floorCollider.userData.physics = { mass: 0 };
				floorCollider.visible = false;
				scene.add( floorCollider );

    const matrix = new Matrix4();
	const color = new Color();
    const material = new MeshLambertMaterial();

	// Boxes

    const geometryBox = new BoxGeometry( 0.075, 0.075, 0.075 );
    const boxes = new InstancedMesh( geometryBox, material, 400 );
    boxes.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
    boxes.castShadow = true;
    boxes.receiveShadow = true;
    boxes.userData.physics = { mass: 1 };
    scene.add( boxes );

    for ( let i = 0; i < boxes.count; i ++ ) {

					matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
					boxes.setMatrixAt( i, matrix );
					boxes.setColorAt( i, color.setHex( 0xffffff * Math.random() ) );

				}

    // Spheres

	const geometrySphere = new THREE.IcosahedronGeometry( 0.05, 4 );
	const spheres = new THREE.InstancedMesh( geometrySphere, material, 400 );
	spheres.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
	spheres.castShadow = true;
	spheres.receiveShadow = true;
	spheres.userData.physics = { mass: 1 };
	scene.add( spheres)

	for ( let i = 0; i < spheres.count; i ++ ) {
		matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
		spheres.setMatrixAt( i, matrix );
		spheres.setColorAt( i, color.setHex( 0xffffff * Math.random() ) )
	}


    physics.addScene( scene );

    setInterval( () => {

					let index = Math.floor( Math.random() * boxes.count );

					position.set( 0, Math.random() + 1, 0 );
					physics.setMeshPosition( boxes, position, index );

					//

					index = Math.floor( Math.random() * spheres.count );

					position.set( 0, Math.random() + 1, 0 );
					physics.setMeshPosition( spheres, position, index );

				}, 1000 / 60 );

    for ( let i = 0; i < boxes.count; i ++ ) {

        matrix.setPosition( Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5 );
        boxes.setMatrixAt( i, matrix );
        boxes.setColorAt( i, color.setHex( 0xffffff * Math.random() ) );

    }

    let oldTimestamp = 0;
    function animate(newTimestamp: number): void {
        if (!oldTimestamp) {
            oldTimestamp = newTimestamp;
        } else {
            
            // const dt = newTimestamp - oldTimestamp
            
            
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