/**
 * iodob ⇄ local MCP server wire protocol, version 1 (Đợt 8, inventory 10.01–10.16).
 *
 * This module is the single source of truth for the channel. It has no extension imports, so the
 * server package can copy or import it as is. The human-readable spec is docs/mcp-protocol.md.
 *
 * ## Transport
 * - The MCP server (stdio towards the agent) runs a WebSocket **server** bound to `127.0.0.1` only,
 *   port {@link MCP_PORT}, path {@link MCP_PATH}. The extension's background worker is the
 *   WebSocket **client** and only ever dials `ws://127.0.0.1:<port>/iodob` (never `localhost`).
 * - Frames are UTF-8 JSON text messages, one object per message, at most {@link MAX_FRAME_BYTES}.
 *   Anything larger, non-JSON, or not matching a frame shape below is dropped without reply.
 *
 * ## Handshake and authentication (all mandatory)
 * 1. **Origin.** Chrome sets `Origin: chrome-extension://<extension id>` on the upgrade request; a
 *    web page cannot forge it. The server MUST reject (HTTP 403, no upgrade) any Origin other than
 *    `chrome-extension://<id>`, where `<id>` comes from the copied prompt (`--extension-id`).
 *    A page opening `ws://127.0.0.1:47347/iodob` is therefore refused before any frame.
 * 2. **Token.** First frame from the extension is {@link HelloFrame} with the pairing token. The
 *    extension makes the token once (32 random bytes, base64url, see {@link TOKEN_RE}) when the user
 *    first presses Connect, and only shows it inside the copy prompt. The server compares it in
 *    constant time (e.g. `crypto.timingSafeEqual`); on mismatch, or a wrong `protocol`, it sends
 *    {@link RejectFrame} and closes. The token is never logged by either side.
 * 3. On success the server sends {@link WelcomeFrame}. The extension ignores every frame other than
 *    welcome / reject / ping before welcome, and gives up (closes, backs off) after
 *    {@link HANDSHAKE_TIMEOUT_MS}. A `call` before welcome is dropped with no reply.
 *
 * ## After welcome
 * - server → extension {@link CallFrame}; extension → server exactly one {@link ResultFrame} per
 *   call id, always (timeouts and internal failures become `ok: false`).
 * - server → extension {@link ClientFrame} when the agent (MCP client) identifies or changes.
 * - server → extension `ping` about every 20s (keeps the MV3 worker alive); extension answers `pong`.
 * - Either side may close at any time; the extension reconnects with backoff 1s → 30s while the
 *   user's Connect intent stays on. A reject stops reconnecting until the user presses Connect again.
 * - `welcome.serverVersion` below {@link MIN_MCP_SERVER_VERSION} only raises an "outdated" warning.
 *
 * ## Commands
 * {@link MCP_TYPES} lists every command; {@link validateCall} defines each payload exactly. Tab
 * commands need a numeric `tabId` from `list_tabs`, which only lists tabs where the user turned
 * iodob on; commands to any other tab fail. Element ids (`v-…`) come from command results.
 */

export const PROTOCOL = 1;
/** Fixed port (decision Q2 a). The server reports clearly when it is taken. */
export const MCP_PORT = 47347;
export const MCP_PATH = '/iodob';
export const MCP_HOST = '127.0.0.1';
export const mcpUrl = (port = MCP_PORT): string => `ws://${MCP_HOST}:${port}${MCP_PATH}`;
/** Older servers connect but show the "outdated" warning (legacy background.js:759). */
export const MIN_MCP_SERVER_VERSION = '0.5.0';
/** Frames above this are dropped (1 MB of text). */
export const MAX_FRAME_BYTES = 1024 * 1024;
export const HANDSHAKE_TIMEOUT_MS = 5000;
/** Expected server ping period; the extension does not enforce it. */
export const PING_INTERVAL_MS = 20_000;
/** 32 random bytes in unpadded base64url. */
export const TOKEN_BYTES = 32;
export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
/** A fresh pairing token: {@link TOKEN_BYTES} random bytes, unpadded base64url. */
export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
/** npm package of the server in packages/mcp-server, named in the copy prompt (Q8 b). */
export const MCP_PACKAGE = '@iodob/mcp-server';

