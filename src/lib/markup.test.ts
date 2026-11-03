import { describe, expect, it } from 'vitest';
import {
  drawItem,
  editorCanvasStyle,
  hitArrowEnd,
  isTooSmall,
  textFontCss,
  type MarkItem,
} from './markup';

function recorder() {
  const calls: [string, ...unknown[]][] = [];
  const c: Record<string, unknown> = { globalAlpha: 1 };
  for (const m of [
    'save',
    'restore',
    'beginPath',
    'moveTo',
    'lineTo',
    'closePath',
    'stroke',
    'fill',
    'strokeRect',
    'fillText',
  ])
    c[m] = (...a: unknown[]) => calls.push([m, ...a]);
  c.fillRect = (...a: unknown[]) => calls.push(['fillRect', c.globalAlpha, ...a]);
  return { c: c as never, calls };
}
const item = (p: Partial<MarkItem>): MarkItem => ({
  tool: 'pen',
  color: '#f00',
  size: 4,
  k: 1,
  pts: [],
  ...p,
});

describe('drawItem', () => {
  it('arrow shaft stops inside the head; head is a filled triangle', () => {
    const { c, calls } = recorder();
    drawItem(
      c,
      item({
        tool: 'arrow',
        pts: [
          [0, 0],
          [100, 0],
        ],
      }),
    );
    const lines = calls.filter((x) => x[0] === 'lineTo');
    expect(lines[0]![1]).toBeCloseTo(100 - 20 * 0.6);
    expect(lines.slice(1)).toHaveLength(2);
    expect(calls.some((x) => x[0] === 'fill')).toBe(true);
  });
  it('highlight fills at 35%', () => {
    const { c, calls } = recorder();
    drawItem(
      c,
      item({
        tool: 'hl',
        pts: [
          [0, 0],
          [10, 10],
        ],
      }),
    );
    expect(calls.find((x) => x[0] === 'fillRect')![1]).toBe(0.35);
  });
  it('a one-point pen leaves a dot', () => {
    const { c, calls } = recorder();
    drawItem(c, item({ pts: [[5, 6]] }));
    expect(calls.find((x) => x[0] === 'lineTo')).toEqual(['lineTo', 5.01, 6]);
  });
});

it('isTooSmall, textFontCss, editorCanvasStyle', () => {
  expect(isTooSmall([0, 0], [2, 2], 1)).toBe(true);
  expect(isTooSmall([0, 0], [10, 0], 2)).toBe(false);
  expect(textFontCss(4)).toBe(22);
  expect(editorCanvasStyle(1000, 2500, 2)).toContain('max-height:none');
  expect(editorCanvasStyle(1000, 1500, 2)).toContain('calc(100vh - 100px)');
});

it('hitArrowEnd finds the topmost arrow head or tail', () => {
  const a = item({
    tool: 'arrow',
    pts: [
      [0, 0],
      [100, 0],
    ],
  });
  const b = item({
    tool: 'arrow',
    pts: [
      [100, 5],
      [200, 5],
    ],
  });
  const r = item({
    tool: 'rect',
    pts: [
      [0, 0],
      [100, 0],
    ],
  });
  expect(hitArrowEnd([a, b], [3, 2], 10)).toEqual({ i: 0, end: 0 });
  expect(hitArrowEnd([a, b], [101, 2], 10)).toEqual({ i: 1, end: 0 });
  expect(hitArrowEnd([a, b], [50, 0], 10)).toBeNull();
  expect(hitArrowEnd([r], [0, 0], 10)).toBeNull();
});
