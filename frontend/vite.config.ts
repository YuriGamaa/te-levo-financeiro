import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Host 0.0.0.0 permite acesso externo na rede local, se necessário
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        // Voltando para o alvo padrão do Artisan no Windows/Linux local
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // Removemos o host.docker.internal se o senhor não estiver usando 
        // o Vite de dentro de um container Docker agora.
      },
    },
  },
});