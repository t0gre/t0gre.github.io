#version 300 es

precision highp float;

in vec3 v_normal;


uniform vec4 u_diffuse;
uniform vec3 u_lightDirection;
uniform vec2 u_pointer;
uniform vec2 u_canvas;

out vec4 outColor;

float RADIUS = 100.0;
float AMBIENT_LIGHT = 0.5;
float TORCH_STRENGTH = 0.4;

void main () {
vec3 normal = normalize(v_normal);
float light = dot(u_lightDirection, normal) * .5 + AMBIENT_LIGHT;
// get the normalised pointer position into gl_FragCoord space
vec2 offsetFromPointer = vec2(gl_FragCoord.x - (u_pointer.x + 1.0) * (u_canvas.x / 2.0),gl_FragCoord.y - (-u_pointer.y - 1.0) * (u_canvas.y / -2.0));
float distanceFromPointer = sqrt(dot(offsetFromPointer, offsetFromPointer));
bool pointerIsActive = !((u_pointer.x == 0.0) && (u_pointer.y == 0.0));
if (pointerIsActive && distanceFromPointer < RADIUS) {
    float normalizedTorchLight = (RADIUS - distanceFromPointer )  / RADIUS;
    light += TORCH_STRENGTH * normalizedTorchLight;
}
outColor = vec4(u_diffuse.rgb * light, u_diffuse.a);



}