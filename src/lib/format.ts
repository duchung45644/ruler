/** At most 3 decimals, no trailing zeros (6.20). */
export const formatDim = (n: number): string => Number(n.toFixed(3)).toString();

export const formatSize = (w: number, h: number): string => `${formatDim(w)} × ${formatDim(h)}`;

/** Port of legacy us (sidepanel.js:17758). */
export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}
