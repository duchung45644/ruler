import type { Breakpoint } from '../breakpoints';
import type { SerializedEdit } from '../edit/serialize';
import type { EditState } from '../edit/types';
import type { FindCursor } from './find-agg';

/** Ratios (0..1) so frames of different sizes land on the same relative spot. */
export interface ScrollRatio {
  x: number;
  y: number;
}

/** Parent (shell) → frame. */
export interface FrameApi {
  /** The shell saw `ready_for_state_sync` and sends the state to start from. */
  ready_ack(s: {
    paused: boolean;
    uiScale: number;
    ruleEdits: SerializedEdit[];
    /** Forward items that are on. */
    active: string[];
    /** Tool settings by key, as set_setting carries them. */
    settings: Record<string, unknown>;
    /** Running find query ('' = none): the frame reports its count back. */
    findQuery: string;
  }): void;
  apply_rule_edits(edits: SerializedEdit[]): void;
  collect_rule_edits(): SerializedEdit[];
  get_current_url(): string;
  get_breakpoints(): Breakpoint[];
  /** Registry item id; only items flagged `forward` are sent. */
  run_item(id: string): void;
  set_paused(paused: boolean): void;
  set_setting(key: string, value: unknown): void;
  /** Returns the match count in this frame. */
  find(query: string): number;
  find_goto(local: number): void;
  clear_selection(): void;
  apply_scroll_sync(r: ScrollRatio): void;
  reset_scroll_conflict(): void;
  apply_spa_navigation(url: string): void;
  update_ui_scale(scale: number): void;
  edit_undo(): EditState;
  edit_redo(): EditState;
  /** Selected element's viewport rect (scrolled into view first); null when nothing is selected. */
  element_rect(): { left: number; top: number; right: number; bottom: number } | null;
  /** Hide (true) / show this frame's own UI while the parent grabs the tab (Q6). */
  capture_hide(on: boolean): void;
}

/** Frame → parent (shell). */
export interface ShellApi {
  ready_for_state_sync(): void;
  scroll_sync(r: ScrollRatio): void;
  scroll_sync_conflict(): void;
  spa_navigation(url: string): void;
  overflow_status(s: { overflowing: boolean; width: number }): void;
  report_find_count(n: number, cursor?: FindCursor['local']): void;
  selection_changed(s: { selected: boolean }): void;
  editor_op_recorded(): void;
  /** `htmlEdits`: markup / class / inline edits in this frame, which exit cannot carry (8.08). */
  frame_edit_state(s: EditState & { htmlEdits: number }): void;
  /** Ctrl+Z (false) / Ctrl+Shift+Z, Ctrl+Y (true) typed in the frame: the shared history steps (8.20). */
  edit_history_key(redo: boolean): void;
  rule_edits_changed(edits: SerializedEdit[]): void;
  /** A shortcut key typed inside the frame, run by the shell. */
  shortcut(key: string): void;
  request_ui_scale(): number;
  pin_inspector_top(pin: boolean): void;
  open_external(url: string): void;
}

export type ChannelDir = 'ruler-parent' | 'ruler-iframe';

export interface Envelope {
  /** Must equal browser.runtime.id; a page script cannot know it. */
  __bd: string;
  dir: ChannelDir;
  type: string;
  data: unknown[];
  id?: number;
  /** Set on a response: `id` is the request it answers. */
  reply?: boolean;
}

/** Same shape as messaging's `Handlers`, minus the sender slot: the source is always the peer. */
export type ChannelHandlers<A extends object> = {
  [K in keyof A]?: A[K] extends (...a: infer P) => infer R ? (...a: P) => R | Promise<R> : never;
};
