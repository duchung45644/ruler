import type { Component } from 'svelte';
import type { GeneratedI18nStructure } from '#i18n';
import Pause from '@lucide/svelte/icons/pause';
import Play from '@lucide/svelte/icons/play';
import X from '@lucide/svelte/icons/x';
import PanelBottomClose from '@lucide/svelte/icons/panel-bottom-close';
import PanelBottomOpen from '@lucide/svelte/icons/panel-bottom-open';
import { sendToBackground } from '../../lib/messaging';
import { layer, requestPaint } from './overlay';
import { state } from './state.svelte';

/** Keys without substitutions (dock labels are called as i18n.t(key)). */
export type MessageKey = {
  [K in keyof GeneratedI18nStructure]: GeneratedI18nStructure[K]['substitutions'] extends 0
    ? K
    : never;
}[keyof GeneratedI18nStructure];
/** Display order (inventory 1.16 + 1.45, legacy getControlBar :30105). Empty groups are not drawn. */
export const DOCK_GROUPS = [
  'mode',
  'selections',
  'edit',
  'inspectTools',
  'utilities',
  'environment',
  'designTools',
  'quit',
] as const;
export type DockGroup = (typeof DOCK_GROUPS)[number];

export interface DockItem {
  id: string;
  icon: Component;
  label: MessageKey;
  /** Icon/label shown while isActive() is true (toggle items like pause/resume). */
  activeIcon?: Component;
  activeLabel?: MessageKey;
  key?: string;
  group: DockGroup;
  run(): void;
  isActive?(): boolean;
  isDisabled?(): boolean;
  /** Stays usable while paused. */
  alwaysEnabled?: boolean;
  /** Drawn above the button while state.popover === id; destroyed on close (clean up in onDestroy). */
  popover?: Component;
  /** Shortcut handler, replacing run for the key. */
  runKey?(): void;
}

export const items: DockItem[] = $state([]);

/** Dock items text editing leaves usable (5.06): text edit, mode, dock, side panel, quit. */
const TEXT_EDIT_ITEMS = ['editText', 'inspectMode', 'editMode', 'minimize', 'sidepanel', 'quit'];

/** The edit group shows only in edit mode (1.44). */
export const itemShown = (i: DockItem): boolean => i.group !== 'edit' || state.editOn;

/** Paused or text editing: everything but a few items is locked. */
export function itemLocked(i: DockItem): boolean {
  if (state.paused && !i.alwaysEnabled) return true;
  return state.textEditOn && !TEXT_EDIT_ITEMS.includes(i.id);
}

export function registerItem(item: DockItem): void {
  if (!items.some((i) => i.id === item.id)) items.push(item);
}

/** One popover at a time (1.31, legacy closeOtherPopovers :38452). */
export function togglePopover(id: string): void {
  state.popover = state.popover === id ? null : id;
}

/** Pause (1.17, legacy pauseExtension :41937): hide overlays, panel and pins; the dock locks everything but pause/quit. */
export function setPaused(paused: boolean): void {
  if (state.paused === paused) return; // stopSession calls it: no stray paint
  state.paused = paused;
  if (paused) state.popover = null;
  layer.style.display = paused ? 'none' : '';
  requestPaint(); // the floating panel hides/shows in its painter
}

registerItem({
  id: 'minimize',
  icon: PanelBottomClose,
  label: 'dock.hide',
  activeIcon: PanelBottomOpen,
  activeLabel: 'dock.show',
  group: 'utilities',
  run: () => {
    state.dockCollapsed = !state.dockCollapsed;
    if (state.dockCollapsed) state.popover = null; // 1.19
  },
  isActive: () => state.dockCollapsed,
});
registerItem({
  id: 'pause',
  icon: Pause,
  label: 'dock.pause',
  activeIcon: Play,
  activeLabel: 'dock.resume',
  group: 'utilities',
  alwaysEnabled: true,
  run: () => setPaused(!state.paused),
  isActive: () => state.paused,
});
registerItem({
  id: 'quit',
  icon: X,
  label: 'dock.quit',
  group: 'quit',
  alwaysEnabled: true,
  run: () => void sendToBackground('close_extension'),
});
