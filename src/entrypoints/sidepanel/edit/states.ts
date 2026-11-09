import { FORCEABLE_STATES } from '../../../lib/css/states';

/** `forced` with `state` flipped, in FORCEABLE_STATES order. */
export function toggleState(forced: readonly string[], state: string): string[] {
  const next = forced.includes(state) ? forced.filter((s) => s !== state) : [...forced, state];
  return FORCEABLE_STATES.filter((s) => next.includes(s));
}
