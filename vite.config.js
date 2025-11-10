import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // ✅ Polyfills para react-pdf
      'buffer': 'buffer/',
      'process': 'process/browser',
      'stream': 'stream-browserify',
      'util': 'util/'
    }
  },
  
  define: {
    // ✅ Definir variables globales necesarias
    'process.env': {},
    'global': 'globalThis',
    'process': {
      env: {},
      version: '',
      browser: true
    }
  },
  
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    },
    // ✅ Incluir polyfills en optimización
    include: ['buffer', 'process']
  }
})