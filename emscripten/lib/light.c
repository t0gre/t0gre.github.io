#include "light.h";
#include "vec.h";

PointLight createPointLight(Vec3 postition, Vec3 rotation, Vec3 color, Vec3 specular_color) {
    PointLight light = {
        .color = color,
        .specular_color = specular_color,
        .position = postition,
        .rotation = rotation, 
    };
    return light;
}


DirectionalLight createDirectionalLight(Vec3 rotation, Vec3 color) {
    DirectionalLight light =  {
        .color = color,
        .rotation = rotation,
    };
    return light;
}