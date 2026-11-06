import { defineContentScript } from '#imports';
import { startSession, stopSession } from '../../content/core/session';
import { state } from '../../content/core/state.svelte';
import { initInspector } from '../../content/tools/inspector';
import { editHandlers } from '../../content/edit';
import { sidePanelHandlers } from '../../content/sidepanel';
import { mcpHandlers } from '../../content/mcp';
import { initTools } from '../../content/tools';
import { isResponsiveFrame, startFrameMode } from '../../content/responsive/frame-mode';
import { exitResponsive, onFramesUnblocked } from '../../content/responsive';
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
    const inFrame = isResponsiveFrame();
    if (window.__BO_DOI__ && !inFrame) return; // 9.20: injected twice; background talks to the first via toggle_script
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
      ...editHandlers,
      ...mcpHandlers,
      ping: () => ({ active: state.active }),
      save_screenshot: () => (state.active ? openBar() : undefined),
      start_frame_mode: () => {
        if (isResponsiveFrame()) startFrameMode();
      },
      reload_frames: () => onFramesUnblocked(),
      toggle_script: async () => {
        if (state.active) {
          if (state.responsiveOn) await exitResponsive(); // quit / icon while responsive: exit first (9.40)
          stopSession();
        } else await start();
        return { active: state.active };
      },
    });
    if (inFrame) state.inFrame = true; // before start: no dock, no side panel bridge
    await start();
    if (inFrame) startFrameMode();
  },
});
