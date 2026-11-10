import { describe, expect, it } from 'vitest';
import { ALWAYS, NEVER, forceSchemeMedia, hasSchemeFeature } from './color-scheme';

describe('forceSchemeMedia', () => {
  it('makes the matching scheme true and the other false', () => {
    expect(forceSchemeMedia('(prefers-color-scheme: dark)', 'dark')).toBe(ALWAYS);
    expect(forceSchemeMedia('(prefers-color-scheme: dark)', 'light')).toBe(NEVER);
    expect(forceSchemeMedia('(PREFERS-COLOR-SCHEME:LIGHT)', 'light')).toBe(ALWAYS);
  });
  it('keeps the rest of the query and lists', () => {
    expect(
      forceSchemeMedia(
        'screen and (prefers-color-scheme: dark) and (min-width: 600px), print',
        'light',
      ),
    ).toBe(`screen and ${NEVER} and (min-width: 600px), print`);
    expect(forceSchemeMedia('not all and (prefers-color-scheme: light)', 'dark')).toBe(
      `not all and ${NEVER}`,
    );
  });
  it('treats the boolean form as true', () => {
    expect(forceSchemeMedia('(prefers-color-scheme)', 'light')).toBe(ALWAYS);
  });
  it('leaves other text alone', () => {
    expect(forceSchemeMedia('(min-width: 1px)', 'dark')).toBe('(min-width: 1px)');
    expect(hasSchemeFeature('(min-width: 1px)')).toBe(false);
    expect(hasSchemeFeature('(prefers-color-scheme: dark)')).toBe(true);
  });
});
