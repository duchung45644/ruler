import { fakeBrowser } from 'wxt/testing/fake-browser';
import { expect, it, vi } from 'vitest';
import { storage } from './storage';

it('reads the fallback, writes under the bare key, null removes', async () => {
  const item = storage.defineItem<number[]>('session:tabs', { fallback: [] });
  expect(await item.getValue()).toEqual([]);
  await item.setValue([1]);
  expect(await fakeBrowser.storage.session.get('tabs')).toEqual({ tabs: [1] });
  await item.removeValue();
  expect(await storage.getItem('session:tabs')).toBeNull();
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
