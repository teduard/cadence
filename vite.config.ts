import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/cadence/',
  plugins: [react()],
  optimizeDeps: {
    include: ['monaco-editor/esm/vs/language/json/json.worker'],
  },
  worker: {
    format: 'es'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['monaco-editor'],
        }
      }
    }
  }
})
