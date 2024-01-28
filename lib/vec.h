#include <math.h>

typedef struct Vec3 {
  float x;
  float y;
  float z;

} Vec3;

typedef struct Vec4 {
  float x;
  float y;
  float z;
  float w;

} Vec4;



Vec3 subtractVectors(Vec3 a, Vec3 b) {
    return {a.x - b.x, a.y - b.y, a.z - b.z};
}

Vec3 normalize(Vec3 v) {
    float length = sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    // make sure we don't divide by 0.
    if (length > 0.00001) {
        return {v.x / length, v.y / length, v.z / length};
    } else {
        return {0.f, 0.f, 0.f};
    }
}

Vec3 cross(Vec3 a, Vec3 b) {
    return {a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x};
}

