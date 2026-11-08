/** Per-element log of HTML edits, in the shape of getHtmlChanges (content.js:15197, 15503). */

export type HtmlChangeKind =
  'class' | 'text' | 'html' | 'delete' | 'insert' | 'duplicate' | 'paste';

export interface Snapshot {
  selector: string;
  cssSelector: string;
  html: string;
}

export interface HtmlChange {
  id: string;
  selector: string;
  cssSelector: string;
  kind: HtmlChangeKind;
  before: string;
  after: string;
}

export interface ChangeRecord {
  original: Snapshot;
  count: number;
  kinds: Set<HtmlChangeKind>;
  last: HtmlChangeKind;
}

export type ChangeLog = Map<string, ChangeRecord>;

/** Keeps the first snapshot so the diff is always against the untouched element. */
export function recordChange(
  log: ChangeLog,
  id: string,
  snapshot: Snapshot,
  kind: HtmlChangeKind,
): void {
  const rec = log.get(id);
  if (rec) {
    rec.count++;
    rec.kinds.add(kind);
    rec.last = kind;
  } else log.set(id, { original: snapshot, count: 1, kinds: new Set([kind]), last: kind });
}

export const dropRecord = (log: ChangeLog, id: string): boolean => log.delete(id);

export const changeCount = (log: ChangeLog, id: string): number => log.get(id)?.count ?? 0;

export function toHtmlChanges(
  log: ChangeLog,
  current: (id: string) => Snapshot | null,
): HtmlChange[] {
  const out: HtmlChange[] = [];
  for (const [id, rec] of log) {
    const now = current(id);
    const after = now?.html ?? '';
    if (after === rec.original.html) continue;
    out.push({
      id,
      selector: now?.selector ?? rec.original.selector,
      cssSelector: now?.cssSelector ?? rec.original.cssSelector,
      kind: rec.last,
      before: rec.original.html,
      after,
    });
  }
  return out;
}
