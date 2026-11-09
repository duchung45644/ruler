import { afterEach, beforeEach, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { getSettings } from '../../../lib/ext/settings';
import { routeKey } from '../../core/keys';
import { stopSession } from '../../core/session';
import { state } from '../../core/state.svelte';
import { initGrid, parseMaxWidth, setGrid } from '.';

beforeEach(() => fakeBrowser.reset());
afterEach(() => stopSession());
const flush = () => new Promise((r) => setTimeout(r, 0));

it('parseMaxWidth', () => {
  for (const v of ['', '0', 'auto', 'abc', '-5']) expect(parseMaxWidth(v)).toBe('auto');
  expect(parseMaxWidth('1200')).toBe(1200);
});

it('setGrid merges and saves the whole layoutGrid', async () => {
  await initGrid();
  setGrid({ columns: 12 });
  setGrid({ gutter: 24 }); // a burst saves once, after a pause
  await flush();
  expect((await getSettings()).layoutGrid.columns).not.toBe(12);
  await new Promise((r) => setTimeout(r, 350));
  const { layoutGrid } = await getSettings();
  expect(layoutGrid.gutter).toBe(24);
  expect(layoutGrid.columns).toBe(12);
  expect(layoutGrid.color).toBe('#FC48FF');
});

it('key G toggles the grid without opening the popover', async () => {
  await initGrid();
  routeKey(new KeyboardEvent('keydown', { key: 'g' }));
  await new Promise((r) => setTimeout(r, 350));
  expect((await getSettings()).layoutGrid.isOn).toBe(true);
  expect(state.grid.isOn).toBe(true);
  expect(state.popover).toBeNull();
});

it('paints N columns with padding and max-width', async () => {
  const { layer } = await import('../../core/overlay');
  layer.replaceChildren(); // boxes left by earlier tests' painters
  document.body.append(layer);
  await initGrid();
  const grid = () => layer.querySelector<HTMLElement>('[style*="grid-template-columns"]')!;
  const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
  await flush();
  setGrid({ isOn: true, columns: 4, margin: 30, maxWidth: 'auto' });
  await frame();
  expect(grid().children).toHaveLength(4);
  expect(grid().style.paddingInline || grid().style.paddingLeft).toBe('30px');
  expect(grid().style.maxWidth).toBe('none');
  setGrid({ maxWidth: 1200 });
  await frame();
  expect(grid().style.maxWidth).toBe('1200px');
  layer.remove();
});

it('opening the panel shows the grid', async () => {
  const { items } = await import('../../core/registry.svelte');
  await initGrid();
  state.grid.isOn = false;
  items.find((i) => i.id === 'grid')!.run();
  expect(state.popover).toBe('grid');
  expect(state.grid.isOn).toBe(true);
  // the button is the switch: with the panel open it turns the grid off
  items.find((i) => i.id === 'grid')!.run();
  expect([state.popover, state.grid.isOn]).toEqual([null, false]);
  // on without the panel (key G): the button opens the panel, grid stays on
  setGrid({ isOn: true });
  items.find((i) => i.id === 'grid')!.run();
  expect([state.popover, state.grid.isOn]).toEqual(['grid', true]);
  state.popover = null;
});

it('a pending save is written when the session stops', async () => {
  await initGrid();
  setGrid({ margin: 77 });
  stopSession();
  await flush();
  expect((await getSettings()).layoutGrid.margin).toBe(77);
});
