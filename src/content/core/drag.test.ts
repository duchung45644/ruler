import { afterEach, expect, it, vi } from 'vitest';
import { installDragGuard, isDragging, resetDrag, startDrag } from './drag';

afterEach(() => {
  resetDrag();
  vi.useRealTimers();
});

const ptr = (type: string) => new PointerEvent(type, { bubbles: true, cancelable: true });
const click = () => document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));

it('swallows the click right after a drag, then clears after 50ms', () => {
  vi.useFakeTimers();
  const ac = new AbortController();
  installDragGuard(ac.signal);
  let clicks = 0;
  document.addEventListener('click', () => clicks++, { signal: ac.signal });
  const onMove = vi.fn();
  const onEnd = vi.fn();
  startDrag(ptr('pointerdown'), onMove, onEnd);
  expect(isDragging()).toBe(true);
  window.dispatchEvent(ptr('pointermove'));
  expect(onMove).toHaveBeenCalledTimes(1);
  window.dispatchEvent(ptr('pointerup'));
  expect(onEnd).toHaveBeenCalledTimes(1);
  click();
  expect(clicks).toBe(0);

  startDrag(ptr('pointerdown'), onMove);
  window.dispatchEvent(ptr('pointerup'));
  vi.advanceTimersByTime(60);
  expect(isDragging()).toBe(false);
  click();
  expect(clicks).toBe(1);
  ac.abort();
});

it('stops tracking when the session signal aborts mid-drag', () => {
  const ac = new AbortController();
  installDragGuard(ac.signal);
  const onMove = vi.fn();
  startDrag(ptr('pointerdown'), onMove);
  ac.abort();
  window.dispatchEvent(ptr('pointermove'));
  expect(onMove).not.toHaveBeenCalled();
});

it('pointercancel and blur end the drag', () => {
  vi.useFakeTimers();
  const ac = new AbortController();
  installDragGuard(ac.signal);
  startDrag(ptr('pointerdown'), () => {});
  window.dispatchEvent(ptr('pointercancel'));
  vi.advanceTimersByTime(60);
  expect(isDragging()).toBe(false);
  startDrag(ptr('pointerdown'), () => {});
  window.dispatchEvent(new Event('blur'));
  vi.advanceTimersByTime(60);
  expect(isDragging()).toBe(false);
  ac.abort();
});

it('guard swallows pointerup mid-drag but still ends the drag', () => {
  const ac = new AbortController();
  installDragGuard(ac.signal);
  let ups = 0;
  document.addEventListener('pointerup', () => ups++, { signal: ac.signal });
  const onEnd = vi.fn();
  startDrag(ptr('pointerdown'), () => {}, onEnd);
  document.body.dispatchEvent(ptr('pointerup'));
  expect(onEnd).toHaveBeenCalledTimes(1);
  expect(ups).toBe(0);
  ac.abort();
});
