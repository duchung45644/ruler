/**
 * MCP tool definitions: one tool per protocol command. The JSON Schemas describe what
 * `validateCall` (protocol.gen.ts, copied from the extension) accepts; the server still runs
 * `validateCall` before sending, so the validator stays the authority.
 */
import { INSERT_POSITIONS, LIMITS, MCP_STATES, MCP_TYPES, type McpType } from './protocol.gen.ts';

type Schema = Record<string, unknown>;
export interface ToolDef {
  name: string;
  description: string;
  inputSchema: { type: 'object'; properties: Record<string, Schema>; required?: string[] };
}

const int = (description: string): Schema => ({ type: 'integer', description });
const str = (maxLength: number, description: string, minLength = 0): Schema => ({
  type: 'string',
  maxLength,
  ...(minLength ? { minLength } : {}),
  description,
});
const ELEMENT_ID_PATTERN = '^v-[a-z0-9]{1,16}$';
const elementIdS = (description = 'Element id like "v-abc123", from a previous result.') => ({
  type: 'string',
  pattern: ELEMENT_ID_PATTERN,
  description,
});
const tabId = int('Tab id from list_tabs (only tabs where PixelLens is on).');
const viewportId = int(
  'Responsive mode: run in this viewport frame instead of the one holding the selection.',
);
const limit: Schema = {
  type: 'integer',
  minimum: LIMITS.limitMin,
  maximum: LIMITS.limitMax,
  default: LIMITS.limitDefault,
  description: `Max results (clamped ${LIMITS.limitMin}-${LIMITS.limitMax}).`,
};
const styles: Schema = {
  type: 'object',
  maxProperties: LIMITS.styles,
  additionalProperties: { type: ['string', 'number'], maxLength: LIMITS.styleValue },
  description: 'CSS property → value, e.g. {"color": "red", "--gap": "8px"}.',
};
const ruleRef: Schema = {
  type: 'object',
  description: 'ruleRef exactly as returned by get_element_matched_rules; pass it back unchanged.',
  properties: {
    stylesheet: { type: 'string', maxLength: LIMITS.url },
    selector: { type: 'string', maxLength: LIMITS.selector },
    wrappers: {
      type: 'array',
      maxItems: LIMITS.wrappers,
      items: { type: 'string', maxLength: LIMITS.selector },
    },
    occ: { type: 'integer', minimum: 0 },
    scopeAddress: { type: ['string', 'null'], maxLength: 4 * LIMITS.selector },
  },
  required: ['stylesheet', 'selector', 'wrappers', 'occ', 'scopeAddress'],
};
const selector = str(LIMITS.selector, 'CSS selector.', 1);
const wrappers: Schema = {
  type: 'array',
  maxItems: LIMITS.wrappers,
  items: { type: 'string', maxLength: LIMITS.selector },
  description: 'At-rule preludes, outermost first, e.g. ["@media (min-width: 768px)"].',
};

