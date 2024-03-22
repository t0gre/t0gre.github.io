#ifndef CAMERA_H
#define CAMERA_H

#include "vec.h"

typedef struct Camera {
  float field_of_view_radians;
  float aspect;
  float near;
  float far;
  Vec3 up;
  Vec3 position;
  Vec3 rotation;
} Camera;



Camera createCamera(
  float field_of_view_radians,
  float aspect,
  float near,
  float far,
  Vec3 up,
  Vec3 position,
  Vec3 rotation);

#endif //CAMERA_H