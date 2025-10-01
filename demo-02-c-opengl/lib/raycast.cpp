#include "raycast.h"
#include "float.h"
#include "mesh.h"
#include "vec.h"

IntersectionArray *createIntersectionArray(size_t initial_capacity) {
    IntersectionArray *arr = (IntersectionArray *)malloc(sizeof(IntersectionArray));
    arr->size = 0;
    arr->capacity = initial_capacity;
    arr->array = (Intersection*)malloc(initial_capacity * sizeof(Intersection));
    return arr;
}

void addIntersection(IntersectionArray *arr, Intersection value) {
    if (arr->size >= arr->capacity) {
        arr->capacity *= 2;
        arr->array = (Intersection*)realloc(arr->array, arr->capacity * sizeof(Intersection));
    }
    arr->array[arr->size++] = value;
}

void freeIntersectionArray(IntersectionArray *arr) {
    free(arr->array);
    free(arr);
}

Vec3Result rayIntersectsTriangle(Ray ray, Triangle triangle) {


    const Vec3 edge1 = subtractVectors(triangle.b, triangle.a);
    const Vec3 edge2 = subtractVectors(triangle.c, triangle.a);
    const Vec3 rayCrossEdge2 = cross(ray.direction, edge2);
    const float det = dot(edge1, rayCrossEdge2);

    if (det > -FLT_EPSILON && det < FLT_EPSILON) {
        return (Vec3Result){.valid = false}; // the ray is parallel to this triangle;
    }
    
    const float invDet = 1 / det;
    const Vec3 s = subtractVectors(ray.origin, triangle.a);
    const float u = invDet * dot(s, rayCrossEdge2);

    if ((u < 0 && fabs(u) > FLT_EPSILON) || (u > 1 && fabs(u-1) > FLT_EPSILON)) {
         return (Vec3Result){.valid = false};
    }
       

    const Vec3 sCrossEdge1 = cross(s, edge1);
    const float v = invDet * dot(ray.direction, sCrossEdge1);

    if ((v < 0 && fabs(v) > FLT_EPSILON) || (u + v > 1 && fabs(u + v - 1) > FLT_EPSILON)){
         return (Vec3Result){.valid = false};
    }
    // At this stage we can compute t to find out where the intersection point is on the line.
    const float t = invDet * dot(edge2, sCrossEdge1); 

     if (t > FLT_EPSILON) { // ray intersection
        return (Vec3Result){ .valid = true,
                             .value = addVectors(ray.origin, scaleVector(ray.direction, t))
                           };
    } else { // This means that there is a line intersection but not a ray intersection.
          return (Vec3Result){.valid = false};
    }
}


IntersectionArray * rayIntersectsVertices(Ray ray, Vertices vertices) {
    IntersectionArray * intersections = createIntersectionArray(10);

    float * positions = vertices.positions;

    for (size_t i = 0; i < vertices.vertex_count * 3; i += 9) {
        
        Triangle triangle = {

            {positions[i],positions[i+1],positions[i+2]}, 
            {positions[i+3],positions[i+4],positions[i+5]}, 
            {positions[i+6],positions[i+7],positions[i+8]}
        };

        Vec3Result intersectionPoint = rayIntersectsTriangle(ray, triangle);

        if (intersectionPoint.valid) {
            
           Intersection intersection = { 
            .point = intersectionPoint.value,
            .triangleIdx = i / 9
            };
           
           addIntersection(intersections, intersection);

        }
    }

    return intersections;
}