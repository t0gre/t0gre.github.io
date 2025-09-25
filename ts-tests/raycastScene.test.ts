import { expect, test } from 'vitest'
import { Ray, rayIntersectsSceneNode } from "demo-01-ts-webgl/lib/raycast";
import { Vertices } from 'demo-01-ts-webgl/lib/mesh';
import { initSceneNode, setParent } from 'demo-01-ts-webgl/lib/scene';
import { m4fromPositionAndEuler } from 'demo-01-ts-webgl/lib/mat4';


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
        
 
test('it correctly finds an intersection with position transform', () => {
   
    const node =  initSceneNode(m4fromPositionAndEuler([-2,0,0], [0,0,0]), {
        vertices,
        material: {
            color: [1,1,1,1]
        }
    })

    const ray: Ray = {
    origin: [-11, 0.5, 0],
    direction: [0, -1, 0]
    }

    const result = rayIntersectsSceneNode(ray, node)

    const expected = [[-11, 0.0, 0]]
    expect(result, "intersection is correct").toEqual(expected)

})

test('it correctly finds an intersection with multiple position transforms', () => {
   
    const node =  initSceneNode(m4fromPositionAndEuler([-2,0,0], [0,0,0]), {
        vertices,
        material: {
            color: [1,1,1,1]
        }
    })

    const parentNode =  initSceneNode(m4fromPositionAndEuler([-2,0,0], [0,0,0]))

    setParent(node, parentNode)

    const ray: Ray = {
    origin: [-11, 0.5, 0],
    direction: [0, -1, 0]
    }

    const result = rayIntersectsSceneNode(ray, parentNode)

    const expected = [[-11, 0.0, 0]]
    expect(result, "intersection is correct").toEqual(expected)

})


test('it correctly finds an intersection with rotation transform', () => {
   
    const node =  initSceneNode(m4fromPositionAndEuler([0,0,0], [0,0,Math.PI/4]), {
        vertices,
        material: {
            color: [1,1,1,1]
        }
    })

    const ray: Ray = {
    origin: [-1, 2, 0],
    direction: [0, -1, 0]
    }

    const result = rayIntersectsSceneNode(ray, node)

    const expected = [[-1, -1, 0]]

    for (let i = 0; i < expected.length; i++) {
        const elementofResult = result[0]![i]!
        const elementOfExpected = expected[0]![i]!
        expect(elementofResult, "intersection element is correct")
        .toBeCloseTo(elementOfExpected, 6)
    }

})