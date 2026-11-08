/**
 * Task 15: responsive end-to-end flow, §9 regressions, leaks and channel security.
 * happy-dom cannot run the shell and a frame content script in two real windows, so the shell
 * side talks to fake frame windows that behave like frame-mode (they keep the CSS edits they are
 * sent and answer collect_rule_edits), and the frame side runs frame-mode against a fake parent.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { browser } from '#imports';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { sendToBackground } from '../../lib/ext/messaging';
import type { Envelope } from '../../lib/responsive/channel';
import { frameName } from '../../lib/responsive/frame-name';
import { persistKey } from '../../lib/edit/persist-key';
import { installDragGuard } from '../core/drag';
import { routeKey } from '../core/keys';
import { mountLayer } from '../core/overlay';
import { registerItem, setPaused } from '../core/registry.svelte';
import { state } from '../core/state.svelte';
import { showToast } from '../core/toast';
import { ruleTracker } from '../edit/mode.svelte';
import { HANDOFF_FLAG, restorePersisted } from '../edit/persist';
import { startFrameMode, stopFrameMode } from './frame-mode';
import { enterResponsive, exitResponsive, teardownShell } from './shell.svelte';

vi.mock('../../lib/ext/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/ext/messaging')>()),
  sendToBackground: vi.fn(async () => undefined),
  sendToSidePanel: vi.fn(async () => undefined),
}));
vi.mock('../edit/mode.svelte', async (orig) => ({
  ...(await orig<typeof import('../edit/mode.svelte')>()),
  editor: vi.fn(() => null),
}));
vi.mock('../core/toast', async (orig) => ({
  ...(await orig<typeof import('../core/toast')>()),
  showToast: vi.fn(),
}));
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;

const happy = (window as unknown as { happyDOM: { setURL(u: string): void } }).happyDOM;

let xrayOn = false;
registerItem({
  id: 'xray',
  label: 'dock.xray',
  key: 'x',
  group: 'inspectTools',
  forward: true,
  run: () => void (xrayOn = !xrayOn),
  isActive: () => xrayOn,
} as never);

const own = (recordId: string, selector: string) => ({
  own: true as const,
  recordId,
  wrappers: [],
  scopePath: [],
  scopeAddress: null,
  selector,
  declsText: 'color: red;',
});
const flush = () => new Promise((r) => setTimeout(r, 0));
const BD = () => browser.runtime.id;

// ------------------------------------------------------------------ shell side

/** A fake frame window that keeps the CSS edits the shell sends, like frame-mode does. */
interface Fake {
  postMessage: ReturnType<typeof vi.fn>;
  edits: unknown[];
}
const fakes = new Map<HTMLIFrameElement, Fake>();
function fakeFor(iframe: HTMLIFrameElement): Fake {
  let f = fakes.get(iframe);
  if (f) return f;
  const fake: Fake = {
    edits: [],
    postMessage: vi.fn((m: Envelope) => {
      if (m.type === 'apply_rule_edits') fake.edits = m.data[0] as unknown[];
      if (m.type === 'ready_ack') fake.edits = (m.data[0] as { ruleEdits: unknown[] }).ruleEdits;
      if (typeof m.id !== 'number') return;
      const data =
        m.type === 'collect_rule_edits'
          ? [fake.edits]
          : m.type === 'get_current_url'
            ? [location.href]
            : [undefined];
      queueMicrotask(() =>
        from(fake, { __bd: BD(), dir: 'ruler-iframe', type: m.type, data, id: m.id, reply: true }),
      );
    }),
  };
  fakes.set(iframe, (f = fake));
  return f;
}
const from = (source: unknown, data: object) =>
  window.dispatchEvent(
    new MessageEvent('message', { data, source: source as Window, origin: location.origin }),
  );
const frameSays = (f: Fake, type: string, ...data: unknown[]) =>
  from(f, { __bd: BD(), dir: 'ruler-iframe', type, data });
const sent = (f: Fake, type: string) =>
  f.postMessage.mock.calls.map(([m]) => m as Envelope).filter((m) => m.type === type);

