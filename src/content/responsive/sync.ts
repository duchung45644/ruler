/**
 * Scroll sync, SPA URL sync and link/form navigation for responsive mode (8.17, 8.18).
 * Shell side: `createShellSync` routes frame reports to the other frames. Frame side:
 * `createFrameSync` reports scrolls / URL changes and keeps navigation inside the site.
 */
import type { ScrollRatio, ShellApi } from '../../lib/responsive/channel';
import { decideNavigation, formGetUrl, type NavDecision } from '../../lib/responsive/nav';
import {
  createConflictDetector,
  fromRatio,
  SCROLL_MUTE_MS,
  toRatio,
} from '../../lib/responsive/scroll-sync';
import type { Channel } from './bridge';

/** A frame that loaded something but never said ready is given this long before its src is reset. */
export const ESCAPE_MS = 2500;
/** URL poll when the Navigation API is missing. */
export const URL_POLL_MS = 500;

export function isRatio(r: unknown): r is ScrollRatio {
  if (!r || typeof r !== 'object') return false;
  const { x, y } = r as ScrollRatio;
  return Number.isFinite(x) && Number.isFinite(y);
}

const isHttpUrl = (u: unknown): u is string => typeof u === 'string' && /^https?:\/\//i.test(u);

// ---------------------------------------------------------------- shell side

export interface ShellSyncDeps {
  ids(): number[];
  enabled(): boolean;
  applyScroll(id: number, r: ScrollRatio): void;
  resetConflict(id: number): void;
  applySpa(id: number, url: string): void;
  /** Sync turned itself off (conflict): persist and tell the user. */
  turnedOff(): void;
  /** Toolbar URL label. */
  urlChanged(url: string): void;
}

export interface ShellSync {
  scroll(from: number, r: unknown): void;
  conflict(): void;
  spa(from: number, url: unknown): void;
  visible(id: number, on: boolean): void;
  /** Sync switched back on by the user. */
  enabled(): void;
  forget(id: number): void;
}

export function createShellSync(d: ShellSyncDeps): ShellSync {
  const hidden = new Set<number>();
  /** Last ratio a hidden frame missed: sent when it becomes visible again. */
  const pending = new Map<number, ScrollRatio>();
  return {
    scroll(from, r) {
      if (!d.enabled() || !isRatio(r)) return;
      const ratio = { x: r.x, y: r.y };
      for (const id of d.ids()) {
        if (id === from) continue;
        if (hidden.has(id)) pending.set(id, ratio);
        else d.applyScroll(id, ratio);
      }
    },
    conflict() {
      if (!d.enabled()) return;
      pending.clear();
      d.turnedOff();
    },
    spa(from, url) {
      if (!isHttpUrl(url)) return;
      d.urlChanged(url);
      for (const id of d.ids()) if (id !== from) d.applySpa(id, url);
    },
    visible(id, on) {
      if (!on) {
        hidden.add(id);
        return;
      }
      hidden.delete(id);
      const r = pending.get(id);
      pending.delete(id);
      if (r && d.enabled()) d.applyScroll(id, r);
    },
    enabled() {
      for (const id of d.ids()) d.resetConflict(id);
    },
    forget(id) {
      hidden.delete(id);
      pending.delete(id);
    },
  };
}

// ---------------------------------------------------------------- frame side

export interface FrameSyncOptions {
  /** Navigate this frame (tests replace it). */
  navigate?(url: string): void;
  now?(): number;
}

export interface FrameSync {
  apply_scroll_sync(r: unknown): void;
  reset_scroll_conflict(): void;
  apply_spa_navigation(url: unknown): void;
  /** Starts listening once the channel exists. */
  start(ch: Channel<ShellApi>, signal: AbortSignal): void;
}

const scrollMax = () => {
  const el = document.scrollingElement ?? document.documentElement;
  return { x: el.scrollWidth - innerWidth, y: el.scrollHeight - innerHeight };
};

/** Same document apart from the hash (legacy skips reporting those). */
function hashOnly(a: string, b: string): boolean {
  try {
    const x = new URL(a);
    const y = new URL(b);
    x.hash = y.hash = '';
    return x.href === y.href;
  } catch {
    return false;
  }
}

