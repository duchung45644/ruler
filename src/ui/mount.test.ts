import { describe, expect, it, vi } from 'vitest';
import { mountUi } from './mount';

const Empty = (() => {}) as never;

describe('mountUi', () => {
  it('page document listeners do not see clicks from our UI; window capture still does', async () => {
    const ctx = { onInvalidated: () => () => {}, isInvalid: false } as never;
    const ui = await mountUi(ctx, Empty);
    const btn = ui.shadow.appendChild(document.createElement('button'));
    const page = vi.fn();
    const capture = vi.fn();
    document.addEventListener('click', page);
    window.addEventListener('click', capture, { capture: true });
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    document.removeEventListener('click', page);
    window.removeEventListener('click', capture, { capture: true });
    ui.remove();
    expect(capture).toHaveBeenCalledOnce();
    expect(page).not.toHaveBeenCalled();
  });
});

it('mounts a named host marked as ours', async () => {
  const ctx = { onInvalidated: () => () => {}, isInvalid: false } as never;
  const ui = await mountUi(ctx, Empty, {}, { name: 'bo-doi-capture' });
  expect(ui.host.localName).toBe('bo-doi-capture');
  expect(ui.host.hasAttribute('data-bo-doi')).toBe(true);
  ui.remove();
});
