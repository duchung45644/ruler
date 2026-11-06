import { browser, type Browser } from '#imports';
import type { DeviceRect } from './capture-bg';
import type { ElementDetails, Issue, MatchedRule } from './element/types';
import type { HtmlChange } from './edit/changes';
import type { Decl } from './edit/decls';
import type { RuleAddress } from './edit/rule-address';
import type { SerializedEdit } from './edit/serialize';
import type {
  EditResult,
  EditState,
  EditableRule,
  InsertPosition,
  RuleChange,
  RulePayload,
} from './edit/types';
import type { CallOutcome, McpPageType } from './mcp/protocol';
import type { McpStatus } from './mcp/status';
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
export type AiCapture =
  | { ok: true; dataUrl: string; width: number; height: number }
  | { ok: false; reason: 'capture_failed' | 'script_inactive' };
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
  open_options_page(): void;
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
  // Responsive mode (Đợt 6).
  /** Strips frame-blocking headers for this tab's sub_frames; false without host permission. */
  enable_frame_header_rule(): boolean;
  disable_frame_header_rule(): void;
  /** Injects the content script into the responsive frames; returns their frameIds. */
  inject_responsive_frames(): number[];
  exit_responsive_mode(p: { ruleEdits: SerializedEdit[]; url: string }): void;
  // MCP (Đợt 8). Commands never come this way: only through the authenticated socket.
  mcp_status(): McpStatus;
  /** Turns the stored intent on and dials the local server now (also after a reject). */
  mcp_connect(): McpStatus;
  mcp_disconnect(): McpStatus;
  /** Copy prompt with the pairing token; null unless asked by an extension page or a iodob tab. */
  mcp_prompt(): string | null;
  /** get_screenshot: the sender's visible tab as PNG, longest side ≤ 2000 px (Q6 a). */
  capture_for_ai(): AiCapture;
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
  highlight_box_part(part: 'margin' | 'border' | 'padding' | 'content' | null): void;
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
  // Edit mode (legacy `editor` / `rule_editor` targets, D3). Every edit replies with its EditState.
  edit_undo(): EditResult;
  edit_redo(): EditResult;
  edit_copy(): EditResult;
  edit_cut(): EditResult;
  edit_paste(): EditResult;
  edit_duplicate(): EditResult;
  edit_delete(): EditResult;
  get_history_state(): EditResult;
  set_element_styles(id: string, decls: Decl[]): EditResult;
  set_element_classes(id: string, classes: string): EditResult;
  get_page_classes(): string[];
  /** Html is sanitized on the content side before it touches the DOM. */
  set_text_content(id: string, text: string): EditResult;
  set_inner_html(id: string, html: string): EditResult;
  insert_html(id: string, pos: InsertPosition, html: string): EditResult;
  get_rule_edit_payload(): RulePayload | null;
  cascade_ghost_probe(): string[];
  rule_edit(addr: RuleAddress, declsText: string): EditResult;
  inline_style_edit(id: string, declsText: string): EditResult;
  merge_rule_styles(addr: RuleAddress, decls: Decl[]): EditResult;
  rule_selector_edit(addr: RuleAddress, selector: string): EditResult;
  rule_add(selector?: string): EditResult;
  get_rule_changes(): RuleChange[];
  get_all_flattened_changes(): { rules: RuleChange[]; html: HtmlChange[] };
  get_html_changes(): HtmlChange[];
  revert_rule_change(recordId: string): EditResult;
  revert_all_rule_changes(): EditResult;
  revert_all_edits(): EditResult;
  clear_elements_by_ids(ids: string[], scope: 'all' | 'html' | 'css'): EditResult;
  clear_changes(): EditResult;
  force_element_state(state: string | null): EditResult;
  apply_pending_rule_edits(edits: SerializedEdit[]): EditResult;
  /** Returns whether text editing is now on. */
  toggle_text_edit(): boolean;
  select_edited_element(id: string): boolean;
  select_rule_target(selector: string, scopeAddress: string | null): boolean;
  /** Sent to a responsive frame after injection: boot without dock / panel / settings writes. */
  start_frame_mode(): void;
  /** Host permission granted: the responsive shell reloads every frame (8.15). */
  reload_frames(): void;
  /** Background → tabs with iodob on: MCP connection changed (legacy mcp_status_changed). */
  mcp_status(s: McpStatus): void;
  /**
   * One MCP command for this tab, already validated by the background (lib/mcp/protocol.ts).
   * The only MCP entry into a page; answered by the top frame.
   */
  mcp_call(type: McpPageType, payload: unknown): CallOutcome;
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
  page_weight_update(w: PageWeight | null): void;
  update_issues(issues: Issue[]): void;
  clear(): void;
  // Edit view (legacy `editor_panel` target, D3).
  edit_payload_extras(paySeq: number, inherited: EditableRule[]): void;
  media_activity(active: Record<string, boolean>): void;
  refresh_changes(): void;
  page_updated(): void;
  edit_state(s: EditState): void;
  responsive_state(s: { on: boolean }): void;
  /** Blocked responsive frame (Q4): show and focus the host-permission grant; true = shown. */
  show_host_grant(): boolean;
}

