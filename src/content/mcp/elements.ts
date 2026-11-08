/** Element commands (10.11, legacy content.js:23309–23531, :23626). */
import { splitState } from '../../lib/css/specificity';
import { serializeDecls } from '../../lib/edit/decls';
import { LIMITS } from '../../lib/mcp/protocol';
import { state } from '../core/state.svelte';
import { buildPayload } from '../edit/payload';
import { editor, ruleTracker, stateForcer } from '../edit/mode.svelte';
import { elementId, sendElement } from '../sidepanel/bridge.svelte';
import { selectElement } from '../tools/inspector';
import { buildElementSummary, buildOutlineTree, queryBySelector } from './ai-data';
import { elementOf, fail, type Commands } from './command';

/** Rules per element, best score first (legacy cap). */
export const MAX_RULES = 60;

/** Matched rules with the `ruleRef` apply_styles / set_rule_selector take back (= RuleAddress). */
export function matchedRulesFor(el: Element) {
  const payload = buildPayload(el, stateForcer());
  const all = payload.rules
    .map((r) => {
      const { state: st, pseudoElement } = splitState(r.selector);
      return {
        ruleRef: r.address,
        selector: r.selector,
        declsText: serializeDecls(r.declarations),
        wrappers: r.wrappers,
        media: r.wrappers.find((w) => w.startsWith('@media')) ?? null,
        mediaActive: r.mediaActive,
        specificity: r.specificity,
        score: r.score,
        state: st,
        pseudoElement,
        readOnly: !r.editable,
        source: r.source,
        line: r.line,
      };
    })
    .sort((a, b) => b.score - a.score);
  const rules = all.slice(0, MAX_RULES);
  return {
    rules,
    truncated: all.length - rules.length,
    inlineStyle: el.getAttribute('style') ?? '',
  };
}

export const elementCommands: Commands = {
  get_selected_element() {
    const el = state.selected;
    if (!el?.isConnected)
      return fail(
        'No element is currently selected. Ask the user to click an element on the page.',
      );
    return { element: buildElementSummary(el, elementId) };
  },
  get_element_outline({ elementId: id, maxDepth, maxChildren }) {
    const root = id ? elementOf(id) : (state.selected ?? document.body);
    if (!root) return fail('No element to outline.');
    return { outline: buildOutlineTree(root, elementId, { maxDepth, maxChildren }) };
  },
  get_element_details: ({ elementId: id }) => ({
    details: buildElementSummary(elementOf(id), elementId),
  }),
  get_elements_details({ elementIds }) {
    const results = [];
    const notFound: string[] = [];
    for (const id of elementIds.slice(0, LIMITS.elementIds)) {
      try {
        results.push(buildElementSummary(elementOf(id), elementId));
      } catch {
        notFound.push(id);
      }
    }
    return { results, notFound };
  },
  query_selector({ selector, limit, rootId }) {
    const root = rootId ? elementOf(rootId, `Root element ${rootId} not found.`) : document.body;
    const r = queryBySelector(selector, elementId, { root, limit });
    return 'error' in r ? fail(r.error!) : r;
  },
  get_element_matched_rules({ elementId: id }) {
    const el = elementOf(id, `Element ${id} not found.`);
    return { id, ...matchedRulesFor(el) };
  },
  get_my_edits: () => ({
    ruleChanges: ruleTracker().flattened(),
    htmlChanges: editor()?.htmlChanges() ?? [],
  }),
  select_element({ elementId: id }) {
    selectElement(elementOf(id), { scroll: true });
    return { success: true };
  },
  force_element_state({ elementId: id, state: forced }) {
    const el = elementOf(id);
    if (state.selected !== el) selectElement(el);
    stateForcer().forceState(el, forced);
    sendElement(el);
    return { success: true, state: forced };
  },
};
