#include "camera.h";
#include "light.h";
#include "vec.h";
#include <SDL_opengles2.h>
#include <SDL.h>

typedef struct Vertex {
  Vec3 position;
  Vec3 normal;
} Vertex;


typedef struct Mesh {
  Vec3 position;
  Vec3 rotation;
  GLuint shader_program;
  GLuint positions_vbo;
  GLuint normals_vbo;
  Vertex vertices[];

} Mesh;

Mesh createMesh(Vec3 position,
  Vec3 rotation,
  Vertex vertices[],
  GLuint shader_program,
  GLuint vao) {

  

  GLuint positions_vbo;
  glGenBuffers(1, &positions_vbo);
  

  GLuint normals_vbo;
  glGenBuffers(1, &normals_vbo);
  

  return {
    .position = position,
    .rotation = rotation,
    .shader_program = shader_program,
    .positions_vbo = positions_vbo,
    .normals_vbo = normals_vbo,
    .vertices = *vertices,
  };
}

// void drawMesh(Mesh mesh, DirectionalLight light, Camera camera) {
  
//   glUseProgram(mesh.shader_program);
  

//   glBindBuffer(GL_ARRAY_BUFFER, mesh.positions_vbo);
//   glBufferData(GL_ARRAY_BUFFER, sizeof(mesh.vertices), mesh.vertices, GL_STATIC_DRAW);

//   GLint pos_attrib = glGetAttribLocation(mesh.shader_program, "a_position");
//   glEnableVertexAttribArray(pos_attrib);
//   glVertexAttribPointer(pos_attrib, 3, GL_FLOAT, GL_FALSE, 0, 0);

//   glBindBuffer(GL_ARRAY_BUFFER, mesh.normals_vbo);
//   glBufferData(GL_ARRAY_BUFFER, sizeof(mesh.vertices.normals), mesh.vertices.normals, GL_STATIC_DRAW);

//   GLint norm_attrib = glGetAttribLocation(mesh.shader_program, "a_normal");
//   glEnableVertexAttribArray(norm_attrib);
//   glVertexAttribPointer(norm_attrib, 3, GL_FLOAT, GL_FALSE, 0, 0);

// }