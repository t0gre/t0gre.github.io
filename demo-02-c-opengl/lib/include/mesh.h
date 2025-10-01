#ifndef MESH_H
#define MESH_H

#include <assert.h>
#include "camera.h"
#include "light.h"
#include "vec.h"
#include "render_program.h"
#include "data_structures.h"

typedef struct Vertices {
  size_t vertex_count;
  float * positions;
  float * normals;
  // add textcoords and indices
} Vertices;


typedef struct Mesh {
  Vertices vertices;
  RenderProgram* render_program;
  GLuint vao;
} Mesh;



Mesh createMesh(Vertices vertices, RenderProgram* render_program);


#endif //MESH_H