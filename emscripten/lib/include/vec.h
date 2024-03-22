#ifndef VEC_H
#define VEC_H
#include <math.h>

typedef union Vec2 { 
  struct {
    float x;
    float y;
  };

  float data [2];
} Vec2;

typedef union Vec3 {
  struct { 
    float x;
    float y;
    float z;
  };

  float data[3];

} Vec3;

typedef union Vec4 {
  struct {
    float x;
    float y;
    float z;
    float w;
  };

  float data[4];

} Vec4;



Vec3 subtractVectors(Vec3 a, Vec3 b);

Vec3 normalize(Vec3 v);

Vec3 cross(Vec3 a, Vec3 b);

#endif //VEC_H 