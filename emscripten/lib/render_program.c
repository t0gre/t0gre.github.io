#include "render_program.h"
#include "loaders.h"
#include <stddef.h>


RenderProgram initShader(void)
{

    const GLchar* vertexSource = get_shader_content("basic.vert");

    const GLchar* fragmentSource = get_shader_content("basic.frag");

    // Create and compile vertex shader
    const GLuint vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexSource, NULL);
    glCompileShader(vertexShader);

    // Create and compile fragment shader
    const GLuint fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentSource, NULL);
    glCompileShader(fragmentShader);

    // Link vertex and fragment shader into shader program and use it
    const GLuint shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);
    glUseProgram(shaderProgram);

    // Get shader uniforms and initialize them
    const GLuint modelUniformLocation = glGetUniformLocation(shaderProgram, "u_model");
    const GLuint viewUniformLocation = glGetUniformLocation(shaderProgram, "u_view");
    const GLuint projectionUniformLocation = glGetUniformLocation(shaderProgram, "u_projection");
    const GLuint pointerUniformLocation = glGetUniformLocation(shaderProgram, "u_pointer");
    const GLuint canvasUniformLocation = glGetUniformLocation(shaderProgram, "u_canvas");
    const GLuint colorUniformLocation = glGetUniformLocation(shaderProgram, "u_color");

    // should I ?
    // free(vertexSource);
    // free(fragmentSource);

    return (RenderProgram){
        .shaderProgram = shaderProgram,
        .modelUniformLocation = modelUniformLocation,
        .viewUniformLocation = viewUniformLocation,
        .projectionUniformLocation = projectionUniformLocation,
        .pointerUniformLocation = pointerUniformLocation,
        .canvasUniformLocation = canvasUniformLocation,
        .colorUniformLocation = colorUniformLocation
    }; 
}


