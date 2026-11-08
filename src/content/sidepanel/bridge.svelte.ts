import { browser, type Browser } from '#imports';
import type { ElementDetails } from '../../lib/element/types';
import { i18n } from '#i18n';
import {
  sendToBackground,
  sendToSidePanel,
  type ContentApi,
  type Handlers,
} from '../../lib/ext/messaging';
import { ensureElementId, ID_ATTR, resolveElementById } from '../../lib/dom/selector';
import { alertDialog } from '../core/dialog';
import { runShortcut } from '../core/keys';
import { onStop, sessionSignal } from '../core/session';
import { requestPaint } from '../core/overlay';
import { state } from '../core/state.svelte';
import { selectChild, selectElement, selectParent } from '../tools/inspector';
import { collectElementDetails, styleMap } from './details';
import {
  canHighlight,
  clearHighlights,
  highlight,
  highlightForColor,
  highlightForTypography,
  repaintHighlights,
} from './highlight';
import { currentIssues, stopIssues } from './issues';
import {
  getPageData,
  initPageData,
  refreshPageData,
  subscribeWeight,
  unsubscribeWeight,
} from './page';
import { enableCrossOriginStyles, getMatchedRules } from './rules';

export const bridge = $state({ panelOpen: false, panelApi: true });

/** id → element; ids stay on the page after quit, as in legacy (decision #5). */
const ids = new Map<string, WeakRef<Element>>();
/** Shared with the edit engine so both resolve the same ids. */
export const elementIdMap = () => ids;
const attr = () => ID_ATTR(browser.runtime.id);
export const elementId = (el: Element) => ensureElementId(el, attr(), ids);
export const elementById = (id: string) => resolveElementById(id, attr(), ids);

let pending: Element | null = null;

interface EditHooks {
  /** Edit-mode extras for select_element (6.49); undefined outside edit mode. */
  details(el: Element): ElementDetails['edit'];
  /** Selection dropped: stop the per-selection watchers. */
  clear(): void;
}
// set by the edit module, which depends on this bridge (not the other way round)
let editHooks: EditHooks | null = null;
export const setEditHooks = (h: EditHooks | null) => (editHooks = h);

// a responsive frame tells its shell, which drops the other frames' selections (8.19)
let selectionHook: ((selected: boolean) => void) | null = null;
export const setSelectionHook = (h: ((selected: boolean) => void) | null) => (selectionHook = h);

/** Selection → panel, once per microtask so a burst of selects sends only the last (6.09). */
export function sendElement(el: Element): void {
  const queued = pending;
  pending = el;
  if (queued) return;
  queueMicrotask(() => {
    const target = pending;
    pending = null;
    if (!target?.isConnected) return;
    const details = collectElementDetails(target, elementId);
    const edit = editHooks?.details(target);
    if (edit) details.edit = edit;
    void sendToSidePanel('select_element', details).catch(() => {});
  });
}

/** Port of toggleSidePanel (content.js:39108): an answering panel closes, else open one. */
export async function toggleSidePanel(): Promise<void> {
  const r = await sendToSidePanel('tab_specific_ping').catch(() => undefined);
  if (r?.isOpen === true) await sendToBackground('close_side_panel').catch(() => {});
  else await sendToBackground('open_side_panel').catch(() => {});
}

function onConnect(port: Browser.runtime.Port): void {
  if (!port.name.startsWith('sidepanel_')) return;
  bridge.panelOpen = true;
  // the panel page going away replaces legacy side_panel_closed (6.14, 9.32)
  port.onDisconnect.addListener(() => {
    bridge.panelOpen = false;
    clearHighlights();
  });
  void autoEnableCrossOrigin();
}

let crossOriginTried = false;

/** First panel open with <all_urls> granted: read cross-origin sheets without asking (6.26). */
async function autoEnableCrossOrigin(): Promise<void> {
  if (crossOriginTried) return;
  crossOriginTried = true;
  if (await sendToBackground('has_host_permission').catch(() => false)) await enableCrossOrigin();
}

async function enableCrossOrigin(): Promise<{ success: boolean }> {
  const r = await enableCrossOriginStyles(state.selected);
  // the skipped count in the panel is stale now
  if (state.selected && bridge.panelOpen) sendElement(state.selected);
  return r;
}

/** Select `id` first when the panel names an element (2.19). */
function withId(id: string | undefined, then: () => void): void {
  const el = id ? elementById(id) : null;
  if (el) selectElement(el);
  then();
}

