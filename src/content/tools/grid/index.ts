import LayoutGridIcon from '@lucide/svelte/icons/layout-grid';
import { getSettings, updateSettings, type LayoutGrid } from '../../../lib/ext/settings';
import { addPainter, draw, requestPaint } from '../../core/overlay';
import { registerItem } from '../../core/registry.svelte';
import { onStop, sessionSignal } from '../../core/session';
import { state } from '../../core/state.svelte';
import { forwardSetting } from '../../responsive/forward';
import { panelToggle } from '../../../ui/mount';
import GridPanel from './GridPanel.svelte';

/** Port of updateMaxWidth (legacy-src/content.js:42695). */
export function parseMaxWidth(v: string): 'auto' | number {
  const n = parseInt(v);
  return isNaN(n) || n <= 0 ? 'auto' : n;
}

/** Saving waits for a pause: a dragged slider or colour must not write storage every frame. */
const SAVE_DELAY = 300;
let saveTimer = 0;
function saveNow(): void {
  clearTimeout(saveTimer);
  saveTimer = 0;
  void updateSettings({ layoutGrid: { ...state.grid } });
}

/** Merge, repaint now, persist the whole layoutGrid shortly after (settings merge shallowly). */
export function setGrid(patch: Partial<LayoutGrid>): void {
  Object.assign(state.grid, patch);
  forwardSetting('layoutGrid', patch); // responsive parent: the frames draw it
  requestPaint();
  if (state.inFrame) return;
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveNow, SAVE_DELAY);
}

const showPanel = panelToggle(GridPanel);
let panelOpen = false;

export function openGrid(): void {
  setGrid({ isOn: true });
  panelOpen = true;
  showPanel(true);
}

/** Grid off and its panel closed (the panel's X, the dock button, key G). */
export function closeGrid(): void {
  setGrid({ isOn: false });
  panelOpen = false;
  showPanel(false);
}

export async function initGrid(): Promise<void> {
  registerItem({
    id: 'grid',
    forward: true,
    icon: LayoutGridIcon,
    label: 'dock.grid',
    key: '4',
    // the button is the switch: on -> grid + settings panel (top right, like the other tools);
    // off -> both go. Settings you can't see are useless, so the panel comes with the grid.
    run: () => (panelOpen ? closeGrid() : openGrid()),
    runKey: () => (state.grid.isOn ? closeGrid() : setGrid({ isOn: true })), // 3.03: no panel
    isActive: () => state.grid.isOn,
  });
  const signal = sessionSignal();
  onStop(() => {
    if (saveTimer) saveNow(); // a pending edit is not lost
    panelOpen = false;
    showPanel(false);
    state.grid.isOn = false; // not persisted: next session restores it (1.43)
  });
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
