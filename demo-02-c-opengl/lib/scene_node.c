#include "scene_node.h"
#include "mat4.h"
#include "camera.h"

void drawSceneNode(SceneNode scene_node, RenderProgram render_program) {

    glUseProgram(render_program.shader_program);
   
    glUniformMatrix4fv(render_program.model_uniform_location,1,0, &scene_node.local_transform.data[0][0]);
    
    glUniform3fv(render_program.material_uniform.color_location,1, scene_node.material.color.data);
    glUniform3fv(render_program.material_uniform.specular_color_location,1, scene_node.material.specular_color.data);
    glUniform1f(render_program.material_uniform.shininess_location, scene_node.material.shininess);


    glBindVertexArray(scene_node.mesh.vao);
    // Draw the vertex buffer
    glDrawArrays(GL_TRIANGLES, 0, scene_node.mesh.vertex_count);

}