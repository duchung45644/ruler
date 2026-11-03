import { expect, it } from 'vitest';
import { formatBytes, formatDim, formatSize } from './format';

it('formats dimensions and sizes', () => {
  expect(formatDim(12.5)).toBe('12.5');
  expect(formatDim(1 / 3)).toBe('0.333');
  expect(formatDim(40)).toBe('40');
  expect(formatSize(100, 20.25)).toBe('100 × 20.25');
});

it('formats bytes like legacy', () => {
  expect(formatBytes(512)).toBe('512 B');
  expect(formatBytes(1536)).toBe('1.5 KB');
  expect(formatBytes(3 * 1048576)).toBe('3.00 MB');
});
