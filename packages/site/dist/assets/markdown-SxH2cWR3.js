var e = (e) => e.replace(/&/g, `&amp;`).replace(/</g, `&lt;`).replace(/>/g, `&gt;`),
  t = (e) =>
    e
      .toLowerCase()
      .normalize(`NFD`)
      .replace(/[̀-ͯ]/g, ``)
      .replace(/đ/g, `d`)
      .replace(/[^a-z0-9]+/g, `-`)
      .replace(/^-|-$/g, ``);
function n(t, n) {
  let r = [],
    i = e(t).replace(/`([^`]+)`/g, (e, t) => (r.push(t), `\uE000${r.length - 1}\uE000`));
  return (
    (i = i
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (t, r, i) => {
        let a = n(i.replace(/&amp;/g, `&`)),
          o = /^https?:/.test(a);
        return `<a href="${e(a)}"${o ? ` target="_blank" rel="noopener"` : ``}>${r}</a>`;
      })
      .replace(/\*\*([^*]+)\*\*/g, `<strong>$1</strong>`)
      .replace(/(^|[\s(])_([^_]+)_(?=[\s.,;:)!?]|$)/g, `$1<em>$2</em>`)),
    i.replace(/\uE000(\d+)\uE000/g, (e, t) => `<code>${r[+t]}</code>`)
  );
}
var r = (e) =>
    e
      .trim()
      .replace(/^\||\|$/g, ``)
      .split(/(?<!\\)\|/)
      .map((e) => e.trim().replace(/\\\|/g, `|`)),
  i = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
function a(a, o = (e) => e) {
  let s = a.replace(
      /\r\n/g,
      `
`,
    ).split(`
`),
    c = [],
    l = [],
    u = new Map(),
    d = ``,
    f = 0,
    p = (e) => {
      let n = t(e) || `section`,
        r = u.get(n) ?? 0;
      return (u.set(n, r + 1), r ? `${n}-${r}` : n);
    };
  for (; f < s.length;) {
    let t = s[f];
    if (!t.trim()) {
      f++;
      continue;
    }
    if (t.match(/^```(\w*)/)) {
      let t = [];
      for (f++; f < s.length && !s[f].startsWith('```');) t.push(s[f++]);
      (f++,
        c.push(
          `<pre><code>${e(
            t.join(`
`),
          )}</code></pre>`,
        ));
      continue;
    }
    let a = t.match(/^(#{1,3})\s+(.*)$/);
    if (a) {
      let e = a[2].trim();
      if (a[1].length === 1) d = e;
      else {
        let t = a[1].length,
          r = p(e);
        (l.push({ level: t, id: r, text: e.replace(/`/g, ``) }),
          c.push(`<h${t} id="${r}">${n(e, o)}</h${t}>`));
      }
      f++;
      continue;
    }
    if (t.trimStart().startsWith(`|`)) {
      let e = [];
      for (; f < s.length && s[f].trimStart().startsWith(`|`);) e.push(s[f++]);
      let [t, ...i] = e.filter((e) => !/^\s*\|?\s*:?-{2,}/.test(e));
      c.push(
        `<div class="table"><table><thead><tr>` +
          r(t)
            .map((e) => `<th>${n(e, o)}</th>`)
            .join(``) +
          `</tr></thead><tbody>` +
          i
            .map(
              (e) =>
                `<tr>${r(e)
                  .map((e) => `<td>${n(e, o)}</td>`)
                  .join(``)}</tr>`,
            )
            .join(``) +
          `</tbody></table></div>`,
      );
      continue;
    }
    if (i.test(t)) {
      let e = /^\s*\d+\./.test(t),
        r = [];
      for (; f < s.length && (i.test(s[f]) || /^\s{2,}\S/.test(s[f]));) {
        let e = s[f].match(i);
        if (e && e[1].length < 2) r.push({ text: e[3], sub: [], subOrdered: !1 });
        else if (e && r.length) {
          let t = r[r.length - 1];
          (t.sub.push(e[3]), (t.subOrdered = /^\d+\./.test(e[2])));
        } else r.length && (r[r.length - 1].text += ` ` + s[f].trim());
        f++;
      }
      let a = e ? `ol` : `ul`;
      c.push(
        `<${a}>` +
          r
            .map((e) => {
              let t = e.sub.length
                ? `<${e.subOrdered ? `ol` : `ul`}>${e.sub.map((e) => `<li>${n(e, o)}</li>`).join(``)}</${e.subOrdered ? `ol` : `ul`}>`
                : ``;
              return `<li>${n(e.text, o)}${t}</li>`;
            })
            .join(``) +
          `</${a}>`,
      );
      continue;
    }
    let u = [];
    for (; f < s.length && s[f].trim() && !/^(#{1,3}\s|```|\s*\|)/.test(s[f]) && !i.test(s[f]);)
      u.push(s[f++].trim());
    c.push(`<p>${n(u.join(` `), o)}</p>`);
  }
  return {
    title: d,
    html: c.join(`
`),
    headings: l,
  };
}
export { t as n, a as t };
