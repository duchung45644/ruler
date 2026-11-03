import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import * as messaging from '../../../lib/messaging';
import { startSession, stopSession } from '../../core/session';
import { state } from '../../core/state.svelte';
import * as editor from './editor';
import { captureFullPage } from './fullpage';
import * as session from './session';

fakeBrowser.i18n.getMessage = ((key: string, subs?: string[]) =>
  [key, ...(subs ?? [])].join(' ')) as typeof fakeBrowser.i18n.getMessage;
HTMLCanvasElement.prototype.getContext = (() =>
  new Proxy({}, { get: () => () => {}, set: () => true })) as never;

beforeEach(async () => {
  await startSession(new ContentScriptContext('content'));
  // happy-dom never loads images
  vi.spyOn(session, 'loadImg').mockResolvedValue(
    Object.assign(new Image(), { width: 100, height: 100 }) as never,
  );
  vi.spyOn(session, 'frames').mockResolvedValue();
  vi.spyOn(session, 'sleep').mockResolvedValue();
});
afterEach(() => {
  stopSession();
  vi.restoreAllMocks();
});

it('falls back to scroll & stitch with a note, and leaves the page clean (Review Focus 2)', async () => {
  const fixed = document.body.appendChild(document.createElement('header'));
  fixed.style.position = 'fixed';
  vi.spyOn(messaging, 'sendToBackground').mockImplementation((async (type: string) =>
    type === 'full_capture'
      ? { ok: false, error: 'Another debugger is already attached' }
      : { success: true, dataUrl: 'data:x' }) as never);
  const open = vi.spyOn(editor, 'openCaptureEditor').mockResolvedValue();
  const y0 = scrollY;
  await captureFullPage('data:snap');
  expect(messaging.sendToBackground).toHaveBeenCalledWith('capture_tab', null);
  expect(open).toHaveBeenCalledOnce();
  expect(String(open.mock.calls[0]![2])).toContain('Another debugger is already attached');
  expect(document.querySelector('bo-doi-cover')).toBeNull();
  expect(fixed.style.visibility).toBe('');
  expect(scrollY).toBe(y0);
  fixed.remove();
});

it('stopSession while waiting for the debugger removes the cover (Review Focus 4)', async () => {
  let reply!: (v: unknown) => void;
  vi.spyOn(messaging, 'sendToBackground').mockImplementation(
    () => new Promise((r) => (reply = r)) as never,
  );
  const p = captureFullPage('data:snap');
  await vi.waitFor(() => expect(reply).toBeTypeOf('function'));
  expect(document.querySelector('bo-doi-cover')).not.toBeNull();
  stopSession();
  reply({ ok: false, error: 'x' });
  await p;
  expect(document.querySelector('bo-doi-cover')).toBeNull();
  expect(state.capturing).toBe(false);
});
