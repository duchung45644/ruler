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
import { applyDocTheme, type ThemePref } from '../../lib/theme';
import {
  changesInvalidated,
  clearEdit,
  edit,
  takeEditDetails,
  takeExtras,
  takeState,
} from './edit/edit-store.svelte';

export type PanelTab = 'element' | 'page' | 'changes';

export const panel = $state({
  tabId: null as number | null,
  detached: false,
  /** Detaching / docking: every message is ignored (legacy Yo). */
  switching: false,
  visible: true,
  selectedTab: 'element' as PanelTab,
  element: null as ElementDetails | null,
  canvasFps: null as number | null,
  issues: null as Issue[] | null,
  page: null as PageData | null,
  technologies: null as Technology[] | null,
  weight: null as PageWeight | null,
  prefs: DEFAULT_PANEL_PREFS,
  /** commands.getAll: name → shortcut ('' when unassigned). */
  shortcuts: {} as Record<string, string | undefined>,
  /** A responsive frame is blocked (Q4): show the host-permission grant on top. */
  hostGrant: false,
  /** Frame toPage talks to: a responsive frame once it sends a selection, else 0 (Task 12). */
  frameId: 0,
  /** Responsive view is on in the tab (6.51): only then do non-zero frames get through. */
  responsive: false,
});

/** Back to the page itself: responsive off, tab navigating. */
function leaveFrames(): void {
  const wasFrame = panel.frameId !== 0;
  panel.responsive = false;
  panel.frameId = 0;
  if (wasFrame) {
    dropSelection();
    reloadPageData();
  }
}

/** Frame whose page data (meta, SEO audit, technologies) the Page tab shows. */
const pageFrame = () => (panel.responsive ? panel.frameId : 0);

/** Drop the shown page data and ask the frame it now comes from. */
function reloadPageData(): void {
  panel.page = null;
  panel.technologies = null;
  void toPageData('refresh_page_data');
}

function dropSelection(): void {
  panel.element = null;
  panel.issues = null;
  panel.canvasFps = null;
  clearEdit();
}

const frameOf = (s: Browser.runtime.MessageSender) => s.frameId ?? 0;
/** Selection-bound messages only count from the frame the panel follows. */
const fromSelected = (s: Browser.runtime.MessageSender) => frameOf(s) === panel.frameId;

export const handoffKey = (tabId: number) => `session:panelHandoff:${tabId}` as const;

/** To the frame holding the selection: 0, or a responsive frame (Task 12). */
export function toPage<K extends keyof ContentApi>(
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<ReturnType<ContentApi[K]> | undefined> {
  return toFrame(panel.frameId, type, ...data);
}

/**
 * Page data (meta, SEO audit, technologies): the responsive frame the panel follows, else the top
 * frame, routed like toPage so a frame's audit never shows the shell's results.
 */
export function toPageData<K extends keyof ContentApi>(
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<ReturnType<ContentApi[K]> | undefined> {
  return toFrame(pageFrame(), type, ...data);
}

/** Top-frame data (page weight, the session's own handshake). */
export function toTop<K extends keyof ContentApi>(
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<ReturnType<ContentApi[K]> | undefined> {
  return toFrame(0, type, ...data);
}

function toFrame<K extends keyof ContentApi>(
  frameId: number,
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<ReturnType<ContentApi[K]> | undefined> {
  if (panel.tabId === null) return Promise.resolve(undefined);
  return sendToFrame(panel.tabId, frameId, type, ...data).catch(() => undefined);
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

const applyTheme = (pref: ThemePref, mql: MediaQueryList | null) =>
  applyDocTheme(document, pref, mql);

const announce = () =>
  setTimeout(() => {
    void toTop('side_panel_loaded');
    if (panel.frameId !== 0) void toPage('side_panel_loaded'); // detached handoff: the frame resends
  }, 50);

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
      content_script_loaded(sender) {
        connect();
        // a responsive frame loading must not re-ask the page for its data
        if (frameOf(sender) === 0) void toTop('side_panel_loaded');
        else if (fromSelected(sender)) void toPage('side_panel_loaded');
      },
      close: () => window.close(),
      select_element(d, sender) {
        const moved = frameOf(sender) !== panel.frameId;
        panel.frameId = frameOf(sender);
        if (moved && panel.responsive) reloadPageData();
        panel.element = d;
        panel.issues = d.issues ?? null;
        panel.canvasFps = null;
        takeEditDetails(d);
      },
      update_canvas_fps(fps, sender) {
        if (fromSelected(sender)) panel.canvasFps = fps;
      },
      page_data(d, sender) {
        if (frameOf(sender) === pageFrame()) panel.page = d;
      },
      page_technologies(t, sender) {
        if (frameOf(sender) === pageFrame()) panel.technologies = t;
      },
      page_weight_update(w) {
        if (panel.selectedTab === 'page') panel.weight = w;
      },
      update_issues(i, sender) {
        if (fromSelected(sender)) panel.issues = i;
      },
      clear(sender) {
        if (fromSelected(sender)) dropSelection();
      },
      edit_payload_extras(seq, inherited, sender) {
        if (fromSelected(sender)) takeExtras(seq, inherited);
      },
      media_activity(active, sender) {
        if (fromSelected(sender) && active && typeof active === 'object')
          edit.mediaActive = { ...edit.mediaActive, ...active };
      },
      edit_state(s, sender) {
        if (fromSelected(sender)) takeState(s);
      },
      refresh_changes(sender) {
        if (fromSelected(sender)) changesInvalidated();
      },
      page_updated(sender) {
        if (fromSelected(sender)) edit.changes = null;
      },
      responsive_state(s, sender) {
        if (frameOf(sender) !== 0) return; // the top frame's shell only (6.51)
        if (s?.on) panel.responsive = true;
        else leaveFrames();
      },
      show_host_grant() {
        panel.selectedTab = 'element';
        panel.hostGrant = true;
        return true;
      },
    },
    signal,
    {
      accept: (s, tabId) =>
        !panel.switching &&
        panel.tabId !== null &&
        (s.tab?.id ?? tabId) === panel.tabId &&
        (frameOf(s) === 0 || panel.responsive),
    },
  );

  // legacy Si (sidepanel.js:13180): a navigating tab drops its page data and asks again at once
  const onUpdated = (id: number, info: Browser.tabs.OnUpdatedInfo) => {
    if (id !== panel.tabId || info.status !== 'loading') return;
    leaveFrames();
    panel.page = null;
    panel.technologies = null;
    panel.weight = null;
    void toTop('refresh_page_data');
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
    if (h.responsive) {
      panel.responsive = true;
      panel.frameId = Number.isInteger(h.frameId) && h.frameId! > 0 ? h.frameId! : 0;
    }
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
  const handoff: Handoff = {
    selectedTab: panel.selectedTab,
    scrollTop,
    at: Date.now(),
    frameId: panel.frameId,
    responsive: panel.responsive,
  };
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
