import { describe, expect, it } from 'vitest';
import { render, slugify } from './markdown';

describe('render', () => {
  it('takes the title from # and ids from ## / ###', () => {
    const r = render('# Title\n\n## First part\n\ntext\n\n### Sub\n\n## First part');
    expect(r.title).toBe('Title');
    expect(r.headings.map((h) => h.id)).toEqual(['first-part', 'sub', 'first-part-1']);
    expect(r.html).toContain('<h2 id="first-part">First part</h2>');
  });

  it('escapes HTML everywhere, code included', () => {
    const r = render('<b>x</b> `<i>` and ```\n<script>\n```');
    expect(r.html).not.toMatch(/<b>|<i>|<script>/);
    expect(r.html).toContain('&lt;b&gt;');
  });

  it('keeps markup out of inline code', () => {
    expect(render('`**a**` **b**').html).toBe('<p><code>**a**</code> <strong>b</strong></p>');
  });

  it('does not italicise snake_case', () => {
    expect(render('use list_tabs_now here').html).toBe('<p>use list_tabs_now here</p>');
  });

  it('renders lists with one nested level and ordered lists', () => {
    const html = render('- a\n  - a1\n- b\n\n1. one\n2. two').html;
    expect(html).toBe(
      '<ul><li>a<ul><li>a1</li></ul></li><li>b</li></ul>\n<ol><li>one</li><li>two</li></ol>',
    );
  });

  it('renders tables, skipping the separator row and keeping escaped pipes', () => {
    const html = render('| A | B |\n| --- | --- |\n| 1 | x \\| y |').html;
    expect(html).toContain('<th>A</th><th>B</th>');
    expect(html).toContain('<td>1</td><td>x | y</td>');
  });

  it('maps links and marks external ones', () => {
    const r = render('[a](page.md#x) [b](https://e.com)', (h) =>
      h.startsWith('http') ? h : '#mapped',
    );
    expect(r.html).toContain('<a href="#mapped">a</a>');
    expect(r.html).toContain('<a href="https://e.com" target="_blank" rel="noopener">b</a>');
  });
});

describe('slugify', () => {
  it('drops Vietnamese accents', () => {
    expect(slugify('Phím tắt & Đo đạc')).toBe('phim-tat-do-dac');
  });
});
