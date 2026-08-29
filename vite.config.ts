import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,   // listen on 0.0.0.0 so your phone can reach it via LAN IP
    port: 5173,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Ensure @import "tailwindcss" in CSS resolves to the v4 copy
      // bundled inside @tailwindcss/vite (not the v3 root install)
      'tailwindcss': resolve(__dirname, './node_modules/@tailwindcss/vite/node_modules/tailwindcss'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
            return 'animations';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
