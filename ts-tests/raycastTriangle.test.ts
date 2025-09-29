import { expect, test } from 'vitest'
import { Ray, rayIntersectsTriangle, Triangle } from "demo-01-ts-webgl/lib/raycast";
import { normalize } from 'demo-01-ts-webgl/lib/vec';


// triangle is symmetrical x-y and just a bit back from origin z
const triangle: Triangle = [[1,0,0.1], [0,1,0.1], [-1, 0, 0.1]]

test('it correctly finds an intersection', () => {
   
    const ray: Ray = {
    origin: [0.5, 0.5, 0],
    direction: [0, 0, 1]
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = [0.5, 0.5, 0.1]
    expect(result, "intersection is correct").toEqual(expected)

})

test(`it correctly finds an intersection 
    even though the ray direction is not a unit vector`, () => {
   
    const ray: Ray = {
    origin: [0.5, 0.5, 0],
    direction: [0, 0, 2]
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = [0.5, 0.5, 0.1]
    expect(result, "intersection is correct").toEqual(expected)

})

test(`it correctly finds an intersection 
    even though the ray direction is not a unit vector
    and doesnt reach the triangle`, () => {
   
    const ray: Ray = {
    origin: [0.5, 0.5, 0],
    direction: [0, 0, 0.012]
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = [0.5, 0.5, 0.1]
    expect(result, "intersection is correct").toEqual(expected)

})

test('it correctly finds another intersection', () => {
   
    const ray: Ray = {
    origin: [0.2, 0.5, 0],
    direction: [0, 0, 1]
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = [0.2, 0.5, 0.1]
    expect(result, "intersection is correct").toEqual(expected)

})

test('it correctly finds no intersection based on origin', () => {
 
    // pointing away from the triangle
    const ray: Ray = {
    origin: [0.5, 0.5, 0.2],
    direction: [0, 0, 1]
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = null
    expect(result, "no intersection").toEqual(expected)

})

test('it correctly finds no intersection based on another origin', () => {
 
    // passing by the side of the triangle
    const ray: Ray = {
    origin: [1.5, 0.5, 0.2],
    direction: [0, 0, 1]
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = null
    expect(result, "no intersection").toEqual(expected)

})

test('it correctly finds no intersection based on direction', () => {
 
    // this should intersect the triangles plane, but not the triangle itself
    const ray: Ray = {
    origin: [0.5, 0.5, -10],
    direction: normalize([0, 1, 1]) 
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = null
    expect(result, "no intersection").toEqual(expected)

})

test('it correctly finds no intersection based on origin', () => {
 
    const triangle: Triangle = [ [ -10, 0, -10 ], [ -10, 0, 10 ], [ 10, 0, -10 ] ]
    // this should intersect the triangles plane, but not the triangle itself
    const ray: Ray = {
    origin: [110, 0.5, 0],
    direction: [0, -1, 0]
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = null
    expect(result, "no intersection").toEqual(expected)

})

test('it correctly finds no intersection based on origin', () => {
 
    const triangle: Triangle = [ [ -10, 0, -10 ], [ -10, 0, 10 ], [ 10, 0, -10 ] ]
    // this should intersect the triangles plane, but not the triangle itself
    const ray: Ray = {
    origin: [1, 0.5, 0],
    direction: [0, -1, 0]
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = null
    expect(result, "no intersection").toEqual(expected)

})