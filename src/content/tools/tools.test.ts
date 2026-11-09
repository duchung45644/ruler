import { afterEach, expect, it, vi } from 'vitest';
import { items } from '../core/registry.svelte';
import { layer } from '../core/overlay';
import { stopSession } from '../core/session';
import { initTools } from '.';

afterEach(() => {
  stopSession();
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

it('registers the inspect tools in legacy order (inspect first, as the content entry loads it)', async () => {
  await initTools();
  const ids = items
    .map((i) => i.id)
    .filter((id) => ['inspect', 'xray', 'grid', 'ruler', 'breakpoints'].includes(id));
  expect(ids).toEqual(['inspect', 'xray', 'grid', 'ruler', 'breakpoints']);
});

document.elementsFromPoint ??= () => [];
const flush = () => new Promise((r) => setTimeout(r, 50));

it.each([
  ['resolves', () => Promise.resolve({ sRGBHex: '#ff0000' })],
  ['is cancelled', () => Promise.reject(new DOMException('cancel', 'AbortError'))],
])('eyedropper shows the UI again when the picker %s', async (_, open) => {
  const host = document.createElement('pixellens-ui');
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
  /** Guide lines as painted (scroll is 0, so client px = page px). */
  const currentGuides = async () => {
    await flush();
    return [...layer.querySelectorAll<HTMLElement>('div')]
      .filter((d) => (d.style.top && d.style.bottom) || (d.style.left && d.style.right))
      .map((d) =>
        d.style.bottom
          ? { axis: 'v', pos: parseFloat(d.style.left) }
          : { axis: 'h', pos: parseFloat(d.style.top) },
      );
  };
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
  expect(await currentGuides()).toEqual([{ axis: 'v', pos: 100 }]);
  window.dispatchEvent(ev('pointermove', 240, 300));
  expect((await currentGuides())[0]!.pos).toBe(240);
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
  expect(await currentGuides()).toEqual([]);

  document.body.dispatchEvent(ev('pointerdown', 5, 150)); // left strip: horizontal
  document.body.dispatchEvent(ev('pointerup', 300, 150));
  expect(await currentGuides()).toEqual([{ axis: 'h', pos: 150 }]);
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: 300, clientY: 151 }));
  items.find((i) => i.id === 'ruler')!.run(); // off: guides hide with the ruler
  expect(state.rulerOn).toBe(false);
  expect(await currentGuides()).toEqual([]);
  items.find((i) => i.id === 'ruler')!.run(); // back on: they come back
  expect(await currentGuides()).toEqual([{ axis: 'h', pos: 150 }]);

  // click a guide to select it; Delete removes it, and never reaches other key handlers
  const keySpy = vi.fn();
  window.addEventListener('keydown', keySpy);
  document.body.dispatchEvent(ev('pointerdown', 300, 150));
  document.body.dispatchEvent(ev('pointerup', 300, 150));
  const del = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true });
  document.body.dispatchEvent(del);
  expect(del.defaultPrevented).toBe(true);
  expect(keySpy).not.toHaveBeenCalled();
  expect(await currentGuides()).toEqual([]);
  // nothing selected: Delete passes through
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
  expect(keySpy).toHaveBeenCalledTimes(1);
  window.removeEventListener('keydown', keySpy);
  document.body.dispatchEvent(ev('pointerdown', 5, 150));
  document.body.dispatchEvent(ev('pointerup', 300, 150));

  // the corner makes both guides, crossing at the pointer
  document.body.dispatchEvent(ev('pointerdown', 5, 5));
  window.dispatchEvent(ev('pointermove', 400, 500));
  document.body.dispatchEvent(ev('pointerup', 400, 500));
  expect(await currentGuides()).toEqual([
    { axis: 'h', pos: 150 },
    { axis: 'v', pos: 400 },
    { axis: 'h', pos: 500 },
  ]);
  stopSession();
  expect(document.documentElement.style.cursor).toBe('');
  expect(await currentGuides()).toEqual([]);
});

it('registers measure on M', async () => {
  await initTools();
  const m = items.find((i) => i.id === 'measure')!;
  expect([m.key, m.label]).toEqual(['m', 'dock.measure']);
});

it('registers overlay on O, before measure (its arrow keys win)', async () => {
  await initTools();
  const ids = items.map((i) => i.id).filter((id) => ['overlay', 'measure', 'audit'].includes(id));
  expect(ids).toEqual(['overlay', 'measure', 'audit']);
  const o = items.find((i) => i.id === 'overlay')!;
  expect([o.key, o.label]).toEqual(['o', 'dock.overlay']);
});

it('registers find on F after eyedropper; a match lights it, closing clears it', async () => {
  const { runFind, clearFind, find } = await import('./find');
  const { state } = await import('../core/state.svelte');
  await initTools();
  const ids = items.map((i) => i.id).filter((id) => ['eyedropper', 'find', 'capture'].includes(id));
  expect(ids.slice(ids.indexOf('eyedropper'))).toEqual(['eyedropper', 'find', 'capture']);
  const f = items.find((i) => i.id === 'find')!;
  expect([f.key, f.label]).toEqual(['f', 'dock.find']);
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

it('registers audit on A; toggling mounts and clears highlights', async () => {
  const { audit } = await import('./audit');
  await initTools();
  const a = items.find((i) => i.id === 'audit')!;
  expect([a.key, a.label]).toEqual(['a', 'dock.audit']);
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

it('the dock is laid out by purpose with mnemonic keys', async () => {
  const { dockGroups } = await import('../core/registry.svelte');
  await initTools();
  const groups = dockGroups().map((g) => g.map((i) => i.id));
  expect(groups.find((g) => g.includes('ruler'))).toEqual(['ruler', 'measure']);
  expect(groups.find((g) => g.includes('capture'))).toEqual(['capture', 'more']);
  // pause and MCP stay off the dock until used; parent/child until something is selected
  expect(groups.at(-1)).toEqual(['sidepanel', 'quit']);
  expect(groups[0]).toEqual(['inspect', 'find']);
  const { state } = await import('../core/state.svelte');
  state.selected = document.body;
  state.paused = true;
  const shown = dockGroups().map((g) => g.map((i) => i.id));
  expect(shown[0]).toEqual(['select_parent', 'select_child', 'inspect', 'find']);
  expect(shown.at(-1)).toEqual(['sidepanel', 'pause', 'quit']);
  state.selected = null;
  state.paused = false;
  // the "more" menu holds the less used tools and lights up while one is on
  const { MORE_ITEMS } = await import('../core/registry.svelte');
  expect(MORE_ITEMS).toEqual(['overlay', 'audit', 'eyedropper', 'pause']);
  const more = items.find((i) => i.id === 'more')!;
  expect(more.isActive!()).toBe(false);
  items.find((i) => i.id === 'audit')!.run();
  expect(more.isActive!()).toBe(true);
  items.find((i) => i.id === 'audit')!.run();
  expect(groups.flat()).not.toContain('breakpoints'); // key B only; the responsive toolbar has it
  const keyOf = (id: string) => items.find((i) => i.id === id)?.key;
  expect(['xray', 'grid', 'ruler', 'breakpoints', 'eyedropper', 'capture'].map(keyOf)).toEqual([
    'x',
    'g',
    'r',
    'b',
    'c',
    's',
  ]);
});
