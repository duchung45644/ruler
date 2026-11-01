import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
// vitest has no svelte plugin; a component is just a function
vi.mock('../../ui/Dock.svelte', () => ({ default: () => {} }));
// ponytail: runes need the svelte compiler too; plain object of the same shape
vi.mock('./state.svelte', () => ({
  state: {
    active: false,
    paused: false,
    dockCollapsed: false,
    inspectOn: false,
    hovered: null,
    selected: null,
    theme: 'dark',
  },
}));

import { onStop, sessionSignal, startSession, stopSession } from './session';

const count = () => document.querySelectorAll('bo-doi-ui').length;

describe('session', () => {
  afterEach(() => stopSession());

  it('starting twice mounts one host', async () => {
    const ctx = new ContentScriptContext('content');
    await startSession(ctx);
    await startSession(ctx);
    expect(count()).toBe(1);
  });

  it('stop removes host and session listeners', async () => {
    await startSession(new ContentScriptContext('content'));
    const fn = vi.fn();
    window.addEventListener('keydown', fn, { signal: sessionSignal() });
    stopSession();
    window.dispatchEvent(new KeyboardEvent('keydown'));
    expect(fn).not.toHaveBeenCalled();
    expect(count()).toBe(0);
  });

  it('onStop runs exactly once', async () => {
    await startSession(new ContentScriptContext('content'));
    const fn = vi.fn();
    onStop(fn);
    stopSession();
    stopSession();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
