import { expect, test } from 'vitest'
import { Ray, rayIntersectsVertices } from "demo-01-ts-webgl/lib/raycast";
import { createMesh, Vertices } from 'demo-01-ts-webgl/lib/mesh';
import { Vec3 } from 'demo-01-ts-webgl/lib/vec';
import { SceneNode } from 'demo-01-ts-webgl/lib/scene';


const meshPositionsData = new Float32Array([
            -10 ,0, -10, // back left
            -10 ,0, 10, // front left
            10  ,0, -10, // back right
            -10 ,0, 10, // front left
             10  ,0, 10, // front right
             10  ,0, -10, // back right
            ])

           
const meshNormalsData = new Float32Array([
        0,1, 0,
        0,1, 0,
        0,1, 0,
        0,1, 0,
        0,1, 0,
        0,1, 0,
])


const meshVertices: Vertices = {
  positions: meshPositionsData,
  normals: meshNormalsData
} 
        
const node: SceneNode = {
    mesh: createMesh()
} 

test('it correctly finds an intersection in the first triangle', () => {
   
    const ray: Ray = {
    origin: [-1, 0.5, 0],
    direction: [0, -1, 0]
    }

    const result = rayIntersectsVertices(ray, meshVertices)

    const expected = [[-1, 0.0, 0]]
    expect(result, "intersection is correct").toEqual(expected)

})


