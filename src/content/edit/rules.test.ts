import { afterEach, beforeEach, expect, it } from 'vitest';
import type { RuleAddress } from '../../lib/edit/rule-address';
import type { RuleChange } from '../../lib/edit/types';
import { RuleTracker } from './rules';

const CSS_TEXT = '.a{color:red}.a{color:blue}';
const addr = (occ: number, selector = '.a'): RuleAddress => ({
  stylesheet: 'inline',
  selector,
  wrappers: [],
  occ,
  scopeAddress: null,
});
const page = (css = CSS_TEXT) => {
  document.head.innerHTML = `<style>${css}</style>`;
  document.body.innerHTML = '<p class="a">x</p>';
};
const pageRules = () => [...document.querySelector('style')!.sheet!.cssRules] as CSSStyleRule[];

let t: RuleTracker;
beforeEach(() => {
  page();
  t = new RuleTracker('test', () => {});
});
afterEach(() => {
  t.unwatch();
  document.head.replaceChildren();
  document.body.replaceChildren();
});

it('edits the addressed occurrence only', () => {
  const r = t.editRule(addr(1), 'color: green') as RuleChange;
  expect(r.after).toBe('.a { color: green; }');
  expect(pageRules().map((x) => x.style.color)).toEqual(['red', 'green']);
  expect(t.flattened()).toHaveLength(1);
});

it('rejects an invalid selector', () => {
  expect(t.editSelector(addr(0), '..bad')).toEqual({ error: 'Invalid selector' });
});

it('edits a selector', () => {
  t.editSelector(addr(0), '.z');
  expect(pageRules()[0]!.selectorText).toBe('.z');
});

it('adds a rule to its own style tag', () => {
  t.addRule(document, '.b');
  const own = document.querySelector('style#sr-rule-edits-test')!;
  expect(own.textContent).toContain('.b {');
  t.editRule({ ...addr(0, '.b'), stylesheet: 'sr-rule-edits' }, 'color: pink');
  expect(own.textContent).toContain('.b { color: pink; }');
});

it('round-trips through serialize and keeps dormant edits', () => {
  t.editRule(addr(1), 'color: green');
  t.addRule(document, '.b');
  const saved = t.serialize();
  expect(saved).toHaveLength(2);

  page();
  const t2 = new RuleTracker('test', () => {});
  expect(t2.applySerialized(saved)).toEqual({ applied: 2, dormant: [] });
  expect(pageRules().map((x) => x.style.color)).toEqual(['red', 'green']);
  expect(t2.serialize()).toEqual(saved);

  page('.a{color:red}');
  const t3 = new RuleTracker('test', () => {});
  const res = t3.applySerialized(saved.filter((e) => !e.own));
  expect(res.dormant).toHaveLength(1);
  expect(t3.serialize()).toEqual(saved.filter((e) => !e.own));
});

it('reverts one change, then everything including its own tag', () => {
  const r = t.editRule(addr(1), 'color: green') as RuleChange;
  t.revert(r.recordId);
  expect(pageRules()[1]!.style.color).toBe('blue');
  t.addRule(document, '.b');
  t.revertAll();
  expect(document.getElementById('sr-rule-edits-test')).toBeNull();
  expect(t.hasChanges()).toBe(false);
});

it('addresses and reapplies rules inside an open shadow root', () => {
  document.body.innerHTML = '<div id="host"></div>';
  const sr = document.getElementById('host')!.attachShadow({ mode: 'open' });
  sr.innerHTML = '<style>.s{color:red}</style><span class="s">y</span>';
  const a: RuleAddress = { ...addr(0, '.s'), scopeAddress: '#host' };
  t.editRule(a, 'color: green');
  const saved = t.serialize();
  expect(saved[0]!.scopeAddress).toBe('#host');

  sr.innerHTML = '<style>.s{color:red}</style><span class="s">y</span>';
  const t2 = new RuleTracker('test', () => {});
  expect(t2.applySerialized(saved).applied).toBe(1);
  expect((sr.querySelector('style')!.sheet!.cssRules[0] as CSSStyleRule).style.color).toBe('green');
});

it('reapplyAll moves edits of a removed sheet to dormant and back', () => {
  t.editRule(addr(1), 'color: green');
  document.head.innerHTML = '';
  t.reapplyAll();
  expect(t.flattened()).toHaveLength(0);
  expect(t.serialize()).toHaveLength(1);
  document.head.innerHTML = `<style>${CSS_TEXT}</style>`;
  t.reapplyAll();
  expect(pageRules()[1]!.style.color).toBe('green');
  expect(t.flattened()).toHaveLength(1);
});
