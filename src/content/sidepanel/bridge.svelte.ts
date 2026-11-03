import { browser, type Browser } from '#imports';
import { i18n } from '#i18n';
import {
  sendToBackground,
  sendToSidePanel,
  type ContentApi,
  type Handlers,
} from '../../lib/messaging';
import { ensureElementId, ID_ATTR, resolveElementById } from '../../lib/selector';
import { alertDialog } from '../core/dialog';
import { runShortcut } from '../core/keys';
import { onStop, sessionSignal } from '../core/session';
import { state } from '../core/state.svelte';
import { selectChild, selectElement, selectParent } from '../tools/inspector';
import { collectElementDetails } from './details';
import { clearHighlights, highlight, repaintHighlights } from './highlight';

export const bridge = $state({ panelOpen: false, panelApi: true });

/** id → element; ids stay on the page after quit, as in legacy (decision #5). */
const ids = new Map<string, WeakRef<Element>>();
const attr = () => ID_ATTR(browser.runtime.id);
export const elementId = (el: Element) => ensureElementId(el, attr(), ids);
export const elementById = (id: string) => resolveElementById(id, attr(), ids);

let pending: Element | null = null;

/** Selection → panel, once per microtask so a burst of selects sends only the last (6.09). */
export function sendElement(el: Element): void {
  const queued = pending;
  pending = el;
  if (queued) return;
  queueMicrotask(() => {
    const target = pending;
    pending = null;
    if (!target?.isConnected) return;
    void sendToSidePanel('select_element', collectElementDetails(target, elementId)).catch(
      () => {},
    );
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
}

/** Select `id` first when the panel names an element (2.19). */
function withId(id: string | undefined, then: () => void): void {
  const el = id ? elementById(id) : null;
  if (el) selectElement(el);
  then();
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
  clear_element_highlights: () => clearHighlights(),
  async go_to_selected_element(id) {
    const el = id ? elementById(id) : state.selected;
    if (!el?.isConnected) {
      await alertDialog(
        i18n.t('dialog.elementNotFoundTitle'),
        i18n.t('dialog.issueElementNotFound'),
      );
      return false;
    }
    selectElement(el, { scroll: true });
    return true;
  },
  get_host_name: () => location.hostname,
  get_url: () => location.href,
  check_script_is_active: () => ({ scriptIsActive: state.active }),
  side_panel_loaded() {
    if (state.active && state.selected) sendElement(state.selected);
  },
  keyboard_shortcut(key) {
    if (state.active) runShortcut(key);
  },
};

/** Per session: called from initTools (after startSession). */
export async function initSidePanelBridge(): Promise<void> {
  const signal = sessionSignal();
  browser.runtime.onConnect.addListener(onConnect);
  signal.addEventListener('abort', () => browser.runtime.onConnect.removeListener(onConnect), {
    once: true,
  });
  window.addEventListener('scroll', repaintHighlights, { signal, passive: true, capture: true });

  const stopEffect = $effect.root(() => {
    $effect(() => {
      const el = state.selected;
      const open = bridge.panelOpen;
      if (el && open) sendElement(el);
      else if (!el) void sendToSidePanel('clear').catch(() => {});
    });
  });
  onStop(() => {
    stopEffect();
    clearHighlights();
    void sendToSidePanel('clear').catch(() => {});
  });
  void sendToSidePanel('content_script_loaded').catch(() => {});
  bridge.panelApi = (await sendToBackground('check_panel_api').catch(() => true)) !== false;
}
