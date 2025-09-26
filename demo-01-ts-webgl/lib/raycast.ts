import { m4inverse, m4PositionMultiply, m4DirectionMultiply } from "./mat4";
import { Vertices } from "./mesh";
import { Mesh } from "./mesh";
import { SceneNode, Scene } from "./scene";
import { addVectors, cross, dot, scaleVector, subtractVectors, Vec3 } from "./vec";

export type Triangle = [Vec3, Vec3, Vec3]

export type Ray = {
    origin: Vec3
    direction: Vec3 
}

export type Intersection = {
    meshId?: number;
    point: Vec3
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

export function rayIntersectsMesh(ray: Ray, mesh: Mesh): Intersection[] {

    return rayIntersectsVertices(ray, mesh.vertices).map(point => {
        return {
            point,
            meshId: mesh._id 
        }
    })
}

// ray is assumed to be in world space
export function rayIntersectsSceneNode(ray: Ray, node: SceneNode): Intersection[] {
    
    const intersections: Intersection[] =[]
    const nodeStack: SceneNode[] = []
    
    nodeStack.push(node)

    while (nodeStack.length > 0) {

        const nodeUnderTest = nodeStack.pop()!
        // console.log(nodeUnderTest)
        if (nodeUnderTest.mesh) {
            // transform the ray into mesh space
            const inverseTransform = m4inverse(node._worldTransform)
            const meshSpaceOrigin = m4PositionMultiply(
                ray.origin, 
                inverseTransform)

            const meshSpaceDirection = m4DirectionMultiply(
                ray.direction, 
                inverseTransform)

            
            const newRay: Ray = {
                origin: meshSpaceOrigin ,
                direction: meshSpaceDirection
            } 

            // console.log('newray', newRay)
            
            const rayNodeIntersections = rayIntersectsMesh(
                newRay, 
                nodeUnderTest.mesh)

            if (rayNodeIntersections) {
                for (const intersection of rayNodeIntersections) {
                    // transform the interection back into world space
                    const worldSpaceIntersection = m4PositionMultiply(
                        intersection.point, 
                        node._worldTransform)

                    // console.log('ms', intersection)
                    // console.log('ws', worldSpaceIntersection)
                    intersections.push({ 
                        point: worldSpaceIntersection, 
                        meshId: intersection.meshId
                    })
                }
                
            }
        }
        
        for (const child of nodeUnderTest.children) {
            nodeStack.push(child)
        }
    }

    return intersections
}

export function rayIntersectsScene(ray: Ray, scene: Scene): Intersection[] {
    
    const intersections: Intersection[] =[]
    
    for (const node of scene) {
        const rayNodeIntersections = rayIntersectsSceneNode(ray, node)
        if (rayNodeIntersections) {
                intersections.push(...rayNodeIntersections)
            }
    }

    return intersections
}