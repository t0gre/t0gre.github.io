#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

#include <SDL.h>
#include <SDL_opengles2.h>
#include <stdbool.h>
#include <stdio.h>

#include "lib/mat4.h"
#include "lib/math_utils.h"
#include "lib/camera.h"
#include "lib/loader.h"



typedef struct RenderProgram  {
    GLuint shaderProgram;
    GLuint modelUniformLocation;
    GLuint viewUniformLocation;
    GLuint projectionUniformLocation;
} RenderProgram;

typedef struct Model {
    Vec3 position;
    Vec3 rotation;
    FloatData positions;
    FloatData normals;
    RenderProgram renderProgram;
} Model;  

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
    Model model;
    Camera camera;
    InputState input;

} AppState;



RenderProgram initShader()
{
    // Vertex shader
const GLchar* vertexSource =
    "attribute vec4 a_position;                    \n"
    "attribute vec3 a_normal;                      \n"
    "                                               \n"
    "uniform mat4 u_model;                           \n"
    "uniform mat4 u_view;                            \n"
    "uniform mat4 u_projection;                      \n"
    "                                               \n"
    "varying vec3 v_normal;                        \n"
    "                                               \n"
    "void main()                                   \n"
    "{                                             \n"
    "    gl_Position = u_projection * u_view * u_model * a_position;    \n"
    "    v_normal = mat3(u_model) * a_normal;        \n"
    "}                                             \n";

// Fragment/pixel shader
const GLchar* fragmentSource =
    "precision mediump float;                     \n"
    "                                               \n"
    "varying vec3 v_normal;                       \n"
    "                                               \n"
    "void main()                                  \n"
    "{                                            \n"
    "    vec3 lightDirection = vec3(0.0, 0.0, 0.5);               \n"
    "    vec4 diffuse = vec4(0.5, 0.8, 0.5, 0.5); \n"
    "    vec3 normal = normalize(v_normal);       \n"
    "    float fakeLight = dot(lightDirection, normal) * .5 + .5;  \n"
    "    gl_FragColor = vec4(diffuse.rgb * fakeLight, diffuse.a);  \n"
    "}                                            \n";
    // Create and compile vertex shader
    const GLuint vertexShader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertexShader, 1, &vertexSource, NULL);
    glCompileShader(vertexShader);

    // Create and compile fragment shader
    const GLuint fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragmentShader, 1, &fragmentSource, NULL);
    glCompileShader(fragmentShader);

    // Link vertex and fragment shader into shader program and use it
    const GLuint shaderProgram = glCreateProgram();
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);
    glUseProgram(shaderProgram);

    // Get shader uniforms and initialize them
    const GLuint modelUniformLocation = glGetUniformLocation(shaderProgram, "u_model");
    const GLuint viewUniformLocation = glGetUniformLocation(shaderProgram, "u_view");
    const GLuint projectionUniformLocation = glGetUniformLocation(shaderProgram, "u_projection");
    

   


    RenderProgram renderProgram = {
        .shaderProgram = shaderProgram,
        .modelUniformLocation = modelUniformLocation,
        .viewUniformLocation = viewUniformLocation,
        .projectionUniformLocation = projectionUniformLocation,
    };


    return renderProgram; 
}

void drawModel(Model model, Camera camera) {

    glUseProgram(model.renderProgram.shaderProgram);

  
    const Mat4 projection = m4perspective(camera.field_of_view_radians, camera.aspect, camera.near, camera.far);
    const Mat4 view = m4inverse(m4fromPositionAndEuler(camera.position, camera.rotation));
    const Mat4 model_m = m4fromPositionAndEuler(model.position, model.rotation);

    float mBuf[4][4] = {0};
    m4toArray(model_m, mBuf);
    glUniformMatrix4fv(model.renderProgram.modelUniformLocation,1,0, &mBuf[0][0]);

    float vBuf[4][4] = {0};
    m4toArray(view, vBuf);
    glUniformMatrix4fv(model.renderProgram.viewUniformLocation,1,0, &vBuf[0][0]);

    float pBuf[4][4] = {0};
    m4toArray(projection, pBuf);
    glUniformMatrix4fv(model.renderProgram.projectionUniformLocation,1,0, &pBuf[0][0]);


    // Draw the vertex buffer
    glDrawArrays(GL_TRIANGLES, 0, model.positions.count / 3);

}




WindowState initWindow(const char* title)
{
    // Create SDL window
    SDL_Window* window_object = SDL_CreateWindow(title, 
                         SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
                          480, 640, 
                         SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE| SDL_WINDOW_SHOWN);
    const Uint32 window_id = SDL_GetWindowID(window_object);

    // Create OpenGLES 2 context on SDL window
    
    const SDL_GLContext glc = SDL_GL_CreateContext(window_object); 
    // SDL_GL_MakeCurrent(window_object, glc);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
    // SDL_GL_SetSwapInterval(1);
    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);

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



