/** Forceable pseudo-classes (port of getAvailableStates, content.js:32540; 26156). */

export const FORCEABLE_STATES = [
  ':hover',
  ':focus',
  ':focus-visible',
  ':focus-within',
  ':active',
  ':visited',
] as const;

/** `:focus` must not match inside `:focus-visible`. */
const stateRe = (state: string, flags = '') =>
  new RegExp(`${state.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z-])`, flags);

/** Blank out strings and attribute selectors so `[title=":hover"]` is not a state. */
const stripLiterals = (sel: string) =>
  sel.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '""').replace(/\[[^\]]*\]/g, '[]');

export function statesInSelector(sel: string): string[] {
  const s = stripLiterals(sel);
  return FORCEABLE_STATES.filter((st) => stateRe(st).test(s));
}

export const forceAttr = (state: string, extId: string): string =>
  `data-sr-force-${state.replace(/^:/, '')}-${extId}`;

/** The selector with `state` swapped for the force attribute, or null when it has no such state. */
export function rewriteForState(sel: string, state: string, extId: string): string | null {
  if (!statesInSelector(sel).includes(state)) return null;
  return sel.replace(stateRe(state, 'g'), `[${forceAttr(state, extId)}]`);
}
