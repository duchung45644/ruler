import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Source = { file: string; from?: string; to?: string };

const AREAS: Record<string, Source[]> = {
  'nền + cài đặt': [
    { file: 'legacy-src/background.js' },
    { file: 'legacy-src/options.js' },
    { file: 'unpacked/options/index.html' },
  ],
};

const inventory = readFileSync('docs/inventory.md', 'utf8');
const i18nKeys = Object.keys(
  JSON.parse(readFileSync('unpacked/_locales/en/messages.json', 'utf8')) as object,
);

function sliceSource(src: Source): string {
  const lines = readFileSync(src.file, 'utf8').split('\n');
  const start = src.from ? lines.findIndex((l) => l.includes(src.from!)) : 0;
  if (start < 0) throw new Error(`${src.file}: không thấy from "${src.from}"`);
  let end = lines.length;
  if (src.to) {
    end = lines.findIndex((l, i) => i >= start && l.includes(src.to!));
    if (end < 0) throw new Error(`${src.file}: không thấy to "${src.to}"`);
  }
  return lines.slice(start, end).join('\n');
}

function namesIn(text: string, file: string): string[] {
  const names = [...text.matchAll(/action: "([A-Za-z_]+)"/g)].map((m) => m[1]!);
  if (file.endsWith('/background.js')) {
    for (const m of text.matchAll(/case "([^"]+)":/g)) if (m[1] !== 'end') names.push(m[1]!);
  }
  names.push(...i18nKeys.filter((k) => text.includes(`"${k}"`)));
  return names;
}

function missing(sources: Source[]): string[] {
  const names = new Set(sources.flatMap((s) => namesIn(sliceSource(s), s.file)));
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...names].filter((n) => !new RegExp(`\\b${escape(n)}\\b`).test(inventory)).sort();
}

describe('docs/inventory.md', () => {
  it.each(Object.entries(AREAS))('ghi đủ tên từ vùng %s', (_, sources) => {
    expect(missing(sources)).toEqual([]);
  });
});
