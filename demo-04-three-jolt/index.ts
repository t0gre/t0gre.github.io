import  { 
    AmbientLight, 
    BoxGeometry, 
    Color, 
    DirectionalLight, 
    Fog, 
    InstancedMesh, 
    Matrix4, 
    Mesh,  
    MeshLambertMaterial, 
    MeshStandardMaterial, 
    PerspectiveCamera, 
    Scene, 
    Vector3, 
    WebGLRenderer 
} from "three";

import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { JoltPhysics } from './joltThree'
import { getPointerClickInClipSpace } from "../three-helpers/helpers";

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

    const rayCaster = new THREE.Raycaster()


    function pickableObjectSelected(e: PointerEvent): THREE.Object3D | undefined {
        const clip = getPointerClickInClipSpace(e, canvas)
        
        rayCaster.setFromCamera(clip, camera)
        const hits = rayCaster.intersectObject(scene)

        if (hits.length > 0 && hits[0]) {

            const hitObject = hits[0].object

            if (hitObject.name == 'pickable') {
                
                return hitObject

            }
        }

        return undefined
    }

 
    let pickableObjectIsSelected: THREE.Object3D | null = null
    canvas.addEventListener('pointerdown', (e) => {
        
        const pickable = pickableObjectSelected(e)
        if (pickable) {
            pickableObjectIsSelected = pickable
            controls.enabled = false
        }
        
    })

    canvas.addEventListener('pointerup', (_) => {
        
        pickableObjectIsSelected = null
        controls.enabled = true

    })
    
    canvas.addEventListener('pointermove', (e) => {
        
        if (!pickableObjectIsSelected) return

        // convert movement to world space
        const worldDirection = new Vector3(e.movementX * 40, 0, e.movementY * 40).applyMatrix4(camera.matrixWorld)
        const direction = new physics.jolt.Vec3(worldDirection.x, worldDirection.y, worldDirection.z)

        physics.addImpulse(pickableObjectIsSelected as Mesh, direction)
    })

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


    scene.background = new Color(BACKGROUND_COLOR);
    scene.add(ambientLight, directionalLight, camera);
    scene.fog = new Fog( BACKGROUND_COLOR, 10, 100 );

    const floorThickness = 0.1
    const floorVerticalPosition = - 0.5

    const floorCollider = new Mesh(
					new BoxGeometry( 6, floorThickness, 6 ),
					new MeshStandardMaterial( { color: 0xddcc99 } )
				);
				floorCollider.position.y = floorVerticalPosition;
				floorCollider.userData.physics = { mass: 0 }; // stops it from falling
                floorCollider.receiveShadow = true
				scene.add( floorCollider );

    const cubeSideLength = 0.9
    const cubeCollider = new Mesh(
					new BoxGeometry( cubeSideLength, cubeSideLength, cubeSideLength ),
					new MeshStandardMaterial( { color: 0xff4422 } )
				);
		        cubeCollider.position.y = floorThickness / 2 + cubeSideLength / 2 + floorVerticalPosition;
		        cubeCollider.userData.physics = { mass: 2 };
                cubeCollider.receiveShadow = true
                cubeCollider.name = "pickable"
				scene.add( cubeCollider );

    camera.lookAt(floorCollider.position)
    controls.target.copy(floorCollider.position)


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
					physics.respawnMesh( boxes, position, index );

					//

					index = Math.floor( Math.random() * spheres.count );

					position.set( 0, Math.random() + 1, 0 );
					physics.respawnMesh( spheres, position, index );

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