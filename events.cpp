//
// Window and input event handling
//
#include <algorithm>
#include <SDL.h>
#include <SDL_opengles2.h>
#include "events.h"

// #define EVENTS_DEBUG


WindowState EventHandler::initWindow(const char* title)
{
    // Create SDL window
    SDL_Window* mpWindow = SDL_CreateWindow(title, 
                         SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
                          480, 640, 
                         SDL_WINDOW_OPENGL | SDL_WINDOW_RESIZABLE| SDL_WINDOW_SHOWN);
    Uint32 mWindowID = SDL_GetWindowID(mpWindow);

    // Create OpenGLES 2 context on SDL window
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MAJOR_VERSION, 2);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_MINOR_VERSION, 0);
    SDL_GL_SetSwapInterval(1);
    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);
    SDL_GLContext glc = SDL_GL_CreateContext(mpWindow);

    // Set clear color to black
    glClearColor(0.0f, 0.0f, 0.0f, 1.0f);

    // Initialize viewport
    glViewport(0,0 ,480, 640);
    return {
        mpWindow, 
        mWindowID
        };
}

// void EventHandler::swapWindow()
// {
//     SDL_GL_SwapWindow(mpWindow);
// }

// void EventHandler::zoomEventMouse(bool mouseWheelDown, int x, int y)
// {                
//     float preZoomWorldX, preZoomWorldY;
//     mCamera.windowToWorldCoords(mMousePositionX, mMousePositionY, preZoomWorldX, preZoomWorldY);

//     // Zoom by scaling up/down in 0.05 increments 
//     float zoomDelta = mouseWheelDown ? -cMouseWheelZoomDelta : cMouseWheelZoomDelta;
//     mCamera.setZoomDelta(zoomDelta);

//     // Zoom to point: Keep the world coords under mouse position the same before and after the zoom
//     float postZoomWorldX, postZoomWorldY;
//     mCamera.windowToWorldCoords(mMousePositionX, mMousePositionY, postZoomWorldX, postZoomWorldY);
//     Vec2 deltaWorld = { postZoomWorldX - preZoomWorldX, postZoomWorldY - preZoomWorldY };
//     mCamera.setPanDelta (deltaWorld);
// }

// void EventHandler::zoomEventPinch (float pinchDist, float pinchX, float pinchY)
// {
//     float preZoomWorldX, preZoomWorldY;
//     mCamera.normWindowToWorldCoords(pinchX, pinchY, preZoomWorldX, preZoomWorldY);

//     // Zoom in/out by positive/negative mPinch distance
//     float zoomDelta = pinchDist * cPinchScale;
//     mCamera.setZoomDelta(zoomDelta);

//     // Zoom to point: Keep the world coords under pinch position the same before and after the zoom
//     float postZoomWorldX, postZoomWorldY;
//     mCamera.normWindowToWorldCoords(pinchX, pinchY, postZoomWorldX, postZoomWorldY);
//     Vec2 deltaWorld = { postZoomWorldX - preZoomWorldX, postZoomWorldY - preZoomWorldY };
//     mCamera.setPanDelta (deltaWorld);
// }

// void EventHandler::panEventMouse(int x, int y)
// { 
//      int deltaX = mCamera.windowSize().width / 2 + (x - mMouseButtonDownX),
//          deltaY = mCamera.windowSize().height / 2 + (y - mMouseButtonDownY);

//     float deviceX, deviceY;
//     mCamera.windowToDeviceCoords(deltaX,  deltaY, deviceX, deviceY);

//     Vec2 pan = { mCamera.basePan().x + deviceX / mCamera.zoom(), 
//                  mCamera.basePan().y + deviceY / mCamera.zoom() / mCamera.aspect() };
//     mCamera.setPan(pan);
// }

// void EventHandler::panEventFinger(float x, float y)
// { 
//     float deltaX = 0.5f + (x - mFingerDownX),
//           deltaY = 0.5f + (y - mFingerDownY);

//     float deviceX, deviceY;
//     mCamera.normWindowToDeviceCoords(deltaX,  deltaY, deviceX, deviceY);

//     Vec2 pan = { mCamera.basePan().x + deviceX / mCamera.zoom(), 
//                  mCamera.basePan().y + deviceY / mCamera.zoom() / mCamera.aspect() };
//     mCamera.setPan(pan);
// }

