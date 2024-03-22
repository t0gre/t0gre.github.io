#ifndef LIGHT_H
#define LIGHT_H

#include "vec.h"

typedef struct PointLight {
  Vec3 color;
  Vec3 specular_color;
  Vec3 position;
  Vec3 rotation;
} PointLight;

PointLight createPointLight(Vec3 postition, Vec3 rotation, Vec3 color, Vec3 specular_color);

typedef struct DirectionalLight {
  Vec3 color;
  Vec3 rotation;
} DirectionalLight;

DirectionalLight createDirectionalLight(Vec3 rotation, Vec3 color);

#endif //LIGHT_H