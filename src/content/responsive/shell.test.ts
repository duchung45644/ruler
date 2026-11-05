import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { browser } from '#imports';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { sendToBackground, sendToSidePanel } from '../../lib/messaging';
import type { Envelope } from '../../lib/responsive/channel';
import { locateElement } from '../../lib/responsive/element-locator';
import { defaultViewports } from '../../lib/responsive/viewports';
import { frameName } from '../../lib/responsive/frame-name';
import { routeKey } from '../core/keys';
import { layer, mountLayer } from '../core/overlay';
import { dockGroups, items, registerItem } from '../core/registry.svelte';
import { state } from '../core/state.svelte';
import { editor, ruleTracker } from '../edit/mode.svelte';
import { HANDOFF_FLAG } from '../edit/persist';
import { initResponsive } from '.';
import {
  enterResponsive,
  exitResponsive,
  frameSelectionRect,
  hasFrameSelection,
  onFramesUnblocked,
  setZoom,
  shell,
  teardownShell,
} from './shell.svelte';

vi.mock('../../lib/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/messaging')>()),
  sendToBackground: vi.fn(async () => undefined),
  sendToSidePanel: vi.fn(async () => undefined),
}));
vi.mock('../edit/mode.svelte', async (orig) => ({
  ...(await orig<typeof import('../edit/mode.svelte')>()),
  editor: vi.fn(() => null),
}));
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;

const happy = (
  window as unknown as {
    happyDOM: { setURL(u: string): void };
  }
).happyDOM;

const flush = () => new Promise((r) => setTimeout(r, 0));
const own = (recordId: string, selector: string) => ({
  own: true as const,
  recordId,
  wrappers: [],
  scopePath: [],
  scopeAddress: null,
  selector,
  declsText: 'color: red;',
});

let shadow: ShadowRoot;
let detach: () => void;
/** What the fake first frame answers. */
let frameReply: { edits: unknown; url: string };
const fakeWin = {
  postMessage: vi.fn((m: Envelope) => {
    if (typeof m.id !== 'number') return;
    const data =
      m.type === 'collect_rule_edits'
        ? [frameReply.edits]
        : m.type === 'get_current_url'
          ? [frameReply.url]
          : [undefined];
    const reply = {
      __bd: browser.runtime.id,
      dir: 'ruler-iframe',
      type: m.type,
      data,
      id: m.id,
      reply: true,
    };
    queueMicrotask(() =>
      window.dispatchEvent(
        new MessageEvent('message', {
          data: reply,
          source: fakeWin as unknown as Window,
          origin: location.origin,
        }),
      ),
    );
  }),
};

beforeEach(async () => {
  await fakeBrowser.storage.local.clear();
  happy.setURL('https://site.test/page');
  vi.mocked(sendToBackground).mockClear();
  // happy-dom never loads iframes and logs that it did not
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(editor).mockReturnValue(null);
  fakeWin.postMessage.mockClear();
  vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockReturnValue(
    fakeWin as unknown as Window,
  );
  shadow = document.body.appendChild(document.createElement('div')).attachShadow({ mode: 'open' });
  detach = mountLayer(shadow);
  state.active = true;
  frameReply = { edits: [], url: 'https://site.test/page' };
  registerItem({
    id: 'breakpoints',
    label: 'dock.breakpoints',
    key: 'b',
    group: 'inspectTools',
    run() {},
  } as never);
  initResponsive();
});
afterEach(() => {
  teardownShell();
  detach();
  state.active = false;
  ruleTracker().revertAll();
  vi.restoreAllMocks();
  document.body.replaceChildren();
  try {
    sessionStorage.clear();
  } catch {
    /* empty */
  }
});

const frames = () => [...shadow.querySelectorAll('iframe')];
/** What the parent reads from the frames' document: null = cross-origin / blocked. */
const readable = (href: string | null) =>
  vi
    .spyOn(HTMLIFrameElement.prototype, 'contentDocument', 'get')
    .mockReturnValue(href === null ? null : ({ location: { href } } as unknown as Document));

