import { elementCaptureRect, isFullyVisible } from '../../../lib/capture';
import { sendToBackground } from '../../../lib/messaging';
import { hideUi } from '../../core/session';
import { state } from '../../core/state.svelte';
import { openCaptureEditor } from './editor';
import { flash, settle } from './session';

/**
 * Selected-element capture, after saveScreenshot (legacy-src/content.js:46700). Unlike legacy
 * (+50px, highlight kept), the owner wants only the element: all our UI hidden, cropped to its box.
 */
export async function captureElement(el: Element): Promise<void> {
  state.capturing = true;
  const x0 = scrollX,
    y0 = scrollY;
  let opened = false;
  try {
    if (!isFullyVisible(el.getBoundingClientRect(), innerWidth, innerHeight)) {
      try {
        el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
      } catch {
        el.scrollIntoView();
      }
    }
    hideUi('all');
    await settle();
    const r = await sendToBackground(
      'capture_tab',
      elementCaptureRect(
        [el.getBoundingClientRect()],
        innerWidth,
        innerHeight,
        devicePixelRatio || 1,
        0,
      ),
    ).catch(() => null);
    if (!r?.success || !state.capturing) return;
    await openCaptureEditor(r.dataUrl);
    opened = state.capturing;
    if (opened) flash();
  } finally {
    if (!opened) {
      hideUi(null);
      state.capturing = false;
      if (scrollX !== x0 || scrollY !== y0) scrollTo({ left: x0, top: y0, behavior: 'instant' });
    }
  }
}
