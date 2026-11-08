import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default defineConfig({
  plugins: [WxtVitest(), svelte()],
  resolve: { conditions: ['browser'] }, // svelte client build, not the SSR one
  test: { environment: 'happy-dom', setupFiles: ['src/test-setup.ts'] },
});
