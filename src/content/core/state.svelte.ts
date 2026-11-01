export const state = $state({
  active: false,
  paused: false,
  dockCollapsed: false,
  inspectOn: false,
  hovered: null as Element | null,
  selected: null as Element | null,
  theme: 'dark' as 'light' | 'dark',
});
