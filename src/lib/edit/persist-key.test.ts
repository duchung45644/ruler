import { beforeEach, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { clearPersistedEdits, listPersistedEdits, persistKey } from './persist-key';

beforeEach(() => fakeBrowser.reset());

it('keys by origin, or by path for file pages', () => {
  expect(persistKey({ protocol: 'file:', origin: 'null', pathname: '/x.html' })).toBe(
    'persistedRuleEdits:file:///x.html',
  );
  expect(persistKey({ protocol: 'https:', origin: 'https://a.b', pathname: '/' })).toBe(
    'persistedRuleEdits:https://a.b',
  );
  expect(persistKey({ protocol: 'data:', origin: 'null', pathname: '' })).toBeNull();
});

it('lists and clears only valid entries', async () => {
  const value = { edits: [], updatedAt: 1 };
  await fakeBrowser.storage.local.set({
    'persistedRuleEdits:https://a.b': value,
    'persistedRuleEdits:https://bad': { edits: 1 },
    other: value,
  });
  expect(await listPersistedEdits()).toEqual([{ key: 'persistedRuleEdits:https://a.b', value }]);
  await clearPersistedEdits('other');
  await clearPersistedEdits('persistedRuleEdits:https://a.b');
  expect(Object.keys(await fakeBrowser.storage.local.get(null)).sort()).toEqual([
    'other',
    'persistedRuleEdits:https://bad',
  ]);
});
