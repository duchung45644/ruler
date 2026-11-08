import type { StyleLike } from './style';

/** Plain-object style for tests: `{ 'margin-top': '8px' }`. */
export const styleOf = (props: Record<string, string>): StyleLike => ({
  getPropertyValue: (p) => props[p] ?? '',
});