const notFound = () =>
  alertDialog(i18n.t('dialog.elementNotFoundTitle'), i18n.t('dialog.issueElementNotFound'));

/** Drop everything derived from the last selection. */
function forgetSelection(): void {
  stopIssues();
  styleMap.clear();
  clearHighlights();
}

/** ContentApi handlers the panel uses, merged into the entrypoint's table. */
export const sidePanelHandlers: Handlers<ContentApi> = {
  select_parent: (id) => withId(typeof id === 'string' ? id : undefined, selectParent),
  select_child: (id) => withId(typeof id === 'string' ? id : undefined, selectChild),
  highlight_hovered(id) {
    const el = state.active && elementById(id);
    if (el) highlight([el]);
  },
  remove_highlight_hovered: () => clearHighlights(),
  highlight_box_part(part) {
    state.boxPart = ['margin', 'border', 'padding', 'content'].includes(part as string)
      ? part
      : null;
    requestPaint();
  },
  clear_element_highlights: () => clearHighlights(),
  highlight_elements_for_color: (color) => highlightForColor(styleMap, color),
  highlight_elements_for_typography: (key) => highlightForTypography(styleMap, key),
  highlight_elements_for_issue(issueId) {
    const ids = currentIssues().find((i) => i.id === issueId)?.elementIds ?? [];
    highlight(ids.map(elementById).filter((el): el is Element => !!el && canHighlight(el)));
  },
  /** Port of highlightIssueElement: frame and scroll to one instance (6.35, 2.20). */
  async highlight_issue_element(id) {
    if (state.responsiveOn || state.inFrame) return; // ignored in responsive view (2.26)
    const el = elementById(id);
    if (!el?.isConnected) {
      await notFound();
      return;
    }
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    highlight([el]);
  },
  async go_to_selected_element(id) {
    const el = id ? elementById(id) : state.selected;
    if (!el?.isConnected) {
      await notFound();
      return false;
    }
    selectElement(el, { scroll: true });
    return true;
  },
  get_host_name: () => location.hostname,
  get_url: () => location.href,
  check_script_is_active: () => ({ scriptIsActive: state.active }),
  side_panel_loaded() {
    if (!state.active) return;
    // the panel only asks a responsive frame when it follows that frame: its own page data (gap 3)
    getPageData();
    // a panel opened after entering responsive must learn it, or it drops the frames' messages
    if (state.responsiveOn && !state.inFrame)
      void sendToSidePanel('responsive_state', { on: true }).catch(() => {});
    if (state.selected) sendElement(state.selected);
  },
  refresh_page_data() {
    if (state.active) refreshPageData(); // a responsive frame too, when the panel follows it
  },
  page_weight_subscribe() {
    if (!state.inFrame) subscribeWeight();
  },
  page_weight_unsubscribe() {
    if (!state.inFrame) unsubscribeWeight();
  },
  get_matched_rules: () => getMatchedRules(state.selected),
  enable_cross_origin_styles: () => enableCrossOrigin(),
  keyboard_shortcut(key) {
    if (state.active) runShortcut(key);
  },
};

/** Per session: called from initTools (after startSession). */
export async function initSidePanelBridge(): Promise<void> {
  const signal = sessionSignal();
  // frames are created after the panel connected its port, so they never see onConnect: they
  // always send (a closed panel just rejects, which is caught)
  if (state.inFrame) bridge.panelOpen = true;
  browser.runtime.onConnect.addListener(onConnect);
  signal.addEventListener('abort', () => browser.runtime.onConnect.removeListener(onConnect), {
    once: true,
  });
  window.addEventListener('scroll', repaintHighlights, { signal, passive: true, capture: true });
  initPageData(elementId);

  const stopEffect = $effect.root(() => {
    $effect(() => {
      const el = state.selected;
      const open = bridge.panelOpen;
      selectionHook?.(!!el);
      if (el && open) sendElement(el);
      else if (!el) {
        forgetSelection();
        editHooks?.clear();
        void sendToSidePanel('clear').catch(() => {});
      }
    });
  });
  onStop(() => {
    stopEffect();
    forgetSelection();
    void sendToSidePanel('clear').catch(() => {});
  });
  void sendToSidePanel('content_script_loaded').catch(() => {});
  bridge.panelApi = (await sendToBackground('check_panel_api').catch(() => true)) !== false;
}
