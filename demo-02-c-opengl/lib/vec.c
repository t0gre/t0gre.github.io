#include <math.h>
#include "vec.h"


Vec3 subtractVectors(Vec3 a, Vec3 b) {
    return (Vec3){
        .x = a.x - b.x, 
        .y = a.y - b.y, 
        .z = a.z - b.z};
}

Vec3 normalize(Vec3 v) {
    float length = sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        return (Vec3){
            .x = v.x / length, 
            .y = v.y / length, 
            .z = v.z / length};
    } else {
        return (Vec3){ .x = 0.f, .y = 0.f, .z = 0.f};
    }
}

Vec3 cross(Vec3 a, Vec3 b) {
    
    return (Vec3){
        .x = a.y * b.z - a.z * b.y,
        .y = a.z * b.x - a.x * b.z,
        .z = a.x * b.y - a.y * b.x
        };
}

