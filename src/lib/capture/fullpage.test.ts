import { describe, expect, it } from 'vitest';
import {
  afterScript,
  beforeScript,
  fullPagePlan,
  pickScroller,
  restoreScript,
  stitchDone,
} from './fullpage';

describe('pickScroller', () => {
  const c = (
    el: string,
    p: Partial<{ clientH: number; scrollH: number; clientW: number; overflowY: string }>,
  ) => ({
    el,
    clientH: 500,
    scrollH: 2000,
    clientW: 500,
    overflowY: 'auto',
    ...p,
  });
  it('skips short and non-scrolling elements, picks the biggest', () => {
    expect(pickScroller([c('a', { clientH: 80 })])).toBeNull();
    expect(pickScroller([c('a', { overflowY: 'visible' })])).toBeNull();
    expect(pickScroller([c('a', {}), c('b', { clientW: 900 })])).toBe('b');
  });
});

describe('fullPagePlan', () => {
  it('caps height by canvas limit / dpr', () => {
    expect(fullPagePlan({ winTotal: 50000, ih: 900, iw: 1280, dpr: 2, scroller: null })).toEqual({
      width: 1280,
      height: 16000,
      chunk: 4000,
      shift: 900,
    });
  });
  it('uses the scroll container when the window barely scrolls', () => {
    const p = fullPagePlan({
      winTotal: 920,
      ih: 900,
      iw: 1280,
      dpr: 1,
      scroller: { scrollH: 5000, clientH: 800 },
    });
    expect(p.height).toBe(900 + 4200);
  });
});

it('scripts', () => {
  expect(afterScript()).toContain('s.setProperty("transform", t[0], t[1])');
  expect(beforeScript(900)).toContain('translateY(900px)');
  expect(beforeScript(900)).toContain('--bd-cover-top');
  expect(restoreScript({ scrollTop: 40 })).toContain('[data-pixellens-scroll]');
});

it('stitchDone', () => {
  expect(stitchDone(4100, 900, 5000, 0, 1)).toBe(true);
  expect(stitchDone(0, 900, 5000, 0, 1)).toBe(false);
});
