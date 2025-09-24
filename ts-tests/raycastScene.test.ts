import { expect, test } from 'vitest'
import { Ray, rayIntersectsSceneNode } from "demo-01-ts-webgl/lib/raycast";
import { Vertices } from 'demo-01-ts-webgl/lib/mesh';
import { initSceneNode } from 'demo-01-ts-webgl/lib/scene';
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
        
const node = initSceneNode(m4fromPositionAndEuler([-2,0,0], [0,0,0]), {
        vertices,
        material: {
            color: [1,1,1,1]
        }
    })
   

test('it correctly finds an intersection in the right place', () => {
   
    const ray: Ray = {
    origin: [-11, 0.5, 0],
    direction: [0, -1, 0]
    }

    const result = rayIntersectsSceneNode(ray, node)

    const expected = [[-11, 0.0, 0]]
    expect(result, "intersection is correct").toEqual(expected)

})


