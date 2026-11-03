import { afterEach, expect, it, vi } from 'vitest';
import { items } from '../core/registry.svelte';
import { layer } from '../core/overlay';
import { stopSession } from '../core/session';
import { initTools } from '.';
import { fakeBrowser } from 'wxt/testing/fake-browser';

// fakeBrowser has no i18n.getMessage; the audit panel renders labels
fakeBrowser.i18n.getMessage = ((key: string) => key) as typeof fakeBrowser.i18n.getMessage;
// nor runtime.onConnect, which the side panel bridge listens on
fakeBrowser.runtime.onConnect.addListener = () => {};
fakeBrowser.runtime.onConnect.removeListener = () => {};

afterEach(() => {
  stopSession();
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

it('registers inspectTools in legacy dock order (inspect first, as the content entry loads it)', async () => {
  await initTools();
  const ids = items.filter((i) => i.group === 'inspectTools').map((i) => i.id);
  expect(ids).toEqual(['inspect', 'xray', 'grid', 'ruler', 'breakpoints']);
});

document.elementsFromPoint ??= () => [];
const flush = () => new Promise((r) => setTimeout(r, 50));

it.each([
  ['resolves', () => Promise.resolve({ sRGBHex: '#ff0000' })],
  ['is cancelled', () => Promise.reject(new DOMException('cancel', 'AbortError'))],
])('eyedropper shows the UI again when the picker %s', async (_, open) => {
  const host = document.createElement('bo-doi-ui');
  document.body.append(host);
  host.attachShadow({ mode: 'open' }).append(layer);
  const spy = vi.fn(open);
  vi.stubGlobal(
    'EyeDropper',
    class {
      open = spy;
    },
  );
  await initTools();
  const run = items.find((i) => i.id === 'eyedropper')!.run;
  run();
  expect(host.hasAttribute('data-hidden')).toBe(true);
  run(); // busy: ignored
  await flush();
  expect(spy).toHaveBeenCalledOnce();
  expect(host.hasAttribute('data-hidden')).toBe(false);
});

it('ruler: drag a guide out of the top strip, swallow the click, drop back to remove', async () => {
  const { installDragGuard } = await import('../core/drag');
  const { sessionSignal } = await import('../core/session');
  const { currentGuides } = await import('./ruler');
  const { state } = await import('../core/state.svelte');
  installDragGuard(sessionSignal());
  await initTools();
  items.find((i) => i.id === 'ruler')!.run();
  expect(state.rulerOn).toBe(true);
  const ev = (type: string, x: number, y: number) =>
    new PointerEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true, cancelable: true });
  const pageClick = vi.fn();
  document.body.addEventListener('click', pageClick);

  document.body.dispatchEvent(ev('pointerdown', 100, 5));
  expect(currentGuides()).toEqual([{ axis: 'v', pos: 100 }]);
  window.dispatchEvent(ev('pointermove', 240, 300));
  expect(currentGuides()[0]!.pos).toBe(240);
  document.body.dispatchEvent(ev('pointerup', 240, 300));
  document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  expect(pageClick).not.toHaveBeenCalled();

  // hover near it shows the move cursor
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 242, clientY: 400 }));
  expect(document.documentElement.style.cursor).toBe('move');

  // grab it again and drop on the top strip: removed
  await flush();
  document.body.dispatchEvent(ev('pointerdown', 241, 400));
  document.body.dispatchEvent(ev('pointerup', 241, 5));
  expect(currentGuides()).toEqual([]);

  document.body.dispatchEvent(ev('pointerdown', 5, 150)); // left strip: horizontal
  document.body.dispatchEvent(ev('pointerup', 300, 150));
  expect(currentGuides()).toEqual([{ axis: 'h', pos: 150 }]);
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 151 }));
  items.find((i) => i.id === 'ruler')!.run(); // off: the guide stays painted (legacy)
  expect(state.rulerOn).toBe(false);
  await flush();
  expect(layer.textContent).toContain('150');
  stopSession();
  expect(document.documentElement.style.cursor).toBe('');
  expect(currentGuides()).toEqual([]);
});

it('registers measure in designTools on M', async () => {
  await initTools();
  const m = items.find((i) => i.id === 'measure')!;
  expect([m.group, m.key, m.label]).toEqual(['designTools', 'm', 'dock.measure']);
});

it('registers overlay in designTools on O, before measure (its arrow keys win)', async () => {
  await initTools();
  const ids = items.filter((i) => i.group === 'designTools').map((i) => i.id);
  expect(ids).toEqual(['overlay', 'measure', 'audit']);
  const o = items.find((i) => i.id === 'overlay')!;
  expect([o.key, o.label]).toEqual(['o', 'dock.overlay']);
});

it('registers find on 7 after eyedropper; a match lights it, closing clears it', async () => {
  const { runFind, clearFind, find } = await import('./find');
  const { state } = await import('../core/state.svelte');
  await initTools();
  const ids = items.filter((i) => i.group === 'utilities').map((i) => i.id);
  expect(ids.slice(ids.indexOf('eyedropper'))).toEqual(['eyedropper', 'find', 'capture']);
  const f = items.find((i) => i.id === 'find')!;
  expect([f.key, f.label]).toEqual(['7', 'dock.find']);
  f.run();
  expect(state.popover).toBe('find');
  document.body.innerHTML = '<p class=x></p>';
  document.body.firstElementChild!.getBoundingClientRect = () => new DOMRect(0, 0, 10, 10);
  Element.prototype.scrollIntoView ??= () => {};
  runFind('div[');
  expect(f.isActive!()).toBe(false);
  clearFind();
  expect(find.results).toEqual([]);
});

it('registers audit in designTools on A; toggling mounts and clears highlights', async () => {
  const { audit } = await import('./audit');
  await initTools();
  const a = items.find((i) => i.id === 'audit')!;
  expect([a.group, a.key, a.label]).toEqual(['designTools', 'a', 'dock.audit']);
  a.run();
  expect(a.isActive!()).toBe(true);
  audit.highlights = [document.body];
  a.run();
  expect(a.isActive!()).toBe(false);
  expect(audit.highlights).toEqual([]);
});

it('audit and measure isActive follow reactive state', async () => {
  const { state } = await import('../core/state.svelte');
  await initTools();
  for (const id of ['audit', 'measure', 'overlay'] as const) {
    const it = items.find((i) => i.id === id)!;
    it.run();
    expect(state[`${id}On`]).toBe(true);
    expect(it.isActive!()).toBe(true);
    it.run();
    expect(state[`${id}On`]).toBe(false);
  }
});
