#include "stdlib.h"
#include "scene.h"
#include "mat4.h"
#include "camera.h"

void setParent(SceneNode * node, SceneNode * parent) {
   
   // Remove node from its current parent's children array
   if (node->parent && node->parent->id != parent->id) {
    

    for (size_t i = 0; i < parent->children.size(); i++) {
        
        SceneNode existing_child = parent->children.at(i);
        
        if (existing_child.id == node->id) {
            parent->children.erase(parent->children.begin()+i);
        }
    }

}
    // add to the new new parent
    node->parent = parent;
    node->parent->children.push_back(*node);
}



void drawSceneNode(SceneNode node, RenderProgram render_program, Mat4 parentWorldTransform) {


    // Mat4 world_matrix = scene_node.local_transform;
    Mat4 world_matrix = m4multiply(parentWorldTransform, node.local_transform);

    glUseProgram(render_program.shader_program);
 
    glUniformMatrix4fv(render_program.world_matrix_uniform_location,1,0, &world_matrix.data[0][0]);
    
    glUniform3fv(render_program.material_uniform.color_location,1, node.material.color.data);
    glUniform3fv(render_program.material_uniform.specular_color_location,1, node.material.specular_color.data);
    glUniform1f(render_program.material_uniform.shininess_location, node.material.shininess);


    glBindVertexArray(node.mesh.vao);
    // Draw the vertex buffer
    glDrawArrays(GL_TRIANGLES, 0, node.mesh.vertices.vertex_count);

    
    for (size_t i = 0; i < node.children.size(); i++) {
               SceneNode child = node.children.at(i);
               drawSceneNode(child, render_program, world_matrix);
        
     
    }
}