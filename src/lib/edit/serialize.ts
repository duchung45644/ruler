/** Saved rule edits (port of serializeChanges / applySerializedChanges, content.js:17158–17203). */

export type SerializedEdit =
  | {
      own: false;
      stylesheet: string;
      scopeAddress: string | null;
      wrappers: string[];
      occ: number;
      originalSelector: string;
      selector: string;
      declsText: string;
    }
  | {
      own: true;
      recordId: string;
      wrappers: string[];
      scopePath: string[];
      scopeAddress: string | null;
      selector: string;
      declsText: string;
    };

export interface PersistedEdits {
  edits: SerializedEdit[];
  updatedAt: number;
}

const isStr = (v: unknown): v is string => typeof v === 'string';
const isStrs = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);
const isScope = (v: unknown): v is string | null => v === null || isStr(v);

/** Storage is untrusted: older versions or other code may have written anything. */
export function isSerializedEdit(x: unknown): x is SerializedEdit {
  if (!x || typeof x !== 'object') return false;
  const e = x as Record<string, unknown>;
  if (!isStr(e.selector) || !isStr(e.declsText) || !isStrs(e.wrappers) || !isScope(e.scopeAddress))
    return false;
  if (e.own === true) return isStr(e.recordId) && isStrs(e.scopePath);
  if (e.own === false)
    return isStr(e.stylesheet) && isStr(e.originalSelector) && Number.isInteger(e.occ);
  return false;
}

export function isPersistedEdits(x: unknown): x is PersistedEdits {
  if (!x || typeof x !== 'object') return false;
  const p = x as Record<string, unknown>;
  return (
    Array.isArray(p.edits) && p.edits.every(isSerializedEdit) && typeof p.updatedAt === 'number'
  );
}
