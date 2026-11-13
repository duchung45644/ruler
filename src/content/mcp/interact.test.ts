import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { layer } from '../core/overlay';
import { sessionSignal, stopSession } from '../core/session';
import { state } from '../core/state.svelte';
import { elementId, initSidePanelBridge } from '../sidepanel/bridge.svelte';
import { runMcp } from '.';

vi.mock('../../lib/ext/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/ext/messaging')>()),
  sendToSidePanel: vi.fn(async () => undefined),
  sendToBackground: vi.fn(async () => undefined),
}));

const tick = () => new Promise((r) => setTimeout(r, 5));
const call = (type: Parameters<typeof runMcp>[0], payload: object) =>
  runMcp(type, { tabId: 1, ...payload });
const ok = async (type: Parameters<typeof runMcp>[0], payload: object) => {
  const r = await call(type, payload);
  if (!r.ok) throw new Error(r.error);
  return r.data as Record<string, unknown>;
};

/** happy-dom has no layout: give elements a box and make the point resolve to them. */
function place(el: Element) {
  el.getBoundingClientRect = () =>
    ({
      left: 10,
      top: 10,
      width: 100,
      height: 30,
      right: 110,
      bottom: 40,
      x: 10,
      y: 10,
      toJSON() {},
    }) as DOMRect;
  el.scrollIntoView = () => {};
}

beforeEach(async () => {
  const host = document.body.appendChild(document.createElement('pixellens-ui'));
  host.attachShadow({ mode: 'open' }).append(layer);
  state.active = true;
  sessionSignal();
  await initSidePanelBridge();
  document.elementsFromPoint = () => [];
});
afterEach(() => {
  stopSession();
  state.active = false;
  document.body.replaceChildren();
});

it('clicks with the full pointer/mouse sequence, after replying', async () => {
  const btn = document.body.appendChild(document.createElement('button'));
  place(btn);
  document.elementsFromPoint = () => [btn];
  const seen: string[] = [];
  for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'])
    btn.addEventListener(t, (e) =>
      seen.push(`${t}:${(e as MouseEvent).clientX},${(e as MouseEvent).clientY}`),
    );
  const d = await ok('click_element', { elementId: elementId(btn) });
  expect(d.success).toBe(true);
  expect(seen).toEqual([]); // dispatched after the answer
  await tick();
  expect(seen).toEqual([
    'pointerdown:60,25',
    'mousedown:60,25',
    'pointerup:60,25',
    'mouseup:60,25',
    'click:60,25',
  ]);
});

it('refuses a covered element and names what covers it', async () => {
  const btn = document.body.appendChild(document.createElement('button'));
  const modal = document.body.appendChild(document.createElement('div'));
  modal.id = 'modal';
  place(btn);
  document.elementsFromPoint = () => [modal, btn];
  const r = await call('click_element', { elementId: elementId(btn) });
  expect(r).toEqual({ ok: false, error: expect.stringContaining('<div#modal>') });
});

it('gets through the inspector, which swallows real clicks while inspecting', async () => {
  const btn = document.body.appendChild(document.createElement('button'));
  place(btn);
  document.elementsFromPoint = () => [btn];
  // a PixelLens-style window capture blocker that skips own/agent events
  const { isOwnEvent } = await import('../core/events');
  const host = document.querySelector('pixellens-ui')!;
  const blocker = (e: Event) => {
    if (isOwnEvent(e, host)) return;
    e.stopImmediatePropagation();
  };
  window.addEventListener('click', blocker, true);
  let clicked = 0;
  btn.addEventListener('click', () => clicked++);
  await ok('click_element', { elementId: elementId(btn) });
  await tick();
  window.removeEventListener('click', blocker, true);
  expect(clicked).toBe(1);
});

it('types into an input through the native setter so frameworks see it', async () => {
  const input = document.body.appendChild(document.createElement('input'));
  input.value = 'old';
  place(input);
  const inputs: string[] = [];
  input.addEventListener('input', () => inputs.push(input.value));
  let changed = 0;
  input.addEventListener('change', () => changed++);
  const d = await ok('type_text', { elementId: elementId(input), text: 'hi' });
  expect(d).toMatchObject({ success: true, value: 'hi' });
  expect(inputs).toEqual(['', 'h', 'hi']);
  expect(changed).toBe(1);
  await ok('type_text', { elementId: elementId(input), text: '!', clear: false });
  expect(input.value).toBe('hi!');
});

it('picks a <select> option by value or label', async () => {
  const sel = document.body.appendChild(document.createElement('select'));
  sel.innerHTML = '<option value="a">Apple</option><option value="b">Banana</option>';
  place(sel);
  await ok('type_text', { elementId: elementId(sel), text: 'Banana' });
  expect(sel.value).toBe('b');
  expect(await call('type_text', { elementId: elementId(sel), text: 'Kiwi' })).toMatchObject({
    ok: false,
  });
});

it('refuses to type into something that is not a field', async () => {
  const div = document.body.appendChild(document.createElement('div'));
  place(div);
  expect(await call('type_text', { elementId: elementId(div), text: 'x' })).toMatchObject({
    ok: false,
  });
});

it('press_key goes to the page, never to PixelLens shortcuts', async () => {
  const input = document.body.appendChild(document.createElement('input'));
  place(input);
  const keys: string[] = [];
  input.addEventListener('keydown', (e) => keys.push(e.key));
  await ok('press_key', { elementId: elementId(input), key: 'Escape' });
  await tick();
  expect(keys).toEqual(['Escape']);
  const { agentEvents } = await import('../core/events');
  let marked = false;
  input.addEventListener('keyup', (e) => (marked = agentEvents.has(e)));
  await ok('press_key', { elementId: elementId(input), key: '1' });
  await tick();
  expect(marked).toBe(true); // routeKey skips marked events, so "1" does not switch tools
});

it('scrolls by delta or to an element', async () => {
  const spy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  await ok('scroll_page', { deltaY: 400 });
  expect(spy).toHaveBeenCalledWith({ left: 0, top: 400, behavior: 'instant' });
  const el = document.body.appendChild(document.createElement('section'));
  place(el);
  const into = vi.fn();
  el.scrollIntoView = into;
  await ok('scroll_page', { elementId: elementId(el) });
  expect(into).toHaveBeenCalled();
});
