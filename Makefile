build-native:
	gcc -o native -ggdb -std=c11 index.c lib/camera.c lib/mat4.c lib/vec.c -I/usr/include/SDL2 -D_REENTRANT -lSDL2 -lGL -lm -lGLESv2

build-en:
	emcc -std=c11 index.c lib/camera.c lib/mat4.c lib/vec.c -s USE_SDL=2 -s FULL_ES3=1 -s WASM=1 --preload-file ../public/rainbowtree.obj@rainbowtree.obj --preload-file positions.txt --preload-file normals.txt

clean:
	rm a.out.data a.out.js a.out.wasm native
