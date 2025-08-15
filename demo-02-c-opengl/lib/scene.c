#include "scene.h"
#include "mat4.h"
#include "camera.h"

SceneNodeArray * initSceneNodeArray(size_t initial_capacity) {
 
    size_t capacity = sizeof(SceneNode) * initial_capacity;
    size_t total_size = sizeof(SceneNodeArray) + capacity;
    SceneNodeArray * scene_node_array = malloc(total_size);

    scene_node_array->size = 0;
    scene_node_array->capacity = initial_capacity;

    return scene_node_array;
};

void addToSceneNodeArray(SceneNode node, SceneNodeArray ** array_ptr) {
    SceneNodeArray * array = *array_ptr;

    if (array->size >= array->capacity) {
        size_t new_capacity = array->capacity * 2;
        SceneNodeArray * new_array = realloc(
            array,
            sizeof(SceneNodeArray) + new_capacity * sizeof(SceneNode)
        );
        if (!new_array) {
            // Handle allocation failure
            return;
        }
        new_array->capacity = new_capacity;
        *array_ptr = new_array;
        array = new_array;
    }

    array->array[array->size++] = node;
};

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