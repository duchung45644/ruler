import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { browser } from '#imports';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { findTitle } from '../../lib/find';
import type { Envelope } from '../../lib/responsive/channel';
import { routeKey } from '../core/keys';
import { mountLayer } from '../core/overlay';
import { items, registerItem, setPaused } from '../core/registry.svelte';
import { state } from '../core/state.svelte';
import { find, runFind, stepFind } from '../tools/find';
import { enterResponsive, teardownShell } from './shell.svelte';

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

let xrayOn = false;
const sidepanel = vi.fn();
registerItem({
  id: 'xray',
  label: 'dock.xray',
  key: 'x',
  group: 'inspectTools',
  forward: true,
  run: () => void (xrayOn = !xrayOn),
  isActive: () => xrayOn,
} as never);
registerItem({
  id: 'sidepanel',
  label: 'x',
  key: 'p',
  group: 'utilities',
  run: sidepanel,
} as never);

type Fake = { postMessage: ReturnType<typeof vi.fn>; findCount: number };
const fakes = new Map<HTMLIFrameElement, Fake>();
function fakeFor(iframe: HTMLIFrameElement): Fake {
  let f = fakes.get(iframe);
  if (f) return f;
  const fake: Fake = {
    findCount: 0,
    postMessage: vi.fn((m: Envelope) => {
      if (typeof m.id !== 'number') return;
      const data = [m.type === 'find' ? fake.findCount : undefined];
      const reply = { __bd: browser.runtime.id, dir: 'ruler-iframe', type: m.type, data };
      queueMicrotask(() => from(fake, { ...reply, id: m.id, reply: true }));
    }),
  };
  fakes.set(iframe, (f = fake));
  return f;
}
const from = (fake: Fake, data: object) =>
  window.dispatchEvent(
    new MessageEvent('message', {
      data,
      source: fake as unknown as Window,
      origin: location.origin,
    }),
  );
const ready = (fake: Fake) =>
  from(fake, {
    __bd: browser.runtime.id,
    dir: 'ruler-iframe',
    type: 'ready_for_state_sync',
    data: [],
  });

let shadow: ShadowRoot;
let detach: () => void;
let frames: Fake[];
const sent = (f: Fake, type: string) =>
  f.postMessage.mock.calls.map(([m]) => m as Envelope).filter((m) => m.type === type);
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(async () => {
  await fakeBrowser.storage.local.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockImplementation(function (
    this: HTMLIFrameElement,
  ) {
    return fakeFor(this) as unknown as Window;
  });
  shadow = document.body.appendChild(document.createElement('div')).attachShadow({ mode: 'open' });
  detach = mountLayer(shadow);
  state.active = true;
  xrayOn = false;
  sidepanel.mockReset();
  await enterResponsive();
  flushSync();
  frames = [...shadow.querySelectorAll('iframe')].map(fakeFor);
  expect(frames).toHaveLength(3);
});
afterEach(() => {
  setPaused(false);
  state.popover = null;
  teardownShell();
  detach();
  state.active = false;
  fakes.clear();
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

it('X in responsive sends run_item(xray) to every frame; X-Ray stays off here, the button is active', async () => {
  frames.forEach(ready);
  await flush();
  routeKey(new KeyboardEvent('keydown', { key: 'x' }));
  for (const f of frames) expect(sent(f, 'run_item').map((m) => m.data)).toEqual([['xray']]);
  expect(xrayOn).toBe(false);
  expect(items.find((i) => i.id === 'xray')!.isActive!()).toBe(true);
});

it('leaving carries the forwarded state back to the page', async () => {
  frames.forEach(ready);
  await flush();
  routeKey(new KeyboardEvent('keydown', { key: 'x' }));
  teardownShell();
  expect(xrayOn).toBe(true);
});

it('a non-forward item (side panel) runs locally', async () => {
  frames.forEach(ready);
  await flush();
  routeKey(new KeyboardEvent('keydown', { key: 'p' }));
  expect(sidepanel).toHaveBeenCalledOnce();
  for (const f of frames) expect(sent(f, 'run_item')).toEqual([]);
});

it('pause reaches ready frames by set_paused and a late frame by ready_ack', async () => {
  ready(frames[0]!);
  ready(frames[1]!);
  await flush();
  routeKey(new KeyboardEvent('keydown', { key: 'x' }));
  setPaused(true);
  expect(sent(frames[0]!, 'set_paused').map((m) => m.data)).toEqual([[true]]);
  expect(sent(frames[2]!, 'set_paused')).toEqual([]);
  ready(frames[2]!);
  await flush();
  const ack = sent(frames[2]!, 'ready_ack')[0]!.data[0];
  expect(ack).toMatchObject({ paused: true, active: ['xray'] });
});

it('find aggregates 2+0+3 → 1/5; next from item 2 jumps to frame 3', async () => {
  frames.forEach(ready);
  await flush();
  [2, 0, 3].forEach((n, i) => (frames[i]!.findCount = n));
  state.popover = 'find';
  await runFind('.a');
  expect(findTitle(find.index, find.count, find.hidden, (k) => k)).toBe('1/5');
  await stepFind(1); // item 2: frame 1, local 1
  for (const f of frames) f.postMessage.mockClear();
  await stepFind(1);
  expect(findTitle(find.index, find.count, find.hidden, (k) => k)).toBe('3/5');
  expect(sent(frames[2]!, 'find_goto').map((m) => m.data)).toEqual([[0]]);
  expect(sent(frames[0]!, 'find_goto').map((m) => m.data)).toEqual([[-1]]);
  await flush();
});
