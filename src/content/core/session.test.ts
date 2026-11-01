import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentScriptContext } from 'wxt/utils/content-script-context';

import { themePref } from '../../lib/settings';
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

  it('stop during start leaves no host and no theme watcher', async () => {
    const watch = vi.spyOn(themePref, 'watch');
    const p = startSession(new ContentScriptContext('content'));
    stopSession();
    await p;
    expect(count()).toBe(0);
    expect(watch).not.toHaveBeenCalled();
  });
});
