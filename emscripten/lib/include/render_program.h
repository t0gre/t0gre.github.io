#ifndef RENDER_PROGRAM_H
#define RENDER_PROGRAM_H

#include <GLES3/gl3.h>

typedef struct RenderProgram  {
    GLuint shaderProgram;
    GLuint modelUniformLocation;
    GLuint viewUniformLocation;
    GLuint projectionUniformLocation;
    GLuint pointerUniformLocation;
    GLuint canvasUniformLocation;
    GLuint colorUniformLocation;
} RenderProgram;

RenderProgram initShader(void);

#endif //RENDER_PROGRAM_H