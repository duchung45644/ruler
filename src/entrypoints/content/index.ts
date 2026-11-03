import { defineContentScript } from '#imports';
import { startSession, stopSession } from '../../content/core/session';
import { state } from '../../content/core/state.svelte';
import { initInspector } from '../../content/tools/inspector';
import { sidePanelHandlers } from '../../content/sidepanel';
import { initTools } from '../../content/tools';
import { openBar } from '../../content/tools/capture';
import { handleMessages } from '../../lib/messaging';
import { loadFonts } from '../../ui/fonts';
import './style.css';

declare global {
  interface Window {
    __BO_DOI__?: boolean;
  }
}

export default defineContentScript({
  registration: 'runtime',
  cssInjectionMode: 'ui',
  async main(ctx) {
    if (window.__BO_DOI__) return; // 9.20: injected twice; background talks to the first via toggle_script
    window.__BO_DOI__ = true;
    // extension reload/update: old context dies, isolated world survives; let the re-injection take over
    ctx.onInvalidated(() => {
      stopSession();
      delete window.__BO_DOI__;
    });
    const start = async () => {
      await startSession(ctx);
      if (!state.active) return;
      await initTools();
      await initInspector();
    };
    loadFonts();
    handleMessages('content', {
      ...sidePanelHandlers,
      ping: () => ({ active: state.active }),
      save_screenshot: () => (state.active ? openBar() : undefined),
      toggle_script: async () => {
        if (state.active) stopSession();
        else await start();
        return { active: state.active };
      },
    });
    await start();
  },
});
