import { afterEach, expect, it } from 'vitest';
import {
  collectRules,
  declKey,
  groupBySource,
  matchedRules,
  overriddenDecls,
  sheetsOf,
} from './matched';

afterEach(() => {
  document.head.replaceChildren();
  document.body.replaceChildren();
});

function setup(...css: string[]): HTMLElement {
  for (const c of css) {
    const s = document.createElement('style');
    s.textContent = c;
    document.head.append(s);
  }
  document.body.innerHTML = '<p id="b" class="a">x</p>';
  return document.getElementById('b')!;
}
const rulesFor = (el: Element) => matchedRules(el, collectRules(sheetsOf(document)));

it('sorts by specificity and marks the losing declaration', () => {
  const el = setup('.a{color:red} #b{color:blue}');
  const rules = rulesFor(el);
  expect(rules.map((r) => r.selector)).toEqual(['#b', '.a']);
  expect(rules[0]!.specificity).toEqual([1, 0, 0]);
  expect(overriddenDecls(rules)).toEqual(new Set([declKey(1, 'color')]));
});

it('lets !important beat specificity', () => {
  const el = setup('.a{color:red!important} #b{color:blue}');
  const rules = rulesFor(el);
  expect(rules[1]!.declarations[0]).toEqual({ property: 'color', value: 'red', important: true });
  expect(overriddenDecls(rules)).toEqual(new Set([declKey(0, 'color')]));
});

it('keeps inactive media out of the cascade', () => {
  const el = setup('.a{color:red} @media (min-width: 99999px){ #b{color:blue} }');
  const rules = rulesFor(el);
  const media = rules.find((r) => r.selector === '#b')!;
  expect(media.mediaActive).toBe(false);
  expect(media.wrappers).toEqual(['@media (min-width: 99999px)']);
  expect(overriddenDecls(rules).size).toBe(0);
});

it('leaves out state and pseudo-element rules', () => {
  const el = setup('.a:hover{color:red} .a::before{content:"x"} .a{margin:0}');
  expect(rulesFor(el).map((r) => r.selector)).toEqual(['.a']);
});

it('puts inline style first and lets it win', () => {
  const el = setup('#b{color:blue}');
  el.style.color = 'green';
  const rules = rulesFor(el);
  expect(rules.map((r) => r.source)).toEqual(['element.style', 'inline']);
  expect(overriddenDecls(rules)).toEqual(new Set([declKey(1, 'color')]));
});

it('groups by sheet in source order', () => {
  const el = setup('.a{color:red}', '#b{color:blue}');
  const groups = groupBySource(rulesFor(el));
  expect(groups.map((g) => g.name)).toEqual(['<style>']);
  expect(groups[0]!.rules.map((r) => r.selector)).toEqual(['#b', '.a']);
  const sheet = new CSSStyleSheet();
  sheet.replaceSync('p{margin:0}');
  const fetched = { sheet, source: 'https://x.test/a.css?v=1' };
  const all = matchedRules(el, collectRules([fetched, ...sheetsOf(document)]));
  expect(groupBySource(all).map((g) => g.name)).toEqual(['a.css', '<style>']);
});
