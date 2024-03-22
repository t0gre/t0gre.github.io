#ifndef MESH_H
#define MESH_H

#include "std_imports.h"

#include "camera.h"
#include "light.h"
#include "vec.h"
#include "model.h"

typedef struct Mesh {
  Model* model;
  RenderProgram* render_program;
  GLuint vao;
} Mesh;


Mesh createMesh(Model* model, RenderProgram* render_program);

void drawMesh(Mesh mesh, Camera camera);

#endif //MESH_H