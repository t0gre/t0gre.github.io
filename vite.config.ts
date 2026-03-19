// import Inspect from   'vite-plugin-inspect'
import { defineConfig} from 'vite'
import { resolve } from 'path'
import wasm from 'vite-plugin-wasm';


export default  defineConfig({
    plugins: [wasm()],
    assetsInclude: ["shaders/"],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about/index.html'),
                "demo-01-ts-webgl": resolve(__dirname, 'demo-01-ts-webgl/index.html'),
                "demo-03-three-js": resolve(__dirname, 'demo-03-three-js/index.html'),
                "demo-04-three-jolt": resolve(__dirname, 'demo-04-three-jolt/index.html')
            }
        }
    }
    
})