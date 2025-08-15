#ifndef SCENE_H
#define SCENE_H

#include "light.h"
#include "vec.h"
#include "data_structures.h"
#include "camera.h"
#include "render_program.h"
#include "mesh.h"
#include "material.h"

typedef struct SceneNode {
    Mat4 local_transform; 
    Material material;
    Mesh mesh;
} SceneNode;  


typedef struct Scene {
    size_t model_count;
    SceneNode nodes[2];
    AmbientLight ambient_light;
    DirectionalLight directional_light;
    PointLight point_light;
} Scene;

void drawSceneNode(SceneNode scene_node, RenderProgram render_program);

#endif