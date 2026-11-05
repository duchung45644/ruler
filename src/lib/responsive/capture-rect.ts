/** Viewport edges in CSS px. */
export interface Edges {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * A rect in a frame's own viewport → the parent viewport (Q6: the parent grabs and crops).
 * `origin` is the iframe's getBoundingClientRect() (already scaled); the frame content is drawn
 * at `zoom` inside it.
 */
export function frameRectToParent(
  r: Edges,
  origin: { left: number; top: number },
  zoom: number,
): Edges {
  return {
    left: origin.left + r.left * zoom,
    top: origin.top + r.top * zoom,
    right: origin.left + r.right * zoom,
    bottom: origin.top + r.bottom * zoom,
  };
}
