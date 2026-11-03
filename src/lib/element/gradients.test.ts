import { expect, it } from 'vitest';
import { parseGradients } from './gradients';

it('parses angle, side keywords, shapes and fills stop positions', () => {
  const [a, b] = parseGradients(
    'linear-gradient(to right, rgb(255, 0, 0), rgb(0, 255, 0), rgb(0, 0, 255)), radial-gradient(circle, rgb(0, 0, 0) 10%, rgb(255, 255, 255))',
  );
  expect(a).toMatchObject({ type: 'linear-gradient', angle: 90 });
  expect(a!.stops.map((s) => s.position)).toEqual([0, 50, 100]);
  expect(b).toMatchObject({ type: 'radial-gradient', shape: 'circle', angle: null });
  expect(b!.stops.map((s) => s.position)).toEqual([10, 100]);
  expect(parseGradients('url(a.png)')).toEqual([]);
  expect(parseGradients('linear-gradient(rgb(0, 0, 0), rgb(1, 1, 1))')[0]!.angle).toBe(180);
});
