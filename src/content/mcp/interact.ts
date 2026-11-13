/**
 * Page interaction for the agent (MCP click_element, type_text, press_key, scroll_page).
 *
 * The content script cannot make trusted input, so these dispatch ordinary DOM events the way a
 * browser does for a real user: pointer → mouse → click with coordinates, focus, the native value
 * setter + input/change (works with React/Vue controlled inputs), and keydown/keyup. Every event is
 * put in {@link agentEvents} so PixelLens's own listeners (inspector click-to-select, measure,
 * shortcuts) let it through to the page. Sites that check `event.isTrusted` will ignore them.
 */
import { agentEvents } from '../core/events';
import { buildElementSummary } from './ai-data';
import { elementOf, fail, type Commands } from './command';
import { elementId } from '../sidepanel/bridge.svelte';

const mark = <E extends Event>(e: E): E => (agentEvents.add(e), e);

/** Scroll the element to the middle of the viewport (instantly) and return its centre point. */
function bringIntoView(el: Element): { x: number; y: number } {
  el.scrollIntoView({ block: 'center', inline: 'center', behavior: 'instant' });
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return fail('The element has no size on the page (hidden?).');
  const x = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
  const y = Math.min(Math.max(r.top + r.height / 2, 0), innerHeight - 1);
  return { x, y };
}

/** What a real click at (x, y) would hit; the target itself or one of its descendants is fine. */
function topAt(el: Element, x: number, y: number): Element {
  const hit = document
    .elementsFromPoint(x, y)
    .find((n) => !n.closest('pixellens-ui') && !n.hasAttribute('data-pixellens'));
  if (!hit || hit === el || el.contains(hit)) return hit ?? el;
  // a label for this control is a real click target too
  if (hit instanceof HTMLLabelElement && hit.control === el) return hit;
  const desc = hit.tagName.toLowerCase() + (hit.id ? `#${hit.id}` : '');
  return fail(`The element is covered by <${desc}> at its centre; close that first or click it.`);
}

const pointer = (type: string, x: number, y: number, buttons: number) =>
  mark(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons,
    }),
  );
const mouse = (type: string, x: number, y: number, buttons: number, detail = 1) =>
  mark(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: x,
      clientY: y,
      button: 0,
      buttons,
      detail,
      view: window,
    }),
  );

const FOCUSABLE = 'a[href],button,input,select,textarea,summary,[tabindex],[contenteditable]';

/** The full sequence a browser fires for one left click. */
export function clickAt(target: Element, x: number, y: number, double = false): void {
  target.dispatchEvent(pointer('pointerover', x, y, 0));
  target.dispatchEvent(mouse('mouseover', x, y, 0));
  target.dispatchEvent(pointer('pointermove', x, y, 0));
  target.dispatchEvent(mouse('mousemove', x, y, 0));
  for (let n = 1; n <= (double ? 2 : 1); n++) {
    target.dispatchEvent(pointer('pointerdown', x, y, 1));
    if (target.dispatchEvent(mouse('mousedown', x, y, 1, n))) {
      const f = target.closest(FOCUSABLE);
      if (f instanceof HTMLElement) f.focus({ preventScroll: true });
    }
    target.dispatchEvent(pointer('pointerup', x, y, 0));
    target.dispatchEvent(mouse('mouseup', x, y, 0, n));
    // a dispatched click runs the default action too: links navigate, checkboxes toggle, forms submit
    target.dispatchEvent(mouse('click', x, y, 0, n));
  }
  if (double) target.dispatchEvent(mouse('dblclick', x, y, 0, 2));
}

const isTextInput = (el: Element): el is HTMLInputElement | HTMLTextAreaElement =>
  el instanceof HTMLTextAreaElement ||
  (el instanceof HTMLInputElement &&
    ![
      'checkbox',
      'radio',
      'button',
      'submit',
      'reset',
      'file',
      'image',
      'range',
      'color',
      'hidden',
    ].includes(el.type));

/** Set a form value the way typing does, through the prototype setter (frameworks hook the instance one). */
function setNativeValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
): void {
  const proto = Object.getPrototypeOf(el) as object;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
}

const KEY_CODES: Record<string, string> = {
  Enter: 'Enter',
  Escape: 'Escape',
  Tab: 'Tab',
  Backspace: 'Backspace',
  Delete: 'Delete',
  ' ': 'Space',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
};
/** KeyboardEvent.code for a key name: letters → KeyA, digits → Digit1, named keys as is. */
const codeOf = (key: string) =>
  KEY_CODES[key] ??
  (/^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : /^[0-9]$/.test(key) ? `Digit${key}` : key);

/** keydown → (Enter submits the form, Tab moves focus) → keyup, on the focused element. */
export function pressKey(
  target: Element,
  key: string,
  mods: { shift?: boolean; ctrl?: boolean; alt?: boolean; meta?: boolean } = {},
): void {
  const init: KeyboardEventInit = {
    key,
    code: codeOf(key),
    bubbles: true,
    cancelable: true,
    composed: true,
    shiftKey: !!mods.shift,
    ctrlKey: !!mods.ctrl,
    altKey: !!mods.alt,
    metaKey: !!mods.meta,
  };
  const go = target.dispatchEvent(mark(new KeyboardEvent('keydown', init)));
  if (go && !mods.ctrl && !mods.meta && !mods.alt) {
    if (key === 'Enter' && target instanceof HTMLInputElement && target.form) {
      // implicit submission, as a browser does for Enter in a text field
      const submit = target.form.querySelector<HTMLElement>('[type=submit],button:not([type])');
      if (submit) {
        const r = submit.getBoundingClientRect();
        clickAt(submit, r.left + r.width / 2, r.top + r.height / 2);
      } else target.form.requestSubmit();
    } else if (key === 'Tab') moveFocus(target, mods.shift ? -1 : 1);
  }
  target.dispatchEvent(mark(new KeyboardEvent('keyup', init)));
}

