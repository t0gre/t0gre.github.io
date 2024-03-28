#ifndef RENDER_PROGRAM_H
#define RENDER_PROGRAM_H

#include <GLES3/gl3.h>

typedef struct AmbientLightUniform {
      GLuint color_location;
} AmbientLightUniform;

typedef struct DirectionalLightUniform {
      GLuint color_location;
      GLuint rotation_location;
      GLuint specular_color_location;
} DirectionalLightUniform;

typedef struct PointLightUniform {
      GLuint color_location;
      GLuint position_location;
      GLuint specular_color_location;
      GLuint constant_location;
      GLuint linear_location;
      GLuint quadratic_location;
} PointLightUniform;

typedef struct RenderProgram  {
    GLuint shader_program;
    GLuint model_uniform_location;
    GLuint view_uniform_location;
    GLuint projection_uniform_location;
    GLuint color_uniform_location;
    GLuint shininess_uniform_location;
    GLuint view_position_uniform_location;
    AmbientLightUniform ambient_light_uniform;
    DirectionalLightUniform directional_light_uniform;
    PointLightUniform point_light_uniform;
} RenderProgram;

RenderProgram initShader(void);

#endif //RENDER_PROGRAM_H