#include <math.h>
#include "vec.h"


Vec3 subtractVectors(Vec3 a, Vec3 b) {
    return (Vec3){a.x - b.x, a.y - b.y, a.z - b.z};
}

Vec3 normalize(Vec3 v) {
    float length = sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        return (Vec3){v.x / length, v.y / length, v.z / length};
    } else {
        return (Vec3){0.f, 0.f, 0.f};
    }
}

Vec3 cross(Vec3 a, Vec3 b) {
    
    return (Vec3){
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x
        };
}

