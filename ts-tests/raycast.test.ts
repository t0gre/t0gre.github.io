import { expect, test } from 'vitest'
import { Ray, rayIntersectsTriangle, Triangle } from "demo-01-ts-webgl/lib/raycast";



test('it correctly finds an intersection', () => {

    // triangle is symmetrical x-y and just a bit back from origin z
    const triangle: Triangle = [[1,0,0.1], [0,1,0.1], [-1, 0, 0.1]]
    const ray: Ray = {
    origin: [0.5, 0.5, 0],
    direction: [0, 0, 1]
    }

    const result = rayIntersectsTriangle(ray, triangle)

    const expected = [0.5, 0.5, 0.1]
    expect(result, "intersection result is correct").toEqual(expected)

})