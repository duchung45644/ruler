import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { browser } from '#imports';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { sendToBackground } from '../../lib/messaging';
import type { Envelope } from '../../lib/responsive/channel';
import { defaultViewports } from '../../lib/responsive/viewports';
import { frameName } from '../../lib/responsive/frame-name';
import { routeKey } from '../core/keys';
import { layer, mountLayer } from '../core/overlay';
import { dockGroups, items, registerItem } from '../core/registry.svelte';
import { state } from '../core/state.svelte';
import { editor, ruleTracker } from '../edit/mode.svelte';
import { HANDOFF_FLAG } from '../edit/persist';
import { initResponsive } from '.';
import { enterResponsive, exitResponsive, teardownShell } from './shell.svelte';

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

beforeEach(() => {
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
        type: 'apply_rule_edits',
        data: [[expect.objectContaining({ selector: '.carry' })]],
      }),
      location.origin,
    ),
  );
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
