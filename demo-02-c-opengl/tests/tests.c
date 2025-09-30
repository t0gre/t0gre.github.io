#include "stdbool.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "my_string.h"

#include "test_helpers.c" // include before tests
#include "raycast_triangle_tests.c"
#include "raycast_vertices_tests.c"


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

    
int main(int argc, char** argv) {
    TestResultArray *results = createTestResultArray(4);

    
    // triangle tests
    addTestResult(results, intersect_triangle());
    addTestResult(results, dont_intersect_because_origin());
    addTestResult(results, dont_intersect_because_direction());

    // mesh tests
    addTestResult(results, intersect_vertices());

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