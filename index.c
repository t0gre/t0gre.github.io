#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

#include <SDL.h>
#include <SDL_opengles2.h>
#include <stdbool.h>

#include "lib/mat4.h"
#include "lib/math_utils.h"
#include "lib/camera.h"

// Vertex shader
const GLchar* vertexSource =
    "attribute vec4 a_position;                    \n"
    "attribute vec3 a_normal;                      \n"
    "uniform mat4 model;                           \n"
    "uniform mat4 view;                            \n"
    "uniform mat4 projection;                      \n"
    "varying vec3 v_normal;                        \n"
    "void main()                                   \n"
    "{                                             \n"
    "    gl_Position = projection * view * model * a_position;    \n"
    "    v_normal = mat3(model) * a_normal;        \n"
    "}                                             \n";

// Fragment/pixel shader
const GLchar* fragmentSource =
    "precision mediump float;                     \n"
    "uniform float opacity;                       \n"
    "varying vec3 v_normal;                       \n"
    "void main()                                  \n"
    "{                                            \n"
    "    vec3 lightDirection = vec3(-0.5, 0.0, 0.0);               \n"
    "    vec4 diffuse = vec4(0.5, 0.5, 0.5, 0.5); \n"
    "    vec3 normal = normalize(v_normal);       \n"
    "    float fakeLight = dot(lightDirection, normal) * .5 + .5;  \n"
    "    gl_FragColor = vec4(diffuse.rgb * fakeLight, diffuse.a);  \n"
    "}                                            \n";

typedef struct RenderProgram  {
    GLuint shaderProgram;
    GLuint modelUniformLocation;
    GLuint viewUniformLocation;
    GLuint projectionUniformLocation;
    GLuint opacityUniformLocation;
} RenderProgram;



RenderProgram initShader(void)
{
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
    const GLuint modelUniformLocation = glGetUniformLocation(shaderProgram, "model");
    const GLuint viewUniformLocation = glGetUniformLocation(shaderProgram, "view");
    const GLuint projectionUniformLocation = glGetUniformLocation(shaderProgram, "projection");
    
    const GLuint opacityUniformLocation = glGetUniformLocation(shaderProgram, "opacity");

    RenderProgram renderProgram = {
        .shaderProgram = shaderProgram,
        .modelUniformLocation = modelUniformLocation,
        .viewUniformLocation = viewUniformLocation,
        .projectionUniformLocation = projectionUniformLocation,
        .opacityUniformLocation = opacityUniformLocation,
    };

    const Vec3 camera_up = { 0.f, 1.f, 0.f };
    const Vec3 camera_position = { 0.f, 0.f, -5.f };
    const Vec3 camera_rotation = { 0.f, 0.f, 0.f };
    const Camera camera = createCamera(degreeToRad(60.f), 1.f, 1.f, 2000.f, camera_up, camera_position, camera_rotation);
    const Mat4 projection = m4perspective(camera.field_of_view_radians, camera.aspect, camera.near, camera.far);
    const Mat4 view = m4fromPositionAndEuler(camera.position, camera.rotation);
    const Vec3 model_position = { 0.f, 0.f, 0.f };
    const Vec3 model_rotation = { 0.f, 0.5f, 0.f };
    const Mat4 model = m4fromPositionAndEuler(model_position, model_rotation);

    float mBuf[4][4] = {};
    m4toArray(model, mBuf);
    glUniformMatrix4fv(renderProgram.modelUniformLocation,1,0, &mBuf[0][0]);

    float vBuf[4][4] = {};
    m4toArray(view, vBuf);
    glUniformMatrix4fv(renderProgram.viewUniformLocation,1,0, &vBuf[0][0]);

    float pBuf[4][4] = {};
    m4toArray(projection, pBuf);
    glUniformMatrix4fv(renderProgram.projectionUniformLocation,1,0, &pBuf[0][0]);

    glUniform1f(renderProgram.opacityUniformLocation, 0.1);

    return renderProgram; 
}

typedef struct WindowState  {
    SDL_Window* object;
    Uint32 id;
    bool should_close;
} WindowState;



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
    SDL_GL_MakeCurrent(window_object, glc);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
    SDL_GL_SetSwapInterval(1);
    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);

    // Set clear color to black
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
    glEnable(GL_DEPTH_TEST);
    

    // Initialize viewport
    glViewport(0,0 ,480, 640);
    const WindowState window = {
        .object = window_object, 
        .id = window_id
        };
        
    return window;
}

