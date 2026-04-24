import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'tf': ['@tensorflow/tfjs', '@tensorflow-models/coco-ssd'],
          'charts': ['recharts'],
          'router': ['react-router-dom'],
        },
      },
    },
  },
})
