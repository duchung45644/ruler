import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default defineConfig({
  plugins: [WxtVitest()],
  resolve: { conditions: ['browser'] }, // svelte client build, not the SSR one
  test: { environment: 'happy-dom' },
});
