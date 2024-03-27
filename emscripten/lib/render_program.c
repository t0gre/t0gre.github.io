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
    const GLuint shader_program = glCreateProgram();
    glAttachShader(shader_program, vertexShader);
    glAttachShader(shader_program, fragmentShader);
    glLinkProgram(shader_program);
    glUseProgram(shader_program);

    // Get shader uniforms and initialize them
    const GLuint model_uniform_location = glGetUniformLocation(shader_program, "u_model");
    const GLuint view_uniform_location = glGetUniformLocation(shader_program, "u_view");
    const GLuint projection_uniform_location = glGetUniformLocation(shader_program, "u_projection");
    const GLuint color_uniform_location = glGetUniformLocation(shader_program, "u_color");
    const GLuint view_position_uniform_location = glGetUniformLocation(shader_program, "u_view_position");

    // should I ?
    // free(vertexSource);
    // free(fragmentSource);

    return (RenderProgram){
        .shader_program = shader_program,
        .model_uniform_location = model_uniform_location,
        .view_uniform_location = view_uniform_location,
        .projection_uniform_location = projection_uniform_location,
        .color_uniform_location = color_uniform_location,
        .view_position_uniform_location = view_position_uniform_location
    }; 
}