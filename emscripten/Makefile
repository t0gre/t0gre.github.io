# build-native:
# 	gcc -o native -ggdb -std=c11 index.c lib/camera.c lib/mat4.c lib/vec.c -I/usr/include/SDL2 -D_REENTRANT -lSDL2 -lGL -lm -lGLESv2

setup-emsdk:
	cd emsdk && ./emsdk install 3.1.54 && ./emsdk activate 3.1.54 && source ./emsdk_env.sh

build-en:
	emcc -std=c11 index.c lib/*.c -Ilib/include \
	-s MAX_WEBGL_VERSION=2 \
	-s USE_SDL=2 \
	-s FULL_ES3=1 \
	-s WASM=1 \
	--preload-file ../public/rainbowtree.obj@rainbowtree.obj \
	--preload-file positions.txt \
	--preload-file normals.txt \
	--preload-file ./lib/shaders/basic.vert@basic.vert \
	--preload-file ./lib/shaders/basic.frag@basic.frag

clean:
	rm a.out.data a.out.js a.out.wasm
	rm a.out.wasm.map
