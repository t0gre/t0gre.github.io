#ifndef MY_STRING_H
#define MY_STRING_H

#include <stdlib.h>

typedef struct {
    char *data;
    size_t length;
    size_t capacity;
} String;

String *createString(size_t initial_capacity);

void appendString(String *str, const char *suffix);

void freeString(String *str);

#endif