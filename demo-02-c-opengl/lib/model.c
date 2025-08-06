#include "model.h"
#include "mat4.h"
#include "camera.h"

void drawModel(Model model, RenderProgram render_program) {

    glUseProgram(render_program.shader_program);
   
    glUniformMatrix4fv(render_program.model_uniform_location,1,0, &model.localTransform.data[0][0]);
    
    glUniform3fv(render_program.material_uniform.color_location,1, model.material.color.data);
    glUniform3fv(render_program.material_uniform.specular_color_location,1, model.material.specular_color.data);
    glUniform1f(render_program.material_uniform.shininess_location, model.material.shininess);


    glBindVertexArray(model.mesh.vao);
    // Draw the vertex buffer
    glDrawArrays(GL_TRIANGLES, 0, model.mesh.vertex_count);

}