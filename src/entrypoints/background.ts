import { browser, defineBackground, i18n } from '#imports';
import {
  CAPTURE_GAP,
  chunkClips,
  cropBox,
  fitSize,
  nextCaptureDelay,
  type DeviceRect,
} from '../lib/capture/capture-bg';
import {
  type AiCapture,
  handleMessages,
  sendToTab,
  type CaptureResult,
  type FullCaptureOpts,
  type FullCaptureResult,
} from '../lib/ext/messaging';
import { isInjectable } from '../lib/ext/tabs';
import {
  closePanelFor,
  enableFor,
  initPanels,
  panelHandlers,
  setupPanels,
} from '../background/panels';
import { initResponsive, responsiveHandlers } from '../background/responsive';
import {
  createOptionsMenu,
  OPTIONS_MENU_ID,
  openOptions,
  optionsHandlers,
} from '../background/options';
import { initMcp, isIodobTab, mcpHandlers } from '../background/mcp';

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
  if (active) enableFor(tabId);
  else await closePanelFor(tabId);
  await icon(tabId, active);
}

async function toggleIfAllowed(tab?: { id?: number; url?: string; discarded?: boolean }) {
  if (tab?.id === undefined || tab.discarded || !isInjectable(tab.url)) return;
  await toggleTab(tab.id).catch(() => {});
}

// All captureVisibleTab calls go through one queue spaced CAPTURE_GAP apart.
let queue: Promise<unknown> = Promise.resolve();
let lastCapture = -CAPTURE_GAP;
function captureVisible(windowId: number): Promise<string> {
  const run = async () => {
    const wait = nextCaptureDelay(lastCapture, Date.now());
    if (wait) await new Promise((r) => setTimeout(r, wait));
    try {
      return await browser.tabs.captureVisibleTab(windowId, { format: 'png' });
    } finally {
      lastCapture = Date.now();
    }
  };
  const p = queue.then(run, run);
  queue = p.catch(() => {});
  return p;
}

const toDataUrl = (blob: Blob) =>
  new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });

/** Crop in device px; any failure keeps the full image (legacy $e). */
async function crop(dataUrl: string, rect: DeviceRect): Promise<string> {
  try {
    const { x, y, w, h } = cropBox(rect);
    const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
    const c = new OffscreenCanvas(w, h);
    c.getContext('2d')!.drawImage(bmp, x, y, w, h, 0, 0, w, h);
    const blob = await c.convertToBlob({ type: 'image/png' });
    return await toDataUrl(blob);
  } catch {
    return dataUrl;
  }
}

async function captureTab(
  rect: DeviceRect | null,
  tab?: { windowId?: number; url?: string },
): Promise<CaptureResult> {
  if (!tab || !isInjectable(tab.url)) return { success: false, error: 'INVALID_URL' };
  try {
    const dataUrl = await captureVisible(tab.windowId ?? browser.windows.WINDOW_ID_CURRENT);
    return { success: true, dataUrl: rect ? await crop(dataUrl, rect) : dataUrl };
  } catch {
    return { success: false, error: 'CAPTURE_FAILED' };
  }
}

/** 10.05 / 10.14: the visible tab for an agent, PNG scaled down to ≤ 2000 px (Q6 a). */
async function captureForAi(tab?: { id?: number; windowId?: number }): Promise<AiCapture> {
  if (tab?.id === undefined || !(await isIodobTab(tab.id)))
    return { ok: false, reason: 'script_inactive' };
  try {
    const dataUrl = await captureVisible(tab.windowId ?? browser.windows.WINDOW_ID_CURRENT);
    const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
    const { width, height } = fitSize(bmp.width, bmp.height);
    if (width === bmp.width && height === bmp.height) return { ok: true, dataUrl, width, height };
    const c = new OffscreenCanvas(width, height);
    const g = c.getContext('2d')!;
    g.imageSmoothingQuality = 'high';
    g.drawImage(bmp, 0, 0, width, height);
    return {
      ok: true,
      dataUrl: await toDataUrl(await c.convertToBlob({ type: 'image/png' })),
      width,
      height,
    };
  } catch {
    return { ok: false, reason: 'capture_failed' };
  }
}

