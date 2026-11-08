import { describe, expect, it } from 'vitest';
import {
  cornerAt,
  initialPlacement,
  nudgeDelta,
  resizeFromCorner,
  togglePinned,
  type OverlayImage,
} from './overlay-image';

const base: OverlayImage = {
  src: '',
  x: 100,
  y: 1500,
  scale: 100,
  opacity: 50,
  mode: 'normal',
  visible: true,
  fixed: false,
};
const key = (k: Partial<KeyboardEvent>) => ({
  key: '',
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  ...k,
});

describe('overlay-image', () => {
  it('initialPlacement: @2x shows at 50%, centred in page coords', () => {
    expect(
      initialPlacement({ width: 2880, height: 2000 }, { x: 0, y: 500, width: 1440, height: 900 }),
    ).toEqual({ scale: 50, x: 0, y: 450 });
    expect(
      initialPlacement({ width: 400, height: 300 }, { x: 0, y: 0, width: 1440, height: 900 }),
    ).toEqual({ scale: 100, x: 520, y: 300 });
  });

  it('togglePinned converts page <-> screen so the image does not jump', () => {
    const a = togglePinned(base, { x: 0, y: 1000 });
    expect(a).toEqual({ x: 100, y: 500, fixed: true });
    expect(togglePinned({ ...base, ...a }, { x: 0, y: 1000 })).toEqual({
      x: 100,
      y: 1500,
      fixed: false,
    });
  });

  it('nudgeDelta: 1px, Shift 10px, ignores Ctrl/Meta/Alt (Alt+Shift+arrows select siblings)', () => {
    expect(nudgeDelta(key({ key: 'ArrowRight', shiftKey: true }))).toEqual({ dx: 10, dy: 0 });
    expect(nudgeDelta(key({ key: 'ArrowUp' }))).toEqual({ dx: 0, dy: -1 });
    expect(nudgeDelta(key({ key: 'ArrowLeft', altKey: true, shiftKey: true }))).toBeNull();
    expect(nudgeDelta(key({ key: 'ArrowLeft', ctrlKey: true }))).toBeNull();
    expect(nudgeDelta(key({ key: 'a' }))).toBeNull();
  });

  it('resizeFromCorner: min width 20, keeps the opposite corner', () => {
    const nat = { width: 400, height: 200 };
    const o = { ...base, x: 100, y: 100 };
    expect(resizeFromCorner(o, nat, 'br', 110, 0, { x: 0, y: 0 })).toEqual({
      x: 100,
      y: 100,
      scale: 5,
    });
    // tl anchors br (500, 300): width 300 -> 75%
    expect(resizeFromCorner(o, nat, 'tl', 200, 0, { x: 0, y: 0 })).toEqual({
      x: 200,
      y: 150,
      scale: 75,
    });
  });

  it('cornerAt', () => {
    const s = { width: 100, height: 100 };
    expect(cornerAt(s, 2, 2)).toBe('tl');
    expect(cornerAt(s, 95, 95)).toBe('br');
    expect(cornerAt(s, 50, 50)).toBeNull();
  });
});
