import { fakeBrowser } from 'wxt/testing/fake-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fitsSync, storage, SYNC_ITEM_MAX } from './storage';

it('reads the fallback, writes under the bare key, null removes', async () => {
  const item = storage.defineItem<number[]>('session:tabs', { fallback: [] });
  expect(await item.getValue()).toEqual([]);
  await item.setValue([1]);
  expect(await fakeBrowser.storage.session.get('tabs')).toEqual({ tabs: [1] });
  await item.removeValue();
  expect(await storage.getItem('session:tabs')).toBeNull();
});

describe('defineSyncItem', () => {
  beforeEach(() => fakeBrowser.reset());

  it('keeps a value too big for one sync item in local', async () => {
    const item = storage.defineSyncItem<string>('big', { fallback: '' });
    const big = 'x'.repeat(SYNC_ITEM_MAX);
    expect(fitsSync('big', big)).toBe(false);
    await item.setValue(big);
    expect(await fakeBrowser.storage.sync.get('big')).toEqual({});
    expect(await item.getValue()).toBe(big);
    await item.setValue('small');
    expect(await fakeBrowser.storage.sync.get('big')).toEqual({ big: 'small' });
    expect(await fakeBrowser.storage.local.get('big')).toEqual({});
  });

  it('falls back to local when sync refuses the write', async () => {
    const item = storage.defineSyncItem<number>('n', { fallback: 0 });
    const spy = vi.spyOn(fakeBrowser.storage.sync, 'set').mockRejectedValueOnce(new Error('quota'));
    await item.setValue(3);
    spy.mockRestore();
    expect(await fakeBrowser.storage.local.get('n')).toEqual({ n: 3 });
    expect(await item.getValue()).toBe(3);
  });

  it('watch reports a migration-free change once, across both areas', async () => {
    const item = storage.defineSyncItem<string>('theme', { fallback: 'system' });
    await fakeBrowser.storage.local.set({ theme: 'dark' });
    const cb = vi.fn();
    const off = item.watch(cb);
    expect(await item.getValue()).toBe('dark'); // migrates: two storage events, same value
    await item.setValue('light');
    await vi.waitFor(() => expect(cb).toHaveBeenCalledTimes(1));
    off();
    expect(cb).toHaveBeenCalledWith('light', 'dark');
  });
});

it('watch fires on real changes with the fallback for a removed value', async () => {
  const item = storage.defineItem<string>('local:theme', { fallback: 'system' });
  const cb = vi.fn();
  const off = item.watch(cb);
  await item.setValue('dark');
  await item.setValue('dark');
  await item.setValue(null as never);
  off();
  await item.setValue('light');
  expect(cb.mock.calls).toEqual([
    ['dark', 'system'],
    ['system', 'dark'],
  ]);
});
