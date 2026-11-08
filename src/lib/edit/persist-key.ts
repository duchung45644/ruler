/** Storage keys for per-site rule edits (port of persistedEditsKey, content.js:34975; 9.15). */
import { browser } from '#imports';

export const PERSIST_PREFIX = 'persistedRuleEdits:';

export function persistKey(loc: Pick<Location, 'protocol' | 'origin' | 'pathname'>): string | null {
  if (loc.protocol === 'file:') return `${PERSIST_PREFIX}file://${loc.pathname}`;
  if (!loc.origin || loc.origin === 'null') return null;
  return `${PERSIST_PREFIX}${loc.origin}`;
}

/** Every saved site, broken entries included (legacy options.js:2879); returns how many went. */
export async function clearAllPersistedEdits(): Promise<number> {
  const keys = Object.keys(await browser.storage.local.get(null)).filter((k) =>
    k.startsWith(PERSIST_PREFIX),
  );
  if (keys.length) await browser.storage.local.remove(keys);
  return keys.length;
}
