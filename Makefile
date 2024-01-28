build:
	emcc -std=c11 index.c -s USE_SDL=2 -s USE_SDL_IMAGE=2 -s SDL2_IMAGE_FORMATS="[""png""]" -s FULL_ES2=1 -s WASM=1 --preload-file media/texmap.png

clean:
	rm a.out.data a.out.js a.out.wasm
