#include "light.h"
#include "vec.h"

PointLight createPointLight(Vec3 postition, Vec3 rotation, Vec3 color, Vec3 specular_color) {
    return (PointLight){
        .color = color,
        .specular_color = specular_color,
        .position = postition,
        .rotation = rotation, 
    };
}


DirectionalLight createDirectionalLight(Vec3 rotation, Vec3 color) {
    return (DirectionalLight){
        .color = color,
        .rotation = rotation,
    };
}