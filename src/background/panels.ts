import { browser, storage, type Browser } from '#imports';
import { sendToTab, sendToTabPanel, type BackgroundApi, type Handlers } from '../lib/messaging';
import type { Technology } from '../lib/page/types';
import { detachBounds, panelPath, type Bounds } from '../lib/panels';
import { fetchStylesheet } from '../lib/stylesheet-fetch';

const detachedItem = storage.defineItem<Record<string, number>>('session:detachedPanels', {
  fallback: {},
});
const boundsItem = storage.defineItem<Partial<Bounds> | null>('local:detachedPanelBounds', {
  fallback: null,
});

/** tab → detached panel window (legacy le). */
export const detached = new Map<number, number>();
/** Detached window → its size when created, to tell a move from a resize (legacy de). */
const created = new Map<number, { width: number; height: number }>();
let ready: Promise<void> = Promise.resolve();

const save = () => void detachedItem.setValue(Object.fromEntries(detached)).catch(() => {});

function forget(tabId: number): void {
  if (detached.delete(tabId)) save();
}

/** sidePanel is missing in some Chromium builds; setOptions failures are not actionable. */
function setOptions(o: Browser.sidePanel.PanelOptions): void {
  void browser.sidePanel?.setOptions(o).catch(() => {});
}

export const enableFor = (tabId: number) =>
  setOptions({ tabId, path: panelPath(tabId), enabled: true });
export const disableFor = (tabId: number) => setOptions({ tabId, enabled: false });

/** Port of ye: close the tab's detached window, if any. */
export async function dock(tabId: number): Promise<void> {
  await ready;
  const w = detached.get(tabId);
  if (w === undefined) return;
  forget(tabId);
  await browser.windows.remove(w).catch(() => {});
}

/** Script turned off / closed in `tabId` (1.36, 1.37): no panel, no window, panel shows empty. */
export async function closePanelFor(tabId: number): Promise<void> {
  disableFor(tabId);
  await dock(tabId);
  await sendToTabPanel(tabId, 'clear').catch(() => {});
}

/** Port of be (background.js:4707). */
async function detach(tabId: number, size: { width: number; height: number } | null) {
  await ready;
  const existing = detached.get(tabId);
  if (existing !== undefined) {
    try {
      await browser.windows.update(existing, { focused: true });
      return;
    } catch {
      forget(tabId);
    }
  }
  const saved = await boundsItem.getValue();
  const b = detachBounds(saved, size);
  const win = await browser.windows.create({
    url: browser.runtime.getURL(`/${panelPath(tabId, true)}`),
    type: 'popup',
    focused: true,
    ...b,
  });
  if (win?.id === undefined) throw new Error('window not created');
  detached.set(tabId, win.id);
  created.set(win.id, { width: win.width ?? b.width, height: win.height ?? b.height });
  save();
  // the browser may refuse the saved position (off-screen): remember where it really went
  if (
    Number.isFinite(win.left) &&
    Number.isFinite(win.top) &&
    (win.left !== b.left || win.top !== b.top)
  )
    void boundsItem.setValue({ ...saved, left: win.left, top: win.top }).catch(() => {});
  disableFor(tabId);
}

const NO_API = 'Side panel API not available in this browser';

/**
 * Handlers merged into the background table. open_side_panel / dock_panel must reach
 * sidePanel.open before any await (user gesture): they run in `sync` mode and only read the
 * already-loaded `detached` map.
 */
