import { expect, it } from 'vitest';
import { animations, easingPath, parseEasing, transitions } from './motion';
import { styleOf } from './style';

it('parses keywords and cubic-bezier, not steps', () => {
  expect(parseEasing('ease-in')).toEqual([0.42, 0, 1, 1]);
  expect(parseEasing('cubic-bezier(.1,.7,1,.1)')).toEqual([0.1, 0.7, 1, 0.1]);
  expect(parseEasing('steps(4)')).toBeNull();
  expect(easingPath([0, 0, 1, 1], 100, 100).startsWith('M0 100')).toBe(true);
});

it('pairs list values by index, falling back to the first', () => {
  const s = styleOf({
    'animation-name': 'spin, fade',
    'animation-duration': '1s',
    'animation-timing-function': 'linear, ease',
    'transition-property': 'opacity, transform',
    'transition-duration': '0.2s',
  });
  const a = animations(s, (n) => (n === 'spin' ? [{ offset: 0, transform: 'none' }] : []));
  expect(a[1]).toMatchObject({ name: 'fade', duration: '1s', timingFunction: 'ease', delay: '0s' });
  expect(a[0]!.keyframes).toHaveLength(1);
  expect(transitions(s).map((t) => t.property)).toEqual(['opacity', 'transform']);
  expect(
    transitions(styleOf({ 'transition-property': 'all', 'transition-duration': '0s' })),
  ).toEqual([]);
});
