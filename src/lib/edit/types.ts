/** Shapes shared by the edit channel (content <-> side panel). */
import type { MatchedRule } from '../element/types';
import type { Decl } from './decls';
import type { RuleAddress } from './rule-address';

/** Sent with every edit reply so the panel never has to ask again. */
export interface EditState {
  canUndo: boolean;
  canRedo: boolean;
  editCount: number;
  hasClipboard: boolean;
}

export type EditResult = EditState & { ok: boolean; error?: string; selectedId?: string };

export const EMPTY_EDIT_STATE: EditState = {
  canUndo: false,
  canRedo: false,
  editCount: 0,
  hasClipboard: false,
};

export interface EditableRule extends MatchedRule {
  address: RuleAddress;
  /** False for cross-origin or otherwise read-only rules. */
  editable: boolean;
  /** 1-based line in the stylesheet text, when known. */
  line: number | null;
}

export interface RulePayload {
  rules: EditableRule[];
  inline: Decl[];
  availableStates: string[];
  forcedState: string | null;
  /** Lets the panel drop edit_payload_extras that belong to an older payload. */
  paySeq: number;
  crossOriginMissing: number;
}

export interface RuleChange {
  recordId: string;
  address: RuleAddress | null;
  source: string;
  line: number | null;
  before: string;
  after: string;
  elementIds: string[];
  /** Current selector and its scope, so a change with no element can still find one on the page. */
  selector?: string;
  scopeAddress?: string | null;
}

export type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';
