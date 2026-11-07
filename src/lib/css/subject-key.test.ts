import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MatchedRule } from '../element/types';
import { collectRules, matchedRules, sheetsOf, subjectKey, type KnownRule } from './matched';
import { specificity, splitState, splitTop } from './specificity';

afterEach(() => {
  document.head.replaceChildren();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('subjectKey', () => {
  it.each([
    // id beats class beats tag, read from the subject (rightmost) compound only
    ['div#main.a', '#main'],
    ['div.a.b', '.a'],
    ['section > ul li', 'li'],
    ['#x .y', '.y'],
    ['.y ~ p', 'p'],
    ['a + b', 'b'],
    ['DIV', 'div'],
    // escapes
    ['.a\\:b', '.a:b'],
    ['#\\31 23', '#123'],
    ['#\\31 23 .z', '.z'],
    ['.\\31 0', '.10'],
    ['.a\\.b', '.a.b'],
    ['.\\0', '.�'],
    ['.\\110000', '.�'],
    ['.\\d800', '.�'],
    ['.a\\ b', '.a b'],
    ['#a\\ b', '#a b'],
    ['#\\31\t23', '#123'],
    ['.\\31  .b', '.b'],
    // functional pseudo-classes say nothing about the key
    [':not(.x)', null],
    ['div:not(.x)', 'div'],
    [':is(.a, .b)', null],
    [':where(#a)', null],
    ['p:is(.a .b)', 'p'],
    [':has(> .a)', null],
    ['li:has(.a, #b)', 'li'],
    [':nth-child(2n of .a)', null],
    ['.a :not(.b)', null],
    ['.k:hover', '.k'],
    // attribute selectors with . or # inside quotes / values
    ['[href="a.b#c"]', null],
    ["a[href='#top']", 'a'],
    ['[data-x=".y"] .z', '.z'],
    ['[data-x="a b"]', null],
    ['[data-x="]"].q', '.q'],
    ['[lang|=en]', null],
    // namespaces fall back
    ['svg|rect', null],
    ['*|*', null],
    ['|p', null],
    ['svg|rect.a', null],
    // universal
    ['*', null],
    ['*.a', '.a'],
    ['div *', null],
    // pseudo-elements: the subject compound before them
    ['p::before', 'p'],
    ['.a::marker', '.a'],
    ['::selection', null],
    ['::slotted(.a)', null],
    [':host(.a)', null],
    // SVG camelCase: keyed lowercased, matched against the lowercased localName
    ['linearGradient', 'lineargradient'],
    ['svg linearGradient#g', '#g'],
    // unbalanced / odd input never throws
    ['.a(', null],
    ['[x', null],
    ['', null],
  ])('%s → %s', (sel, key) => {
    expect(subjectKey(sel)).toBe(key);
  });
});

/** The pre-index matchedRules: every rule, every alternative. */
function linear(el: Element, rules: KnownRule[]): MatchedRule[] {
  const out: MatchedRule[] = [];
  for (const k of rules) {
    let best: ReturnType<typeof specificity> | null = null;
    for (const alt of splitTop(k.rule.selectorText, ',')) {
      const { state, pseudoElement } = splitState(alt);
      let ok: boolean;
      try {
        ok = el.matches(alt);
      } catch {
        ok = false;
      }
      if (state || pseudoElement || !ok) continue;
      const s = specificity(alt);
      if (!best || s.score > best.score) best = s;
    }
    if (best)
      out.push({
        selector: k.rule.selectorText,
        sourceIndex: k.sourceIndex,
        score: best.score,
      } as MatchedRule);
  }
  return out.sort((a, b) => b.score - a.score || b.sourceIndex - a.sourceIndex);
}
const brief = (rs: MatchedRule[]) =>
  rs.filter((r) => r.selector !== 'element.style').map((r) => [r.selector, r.sourceIndex, r.score]);

function style(css: string) {
  const s = document.createElement('style');
  s.textContent = css;
  document.head.append(s);
}

const CSS = `
  div { color: red }
  DIV.Card { color: blue }
  .card, #hero, * { margin: 0 }
  .a\\:b { color: green }
  #\\31 23 { color: green }
  p:not(.x) { color: pink }
  :is(.card, .item) > span { color: teal }
  :where(#hero) .title { color: navy }
  li:has(.badge) { color: olive }
  [data-k=".card"] { color: lime }
  a[href='#top'] { color: aqua }
  svg|rect { fill: red }
  linearGradient { color: red }
  lineargradient { color: blue }
  stop { color: red }
  p::before { content: "x" }
  .card:hover { color: red }
  .item, ul li, :not(.nope) { padding: 1px }
  .card .item.on { color: gold }
  .Card { color: maroon }
  span.title, #nope, em { color: silver }
  @media (min-width: 1px) { .item { color: black } }
`;
const HTML = `
  <div id="hero" class="card Card">
    <h1 class="title">t</h1>
    <span class="a:b">s</span>
    <ul><li class="item on"><span class="badge">1</span></li><li class="item">2</li></ul>
    <p class="x">no</p><p data-k=".card">yes</p>
    <a href="#top" id="123">top</a>
    <em>e</em>
    <svg><defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect/></svg>
  </div>`;

it('indexed matchedRules equals the linear scan on a varied DOM', () => {
  style(CSS);
  document.body.innerHTML = HTML;
  const rules = collectRules(sheetsOf(document));
  let compared = 0;
  for (const el of document.body.querySelectorAll('*')) {
    expect(brief(matchedRules(el, rules)), el.outerHTML.slice(0, 40)).toEqual(
      brief(linear(el, rules)),
    );
    compared++;
  }
  expect(compared).toBeGreaterThan(15);
});

it('finds escaped and SVG camelCase subjects through the index', () => {
  style(CSS);
  document.body.innerHTML = HTML;
  const rules = collectRules(sheetsOf(document));
  const sel = (el: Element) => matchedRules(el, rules).map((r) => r.selector);
  expect(sel(document.querySelector('span[class="a:b"]')!)).toContain('.a\\:b');
  // happy-dom's matches() misreads `#\31 23`; the index must still hand it over for testing
  const num = document.getElementById('123')!;
  const spy = vi.spyOn(num, 'matches');
  matchedRules(num, rules);
  expect(spy.mock.calls.map((c) => c[0])).toContain('#\\31 23');
  const grad = document.getElementById('g')!;
  expect(grad.localName).toBe('linearGradient');
  expect(sel(grad)).toEqual(brief(linear(grad, rules)).map((r) => r[0]));
});

it('quirks mode tests every rule (class / id names are case-insensitive there)', () => {
  style('.Foo { color: red } #Bar { color: blue }');
  document.body.innerHTML = '<p class="foo" id="bar">x</p>';
  const el = document.querySelector('p')!;
  const rules = collectRules(sheetsOf(document));
  const tested = () => {
    const spy = vi.spyOn(el, 'matches');
    matchedRules(el, rules);
    const seen = spy.mock.calls.map((c) => c[0]);
    spy.mockRestore();
    return seen;
  };
  expect(tested()).toEqual([]); // standards mode: the buckets rule both out
  // happy-dom has no compatMode; Chromium reports BackCompat for doctype-less pages
  Object.defineProperty(document, 'compatMode', { value: 'BackCompat', configurable: true });
  try {
    expect(tested().sort()).toEqual(['#Bar', '.Foo']);
  } finally {
    delete (document as { compatMode?: string }).compatMode;
  }
});

it('a comma list mixing keyed and unkeyed alternatives is always tested', () => {
  style('.k, :not(.z) { color: red } .k, #j { color: blue }');
  document.body.innerHTML = '<b>x</b>';
  const el = document.querySelector('b')!;
  const rules = collectRules(sheetsOf(document));
  expect(matchedRules(el, rules).map((r) => r.selector)).toEqual(['.k, :not(.z)']);
  expect(brief(matchedRules(el, rules))).toEqual(brief(linear(el, rules)));
});

it('re-parses a rule whose selectorText changed', () => {
  style('.old { color: red }');
  document.body.innerHTML = '<i class="new">x</i>';
  const el = document.querySelector('i')!;
  const sheet = document.styleSheets[0]!;
  const rule = sheet.cssRules[0] as CSSStyleRule;
  expect(matchedRules(el, collectRules(sheetsOf(document)))).toEqual([]);
  Object.defineProperty(rule, 'selectorText', { value: '.new', configurable: true });
  expect(matchedRules(el, collectRules(sheetsOf(document))).map((r) => r.selector)).toEqual([
    '.new',
  ]);
});
