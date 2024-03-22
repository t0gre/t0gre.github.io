#ifndef APP_STATE_H
#define APP_STATE_H

#include "vec.h"
#include "SDL.h" 
#include "camera.h"
#include "mesh.h"
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

typedef struct AppState  {
    WindowState window;
    Uint64 last_frame_time;
    Mesh mesh;
    Camera camera;
    InputState input;
    RenderProgram render_program;

} AppState;

#endif //APP_STATE