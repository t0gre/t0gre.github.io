#include "stdbool.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <vector>
#include "my_string.h"

#include "test_helpers.cpp" // include before tests
#include "raycast_triangle_tests.cpp"
#include "raycast_vertices_tests.cpp"

    
int main(int argc, char** argv) {
    std::vector<TestResult> results;

    // triangle tests
    results.push_back(intersect_triangle());
    results.push_back(dont_intersect_because_origin());
    results.push_back(dont_intersect_because_direction());
    
    // mesh.push_back(ests
    results.push_back(intersect_vertices_first());
    results.push_back(intersect_vertices_last());

    int total = 0;
    int passed = 0;
    int failed = 0;

    // Print results
    for (size_t i = 0; i < results.size(); ++i) {
        total++;
        String * result_message = createString(100);
        const char * test_message = results.at(i).message;
        bool test_result = results.at(i).pass;

        char test_number_string[50];
        snprintf(test_number_string, sizeof(test_number_string), "test result %d: ", total);
        appendString(result_message, test_number_string);
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