import { defineConfig } from 'vite'
import {resolve} from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// https://cn.vitejs.dev/guide/build.html#multi-page-app
export default defineConfig({
  plugins: [react(), ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  },
})
