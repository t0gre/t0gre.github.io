#include "light.h"
#include "scene_node.h"

typedef struct Scene {
    size_t model_count;
    SceneNode nodes[2];
    AmbientLight ambient_light;
    DirectionalLight directional_light;
    PointLight point_light;
} Scene;