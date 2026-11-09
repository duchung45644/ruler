import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addKeyHandler,
  isQuitKey,
  routeKey,
  runShortcut,
  setCaptureKeyHandler,
  shouldIgnoreKey,
} from './keys';
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

describe('addKeyHandler', () => {
  it('first handler returning true stops the rest and prevents default', () => {
    state.paused = false;
    const a = vi.fn(() => true);
    const b = vi.fn(() => true);
    const offA = addKeyHandler(a);
    const offB = addKeyHandler(b);
    const ev = keyFrom(document.body, { key: 'ArrowLeft', cancelable: true });
    routeKey(ev);
    offA();
    offB();
    expect(a).toHaveBeenCalledOnce();
    expect(b).not.toHaveBeenCalled();
    expect(ev.defaultPrevented).toBe(true);
  });

  it('skips keys typed in an input inside a shadow root', () => {
    state.paused = false;
    const host = document.body.appendChild(document.createElement('panel-host'));
    const input = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'));
    let ev!: KeyboardEvent;
    host.addEventListener('keydown', (e) => (ev = e as KeyboardEvent), { once: true });
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }),
    );
    const fn = vi.fn(() => true);
    const off = addKeyHandler(fn);
    routeKey(ev);
    off();
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('routeKey while capturing', () => {
  afterEach(() => {
    state.capturing = false;
    setCaptureKeyHandler(null);
    const i = items.findIndex((x) => x.id === 't1');
    if (i >= 0) items.splice(i, 1);
  });

  it('only the capture handler sees keys; Ctrl+Q still quits; inputs are skipped', () => {
    const run = vi.fn();
    registerItem({
      id: 't1',
      icon: {} as never,
      label: 'dock.quit',
      key: '2',
      run,
    });
    const tool = vi.fn(() => true);
    const off = addKeyHandler(tool);
    const cap = vi.fn(() => true);
    setCaptureKeyHandler(cap);
    state.paused = false;
    state.capturing = true;
    const div = document.body.appendChild(document.createElement('div'));
    routeKey(keyFrom(div, { key: '2' }));
    routeKey(keyFrom(div, { key: 'ArrowLeft' }));
    expect(run).not.toHaveBeenCalled();
    expect(tool).not.toHaveBeenCalled();
    expect(cap).toHaveBeenCalledTimes(2);

    const host = document.body.appendChild(document.createElement('pixellens-capture'));
    const input = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'));
    let ev!: KeyboardEvent;
    host.addEventListener('keydown', (e) => (ev = e as KeyboardEvent), { once: true });
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true, composed: true }));
    routeKey(ev);
    expect(cap).toHaveBeenCalledTimes(2);

    const quitItem = items.find((x) => x.id === 'quit')!;
    const quit = vi.spyOn(quitItem, 'run').mockImplementation(() => {});
    routeKey(keyFrom(div, { key: 'q', ctrlKey: true }));
    expect(quit).toHaveBeenCalledOnce();
    quit.mockRestore();
    off();
  });
});

describe('runShortcut (side panel keyboard_shortcut)', () => {
  afterEach(() => {
    items.splice(
      items.findIndex((i) => i.id === 't2'),
      1,
    );
    Object.assign(state, { paused: false, capturing: false, dialog: false, selected: null });
  });

  it('runs the item like a real key press, except paused, capturing or under a dialog', () => {
    const run = vi.fn();
    registerItem({
      id: 't2',
      icon: {} as never,
      label: 'dock.quit',
      key: '2',
      run,
    });
    expect(runShortcut('2')).toBe(true);
    expect(run).toHaveBeenCalledOnce();
    for (const flag of ['paused', 'capturing', 'dialog'] as const) {
      state[flag] = true;
      expect(runShortcut('2')).toBe(false);
      state[flag] = false;
    }
    expect(run).toHaveBeenCalledOnce();
  });

  it('Escape deselects', () => {
    registerItem({ id: 't2', icon: {} as never, label: 'dock.quit', run() {} });
    state.selected = document.body;
    expect(runShortcut('Escape')).toBe(true);
    expect(state.selected).toBeNull();
    expect(runShortcut('Escape')).toBe(false);
  });
});
