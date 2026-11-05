/** Per-site CSS edits (port of schedulePersistRuleEdits :34984, persistRuleEditsNow :34996, restorePersistedRuleEdits :35074, showEditsRestoredToast :35160; 5.08, 5.09, 9.31). */
import { browser, type Browser } from '#imports';
import { i18n } from '#i18n';
import { persistKey } from '../../lib/edit/persist-key';
import { isSerializedEdit } from '../../lib/edit/serialize';
import { showToast } from '../core/toast';
import { state } from '../core/state.svelte';
import type { RuleTracker } from './rules';

const DELAY = 800;
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

export async function persistNow(): Promise<void> {
  if (timer) clearTimeout(timer);
  timer = null;
  const key = persistKey(location);
  if (!tracker || reverting || !key || !eligible()) return;
  const edits = tracker.serialize();
  const json = JSON.stringify(edits);
  if (json === written) return;
  written = json;
  if (!edits.length) await browser.storage.local.remove(key);
  else await browser.storage.local.set({ [key]: { edits, updatedAt: Date.now() } });
}

function onStorage(changes: Record<string, Browser.storage.StorageChange>, area: string): void {
  const key = persistKey(location);
  if (area !== 'local' || !key || !(key in changes) || changes[key]!.newValue != null) return;
  // cleared from the settings page (9.31)
  if (timer) clearTimeout(timer);
  timer = null;
  written = '[]';
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
  const key = persistKey(location);
  if (!key || !eligible()) return stop;
  // re-enabled in the same page: the tracker kept its edits applied, nothing to restore
  if (t.hasChanges()) {
    written = JSON.stringify(t.serialize());
    return stop;
  }
  const saved = (await browser.storage.local.get(key))[key] as { edits?: unknown } | undefined;
  const edits = Array.isArray(saved?.edits) ? saved.edits.filter(isSerializedEdit) : [];
  if (!edits.length || tracker !== t) return stop;
  const { applied } = t.applySerialized(edits);
  written = JSON.stringify(t.serialize());
  if (applied > 0)
    showToast(
      applied === 1
        ? i18n.t('toast.editsRestoredOne')
        : i18n.t('toast.editsRestoredMany', [String(applied)]),
      5000,
    );
  return stop;
}
