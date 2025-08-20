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
    Mesh mesh; // 0 if none
    size_t first_child; // 0 if none
    size_t next_sibling; // 0 if none
    size_t depth;
} SceneNode;  

// dynamic scene_node_array
typedef struct SceneNodeArray {
    size_t size;
    size_t capacity;
    SceneNode array[];
} SceneNodeArray;

SceneNodeArray * initSceneNodeArray(size_t initial_capacity);

void addToSceneNodeArray(SceneNode node, SceneNodeArray ** array_ptr);

SceneNode getElement(SceneNodeArray * scene, size_t idx);

typedef struct Scene {
    SceneNodeArray* nodes;
    AmbientLight ambient_light;
    DirectionalLight directional_light;
    PointLight point_light;
} Scene;

void drawSceneNode(SceneNode scene_node, RenderProgram render_program, Mat4 parentWorldTransform, SceneNodeArray * scene);

#endif