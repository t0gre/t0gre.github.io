#include "stdlib.h"
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

void setParent(SceneNode * node, SceneNode * parent) {
   
   // Remove node from its current parent's children array
   if (node->parent && node->parent->id != parent->id) {
    
    for (size_t i = 0; i < parent->children->size; i++) {
        
        SceneNode * existing_child = &parent->children->array[i];

        if (existing_child->id == node->id) {
            * existing_child = (SceneNode){}; // zero out the existing child to indicate it's deleted
            free(existing_child); // otherwise we've got a leak
        }
    }

   
}
    // add to the new new parent
    node->parent = parent;
    if (parent->children == 0) { // in case it's not been initialised
        parent->children = initSceneNodeArray(1);
    }
    addToSceneNodeArray(*node, &parent->children);
}

SceneNode getElement(SceneNodeArray * scene, size_t idx) {
    if (idx < scene->size) {
        return scene->array[idx];
    } else {
        return (SceneNode){};
    }
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

    if (node.children != 0) {
        for (size_t i = 0; i < node.children->size; i++) {
               SceneNode child = getElement(node.children, i);
               drawSceneNode(child, render_program, world_matrix);
        }
     
    }
}