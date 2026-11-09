import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { browser } from '#imports';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { sendToBackground } from '../../lib/ext/messaging';
import type { Envelope, ShellApi } from '../../lib/responsive/channel';
import { layer, mountLayer } from '../core/overlay';
import { items } from '../core/registry.svelte';
import { runShortcut } from '../core/keys';
import { state } from '../core/state.svelte';
import { initBreakpoints } from '../tools/breakpoints';
import type { Channel } from './bridge';
import {
  enterResponsive,
  SYNC_TOAST_MS,
  shell,
  teardownShell,
  toggleSyncScroll,
} from './shell.svelte';
import { createFrameSync, createShellSync, type ShellSyncDeps } from './sync';

vi.mock('../../lib/ext/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/ext/messaging')>()),
  sendToBackground: vi.fn(async () => undefined),
  sendToSidePanel: vi.fn(async () => undefined),
}));

const happy = (window as unknown as { happyDOM: { setURL(u: string): void } }).happyDOM;
const flush = () => new Promise((r) => setTimeout(r, 0));

function deps(enabled = true) {
  const d = {
    ids: () => [1, 2, 3],
    enabled: vi.fn(() => enabled),
    applyScroll: vi.fn(),
    resetConflict: vi.fn(),
    applySpa: vi.fn(),
    turnedOff: vi.fn(),
    urlChanged: vi.fn(),
  } satisfies ShellSyncDeps;
  return d;
}

describe('shell routing', () => {
  it('a ratio from frame 1 reaches the others, not frame 1', () => {
    const d = deps();
    createShellSync(d).scroll(1, { x: 0, y: 0.5 });
    expect(d.applyScroll.mock.calls).toEqual([
      [2, { x: 0, y: 0.5 }],
      [3, { x: 0, y: 0.5 }],
    ]);
  });

  it('sync off forwards nothing; junk ratios are dropped', () => {
    const d = deps(false);
    createShellSync(d).scroll(1, { x: 0, y: 0.5 });
    const on = deps();
    createShellSync(on).scroll(1, { x: 'a', y: 1 });
    expect(d.applyScroll).not.toHaveBeenCalled();
    expect(on.applyScroll).not.toHaveBeenCalled();
  });

  it('an off-screen frame gets the last ratio when it is visible again', () => {
    const d = deps();
    const s = createShellSync(d);
    s.visible(3, false);
    s.scroll(1, { x: 0, y: 0.2 });
    s.scroll(1, { x: 0, y: 0.7 });
    expect(d.applyScroll.mock.calls.map((c) => c[0])).toEqual([2, 2]);
    s.visible(3, true);
    expect(d.applyScroll).toHaveBeenLastCalledWith(3, { x: 0, y: 0.7 });
  });

  it('spa_navigation from 1 goes to the others and updates the URL label', () => {
    const d = deps();
    createShellSync(d).spa(1, 'https://site.test/b');
    expect(d.applySpa.mock.calls).toEqual([
      [2, 'https://site.test/b'],
      [3, 'https://site.test/b'],
    ]);
    expect(d.urlChanged).toHaveBeenCalledWith('https://site.test/b');
  });
});

describe('frame side', () => {
  let ac: AbortController;
  let ch: { send: ReturnType<typeof vi.fn>; call: ReturnType<typeof vi.fn> };
  let navigate: ReturnType<typeof vi.fn<(url: string) => void>>;
  beforeEach(() => {
    happy.setURL('https://www.site.test/page');
    ac = new AbortController();
    ch = { send: vi.fn(), call: vi.fn() };
    navigate = vi.fn<(url: string) => void>();
    createFrameSync({ navigate }).start(ch as unknown as Channel<ShellApi>, ac.signal);
  });
  afterEach(() => {
    ac.abort();
    document.body.replaceChildren();
  });
  const click = (href: string, target?: string, init: MouseEventInit = {}) => {
    const a = document.body.appendChild(document.createElement('a'));
    a.href = href;
    if (target) a.target = target;
    const e = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init });
    a.dispatchEvent(e);
    return e;
  };

  it('cross-site link → open_external, not followed', () => {
    const e = click('https://other.example/x');
    expect(ch.send).toHaveBeenCalledWith('open_external', 'https://other.example/x');
    expect(e.defaultPrevented).toBe(true);
  });

  it('same-site link aimed at _top navigates inside the frame', () => {
    const e = click('https://shop.site.test/y', '_top');
    expect(navigate).toHaveBeenCalledWith('https://shop.site.test/y');
    expect(ch.send).not.toHaveBeenCalled();
    expect(e.defaultPrevented).toBe(true);
  });

  it('plain same-site links and modified clicks are left alone', () => {
    expect(click('https://www.site.test/z').defaultPrevented).toBe(false);
    expect(click('https://other.example/x', undefined, { ctrlKey: true }).defaultPrevented).toBe(
      false,
    );
    expect(ch.send).not.toHaveBeenCalled();
  });
});

