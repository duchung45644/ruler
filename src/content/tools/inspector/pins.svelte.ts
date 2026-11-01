export interface Pin {
  id: number;
  el: Element;
  pageX: number;
  pageY: number;
  width?: number;
  height?: number;
}

/** Pinned inspectors (2.13), bottom → top. Page coordinates, so they follow scroll. */
export const pins = $state<Pin[]>([]);
/** Pin under the mouse (its source gets highlighted). */
export const pinUi = { hovered: null as Element | null };
let nextId = 1;

/** `{x, y}` is the viewport position at pin time. */
export function addPin(
  el: Element,
  { x, y }: { x: number; y: number },
  size?: { width: number; height: number },
): Pin {
  pins.push({ id: nextId++, el, pageX: x + scrollX, pageY: y + scrollY, ...size });
  return pins[pins.length - 1]!;
}

export function removePin(id: number): void {
  const i = pins.findIndex((p) => p.id === id);
  if (i >= 0) pins.splice(i, 1);
}

/** Move a pin to the top of the stack (port of raisePinnedInspector :43626). */
export function raisePin(id: number): void {
  const i = pins.findIndex((p) => p.id === id);
  if (i >= 0 && i < pins.length - 1) pins.push(...pins.splice(i, 1));
}

export function clearPins(): void {
  pins.length = 0;
  pinUi.hovered = null;
}

export const signature = (el: Element): string =>
  el.tagName.toLowerCase() +
  (el.id ? `#${el.id}` : '') +
  [...el.classList].map((c) => `.${c}`).join('');
