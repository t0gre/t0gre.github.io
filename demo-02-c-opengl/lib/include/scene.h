#ifndef SCENE_H
#define SCENE_H

#include <vector>

#include "light.h"
#include "vec.h"
#include "data_structures.h"
#include "camera.h"
#include "render_program.h"
#include "mesh.h"
#include "material.h"

typedef struct SceneNode {
    size_t id;
    Mat4 local_transform; 
    Material material;
    Mesh mesh; // 0 if none
    struct SceneNode * parent; // 0 if none
    std::vector<SceneNode> children; // empty if no children
} SceneNode;  


void setParent(SceneNode * node, SceneNode * parent);

typedef struct Scene {
    std::vector<SceneNode> nodes;
    AmbientLight ambient_light;
    DirectionalLight directional_light;
    PointLight point_light;
} Scene;

void drawSceneNode(SceneNode scene_node, RenderProgram render_program, Mat4 parentWorldTransform);

#endif