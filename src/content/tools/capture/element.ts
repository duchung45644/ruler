import { elementCaptureRect, isFullyVisible } from '../../../lib/capture/capture';
import type { Edges } from '../../../lib/responsive/capture-rect';
import { sendToBackground } from '../../../lib/ext/messaging';
import { hideUi } from '../../core/session';
import { state } from '../../core/state.svelte';
import { frameSelectionRect } from '../../responsive/shell.svelte';
import { openCaptureEditor } from './editor';
import { flash, settle } from './session';

/** Hide our UI, grab the tab cropped to `rect()` (viewport CSS px) and open the editor. */
async function grabRect(rect: () => Edges | null, after: () => void = () => {}): Promise<void> {
  let opened = false;
  try {
    hideUi('all');
    await settle();
    const r0 = rect();
    if (!r0) return;
    const r = await sendToBackground(
      'capture_tab',
      elementCaptureRect([r0], innerWidth, innerHeight, devicePixelRatio || 1, 0),
    ).catch(() => null);
    if (!r?.success || !state.capturing) return;
    await openCaptureEditor(r.dataUrl, false, null, 32); // a bare element looks lost: framed by default
    opened = state.capturing;
    if (opened) flash();
  } finally {
    if (!opened) {
      hideUi(null);
      state.capturing = false;
      after();
    }
  }
}

/**
 * Selected-element capture, after saveScreenshot (legacy-src/content.js:46700). Unlike legacy
 * (+50px, highlight kept), the owner wants only the element: all our UI hidden, cropped to its box.
 */
export async function captureElement(el: Element): Promise<void> {
  state.capturing = true;
  const x0 = scrollX,
    y0 = scrollY;
  if (!isFullyVisible(el.getBoundingClientRect(), innerWidth, innerHeight)) {
    try {
      el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });
    } catch {
      el.scrollIntoView();
    }
  }
  await grabRect(
    () => el.getBoundingClientRect(),
    () => {
      if (scrollX !== x0 || scrollY !== y0) scrollTo({ left: x0, top: y0, behavior: 'instant' });
    },
  );
}

/** Responsive (Q6): the selected element lives in a frame; the parent grabs and crops to it. */
export async function captureFrameElement(): Promise<void> {
  state.capturing = true;
  const rect = await frameSelectionRect().catch(() => null);
  if (!state.capturing) return;
  await grabRect(() => rect);
}
