#ifndef MODEL_H
#define MODEL_H

#include "vec.h"
#include "data_structures.h"
#include "camera.h"
#include "render_program.h"
#include "mesh.h"
#include "material.h"

typedef struct Model {
    // Vec3 position;
    // Vec3 rotation;
    Mat4 localTransform; 
    Material material;
    Mesh mesh;
} Model;  

void drawModel(Model model, RenderProgram renderProgram);

#endif // MODEL_H