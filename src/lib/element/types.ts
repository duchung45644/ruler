import type { RulePayload } from '../edit/types';
/**
 * Data the content script sends to the side panel for the selected element. Field names follow
 * legacy `inspectDetails` (content.js:40487) so MCP (phase 8) can reuse them. Everything is plain
 * JSON: elements travel as `id` (data-sr-id-*), never as references.
 */

export type Severity = 'warning' | 'info';

/**
 * Contrast issue, one per legacy groupingKey (`type_selector_severity_ratio`, content.js:41020):
 * every element with the same verdict is an instance in `elementIds`. Messages are localised on
 * the page, like legacy.
 */
export interface Issue {
  id: string;
  type: 'contrast-failure' | 'icon-contrast';
  category: 'accessibility';
  severity: Severity;
  selector: string;
  message: string;
  recommendation: string;
  elementIds: string[];
  metadata: {
    /** HEX, upper-case. */
    color: string;
    backgroundColor: string;
    contrastRatio: number;
    requiredRatio: number;
    fontSize?: number;
    fontWeight?: number;
    isLargeText?: boolean;
  };
}

export interface MatchedRule {
  selector: string;
  /** `@media …` / `@supports …` / `@layer …`, outermost first. */
  wrappers: string[];
  mediaActive: boolean;
  specificity: [number, number, number];
  sourceIndex: number;
  score: number;
  /** Stylesheet href, `<style>` or `inline`. */
  source: string;
  declarations: { property: string; value: string; important: boolean }[];
}

export type Sides = { top: number; right: number; bottom: number; left: number };
export interface BoxModel {
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
  margin: Sides;
  border: Sides;
  padding: Sides;
}

/** Colours as upper-case HEX (alpha appended below 1), deduplicated, in order met. */
export interface ElementColors {
  text: string[];
  backgrounds: string[];
  borders: string[];
}

export interface GradientStop {
  color: string;
  position: number | null;
  unit: string;
}
export interface Gradient {
  type: string;
  /** Degrees; linear defaults to 180, conic only when `from Ndeg`. */
  angle: number | null;
  shape: string | null;
  stops: GradientStop[];
  raw: string;
}

export interface Shadow {
  inset: boolean;
  x: string;
  y: string;
  blur: string;
  spread: string;
  color: string;
  raw: string;
}

export type Keyframe = { offset: number } & Record<string, string | number>;
export interface Animation {
  name: string;
  duration: string;
  timingFunction: string;
  delay: string;
  iterationCount: string;
  keyframes: Keyframe[];
}
export interface Transition {
  property: string;
  duration: string;
  timingFunction: string;
  delay: string;
}

export interface TypographyStyle {
  /** The face the browser actually renders, else the first family of the stack. */
  fontFamily: string;
  fontStack: string;
  fontSize: string;
  fontWeight: string;
  letterSpacing: string | null;
  textTransform: string | null;
  /** `family|size|weight|letterSpacing|textTransform`; highlight_elements_for_typography key. */
  typographyKey: string;
  usage: number;
  /** PNG of a pangram drawn in the page's own font (legacy vectorSample); absent if no canvas. */
  sample?: { dataUrl: string; height: number };
}

export interface FlexInfo {
  display: string;
  flexDirection: string;
  flexWrap: string;
  justifyContent: string;
  alignItems: string;
  alignContent: string;
  gap: string;
}
export interface GridInfo {
  display: string;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  justifyItems: string;
  alignItems: string;
  justifyContent: string;
  alignContent: string;
  gap: string;
  columnCount: number;
  rowCount: number;
}

export interface CanvasInfo {
  /** Unknown (null): reading it safely is impossible, see canvasInfo. */
  contextType: string | null;
  width: number;
  height: number;
  pixelRatio: number;
}

interface Rendered {
  renderedWidth: number;
  renderedHeight: number;
}
export type Asset = Rendered &
  (
    | { type: 'src' | 'background-image'; url: string }
    | { type: 'svg'; content: string }
    | { type: 'data-image'; dataUrl: string; fileExtension: string }
  );

export type ElementType =
  'image' | 'video' | 'audio' | 'link' | 'button' | 'input' | 'svg' | 'list' | 'text' | 'box';

export type CssMap = Record<string, string>;

export interface ElementDetails {
  id: string;
  /** `tag#id.class` of the element, its parent and the child select_child would pick. */
  name: string;
  parentName?: string;
  /** false when the parent is body / html (select_parent stops there). */
  parentSelectable: boolean;
  childName?: string;
  type: ElementType;
  /** Full unique path (shadow hosts joined with ` >>> `). */
  selector: string;
  boxModel: BoxModel;
  colors: ElementColors;
  gradients: Gradient[];
  textContent?: string;
  assets: Asset[];
  animations: Animation[];
  transitions: Transition[];
  boxShadow: Shadow[];
  typography: TypographyStyle[];
  issues: Issue[];
  canvas: CanvasInfo | null;
  layout: FlexInfo | GridInfo | null;
  /** Computed CSS, legacy property list, defaults dropped. */
  css: CssMap;
  /** Pseudo-element props that differ from the element; only when it has `content`. */
  before?: CssMap;
  after?: CssMap;
  /** Tailwind v4 classes for `css` (legacy sidepanel.js:15763). */
  tailwind: string;
  matchedRules?: MatchedRule[];
  skippedCrossOriginCount: number;
  /** Present in edit mode (6.49). */
  edit?: { payload: RulePayload; editCount: number; classes: string };
}
