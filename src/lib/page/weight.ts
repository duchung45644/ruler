import { PW_TYPES, type PageWeight, type PwType } from './types';

/** Legacy _addPageWeightEntry's type switch (content.js:39393). */
export function classifyResource(e: { initiatorType: string; name: string }): PwType {
  const a = e.initiatorType;
  const n = e.name || '';
  if (a === 'script') return 'script';
  if (a === 'link' || a === 'css' || /\.css(\?|$)/i.test(n)) return 'css';
  if (a === 'img' || a === 'image' || /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(\?|$)/i.test(n))
    return 'img';
  if (/\.(woff2?|ttf|otf|eot)(\?|$)/i.test(n)) return 'font';
  if (a === 'fetch' || a === 'xmlhttprequest') return 'fetch';
  if (a === 'video' || a === 'audio') return 'media';
  return 'other';
}

type Entry = Pick<
  PerformanceResourceTiming,
  'name' | 'startTime' | 'initiatorType' | 'transferSize' | 'encodedBodySize'
>;

/**
 * Running resource totals, as legacy _pageWeightTotals: entries are counted once (name +
 * startTime), and after an in-page navigation only those that start after `mark`.
 */
export class WeightTotals {
  total = 0;
  byType = Object.fromEntries(PW_TYPES.map((t) => [t, 0])) as Record<PwType, number>;
  unknownCount = 0;
  bufferFull = false;
  private seen = new Set<string>();
  constructor(readonly mark = 0) {}

  add(e: Entry): void {
    if (e.startTime < this.mark) return;
    const key = `${e.name}|${e.startTime}`;
    if (this.seen.has(key)) return;
    this.seen.add(key);
    const bytes = (e.transferSize || 0) > 0 ? e.transferSize : e.encodedBodySize || 0;
    if (!bytes) {
      this.unknownCount++;
      return;
    }
    this.byType[classifyResource(e)] += bytes;
    this.total += bytes;
  }

  /** collectPageWeight (:39435): null when nothing is known at all. */
  result(
    nav?: Pick<PerformanceNavigationTiming, 'transferSize' | 'encodedBodySize'>,
  ): PageWeight | null {
    const doc =
      this.mark === 0
        ? (nav?.transferSize || 0) > 0
          ? nav!.transferSize
          : nav?.encodedBodySize || 0
        : 0;
    const total = doc + this.total;
    if (total === 0 && this.unknownCount === 0) return null;
    return {
      total,
      document: doc,
      byType: { ...this.byType },
      unknownCount: this.unknownCount,
      bufferFull: this.bufferFull,
    };
  }
}
