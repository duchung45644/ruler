import { afterEach, expect, it, vi } from 'vitest';

const sendToBackground = vi.fn();
vi.mock('../../lib/messaging', () => ({
  sendToBackground: (...a: unknown[]) => sendToBackground(...a),
}));

const { enableCrossOriginStyles, getMatchedRules, skippedCrossOriginCount } =
  await import('./rules');

afterEach(() => {
  document.head.replaceChildren();
  document.body.replaceChildren();
});

it('counts unreadable sheets, then reads a fetched copy without touching the page', async () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.test/site.css';
  const blocked = new CSSStyleSheet();
  Object.defineProperty(blocked, 'cssRules', {
    get: () => {
      throw new DOMException('cross-origin', 'SecurityError');
    },
  });
  Object.defineProperty(link, 'sheet', { get: () => blocked });
  document.head.append(link);
  document.body.innerHTML = '<p class="a">x</p>';
  const p = document.querySelector('p')!;

  expect(skippedCrossOriginCount(p)).toBe(1);
  expect(getMatchedRules(p)).toEqual({
    success: true,
    matchedRules: [],
    skippedCrossOriginCount: 1,
  });

  sendToBackground.mockResolvedValue({ ok: true, text: '.a{color:red}', finalUrl: link.href });
  expect(await enableCrossOriginStyles(p)).toEqual({ success: true });
  expect(sendToBackground).toHaveBeenCalledWith('fetch_stylesheet', 'https://cdn.test/site.css');
  const r = getMatchedRules(p);
  expect(r.skippedCrossOriginCount).toBe(0);
  expect(r.matchedRules.map((m) => [m.selector, m.source])).toEqual([['.a', link.href]]);
  expect(skippedCrossOriginCount(p)).toBe(0);
  expect(document.adoptedStyleSheets ?? []).toHaveLength(0);
});
