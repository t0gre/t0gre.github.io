    #version 300 es 
    precision highp float;  

    uniform vec3 u_view_position; 

    struct Material {
      vec3 color;
      vec3 specular_color;
      float shininess;
    };

    uniform Material u_material;
     
    struct AmbientLight {
      vec3 color;
    };

    struct DirectionalLight {
      vec3 color;
      vec3 rotation;
    };

    struct PointLight {
      vec3 color;
      vec3 position;
      float constant;
      float linear;
      float quadratic;
    };

    struct LightColorComponents {
      vec3 diffuse;
      vec3 specular;
    };

    uniform AmbientLight u_ambient_light;
    uniform DirectionalLight u_directional_light; 
    uniform PointLight u_point_light;                    
                                                  
    in vec3 v_normal;     
    in vec3 frag_world_position;                    
    out vec4 outColor;                        

    LightColorComponents calculateLightComponents(
      vec3 light_color, 
      vec3 light_direction,
      vec3 view_dir,
      vec3 normal) {    

        // diffuse
        float light_diff = max(dot(light_direction, normal), 0.0);   
        vec3 diffuse_color_component = light_color * light_diff * u_material.color;

        // specular
        vec3 reflect_dir = reflect(-light_direction, normal);  
        float spec = pow(max(dot(view_dir, reflect_dir), 0.0), u_material.shininess);
        vec3 specular_color_component = u_material.specular_color * spec * u_material.color;

        return LightColorComponents(diffuse_color_component, specular_color_component);

    }

    void main()                                  
    {                

        vec3 normal = normalize(v_normal);  
        vec3 view_dir = normalize(u_view_position - frag_world_position);

        // ambient
        vec3 ambient_color = u_ambient_light.color * u_material.color;                           

        LightColorComponents directional_components = calculateLightComponents(
          u_directional_light.color,
          normalize(-u_directional_light.rotation),
          view_dir,
          normal
        );

        LightColorComponents point_components = calculateLightComponents(
          u_point_light.color,
          normalize(u_point_light.position - frag_world_position),
          view_dir,
          normal
        );

        // point light attenuation
        float distance    = length(u_point_light.position - frag_world_position);
        float attenuation = 1.0 / (u_point_light.constant + u_point_light.linear * distance + u_point_light.quadratic * (distance * distance));  
        point_components.diffuse *= attenuation;
        point_components.specular *= attenuation;
                                                                                                                                     
        outColor = vec4(ambient_color 
                      + directional_components.diffuse
                      + directional_components.specular
                      + point_components.diffuse
                      + point_components.specular, 
                      1.0);               
    }