/** Frames of pages that refuse embedding (8.15; Q4): detection and the grant flow. */
import { sendToBackground, sendToSidePanel } from '../../lib/ext/messaging';

/** After `load`, a frame with no `ready_for_state_sync` by then is checked for a block. */
export const BLOCK_CHECK_MS = 1_500;

/** What the parent can see of a frame's document. */
export type DocAccess = 'unreadable' | 'blank' | 'page';

/** Overlay: none, the grant link, or "still blocked" once headers are already stripped. */
export type Blocked = null | 'grant' | 'still';

/** Cross-origin (error pages included) throws or gives null: not readable. */
export function readDoc(iframe: HTMLIFrameElement): DocAccess {
  try {
    const doc = iframe.contentDocument;
    if (!doc) return 'unreadable';
    const href = doc.location?.href ?? '';
    return href === '' || href === 'about:blank' ? 'blank' : 'page';
  } catch {
    return 'unreadable';
  }
}

/**
 * Pure decision: a frame that is not ready and whose document is unreachable or blank is blocked;
 * with the header rule already active nothing more can be stripped (`still`).
 */
export function blockedState(ready: boolean, doc: DocAccess, headerRule: boolean): Blocked {
  if (ready || doc === 'page') return null;
  return headerRule ? 'still' : 'grant';
}

const PANEL_TRIES = 15;
const PANEL_GAP_MS = 200;

/**
 * Grant link (Q4): open the side panel, then point it at its host-permission button. The panel
 * may still be loading, so `show_host_grant` is retried until one answers.
 */
export async function requestHostGrant(gap = PANEL_GAP_MS): Promise<boolean> {
  await sendToBackground('open_side_panel').catch(() => {});
  for (let i = 0; i < PANEL_TRIES; i++) {
    if (await sendToSidePanel('show_host_grant').catch(() => undefined)) return true;
    await new Promise((r) => setTimeout(r, gap));
  }
  return false;
}
