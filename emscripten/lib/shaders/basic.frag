    #version 300 es 
    precision highp float;                                                                     
    uniform vec3 u_color; 
    uniform vec3 u_view_position;  

    struct AmbientLight {
      vec3 color;
    };

    struct DirectionalLight {
      vec3 color;
      vec3 rotation;
      vec3 specular_color;
    };

    uniform AmbientLight u_ambient_light;
    uniform DirectionalLight u_directional_light;                     
                                                  
    in vec3 v_normal;     
    in vec3 frag_world_position;                    
    out vec4 outColor;                        
   
    float shininess = 1.0;

    void main()                                  
    {                

        vec3 normal = normalize(v_normal);  

        // ambient
        vec3 ambient_color = u_ambient_light.color * u_color;                           

        // directional     
        vec3 light_direction = normalize(-u_directional_light.rotation);                  
        float directional_light_diff = max(dot(light_direction, normal), 0.0);   
        vec3 directional_light_color = u_directional_light.color * directional_light_diff * u_color;

        // specular
        vec3 viewDir = normalize(u_view_position - frag_world_position);
        vec3 reflectDir = reflect(-light_direction, normal);  
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
        vec3 specular_light_color = u_directional_light.specular_color * spec * u_color; 
                                                                                                                                     
        outColor = vec4(directional_light_color + ambient_color + specular_light_color, 1.0);               
    }