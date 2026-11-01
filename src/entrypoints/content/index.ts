import { mount, unmount } from 'svelte';
import { createShadowRootUi, defineContentScript } from '#imports';
import Smoke from './Smoke.svelte';
import './style.css';

// ponytail: UI thử của Đợt 0 — Đợt 1 thay bằng dock + vòng đời thật
export default defineContentScript({
  registration: 'runtime',
  cssInjectionMode: 'ui',
  async main(ctx) {
    const existing = document.querySelector('bo-doi-ui');
    if (existing) {
      existing.remove();
      return;
    }
    const ui = await createShadowRootUi(ctx, {
      name: 'bo-doi-ui',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => mount(Smoke, { target: container }),
      onRemove: (app) => app && unmount(app),
    });
    ui.mount();
  },
});
