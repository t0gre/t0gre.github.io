    #version 300 es 
    precision highp float;                                              
    uniform vec2 u_canvas;                        
    uniform vec4 u_color; 
    uniform vec3 u_view_position;                        
                                                  
    in vec3 v_normal;     
    in vec3 frag_world_position;                    
    out vec4 outColor;                        

    struct AmbientLight {
      vec3 color;
    };

    struct DirectionalLight {
      vec3 color;
      vec3 rotation;
      vec3 specular_color;
    };


    AmbientLight AMBIENT_LIGHT = AmbientLight(vec3(0.5, 0.3, 0.3));
  
    DirectionalLight directional_light = DirectionalLight(
      vec3(0.8, 0.8, 0.5), 
      vec3(0.0, -0.8, -0.5),
      vec3(0.9, 0.1, 0.1) 
    );
   
    float shininess = 1.0;

    void main()                                  
    {                

        vec3 normal = normalize(v_normal);  

        // ambient
        vec3 ambient_color = AMBIENT_LIGHT.color * u_color.rbg;                           

        // directional     
        vec3 light_direction = normalize(-directional_light.rotation);                  
        float directional_light_diff = max(dot(light_direction, normal), 0.0);   
        vec3 directional_light_color = directional_light.color * directional_light_diff * u_color.rgb;

        // specular
        vec3 viewDir = normalize(u_view_position - frag_world_position);
        vec3 reflectDir = reflect(-light_direction, normal);  
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
        vec3 specular_light_color = directional_light.specular_color * spec * u_color.rgb; 
                                                                                                                                     
        outColor = vec4(directional_light_color + ambient_color + specular_light_color, u_color.a);               
    }