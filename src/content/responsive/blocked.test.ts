import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendToBackground, sendToSidePanel } from '../../lib/messaging';
import { blockedState, readDoc, requestHostGrant } from './blocked';

vi.mock('../../lib/messaging', () => ({
  sendToBackground: vi.fn(async () => ({ success: true })),
  sendToSidePanel: vi.fn(async () => undefined),
}));
afterEach(() => vi.restoreAllMocks());

const iframeWith = (get: () => Document | null) => {
  const f = document.createElement('iframe');
  Object.defineProperty(f, 'contentDocument', { get });
  return f;
};

describe('readDoc', () => {
  it('cross-origin access that throws or gives null is unreadable', () => {
    expect(
      readDoc(
        iframeWith(() => {
          throw new DOMException('denied', 'SecurityError');
        }),
      ),
    ).toBe('unreadable');
    expect(readDoc(iframeWith(() => null))).toBe('unreadable');
  });
  it('about:blank is blank, a real URL is a page', () => {
    const doc = (href: string) => ({ location: { href } }) as unknown as Document;
    expect(readDoc(iframeWith(() => doc('about:blank')))).toBe('blank');
    expect(readDoc(iframeWith(() => doc('https://a.test/')))).toBe('page');
  });
});

describe('blockedState (overlay state machine)', () => {
  it('ok: ready, or a readable page', () => {
    expect(blockedState(true, 'unreadable', false)).toBeNull();
    expect(blockedState(false, 'page', false)).toBeNull();
  });
  it('blocked: no ready and unreadable / blank → grant link', () => {
    expect(blockedState(false, 'unreadable', false)).toBe('grant');
    expect(blockedState(false, 'blank', false)).toBe('grant');
  });
  it('blocked-still: header rule already active', () => {
    expect(blockedState(false, 'unreadable', true)).toBe('still');
  });
});

describe('requestHostGrant', () => {
  it('opens the side panel, then asks it to show the grant until it answers', async () => {
    vi.mocked(sendToSidePanel)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(true as never);
    expect(await requestHostGrant(0)).toBe(true);
    expect(sendToBackground).toHaveBeenCalledWith('open_side_panel');
    expect(sendToSidePanel).toHaveBeenCalledTimes(2);
    expect(sendToSidePanel).toHaveBeenCalledWith('show_host_grant');
  });
});
