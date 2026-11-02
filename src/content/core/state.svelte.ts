import { DEFAULT_SETTINGS } from '../../lib/settings';

export const state = $state({
  active: false,
  paused: false,
  dockCollapsed: false,
  popover: null as string | null,
  inspectOn: false,
  hovered: null as Element | null,
  selected: null as Element | null,
  theme: 'dark' as 'light' | 'dark',
  xrayOn: false,
  breakpointsOn: false,
  rulerOn: false,
  /** Find popover has a query matching at least one visible element (3.08). */
  findOn: false,
  auditOn: false,
  overlayOn: false,
  measureOn: false,
  grid: { ...DEFAULT_SETTINGS.layoutGrid },
  /** Chip above the dock button `id` for 1500ms (legacy showButtonNotification :34691). */
  dockNotice: null as { id: string; color: string; text: string } | null,
});

/** Element the inspector panel describes: live hover wins, else the selection. */
export const panelTarget = (): Element | null =>
  (state.inspectOn && !state.paused && state.hovered) || state.selected;
