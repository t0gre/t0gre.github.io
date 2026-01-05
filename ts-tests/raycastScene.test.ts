import { expect, test } from 'vitest'
import { Intersection, Ray, rayIntersectsSceneNode } from "demo-01-ts-webgl/lib/raycast";
import { Material, Vertices } from 'demo-01-ts-webgl/lib/mesh';
import { initSceneNode, setParent } from 'demo-01-ts-webgl/lib/scene';
import { m4fromPositionAndEuler } from 'demo-01-ts-webgl/lib/mat4';
import { POS_ORIGIN, ROT_NONE } from 'demo-01-ts-webgl/lib/vec';


const positions = new Float32Array([
            -10 ,0, -10, // back left
            -10 ,0, 10, // front left
            10  ,0, -10, // back right
            -10 ,0, 10, // front left
             10  ,0, 10, // front right
             10  ,0, -10, // back right
            ])

           
const normals = new Float32Array([
        0,1, 0,
        0,1, 0,
        0,1, 0,
        0,1, 0,
        0,1, 0,
        0,1, 0,
])


const vertices: Vertices = {
  positions,
  normals
} 
        
const material: Material = {
            color: { r: 1, g: 1, b:1},
            specularColor: {r: 1, g: 1, b: 1},
            shininess: 0
        }
 
test('it correctly finds an intersection with position transform', () => {
   
    const node =  initSceneNode(m4fromPositionAndEuler({x: -2, y: 0,z: 0}, ROT_NONE), {
        vertices,
        material
    })

    const ray: Ray = {
    origin: {x: -11, y: 0.5, z: 0},
    direction: {x: 0, y: -1, z: 0}
    }

    const result = rayIntersectsSceneNode(ray, node)

    const expected: Intersection[] = [{ point: {x: -11, y: 0.0, z: 0}, triangleIdx: 0}]
    expect(result, "intersection is correct").toEqual(expected)

})

test('it correctly finds an intersection with multiple position transforms', () => {
   
    const node =  initSceneNode(m4fromPositionAndEuler({x: -2, y: 0, z: 0}, ROT_NONE), {
        vertices,
        material
    })

    const parentNode =  initSceneNode(m4fromPositionAndEuler({ x: -2, y: 0, z: 0}, ROT_NONE))

    setParent(node, parentNode)

    const ray: Ray = {
    origin: {x: -11, y: 0.5, z: 0},
    direction: {x: 0, y: -1, z: 0}
    }

    const result = rayIntersectsSceneNode(ray, parentNode)

    const expected: Intersection[] = [{ point: { x: -11, y: 0.0, z: 0}, triangleIdx: 0}]
    expect(result, "intersection is correct").toEqual(expected)

})


test('it correctly finds an intersection with rotation transform', () => {
   
    const node =  initSceneNode(m4fromPositionAndEuler(POS_ORIGIN, {x: 0, y: 0, z: Math.PI/4}), {
        vertices,
        material
    })

    const ray: Ray = {
    origin: { x:-1, y: 2, z: 0},
    direction: {x: 0, y: -1, z: 0}
    }

    const result = rayIntersectsSceneNode(ray, node)

    const expected: Intersection[] = [{ point: {x: -1, y: -1, z: 0}, triangleIdx: 0}]

    for (let i = 0; i < expected.length; i++) {
        const elementofResult = result[0]
        const elementOfExpected = expected[0]!

         expect(elementofResult, "intersection element is preset")
        .not.toBe(undefined)


        expect(elementofResult!.point.x, "intersection point x is correct")
        .toBeCloseTo(elementOfExpected.point.x, 6)

        expect(elementofResult!.point.y, "intersection point y is correct")
        .toBeCloseTo(elementOfExpected.point.y, 6)

        expect(elementofResult!.point.z, "intersection point z is correct")
        .toBeCloseTo(elementOfExpected.point.z, 6)
    }

})