build-native:
	gcc -o native -ggdb -std=c11 index.c lib/camera.c lib/mat4.c lib/vec.c -I/usr/include/SDL2 -D_REENTRANT -lSDL2 -lGL -lm -lGLESv2

build-en:
	emcc -std=c11 index.c lib/camera.c lib/mat4.c lib/vec.c -s USE_SDL=2 -s USE_SDL_IMAGE=2 -s SDL2_IMAGE_FORMATS="[""png""]" -s FULL_ES2=1 -s WASM=1 --preload-file media/texmap.png

clean:
	rm a.out.data a.out.js a.out.wasm native
