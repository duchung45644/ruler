/** Text edit mode (port of toggleTextEditMode :42022, enterTextEditMode :42044, exitTextEditMode :42271; 5.06). */
import { restoreAttr, shadowRoots } from '../../lib/dom/dom';
import { layer } from '../core/overlay';
import { state } from '../core/state.svelte';
import type { HtmlEditor } from './engine';

/** Never made editable inside shadow roots (legacy Yf). */
const SKIP = new Set(['style', 'script', 'link', 'template', 'slot']);
/** List / rule / link inserts would add markup the engine cannot describe (legacy $g). */
const BLOCKED_INPUT = new Set([
  'insertOrderedList',
  'insertUnorderedList',
  'insertHorizontalRule',
  'insertLink',
]);

interface Session {
  controller: AbortController;
  body: { editable: string | null; spellcheck: string | null };
  /** Shadow root children we made editable, with their own contenteditable value. */
  shadow: Map<Element, string | null>;
  /** Elements snapshotted for undo, in edit order. */
  edited: Element[];
}

let session: Session | null = null;

const elementOf = (n: Node | null): Element | null =>
  !n ? null : n.nodeType === Node.ELEMENT_NODE ? (n as Element) : n.parentElement;

function target(e: InputEvent): Element | null {
  const range = e.getTargetRanges?.()[0] ?? getSelection()?.getRangeAt(0) ?? null;
  if (!range) return elementOf(e.target as Node | null);
  const a = elementOf(range.startContainer);
  const b = elementOf(range.endContainer);
  if (!a || !b) return a ?? b;
  let common: Element | null = a;
  while (common && !common.contains(b)) common = common.parentElement;
  return common;
}

export function setTextEdit(
  on: boolean,
  engine: HtmlEditor | null,
  isOwn: (el: Element) => boolean,
): void {
  if (on === !!session) return;
  if (!on) return exit(engine);
  if (!engine) return;
  const controller = new AbortController();
  const s: Session = {
    controller,
    body: {
      editable: document.body.getAttribute('contenteditable'),
      spellcheck: document.body.getAttribute('spellcheck'),
    },
    shadow: new Map(),
    edited: [],
  };
  session = s;
  state.textEditOn = true;
  state.popover = null;
  layer.style.visibility = 'hidden'; // highlight, grid, rulers
  document.body.spellcheck = false;
  document.body.contentEditable = 'true';
  for (const root of shadowRoots(document, isOwn))
    for (const child of root.children) {
      if (SKIP.has(child.localName)) continue;
      s.shadow.set(child, child.getAttribute('contenteditable'));
      child.setAttribute('contenteditable', 'true');
    }

  const opts = { capture: true, signal: controller.signal };
  const ours = (e: Event) => e.composedPath().some((n) => n instanceof Element && isOwn(n));
  // links and buttons must not navigate or submit while their text is being edited
  const stop = (e: Event) => {
    if (ours(e)) return;
    e.preventDefault();
    e.stopPropagation();
  };
  document.addEventListener('click', stop, opts);
  document.addEventListener('submit', stop, opts);
  for (const type of ['pointerdown', 'mousedown', 'mouseup'])
    document.addEventListener(type, (e) => !ours(e) && e.stopPropagation(), opts);
  document.addEventListener(
    'beforeinput',
    (e) => {
      if (ours(e)) return;
      if (e.inputType.startsWith('format') || BLOCKED_INPUT.has(e.inputType))
        return e.preventDefault();
      if (e.inputType === 'insertParagraph') {
        // Enter adds a <br>, not a new block (5.06)
        e.preventDefault();
        document.execCommand?.('insertLineBreak');
      }
      const el = target(e);
      if (!el || el === document.body || el === document.documentElement || isOwn(el)) return;
      // an enclosing snapshot already covers this element
      if (s.edited.some((x) => x.contains(el))) return;
      engine.snapshotForTextEdit(el);
      s.edited.push(el);
    },
    opts,
  );
}

function exit(engine: HtmlEditor | null): void {
  const s = session;
  if (!s) return;
  session = null;
  s.controller.abort();
  restoreAttr(document.body, 'contenteditable', s.body.editable);
  restoreAttr(document.body, 'spellcheck', s.body.spellcheck);
  for (const [el, v] of s.shadow) restoreAttr(el, 'contenteditable', v);
  for (const el of s.edited) engine?.commitTextEdit(el);
  layer.style.visibility = '';
  state.textEditOn = false;
}
