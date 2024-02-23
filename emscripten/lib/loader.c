#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "loader.h"

FloatData readcsv(const char* filename) {

  FILE* fptr = fopen(filename, "r");

  int read = 0;
  int number_of_floats = 0;
  while ((read = getc(fptr)) != EOF) {
    if (read == ',') {
      number_of_floats++;
      }
    }
    
  number_of_floats++;
  size_t number = number_of_floats;
  float* floats = malloc(sizeof(float)*number);

  size_t float_cursor = 0;
  char number_string[10] = { 0 }; // it wont be longer than this
  size_t digit_cursor = 0;
  FILE* fptr2 = fopen(filename, "r");

  while ((read = getc(fptr2)) != EOF) {
    
    if (read != ',') {
        // add chars to number string
        char t = read; 
        number_string[digit_cursor] = t;
        digit_cursor++;
    } else {
        // convert the number string into a float
        floats[float_cursor] = atof(number_string);
        // zero the number string
        memset(number_string,0,strlen(number_string));
        // reset digit cusor
        digit_cursor = 0;
        // move onto the next float
        float_cursor++; 
    }
   } 

    // at EOF add the last float in
    floats[float_cursor] = atof(number_string);

    FloatData result = {
        .data = floats,
        .count = number
    };

    return result;

}