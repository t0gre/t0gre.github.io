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
    const GLuint model_uniform_location = guaranteeUniformLocation(shader_program, "u_model");
    
    const GLuint view_uniform_location = guaranteeUniformLocation(shader_program, "u_view");
    const GLuint projection_uniform_location = guaranteeUniformLocation(shader_program, "u_projection");
    const GLuint view_position_uniform_location = guaranteeUniformLocation(shader_program, "u_view_position");

    // material properties
    const GLuint material_color_uniform_location = guaranteeUniformLocation(shader_program, "u_material.color");
    const GLuint material_specular_color_uniform_location = guaranteeUniformLocation(shader_program, "u_material.specular_color");
    const GLuint material_shininess_uniform_location = guaranteeUniformLocation(shader_program, "u_material.shininess");
    
    
    // lights
    // ambient light
    const GLuint ambient_light_color_uniform_location = guaranteeUniformLocation(shader_program, "u_ambient_light.color");

    // directional light
    const GLuint directional_light_color_uniform_location = guaranteeUniformLocation(shader_program, "u_directional_light.color");
    const GLuint directional_light_rotation_uniform_location = guaranteeUniformLocation(shader_program, "u_directional_light.rotation");
    
    // spot light
    const GLuint point_light_color_uniform_location = guaranteeUniformLocation(shader_program, "u_point_light.color");
    const GLuint point_light_position_uniform_location = guaranteeUniformLocation(shader_program, "u_point_light.position");
    const GLuint point_light_constant_uniform_location = guaranteeUniformLocation(shader_program, "u_point_light.constant");
    const GLuint point_light_linear_uniform_location = guaranteeUniformLocation(shader_program, "u_point_light.linear");
    const GLuint point_light_quadratic_uniform_location = guaranteeUniformLocation(shader_program, "u_point_light.quadratic");
    
    // should I ?
    // free(vertexSource);
    // free(fragmentSource);

    return (RenderProgram){
        .shader_program = shader_program,
        .model_uniform_location = model_uniform_location,
        .view_uniform_location = view_uniform_location,
        .projection_uniform_location = projection_uniform_location,
        .view_position_uniform_location = view_position_uniform_location,
        .material_uniform = {
            .color_location = material_color_uniform_location,
            .specular_color_location = material_specular_color_uniform_location,
            .shininess_location = material_shininess_uniform_location,
        },
        .ambient_light_uniform = {
            .color_location = ambient_light_color_uniform_location 
        },
        .directional_light_uniform = {
            .color_location = directional_light_color_uniform_location,
            .rotation_location = directional_light_rotation_uniform_location,
        },
        .point_light_uniform = {
            .color_location = point_light_color_uniform_location,
            .position_location = point_light_position_uniform_location,
            .constant_location = point_light_constant_uniform_location,
            .linear_location = point_light_linear_uniform_location,
            .quadratic_location = point_light_linear_uniform_location
        }
    }; 
}