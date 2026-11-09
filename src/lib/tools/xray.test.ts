import { afterEach, describe, expect, it } from 'vitest';
import { items } from '../../content/core/registry.svelte';
import { stopSession } from '../../content/core/session';
import { initXray } from '../../content/tools/xray';
import { xrayDepth, xraySheet } from './xray';

describe('xray', () => {
  afterEach(() => {
    stopSession();
    document.body.replaceChildren();
  });

  it('builds the per-level outline sheet', () => {
    const s = xraySheet('body', 0);
    expect(s).toContain('body > *{outline:1px solid #FF3F25!important;}');
    expect(s).toContain('body *{outline:1px solid #0D4F8F!important;}');
    expect(s).toContain('pixellens-ui');
    expect(xraySheet(':host', 3)).toContain(':host > *{outline:1px solid #999999!important;}');
  });

  it('counts ancestors up to body through shadow hosts', () => {
    document.body.innerHTML = '<div><p id=h></p></div>';
    const r = document.getElementById('h')!.attachShadow({ mode: 'open' });
    r.innerHTML = '<i></i>';
    expect(xrayDepth(document.getElementById('h')!)).toBe(2);
    expect(xrayDepth(r.querySelector('i')!)).toBe(3);
  });

  it('styles the page and open shadow roots; stop removes every sheet', async () => {
    document.body.innerHTML = '<p id=h></p>';
    const root = document.getElementById('h')!.attachShadow({ mode: 'open' });
    await initXray();
    items.find((i) => i.id === 'xray')!.run();
    const count = () =>
      document.querySelectorAll('style[data-pixellens]').length +
      root.querySelectorAll('style[data-pixellens]').length;
    expect(count()).toBe(2);
    stopSession();
    expect(count()).toBe(0);
  });
});
