import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentScriptContext } from 'wxt/utils/content-script-context';

import { themePref } from '../../lib/ext/settings';
import { onKey } from './keys';
import { onStop, sessionSignal, startSession, stopSession } from './session';

const count = () => document.querySelectorAll('pixellens-ui').length;

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

  it('a failed start can be retried', async () => {
    const mount = await import('../../ui/mount');
    vi.spyOn(mount, 'mountUi').mockRejectedValueOnce(new Error('boom'));
    await expect(startSession(new ContentScriptContext('content'))).rejects.toThrow('boom');
    await startSession(new ContentScriptContext('content'));
    expect(count()).toBe(1);
  });

  it('routes shortcuts from a focused button in our UI, never from our inputs', async () => {
    await startSession(new ContentScriptContext('content'));
    const run = vi.fn(() => true);
    onStop(onKey('Space', run));
    const shadow = document.querySelector('pixellens-ui')!.shadowRoot!;
    const press = (el: Element) =>
      el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, composed: true }));
    press(shadow.appendChild(document.createElement('button')));
    expect(run).toHaveBeenCalledOnce();
    press(shadow.appendChild(document.createElement('input')));
    expect(run).toHaveBeenCalledOnce();
  });

  it('pressing a button in our UI does not move focus to it', async () => {
    await startSession(new ContentScriptContext('content'));
    const b = document
      .querySelector('pixellens-ui')!
      .shadowRoot!.appendChild(document.createElement('button'));
    const e = new MouseEvent('mousedown', { bubbles: true, composed: true, cancelable: true });
    b.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
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
