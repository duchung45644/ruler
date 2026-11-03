/** Line diff for the Changes tab (6.44). */

export interface DiffLine {
  kind: '=' | '-' | '+';
  text: string;
  /** 1-based line in `before` for '=' and '-', in `after` for '+'. */
  line: number;
}

export function lineDiff(before: string, after: string): DiffLine[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const n = a.length;
  const m = b.length;
  // lcs[i][j] = LCS length of a[i..] and b[j..]
  const lcs = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lcs[i]![j] =
        a[i] === b[j] ? lcs[i + 1]![j + 1]! + 1 : Math.max(lcs[i + 1]![j]!, lcs[i]![j + 1]!);
  const out: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      out.push({ kind: '=', text: a[i]!, line: i + 1 });
      i++;
      j++;
    } else if (j >= m || (i < n && lcs[i + 1]![j]! >= lcs[i]![j + 1]!)) {
      out.push({ kind: '-', text: a[i]!, line: i + 1 });
      i++;
    } else {
      out.push({ kind: '+', text: b[j]!, line: j + 1 });
      j++;
    }
  }
  return out;
}

export const whitespaceOnly = (before: string, after: string): boolean =>
  before !== after && before.replace(/\s+/g, '') === after.replace(/\s+/g, '');
