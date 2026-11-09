import { afterEach, describe, expect, it } from 'vitest';
import { sortTabOrder, tabOrder } from './tab-order';

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
