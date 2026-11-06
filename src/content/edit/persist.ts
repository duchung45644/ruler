/** Per-site CSS edits, inline style edits by element locator too (port of schedulePersistRuleEdits :34984, persistRuleEditsNow :34996, restorePersistedRuleEdits :35074, showEditsRestoredToast :35160; 5.08, 5.09, 9.31). */
import { browser, type Browser } from '#imports';
import { i18n } from '#i18n';
import { persistKey } from '../../lib/edit/persist-key';
import { isSerializedEdit } from '../../lib/edit/serialize';
import type { InlineStyleEdit } from '../../lib/responsive/channel';
import {
  isElementLocator,
  locateElement,
  resolveLocator,
} from '../../lib/responsive/element-locator';
import { showToast } from '../core/toast';
import { state } from '../core/state.svelte';
import type { RuleTracker } from './rules';

const DELAY = 800;
/** sessionStorage flag set by the responsive exit hand-off: the reload that follows restores quietly (5.26). */
export const HANDOFF_FLAG = 'iodob-responsive-handoff';

function takeHandoffFlag(): boolean {
  try {
    const on = sessionStorage.getItem(HANDOFF_FLAG) !== null;
    sessionStorage.removeItem(HANDOFF_FLAG);
    return on;
  } catch {
    return false;
  }
}
let tracker: RuleTracker | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
/** Last value written, so an HTML-only change does not rewrite the same edits. */
let written: string | null = null;
/** The key was removed from outside: the revert it causes must not write it back. */
let reverting = false;

export function eligible(): boolean {
  return window === window.top && persistKey(location) !== null && !state.inFrame; // a responsive frame must not write the top page's key
}

export function schedulePersist(): void {
  if (!tracker || reverting || !eligible()) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => void persistNow(), DELAY);
}

/** Inline style edits by structural locator, the same address responsive frames sync by. */
function inlineOf(t: RuleTracker): InlineStyleEdit[] {
  const out: InlineStyleEdit[] = [];
  for (const { el, declsText } of t.inlineEdits()) {
    const locator = el.isConnected ? locateElement(el) : null;
    if (locator) out.push({ locator, declsText });
  }
  return out;
}

const snapshot = (t: RuleTracker) => JSON.stringify([t.serialize(), inlineOf(t)]);

/** Saved inline edits applied by locator; unresolved ones are skipped. Returns how many applied. */
function applyInline(t: RuleTracker, list: unknown): number {
  let n = 0;
  if (!Array.isArray(list)) return n;
  for (const e of list as (Partial<InlineStyleEdit> | null)[]) {
    if (!e || !isElementLocator(e.locator) || typeof e.declsText !== 'string') continue;
    const el = resolveLocator(e.locator);
    if (!(el instanceof HTMLElement)) continue;
    t.editInlineStyle(el, e.declsText);
    n++;
  }
  return n;
}

export async function persistNow(): Promise<void> {
  if (timer) clearTimeout(timer);
  timer = null;
  const key = persistKey(location);
  if (!tracker || reverting || !key || !eligible()) return;
  const edits = tracker.serialize();
  const inline = inlineOf(tracker);
  const json = JSON.stringify([edits, inline]);
  if (json === written) return;
  written = json;
  if (!edits.length && !inline.length) await browser.storage.local.remove(key);
  else
    await browser.storage.local.set({
      [key]: { edits, ...(inline.length ? { inline } : {}), updatedAt: Date.now() },
    });
}

function onStorage(changes: Record<string, Browser.storage.StorageChange>, area: string): void {
  const key = persistKey(location);
  if (area !== 'local' || !key || !(key in changes) || changes[key]!.newValue != null) return;
  // cleared from the settings page (9.31)
  if (timer) clearTimeout(timer);
  timer = null;
  written = '[[],[]]';
  if (!tracker?.hasChanges()) return;
  reverting = true;
  try {
    tracker.revertAll();
  } finally {
    reverting = false;
  }
}

/** Start persisting `t`'s edits; applies what the site has saved. Returns the stop fn. */
export async function restorePersisted(t: RuleTracker): Promise<() => void> {
  tracker = t;
  browser.storage.onChanged.addListener(onStorage);
  const stop = () => {
    void persistNow();
    browser.storage.onChanged.removeListener(onStorage);
    tracker = null;
  };
  const quiet = takeHandoffFlag();
  const key = persistKey(location);
  if (!key || !eligible()) return stop;
  // re-enabled in the same page: the tracker kept its edits applied, nothing to restore
  if (t.hasChanges()) {
    written = snapshot(t);
    return stop;
  }
  const saved = (await browser.storage.local.get(key))[key] as
    { edits?: unknown; inline?: unknown } | undefined;
  const edits = Array.isArray(saved?.edits) ? saved.edits.filter(isSerializedEdit) : [];
  if ((!edits.length && !Array.isArray(saved?.inline)) || tracker !== t) return stop;
  const applied =
    (edits.length ? t.applySerialized(edits).applied : 0) + applyInline(t, saved?.inline);
  written = snapshot(t);
  if (applied > 0 && !quiet)
    showToast(
      applied === 1
        ? i18n.t('toast.editsRestoredOne')
        : i18n.t('toast.editsRestoredMany', [String(applied)]),
      5000,
    );
  return stop;
}
