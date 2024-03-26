#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/html5.h>
#endif

#include "std_imports.h"

#include "mat4.h"
#include "math_utils.h"
#include "camera.h"
#include "loader.h"
#include "app_state.h"
#include "model.h"
#include "events.h"



WindowState initWindow(const char* title)
{
    // Create SDL window
    SDL_Window* window_object = SDL_CreateWindow(title, 
                         SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
                          480, 640, 
                         SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE| SDL_WINDOW_SHOWN);
    const Uint32 window_id = SDL_GetWindowID(window_object);

    
    #ifdef __EMSCRIPTEN__
    // This emscripten call fixes an antialiasing bug in sdl context creation for webgl2
    EMSCRIPTEN_WEBGL_CONTEXT_HANDLE context = emscripten_webgl_create_context("canvas", &(EmscriptenWebGLContextAttributes){
        .depth = 1,
        .stencil = 1,
        .antialias = 1,
        .majorVersion = 2,
        .minorVersion = 0
    });
    // emscripten_webgl_make_context_current(context);
    #endif

    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
    
    SDL_GLContext mainContext = SDL_GL_CreateContext(window_object);
    // SDL_GL_MakeCurrent(window_object, (SDL_GLContext)context );

    // Set clear color to black
    glClearColor(1.0f, 1.0f, 1.0f, 1.0f);
    glEnable(GL_DEPTH_TEST);
    

    // Initialize viewport
    glViewport(0,0 ,480, 640);
    const WindowState window = {
        .object = window_object, 
        .id = window_id
        };
        
    return window;
}



void draw(WindowState window, Camera camera, Scene scene, RenderProgram render_program)
{
    // Clear screen
    glClear(GL_COLOR_BUFFER_BIT);

    for (uint8_t i = 0; i < scene.model_count; i++) {
        drawModel(scene.models[i], camera, render_program);
    } 

    // Swap front/back framebuffers
    SDL_GL_SwapWindow(window.object);
}


void updateModel(Model* model, float dt) {
    // model->rotation.y += 1.2 * dt / 1000;
}

void mainLoop(void* mainLoopArg) 
{   
   
    AppState* state = (AppState*)mainLoopArg;

    // calculate deltaTime
    const Uint64 now = SDL_GetPerformanceCounter();
    const Uint64 last = state->last_frame_time;

    const double deltaTime = ((now - last)*1000 / (double)SDL_GetPerformanceFrequency() );
    state->last_frame_time = now;

    // log errors
    const char* error = SDL_GetError();
    if (error[0] != '\0') {
        puts(error);
        SDL_ClearError();
    }
   
    updateModel(&state->scene.models[0], deltaTime);

    processEvents(state);
     
    draw(state->window, state->camera, state->scene, state->render_program);

}


int main(int argc, char** argv)
{

    InputState input = {
        .pointer_down = false,
        .pointer_position = { 0 }
    };

    WindowState window = initWindow("Tom");
    Uint64 now = SDL_GetPerformanceCounter();
   
    // Initialize shader and geometry
    RenderProgram render_program = initShader();

    // create a model
   
    // TODO do these need to be cleaned up?
    FloatData normals = readcsv("normals.txt");
    FloatData positions = readcsv("positions.txt");

    Mesh tree_mesh = createMesh(positions, normals, &render_program);
    
    Model tree_model = {
        .mesh = tree_mesh,
        .color= (Vec4){0.1, 0.7, 0.1, 1.0},
        .position = { 0.f, 0.f, 0.f },
        .rotation = { 0.f, PI / 2.f, 0.f }
    };

    float floor_positions_data[18] = {
            -10.f ,0.f, -10.f, // back left
            -10.f ,0.f, 10.f, // front left
            10.f ,0.f, -10.f, // back right
            10.f ,0.f, -10.f, // back right
            10.f ,0.f, 10.f, // front right
            -10.f ,0.f, 10.f // front left
        };

    FloatData floor_positions = {
        .count = 18,
        .data = floor_positions_data
    };

    float floor_normals_data[18] = {
            0.f ,1.f, 0.f,
            0.f ,1.f, 0.f,
            0.f ,1.f, 0.f,
            0.f ,1.f, 0.f,
            0.f ,1.f, 0.f,
            0.f ,1.f, 0.f,
        };

    FloatData floor_normals = {
        .count = 18,
        .data = floor_normals_data
    };

    Mesh floor_mesh = createMesh(floor_positions, floor_normals, &render_program);

    Model floor_model = {
        .mesh = floor_mesh,
        .color = (Vec4){0.1, 0.7, 0.4, 1.0},
        .position = { 0.f, 0.1f, 0.f },
        .rotation = { 0.f, 0.f, 0.f }
    };

    Scene scene =  { 
        .model_count = 2,
        .models = { tree_model, floor_model }
        };

    // create a camera
    const Vec3 camera_up = { 0.f, 1.f, 0.f };
    const Vec3 camera_position = { 0.f, 3.5f, 10.f };
    const Vec3 camera_rotation = { 0.f, 0.f, 0.f };
    const Camera camera = createCamera(degreeToRad(60.f), 1.f, 1.f, 2000.f, camera_up, camera_position, camera_rotation);

    
    AppState state = {
        .window = window,
        .last_frame_time = now,
        .scene = scene,
        .camera = camera,
        .input = input,
        .render_program = render_program
    };

    // Start the main loop
    void* mainLoopArg = &state;
    


#ifdef __EMSCRIPTEN__
   
    int fps = 0; // Use browser's requestAnimationFrame
    emscripten_set_main_loop_arg(mainLoop, mainLoopArg, fps, 1);
   
#else
    while(!state.window.should_close) 
        
        mainLoop(mainLoopArg);

#endif

    return 0;
}