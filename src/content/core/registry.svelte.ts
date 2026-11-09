import type { Component } from 'svelte';
import type { GeneratedI18nStructure } from '#i18n';
import Pause from '@lucide/svelte/icons/pause';
import Play from '@lucide/svelte/icons/play';
import X from '@lucide/svelte/icons/x';
import { sendToBackground } from '../../lib/ext/messaging';
import { layer, requestPaint } from './overlay';
import { state } from './state.svelte';

/** Keys without substitutions, named ones included (dock labels are called as i18n.t(key)). */
export type MessageKey = {
  [K in keyof GeneratedI18nStructure]: GeneratedI18nStructure[K] extends {
    namedSubstitutions: unknown;
  }
    ? never
    : GeneratedI18nStructure[K]['substitutions'] extends 0
      ? K
      : never;
}[keyof GeneratedI18nStructure];

export interface DockItem {
  id: string;
  icon: Component;
  label: MessageKey;
  /** Icon/label shown while isActive() is true (toggle items like pause/resume). */
  activeIcon?: Component;
  activeLabel?: MessageKey;
  key?: string;
  run(): void;
  isActive?(): boolean;
  isDisabled?(): boolean;
  /** Dock button shown only while this is true (the key works either way). */
  shown?(): boolean;
  /** Stays usable while paused. */
  alwaysEnabled?: boolean;
  /** Drawn above the button while state.popover === id; destroyed on close (clean up in onDestroy). */
  popover?: Component;
  /** Shortcut handler, replacing run for the key. */
  runKey?(): void;
  /**
   * Responsive mode: the parent sends run_item(id) to the frames instead of running it (2.25).
   * The toggle (runKey, else run) is forwarded; a popover-opening run stays local.
   */
  forward?: boolean;
}

/** Set by the responsive shell; see forward.ts. */
export interface Forwarder {
  /** Forwarding is on (responsive, top page). */
  on(): boolean;
  run(id: string): void;
  /** Mirrored active state of a forwarded item. */
  isActive(id: string): boolean;
  paused(paused: boolean): void;
}
let forwarder: Forwarder | null = null;
export function setForwarder(f: Forwarder | null): void {
  forwarder = f;
}
/** The unwrapped toggle and active check of forward items (to sync the parent on exit). */
// eslint-disable-next-line svelte/prefer-svelte-reactivity -- bookkeeping, never rendered
export const localOf = new Map<string, { toggle(): void; isActive?(): boolean }>();

function wrapForward(item: DockItem): DockItem {
  const { id, run, runKey, isActive, isDisabled, shown } = item;
  const toggle = runKey ?? run;
  localOf.set(id, { toggle, isActive });
  const fwd = (local: () => void) => () => {
    if (forwarder?.on()) forwarder.run(id);
    else local();
  };
  return {
    ...item,
    ...(runKey ? { runKey: fwd(runKey) } : { run: fwd(run) }),
    ...(isActive && { isActive: () => (forwarder?.on() ? forwarder.isActive(id) : isActive()) }),
    // the parent has no selection: the frames decide (select_parent / select_child)
    ...(isDisabled && { isDisabled: () => !forwarder?.on() && isDisabled() }),
    ...(shown && { shown: () => !!forwarder?.on() || shown() }),
  };
}

export const items: DockItem[] = $state([]);

/** Dock items text editing leaves usable (5.06): text edit, mode, dock, side panel, quit. */
const TEXT_EDIT_ITEMS = ['inspect', 'sidepanel', 'quit'];

/**
 * Dock layout by purpose: find/select, page overlays, measuring, check & capture, panel/session.
 * Items not listed have no dock button, key only (breakpoints: the responsive toolbar carries it).
 */
export const DOCK_LAYOUT = [
  ['select_parent', 'select_child', 'inspect', 'find'],
  ['xray', 'grid', 'responsive'],
  ['ruler', 'measure'],
  ['capture', 'more'],
  ['sidepanel', 'pause', 'mcp', 'quit'], // MCP last before Quit (1.46)
];

/** Less used tools behind the "more" button (owner's call, 2026-11-09); their keys still work. */
export const MORE_ITEMS = ['overlay', 'audit', 'eyedropper', 'pause'];

/** The dock button that stands for `id`: itself, or "more" for the items in its menu. */
export const dockButtonOf = (id: string): string => (MORE_ITEMS.includes(id) ? 'more' : id);

/** Dock groups in display order; empty groups are dropped. */
export function dockGroups(): DockItem[][] {
  const byId = (id: string) => items.find((i) => i.id === id);
  return DOCK_LAYOUT.map((ids) =>
    ids.map(byId).filter((i): i is DockItem => !!i && (i.shown?.() ?? true)),
  ).filter((g) => g.length);
}

/** Paused or text editing: everything but a few items is locked. */
export function itemLocked(i: DockItem): boolean {
  if (state.paused && !i.alwaysEnabled) return true;
  return state.textEditOn && !TEXT_EDIT_ITEMS.includes(i.id);
}

export function registerItem(item: DockItem): void {
  if (!items.some((i) => i.id === item.id)) items.push(item.forward ? wrapForward(item) : item);
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
  if (forwarder?.on()) forwarder.paused(paused); // 1.47
}

registerItem({
  id: 'pause',
  icon: Pause,
  label: 'dock.pause',
  activeIcon: Play,
  activeLabel: 'dock.resume',
  alwaysEnabled: true,
  run: () => setPaused(!state.paused),
  isActive: () => state.paused,
  // pause lives in the "more" menu; while paused, Resume sits on the dock
  shown: () => state.paused,
});
registerItem({
  id: 'quit',
  icon: X,
  label: 'dock.quit',
  alwaysEnabled: true,
  run: () => void sendToBackground('close_extension'),
});
