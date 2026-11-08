import { storage } from './storage';
import type { ColorFormat } from '../style/color';
import { defaultViewports, type ResponsiveSettings } from '../responsive/viewports';
import { ZOOM_DEFAULT } from '../responsive/zoom';
import { generateToken, TOKEN_RE } from '../mcp/protocol';

export interface LayoutGrid {
  isOn: boolean;
  columns: number;
  maxWidth: 'auto' | number;
  gutter: number;
  margin: number;
  color: string;
  opacity: number;
}
export interface Settings {
  inspectIsOn: boolean;
  xrayModeIsOn: boolean;
  rulerIsOn: boolean;
  breakpointsIsOn: boolean;
  /** updateSettings merges shallowly: always write the whole object. */
  layoutGrid: LayoutGrid;
  /** Responsive shell (8.16); validated on read (normalizeSaved, clampZoom). */
  responsiveMode: ResponsiveSettings;
}
/** Legacy defaults (legacy-src/content.js:26936). */
export const DEFAULT_SETTINGS: Settings = {
  inspectIsOn: false,
  xrayModeIsOn: false,
  rulerIsOn: false,
  breakpointsIsOn: false,
  layoutGrid: {
    isOn: false,
    columns: 8,
    maxWidth: 'auto',
    gutter: 20,
    margin: 40,
    color: '#FC48FF',
    opacity: 0.3,
  },
  responsiveMode: {
    viewports: defaultViewports(),
    zoom: ZOOM_DEFAULT,
    framesWrap: false,
    syncScrollEnabled: true,
  },
};

const settingsItem = storage.defineItem<Partial<Settings>>('local:settings', { fallback: {} });

export async function getSettings(): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await settingsItem.getValue()) };
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  await settingsItem.setValue({ ...(await settingsItem.getValue()), ...patch });
}

export const themePref = storage.defineItem<'system' | 'light' | 'dark'>('local:theme', {
  fallback: 'system',
});
export const pinHintDone = storage.defineItem<boolean>('local:inspectorPinHintDone', {
  fallback: false,
});
export const measureColor = storage.defineItem<string>('local:bdMeasureColor', {
  fallback: '#FF3B6B',
});
export const measureGuides = storage.defineItem<boolean>('local:bdMeasureGuides', {
  fallback: false,
});

/** Legacy sidePanelPreferences.sectionVisibility keys, in legacy order (sidepanel.js:12734). */
export const SECTION_IDS = [
  'layout',
  'flexbox',
  'textContent',
  'css',
  'assets',
  'boxShadow',
  'gradients',
  'animations',
  'transitions',
  'colors',
  'typography',
  'issues',
  'metaTags',
  'technologies',
  'pageWeight',
  'socialPreview',
  'seoIssues',
  'cssRules',
] as const;
export type SectionId = (typeof SECTION_IDS)[number];
export interface SidePanelPrefs {
  sectionVisibility: Record<SectionId, { collapsed: boolean }>;
  colorFormat: ColorFormat;
  codeViewMode: 'css' | 'source' | 'tailwind';
  socialPreviewType: 'facebook' | 'x' | 'linkedin';
}
export const DEFAULT_PANEL_PREFS: SidePanelPrefs = {
  sectionVisibility: Object.fromEntries(
    // all closed until opened: each open/closed choice is then remembered
    SECTION_IDS.map((id) => [id, { collapsed: true }]),
  ) as SidePanelPrefs['sectionVisibility'],
  colorFormat: 'HEX',
  codeViewMode: 'css',
  socialPreviewType: 'facebook',
};

export const panelPrefsItem = storage.defineItem<Partial<SidePanelPrefs>>(
  'local:sidePanelPreferences',
  { fallback: {} },
);

/** Port of legacy vi (sidepanel.js:12826): stored values win, missing sections get defaults. */
export function mergePanelPrefs(p: Partial<SidePanelPrefs> | null | undefined): SidePanelPrefs {
  const sv: Partial<SidePanelPrefs['sectionVisibility']> = p?.sectionVisibility ?? {};
  return {
    ...DEFAULT_PANEL_PREFS,
    ...p,
    sectionVisibility: Object.fromEntries(
      [...new Set([...SECTION_IDS, ...Object.keys(sv)])].map((id) => [
        id,
        { ...DEFAULT_PANEL_PREFS.sectionVisibility[id as SectionId], ...sv[id as SectionId] },
      ]),
    ) as SidePanelPrefs['sectionVisibility'],
  };
}

export async function getPanelPrefs(): Promise<SidePanelPrefs> {
  return mergePanelPrefs(await panelPrefsItem.getValue());
}

export async function updatePanelPrefs(patch: Partial<SidePanelPrefs>): Promise<void> {
  await panelPrefsItem.setValue({ ...(await panelPrefsItem.getValue()), ...patch });
}

/** MCP opt-in (9.34): nothing connects until the user presses Connect. */
export const mcpIntent = storage.defineItem<boolean>('local:mcpIntent', { fallback: false });
/** Pairing token for the local MCP server (see lib/mcp/protocol.ts); never logged or sent to pages. */
export const mcpToken = storage.defineItem<string | null>('local:mcpToken', { fallback: null });

/** The stored token, made on first use. */
export async function ensureToken(): Promise<string> {
  const saved = await mcpToken.getValue();
  if (saved && TOKEN_RE.test(saved)) return saved;
  const token = generateToken();
  await mcpToken.setValue(token);
  return token;
}
