import { Vec4 } from "lib/vec"
import { Material, MaterialSource, createMaterial } from "./shaderUtils"

const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
in vec3 a_normal;

uniform vec3 u_lightWorldPosition;
uniform vec3 u_viewWorldPosition;

uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;

// constyings to pass values to the fragment shader
out vec3 v_normal;
out vec3 v_surfaceToLight;
out vec3 v_surfaceToView;

// all shaders have a main function
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_worldViewProjection * a_position;

  // orient the normals and pass to the fragment shader
  v_normal = mat3(u_worldInverseTranspose) * a_normal;

  // compute the world position of the surfoace
  vec3 surfaceWorldPosition = (u_world * a_position).xyz;

  // compute the vector of the surface to the light
  // and pass it to the fragment shader
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;

  // compute the vector of the surface to the view/camera
  // and pass it to the fragment shader
  v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}
`

const fragmentShaderSource = `#version 300 es

    precision highp float;
    
    // Passed in and constied from the vertex shader.
    in vec3 v_normal;
    in vec3 v_surfaceToLight;
    in vec3 v_surfaceToView;
    
    uniform vec4 u_color;
    uniform float u_shininess;
    uniform vec3 u_lightColor;
    uniform vec3 u_specularColor;
    
    // we need to declare an output for the fragment shader
    out vec4 outColor;
    
    void main() {
      // because v_normal is a constying it's interpolated
      // so it will not be a uint vector. Normalizing it
      // will make it a unit vector again
      vec3 normal = normalize(v_normal);
    
      vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
      vec3 surfaceToViewDirection = normalize(v_surfaceToView);
      vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
    
      // compute the light by taking the dot product
      // of the normal to the light's reverse direction
      float light = dot(normal, surfaceToLightDirection);
      float specular = 0.0;
      if (light > 0.0) {
        specular = pow(dot(normal, halfVector), u_shininess);
      }
    
      outColor = u_color;
    
      // Lets multiply just the color portion (not the alpha)
      // by the light
      outColor.rgb *= light * u_lightColor;
    
      // Just add in the specular
      outColor.rgb += specular * u_specularColor;
    }
    `
const shinyMaterial: MaterialSource = {
        vertexShaderSource,
        fragmentShaderSource,
    }


export type ShinyMaterialExtraUniforms = {
        color: Vec4;
        shininess: number;
    }

type ShinyMaterial = Material & {
    extraUniforms: ShinyMaterialExtraUniforms
}

export function createShinyMaterial(gl: WebGL2RenderingContext, color: Vec4, shininess: number): ShinyMaterial | undefined {
        const baseMaterial =  createMaterial(gl, shinyMaterial)
        if (baseMaterial) {
            return {
                ...baseMaterial,
                extraUniforms: {
                    color,
                    shininess
                }
            }
        } else {
            return undefined
        }
        
    } 
        
