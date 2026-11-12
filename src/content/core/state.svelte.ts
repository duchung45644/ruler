import type { VisionMode } from '../../lib/style/vision';
import type { ColorFormat } from '../../lib/style/color';
import { DEFAULT_SETTINGS } from '../../lib/ext/settings';

export const state = $state({
  active: false,
  /** Running inside a responsive-view iframe: no dock, keys go to the parent shell. */
  inFrame: false,
  paused: false,
  popover: null as string | null,
  inspectOn: false,
  hovered: null as Element | null,
  /** Box Model ring hovered in the panel: that part of the selection is lit on the page. */
  boxPart: null as 'margin' | 'border' | 'padding' | 'content' | null,
  selected: null as Element | null,
  theme: 'dark' as 'light' | 'dark',
  xrayOn: false,
  breakpointsOn: false,
  /** Responsive shell (frame per viewport) covers the page. */
  responsiveOn: false,
  rulerOn: false,
  /** Find popover has a query matching at least one visible element (3.08). */
  findOn: false,
  auditOn: false,
  overlayOn: false,
  measureOn: false,
  /** Vision deficiency simulated on the page (filter on <html>). */
  vision: 'none' as VisionMode,
  tabOrderOn: false,
  vitalsOn: false,
  /** Capture bar / editor open: page tools pause, only the capture key handler runs. */
  capturing: false,
  /** Alert dialog up: tool keys stop (9.24). */
  dialog: false,
  /** sidePanelPreferences.colorFormat, shared with the side panel (2.22, 3.23). */
  colorFormat: 'HEX' as ColorFormat,
  grid: { ...DEFAULT_SETTINGS.layoutGrid },
  /** Chip above the dock button `id` for 1500ms (legacy showButtonNotification :34691). */
  dockNotice: null as { id: string; color: string; text: string } | null,
  /** Edit mode (dock Inspect / Edit switch) and its text-editing sub-mode. */
  editOn: false,
  textEditOn: false,
  /** Command palette / cheat sheet open (Ctrl+K, ?). */
  palette: false,
  /** This tab's side panel is connected (top frame only): it already shows the selection's CSS. */
  sidePanelOpen: false,
});

/** Element the inspector panel describes: live hover wins, else the selection. */
export const panelTarget = (): Element | null =>
  (state.inspectOn && !state.paused && state.hovered) || state.selected;
