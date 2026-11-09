import { describe, expect, it } from 'vitest';
import { parseDecls } from './decls';
import {
  arbitraryClass,
  diffDecls,
  splitBlock,
  toBlocks,
  toCss,
  toPrompt,
  toTailwindText,
} from './export';
import type { RuleChange } from './types';

const rule = (before: string, after: string, extra: Partial<RuleChange> = {}): RuleChange => ({
  recordId: 'r',
  address: null,
  source: 'a.css',
  line: null,
  before,
  after,
  elementIds: [],
  ...extra,
});

describe('export', () => {
  it('splits a rule block and plain declarations', () => {
    expect(splitBlock('.a { color: red; }')).toEqual({
      selector: '.a',
      decls: [{ property: 'color', value: 'red', important: false }],
    });
    expect(splitBlock('color: red').selector).toBeNull();
  });

  it('diffs added, changed and removed properties', () => {
    expect(
      diffDecls(parseDecls('color: red; margin: 0'), parseDecls('color: blue; width: 1px')),
    ).toEqual([
      { property: 'color', from: 'red', to: 'blue' },
      { property: 'width', from: '', to: '1px' },
      { property: 'margin', from: '0', to: '' },
    ]);
  });

  it('merges edits per selector and names inline edits by element label', () => {
    const blocks = toBlocks(
      [
        rule('.a { color: red; }', '.a { color: blue; }'),
        rule('', '.a { color: green; }'),
        rule('', 'width: 10px;', { source: 'inline', elementIds: ['e1'] }),
        rule('.b { top: 0; }', '.b { top: 0; }'),
        rule('.c { top: 0; }', '.c { top: 1px; }'),
        rule('', '.c { top: 0; }'),
      ],
      { e1: '#hero' },
    );
    expect(blocks).toEqual([
      { selector: '.a', changes: [{ property: 'color', from: 'red', to: 'green' }] },
      { selector: '#hero', changes: [{ property: 'width', from: '', to: '10px' }] },
    ]);
  });

  const blocks = [
    {
      selector: '.a',
      changes: [
        { property: 'width', from: '', to: '123px' },
        { property: 'grid-template-areas', from: '', to: '"a b"' },
        { property: 'margin', from: '0', to: '' },
      ],
    },
  ];

  it('writes CSS with removed properties as comments', () => {
    expect(toCss(blocks)).toBe(
      '.a {\n  width: 123px;\n  grid-template-areas: "a b";\n  /* removed: margin: 0; */\n}',
    );
  });

  it('writes Tailwind classes with arbitrary fallbacks', () => {
    const convert = (css: Record<string, string>) => (css.width ? `w-[${css.width}]` : '');
    expect(toTailwindText(blocks, convert)).toBe(
      '.a: w-[123px] [grid-template-areas:"a_b"]  /* remove: margin */',
    );
    expect(arbitraryClass('--x', 'a_b c')).toBe('[--x:a\\_b_c]');
  });

  it('writes a prompt line per property', () => {
    const p = toPrompt(blocks, 'https://x.dev/');
    expect(p).toContain('- On https://x.dev/, element `.a`: set `width` to `123px`');
    expect(p).toContain('remove `margin` (was `0`)');
    expect(
      toPrompt([{ selector: 'b', changes: [{ property: 'c', from: '1', to: '2' }] }], ''),
    ).toContain('On the page, element `b`: change `c` from `1` to `2`');
  });
});
