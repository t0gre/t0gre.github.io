#ifndef SCENE_NODE_H
#define SCENE_NODE_H

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

void drawSceneNode(SceneNode scene_node, RenderProgram render_program);

#endif 