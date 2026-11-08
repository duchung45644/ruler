import { describe, expect, it, vi } from 'vitest';
import { fetchStylesheet, isAllowedStylesheetUrl } from './stylesheet-fetch';

describe('isAllowedStylesheetUrl', () => {
  it('blocks local and private hosts', () => {
    for (const u of [
      'http://127.0.0.1/a.css',
      'http://10.0.0.1/a.css',
      'http://172.20.1.1/a.css',
      'http://192.168.1.2/a.css',
      'http://169.254.0.1/a.css',
      'http://0.0.0.0/a.css',
      'http://[::1]/a.css',
      'http://[fd00::1]/a.css',
      'http://[fe80::1]/a.css',
      'http://[::ffff:127.0.0.1]/a.css',
      'http://localhost/a.css',
      'http://foo.localhost/a.css',
      'file:///etc/passwd',
      'javascript:alert(1)',
      'nope',
    ])
      expect(isAllowedStylesheetUrl(u), u).toBe(false);
  });
  it('allows public hosts', () => {
    expect(isAllowedStylesheetUrl('https://cdn.example.com/a.css')).toBe(true);
    expect(isAllowedStylesheetUrl('http://172.32.0.1/a.css')).toBe(true);
    expect(isAllowedStylesheetUrl('http://[2001:db8::1]/a.css')).toBe(true);
  });
});

const redirect = (to: string) => new Response(null, { status: 302, headers: { location: to } });

describe('fetchStylesheet', () => {
  it('fetches without credentials and manual redirects', async () => {
    const f = vi.fn(async () => new Response('a{}'));
    expect(await fetchStylesheet('https://x.com/a.css', f as never)).toEqual({
      ok: true,
      text: 'a{}',
      finalUrl: 'https://x.com/a.css',
    });
    expect(f).toHaveBeenCalledWith(
      'https://x.com/a.css',
      expect.objectContaining({ credentials: 'omit', redirect: 'manual' }),
    );
  });
  it('follows up to 5 redirects', async () => {
    let n = 0;
    const f = vi.fn(async () => (n++ < 5 ? redirect(`/r${n}.css`) : new Response('ok')));
    expect(await fetchStylesheet('https://x.com/a.css', f as never)).toEqual({
      ok: true,
      text: 'ok',
      finalUrl: 'https://x.com/r5.css',
    });
  });
  it('stops at the 6th redirect', async () => {
    const f = vi.fn(async () => redirect('/again.css'));
    expect((await fetchStylesheet('https://x.com/a.css', f as never)).ok).toBe(false);
    expect(f).toHaveBeenCalledTimes(6);
  });
  it('refuses a redirect to a private host', async () => {
    const f = vi.fn(async () => redirect('http://127.0.0.1/x.css'));
    expect((await fetchStylesheet('https://x.com/a.css', f as never)).ok).toBe(false);
    expect(f).toHaveBeenCalledTimes(1);
  });
  it('refuses a blocked start url without fetching', async () => {
    const f = vi.fn();
    expect((await fetchStylesheet('http://10.0.0.1/a.css', f as never)).ok).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });
});
