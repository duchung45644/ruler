import { describe, expect, it } from 'vitest';
import { gapLines, placeNear, popoverLeft, sizeLabels } from './geometry';

describe('sizeLabels', () => {
  it('anchors width top-center and height right-middle', () => {
    expect(sizeLabels({ x: 10, y: 20, width: 100, height: 50 })).toEqual({
      width: { x: 60, y: 16 },
      height: { x: 106, y: 45 },
    });
  });
});

describe('gapLines', () => {
  it('measures a horizontal gap', () => {
    const l = gapLines(
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 80, y: 0, width: 50, height: 50 },
    );
    expect(l).toEqual([{ x1: 50, y1: 25, x2: 80, y2: 25, value: 30 }]);
  });
  it('measures edge to edge when nested', () => {
    const l = gapLines(
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 10, y: 20, width: 30, height: 40 },
    );
    expect(l.map((x) => x.value).sort((p, q) => p - q)).toEqual([10, 20, 40, 60]);
  });
});

describe('placeNear', () => {
  const vp = { width: 1000, height: 800 };
  const size = { width: 200, height: 100 };
  it('flips left near the right edge', () => {
    expect(placeNear({ x: 950, y: 100 }, size, vp, []).x).toBe(742);
  });
  it('stays above an avoided dock', () => {
    const dock = { x: 700, y: 700, width: 300, height: 80 };
    const p = placeNear({ x: 950, y: 690 }, size, vp, [dock]);
    expect(p.y + size.height).toBeLessThanOrEqual(dock.y);
  });
});

describe('popoverLeft', () => {
  const dock = { x: 50, y: 0, width: 400, height: 34 };
  it('centres over the button, clamped inside the dock', () => {
    expect(popoverLeft({ x: 100, y: 0, width: 26, height: 26 }, dock, 200)).toBe(0);
    expect(popoverLeft({ x: 250, y: 0, width: 26, height: 26 }, dock, 100)).toBe(163);
    expect(popoverLeft({ x: 430, y: 0, width: 26, height: 26 }, dock, 200)).toBe(200);
  });
});
