#ifndef APP_STATE_H
#define APP_STATE_H

#include "vec.h"
#include "SDL.h" 
#include "camera.h"
#include "model.h"
#include "render_program.h"

typedef struct InputState {
    bool pointer_down;
    Vec2 pointer_position;
} InputState;

typedef struct WindowState  {
    SDL_Window* object;
    Uint32 id;
    bool should_close;
} WindowState;

typedef struct Scene {
    size_t model_count;
    Model models[2];
} Scene;

typedef struct AppState  {
    WindowState window;
    Uint64 last_frame_time;
    Camera camera;
    InputState input;
    RenderProgram render_program;
    Scene scene;

} AppState;

#endif //APP_STATE