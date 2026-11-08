import { expect, it } from 'vitest';
import { guideGaps, nearestGuide, snapPos, ticks } from './guides';

it('snapPos snaps to the first edge within SNAP, else rounds', () => {
  expect(snapPos(103, [100, 200, 150])).toBe(100);
  expect(snapPos(107, [100])).toBe(107);
  expect(snapPos(107.4, [])).toBe(107);
});

it('nearestGuide finds a guide within GRAB, scroll-aware', () => {
  const g = { axis: 'h' as const, pos: 300 };
  expect(nearestGuide([g], 50, 296, { x: 0, y: 0 })).toBe(g);
  expect(nearestGuide([g], 50, 290, { x: 0, y: 0 })).toBeNull();
  expect(nearestGuide([g], 50, 200, { x: 0, y: 100 })).toBe(g);
});

it('guideGaps sorts and measures neighbours', () => {
  expect(guideGaps([300, 100, 180])).toEqual([
    { mid: 140, value: 80 },
    { mid: 240, value: 120 },
  ]);
});

it('ticks every 10px with major/medium/minor', () => {
  const t = ticks(100);
  expect(t).toHaveLength(11);
  const kind = (at: number) => t.find((x) => x.at === at)?.kind;
  expect(kind(0)).toBe('major');
  expect(kind(100)).toBe('major');
  expect(kind(50)).toBe('medium');
  expect(kind(10)).toBe('minor');
});
