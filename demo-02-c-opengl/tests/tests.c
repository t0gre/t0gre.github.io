#include "stdbool.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "my_string.h"
#include "raycast.h"

typedef struct TestResult {
    bool pass;
    char * message;
} TestResult;

typedef struct {
    size_t size;
    size_t capacity;
    TestResult *array;
} TestResultArray;

TestResultArray *createTestResultArray(size_t initial_capacity) {
    TestResultArray *arr = malloc(sizeof(TestResultArray));
    arr->size = 0;
    arr->capacity = initial_capacity;
    arr->array = malloc(initial_capacity * sizeof(TestResult));
    return arr;
}

void addTestResult(TestResultArray *arr, TestResult result) {
    if (arr->size >= arr->capacity) {
        arr->capacity *= 2;
        arr->array = realloc(arr->array, arr->capacity * sizeof(TestResult));
    }
    arr->array[arr->size++] = result;
}

void freeTestResultArray(TestResultArray *arr) {
    free(arr->array);
    free(arr);
}

bool floatsAreClose(float a, float b) {
    return fabs(a - b) < 0.0000001f;
}

bool vec3sAreEqual(Vec3 a, Vec3 b) {
    return (floatsAreClose(a.x, b.x) && 
            floatsAreClose(a.y, b.y) && 
            floatsAreClose(a.z, b.z));
}

const Triangle triangle = {
        { 1.f, 0.f, 0.1f }, 
        { 0.f, 1.f, 0.1f }, 
        {-1.f, 0.f, 0.1f } 
    };

TestResult intersect_triangle() {
   
    // triangle is symmetrical x-y and just a bit back from origin z
   
    const Ray ray = {
     .origin = {0.5f, 0.5f, 0.f},
     .direction = {0.f, 0.f, 1.f}
    };

    const Vec3Result result = rayIntersectsTriangle(ray, triangle);

    const Vec3Result expected = {
        .valid = true,
        .value = {0.5f, 0.5f, 0.1f}
    };

    if (!result.valid) {
        return (TestResult){
            .message = "no intersection found",
            .pass = false
        };
    } else {
        if (vec3sAreEqual(expected.value, result.value)) {
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


TestResult dont_intersect_because_origin() {
    
 
    // pointing away from the triangle
    const Ray ray = {
        .origin = {0.5f, 0.5f, 0.2f},
        .direction = {0.f, 0.f, 1.f}
    };

    const Vec3Result result = rayIntersectsTriangle(ray, triangle);

    if (result.valid) {
         return (TestResult){
            .message = "intersection found when it should not",
            .pass = false
        };
    } else {
        return (TestResult){
            .message = "no intersection found, correctly",
            .pass = true
        };
    }

}

TestResult dont_intersect_because_direction() {
    
 
    // this should intersect the triangles plane, but not the triangle itself
    const Ray ray = {
     .origin = {0.5f, 0.5f, -10.f},
     .direction = normalize((Vec3){0.f, 1.f, 1.f})
    };

    const Vec3Result result = rayIntersectsTriangle(ray, triangle);

    if (result.valid) {
         return (TestResult){
            .message = "intersection found when it should not",
            .pass = false
        };
    } else {
        return (TestResult){
            .message = "no intersection found, correctly",
            .pass = true
        };
    }

}
    
int main(int argc, char** argv) {
    TestResultArray *results = createTestResultArray(4);

    
    addTestResult(results, intersect_triangle());
    addTestResult(results, dont_intersect_because_origin());
    addTestResult(results, dont_intersect_because_direction());

    int passed = 0;
    int failed = 0;

    // Print results
    for (size_t i = 0; i < results->size; ++i) {
        String * result_message = createString(100);
        char * test_message = results->array[i].message;
        bool test_result = results->array[i].pass;

        appendString(result_message, test_message);
        appendString(result_message, " -- ");
        
        if (test_result) {
            passed++;
            appendString(result_message, "PASS");
            printf("\033[0;32m"); // set the output color to green
        }else {
            failed++;
            appendString(result_message, "FAIL");
            printf("\033[0;31m"); // set the output color to red

        }
        printf("%s\n", result_message->data);
    }

    // set the output color to green
    printf("\033[0;32m");

    freeTestResultArray(results);

    if (failed) {

        printf("Total Tests Passed: %d\n", passed);
        printf("\033[0;31m"); // set the output color to red
        printf("Total Tests Failed: %d\n", failed);
        printf("Test Suite Result -- FAIL\n");
        return 1;
    } else {
       
        printf("Total Tests Passed: %d\n", passed);
        printf("Total Tests Failed: %d\n", failed);
        printf("Test Suite Result -- PASS\n");

        return 0;
    }



    
   
}