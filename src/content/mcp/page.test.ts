import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { browser } from '#imports';
import type { Issue } from '../../lib/element/types';
import { ERR, type McpPageType } from '../../lib/mcp/protocol';
import { layer } from '../core/overlay';
import { sessionSignal, stopSession } from '../core/session';
import { state } from '../core/state.svelte';
import { elementId, initSidePanelBridge } from '../sidepanel/bridge.svelte';
import {
  buildElementSummary,
  buildOutlineTree,
  buildPageInfo,
  extractAiAttributes,
  queryBySelector,
} from './ai-data';
import { fromBackground, mcpHandlers, runMcp } from '.';
import { rankA11y } from './page';

vi.mock('../../lib/ext/messaging', async (orig) => ({
  ...(await orig<typeof import('../../lib/ext/messaging')>()),
  sendToSidePanel: vi.fn(async () => undefined),
  sendToBackground: vi.fn(async () => undefined),
}));

const ids = (el: Element) => `v-${el.localName}`;

beforeEach(async () => {
  const host = document.body.appendChild(document.createElement('iodob-ui'));
  host.attachShadow({ mode: 'open' }).append(layer);
  state.active = true;
  sessionSignal();
  await initSidePanelBridge();
});
afterEach(() => {
  stopSession();
  state.active = false;
  document.body.replaceChildren();
  document.head.replaceChildren();
});

describe('AI data (10.09)', () => {
  it('describes the page', () => {
    document.head.innerHTML =
      '<meta name="description" content="Desc"><meta property="og:title" content="OG">';
    document.title = 'Hello';
    document.documentElement.lang = 'vi';
    document.body.insertAdjacentHTML('beforeend', '<h1>  Big\n title </h1>');
    expect(buildPageInfo()).toMatchObject({
      title: 'Hello',
      lang: 'vi',
      description: 'Desc',
      ogTitle: 'OG',
      h1: 'Big title',
      viewport: { width: innerWidth, height: innerHeight },
    });
  });

  it('keeps ≤ 5 data-* and ≤ 8 aria-* plus aria-label, never our own ids', () => {
    const el = document.createElement('a');
    el.setAttribute('href', '/x');
    el.setAttribute('data-sr-id-abc', 'v-1');
    for (let i = 0; i < 7; i++) el.setAttribute(`data-k${i}`, String(i));
    for (let i = 0; i < 10; i++) el.setAttribute(`aria-x${i}`, String(i));
    el.setAttribute('aria-label', 'Go');
    const a = extractAiAttributes(el);
    expect(a.href).toBe('/x');
    expect(Object.keys(a.data!)).toHaveLength(5);
    expect(a.data!['data-sr-id-abc']).toBeUndefined();
    expect(Object.keys(a.aria!)).toHaveLength(9);
    expect(a.aria!['aria-label']).toBe('Go');
  });

  it('builds an outline with depth and child limits', () => {
    const ul = document.createElement('ul');
    ul.innerHTML = '<li>a</li><li>b</li><li>c</li><script></script>';
    document.body.append(ul);
    const tree = buildOutlineTree(ul, ids, { maxChildren: 2 })!;
    expect(tree.tag).toBe('ul');
    expect(tree.children!.map((c) => c.text)).toEqual(['a', 'b']);
    expect(tree.truncatedChildren).toBe(2);
    expect(buildOutlineTree(ul, ids, { maxDepth: 0 })!.children).toBeUndefined();
  });

  it('summarises an element', () => {
    const p = document.body.appendChild(document.createElement('p'));
    p.className = ' a b ';
    p.textContent = 'Hi';
    expect(buildElementSummary(p, ids)).toMatchObject({
      id: 'v-p',
      tag: 'p',
      classes: 'a b',
      text: 'Hi',
    });
  });

  it('queries with a limit, skipping scaffolding and our UI', () => {
    document.body.insertAdjacentHTML('beforeend', '<i>1</i><i>2</i><i>3</i>');
    const r = queryBySelector('i, body, iodob-ui', ids, { limit: 2 });
    expect(r.count).toBe(3);
    expect(r.truncated).toBe(1);
    expect(r.matches).toHaveLength(2);
    expect(queryBySelector('[[', ids)).toMatchObject({ count: 0, error: expect.any(String) });
  });
});