describe('shell integration', () => {
  const wins = new Map<HTMLIFrameElement, { postMessage: ReturnType<typeof vi.fn> }>();
  let detach: () => void;
  let shadow: ShadowRoot;

  beforeEach(async () => {
    await fakeBrowser.storage.local.clear();
    happy.setURL('https://site.test/page');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(sendToBackground).mockClear();
    vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockImplementation(function (
      this: HTMLIFrameElement,
    ) {
      let w = wins.get(this);
      if (!w) wins.set(this, (w = { postMessage: vi.fn() }));
      return w as unknown as Window;
    });
    shadow = document.body
      .appendChild(document.createElement('pixellens-ui'))
      .attachShadow({ mode: 'open' });
    detach = mountLayer(shadow);
    state.active = true;
  });
  afterEach(() => {
    teardownShell();
    detach();
    state.active = false;
    state.breakpointsOn = false;
    wins.clear();
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.head.replaceChildren();
    document.body.replaceChildren();
  });

  const iframes = () => [...shadow.querySelectorAll('iframe')];
  const win = (i: number) =>
    iframes()[i]!.contentWindow as unknown as { postMessage: ReturnType<typeof vi.fn> };
  const from = (i: number, type: keyof ShellApi, ...data: unknown[]) =>
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { __bd: browser.runtime.id, dir: 'ruler-iframe', type, data },
        source: win(i) as unknown as Window,
        origin: location.origin,
      }),
    );
  const sent = (i: number, type: string) =>
    win(i)
      .postMessage.mock.calls.map((c) => c[0] as Envelope)
      .filter((m) => m.type === type);

  async function enter() {
    expect(await enterResponsive()).toBe(true);
    flushSync();
    expect(iframes().length).toBeGreaterThan(1);
  }

  it('scroll_sync from frame A reaches B, not A; nothing when sync is off', async () => {
    await enter();
    from(0, 'scroll_sync', { x: 0, y: 0.4 });
    await flush();
    expect(sent(1, 'apply_scroll_sync').map((m) => m.data)).toEqual([[{ x: 0, y: 0.4 }]]);
    expect(sent(0, 'apply_scroll_sync')).toEqual([]);
    toggleSyncScroll();
    from(0, 'scroll_sync', { x: 0, y: 0.9 });
    await flush();
    expect(sent(1, 'apply_scroll_sync')).toHaveLength(1);
  });

  it('conflict turns sync off and shows the toast for 8s; turning on resets the frames', async () => {
    await enter();
    vi.useFakeTimers();
    from(0, 'scroll_sync_conflict');
    await vi.advanceTimersByTimeAsync(0);
    flushSync();
    expect(shell.syncScrollEnabled).toBe(false);
    const toast = shadow.querySelector('[data-sync-off-toast]');
    expect(toast?.textContent).toContain('responsive_toastScrollSyncOff');
    expect(toast?.textContent).toContain('responsive_dismiss');
    await vi.advanceTimersByTimeAsync(SYNC_TOAST_MS);
    flushSync();
    expect(shadow.querySelector('[data-sync-off-toast]')).toBeNull();
    // saved
    const saved = (await browser.storage.local.get(null)) as Record<string, unknown>;
    expect(JSON.stringify(saved)).toContain('"syncScrollEnabled":false');
    toggleSyncScroll();
    await vi.advanceTimersByTimeAsync(0);
    expect(sent(0, 'reset_scroll_conflict')).toHaveLength(1);
    expect(sent(1, 'reset_scroll_conflict')).toHaveLength(1);
  });

  it('spa_navigation from A → apply_spa_navigation to B and the URL label', async () => {
    await enter();
    from(0, 'spa_navigation', 'https://site.test/next');
    await flush();
    flushSync();
    expect(sent(1, 'apply_spa_navigation').map((m) => m.data)).toEqual([
      ['https://site.test/next'],
    ]);
    expect(sent(0, 'apply_spa_navigation')).toEqual([]);
    expect(shell.url).toBe('https://site.test/next');
    expect(shadow.querySelector('[data-url]')?.textContent).toBe('https://site.test/next');
  });

  it('open_external from a frame opens a tab via the background', async () => {
    await enter();
    from(0, 'open_external', 'https://other.example/');
    await flush();
    expect(sendToBackground).toHaveBeenCalledWith('open_external_tab', 'https://other.example/');
  });

  describe('breakpoints item (Q5)', () => {
    const bp = () => items.find((i) => i.id === 'breakpoints')!;
    beforeEach(async () => {
      await initBreakpoints();
    });

    it('B in responsive toggles breakpoint-frames mode and draws no lines', async () => {
      const style = document.head.appendChild(document.createElement('style'));
      style.textContent =
        '@media (min-width: 640px){.a{color:red}} @media (max-width: 1023px){.b{color:red}}';
      await enter();
      expect(bp().isDisabled?.()).toBe(false);
      const before = iframes().length;
      expect(runShortcut('b')).toBe(true);
      flushSync();
      expect(shell.breakpointMode).toBe(true);
      expect(shell.frames.map((f) => f.vp.width)).toEqual([640, 1023]);
      expect(shadow.querySelector('[data-frame-breakpoint="min"]')).not.toBeNull();
      // the parent overlay draws no breakpoint lines while responsive
      await new Promise((r) => requestAnimationFrame(r));
      await flush();
      expect(state.breakpointsOn).toBe(true);
      expect(layer.textContent).not.toContain('640px');
      expect(runShortcut('b')).toBe(true);
      flushSync();
      expect(shell.breakpointMode).toBe(false);
      expect(iframes().length).toBe(before);
    });

    it('no breakpoints on the page → the item is disabled', async () => {
      await enter();
      expect(bp().isDisabled?.()).toBe(true);
      expect(runShortcut('b')).toBe(false);
      expect(shell.breakpointMode).toBe(false);
    });
  });
});
