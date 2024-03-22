#include "model.h"
#include "mat4.h"

void drawModel(Model model, Camera camera, RenderProgram renderProgram) {

    glUseProgram(renderProgram.shaderProgram);

  
    const Mat4 projection = m4perspective(camera.field_of_view_radians, camera.aspect, camera.near, camera.far);
    const Mat4 view = m4inverse(m4fromPositionAndEuler(camera.position, camera.rotation));
    const Mat4 model_m = m4fromPositionAndEuler(model.position, model.rotation);
    
    glUniformMatrix4fv(renderProgram.modelUniformLocation,1,0, &model_m.data[0][0]);
    glUniformMatrix4fv(renderProgram.viewUniformLocation,1,0, &view.data[0][0]);    
    glUniformMatrix4fv(renderProgram.projectionUniformLocation,1,0, &projection.data[0][0]);

    glBindVertexArray(model.mesh.vao);
    // Draw the vertex buffer
    glDrawArrays(GL_TRIANGLES, 0, model.mesh.vertex_count);

}