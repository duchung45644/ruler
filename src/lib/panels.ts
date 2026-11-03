export type Bounds = { width: number; height: number; left?: number; top?: number };

export const DETACH_W = 400;
export const DETACH_H = 800;

/** Per-tab panel page (legacy me, background.js:4699); the detached window adds `&detached=1`. */
export const panelPath = (tabId: number, detached = false): string =>
  `sidepanel.html?tabId=${tabId}${detached ? '&detached=1' : ''}`;

/** Port of be (background.js:4707): saved size, else the size the panel had, else 400×800. */
export function detachBounds(
  saved: Partial<Bounds> | null,
  sent: { width?: number; height?: number } | null,
): Bounds {
  const pick = (s: number | undefined, n: number | undefined, d: number) =>
    s !== undefined && s > 0 ? s : n !== undefined && n > 0 ? Math.round(n) : d;
  const b: Bounds = {
    width: pick(saved?.width, sent?.width, DETACH_W),
    height: pick(saved?.height, sent?.height, DETACH_H),
  };
  if (Number.isFinite(saved?.left) && Number.isFinite(saved?.top)) {
    b.left = saved!.left;
    b.top = saved!.top;
  }
  return b;
}

export const HANDOFF_TTL = 30000;

/** State a panel leaves in `panelHandoff:<tabId>` when it detaches / docks (7.11). */
export interface Handoff {
  selectedTab: 'element' | 'page';
  scrollTop: number;
  at: number;
  /** Phase 5 (editor tabs). */
  selectedEditTab?: string;
}

export const readHandoff = (h: Handoff | undefined | null, now: number): Handoff | null =>
  h && now - h.at <= HANDOFF_TTL ? h : null;
