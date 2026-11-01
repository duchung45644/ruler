(() => {
    "use strict";

    function e(t) {
        return e = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, e(t)
    }

    function t() {
        t = function() {
            return r
        };
        var n, r = {},
            o = Object.prototype,
            a = o.hasOwnProperty,
            i = Object.defineProperty || function(e, t, n) {
                e[t] = n.value
            },
            c = "function" == typeof Symbol ? Symbol : {},
            u = c.iterator || "@@iterator",
            s = c.asyncIterator || "@@asyncIterator",
            l = c.toStringTag || "@@toStringTag";

        function f(e, t, n) {
            return Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            f({}, "")
        } catch (n) {
            f = function(e, t, n) {
                return e[t] = n
            }
        }

        function d(e, t, n, r) {
            var o = t && t.prototype instanceof b ? t : b,
                a = Object.create(o.prototype),
                c = new N(r || []);
            return i(a, "_invoke", {
                value: C(e, n, c)
            }), a
        }

        function h(e, t, n) {
            try {
                return {
                    type: "normal",
                    arg: e.call(t, n)
                }
            } catch (e) {
                return {
                    type: "throw",
                    arg: e
                }
            }
        }
        r.wrap = d;
        var p = "suspendedStart",
            m = "suspendedYield",
            g = "executing",
            v = "completed",
            y = {};

        function b() {}

        function w() {}

        function E() {}
        var x = {};
        f(x, u, (function() {
            return this
        }));
        var L = Object.getPrototypeOf,
            O = L && L(L(U([])));
        O && O !== o && a.call(O, u) && (x = O);
        var _ = E.prototype = b.prototype = Object.create(x);

        function I(e) {
            ["next", "throw", "return"].forEach((function(t) {
                f(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function S(t, n) {
            function r(o, i, c, u) {
                var s = h(t[o], t, i);
                if ("throw" !== s.type) {
                    var l = s.arg,
                        f = l.value;
                    return f && "object" == e(f) && a.call(f, "__await") ? n.resolve(f.__await).then((function(e) {
                        r("next", e, c, u)
                    }), (function(e) {
                        r("throw", e, c, u)
                    })) : n.resolve(f).then((function(e) {
                        l.value = e, c(l)
                    }), (function(e) {
                        return r("throw", e, c, u)
                    }))
                }
                u(s.arg)
            }
            var o;
            i(this, "_invoke", {
                value: function(e, t) {
                    function a() {
                        return new n((function(n, o) {
                            r(e, t, n, o)
                        }))
                    }
                    return o = o ? o.then(a, a) : a()
                }
            })
        }

        function C(e, t, r) {
            var o = p;
            return function(a, i) {
                if (o === g) throw Error("Generator is already running");
                if (o === v) {
                    if ("throw" === a) throw i;
                    return {
                        value: n,
                        done: !0
                    }
                }
                for (r.method = a, r.arg = i;;) {
                    var c = r.delegate;
                    if (c) {
                        var u = k(c, r);
                        if (u) {
                            if (u === y) continue;
                            return u
                        }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                        if (o === p) throw o = v, r.arg;
                        r.dispatchException(r.arg)
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    o = g;
                    var s = h(e, t, r);
                    if ("normal" === s.type) {
                        if (o = r.done ? v : m, s.arg === y) continue;
                        return {
                            value: s.arg,
                            done: r.done
                        }
                    }
                    "throw" === s.type && (o = v, r.method = "throw", r.arg = s.arg)
                }
            }
        }

        function k(e, t) {
            var r = t.method,
                o = e.iterator[r];
            if (o === n) return t.delegate = null, "throw" === r && e.iterator.return && (t.method = "return", t.arg = n, k(e, t), "throw" === t.method) || "return" !== r && (t.method = "throw", t.arg = new TypeError("The iterator does not provide a '" + r + "' method")), y;
            var a = h(o, e.iterator, t.arg);
            if ("throw" === a.type) return t.method = "throw", t.arg = a.arg, t.delegate = null, y;
            var i = a.arg;
            return i ? i.done ? (t[e.resultName] = i.value, t.next = e.nextLoc, "return" !== t.method && (t.method = "next", t.arg = n), t.delegate = null, y) : i : (t.method = "throw", t.arg = new TypeError("iterator result is not an object"), t.delegate = null, y)
        }

        function T(e) {
            var t = {
                tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
        }

        function P(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t
        }

        function N(e) {
            this.tryEntries = [{
                tryLoc: "root"
            }], e.forEach(T, this), this.reset(!0)
        }

        function U(t) {
            if (t || "" === t) {
                var r = t[u];
                if (r) return r.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var o = -1,
                        i = function e() {
                            for (; ++o < t.length;)
                                if (a.call(t, o)) return e.value = t[o], e.done = !1, e;
                            return e.value = n, e.done = !0, e
                        };
                    return i.next = i
                }
            }
            throw new TypeError(e(t) + " is not iterable")
        }
        return w.prototype = E, i(_, "constructor", {
            value: E,
            configurable: !0
        }), i(E, "constructor", {
            value: w,
            configurable: !0
        }), w.displayName = f(E, l, "GeneratorFunction"), r.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === w || "GeneratorFunction" === (t.displayName || t.name))
        }, r.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, E) : (e.__proto__ = E, f(e, l, "GeneratorFunction")), e.prototype = Object.create(_), e
        }, r.awrap = function(e) {
            return {
                __await: e
            }
        }, I(S.prototype), f(S.prototype, s, (function() {
            return this
        })), r.AsyncIterator = S, r.async = function(e, t, n, o, a) {
            void 0 === a && (a = Promise);
            var i = new S(d(e, t, n, o), a);
            return r.isGeneratorFunction(t) ? i : i.next().then((function(e) {
                return e.done ? e.value : i.next()
            }))
        }, I(_), f(_, l, "Generator"), f(_, u, (function() {
            return this
        })), f(_, "toString", (function() {
            return "[object Generator]"
        })), r.keys = function(e) {
            var t = Object(e),
                n = [];
            for (var r in t) n.push(r);
            return n.reverse(),
                function e() {
                    for (; n.length;) {
                        var r = n.pop();
                        if (r in t) return e.value = r, e.done = !1, e
                    }
                    return e.done = !0, e
                }
        }, r.values = U, N.prototype = {
            constructor: N,
            reset: function(e) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = n, this.done = !1, this.delegate = null, this.method = "next", this.arg = n, this.tryEntries.forEach(P), !e)
                    for (var t in this) "t" === t.charAt(0) && a.call(this, t) && !isNaN(+t.slice(1)) && (this[t] = n)
            },
            stop: function() {
                this.done = !0;
                var e = this.tryEntries[0].completion;
                if ("throw" === e.type) throw e.arg;
                return this.rval
            },
            dispatchException: function(e) {
                if (this.done) throw e;
                var t = this;

                function r(r, o) {
                    return c.type = "throw", c.arg = e, t.next = r, o && (t.method = "next", t.arg = n), !!o
                }
                for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                    var i = this.tryEntries[o],
                        c = i.completion;
                    if ("root" === i.tryLoc) return r("end");
                    if (i.tryLoc <= this.prev) {
                        var u = a.call(i, "catchLoc"),
                            s = a.call(i, "finallyLoc");
                        if (u && s) {
                            if (this.prev < i.catchLoc) return r(i.catchLoc, !0);
                            if (this.prev < i.finallyLoc) return r(i.finallyLoc)
                        } else if (u) {
                            if (this.prev < i.catchLoc) return r(i.catchLoc, !0)
                        } else {
                            if (!s) throw Error("try statement without catch or finally");
                            if (this.prev < i.finallyLoc) return r(i.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var r = this.tryEntries[n];
                    if (r.tryLoc <= this.prev && a.call(r, "finallyLoc") && this.prev < r.finallyLoc) {
                        var o = r;
                        break
                    }
                }
                o && ("break" === e || "continue" === e) && o.tryLoc <= t && t <= o.finallyLoc && (o = null);
                var i = o ? o.completion : {};
                return i.type = e, i.arg = t, o ? (this.method = "next", this.next = o.finallyLoc, y) : this.complete(i)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), y
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), P(n), y
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.tryLoc === e) {
                        var r = n.completion;
                        if ("throw" === r.type) {
                            var o = r.arg;
                            P(n)
                        }
                        return o
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(e, t, r) {
                return this.delegate = {
                    iterator: U(e),
                    resultName: t,
                    nextLoc: r
                }, "next" === this.method && (this.arg = n), y
            }
        }, r
    }

    function n(e, t, n, r, o, a, i) {
        try {
            var c = e[a](i),
                u = c.value
        } catch (e) {
            return void n(e)
        }
        c.done ? t(u) : Promise.resolve(u).then(r, o)
    }

    function r(e) {
        return function() {
            var t = this,
                r = arguments;
            return new Promise((function(o, a) {
                var i = e.apply(t, r);

                function c(e) {
                    n(i, o, a, c, u, "next", e)
                }

                function u(e) {
                    n(i, o, a, c, u, "throw", e)
                }
                c(void 0)
            }))
        }
    }
    var o = {};

    function a(e) {
        return function() {
            for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++) n[r] = arguments[r];
            return new Promise((function(t, r) {
                e.apply(void 0, n.concat([function(e) {
                    chrome.runtime.lastError ? r(new Error(chrome.runtime.lastError.message || JSON.stringify(chrome.runtime.lastError))) : t(e)
                }]))
            }))
        }
    }
    o.tabsQuery = a(chrome.tabs.query.bind(chrome.tabs)), o.tabsCreate = a(chrome.tabs.create.bind(chrome.tabs)), o.tabsUpdate = a(chrome.tabs.update.bind(chrome.tabs)), o.windowsUpdate = a(chrome.windows.update.bind(chrome.windows)), o.executeScript = a(chrome.scripting.executeScript.bind(chrome.scripting)), o.sendMessageToTab = a(chrome.tabs.sendMessage.bind(chrome.tabs)), o.sendMessage = a(chrome.runtime.sendMessage.bind(chrome.runtime)), o.contextMenusCreate = a(chrome.contextMenus.create.bind(chrome.contextMenus)), o.contextMenusRemoveAll = a(chrome.contextMenus.removeAll.bind(chrome.contextMenus)), o.contextMenusUpdate = a(chrome.contextMenus.update.bind(chrome.contextMenus)), o.setActionIcon = a(chrome.action.setIcon.bind(chrome.action)), o.storageLocalGet = a(chrome.storage.local.get.bind(chrome.storage.local)), o.storageLocalSet = a(chrome.storage.local.set.bind(chrome.storage.local)), o.storageLocalRemove = a(chrome.storage.local.remove.bind(chrome.storage.local)), o.getPlatformInfo = a(chrome.runtime.getPlatformInfo.bind(chrome.runtime)), o.commandsGetAll = a(chrome.commands.getAll.bind(chrome.commands)), o.getContexts = a(chrome.runtime.getContexts.bind(chrome.runtime)), o.onPageChangedRemoveRules = chrome.declarativeContent ? a(chrome.declarativeContent.onPageChanged.removeRules.bind(chrome.declarativeContent.onPageChanged)) : r(t().mark((function e() {
        return t().wrap((function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                case "end":
                    return e.stop()
            }
        }), e)
    }))), o.onPageChangedAddRules = chrome.declarativeContent ? a(chrome.declarativeContent.onPageChanged.addRules.bind(chrome.declarativeContent.onPageChanged)) : r(t().mark((function e() {
        return t().wrap((function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                case "end":
                    return e.stop()
            }
        }), e)
    }))), o.actionDisable = a(chrome.action.disable.bind(chrome.action)), o.captureTab = a(chrome.tabs.captureVisibleTab.bind(chrome.tabs)), o.windowsCreate = a(chrome.windows.create.bind(chrome.windows)), o.windowsGetCurrent = a(chrome.windows.getCurrent.bind(chrome.windows)), o.updateSessionRules = chrome.declarativeNetRequest ? a(chrome.declarativeNetRequest.updateSessionRules.bind(chrome.declarativeNetRequest)) : r(t().mark((function e() {
        return t().wrap((function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                case "end":
                    return e.stop()
            }
        }), e)
    }))), o.sendOptionalMessage = function() {
        var e = r(t().mark((function e(n) {
            return t().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, new Promise((function(e) {
                            chrome.runtime.sendMessage(n, (function(t) {
                                chrome.runtime.lastError ? e() : e(t)
                            }))
                        }));
                    case 3:
                        e.next = 8;
                        break;
                    case 5:
                        e.prev = 5, e.t0 = e.catch(0);
                    case 8:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 5]
            ])
        })));
        return function(t) {
            return e.apply(this, arguments)
        }
    }(), o.sendOptionalMessageToTab = function() {
        var e = r(t().mark((function e(n, r) {
            return t().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, new Promise((function(e) {
                            chrome.tabs.sendMessage(n, r, (function(t) {
                                chrome.runtime.lastError ? e() : e(t)
                            }))
                        }));
                    case 3:
                        e.next = 8;
                        break;
                    case 5:
                        e.prev = 5, e.t0 = e.catch(0);
                    case 8:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 5]
            ])
        })));
        return function(t, n) {
            return e.apply(this, arguments)
        }
    }();
    const i = o;
    const c = { MIN_MCP_SERVER_VERSION: "0.5.0" },
        u = JSON.parse('[{"family":"Bo doi Geist","file":"geist-latin-ext.woff2","weight":"300 700","unicodeRange":"U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"},{"family":"Bo doi Geist","file":"geist-latin.woff2","weight":"300 700","unicodeRange":"U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},{"family":"Bo doi Geist Mono","file":"geistmono-latin-ext.woff2","weight":"300 700","unicodeRange":"U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"},{"family":"Bo doi Geist Mono","file":"geistmono-latin.woff2","weight":"300 700","unicodeRange":"U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"}]');

    function s(e, t) {
        var n = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
        if (!n) {
            if (Array.isArray(e) || (n = function(e, t) {
                    if (e) {
                        if ("string" == typeof e) return l(e, t);
                        var n = {}.toString.call(e).slice(8, -1);
                        return "Object" === n && e.constructor && (n = e.constructor.name), "Map" === n || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? l(e, t) : void 0
                    }
                }(e)) || t && e && "number" == typeof e.length) {
                n && (e = n);
                var r = 0,
                    o = function() {};
                return {
                    s: o,
                    n: function() {
                        return r >= e.length ? {
                            done: !0
                        } : {
                            done: !1,
                            value: e[r++]
                        }
                    },
                    e: function(e) {
                        throw e
                    },
                    f: o
                }
            }
            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }
        var a, i = !0,
            c = !1;
        return {
            s: function() {
                n = n.call(e)
            },
            n: function() {
                var e = n.next();
                return i = e.done, e
            },
            e: function(e) {
                c = !0, a = e
            },
            f: function() {
                try {
                    i || null == n.return || n.return()
                } finally {
                    if (c) throw a
                }
            }
        }
    }

    function l(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
        return r
    }
    var f = !1;

    function d() {
        if (!f) {
            var e, t = s(u);
            try {
                for (t.s(); !(e = t.n()).done;) {
                    var n = e.value,
                        r = n.family,
                        o = n.file,
                        a = n.weight,
                        i = n.unicodeRange;
                    document.fonts.add(new FontFace(r, 'url("'.concat(chrome.runtime.getURL("fonts/".concat(o)), '")'), {
                        weight: a,
                        unicodeRange: i,
                        style: "normal",
                        display: "swap"
                    }))
                }
            } catch (e) {
                t.e(e)
            } finally {
                t.f()
            }
            f = !0
        }
    }

    function h(e) {
        return h = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, h(e)
    }

    function p() {
        p = function() {
            return t
        };
        var e, t = {},
            n = Object.prototype,
            r = n.hasOwnProperty,
            o = Object.defineProperty || function(e, t, n) {
                e[t] = n.value
            },
            a = "function" == typeof Symbol ? Symbol : {},
            i = a.iterator || "@@iterator",
            c = a.asyncIterator || "@@asyncIterator",
            u = a.toStringTag || "@@toStringTag";

        function s(e, t, n) {
            return Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            s({}, "")
        } catch (e) {
            s = function(e, t, n) {
                return e[t] = n
            }
        }

        function l(e, t, n, r) {
            var a = t && t.prototype instanceof b ? t : b,
                i = Object.create(a.prototype),
                c = new N(r || []);
            return o(i, "_invoke", {
                value: C(e, n, c)
            }), i
        }

        function f(e, t, n) {
            try {
                return {
                    type: "normal",
                    arg: e.call(t, n)
                }
            } catch (e) {
                return {
                    type: "throw",
                    arg: e
                }
            }
        }
        t.wrap = l;
        var d = "suspendedStart",
            m = "suspendedYield",
            g = "executing",
            v = "completed",
            y = {};

        function b() {}

        function w() {}

        function E() {}
        var x = {};
        s(x, i, (function() {
            return this
        }));
        var L = Object.getPrototypeOf,
            O = L && L(L(U([])));
        O && O !== n && r.call(O, i) && (x = O);
        var _ = E.prototype = b.prototype = Object.create(x);

        function I(e) {
            ["next", "throw", "return"].forEach((function(t) {
                s(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function S(e, t) {
            function n(o, a, i, c) {
                var u = f(e[o], e, a);
                if ("throw" !== u.type) {
                    var s = u.arg,
                        l = s.value;
                    return l && "object" == h(l) && r.call(l, "__await") ? t.resolve(l.__await).then((function(e) {
                        n("next", e, i, c)
                    }), (function(e) {
                        n("throw", e, i, c)
                    })) : t.resolve(l).then((function(e) {
                        s.value = e, i(s)
                    }), (function(e) {
                        return n("throw", e, i, c)
                    }))
                }
                c(u.arg)
            }
            var a;
            o(this, "_invoke", {
                value: function(e, r) {
                    function o() {
                        return new t((function(t, o) {
                            n(e, r, t, o)
                        }))
                    }
                    return a = a ? a.then(o, o) : o()
                }
            })
        }

        function C(t, n, r) {
            var o = d;
            return function(a, i) {
                if (o === g) throw Error("Generator is already running");
                if (o === v) {
                    if ("throw" === a) throw i;
                    return {
                        value: e,
                        done: !0
                    }
                }
                for (r.method = a, r.arg = i;;) {
                    var c = r.delegate;
                    if (c) {
                        var u = k(c, r);
                        if (u) {
                            if (u === y) continue;
                            return u
                        }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                        if (o === d) throw o = v, r.arg;
                        r.dispatchException(r.arg)
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    o = g;
                    var s = f(t, n, r);
                    if ("normal" === s.type) {
                        if (o = r.done ? v : m, s.arg === y) continue;
                        return {
                            value: s.arg,
                            done: r.done
                        }
                    }
                    "throw" === s.type && (o = v, r.method = "throw", r.arg = s.arg)
                }
            }
        }

        function k(t, n) {
            var r = n.method,
                o = t.iterator[r];
            if (o === e) return n.delegate = null, "throw" === r && t.iterator.return && (n.method = "return", n.arg = e, k(t, n), "throw" === n.method) || "return" !== r && (n.method = "throw", n.arg = new TypeError("The iterator does not provide a '" + r + "' method")), y;
            var a = f(o, t.iterator, n.arg);
            if ("throw" === a.type) return n.method = "throw", n.arg = a.arg, n.delegate = null, y;
            var i = a.arg;
            return i ? i.done ? (n[t.resultName] = i.value, n.next = t.nextLoc, "return" !== n.method && (n.method = "next", n.arg = e), n.delegate = null, y) : i : (n.method = "throw", n.arg = new TypeError("iterator result is not an object"), n.delegate = null, y)
        }

        function T(e) {
            var t = {
                tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
        }

        function P(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t
        }

        function N(e) {
            this.tryEntries = [{
                tryLoc: "root"
            }], e.forEach(T, this), this.reset(!0)
        }

        function U(t) {
            if (t || "" === t) {
                var n = t[i];
                if (n) return n.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var o = -1,
                        a = function n() {
                            for (; ++o < t.length;)
                                if (r.call(t, o)) return n.value = t[o], n.done = !1, n;
                            return n.value = e, n.done = !0, n
                        };
                    return a.next = a
                }
            }
            throw new TypeError(h(t) + " is not iterable")
        }
        return w.prototype = E, o(_, "constructor", {
            value: E,
            configurable: !0
        }), o(E, "constructor", {
            value: w,
            configurable: !0
        }), w.displayName = s(E, u, "GeneratorFunction"), t.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === w || "GeneratorFunction" === (t.displayName || t.name))
        }, t.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, E) : (e.__proto__ = E, s(e, u, "GeneratorFunction")), e.prototype = Object.create(_), e
        }, t.awrap = function(e) {
            return {
                __await: e
            }
        }, I(S.prototype), s(S.prototype, c, (function() {
            return this
        })), t.AsyncIterator = S, t.async = function(e, n, r, o, a) {
            void 0 === a && (a = Promise);
            var i = new S(l(e, n, r, o), a);
            return t.isGeneratorFunction(n) ? i : i.next().then((function(e) {
                return e.done ? e.value : i.next()
            }))
        }, I(_), s(_, u, "Generator"), s(_, i, (function() {
            return this
        })), s(_, "toString", (function() {
            return "[object Generator]"
        })), t.keys = function(e) {
            var t = Object(e),
                n = [];
            for (var r in t) n.push(r);
            return n.reverse(),
                function e() {
                    for (; n.length;) {
                        var r = n.pop();
                        if (r in t) return e.value = r, e.done = !1, e
                    }
                    return e.done = !0, e
                }
        }, t.values = U, N.prototype = {
            constructor: N,
            reset: function(t) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = e, this.done = !1, this.delegate = null, this.method = "next", this.arg = e, this.tryEntries.forEach(P), !t)
                    for (var n in this) "t" === n.charAt(0) && r.call(this, n) && !isNaN(+n.slice(1)) && (this[n] = e)
            },
            stop: function() {
                this.done = !0;
                var e = this.tryEntries[0].completion;
                if ("throw" === e.type) throw e.arg;
                return this.rval
            },
            dispatchException: function(t) {
                if (this.done) throw t;
                var n = this;

                function o(r, o) {
                    return c.type = "throw", c.arg = t, n.next = r, o && (n.method = "next", n.arg = e), !!o
                }
                for (var a = this.tryEntries.length - 1; a >= 0; --a) {
                    var i = this.tryEntries[a],
                        c = i.completion;
                    if ("root" === i.tryLoc) return o("end");
                    if (i.tryLoc <= this.prev) {
                        var u = r.call(i, "catchLoc"),
                            s = r.call(i, "finallyLoc");
                        if (u && s) {
                            if (this.prev < i.catchLoc) return o(i.catchLoc, !0);
                            if (this.prev < i.finallyLoc) return o(i.finallyLoc)
                        } else if (u) {
                            if (this.prev < i.catchLoc) return o(i.catchLoc, !0)
                        } else {
                            if (!s) throw Error("try statement without catch or finally");
                            if (this.prev < i.finallyLoc) return o(i.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var o = this.tryEntries[n];
                    if (o.tryLoc <= this.prev && r.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
                        var a = o;
                        break
                    }
                }
                a && ("break" === e || "continue" === e) && a.tryLoc <= t && t <= a.finallyLoc && (a = null);
                var i = a ? a.completion : {};
                return i.type = e, i.arg = t, a ? (this.method = "next", this.next = a.finallyLoc, y) : this.complete(i)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), y
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), P(n), y
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.tryLoc === e) {
                        var r = n.completion;
                        if ("throw" === r.type) {
                            var o = r.arg;
                            P(n)
                        }
                        return o
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(t, n, r) {
                return this.delegate = {
                    iterator: U(t),
                    resultName: n,
                    nextLoc: r
                }, "next" === this.method && (this.arg = e), y
            }
        }, t
    }

    function m(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t && (r = r.filter((function(t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable
            }))), n.push.apply(n, r)
        }
        return n
    }

    function g(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2 ? m(Object(n), !0).forEach((function(t) {
                v(e, t, n[t])
            })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : m(Object(n)).forEach((function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
            }))
        }
        return e
    }

    function v(e, t, n) {
        return (t = function(e) {
            var t = function(e, t) {
                if ("object" != h(e) || !e) return e;
                var n = e[Symbol.toPrimitive];
                if (void 0 !== n) {
                    var r = n.call(e, t || "default");
                    if ("object" != h(r)) return r;
                    throw new TypeError("@@toPrimitive must return a primitive value.")
                }
                return ("string" === t ? String : Number)(e)
            }(e, "string");
            return "symbol" == h(t) ? t : t + ""
        }(t)) in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = n, e
    }

    function y(e, t, n, r, o, a, i) {
        try {
            var c = e[a](i),
                u = c.value
        } catch (e) {
            return void n(e)
        }
        c.done ? t(u) : Promise.resolve(u).then(r, o)
    }

    function b(e) {
        return function() {
            var t = this,
                n = arguments;
            return new Promise((function(r, o) {
                var a = e.apply(t, n);

                function i(e) {
                    y(a, r, o, i, c, "next", e)
                }

                function c(e) {
                    y(a, r, o, i, c, "throw", e)
                }
                i(void 0)
            }))
        }
    }
    var w = null,
        E = null,
        x = null;

    function L(e, t) {
        try {
            return chrome.i18n.getMessage(e) || t
        } catch (e) {
            return t
        }
    }

    function O() {
        if (!w || !w.isConnected) {
            d(), (w = document.createElement("div")).className = "exception-".concat(chrome.runtime.id), w.style.all = "initial", E = w.attachShadow({
                mode: "open"
            });
            var e = document.createElement("style");
            e.textContent = '\n  :host {\n    all: initial;\n    --font-sans: "Bo doi Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", Arial, sans-serif;\n    --font-mono: "Bo doi Geist Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;\n    --primary: #1f1f1f;\n    --secondary: #74777c;\n    --quaternary: #b1b6bc;\n    --background: #ffffff;\n    --surface: #f2f2f2;\n    --elevated: #f2f2f2;\n    --surface-elevated: #ffffff;\n    --stroke: rgba(0, 0, 0, 0.08);\n    color-scheme: light;\n  }\n\n  @media (prefers-color-scheme: dark) {\n    :host {\n      --primary: #eeeeee;\n      --secondary: #c7c7c7;\n      --quaternary: #6c7075;\n      --background: #131313;\n      --surface: #1c1c1c;\n      --elevated: #2c2c2c;\n      --surface-elevated: #1f1f1f;\n      --stroke: rgba(255, 255, 255, 0.08);\n      color-scheme: dark;\n    }\n  }\n\n  :host(.force-light) {\n    --primary: #1f1f1f;\n    --secondary: #74777c;\n    --quaternary: #b1b6bc;\n    --background: #ffffff;\n    --surface: #f2f2f2;\n    --elevated: #f2f2f2;\n    --surface-elevated: #ffffff;\n    --stroke: rgba(0, 0, 0, 0.08);\n    color-scheme: light;\n  }\n\n  :host(.force-dark) {\n    --primary: #eeeeee;\n    --secondary: #c7c7c7;\n    --quaternary: #6c7075;\n    --background: #131313;\n    --surface: #1c1c1c;\n    --elevated: #2c2c2c;\n    --surface-elevated: #1f1f1f;\n    --stroke: rgba(255, 255, 255, 0.08);\n    color-scheme: dark;\n  }\n\n  .modal {\n    width: 400px;\n    max-width: calc(100vw - 32px);\n    max-height: 90vh;\n    padding: 0;\n    border: none;\n    border-radius: 16px;\n    margin: auto;\n    background: var(--surface-elevated);\n    color: var(--primary);\n    box-shadow: 0 0 0 1px var(--stroke), 0 2px 8px 0 rgba(0, 0, 0, 0.06);\n    font-family: var(--font-sans);\n    overflow: hidden;\n  }\n\n  .modal::backdrop {\n    background: rgba(0, 0, 0, 0.4);\n  }\n\n  .content-wrapper {\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n    padding: 24px;\n  }\n\n  h2 {\n    margin: 0;\n    font-size: 16px;\n    font-weight: 600;\n    color: var(--primary);\n  }\n\n  p {\n    margin: 0;\n    font-size: 14px;\n    line-height: 1.5;\n    color: var(--secondary);\n  }\n\n  p:empty {\n    display: none;\n  }\n\n  .input-mono {\n    height: 40px;\n    width: 100%;\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0 12px;\n    background: transparent;\n    border: 1px solid var(--stroke);\n    border-radius: 8px;\n    font-size: 14px;\n    font-family: var(--font-mono);\n    color: var(--primary);\n    outline: none;\n  }\n\n  .input-mono:focus {\n    border-color: var(--quaternary);\n  }\n\n  .input-mono::placeholder {\n    color: var(--secondary);\n  }\n\n  .dialog-fields {\n    display: flex;\n    gap: 12px;\n  }\n\n  .dialog-field {\n    flex: 1;\n    min-width: 0;\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n  }\n\n  .dialog-field-label {\n    padding-top: 8px;\n    font-size: 12px;\n    font-weight: 500;\n    color: var(--secondary);\n  }\n\n  .dialog-number {\n    position: relative;\n    display: flex;\n    align-items: center;\n  }\n\n  .dialog-unit {\n    position: absolute;\n    right: 12px;\n    font-size: 12px;\n    font-family: var(--font-mono);\n    color: var(--secondary);\n    pointer-events: none;\n  }\n\n  .dialog-number .input-mono {\n    padding-right: 32px;\n  }\n\n  .input-mono::-webkit-outer-spin-button,\n  .input-mono::-webkit-inner-spin-button {\n    -webkit-appearance: none;\n    margin: 0;\n  }\n\n  .input-mono[type="number"] {\n    -moz-appearance: textfield;\n    appearance: textfield;\n  }\n\n  .dialog-actions {\n    display: flex;\n    justify-content: flex-end;\n    gap: 8px;\n    padding-top: 8px;\n  }\n\n  .btn-dialog-primary,\n  .btn-dialog-secondary {\n    height: 36px;\n    padding: 0 16px;\n    border: none;\n    border-radius: 12px;\n    font-size: 14px;\n    font-weight: 500;\n    font-family: var(--font-sans);\n    cursor: pointer;\n    outline: none;\n  }\n\n  .btn-dialog-primary {\n    background: var(--primary);\n    color: var(--background);\n  }\n\n  .btn-dialog-primary:hover {\n    opacity: 0.9;\n  }\n\n  .btn-dialog-secondary {\n    background: transparent;\n    color: var(--primary);\n  }\n\n  .btn-dialog-secondary:hover {\n    background: var(--elevated);\n  }\n', E.appendChild(e), document.body.appendChild(w)
        }
    }

    function _() {
        return I.apply(this, arguments)
    }

    function I() {
        return (I = b(p().mark((function e() {
            var t, n;
            return p().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return w.classList.remove("force-light", "force-dark"), e.prev = 1, e.next = 4, chrome.storage.local.get({
                            theme: "system"
                        });
                    case 4:
                        t = e.sent, "dark" === (n = t.theme) ? w.classList.add("force-dark") : "light" === n && w.classList.add("force-light"), e.next = 11;
                        break;
                    case 9:
                        e.prev = 9, e.t0 = e.catch(1);
                    case 11:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [1, 9]
            ])
        })))).apply(this, arguments)
    }

    function S(e) {
        return C.apply(this, arguments)
    }

    function C() {
        return (C = b(p().mark((function e(t) {
            return p().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return O(), e.next = 3, _();
                    case 3:
                        return e.abrupt("return", new Promise((function(e) {
                            x && (x.remove(), x = null);
                            var n = document.createElement("dialog");
                            n.className = "modal";
                            var r = document.createElement("div");
                            if (r.className = "content-wrapper", t.title) {
                                var o = document.createElement("h2");
                                o.textContent = t.title, r.appendChild(o)
                            }
                            var a = document.createElement("p");
                            a.textContent = t.body || "", r.appendChild(a);
                            var i = null,
                                c = null;
                            if ("size" === t.type) {
                                var u = document.createElement("div");
                                u.className = "dialog-fields";
                                var s = function(e, n, r) {
                                    var o = document.createElement("label");
                                    o.className = "dialog-field";
                                    var a = document.createElement("span");
                                    a.className = "dialog-field-label", a.textContent = e, o.appendChild(a);
                                    var i = document.createElement("div");
                                    i.className = "dialog-number";
                                    var c = document.createElement("input");
                                    c.type = "number", c.className = "input-mono", c.min = String(null != r ? r : 1), null != t.max && (c.max = String(t.max)), c.inputMode = "numeric", c.autocomplete = "off", null != n && (c.value = String(n)), i.appendChild(c);
                                    var s = document.createElement("span");
                                    return s.className = "dialog-unit", s.textContent = "px", i.appendChild(s), o.appendChild(i), u.appendChild(o), c
                                };
                                i = s(L("LABEL_WIDTH", "Width"), t.width, t.minWidth), c = s(L("LABEL_HEIGHT", "Height"), t.height, t.minHeight), r.appendChild(u)
                            }
                            var l = null;
                            "prompt" === t.type && ((l = document.createElement("input")).type = "text", l.className = "input-mono", l.autocomplete = "off", l.spellcheck = !1, t.placeholder && (l.placeholder = t.placeholder), t.value && (l.value = t.value), r.appendChild(l));
                            var f = document.createElement("div");
                            f.className = "dialog-actions";
                            var d = function(t) {
                                    try {
                                        n.close()
                                    } catch (e) {}
                                    n.remove(), x === n && (x = null), e(t)
                                },
                                h = "prompt" === t.type || "size" === t.type ? null : "confirm" !== t.type && void 0;
                            if ("alert" !== t.type) {
                                var p = document.createElement("button");
                                p.type = "button", p.className = "btn-dialog-secondary", p.textContent = t.cancelLabel || L("DIALOG_CANCEL_BUTTON", "Cancel"), p.addEventListener("click", (function() {
                                    return d(h)
                                })), f.appendChild(p)
                            }
                            var m = document.createElement("button");
                            if (m.type = "button", m.className = "btn-dialog-primary", m.textContent = t.confirmLabel || ("alert" === t.type ? L("DIALOG_OK", "OK") : L("DIALOG_CONFIRM", "Confirm")), m.addEventListener("click", (function() {
                                    if ("prompt" === t.type) d(l.value);
                                    else if ("confirm" === t.type) d(!0);
                                    else if ("size" === t.type) {
                                        var e = parseInt(i.value, 10),
                                            n = parseInt(c.value, 10),
                                            r = function(e, n) {
                                                var r;
                                                return Math.min(null !== (r = t.max) && void 0 !== r ? r : 1 / 0, Math.max(null != n ? n : 1, e))
                                            };
                                        if (!Number.isFinite(e) || !Number.isFinite(n)) return void d(null);
                                        d({
                                            width: r(e, t.minWidth),
                                            height: r(n, t.minHeight)
                                        })
                                    } else d()
                                })), f.appendChild(m), r.appendChild(f), n.appendChild(r), n.addEventListener("cancel", (function(e) {
                                    e.preventDefault(), d(h)
                                })), n.addEventListener("click", (function(e) {
                                    e.target === n && d(h)
                                })), E.appendChild(n), x = n, n.showModal(), l && setTimeout((function() {
                                    return l.focus()
                                }), 50), i) {
                                setTimeout((function() {
                                    i.focus(), i.select()
                                }), 50);
                                for (var g = 0, v = [i, c]; g < v.length; g++) {
                                    v[g].addEventListener("keydown", (function(e) {
                                        "Enter" === e.key && (e.preventDefault(), m.click())
                                    }))
                                }
                            }
                        })));
                    case 4:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }
    const k = {
        alert: function() {
            return S(g(g({}, arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), {}, {
                type: "alert"
            }))
        },
        confirm: function() {
            return S(g(g({}, arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), {}, {
                type: "confirm"
            }))
        },
        prompt: function() {
            return S(g(g({}, arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), {}, {
                type: "prompt"
            }))
        },
        size: function() {
            return S(g(g({}, arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), {}, {
                type: "size"
            }))
        }
    };

    function T(e) {
        return T = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, T(e)
    }

    function P(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t && (r = r.filter((function(t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable
            }))), n.push.apply(n, r)
        }
        return n
    }

    function N(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2 ? P(Object(n), !0).forEach((function(t) {
                U(e, t, n[t])
            })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : P(Object(n)).forEach((function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
            }))
        }
        return e
    }

    function U(e, t, n) {
        return (t = function(e) {
            var t = function(e, t) {
                if ("object" != T(e) || !e) return e;
                var n = e[Symbol.toPrimitive];
                if (void 0 !== n) {
                    var r = n.call(e, t || "default");
                    if ("object" != T(r)) return r;
                    throw new TypeError("@@toPrimitive must return a primitive value.")
                }
                return ("string" === t ? String : Number)(e)
            }(e, "string");
            return "symbol" == T(t) ? t : t + ""
        }(t)) in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = n, e
    }

    function M() {
        M = function() {
            return t
        };
        var e, t = {},
            n = Object.prototype,
            r = n.hasOwnProperty,
            o = Object.defineProperty || function(e, t, n) {
                e[t] = n.value
            },
            a = "function" == typeof Symbol ? Symbol : {},
            i = a.iterator || "@@iterator",
            c = a.asyncIterator || "@@asyncIterator",
            u = a.toStringTag || "@@toStringTag";

        function s(e, t, n) {
            return Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            s({}, "")
        } catch (e) {
            s = function(e, t, n) {
                return e[t] = n
            }
        }

        function l(e, t, n, r) {
            var a = t && t.prototype instanceof v ? t : v,
                i = Object.create(a.prototype),
                c = new P(r || []);
            return o(i, "_invoke", {
                value: I(e, n, c)
            }), i
        }

        function f(e, t, n) {
            try {
                return {
                    type: "normal",
                    arg: e.call(t, n)
                }
            } catch (e) {
                return {
                    type: "throw",
                    arg: e
                }
            }
        }
        t.wrap = l;
        var d = "suspendedStart",
            h = "suspendedYield",
            p = "executing",
            m = "completed",
            g = {};

        function v() {}

        function y() {}

        function b() {}
        var w = {};
        s(w, i, (function() {
            return this
        }));
        var E = Object.getPrototypeOf,
            x = E && E(E(N([])));
        x && x !== n && r.call(x, i) && (w = x);
        var L = b.prototype = v.prototype = Object.create(w);

        function O(e) {
            ["next", "throw", "return"].forEach((function(t) {
                s(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function _(e, t) {
            function n(o, a, i, c) {
                var u = f(e[o], e, a);
                if ("throw" !== u.type) {
                    var s = u.arg,
                        l = s.value;
                    return l && "object" == T(l) && r.call(l, "__await") ? t.resolve(l.__await).then((function(e) {
                        n("next", e, i, c)
                    }), (function(e) {
                        n("throw", e, i, c)
                    })) : t.resolve(l).then((function(e) {
                        s.value = e, i(s)
                    }), (function(e) {
                        return n("throw", e, i, c)
                    }))
                }
                c(u.arg)
            }
            var a;
            o(this, "_invoke", {
                value: function(e, r) {
                    function o() {
                        return new t((function(t, o) {
                            n(e, r, t, o)
                        }))
                    }
                    return a = a ? a.then(o, o) : o()
                }
            })
        }

        function I(t, n, r) {
            var o = d;
            return function(a, i) {
                if (o === p) throw Error("Generator is already running");
                if (o === m) {
                    if ("throw" === a) throw i;
                    return {
                        value: e,
                        done: !0
                    }
                }
                for (r.method = a, r.arg = i;;) {
                    var c = r.delegate;
                    if (c) {
                        var u = S(c, r);
                        if (u) {
                            if (u === g) continue;
                            return u
                        }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                        if (o === d) throw o = m, r.arg;
                        r.dispatchException(r.arg)
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    o = p;
                    var s = f(t, n, r);
                    if ("normal" === s.type) {
                        if (o = r.done ? m : h, s.arg === g) continue;
                        return {
                            value: s.arg,
                            done: r.done
                        }
                    }
                    "throw" === s.type && (o = m, r.method = "throw", r.arg = s.arg)
                }
            }
        }

        function S(t, n) {
            var r = n.method,
                o = t.iterator[r];
            if (o === e) return n.delegate = null, "throw" === r && t.iterator.return && (n.method = "return", n.arg = e, S(t, n), "throw" === n.method) || "return" !== r && (n.method = "throw", n.arg = new TypeError("The iterator does not provide a '" + r + "' method")), g;
            var a = f(o, t.iterator, n.arg);
            if ("throw" === a.type) return n.method = "throw", n.arg = a.arg, n.delegate = null, g;
            var i = a.arg;
            return i ? i.done ? (n[t.resultName] = i.value, n.next = t.nextLoc, "return" !== n.method && (n.method = "next", n.arg = e), n.delegate = null, g) : i : (n.method = "throw", n.arg = new TypeError("iterator result is not an object"), n.delegate = null, g)
        }

        function C(e) {
            var t = {
                tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
        }

        function k(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t
        }

        function P(e) {
            this.tryEntries = [{
                tryLoc: "root"
            }], e.forEach(C, this), this.reset(!0)
        }

        function N(t) {
            if (t || "" === t) {
                var n = t[i];
                if (n) return n.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var o = -1,
                        a = function n() {
                            for (; ++o < t.length;)
                                if (r.call(t, o)) return n.value = t[o], n.done = !1, n;
                            return n.value = e, n.done = !0, n
                        };
                    return a.next = a
                }
            }
            throw new TypeError(T(t) + " is not iterable")
        }
        return y.prototype = b, o(L, "constructor", {
            value: b,
            configurable: !0
        }), o(b, "constructor", {
            value: y,
            configurable: !0
        }), y.displayName = s(b, u, "GeneratorFunction"), t.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === y || "GeneratorFunction" === (t.displayName || t.name))
        }, t.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, b) : (e.__proto__ = b, s(e, u, "GeneratorFunction")), e.prototype = Object.create(L), e
        }, t.awrap = function(e) {
            return {
                __await: e
            }
        }, O(_.prototype), s(_.prototype, c, (function() {
            return this
        })), t.AsyncIterator = _, t.async = function(e, n, r, o, a) {
            void 0 === a && (a = Promise);
            var i = new _(l(e, n, r, o), a);
            return t.isGeneratorFunction(n) ? i : i.next().then((function(e) {
                return e.done ? e.value : i.next()
            }))
        }, O(L), s(L, u, "Generator"), s(L, i, (function() {
            return this
        })), s(L, "toString", (function() {
            return "[object Generator]"
        })), t.keys = function(e) {
            var t = Object(e),
                n = [];
            for (var r in t) n.push(r);
            return n.reverse(),
                function e() {
                    for (; n.length;) {
                        var r = n.pop();
                        if (r in t) return e.value = r, e.done = !1, e
                    }
                    return e.done = !0, e
                }
        }, t.values = N, P.prototype = {
            constructor: P,
            reset: function(t) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = e, this.done = !1, this.delegate = null, this.method = "next", this.arg = e, this.tryEntries.forEach(k), !t)
                    for (var n in this) "t" === n.charAt(0) && r.call(this, n) && !isNaN(+n.slice(1)) && (this[n] = e)
            },
            stop: function() {
                this.done = !0;
                var e = this.tryEntries[0].completion;
                if ("throw" === e.type) throw e.arg;
                return this.rval
            },
            dispatchException: function(t) {
                if (this.done) throw t;
                var n = this;

                function o(r, o) {
                    return c.type = "throw", c.arg = t, n.next = r, o && (n.method = "next", n.arg = e), !!o
                }
                for (var a = this.tryEntries.length - 1; a >= 0; --a) {
                    var i = this.tryEntries[a],
                        c = i.completion;
                    if ("root" === i.tryLoc) return o("end");
                    if (i.tryLoc <= this.prev) {
                        var u = r.call(i, "catchLoc"),
                            s = r.call(i, "finallyLoc");
                        if (u && s) {
                            if (this.prev < i.catchLoc) return o(i.catchLoc, !0);
                            if (this.prev < i.finallyLoc) return o(i.finallyLoc)
                        } else if (u) {
                            if (this.prev < i.catchLoc) return o(i.catchLoc, !0)
                        } else {
                            if (!s) throw Error("try statement without catch or finally");
                            if (this.prev < i.finallyLoc) return o(i.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var o = this.tryEntries[n];
                    if (o.tryLoc <= this.prev && r.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
                        var a = o;
                        break
                    }
                }
                a && ("break" === e || "continue" === e) && a.tryLoc <= t && t <= a.finallyLoc && (a = null);
                var i = a ? a.completion : {};
                return i.type = e, i.arg = t, a ? (this.method = "next", this.next = a.finallyLoc, g) : this.complete(i)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), g
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), k(n), g
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.tryLoc === e) {
                        var r = n.completion;
                        if ("throw" === r.type) {
                            var o = r.arg;
                            k(n)
                        }
                        return o
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(t, n, r) {
                return this.delegate = {
                    iterator: N(t),
                    resultName: n,
                    nextLoc: r
                }, "next" === this.method && (this.arg = e), g
            }
        }, t
    }

    function D(e, t, n, r, o, a, i) {
        try {
            var c = e[a](i),
                u = c.value
        } catch (e) {
            return void n(e)
        }
        c.done ? t(u) : Promise.resolve(u).then(r, o)
    }

    function A(e) {
        return function() {
            var t = this,
                n = arguments;
            return new Promise((function(r, o) {
                var a = e.apply(t, n);

                function i(e) {
                    D(a, r, o, i, c, "next", e)
                }

                function c(e) {
                    D(a, r, o, i, c, "throw", e)
                }
                i(void 0)
            }))
        }
    }
    

    function j() {
        return (j = A(M().mark((function e() {
            var t, n, r;
            return M().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return d(), V(), e.next = 4, i.storageLocalGet({
                            theme: "system"
                        });
                    case 4:
                        return t = e.sent, H(n = t.theme), (r = document.getElementById("theme-select")).value = n, r.addEventListener("change", q), e.next = 12;
                    case 12:
                        return re(), e.next = 16, z();
                    case 16:
                        return e.next = 18, Q();
                    case 18:
                        B(), document.body.style.opacity = "1";
                    case 20:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }
    document.addEventListener("DOMContentLoaded", (function() {
        return j.apply(this, arguments)
    })), chrome.storage.onChanged.addListener((function(e) {
        if (e.theme) {
            var t = e.theme.newValue || "system";
            H(t);
            var n = document.getElementById("theme-select");
            n && n.value !== t && (n.value = t)
        }
        e.mcpIntent && F && F(!!e.mcpIntent.newValue);
        if (e.sidePanelPreferences) {
            var r, o = null === (r = e.sidePanelPreferences.newValue) || void 0 === r ? void 0 : r.colorFormat,
                a = document.getElementById("color-format-select");
            a && o && a.value !== o && (a.value = o)
        }
        if (e.screenshotPreferences) {
            var i = e.screenshotPreferences.newValue || {},
                c = document.getElementById("screenshot-padding-toggle"),
                u = document.getElementById("screenshot-highlights-toggle");
            c && "boolean" == typeof i.includePadding && (c.checked = i.includePadding), u && "boolean" == typeof i.includeHighlights && (u.checked = i.includeHighlights)
        }
    }));
    var F = null;

    function B() {
        return G.apply(this, arguments)
    }

    function G() {
        return (G = A(M().mark((function e() {
            var t, n, r, o, a, u, s, l, f, d, h;
            return M().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (n = document.getElementById("mcp-connect-button")) {
                            e.next = 3;
                            break
                        }
                        return e.abrupt("return");
                    case 3:
                        return (s = document.getElementById("mcp-version-warning")) && s.setAttribute("title", chrome.i18n.getMessage("OPTIONS_MCP_VERSION_OUTDATED_TOOLTIP")), l = function(e) {
                            s && (s.hidden = !(e && e.versionMismatch))
                        }, f = function() {
                            n.textContent = chrome.i18n.getMessage("OPTIONS_MCP_DISCONNECT_BUTTON"), n.dataset.state = "connected"
                        }, d = function() {
                            n.textContent = chrome.i18n.getMessage("OPTIONS_MCP_CONNECT_BUTTON"), n.dataset.state = "disconnected"
                        }, F = function(e) {
                            e ? f() : (d(), l(null))
                        }, e.prev = 21, e.next = 24, i.sendMessage({
                            target: "background",
                            action: "request_mcp_status"
                        });
                    case 24:
                        (h = e.sent) && h.intent ? f() : d(), l(h), e.next = 33;
                        break;
                    case 29:
                        e.prev = 29, e.t0 = e.catch(21), d(), l(null);
                    case 33:
                        n.addEventListener("click", A(M().mark((function e() {
                            var t, r;
                            return M().wrap((function(e) {
                                for (;;) switch (e.prev = e.next) {
                                    case 0:
                                        if (t = "connected" === n.dataset.state, n.disabled = !0, e.prev = 2, !t) {
                                            e.next = 10;
                                            break
                                        }
                                        return e.next = 6, i.sendMessage({
                                            target: "background",
                                            action: "request_mcp_disconnect"
                                        });
                                    case 6:
                                        d(), l(null), e.next = 18;
                                        break;
                                    case 10:
                                        return e.next = 12, i.sendMessage({
                                            target: "background",
                                            action: "request_mcp_connect"
                                        });
                                    case 12:
                                        if (r = e.sent, f(), l(r), !r || !r.versionMismatch) {
                                            e.next = 18;
                                            break
                                        }
                                        return e.next = 18, k.alert({
                                            title: chrome.i18n.getMessage("OPTIONS_MCP_VERSION_OUTDATED_TITLE"),
                                            body: chrome.i18n.getMessage("OPTIONS_MCP_VERSION_OUTDATED_BODY", [r.serverVersion || chrome.i18n.getMessage("OPTIONS_MCP_VERSION_UNKNOWN"), c.MIN_MCP_SERVER_VERSION])
                                        });
                                    case 18:
                                        return e.prev = 18, n.disabled = !1, e.finish(18);
                                    case 21:
                                    case "end":
                                        return e.stop()
                                }
                            }), e, null, [
                                [2, , 18, 21]
                            ])
                        }))));
                    case 34:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [21, 29]
            ])
        })))).apply(this, arguments)
    }

    function V() {
        document.querySelectorAll("[data-i18n]").forEach((function(e) {
            var t = chrome.i18n.getMessage(e.dataset.i18n);
            t && (e.textContent = t)
        })), document.querySelectorAll("[data-i18n-html]").forEach((function(e) {
            var t = chrome.i18n.getMessage(e.dataset.i18nHtml);
            t && (e.innerHTML = t)
        }))
    }

    function H(e) {
        var t = document.documentElement;
        "dark" === e ? (t.classList.remove("force-light"), t.classList.add("force-dark")) : "light" === e ? (t.classList.remove("force-dark"), t.classList.add("force-light")) : t.classList.remove("force-light", "force-dark")
    }

    function q(e) {
        return Y.apply(this, arguments)
    }

    function Y() {
        return (Y = A(M().mark((function e(t) {
            var n;
            return M().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return n = t.target.value, e.next = 3, i.storageLocalSet({
                            theme: n
                        });
                    case 3:
                        H(n);
                    case 4:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function z() {
        return K.apply(this, arguments)
    }

    function K() {
        return (K = A(M().mark((function e() {
            var t, n, r;
            return M().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return t = document.getElementById("color-format-select"), e.next = 3, i.storageLocalGet({
                            sidePanelPreferences: {}
                        });
                    case 3:
                        n = e.sent, r = n.sidePanelPreferences, t.value = (null == r ? void 0 : r.colorFormat) || "HEX", t.addEventListener("change", W);
                    case 7:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function W(e) {
        return J.apply(this, arguments)
    }

    function J() {
        return (J = A(M().mark((function e(t) {
            var n, r, o;
            return M().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, i.storageLocalGet({
                            sidePanelPreferences: {}
                        });
                    case 2:
                        return n = e.sent, r = n.sidePanelPreferences, o = N(N({}, r || {}), {}, {
                            colorFormat: t.target.value
                        }), e.next = 7, i.storageLocalSet({
                            sidePanelPreferences: o
                        });
                    case 7:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function Q() {
        return X.apply(this, arguments)
    }

    function X() {
        return (X = A(M().mark((function e() {
            var t, n, r, o;
            return M().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return t = document.getElementById("screenshot-padding-toggle"), n = document.getElementById("screenshot-highlights-toggle"), e.next = 4, i.storageLocalGet({
                            screenshotPreferences: {
                                includePadding: !0,
                                includeHighlights: !0
                            }
                        });
                    case 4:
                        r = e.sent, o = r.screenshotPreferences, t.checked = !1 !== o.includePadding, n.checked = !1 !== o.includeHighlights, t.addEventListener("change", $), n.addEventListener("change", $);
                    case 10:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function $() {
        return Z.apply(this, arguments)
    }

    function Z() {
        return (Z = A(M().mark((function e() {
            var t, n;
            return M().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return t = document.getElementById("screenshot-padding-toggle"), n = document.getElementById("screenshot-highlights-toggle"), e.next = 4, i.storageLocalSet({
                            screenshotPreferences: {
                                includePadding: t.checked,
                                includeHighlights: n.checked
                            }
                        });
                    case 4:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function re() {
        var e = document.getElementById("clear-saved-edits-button");
        e && (e.textContent = chrome.i18n.getMessage("OPTIONS_SAVED_EDITS_CLEAR"), e.addEventListener("click", A(M().mark((function e() {
            var t, n;
            return M().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, k.confirm({
                            title: chrome.i18n.getMessage("OPTIONS_SAVED_EDITS_CONFIRM_TITLE"),
                            body: chrome.i18n.getMessage("OPTIONS_SAVED_EDITS_CONFIRM_BODY")
                        });
                    case 2:
                        if (e.sent) {
                            e.next = 5;
                            break
                        }
                        return e.abrupt("return");
                    case 5:
                        return e.next = 7, i.storageLocalGet(null);
                    case 7:
                        if (t = e.sent, !(n = Object.keys(t).filter((function(e) {
                                return e.startsWith("persistedRuleEdits:")
                            }))).length) {
                            e.next = 12;
                            break
                        }
                        return e.next = 12, i.storageLocalRemove(n);
                    case 12:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))))
    }

    
})();