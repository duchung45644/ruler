/** Command palette / shortcut cheat sheet (Ctrl+K, ?): pure ordering and filtering. */

/** Ctrl+K (Cmd+K on macOS) opens the palette. */
export function isPaletteKey(e: KeyboardEvent): boolean {
  return (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k';
}

/** `?` opens the cheat sheet (the palette, empty query). */
export const isCheatSheetKey = (e: KeyboardEvent): boolean =>
  e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey;

/** Ids in dock order first, then the rest in registration order (key-only items, quit). */
export function orderIds(ids: string[], layout: string[][]): string[] {
  const flat = layout.flat();
  const rank = (id: string) => {
    const i = flat.indexOf(id);
    return i < 0 ? flat.length : i;
  };
  return ids
    .map((id, i) => ({ id, i, r: rank(id) }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((e) => e.id);
}

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/**
 * Match score of `query` against `label` (higher is better), null when it does not match.
 * Prefix > word start > substring > in-order letters (fuzzy). Diacritics are ignored, so
 * "mau" finds "Màu".
 */
export function matchScore(label: string, query: string): number | null {
  const q = norm(query.trim());
  if (!q) return 0;
  const l = norm(label);
  const at = l.indexOf(q);
  if (at === 0) return 3;
  if (at > 0) return /[\s\-/(&]/.test(l[at - 1] ?? '') ? 2 : 1;
  let j = 0;
  for (const ch of l) if (ch === q[j]) j++;
  return j === q.length ? 0.5 : null;
}

/** Entries matching `query`, best first; ties keep the given order. */
export function filterEntries<T>(entries: T[], query: string, label: (e: T) => string): T[] {
  return entries
    .map((e, i) => ({ e, i, s: matchScore(label(e), query) }))
    .filter((x): x is { e: T; i: number; s: number } => x.s !== null)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.e);
}
