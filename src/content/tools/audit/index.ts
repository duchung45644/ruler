import Palette from '@lucide/svelte/icons/palette';
import { scanStyles, type AuditRow } from '../../../lib/tools/audit';
import { panelToggle } from '../../../ui/mount';
import { ownNodes } from '../../core/events';
import { addPainter, drawBoxes, requestPaint } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { onStop } from '../../core/session';
import { state } from '../../core/state.svelte';
import AuditPanel from './AuditPanel.svelte';

/** Page colors, fonts & spacing (3.19 / 3.20), port of unpacked/scripts/bd/audit.js.
 * Plain object on purpose: element sets must not become Svelte proxies. */
export type AuditTab = 'colors' | 'fonts' | 'spacing';
export const audit = {
  rows: { colors: [], fonts: [], spacing: [] } as Record<AuditTab, AuditRow[]>,
  highlights: [] as Element[],
};

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

const showPanel = panelToggle(AuditPanel);

export function setOn(next: boolean): void {
  state.auditOn = next;
  if (next) rescan();
  else highlight(null);
  showPanel(next);
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
  addPainter('audit', (box) => {
    if (state.paused) return;
    drawBoxes(box, audit.highlights, (_, r) =>
      r.width ? 'outline:2px solid #7C4DFF;background:rgba(124,77,255,.12)' : null,
    );
  });
}
