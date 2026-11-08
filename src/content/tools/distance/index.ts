import { gapLines } from '../../../lib/dom/geometry';
import { addPainter, draw, drawNumber } from '../../core/overlay';
import { state } from '../../core/state.svelte';

/** Distance between selected and hovered (3.01, port of content.js:45001). Solid lines only (spec §7). */
export function initDistance(color: string): void {
  addPainter('distance', (box) => {
    const { selected: a, hovered: b } = state;
    if (!a || !b || a === b || !a.isConnected || !b.isConnected) return;
    for (const l of gapLines(a.getBoundingClientRect(), b.getBoundingClientRect())) {
      const vertical = l.x1 === l.x2;
      draw(
        box,
        `left:${Math.min(l.x1, l.x2)}px;top:${Math.min(l.y1, l.y2)}px;width:${vertical ? 1 : l.value}px;height:${vertical ? l.value : 1}px;background:${color}`,
      );
      // number beside the line: right of vertical lines, above horizontal ones
      if (vertical) drawNumber(box, l.x1 + 4, (l.y1 + l.y2) / 2, l.value, color, '0', '-50%');
      else drawNumber(box, (l.x1 + l.x2) / 2, l.y1 - 4, l.value, color, '-50%', '-100%');
    }
  });
}
