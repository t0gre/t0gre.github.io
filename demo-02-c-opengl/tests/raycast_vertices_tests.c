#include "mesh.h"
#include "test_helpers.c"
#include <raycast.h>

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

const Vertices meshVertices = {
  .positions = pos_dat,
  .normals = norm_dat,
  .vertex_count = 6
}; 
        

TestResult intersect_vertices_first() {
   
    // triangle is symmetrical x-y and just a bit back from origin z
   
    const Ray ray = {
     .origin = {-1.f, 0.5f, 0.f},
     .direction = {0.f, -1.f, 0.f}
    };

    const IntersectionArray * result = rayIntersectsVertices(ray, meshVertices);

    const Intersection expected = { 
        .point = { -1.f, 0.f, 0.f}, 
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

TestResult intersect_vertices_last() {
   
    // triangle is symmetrical x-y and just a bit back from origin z
   
    const Ray ray = {
     .origin = { 1.f, 0.5f, 0.f},
     .direction = {0.f, -1.f, 0.f}
    };

    const IntersectionArray * result = rayIntersectsVertices(ray, meshVertices);

    const Intersection expected = { 
        .point = { 1.f, 0.f, 0.f}, 
        .triangleIdx = 1 
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


// test('it correctly finds an intersection in the last triangle', () => {
   
//     const ray: Ray = {
//     origin: [1, 0.5, 0],
//     direction: [0, -1, 0]
//     }

//     const result = rayIntersectsVertices(ray, meshVertices)

//     const expected: Intersection = { point: [1, 0.0, 0], triangleIdx: 1 }
//     expect(result.length, "only one hit").toEqual(1)
//     expect(result[0], "intersection is correct").toEqual(expected)

// })

