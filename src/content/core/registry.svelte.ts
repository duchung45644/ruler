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

export type MessageKey = keyof GeneratedI18nStructure;
/** Display order (inventory 1.16 + 1.45, legacy getControlBar :30105). Empty groups are not drawn. */
export const DOCK_GROUPS = [
  'selections',
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
