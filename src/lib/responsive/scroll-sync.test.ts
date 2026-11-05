import { describe, expect, it } from 'vitest';
import { createConflictDetector, fromRatio, toRatio } from './scroll-sync';

describe('scroll-sync', () => {
  it('toRatio / fromRatio handle zero range', () => {
    expect(toRatio(50, 200)).toBe(0.25);
    expect(toRatio(50, 0)).toBe(0);
    expect(fromRatio(0.25, 400)).toBe(100);
    expect(fromRatio(0.5, 0)).toBe(0);
  });

  it('reports after 5 fights within 700ms, then throttles 10s', () => {
    const d = createConflictDetector();
    const fight = (t: number) => {
      d.applied(0, t);
      return d.scrolled(100, t + 10);
    };
    expect([0, 100, 200, 300].map(fight)).toEqual([false, false, false, false]);
    expect(fight(400)).toBe(true);
    expect([500, 600, 700, 800, 900].some(fight)).toBe(false);
    expect([11000, 11100, 11200, 11300, 11400].map(fight)).toEqual([
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it('ignores small drifts, unmuted scrolls, spread-out fights and reset', () => {
    const d = createConflictDetector();
    expect(d.scrolled(500, 0)).toBe(false);
    for (let i = 0; i < 6; i++) {
      d.applied(0, i * 100);
      expect(d.scrolled(10, i * 100 + 10)).toBe(false);
      expect(d.scrolled(100, i * 100 + 400)).toBe(false);
    }
    for (let i = 0; i < 6; i++) {
      d.applied(0, i * 200);
      expect(d.scrolled(100, i * 200 + 10)).toBe(false);
    }
    for (let i = 0; i < 4; i++) {
      d.applied(0, 5000 + i);
      d.scrolled(100, 5000 + i);
    }
    d.reset();
    d.applied(0, 5010);
    expect(d.scrolled(100, 5010)).toBe(false);
  });
});
