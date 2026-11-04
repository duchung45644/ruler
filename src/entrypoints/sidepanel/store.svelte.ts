import { browser, storage, type Browser } from '#imports';
import type { ElementDetails, Issue } from '../../lib/element/types';
import {
  handleMessages,
  sendToBackground,
  sendToFrame,
  type ContentApi,
} from '../../lib/messaging';
import type { PageData, PageWeight, Technology } from '../../lib/page/types';
import { readHandoff, type Handoff } from '../../lib/panels';
import {
  DEFAULT_PANEL_PREFS,
  getPanelPrefs,
  panelPrefsItem,
  mergePanelPrefs,
  themePref,
} from '../../lib/settings';
import type { ThemePref } from '../../lib/theme';
import {
  changesInvalidated,
  clearEdit,
  edit,
  takeEditDetails,
  takeExtras,
  takeState,
} from './edit/edit-store.svelte';

export type PanelTab = 'element' | 'page';

export const panel = $state({
  tabId: null as number | null,
  detached: false,
  /** Detaching / docking: every message is ignored (legacy Yo). */
  switching: false,
  visible: true,
  selectedTab: 'element' as PanelTab,
  mode: 'inspect' as 'inspect' | 'edit',
  element: null as ElementDetails | null,
  canvasFps: null as number | null,
  issues: null as Issue[] | null,
  page: null as PageData | null,
  technologies: null as Technology[] | null,
  weight: null as PageWeight | null,
  prefs: DEFAULT_PANEL_PREFS,
  /** commands.getAll: name → shortcut ('' when unassigned). */
  shortcuts: {} as Record<string, string | undefined>,
});

export const handoffKey = (tabId: number) => `session:panelHandoff:${tabId}` as const;

