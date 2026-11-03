import { elementCaptureRect, isFullyVisible } from '../../../lib/capture';
import { sendToBackground } from '../../../lib/messaging';
import { includeHighlights, screenshotPrefs } from '../../../lib/settings';
import { layer } from '../../core/overlay';
import { hideUi } from '../../core/session';
import { state } from '../../core/state.svelte';
import { openCaptureEditor } from './editor';
import { flash, settle } from './session';

/** Selected-element capture, port of saveScreenshot (legacy-src/content.js:46700). */
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
    // includePadding is not sent: legacy sent it and the background ignored it
    const keep = includeHighlights(await screenshotPrefs.getValue());
    hideUi(keep ? 'keepHighlight' : 'all');
    await settle();
    const rects = [el.getBoundingClientRect()];
    if (keep)
      for (const n of layer.querySelectorAll('[data-painter="inspector"] *'))
        rects.push(n.getBoundingClientRect());
    const r = await sendToBackground(
      'capture_tab',
      elementCaptureRect(rects, innerWidth, innerHeight, devicePixelRatio || 1),
    ).catch(() => null);
    if (!r?.success || !state.capturing) return;
    hideUi('all');
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
