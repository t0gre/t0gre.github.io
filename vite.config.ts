// import Inspect from  'vite-plugin-inspect'
import { defineConfig} from 'vite'
import { resolve } from 'path'

export default  defineConfig({
    // plugins: [Inspect()],
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about/index.html'),
                emscripten: resolve(__dirname, 'emscripten/index.html')
            }
        }
    }
    
})