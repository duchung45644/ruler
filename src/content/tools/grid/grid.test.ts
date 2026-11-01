import { afterEach, beforeEach, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { getSettings } from '../../../lib/settings';
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
  await flush();
  const { layoutGrid } = await getSettings();
  expect(layoutGrid.columns).toBe(12);
  expect(layoutGrid.color).toBe('#FC48FF');
});

it('key 3 toggles the grid without opening the popover', async () => {
  await initGrid();
  routeKey(new KeyboardEvent('keydown', { key: '3' }));
  await flush();
  expect((await getSettings()).layoutGrid.isOn).toBe(true);
  expect(state.grid.isOn).toBe(true);
  expect(state.popover).toBeNull();
});
