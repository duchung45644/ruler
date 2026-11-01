import { browser, defineBackground, i18n } from '#imports';
import { handleMessages, sendToTab } from '../lib/messaging';
import { isInjectable } from '../lib/tabs';

const icon = (tabId: number, active: boolean) =>
  browser.action
    .setIcon({ tabId, path: active ? 'images/icon32_active.png' : 'images/icon32.png' })
    .catch(() => {}); // tab đã đóng

export async function toggleTab(tabId: number): Promise<void> {
  let active: boolean;
  try {
    active = (await sendToTab(tabId, 'toggle_script')).active;
  } catch {
    // chưa có content script: inject, content tự bật khi nạp
    await browser.scripting.executeScript({
      target: { tabId },
      files: ['/content-scripts/content.js'],
    });
    active = true;
  }
  await icon(tabId, active);
}

async function toggleIfAllowed(tab?: { id?: number; url?: string; discarded?: boolean }) {
  if (tab?.id === undefined || tab.discarded || !isInjectable(tab.url)) return;
  await toggleTab(tab.id).catch(() => {});
}

// Port legacy-src/background.js:4560 (menu), :4618 (declarativeContent)
async function setup() {
  await browser.contextMenus.removeAll();
  browser.contextMenus.create({
    id: 'activate',
    title: i18n.t('extNameShort'),
    contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio'],
  });
  const dc = browser.declarativeContent;
  if (!dc) return;
  await browser.action.enable();
  dc.onPageChanged.removeRules(undefined, () =>
    dc.onPageChanged.addRules([
      {
        conditions: [
          new dc.PageStateMatcher({ pageUrl: { schemes: ['http', 'https', 'file', 'ftp'] } }),
        ],
        actions: [new dc.ShowAction()],
      },
    ]),
  );
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => void setup().catch(() => {}));
  browser.runtime.onStartup.addListener(() => void setup().catch(() => {}));
  browser.action.onClicked.addListener((tab) => void toggleIfAllowed(tab));
  browser.contextMenus.onClicked.addListener((_i, tab) => void toggleIfAllowed(tab));
  browser.commands.onCommand.addListener(async (cmd) => {
    if (cmd !== 'select_parent' && cmd !== 'select_child') return;
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id !== undefined && isInjectable(tab.url))
      await sendToTab(tab.id, cmd).catch(() => {});
  });
  browser.tabs.onUpdated.addListener((tabId, info) => {
    if (info.status === 'loading') void icon(tabId, false);
  });
  handleMessages('background', {
    async close_extension(sender) {
      const tabId = sender.tab?.id;
      if (tabId === undefined) return;
      await sendToTab(tabId, 'toggle_script').catch(() => {});
      await icon(tabId, false);
    },
    // Port legacy-src/background.js:3409
    request_clipboard_permission: () =>
      browser.permissions.request({ permissions: ['clipboardWrite'] }),
  });
});
