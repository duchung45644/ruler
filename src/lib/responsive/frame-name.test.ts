import { describe, expect, it } from 'vitest';
import { frameName, parseFrameName } from './frame-name';

describe('frame-name', () => {
  it('round-trips', () => {
    expect(frameName('abc', 3)).toBe('screen-ruler-responsive-iframe-abc-3');
    expect(parseFrameName('abc', frameName('abc', 3))).toBe(3);
  });

  it('rejects other names and other extensions', () => {
    expect(parseFrameName('abc', '')).toBeNull();
    expect(parseFrameName('abc', undefined)).toBeNull();
    expect(parseFrameName('abc', frameName('xyz', 1))).toBeNull();
    expect(parseFrameName('abc', 'screen-ruler-responsive-iframe-abc-')).toBeNull();
    expect(parseFrameName('abc', 'screen-ruler-responsive-iframe-abc-2x')).toBeNull();
  });
});
