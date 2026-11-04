import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { HtmlEditor } from './engine';

let sel: Element | null = null;
let ed: HtmlEditor;

beforeEach(() => {
  document.body.innerHTML = '<ul><li>a</li><li>b</li></ul><p class="x">t</p>';
  sel = null;
  ed = new HtmlEditor({
    extId: 'test',
    isOwn: () => false,
    selected: () => sel,
    select: (el) => (sel = el),
    onChange: () => {},
  });
});
afterEach(() => vi.useRealTimers());

const lis = () => [...document.querySelectorAll('li')];

it('hides on delete, selects the next sibling, and undo restores', () => {
  const [a, b] = lis();
  sel = a!;
  expect(ed.delete().ok).toBe(true);
  expect(a!.getAttribute('style')).toMatch(/display: none !important/);
  expect(sel).toBe(b);
  ed.undo();
  expect(a!.hasAttribute('style')).toBe(false);
  expect(sel).toBe(a);
});

it('refuses protected tags', () => {
  sel = document.body;
  expect(ed.delete()).toMatchObject({ ok: false, error: 'Cannot delete <body>.' });
  expect(ed.duplicate()).toMatchObject({ ok: false, error: 'Cannot duplicate <body>.' });
});

it('cut then paste appends at the end, once', () => {
  sel = lis()[0]!;
  ed.cut();
  sel = document.querySelector('ul');
  expect(ed.paste().ok).toBe(true);
  expect(document.querySelector('ul')!.lastElementChild!.textContent).toBe('a');
  sel = document.querySelector('ul');
  expect(ed.paste().ok).toBe(false);
});

it('duplicate inserts right after; undo removes the copy', () => {
  sel = lis()[0]!;
  ed.duplicate();
  expect(lis().map((l) => l.textContent)).toEqual(['a', 'a', 'b']);
  ed.undo();
  expect(lis().map((l) => l.textContent)).toEqual(['a', 'b']);
});

it('coalesces class edits within 600ms', () => {
  vi.useFakeTimers();
  const p = document.querySelector('p')!;
  ed.setClasses(p, 'y');
  vi.advanceTimersByTime(200);
  ed.setClasses(p, 'y z');
  vi.advanceTimersByTime(200);
  ed.setClasses(p, 'z');
  expect(p.className).toBe('z');
  ed.undo();
  expect(p.className).toBe('x');
  expect(ed.historyState().canUndo).toBe(false);
});

it('sanitizes inserted html', () => {
  const p = document.querySelector('p')!;
  ed.insertHtml(p, 'afterend', '<img src=x onerror=alert(1)>');
  const img = document.querySelector('img')!;
  expect(img).not.toBeNull();
  expect(img.hasAttribute('onerror')).toBe(false);
});

it('rejects inline styles with state or media', () => {
  const p = document.querySelector('p')!;
  expect(
    ed.setStyles(p, [{ property: 'color', value: 'red', important: false, state: ':hover' }]).ok,
  ).toBe(false);
  expect(ed.setStyles(p, [{ property: 'color', value: 'red', important: false }]).ok).toBe(true);
  expect(p.style.color).toBe('red');
});

it('undoing everything restores the page and drops its own ids (2.24)', () => {
  const start = document.body.innerHTML;
  sel = lis()[0]!;
  ed.copy();
  sel = document.querySelector('ul');
  ed.paste();
  sel = lis()[1]!;
  ed.delete();
  ed.setText(document.querySelector('p')!, 'new');
  ed.setStyles(document.querySelector('p')!, [
    { property: 'color', value: 'red', important: false },
  ]);
  while (ed.historyState().canUndo) ed.undo();
  expect(document.body.innerHTML).toBe(start);
  expect(document.body.innerHTML).not.toContain('data-sr-id');
  expect(ed.htmlChanges()).toEqual([]);
});

it('commits a text edit as one step', () => {
  const p = document.querySelector('p')!;
  ed.snapshotForTextEdit(p);
  p.textContent = 'typed';
  expect(ed.commitTextEdit(p)?.ok).toBe(true);
  expect(p.textContent).toBe('typed');
  ed.undo();
  expect(p.textContent).toBe('t');
});

it('clearAll puts everything back', () => {
  const start = document.body.innerHTML;
  const p = document.querySelector('p')!;
  ed.setClasses(p, 'q');
  sel = lis()[0]!;
  ed.duplicate();
  ed.setText(p, 'zz');
  expect(ed.htmlChanges().length).toBeGreaterThan(0);
  ed.clearAll();
  expect(ed.htmlChanges()).toEqual([]);
  expect(document.body.innerHTML).toBe(start);
});
