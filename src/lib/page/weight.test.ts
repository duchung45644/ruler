import { describe, expect, it } from 'vitest';
import { classifyResource, WeightTotals } from './weight';

describe('classifyResource', () => {
  it.each([
    [{ initiatorType: 'link', name: 'a.css' }, 'css'],
    [{ initiatorType: 'other', name: 'https://x/a.css?v=1' }, 'css'],
    [{ initiatorType: 'img', name: 'a' }, 'img'],
    [{ initiatorType: 'other', name: 'f.woff2' }, 'font'],
    [{ initiatorType: 'xmlhttprequest', name: 'api' }, 'fetch'],
    [{ initiatorType: 'script', name: 'a.js' }, 'script'],
    [{ initiatorType: 'video', name: 'v' }, 'media'],
    [{ initiatorType: 'beacon', name: 'b' }, 'other'],
  ] as const)('%o → %s', (e, type) => expect(classifyResource(e)).toBe(type));
});

const entry = (name: string, size: number, startTime = 1, encoded = 0) => ({
  name,
  startTime,
  initiatorType: 'script',
  transferSize: size,
  encodedBodySize: encoded,
});

describe('WeightTotals', () => {
  it('sums transfer size, falls back to encoded size, counts unknowns once', () => {
    const t = new WeightTotals();
    t.add(entry('a.js', 100));
    t.add(entry('a.js', 100)); // same entry again
    t.add(entry('b.js', 0, 2, 40));
    t.add(entry('c.js', 0, 3));
    expect(t.result({ transferSize: 10, encodedBodySize: 0 })).toEqual({
      total: 150,
      document: 10,
      byType: { script: 140, css: 0, img: 0, font: 0, fetch: 0, media: 0, other: 0 },
      unknownCount: 1,
      bufferFull: false,
    });
  });

  it('after a navigation mark skips older entries and the document', () => {
    const t = new WeightTotals(50);
    t.add(entry('old.js', 100, 10));
    t.add(entry('new.js', 30, 60));
    expect(t.result({ transferSize: 10, encodedBodySize: 0 })).toMatchObject({
      total: 30,
      document: 0,
    });
  });

  it('is null when nothing is known', () => {
    expect(new WeightTotals().result(undefined)).toBeNull();
  });
});
