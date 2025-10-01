#include <stdlib.h>
#include "my_string.h"
#include <string.h>

String *createString(size_t initial_capacity) {
    String *str = (String *)malloc(sizeof(String));
    str->data = (char*)malloc(initial_capacity);
    str->length = 0;
    str->capacity = initial_capacity;
    str->data[0] = '\0';
    return str;
}

void appendString(String *str, const char *suffix) {
    size_t suffix_len = strlen(suffix);
    size_t new_len = str->length + suffix_len;
    if (new_len + 1 > str->capacity) {
        str->capacity = (new_len + 1) * 2;
        str->data = (char*)realloc(str->data, str->capacity);
    }
    memcpy(str->data + str->length, suffix, suffix_len + 1);
    str->length = new_len;
}

void freeString(String *str) {
    free(str->data);
    free(str);
}