it('dock item sits right after breakpoints with key V', () => {
  const group = dockGroups().find((g) => g.some((i) => i.id === 'breakpoints'))!;
  const ids = group.map((i) => i.id);
  expect(ids[ids.indexOf('breakpoints') + 1]).toBe('responsive');
  expect(items.find((i) => i.id === 'responsive')?.key).toBe('v');
});

it('V toggles responsive mode', async () => {
  routeKey(new KeyboardEvent('keydown', { key: 'v' }));
  await flush();
  flushSync();
  expect(state.responsiveOn).toBe(true);
  routeKey(new KeyboardEvent('keydown', { key: 'v' }));
  await vi.waitFor(() => expect(state.responsiveOn).toBe(false));
});

it('uncarryable HTML edits ask first; Cancel does not enter', async () => {
  vi.mocked(editor).mockReturnValue({ htmlChanges: () => [{}] } as never);
  const p = enterResponsive();
  await flush();
  flushSync();
  expect(state.dialog).toBe(true);
  shadow.querySelector<HTMLButtonElement>('[role=alertdialog] button')!.click();
  expect(await p).toBe(false);
  expect(state.responsiveOn).toBe(false);
  expect(sendToBackground).not.toHaveBeenCalledWith('enable_frame_header_rule');
});

it('entering enables the header rule and draws one named, sized iframe per viewport', async () => {
  const video = document.body.appendChild(document.createElement('video'));
  Object.defineProperty(video, 'paused', { value: false, configurable: true });
  const pause = vi.spyOn(video, 'pause').mockImplementation(() => {});
  expect(await enterResponsive()).toBe(true);
  flushSync();
  expect(sendToBackground).toHaveBeenCalledWith('enable_frame_header_rule');
  const vps = defaultViewports();
  expect(frames()).toHaveLength(vps.length);
  frames().forEach((f, i) => {
    expect(f.name).toBe(frameName(browser.runtime.id, vps[i]!.id));
    expect(f.style.width).toBe(`${vps[i]!.width}px`);
    expect(f.style.height).toBe(`${vps[i]!.height}px`);
    expect(f.getAttribute('src')).toBe('https://site.test/page');
  });
  expect(document.documentElement.style.overflow).toBe('hidden');
  expect(layer.style.display).toBe('none');
  expect(pause).toHaveBeenCalled();
  frames()[0]!.dispatchEvent(new Event('load'));
  expect(sendToBackground).toHaveBeenCalledWith('inject_responsive_frames');
});

it('a frame asking for state gets the page CSS edits', async () => {
  ruleTracker().applySerialized([own('r1', '.carry')]);
  await enterResponsive();
  flushSync();
  window.dispatchEvent(
    new MessageEvent('message', {
      data: {
        __bd: browser.runtime.id,
        dir: 'ruler-iframe',
        type: 'ready_for_state_sync',
        data: [],
      },
      source: fakeWin as unknown as Window,
      origin: location.origin,
    }),
  );
  await vi.waitFor(() =>
    expect(fakeWin.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ready_ack',
        data: [
          expect.objectContaining({
            ruleEdits: [expect.objectContaining({ selector: '.carry' })],
          }),
        ],
      }),
      location.origin,
    ),
  );
});

it('enter / exit tell the side panel (6.51) and drop the page selection', async () => {
  state.selected = document.body.appendChild(document.createElement('p'));
  await enterResponsive();
  expect(state.selected).toBeNull();
  expect(sendToSidePanel).toHaveBeenCalledWith('responsive_state', { on: true });
  teardownShell();
  expect(sendToSidePanel).toHaveBeenCalledWith('responsive_state', { on: false });
});

