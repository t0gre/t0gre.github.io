## Makefile

Although this part of the project uses a makefile, it doesn't use any actual features of make. It could be just a series of shell scripts, one for each command.

## Compiler

Currently, the native code is only tested with clang on linux. The make build command sets the build up for dynamic linking to SDL2, not static, so you will need SDL2 installed locally for it to run.


### to generate debug symbols for the browser
add `-O0 -g -gsource-map` to the `make build-en` command


## activate emscripen

`make setup-emsdk`