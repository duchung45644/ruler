import {
  A as e,
  B as t,
  C as n,
  D as r,
  F as i,
  H as a,
  I as o,
  L as s,
  M as c,
  N as l,
  O as u,
  P as d,
  R as f,
  S as ee,
  T as p,
  V as te,
  W as m,
  _ as ne,
  c as h,
  f as re,
  g,
  h as _,
  j as v,
  k as y,
  l as b,
  m as ie,
  n as ae,
  p as oe,
  r as x,
  t as se,
  u as S,
  v as ce,
  w as C,
  x as w,
  y as T,
} from './app-CwaYE8Do.js';
import { n as E, t as le } from './markdown-SxH2cWR3.js';
var D = { name: `chevron-left`, size: 24, node: [[`path`, { d: `m15 18-6-6 6-6` }]] };
D.node;
var O = new Set([`$$slots`, `$$events`, `$$legacy`]);
function ue(e, t) {
  let n = b(t, O);
  h(
    e,
    S(() => n, {
      get icon() {
        return D;
      },
    }),
  );
}
var k = { name: `chevron-right`, size: 24, node: [[`path`, { d: `m9 18 6-6-6-6` }]] };
k.node;
var A = new Set([`$$slots`, `$$events`, `$$legacy`]);
function de(e, t) {
  let n = b(t, A);
  h(
    e,
    S(() => n, {
      get icon() {
        return k;
      },
    }),
  );
}
var j = {
  name: `menu`,
  size: 24,
  node: [
    [`path`, { d: `M4 5h16` }],
    [`path`, { d: `M4 12h16` }],
    [`path`, { d: `M4 19h16` }],
  ],
};
j.node;
var M = new Set([`$$slots`, `$$events`, `$$legacy`]);
function fe(e, t) {
  let n = b(t, M);
  h(
    e,
    S(() => n, {
      get icon() {
        return j;
      },
    }),
  );
}
var N = {
  name: `search`,
  size: 24,
  node: [
    [`path`, { d: `m21 21-4.34-4.34` }],
    [`circle`, { cx: `11`, cy: `11`, r: `8` }],
  ],
};
N.node;
var P = new Set([`$$slots`, `$$events`, `$$legacy`]);
function pe(e, t) {
  let n = b(t, P);
  h(
    e,
    S(() => n, {
      get icon() {
        return N;
      },
    }),
  );
}
var me = [
    { slug: `getting-started`, group: `Basics` },
    { slug: `dock-and-shortcuts`, group: `Basics` },
    { slug: `inspect`, group: `Tools` },
    { slug: `measure`, group: `Tools` },
    { slug: `design-overlay`, group: `Tools` },
    { slug: `side-panel`, group: `Side panel and editing` },
    { slug: `editing`, group: `Side panel and editing` },
    { slug: `responsive`, group: `More tools` },
    { slug: `capture`, group: `More tools` },
    { slug: `quality`, group: `More tools` },
    { slug: `mcp`, group: `AI agents` },
    { slug: `settings`, group: `Reference` },
    { slug: `troubleshooting`, group: `Reference` },
    { slug: `privacy-permissions`, group: `Reference` },
  ],
  F = `modulepreload`,
  I = function (e, t) {
    return new URL(e, t).href;
  },
  L = {},
  R = function (e) {
    return e.pathname.endsWith(`.css`);
  },
  z = function (e, t, n) {
    if (t in e) return e[t];
    let r = n();
    if (!r) {
      e[t] = void 0;
      return;
    }
    let i = r.then(
      () => {
        e[t] = void 0;
      },
      (n) => {
        throw ((e[t] = void 0), n);
      },
    );
    return ((e[t] = i), i);
  },
  B = function (e, t, n) {
    let r = Promise.resolve();
    if (t && t.length > 0) {
      let e,
        i = document.querySelector(`meta[property=csp-nonce]`),
        a = i?.nonce || i?.getAttribute(`nonce`);
      function o(e) {
        return Promise.all(
          e.map((e) =>
            Promise.resolve(e).then(
              (e) => ({ status: `fulfilled`, value: e }),
              (e) => ({ status: `rejected`, reason: e }),
            ),
          ),
        );
      }
      function s(e) {
        return import.meta.resolve ? new URL(import.meta.resolve(e)) : new URL(e, import.meta.url);
      }
      r = o(
        t
          .map((t) => {
            t = I(t, n);
            let r = s(t),
              i = R(r);
            return z(L, r.href, () => {
              if (e === void 0) {
                e = { all: new Set(), styles: new Set() };
                let t = document.getElementsByTagName(`link`);
                for (let n = t.length - 1; n >= 0; n--) {
                  let r = t[n];
                  (e.all.add(r.href), r.rel === `stylesheet` && e.styles.add(r.href));
                }
              }
              if ((i ? e.styles : e.all).has(r.href)) return;
              let t = document.createElement(`link`);
              if (
                ((t.rel = i ? `stylesheet` : F),
                i || (t.as = `script`),
                (t.crossOrigin = ``),
                (t.href = r.href),
                a && t.setAttribute(`nonce`, a),
                document.head.appendChild(t),
                i)
              )
                return new Promise((e, n) => {
                  (t.addEventListener(`load`, e),
                    t.addEventListener(`error`, () => n(Error(`Unable to preload CSS for ${r}`))));
                });
            });
          })
          .filter((e) => e !== void 0),
      );
    }
    function i(e) {
      let t = new Event(`vite:preloadError`, { cancelable: !0 });
      if (((t.payload = e), window.dispatchEvent(t), !t.defaultPrevented)) throw e;
    }
    return r.then((t) => {
      for (let e of t || []) e.status === `rejected` && i(e.reason);
      return e().catch(i);
    });
  },
  he = p(`<li><a class="block px-3 py-1 text-xs text-subtle hover:text-fg"> </a></li>`),
  ge = p(`<ul class="mt-0.5 ml-3 border-l border-line"></ul>`),
  _e = p(`<li><a> </a> <!></li>`),
  ve = p(
    `<div><h3 class="mb-2 text-xs font-medium tracking-wide text-subtle uppercase"> </h3> <ul class="space-y-0.5"></ul></div>`,
  ),
  ye = p(`<p class="text-subtle"> </p>`),
  be = p(
    `<a class="group rounded-xl border border-line p-4 hover:border-line-strong"><span class="flex items-center gap-1 text-xs text-subtle"><!> </span> <span class="mt-1 block font-medium text-fg group-hover:text-strong"> </span></a>`,
  ),
  xe = p(`<span></span>`),
  Se = p(
    `<a class="group rounded-xl border border-line p-4 text-right hover:border-line-strong"><span class="flex items-center justify-end gap-1 text-xs text-subtle"> <!></span> <span class="mt-1 block font-medium text-fg group-hover:text-strong"> </span></a>`,
  ),
  Ce = p(`<li><a class="text-muted hover:text-fg"> </a></li>`),
  we = p(
    `<h3 class="text-xs font-medium tracking-wide text-subtle uppercase"> </h3> <ul class="mt-3 space-y-1.5 text-sm"></ul>`,
    1,
  ),
  Te = p(
    `<!> <div class="mx-auto flex max-w-7xl gap-10 px-4 sm:px-6"><aside><label class="relative block"><!> <input type="search" class="w-full rounded-lg border border-line bg-surface py-2 pr-3 pl-9 text-sm text-fg placeholder:text-subtle focus:border-indigo-400/50 focus:outline-none"/></label> <nav class="mt-6 space-y-6 text-sm"></nav></aside> <main class="min-w-0 flex-1 py-10 lg:py-14"><button type="button" class="mb-6 flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm text-fg lg:hidden"><!> </button> <p class="text-sm text-accent-fg"> </p> <h1 class="mt-2 text-3xl font-semibold tracking-tight text-strong sm:text-4xl"> </h1> <article class="doc mt-8"></article> <nav class="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"><!> <!></nav></main> <aside class="sticky top-16 hidden h-[calc(100vh-4rem)] w-52 shrink-0 overflow-y-auto py-14 xl:block"><!></aside></div> <!>`,
    1,
  );
