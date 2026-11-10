import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// Static site for GitHub Pages: relative base works under /<repo>/ and on a custom domain.
export default defineConfig({
  base: './',
  plugins: [svelte(), tailwindcss()],
  build: { rollupOptions: { input: { main: 'index.html', privacy: 'privacy.html' } } },
});
