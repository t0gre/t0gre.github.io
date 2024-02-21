#include <math.h>
#include "vec.h"


Vec3 subtractVectors(Vec3 a, Vec3 b) {
    Vec3 new_vector = {a.x - b.x, a.y - b.y, a.z - b.z};
    return new_vector;
}

Vec3 normalize(Vec3 v) {
    float length = sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        Vec3 new_vector = {v.x / length, v.y / length, v.z / length};
        return new_vector;
    } else {
        Vec3 new_vector =  {0.f, 0.f, 0.f};
        return new_vector;
    }
}

Vec3 cross(Vec3 a, Vec3 b) {
    Vec3 new_vector = {
        a.y * b.z - a.z * b.y,
        a.z * b.x - a.x * b.z,
        a.x * b.y - a.y * b.x
        };
    return new_vector;
}