function moveFocus(from: Element, step: 1 | -1): void {
  const all = [...document.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (e) => e.tabIndex >= 0 && !(e as HTMLButtonElement).disabled && e.getClientRects().length,
  );
  const i = all.indexOf(from as HTMLElement);
  all.at((i + step + all.length) % all.length)?.focus();
}

/** Type into a field, one key per character (keydown / beforeinput / input / keyup), then change. */
function typeInto(el: Element, text: string, clear: boolean): void {
  if (el instanceof HTMLSelectElement) {
    const opt = [...el.options].find((o) => o.value === text || o.text.trim() === text.trim());
    if (!opt) return fail(`No option "${text.slice(0, 80)}" in this <select>.`);
    setNativeValue(el, opt.value);
    el.dispatchEvent(mark(new Event('input', { bubbles: true, composed: true })));
    el.dispatchEvent(mark(new Event('change', { bubbles: true })));
    return;
  }
  const editable = el instanceof HTMLElement && el.isContentEditable;
  if (!isTextInput(el) && !editable)
    return fail('type_text needs an <input>, <textarea>, <select> or contenteditable element.');
  if ((el as HTMLInputElement).disabled || (el as HTMLInputElement).readOnly)
    return fail('The field is disabled or read-only.');
  (el as HTMLElement).focus({ preventScroll: true });
  if (isTextInput(el)) {
    let value = clear ? '' : el.value;
    if (clear && el.value) {
      setNativeValue(el, '');
      el.dispatchEvent(
        mark(
          new InputEvent('input', {
            bubbles: true,
            composed: true,
            inputType: 'deleteContentBackward',
          }),
        ),
      );
    }
    for (const ch of text) {
      const init = { key: ch, code: codeOf(ch), bubbles: true, cancelable: true, composed: true };
      if (!el.dispatchEvent(mark(new KeyboardEvent('keydown', init)))) continue;
      el.dispatchEvent(
        mark(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            composed: true,
            inputType: 'insertText',
            data: ch,
          }),
        ),
      );
      value += ch;
      setNativeValue(el, value);
      el.dispatchEvent(
        mark(
          new InputEvent('input', {
            bubbles: true,
            composed: true,
            inputType: 'insertText',
            data: ch,
          }),
        ),
      );
      el.dispatchEvent(mark(new KeyboardEvent('keyup', init)));
    }
    el.dispatchEvent(mark(new Event('change', { bubbles: true })));
    return;
  }
  // contenteditable: execCommand keeps the editor's own undo and input events
  if (clear) document.execCommand('selectAll');
  else {
    const sel = getSelection();
    sel?.selectAllChildren(el);
    sel?.collapseToEnd();
  }
  if (!document.execCommand('insertText', false, text)) {
    el.append(text);
    el.dispatchEvent(
      mark(
        new InputEvent('input', {
          bubbles: true,
          composed: true,
          inputType: 'insertText',
          data: text,
        }),
      ),
    );
  }
}

const summary = (el: Element) => buildElementSummary(el, elementId);
const valueOf = (el: Element) =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLTextAreaElement ||
  el instanceof HTMLSelectElement
    ? el.value
    : (el.textContent ?? '').slice(0, 500);

export const interactCommands: Commands = {
  click_element({ elementId: id, double }) {
    const el = elementOf(id);
    if ((el as HTMLButtonElement).disabled) return fail('The element is disabled.');
    const { x, y } = bringIntoView(el);
    const target = topAt(el, x, y);
    const before = location.href;
    // run after this answer is on its way: a click that navigates would otherwise lose the reply
    setTimeout(() => clickAt(target, x, y, double), 0);
    return {
      success: true,
      clicked: summary(el),
      note: 'The page may navigate or change after a click. If a later command says PixelLens is not active, the page navigated: call list_tabs.',
      url: before,
    };
  },
  type_text({ elementId: id, text, clear, submit }) {
    const el = elementOf(id);
    bringIntoView(el);
    typeInto(el, text, clear !== false); // the protocol defaults clear to true
    const value = valueOf(el);
    if (submit) setTimeout(() => pressKey(el, 'Enter'), 0);
    return { success: true, value, submitted: !!submit };
  },
  press_key({ key, elementId: id, shift, ctrl, alt, meta }) {
    const el = id ? elementOf(id) : (document.activeElement ?? document.body);
    if (id) (el as HTMLElement).focus?.({ preventScroll: true });
    setTimeout(() => pressKey(el, key, { shift, ctrl, alt, meta }), 0);
    return { success: true, target: summary(el) };
  },
  scroll_page({ elementId: id, deltaX, deltaY, to }) {
    if (id) {
      bringIntoView(elementOf(id));
    } else if (to) {
      scrollTo({
        top: to === 'top' ? 0 : document.documentElement.scrollHeight,
        behavior: 'instant',
      });
    } else {
      scrollBy({ left: deltaX ?? 0, top: deltaY ?? 0, behavior: 'instant' });
    }
    return {
      success: true,
      scrollX: Math.round(scrollX),
      scrollY: Math.round(scrollY),
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: innerHeight,
    };
  },
};