it('a selection in frame A makes the shell clear it in frame B (8.19)', async () => {
  const wins = new Map<HTMLIFrameElement, { postMessage: ReturnType<typeof vi.fn> }>();
  vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockImplementation(function (
    this: HTMLIFrameElement,
  ) {
    if (!wins.has(this)) wins.set(this, { postMessage: vi.fn() });
    return wins.get(this) as unknown as Window;
  });
  await enterResponsive();
  flushSync();
  const [a, b] = frames();
  const winA = a!.contentWindow!;
  const winB = b!.contentWindow as unknown as { postMessage: ReturnType<typeof vi.fn> };
  const types = (w: { postMessage: ReturnType<typeof vi.fn> }) =>
    w.postMessage.mock.calls.map((c) => (c[0] as Envelope).type);
  window.dispatchEvent(
    new MessageEvent('message', {
      data: {
        __bd: browser.runtime.id,
        dir: 'ruler-iframe',
        type: 'selection_changed',
        data: [{ selected: true }],
      },
      source: winA,
      origin: location.origin,
    }),
  );
  await vi.waitFor(() => expect(types(winB)).toContain('clear_selection'));
  expect(types(winA as never)).not.toContain('clear_selection');
});

it('element capture asks the selected frame for element_rect and maps it to the parent (Q6)', async () => {
  const wins = new Map<HTMLIFrameElement, { postMessage: ReturnType<typeof vi.fn> }>();
  vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockImplementation(function (
    this: HTMLIFrameElement,
  ) {
    if (!wins.has(this)) {
      const w: { postMessage: ReturnType<typeof vi.fn> } = {
        postMessage: vi.fn((m: Envelope) => {
          if (m.type !== 'element_rect' || m.id === undefined) return;
          queueMicrotask(() =>
            window.dispatchEvent(
              new MessageEvent('message', {
                data: {
                  __bd: browser.runtime.id,
                  dir: 'ruler-iframe',
                  type: m.type,
                  data: [{ left: 10, top: 20, right: 110, bottom: 70 }],
                  id: m.id,
                  reply: true,
                },
                source: w as unknown as Window,
                origin: location.origin,
              }),
            ),
          );
        }),
      };
      wins.set(this, w);
    }
    return wins.get(this) as unknown as Window;
  });
  await enterResponsive();
  setZoom(0.5);
  flushSync();
  const [a, b] = frames();
  b!.getBoundingClientRect = () => new DOMRect(300, 100, 400, 400);
  expect(hasFrameSelection()).toBe(false);
  window.dispatchEvent(
    new MessageEvent('message', {
      data: {
        __bd: browser.runtime.id,
        dir: 'ruler-iframe',
        type: 'selection_changed',
        data: [{ selected: true }],
      },
      source: b!.contentWindow,
      origin: location.origin,
    }),
  );
  await vi.waitFor(() => expect(hasFrameSelection()).toBe(true));
  expect(await frameSelectionRect()).toEqual({ left: 305, top: 110, right: 355, bottom: 135 });
  const asked = (f: HTMLIFrameElement) =>
    wins.get(f)!.postMessage.mock.calls.some((c) => (c[0] as Envelope).type === 'element_rect');
  expect(asked(b!)).toBe(true);
  expect(asked(a!)).toBe(false);
});

it('exit with the same URL applies the frame edits to the page without navigating', async () => {
  const assign = vi.fn();
  vi.spyOn(window, 'location', 'get').mockReturnValue({
    ...location,
    href: 'https://site.test/page',
    origin: location.origin,
    assign,
  } as never);
  await enterResponsive();
  flushSync();
  frameReply = { edits: [own('r9', '.from-frame')], url: 'https://site.test/page' };
  await exitResponsive();
  expect(state.responsiveOn).toBe(false);
  expect(frames()).toHaveLength(0);
  expect(assign).not.toHaveBeenCalled();
  expect(ruleTracker().serialize()).toEqual([expect.objectContaining({ selector: '.from-frame' })]);
  expect(sendToBackground).toHaveBeenCalledWith('disable_frame_header_rule');
  expect(sendToBackground).not.toHaveBeenCalledWith('exit_responsive_mode', expect.anything());
  expect(document.documentElement.style.overflow).toBe('');
});

