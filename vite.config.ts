import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/gov-freehealth': {
          target: 'https://freehealth.mohp.gov.np',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api\/gov-freehealth/, '/api'),
        },
        '/api/gov-rescue': {
          target: 'https://rescue.opmcm.gov.np',
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api\/gov-rescue/, '/api'),
        },
        '/uploads': {
          target: 'https://rescue.opmcm.gov.np',
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
