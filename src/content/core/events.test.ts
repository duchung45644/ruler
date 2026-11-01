import { describe, expect, it } from 'vitest';
import { isOwnEvent } from './events';

describe('isOwnEvent', () => {
  it('is true for composed events from inside the host shadow root', () => {
    const host = document.createElement('bo-doi-ui');
    document.body.append(host);
    const btn = document.createElement('button');
    host.attachShadow({ mode: 'open' }).append(btn);
    let seen: Event | null = null;
    window.addEventListener('click', (e) => (seen = e), { once: true, capture: true });
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(isOwnEvent(seen!, host)).toBe(true);
  });

  it('is false for page events', () => {
    const host = document.createElement('bo-doi-ui');
    const p = document.createElement('p');
    document.body.append(host, p);
    let seen: Event | null = null;
    window.addEventListener('click', (e) => (seen = e), { once: true, capture: true });
    p.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    expect(isOwnEvent(seen!, host)).toBe(false);
  });
});