/** [description, extra properties, extra required] per command; tabId is added below. */
type Spec = [string, Record<string, Schema>?, string[]?];
const EL: Spec[1] = { elementId: elementIdS(), viewportId };
const SPECS: Record<McpType, Spec> = {
  list_tabs: [
    'List tabs: {tabs: [{tabId, title, url, active, enabled}], canEnable}. Normally only tabs where the user turned PixelLens on; ' +
      'with canEnable true every web-page tab is listed and you can turn PixelLens on yourself (enable_tab, or any command does it).',
  ],
  focus_tab: ['Bring a PixelLens tab to the front.'],
  get_page_info: [
    'Page summary: url, title, lang, meta, h1, viewport, page size, scroll, devicePixelRatio.',
  ],
  get_selected_element: [
    "Summary of the element the user selected in PixelLens's inspector.",
    { viewportId },
  ],
  get_element_details: ['Full details of one element.', EL, ['elementId']],
  get_elements_details: [
    'Details of several elements: {results, notFound}.',
    {
      elementIds: {
        type: 'array',
        minItems: 1,
        maxItems: LIMITS.elementIds,
        items: { type: 'string', pattern: ELEMENT_ID_PATTERN },
      },
      viewportId,
    },
    ['elementIds'],
  ],
  get_element_outline: [
    'DOM outline below an element (default: body).',
    {
      elementId: elementIdS('Root element id (optional).'),
      maxDepth: { type: 'integer', minimum: 1, maximum: LIMITS.outlineDepth },
      maxChildren: { type: 'integer', minimum: 1, maximum: LIMITS.outlineChildren },
      viewportId,
    },
  ],
  query_selector: [
    'Find elements by CSS selector; returns element ids.',
    { selector, limit, rootId: elementIdS('Search inside this element (optional).'), viewportId },
    ['selector'],
  ],
  get_element_matched_rules: [
    'CSS rules matching an element (≤ 60 by score), with ruleRef for editing, and its inline style.',
    EL,
    ['elementId'],
  ],
  get_breakpoints: ["The page's media-query breakpoints."],
  get_seo_issues: ['SEO issues of the page.'],
  get_meta_tags: ['Meta tags of the page.'],
  get_page_weight: ['Resource sizes of the page.'],
  get_css_custom_properties: ['CSS custom properties (variables) defined by the page.'],
  get_typography: ['Typography of an element.', EL, ['elementId']],
  calculate_specificity: ['Specificity of a CSS selector.', { selector }, ['selector']],
  get_colors: ['Colors used in an element.', EL, ['elementId']],
  get_assets: ['Images and other assets inside an element.', EL, ['elementId']],
  get_layout: ['Box model / flex / grid layout of an element.', EL, ['elementId']],
  force_element_state: [
    'Force a pseudo-class state on an element (null clears it).',
    {
      ...EL,
      state: { type: ['string', 'null'], enum: [...MCP_STATES, null] },
    },
    ['elementId'],
  ],
  detect_technologies: ['Frameworks and libraries detected on the page.'],
  get_a11y_issues: ['Accessibility issues, warnings first, lowest contrast first.', { limit }],
  get_tailwind: ['Tailwind classes for an element.', EL, ['elementId']],
  fetch_stylesheet: [
    'Fetch a public http(s) stylesheet (needs the optional all-sites grant in PixelLens).',
    { url: str(LIMITS.url, 'Stylesheet URL.', 1) },
    ['url'],
  ],
  enter_responsive_mode: ['Enter responsive mode (several viewports side by side).'],
  exit_responsive_mode: ['Exit responsive mode.'],
  set_viewport: [
    'Resize a viewport (clamped to at least 200×300).',
    {
      width: { type: 'number', exclusiveMinimum: 0 },
      height: { type: 'number', exclusiveMinimum: 0 },
      viewportId,
    },
    ['width', 'height'],
  ],
  get_viewport: ['Current viewport(s).'],
  set_viewports: [
    'Replace the responsive viewport set.',
    {
      viewports: {
        type: 'array',
        minItems: 1,
        maxItems: LIMITS.viewports,
        items: {
          type: 'object',
          properties: {
            width: { type: 'number', exclusiveMinimum: 0 },
            height: { type: 'number', exclusiveMinimum: 0 },
            name: { type: 'string', maxLength: LIMITS.name },
          },
          required: ['width', 'height'],
        },
      },
    },
    ['viewports'],
  ],
  add_viewport: [
    'Add a responsive viewport.',
    {
      width: { type: 'number', exclusiveMinimum: 0 },
      height: { type: 'number', exclusiveMinimum: 0 },
      name: { type: 'string', maxLength: LIMITS.name },
    },
  ],
  remove_viewport: ['Remove a responsive viewport.', { viewportId }, ['viewportId']],
  set_zoom: ['Zoom of responsive mode (clamped 0.25–2).', { zoom: { type: 'number' } }, ['zoom']],
  set_breakpoints_mode: [
    "Show the page's own breakpoints as viewports.",
    { enabled: { type: 'boolean' } },
    ['enabled'],
  ],
  get_my_edits: ['Edits made so far: {edits, ruleChanges, htmlChanges}.'],
  set_text_content: [
    'Replace the text of an element.',
    { ...EL, text: str(LIMITS.text, 'New text.') },
    ['elementId', 'text'],
  ],
  set_inner_html: [
    'Replace the inner HTML of an element (sanitized in the page).',
    { ...EL, html: str(LIMITS.html, 'HTML.') },
    ['elementId', 'html'],
  ],
  insert_html: [
    'Insert HTML next to / inside an element (sanitized).',
    {
      ...EL,
      html: str(LIMITS.html, 'HTML.', 1),
      position: { type: 'string', enum: [...INSERT_POSITIONS] },
    },
    ['elementId', 'html', 'position'],
  ],
  select_element: ["Select an element in PixelLens's inspector.", EL, ['elementId']],
  get_screenshot: ['Screenshot of the visible tab (PNG, longest side ≤ 2000 px).'],
  apply_styles: [
    'Set CSS: with ruleRef edits that rule, else the inline style of elementId. Joins undo and is saved per site.',
    {
      elementId: elementIdS(),
      ruleRef,
      styles,
      state: { type: 'string', maxLength: 100, description: 'e.g. ":hover"' },
      media: { type: 'string', maxLength: LIMITS.selector, description: 'Media query prelude.' },
      pseudo: { type: 'string', maxLength: 100, description: 'e.g. "::before"' },
      viewportId,
    },
    ['styles'],
  ],
  add_rule: [
    'Add a new CSS rule.',
    { selector, wrappers, styles, elementId: elementIdS(), viewportId },
    ['selector'],
  ],
  set_rule_selector: [
    'Change the selector of a rule.',
    { ruleRef, selector, viewportId },
    ['ruleRef', 'selector'],
  ],
  revert_css_change: [
    'Revert one change (a recordId from get_my_edits).',
    { changeId: str(200, 'recordId from get_my_edits.', 1) },
    ['changeId'],
  ],
  revert_all_edits: ['Revert every edit; also clears the edits saved for the site.'],
  set_element_classes: [
    'Replace the class attribute of an element.',
    { ...EL, classes: str(LIMITS.classes, 'Space-separated classes.') },
    ['elementId', 'classes'],
  ],
  delete_element: ['Delete an element.', EL, ['elementId']],
  duplicate_element: ['Duplicate an element.', EL, ['elementId']],
  enable_tab: [
    'Turn PixelLens on in a tab (shows its dock to the user). Only works when list_tabs says canEnable; otherwise ask the user to click the PixelLens icon.',
  ],
  click_element: [
    'Click an element like a user: scrolls it into view, checks nothing covers it, then fires pointer/mouse/click events. ' +
      'Links navigate, buttons and checkboxes act. After a navigation, call list_tabs again. Events are synthetic (isTrusted false).',
    { ...EL, double: { type: 'boolean', description: 'Double-click.' } },
    ['elementId'],
  ],
  type_text: [
    'Type into an input, textarea, contenteditable or <select> (option value or label). Fires key/input/change events so frameworks see it.',
    {
      ...EL,
      text: str(LIMITS.text, 'Text to type.'),
      clear: { type: 'boolean', default: true, description: 'Replace the current value (default) instead of appending.' },
      submit: { type: 'boolean', default: false, description: 'Press Enter afterwards (submits a form).' },
    },
    ['elementId', 'text'],
  ],
  press_key: [
    'Press a key on the focused element (or on elementId, focused first): one character or a name like Enter, Escape, Tab, ArrowDown.',
    {
      key: str(LIMITS.key, 'Key, e.g. "Enter", "Escape", "a".', 1),
      elementId: elementIdS(),
      shift: { type: 'boolean' },
      ctrl: { type: 'boolean' },
      alt: { type: 'boolean' },
      meta: { type: 'boolean' },
      viewportId,
    },
    ['key'],
  ],
  scroll_page: [
    'Scroll: elementId brings that element to the middle of the screen; to "top"/"bottom"; or deltaX/deltaY in px. Returns the new scroll position.',
    {
      elementId: elementIdS(),
      to: { type: 'string', enum: ['top', 'bottom'] },
      deltaX: { type: 'number' },
      deltaY: { type: 'number' },
      viewportId,
    },
  ],
};

const NO_TAB: readonly string[] = ['list_tabs', 'fetch_stylesheet'];

export const COMMAND_TOOLS: ToolDef[] = MCP_TYPES.map((name) => {
  const [description, props = {}, req = []] = SPECS[name];
  const needsTab = !NO_TAB.includes(name);
  const properties: Record<string, Schema> = needsTab ? { tabId, ...props } : { ...props };
  const required = needsTab ? ['tabId', ...req] : req;
  return {
    name,
    description,
    inputSchema: { type: 'object', properties, ...(required.length ? { required } : {}) },
  };
});

export const PING_TOOL: ToolDef = {
  name: 'ping',
  description: 'Check the link to the PixelLens extension: whether it is connected and its version.',
  inputSchema: { type: 'object', properties: {} },
};
