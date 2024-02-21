#include "vec.h";

typedef struct PointLight {
  Vec3 color;
  Vec3 specular_color;
  Vec3 position;
  Vec3 rotation;
} PointLight;

PointLight createPointLight(Vec3 postition, Vec3 rotation, Vec3 color, Vec3 specular_color) {
    return {
        .color = color,
        .specular_color = specular_color,
        .position = postition,
        .rotation = rotation, 
    };
}

typedef struct DirectionalLight {
  Vec3 color;
  Vec3 rotation;
} DirectionalLight;

DirectionalLight createDirectionalLight(Vec3 rotation, Vec3 color) {
    return {
        .color = color,
        .rotation = rotation,
    };
}