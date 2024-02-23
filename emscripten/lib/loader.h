#ifndef LOADER_H
#define LOADER_H

typedef struct FloatData {
    float* data;
    size_t count;
} FloatData;

FloatData readcsv(const char* filename);

#endif /* LOADER_H */