export function createFrameSync(opts: FrameSyncOptions = {}): FrameSync {
  const navigate = opts.navigate ?? ((url: string) => location.assign(url));
  const now = opts.now ?? (() => performance.now());
  const detector = createConflictDetector();
  let mutedUntil = 0;
  let lastUrl = location.href;
  let suppressUntil = 0;

  return {
    apply_scroll_sync(r) {
      if (!isRatio(r)) return;
      const max = scrollMax();
      const x = fromRatio(r.x, max.x);
      const y = fromRatio(r.y, max.y);
      const t = now();
      mutedUntil = t + SCROLL_MUTE_MS;
      detector.applied(y, t);
      window.scrollTo(x, y);
    },
    reset_scroll_conflict() {
      detector.reset();
      mutedUntil = 0;
    },
    // port of applySpaNav: hash-only → set the hash; a matching same-tab link → click it (SPA
    // routers handle that); else a plain navigation
    apply_spa_navigation(url) {
      if (!isHttpUrl(url) || url === location.href) return;
      let u: URL;
      try {
        u = new URL(url);
      } catch {
        return;
      }
      if (u.origin !== location.origin) return;
      lastUrl = url;
      suppressUntil = now() + 200;
      if (u.pathname === location.pathname && u.search === location.search && u.hash) {
        location.hash = u.hash;
        return;
      }
      for (const a of document.links) {
        const t = (a.getAttribute('target') ?? '').toLowerCase();
        if (a.href === url && !a.hasAttribute('download') && (!t || t === '_self')) {
          a.click();
          return;
        }
      }
      navigate(url);
    },
    start(ch, signal) {
      // scroll: one report per frame, none while a received position is being applied
      let raf = 0;
      window.addEventListener(
        'scroll',
        () => {
          const t = now();
          if (detector.scrolled(scrollY, t)) ch.send('scroll_sync_conflict');
          if (t < mutedUntil || raf) return;
          raf = requestAnimationFrame(() => {
            raf = 0;
            const max = scrollMax();
            ch.send('scroll_sync', { x: toRatio(scrollX, max.x), y: toRatio(scrollY, max.y) });
          });
        },
        { signal, passive: true },
      );
      signal.addEventListener('abort', () => raf && cancelAnimationFrame(raf), { once: true });

      // navigation: links and forms (capture, like legacy setupNavigationGuard)
      const act = (d: NavDecision, url: string, e: Event) => {
        if (d === 'default') return;
        e.preventDefault();
        if (d === 'external-tab') ch.send('open_external', url);
        else navigate(url);
      };
      document.addEventListener(
        'click',
        (e) => {
          if (e.defaultPrevented || e.button !== 0) return;
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          const el = e.target instanceof Element ? e.target : null;
          const a = el?.closest<HTMLAnchorElement | HTMLAreaElement>('a[href], area[href]');
          if (!a || a.hasAttribute('download')) return;
          const url = a.href;
          act(
            decideNavigation({
              kind: 'link',
              url,
              target: a.getAttribute('target'),
              current: location.href,
            }),
            url,
            e,
          );
        },
        { signal, capture: true },
      );
      document.addEventListener(
        'submit',
        (e) => {
          const form = e.target;
          if (e.defaultPrevented || !(form instanceof HTMLFormElement)) return;
          const sub = (e as SubmitEvent).submitter;
          const button =
            sub instanceof HTMLButtonElement || sub instanceof HTMLInputElement ? sub : null;
          const action = (button?.hasAttribute('formaction') && button.formAction) || form.action;
          if (!isHttpUrl(action)) return;
          const method = (button?.getAttribute('formmethod') ?? form.method).toLowerCase();
          const target = button?.getAttribute('formtarget') ?? form.getAttribute('target');
          const d = decideNavigation({ kind: 'form', url: action, target, current: location.href });
          if (d !== 'external-tab') return;
          if (method === 'get') {
            const fields: [string, string][] = [];
            for (const [k, v] of new FormData(form, button)) {
              if (typeof v === 'string') fields.push([k, v]);
            }
            act(d, formGetUrl(action, fields), e);
          } else {
            form.target = '_blank'; // a POST cannot be replayed in a tab: let the browser open one
          }
        },
        { signal, capture: true },
      );

      // SPA URL changes
      const check = () => {
        const href = location.href;
        if (href === lastUrl) return;
        const prev = lastUrl;
        lastUrl = href;
        if (now() < suppressUntil || hashOnly(href, prev)) return;
        ch.send('spa_navigation', href);
      };
      const nav = (window as { navigation?: EventTarget }).navigation;
      if (nav && typeof nav.addEventListener === 'function') {
        nav.addEventListener('navigatesuccess', check, { signal });
        nav.addEventListener('navigate', () => setTimeout(check, 0), { signal });
      } else {
        const timer = setInterval(check, URL_POLL_MS);
        signal.addEventListener('abort', () => clearInterval(timer), { once: true });
      }
    },
  };
}