describe('mcp_call entry', () => {
  const bg = { id: browser.runtime.id, url: browser.runtime.getURL('/background.js') };

  it('answers only the background', () => {
    expect(fromBackground(bg)).toBe(true);
    expect(fromBackground({ id: browser.runtime.id, tab: { id: 1 } as never })).toBe(false);
    expect(
      fromBackground({ id: browser.runtime.id, url: browser.runtime.getURL('/sidepanel.html') }),
    ).toBe(false);
    expect(fromBackground({ id: 'other' })).toBe(false);
  });

  it('refuses when iodob is off', async () => {
    state.active = false;
    expect(await runMcp('get_page_info', { tabId: 1 })).toEqual({
      ok: false,
      error: ERR.pageInactive,
    });
  });

  it('runs a page command', async () => {
    document.title = 'T';
    const r = await mcpHandlers.mcp_call!('get_page_info', { tabId: 1 }, bg);
    expect(r).toMatchObject({ ok: true, data: { title: 'T' } });
  });

  it('reports a missing element plainly', async () => {
    expect(await runMcp('get_colors', { tabId: 1, elementId: 'v-nope' })).toEqual({
      ok: false,
      error: 'Element not found.',
    });
  });

  it('reads element analysis through the side panel collectors', async () => {
    const p = document.body.appendChild(document.createElement('p'));
    p.style.color = 'rgb(255, 0, 0)';
    p.textContent = 'x';
    const id = elementId(p);
    const r = await runMcp('get_tailwind', { tabId: 1, elementId: id });
    expect(r).toMatchObject({ ok: true, data: { css: { color: 'rgb(255, 0, 0)' } } });
    expect(await runMcp('calculate_specificity', { tabId: 1, selector: '#a .b' })).toEqual({
      ok: true,
      data: { selector: '#a .b', specificity: [1, 1, 0], score: 10100 },
    });
  });

  it('per-element commands return what collectElementDetails returned, selection untouched', async () => {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<section id="s" style="display: grid; gap: 4px; padding: 8px; color: rgb(0, 0, 255);
          background: linear-gradient(red, blue); position: absolute; top: 3px">
        <h2 style="font-size: 20px; font-weight: 700">Title</h2>
        <p style="color: rgb(255, 0, 0); border: 1px solid rgb(0, 128, 0)">Text <b>bold</b></p>
        <img src="https://example.com/a.png" alt="a">
        <div style="background-image: url(https://example.com/b.jpg)"><span>x</span></div>
        <svg><path d="M0 0"/></svg>
      </section>`,
    );
    const sel = document.body.appendChild(document.createElement('i'));
    sel.textContent = 'selected';
    const { collectElementDetails, styleMap } = await import('../sidepanel/details');
    collectElementDetails(sel, elementId);
    const before = new Map([...styleMap].map(([k, v]) => [k, structuredClone(v)]));
    for (const el of [document.getElementById('s')!, ...document.querySelectorAll('#s *')]) {
      const id = elementId(el);
      const run = async (cmd: McpPageType) => {
        const r = await runMcp(cmd, { tabId: 1, elementId: id });
        expect(r.ok).toBe(true);
        return (r as { data: unknown }).data;
      };
      const results = {
        typography: await run('get_typography'),
        colors: await run('get_colors'),
        assets: await run('get_assets'),
        layout: await run('get_layout'),
        tailwind: await run('get_tailwind'),
      };
      expect(new Map([...styleMap].map(([k, v]) => [k, structuredClone(v)]))).toEqual(before);
      const d = structuredClone(collectElementDetails(el, elementId));
      expect(results).toEqual({
        typography: { typography: d.typography },
        colors: { colors: d.colors, gradients: d.gradients },
        assets: { assets: d.assets },
        layout: { layout: d.layout, boxModel: d.boxModel },
        tailwind: { css: d.css },
      });
      collectElementDetails(sel, elementId);
    }
  });
});

it('ranks a11y groups: warnings first, lowest contrast first, then limit', () => {
  const g = (id: string, severity: 'warning' | 'info', contrastRatio: number, n: number) =>
    ({ id, severity, metadata: { contrastRatio }, elementIds: Array(n).fill('v-a') }) as Issue;
  const r = rankA11y([g('a', 'info', 1.1, 1), g('b', 'warning', 4, 2), g('c', 'warning', 2, 3)], 2);
  expect(r.issues.map((i) => [i.id, i.count])).toEqual([
    ['c', 3],
    ['b', 2],
  ]);
  expect(r).toMatchObject({ totalGroups: 3, totalRawIssues: 6, truncated: true });
});
