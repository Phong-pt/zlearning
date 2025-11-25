import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages - must match your repo name
  base: process.env.GITHUB_ACTIONS ? '/APP_HOC_TU_VUNG/' : '/',
  build: {
    outDir: 'dist',
    // Use esbuild (default, faster than terser)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
        },
      },
    },
  },
})
