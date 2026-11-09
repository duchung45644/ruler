/** "Copy all changes": rule / inline edits as CSS, Tailwind classes or a prompt for an AI agent. */
import { parseDecls, type Decl } from './decls';
import type { RuleChange } from './types';

export type ExportFormat = 'css' | 'tailwind' | 'prompt';

export interface PropChange {
  property: string;
  /** '' when the property was added. */
  from: string;
  /** '' when the property was removed. */
  to: string;
}

export interface ExportBlock {
  selector: string;
  changes: PropChange[];
}

/** Same shape as tailwindClasses: ordered `css` map → class list ('' when nothing maps). */
export type TailwindConverter = (css: Record<string, string>) => string;

const valueOf = (d: Decl) => d.value + (d.important ? ' !important' : '');

/** `sel { decls }` → its parts; plain declaration text (inline styles) has no selector. */
export function splitBlock(text: string): { selector: string | null; decls: Decl[] } {
  const open = text.indexOf('{');
  if (open < 0 || !text.trimEnd().endsWith('}')) return { selector: null, decls: parseDecls(text) };
  return {
    selector: text.slice(0, open).trim(),
    decls: parseDecls(text.slice(open + 1, text.lastIndexOf('}'))),
  };
}

/** Added, changed and removed properties, in the order they appear after the edit. */
export function diffDecls(before: Decl[], after: Decl[]): PropChange[] {
  const was = new Map(before.map((d) => [d.property, valueOf(d)]));
  const now = new Map(after.map((d) => [d.property, valueOf(d)]));
  const out: PropChange[] = [];
  for (const [property, to] of now) {
    const from = was.get(property) ?? '';
    if (from !== to) out.push({ property, from, to });
  }
  for (const [property, from] of was) if (!now.has(property)) out.push({ property, from, to: '' });
  return out;
}

function mergeInto(list: PropChange[], changes: PropChange[]): void {
  for (const ch of changes) {
    const i = list.findIndex((x) => x.property === ch.property);
    if (i < 0) list.push(ch);
    else list[i] = { ...ch, from: list[i]!.from };
  }
}

/**
 * One block per selector, edits to the same selector merged. `labels` names elements by id for
 * inline changes that carry no selector of their own.
 */
export function toBlocks(rules: RuleChange[], labels: Record<string, string> = {}): ExportBlock[] {
  const bySel = new Map<string, PropChange[]>();
  for (const c of rules) {
    const before = splitBlock(c.before);
    const after = splitBlock(c.after);
    const selector =
      after.selector ??
      c.selector ??
      labels[c.elementIds[0] ?? ''] ??
      c.address?.selector ??
      before.selector;
    const changes = diffDecls(before.decls, after.decls);
    if (!selector || !changes.length) continue;
    const list = bySel.get(selector) ?? [];
    mergeInto(list, changes);
    bySel.set(selector, list);
  }
  return [...bySel]
    .map(([selector, changes]) => ({
      selector,
      changes: changes.filter((c) => c.from !== c.to),
    }))
    .filter((b) => b.changes.length);
}

export function toCss(blocks: ExportBlock[]): string {
  return blocks
    .map(({ selector, changes }) => {
      const lines = changes.map((c) =>
        c.to ? `  ${c.property}: ${c.to};` : `  /* removed: ${c.property}: ${c.from}; */`,
      );
      return `${selector} {\n${lines.join('\n')}\n}`;
    })
    .join('\n\n');
}

/** Tailwind arbitrary property for a declaration nothing maps: spaces become `_`. */
export const arbitraryClass = (property: string, value: string): string =>
  `[${property}:${value.trim().replace(/_/g, '\\_').replace(/\s+/g, '_')}]`;

/**
 * Per selector, the classes that give the new values. Declarations the converter skips become
 * arbitrary properties; custom properties always do. Removed properties are listed as a comment.
 */
export function toTailwindText(blocks: ExportBlock[], convert: TailwindConverter): string {
  return blocks
    .map(({ selector, changes }) => {
      const classes: string[] = [];
      for (const c of changes) {
        if (!c.to) continue;
        const one = c.property.startsWith('--') ? '' : convert({ [c.property]: c.to }).trim();
        classes.push(one || arbitraryClass(c.property, c.to));
      }
      const removed = changes.filter((c) => !c.to).map((c) => c.property);
      const tail = removed.length ? `  /* remove: ${removed.join(', ')} */` : '';
      return `${selector}: ${classes.join(' ')}${tail}`.trimEnd();
    })
    .join('\n');
}

function describe(c: PropChange): string {
  if (!c.from) return `set \`${c.property}\` to \`${c.to}\``;
  if (!c.to) return `remove \`${c.property}\` (was \`${c.from}\`)`;
  return `change \`${c.property}\` from \`${c.from}\` to \`${c.to}\``;
}

/** Plain-language list for a coding agent; English, like the code it goes into. */
export function toPrompt(blocks: ExportBlock[], url: string): string {
  const where = url ? `On ${url}` : 'On the page';
  const lines = blocks.flatMap(({ selector, changes }) =>
    changes.map((c) => `- ${where}, element \`${selector}\`: ${describe(c)}`),
  );
  return [
    'Apply these style changes in the source code (find where each element is styled):',
    ...lines,
  ].join('\n');
}
