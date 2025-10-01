#include <vector>

#include "mesh.h"
#include "scene.h"
#include "test_helpers.cpp"
#include "raycast.h"



float pos_dat[18] = {
    -10.f, 0.f, -10.f, // back left
    -10.f, 0.f, 10.f, // front left
     10.f, 0.f, -10.f, // back right
    -10.f, 0.f, 10.f, // front left
     10.f, 0.f, 10.f, // front right
     10.f, 0.f, -10.f, // back right
     };
     
float norm_dat[18] = {
        0.f,1.f, 0.f,
        0.f,1.f, 0.f,
        0.f,1.f, 0.f,
        0.f,1.f, 0.f,
        0.f,1.f, 0.f,
        0.f,1.f, 0.f,
};

const Vertices vertices = {
  .positions = pos_dat,
  .normals = norm_dat,
  .vertex_count = 6
}; 
   
const Material irrelevant = {
            .color = { .r = 0.1, .g = 0.7, .b = 0.1},
            .specular_color = { .r = 0.2, .g = 0.2, .b = 0.2},
            .shininess = 0.5f
        };

TestResult intersect_node_with_position_transform() {
   
    RenderProgram render_program = initShader();
    Mesh tree_mesh = createMesh(vertices, &render_program); 

    SceneNode node = {
        .id = 1,
        .mesh = tree_mesh,
        .material = irrelevant,
        .local_transform = m4fromPositionAndEuler(
            (Vec3){ .x = -11.f, .y = 0.5f, .z = 0.f }, 
            (Vec3){  .x = 0.f, .y = -1.f, .z = 0.f }),
        .children = std::vector<SceneNode>(),
    }; 
   
    const Ray ray = {
     .origin = {-11.f, 0.5f, 0.f},
     .direction = {0.f, -1.f, 0.f}
    };

    const IntersectionArray * result = rayIntersectsSceneNode(ray, node);

    const Intersection expected = { 
        .point = { -11.f, 0.f, 0.f}, 
        .triangleIdx = 0 
    };

    if (!result->size) {
        return (TestResult){
            .message = "no intersection found",
            .pass = false
        };
    } else {
        Intersection intersection_result = result->array[0];
        if (vec3sAreEqual(expected.point, intersection_result.point) &&
            expected.triangleIdx == intersection_result.triangleIdx) {
           return (TestResult){
            .message = "correct intersection was found",
            .pass = true
        }; 
        } else {
            return (TestResult){
            .message = "incorrect intersection found",
            .pass = false
        };
        }
    }

}

