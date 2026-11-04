import { afterEach, expect, it, vi } from 'vitest';
import { collectRules, sheetsOf } from '../../lib/css/matched';
import { buildPayload, scheduleExtras, watchMedia, unwatchMedia } from './payload';
import { availableStates, StateForcer } from './states';

afterEach(() => {
  unwatchMedia();
  document.head.replaceChildren();
  document.body.replaceChildren();
});

const page = (css: string, html: string) => {
  document.head.innerHTML = `<style>${css}</style>`;
  document.body.innerHTML = html;
};

it('lists and forces states', () => {
  page('.btn:hover{color:red} .other:focus{color:blue}', '<button class="btn">x</button>');
  const btn = document.querySelector('button')!;
  expect(availableStates(btn, collectRules(sheetsOf(document)))).toEqual([':hover']);
  const f = new StateForcer('test');
  f.forceState(btn, ':hover');
  expect(btn.hasAttribute('data-sr-force-hover-test')).toBe(true);
  const style = document.getElementById('sr-force-state-test')!;
  expect(style.textContent!.replace(/\s/g, '')).toContain(
    '.btn[data-sr-force-hover-test]{color:red;}',
  );
  expect(f.forced).toBe(':hover');
  f.forceState(btn, null);
  expect(document.getElementById('sr-force-state-test')).toBeNull();
  expect(btn.hasAttribute('data-sr-force-hover-test')).toBe(false);
});

it('builds payloads with a rising paySeq, addresses and media state', () => {
  page(
    '@media (min-width:1px){.a{color:red}} .a{margin:0}',
    '<p class="a" style="color: blue">x</p>',
  );
  const p = document.querySelector('p')!;
  const f = new StateForcer('test');
  const one = buildPayload(p, f);
  const two = buildPayload(p, f);
  expect(two.paySeq).toBe(one.paySeq + 1);
  expect(one.inline).toEqual([{ property: 'color', value: 'blue', important: false }]);
  const media = one.rules.find((r) => r.wrappers.length)!;
  expect(media.mediaActive).toBe(true);
  expect(media.address).toMatchObject({ stylesheet: 'inline', selector: '.a', occ: 0 });
  expect(media.editable).toBe(true);
});

it('sends inherited rules once idle, and reports media changes', async () => {
  page('div{color:red} div{margin:0}', '<div><p>x</p></div>');
  const send = vi.fn().mockResolvedValue(undefined);
  scheduleExtras(document.querySelector('p')!, 7, send);
  await new Promise((r) => setTimeout(r, 600));
  expect(send).toHaveBeenCalledWith('edit_payload_extras', 7, [
    expect.objectContaining({
      selector: 'div',
      declarations: [expect.objectContaining({ property: 'color' })],
    }),
  ]);

  const listeners: (() => void)[] = [];
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: (_: string, l: () => void) => listeners.push(l),
    removeEventListener: () => listeners.pop(),
  }));
  const send2 = vi.fn().mockResolvedValue(undefined);
  watchMedia([{ wrappers: ['@media (min-width: 1px)'] }], send2);
  listeners[0]!();
  expect(send2).toHaveBeenCalledWith('media_activity', { '@media (min-width: 1px)': true });
  unwatchMedia();
  expect(listeners).toHaveLength(0);
  vi.unstubAllGlobals();
});
