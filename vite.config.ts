// import Inspect from  'vite-plugin-inspect'
import { defineConfig} from 'vite'
import { resolve } from 'path'

export default  defineConfig({
    // plugins: [Inspect()],
    assetsInclude: ["shaders/"],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about/index.html'),
                links: resolve(__dirname, 'links/index.html'),
                quotes: resolve(__dirname, 'quotes/index.html'),
                "demo-01-ts-webgl": resolve(__dirname, 'demo-01-ts-webgl/index.html'),
                "demo-02-c-opengl": resolve(__dirname, 'demo-02-c-opengl/index.html'),
                "demo-03-three-js": resolve(__dirname, 'demo-03-three-js/index.html')
            }
        }
    }
    
})