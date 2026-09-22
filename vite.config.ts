import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/live': {
        target: 'https://bomachauth.bgbot.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/live/, ''),
      },
      '/api': {
        target: 'https://bomachauthtest.bgbot.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