function V(r, ee) {
  a(ee, !0);
  let p = {
      en: () => B(() => import(`./docs-en-CqV_Cry1.js`), [], import.meta.url),
      vi: () => B(() => import(`./docs-vi-Dx57vG-8.js`), [], import.meta.url),
    },
    h = o({});
  v(() => {
    let e = x.code;
    h[e] || p[e]().then((t) => (h[e] = t.default));
  });
  let b = me,
    S = (e) => {
      if (/^https?:/.test(e)) return e;
      if (e.startsWith(`privacy-policy`)) return `./privacy.html`;
      let [t, n] = e.split(`#`);
      return t ? `#${t.replace(/\.md$/, ``)}${n ? `/${n}` : ``}` : `#${y(A)}/${n}`;
    },
    D = new Map();
  function O(e, t) {
    let n = h[e]?.[t];
    if (n === void 0) return { title: ``, html: ``, headings: [] };
    let r = `${e}/${t}`,
      i = D.get(r);
    return (i || D.set(r, (i = le(n, S))), i);
  }
  let k = () => {
      let [e, t] = decodeURIComponent(location.hash.slice(1)).split(`/`);
      return { slug: b.some((t) => t.slug === e) ? e : b[0].slug, anchor: t ?? `` };
    },
    A = f(o(k().slug)),
    j = f(o(k().anchor)),
    M = f(``),
    N = f(!1),
    P = f(void 0),
    F = t(() => O(x.code, y(A))),
    I = t(() => b.findIndex((e) => e.slug === y(A))),
    L = t(() => b[y(I) - 1]),
    R = t(() => b[y(I) + 1]),
    z = {
      Basics: `Cơ bản`,
      Tools: `Công cụ`,
      'Side panel and editing': `Side panel và chỉnh sửa`,
      'More tools': `Công cụ khác`,
      'AI agents': `AI agent`,
      Reference: `Tham khảo`,
    },
    V = (e) => (x.code === `vi` ? (z[e] ?? e) : e),
    Ee = t(() => {
      let e = E(y(M)),
        t = [];
      for (let n of b) {
        let r = O(x.code, n.slug),
          i = e ? r.headings.filter((t) => E(t.text).includes(e)).map((e) => e.id) : [];
        if (e && !E(r.title).includes(e) && !i.length) continue;
        let a = t.find((e) => e.name === n.group);
        (a || t.push((a = { name: n.group, items: [] })),
          a.items.push({ slug: n.slug, title: r.title, hits: i }));
      }
      return t;
    }),
    H = t(() =>
      x.code === `vi`
        ? {
            search: `Tìm trong tài liệu`,
            onPage: `Trên trang này`,
            prev: `Trước`,
            next: `Tiếp`,
            menu: `Mục lục`,
            none: `Không tìm thấy`,
          }
        : {
            search: `Search the docs`,
            onPage: `On this page`,
            prev: `Previous`,
            next: `Next`,
            menu: `Contents`,
            none: `No results`,
          },
    );
  (v(() => {
    let e = () => {
      let e = k();
      (s(A, e.slug, !0), s(j, e.anchor, !0), s(N, !1));
    };
    return (addEventListener(`hashchange`, e), () => removeEventListener(`hashchange`, e));
  }),
    v(() => {
      y(F);
      let e = y(j);
      queueMicrotask(() => {
        let t = e ? y(P)?.querySelector(`#${CSS.escape(e)}`) : null;
        t ? t.scrollIntoView() : scrollTo({ top: 0 });
      });
    }),
    v(() => {
      document.title = `${y(F).title} · PixelLens Docs`;
    }));
  let De = (e) => `#${y(A)}/${e}`;
  var U = Te(),
    W = l(U);
  se(W, {});
  var G = i(W, 2),
    K = c(G),
    q = c(K),
    J = c(q);
  pe(J, { size: 15, class: `pointer-events-none absolute top-2.5 left-3 text-subtle` });
  var Y = i(J, 2);
  (ie(Y), m(q));
  var Oe = i(q, 2);
  (T(
    Oe,
    21,
    () => y(Ee),
    (e) => e.name,
    (r, a) => {
      var o = ve(),
        s = c(o),
        l = d(s, !0),
        u = i(s, 2);
      (T(
        u,
        21,
        () => y(a).items,
        (e) => e.slug,
        (r, a) => {
          var o = _e(),
            s = c(o),
            l = d(s, !0),
            u = i(s, 2),
            f = (r) => {
              var i = ge();
              (T(
                i,
                20,
                () => y(a).hits.slice(0, 5),
                (e) => e,
                (r, i) => {
                  let o = t(() => O(x.code, y(a).slug).headings.find((e) => e.id === i));
                  var s = he(),
                    l = c(s),
                    u = d(l, !0);
                  (m(s),
                    e(() => {
                      (_(l, `href`, `#${y(a).slug ?? ``}/${i ?? ``}`), n(u, y(o)?.text));
                    }),
                    C(r, s));
                },
              ),
                m(i),
                C(r, i));
            };
          (w(u, (e) => {
            y(a).hits.length && e(f);
          }),
            m(o),
            e(() => {
              (_(s, `href`, `#${y(a).slug ?? ``}`),
                g(
                  s,
                  1,
                  `block rounded-md px-2.5 py-1.5 transition-colors ${y(a).slug === y(A) ? `bg-indigo-500/10 font-medium text-accent-fg-strong` : `text-muted hover:text-fg`}`,
                ),
                n(l, y(a).title));
            }),
            C(r, o));
        },
      ),
        m(u),
        m(o),
        e((e) => n(l, e), [() => V(y(a).name)]),
        C(r, o));
    },
    (t) => {
      var r = ye(),
        i = d(r, !0);
      (e(() => n(i, y(H).none)), C(t, r));
    },
  ),
    m(Oe),
    m(K));
  var X = i(K, 2),
    Z = c(X),
    ke = c(Z);
  fe(ke, { size: 16 });
  var Ae = i(ke);
  m(Z);
  var je = i(Z, 2),
    Me = d(je, !0),
    Ne = i(je, 2),
    Pe = d(Ne, !0),
    Q = i(Ne, 2);
  (ce(Q, () => y(F).html, !0),
    m(Q),
    re(
      Q,
      (e) => s(P, e),
      () => y(P),
    ));
  var Fe = i(Q, 2),
    Ie = c(Fe),
    Le = (t) => {
      var r = be(),
        a = c(r),
        o = c(a);
      ue(o, { size: 14 });
      var s = i(o, 1, !0);
      m(a);
      var l = i(a, 2),
        u = d(l, !0);
      (m(r),
        e(
          (e) => {
            (_(r, `href`, `#${y(L).slug ?? ``}`), n(s, y(H).prev), n(u, e));
          },
          [() => O(x.code, y(L).slug).title],
        ),
        C(t, r));
    },
    Re = (e) => {
      var t = xe();
      C(e, t);
    };
  w(Ie, (e) => {
    y(L) ? e(Le) : e(Re, -1);
  });
  var ze = i(Ie, 2),
    Be = (t) => {
      var r = Se(),
        a = c(r),
        o = c(a, !0);
      (de(i(o), { size: 14 }), m(a));
      var s = i(a, 2),
        l = d(s, !0);
      (m(r),
        e(
          (e) => {
            (_(r, `href`, `#${y(R).slug ?? ``}`), n(o, y(H).next), n(l, e));
          },
          [() => O(x.code, y(R).slug).title],
        ),
        C(t, r));
    };
  (w(ze, (e) => {
    y(R) && e(Be);
  }),
    m(Fe),
    m(X));
  var $ = i(X, 2),
    Ve = c($),
    He = (t) => {
      var r = we(),
        a = l(r),
        o = d(a, !0),
        s = i(a, 2);
      (T(
        s,
        21,
        () => y(F).headings,
        (e) => e.id,
        (t, r) => {
          var i = Ce(),
            a = c(i),
            o = d(a, !0);
          (m(i),
            e(
              (e) => {
                (g(i, 1, ne(y(r).level === 3 ? `pl-3` : ``)), _(a, `href`, e), n(o, y(r).text));
              },
              [() => De(y(r).id)],
            ),
            C(t, i));
        },
      ),
        m(s),
        e(() => n(o, y(H).onPage)),
        C(t, r));
    };
  (w(Ve, (e) => {
    y(F).headings.length && e(He);
  }),
    m($),
    m(G));
  var Ue = i(G, 2);
  (ae(Ue, {}),
    e(
      (e) => {
        (g(
          K,
          1,
          `fixed inset-x-0 top-16 bottom-0 z-10 overflow-y-auto bg-page px-4 pt-6 pb-10 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:w-60 lg:shrink-0 lg:bg-transparent lg:px-0 ${y(N) ? `block` : `hidden`}`,
        ),
          _(Y, `placeholder`, y(H).search),
          _(Z, `aria-expanded`, y(N)),
          n(Ae, ` ${y(H).menu ?? ``}`),
          n(Me, e),
          n(Pe, y(F).title));
      },
      [() => V(b[y(I)].group)],
    ),
    oe(
      Y,
      () => y(M),
      (e) => s(M, e),
    ),
    u(`click`, Z, () => s(N, !y(N))),
    C(r, U),
    te());
}
(r([`click`]),
  (document.documentElement.lang = x.code),
  ee(V, { target: document.getElementById(`app`) }));
