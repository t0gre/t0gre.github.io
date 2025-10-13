import { Clock, Vector3, Quaternion, Matrix4, Mesh, Scene, InstancedMesh } from 'three';
import { GeometryUnion, 
    isBoxGeometry, 
    isIcosahedronGeometry, 
    isInstancedMesh, 
    isMesh, 
    isSphereGeometry } from '../three-helpers/helpers';

import initJolt from "jolt-physics";
import joltWasmUrl from "jolt-physics/jolt-physics.wasm.wasm?url"; //@

const frameRate = 60;
const UNIT_QUATERNION = new Quaternion()



function getShape( geometry: GeometryUnion, jolt: typeof initJolt ) {


    if (isBoxGeometry(geometry)) {

        const sx = geometry.parameters.width / 2;
        const sy = geometry.parameters.height / 2;
        const sz = geometry.parameters.depth / 2;

        return new jolt.BoxShape( 
            new jolt.Vec3( sx, sy, sz ), 
            0.05 * Math.min( sx, sy, sz ), 
            undefined);

    } else if (isSphereGeometry(geometry) || isIcosahedronGeometry(geometry) ) {

        const radius = geometry.parameters.radius !== undefined ? geometry.parameters.radius : 1;

        return new jolt.SphereShape( radius, undefined );

    // } else {
    //     return new jolt.MeshShape()
    }

    return null;

}

// Object layers
const LAYER_NON_MOVING = 0;
const LAYER_MOVING = 1;
const NUM_OBJECT_LAYERS = 2;

function setupCollisionFiltering( settings: initJolt.JoltSettings, jolt: typeof initJolt ) {

    const objectFilter = new jolt.ObjectLayerPairFilterTable( NUM_OBJECT_LAYERS );
    objectFilter.EnableCollision( LAYER_NON_MOVING, LAYER_MOVING );
    objectFilter.EnableCollision( LAYER_MOVING, LAYER_MOVING );

    const BP_LAYER_NON_MOVING = new jolt.BroadPhaseLayer( 0 );
    const BP_LAYER_MOVING = new jolt.BroadPhaseLayer( 1 );
    const NUM_BROAD_PHASE_LAYERS = 2;

    const bpInterface = new jolt.BroadPhaseLayerInterfaceTable( NUM_OBJECT_LAYERS, NUM_BROAD_PHASE_LAYERS );
    bpInterface.MapObjectToBroadPhaseLayer( LAYER_NON_MOVING, BP_LAYER_NON_MOVING );
    bpInterface.MapObjectToBroadPhaseLayer( LAYER_MOVING, BP_LAYER_MOVING );

    settings.mObjectLayerPairFilter = objectFilter;
    settings.mBroadPhaseLayerInterface = bpInterface;
    settings.mObjectVsBroadPhaseLayerFilter = new jolt.ObjectVsBroadPhaseLayerFilterTable( settings.mBroadPhaseLayerInterface, NUM_BROAD_PHASE_LAYERS, settings.mObjectLayerPairFilter, NUM_OBJECT_LAYERS );

}


