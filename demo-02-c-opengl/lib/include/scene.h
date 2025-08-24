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
    size_t id;
    Mat4 local_transform; 
    Material material;
    Mesh mesh; // 0 if none
    struct SceneNode * parent; // 0 if none
    struct SceneNodeArray * children; // empty if no children
} SceneNode;  

// dynamic scene_node_array
typedef struct SceneNodeArray {
    size_t size;
    size_t capacity;
    SceneNode array[]; // all 0'd strcuts in the array are removed nodes, TODO remove the nodes
} SceneNodeArray;


void setParent(SceneNode * node, SceneNode * parent);

SceneNodeArray * initSceneNodeArray(size_t initial_capacity);

void addToSceneNodeArray(SceneNode node, SceneNodeArray ** array_ptr);

SceneNode getElement(SceneNodeArray * scene, size_t idx);

typedef struct Scene {
    SceneNodeArray* nodes;
    AmbientLight ambient_light;
    DirectionalLight directional_light;
    PointLight point_light;
} Scene;

void drawSceneNode(SceneNode scene_node, RenderProgram render_program, Mat4 parentWorldTransform);

#endif