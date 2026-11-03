import { afterEach, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';

// fakeBrowser has no i18n.getMessage; the panel renders labels
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
import { layer, requestPaint } from '../../core/overlay';
import { stopSession } from '../../core/session';
import { state } from '../../core/state.svelte';
import { routeKey } from '../../core/keys';
import { setPaused } from '../../core/registry.svelte';
import { initInspector, pickElement } from '.';
import { pins } from './pins.svelte';
import { installDragGuard, startDrag } from '../../core/drag';

afterEach(() => {
  stopSession();
  document.body.replaceChildren();
});
// happy-dom has no hit testing
document.elementsFromPoint ??= () => [];

it('blocks page mousedown only while inspecting', async () => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  host.attachShadow({ mode: 'open' }).append(layer);
  const p = document.createElement('p');
  document.body.append(p);
  let seen = 0;
  p.addEventListener('mousedown', () => seen++);
  await initInspector();
  // a page listener on window capture runs before any document-level block
  window.addEventListener('mousedown', () => seen++, true);
  const press = () =>
    p.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
  state.inspectOn = true;
  press();
  expect(seen).toBe(0);
  state.inspectOn = false;
  press();
  expect(seen).toBe(2);
});

it('mounts the panel in the shadow root and shows the selection', async () => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.append(layer);
  const p = document.createElement('p');
  p.textContent = 'hi';
  document.body.append(p);
  await initInspector();
  state.selected = p;
  await new Promise((r) => setTimeout(r, 50));
  expect(shadow.textContent).toContain('inspect_copyCss');
  expect(shadow.textContent).toContain('inspect_layout');
  stopSession();
  expect(shadow.textContent).not.toContain('inspect_copyCss');
});

it('shows colours in state.colorFormat (2.22)', async () => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.append(layer);
  const p = document.createElement('p');
  p.textContent = 'hi';
  p.style.color = 'rgb(10, 20, 30)';
  document.body.append(p);
  await initInspector();
  state.colorFormat = 'RGB';
  state.selected = p;
  await new Promise((r) => setTimeout(r, 50));
  expect(shadow.textContent).toContain('rgb(10, 20, 30)');
  state.colorFormat = 'HEX';
  await new Promise((r) => setTimeout(r, 50));
  expect(shadow.textContent).toContain('#0A141E');
});

async function setup() {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.append(layer);
  const p = document.createElement('p');
  p.textContent = 'hi';
  p.getBoundingClientRect = () => new DOMRect(10, 10, 100, 20); // happy-dom has no layout
  document.body.append(p);
  await initInspector();
  state.inspectOn = true;
  state.selected = p;
  const panel = shadow.lastElementChild as HTMLElement; // the floating panel box
  const settle = () => new Promise((r) => setTimeout(r, 50));
  const move = (el: Node) =>
    el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, composed: true }));
  await settle();
  requestPaint(); // select() would request it
  await settle();
  return { shadow, p, panel, settle, move };
}

it('hides the floating panel while the pointer is over our UI, until it is back on the page', async () => {
  const { shadow, p, panel, settle, move } = await setup();
  expect(panel.style.visibility).toBe('');
  move(shadow.appendChild(document.createElement('div'))); // e.g. a pinned inspector
  await settle();
  expect(panel.style.visibility).toBe('hidden');
  move(p);
  await settle();
  expect(panel.style.visibility).toBe('');
});

it('keeps the panel hidden after pinning until the next page mousemove', async () => {
  const { p, panel, settle, move } = await setup();
  routeKey(new KeyboardEvent('keydown', { key: ' ' }));
  requestPaint(); // any repaint (keydown, resize, scroll) must not bring it back
  await settle();
  expect(pins).toHaveLength(1);
  expect(panel.style.visibility).toBe('hidden');
  move(p);
  await settle();
  expect(panel.style.visibility).toBe('');
});

it('pause hides the floating panel and pins', async () => {
  const { p, panel, settle, move } = await setup();
  const pinBox = panel.previousElementSibling!;
  routeKey(new KeyboardEvent('keydown', { key: ' ' }));
  await settle();
  expect(pinBox.textContent).toContain('inspect_copyCss');
  setPaused(true);
  await settle();
  expect(panel.style.visibility).toBe('hidden');
  expect(pinBox.textContent).not.toContain('inspect_copyCss');
  move(p); // paused: hover is off, the panel must stay hidden
  await settle();
  expect(panel.style.visibility).toBe('hidden');
  setPaused(false);
  move(p);
  await settle();
  expect(panel.style.visibility).toBe('');
  expect(pinBox.textContent).toContain('inspect_copyCss'); // pins come back where they were
});

it('a click right after a drag does not select (regression)', async () => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  host.attachShadow({ mode: 'open' }).append(layer);
  const p = document.createElement('p');
  document.body.append(p);
  const ac = new AbortController();
  installDragGuard(ac.signal);
  await initInspector();
  state.inspectOn = true;
  state.selected = null;
  const orig = document.elementsFromPoint;
  document.elementsFromPoint = () => [p];
  startDrag(new PointerEvent('pointerdown', { cancelable: true }), () => {});
  window.dispatchEvent(new PointerEvent('pointerup'));
  p.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
  document.elementsFromPoint = orig;
  ac.abort();
  expect(state.selected).toBe(null);
});

it('ignores hover and click while capturing', async () => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  host.attachShadow({ mode: 'open' }).append(layer);
  const p = document.createElement('p');
  document.body.append(p);
  const prev = document.elementsFromPoint;
  document.elementsFromPoint = () => [p];
  await initInspector();
  state.inspectOn = true;
  state.capturing = true;
  p.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, composed: true }));
  p.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
  state.capturing = false;
  document.elementsFromPoint = prev;
  expect(state.hovered).toBeNull();
  expect(state.selected).toBeNull();
});

it('pickElement resolves the clicked element, restores inspect state, Esc cancels', async () => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  host.attachShadow({ mode: 'open' }).append(layer);
  const p = document.createElement('p');
  document.body.append(p);
  const prev = document.elementsFromPoint;
  document.elementsFromPoint = () => [p];
  await initInspector();
  state.inspectOn = false;
  const picked = pickElement();
  expect(state.inspectOn).toBe(true);
  p.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
  expect(await picked).toBe(p);
  expect(state.inspectOn).toBe(false);
  expect(state.selected).toBeNull();

  const cancelled = pickElement();
  routeKey(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(await cancelled).toBeNull();
  document.elementsFromPoint = prev;
});
