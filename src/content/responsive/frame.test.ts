import { afterEach, expect, it, vi } from 'vitest';
import { resetDrag } from '../core/drag';
import { dragSize, LOAD_TIMEOUT_MS, loadTimer, startResize } from './frame';

afterEach(() => {
  resetDrag();
  vi.useRealTimers();
});

it('right / bottom / corner change only their axes', () => {
  const s = { width: 400, height: 600 };
  expect(dragSize(s, 'right', 50, 80)).toEqual({ width: 450, height: 600 });
  expect(dragSize(s, 'bottom', 50, 80)).toEqual({ width: 400, height: 680 });
  expect(dragSize(s, 'corner', 50.4, -79.6)).toEqual({ width: 450, height: 520 });
});

it('drag clamps to 200×300', () => {
  expect(dragSize({ width: 400, height: 600 }, 'corner', -1000, -1000)).toEqual({
    width: 200,
    height: 300,
  });
});

it('startResize reports clamped sizes and brackets the drag with busy', () => {
  const sizes: unknown[] = [];
  const busy: boolean[] = [];
  const down = new PointerEvent('pointerdown', { clientX: 100, clientY: 100, button: 0 });
  startResize(
    down,
    'corner',
    { width: 390, height: 844 },
    (s) => sizes.push(s),
    (b) => busy.push(b),
  );
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: -500, clientY: 150 }));
  window.dispatchEvent(new PointerEvent('pointerup', { clientX: -500, clientY: 150 }));
  expect(sizes).toEqual([{ width: 200, height: 894 }]);
  expect(busy.at(0)).toBe(true);
  expect(busy.at(-1)).toBe(false);
});

it('load timer fires after 15s unless ready first', () => {
  vi.useFakeTimers();
  const late = vi.fn();
  const early = vi.fn();
  loadTimer(late);
  loadTimer(early).ready();
  vi.advanceTimersByTime(LOAD_TIMEOUT_MS - 1);
  expect(late).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(late).toHaveBeenCalledOnce();
  expect(early).not.toHaveBeenCalled();
});