describe('shell', () => {
  let shadow: ShadowRoot;
  let detach: () => void;

  beforeEach(async () => {
    await fakeBrowser.storage.local.clear();
    happy.setURL('https://site.test/page');
    vi.mocked(sendToBackground).mockClear();
    vi.mocked(showToast).mockClear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(HTMLIFrameElement.prototype, 'contentWindow', 'get').mockImplementation(function (
      this: HTMLIFrameElement,
    ) {
      return fakeFor(this) as unknown as Window;
    });
    shadow = document.body
      .appendChild(document.createElement('div'))
      .attachShadow({ mode: 'open' });
    detach = mountLayer(shadow);
    state.active = true;
    xrayOn = false;
  });
  afterEach(() => {
    setPaused(false);
    teardownShell();
    detach();
    state.active = false;
    ruleTracker().revertAll();
    fakes.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.replaceChildren();
    try {
      sessionStorage.clear();
    } catch {
      /* empty */
    }
  });

  const enter = async () => {
    expect(await enterResponsive()).toBe(true);
    flushSync();
    return [...shadow.querySelectorAll('iframe')].map(fakeFor);
  };

  it('flow: enter → X → select in frame 2 → edit there → frame 1 gets it → exit applies and persists', async () => {
    await restorePersisted(ruleTracker());
    const assign = vi.fn();
    const real = location;
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...real,
      href: real.href,
      origin: real.origin,
      protocol: real.protocol,
      pathname: real.pathname,
      assign,
    } as never);
    const frames = await enter();
    expect(frames).toHaveLength(3);
    const [f1, f2, f3] = frames as [Fake, Fake, Fake];
    frames.forEach((f) => frameSays(f, 'ready_for_state_sync'));
    await flush();
    for (const f of frames) expect(sent(f, 'ready_ack')).toHaveLength(1);

    routeKey(new KeyboardEvent('keydown', { key: 'x' }));
    for (const f of frames) expect(sent(f, 'run_item').map((m) => m.data)).toEqual([['xray']]);
    expect(xrayOn).toBe(false);

    frameSays(f2, 'selection_changed', { selected: true });
    await flush();
    expect(sent(f1, 'clear_selection')).toHaveLength(1);
    expect(sent(f3, 'clear_selection')).toHaveLength(1);
    expect(sent(f2, 'clear_selection')).toHaveLength(0);

    // the panel's rule edit lands in frame 2, whose frame-mode reports the full list
    const edit = own('p1', '.from-panel');
    f2.edits = [edit];
    frameSays(f2, 'rule_edits_changed', [edit]);
    await flush();
    expect(sent(f1, 'apply_rule_edits').map((m) => m.data)).toEqual([[[edit]]]);
    expect(sent(f3, 'apply_rule_edits')).toHaveLength(1);
    expect(sent(f2, 'apply_rule_edits')).toHaveLength(0);

    await exitResponsive();
    expect(state.responsiveOn).toBe(false);
    expect(xrayOn).toBe(true); // forwarded tool state carried back
    expect(assign).not.toHaveBeenCalled();
    expect(sendToBackground).not.toHaveBeenCalledWith('exit_responsive_mode', expect.anything());
    expect(sessionStorage.getItem(HANDOFF_FLAG)).toBeNull();
    expect(ruleTracker().serialize()).toEqual([
      expect.objectContaining({ selector: '.from-panel' }),
    ]);
    const key = persistKey(location)!;
    const stored = (await browser.storage.local.get(key))[key] as { edits: unknown[] };
    expect(stored.edits).toEqual([expect.objectContaining({ selector: '.from-panel' })]);
    expect(showToast).not.toHaveBeenCalled();
  });

  it('leaks: exit removes every message listener, observers, timers; header rule off', async () => {
    const observers: { disconnect: ReturnType<typeof vi.fn> }[] = [];
    class FakeObserver {
      disconnect = vi.fn();
      observe = vi.fn();
      unobserve = vi.fn();
      constructor() {
        observers.push(this);
      }
    }
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    vi.stubGlobal('ResizeObserver', FakeObserver);
    const added = new Set<EventListenerOrEventListenerObject>();
    const realAdd = window.addEventListener.bind(window);
    const realRemove = window.removeEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation((type, fn, opts) => {
      if (type === 'message' && fn) added.add(fn);
      realAdd(type, fn, opts);
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation((type, fn, opts) => {
      if (type === 'message' && fn) added.delete(fn);
      realRemove(type, fn, opts);
    });
    const frames = await enter();
    vi.useFakeTimers();
    frames.forEach((f) => frameSays(f, 'ready_for_state_sync'));
    for (const iframe of shadow.querySelectorAll('iframe')) iframe.dispatchEvent(new Event('load'));
    frameSays(frames[0]!, 'editor_op_recorded'); // arms the shared-history batch timer
    expect(added.size).toBeGreaterThanOrEqual(3);
    expect(observers.length).toBeGreaterThanOrEqual(3);
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    await exitResponsive();
    expect(added.size).toBe(0);
    for (const o of observers) expect(o.disconnect).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(sendToBackground).toHaveBeenCalledWith('disable_frame_header_rule');
    vi.unstubAllGlobals();
  });

  it('security: a page script with the right __bd but the wrong source is ignored', async () => {
    const frames = await enter();
    for (const source of [window, null, { postMessage: vi.fn() }]) {
      from(source, { __bd: BD(), dir: 'ruler-iframe', type: 'shortcut', data: ['v'] });
      from(source, {
        __bd: BD(),
        dir: 'ruler-iframe',
        type: 'rule_edits_changed',
        data: [[own('evil', 'body')]],
      });
      from(source, { __bd: BD(), dir: 'ruler-iframe', type: 'ready_for_state_sync', data: [] });
    }
    await flush();
    expect(state.responsiveOn).toBe(true); // shortcut V would have left
    for (const f of frames) {
      expect(sent(f, 'apply_rule_edits')).toHaveLength(0);
      expect(sent(f, 'ready_ack')).toHaveLength(0);
    }
  });

  it('§9: pointer events on the shell toolbar post nothing to the frames', async () => {
    const frames = await enter();
    frames.forEach((f) => frameSays(f, 'ready_for_state_sync'));
    await flush();
    frames.forEach((f) => f.postMessage.mockClear());
    const bar = shadow.querySelector<HTMLElement>('[data-toolbar], header, [role="toolbar"]');
    const targets = [bar, shadow.querySelector<HTMLElement>('[data-frame="1"]')].filter(
      (x): x is HTMLElement => !!x,
    );
    expect(targets.length).toBeGreaterThan(0);
    for (const t of targets)
      for (const type of ['pointermove', 'pointerdown', 'pointerup', 'click'])
        t.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true }));
    await flush();
    expect(state.hovered).toBeNull();
    expect(state.selected).toBeNull();
    for (const f of frames) expect(f.postMessage).not.toHaveBeenCalled();
  });

  it('§9: a resize-handle drag ending over the page does not click', async () => {
    const guard = new AbortController();
    installDragGuard(guard.signal);
    await enter();
    const handle = shadow.querySelector<HTMLElement>('[data-frame="1"] [data-handle="corner"]')!;
    handle.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 0, clientY: 0, button: 0, bubbles: true }),
    );
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 40, clientY: 40 }));
    const page = document.body.appendChild(document.createElement('button'));
    const clicked = vi.fn();
    page.addEventListener('click', clicked);
    page.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    page.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    page.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clicked).not.toHaveBeenCalled();
    guard.abort();
  });
});

