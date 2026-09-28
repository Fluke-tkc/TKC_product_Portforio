import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
  base: '/',
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  }
})