#ifndef RAYCAST_H
#define RAYCAST_H

#include "vec.h"
#include "mesh.h"
#include "my_string.h"

typedef struct Triangle {
    Vec3 a;
    Vec3 b;
    Vec3 c;
} Triangle;

typedef struct Ray {
    Vec3 origin;
    Vec3 direction; 
} Ray;

typedef struct Intersection {
    int meshId; // 0 if none
    String nodeName; // empty if none
    Vec3 point;
    size_t triangleIdx;
} Intersection;


typedef struct IntersectionArray {
    Intersection *array;
    size_t size;
    size_t capacity;
} IntersectionArray;

IntersectionArray * createIntersectionArray(size_t initial_capacity);

void addIntersection(IntersectionArray *arr, Intersection value);

void freeIntersectionArray(IntersectionArray *arr);

Vec3Result rayIntersectsTriangle(Ray ray, Triangle triangle);

IntersectionArray * rayIntersectsVertices(Ray ray, Vertices vertices);

#endif  