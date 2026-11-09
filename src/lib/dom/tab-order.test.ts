import { afterEach, describe, expect, it } from 'vitest';
import { sortTabOrder, tabOrder, touchesPage } from './tab-order';

describe('sortTabOrder', () => {
  it('puts positive indexes first (ascending, stable), then zeros, skipping negatives', () => {
    const items = [
      ['a', 0],
      ['b', 2],
      ['c', -1],
      ['d', 1],
      ['e', 2],
      ['f', 0],
    ] as const;
    expect(sortTabOrder(items, (t) => t[1]).map((t) => t[0])).toEqual(['d', 'b', 'e', 'a', 'f']);
  });
});

describe('tabOrder', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('skips disabled, hidden, inert, tabindex=-1 and own UI', () => {
    document.body.innerHTML = `
      <a id="a" href="#">a</a>
      <a id="nohref">x</a>
      <button id="b" tabindex="3">b</button>
      <button id="dis" disabled>x</button>
      <input id="hid" type="hidden">
      <div id="neg" tabindex="-1">x</div>
      <div id="t0" tabindex="0">t</div>
      <span style="display:none"><button id="gone">x</button></span>
      <div inert><button id="inert">x</button></div>
      <fieldset disabled><button id="fs">x</button></fieldset>
      <button id="own">x</button>
      <input id="i" tabindex="1">`;
    const order = tabOrder(document.body, (el) => el.id === 'own');
    expect(order.map((e) => e.id)).toEqual(['i', 'b', 'a', 't0']);
  });
});

describe('tabOrder in shadow roots', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('inserts an open shadow scope at its host, sorted on its own', () => {
    document.body.innerHTML = `<a id="a" href="#">a</a><x-host id="h"></x-host><a id="z" href="#">z</a>`;
    const sr = document.getElementById('h')!.attachShadow({ mode: 'open' });
    sr.innerHTML = `<button id="s1">1</button><button id="s2" tabindex="1">2</button>`;
    const ids = tabOrder(document.body, () => false).map((e) => e.id);
    expect(ids).toEqual(['a', 's2', 's1', 'z']);
  });
});

describe('touchesPage', () => {
  const own = (el: Element) => el.localName.startsWith('pixellens-');
  const rec = (r: Partial<MutationRecord>) =>
    ({ addedNodes: [], removedNodes: [], ...r }) as unknown as MutationRecord;

  it('ignores style writes and insertions on our own nodes', () => {
    const bar = document.createElement('div');
    bar.dataset.pixellens = '';
    const host = document.createElement('pixellens-vision');
    const html = document.documentElement;
    expect(
      touchesPage(
        [
          rec({ type: 'attributes', target: bar }),
          rec({ type: 'childList', target: html, addedNodes: [bar] as never }),
          rec({
            type: 'childList',
            target: host,
            addedNodes: [document.createElement('style')] as never,
          }),
        ],
        own,
      ),
    ).toBe(false);
    expect(touchesPage([rec({ type: 'attributes', target: document.body })], own)).toBe(true);
  });
});
