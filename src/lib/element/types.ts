/**
 * Data the content script sends to the side panel for the selected element. Field names follow
 * legacy `inspectDetails` (content.js:40487) so MCP (phase 8) can reuse them. Everything is plain
 * JSON: elements travel as `id` (data-sr-id-*), never as references.
 */

export type Severity = 'error' | 'warning' | 'info';

/** Port of the legacy issue object (content.js:41119). */
export interface Issue {
  id: string;
  type: string;
  category: string;
  severity: Severity;
  selector?: string;
  groupingKey: string;
  message: string;
  recommendation?: string;
  offScreen?: boolean;
  metadata?: Record<string, string | number | boolean | null>;
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
  margin: Sides;
  border: Sides;
  padding: Sides;
  position?: Partial<Sides>;
}

export interface ColorUse {
  color: string;
  properties: string[];
  count?: number;
}

export interface Asset {
  type: string;
  url: string;
  name?: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface Motion {
  name: string;
  property?: string;
  duration: string;
  delay?: string;
  timingFunction: string;
  iterationCount?: string;
  direction?: string;
  fillMode?: string;
}

export type CssMap = Record<string, string | undefined>;

export interface ElementDetails {
  id: string;
  name: string;
  parentName?: string;
  parentSelectable: boolean;
  childName?: string;
  type?: string;
  selector: string;
  boxModel: BoxModel;
  colors: ColorUse[];
  gradients: string[];
  textContent?: string;
  assets: Asset[];
  animations: Motion[];
  transitions: Motion[];
  boxShadow: string[];
  typography: Record<string, string>[];
  issues: Issue[];
  canvas?: { width: number; height: number; colors?: string[]; fps?: number } | null;
  layout: Record<string, string> | null;
  css: CssMap;
  before?: CssMap;
  after?: CssMap;
  tailwind?: string;
  matchedRules?: MatchedRule[];
  skippedCrossOriginCount: number;
}