async function JoltPhysics() {

    const jolt = await initJolt({
        locateFile: () => joltWasmUrl,
        });

    const settings = new jolt.JoltSettings();
    setupCollisionFiltering( settings, jolt );

    const joltInterface = new jolt.JoltInterface( settings );
    jolt.destroy( settings );

    const physicsSystem = joltInterface.GetPhysicsSystem();
    const bodyInterface = physicsSystem.GetBodyInterface();

    const meshes: Mesh[] = [];
    const meshMap = new WeakMap();

    const _position = new Vector3();
    const _quaternion = new Quaternion();
    const _scale = new Vector3( 1, 1, 1 );

    const _matrix = new Matrix4();

    function addScene( scene: Scene ) {

        scene.traverse( function ( child ) {

            if (isMesh(child)) {

                const physics = child.userData.physics;

                if ( physics ) {

                    addMesh( child, physics.mass, physics.restitution );

                }

            }

        } );

    }

    function addMesh( mesh: Mesh, mass = 0, restitution = 0 ) {

        const shape = getShape( mesh.geometry as GeometryUnion, jolt );

        if ( shape === null ) return;

        const body = isInstancedMesh(mesh)
            ? createInstancedBody( mesh, mass, restitution, shape )
            : createBody( mesh.position, mesh.quaternion, mass, restitution, shape );

    
            meshes.push( mesh );
            meshMap.set( mesh, body );


    }

    function createInstancedBody( mesh: InstancedMesh, mass: number, restitution: number, shape: initJolt.Shape ) {

        const array = mesh.instanceMatrix.array;

        const bodies = [];

        for ( let i = 0; i < mesh.count; i ++ ) {

            const position = _position.fromArray( array, i * 16 + 12 );
            const quaternion = _quaternion.setFromRotationMatrix( _matrix.fromArray( array, i * 16 ) ); // TODO Copilot did this
            bodies.push( createBody( position, quaternion, mass, restitution, shape ) );

        }

        return bodies;

    }

    function createBody( position: Vector3, rotation: Quaternion, mass: number, restitution: number, shape: initJolt.Shape ) {

        const pos = new jolt.RVec3( position.x, position.y, position.z );
        const rot = new jolt.Quat( rotation.x, rotation.y, rotation.z, rotation.w );

        const motion = mass > 0 ? jolt.EMotionType_Dynamic : jolt.EMotionType_Static;
        const layer = mass > 0 ? LAYER_MOVING : LAYER_NON_MOVING;

        const creationSettings = new jolt.BodyCreationSettings( shape, pos, rot, motion, layer ); // pos is RVec3
        creationSettings.mRestitution = restitution;

        const body = bodyInterface.CreateBody( creationSettings );

        bodyInterface.AddBody( body.GetID(), jolt.EActivation_Activate );

        jolt.destroy( creationSettings );

        return body;

    }

    function respawnMesh( mesh: Mesh, position: Vector3, index = 0 ) {

        if (isInstancedMesh(mesh)) {

            const bodies = meshMap.get( mesh );

            const body = bodies[ index ];

            bodyInterface.RemoveBody( body.GetID() );
            bodyInterface.DestroyBody( body.GetID() );

            const bodyPhysicsProps = mesh.userData.physics;

            const shape = body.GetShape();
            const body2 = createBody( 
                position, 
                UNIT_QUATERNION, 
                bodyPhysicsProps.mass, 
                bodyPhysicsProps.restitution, 
                shape );

            bodies[ index ] = body2;

        } else {

            // TODO: Implement this

        }

    }

    function addImpulse(mesh: Mesh, direction: initJolt.Vec3, index = 0) {
        if (isInstancedMesh(mesh)) {

            const bodies = meshMap.get( mesh );

            const body = bodies[ index ];

            bodyInterface.AddImpulse( body.GetID(), direction );
           

        } else {

            const body = meshMap.get( mesh );

            console.log(body, direction)
            bodyInterface.AddImpulse( body.GetID(), direction );

        }
    }

    // function setMeshVelocity( mesh: Mesh, velocity: number, index = 0 ) {

    //     /*
    //     let body = meshMap.get( mesh );

    //     if ( mesh.isInstancedMesh ) {

    //         body = body[ index ];

    //     }

    //     body.setLinvel( velocity );
    //     */

    // }

    //

    const clock = new Clock();

    function step() {

        let deltaTime = clock.getDelta();

        // Don't go below 30 Hz to prevent spiral of death
        deltaTime = Math.min( deltaTime, 1.0 / 30.0 );

        // When running below 55 Hz, do 2 steps instead of 1
        const numSteps = deltaTime > 1.0 / 55.0 ? 2 : 1;

        // Step the physics world
        joltInterface.Step( deltaTime, numSteps );

        //

        for ( let i = 0, l = meshes.length; i < l; i ++ ) {

            const mesh = meshes[ i ]!;

            if (isInstancedMesh(mesh)) {

                const array = mesh.instanceMatrix.array;
                const bodies = meshMap.get( mesh );

                for ( let j = 0; j < bodies.length; j ++ ) {

                    const body = bodies[ j ];

                    const position = body.GetPosition();
                    const quaternion = body.GetRotation();

                    _position.set( position.GetX(), position.GetY(), position.GetZ() );
                    _quaternion.set( quaternion.GetX(), quaternion.GetY(), quaternion.GetZ(), quaternion.GetW() );

                    _matrix.compose( _position, _quaternion, _scale ).toArray( array, j * 16 );

                }

                mesh.instanceMatrix.needsUpdate = true;
                mesh.computeBoundingSphere();

            } else {

                const body = meshMap.get( mesh );

                const position = body.GetPosition();
                const rotation = body.GetRotation();

                mesh.position.set( position.GetX(), position.GetY(), position.GetZ() );
                mesh.quaternion.set( rotation.GetX(), rotation.GetY(), rotation.GetZ(), rotation.GetW() );

            }

        }

    }

    // animate

    setInterval( step, 1000 / frameRate );

    return {
        /**
         * Adds the given scene to this physics simulation. Only meshes with a
         * `physics` object in their {@link Object3D#userData} field will be honored.
         * The object can be used to store the mass and restitution of the mesh. E.g.:
         * ```js
         * box.userData.physics = { mass: 1, restitution: 0 };
         * ```
         *
         * @method
         * @name JoltPhysics#addScene
         * @param {Object3D} scene The scene or any type of 3D object to add.
         */
        addScene: addScene,

        /**
         * Adds the given mesh to this physics simulation.
         *
         * @method
         * @name JoltPhysics#addMesh
         * @param {Mesh} mesh The mesh to add.
         * @param {number} [mass=0] The mass in kg of the mesh.
         * @param {number} [restitution=0] The restitution/friction of the mesh.
         */
        addMesh: addMesh,

        /**
         * Set the position of the given mesh which is part of the physics simulation. Calling this
         * method will reset the current simulated velocity of the mesh.
         *
         * @method
         * @name JoltPhysics#setMeshPosition
         * @param {Mesh} mesh The mesh to update the position for.
         * @param {Vector3} position - The new position.
         * @param {number} [index=0] - If the mesh is instanced, the index represents the instanced ID.
         */
        respawnMesh: respawnMesh,

        // NOOP
        // setMeshVelocity: setMeshVelocity
        applyForce: addImpulse,

        jolt: jolt
    };

}

export { JoltPhysics };
