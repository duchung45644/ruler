import { fakeBrowser } from 'wxt/testing/fake-browser';
import { beforeEach, expect, it, vi } from 'vitest';
import { browser } from '#imports';
import { handleMessages } from '../lib/ext/messaging';
import { createOptionsMenu, OPTIONS_MENU_ID, optionsHandlers } from './options';

const openOptionsPage = vi.fn(async () => {});
const create = vi.fn();

beforeEach(() => {
  fakeBrowser.reset();
  vi.clearAllMocks();
  fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
  browser.runtime.openOptionsPage = openOptionsPage as never;
  Object.assign(browser, { contextMenus: { create } });
});

it('open_options_page opens the options page', async () => {
  const ac = new AbortController();
  handleMessages('background', optionsHandlers, ac.signal);
  const reply = vi.fn();
  await fakeBrowser.runtime.onMessage.trigger(
    { target: 'background', type: 'open_options_page', data: [] },
    {} as never,
    reply,
  );
  await vi.waitFor(() => expect(reply).toHaveBeenCalled());
  expect(openOptionsPage).toHaveBeenCalledOnce();
  ac.abort();
});

it('adds the menu item to the toolbar icon only', () => {
  createOptionsMenu();
  expect(create).toHaveBeenCalledWith({
    id: OPTIONS_MENU_ID,
    title: 'options_pageTitle',
    contexts: ['action'],
  });
});
