/**
 * Responsive forwarding (1.32, 1.33, 1.34, 1.47, 1.49, 2.25, 8.21): dock items flagged `forward`
 * run in every frame instead of the parent, pause and tool settings follow, and find is aggregated
 * over the frames. Parent side: installForward (the shell). Frame side: applyReadyAck & co.
 */
import type { FrameApi } from '../../lib/responsive/channel';
import {
  findGlobalIndex,
  findStep,
  findTotal,
  type FindCounts,
  type FindCursor,
} from '../../lib/responsive/find-agg';
import { runItem } from '../core/keys';
import { requestPaint } from '../core/overlay';
import { localOf, setForwarder, setPaused } from '../core/registry.svelte';
import { state } from '../core/state.svelte';
import { clearFind, find, findChanged, gotoFind, runFind, setRemoteFind } from '../tools/find';
import type { Channel } from './bridge';

/** What forwarding adds to ready_ack. */
export type ReadyState = Omit<Parameters<FrameApi['ready_ack']>[0], 'uiScale' | 'ruleEdits'>;

export interface ForwardHost {
  /** Channels of the frames that said ready, in display order. */
  ready(): [number, Channel<FrameApi>][];
  /** Reactive per-item active mirror (frames are kept in step, so one boolean per item). */
  active: Record<string, boolean>;
}

/** Tool settings carried to the frames: patch merged into the frame's state, no storage write. */
const SETTINGS: Record<string, { read(): unknown; apply(v: object): void }> = {
  layoutGrid: {
    read: () => ({ ...state.grid }),
    apply: (v) => {
      const g = state.grid as unknown as Record<string, unknown>;
      for (const [k, x] of Object.entries(v)) if (k in g && typeof x === typeof g[k]) g[k] = x;
      requestPaint();
    },
  },
};

let host: ForwardHost | null = null;
const on = (): boolean => !!host && state.responsiveOn && !state.inFrame;

function broadcast<K extends keyof FrameApi & string>(
  type: K,
  ...args: FrameApi[K] extends (...a: infer P) => unknown ? P : never
): void {
  for (const [, ch] of host?.ready() ?? []) ch.send(type, ...args);
}

/** Parent: a tool setting changed (the grid popover). Returns whether it went to the frames. */
export function forwardSetting(key: string, patch: object): boolean {
  if (!on() || !host) return false;
  if (key === 'layoutGrid' && 'isOn' in patch) host.active.grid = !!patch.isOn;
  broadcast('set_setting', key, patch);
  return true;
}

// --- aggregated find (parent) ---
let agg: { frames: number[]; counts: Map<number, number> } = { frames: [], counts: new Map() };
let cursor: FindCursor | null = null;
let seq = 0;

function publish(): void {
  const total = findTotal(agg as FindCounts);
  Object.assign(find, {
    results: [],
    hidden: 0,
    count: total,
    index: Math.max(0, findGlobalIndex(agg as FindCounts, cursor)),
  });
  state.findOn = total > 0;
}
function gotoCursor(): void {
  for (const [id, ch] of host?.ready() ?? [])
    ch.send('find_goto', id === cursor?.frame ? cursor.local : -1);
}
function resetFind(): void {
  seq++;
  agg = { frames: [], counts: new Map() };
  cursor = null;
}

/** Parent: report_find_count from a frame that ran the query on its own (late frame). */
export function frameFindCount(id: number, n: unknown): void {
  if (!on() || !host || state.popover !== 'find' || !find.query) return;
  agg.counts.set(id, Math.max(0, Number(n) || 0));
  agg.frames = host
    .ready()
    .map(([f]) => f)
    .filter((f) => agg.counts.has(f));
  if (!cursor) {
    cursor = findStep(agg as FindCounts, null, 1);
    gotoCursor();
  }
  publish();
  findChanged();
}

export function installForward(h: ForwardHost): void {
  host = h;
  setForwarder({
    on,
    run: (id) => {
      if (localOf.get(id)?.isActive) h.active[id] = !h.active[id];
      broadcast('run_item', id);
    },
    isActive: (id) => !!h.active[id],
    paused: (p) => broadcast('set_paused', p),
  });
  setRemoteFind({
    on,
    run: async (query) => {
      const my = ++seq;
      const list = h.ready();
      const counts = await Promise.all(
        list.map(([id, ch]) =>
          ch.call('find', query).then(
            (n) => [id, Math.max(0, Number(n) || 0)] as const,
            () => [id, 0] as const,
          ),
        ),
      );
      if (my !== seq) return; // a newer query or a close came first
      agg = { frames: list.map(([id]) => id), counts: new Map(counts) };
      cursor = findStep(agg as FindCounts, null, 1);
      gotoCursor();
      publish();
    },
    step: async (d) => {
      cursor = findStep(agg as FindCounts, cursor, d);
      gotoCursor();
      publish();
      return Promise.resolve();
    },
    clear: () => {
      if (!on()) return;
      resetFind();
      broadcast('find', '');
    },
  });
}

/** Parent, entering: the mirror starts from the parent's own tool state. */
export function enterForward(): void {
  if (!host) return;
  resetFind();
  for (const [id, l] of localOf) if (l.isActive) host.active[id] = !!l.isActive();
}

/** Parent, after leaving: carry the frames' tool state back to the page. */
export function exitForward(): void {
  resetFind();
  if (!host || !state.active) return;
  for (const [id, l] of localOf) if (l.isActive && !!l.isActive() !== !!host.active[id]) l.toggle();
}

export function readyState(): ReadyState {
  const active = host?.active ?? {};
  const grid = SETTINGS.layoutGrid!.read() as typeof state.grid;
  return {
    paused: state.paused,
    active: Object.keys(active).filter((id) => active[id]),
    settings: { layoutGrid: { ...grid, isOn: active.grid ?? grid.isOn } },
    findQuery: state.popover === 'find' ? find.query : '',
  };
}

// --- frame side ---

export function applySetting(key: unknown, value: unknown): void {
  const s = typeof key === 'string' && Object.hasOwn(SETTINGS, key) ? SETTINGS[key] : undefined;
  if (s && value && typeof value === 'object') s.apply(value);
}

/** find(query): this frame's match count; an empty query clears. */
export function frameFind(query: unknown): number {
  const q = typeof query === 'string' ? query : '';
  if (!q.trim()) {
    clearFind();
    return 0;
  }
  void runFind(q);
  return find.count;
}

export function frameFindGoto(local: unknown): void {
  gotoFind(Number(local));
}

/** Frame: start from the shell's state. Returns the find count when a query was running. */
export function applyReadyAck(s: Partial<ReadyState> | undefined): number | null {
  if (!s || typeof s !== 'object') return null;
  if (s.settings && typeof s.settings === 'object')
    for (const [k, v] of Object.entries(s.settings)) applySetting(k, v);
  const active = Array.isArray(s.active) ? s.active : [];
  // before pause: a paused frame runs nothing
  for (const [id, l] of localOf)
    if (l.isActive && !!l.isActive() !== active.includes(id)) runItem(id);
  setPaused(!!s.paused);
  return typeof s.findQuery === 'string' && s.findQuery.trim() ? frameFind(s.findQuery) : null;
}
