#ifndef MODEL_H
#define MODEL_H

#include "vec.h"
#include "data_structures.h"
#include "camera.h"
#include "render_program.h"
#include "mesh.h"

typedef struct Model {
    Vec3 position;
    Vec3 rotation;
    Vec4 color;
    float shininess;
    Mesh mesh;
} Model;  

void drawModel(Model model, Camera camera, RenderProgram renderProgram);

#endif // MODEL_H