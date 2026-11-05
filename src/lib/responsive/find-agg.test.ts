import { describe, expect, it } from 'vitest';
import { findGlobalIndex, findLocate, findStep, findTotal } from './find-agg';

const agg = {
  frames: [1, 2, 3],
  counts: new Map([
    [1, 2],
    [3, 3],
  ]),
};

describe('find-agg', () => {
  it('findTotal ignores frames not in order', () => {
    expect(findTotal(agg)).toBe(5);
    expect(findTotal({ frames: [1], counts: agg.counts })).toBe(2);
  });

  it('findLocate', () => {
    expect(findLocate(agg, 0)).toEqual({ frame: 1, local: 0 });
    expect(findLocate(agg, 2)).toEqual({ frame: 3, local: 0 });
    expect(findLocate(agg, 4)).toEqual({ frame: 3, local: 2 });
    expect(findLocate(agg, 5)).toBeNull();
    expect(findLocate(agg, -1)).toBeNull();
    expect(findLocate(agg, 1.5)).toBeNull();
  });

  it('findGlobalIndex', () => {
    expect(findGlobalIndex(agg, { frame: 3, local: 1 })).toBe(3);
    expect(findGlobalIndex(agg, { frame: 3, local: 3 })).toBe(-1);
    expect(findGlobalIndex(agg, { frame: 9, local: 0 })).toBe(-1);
    expect(findGlobalIndex(agg, null)).toBe(-1);
  });

  it('findStep wraps and starts from either end', () => {
    expect(findStep(agg, null, 1)).toEqual({ frame: 1, local: 0 });
    expect(findStep(agg, null, -1)).toEqual({ frame: 3, local: 2 });
    expect(findStep(agg, { frame: 1, local: 1 }, 1)).toEqual({ frame: 3, local: 0 });
    expect(findStep(agg, { frame: 3, local: 2 }, 1)).toEqual({ frame: 1, local: 0 });
    expect(findStep(agg, { frame: 1, local: 0 }, -1)).toEqual({ frame: 3, local: 2 });
    expect(findStep({ frames: [1], counts: new Map() }, null, 1)).toBeNull();
  });
});