/** Content script answers on frame 0 only; responsive frames come in phase 6. */
export function toPage<K extends keyof ContentApi>(
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<ReturnType<ContentApi[K]> | undefined> {
  if (panel.tabId === null) return Promise.resolve(undefined);
  return sendToFrame(panel.tabId, 0, type, ...data).catch(() => undefined);
}

let port: Browser.runtime.Port | null = null;
function connect(): void {
  if (panel.tabId === null) return;
  try {
    port?.disconnect();
  } catch {
    // already gone
  }
  try {
    // content sees panelOpen while this port lives (9.32, replaces side_panel_closed)
    port = browser.tabs.connect(panel.tabId, { name: `sidepanel_${Date.now()}` });
    port.onDisconnect.addListener(() => (port = null));
  } catch {
    port = null;
  }
}

function applyTheme(pref: ThemePref, mql: MediaQueryList | null): void {
  const dark = pref === 'system' ? (mql?.matches ?? true) : pref === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

const announce = () => setTimeout(() => void toPage('side_panel_loaded'), 50);

/** Port of Ni / ki (sidepanel.js:12987): wires everything to `signal`, read on App destroy. */
export async function startPanel(signal: AbortSignal, search = location.search): Promise<void> {
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- read once, never mutated
  const q = new URLSearchParams(search);
  const id = Number(q.get('tabId'));
  panel.tabId = Number.isInteger(id) && id > 0 ? id : null;
  panel.detached = q.get('detached') === '1';
  panel.visible = document.visibilityState === 'visible';
  if (panel.detached) {
    document.documentElement.classList.add('is-detached');
    // a detached window is named after its tab (7.11)
    if (panel.tabId !== null)
      void browser.tabs.get(panel.tabId).then(
        (t) => void (t?.title && (document.title = t.title)),
        () => {},
      );
  }
  connect();

  handleMessages(
    'sidepanel',
    {
      ping: () => ({ isOpen: true }),
      // no reply from a hidden panel: the page then opens one instead of closing this (legacy)
      tab_specific_ping: () =>
        document.visibilityState === 'visible' ? { isOpen: true } : (undefined as never),
      content_script_loaded() {
        connect();
        void toPage('side_panel_loaded');
      },
      close: () => window.close(),
      select_element(d) {
        panel.element = d;
        panel.issues = d.issues ?? null;
        panel.canvasFps = null;
        takeEditDetails(d);
        // a panel opened while edit mode is on hears no set_mode, only edit details
        if (d.edit) panel.mode = 'edit';
      },
      update_canvas_fps: (fps) => void (panel.canvasFps = fps),
      page_data: (d) => void (panel.page = d),
      page_technologies: (t) => void (panel.technologies = t),
      page_weight_update(w) {
        if (panel.selectedTab === 'page') panel.weight = w;
      },
      update_issues: (i) => void (panel.issues = i),
      clear() {
        panel.element = null;
        panel.issues = null;
        panel.canvasFps = null;
        clearEdit();
      },
      set_mode(mode, sender) {
        // responsive iframes (phase 6) must not flip the panel (6.50)
        if (sender?.frameId !== undefined && sender.frameId !== 0) return;
        panel.mode = mode === 'edit' ? 'edit' : 'inspect';
      },
      edit_payload_extras: (seq, inherited) => takeExtras(seq, inherited),
      media_activity(active) {
        if (active && typeof active === 'object')
          edit.mediaActive = { ...edit.mediaActive, ...active };
      },
      edit_state: (s) => takeState(s),
      refresh_changes: () => changesInvalidated(),
      page_updated: () => void (edit.changes = null),
    },
    signal,
    {
      accept: (s, tabId) =>
        !panel.switching && panel.tabId !== null && (s.tab?.id ?? tabId) === panel.tabId,
    },
  );

  // legacy Si (sidepanel.js:13180): a navigating tab drops its page data and asks again at once
  const onUpdated = (id: number, info: Browser.tabs.OnUpdatedInfo) => {
    if (id !== panel.tabId || info.status !== 'loading') return;
    panel.page = null;
    panel.technologies = null;
    panel.weight = null;
    void toPage('refresh_page_data');
  };
  browser.tabs.onUpdated.addListener(onUpdated);
  signal.addEventListener('abort', () => browser.tabs.onUpdated.removeListener(onUpdated), {
    once: true,
  });

  const onVisibility = () => (panel.visible = document.visibilityState === 'visible');
  document.addEventListener('visibilitychange', onVisibility, { signal });

  const mql = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  let theme: ThemePref = 'system';
  mql?.addEventListener('change', () => applyTheme(theme, mql), { signal });
  const unwatch = [
    themePref.watch((t) => applyTheme((theme = t ?? 'system'), mql)),
    panelPrefsItem.watch((p) => void (panel.prefs = mergePanelPrefs(p))),
  ];
  signal.addEventListener('abort', () => unwatch.forEach((u) => u()), { once: true });

  const [commands, t, prefs, handoff] = await Promise.all([
    browser.commands.getAll().catch(() => []),
    themePref.getValue().catch(() => 'system' as const),
    getPanelPrefs().catch(() => DEFAULT_PANEL_PREFS),
    panel.tabId === null
      ? null
      : storage.getItem<Handoff>(handoffKey(panel.tabId)).catch(() => null),
  ]);
  panel.shortcuts = Object.fromEntries(commands.map((c) => [c.name, c.shortcut]));
  applyTheme((theme = t), mql);
  panel.prefs = prefs;
  const h = readHandoff(handoff, Date.now());
  if (panel.tabId !== null && handoff) void storage.removeItem(handoffKey(panel.tabId));
  if (h) {
    panel.selectedTab = h.selectedTab;
    pendingScroll = h.scrollTop;
  }
  if (panel.tabId !== null && !signal.aborted) {
    const timer = announce();
    signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
  }
}

/** Handoff scroll, restored by App once the restored tab has rendered. */
let pendingScroll: number | null = null;
export function takePendingScroll(): number | null {
  const s = pendingScroll;
  pendingScroll = null;
  return s;
}

/** Port of Bi (sidepanel.js:13380): leave a handoff, then let the background move the panel. */
export async function toggleDetach(scrollTop: number): Promise<void> {
  const tabId = panel.tabId;
  if (tabId === null || panel.switching) return;
  const handoff: Handoff = { selectedTab: panel.selectedTab, scrollTop, at: Date.now() };
  try {
    await storage.setItem(handoffKey(tabId), handoff);
    if (panel.detached) {
      // the background also closes it, unless its window map lost this tab
      const r = await sendToBackground('dock_panel', tabId);
      if (r?.success) {
        panel.switching = true;
        window.close();
      }
    } else {
      const r = await sendToBackground('detach_panel', tabId, {
        width: innerWidth,
        height: outerHeight,
      });
      if (r?.success) {
        panel.switching = true;
        window.close();
      }
    }
  } catch {
    // keep this panel; the handoff expires on its own
  }
}
