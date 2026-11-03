import { browser, type Browser } from '#imports';
import type { DeviceRect } from './capture-bg';
import type { ElementDetails, Issue, MatchedRule } from './element/types';
import type { PageData, PageWeight, Technology } from './page/types';

export type CaptureResult =
  { success: true; dataUrl: string } | { success: false; error: 'INVALID_URL' | 'CAPTURE_FAILED' };
export interface FullCaptureOpts {
  width: number;
  height: number;
  dpr: number;
  chunk: number;
  /** The page is pushed down this much (`before`) so the cover sits above the captured area. */
  shift: number;
  before?: string;
  after?: string;
  restore?: string;
}
export type FullCaptureResult = { ok: true; parts: string[] } | { ok: false; error: string };

export interface BackgroundApi {
  close_extension(): void;
  request_clipboard_permission(): boolean;
  capture_tab(rect: DeviceRect | null): CaptureResult;
  full_capture(opts: FullCaptureOpts): FullCaptureResult;
  get_tab_id(): number | undefined;
  go_to_tab(tabId: number): boolean;
  open_external_tab(url: string): boolean;
  open_side_panel(): { success: boolean; error?: string };
  close_side_panel(): { success: boolean };
  check_panel_api(): boolean;
  has_host_permission(): boolean;
  detach_panel(
    tabId: number,
    size: { width: number; height: number },
  ): { success: boolean; error?: string };
  dock_panel(tabId: number): { success: boolean; error?: string };
  fetch_stylesheet(
    url: string,
  ): { ok: true; text: string; finalUrl: string } | { ok: false; error: string };
  run_tech_detection():
    { success: true; technologies: Technology[] } | { success: false; error: string };
}
export interface ContentApi {
  ping(): { active: boolean };
  toggle_script(): { active: boolean };
  /** `id` (data-sr-id-*) comes from the side panel; the keyboard command sends none. */
  select_parent(id?: string): void;
  select_child(id?: string): void;
  save_screenshot(): void;
  /** Panel → page (legacy `editor` / `script` targets). Sends page_data + selection back (9.38). */
  side_panel_loaded(): void;
  refresh_page_data(): void;
  page_weight_subscribe(): void;
  page_weight_unsubscribe(): void;
  highlight_hovered(id: string): void;
  remove_highlight_hovered(): void;
  go_to_selected_element(id?: string): boolean;
  get_host_name(): string;
  get_url(): string;
  highlight_issue_element(id: string): void;
  highlight_elements_for_color(color: string): void;
  highlight_elements_for_typography(key: string): void;
  highlight_elements_for_issue(issueId: string): void;
  clear_element_highlights(): void;
  keyboard_shortcut(key: string): void;
  get_matched_rules(): {
    success: boolean;
    matchedRules: MatchedRule[];
    skippedCrossOriginCount?: number;
  };
  enable_cross_origin_styles(): { success: boolean };
  check_script_is_active(): { scriptIsActive: boolean };
}
export interface SidePanelApi {
  ping(): { isOpen: true };
  tab_specific_ping(): { isOpen: true };
  content_script_loaded(): void;
  close(): void;
  select_element(d: ElementDetails): void;
  update_canvas_fps(fps: number): void;
  page_data(d: PageData): void;
  page_technologies(t: Technology[]): void;
  page_weight_update(w: PageWeight): void;
  update_issues(issues: Issue[]): void;
  clear(): void;
}

type Handlers<A extends object> = {
  [K in keyof A]?: A[K] extends (...a: infer P) => infer R
    ? (...a: [...P, sender: Browser.runtime.MessageSender]) => R | Promise<R>
    : never;
};

type Target = 'background' | 'content' | 'sidepanel';
type ApiOf<T extends Target> = T extends 'background'
  ? BackgroundApi
  : T extends 'content'
    ? ContentApi
    : SidePanelApi;
interface Packet {
  target: Target;
  type: string;
  data: unknown[];
}

export function sendToBackground<K extends keyof BackgroundApi>(
  type: K,
  ...data: Parameters<BackgroundApi[K]>
): Promise<ReturnType<BackgroundApi[K]>> {
  const packet: Packet = { target: 'background', type, data };
  return browser.runtime.sendMessage(packet);
}

export function sendToTab<K extends keyof ContentApi>(
  tabId: number,
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<ReturnType<ContentApi[K]>> {
  const packet: Packet = { target: 'content', type, data };
  return browser.tabs.sendMessage(tabId, packet);
}

/** Like sendToTab but to one frame; the side panel always talks to frame 0. */
export function sendToFrame<K extends keyof ContentApi>(
  tabId: number,
  frameId: number,
  type: K,
  ...data: Parameters<ContentApi[K]>
): Promise<ReturnType<ContentApi[K]>> {
  const packet: Packet = { target: 'content', type, data };
  return browser.tabs.sendMessage(tabId, packet, { frameId });
}

/** No panel open is normal: "Receiving end does not exist" resolves undefined. */
export async function sendToSidePanel<K extends keyof SidePanelApi>(
  type: K,
  ...data: Parameters<SidePanelApi[K]>
): Promise<ReturnType<SidePanelApi[K]> | undefined> {
  const packet: Packet = { target: 'sidepanel', type, data };
  try {
    return await browser.runtime.sendMessage(packet);
  } catch (e) {
    if (/Receiving end does not exist/.test(String((e as Error)?.message ?? e))) return undefined;
    throw e;
  }
}

export function handleMessages<T extends Target>(
  target: T,
  handlers: Handlers<ApiOf<T>>,
  signal?: AbortSignal,
  opts: { accept?: (sender: Browser.runtime.MessageSender) => boolean } = {},
): void {
  const table = handlers as unknown as Record<string, (...a: unknown[]) => unknown>;
  const listener = (msg: unknown, sender: unknown, sendResponse: (r?: unknown) => void) => {
    const p = msg as Packet | null;
    if (!p || p.target !== target || !Object.hasOwn(table, p.type)) return false; // unknown: no reply
    // several panels listen at once (one per tab + detached windows): only the addressee answers
    if (opts.accept?.(sender as Browser.runtime.MessageSender) === false) return false;
    Promise.resolve()
      .then(() => table[p.type]!(...(p.data ?? []), sender))
      .then(sendResponse, (e) => {
        console.error(`[bo-doi] handler "${p.type}" failed`, e);
        sendResponse(undefined); // ponytail: sender gets undefined, not a hung promise
      });
    return true;
  };
  browser.runtime.onMessage.addListener(listener);
  signal?.addEventListener('abort', () => browser.runtime.onMessage.removeListener(listener), {
    once: true,
  });
}
