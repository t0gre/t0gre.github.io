import { expect, test } from 'vitest'
import { Intersection, Ray, rayIntersectsVertices } from "demo-01-ts-webgl/lib/raycast";
import { Vertices } from 'demo-01-ts-webgl/lib/mesh';
import { Vec3 } from 'demo-01-ts-webgl/lib/vec';


const meshPositionsData = new Float32Array([
            -10, 0, -10, // back left
            -10, 0, 10, // front left
             10, 0, -10, // back right
            -10, 0, 10, // front left
             10, 0, 10, // front right
             10, 0, -10, // back right
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
        


test('it correctly finds an intersection in the first triangle', () => {
   
    const ray: Ray = {
    origin: { x: -1, y: 0.5, z: 0},
    direction: {x: 0, y: -1, z: 0}
    }

    const result = rayIntersectsVertices(ray, meshVertices)

    const expected: Intersection[] = [{ point: {x: -1, y: 0.0, z: 0}, triangleIdx: 0 }]
    expect(result, "intersection is correct").toEqual(expected)

})

test('it correctly finds an intersection in the last triangle', () => {
   
    const ray: Ray = {
    origin: {x: 1, y: 0.5, z: 0 },
    direction: {x: 0, y: -1, z: 0 }
    }

    const result = rayIntersectsVertices(ray, meshVertices)

    const expected: Intersection = { point: {x: 1, y: 0.0, z: 0}, triangleIdx: 1 }
    expect(result.length, "only one hit").toEqual(1)
    expect(result[0], "intersection is correct").toEqual(expected)

})

test('it correctly finds no intersection', () => {
   
    const ray: Ray = {
    origin: {x: 110, y: 0.5, z: 0},
    direction: {x: 0, y: -1, z: 0}
    }

    const result = rayIntersectsVertices(ray, meshVertices)

    const expected: Vec3[] = []
    expect(result).toEqual(expected)

})