void initGeometry(RenderProgram renderProgram)
{
    // Create vertex buffer object and copy vertex data into it
    GLuint vbo;
    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    

    const GLfloat vertices[] = 
   {
    -0.5f, -0.5f, -0.5f,  
     0.5f, -0.5f, -0.5f,  
     0.5f,  0.5f, -0.5f,  
     0.5f,  0.5f, -0.5f,  
    -0.5f,  0.5f, -0.5f,  
    -0.5f, -0.5f, -0.5f,  

    -0.5f, -0.5f,  0.5f,  
     0.5f, -0.5f,  0.5f,  
     0.5f,  0.5f,  0.5f,  
     0.5f,  0.5f,  0.5f,  
    -0.5f,  0.5f,  0.5f,  
    -0.5f, -0.5f,  0.5f,  

    -0.5f,  0.5f,  0.5f,  
    -0.5f,  0.5f, -0.5f,  
    -0.5f, -0.5f, -0.5f,  
    -0.5f, -0.5f, -0.5f,  
    -0.5f, -0.5f,  0.5f,  
    -0.5f,  0.5f,  0.5f,  

     0.5f,  0.5f,  0.5f,  
     0.5f,  0.5f, -0.5f,  
     0.5f, -0.5f, -0.5f,  
     0.5f, -0.5f, -0.5f,  
     0.5f, -0.5f,  0.5f,  
     0.5f,  0.5f,  0.5f,  

    -0.5f, -0.5f, -0.5f,  
     0.5f, -0.5f, -0.5f,  
     0.5f, -0.5f,  0.5f,  
     0.5f, -0.5f,  0.5f,  
    -0.5f, -0.5f,  0.5f,  
    -0.5f, -0.5f, -0.5f,  

    -0.5f,  0.5f, -0.5f,  
     0.5f,  0.5f, -0.5f,  
     0.5f,  0.5f,  0.5f,  
     0.5f,  0.5f,  0.5f,  
    -0.5f,  0.5f,  0.5f,  
    -0.5f,  0.5f, -0.5f, 
};
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    // Specify the layout of the shader vertex data (positions only, 3 floats)
    GLint posAttrib = glGetAttribLocation(renderProgram.shaderProgram, "a_position");
    glEnableVertexAttribArray(posAttrib);
    glVertexAttribPointer(posAttrib, 3, GL_FLOAT, GL_FALSE, 0, 0);

    GLuint vbo_norm;
    glGenBuffers(1, &vbo_norm);
    glBindBuffer(GL_ARRAY_BUFFER, vbo_norm);
    
    const GLfloat normals[] = 
    {
      0.0f,  0.0f, -1.0f,
      0.0f,  0.0f, -1.0f, 
      0.0f,  0.0f, -1.0f, 
      0.0f,  0.0f, -1.0f, 
      0.0f,  0.0f, -1.0f, 
      0.0f,  0.0f, -1.0f, 

      0.0f,  0.0f, 1.0f,
      0.0f,  0.0f, 1.0f,
      0.0f,  0.0f, 1.0f,
      0.0f,  0.0f, 1.0f,
      0.0f,  0.0f, 1.0f,
      0.0f,  0.0f, 1.0f,

     -1.0f,  0.0f,  0.0f,
     -1.0f,  0.0f,  0.0f,
     -1.0f,  0.0f,  0.0f,
     -1.0f,  0.0f,  0.0f,
     -1.0f,  0.0f,  0.0f,
     -1.0f,  0.0f,  0.0f,

      1.0f,  0.0f,  0.0f,
      1.0f,  0.0f,  0.0f,
      1.0f,  0.0f,  0.0f,
      1.0f,  0.0f,  0.0f,
      1.0f,  0.0f,  0.0f,
      1.0f,  0.0f,  0.0f,

      0.0f, -1.0f,  0.0f,
      0.0f, -1.0f,  0.0f,
      0.0f, -1.0f,  0.0f,
      0.0f, -1.0f,  0.0f,
      0.0f, -1.0f,  0.0f,
      0.0f, -1.0f,  0.0f,

      0.0f,  1.0f,  0.0f,
      0.0f,  1.0f,  0.0f,
      0.0f,  1.0f,  0.0f,
      0.0f,  1.0f,  0.0f,
      0.0f,  1.0f,  0.0f,
      0.0f,  1.0f,  0.0f
};
    glBufferData(GL_ARRAY_BUFFER, sizeof(normals), normals, GL_STATIC_DRAW);

    // Specify the layout of the shader vertex data (normals only, 3 floats)
    GLint normAttrib = glGetAttribLocation(renderProgram.shaderProgram, "a_normal");
    glEnableVertexAttribArray(normAttrib);
    glVertexAttribPointer(normAttrib, 3, GL_FLOAT, GL_TRUE, 0, 0);
    
    
}

void redraw(WindowState window)
{
    // Clear screen
    glClear(GL_COLOR_BUFFER_BIT);

    // Draw the vertex buffer
    glDrawArrays(GL_TRIANGLES, 0, 36); // TOD0: get this length dynimically

    // Swap front/back framebuffers
    SDL_GL_SwapWindow(window.object);
}

void processEvents(WindowState window)
{
    // Handle events
    SDL_Event event;
    while (SDL_PollEvent(&event))
    {
        switch (event.type)
        {
            case SDL_QUIT:
                window.should_close = true;
                break;

            case SDL_WINDOWEVENT:
            {
                if (event.window.windowID == window.id
                    && event.window.event == SDL_WINDOWEVENT_SIZE_CHANGED)
                {
                    int width = event.window.data1, height = event.window.data2;
                    glViewport(0, 0, width, height);
                }
                break;
            }

         
        }

        
    }
}

typedef struct AppState {
    WindowState window;
    Uint64 last_frame_time;
} AppState;

void mainLoop(void* mainLoopArg) 
{   
   
    AppState* state = (AppState*)mainLoopArg;

    const Uint64 now = SDL_GetPerformanceCounter();
    const Uint64 last = state->last_frame_time;

    const double deltaTime = ((now - last)*1000 / (double)SDL_GetPerformanceFrequency() );
    state->last_frame_time = now;

    // log errors
    const char* error = SDL_GetError();
    puts(error);
    SDL_ClearError();
   
    processEvents(state->window);
    redraw(state->window);
}

int main(int argc, char** argv)
{

    WindowState window = initWindow("Tom");
    const Uint64 now = SDL_GetPerformanceCounter();
    AppState state = {
        .window = window,
        .last_frame_time = now
        };
   
    // Initialize shader and geometry
    RenderProgram renderProgram = initShader();
    initGeometry(renderProgram);

    // Start the main loop
    void* mainLoopArg = &window;


#ifdef __EMSCRIPTEN__
   
    int fps = 0; // Use browser's requestAnimationFrame
    emscripten_set_main_loop_arg(mainLoop, mainLoopArg, fps, 1);
   
#else
    while(!window.should_close) 
        
        mainLoop(mainLoopArg);

#endif

    return 0;
}