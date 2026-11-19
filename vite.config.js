import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '^/reports/(?!payrolls(?:/|$))[^/]+/item/': 'http://localhost:8000',
      '^/reports/payrolls/[^/]+/export$': 'http://localhost:8000'
    }
  }
});
