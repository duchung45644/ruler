import { afterEach, describe, expect, it, vi } from 'vitest';
import { isQuitKey, routeKey, shouldIgnoreKey } from './keys';
import { items, registerItem } from './registry.svelte';
import { state } from './state.svelte';

function keyFrom(el: Element, init: KeyboardEventInit): KeyboardEvent {
  let ev!: KeyboardEvent;
  el.addEventListener('keydown', (e) => (ev = e as KeyboardEvent), { once: true });
  el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true, ...init }));
  return ev;
}

describe('shouldIgnoreKey', () => {
  it('ignores keys typed in an input', () => {
    const input = document.body.appendChild(document.createElement('input'));
    expect(shouldIgnoreKey(keyFrom(input, { key: '1' }), { paused: false })).toBe(true);
  });

  it('ignores keys typed in a contenteditable', () => {
    const div = document.body.appendChild(document.createElement('div'));
    div.contentEditable = 'true';
    expect(shouldIgnoreKey(keyFrom(div, { key: '1' }), { paused: false })).toBe(true);
  });

  it('ignores keys typed in an input inside a page shadow root', () => {
    const host = document.body.appendChild(document.createElement('page-widget'));
    const input = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'));
    let ev!: KeyboardEvent;
    host.addEventListener('keydown', (e) => (ev = e as KeyboardEvent), { once: true });
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true, composed: true }));
    expect(shouldIgnoreKey(ev, { paused: false })).toBe(true);
  });

  it('ignores everything while paused, but Ctrl+Q still quits', () => {
    const div = document.body.appendChild(document.createElement('div'));
    expect(shouldIgnoreKey(keyFrom(div, { key: '1' }), { paused: true })).toBe(true);
    expect(shouldIgnoreKey(keyFrom(div, { key: '1' }), { paused: false })).toBe(false);
    expect(isQuitKey(keyFrom(div, { key: 'q', ctrlKey: true }))).toBe(true);
    expect(isQuitKey(keyFrom(div, { key: 'q', ctrlKey: true, shiftKey: true }))).toBe(false);
  });
});

describe('routeKey', () => {
  afterEach(() => {
    const i = items.findIndex((x) => x.id === 't1');
    if (i >= 0) items.splice(i, 1);
  });

  it('runs the item bound to the key, not with Ctrl', () => {
    const run = vi.fn();
    registerItem({
      id: 't1',
      icon: {} as never,
      label: 'dock.quit',
      key: '1',
      group: 'utilities',
      run,
    });
    state.paused = false;
    const div = document.body.appendChild(document.createElement('div'));
    routeKey(keyFrom(div, { key: '1' }));
    expect(run).toHaveBeenCalledOnce();
    routeKey(keyFrom(div, { key: '1', ctrlKey: true }));
    expect(run).toHaveBeenCalledOnce();
  });

  it('matches letter keys case-insensitively', () => {
    const run = vi.fn();
    registerItem({
      id: 't1',
      icon: {} as never,
      label: 'dock.quit',
      key: 'o',
      group: 'utilities',
      run,
    });
    state.paused = false;
    const div = document.body.appendChild(document.createElement('div'));
    routeKey(keyFrom(div, { key: 'O', shiftKey: true }));
    routeKey(keyFrom(div, { key: 'o' }));
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('calls runKey instead of run when present', () => {
    const run = vi.fn();
    const runKey = vi.fn();
    registerItem({
      id: 't1',
      icon: {} as never,
      label: 'dock.quit',
      key: '3',
      group: 'utilities',
      run,
      runKey,
    });
    state.paused = false;
    routeKey(keyFrom(document.body, { key: '3' }));
    expect(runKey).toHaveBeenCalledOnce();
    expect(run).not.toHaveBeenCalled();
  });

  it('Esc with no selection closes the popover', () => {
    state.selected = null;
    state.popover = 'find';
    routeKey(keyFrom(document.body, { key: 'Escape', cancelable: true }));
    expect(state.popover).toBeNull();
  });

  it('Esc releases the selection', () => {
    state.selected = document.body;
    const ev = keyFrom(document.body, { key: 'Escape', cancelable: true });
    routeKey(ev);
    expect(state.selected).toBeNull();
    expect(ev.defaultPrevented).toBe(true);
  });
});
