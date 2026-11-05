import { itemLocked, itemShown, items, type DockItem } from './registry.svelte';
import { state } from './state.svelte';

const hooks = new Map<string, (e: KeyboardEvent) => boolean>();
const handlers: ((e: KeyboardEvent) => boolean)[] = [];
let captureKey: ((e: KeyboardEvent) => boolean) | null = null;
let forwardKey: ((key: string) => void) | null = null;

/** Set by frame mode: item keys go to the parent shell instead of running here. */
export function setForwardKey(fn: ((key: string) => void) | null): void {
  forwardKey = fn;
}

/** Set by the capture session: while state.capturing it gets every key except Ctrl+Q. */
export function setCaptureKeyHandler(fn: ((e: KeyboardEvent) => boolean) | null): void {
  captureKey = fn;
}

/** Tool key handler, run in registration order before Esc/item keys; the first returning true wins. */
export function addKeyHandler(fn: (e: KeyboardEvent) => boolean): () => void {
  handlers.push(fn);
  return () => {
    const i = handlers.indexOf(fn);
    if (i >= 0) handlers.splice(i, 1);
  };
}

/** Hook for Space / Alt+Shift+ArrowLeft / Alt+Shift+ArrowRight (Task 6/8). Returns the unregister fn. */
export function onKey(key: string, fn: (e: KeyboardEvent) => boolean): () => void {
  hooks.set(key, fn);
  return () => hooks.delete(key);
}

/** Port of legacy-src/content.js:47311 (1.21). */
export function shouldIgnoreKey(e: KeyboardEvent, s: { paused: boolean }): boolean {
  if (s.paused) return true;
  const el = e.composedPath()[0] as HTMLElement | undefined; // real focus, through page shadow roots
  return !!el && (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || !!el.isContentEditable);
}

export function isQuitKey(e: KeyboardEvent): boolean {
  return e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'q';
}

function hookName(e: KeyboardEvent): string | null {
  if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey) return 'Space';
  if (e.altKey && e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight'))
    return `Alt+Shift+${e.key}`;
  return null;
}

const runnable = (i: DockItem): boolean => itemShown(i) && !itemLocked(i) && !i.isDisabled?.();

/** Runs dock item `id` like its key would (frame mode's run_item). Returns whether it ran. */
export function runItem(id: string): boolean {
  if (state.paused || state.capturing || state.dialog) return false;
  const item = items.find((i) => i.id === id && runnable(i));
  if (!item) return false;
  if (item.runKey) item.runKey();
  else item.run();
  return true;
}

/**
 * Esc / dock item key, shared by real keys and the side panel's keyboard_shortcut (6.15).
 * Returns whether something ran.
 */
export function runShortcut(key: string): boolean {
  if (state.paused || state.capturing || state.dialog) return false;
  if (key === 'Escape') {
    if (state.selected) state.selected = null;
    else if (state.popover)
      state.popover = null; // legacy executeShortcut :47540
    else return false;
    return true;
  }
  const item = items.find((i) => i.key === key.toLowerCase() && runnable(i));
  if (!item) return false;
  if (item.runKey) item.runKey();
  else item.run();
  return true;
}

export function routeKey(e: KeyboardEvent): void {
  if (isQuitKey(e)) {
    e.preventDefault();
    return items.find((i) => i.id === 'quit')?.run();
  }
  if (state.capturing) {
    // typing in the Text tool's input must not switch tools (legacy onCapKeydown capture.js:80)
    if (shouldIgnoreKey(e, { paused: false })) return;
    if (captureKey?.(e)) e.preventDefault();
    return;
  }
  if (state.dialog || shouldIgnoreKey(e, state)) return;
  if (handlers.some((fn) => fn(e))) return e.preventDefault();
  if (e.key === 'Escape' || (!e.ctrlKey && !e.metaKey && !e.altKey)) {
    // responsive frame: the shell runs item keys so every frame and the dock stay in step
    if (state.inFrame && forwardKey && e.key !== 'Escape') {
      const k = e.key.toLowerCase();
      if (items.some((i) => i.key === k && runnable(i))) {
        forwardKey(e.key);
        return e.preventDefault();
      }
    }
    if (runShortcut(e.key)) return e.preventDefault();
    if (e.key === 'Escape') return;
  }
  const name = hookName(e);
  if (name && hooks.get(name)?.(e)) e.preventDefault();
}
