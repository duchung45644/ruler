import { describe, expect, it, vi } from 'vitest';
import { firstChildOf, isRendered, parentOf, siblingOf } from './dom';

const isOwn = (n: Element) => n.tagName === 'BO-DOI-UI';

describe('dom traversal', () => {
  it('firstChildOf skips non-visual tags', () => {
    document.body.innerHTML = '<div><script></script><style></style><p id=a></p></div>';
    expect(firstChildOf(document.querySelector('div')!, isOwn)?.id).toBe('a');
  });

  it('siblingOf skips templates and own nodes', () => {
    document.body.innerHTML =
      '<p id=a></p><template></template><bo-doi-ui></bo-doi-ui><p id=b></p>';
    const a = document.getElementById('a')!;
    const b = document.getElementById('b')!;
    expect(siblingOf(a, 1, isOwn)).toBe(b);
    expect(siblingOf(b, -1, isOwn)).toBe(a);
  });

  it('parentOf stops at body', () => {
    document.body.innerHTML = '<div><p></p></div>';
    const div = document.querySelector('div')!;
    expect(parentOf(div)).toBeNull();
    expect(parentOf(div.firstElementChild!)).toBe(div);
  });

  it('isRendered is false when removed or display:none', () => {
    document.body.innerHTML = '<div id=x></div>';
    const el = document.getElementById('x')!;
    const box = (w: number) =>
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ width: w, height: w } as DOMRect);
    box(10);
    expect(isRendered(el)).toBe(true);
    el.style.display = 'none';
    box(0); // happy-dom has no layout
    expect(isRendered(el)).toBe(false);
    el.style.display = '';
    box(10);
    el.remove();
    expect(isRendered(el)).toBe(false);
  });
});
