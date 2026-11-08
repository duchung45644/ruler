import { describe, expect, it } from 'vitest';
import { breakpointLabel, mediaConditions, parseBreakpoints } from './breakpoints';

describe('breakpoints', () => {
  it('merges, rounds and sorts', () => {
    expect(
      parseBreakpoints(['(min-width: 768px)', '(max-width: 767.98px)', '(min-width: 48em)']),
    ).toEqual([{ width: 768, kind: 'both' }]);
    expect(parseBreakpoints(['(max-width: 767.98px)', '(min-width: 1024px)'])).toEqual([
      { width: 767, kind: 'max' },
      { width: 1024, kind: 'min' },
    ]);
    expect(parseBreakpoints(['(min-width: 600px) and (max-width: 600px)'])).toEqual([
      { width: 600, kind: 'both' },
    ]);
  });

  it('skips sheets whose cssRules throw', () => {
    const bad = {
      get cssRules(): CSSRuleList {
        throw new DOMException('blocked', 'SecurityError');
      },
    } as CSSStyleSheet;
    const good = new CSSStyleSheet();
    good.replaceSync('@media (min-width: 500px) { p { color: red } }');
    const doc = { styleSheets: [bad], adoptedStyleSheets: [good] } as unknown as Document;
    expect(mediaConditions([doc])).toEqual([expect.stringContaining('min-width: 500px')]);
  });

  it('labels by kind', () => {
    expect(breakpointLabel({ width: 768, kind: 'min' })).toBe('≥768px');
    expect(breakpointLabel({ width: 767, kind: 'max' })).toBe('≤767px');
    expect(breakpointLabel({ width: 768, kind: 'both' })).toBe('768px');
  });
});

it('reads a fetched copy of a cross-origin sheet and reports the rest as blocked', () => {
  const crossOrigin = (href: string) => ({
    href,
    get cssRules(): CSSRuleList {
      throw new DOMException('cross-origin', 'SecurityError');
    },
  });
  const copy = new CSSStyleSheet();
  copy.replaceSync('@media (min-width: 768px) { a { color: red } }');
  const root = {
    styleSheets: [
      crossOrigin('https://cdn.example/a.css'),
      crossOrigin('https://cdn.example/b.css'),
    ],
    adoptedStyleSheets: [],
  } as never;
  const blocked: string[] = [];
  const conds = mediaConditions(
    [root],
    (h) => (h === 'https://cdn.example/a.css' ? copy : undefined),
    blocked,
  );
  expect(conds).toEqual(['(min-width: 768px)']);
  expect(blocked).toEqual(['https://cdn.example/b.css']);
});

it('reads the range syntax Tailwind v4 writes', () => {
  expect(
    parseBreakpoints([
      '(width >= 40rem)',
      '(width < 48rem)',
      '(1024px <= width)',
      '(min-width: 80rem)',
    ]),
  ).toEqual([
    { width: 640, kind: 'min' },
    { width: 768, kind: 'max' },
    { width: 1024, kind: 'min' },
    { width: 1280, kind: 'min' },
  ]);
});
