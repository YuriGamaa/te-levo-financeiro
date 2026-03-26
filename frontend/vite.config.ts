import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // ESSA LINHA ABAIXO É A SOLUÇÃO DEFINITIVA
  base: './', 
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        // Alvo para desenvolvimento local no Windows
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Garante que o build limpe a pasta antes de gerar uma nova
    emptyOutDir: true,
  }
});