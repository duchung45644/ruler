/**
 * Small Markdown renderer for our own docs (no third-party input, no HTML passthrough).
 * Supports: # / ## / ### headings (with ids), paragraphs, bullet and numbered lists (one nested
 * level by indentation), tables, fenced code, `code`, **bold**, _em_ and [links](target).
 */

export interface Heading {
  level: 2 | 3;
  id: string;
  text: string;
}

export interface Rendered {
  title: string;
  html: string;
  headings: Heading[];
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Rewrites a link target; the docs page maps `page.md#x` to its own hash routes. */
export type LinkMap = (href: string) => string;

function inline(s: string, link: LinkMap): string {
  const codes: string[] = [];
  let out = esc(s).replace(/`([^`]+)`/g, (_, c: string) => {
    codes.push(c);
    return `\uE000${codes.length - 1}\uE000`;
  });
  out = out
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, href: string) => {
      const target = link(href.replace(/&amp;/g, '&'));
      const ext = /^https?:/.test(target);
      return `<a href="${esc(target)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_(?=[\s.,;:)!?]|$)/g, '$1<em>$2</em>');
  return out.replace(/\uE000(\d+)\uE000/g, (_, i: string) => `<code>${codes[+i]}</code>`);
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.trim().replace(/\\\|/g, '|'));

const LIST = /^(\s*)([-*]|\d+\.)\s+(.*)$/;

export function render(md: string, link: LinkMap = (h) => h): Rendered {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  let title = '';
  let i = 0;

  const uniqueId = (text: string) => {
    const base = slugify(text) || 'section';
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n ? `${base}-${n}` : base;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    // fenced code
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) body.push(lines[i++]);
      i++;
      html.push(`<pre><code>${esc(body.join('\n'))}</code></pre>`);
      continue;
    }
    // headings
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const text = h[2].trim();
      if (h[1].length === 1) {
        title = text;
      } else {
        const level = h[1].length as 2 | 3;
        const id = uniqueId(text);
        headings.push({ level, id, text: text.replace(/`/g, '') });
        html.push(`<h${level} id="${id}">${inline(text, link)}</h${level}>`);
      }
      i++;
      continue;
    }
    // table
    if (line.trimStart().startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('|')) rows.push(lines[i++]);
      const body = rows.filter((r) => !/^\s*\|?\s*:?-{2,}/.test(r));
      const [head, ...rest] = body;
      html.push(
        '<div class="table"><table><thead><tr>' +
          cells(head)
            .map((c) => `<th>${inline(c, link)}</th>`)
            .join('') +
          '</tr></thead><tbody>' +
          rest
            .map(
              (r) =>
                `<tr>${cells(r)
                  .map((c) => `<td>${inline(c, link)}</td>`)
                  .join('')}</tr>`,
            )
            .join('') +
          '</tbody></table></div>',
      );
      continue;
    }
    // lists (one nested level)
    if (LIST.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: { text: string; sub: string[]; subOrdered: boolean }[] = [];
      while (i < lines.length && (LIST.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        const m = lines[i].match(LIST);
        if (m && m[1].length < 2) items.push({ text: m[3], sub: [], subOrdered: false });
        else if (m && items.length) {
          const last = items[items.length - 1];
          last.sub.push(m[3]);
          last.subOrdered = /^\d+\./.test(m[2]);
        } else if (items.length) items[items.length - 1].text += ' ' + lines[i].trim();
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(
        `<${tag}>` +
          items
            .map((it) => {
              const sub = it.sub.length
                ? `<${it.subOrdered ? 'ol' : 'ul'}>${it.sub
                    .map((s) => `<li>${inline(s, link)}</li>`)
                    .join('')}</${it.subOrdered ? 'ol' : 'ul'}>`
                : '';
              return `<li>${inline(it.text, link)}${sub}</li>`;
            })
            .join('') +
          `</${tag}>`,
      );
      continue;
    }
    // paragraph
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3}\s|```|\s*\|)/.test(lines[i]) &&
      !LIST.test(lines[i])
    )
      para.push(lines[i++].trim());
    html.push(`<p>${inline(para.join(' '), link)}</p>`);
  }
  return { title, html: html.join('\n'), headings };
}
