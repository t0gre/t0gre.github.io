#include "render_program.h"
#include "loaders.h"
#include <stddef.h>
#include <assert.h>
#include <stdio.h>

GLuint guaranteeUniformLocation(GLuint program, const GLchar *name) {
    const GLuint location = glGetUniformLocation(program, name);
    assert(location != -1);
    return location;
}

RenderProgram initShader(void)
{

    #ifdef __EMSCRIPTEN__
    const GLchar* vertexSource = get_shader_content("basic.vert");
    const GLchar* fragmentSource = get_shader_content("basic.frag");
    #else 
    const GLchar* vertexSource = get_shader_content("./lib/shaders/basic.vert");
    const GLchar* fragmentSource = get_shader_content("./lib/shaders/basic.frag");
    #endif

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
    
    // should I ?
    // free(vertexSource);
    // free(fragmentSource);

    return (RenderProgram){
        .shader_program = shader_program,
        .model_uniform_location = guaranteeUniformLocation(shader_program, "u_model"),
        .view_uniform_location = guaranteeUniformLocation(shader_program, "u_view"),
        .projection_uniform_location = guaranteeUniformLocation(shader_program, "u_projection"),
        .view_position_uniform_location = guaranteeUniformLocation(shader_program, "u_view_position"),
        .material_uniform = {
            .color_location = guaranteeUniformLocation(shader_program, "u_material.color"),
            .specular_color_location = guaranteeUniformLocation(shader_program, "u_material.specular_color"),
            .shininess_location = guaranteeUniformLocation(shader_program, "u_material.shininess"),
        },
        .ambient_light_uniform = {
            .color_location = guaranteeUniformLocation(shader_program, "u_ambient_light.color")
        },
        .directional_light_uniform = {
            .color_location = guaranteeUniformLocation(shader_program, "u_directional_light.color"),
            .rotation_location = guaranteeUniformLocation(shader_program, "u_directional_light.rotation"),
        },
        .point_light_uniform = {
            .color_location = guaranteeUniformLocation(shader_program, "u_point_light.color"),
            .position_location = guaranteeUniformLocation(shader_program, "u_point_light.position"),
            .constant_location = guaranteeUniformLocation(shader_program, "u_point_light.constant"),
            .linear_location = guaranteeUniformLocation(shader_program, "u_point_light.linear"),
            .quadratic_location = guaranteeUniformLocation(shader_program, "u_point_light.quadratic")
        }
    }; 
}