import { afterEach, expect, it, vi } from 'vitest';
import { addPin, clearPins, pins, removePin } from './pins.svelte';

afterEach(() => clearPins());

it('adds, removes and clears pins', () => {
  const el = document.createElement('div');
  const a = addPin(el, { x: 1, y: 2 });
  addPin(el, { x: 3, y: 4 });
  expect(pins.length).toBe(2);
  removePin(a.id);
  expect(pins.length).toBe(1);
  clearPins();
  expect(pins.length).toBe(0);
});

it('stores page coordinates (viewport + scroll at pin time)', () => {
  vi.spyOn(window, 'scrollX', 'get').mockReturnValue(100);
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(200);
  const p = addPin(document.body, { x: 10, y: 20 });
  expect([p.pageX, p.pageY]).toEqual([110, 220]);
  vi.restoreAllMocks();
});