/** Port of bdFullCapture: the viewport is enlarged to the full height first, since
 * captureBeyondViewport alone leaves the off-screen part unpainted. */
async function fullCapture(tabId: number, o: FullCaptureOpts): Promise<FullCaptureResult> {
  const target = { tabId };
  const send = (method: string, params?: object) =>
    browser.debugger.sendCommand(target, method, params) as Promise<{ data: string }>;
  try {
    await browser.debugger.attach(target, '1.3');
    try {
      // no scrollbars in the shot (the enlarged viewport can still show a horizontal one)
      await send('Emulation.setScrollbarsHidden', { hidden: true }).catch(() => {});
      await send('Emulation.setDeviceMetricsOverride', {
        width: o.width,
        height: o.height + o.shift,
        deviceScaleFactor: o.dpr,
        mobile: false,
      });
      if (o.before) await send('Runtime.evaluate', { expression: o.before });
      await new Promise((r) => setTimeout(r, 300)); // let layout and lazy images settle
      const parts: string[] = [];
      for (const clip of chunkClips(o.height, o.chunk, o.shift, o.width)) {
        const res = await send('Page.captureScreenshot', {
          format: 'png',
          captureBeyondViewport: false,
          optimizeForSpeed: true,
          clip,
        });
        parts.push(`data:image/png;base64,${res.data}`);
      }
      return { ok: true, parts };
    } finally {
      if (o.after) await send('Runtime.evaluate', { expression: o.after }).catch(() => {});
      await send('Emulation.clearDeviceMetricsOverride').catch(() => {});
      await send('Emulation.setScrollbarsHidden', { hidden: false }).catch(() => {});
      if (o.restore) await send('Runtime.evaluate', { expression: o.restore }).catch(() => {});
      await browser.debugger.detach(target).catch(() => {});
    }
  } catch (e) {
    return { ok: false, error: String((e as Error)?.message ?? e) };
  }
}

// Port legacy-src/background.js:4560 (menu), :4618 (declarativeContent)
async function setup() {
  await setupPanels().catch(() => {});
  await browser.contextMenus.removeAll();
  browser.contextMenus.create({
    id: 'activate',
    title: i18n.t('extNameShort'),
    contexts: ['page', 'frame', 'selection', 'link', 'editable', 'image', 'video', 'audio'],
  });
  createOptionsMenu();
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
  initPanels();
  initResponsive(toggleTab);
  initMcp(); // dials only when the user left MCP on (10.04)
  browser.runtime.onInstalled.addListener(() => void setup().catch(() => {}));
  browser.runtime.onStartup.addListener(() => void setup().catch(() => {}));
  browser.action.onClicked.addListener((tab) => void toggleIfAllowed(tab));
  browser.contextMenus.onClicked.addListener((info, tab) =>
    info.menuItemId === OPTIONS_MENU_ID
      ? void openOptions().catch(() => {})
      : void toggleIfAllowed(tab),
  );
  browser.commands.onCommand.addListener(async (cmd) => {
    if (cmd !== 'select_parent' && cmd !== 'select_child') return;
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id !== undefined && isInjectable(tab.url))
      await sendToTab(tab.id, cmd).catch(() => {});
  });
  browser.tabs.onUpdated.addListener((tabId, info) => {
    if (info.status === 'loading') void icon(tabId, false);
  });
  handleMessages(
    'background',
    {
      ...panelHandlers,
      ...responsiveHandlers,
      ...optionsHandlers,
      ...mcpHandlers,
      async close_extension(sender) {
        const tabId = sender.tab?.id;
        if (tabId === undefined) return;
        await sendToTab(tabId, 'toggle_script').catch(() => {});
        await closePanelFor(tabId);
        await icon(tabId, false);
      },
      // Port legacy-src/background.js:3409
      request_clipboard_permission: () =>
        browser.permissions.request({ permissions: ['clipboardWrite'] }),
      capture_tab: (rect, sender) => captureTab(rect, sender.tab),
      capture_for_ai: (sender) => captureForAi(sender.tab),
      full_capture: (opts, sender) =>
        sender.tab?.id === undefined
          ? { ok: false, error: 'no tab' }
          : fullCapture(sender.tab.id, opts),
    },
    undefined,
    { sync: ['open_side_panel', 'dock_panel'] },
  );
});
