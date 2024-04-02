#include "light.h"
#include "model.h"

typedef struct Scene {
    size_t model_count;
    Model models[2];
    AmbientLight ambient_light;
    DirectionalLight directional_light;
    PointLight point_light;
} Scene;