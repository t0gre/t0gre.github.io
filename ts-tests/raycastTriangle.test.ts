import { expect, test } from 'vitest'
import { Ray, rayIntersectsTriangle, Triangle } from "demo-01-ts-webgl/lib/raycast";
import { normalized } from 'demo-01-ts-webgl/lib/vec';


// triangle is symmetrical x-y and just a bit back from origin z
const triangle: Triangle = [
    {   x: 1,  y: 0,   z: 0.1}, 
    {   x: 0,  y: 1,   z: 0.1}, 
    {   x: -1, y: 0,   z: 0.1}
]

test('it correctly finds an intersection', () => {
   
    const ray: Ray = {
    origin: {x: 0.5, y: 0.5, z: 0},
    direction: {x: 0, y: 0, z: 1 }
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = {x: 0.5, y: 0.5, z: 0.1}
    expect(result, "intersection is correct").toEqual(expected)

})

test(`it correctly finds an intersection 
    even though the ray direction is not a unit vector`, () => {
   
    const ray: Ray = {
    origin: {x: 0.5, y: 0.5, z: 0},
    direction: {x: 0, y: 0, z: 2 }
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = {x: 0.5, y: 0.5, z: 0.1}
    expect(result, "intersection is correct").toEqual(expected)

})

test(`it correctly finds an intersection 
    even though the ray direction is not a unit vector
    and doesnt reach the triangle`, () => {
   
    const ray: Ray = {
    origin: {x: 0.5, y: 0.5, z: 0},
    direction: {x: 0, y: 0, z: 0.012}
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = {x: 0.5, y: 0.5, z: 0.1}
    expect(result, "intersection is correct").toEqual(expected)

})

test('it correctly finds another intersection', () => {
   
    const ray: Ray = {
    origin: {x: 0.2, y: 0.5, z: 0},
    direction: {x: 0, y: 0, z: 1}
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = {x: 0.2, y: 0.5, z: 0.1}
    expect(result, "intersection is correct").toEqual(expected)

})

test('it correctly finds no intersection based on origin', () => {
 
    // pointing away from the triangle
    const ray: Ray = {
    origin: {x: 0.5, y: 0.5, z: 0.2},
    direction: {x: 0, y: 0, z: 1 }
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = null
    expect(result, "no intersection").toEqual(expected)

})

test('it correctly finds no intersection based on another origin', () => {
 
    // passing by the side of the triangle
    const ray: Ray = {
    origin: { x: 1.5, y: 0.5, z: 0.2},
    direction: {x: 0, y: 0, z: 1 }
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = null
    expect(result, "no intersection").toEqual(expected)

})

test('it correctly finds no intersection based on direction', () => {
 
    // this should intersect the triangles plane, but not the triangle itself
    const ray: Ray = {
    origin: {x: 0.5, y: 0.5, z: -10},
    direction: normalized({x: 0, y: 1, z:1}) 
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = null
    expect(result, "no intersection").toEqual(expected)

})

test('it correctly finds no intersection based on origin', () => {
 
    const triangle: Triangle = [ 
        { x: -10, y: 0, z: -10  }, 
        { x: -10, y: 0, z: 10   }, 
        { x: 10,  y: 0, z: -10  } 
    ]
    // this should intersect the triangles plane, but not the triangle itself
    const ray: Ray = {
    origin: {x: 110, y: 0.5, z: 0},
    direction: {x: 0, y: -1, z: 0}
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = null
    expect(result, "no intersection").toEqual(expected)

})

test('it correctly finds no intersection based on origin', () => {
 
    const triangle: Triangle = [ 
        { x: -10, y: 0, z: -10 }, 
        { x: -10, y: 0, z:  10 }, 
        { x:  10, y: 0, z: -10 } ]
    // this should intersect the triangles plane, but not the triangle itself
    const ray: Ray = {
    origin: { x: 1, y: 0.5, z: 0},
    direction: {x: 0, y: -1, z: 0}
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = null
    expect(result, "no intersection").toEqual(expected)

})