void initGeometry(RenderProgram renderProgram, Model* model)
{
   

    
    // Create vertex buffer object and copy vertex data into it
    GLuint vbo;
    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(float)*model->positions.count, model->positions.data, GL_STATIC_DRAW);

    // Specify the layout of the shader vertex data (positions only, 3 floats)
    GLint posAttrib = glGetAttribLocation(renderProgram.shaderProgram, "a_position");
    glEnableVertexAttribArray(posAttrib);
    glVertexAttribPointer(posAttrib, 3, GL_FLOAT, GL_FALSE, 0, 0);

    GLuint vbo_norm;
    glGenBuffers(1, &vbo_norm);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_norm);
    glBufferData(GL_ARRAY_BUFFER, sizeof(float)*model->normals.count, model->normals.data, GL_STATIC_DRAW);

    // Specify the layout of the shader vertex data (normals only, 3 floats)
    GLint normAttrib = glGetAttribLocation(renderProgram.shaderProgram, "a_normal");
    glEnableVertexAttribArray(normAttrib);
    glVertexAttribPointer(normAttrib, 3, GL_FLOAT, GL_TRUE, 0, 0);
    
    
}

void redraw(WindowState window, Camera camera, Model model)
{
    // Clear screen
    glClear(GL_COLOR_BUFFER_BIT);

    drawModel(model, camera);

    // Swap front/back framebuffers
    SDL_GL_SwapWindow(window.object);
}

void processEvents(AppState* state)
{
    // Handle events
    SDL_Event event;
    while (SDL_PollEvent(&event))
    {
        switch (event.type)
        {
            case SDL_QUIT:
                state->window.should_close = true;
                break;

            case SDL_WINDOWEVENT:
            {
                if (event.window.windowID == state->window.id
                    && event.window.event == SDL_WINDOWEVENT_SIZE_CHANGED)
                {
                    int width = event.window.data1, height = event.window.data2;
                    glViewport(0, 0, width, height);

                    state->camera.aspect = (float)width / (float)height;; 
                    
                }
                break;
            }

            case SDL_MOUSEBUTTONDOWN:
            {
                SDL_MouseButtonEvent* e = (SDL_MouseButtonEvent*)&event;
                if (event.button.button == 1) {
                    state->input.pointer_down = true;
                    Vec2 pointer_position = {
                    .x = e->x,
                    .y = e->y
                    };
                    state->input.pointer_position = pointer_position;
                }
                break;
            }
            case SDL_MOUSEMOTION:
            {
                SDL_MouseMotionEvent *e = (SDL_MouseMotionEvent*)&event;
                if (state->input.pointer_down) {
                    
                    state->model.rotation.y += e->xrel / 100.f;
                    Vec2 pointer_position = {
                    .x = e->x,
                    .y = e->y
                    };
                    state->input.pointer_position = pointer_position;
    
                }
                break;
            }

            case SDL_MOUSEBUTTONUP:
            {
                if (event.button.button == 1) {
                    state->input.pointer_down = false;
                    Vec2 pointer_position ={ 0 } ;
                    state->input.pointer_position = pointer_position;
                }
                break;
            }
        }

        
    }
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
   
    updateModel(&state->model, deltaTime);

    processEvents(state);
     
    redraw(state->window, state->camera, state->model);

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
    RenderProgram renderProgram = initShader();

    // create a model
    const Vec3 model_position = { 0.f, 0.f, 0.f };
    const Vec3 model_rotation = { 0.f, PI / 2.f, 0.f };
    // TODO do these need to be cleaned up?
    FloatData normals = readcsv("normals.txt");
    FloatData positions = readcsv("positions.txt");
    
    Model model = {
        .position = model_position,
        .rotation = model_rotation,
        .positions = positions,
        .normals = normals,
        .renderProgram = renderProgram
    };

    initGeometry(renderProgram, &model);

    
  

    // create a camera
    const Vec3 camera_up = { 0.f, 1.f, 0.f };
    const Vec3 camera_position = { 0.f, 3.5f, 10.f };
    const Vec3 camera_rotation = { 0.f, 0.f, 0.f };
    const Camera camera = createCamera(degreeToRad(60.f), 1.f, 1.f, 2000.f, camera_up, camera_position, camera_rotation);

    
    AppState state = {
        .window = window,
        .last_frame_time = now,
        .model = model,
        .camera = camera,
        .input = input
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