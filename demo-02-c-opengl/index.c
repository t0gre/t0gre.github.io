#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#include <emscripten/html5.h>
#endif

#include "std_imports.h"

#include "mat4.h"
#include "math_utils.h"
#include "camera.h"
#include "loaders.h"
#include "app_state.h"
#include "scene.h"
#include "events.h"

#include<unistd.h>



WindowState initWindow(const char* title)
{
    
    SDL_Init(SDL_INIT_VIDEO < 0);
    
    // Create SDL window
    #ifdef __EMSCRIPTEN__

     SDL_Window* window_object = SDL_CreateWindow(title, 
                         SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
                          640, 480, 
                         SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE| SDL_WINDOW_SHOWN);
    const Uint32 window_id = SDL_GetWindowID(window_object);
    // This emscripten call fixes an antialiasing bug in sdl context creation for webgl2
    EMSCRIPTEN_WEBGL_CONTEXT_HANDLE context = emscripten_webgl_create_context("canvas", &(EmscriptenWebGLContextAttributes){
        .depth = 1,
        .stencil = 1,
        .antialias = 1,
        .majorVersion = 2,
        .minorVersion = 0
    });

    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 3);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);

    SDL_GL_CreateContext(window_object);
    // emscripten_webgl_make_context_current(context);
    #else 

    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 4);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 3);
    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);

    SDL_Window* window_object = SDL_CreateWindow(title, 
                         SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
                          640, 480, 
                         SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE| SDL_WINDOW_SHOWN);
    
    const Uint32 window_id = SDL_GetWindowID(window_object);

    SDL_GL_CreateContext(window_object);
    
    // Enable VSync (try 1, fallback to -1)
    if (SDL_GL_SetSwapInterval(1) != 0) {
        printf("VSync (1) not supported, trying adaptive VSync (-1)\n");
        SDL_GL_SetSwapInterval(-1);
    }


    #endif

    
    glClearColor(1.0f, 1.0f, 1.0f, 1.0f);
    glEnable(GL_DEPTH_TEST);

    // Initialize viewport
    glViewport(0,0 ,640, 480);

    const WindowState window = {
        .object = window_object, 
        .id = window_id
        };
        
    return window;
}



void draw(WindowState window, Camera camera, Scene* scene, RenderProgram render_program)
{
    // Clear screen
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    // update camera uniforms
    const Mat4 projection = getProjectionMatrix(camera);
    const Mat4 view = getViewMatrix(camera);
    const Vec3 camera_position = getPositionVector(camera.transform);
    glUniformMatrix4fv(render_program.view_uniform_location,1,0, &view.data[0][0]);  
    glUniform3fv(render_program.view_position_uniform_location,1, &camera_position.data[0]); 
    glUniformMatrix4fv(render_program.projection_uniform_location,1,0, &projection.data[0][0]);

    // update light uniforms
    // set ambient light
    glUniform3fv(render_program.ambient_light_uniform.color_location,1,scene->ambient_light.color.data);

    // set directional light
    glUniform3fv(render_program.directional_light_uniform.color_location,1,scene->directional_light.color.data);
    glUniform3fv(render_program.directional_light_uniform.rotation_location,1,scene->directional_light.rotation.data);

    // set point light
    glUniform3fv(render_program.point_light_uniform.color_location,1,scene->point_light.color.data);
    glUniform3fv(render_program.point_light_uniform.position_location,1,scene->point_light.position.data);
    glUniform1f(render_program.point_light_uniform.constant_location,scene->point_light.constant);
    glUniform1f(render_program.point_light_uniform.linear_location,scene->point_light.linear);
    glUniform1f(render_program.point_light_uniform.quadratic_location,scene->point_light.quadratic); 

    

    for (uint8_t i = 0; i < scene->model_count; i++) {
        drawSceneNode(scene->nodes[i], render_program);
    } 

    #ifndef __EMSCRIPTEN__ 
    // Swap front/back framebuffers
    SDL_GL_SwapWindow(window.object);
    #endif
}


void updateScene(Scene* scene, float dt) {
    Mat4 rotator = m4yRotation(PI / (dt * 10));
    Vec4 old = { 
        .x = scene->point_light.position.x,
        .y = scene->point_light.position.y,
        .z = scene->point_light.position.z,
        .w = 0.0
    };
    Vec4 new = m4vectorMultiply(old, rotator);
    scene->point_light.position = (Vec3){
        .x = new.x,
        .y = new.y,
        .z = new.z
    };
    
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
   
    updateScene(&state->scene, deltaTime);

    processEvents(state);
     
    draw(state->window, state->camera, &state->scene, state->render_program);

}


int main(int argc, char** argv)
{

    InputState input = {
        .pointer_down = false,
        .pointer_position = { 0 }
    };

    WindowState window = initWindow("Tom");
       
    // Initialize shader and geometry
    RenderProgram render_program = initShader();

    // create lights
    AmbientLight ambient_light = {
        .color = { .r = 0.1f, .g = 0.1f, .b = 0.1f }
    };

    DirectionalLight directional_light = {
        .rotation = { .x = 0.0f, .y = -0.8f, .z = -0.5f},
        .color = { .r = 0.5f, .g = 0.5f, .b = 0.5f},
    };

    PointLight point_light = {
        .position = { .x = 0.f, .y = 5.0f, .z = 5.f },
        .color = { .r = 0.2f, .g = 0.2f, .b = 0.2f},
        .constant = 1.0f,
        .linear = 0.009f,
        .quadratic = 0.032f
    };

    


    // create a model
   
    // TODO do these need to be cleaned up?
    FloatData normals = read_csv("normals.txt");
    FloatData positions = read_csv("positions.txt");

    Mesh tree_mesh = createMesh(positions, normals, &render_program);
    
    SceneNode tree_model = {
        .mesh = tree_mesh,
        .material = {
            .color = { .r = 0.1, .g = 0.7, .b = 0.1},
            .specular_color = { .r = 0.2, .g = 0.2, .b = 0.2},
            .shininess = 0.5f
        },
        .local_transform = m4fromPositionAndEuler(
            (Vec3){ .x = 0.f, .y = 0.f, .z = 0.f }, 
            (Vec3){  .x = 0.f, .y = PI / 2.f, .z = 0.f }),
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

    SceneNode floor_model = {
        .mesh = floor_mesh,
        .material = {
            .color = { .r = 0.9, .g = 0.7, .b = 0.1},
            .specular_color = { .r = 0.9, .g = 0.9, .b = 0.9},
            .shininess = 10.f
        },
        .local_transform = m4fromPositionAndEuler(
            (Vec3){ .x = 0.f, .y = 0.1f, .z = 0.f }, 
            (Vec3) { .x = 0.f, .y = 0.f, .z = 0.f }),
    };

    Scene scene =  { 
        .model_count = 2,
        .nodes = { tree_model, floor_model },
        .ambient_light = ambient_light,
        .point_light = point_light,
        .directional_light = directional_light
        };


    // create a camera
    const Camera camera = {
        .aspect = degreeToRad(60.f), 
        .near = 1.f,
        .field_of_view_radians = 1.f,
        .far = 2000.f, 
        .up = { .x = 0.f, .y = 1.f, .z = 0.f }, 
        .transform = m4fromPositionAndEuler(
            (Vec3){ .x = 0.f, .y = 3.5f, .z = 10.f },
            (Vec3){ .x = 0.f, .y = 0.f, .z = 0.f })
        };

    Uint64 now = SDL_GetPerformanceCounter();
    
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