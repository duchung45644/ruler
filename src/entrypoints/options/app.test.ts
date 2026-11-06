import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import App from './App.svelte';

let app: ReturnType<typeof mount> | null = null;
let ready: ReturnType<typeof vi.fn<() => void>>;

beforeEach(() => {
  fakeBrowser.reset();
  fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
});
afterEach(() => {
  if (app) unmount(app);
  app = null;
  document.body.replaceChildren();
  delete document.documentElement.dataset.theme;
});

async function open() {
  ready = vi.fn<() => void>();
  app = mount(App, { target: document.body, props: { onready: ready } });
  await vi.waitFor(() => expect(ready).toHaveBeenCalled());
  flushSync();
}
const select = (name: string) =>
  document.querySelector<HTMLSelectElement>(`select[data-setting="${name}"]`)!;
const choose = (name: string, value: string) => {
  const s = select(name);
  s.value = value;
  s.dispatchEvent(new Event('change', { bubbles: true }));
  flushSync();
};
const stored = async (key: string) => (await fakeBrowser.storage.local.get(key))[key];

it('shows the stored theme and applies it to the page', async () => {
  await fakeBrowser.storage.local.set({ theme: 'light' });
  await open();
  expect(select('theme').value).toBe('light');
  expect(document.documentElement.dataset.theme).toBe('light');
});

it('writes the chosen theme', async () => {
  await open();
  expect(select('theme').value).toBe('system');
  choose('theme', 'dark');
  await vi.waitFor(async () => expect(await stored('theme')).toBe('dark'));
  expect(document.documentElement.dataset.theme).toBe('dark');
});

it('writes the color format and keeps the other panel preferences', async () => {
  const sectionVisibility = { css: { collapsed: false } };
  await fakeBrowser.storage.local.set({
    sidePanelPreferences: { colorFormat: 'RGB', sectionVisibility, codeViewMode: 'source' },
  });
  await open();
  expect(select('colorFormat').value).toBe('RGB');
  choose('colorFormat', 'HSB');
  await vi.waitFor(async () =>
    expect(await stored('sidePanelPreferences')).toEqual({
      colorFormat: 'HSB',
      sectionVisibility,
      codeViewMode: 'source',
    }),
  );
});

it('clears saved edits only after confirming', async () => {
  const saved = { 'persistedRuleEdits:https://a.b': { edits: [], updatedAt: 1 }, other: 1 };
  await fakeBrowser.storage.local.set(saved);
  await open();
  const clear = () => {
    document.querySelector<HTMLButtonElement>('[data-action="clear-saved-edits"]')!.click();
    flushSync();
  };
  const dialogButton = (label: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button')].find(
      (b) => b.textContent === label,
    )!;

  clear();
  expect(document.body.textContent).toContain('options_savedEditsConfirmTitle');
  dialogButton('dialog_cancel').click();
  flushSync();
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  expect(await fakeBrowser.storage.local.get(null)).toEqual(saved);

  clear();
  dialogButton('dialog_confirm').click();
  flushSync();
  await vi.waitFor(async () =>
    expect(await fakeBrowser.storage.local.get(null)).toEqual({ other: 1 }),
  );
});
