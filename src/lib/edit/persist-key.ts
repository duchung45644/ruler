/** Storage keys for per-site rule edits (port of persistedEditsKey, content.js:34975; 9.15). */
import { browser } from '#imports';
import { isPersistedEdits, type PersistedEdits } from './serialize';

export const PERSIST_PREFIX = 'persistedRuleEdits:';

export function persistKey(loc: Pick<Location, 'protocol' | 'origin' | 'pathname'>): string | null {
  if (loc.protocol === 'file:') return `${PERSIST_PREFIX}file://${loc.pathname}`;
  if (!loc.origin || loc.origin === 'null') return null;
  return `${PERSIST_PREFIX}${loc.origin}`;
}

export async function listPersistedEdits(): Promise<{ key: string; value: PersistedEdits }[]> {
  const all = await browser.storage.local.get(null);
  return Object.entries(all)
    .filter(([k, v]) => k.startsWith(PERSIST_PREFIX) && isPersistedEdits(v))
    .map(([key, value]) => ({ key, value: value as PersistedEdits }));
}

export async function clearPersistedEdits(key: string): Promise<void> {
  if (key.startsWith(PERSIST_PREFIX)) await browser.storage.local.remove(key);
}

/** Every saved site, broken entries included (legacy options.js:2879); returns how many went. */
export async function clearAllPersistedEdits(): Promise<number> {
  const keys = Object.keys(await browser.storage.local.get(null)).filter((k) =>
    k.startsWith(PERSIST_PREFIX),
  );
  if (keys.length) await browser.storage.local.remove(keys);
  return keys.length;
}
