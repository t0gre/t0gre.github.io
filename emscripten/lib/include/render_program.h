#ifndef RENDER_PROGRAM_H
#define RENDER_PROGRAM_H

#include <GLES3/gl3.h>

typedef struct RenderProgram  {
    GLuint shader_program;
    GLuint model_uniform_location;
    GLuint view_uniform_location;
    GLuint projection_uniform_location;
    GLuint pointer_uniform_location;
    GLuint canvas_uniform_location;
    GLuint color_uniform_location;
    GLuint view_position_uniform_location;
} RenderProgram;

RenderProgram initShader(void);

#endif //RENDER_PROGRAM_H