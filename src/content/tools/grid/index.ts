import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
import { getSettings, updateSettings, type LayoutGrid } from '../../../lib/ext/settings';
import { addPainter, draw, requestPaint } from '../../core/overlay';
import { registerItem, togglePopover } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';
import { forwardSetting } from '../../responsive/forward';
import GridPopover from './GridPopover.svelte';

/** Port of updateMaxWidth (legacy-src/content.js:42695). */
export function parseMaxWidth(v: string): 'auto' | number {
  const n = parseInt(v);
  return isNaN(n) || n <= 0 ? 'auto' : n;
}

/** Merge, persist the whole layoutGrid (settings merge shallowly), repaint. */
export function setGrid(patch: Partial<LayoutGrid>): void {
  Object.assign(state.grid, patch);
  forwardSetting('layoutGrid', patch); // responsive parent: the frames draw it
  if (!state.inFrame) void updateSettings({ layoutGrid: { ...state.grid } });
  requestPaint();
}

export async function initGrid(): Promise<void> {
  registerItem({
    id: 'grid',
    forward: true,
    icon: LayoutGridIcon,
    label: 'dock.grid',
    key: 'g',
    group: 'inspectTools',
    popover: GridPopover,
    run: () => togglePopover('grid'),
    runKey: () => setGrid({ isOn: !state.grid.isOn }), // 3.03
    isActive: () => state.grid.isOn,
  });
  const signal = sessionSignal();
  onStop(() => (state.grid.isOn = false)); // not persisted: next session restores it (1.43)
  // 3.04, port of toggleGrid (legacy-src/content.js:42389)
  addPainter('grid', (box) => {
    const g = state.grid;
    if (!g.isOn) return;
    const maxWidth = g.maxWidth === 'auto' ? 'none' : `${g.maxWidth}px`;
    const root = draw(
      box,
      `position:fixed;inset:0;margin:auto;display:grid;grid-template-columns:repeat(${g.columns},1fr);gap:${g.gutter}px;padding-inline:${g.margin}px;box-sizing:border-box;width:100%;max-width:${maxWidth};opacity:${g.opacity}`,
    );
    for (let i = 0; i < g.columns; i++)
      draw(root, `position:static;height:100%;background:${g.color}`);
  });
  const { layoutGrid } = await getSettings();
  if (signal.aborted || state.inFrame) return; // a frame takes the grid from ready_ack
  Object.assign(state.grid, layoutGrid);
  requestPaint();
}