export type Handlers<A extends object> = {
  [K in keyof A]?: A[K] extends (...a: infer P) => infer R
    ? (...a: [...P, sender: Browser.runtime.MessageSender]) => R | Promise<R>
    : never;
};

/** The settings page (Đợt 7) follows background state it cannot read from storage. */
export interface OptionsApi {
  mcp_status(s: McpStatus): void;
}

type Target = 'background' | 'content' | 'sidepanel' | 'options';
type ApiOf<T extends Target> = T extends 'background'
  ? BackgroundApi
  : T extends 'content'
    ? ContentApi
    : T extends 'options'
      ? OptionsApi
      : SidePanelApi;
interface Packet {
  target: Target;
  type: string;
  data: unknown[];
  /** Background → panel: the tab the message is about (it has no sender tab). */
  tabId?: number;
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
export function sendToSidePanel<K extends keyof SidePanelApi>(
  type: K,
  ...data: Parameters<SidePanelApi[K]>
): Promise<ReturnType<SidePanelApi[K]> | undefined> {
  return postToPanel({ target: 'sidepanel', type, data });
}

/** From the background, which has no tab: the panel of `tabId` accepts it. */
export function sendToTabPanel<K extends keyof SidePanelApi>(
  tabId: number,
  type: K,
  ...data: Parameters<SidePanelApi[K]>
): Promise<ReturnType<SidePanelApi[K]> | undefined> {
  return postToPanel({ target: 'sidepanel', type, data, tabId });
}

/** Background → open settings pages; none open is normal. */
export function sendToOptions<K extends keyof OptionsApi>(
  type: K,
  ...data: Parameters<OptionsApi[K]>
): Promise<ReturnType<OptionsApi[K]> | undefined> {
  return postToPanel({ target: 'options', type, data });
}

async function postToPanel<R>(packet: Packet): Promise<R | undefined> {
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
  opts: {
    /** `tabId` is set only by sendToTabPanel. */
    accept?: (sender: Browser.runtime.MessageSender, tabId?: number) => boolean;
    /** Run in the listener itself, not a microtask later: sidePanel.open needs the user gesture. */
    sync?: readonly (keyof ApiOf<T>)[];
  } = {},
): void {
  const table = handlers as unknown as Record<string, (...a: unknown[]) => unknown>;
  const listener = (msg: unknown, sender: unknown, sendResponse: (r?: unknown) => void) => {
    const p = msg as Packet | null;
    if (!p || p.target !== target || !Object.hasOwn(table, p.type)) return false; // unknown: no reply
    // several panels listen at once (one per tab + detached windows): only the addressee answers
    if (opts.accept?.(sender as Browser.runtime.MessageSender, p.tabId) === false) return false;
    const run = () => table[p.type]!(...(p.data ?? []), sender);
    let result: Promise<unknown>;
    if ((opts.sync as readonly string[] | undefined)?.includes(p.type)) {
      try {
        result = Promise.resolve(run());
      } catch (e) {
        result = Promise.reject(e);
      }
    } else result = Promise.resolve().then(run);
    result.then(sendResponse, (e) => {
      console.error(`[iodob] handler "${p.type}" failed`, e);
      sendResponse(undefined); // ponytail: sender gets undefined, not a hung promise
    });
    return true;
  };
  browser.runtime.onMessage.addListener(listener);
  signal?.addEventListener('abort', () => browser.runtime.onMessage.removeListener(listener), {
    once: true,
  });
}