// ---------------------------------------------------------------- frames

export interface HelloFrame {
  type: 'hello';
  protocol: number;
  token: string;
  /** Extension version (manifest). */
  extVersion: string;
}
export interface PongFrame {
  type: 'pong';
}
export type ResultFrame =
  | { type: 'result'; id: CallId; ok: true; data: unknown }
  | { type: 'result'; id: CallId; ok: false; error: string };
/** Outcome of one command: the body of a result frame. */
export type CallOutcome = { ok: true; data: unknown } | { ok: false; error: string };
export type ExtensionFrame = HelloFrame | PongFrame | ResultFrame;

export interface AgentInfo {
  name: string;
  version: string;
}
export interface WelcomeFrame {
  type: 'welcome';
  serverVersion: string;
  client: AgentInfo | null;
}
export interface RejectFrame {
  type: 'reject';
  reason: string;
}
/** Call ids are chosen by the server: a string ≤ 64 chars or a safe integer. */
export type CallId = string | number;
export interface CallFrame {
  type: 'call';
  id: CallId;
  command: string;
  payload: unknown;
}
export interface ClientFrame {
  type: 'client';
  client: AgentInfo | null;
}
export interface PingFrame {
  type: 'ping';
}
export type ServerFrame = WelcomeFrame | RejectFrame | CallFrame | ClientFrame | PingFrame;

const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const isStr = (v: unknown, max: number): v is string => typeof v === 'string' && v.length <= max;

function agent(v: unknown): AgentInfo | null | undefined {
  if (v === null) return null;
  if (!isObj(v) || !isStr(v.name, 200)) return undefined;
  return { name: v.name, version: isStr(v.version, 50) ? v.version : '' };
}

export const isCallId = (v: unknown): v is CallId =>
  (typeof v === 'string' && v.length > 0 && v.length <= 64) || Number.isSafeInteger(v);

/** Bytes of a UTF-8 string, without allocating when it is clearly small or clearly huge. */
function utf8Bytes(s: string): number {
  if (s.length * 3 <= MAX_FRAME_BYTES) return s.length; // cannot exceed the cap
  if (s.length > MAX_FRAME_BYTES) return s.length;
  return new TextEncoder().encode(s).length;
}

/** A server frame, or null for anything to drop (bad JSON, unknown type, missing fields, > 1 MB). */
export function parseFrame(text: unknown): ServerFrame | null {
  if (typeof text !== 'string' || utf8Bytes(text) > MAX_FRAME_BYTES) return null;
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isObj(v)) return null;
  switch (v.type) {
    case 'welcome': {
      const client = v.client === undefined ? null : agent(v.client);
      if (!isStr(v.serverVersion, 50) || client === undefined) return null;
      return { type: 'welcome', serverVersion: v.serverVersion, client };
    }
    case 'reject':
      return { type: 'reject', reason: isStr(v.reason, 500) ? v.reason : '' };
    case 'call':
      if (!isCallId(v.id) || !isStr(v.command, 64)) return null;
      return { type: 'call', id: v.id, command: v.command, payload: v.payload ?? {} };
    case 'client': {
      const client = agent(v.client);
      return client === undefined ? null : { type: 'client', client };
    }
    case 'ping':
      return { type: 'ping' };
    default:
      return null;
  }
}

// ---------------------------------------------------------------- versions

