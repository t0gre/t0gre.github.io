
#include <SDL.h>
#include <GLES3/gl3.h>
#include <stdbool.h>

#include "events.h"
#include "mat4.h"


Vec2 normalizeMousePosition(Vec2 mouse_position, Vec2 canvas_dims)
{
  float x_norm = mouse_position.x / canvas_dims.x * 2.0 - 1.0;
  float y_norm = mouse_position.y / canvas_dims.y * -2.0 + 1.0;

  return (Vec2){
    .x = x_norm,
    .y = y_norm,
  };
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

                    state->camera.aspect = (float)width / (float)height;
                    
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
                    
                    // state->scene.models[0].rotation.y += e->xrel / 100.f;
                    state->scene.nodes->array[0].local_transform = m4yRotate(state->scene.nodes->array[0].local_transform, e->xrel / 100.f);
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
                    Vec2 pointer_position ={ .x = 0, .y = 0 } ;
                    state->input.pointer_position = pointer_position;
                }
                break;
            }
        }

        
    }
}
