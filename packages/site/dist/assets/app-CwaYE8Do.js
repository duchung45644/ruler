(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`)
        for (let e of t.addedNodes) e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(e) {
    let t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      (t.credentials =
        e.crossOrigin === `use-credentials`
          ? `include`
          : e.crossOrigin === `anonymous`
            ? `omit`
            : `same-origin`),
      t
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
var e = Array.isArray,
  t = Array.prototype.indexOf,
  n = Array.prototype.includes,
  r = Array.from,
  i = Object.defineProperty,
  a = Object.getOwnPropertyDescriptor,
  o = Object.getOwnPropertyDescriptors,
  s = Object.prototype,
  c = Array.prototype,
  l = Object.getPrototypeOf,
  u = Object.isExtensible;
function d(e) {
  return typeof e == `function`;
}
var f = () => {};
function p(e) {
  return e();
}
function m(e) {
  for (var t = 0; t < e.length; t++) e[t]();
}
function h() {
  var e, t;
  return {
    promise: new Promise((n, r) => {
      ((e = n), (t = r));
    }),
    resolve: e,
    reject: t,
  };
}
function g(e, t, n = !1) {
  return e === void 0 ? (n ? t() : t) : e;
}
function _(e, t) {
  if (Array.isArray(e)) return e;
  if (t === void 0 || !(Symbol.iterator in e)) return Array.from(e);
  let n = [];
  for (let r of e) if ((n.push(r), n.length === t)) break;
  return n;
}
var v = 1 << 24,
  y = 1024,
  b = 2048,
  x = 4096,
  S = 8192,
  ee = 16384,
  te = 32768,
  ne = 1 << 25,
  re = 65536,
  ie = 1 << 19,
  ae = 1 << 20,
  oe = 1 << 25,
  se = 1 << 21,
  ce = 1 << 22,
  le = 1 << 23,
  ue = Symbol(`$state`),
  de = Symbol(`component`),
  fe = Symbol(`legacy props`),
  pe = Symbol(``),
  me = Symbol(`attributes`),
  he = Symbol(`class`),
  ge = Symbol(`style`),
  _e = Symbol(`text`),
  ve = Symbol(`form reset`),
  ye = new (class extends Error {
    name = `StaleReactionError`;
    message = 'The reaction that called `getAbortSignal()` was re-run or destroyed';
  })(),
  be = !!globalThis.document?.contentType && globalThis.document.contentType.includes(`xml`),
  xe = {},
  C = Symbol(`uninitialized`),
  Se = `http://www.w3.org/1999/xhtml`,
  Ce = `http://www.w3.org/2000/svg`,
  we = `http://www.w3.org/1998/Math/MathML`;
function Te() {
  console.warn(`https://svelte.dev/e/derived_inert`);
}
function Ee(e) {
  console.warn(`https://svelte.dev/e/hydration_mismatch`);
}
function De() {
  console.warn(`https://svelte.dev/e/select_multiple_invalid_value`);
}
function Oe() {
  console.warn(`https://svelte.dev/e/svelte_boundary_reset_noop`);
}
var w = !1;
function T(e) {
  w = e;
}
var E;
function D(e) {
  if (e === null) throw (Ee(), xe);
  return (E = e);
}
function ke() {
  return D(I(E));
}
function O(e) {
  if (w) {
    if (I(E) !== null) throw (Ee(), xe);
    E = e;
  }
}
function Ae(e = 1) {
  if (w) {
    for (var t = e, n = E; t--;) n = I(n);
    E = n;
  }
}
function je(e = !0) {
  for (var t = 0, n = E; ;) {
    if (n.nodeType === 8) {
      var r = n.data;
      if (r === `]`) {
        if (t === 0) return n;
        --t;
      } else (r === `[` || r === `[!` || (r[0] === `[` && !isNaN(Number(r.slice(1))))) && (t += 1);
    }
    var i = I(n);
    (e && n.remove(), (n = i));
  }
}
function Me(e) {
  if (!e || e.nodeType !== 8) throw (Ee(), xe);
  return e.data;
}
function Ne(e) {
  return e === this.v;
}
function Pe(e, t) {
  return e == e ? e !== t || (typeof e == `object` && !!e) || typeof e == `function` : t == t;
}
function Fe(e) {
  return !Pe(e, this.v);
}
function Ie(e) {
  throw Error(`https://svelte.dev/e/lifecycle_outside_component`);
}
function Le() {
  throw Error(`https://svelte.dev/e/async_derived_orphan`);
}
function Re(e, t, n) {
  throw Error(`https://svelte.dev/e/each_key_duplicate`);
}
function ze(e) {
  throw Error(`https://svelte.dev/e/effect_in_teardown`);
}
function Be() {
  throw Error(`https://svelte.dev/e/effect_in_unowned_derived`);
}
function Ve(e) {
  throw Error(`https://svelte.dev/e/effect_orphan`);
}
function He() {
  throw Error(`https://svelte.dev/e/effect_update_depth_exceeded`);
}
function Ue(e) {
  throw Error(`https://svelte.dev/e/props_invalid_value`);
}
function We() {
  throw Error(`https://svelte.dev/e/state_descriptors_fixed`);
}
function Ge() {
  throw Error(`https://svelte.dev/e/state_prototype_fixed`);
}
function Ke() {
  throw Error(`https://svelte.dev/e/state_unsafe_mutation`);
}
function qe() {
  throw Error(`https://svelte.dev/e/svelte_boundary_reset_onerror`);
}
var Je = !1;
function Ye() {
  Je = !0;
}
function Xe(e) {
  let t = e.p;
  for (; t !== null && t.c === null;) t = t.p;
  return t?.c ?? null;
}
function Ze(e, t) {
  return (e === null && Ie(t), (e.c ??= new Map(Xe(e) || void 0)));
}
var k = null;
function Qe(e) {
  k = e;
}
function $e(e) {
  return Ze(k, `getContext`).get(e);
}
function et(e, t = !1, n) {
  k = {
    p: k,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: K,
    l: Je && !t ? { s: null, u: null, $: [] } : null,
  };
}
function tt(e) {
  var t = k,
    n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n) En(r);
  }
  return (e !== void 0 && (t.x = e), (t.i = !0), (k = t.p), nt(e));
}
function nt(e = {}) {
  return (i(e, de, { value: !0 }), e);
}
function rt() {
  return !Je || (k !== null && k.l === null);
}
var it = [];
function at() {
  var e = it;
  ((it = []), m(e));
}
function A(e) {
  if (it.length === 0 && !Mt) {
    var t = it;
    queueMicrotask(() => {
      t === it && at();
    });
  }
  it.push(e);
}
function ot() {
  for (; it.length > 0;) at();
}
var st = ~(b | x | y);
function j(e, t) {
  e.f = (e.f & st) | t;
}
function ct(e) {
  e.f & 512 || e.deps === null ? j(e, y) : j(e, x);
}
function lt(e, t) {
  (e.f & 2048 ? t.set(e, b) : e.f & 4096 && t.get(e) !== 2048 && t.set(e, x), j(e, y));
}
function ut(e, t) {
  if (t) {
    let t = document.body;
    ((e.autofocus = !0),
      A(() => {
        document.activeElement === t && e.focus();
      }));
  }
}
var dt = !1;
function ft() {
  dt ||
    ((dt = !0),
    document.addEventListener(
      `reset`,
      (e) => {
        Promise.resolve().then(() => {
          if (!e.defaultPrevented) for (let t of e.target.elements) t[ve]?.();
        });
      },
      { capture: !0 },
    ));
}
function pt(e) {
  var t = U,
    n = K;
  (G(null), Jn(null));
  try {
    return e();
  } finally {
    (G(t), Jn(n));
  }
}
function mt(e, t, n, r = n) {
  e.addEventListener(t, () => pt(n));
  let i = e[ve];
  ((e[ve] = i
    ? () => {
        (i(), r(!0));
      }
    : () => r(!0)),
    ft());
}
function ht(e, t, n, r) {
  let i = rt() ? yt : Ct;
  var a = e.filter((e) => !e.settled),
    o = t.map(i);
  if (n.length === 0 && a.length === 0) {
    r(o);
    return;
  }
  var s = K,
    c = gt(),
    l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
  function u(e) {
    if (!(s.f & 16384)) {
      c();
      try {
        r([...o, ...e]);
      } catch (e) {
        bn(e, s);
      }
      _t();
    }
  }
  var d = vt();
  if (n.length === 0) {
    l.then(() => u([])).finally(d);
    return;
  }
  function f() {
    Promise.all(n.map((e) => xt(e)))
      .then(u)
      .catch((e) => bn(e, s))
      .finally(d);
  }
  l
    ? l.then(() => {
        s.f & 16384 ? d() : (c(), f(), _t());
      })
    : f();
}
function gt() {
  var e = K,
    t = U,
    n = k,
    r = M;
  return function (i = !0) {
    (Jn(e), G(t), Qe(n), i && !(e.f & 16384) && (r?.activate(), r?.apply()));
  };
}
function _t(e = !0) {
  (Jn(null), G(null), Qe(null), e && M?.deactivate());
}
function vt() {
  var e = K,
    t = e.b,
    n = M,
    r = !!t?.is_rendered();
  return (
    t?.update_pending_count(1, n),
    n.increment(r, e),
    () => {
      (t?.update_pending_count(-1, n), n.decrement(r, e));
    }
  );
}
function yt(e) {
  var t = 2 | b;
  return (
    K !== null && (K.f |= ie),
    {
      ctx: k,
      deps: null,
      effects: null,
      equals: Ne,
      f: t,
      fn: e,
      reactions: null,
      rv: 0,
      v: C,
      wv: 0,
      parent: K,
      ac: null,
    }
  );
}
var bt = Symbol(`obsolete`);
function xt(e, t, n) {
  let r = K;
  r === null && Le();
  var i = void 0,
    a = Yt(C),
    o = !U,
    s = new Set();
  return (
    An(() => {
      var t = K,
        n = h();
      i = n.promise;
      try {
        Promise.resolve(e())
          .then(n.resolve, (e) => {
            e !== ye && n.reject(e);
          })
          .finally(_t);
      } catch (e) {
        (n.reject(e), _t());
      }
      var c = M;
      if (o) {
        if (t.f & 32768) var l = vt();
        if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(bt);
        else for (let e of s.values()) e.reject(bt);
        (s.add(n), c.async_deriveds.set(t, n));
      }
      let u = (e, t = void 0) => {
        (l?.(),
          s.delete(n),
          t !== bt &&
            (c.activate(),
            t ? ((a.f |= le), tn(a, t)) : (a.f & 8388608 && (a.f ^= le), tn(a, e)),
            c.deactivate()));
      };
      n.promise.then(u, (e) => u(null, e || `unknown`));
    }),
    wn(() => {
      for (let e of s) e.reject(bt);
    }),
    new Promise((e) => {
      function t(n) {
        function r() {
          n === i ? e(a) : t(i);
        }
        n.then(r, r);
      }
      t(i);
    })
  );
}
function St(e) {
  let t = yt(e);
  return (Xn(t), t);
}
function Ct(e) {
  let t = yt(e);
  return ((t.equals = Fe), t);
}
function wt(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1) H(t[n]);
  }
}
function Tt(e) {
  var t,
    n = K,
    r = e.parent;
  if (!Kn && r !== null && e.v !== C && r.f & 24576) return (Te(), e.v);
  Jn(r);
  try {
    (wt(e), (t = ar(e)));
  } finally {
    Jn(n);
  }
  return t;
}
function Et(e) {
  var t = Tt(e);
  !e.equals(t) &&
  ((e.wv = nr()),
  (!M?.is_fork || e.deps === null) &&
    (M === null ? (e.v = t) : (M.capture(e, t, !0), At?.capture(e, t, !0)), e.deps === null))
    ? j(e, y)
    : Kn || (N === null ? ct(e) : (Cn() || M?.is_fork) && N.set(e, t));
}
function Dt(e) {
  if (e.effects !== null)
    for (let t of e.effects)
      (t.teardown || t.ac) &&
        (t.teardown?.(),
        t.ac !== null &&
          pt(() => {
            (t.ac.abort(ye), (t.ac = null));
          }),
        t.fn !== null && (t.teardown = f),
        cr(t, 0),
        In(t));
}
function Ot(e) {
  if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && lr(t);
}
var kt = null,
  M = null,
  At = null,
  N = null,
  jt = null,
  Mt = !1,
  Nt = !1,
  Pt = null,
  Ft = null,
  It = 0,
  Lt = 1,
  Rt = class e {
    id = Lt++;
    started = !1;
    linked = !0;
    prev = null;
    next = null;
    async_deriveds = new Map();
    current = new Map();
    previous = new Map();
    #e = new Set();
    #t = new Set();
    #n = 0;
    #r = new Map();
    #i = null;
    #a = [];
    #o = [];
    #s = new Map();
    #c = new Map();
    #l = new Set();
    is_fork = !1;
    #u = !1;
    constructor() {
      (kt === null ? (kt = this) : ((kt.next = this), (this.prev = kt)), (kt = this));
    }
    #d() {
      if (this.is_fork) return !0;
      for (let e of this.#r.keys()) if (!this.#f(e)) return !0;
      return !1;
    }
    #f(e) {
      for (var t = e; t !== null; t = t.parent) if (this.#c.has(t)) return !0;
      return !1;
    }
    skip_effect(e) {
      (this.#c.has(e) || this.#c.set(e, { d: [], m: [] }), this.#l.delete(e));
    }
    unskip_effect(e, t = (e) => this.schedule(e)) {
      var n = this.#c.get(e);
      if (n) {
        this.#c.delete(e);
        for (var r of n.d) (j(r, b), t(r));
        for (r of n.m) (j(r, x), t(r));
      }
      this.#l.add(e);
    }
    #p() {
      var e = [];
      for (let i of this.#a)
        if (!(i.f & 16384 || !(i.f & 6144))) {
          for (var t = i, n = !1; t.parent !== null;) {
            t = t.parent;
            var r = t.f;
            if (r & 96) {
              if (!(r & 1024)) {
                n = !0;
                break;
              }
              t.f ^= y;
            }
          }
          n || e.push(t);
        }
      return ((this.#a = []), e);
    }
    #m() {
      this.started = !0;
      for (let [e, t] of this.#s) (j(e, t), this.schedule(e));
      this.apply();
      for (var t = (Pt = []), n = [], r = (Ft = []); this.#a.length > 0;) {
        It++ > 1e3 && (this.#b(), Bt());
        for (let e of this.#p())
          try {
            this.#h(e, t, n);
          } catch (t) {
            throw (Gt(e), this.#d() || this.discard(), t);
          }
      }
      if (((M = null), r.length > 0)) {
        var i = e.ensure();
        for (let e of r) i.schedule(e);
      }
      if (((Pt = null), (Ft = null), this.#d())) {
        (this.#y(n), this.#y(t));
        for (let [e, t] of this.#c) Wt(e, t);
        r.length > 0 && M.#m();
        return;
      }
      let a = this.#g();
      if (a) (this.#y(n), this.#y(t), a.#v(this));
      else {
        this.#s.clear();
        for (let e of this.#e) e(this);
        (this.#e.clear(), (At = this), Ht(n), Ht(t), (At = null), this.#i?.resolve());
        var o = M;
        (this.#n === 0 && (this.#a.length === 0 || o !== null) && this.#b(),
          o !== null && (qt.clear(), o.#m()));
      }
    }
    #h(e, t, n) {
      e.f ^= y;
      for (var r = e.first; r !== null;) {
        var i = r.f,
          a = !!(i & 96);
        if (!((a && i & 1024) || i & 8192 || this.#c.has(r)) && r.fn !== null) {
          a
            ? (r.f ^= y)
            : i & 4
              ? t.push(r)
              : rr(r) && (i & 16 && this.add_dirty_reaction(r, x), lr(r));
          var o = r.first;
          if (o !== null) {
            r = o;
            continue;
          }
        }
        for (; r !== null;) {
          var s = r.next;
          if (s !== null) {
            r = s;
            break;
          }
          r = r.parent;
        }
      }
    }
    #g() {
      for (var e = this.prev; e !== null; e = e.prev) if (!e.is_fork && this.#_(e)) return e;
      return null;
    }
    #_(e) {
      for (let [t, [, n]] of this.current) if (!n && e.current.has(t)) return !0;
      return !1;
    }
    #v(e) {
      for (let [t, n] of e.current)
        (!this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)),
          this.current.set(t, n));
      for (let [t, n] of e.async_deriveds) {
        let e = this.async_deriveds.get(t);
        e && n.promise.then(e.resolve).catch(e.reject);
      }
      (e.async_deriveds.clear(), this.transfer_reactions(e.#s));
      let t = (e) => {
        var n = e.reactions;
        if (n !== null && !(e.f & 2 && !(e.f & 6144)))
          for (let e of n) {
            var r = e.f;
            if (r & 2) t(e);
            else {
              var i = e;
              r & 4194320 &&
                !this.async_deriveds.has(i) &&
                (this.#s.delete(i), j(i, b), this.schedule(i));
            }
          }
      };
      for (let e of this.current.keys()) t(e);
      (this.oncommit(() => e.discard()), e.#b(), (M = this), this.#m());
    }
    #y(e) {
      for (var t = 0; t < e.length; t += 1) lt(e[t], this.#s);
    }
    capture(e, t, n = !1) {
      (e.v !== C && !this.previous.has(e) && this.previous.set(e, e.v),
        e.f & 8388608 || (this.current.set(e, [t, n]), N?.set(e, t)),
        this.is_fork || (e.v = t));
    }
    activate() {
      M = this;
    }
    deactivate() {
      ((M = null), (N = null));
    }
    flush() {
      try {
        ((Nt = !0), (M = this), this.#m());
      } finally {
        ((It = 0),
          (jt = null),
          (Pt = null),
          (Ft = null),
          (Nt = !1),
          (M = null),
          (N = null),
          qt.clear());
      }
    }
    discard() {
      for (let e of this.#t) e(this);
      this.#t.clear();
      for (let e of this.async_deriveds.values()) e.reject(bt);
      (this.#b(), this.#i?.resolve());
    }
    register_created_effect(e) {
      this.#o.push(e);
    }
    increment(e, t) {
      if (((this.#n += 1), e)) {
        let e = this.#r.get(t) ?? 0;
        this.#r.set(t, e + 1);
      }
    }
    decrement(e, t) {
      if ((--this.#n, e)) {
        let e = this.#r.get(t) ?? 0;
        e === 1 ? this.#r.delete(t) : this.#r.set(t, e - 1);
      }
      this.#u ||
        ((this.#u = !0),
        A(() => {
          ((this.#u = !1), this.linked && this.flush());
        }));
    }
    transfer_reactions(e) {
      for (let [t, n] of e) this.add_dirty_reaction(t, n);
      e.clear();
    }
    add_dirty_reaction(e, t) {
      (t === 2048 || this.#s.get(e) !== 2048) && this.#s.set(e, t);
    }
    oncommit(e) {
      this.#e.add(e);
    }
    ondiscard(e) {
      this.#t.add(e);
    }
    settled() {
      return (this.#i ??= h()).promise;
    }
    static ensure() {
      if (M === null) {
        let t = (M = new e());
        !Nt &&
          !Mt &&
          A(() => {
            t.started || t.flush();
          });
      }
      return M;
    }
    apply() {
      N = null;
    }
    schedule(e) {
      ((jt = e),
        e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)
          ? e.b.defer_effect(e)
          : this.#a.push(e));
    }
    #b() {
      if (this.linked) {
        var e = this.prev,
          t = this.next;
        (e === null || (e.next = t), t === null ? (kt = e) : (t.prev = e), (this.linked = !1));
      }
    }
  };
function zt(e) {
  var t = Mt,
    n = At;
  ((At = null), (Mt = !0));
  try {
    var r;
    for (e && (zt(), (r = e())); ;) {
      if ((ot(), M === null)) return r;
      M.flush();
    }
  } finally {
    ((Mt = t), (At = n));
  }
}
function Bt() {
  try {
    He();
  } catch (e) {
    bn(e, jt);
  }
}
var Vt = null;
function Ht(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t;) {
      var r = e[n++];
      if (
        !(r.f & 24576) &&
        rr(r) &&
        ((Vt = new Set()),
        lr(r),
        r.deps === null &&
          r.first === null &&
          r.nodes === null &&
          r.teardown === null &&
          r.ac === null &&
          zn(r),
        Vt?.size > 0)
      ) {
        qt.clear();
        for (let e of Vt) {
          if (e.f & 24576) continue;
          let t = [e],
            n = e.parent;
          for (; n !== null;) (Vt.has(n) && (Vt.delete(n), t.push(n)), (n = n.parent));
          for (let e = t.length - 1; e >= 0; e--) {
            let n = t[e];
            n.f & 24576 || lr(n);
          }
        }
        Vt.clear();
      }
    }
    Vt = null;
  }
}
function Ut(e) {
  M.schedule(e);
}
function Wt(e, t) {
  if (!(e.f & 32 && e.f & 1024)) {
    (e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), j(e, y));
    for (var n = e.first; n !== null;) (Wt(n, t), (n = n.next));
  }
}
function Gt(e) {
  j(e, y);
  for (var t = e.first; t !== null;) (Gt(t), (t = t.next));
}
var Kt = new Set(),
  qt = new Map(),
  Jt = !1;
function Yt(e, t) {
  return { f: 0, v: e, reactions: null, equals: Ne, rv: 0, wv: 0 };
}
function Xt(e, t) {
  let n = Yt(e, t);
  return (Xn(n), n);
}
function Zt(e, t = !1, n = !0) {
  let r = Yt(e);
  return (t || (r.equals = Fe), Je && n && k !== null && k.l !== null && (k.l.s ??= []).push(r), r);
}
function Qt(e, t, n = !1) {
  return (
    U !== null &&
      (!W || U.f & 131072) &&
      rt() &&
      U.f & 4325394 &&
      (Yn === null || !Yn.has(e)) &&
      Ke(),
    tn(e, n ? on(t) : t, Ft)
  );
}
var $t = null,
  en = 0;
function tn(e, t, n = null) {
  if (!e.equals(t)) {
    Kn ? qt.set(e, t) : qt.has(e) || qt.set(e, e.v);
    var r = Rt.ensure();
    if ((r.capture(e, t), e.f & 2)) {
      let t = e;
      (e.f & 2048 && Tt(t), N === null && ct(t));
    }
    ((e.wv = nr()),
      ($t = null),
      (en = 0),
      an(e, b, n),
      ($t = null),
      rt() && K !== null && K.f & 1024 && !(K.f & 96) && (Y === null ? Zn([e]) : Y.push(e)),
      !r.is_fork && Kt.size > 0 && !Jt && nn());
  }
  return t;
}
function nn() {
  Jt = !1;
  for (let e of Kt) {
    e.f & 1024 && j(e, x);
    let t;
    try {
      t = rr(e);
    } catch {
      t = !0;
    }
    t && lr(e);
  }
  Kt.clear();
}
function rn(e) {
  Qt(e, e.v + 1);
}
function an(e, t, n) {
  var r = e.reactions;
  if (r !== null) {
    var i = rt(),
      a = r.length;
    if (((en += a), en > 1e5 && $t === null && ($t = new Set()), $t !== null)) {
      if ($t.has(e)) return;
      $t.add(e);
    }
    for (var o = 0; o < a; o++) {
      var s = r[o],
        c = s.f;
      if (i || s !== K) {
        var l = (c & b) === 0;
        if ((l && j(s, t), c & 131072)) Kt.add(s);
        else if (c & 2) {
          var u = s;
          (N?.delete(u), an(u, x, n));
        } else if (l) {
          var d = s;
          (c & 16 && Vt !== null && Vt.add(d), n === null ? Ut(d) : n.push(d));
        }
      }
    }
  }
}
function on(t) {
  if (typeof t != `object` || !t || ue in t || de in t) return t;
  let n = l(t);
  if (n !== s && n !== c) return t;
  var r = new Map(),
    i = e(t),
    o = Xt(0),
    u = null,
    d = er,
    f = (e) => {
      if (er === d) return e();
      var t = U,
        n = er;
      (G(null), tr(d));
      var r = e();
      return (G(t), tr(n), r);
    };
  return (
    i && r.set(`length`, Xt(t.length, u)),
    new Proxy(t, {
      defineProperty(e, t, n) {
        (`value` in n && n.configurable !== !1 && n.enumerable !== !1 && n.writable !== !1) || We();
        var i = r.get(t);
        return (
          i === void 0
            ? f(() => {
                var e = Xt(n.value, u);
                return (r.set(t, e), e);
              })
            : Qt(i, n.value, !0),
          !0
        );
      },
      deleteProperty(e, t) {
        var n = r.get(t);
        if (n === void 0) {
          if (t in e) {
            let e = f(() => Xt(C, u));
            (r.set(t, e), rn(o));
          }
        } else (Qt(n, C), rn(o));
        return !0;
      },
      get(e, n, i) {
        if (n === ue) return t;
        var o = r.get(n),
          s = n in e;
        if (
          (o === void 0 &&
            (!s || a(e, n)?.writable) &&
            ((o = f(() => Xt(on(s ? e[n] : C), u))), r.set(n, o)),
          o !== void 0)
        ) {
          var c = X(o);
          return c === C ? void 0 : c;
        }
        return Reflect.get(e, n, i);
      },
      getOwnPropertyDescriptor(e, t) {
        this.has?.(e, t);
        var n = Reflect.getOwnPropertyDescriptor(e, t),
          i = r.get(t);
        if (i !== void 0) {
          var a = X(i);
          if (a === C) return;
          if (n && `value` in n) n.value = a;
          else return { enumerable: !0, configurable: !0, value: a, writable: !0 };
        }
        return n;
      },
      has(e, t) {
        if (t === ue) return !0;
        var n = r.get(t),
          i = (n !== void 0 && n.v !== C) || Reflect.has(e, t);
        return (n !== void 0 || ((K !== null || U !== null) && (!i || a(e, t)?.writable))) &&
          (n === void 0 && ((n = f(() => Xt(i ? on(e[t]) : C, u))), r.set(t, n)), X(n) === C)
          ? !1
          : i;
      },
      set(e, t, n, s) {
        var c = r.get(t),
          l = t in e;
        if (i && t === `length`)
          for (var d = n; d < c.v; d += 1) {
            var p = r.get(d + ``);
            p === void 0 ? d in e && ((p = f(() => Xt(C, u))), r.set(d + ``, p)) : Qt(p, C);
          }
        if (c === void 0)
          (!l || a(e, t)?.writable) && ((c = f(() => Xt(void 0, u))), Qt(c, on(n)), r.set(t, c));
        else {
          l = c.v !== C;
          var m = f(() => on(n));
          Qt(c, m);
        }
        var h = Reflect.getOwnPropertyDescriptor(e, t);
        if ((h?.set && h.set.call(s, n), !l)) {
          if (i && typeof t == `string`) {
            var g = r.get(`length`),
              _ = Number(t);
            Number.isInteger(_) && _ >= g.v && Qt(g, _ + 1);
          }
          rn(o);
        }
        return !0;
      },
      ownKeys(e) {
        X(o);
        var t = Reflect.ownKeys(e).filter((e) => {
          var t = r.get(e);
          return t === void 0 || t.v !== C;
        });
        for (var [n, i] of r) i.v !== C && !(n in e) && t.push(n);
        return t;
      },
      setPrototypeOf() {
        Ge();
      },
    })
  );
}
function sn(e) {
  try {
    if (typeof e == `object` && e && ue in e) return e[ue];
  } catch {}
  return e;
}
function cn(e, t) {
  return Object.is(sn(e), sn(t));
}
var ln, un, dn, fn;
function pn() {
  if (ln === void 0) {
    ((ln = window), (un = /Firefox/.test(navigator.userAgent)));
    var e = Element.prototype,
      t = Node.prototype,
      n = Text.prototype;
    ((dn = a(t, `firstChild`).get),
      (fn = a(t, `nextSibling`).get),
      u(e) && ((e[he] = void 0), (e[me] = null), (e[ge] = void 0), (e.__e = void 0)),
      u(n) && (n[_e] = void 0));
  }
}
function P(e = ``) {
  return document.createTextNode(e);
}
function F(e) {
  return dn.call(e);
}
function I(e) {
  return fn.call(e);
}
function L(e, t) {
  if (!w) return F(e);
  var n = F(E);
  if (n === null) n = E.appendChild(P());
  else if (t && n.nodeType !== 3) {
    var r = P();
    return (n?.before(r), D(r), r);
  }
  return (t && vn(n), D(n), n);
}
function mn(e, t = !1) {
  if (!w) {
    var n = F(e);
    return n instanceof Comment && n.data === `` ? I(n) : n;
  }
  if (t) {
    if (E?.nodeType !== 3) {
      var r = P();
      return (E?.before(r), D(r), r);
    }
    vn(E);
  }
  return E;
}
function R(e, t = !1) {
  if (!w) return F(e);
  var n = L(e, t);
  return (O(e), n);
}
function z(e, t = 1, n = !1) {
  let r = w ? E : e;
  for (var i; t--;) ((i = r), (r = I(r)));
  if (!w) return r;
  if (n) {
    if (r?.nodeType !== 3) {
      var a = P();
      return (r === null ? i?.after(a) : r.before(a), D(a), a);
    }
    vn(r);
  }
  return (D(r), r);
}
function hn(e) {
  e.textContent = ``;
}
function gn() {
  return !1;
}
function _n(e, t, n) {
  return t == null || t === `http://www.w3.org/1999/xhtml`
    ? n
      ? document.createElement(e, { is: n })
      : document.createElement(e)
    : n
      ? document.createElementNS(t, e, { is: n })
      : document.createElementNS(t, e);
}
function vn(e) {
  if (e.nodeValue.length < 65536) return;
  let t = e.nextSibling;
  for (; t !== null && t.nodeType === 3;)
    (t.remove(), (e.nodeValue += t.nodeValue), (t = e.nextSibling));
}
function yn(e) {
  var t = K;
  if (t === null) return ((U.f |= le), e);
  if (!(t.f & 32768) && !(t.f & 4)) throw e;
  bn(e, t);
}
function bn(e, t) {
  if (e === xe) throw e;
  if (!(t !== null && t.f & 16384)) {
    for (; t !== null;) {
      if (t.f & 128 && !(t.f & 33570816)) {
        if (!(t.f & 32768)) throw e;
        try {
          t.b.error(e);
          return;
        } catch (t) {
          e = t;
        }
      }
      t = t.parent;
    }
    throw e;
  }
}
function xn(e) {
  (K === null && (U === null && Ve(e), Be()), Kn && ze(e));
}
function Sn(e, t) {
  var n = t.last;
  n === null ? (t.last = t.first = e) : ((n.next = e), (e.prev = n), (t.last = e));
}
function B(e, t) {
  var n = K;
  n !== null && n.f & 8192 && (e |= S);
  var r = {
    ctx: k,
    deps: null,
    nodes: null,
    f: e | b | 512,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: n,
    b: n && n.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null,
  };
  M?.register_created_effect(r);
  var i = r;
  if (e & 4) Pt === null ? Rt.ensure().schedule(r) : Pt.push(r);
  else if (t !== null) {
    try {
      lr(r);
    } catch (e) {
      throw (H(r), e);
    }
    i.deps === null &&
      i.teardown === null &&
      i.nodes === null &&
      i.first === i.last &&
      !(i.f & 524288) &&
      ((i = i.first), e & 16 && e & 65536 && i !== null && (i.f |= re));
  }
  if (i !== null && ((i.parent = n), n !== null && Sn(i, n), U !== null && U.f & 2 && !(e & 64))) {
    var a = U;
    (a.effects ??= []).push(i);
  }
  return r;
}
function Cn() {
  return U !== null && !W;
}
function wn(e) {
  let t = B(8, null);
  return (j(t, y), (t.teardown = e), t);
}
function Tn(e) {
  xn(`$effect`);
  var t = K.f;
  if (!U && t & 32 && k !== null && !k.i) {
    var n = k;
    (n.e ??= []).push(e);
  } else return En(e);
}
function En(e) {
  return B(4 | ae, e);
}
function Dn(e) {
  return (xn(`$effect.pre`), B(8 | ae, e));
}
function On(e) {
  Rt.ensure();
  let t = B(64 | ie, e);
  return (e = {}) =>
    new Promise((n) => {
      e.outro
        ? Bn(t, () => {
            (H(t), n(void 0));
          })
        : (H(t), n(void 0));
    });
}
function kn(e) {
  return B(4, e);
}
function An(e) {
  return B(ce | ie, e);
}
function jn(e, t = 0) {
  return B(8 | t, e);
}
function Mn(e, t = [], n = [], r = []) {
  ht(r, t, n, (t) => {
    B(8, () => {
      e(...t.map(X));
    });
  });
}
function Nn(e, t = 0) {
  return B(16 | t, e);
}
function Pn(e, t = 0) {
  return B(v | t, e);
}
function V(e) {
  return B(32 | ie, e);
}
function Fn(e) {
  var t = e.teardown;
  if (t !== null) {
    let n = Kn,
      r = U;
    (qn(!0), G(null));
    try {
      t.call(null);
    } catch (t) {
      bn(t, e.parent);
    } finally {
      (qn(n), G(r));
    }
  }
}
function In(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null;) {
    let e = n.ac;
    e !== null &&
      pt(() => {
        e.abort(ye);
      });
    var r = n.next;
    (n.f & 64 ? (n.parent = null) : H(n, t), (n = r));
  }
}
function Ln(e) {
  for (var t = e.first; t !== null;) {
    var n = t.next;
    (t.f & 32 || H(t), (t = n));
  }
}
function H(e, t = !0) {
  var n = !1;
  ((t || e.f & 262144) &&
    e.nodes !== null &&
    e.nodes.end !== null &&
    (Rn(e.nodes.start, e.nodes.end), (n = !0)),
    (e.f |= ne),
    In(e, t && !n),
    cr(e, 0));
  var r = e.nodes && e.nodes.t;
  if (r !== null) for (let e of r) e.stop();
  (Fn(e), (e.f ^= ne), (e.f |= ee));
  var i = e.parent;
  (i !== null && i.first !== null && zn(e),
    (e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null));
}
function Rn(e, t) {
  for (; e !== null;) {
    var n = e === t ? null : I(e);
    (e.remove(), (e = n));
  }
}
function zn(e) {
  var t = e.parent,
    n = e.prev,
    r = e.next;
  (n !== null && (n.next = r),
    r !== null && (r.prev = n),
    t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n)));
}
function Bn(e, t, n = !0) {
  var r = [];
  ((e.f |= 256), Vn(e, r, !0));
  var i = () => {
      (n && H(e), t && t());
    },
    a = r.length;
  if (a > 0) {
    var o = () => --a || i();
    for (var s of r) s.out(o);
  } else i();
}
function Vn(e, t, n) {
  if (!(e.f & 8192)) {
    e.f ^= S;
    var r = e.nodes && e.nodes.t;
    if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
    for (var i = e.first; i !== null;) {
      var a = i.next;
      if (!(i.f & 64)) {
        var o = !!(i.f & 65536) || (!!(i.f & 32) && !!(e.f & 16));
        Vn(i, t, o ? n : !1);
      }
      i = a;
    }
  }
}
function Hn(e) {
  ((e.f &= -257), Un(e, !0));
}
function Un(e, t) {
  if (!(e.f & 256) && e.f & 8192) {
    ((e.f ^= S), e.f & 1024 || (j(e, b), Rt.ensure().schedule(e)));
    for (var n = e.first; n !== null;) {
      var r = n.next,
        i = !!(n.f & 65536) || !!(n.f & 32);
      (Un(n, i ? t : !1), (n = r));
    }
    var a = e.nodes && e.nodes.t;
    if (a !== null) for (let e of a) (e.is_global || t) && e.in();
  }
}
function Wn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
      var i = n === r ? null : I(n);
      (t.append(n), (n = i));
    }
}
var Gn = null,
  Kn = !1;
function qn(e) {
  Kn = e;
}
var U = null,
  W = !1;
function G(e) {
  U = e;
}
var K = null;
function Jn(e) {
  K = e;
}
var Yn = null;
function Xn(e) {
  U !== null && (U.f & 2097152 || U.f & 2) && (Yn ??= new Set()).add(e);
}
var q = null,
  J = 0,
  Y = null;
function Zn(e) {
  Y = e;
}
var Qn = 1,
  $n = 0,
  er = $n;
function tr(e) {
  er = e;
}
function nr() {
  return ++Qn;
}
function rr(e) {
  var t = e.f;
  if (t & 2048) return !0;
  if (t & 4096) {
    for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
      var a = n[i];
      if ((rr(a) && Et(a), a.wv > e.wv)) return !0;
    }
    t & 512 && N === null && j(e, y);
  }
  return !1;
}
function ir(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Yn !== null && Yn.has(e)))
    for (var i = 0; i < r.length; i++) {
      var a = r[i];
      a.f & 2 ? ir(a, t, !1) : t === a && (n ? j(a, b) : a.f & 1024 && j(a, x), Ut(a));
    }
}
function ar(e) {
  var t = q,
    n = J,
    r = Y,
    i = U,
    a = Yn,
    o = k,
    s = W,
    c = er,
    l = e.f;
  ((q = null),
    (J = 0),
    (Y = null),
    (U = l & 96 ? null : e),
    (Yn = null),
    Qe(e.ctx),
    (W = !1),
    (er = ++$n),
    e.ac !== null &&
      (pt(() => {
        e.ac.abort(ye);
      }),
      (e.ac = null)));
  try {
    e.f |= se;
    var u = e.fn,
      d = u();
    e.f |= te;
    var f = or(e);
    if (rt() && Y !== null && !W && f !== null && !(e.f & 6146))
      for (var p = 0; p < Y.length; p++) ir(Y[p], e);
    if (i !== null && i !== e) {
      if (($n++, i.deps !== null)) for (let e = 0; e < n; e += 1) i.deps[e].rv = $n;
      if (t !== null) for (let e of t) e.rv = $n;
      Y !== null && (r === null ? (r = Y) : r.push(...Y));
    }
    return (e.f & 8388608 && (e.f ^= le), d);
  } catch (t) {
    return (or(e), yn(t));
  } finally {
    ((e.f ^= se), (q = t), (J = n), (Y = r), (U = i), (Yn = a), Qe(o), (W = s), (er = c));
  }
}
function or(e) {
  var t = e.deps,
    n = M?.is_fork;
  if (q !== null) {
    var r;
    if ((n || cr(e, J), t !== null && J > 0))
      for (t.length = J + q.length, r = 0; r < q.length; r++) t[J + r] = q[r];
    else e.deps = t = q;
    if (Cn() && e.f & 512) for (r = J; r < t.length; r++) (t[r].reactions ??= []).push(e);
  } else !n && t !== null && J < t.length && (cr(e, J), (t.length = J));
  return t;
}
function sr(e, r) {
  let i = r.reactions;
  if (i !== null) {
    var a = t.call(i, e);
    if (a !== -1) {
      var o = i.length - 1;
      o === 0 ? (i = r.reactions = null) : ((i[a] = i[o]), i.pop());
    }
  }
  if (i === null && r.f & 2 && (q === null || !n.call(q, r))) {
    var s = r;
    (s.f & 512 && (s.f ^= 512),
      s.v !== C && ct(s),
      s.ac !== null &&
        pt(() => {
          (s.ac.abort(ye), (s.ac = null), j(s, b));
        }),
      Dt(s),
      cr(s, 0));
  }
}
function cr(e, t) {
  var n = e.deps;
  if (n !== null) for (var r = t; r < n.length; r++) sr(e, n[r]);
}
function lr(e) {
  var t = e.f;
  if (!(t & 16384)) {
    j(e, y);
    var n = K;
    K = e;
    try {
      (t & 16777232 ? Ln(e) : In(e), Fn(e));
      var r = ar(e);
      ((e.teardown = typeof r == `function` ? r : null), (e.wv = Qn));
    } finally {
      K = n;
    }
  }
}
async function ur() {
  (await Promise.resolve(), zt());
}
function X(e) {
  var t = !!(e.f & 2);
  if (
    (Gn?.add(e), U !== null && !W && !(K !== null && K.f & 16384) && (Yn === null || !Yn.has(e)))
  ) {
    var r = U.deps;
    if (U.f & 2097152)
      e.rv < $n &&
        ((e.rv = $n),
        q === null && r !== null && r[J] === e ? J++ : q === null ? (q = [e]) : q.push(e));
    else {
      ((U.deps ??= []), n.call(U.deps, e) || U.deps.push(e));
      var i = e.reactions;
      i === null ? (e.reactions = [U]) : n.call(i, U) || i.push(U);
    }
  }
  if (Kn && qt.has(e)) return qt.get(e);
  if (t) {
    var a = e;
    if (Kn) {
      var o = a.v;
      return (((!(a.f & 1024) && a.reactions !== null) || fr(a)) && (o = Tt(a)), qt.set(a, o), o);
    }
    var s = !(a.f & 512) && !W && U !== null && !!(U.f & 512),
      c = (a.f & te) === 0;
    (rr(a) && (s && (a.f |= 512), Et(a)), s && !c && (Ot(a), dr(a)));
  }
  if (N?.has(e)) return N.get(e);
  if (e.f & 8388608) throw e.v;
  return e.v;
}
function dr(e) {
  if (((e.f |= 512), e.deps !== null))
    for (let r of e.deps) {
      var t = r.reactions;
      (t === null ? (r.reactions = [e]) : n.call(t, e) || t.push(e),
        r.f & 2 && !(r.f & 512) && (Ot(r), dr(r)));
    }
}
function fr(e) {
  if (e.v === C) return !0;
  if (e.deps === null) return !1;
  for (let t of e.deps) if (qt.has(t) || (t.f & 2 && fr(t))) return !0;
  return !1;
}
function pr(e) {
  var t = W;
  try {
    return ((W = !0), e());
  } finally {
    W = t;
  }
}
function mr(e) {
  if (!(typeof e != `object` || !e || e instanceof EventTarget)) {
    if (ue in e) hr(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        let n = e[t];
        typeof n == `object` && n && ue in n && hr(n);
      }
  }
}
function hr(e, t = new Set()) {
  if (typeof e == `object` && e && !(e instanceof EventTarget) && !t.has(e)) {
    (t.add(e), e instanceof Date && e.getTime());
    for (let n in e)
      try {
        hr(e[n], t);
      } catch {}
    let n = l(e);
    if (
      n !== Object.prototype &&
      n !== Array.prototype &&
      n !== Map.prototype &&
      n !== Set.prototype &&
      n !== Date.prototype
    ) {
      let t = o(n);
      for (let n in t) {
        let r = t[n].get;
        if (r)
          try {
            r.call(e);
          } catch {}
      }
    }
  }
}
function gr(e) {
  return e.endsWith(`capture`) && e !== `gotpointercapture` && e !== `lostpointercapture`;
}
var _r = [
  `beforeinput`,
  `click`,
  `change`,
  `dblclick`,
  `contextmenu`,
  `focusin`,
  `focusout`,
  `input`,
  `keydown`,
  `keyup`,
  `mousedown`,
  `mousemove`,
  `mouseout`,
  `mouseover`,
  `mouseup`,
  `pointerdown`,
  `pointermove`,
  `pointerout`,
  `pointerover`,
  `pointerup`,
  `touchend`,
  `touchmove`,
  `touchstart`,
];
function vr(e) {
  return _r.includes(e);
}
var yr =
    `allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback`.split(
      `.`,
    ),
  br = {
    formnovalidate: `formNoValidate`,
    ismap: `isMap`,
    nomodule: `noModule`,
    playsinline: `playsInline`,
    readonly: `readOnly`,
    defaultvalue: `defaultValue`,
    defaultchecked: `defaultChecked`,
    srcobject: `srcObject`,
    novalidate: `noValidate`,
    allowfullscreen: `allowFullscreen`,
    disablepictureinpicture: `disablePictureInPicture`,
    disableremoteplayback: `disableRemotePlayback`,
  };
function xr(e) {
  return ((e = e.toLowerCase()), br[e] ?? e);
}
[...yr];
var Sr = [`touchstart`, `touchmove`];
function Cr(e) {
  return Sr.includes(e);
}
var wr = [`textarea`, `script`, `style`, `title`];
function Tr(e) {
  return wr.includes(e);
}
var Er = Symbol(`events`),
  Dr = new Set(),
  Or = new Set();
function kr(e, t, n, r = {}) {
  function i(e) {
    if ((r.capture || Pr.call(t, e), !e.cancelBubble)) return pt(() => n?.call(this, e));
  }
  return (
    e.startsWith(`pointer`) || e.startsWith(`touch`) || e === `wheel`
      ? ((i.__removed = !1),
        A(() => {
          i.__removed || t.addEventListener(e, i, r);
        }))
      : t.addEventListener(e, i, r),
    i
  );
}
function Ar(e, t, n) {
  (t[Er] ??= {})[e] = n;
}
function jr(e) {
  for (var t = 0; t < e.length; t++) Dr.add(e[t]);
  for (var n of Or) n(e);
}
var Mr = null,
  Nr = !1;
function Pr(e) {
  var t = this,
    n = t.ownerDocument,
    r = e.type,
    a = e.composedPath?.() || [],
    o = a[0] || e.target;
  ((Mr = e),
    Nr ||
      ((Nr = !0),
      setTimeout(() => {
        ((Nr = !1), (Mr = null));
      })));
  var s = 0,
    c = Mr === e && e[Er];
  if (c) {
    var l = a.indexOf(c);
    if (l !== -1 && (t === document || t === window)) {
      e[Er] = t;
      return;
    }
    var u = a.indexOf(t);
    if (u === -1) return;
    l <= u && (s = l);
  }
  if (((o = a[s] || e.target), o !== t)) {
    i(e, `currentTarget`, {
      configurable: !0,
      get() {
        return o || n;
      },
    });
    var d = U,
      f = K;
    (G(null), Jn(null));
    try {
      for (var p, m = []; o !== null && o !== t;) {
        try {
          var h = o[Er]?.[r];
          h == null || (o.disabled && e.target !== o) || h.call(o, e);
        } catch (e) {
          p ? m.push(e) : (p = e);
        }
        if (e.cancelBubble) break;
        (s++, (o = s < a.length ? a[s] : null));
      }
      if (p) {
        for (let e of m)
          queueMicrotask(() => {
            throw e;
          });
        throw p;
      }
    } finally {
      ((e[Er] = t), delete e.currentTarget, G(d), Jn(f));
    }
  }
}
var Fr =
  globalThis?.window?.trustedTypes &&
  globalThis.window.trustedTypes.createPolicy(`svelte-trusted-html`, { createHTML: (e) => e });
function Ir(e) {
  return Fr?.createHTML(e) ?? e;
}
function Lr(e) {
  var t = _n(`template`);
  return ((t.innerHTML = Ir(e.replaceAll(`<!>`, `<!---->`))), t.content);
}
function Z(e, t) {
  var n = K;
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
function Rr(e, t) {
  var n = !!(t & 1),
    r = !!(t & 2),
    i,
    a = !e.startsWith(`<!>`);
  return () => {
    if (w) return (Z(E, null), E);
    i === void 0 && ((i = Lr(a ? e : `<!>` + e)), n || (i = F(i)));
    var t = r || un ? document.importNode(i, !0) : i.cloneNode(!0);
    if (n) {
      var o = F(t),
        s = t.lastChild;
      Z(o, s);
    } else Z(t, t);
    return t;
  };
}
function zr(e, t, n = `svg`) {
  var r = !e.startsWith(`<!>`),
    i = !!(t & 1),
    a = `<${n}>${r ? e : `<!>` + e}</${n}>`,
    o;
  return () => {
    if (w) return (Z(E, null), E);
    if (!o) {
      var e = F(Lr(a));
      if (i) for (o = document.createDocumentFragment(); F(e);) o.appendChild(F(e));
      else o = F(e);
    }
    var t = o.cloneNode(!0);
    if (i) {
      var n = F(t),
        r = t.lastChild;
      Z(n, r);
    } else Z(t, t);
    return t;
  };
}
function Br(e, t) {
  return zr(e, t, `svg`);
}
function Vr(e = ``) {
  if (!w) {
    var t = P(e + ``);
    return (Z(t, t), t);
  }
  var n = E;
  return (n.nodeType === 3 ? vn(n) : (n.before((n = P())), D(n)), Z(n, n), n);
}
function Hr() {
  if (w) return (Z(E, null), E);
  var e = document.createDocumentFragment(),
    t = document.createComment(``),
    n = P();
  return (e.append(t, n), Z(t, n), e);
}
function Ur(e, t) {
  if (w) {
    var n = K;
    ((n.f & 32768 && n.nodes.end !== null) || (n.nodes.end = E), ke());
  } else e !== null && e.before(t);
}
function Wr(e) {
  let t = 0,
    n = Yt(0),
    r;
  return () => {
    Cn() &&
      (X(n),
      jn(
        () => (
          t === 0 && (r = pr(() => e(() => rn(n)))),
          (t += 1),
          () => {
            A(() => {
              (--t, t === 0 && (r?.(), (r = void 0), rn(n)));
            });
          }
        ),
      ));
  };
}
var Gr = re | ie;
function Kr(e, t, n, r) {
  new qr(e, t, n, r);
}
var qr = class {
  parent;
  is_pending = !1;
  transform_error;
  #e;
  #t = w ? E : null;
  #n;
  #r;
  #i;
  #a = null;
  #o = null;
  #s = null;
  #c = null;
  #l = 0;
  #u = 0;
  #d = !1;
  #f = new Map();
  #p = null;
  #m = Wr(
    () => (
      (this.#p = Yt(this.#l)),
      () => {
        this.#p = null;
      }
    ),
  );
  constructor(e, t, n, r) {
    ((this.#e = e),
      (this.#n = t),
      (this.#r = (e) => {
        var t = K;
        ((t.b = this), (t.f |= 128), n(e));
      }),
      (this.parent = K.b),
      (this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e)),
      (this.#i = Nn(() => {
        if (w) {
          let e = Me(this.#t);
          ke();
          let t = e === `[!`;
          if (e.startsWith(`[?`)) {
            let t = JSON.parse(e.slice(2));
            this.#g(t);
          } else t ? this.#y() : this.#h();
        } else this.#b();
      }, Gr)),
      w && (this.#e = E));
  }
  #h() {
    try {
      this.#a = V(() => this.#r(this.#e));
    } catch (e) {
      this.error(e);
    }
  }
  #g(e) {
    let t = this.#n.failed,
      { reset: n, invoke_onerror: r } = this.#_(e);
    (A(r),
      t &&
        (this.#s = V(() => {
          t(
            this.#e,
            () => e,
            () => n,
          );
        })));
  }
  #_(e) {
    var t = !1,
      n = !1;
    let r = () => {
      this.#v() ||
        (t
          ? Oe()
          : ((t = !0),
            n && qe(),
            this.#s !== null &&
              Bn(this.#s, () => {
                this.#s = null;
              }),
            this.#S(() => {
              this.#b();
            })));
    };
    return {
      reset: r,
      invoke_onerror: () => {
        if (!this.#v())
          try {
            ((n = !0), this.#n.onerror?.(e, r), (n = !1));
          } catch (e) {
            bn(e, this.#i && this.#i.parent);
          }
      },
    };
  }
  #v() {
    return (this.#i.f & (ee | ne)) !== 0;
  }
  #y() {
    let e = this.#n.pending;
    e &&
      ((this.is_pending = !0),
      (this.#o = V(() => e(this.#e))),
      A(() => {
        if (!this.#v()) {
          var e = (this.#c = document.createDocumentFragment()),
            t = P(),
            n = !1;
          (e.append(t),
            (this.#a = this.#S(() => {
              try {
                return V(() => this.#r(t));
              } catch (e) {
                try {
                  (this.error(e), (n = !0));
                } catch (e) {
                  bn(e, this.#i.parent);
                }
                return null;
              }
            })),
            this.#a === null
              ? ((this.#c = null), n && this.#x(M))
              : this.#u === 0 &&
                (this.#e.before(e),
                (this.#c = null),
                Bn(this.#o, () => {
                  this.#o = null;
                }),
                this.#x(M)));
        }
      }));
  }
  #b() {
    try {
      if (
        ((this.is_pending = this.has_pending_snippet()),
        (this.#u = 0),
        (this.#l = 0),
        (this.#a = V(() => {
          this.#r(this.#e);
        })),
        this.#u > 0)
      ) {
        var e = (this.#c = document.createDocumentFragment());
        Wn(this.#a, e);
        let t = this.#n.pending;
        this.#o = V(() => t(this.#e));
      } else this.#x(M);
    } catch (e) {
      this.error(e);
    }
  }
  #x(e) {
    ((this.is_pending = !1), e.transfer_reactions(this.#f));
  }
  defer_effect(e) {
    lt(e, this.#f);
  }
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#n.pending;
  }
  #S(e) {
    var t = K,
      n = U,
      r = k;
    (Jn(this.#i), G(this.#i), Qe(this.#i.ctx));
    try {
      return (Rt.ensure(), e());
    } finally {
      (Jn(t), G(n), Qe(r));
    }
  }
  #C(e, t) {
    this.has_pending_snippet()
      ? ((this.#u += e),
        this.#u === 0 &&
          (this.#x(t),
          this.#o &&
            Bn(this.#o, () => {
              this.#o = null;
            }),
          (this.#c &&= (this.#e.before(this.#c), null))))
      : this.parent && this.parent.#C(e, t);
  }
  update_pending_count(e, t) {
    (this.#C(e, t),
      (this.#l += e),
      !this.#p ||
        this.#d ||
        ((this.#d = !0),
        A(() => {
          ((this.#d = !1), this.#p && tn(this.#p, this.#l));
        })));
  }
  get_effect_pending() {
    return (this.#m(), X(this.#p));
  }
  error(e) {
    if (e === xe || (!this.#n.onerror && !this.#n.failed)) throw e;
    M?.is_fork
      ? (this.#a && M.skip_effect(this.#a),
        this.#o && M.skip_effect(this.#o),
        this.#s && M.skip_effect(this.#s),
        M.oncommit(() => {
          this.#v() || this.#w(e);
        }))
      : this.#w(e);
  }
  #w(e) {
    ((this.#a &&= (H(this.#a), null)),
      (this.#o &&= (H(this.#o), null)),
      (this.#s &&= (H(this.#s), null)),
      w && (D(this.#t), Ae(), D(je())));
    let t = this.#n.failed,
      n = (e) => {
        if (this.#v()) return;
        let { reset: n, invoke_onerror: r } = this.#_(e);
        (r(),
          t &&
            !this.#v() &&
            (this.#s = this.#S(() => {
              try {
                return V(() => {
                  var r = K;
                  ((r.b = this),
                    (r.f |= 128),
                    t(
                      this.#e,
                      () => e,
                      () => n,
                    ));
                });
              } catch (e) {
                return (bn(e, this.#i.parent), null);
              }
            })));
      };
    A(() => {
      if (!this.#v()) {
        var t;
        try {
          t = this.transform_error(e);
        } catch (e) {
          bn(e, this.#i && this.#i.parent);
          return;
        }
        typeof t == `object` && t && typeof t.then == `function`
          ? t.then(n, (e) => bn(e, this.#i && this.#i.parent))
          : n(t);
      }
    });
  }
};
function Q(e, t) {
  var n = t == null ? `` : typeof t == `object` ? `${t}` : t;
  n !== (e[_e] ??= e.nodeValue) && ((e[_e] = n), (e.nodeValue = `${n}`));
}
function Jr(e, t) {
  return Xr(e, t);
}
var Yr = new Map();
function Xr(
  e,
  { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c },
) {
  pn();
  var l = void 0,
    u = On(() => {
      var s = n ?? t.appendChild(P());
      Kr(
        s,
        { pending: () => {} },
        (t) => {
          et({});
          var n = k;
          if (
            (o && (n.c = o),
            a && (i.$$events = a),
            w && Z(t, null),
            (l = e(t, i) || nt()),
            w && ((K.nodes.end = E), E === null || E.nodeType !== 8 || E.data !== `]`))
          )
            throw (Ee(), xe);
          tt();
        },
        c,
      );
      var u = new Set(),
        d = (e) => {
          for (var n = 0; n < e.length; n++) {
            var r = e[n];
            if (!u.has(r)) {
              u.add(r);
              var i = Cr(r);
              for (let e of [t, document]) {
                var a = Yr.get(e);
                a === void 0 && ((a = new Map()), Yr.set(e, a));
                var o = a.get(r);
                o === void 0
                  ? (e.addEventListener(r, Pr, { passive: i }), a.set(r, 1))
                  : a.set(r, o + 1);
              }
            }
          }
        };
      return (
        d(r(Dr)),
        Or.add(d),
        () => {
          for (var e of u)
            for (let n of [t, document]) {
              var r = Yr.get(n),
                i = r.get(e);
              --i == 0
                ? (n.removeEventListener(e, Pr), r.delete(e), r.size === 0 && Yr.delete(n))
                : r.set(e, i);
            }
          (Or.delete(d), s !== n && s.parentNode?.removeChild(s));
        }
      );
    });
  return (Zr.set(l, u), l);
}
var Zr = new WeakMap(),
  Qr = class {
    anchor;
    #e = new Map();
    #t = new Map();
    #n = new Map();
    #r = new Set();
    #i = !0;
    constructor(e, t = !0) {
      ((this.anchor = e), (this.#i = t));
    }
    #a = (e) => {
      if (this.#e.has(e)) {
        var t = this.#e.get(e),
          n = this.#t.get(t);
        if (n) (Hn(n), this.#r.delete(t));
        else {
          var r = this.#n.get(t);
          r &&
            (Hn(r.effect),
            this.#t.set(t, r.effect),
            this.#n.delete(t),
            r.fragment.lastChild.remove(),
            this.anchor.before(r.fragment),
            (n = r.effect));
        }
        for (let [t, n] of this.#e) {
          if ((this.#e.delete(t), t === e)) break;
          let r = this.#n.get(n);
          r && (H(r.effect), this.#n.delete(n));
        }
        for (let [e, r] of this.#t) {
          if (e === t || this.#r.has(e)) continue;
          let i = () => {
            if (Array.from(this.#e.values()).includes(e)) {
              var t = document.createDocumentFragment();
              (Wn(r, t), t.append(P()), this.#n.set(e, { effect: r, fragment: t }));
            } else H(r);
            (this.#r.delete(e), this.#t.delete(e));
          };
          this.#i || !n ? (this.#r.add(e), Bn(r, i, !1)) : i();
        }
      }
    };
    #o = (e) => {
      this.#e.delete(e);
      let t = Array.from(this.#e.values());
      for (let [e, n] of this.#n) t.includes(e) || (H(n.effect), this.#n.delete(e));
    };
    ensure(e, t) {
      var n = M,
        r = gn();
      if (t && !this.#t.has(e) && !this.#n.has(e)) {
        if (r) {
          var i = document.createDocumentFragment(),
            a = P();
          (i.append(a), this.#n.set(e, { effect: V(() => t(a)), fragment: i }));
        } else
          this.#t.set(
            e,
            V(() => t(this.anchor)),
          );
      }
      if ((this.#e.set(n, e), r)) {
        for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
        for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
        (n.oncommit(this.#a), n.ondiscard(this.#o));
      } else (w && (this.anchor = E), this.#a(n));
    }
  };
function $r(e, t, n = !1) {
  var r;
  w && ((r = E), ke());
  var i = new Qr(e),
    a = n ? re : 0;
  function o(e, t) {
    if (w) {
      var n = Me(r);
      if (e !== parseInt(n.substring(1))) {
        var a = je();
        (D(a), (i.anchor = a), T(!1), i.ensure(e, t), T(!0));
        return;
      }
    }
    i.ensure(e, t);
  }
  Nn(() => {
    var e = !1;
    (t((t, n = 0) => {
      ((e = !0), o(n, t));
    }),
      e || o(-1, null));
  }, a);
}
function ei(e, t) {
  return t;
}
function ti(e, t, n) {
  for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
    let n = t[c];
    Bn(
      n,
      () => {
        if (o) {
          if ((o.pending.delete(n), o.done.add(n), o.pending.size === 0)) {
            var t = e.outrogroups;
            (ni(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null));
          }
        } else --s;
      },
      !1,
    );
  }
  if (s === 0) {
    var l = i.length === 0 && n !== null && e.pending.size === 0;
    if (l) {
      var u = n,
        d = u.parentNode;
      (hn(d), d.append(u), e.items.clear());
    }
    ni(e, t, !l);
  } else ((o = { pending: new Set(t), done: new Set() }), (e.outrogroups ??= new Set()).add(o));
}
function ni(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r = new Set();
    for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
  }
  for (var i = 0; i < t.length; i++) {
    var a = t[i];
    r?.has(a) ? ((a.f |= oe), Wn(a, document.createDocumentFragment())) : H(t[i], n);
  }
}
var ri;
function ii(t, n, i, a, o, s = null) {
  var c = t,
    l = new Map();
  if (n & 4) {
    var u = t;
    c = w ? D(F(u)) : u.appendChild(P());
  }
  w && ke();
  var d = null,
    f = Ct(() => {
      var t = i();
      return e(t) ? t : t == null ? [] : r(t);
    }),
    p = new Map(),
    m = !0;
  function h(e) {
    if (!(_.effect.f & 16384)) {
      _.pending.delete(e);
      var t = X(f);
      ((_.fallback = d),
        oi(_, t, c, n, a),
        d !== null &&
          (t.length === 0
            ? d.f & 33554432
              ? ((d.f ^= oe), ci(d, null, c))
              : Hn(d)
            : Bn(d, () => {
                d = null;
              })));
    }
  }
  function g(e) {
    _.pending.delete(e);
  }
  var _ = {
    effect: Nn(() => {
      var e = X(f),
        t = e.length;
      let r = !1;
      w && (Me(c) === `[!`) != (t === 0) && ((c = je()), D(c), T(!1), (r = !0));
      for (var u = new Set(), _ = M, v = gn(), y = 0; y < t; y += 1) {
        w && E.nodeType === 8 && E.data === `]` && ((c = E), (r = !0), T(!1));
        var b = e[y],
          x = a(b, y),
          S = m ? null : l.get(x);
        (S
          ? (S.v && tn(S.v, b), S.i && tn(S.i, y), v && _.unskip_effect(S.e))
          : ((S = si(l, m ? c : (ri ??= P()), b, x, y, o, n, i)), m || (S.e.f |= oe), l.set(x, S)),
          u.add(x));
      }
      if (
        (t === 0 &&
          s &&
          !d &&
          (m ? (d = V(() => s(c))) : ((d = V(() => s((ri ??= P())))), (d.f |= oe))),
        t > u.size && Re(``, ``, ``),
        w && t > 0 && D(je()),
        !m)
      ) {
        if ((p.set(_, u), v)) {
          for (let [e, t] of l) u.has(e) || _.skip_effect(t.e);
          (_.oncommit(h), _.ondiscard(g));
        } else h(_);
      }
      (r && T(!0), X(f));
    }),
    flags: n,
    items: l,
    pending: p,
    outrogroups: null,
    fallback: d,
  };
  ((m = !1), w && (c = E));
}
function ai(e) {
  for (; e !== null && !(e.f & 32);) e = e.next;
  return e;
}
function oi(e, t, n, i, a) {
  var o = !!(i & 8),
    s = t.length,
    c = e.items,
    l = ai(e.effect.first),
    u,
    d = null,
    f,
    p = [],
    m = [],
    h,
    g,
    _,
    v;
  if (o)
    for (v = 0; v < s; v += 1)
      ((h = t[v]),
        (g = a(h, v)),
        (_ = c.get(g).e),
        _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= new Set()).add(_)));
  for (v = 0; v < s; v += 1) {
    if (((h = t[v]), (g = a(h, v)), (_ = c.get(g).e), e.outrogroups !== null))
      for (let t of e.outrogroups) (t.pending.delete(_), t.done.delete(_));
    if (
      (_.f & 8192 && (Hn(_), o && (_.nodes?.a?.unfix(), (f ??= new Set()).delete(_))),
      _.f & 33554432)
    ) {
      if (((_.f ^= oe), _ === l)) ci(_, null, n);
      else {
        var y = d ? d.next : l;
        (_ === e.effect.last && (e.effect.last = _.prev),
          _.prev && (_.prev.next = _.next),
          _.next && (_.next.prev = _.prev),
          li(e, d, _),
          li(e, _, y),
          ci(_, y, n),
          (d = _),
          (p = []),
          (m = []),
          (l = ai(d.next)));
        continue;
      }
    }
    if (_ !== l) {
      if (u !== void 0 && u.has(_)) {
        if (p.length < m.length) {
          var b = m[0],
            x;
          d = b.prev;
          var S = p[0],
            ee = p[p.length - 1];
          for (x = 0; x < p.length; x += 1) ci(p[x], b, n);
          for (x = 0; x < m.length; x += 1) u.delete(m[x]);
          (li(e, S.prev, ee.next),
            li(e, d, S),
            li(e, ee, b),
            (l = b),
            (d = ee),
            --v,
            (p = []),
            (m = []));
        } else
          (u.delete(_),
            ci(_, l, n),
            li(e, _.prev, _.next),
            li(e, _, d === null ? e.effect.first : d.next),
            li(e, d, _),
            (d = _));
        continue;
      }
      for (p = [], m = []; l !== null && l !== _;)
        ((u ??= new Set()).add(l), m.push(l), (l = ai(l.next)));
      if (l === null) continue;
    }
    (_.f & 33554432 || p.push(_), (d = _), (l = ai(_.next)));
  }
  if (e.outrogroups !== null) {
    for (let t of e.outrogroups)
      t.pending.size === 0 && (ni(e, r(t.done)), e.outrogroups?.delete(t));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || u !== void 0) {
    var te = [];
    if (u !== void 0) for (_ of u) _.f & 8192 || te.push(_);
    for (; l !== null;) (!(l.f & 8192) && l !== e.fallback && te.push(l), (l = ai(l.next)));
    var ne = te.length;
    if (ne > 0) {
      var re = i & 4 && s === 0 ? n : null;
      if (o) {
        for (v = 0; v < ne; v += 1) te[v].nodes?.a?.measure();
        for (v = 0; v < ne; v += 1) te[v].nodes?.a?.fix();
      }
      ti(e, te, re);
    }
  }
  o &&
    A(() => {
      if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
    });
}
function si(e, t, n, r, i, a, o, s) {
  var c = o & 1 ? (o & 16 ? Yt(n) : Zt(n, !1, !1)) : null,
    l = o & 2 ? Yt(i) : null;
  return {
    v: c,
    i: l,
    e: V(
      () => (
        a(t, c ?? n, l ?? i, s),
        () => {
          e.delete(r);
        }
      ),
    ),
  };
}
function ci(e, t, n) {
  if (e.nodes)
    for (
      var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n;
      r !== null;
    ) {
      var o = I(r);
      if ((a.before(r), r === i)) return;
      r = o;
    }
}
function li(e, t, n) {
  (t === null ? (e.effect.first = n) : (t.next = n),
    n === null ? (e.effect.last = t) : (n.prev = t));
}
function ui(e, t, n = !1, r = !1, i = !1, a = !1) {
  var o = e,
    s = ``;
  if (n) {
    var c = e;
    w && (o = D(F(c)));
  }
  Mn(() => {
    var e = K;
    if (s === (s = t() ?? ``)) w && ke();
    else if (n && !w) ((e.nodes = null), (c.innerHTML = s), s !== `` && Z(F(c), c.lastChild));
    else if ((e.nodes !== null && (Rn(e.nodes.start, e.nodes.end), (e.nodes = null)), s !== ``)) {
      if (w) {
        for (var a = E.data, l = ke(), u = l; l !== null && (l.nodeType !== 8 || l.data !== ``);)
          ((u = l), (l = I(l)));
        if (l === null) throw (Ee(), xe);
        (Z(E, u), (o = D(l)));
      } else {
        var d = _n(r ? `svg` : i ? `math` : `template`, r ? Ce : i ? we : void 0);
        d.innerHTML = s;
        var f = r || i ? d : d.content;
        if ((Z(F(f), f.lastChild), r || i)) for (; F(f);) o.before(F(f));
        else o.before(f);
      }
    }
  });
}
function di(e, t, ...n) {
  var r = new Qr(e);
  Nn(() => {
    let e = t() ?? null;
    r.ensure(e, e && ((t) => e(t, ...n)));
  }, re);
}
function fi(e, t, n) {
  var r;
  w && ((r = E), ke());
  var i = new Qr(e);
  Nn(() => {
    var e = t() ?? null;
    if (w && (Me(r) === `[`) != (e !== null)) {
      var a = je();
      (D(a), (i.anchor = a), T(!1), i.ensure(e, e && ((t) => n(t, e))), T(!0));
    } else i.ensure(e, e && ((t) => n(t, e)));
  }, re);
}
function pi(e, t, n, r, i, a) {
  let o = w;
  w && ke();
  var s = null;
  w && E.nodeType === 1 && ((s = E), ke());
  var c = w ? E : e,
    l = new Qr(c, !1);
  (Nn(() => {
    let e = t() || null;
    var a = i ? i() : n || e === `svg` ? Ce : void 0;
    if (e === null) l.ensure(null, null);
    else
      return (
        l.ensure(e, (t) => {
          if (e) {
            var n = w;
            if (((s = w ? s : _n(e, a)), Z(s, s), r)) {
              var i = null;
              w && Tr(e) && s.append((i = document.createComment(``)));
              var o = w ? F(s) : s.appendChild(P());
              (w && (o === null ? T(!1) : D(o)), r(s, o), i?.remove());
            }
            ((K.nodes.end = s), n || t.before(s));
          }
          w && D(t);
        }),
        () => {}
      );
  }, re),
    wn(() => {}),
    o && (T(!0), D(c)));
}
function mi(e, t) {
  var n = void 0,
    r;
  Pn(() => {
    n !== (n = t()) &&
      ((r &&= (H(r), null)),
      n &&
        (r = V(() => {
          kn(() => n(e));
        })));
  });
}
function hi(e) {
  var t,
    n,
    r = ``;
  if (typeof e == `string` || typeof e == `number`) r += e;
  else if (typeof e == `object`) {
    if (Array.isArray(e)) {
      var i = e.length;
      for (t = 0; t < i; t++) e[t] && (n = hi(e[t])) && (r && (r += ` `), (r += n));
    } else for (n in e) e[n] && (r && (r += ` `), (r += n));
  }
  return r;
}
function gi() {
  for (var e, t, n = 0, r = ``, i = arguments.length; n < i; n++)
    (e = arguments[n]) && (t = hi(e)) && (r && (r += ` `), (r += t));
  return r;
}
function _i(e) {
  return typeof e == `object` ? gi(e) : (e ?? ``);
}
var vi = [
  ...` 	
\r\f\xA0\v﻿`,
];
function yi(e, t, n) {
  var r = e == null ? `` : `` + e;
  if ((t && (r = r ? r + ` ` + t : t), n)) {
    for (var i of Object.keys(n))
      if (n[i]) r = r ? r + ` ` + i : i;
      else if (r.length)
        for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
          var s = o + a;
          (o === 0 || vi.includes(r[o - 1])) && (s === r.length || vi.includes(r[s]))
            ? (r = (o === 0 ? `` : r.substring(0, o)) + r.substring(s + 1))
            : (o = s);
        }
  }
  return r === `` ? null : r;
}
function bi(e, t = !1) {
  var n = t ? ` !important;` : `;`,
    r = ``;
  for (var i of Object.keys(e)) {
    var a = e[i];
    a != null && a !== `` && (r += ` ` + i + `: ` + a + n);
  }
  return r;
}
function xi(e) {
  return e[0] !== `-` || e[1] !== `-` ? e.toLowerCase() : e;
}
function Si(e, t) {
  if (t) {
    var n = ``,
      r,
      i;
    if ((Array.isArray(t) ? ((r = t[0]), (i = t[1])) : (r = t), e)) {
      e = String(e)
        .replaceAll(/\/\*.*?\*\//g, ``)
        .trim();
      var a = !1,
        o = 0,
        s = !1,
        c = [];
      (r && c.push(...Object.keys(r).map(xi)), i && c.push(...Object.keys(i).map(xi)));
      var l = 0,
        u = -1;
      let t = e.length;
      for (var d = 0; d < t; d++) {
        var f = e[d];
        if (
          (s
            ? f === `/` && e[d - 1] === `*` && (s = !1)
            : a
              ? a === f && (a = !1)
              : f === `/` && e[d + 1] === `*`
                ? (s = !0)
                : f === `"` || f === `'`
                  ? (a = f)
                  : f === `(`
                    ? o++
                    : f === `)` && o--,
          !s && a === !1 && o === 0)
        ) {
          if (f === `:` && u === -1) u = d;
          else if (f === `;` || d === t - 1) {
            if (u !== -1) {
              var p = xi(e.substring(l, u).trim());
              if (!c.includes(p)) {
                f !== `;` && d++;
                var m = e.substring(l, d).trim();
                n += ` ` + m + `;`;
              }
            }
            ((l = d + 1), (u = -1));
          }
        }
      }
    }
    return (r && (n += bi(r)), i && (n += bi(i, !0)), (n = n.trim()), n === `` ? null : n);
  }
  return e == null ? null : String(e);
}
function Ci(e, t, n, r, i, a) {
  var o = e[he];
  if (w || o !== n || o === void 0) {
    var s = yi(n, r, a);
    ((w && s === e.getAttribute(`class`)) ||
      (s == null ? e.removeAttribute(`class`) : t ? (e.className = s) : e.setAttribute(`class`, s)),
      (e[he] = n));
  } else if (a && i !== a)
    for (var c in a) {
      var l = !!a[c];
      (i == null || l !== !!i[c]) && e.classList.toggle(c, l);
    }
  return a;
}
function wi(e, t = {}, n, r) {
  for (var i in n) {
    var a = n[i];
    t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
  }
}
function Ti(e, t, n, r) {
  var i = e[ge];
  if (w || i !== t) {
    var a = Si(t, r);
    ((w && a === e.getAttribute(`style`)) ||
      (a == null ? e.removeAttribute(`style`) : (e.style.cssText = a)),
      (e[ge] = t));
  } else
    r && (Array.isArray(r) ? (wi(e, n?.[0], r[0]), wi(e, n?.[1], r[1], `important`)) : wi(e, n, r));
  return r;
}
function Ei(e, t) {
  t ? e.hasAttribute(`selected`) || e.setAttribute(`selected`, ``) : e.removeAttribute(`selected`);
}
function Di(e, t) {
  var n = !(`__defaultValue` in e);
  (n || e.__defaultValue !== t) && ((e.__defaultValue = t), Oi(e, !n || `__value` in e));
}
function Oi(t, n) {
  var r = t.__defaultValue,
    i = t.multiple,
    a = i ? (r ?? []) : null;
  if (!i || e(a)) {
    var o = t.selectedIndex,
      s = n && i ? new Set(t.selectedOptions) : null;
    for (var c of t.options) {
      var l = ji(c);
      Ei(c, i ? a.includes(l) : cn(l, r));
    }
    if (n) {
      if (s !== null)
        for (c of t.options) {
          var u = s.has(c);
          c.selected !== u && (c.selected = u);
        }
      else t.selectedIndex !== o && (t.selectedIndex = o);
    }
  }
}
function ki(t, n, r = !1) {
  if (t.multiple) {
    if (n == null) return;
    if (!e(n)) return De();
    for (var i of t.options) i.selected = n.includes(ji(i));
  } else {
    for (i of t.options)
      if (cn(ji(i), n)) {
        i.selected = !0;
        return;
      }
    (r && n === void 0) || (t.selectedIndex = -1);
  }
}
function Ai(e) {
  var t = new MutationObserver((t) => {
    t.every(Mi) || (`__defaultValue` in e && Oi(e, !1), `__value` in e && ki(e, e.__value));
  });
  (t.observe(e, { childList: !0, subtree: !0, attributes: !0, attributeFilter: [`value`] }),
    wn(() => {
      t.disconnect();
    }));
}
function ji(e) {
  return `__value` in e ? e.__value : e.value;
}
function Mi(e) {
  if (e.target.closest(`selectedcontent`) !== null) return !0;
  if (e.type === `childList`) {
    var t = [...e.addedNodes, ...e.removedNodes];
    return t.length > 0 && t.every((e) => e.nodeName === `SELECTEDCONTENT`);
  }
  return !1;
}
var Ni = Symbol(`class`),
  Pi = Symbol(`style`),
  Fi = Symbol(`is custom element`),
  Ii = Symbol(`is html`),
  Li = be ? `link` : `LINK`,
  Ri = be ? `input` : `INPUT`,
  zi = be ? `option` : `OPTION`,
  Bi = be ? `select` : `SELECT`,
  Vi = be ? `progress` : `PROGRESS`;
function Hi(e) {
  if (w) {
    var t = !1,
      n = () => {
        if (!t) {
          if (((t = !0), e.hasAttribute(`value`))) {
            var n = e.value;
            (Ui(e, `value`, null), (e.value = n));
          }
          if (e.hasAttribute(`checked`)) {
            var r = e.checked;
            (Ui(e, `checked`, null), (e.checked = r));
          }
        }
      };
    ((e[ve] = n), A(n), ft());
  }
}
function Ui(e, t, n, r) {
  var i = Ki(e);
  if (!(
    w &&
    ((i[t] = e.getAttribute(t)),
    t === `src` || t === `srcset` || (t === `href` && e.nodeName === Li))
  )) {
    var a = i[t];
    a !== (i[t] = n) &&
      (t === `loading` && (e[pe] = n),
      n == null
        ? e.removeAttribute(t)
        : typeof n != `string` && Ji(e).has(t)
          ? (e[t] = n)
          : (!w || (typeof n != `number` && typeof n != `boolean`) || a !== String(n)) &&
            e.setAttribute(t, n));
  }
}
function Wi(e, t, n, r, i = !1, a = !1) {
  w && i && e.nodeName === Ri && (`defaultValue` in n || `defaultChecked` in n || Hi(e));
  var o = Ki(e),
    s = o[Fi],
    c = !o[Ii];
  let l = w && s;
  l && T(!1);
  var u = t || {},
    d = e.nodeName === zi,
    f = e.nodeName === Bi;
  try {
    for (var p in t) !(p in n) && p[0] + p[1] !== `$$` && (n[p] = null);
    (n.class ? (n.class = _i(n.class)) : (r || n[Ni]) && (n.class = null),
      n[Pi] && (n.style ??= null));
    var m = Ji(e);
    if (e.nodeName === Ri && `type` in n && (`value` in n || `__value` in n)) {
      var h = n.type;
      (h !== u.type || (h === void 0 && e.hasAttribute(`type`))) &&
        ((u.type = h), Ui(e, `type`, h, a));
    }
    for (let i in n) {
      let l = n[i];
      if (d && i === `value` && l == null) ((e.value = e.__value = ``), (u[i] = l));
      else if (i === `class`)
        (Ci(e, e.namespaceURI === `http://www.w3.org/1999/xhtml`, l, r, t?.[Ni], n[Ni]),
          (u[i] = l),
          (u[Ni] = n[Ni]));
      else if (i === `style`) (Ti(e, l, t?.[Pi], n[Pi]), (u[i] = l), (u[Pi] = n[Pi]));
      else {
        var g = u[i];
        if (l !== g || (l === void 0 && e.hasAttribute(i))) {
          u[i] = l;
          var _ = i[0] + i[1];
          if (_ !== `$$`) {
            if (_ === `on`) {
              let t = {},
                n = `$$` + i,
                r = i.slice(2);
              var v = vr(r);
              if ((gr(r) && ((r = r.slice(0, -7)), (t.capture = !0)), !v && g)) {
                if (l != null) continue;
                (e.removeEventListener(r, u[n], t), (u[n] = null));
              }
              if (v) (Ar(r, e, l), jr([r]));
              else if (l != null) {
                function a(e) {
                  u[i].call(this, e);
                }
                u[n] = kr(r, e, a, t);
              }
            } else if (i === `style`) Ui(e, i, l);
            else if (i === `autofocus`) ut(e, !!l);
            else if (!s && (i === `__value` || (i === `value` && l != null)))
              ((e.__value = l),
                (g == null || e.value !== l || (l === 0 && e.nodeName === Vi)) && (e.value = l));
            else if (i === `selected` && d) Ei(e, l);
            else {
              var y = i;
              c || (y = xr(y));
              var b = y === `defaultValue` || y === `defaultChecked`;
              if (f && y === `defaultValue`) continue;
              if (l == null && !s && !b) {
                if (((o[i] = null), y === `value` || y === `checked`)) {
                  let n = e,
                    r = t === void 0;
                  if (y === `value`) {
                    let e = n.defaultValue;
                    (n.removeAttribute(y),
                      (n.defaultValue = e),
                      (n.value = n.__value = r ? e : null));
                  } else {
                    let e = n.defaultChecked;
                    (n.removeAttribute(y), (n.defaultChecked = e), (n.checked = r ? e : !1));
                  }
                } else e.removeAttribute(i);
              } else
                b || ((s || typeof l != `string`) && m.has(y))
                  ? ((e[y] = l), y in o && (o[y] = C))
                  : typeof l != `function` && Ui(e, y, l, a);
            }
          }
        }
      }
    }
  } finally {
    l && T(!0);
  }
  return u;
}
function Gi(e, t, n = [], r = [], i = [], a, o = !1, s = !1) {
  ht(i, n, r, (n) => {
    var r = void 0,
      i = {},
      c = e.nodeName === Bi,
      l = !1;
    if (
      (Pn(() => {
        var u = t(...n.map(X)),
          d = Wi(e, r, u, a, o, s);
        if (l && c) {
          var f = e;
          (`defaultValue` in u && Di(f, u.defaultValue), `value` in u && ki(f, u.value));
        }
        for (let e of Object.getOwnPropertySymbols(i)) u[e] || H(i[e]);
        for (let t of Object.getOwnPropertySymbols(u)) {
          var p = u[t];
          (t.description !== `@attach` ||
            (r && p === r[t]) ||
            (i[t] && H(i[t]), (i[t] = V(() => mi(e, () => p)))),
            (d[t] = p));
        }
        r = d;
      }),
      c)
    ) {
      var u = e;
      kn(() => {
        var e = r;
        (`defaultValue` in e && Di(u, e.defaultValue), ki(u, e.value, !0), Ai(u));
      });
    }
    l = !0;
  });
}
function Ki(e) {
  return (e[me] ??= { [Fi]: e.nodeName.includes(`-`), [Ii]: e.namespaceURI === Se });
}
var qi = new Map();
function Ji(e) {
  var t = e.getAttribute(`is`) || e.nodeName,
    n = qi.get(t);
  if (n) return n;
  qi.set(t, (n = new Set()));
  for (var r, i = e, a = Element.prototype; a !== i;) {
    for (var s in ((r = o(i)), r))
      r[s].set && s !== `innerHTML` && s !== `textContent` && s !== `innerText` && n.add(s);
    i = l(i);
  }
  return n;
}
function Yi(e, t, n = t) {
  var r = new WeakSet();
  (mt(e, `input`, async (i) => {
    var a = i ? e.defaultValue : e.value;
    if (((a = Xi(e) ? Zi(a) : a), n(a), M !== null && r.add(M), await ur(), a !== (a = t()))) {
      var o = e.selectionStart,
        s = e.selectionEnd,
        c = e.value.length;
      if (((e.value = a ?? ``), s !== null)) {
        var l = e.value.length;
        o === s && s === c && l > c
          ? ((e.selectionStart = l), (e.selectionEnd = l))
          : ((e.selectionStart = o), (e.selectionEnd = Math.min(s, l)));
      }
    }
  }),
    ((w && e.defaultValue !== e.value) || (pr(t) == null && e.value)) &&
      (n(Xi(e) ? Zi(e.value) : e.value), M !== null && r.add(M)),
    jn(() => {
      var n = t();
      if (e === document.activeElement) {
        var i = M;
        if (r.has(i)) return;
      }
      (Xi(e) && n === Zi(e.value)) ||
        ((e.type !== `date` || n || e.value) && n !== e.value && (e.value = n ?? ``));
    }));
}
function Xi(e) {
  var t = e.type;
  return t === `number` || t === `range`;
}
function Zi(e) {
  return e === `` ? null : +e;
}
function Qi(e, t) {
  return e === t || e?.[ue] === t;
}
function $i(e = nt(), t, n, r) {
  var i = k.r,
    a = K;
  return (
    kn(() => {
      var o, s;
      return (
        jn(() => {
          ((o = s),
            (s = r?.() || []),
            pr(() => {
              Qi(n(...s), e) || (t(e, ...s), o && Qi(n(...o), e) && t(null, ...o));
            }));
        }),
        () => {
          let r = a;
          for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
          let o = () => {
              s && Qi(n(...s), e) && t(null, ...s);
            },
            c = r.teardown;
          r.teardown = () => {
            (o(), c?.());
          };
        }
      );
    }),
    e
  );
}
function ea(e = !1) {
  let t = k,
    n = t.l.u;
  if (!n) return;
  let r = () => mr(t.s);
  if (e) {
    let e = 0,
      n = {},
      i = yt(() => {
        let r = !1,
          i = t.s;
        for (let e in i) i[e] !== n[e] && ((n[e] = i[e]), (r = !0));
        return (r && e++, e);
      });
    r = () => X(i);
  }
  (n.b.length &&
    Dn(() => {
      (ta(t, r), m(n.b));
    }),
    Tn(() => {
      let e = pr(() => n.m.map(p));
      return () => {
        for (let t of e) typeof t == `function` && t();
      };
    }),
    n.a.length &&
      Tn(() => {
        (ta(t, r), m(n.a));
      }));
}
function ta(e, t) {
  if (e.l.s) for (let t of e.l.s) X(t);
  t();
}
var na = !1;
function ra(e) {
  var t = na;
  try {
    return ((na = !1), [e(), na]);
  } finally {
    na = t;
  }
}
var ia = {
  get(e, t) {
    if (!e.exclude.has(t)) return e.props[t];
  },
  set(e, t) {
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    if (!e.exclude.has(t) && t in e.props)
      return { enumerable: !0, configurable: !0, value: e.props[t] };
  },
  has(e, t) {
    return !e.exclude.has(t) && t in e.props;
  },
  ownKeys(e) {
    return Reflect.ownKeys(e.props).filter((t) => !e.exclude.has(t));
  },
};
function aa(e, t, n) {
  return new Proxy({ props: e, exclude: t }, ia);
}
var oa = {
  get(e, t) {
    let n = e.props.length;
    for (; n--;) {
      let r = e.props[n];
      if ((d(r) && (r = r()), typeof r == `object` && r && t in r)) return r[t];
    }
  },
  set(e, t, n) {
    let r = e.props.length;
    for (; r--;) {
      let i = e.props[r];
      d(i) && (i = i());
      let o = a(i, t);
      if (o && o.set) return (o.set(n), !0);
    }
    return !1;
  },
  getOwnPropertyDescriptor(e, t) {
    let n = e.props.length;
    for (; n--;) {
      let r = e.props[n];
      if ((d(r) && (r = r()), typeof r == `object` && r && t in r)) {
        let e = a(r, t);
        return (e && !e.configurable && (e.configurable = !0), e);
      }
    }
  },
  has(e, t) {
    if (t === ue || t === fe) return !1;
    for (let n of e.props) if ((d(n) && (n = n()), n != null && t in n)) return !0;
    return !1;
  },
  ownKeys(e) {
    let t = [];
    for (let n of e.props)
      if ((d(n) && (n = n()), n)) {
        for (let e in n) t.includes(e) || t.push(e);
        for (let e of Object.getOwnPropertySymbols(n)) t.includes(e) || t.push(e);
      }
    return t;
  },
};
function sa(...e) {
  return new Proxy({ props: e }, oa);
}
function ca(e, t, n, r) {
  var i = !Je || !!(n & 2),
    o = !!(n & 8),
    s = !!(n & 16),
    c = r,
    l = !0,
    u = void 0,
    d = () => (s && i ? ((u ??= yt(r)), X(u)) : (l && ((l = !1), (c = s ? pr(r) : r)), c));
  let f;
  if (o) {
    var p = ue in e || fe in e;
    f = a(e, t)?.set ?? (p && t in e ? (n) => (e[t] = n) : void 0);
  }
  var m,
    h = !1;
  (o ? ([m, h] = ra(() => e[t])) : (m = e[t]),
    m === void 0 && r !== void 0 && ((m = d()), f && (i && Ue(t), f(m))));
  var g = i
    ? () => {
        var n = e[t];
        return n === void 0 ? d() : ((l = !0), n);
      }
    : () => {
        var n = e[t];
        return (n !== void 0 && (c = void 0), n === void 0 ? c : n);
      };
  if (i && !(n & 4)) return g;
  if (f) {
    var _ = e.$$legacy;
    return function (e, t) {
      return arguments.length > 0 ? ((!i || !t || _ || h) && f(t ? g() : e), e) : g();
    };
  }
  var v = !1,
    y = (n & 1 ? yt : Ct)(() => ((v = !1), g()));
  o && X(y);
  var b = K;
  return function (e, t) {
    if (arguments.length > 0) {
      let n = t ? X(y) : i && o ? on(e) : e;
      return (Qt(y, n), (v = !0), c !== void 0 && (c = n), e);
    }
    return (Kn && v) || b.f & 16384 ? y.v : X(y);
  };
}
(typeof window < `u` && ((window.__svelte ??= {}).v ??= new Set()).add(`5`), Ye());
var la = {
    xmlns: `http://www.w3.org/2000/svg`,
    width: 24,
    height: 24,
    viewBox: `0 0 24 24`,
    fill: `none`,
    stroke: `currentColor`,
    'stroke-width': 2,
    'stroke-linecap': `round`,
    'stroke-linejoin': `round`,
  },
  ua = (...e) =>
    e
      .filter((e, t, n) => !!e && e.trim() !== `` && n.indexOf(e) === t)
      .join(` `)
      .trim();
function da(e) {
  return e != null;
}
function fa(e, t = {}) {
  let n = t.attributeNames ?? {},
    r = (e) => n[e] ?? e,
    i = e.size ?? e.width ?? la.width,
    a = e.size ?? e.height ?? la.height,
    o =
      e.aliases?.filter((e) => typeof e == `string` && e.trim() !== ``).map((e) => `lucide-${e}`) ??
      [],
    s = [...(e.name ? [`lucide-${e.name}`] : []), ...o],
    c = t.className?.split(` `).filter(Boolean) ?? [],
    l = t.includeDefaultClasses === !1 ? ua(...c) : ua(`lucide`, ...s, ...c),
    u = t.absoluteStrokeWidth
      ? (Number(t.strokeWidth ?? la[`stroke-width`]) * Number(e.size ?? e.width ?? la.width)) /
        Number(t.size ?? t.width ?? la.width)
      : (t.strokeWidth ?? la[`stroke-width`]);
  return [
    `svg`,
    {
      ...Object.entries(la).reduce((e, [t, n]) => ((e[r(t)] = n), e), {}),
      ...(`color` in t && t.color && { [r(`stroke`)]: t.color }),
      ...(`size` in t && da(t.size) && { [r(`width`)]: t.size, [r(`height`)]: t.size }),
      ...(`width` in t && da(t.width) && { [r(`width`)]: t.width }),
      ...(`height` in t && da(t.height) && { [r(`height`)]: t.height }),
      [r(`stroke-width`)]: u,
      ...(l && { [r(`class`)]: l }),
      [r(`viewBox`)]: `0 0 ${i} ${a}`,
      ...(t.hasA11yProp === !1 ? { [r(`aria-hidden`)]: `true` } : {}),
      ...(`attributes` in t && t.attributes),
    },
    e.node.map((e) => {
      let [n, i, a] = e,
        o = t.nonScalingStroke ? { [r(`vector-effect`)]: `non-scaling-stroke`, ...i } : i;
      return a ? [n, o, a] : [n, o];
    }),
  ];
}
var pa = (e) => {
    for (let t in e) if (t.startsWith(`aria-`) || t === `role` || t === `title`) return !0;
    return !1;
  },
  ma = Symbol(`lucide-context`),
  ha = () => $e(ma),
  ga = new Set([
    `$$slots`,
    `$$events`,
    `$$legacy`,
    `color`,
    `size`,
    `width`,
    `height`,
    `strokeWidth`,
    `absoluteStrokeWidth`,
    `nonScalingStroke`,
    `iconNode`,
    `icon`,
    `class`,
    `children`,
  ]),
  _a = Br(`<svg><!><!></svg>`);
function va(e, t) {
  et(t, !0);
  let n = ha() ?? {},
    r = ca(t, `color`, 19, () => n.color ?? `currentColor`),
    i = ca(t, `size`, 19, () => n.size ?? 24),
    a = ca(t, `width`, 19, i),
    o = ca(t, `height`, 19, i),
    s = ca(t, `strokeWidth`, 19, () => n.strokeWidth ?? 2),
    c = ca(t, `absoluteStrokeWidth`, 19, () => n.absoluteStrokeWidth ?? !1),
    l = ca(t, `nonScalingStroke`, 19, () => n.nonScalingStroke ?? !1),
    u = ca(t, `iconNode`, 19, () => []),
    d = ca(t, `icon`, 19, () => ({ node: u(), aliases: [], size: 24 })),
    p = aa(t, ga),
    m = St(() => !!t.children || pa(p)),
    h = St(() =>
      fa(d(), {
        color: r(),
        width: a(),
        height: o(),
        strokeWidth: s(),
        absoluteStrokeWidth: c(),
        nonScalingStroke: l(),
        className: ua(`lucide-icon`, n.class),
        hasA11yProp: X(m),
        attributes: p,
      }),
    ),
    v = St(() => _(X(h), 3)),
    y = St(() => X(v)[1]),
    b = St(() => g(X(v)[2], () => [], !0)),
    x = St(() => ({ ...X(y), class: [...X(y).class.split(` `), t.class] }));
  var S = _a();
  Gi(S, () => ({ ...X(x) }));
  var ee = L(S);
  (ii(
    ee,
    17,
    () => X(b),
    ei,
    (e, t) => {
      var n = St(() => _(X(t), 2));
      let r = () => X(n)[0],
        i = () => X(n)[1];
      var a = Hr();
      (pi(mn(a), r, !0, (e, t) => {
        Gi(e, () => ({ ...i() }));
      }),
        Ur(e, a));
    },
  ),
    di(z(ee), () => t.children ?? f),
    O(S),
    Ur(e, S),
    tt());
}
var ya = `https://github.com/duchung45644/ruler`,
  ba = `bkgdfebicmlicjnkgbemlidlnpbnaofh`,
  xa = `1.0.0`,
  Sa = {
    inspect: `shot-inspect`,
    measure: `shot-ruler`,
    grid: `shot-grid`,
    responsive: `shot-responsive`,
    styles: `shot-colors`,
    palette: `shot-palette`,
    more: `shot-more`,
  },
  Ca = {
    en: {
      nav: {
        features: `Features`,
        how: `How it works`,
        ai: `AI agents`,
        keys: `Shortcuts`,
        faq: `FAQ`,
        docs: `Docs`,
        privacy: `Privacy`,
      },
      hero: {
        badge: `Version ${xa} · Free`,
        title: `The All-in-One Toolkit for Web Inspection and Design`,
        lead: `Hover any element to see how it's built, from size and spacing to styles and colors, then fine-tune it right on the page.`,
        cta: `Get it for Microsoft Edge`,
        soon: `Coming soon to Edge Add-ons`,
        source: `View source on GitHub`,
        meta: `Works in Microsoft Edge and Chromium browsers 116+`,
      },
      stats: [
        [`30+`, `tools in one dock`],
        [`47`, `MCP commands for AI agents`],
        [`1.4 MB`, `total size, loads only when you turn it on`],
        [`0`, `trackers, accounts or servers`],
      ],
      how: {
        title: `Start in three steps`,
        steps: [
          [
            `Install`,
            `Add PixelLens to Edge from the Add-ons store. No sign-up, nothing to configure.`,
          ],
          [
            `Turn it on`,
            `Click the toolbar icon or press Alt+Shift+S on any tab. A small dock appears at the bottom of the page.`,
          ],
          [
            `Hover and tweak`,
            `Press 1 and hover. Click to select, press 0 for the side panel, and use number keys to switch tools.`,
          ],
        ],
      },
      showcase: {
        title: `Everything you open DevTools for, one hover away`,
        lead: `PixelLens puts the tools designers and front-end developers reach for every day right on top of the page, without digging through panels.`,
        rows: [
          {
            id: `inspect`,
            title: `Inspect anything by hovering`,
            body: `Point at an element and read its real numbers instantly.`,
            points: [
              `Size, padding, margin and box model drawn on the page`,
              `Font family, size, weight, line height and colors with contrast ratio`,
              `Distances to neighbouring elements as you move`,
              `Press Space to pin, Alt+Shift+↑/↓ to walk up and down the tree`,
              `X-Ray outlines every box; Find locates elements by selector or text`,
            ],
          },
          {
            id: `measure`,
            title: `Measure and align like in a design tool`,
            body: `Rulers, guides and a measuring tool that snap to real element edges.`,
            points: [
              `Drag guides from the rulers; drag from the corner for two at once`,
              `Gaps between guides are labelled; select a guide and press Delete`,
              `Measure any area by dragging, with width, height and position`,
              `Breakpoint overlay shows where the layout changes`,
            ],
          },
          {
            id: `grid`,
            title: `Layout grid and design overlay`,
            body: `Check the page against your design system and the original mockup.`,
            points: [
              `Column grid with columns, gutter, margin, max width, color and opacity`,
              `Overlay a design image and nudge it with the arrow keys`,
              `Difference and onion-skin modes, plus a before/after split slider`,
            ],
          },
          {
            id: `edit`,
            title: `Edit live, then take the changes with you`,
            body: `Fine-tune the page in place, and never retype a tweak by hand.`,
            points: [
              `Change CSS in matched rules or inline, edit text and HTML in place`,
              `Force :hover, :focus, :focus-visible, :active and more`,
              `Edit CSS variables and watch the whole page follow`,
              `Undo and redo, and save your edits per site`,
              `Copy all changes as CSS, Tailwind classes or an AI-ready prompt`,
            ],
          },
          {
            id: `responsive`,
            title: `Responsive preview, with every tool inside`,
            body: `See the page at several sizes side by side and inspect any of them.`,
            points: [
              `Popular phones, tablets and desktops, or your own sizes`,
              `Synced scrolling and zoom across frames`,
              `Inspector, X-Ray, grid and ruler work inside every frame`,
            ],
          },
          {
            id: `styles`,
            title: `Page colors, fonts and the side panel`,
            body: `Understand a whole page or a single element in depth.`,
            points: [
              `Every color and font used on the page, with usage counts`,
              `Side panel: box model, matched CSS rules with specificity, fonts, colors, layout and assets`,
              `Page info: meta and SEO tags, page weight, detected technologies`,
              `Color picker that copies in HEX, RGB or HSL`,
            ],
          },
          {
            id: `quality`,
            title: `Accessibility and performance checks`,
            body: `Catch problems while you look at the page, not after release.`,
            points: [
              `Contrast checks with a suggested color that passes WCAG AA or AAA`,
              `Color-blindness and blurred-vision simulation`,
              `Numbered Tab focus order across the page, shadow DOM included`,
              `Core Web Vitals: the LCP element, layout-shift sources and INP`,
            ],
          },
          {
            id: `palette`,
            title: `Capture and command palette`,
            body: `Share what you see and reach any tool without the mouse.`,
            points: [
              `Screenshot the view, one element or the whole page`,
              `Annotate with arrows, boxes, pen, text and blur before saving or copying`,
              `Ctrl+K finds and runs any tool by name, in English or Vietnamese`,
            ],
          },
        ],
      },
      audience: {
        title: `Made for the people who build the web`,
        items: [
          [
            `Designers`,
            `Check spacing, type and colors against your design without asking a developer to open DevTools.`,
          ],
          [
            `Front-end developers`,
            `Measure, tweak and export the exact CSS or Tailwind classes, then paste them into your code.`,
          ],
          [
            `QA and accessibility`,
            `Spot contrast issues, broken Tab order and layout shifts, and capture them for the ticket.`,
          ],
          [
            `AI-assisted coding`,
            `Let Claude Code, Cursor and other agents see the page you see through MCP.`,
          ],
        ],
      },
      compare: {
        title: `What PixelLens adds on top of DevTools`,
        head: [``, `Browser DevTools`, `PixelLens`],
        rows: [
          [`Size and spacing on hover`, `Partly`, `Yes`],
          [`Distance between any two elements`, `No`, `Yes`],
          [`Rulers and draggable guides`, `No`, `Yes`],
          [`Column grid and design overlay`, `No`, `Yes`],
          [`Several device sizes side by side`, `One at a time`, `Yes`],
          [`Export edits as CSS, Tailwind or AI prompt`, `No`, `Yes`],
          [`WCAG color suggestions and vision simulation`, `Partly`, `Yes`],
          [`Control from AI agents (MCP)`, `No`, `Yes`],
        ],
      },
      ai: {
        eyebrow: `Built for AI coding agents`,
        title: `Let your agent see the page you see`,
        body: `PixelLens ships a local MCP server. Claude Code, Cursor and other MCP clients can inspect elements, read styles, edit CSS, switch responsive sizes and take screenshots of the tab you have open.`,
        safe: `It connects only to 127.0.0.1 on your computer, uses a token and checks the extension origin, and is off until you turn it on.`,
        steps: [
          `Build the server: corepack pnpm --filter @pixellens/mcp-server build`,
          `Open the More menu (9) → Connect agent to get your token and config`,
          `Add the config to your agent, then ask it about the current page`,
        ],
        groupsTitle: `47 commands, grouped`,
        groups: [
          [`Page`, `Tabs, page info, meta and SEO, page weight, CSS variables, technologies`],
          [
            `Elements`,
            `Selection, details, outline tree, query selector, matched rules, specificity`,
          ],
          [
            `Design data`,
            `Typography, colors, assets, layout, Tailwind classes, accessibility issues`,
          ],
          [`Edits`, `Apply styles, add rules, change text, HTML and classes, revert`],
          [`Responsive`, `Enter and exit, set viewports, zoom, breakpoints`],
          [`Capture`, `Screenshots of the current view`],
        ],
      },
      keys: {
        title: `Keyboard first`,
        body: `Every dock tool has a number key in dock order. Letters reach the rest, and Ctrl+K finds everything.`,
        groups: [
          {
            name: `Dock`,
            list: [
              [`1`, `Inspect`],
              [`2`, `Find`],
              [`3`, `X-Ray`],
              [`4`, `Grid`],
              [`5`, `Responsive`],
              [`6`, `Ruler`],
              [`7`, `Measure`],
              [`8`, `Capture`],
              [`9`, `More tools`],
              [`0`, `Side panel`],
            ],
          },
          {
            name: `More tools`,
            list: [
              [`O`, `Design overlay`],
              [`A`, `Page colors & fonts`],
              [`C`, `Color picker`],
              [`B`, `Breakpoints`],
              [`Y`, `Vision simulator`],
              [`T`, `Tab focus order`],
              [`W`, `Core Web Vitals`],
            ],
          },
          {
            name: `Session`,
            list: [
              [`Alt Shift S`, `Turn on / off`],
              [`Ctrl K`, `Command palette`],
              [`H`, `Pause / resume`],
              [`Space`, `Pin the inspector`],
              [`Alt Shift ↑ ↓`, `Parent / child`],
              [`Ctrl Q`, `Quit`],
            ],
          },
        ],
      },
      faq: {
        title: `Frequently asked questions`,
        items: [
          [`Is PixelLens free?`, `Yes. All tools are free, with no account and no ads.`],
          [
            `Which browsers does it support?`,
            `Microsoft Edge and other Chromium-based browsers version 116 or newer. Edge users can install it from Edge Add-ons; a Chrome Web Store listing is planned.`,
          ],
          [
            `Does it change the website?`,
            `Only in your browser tab. Edits disappear on reload unless you save them, and saved edits stay on your device for that site only.`,
          ],
          [
            `Does it collect my data?`,
            `No. There is no analytics, tracking or server. Settings sync through your browser account if you have sync turned on.`,
          ],
          [
            `Why does it ask for the debugger permission?`,
            `Only for full-page screenshots: it resizes the page to capture it in one image, then detaches right away.`,
          ],
          [
            `Does it slow down pages?`,
            `No. Nothing runs until you turn PixelLens on for a tab, and turning it off removes everything it added.`,
          ],
          [
            `Does it work on localhost and local files?`,
            `Yes on localhost. For file:// pages, turn on "Allow access to file URLs" for PixelLens in the extensions page.`,
          ],
          [`How do I report a bug or suggest a feature?`, `Open an issue on GitHub.`],
        ],
      },
      privacy: {
        title: `Private by design`,
        body: `No tracking, no analytics, no account. PixelLens runs only on the tab where you turn it on, and your data never leaves your browser.`,
        link: `Read the privacy policy`,
      },
      footer: {
        made: `Made for designers and developers.`,
        home: `Home`,
        version: `Version ${xa}`,
      },
      shotAlt: `PixelLens screenshot`,
    },
    vi: {
      nav: {
        features: `Tính năng`,
        how: `Cách dùng`,
        ai: `AI agent`,
        keys: `Phím tắt`,
        faq: `Hỏi đáp`,
        docs: `Tài liệu`,
        privacy: `Quyền riêng tư`,
      },
      hero: {
        badge: `Phiên bản ${xa} · Miễn phí`,
        title: `Bộ công cụ tất cả trong một để kiểm tra và thiết kế web`,
        lead: `Rê chuột lên một phần tử để thấy nó được dựng ra sao, từ kích thước, khoảng cách đến style và màu, rồi chỉnh ngay trên trang.`,
        cta: `Cài cho Microsoft Edge`,
        soon: `Sắp có trên Edge Add-ons`,
        source: `Xem mã nguồn trên GitHub`,
        meta: `Chạy trên Microsoft Edge và trình duyệt Chromium 116 trở lên`,
      },
      stats: [
        [`30+`, `công cụ trong một dock`],
        [`47`, `lệnh MCP cho AI agent`],
        [`1,4 MB`, `tổng dung lượng, chỉ chạy khi bạn bật`],
        [`0`, `trình theo dõi, tài khoản hay máy chủ`],
      ],
      how: {
        title: `Bắt đầu trong ba bước`,
        steps: [
          [
            `Cài đặt`,
            `Thêm PixelLens vào Edge từ Edge Add-ons. Không cần đăng ký, không cần cấu hình.`,
          ],
          [
            `Bật lên`,
            `Bấm icon trên thanh công cụ hoặc nhấn Alt+Shift+S ở tab bất kỳ. Một dock nhỏ hiện ở cuối trang.`,
          ],
          [
            `Rê chuột và chỉnh`,
            `Nhấn 1 rồi rê chuột. Bấm để chọn, nhấn 0 mở side panel, dùng phím số để chuyển công cụ.`,
          ],
        ],
      },
      showcase: {
        title: `Mọi thứ bạn mở DevTools để xem, giờ chỉ cần rê chuột`,
        lead: `PixelLens đặt những công cụ designer và front-end developer dùng hằng ngày ngay trên trang, không phải lục từng panel.`,
        rows: [
          {
            id: `inspect`,
            title: `Rê chuột là thấy cấu trúc`,
            body: `Trỏ vào phần tử và đọc ngay số liệu thật của nó.`,
            points: [
              `Kích thước, padding, margin và box model vẽ ngay trên trang`,
              `Font, cỡ chữ, độ đậm, line height và màu kèm tỉ lệ tương phản`,
              `Khoảng cách tới các phần tử xung quanh khi di chuột`,
              `Nhấn Space để ghim, Alt+Shift+↑/↓ để đi lên xuống cây phần tử`,
              `X-Ray viền mọi khối; Find tìm phần tử theo selector hoặc nội dung`,
            ],
          },
          {
            id: `measure`,
            title: `Đo và căn chỉnh như trong phần mềm thiết kế`,
            body: `Thước, đường gióng và công cụ đo bám theo cạnh thật của phần tử.`,
            points: [
              `Kéo đường gióng từ thước; kéo từ góc để có hai đường cùng lúc`,
              `Khoảng cách giữa các đường được ghi số; chọn đường rồi nhấn Delete để xoá`,
              `Kéo để đo vùng bất kỳ, có rộng, cao và vị trí`,
              `Lớp breakpoint cho thấy chỗ layout thay đổi`,
            ],
          },
          {
            id: `grid`,
            title: `Lưới layout và chồng ảnh thiết kế`,
            body: `So trang với design system và bản thiết kế gốc.`,
            points: [
              `Lưới cột chỉnh được số cột, gutter, margin, độ rộng tối đa, màu và độ mờ`,
              `Chồng ảnh thiết kế lên trang và dịch bằng phím mũi tên`,
              `Chế độ difference, onion skin và thanh so trước/sau`,
            ],
          },
          {
            id: `edit`,
            title: `Chỉnh trực tiếp, rồi mang thay đổi đi`,
            body: `Tinh chỉnh ngay trên trang, không phải gõ lại từng thay đổi.`,
            points: [
              `Sửa CSS trong rule khớp hoặc inline, sửa chữ và HTML tại chỗ`,
              `Ép :hover, :focus, :focus-visible, :active và các trạng thái khác`,
              `Sửa biến CSS và thấy cả trang đổi theo`,
              `Hoàn tác, làm lại và lưu thay đổi theo từng site`,
              `Copy toàn bộ thay đổi dạng CSS, class Tailwind hoặc prompt cho AI`,
            ],
          },
          {
            id: `responsive`,
            title: `Xem responsive, đủ công cụ trong từng khung`,
            body: `Xem trang ở nhiều kích thước cạnh nhau và kiểm tra khung nào cũng được.`,
            points: [
              `Điện thoại, máy tính bảng, máy tính phổ biến hoặc kích thước tự chọn`,
              `Cuộn và zoom đồng bộ giữa các khung`,
              `Inspector, X-Ray, lưới và thước dùng được trong mọi khung`,
            ],
          },
          {
            id: `styles`,
            title: `Màu, font của trang và side panel`,
            body: `Hiểu sâu cả trang hoặc một phần tử.`,
            points: [
              `Mọi màu và font trang dùng, kèm số lần dùng`,
              `Side panel: box model, rule CSS khớp kèm specificity, font, màu, layout và tài nguyên`,
              `Thông tin trang: thẻ meta và SEO, dung lượng trang, công nghệ nhận diện được`,
              `Chọn màu, copy dạng HEX, RGB hoặc HSL`,
            ],
          },
          {
            id: `quality`,
            title: `Kiểm tra trợ năng và hiệu năng`,
            body: `Bắt lỗi ngay khi đang xem trang, không đợi đến lúc phát hành.`,
            points: [
              `Kiểm tra tương phản kèm màu gợi ý đạt WCAG AA hoặc AAA`,
              `Mô phỏng mù màu và nhìn mờ`,
              `Đánh số thứ tự focus bằng Tab trên cả trang, tính cả shadow DOM`,
              `Core Web Vitals: phần tử LCP, nguồn xô lệch layout và INP`,
            ],
          },
          {
            id: `palette`,
            title: `Chụp ảnh và bảng lệnh`,
            body: `Chia sẻ thứ bạn thấy và gọi mọi công cụ không cần chuột.`,
            points: [
              `Chụp khung nhìn, một phần tử hoặc cả trang`,
              `Vẽ mũi tên, khung, nét bút, chữ và làm mờ trước khi lưu hoặc copy`,
              `Ctrl+K tìm và chạy công cụ theo tên, bằng tiếng Việt hoặc tiếng Anh`,
            ],
          },
        ],
      },
      audience: {
        title: `Dành cho những người dựng nên web`,
        items: [
          [
            `Designer`,
            `Kiểm tra khoảng cách, chữ và màu so với thiết kế mà không phải nhờ developer mở DevTools.`,
          ],
          [
            `Front-end developer`,
            `Đo, chỉnh rồi xuất đúng CSS hoặc class Tailwind để dán vào code.`,
          ],
          [
            `QA và trợ năng`,
            `Phát hiện lỗi tương phản, thứ tự Tab sai, layout xô lệch và chụp lại cho ticket.`,
          ],
          [
            `Lập trình cùng AI`,
            `Cho Claude Code, Cursor và các agent khác thấy đúng trang bạn đang xem qua MCP.`,
          ],
        ],
      },
      compare: {
        title: `PixelLens bổ sung gì so với DevTools`,
        head: [``, `DevTools của trình duyệt`, `PixelLens`],
        rows: [
          [`Kích thước và khoảng cách khi rê chuột`, `Một phần`, `Có`],
          [`Khoảng cách giữa hai phần tử bất kỳ`, `Không`, `Có`],
          [`Thước và đường gióng kéo được`, `Không`, `Có`],
          [`Lưới cột và chồng ảnh thiết kế`, `Không`, `Có`],
          [`Nhiều kích thước thiết bị cạnh nhau`, `Từng cái một`, `Có`],
          [`Xuất thay đổi dạng CSS, Tailwind, prompt AI`, `Không`, `Có`],
          [`Gợi ý màu WCAG và mô phỏng thị lực`, `Một phần`, `Có`],
          [`Điều khiển từ AI agent (MCP)`, `Không`, `Có`],
        ],
      },
      ai: {
        eyebrow: `Dành cho AI agent lập trình`,
        title: `Cho agent nhìn thấy đúng trang bạn đang xem`,
        body: `PixelLens có sẵn MCP server chạy trên máy. Claude Code, Cursor và các MCP client khác có thể kiểm tra phần tử, đọc style, sửa CSS, đổi kích thước responsive và chụp ảnh tab bạn đang mở.`,
        safe: `Nó chỉ kết nối tới 127.0.0.1 trên máy bạn, dùng token, kiểm tra origin của extension, và tắt cho đến khi bạn bật.`,
        steps: [
          `Build server: corepack pnpm --filter @pixellens/mcp-server build`,
          `Mở menu Thêm (9) → Kết nối agent để lấy token và cấu hình`,
          `Thêm cấu hình vào agent, rồi hỏi nó về trang đang mở`,
        ],
        groupsTitle: `47 lệnh, chia theo nhóm`,
        groups: [
          [`Trang`, `Tab, thông tin trang, meta và SEO, dung lượng, biến CSS, công nghệ`],
          [
            `Phần tử`,
            `Phần tử đang chọn, chi tiết, cây phần tử, query selector, rule khớp, specificity`,
          ],
          [`Dữ liệu thiết kế`, `Chữ, màu, tài nguyên, layout, class Tailwind, lỗi trợ năng`],
          [`Chỉnh sửa`, `Áp style, thêm rule, sửa chữ, HTML và class, hoàn tác`],
          [`Responsive`, `Bật tắt, đặt kích thước khung, zoom, breakpoint`],
          [`Chụp ảnh`, `Chụp khung nhìn hiện tại`],
        ],
      },
      keys: {
        title: `Ưu tiên bàn phím`,
        body: `Mỗi công cụ trên dock có một phím số theo đúng thứ tự. Phím chữ gọi các công cụ còn lại, Ctrl+K tìm được mọi thứ.`,
        groups: [
          {
            name: `Dock`,
            list: [
              [`1`, `Kiểm tra`],
              [`2`, `Tìm`],
              [`3`, `X-Ray`],
              [`4`, `Lưới`],
              [`5`, `Responsive`],
              [`6`, `Thước`],
              [`7`, `Đo`],
              [`8`, `Chụp`],
              [`9`, `Thêm công cụ`],
              [`0`, `Side panel`],
            ],
          },
          {
            name: `Thêm công cụ`,
            list: [
              [`O`, `Chồng ảnh thiết kế`],
              [`A`, `Màu và font của trang`],
              [`C`, `Chọn màu`],
              [`B`, `Breakpoint`],
              [`Y`, `Mô phỏng thị lực`],
              [`T`, `Thứ tự focus Tab`],
              [`W`, `Core Web Vitals`],
            ],
          },
          {
            name: `Phiên làm việc`,
            list: [
              [`Alt Shift S`, `Bật / tắt`],
              [`Ctrl K`, `Bảng lệnh`],
              [`H`, `Tạm dừng / tiếp tục`],
              [`Space`, `Ghim inspector`],
              [`Alt Shift ↑ ↓`, `Phần tử cha / con`],
              [`Ctrl Q`, `Thoát`],
            ],
          },
        ],
      },
      faq: {
        title: `Câu hỏi thường gặp`,
        items: [
          [
            `PixelLens có miễn phí không?`,
            `Có. Mọi công cụ đều miễn phí, không cần tài khoản, không quảng cáo.`,
          ],
          [
            `Dùng được trên trình duyệt nào?`,
            `Microsoft Edge và các trình duyệt Chromium từ phiên bản 116. Người dùng Edge cài từ Edge Add-ons; bản trên Chrome Web Store đang được chuẩn bị.`,
          ],
          [
            `Có làm thay đổi website không?`,
            `Chỉ trong tab của bạn. Tải lại trang là mất, trừ khi bạn lưu; thay đổi đã lưu chỉ nằm trên máy bạn cho đúng site đó.`,
          ],
          [
            `Có thu thập dữ liệu của tôi không?`,
            `Không. Không analytics, không theo dõi, không máy chủ. Cài đặt đồng bộ qua tài khoản trình duyệt nếu bạn bật đồng bộ.`,
          ],
          [
            `Vì sao cần quyền debugger?`,
            `Chỉ để chụp cả trang: extension tạm phóng trang ra đủ chiều cao để chụp một ảnh, rồi ngắt ngay.`,
          ],
          [
            `Có làm chậm trang không?`,
            `Không. Không có gì chạy cho đến khi bạn bật PixelLens trên tab, và tắt đi là gỡ sạch mọi thứ nó thêm vào.`,
          ],
          [
            `Dùng được với localhost và file trên máy không?`,
            `Có với localhost. Với trang file://, bật "Allow access to file URLs" cho PixelLens trong trang quản lý extension.`,
          ],
          [`Báo lỗi hoặc góp ý tính năng ở đâu?`, `Tạo issue trên GitHub.`],
        ],
      },
      privacy: {
        title: `Riêng tư ngay từ thiết kế`,
        body: `Không theo dõi, không analytics, không tài khoản. PixelLens chỉ chạy trên tab bạn bật, và dữ liệu không bao giờ rời trình duyệt.`,
        link: `Đọc chính sách quyền riêng tư`,
      },
      footer: {
        made: `Làm cho designer và developer.`,
        home: `Trang chủ`,
        version: `Phiên bản ${xa}`,
      },
      shotAlt: `Ảnh chụp PixelLens`,
    },
  };
function wa() {
  try {
    let e = localStorage.getItem(`lang`);
    if (e === `en` || e === `vi`) return e;
  } catch {}
  return navigator.language.toLowerCase().startsWith(`vi`) ? `vi` : `en`;
}
function Ta(e) {
  try {
    localStorage.setItem(`lang`, e);
  } catch {}
  document.documentElement.lang = e;
}
var Ea = on({ code: wa() }),
  $ = () => Ca[Ea.code];
function Da(e) {
  ((Ea.code = e), Ta(e));
}
var Oa = Rr(
  `<footer class="border-t border-line-soft"><div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-subtle sm:flex-row sm:items-center sm:px-6"><div class="flex items-center gap-2"><img src="./logo.svg" alt="" class="size-5"/> <span class="text-fg">PixelLens</span> <span> </span> <span class="text-subtle"> </span></div> <div class="flex gap-5 sm:ml-auto"><a class="hover:text-fg" href="./index.html"> </a> <a class="hover:text-fg" href="./docs.html"> </a> <a class="hover:text-fg" href="./privacy.html"> </a> <a class="hover:text-fg">GitHub</a></div></div></footer>`,
);
function ka(e, t) {
  (et(t, !1), ea());
  var n = Oa(),
    r = L(n),
    i = L(r),
    a = z(L(i), 4),
    o = R(a),
    s = R(z(a, 2), !0);
  O(i);
  var c = z(i, 2),
    l = L(c),
    u = R(l, !0),
    d = z(l, 2),
    f = R(d, !0),
    p = z(d, 2),
    m = R(p, !0),
    h = z(p, 2);
  (O(c),
    O(r),
    O(n),
    Mn(
      (e, t, n, r, i) => {
        (Q(o, `· ${e ?? ``}`), Q(s, t), Q(u, n), Q(f, r), Q(m, i), Ui(h, `href`, ya));
      },
      [
        () => $().footer.made,
        () => $().footer.version,
        () => $().footer.home,
        () => $().nav.docs,
        () => $().nav.privacy,
      ],
    ),
    Ur(e, n),
    tt());
}
var Aa = {
  name: `monitor`,
  size: 24,
  node: [
    [`rect`, { width: `20`, height: `14`, x: `2`, y: `3`, rx: `2` }],
    [`line`, { x1: `8`, x2: `16`, y1: `21`, y2: `21` }],
    [`line`, { x1: `12`, x2: `12`, y1: `17`, y2: `21` }],
  ],
};
Aa.node;
var ja = new Set([`$$slots`, `$$events`, `$$legacy`]);
function Ma(e, t) {
  let n = aa(t, ja);
  va(
    e,
    sa(() => n, {
      get icon() {
        return Aa;
      },
    }),
  );
}
var Na = {
  name: `moon`,
  size: 24,
  node: [
    [
      `path`,
      {
        d: `M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401`,
      },
    ],
  ],
};
Na.node;
var Pa = new Set([`$$slots`, `$$events`, `$$legacy`]);
function Fa(e, t) {
  let n = aa(t, Pa);
  va(
    e,
    sa(() => n, {
      get icon() {
        return Na;
      },
    }),
  );
}
var Ia = {
  name: `sun`,
  size: 24,
  node: [
    [`circle`, { cx: `12`, cy: `12`, r: `4` }],
    [`path`, { d: `M12 2v2` }],
    [`path`, { d: `M12 20v2` }],
    [`path`, { d: `m4.93 4.93 1.41 1.41` }],
    [`path`, { d: `m17.66 17.66 1.41 1.41` }],
    [`path`, { d: `M2 12h2` }],
    [`path`, { d: `M20 12h2` }],
    [`path`, { d: `m6.34 17.66-1.41 1.41` }],
    [`path`, { d: `m19.07 4.93-1.41 1.41` }],
  ],
};
Ia.node;
var La = new Set([`$$slots`, `$$events`, `$$legacy`]);
function Ra(e, t) {
  let n = aa(t, La);
  va(
    e,
    sa(() => n, {
      get icon() {
        return Ia;
      },
    }),
  );
}
var za = [`system`, `light`, `dark`];
function Ba() {
  try {
    let e = localStorage.getItem(`theme`);
    if (e === `light` || e === `dark`) return e;
  } catch {}
  return `system`;
}
var Va = on({ value: Ba() });
function Ha(e) {
  e === `system`
    ? delete document.documentElement.dataset.theme
    : (document.documentElement.dataset.theme = e);
}
function Ua() {
  let e = za[(za.indexOf(Va.value) + 1) % za.length];
  ((Va.value = e), Ha(e));
  try {
    e === `system` ? localStorage.removeItem(`theme`) : localStorage.setItem(`theme`, e);
  } catch {}
}
var Wa = Rr(`<button type="button"> </button>`),
  Ga = Rr(
    `<header class="sticky top-0 z-20 border-b border-line-soft bg-page/80 backdrop-blur"><nav class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6"><a href="./index.html" class="flex items-center gap-2.5 font-semibold text-strong"><img src="./logo.svg" alt="" class="size-7"/> PixelLens</a> <div class="ml-auto hidden items-center gap-6 text-sm text-muted md:flex"><a class="hover:text-strong" href="./index.html#how"> </a> <a class="hover:text-strong" href="./index.html#features"> </a> <a class="hover:text-strong" href="./index.html#ai"> </a> <a class="hover:text-strong" href="./index.html#keys"> </a> <a class="hover:text-strong" href="./index.html#faq"> </a> <a class="hover:text-strong" href="./docs.html"> </a></div> <button type="button" class="ml-auto flex size-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:text-strong md:ml-0"><!></button> <div class="flex rounded-lg border border-line p-0.5 text-xs" role="group" aria-label="Language"></div></nav></header>`,
  );
function Ka(e, t) {
  et(t, !0);
  let n = { system: Ma, light: Ra, dark: Fa },
    r = St(() =>
      Ea.code === `vi`
        ? { system: `Giao diện: theo hệ thống`, light: `Giao diện: sáng`, dark: `Giao diện: tối` }[
            Va.value
          ]
        : { system: `Theme: system`, light: `Theme: light`, dark: `Theme: dark` }[Va.value],
    ),
    i = St(() => n[Va.value]);
  var a = Ga(),
    o = L(a),
    s = z(L(o), 2),
    c = L(s),
    l = R(c, !0),
    u = z(c, 2),
    d = R(u, !0),
    f = z(u, 2),
    p = R(f, !0),
    m = z(f, 2),
    h = R(m, !0),
    g = z(m, 2),
    _ = R(g, !0),
    v = R(z(g, 2), !0);
  O(s);
  var y = z(s, 2);
  (fi(
    L(y),
    () => X(i),
    (e, t) => {
      t(e, { size: 16 });
    },
  ),
    O(y));
  var b = z(y, 2);
  (ii(
    b,
    20,
    () => [`en`, `vi`],
    (e) => e,
    (e, t) => {
      var n = Wa(),
        r = R(n, !0);
      (Mn(() => {
        (Ci(
          n,
          1,
          `rounded-md px-2.5 py-1 font-medium uppercase transition-colors ${Ea.code === t ? `bg-tint-strong text-strong` : `text-subtle hover:text-fg`}`,
        ),
          Ui(n, `aria-pressed`, Ea.code === t),
          Q(r, t));
      }),
        Ar(`click`, n, () => Da(t)),
        Ur(e, n));
    },
  ),
    O(b),
    O(o),
    O(a),
    Mn(
      (e, t, n, i, a, o) => {
        (Q(l, e),
          Q(d, t),
          Q(p, n),
          Q(h, i),
          Q(_, a),
          Q(v, o),
          Ui(y, `title`, X(r)),
          Ui(y, `aria-label`, X(r)));
      },
      [
        () => $().nav.how,
        () => $().nav.features,
        () => $().nav.ai,
        () => $().nav.keys,
        () => $().nav.faq,
        () => $().nav.docs,
      ],
    ),
    Ar(`click`, y, function (...e) {
      Ua?.apply(this, e);
    }),
    Ur(e, a),
    tt());
}
jr([`click`]);
export {
  Mn as A,
  St as B,
  Q as C,
  jr as D,
  Vr as E,
  z as F,
  _ as G,
  et as H,
  on as I,
  Qt as L,
  L as M,
  mn as N,
  Ar as O,
  R as P,
  Xt as R,
  Jr as S,
  Rr as T,
  Ae as U,
  tt as V,
  O as W,
  _i as _,
  ba as a,
  ei as b,
  va as c,
  ea as d,
  $i as f,
  Ci as g,
  Ui as h,
  $ as i,
  Tn as j,
  X as k,
  aa as l,
  Hi as m,
  ka as n,
  ya as o,
  Yi as p,
  Ea as r,
  Sa as s,
  Ka as t,
  sa as u,
  ui as v,
  Ur as w,
  $r as x,
  ii as y,
  Ct as z,
};