export const panelHandlers: Handlers<BackgroundApi> = {
  open_side_panel(sender) {
    const tabId = sender.tab?.id;
    if (tabId === undefined) return { success: false, error: 'No tab ID' };
    const w = detached.get(tabId);
    if (w !== undefined)
      return browser.windows.update(w, { focused: true }).then(
        () => ({ success: true }),
        () => {
          forget(tabId);
          return { success: false };
        },
      );
    if (!browser.sidePanel) return { success: false, error: NO_API };
    setOptions({ tabId, path: panelPath(tabId), enabled: true });
    return browser.sidePanel.open({ tabId }).then(
      () => ({ success: true }),
      (e: Error) => ({ success: false, error: e.message }),
    );
  },
  async close_side_panel(sender) {
    const tabId = sender.tab?.id;
    if (tabId === undefined) return { success: false };
    const w = detached.get(tabId);
    if (w !== undefined)
      return browser.windows.update(w, { focused: true }).then(
        () => ({ success: true }),
        () => ({ success: false }),
      );
    return sendToTabPanel(tabId, 'close').then(
      () => ({ success: true }),
      () => ({ success: false }),
    );
  },
  async detach_panel(tabId, size) {
    const id = Number(tabId);
    if (!id) return { success: false };
    try {
      await detach(id, { width: Number(size?.width), height: Number(size?.height) });
      return { success: true };
    } catch (e) {
      return { success: false, error: String((e as Error)?.message ?? e) };
    }
  },
  dock_panel(tabId) {
    const id = Number(tabId);
    if (!id || !browser.sidePanel) return { success: false };
    setOptions({ tabId: id, path: panelPath(id), enabled: true });
    return Promise.resolve(browser.sidePanel.open({ tabId: id }))
      .then(() => dock(id))
      .then(
        () => ({ success: true }),
        (e: Error) => ({ success: false, error: String(e?.message ?? e) }),
      );
  },
  check_panel_api: () => !!browser.sidePanel,
  has_host_permission: () => browser.permissions.contains({ origins: ['<all_urls>'] }),
  get_tab_id: (sender) => sender.tab?.id,
  async go_to_tab(tabId) {
    try {
      const tab = await browser.tabs.update(Number(tabId), { active: true });
      if (tab?.windowId !== undefined)
        await browser.windows.update(tab.windowId, { focused: true });
      return true;
    } catch {
      return false;
    }
  },
  async open_external_tab(url, sender) {
    if (typeof url !== 'string' || !/^https?:/i.test(url)) return false;
    const opts: Browser.tabs.CreateProperties = { url, active: true };
    if (sender.tab?.id !== undefined) {
      opts.openerTabId = sender.tab.id;
      if (typeof sender.tab.index === 'number') opts.index = sender.tab.index + 1;
    }
    return browser.tabs.create(opts).then(
      () => true,
      () => false,
    );
  },
  /** 7.01: the detector's return value is the result; a page cannot forge it via postMessage. */
  async run_tech_detection(sender) {
    const tabId = sender.tab?.id;
    if (tabId === undefined) return { success: false, error: 'No tab ID' };
    try {
      const [r] = await browser.scripting.executeScript({
        target: { tabId, frameIds: [sender.frameId ?? 0] },
        files: ['/detect-technologies.js'],
        world: 'MAIN',
      });
      const technologies = Array.isArray(r?.result) ? (r.result as Technology[]) : [];
      return { success: true, technologies };
    } catch (e) {
      return { success: false, error: String((e as Error)?.message ?? e) };
    }
  },
  async fetch_stylesheet(url) {
    if (!(await browser.permissions.contains({ origins: ['<all_urls>'] })))
      return { ok: false, error: 'no permission' };
    return fetchStylesheet(url);
  },
};

/** Port of Ce (background.js:5344): the panel follows the script state of the active tab. */
async function onActivated({ tabId, windowId }: { tabId: number; windowId: number }) {
  await ready;
  if ([...detached.values()].includes(windowId)) return;
  const r = await sendToTab(tabId, 'check_script_is_active').catch(() => undefined);
  if (r?.scriptIsActive) return enableFor(tabId);
  disableFor(tabId);
  await sendToTabPanel(tabId, 'clear').catch(() => {});
}

async function onWindowRemoved(windowId: number) {
  created.delete(windowId);
  await ready;
  for (const [tabId, w] of detached) {
    if (w !== windowId) continue;
    forget(tabId);
    const r = await sendToTab(tabId, 'check_script_is_active').catch(() => undefined);
    if (r?.scriptIsActive) enableFor(tabId);
  }
}

/** Port of :3872: remember where the detached window was moved / resized to (7.06). */
async function onBoundsChanged(win: Browser.windows.Window) {
  await ready;
  if (win.id === undefined || ![...detached.values()].includes(win.id)) return;
  const was = created.get(win.id);
  const resized = !was || was.width !== win.width || was.height !== win.height;
  const next: Partial<Bounds> = { ...(await boundsItem.getValue()), left: win.left, top: win.top };
  if (resized) Object.assign(next, { width: win.width, height: win.height });
  await boundsItem.setValue(next).catch(() => {});
}

/** onInstalled / onStartup (tách từ 1.06): no panel anywhere until a tab turns the script on. */
export async function setupPanels(): Promise<void> {
  if (!browser.sidePanel) return;
  await browser.sidePanel.setOptions({ enabled: false });
  await browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
}

/** Loads the detached map first (legacy he), then wires the tab / window listeners. */
export function initPanels(): void {
  detached.clear();
  ready = detachedItem
    .getValue()
    .then((m) => {
      for (const [tab, w] of Object.entries(m))
        if (!detached.has(Number(tab))) detached.set(Number(tab), w);
    })
    .catch(() => {});
  browser.tabs.onActivated.addListener((info) => void onActivated(info));
  browser.tabs.onRemoved.addListener((tabId) => void dock(tabId));
  browser.windows.onRemoved.addListener((id) => void onWindowRemoved(id));
  browser.windows.onBoundsChanged?.addListener((w) => void onBoundsChanged(w));
}
