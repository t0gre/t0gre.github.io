#include <vector>

#include "render_program.h"
#include "mesh.h"
#include "scene.h"
#include "test_helpers.cpp"
#include "raycast.h"



float positions[18] = {
    -10.f, 0.f, -10.f, // back left
    -10.f, 0.f, 10.f, // front left
     10.f, 0.f, -10.f, // back right
    -10.f, 0.f, 10.f, // front left
     10.f, 0.f, 10.f, // front right
     10.f, 0.f, -10.f, // back right
     };
     
float normals[18] = {
        0.f,1.f, 0.f,
        0.f,1.f, 0.f,
        0.f,1.f, 0.f,
        0.f,1.f, 0.f,
        0.f,1.f, 0.f,
        0.f,1.f, 0.f,
};

const Vertices vertices = {
  .vertex_count = 6,
  .positions = positions,
  .normals = normals,
  
}; 
   
const Material irrelevant = {
            .color = { .r = 0.1, .g = 0.7, .b = 0.1},
            .specular_color = { .r = 0.2, .g = 0.2, .b = 0.2},
            .shininess = 0.5f
        };

TestResult intersect_node_with_position_transform() {
   
    RenderProgram render_program = initShader();
    Mesh tree_mesh = createMesh(vertices, &render_program); 

    Mat4 transform = m4fromPositionAndEuler(
            (Vec3){ .x = -11.f, .y = 0.5f, .z = 0.f }, 
            (Vec3){  .x = 0.f, .y = -1.f, .z = 0.f });

    SceneNode node = {
        .id = 1,
        .local_transform = transform,
        .world_transform = transform,
        .material = irrelevant,
        .children = std::vector<SceneNode>(),
        .mesh = tree_mesh,
    }; 
   
    const Ray ray = {
     .origin = {-11.f, 0.5f, 0.f},
     .direction = {0.f, -1.f, 0.f}
    };

    auto result = rayIntersectsSceneNode(ray, node);

    const Intersection expected = { 
        .point = { -11.f, 0.f, 0.f}, 
        .triangleIdx = 0 
    };

    if (result.empty()) {
        return (TestResult){
            .pass = false,
            .message = "no intersection found",
           
        };
    } else {
        Intersection intersection_result = result[0];
        if (vec3sAreEqual(expected.point, intersection_result.point) &&
            expected.triangleIdx == intersection_result.triangleIdx) {
           return (TestResult){
            .pass = true,
            .message = "correct intersection was found",
            
        }; 
        } else {
            return (TestResult){
            .pass = false,
            .message = "incorrect intersection found",
          
        };
        }
    }

}

