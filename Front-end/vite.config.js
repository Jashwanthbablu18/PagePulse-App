// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build the React app directly into ./public so Express can serve it.
// Also proxy /api calls to the Node server during local dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'public',   // Express serves this in production
    emptyOutDir: true
  }
})
