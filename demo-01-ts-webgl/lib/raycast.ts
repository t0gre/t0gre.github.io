import { Vertices } from "./mesh";
import { Mesh } from "./mesh";
import { SceneNode, Scene } from "./scene";
import { addVectors, cross, dot, scaleVector, subtractVectors, Vec3 } from "./vec";

export type Triangle = [Vec3, Vec3, Vec3]

export type Ray = {
    origin: Vec3,
    direction: Vec3 
}

// https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
export function rayIntersectsTriangle(ray: Ray, triangle: Triangle): Vec3 | null {

    const epsilon = Number.EPSILON

    const edge1 = subtractVectors(triangle[1], triangle[0])
    const edge2 = subtractVectors(triangle[2], triangle[0])
    const rayCrossEdge2 = cross(ray.direction, edge2)
    const det = dot(edge1, rayCrossEdge2)

    if (det > -epsilon && det < epsilon) {
        return null // the ray is parallel to this triangle
    }
    
    const invDet = 1 / det;
    const s = subtractVectors(ray.origin, triangle[0])
    const u = invDet * dot(s, rayCrossEdge2);

    if ((u < 0 && Math.abs(u) > epsilon) || (u > 1 && Math.abs(u-1) > epsilon))
        return null;

    const sCrossEdge1 = cross(s, edge1);
    const v = invDet * dot(ray.direction, sCrossEdge1)

    if ((v < 0 && Math.abs(v) > epsilon) || (u + v > 1 && Math.abs(u + v - 1) > epsilon))
        return null;

    // At this stage we can compute t to find out where the intersection point is on the line.
    const t = invDet * dot(edge2, sCrossEdge1); 

     if (t > epsilon) { // ray intersection
        return  addVectors(ray.origin, scaleVector(ray.direction, t));
    } else { // This means that there is a line intersection but not a ray intersection.
        return null;
    }
}

export function rayIntersectsVertices(ray: Ray, vertices: Vertices): Vec3[] {
    const intersections: Vec3[] = []

    const positions = vertices.positions
    
    // console.log("positions", positions)
    // console.log("length", positions.length)

    for (let i = 0; i < positions.length; i += 9) {
        
        const triangle: Triangle = [
            [positions[i]!,positions[i+1]!,positions[i+2]!], 
            [positions[i+3]!,positions[i+4]!,positions[i+5]!], 
            [positions[i+6]!,positions[i+7]!,positions[i+8]!]
        ]

        const intersection = rayIntersectsTriangle(ray, triangle)
        
        // console.log("i", i)
        // console.log("triangle", triangle)
        // console.log("intersection", intersection)

        if (intersection) {
            // console.log("adding intersection", intersection)
            intersections.push(intersection)
        }
    }

    return intersections
}

export function rayIntersectsMesh(ray: Ray, mesh: Mesh): Vec3[] {
    return rayIntersectsVertices(ray, mesh.vertices) 
}


export function rayIntersectsSceneNode(ray: Ray, node: SceneNode): Vec3[] {
    
    const intersections: Vec3[] =[]
    const nodeStack: SceneNode[] = []
    
    nodeStack.push(node)

    while (nodeStack.length > 0) {
        const nodeUnderTest = nodeStack.pop()!
        if (node.mesh) {
            const rayNodeIntersections = rayIntersectsMesh(ray, node.mesh) // what about transform?
            if (rayNodeIntersections) {
                intersections.push(...rayNodeIntersections)
            }
        }
        
        for (const child of nodeUnderTest.children) {
            nodeStack.push(child)
        }
    }

    return intersections
}

export function rayIntersectsScene(ray: Ray, scene: Scene): Vec3[] {
    
    const intersections: Vec3[] =[]
    
    for (const node of scene) {
        const rayNodeIntersections = rayIntersectsSceneNode(ray, node)
        if (rayNodeIntersections) {
                intersections.push(...rayNodeIntersections)
            }
        
    }

    return intersections
}