it('inline edits from a frame reach late frames in ready_ack and the page on exit', async () => {
  vi.spyOn(window, 'location', 'get').mockReturnValue({
    ...location,
    href: 'https://site.test/page',
    origin: location.origin,
    assign: vi.fn(),
  } as never);
  await enterResponsive();
  flushSync();
  const p = document.body.appendChild(document.createElement('p'));
  const locator = locateElement(p)!;
  const fromFrame = (type: string, data: unknown[]) =>
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { __bd: browser.runtime.id, dir: 'ruler-iframe', type, data },
        source: fakeWin as unknown as Window,
        origin: location.origin,
      }),
    );
  fromFrame('inline_style_changed', [{ locator, declsText: 'color: blue;' }]);
  fromFrame('ready_for_state_sync', []);
  await vi.waitFor(() =>
    expect(fakeWin.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ready_ack',
        data: [expect.objectContaining({ inlineStyles: [{ locator, declsText: 'color: blue;' }] })],
      }),
      location.origin,
    ),
  );
  await exitResponsive();
  expect(state.responsiveOn).toBe(false);
  expect(p.getAttribute('style')).toBe('color: blue;');
});

it('exit with another URL hands the edits to the background and navigates', async () => {
  const assign = vi.fn();
  vi.spyOn(window, 'location', 'get').mockReturnValue({
    ...location,
    href: 'https://site.test/page',
    origin: location.origin,
    assign,
  } as never);
  await enterResponsive();
  flushSync();
  frameReply = { edits: [own('r9', '.x')], url: 'https://site.test/other' };
  await exitResponsive();
  expect(sendToBackground).toHaveBeenCalledWith('exit_responsive_mode', {
    ruleEdits: [expect.objectContaining({ selector: '.x' })],
    url: 'https://site.test/other',
  });
  expect(assign).toHaveBeenCalledWith('https://site.test/other');
  expect(sessionStorage.getItem(HANDOFF_FLAG)).toBe('1');
});

const fromFrameWin = (type: string, data: unknown[] = []) =>
  window.dispatchEvent(
    new MessageEvent('message', {
      data: { __bd: browser.runtime.id, dir: 'ruler-iframe', type, data },
      source: fakeWin as unknown as Window,
      origin: location.origin,
    }),
  );

it('exit falls back to the newest synced edits when the first frame does not answer', async () => {
  await enterResponsive();
  flushSync();
  fromFrameWin('ready_for_state_sync');
  fromFrameWin('rule_edits_changed', [[own('r5', '.synced')]]);
  await flush();
  frameReply = { edits: undefined, url: 'https://site.test/page' };
  await exitResponsive();
  expect(ruleTracker().serialize()).toEqual([expect.objectContaining({ selector: '.synced' })]);
});

it('HTML edits in a frame ask before exit; Cancel stays responsive', async () => {
  await enterResponsive();
  flushSync();
  fromFrameWin('frame_edit_state', [
    { canUndo: true, canRedo: false, editCount: 1, hasClipboard: false, htmlEdits: 1 },
  ]);
  await flush();
  const p = exitResponsive();
  await flush();
  flushSync();
  expect(state.dialog).toBe(true);
  shadow.querySelector<HTMLButtonElement>('[role=alertdialog] button')!.click();
  await p;
  expect(state.responsiveOn).toBe(true);
});

