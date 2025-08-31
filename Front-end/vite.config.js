import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',                 // make sure it treats Front-end as root
  publicDir: 'public',       // keep public as is
  build: {
    outDir: 'dist',          // ✅ ensure dist is used
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html') // ✅ ensure correct entry
    }
  }
})
