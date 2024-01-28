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
  Vec3 rotation) {
    
    return { 
        .field_of_view_radians = field_of_view_radians,
        .aspect = aspect,
        .near = near,
        .far = far,
        .up = up, 
        .position = position,
        .rotation = rotation,
        };
}