// ------------------------------------------------------------------ frame side

describe('frame', () => {
  let parent: { postMessage: ReturnType<typeof vi.fn> };
  const toFrame = (source: unknown, type: string, ...data: unknown[]) =>
    from(source, { __bd: BD(), dir: 'ruler-parent', type, data });
  const parentGot = (type: string) =>
    parent.postMessage.mock.calls.map(([m]) => m as Envelope).filter((m) => m.type === type);

  beforeEach(() => {
    parent = { postMessage: vi.fn() };
    vi.spyOn(window, 'parent', 'get').mockReturnValue(parent as unknown as Window);
    vi.spyOn(window, 'top', 'get').mockReturnValue(parent as unknown as Window);
    window.name = frameName(BD(), 2);
    xrayOn = false;
  });
  afterEach(() => {
    stopFrameMode();
    ruleTracker().revertAll();
    setPaused(false);
    window.name = '';
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('a panel rule edit here is reported; apply_rule_edits from the shell replaces the list', async () => {
    startFrameMode();
    ruleTracker().applySerialized([own('p1', '.from-panel')]);
    expect(parentGot('rule_edits_changed').map((m) => m.data)).toEqual([
      [[expect.objectContaining({ selector: '.from-panel' })]],
    ]);
    toFrame(parent, 'apply_rule_edits', [own('o1', '.other')]);
    await flush();
    expect(ruleTracker().serialize()).toEqual([expect.objectContaining({ selector: '.other' })]);
  });

  it('§9: a key typed in an <input> inside a page shadow root is neither run nor forwarded', () => {
    startFrameMode();
    const host = document.body.appendChild(document.createElement('div'));
    const input = host.attachShadow({ mode: 'open' }).appendChild(document.createElement('input'));
    window.addEventListener('keydown', routeKey);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true, composed: true }));
    window.removeEventListener('keydown', routeKey);
    expect(parentGot('shortcut')).toHaveLength(0);
    expect(xrayOn).toBe(false);
  });

  it('security: right __bd from a source other than window.parent is ignored', async () => {
    startFrameMode();
    for (const source of [window, null, { postMessage: vi.fn() }]) {
      toFrame(source, 'apply_rule_edits', [own('evil', 'body')]);
      toFrame(source, 'run_item', 'xray');
      toFrame(source, 'set_paused', true);
    }
    await flush();
    expect(ruleTracker().serialize()).toEqual([]);
    expect(xrayOn).toBe(false);
    expect(state.paused).toBe(false);
  });

  it('leaks: stop removes the message listener and disconnects the ResizeObserver', () => {
    const observers: { disconnect: ReturnType<typeof vi.fn> }[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        disconnect = vi.fn();
        observe = vi.fn();
        constructor() {
          observers.push(this);
        }
      },
    );
    const added = new Set<EventListenerOrEventListenerObject>();
    const realAdd = window.addEventListener.bind(window);
    const realRemove = window.removeEventListener.bind(window);
    vi.spyOn(window, 'addEventListener').mockImplementation((type, fn, opts) => {
      if (type === 'message' && fn) added.add(fn);
      realAdd(type, fn, opts);
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation((type, fn, opts) => {
      if (type === 'message' && fn) added.delete(fn);
      realRemove(type, fn, opts);
    });
    vi.useFakeTimers();
    startFrameMode();
    expect(added.size).toBeGreaterThan(0);
    stopFrameMode();
    expect(added.size).toBe(0);
    expect(observers.length).toBeGreaterThan(0);
    for (const o of observers) expect(o.disconnect).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    vi.unstubAllGlobals();
  });
});
