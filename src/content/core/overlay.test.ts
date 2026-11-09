import { afterEach, describe, expect, it, vi } from 'vitest';
import { addPainter, layer, requestPaint } from './overlay';

afterEach(() => vi.unstubAllGlobals());

describe('overlay', () => {
  it('batches paints into one rAF and gives each painter its own container', () => {
    let cb: FrameRequestCallback = () => {};
    const raf = vi.fn((f: FrameRequestCallback) => ((cb = f), 1));
    vi.stubGlobal('requestAnimationFrame', raf);
    const paint = vi.fn((el: HTMLElement) => el.append('x'));
    const off = addPainter('t', paint);
    requestPaint();
    requestPaint();
    requestPaint();
    expect(raf).toHaveBeenCalledTimes(1);
    cb(0);
    expect(paint).toHaveBeenCalledTimes(1);
    expect(layer.children).toHaveLength(1);
    off();
    expect(layer.children).toHaveLength(0);
  });

  it('named repaints redraw only those painters; an Event (listener use) redraws all', () => {
    let cb: FrameRequestCallback = () => {};
    vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => ((cb = f), 1));
    const a = vi.fn();
    const b = vi.fn();
    const offA = addPainter('a', a);
    const offB = addPainter('b', b);
    requestPaint('a');
    cb(0);
    expect([a.mock.calls.length, b.mock.calls.length]).toEqual([1, 0]);
    requestPaint(new Event('scroll'));
    cb(0);
    expect([a.mock.calls.length, b.mock.calls.length]).toEqual([2, 1]);
    requestPaint('b');
    requestPaint(); // a full request in the same frame wins
    cb(0);
    expect([a.mock.calls.length, b.mock.calls.length]).toEqual([3, 2]);
    offA();
    offB();
  });
});
