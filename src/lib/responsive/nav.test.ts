import { describe, expect, it } from 'vitest';
import { decideNavigation, formGetUrl, isSameSite, siteOf } from './nav';

const cur = 'https://www.example.com/a';

describe('nav', () => {
  it('siteOf', () => {
    expect(siteOf('a.b.example.com.')).toBe('example.com');
    expect(siteOf('shop.example.co.uk')).toBe('example.co.uk');
    expect(siteOf('me.github.io')).toBe('me.github.io');
    expect(siteOf('10.0.0.1')).toBe('10.0.0.1');
    expect(siteOf('localhost')).toBe('localhost');
  });

  it('isSameSite', () => {
    expect(isSameSite('http://blog.example.com/x', cur)).toBe(true);
    expect(isSameSite('https://example.org', cur)).toBe(false);
    expect(isSameSite('http://localhost:3000', 'http://localhost:4000')).toBe(false);
    expect(isSameSite('http://localhost:3000/a', 'http://localhost:3000/b')).toBe(true);
    expect(isSameSite('ftp://example.com', cur)).toBe(false);
    expect(isSameSite('not a url', cur)).toBe(false);
  });

  it('decideNavigation for links', () => {
    const link = (url: string, target?: string) =>
      decideNavigation({ kind: 'link', url, target, current: cur });
    expect(link('https://other.com/')).toBe('external-tab');
    expect(link('https://other.com/', '_blank')).toBe('default');
    expect(link('https://example.com/b', '_TOP')).toBe('in-frame');
    expect(link('https://example.com/b', '_parent')).toBe('in-frame');
    expect(link('https://example.com/b')).toBe('default');
    expect(link('mailto:a@b.c')).toBe('default');
  });

  it('decideNavigation for forms', () => {
    const form = (url: string, target?: string) =>
      decideNavigation({ kind: 'form', url, target, current: cur });
    expect(form('https://other.com/s')).toBe('external-tab');
    expect(form('https://other.com/s', '_blank')).toBe('default');
    expect(form('https://example.com/s', '_top')).toBe('default');
  });

  it('formGetUrl replaces the query', () => {
    expect(formGetUrl('https://x.com/s?old=1#h', [['q', 'a b']])).toBe('https://x.com/s?q=a+b#h');
  });
});
