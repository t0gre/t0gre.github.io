#include "stdbool.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "my_string.h"

// // triangle is symmetrical x-y and just a bit back from origin z
// const triangle: Triangle = [[1,0,0.1], [0,1,0.1], [-1, 0, 0.1]]

// test('it correctly finds an intersection', () => {
   
//     const ray: Ray = {
//     origin: [0.5, 0.5, 0],
//     direction: [0, 0, 1]
//     }

//     const result = rayIntersectsTriangle(ray, triangle)

//     const expected = [0.5, 0.5, 0.1]
//     expect(result, "intersection is correct").toEqual(expected)

// })

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

TestResult passed_test() {
    return (TestResult){
       .pass = true,
       .message = "it passed"
    };
}

TestResult failed_test() {
    return (TestResult){
       .pass = true,
       .message = "it failed"
    };
}

// Example usage in main:
int main(int argc, char** argv) {
    TestResultArray *results = createTestResultArray(4);

    addTestResult(results, passed_test());
    addTestResult(results, failed_test());

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