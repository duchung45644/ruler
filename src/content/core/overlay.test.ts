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
});
