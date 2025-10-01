#include "mesh.h"

Mesh createMesh(Vertices vertices, RenderProgram* render_program) {

    // setup vao
    GLuint vao;
    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);


    // Create vertex buffer object and copy vertex data into it
    GLuint vbo;
    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(float)*vertices.vertex_count*3, 
                 vertices.positions, GL_STATIC_DRAW);

    // Specify the layout of the shader vertex data (positions only, 3 floats)
    GLint posAttrib = glGetAttribLocation(render_program->shader_program, "a_position");
    assert(posAttrib != -1); // fail on error

    glEnableVertexAttribArray(posAttrib);
    glVertexAttribPointer(posAttrib, 3, GL_FLOAT, GL_FALSE, 0, 0);

    GLuint vbo_norm;
    glGenBuffers(1, &vbo_norm);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_norm);
    glBufferData(GL_ARRAY_BUFFER, sizeof(float)*vertices.vertex_count*3, 
                 vertices.normals, GL_STATIC_DRAW);

    // Specify the layout of the shader vertex data (normals only, 3 floats)
    GLint normAttrib = glGetAttribLocation(render_program->shader_program, "a_normal");
    assert(posAttrib != -1); // fail on error

    glEnableVertexAttribArray(normAttrib);
    glVertexAttribPointer(normAttrib, 3, GL_FLOAT, GL_TRUE, 0, 0);

    glBindVertexArray(vao);

    
  

  return (Mesh){
    .vertices = vertices,
    .render_program = render_program,
    .vao = vao
  };
}