describe('frame header', () => {
  const header = (i: number) => shadow.querySelectorAll<HTMLElement>('[data-frame-header]')[i]!;
  const action = (i: number, a: string) =>
    header(i).querySelector<HTMLButtonElement>(`[data-action="${a}"]`)!;
  const iframeOf = (id: number) =>
    shadow.querySelector<HTMLIFrameElement>(`[data-frame="${id}"] iframe`)!;
  const fromFrame = (type: string, data: unknown[] = []) =>
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { __bd: browser.runtime.id, dir: 'ruler-iframe', type, data },
        source: fakeWin as unknown as Window,
        origin: location.origin,
      }),
    );

  it('shows Name (W×H), sandbox, and disables move at the ends', async () => {
    await enterResponsive();
    flushSync();
    expect(header(0).querySelector('[data-frame-label]')!.textContent).toBe('Phone (390×844)');
    expect(iframeOf(1).getAttribute('sandbox')).toBe(
      'allow-same-origin allow-scripts allow-forms allow-popups allow-modals',
    );
    expect(action(0, 'move-left').disabled).toBe(true);
    expect(action(0, 'move-right').disabled).toBe(false);
    expect(action(2, 'move-right').disabled).toBe(true);
  });

  it('rotate swaps the iframe size; move reorders by CSS order without moving nodes', async () => {
    await enterResponsive();
    flushSync();
    action(0, 'rotate').click();
    flushSync();
    expect(iframeOf(1).style.width).toBe('844px');
    expect(iframeOf(1).style.height).toBe('390px');
    expect(shell.frames[0]!.vp).toMatchObject({ id: 1, width: 844, height: 390 });
    const node = iframeOf(1);
    action(0, 'move-right').click();
    flushSync();
    expect(shell.frames.map((f) => f.vp.id)).toEqual([2, 1, 3]);
    expect(iframeOf(1)).toBe(node);
    expect(shadow.querySelector<HTMLElement>('[data-frame="1"]')!.style.order).toBe('1');
  });

  it('scheme cycles system → light → dark and sets color-scheme on the iframe', async () => {
    await enterResponsive();
    flushSync();
    expect(iframeOf(1).style.colorScheme).toBe('');
    action(0, 'scheme').click();
    flushSync();
    expect(shell.frames[0]!.vp.scheme).toBe('light');
    expect(iframeOf(1).style.colorScheme).toBe('light');
    expect(action(0, 'scheme').dataset.scheme).toBe('light');
    action(0, 'scheme').click();
    flushSync();
    expect(iframeOf(1).style.colorScheme).toBe('dark');
  });

  it('remove asks first; Cancel keeps the frame, confirm removes it', async () => {
    await enterResponsive();
    flushSync();
    action(1, 'remove').click();
    await flush();
    flushSync();
    const dlg = () => shadow.querySelector<HTMLElement>('[role=alertdialog]')!;
    expect(dlg().textContent).toContain('responsive_bodyRemoveViewport');
    dlg().querySelector('button')!.click(); // Cancel
    await flush();
    flushSync();
    expect(shell.frames).toHaveLength(3);
    action(1, 'remove').click();
    await flush();
    flushSync();
    [...dlg().querySelectorAll('button')].at(-1)!.click();
    await vi.waitFor(() => expect(shell.frames.map((f) => f.vp.id)).toEqual([1, 3]));
  });

  it('breakpoint-frames mode hides remove', async () => {
    await enterResponsive();
    shell.breakpointMode = true;
    flushSync();
    expect(header(0).querySelector('[data-action="remove"]')).toBeNull();
  });

  it('a handle drag resizes (deltas / zoom), clamps, clears device, blocks iframe pointer events', async () => {
    await enterResponsive();
    setZoom(0.5);
    flushSync();
    const handle = shadow.querySelector<HTMLElement>('[data-frame="1"] [data-handle="corner"]')!;
    handle.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 0, clientY: 0, button: 0, bubbles: true }),
    );
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: -1000, clientY: 10 }));
    flushSync();
    expect(iframeOf(1).style.pointerEvents).toBe('none');
    expect(shell.frames[0]!.vp).toMatchObject({ width: 200, height: 864 });
    expect(shell.frames[0]!.vp.device).toBeUndefined();
    window.dispatchEvent(new PointerEvent('pointerup'));
    flushSync();
    expect(iframeOf(1).style.pointerEvents).toBe('');
  });

  it('shows the timeout message after 15s without ready', async () => {
    readable('https://site.test/page');
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      await enterResponsive();
      flushSync();
      expect(shadow.querySelectorAll('[data-frame-loading]')).toHaveLength(3);
      vi.advanceTimersByTime(15_000);
      flushSync();
      expect(shadow.querySelectorAll('[data-frame-timeout]')).toHaveLength(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('load with no ready in 1.5s and an unreadable document shows the grant overlay', async () => {
    readable(null);
    vi.spyOn(fakeBrowser.i18n, 'getMessage').mockImplementation(((key: string) =>
      key.endsWith('frameBlockedBody') ? 'Blocked.{br}{grant} to show it.' : key) as never);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      await enterResponsive();
      flushSync();
      for (const f of frames()) f.dispatchEvent(new Event('load'));
      vi.advanceTimersByTime(1_499);
      flushSync();
      expect(shadow.querySelectorAll('[data-frame-blocked]')).toHaveLength(0);
      vi.advanceTimersByTime(1);
      flushSync();
      expect(shadow.querySelectorAll('[data-frame-blocked="grant"]')).toHaveLength(3);
      expect(shadow.querySelectorAll('[data-action="grant-host"]')).toHaveLength(3);
      const p = shadow.querySelector('[data-frame-blocked]')!;
      expect(p.querySelector('br')).toBeTruthy();
      expect(p.textContent).toContain('responsive_frameBlockedGrant to show it.');
    } finally {
      vi.useRealTimers();
    }
  });

  it('header rule already active: blocked frames say it cannot be stripped', async () => {
    readable(null);
    vi.mocked(sendToBackground).mockImplementation((async (t: string) =>
      t === 'enable_frame_header_rule' ? true : undefined) as never);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      await enterResponsive();
      await Promise.resolve();
      flushSync();
      vi.advanceTimersByTime(15_000);
      flushSync();
      expect(shadow.querySelectorAll('[data-frame-blocked="still"]')).toHaveLength(3);
      expect(shadow.querySelectorAll('[data-action="grant-host"]')).toHaveLength(0);
    } finally {
      vi.useRealTimers();
      vi.mocked(sendToBackground).mockImplementation(async () => undefined);
    }
  });

  it('reload_frames (access granted) reloads every frame and clears the overlays', async () => {
    readable(null);
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      await enterResponsive();
      flushSync();
      vi.advanceTimersByTime(15_000);
      flushSync();
      expect(shadow.querySelectorAll('[data-frame-blocked]')).toHaveLength(3);
      onFramesUnblocked();
      flushSync();
      expect(shell.headerRule).toBe(true);
      expect(shadow.querySelectorAll('[data-frame-blocked]')).toHaveLength(0);
      expect(shadow.querySelectorAll('[data-frame-loading]')).toHaveLength(3);
    } finally {
      vi.useRealTimers();
    }
  });

  it('ready before 15s clears loading and no timeout follows', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      await enterResponsive();
      flushSync();
      // every iframe shares fakeWin, so the message lands on all three frames
      fromFrame('ready_for_state_sync');
      await Promise.resolve();
      await Promise.resolve();
      vi.advanceTimersByTime(15_000);
      flushSync();
      expect(shadow.querySelectorAll('[data-frame-loading]')).toHaveLength(0);
      expect(shadow.querySelectorAll('[data-frame-timeout]')).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('overflow_status(true) shows the warning on the header', async () => {
    await enterResponsive();
    flushSync();
    expect(shadow.querySelector('[data-overflow-warning]')).toBeNull();
    fromFrame('overflow_status', [{ overflowing: true, width: 900 }]);
    await flush();
    flushSync();
    expect(header(0).querySelector('[data-overflow-warning]')).not.toBeNull();
    fromFrame('overflow_status', [{ overflowing: false, width: 390 }]);
    await flush();
    flushSync();
    expect(shadow.querySelector('[data-overflow-warning]')).toBeNull();
  });
});
