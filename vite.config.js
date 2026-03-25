import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // PWA service worker is registered separately via public/sw.js
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
