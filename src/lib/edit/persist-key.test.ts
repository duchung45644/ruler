import { beforeEach, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { clearAllPersistedEdits, persistKey } from './persist-key';

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

it('clears every saved site, inline and broken entries too, and nothing else', async () => {
  expect(await clearAllPersistedEdits()).toBe(0);
  await fakeBrowser.storage.local.set({
    'persistedRuleEdits:https://a.b': { edits: [], inline: [{ locator: 'x' }], updatedAt: 1 },
    'persistedRuleEdits:https://bad': { edits: 1 },
    other: 1,
    theme: 'dark',
  });
  expect(await clearAllPersistedEdits()).toBe(2);
  expect(Object.keys(await fakeBrowser.storage.local.get(null)).sort()).toEqual(['other', 'theme']);
});
