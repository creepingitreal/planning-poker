import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import svgLoader from 'vite-svg-loader';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    tailwindcss(),
    svgLoader()
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    }
  }
})
