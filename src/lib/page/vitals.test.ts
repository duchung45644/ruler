import { describe, expect, it } from 'vitest';
import { cumulativeLayoutShift, interactionToNextPaint, rating } from './vitals';

const s = (startTime: number, value: number, hadRecentInput = false) => ({
  startTime,
  value,
  hadRecentInput,
});

describe('cumulativeLayoutShift', () => {
  it('is 0 without shifts', () => expect(cumulativeLayoutShift([])).toBe(0));

  it('takes the largest session window (1s gap, 5s cap)', () => {
    const shifts = [s(0, 0.1), s(500, 0.1), s(2000, 0.05), s(2500, 0.05), s(3000, 0.05)];
    expect(cumulativeLayoutShift(shifts)).toBeCloseTo(0.2);
    const long = [0, 900, 1800, 2700, 3600, 4500, 5400].map((t) => s(t, 0.1));
    expect(cumulativeLayoutShift(long)).toBeCloseTo(0.6); // window closes after 5s
  });

  it('ignores shifts after input', () => {
    expect(cumulativeLayoutShift([s(0, 0.3, true), s(100, 0.01)])).toBeCloseTo(0.01);
  });
});

describe('interactionToNextPaint', () => {
  it('is null without interactions and the worst under 50', () => {
    expect(interactionToNextPaint([])).toBeNull();
    expect(interactionToNextPaint([40, 300, 120])).toBe(300);
  });

  it('skips one outlier per 50 interactions', () => {
    const d = [...Array(60).keys()].map((i) => i * 10); // max 590
    expect(interactionToNextPaint(d)).toBe(580);
  });
});

describe('rating', () => {
  it('uses web.dev thresholds', () => {
    expect(rating('lcp', 2500)).toBe('good');
    expect(rating('cls', 0.2)).toBe('needs-improvement');
    expect(rating('inp', 600)).toBe('poor');
  });
});
