import { items } from './registry.svelte';
import { state } from './state.svelte';

const hooks = new Map<string, (e: KeyboardEvent) => boolean>();

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

export function routeKey(e: KeyboardEvent): void {
  if (isQuitKey(e)) {
    e.preventDefault();
    return items.find((i) => i.id === 'quit')?.run();
  }
  if (shouldIgnoreKey(e, state)) return;
  if (e.key === 'Escape') {
    if (state.selected) {
      state.selected = null;
      e.preventDefault();
    }
    return;
  }
  if (!e.ctrlKey && !e.metaKey && !e.altKey) {
    const item = items.find((i) => i.key === e.key && !i.isDisabled?.());
    if (item) {
      e.preventDefault();
      return item.run();
    }
  }
  const name = hookName(e);
  if (name && hooks.get(name)?.(e)) e.preventDefault();
}
