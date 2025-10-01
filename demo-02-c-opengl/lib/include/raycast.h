#ifndef RAYCAST_H
#define RAYCAST_H

#include <vector>
#include <string>

#include "vec.h"
#include "mesh.h"


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
    std::string nodeName; // empty if none
    Vec3 point;
    size_t triangleIdx;
} Intersection;

Vec3Result rayIntersectsTriangle(Ray ray, Triangle triangle);

std::vector<Intersection> rayIntersectsVertices(Ray ray, Vertices vertices);

#endif  