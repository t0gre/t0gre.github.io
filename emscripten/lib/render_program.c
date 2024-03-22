#include "render_program.h"
#include <stddef.h>


RenderProgram initShader(void)
{
    // Vertex shader
const GLchar* vertexSource =
    "#version 300 es \n"
    "in vec4 a_position;                    \n"
    "in vec3 a_normal;                      \n"
    "                                               \n"
    "uniform mat4 u_model;                           \n"
    "uniform mat4 u_view;                            \n"
    "uniform mat4 u_projection;                      \n"
    "                                               \n"
    "out vec3 v_normal;                        \n"
    "                                               \n"
    "void main()                                   \n"
    "{                                             \n"
    "    gl_Position = u_projection * u_view * u_model * a_position;    \n"
    "    v_normal = mat3(u_model) * a_normal;        \n"
    "}                                             \n";

// Fragment/pixel shader
const GLchar* fragmentSource =
    "#version 300 es \n"
    "precision highp float;                       \n"
    "uniform vec2 u_pointer;                        \n"
    "uniform vec2 u_canvas;                         \n"
    "                                               \n"
    "in vec3 v_normal;                         \n"
    "out vec4 outColor;                        \n"
    "                                               \n"
    "float RADIUS = 100.0;                           \n"
    "float AMBIENT_LIGHT = 0.5;                     \n"
    "float TORCH_STRENGTH = 0.7;                   \n"
    "vec3 lightDirection = vec3(0.0, 0.5, 0.5);    \n"
    "vec4 diffuse = vec4(0.5, 0.8, 0.5, 0.5);      \n"
    "void main()                                  \n"
    "{                                            \n"
    "    vec3 normal = normalize(v_normal);                                 \n"
    "    float light = dot(lightDirection, normal) * .5 + AMBIENT_LIGHT;    \n"
    "                                                                       \n"
    "    // get the normalised pointer position into gl_FragCoord space     \n"
    "    vec2 offsetFromPointer = vec2(gl_FragCoord.x - (u_pointer.x + 1.0) * (u_canvas.x / 2.0),gl_FragCoord.y - (-u_pointer.y - 1.0) * (u_canvas.y / -2.0));\n"
    "    float distanceFromPointer = sqrt(dot(offsetFromPointer, offsetFromPointer));\n"
    "    bool pointerIsActive = !((u_pointer.x == 0.0) && (u_pointer.y == 0.0));\n"
    "    if (pointerIsActive && distanceFromPointer < RADIUS) {                 \n"
    "      float normalizedTorchLight = (RADIUS - distanceFromPointer )  / RADIUS;\n"
    "      light += TORCH_STRENGTH * normalizedTorchLight;                  \n"
    "    }                                                                  \n"
    "    outColor = vec4(diffuse.rgb * light, diffuse.a);               \n"
    "}                                                                      \n";
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
    const GLuint pointerUniformLocation = glGetUniformLocation(shaderProgram, "u_pointer");
    const GLuint canvasUniformLocation = glGetUniformLocation(shaderProgram, "u_canvas");

    return (RenderProgram){
        .shaderProgram = shaderProgram,
        .modelUniformLocation = modelUniformLocation,
        .viewUniformLocation = viewUniformLocation,
        .projectionUniformLocation = projectionUniformLocation,
        .pointerUniformLocation = pointerUniformLocation,
        .canvasUniformLocation = canvasUniformLocation
    }; 
}


