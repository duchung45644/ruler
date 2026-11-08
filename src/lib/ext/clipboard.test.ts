import { afterEach, expect, it, vi } from 'vitest';
import { copyImage } from './clipboard';
import * as messaging from './messaging';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const stubClipboard = (write: () => Promise<void>) => {
  const fn = vi.fn(write);
  vi.stubGlobal('ClipboardItem', class {});
  vi.stubGlobal('navigator', { clipboard: { write: fn } });
  return fn;
};

it('fails without writing on an insecure page', async () => {
  vi.stubGlobal('isSecureContext', false);
  const write = stubClipboard(async () => {});
  expect(await copyImage(new Blob())).toBe(false);
  expect(write).not.toHaveBeenCalled();
});

it('asks for clipboardWrite once and retries', async () => {
  vi.stubGlobal('isSecureContext', true);
  let n = 0;
  const write = stubClipboard(async () => {
    if (n++ === 0) throw new Error('denied');
  });
  const ask = vi.spyOn(messaging, 'sendToBackground').mockResolvedValue(true as never);
  expect(await copyImage(new Blob())).toBe(true);
  expect(ask).toHaveBeenCalledOnce();
  expect(ask).toHaveBeenCalledWith('request_clipboard_permission');
  expect(write).toHaveBeenCalledTimes(2);
});
