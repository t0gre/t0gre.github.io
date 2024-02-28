#ifndef VEC_H
#define VEC_H
#include <math.h>

typedef struct Vec2 {
  float x;
  float y;
} Vec2;

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



Vec3 subtractVectors(Vec3 a, Vec3 b);

Vec3 normalize(Vec3 v);

Vec3 cross(Vec3 a, Vec3 b);

#endif /* VEC_H */