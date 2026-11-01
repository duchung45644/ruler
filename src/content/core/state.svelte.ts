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
  /** Chip above the dock button `id` for 1500ms (legacy showButtonNotification :34691). */
  dockNotice: null as { id: string; color: string; text: string } | null,
});

/** Element the inspector panel describes: live hover wins, else the selection. */
export const panelTarget = (): Element | null =>
  (state.inspectOn && !state.paused && state.hovered) || state.selected;
