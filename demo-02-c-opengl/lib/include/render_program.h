#ifndef RENDER_PROGRAM_H
#define RENDER_PROGRAM_H

#include <GLES3/gl3.h>
#include <vector>
#include "scene.h"
#include "mesh.h"

typedef struct MaterialUniform {
      GLuint color_location;
      GLuint specular_color_location;
      GLuint shininess_location;
} MaterialUniform;

typedef struct AmbientLightUniform {
      GLuint color_location;
} AmbientLightUniform;

typedef struct DirectionalLightUniform {
      GLuint color_location;
      GLuint rotation_location;
} DirectionalLightUniform;

typedef struct PointLightUniform {
      GLuint color_location;
      GLuint position_location;
      GLuint constant_location;
      GLuint linear_location;
      GLuint quadratic_location;
} PointLightUniform;

typedef struct RenderProgram  {
    GLuint shader_program;
    GLuint world_matrix_uniform_location;
    GLuint view_uniform_location;
    GLuint projection_uniform_location;
    GLuint view_position_uniform_location;
    MaterialUniform material_uniform;
    AmbientLightUniform ambient_light_uniform;
    DirectionalLightUniform directional_light_uniform;
    PointLightUniform point_light_uniform;
} RenderProgram;

RenderProgram initShader(void);

typedef struct GlState {
    std::vector<GLuint> vaos;
} GlState;


Mesh initMesh(Vertices vertices, RenderProgram* render_program);

void drawSceneNode(SceneNode scene_node, RenderProgram render_program);


#endif //RENDER_PROGRAM_H