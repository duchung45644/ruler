import type { FlexInfo, GridInfo } from './types';
import type { StyleLike } from './style';

/** `a a a` → `repeat(3, a)` (legacy `R`, content.js:40074). */
export function compactTracks(v: string): string {
  const parts = v.split(' ');
  return parts.every((p) => p === parts[0])
    ? `repeat(${parts.length}, ${parts[0]})`
    : v.replace(/\s+/g, ' ').trim();
}

const tracks = (v: string) => v.split(' ').filter((t) => t !== 'none' && t !== '').length;

/** Port of getElementLayout (content.js:41324): flex / grid container info, else null. */
export function elementLayout(style: StyleLike): FlexInfo | GridInfo | null {
  const get = (p: string) => style.getPropertyValue(p);
  const display = get('display');
  if (display === 'flex' || display === 'inline-flex')
    return {
      display,
      flexDirection: get('flex-direction'),
      flexWrap: get('flex-wrap'),
      justifyContent: get('justify-content'),
      alignItems: get('align-items'),
      alignContent: get('align-content'),
      gap: get('gap'),
    };
  if (display !== 'grid' && display !== 'inline-grid') return null;
  const cols = get('grid-template-columns');
  const rows = get('grid-template-rows');
  return {
    display,
    gridTemplateColumns: compactTracks(cols),
    gridTemplateRows: compactTracks(rows),
    justifyItems: get('justify-items'),
    alignItems: get('align-items'),
    justifyContent: get('justify-content'),
    alignContent: get('align-content'),
    gap: get('gap'),
    // legacy draws a placeholder 3 × 2 grid when the template is `none`
    columnCount: tracks(cols) || 3,
    rowCount: tracks(rows) || 2,
  };
}
