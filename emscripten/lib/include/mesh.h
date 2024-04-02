#ifndef MESH_H
#define MESH_H

#include "std_imports.h"

#include "camera.h"
#include "light.h"
#include "vec.h"
#include "render_program.h"
#include "data_structures.h"

typedef struct Mesh {
  size_t vertex_count;
  RenderProgram* render_program;
  GLuint vao;
} Mesh;


Mesh createMesh(FloatData positions, FloatData normals, RenderProgram* render_program);


#endif //MESH_H