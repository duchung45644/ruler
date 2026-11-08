import Palette from '@lucide/svelte/icons/palette';
import { scanStyles, type AuditRow } from '../../../lib/tools/audit';
import { mountInShadow } from '../../../ui/mount';
import { ownNodes } from '../../core/events';
import { addPainter, draw, layer, requestPaint, visibleRects } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';
import AuditPanel from './AuditPanel.svelte';

/** Page colors, fonts & spacing (3.19 / 3.20), port of unpacked/scripts/bd/audit.js.
 * Plain object on purpose: element sets must not become Svelte proxies. */
export type AuditTab = 'colors' | 'fonts' | 'spacing';
export const audit = {
  rows: { colors: [], fonts: [], spacing: [] } as Record<AuditTab, AuditRow[]>,
  highlights: [] as Element[],
};
let unmountPanel: (() => void) | null = null;

const isOwn = (el: Element) => el.localName === 'iodob-ui' || ownNodes.has(el);

export function rescan(): void {
  audit.rows = scanStyles(document.documentElement, isOwn);
  highlight(null);
}

/** Highlights up to 400 elements of `row` and scrolls the first into view; null clears. */
export function highlight(row: AuditRow | null): void {
  audit.highlights = row ? [...row.els].slice(0, 400) : [];
  audit.highlights[0]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  requestPaint();
}

export function setOn(next: boolean): void {
  state.auditOn = next;
  if (next) {
    rescan();
    const shadow = layer.getRootNode();
    if (shadow instanceof ShadowRoot && !unmountPanel)
      unmountPanel = mountInShadow(shadow, AuditPanel);
  } else {
    unmountPanel?.();
    unmountPanel = null;
    highlight(null);
  }
}

export function initAudit(): void {
  registerItem({
    id: 'audit',
    icon: Palette,
    label: 'dock.audit',
    key: 'a',
    group: 'designTools',
    run: () => setOn(!state.auditOn),
    isActive: () => state.auditOn,
  });
  onStop(() => setOn(false));
  window.addEventListener('scroll', requestPaint, {
    signal: sessionSignal(),
    passive: true,
    capture: true,
  });
  addPainter('audit', (box) => {
    if (state.paused) return;
    const frag = document.createDocumentFragment();
    for (const r of visibleRects(audit.highlights)) {
      if (!r || r.width === 0) continue;
      draw(
        frag,
        `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;outline:2px solid #7C4DFF;background:rgba(124,77,255,.12)`,
      );
    }
    box.append(frag);
  });
}
