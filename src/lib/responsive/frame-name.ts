/** window.name prefix of a responsive frame (legacy `yg`), scoped by extension id. */
export function framePrefix(extId: string): string {
  return `screen-ruler-responsive-iframe-${extId}`;
}

/** iframe name for viewport `id` (legacy-src/content.js:37581). */
export function frameName(extId: string, id: number): string {
  return `${framePrefix(extId)}-${id}`;
}

/** Viewport id when `name` is one of our frames, else null. */
export function parseFrameName(extId: string, name: unknown): number | null {
  const prefix = framePrefix(extId);
  if (typeof name !== 'string' || !name.startsWith(prefix)) return null;
  const m = /^-(\d+)$/.exec(name.slice(prefix.length));
  return m ? Number(m[1]) : null;
}
