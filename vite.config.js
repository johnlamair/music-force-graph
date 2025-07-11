import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      verbose: true,        // logs files being compressed
      disable: false,       // enable the plugin
      threshold: 10240,     // only compress files >10kb
      algorithm: 'gzip',    // use gzip compression
      ext: '.gz',           // file extension
    })
  ]
})
