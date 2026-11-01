export const state = $state({
  active: false,
  paused: false,
  dockCollapsed: false,
  popover: null as string | null,
  inspectOn: false,
  hovered: null as Element | null,
  selected: null as Element | null,
  theme: 'dark' as 'light' | 'dark',
});

/** Element the inspector panel describes: live hover wins, else the selection. */
export const panelTarget = (): Element | null =>
  (state.inspectOn && !state.paused && state.hovered) || state.selected;
