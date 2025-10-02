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
        .world_matrix_uniform_location = guaranteeUniformLocation(shader_program, "u_model"),
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

#include "mesh.h"


Mesh initMesh(Mesh mesh, RenderProgram* render_program) {

    if (mesh.id.has_value()) {
        printf("mesh is already init, you shouldn't be trying to reinit it\n");
        return mesh;
    }

    // setup vao
    GLuint vao;
    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);


    // Create vertex buffer object and copy vertex data into it
    GLuint vbo;
    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(float)*mesh.vertices.vertex_count*3, 
                 mesh.vertices.positions, GL_STATIC_DRAW);

    // Specify the layout of the shader vertex data (positions only, 3 floats)
    GLint posAttrib = glGetAttribLocation(render_program->shader_program, "a_position");
    assert(posAttrib != -1); // fail on error

    glEnableVertexAttribArray(posAttrib);
    glVertexAttribPointer(posAttrib, 3, GL_FLOAT, GL_FALSE, 0, 0);

    GLuint vbo_norm;
    glGenBuffers(1, &vbo_norm);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_norm);
    glBufferData(GL_ARRAY_BUFFER, sizeof(float)*mesh.vertices.vertex_count*3, 
                 mesh.vertices.normals, GL_STATIC_DRAW);

    // Specify the layout of the shader vertex data (normals only, 3 floats)
    GLint normAttrib = glGetAttribLocation(render_program->shader_program, "a_normal");
    assert(posAttrib != -1); // fail on error

    glEnableVertexAttribArray(normAttrib);
    glVertexAttribPointer(normAttrib, 3, GL_FLOAT, GL_TRUE, 0, 0);

    glBindVertexArray(vao);

    mesh.id = vao;

    return mesh;
}

void drawSceneNode(SceneNode node, RenderProgram render_program) {

    if (node.mesh.has_value()) {
        
        // check if the mesh has been initialized and init if not
        if (node.mesh.value().id.has_value()) {
            // draw this mesh
            glUseProgram(render_program.shader_program);
        
            glUniformMatrix4fv(render_program.world_matrix_uniform_location,1,0, &node.world_transform.data[0][0]);
            
            glUniform3fv(render_program.material_uniform.color_location,1, 
                node.mesh.value().material.color.data);
            glUniform3fv(render_program.material_uniform.specular_color_location,1, 
                node.mesh.value().material.specular_color.data);
            glUniform1f(render_program.material_uniform.shininess_location, 
                node.mesh.value().material.shininess);


            glBindVertexArray(node.mesh.value().id.value());
            // Draw the vertex buffer
            glDrawArrays(GL_TRIANGLES, 0, node.mesh.value().vertices.vertex_count);
        } else {
            auto initedMesh = initMesh(node.mesh.value(), &render_program);
            // draw initedMesh
            glUseProgram(render_program.shader_program);
        
            glUniformMatrix4fv(render_program.world_matrix_uniform_location,1,0, &node.world_transform.data[0][0]);
            
            glUniform3fv(render_program.material_uniform.color_location,1, 
                initedMesh.material.color.data);
            glUniform3fv(render_program.material_uniform.specular_color_location,1, 
                initedMesh.material.specular_color.data);
            glUniform1f(render_program.material_uniform.shininess_location, 
                initedMesh.material.shininess);


            glBindVertexArray(initedMesh.id.value());
            // Draw the vertex buffer
            glDrawArrays(GL_TRIANGLES, 0, node.mesh.value().vertices.vertex_count);
        }

        
        }
    
    for (size_t i = 0; i < node.children.size(); i++) {
               SceneNode child = node.children.at(i);
               drawSceneNode(child, render_program);
        
     
    }
}