/** Semver core (`1.2.3`, optional `v`, pre-release / build ignored), or null. */
export function parseVersion(v: unknown): [number, number, number] | null {
  if (typeof v !== 'string') return null;
  const m = /^v?(\d{1,6})\.(\d{1,6})\.(\d{1,6})(?:[-+].*)?$/.exec(v.trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/** <0, 0, >0 like a sort comparator; null when either side is not semver ("unknown"). */
export function compareVersion(a: unknown, b: unknown): number | null {
  const x = parseVersion(a);
  const y = parseVersion(b);
  if (!x || !y) return null;
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i]! - y[i]!;
  return 0;
}

/** Server older than the minimum, or not reporting a usable version. */
export const isOutdated = (serverVersion: unknown): boolean =>
  (compareVersion(serverVersion, MIN_MCP_SERVER_VERSION) ?? -1) < 0;

// ---------------------------------------------------------------- commands

/** The 47 commands of the legacy router (inventory 10.15), in legacy order. */
export const MCP_TYPES = [
  'list_tabs',
  'focus_tab',
  'get_page_info',
  'get_selected_element',
  'get_element_details',
  'get_elements_details',
  'get_element_outline',
  'query_selector',
  'get_element_matched_rules',
  'get_breakpoints',
  'get_seo_issues',
  'get_meta_tags',
  'get_page_weight',
  'get_css_custom_properties',
  'get_typography',
  'calculate_specificity',
  'get_colors',
  'get_assets',
  'get_layout',
  'force_element_state',
  'detect_technologies',
  'get_a11y_issues',
  'get_tailwind',
  'fetch_stylesheet',
  'enter_responsive_mode',
  'exit_responsive_mode',
  'set_viewport',
  'get_viewport',
  'set_viewports',
  'add_viewport',
  'remove_viewport',
  'set_zoom',
  'set_breakpoints_mode',
  'get_my_edits',
  'set_text_content',
  'set_inner_html',
  'insert_html',
  'select_element',
  'get_screenshot',
  'apply_styles',
  'add_rule',
  'set_rule_selector',
  'revert_css_change',
  'revert_all_edits',
  'set_element_classes',
  'delete_element',
  'duplicate_element',
] as const;
export type McpType = (typeof MCP_TYPES)[number];
export const isMcpType = (v: unknown): v is McpType =>
  typeof v === 'string' && (MCP_TYPES as readonly string[]).includes(v);

/** Commands answered by the background itself; every other command runs in a tab. */
export const BACKGROUND_TYPES = ['list_tabs', 'focus_tab', 'fetch_stylesheet'] as const;
/** Slow commands: 40s instead of 12s (legacy B, background.js:4022). */
export const SLOW_TYPES: readonly McpType[] = [
  'get_screenshot',
  'enter_responsive_mode',
  'exit_responsive_mode',
  'set_viewport',
];
export const SLOW_TIMEOUT_MS = 40_000;
export const CALL_TIMEOUT_MS = 12_000;

export const ERR = {
  unknown: 'Unknown action. Update the iodob extension to the latest version.',
  pageInactive: 'iodob is not active on this page.',
  tabInactive: 'iodob is not active on this tab.',
  tabInactiveHint:
    'iodob is not active on this tab. Ask the user to click the iodob toolbar icon on that tab.',
  stylesheetBlocked:
    'fetch_stylesheet rejected: URL must be http(s) and not a private/localhost host.',
  notResponsive: 'Not in responsive mode. Call enter_responsive_mode first.',
  noBreakpoints: 'This page reports no usable breakpoints.',
  breakpointsMode:
    "Breakpoints mode shows the page's own breakpoints; turn it off to change the viewport set.",
  disconnected: 'The extension disconnected before the command finished.',
} as const;
export const timeoutError = (t: string): string =>
  `${t} timed out inside the extension. The page may be busy or mid-reload; try again.`;
export const tabIdError = (t: string): string => `${t} requires a numeric tabId.`;

/** Limits enforced by {@link validateCall}. */
export const LIMITS = {
  selector: 1000,
  html: 200 * 1024,
  text: 200 * 1024,
  classes: 10_000,
  name: 60,
  url: 2048,
  /** apply_styles / add_rule: properties per call. */
  styles: 200,
  styleValue: 4000,
  wrappers: 10,
  elementIds: 50,
  viewports: 20,
  limitMin: 1,
  limitMax: 200,
  limitDefault: 50,
  outlineDepth: 10,
  outlineChildren: 100,
} as const;

export const INSERT_POSITIONS = ['before', 'after', 'prepend', 'append'] as const;
export type McpInsertPosition = (typeof INSERT_POSITIONS)[number];
/** Same list as lib/css/states FORCEABLE_STATES (kept literal so this module stands alone). */
export const MCP_STATES = [
  ':hover',
  ':focus',
  ':focus-visible',
  ':focus-within',
  ':active',
  ':visited',
] as const;

/** Rule address returned as `ruleRef` by get_element_matched_rules; pass it back unchanged. */
export interface RuleRef {
  stylesheet: string;
  selector: string;
  wrappers: string[];
  occ: number;
  scopeAddress: string | null;
}
export type Styles = Record<string, string>;
export interface ViewportSize {
  width: number;
  height: number;
  name?: string;
}

interface Tab {
  tabId: number;
}
interface El extends Tab {
  elementId: string;
}
interface InFrame {
  /** Responsive mode: run in this viewport's frame instead of the selected one. */
  viewportId?: number;
}

/** Validated payload of every command (what the extension acts on). */
export interface McpPayloads {
  list_tabs: Record<string, never>;
  focus_tab: Tab;
  get_page_info: Tab;
  get_selected_element: Tab & InFrame;
  get_element_details: El & InFrame;
  get_elements_details: Tab & InFrame & { elementIds: string[] };
  get_element_outline: Tab &
    InFrame & { elementId?: string; maxDepth?: number; maxChildren?: number };
  query_selector: Tab & InFrame & { selector: string; limit: number; rootId?: string };
  get_element_matched_rules: El & InFrame;
  get_breakpoints: Tab;
  get_seo_issues: Tab;
  get_meta_tags: Tab;
  get_page_weight: Tab;
  get_css_custom_properties: Tab;
  get_typography: El & InFrame;
  calculate_specificity: Tab & { selector: string };
  get_colors: El & InFrame;
  get_assets: El & InFrame;
  get_layout: El & InFrame;
  force_element_state: El & InFrame & { state: string | null };
  detect_technologies: Tab;
  get_a11y_issues: Tab & { limit: number };
  get_tailwind: El & InFrame;
  fetch_stylesheet: { url: string };
  enter_responsive_mode: Tab;
  exit_responsive_mode: Tab;
  set_viewport: Tab & { width: number; height: number; viewportId?: number };
  get_viewport: Tab;
  set_viewports: Tab & { viewports: ViewportSize[] };
  add_viewport: Tab & { width?: number; height?: number; name?: string };
  remove_viewport: Tab & { viewportId: number };
  set_zoom: Tab & { zoom: number };
  set_breakpoints_mode: Tab & { enabled: boolean };
  get_my_edits: Tab;
  set_text_content: El & InFrame & { text: string };
  set_inner_html: El & InFrame & { html: string };
  insert_html: El & InFrame & { html: string; position: McpInsertPosition };
  select_element: El & InFrame;
  get_screenshot: Tab;
  apply_styles: Tab &
    InFrame & {
      elementId?: string;
      ruleRef?: RuleRef;
      styles: Styles;
      state?: string;
      media?: string;
      pseudo?: string;
    };
  add_rule: Tab &
    InFrame & { selector: string; wrappers: string[]; styles: Styles | null; elementId?: string };
  set_rule_selector: Tab & InFrame & { ruleRef: RuleRef; selector: string };
  revert_css_change: Tab & { changeId: string };
  revert_all_edits: Tab;
  set_element_classes: El & InFrame & { classes: string };
  delete_element: El & InFrame;
  duplicate_element: El & InFrame;
}
/** Commands that run in a tab (all but the background ones). */
export type McpPageType = Exclude<McpType, (typeof BACKGROUND_TYPES)[number]>;
/** What a command returns; per-command shapes are documented in docs/mcp-protocol.md. */
export type McpResult = Record<string, unknown>;

export type Validated<K extends McpType = McpType> =
  { ok: true; payload: McpPayloads[K] } | { ok: false; error: string };

// ---------------------------------------------------------------- validators

const ELEMENT_ID_RE = /^v-[a-z0-9]{1,16}$/;
export const isElementId = (v: unknown): v is string =>
  typeof v === 'string' && ELEMENT_ID_RE.test(v);

class Invalid extends Error {}
const bad = (msg: string): never => {
  throw new Invalid(msg);
};

/** Field readers: each returns the clean value or throws a message the agent can act on. */
function reader(t: string, p: Record<string, unknown>) {
  const has = (k: string) => p[k] !== undefined && p[k] !== null;
  const r = {
    str(k: string, max: number, opts: { empty?: boolean } = {}): string {
      const v = p[k];
      if (typeof v !== 'string') return bad(`${t} requires a string ${k}.`);
      if (!opts.empty && !v.trim()) return bad(`${t} requires a non-empty ${k}.`);
      if (v.length > max) return bad(`${k} is too long (max ${max} characters).`);
      return v;
    },
    optStr: (k: string, max: number) => (has(k) ? r.str(k, max, { empty: true }) : undefined),
    num(k: string): number {
      const v = p[k];
      if (typeof v !== 'number' || !Number.isFinite(v)) return bad(`${t} requires a numeric ${k}.`);
      return v;
    },
    optNum: (k: string) => (has(k) ? r.num(k) : undefined),
    int(k: string): number {
      const v = r.num(k);
      if (!Number.isSafeInteger(v)) return bad(`${t} requires an integer ${k}.`);
      return v;
    },
    optInt: (k: string) => (has(k) ? r.int(k) : undefined),
    bool(k: string): boolean {
      if (typeof p[k] !== 'boolean') return bad(`${t} requires a boolean ${k}.`);
      return p[k] as boolean;
    },
    el(k = 'elementId'): string {
      if (!isElementId(p[k])) return bad(`${t} requires ${k} like "v-abc123" (from a result).`);
      return p[k] as string;
    },
    optEl: (k = 'elementId') => (has(k) ? r.el(k) : undefined),
    /** `limit`: clamped, not rejected (legacy behaviour). */
    limit(): number {
      const v = Number(p.limit);
      if (!has('limit') || !Number.isFinite(v)) return LIMITS.limitDefault;
      return Math.max(LIMITS.limitMin, Math.min(LIMITS.limitMax, Math.floor(v)));
    },
    styles(k: string): Styles {
      const v = p[k];
      if (!isObj(v)) return bad(`${t} requires ${k} as an object of CSS property → value.`);
      const entries = Object.entries(v);
      if (entries.length > LIMITS.styles) return bad(`Too many properties in ${k}.`);
      const out: Styles = {};
      for (const [prop, val] of entries) {
        if (!/^(--[\w-]+|-?[a-zA-Z][a-zA-Z-]*)$/.test(prop) || prop.length > 100)
          return bad(`Invalid CSS property name: ${prop.slice(0, 100)}`);
        if (typeof val !== 'string' && typeof val !== 'number')
          return bad(`Value of ${prop} must be a string.`);
        const s = String(val);
        if (s.length > LIMITS.styleValue) return bad(`Value of ${prop} is too long.`);
        out[prop] = s;
      }
      return out;
    },
    ruleRef(k = 'ruleRef'): RuleRef {
      const v = p[k];
      const ok =
        isObj(v) &&
        isStr(v.stylesheet, LIMITS.url) &&
        isStr(v.selector, LIMITS.selector) &&
        Array.isArray(v.wrappers) &&
        v.wrappers.length <= LIMITS.wrappers &&
        v.wrappers.every((w) => isStr(w, LIMITS.selector)) &&
        Number.isSafeInteger(v.occ) &&
        (v.occ as number) >= 0 &&
        (v.scopeAddress === null || isStr(v.scopeAddress, 4 * LIMITS.selector));
      if (!ok) return bad(`${t} requires ${k} exactly as returned by get_element_matched_rules.`);
      const o = v as unknown as RuleRef;
      return {
        stylesheet: o.stylesheet,
        selector: o.selector,
        wrappers: [...o.wrappers],
        occ: o.occ,
        scopeAddress: o.scopeAddress,
      };
    },
  };
  return r;
}

type Reader = ReturnType<typeof reader>;
const tab = (r: Reader) => ({ tabId: r.int('tabId') });
const frame = (r: Reader) => {
  const viewportId = r.optInt('viewportId');
  return viewportId === undefined ? {} : { viewportId };
};
const el = (r: Reader) => ({ ...tab(r), elementId: r.el(), ...frame(r) });
const defined = <T extends object>(o: T): T =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

const RULES: { [K in McpType]: (r: Reader, p: Record<string, unknown>, t: K) => McpPayloads[K] } = {
  list_tabs: () => ({}),
  focus_tab: tab,
  get_page_info: tab,
  get_selected_element: (r) => ({ ...tab(r), ...frame(r) }),
  get_element_details: el,
  get_elements_details(r, p, t) {
    const ids = p.elementIds;
    if (!Array.isArray(ids) || !ids.length) return bad(`${t} requires a non-empty elementIds.`);
    if (ids.length > LIMITS.elementIds) return bad(`${t} takes at most ${LIMITS.elementIds} ids.`);
    if (!ids.every(isElementId)) return bad(`${t} requires elementIds like "v-abc123".`);
    return { ...tab(r), ...frame(r), elementIds: ids };
  },
  get_element_outline(r) {
    const clamp = (v: number | undefined, max: number) =>
      v === undefined ? undefined : Math.max(1, Math.min(max, v));
    return defined({
      ...tab(r),
      ...frame(r),
      elementId: r.optEl(),
      maxDepth: clamp(r.optInt('maxDepth'), LIMITS.outlineDepth),
      maxChildren: clamp(r.optInt('maxChildren'), LIMITS.outlineChildren),
    });
  },
  query_selector: (r) =>
    defined({
      ...tab(r),
      ...frame(r),
      selector: r.str('selector', LIMITS.selector),
      limit: r.limit(),
      rootId: r.optEl('rootId'),
    }),
  get_element_matched_rules: el,
  get_breakpoints: tab,
  get_seo_issues: tab,
  get_meta_tags: tab,
  get_page_weight: tab,
  get_css_custom_properties: tab,
  get_typography: el,
  calculate_specificity: (r) => ({ ...tab(r), selector: r.str('selector', LIMITS.selector) }),
  get_colors: el,
  get_assets: el,
  get_layout: el,
  force_element_state(r, p, t) {
    const state = p.state ?? null;
    if (state !== null && !(MCP_STATES as readonly unknown[]).includes(state))
      return bad(`${t} state must be one of ${MCP_STATES.join(', ')} or null.`);
    return { ...el(r), state: state as string | null };
  },
  detect_technologies: tab,
  get_a11y_issues: (r) => ({ ...tab(r), limit: r.limit() }),
  get_tailwind: el,
  fetch_stylesheet: (r) => ({ url: r.str('url', LIMITS.url) }),
  enter_responsive_mode: tab,
  exit_responsive_mode: tab,
  set_viewport(r, _p, t) {
    const width = r.num('width');
    const height = r.num('height');
    if (width <= 0 || height <= 0) return bad(`${t} requires positive numeric width and height.`);
    return defined({ ...tab(r), width, height, viewportId: r.optInt('viewportId') });
  },
  get_viewport: tab,
  set_viewports(r, p, t) {
    const list = p.viewports;
    const msg = `${t} requires a non-empty array of { width, height }.`;
    if (!Array.isArray(list) || !list.length || list.length > LIMITS.viewports) return bad(msg);
    const viewports = list.map((v: unknown): ViewportSize => {
      if (!isObj(v)) return bad(msg);
      const w = v.width;
      const h = v.height;
      if (typeof w !== 'number' || typeof h !== 'number' || !(w > 0) || !(h > 0)) return bad(msg);
      if (!Number.isFinite(w) || !Number.isFinite(h)) return bad(msg);
      const name = v.name;
      if (name !== undefined && name !== null && !isStr(name, LIMITS.name)) return bad(msg);
      return typeof name === 'string' ? { width: w, height: h, name } : { width: w, height: h };
    });
    return { ...tab(r), viewports };
  },
  add_viewport(r, _p, t) {
    const width = r.optNum('width');
    const height = r.optNum('height');
    if ((width !== undefined && width <= 0) || (height !== undefined && height <= 0))
      return bad(`${t} requires positive width and height.`);
    return defined({ ...tab(r), width, height, name: r.optStr('name', LIMITS.name) });
  },
  remove_viewport: (r) => ({ ...tab(r), viewportId: r.int('viewportId') }),
  set_zoom: (r) => ({ ...tab(r), zoom: r.num('zoom') }),
  set_breakpoints_mode: (r) => ({ ...tab(r), enabled: r.bool('enabled') }),
  get_my_edits: tab,
  set_text_content: (r) => ({ ...el(r), text: r.str('text', LIMITS.text, { empty: true }) }),
  set_inner_html: (r) => ({ ...el(r), html: r.str('html', LIMITS.html, { empty: true }) }),
  insert_html(r, p) {
    if (!(INSERT_POSITIONS as readonly unknown[]).includes(p.position))
      return bad(
        `Bad position: ${String(p.position)}. Use before/after/prepend/append.`.slice(0, 200),
      );
    return {
      ...el(r),
      html: r.str('html', LIMITS.html),
      position: p.position as McpInsertPosition,
    };
  },
  select_element: el,
  get_screenshot: tab,
  apply_styles(r, p, t) {
    const ruleRef = p.ruleRef === undefined || p.ruleRef === null ? undefined : r.ruleRef();
    const elementId = r.optEl();
    if (!ruleRef && !elementId) return bad(`${t} requires elementId or ruleRef.`);
    return defined({
      ...tab(r),
      ...frame(r),
      elementId,
      ruleRef,
      styles: r.styles('styles'),
      state: r.optStr('state', 100),
      media: r.optStr('media', LIMITS.selector),
      pseudo: r.optStr('pseudo', 100),
    });
  },
  add_rule(r, p, t) {
    const w = p.wrappers ?? [];
    if (
      !Array.isArray(w) ||
      w.length > LIMITS.wrappers ||
      !w.every((x) => isStr(x, LIMITS.selector))
    )
      return bad(`${t} wrappers must be an array of at-rule preludes.`);
    return defined({
      ...tab(r),
      ...frame(r),
      selector: r.str('selector', LIMITS.selector),
      wrappers: w as string[],
      styles: p.styles === undefined || p.styles === null ? null : r.styles('styles'),
      elementId: r.optEl(),
    });
  },
  set_rule_selector: (r) => ({
    ...tab(r),
    ...frame(r),
    ruleRef: r.ruleRef(),
    selector: r.str('selector', LIMITS.selector),
  }),
  revert_css_change: (r) => ({ ...tab(r), changeId: r.str('changeId', 200) }),
  revert_all_edits: tab,
  set_element_classes: (r) => ({
    ...el(r),
    classes: r.str('classes', LIMITS.classes, { empty: true }),
  }),
  delete_element: el,
  duplicate_element: el,
};

/**
 * Check one call: known command, object payload, every field typed and bounded. Unknown fields are
 * dropped. A missing / non-numeric tabId gives the legacy message "`<type>` requires a numeric tabId.".
 */
export function validateCall<K extends McpType>(type: K, payload: unknown): Validated<K>;
export function validateCall(type: string, payload: unknown): Validated;
export function validateCall(type: string, payload: unknown): Validated {
  if (!isMcpType(type)) return { ok: false, error: ERR.unknown };
  const p = payload === undefined || payload === null ? {} : payload;
  if (!isObj(p)) return { ok: false, error: `${type} requires an object payload.` };
  if (type !== 'list_tabs' && type !== 'fetch_stylesheet' && typeof p.tabId !== 'number')
    return { ok: false, error: tabIdError(type) };
  try {
    const rule = RULES[type] as (r: Reader, p: Record<string, unknown>, t: string) => unknown;
    return { ok: true, payload: rule(reader(type, p), p, type) as McpPayloads[McpType] };
  } catch (e) {
    if (e instanceof Invalid) return { ok: false, error: e.message };
    throw e;
  }
}

/** The text the user pastes into the agent: package, token and extension id (decision Q3 a). */
export function connectPrompt(token: string, extensionId: string, port = MCP_PORT): string {
  return (
    `Add the iodob MCP server to this agent. Command: npx -y ${MCP_PACKAGE} ` +
    `--extension-id ${extensionId}${port === MCP_PORT ? '' : ` --port ${port}`} ` +
    `with environment variable IODOB_MCP_TOKEN=${token} (stdio transport, requires Node 18 or newer). ` +
    'After adding it, call its ping tool to verify the connection.'
  );
}
