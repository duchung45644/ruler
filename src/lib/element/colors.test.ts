import { expect, it } from 'vitest';
import { colorsOf, elementColors } from './colors';
import { styleOf } from './style';

it('collects text, background + gradient stops, borders unlike the text', () => {
  const c = colorsOf(
    styleOf({
      color: 'rgb(255, 0, 0)',
      'background-color': 'rgba(0, 0, 0, 0)',
      'background-image': 'linear-gradient(rgb(0, 0, 255), rgb(0, 255, 0))',
      'border-top-color': 'rgb(255, 0, 0)',
      'border-left-color': 'rgb(1, 2, 3)',
    }),
  );
  expect(c).toEqual({
    text: ['#FF0000'],
    backgrounds: ['#0000FF', '#00FF00'],
    borders: ['#010203'],
  });
});

it('merges duplicates by HEX keeping first-seen order', () => {
  expect(
    elementColors([
      { text: ['#FF0000'], backgrounds: [], borders: [] },
      { text: ['#000000', '#FF0000'], backgrounds: ['#FFFFFF'], borders: [] },
    ]),
  ).toEqual({ text: ['#FF0000', '#000000'], backgrounds: ['#FFFFFF'], borders: [] });
});
