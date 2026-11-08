import { browser, type Browser } from '#imports';
import { storage } from '../lib/ext/storage';
import { sendToFrame, sendToTab, type BackgroundApi, type Handlers } from '../lib/ext/messaging';
import type { SerializedEdit } from '../lib/edit/serialize';
import { parseFrameName } from '../lib/responsive/frame-name';

/** Hand-off window after exit (legacy background.js:2296). */
export const HANDOFF_MS = 15_000;
const STRIPPED = [
  'x-frame-options',
  'frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
];

type Mark = { at: number; ruleEdits: SerializedEdit[] };
const markItem = (tabId: number) =>
  storage.defineItem<Mark | null>(`session:responsiveExit:${tabId}`, { fallback: null });

const removeRule = (tabId: number) =>
  browser.declarativeNetRequest.updateSessionRules({ removeRuleIds: [tabId] }).catch(() => {});

/** Tabs whose shell asked for the header rule: they get it (and reload) once access is granted. */
const tabsItem = storage.defineItem<number[]>('session:responsiveTabs', { fallback: [] });
async function track(tabId: number, on: boolean): Promise<void> {
  const tabs = (await tabsItem.getValue().catch(() => [])).filter((t) => t !== tabId);
  if (on) tabs.push(tabId);
  await tabsItem.setValue(tabs).catch(() => {});
}
/** Leaving responsive (exit, tab load, tab closed): no rule, no longer tracked. */
async function forgetTab(tabId: number): Promise<void> {
  await removeRule(tabId);
  await track(tabId, false);
}

/** permissions.onAdded with <all_urls> (8.15): strip headers for every responsive tab, then reload its frames. */
export async function onHostPermissionAdded(origins: string[] | undefined): Promise<void> {
  if (!origins?.includes('<all_urls>')) return;
  for (const tabId of await tabsItem.getValue().catch(() => [])) {
    if (await enableFrameHeaderRule(tabId)) await sendToTab(tabId, 'reload_frames').catch(() => {});
  }
}

/** Port of enable_frame_header_rule (background.js:3421): only with `<all_urls>`. */
export async function enableFrameHeaderRule(tabId: number | undefined): Promise<boolean> {
  if (tabId === undefined || tabId < 1) return false;
  if (!(await browser.permissions.contains({ origins: ['<all_urls>'] }))) return false;
  try {
    await browser.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [tabId],
      addRules: [
        {
          id: tabId,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            responseHeaders: STRIPPED.map((header) => ({ header, operation: 'remove' })),
          },
          condition: { resourceTypes: ['sub_frame'], tabIds: [tabId] },
        } as Browser.declarativeNetRequest.Rule,
      ],
    });
    return true;
  } catch {
    return false;
  }
}

export async function disableFrameHeaderRule(tabId: number | undefined): Promise<void> {
  if (tabId === undefined || tabId < 1) return;
  await forgetTab(tabId);
}

/** SW start: drop rules whose tab is gone (legacy Ne/je). */
export async function cleanupOrphanRules(): Promise<void> {
  const rules = await browser.declarativeNetRequest.getSessionRules();
  if (!rules.length) return;
  const alive = new Set((await browser.tabs.query({})).map((t) => t.id));
  const orphans = rules.map((r) => r.id).filter((id) => !alive.has(id));
  if (orphans.length)
    await browser.declarativeNetRequest.updateSessionRules({ removeRuleIds: orphans });
}

/** 8.05 / 8.06: inject content only into our responsive frames, then start frame mode. */
export async function injectResponsiveFrames(tabId: number): Promise<number[]> {
  const names = await browser.scripting.executeScript({
    target: { tabId, allFrames: true },
    func: () => window.name,
  });
  const ids = names
    .filter((r) => r.frameId !== 0 && parseFrameName(browser.runtime.id, r.result) !== null)
    .map((r) => r.frameId);
  const ok: number[] = [];
  for (const frameId of ids) {
    try {
      await browser.scripting.executeScript({
        target: { tabId, frameIds: [frameId] },
        files: ['/content-scripts/content.js'],
      });
      await sendToFrame(tabId, frameId, 'start_frame_mode');
      ok.push(frameId);
    } catch {
      // cross-origin frame without host access, or frame gone
    }
  }
  return ok;
}

/** Q8: content navigates only when the frame URL differs; the mark resumes after that load. */
export async function exitResponsiveMode(
  tabId: number,
  ruleEdits: SerializedEdit[],
): Promise<void> {
  await forgetTab(tabId);
  await markItem(tabId).setValue({ at: Date.now(), ruleEdits });
}

/** Port of Oe (background.js:5103). */
export async function onTabUpdated(
  tabId: number,
  status: string | undefined,
  activate: (tabId: number) => Promise<void>,
): Promise<void> {
  if (status === 'loading') {
    await forgetTab(tabId); // top-level load: the responsive shell is gone
    return;
  }
  if (status !== 'complete') return;
  const item = markItem(tabId);
  const mark = await item.getValue();
  if (!mark) return;
  await item.removeValue();
  if (Date.now() - mark.at > HANDOFF_MS) return;
  await activate(tabId);
  await sendToTab(tabId, 'apply_pending_rule_edits', mark.ruleEdits).catch(() => {});
}

export function initResponsive(activate: (tabId: number) => Promise<void>): void {
  void cleanupOrphanRules().catch(() => {});
  browser.tabs.onRemoved.addListener((tabId) => {
    void forgetTab(tabId);
    void markItem(tabId)
      .removeValue()
      .catch(() => {});
  });
  browser.tabs.onUpdated.addListener(
    (tabId, info) => void onTabUpdated(tabId, info.status, activate).catch(() => {}),
  );
  browser.permissions.onAdded.addListener(
    (p) => void onHostPermissionAdded(p.origins).catch(() => {}),
  );
}

export const responsiveHandlers: Pick<
  Handlers<BackgroundApi>,
  | 'enable_frame_header_rule'
  | 'disable_frame_header_rule'
  | 'inject_responsive_frames'
  | 'exit_responsive_mode'
> = {
  async enable_frame_header_rule(sender) {
    const tabId = sender.tab?.id;
    if (tabId !== undefined && tabId > 0) await track(tabId, true);
    return enableFrameHeaderRule(tabId);
  },
  disable_frame_header_rule: (sender) => disableFrameHeaderRule(sender.tab?.id),
  inject_responsive_frames: (sender) =>
    sender.tab?.id === undefined ? [] : injectResponsiveFrames(sender.tab.id),
  exit_responsive_mode: async ({ ruleEdits }, sender) => {
    if (sender.tab?.id !== undefined) await exitResponsiveMode(sender.tab.id, ruleEdits);
  },
};
