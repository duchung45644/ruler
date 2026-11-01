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
            a = Object.prototype,
            o = a.hasOwnProperty,
            i = Object.defineProperty || function(e, t, n) {
                e[t] = n.value
            },
            c = "function" == typeof Symbol ? Symbol : {},
            s = c.iterator || "@@iterator",
            l = c.asyncIterator || "@@asyncIterator",
            u = c.toStringTag || "@@toStringTag";

        function d(e, t, n) {
            return Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            d({}, "")
        } catch (n) {
            d = function(e, t, n) {
                return e[t] = n
            }
        }

        function p(e, t, n, r) {
            var a = t && t.prototype instanceof b ? t : b,
                o = Object.create(a.prototype),
                c = new M(r || []);
            return i(o, "_invoke", {
                value: T(e, n, c)
            }), o
        }

        function m(e, t, n) {
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
        r.wrap = p;
        var f = "suspendedStart",
            h = "suspendedYield",
            v = "executing",
            g = "completed",
            y = {};

        function b() {}

        function w() {}

        function x() {}
        var E = {};
        d(E, s, (function() {
            return this
        }));
        var C = Object.getPrototypeOf,
            L = C && C(C(O([])));
        L && L !== a && o.call(L, s) && (E = L);
        var N = x.prototype = b.prototype = Object.create(E);

        function k(e) {
            ["next", "throw", "return"].forEach((function(t) {
                d(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function _(t, n) {
            function r(a, i, c, s) {
                var l = m(t[a], t, i);
                if ("throw" !== l.type) {
                    var u = l.arg,
                        d = u.value;
                    return d && "object" == e(d) && o.call(d, "__await") ? n.resolve(d.__await).then((function(e) {
                        r("next", e, c, s)
                    }), (function(e) {
                        r("throw", e, c, s)
                    })) : n.resolve(d).then((function(e) {
                        u.value = e, c(u)
                    }), (function(e) {
                        return r("throw", e, c, s)
                    }))
                }
                s(l.arg)
            }
            var a;
            i(this, "_invoke", {
                value: function(e, t) {
                    function o() {
                        return new n((function(n, a) {
                            r(e, t, n, a)
                        }))
                    }
                    return a = a ? a.then(o, o) : o()
                }
            })
        }

        function T(e, t, r) {
            var a = f;
            return function(o, i) {
                if (a === v) throw Error("Generator is already running");
                if (a === g) {
                    if ("throw" === o) throw i;
                    return {
                        value: n,
                        done: !0
                    }
                }
                for (r.method = o, r.arg = i;;) {
                    var c = r.delegate;
                    if (c) {
                        var s = S(c, r);
                        if (s) {
                            if (s === y) continue;
                            return s
                        }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                        if (a === f) throw a = g, r.arg;
                        r.dispatchException(r.arg)
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    a = v;
                    var l = m(e, t, r);
                    if ("normal" === l.type) {
                        if (a = r.done ? g : h, l.arg === y) continue;
                        return {
                            value: l.arg,
                            done: r.done
                        }
                    }
                    "throw" === l.type && (a = g, r.method = "throw", r.arg = l.arg)
                }
            }
        }

        function S(e, t) {
            var r = t.method,
                a = e.iterator[r];
            if (a === n) return t.delegate = null, "throw" === r && e.iterator.return && (t.method = "return", t.arg = n, S(e, t), "throw" === t.method) || "return" !== r && (t.method = "throw", t.arg = new TypeError("The iterator does not provide a '" + r + "' method")), y;
            var o = m(a, e.iterator, t.arg);
            if ("throw" === o.type) return t.method = "throw", t.arg = o.arg, t.delegate = null, y;
            var i = o.arg;
            return i ? i.done ? (t[e.resultName] = i.value, t.next = e.nextLoc, "return" !== t.method && (t.method = "next", t.arg = n), t.delegate = null, y) : i : (t.method = "throw", t.arg = new TypeError("iterator result is not an object"), t.delegate = null, y)
        }

        function $(e) {
            var t = {
                tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
        }

        function A(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t
        }

        function M(e) {
            this.tryEntries = [{
                tryLoc: "root"
            }], e.forEach($, this), this.reset(!0)
        }

        function O(t) {
            if (t || "" === t) {
                var r = t[s];
                if (r) return r.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var a = -1,
                        i = function e() {
                            for (; ++a < t.length;)
                                if (o.call(t, a)) return e.value = t[a], e.done = !1, e;
                            return e.value = n, e.done = !0, e
                        };
                    return i.next = i
                }
            }
            throw new TypeError(e(t) + " is not iterable")
        }
        return w.prototype = x, i(N, "constructor", {
            value: x,
            configurable: !0
        }), i(x, "constructor", {
            value: w,
            configurable: !0
        }), w.displayName = d(x, u, "GeneratorFunction"), r.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === w || "GeneratorFunction" === (t.displayName || t.name))
        }, r.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, x) : (e.__proto__ = x, d(e, u, "GeneratorFunction")), e.prototype = Object.create(N), e
        }, r.awrap = function(e) {
            return {
                __await: e
            }
        }, k(_.prototype), d(_.prototype, l, (function() {
            return this
        })), r.AsyncIterator = _, r.async = function(e, t, n, a, o) {
            void 0 === o && (o = Promise);
            var i = new _(p(e, t, n, a), o);
            return r.isGeneratorFunction(t) ? i : i.next().then((function(e) {
                return e.done ? e.value : i.next()
            }))
        }, k(N), d(N, u, "Generator"), d(N, s, (function() {
            return this
        })), d(N, "toString", (function() {
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
        }, r.values = O, M.prototype = {
            constructor: M,
            reset: function(e) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = n, this.done = !1, this.delegate = null, this.method = "next", this.arg = n, this.tryEntries.forEach(A), !e)
                    for (var t in this) "t" === t.charAt(0) && o.call(this, t) && !isNaN(+t.slice(1)) && (this[t] = n)
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

                function r(r, a) {
                    return c.type = "throw", c.arg = e, t.next = r, a && (t.method = "next", t.arg = n), !!a
                }
                for (var a = this.tryEntries.length - 1; a >= 0; --a) {
                    var i = this.tryEntries[a],
                        c = i.completion;
                    if ("root" === i.tryLoc) return r("end");
                    if (i.tryLoc <= this.prev) {
                        var s = o.call(i, "catchLoc"),
                            l = o.call(i, "finallyLoc");
                        if (s && l) {
                            if (this.prev < i.catchLoc) return r(i.catchLoc, !0);
                            if (this.prev < i.finallyLoc) return r(i.finallyLoc)
                        } else if (s) {
                            if (this.prev < i.catchLoc) return r(i.catchLoc, !0)
                        } else {
                            if (!l) throw Error("try statement without catch or finally");
                            if (this.prev < i.finallyLoc) return r(i.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var r = this.tryEntries[n];
                    if (r.tryLoc <= this.prev && o.call(r, "finallyLoc") && this.prev < r.finallyLoc) {
                        var a = r;
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
                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), A(n), y
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.tryLoc === e) {
                        var r = n.completion;
                        if ("throw" === r.type) {
                            var a = r.arg;
                            A(n)
                        }
                        return a
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(e, t, r) {
                return this.delegate = {
                    iterator: O(e),
                    resultName: t,
                    nextLoc: r
                }, "next" === this.method && (this.arg = n), y
            }
        }, r
    }

    function n(e, t, n, r, a, o, i) {
        try {
            var c = e[o](i),
                s = c.value
        } catch (e) {
            return void n(e)
        }
        c.done ? t(s) : Promise.resolve(s).then(r, a)
    }

    function r(e) {
        return function() {
            var t = this,
                r = arguments;
            return new Promise((function(a, o) {
                var i = e.apply(t, r);

                function c(e) {
                    n(i, a, o, c, s, "next", e)
                }

                function s(e) {
                    n(i, a, o, c, s, "throw", e)
                }
                c(void 0)
            }))
        }
    }
    var a = {};

    function o(e) {
        return function() {
            for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++) n[r] = arguments[r];
            return new Promise((function(t, r) {
                e.apply(void 0, n.concat([function(e) {
                    chrome.runtime.lastError ? r(new Error(chrome.runtime.lastError.message || JSON.stringify(chrome.runtime.lastError))) : t(e)
                }]))
            }))
        }
    }
    a.tabsQuery = o(chrome.tabs.query.bind(chrome.tabs)), a.tabsCreate = o(chrome.tabs.create.bind(chrome.tabs)), a.tabsUpdate = o(chrome.tabs.update.bind(chrome.tabs)), a.windowsUpdate = o(chrome.windows.update.bind(chrome.windows)), a.executeScript = o(chrome.scripting.executeScript.bind(chrome.scripting)), a.sendMessageToTab = o(chrome.tabs.sendMessage.bind(chrome.tabs)), a.sendMessage = o(chrome.runtime.sendMessage.bind(chrome.runtime)), a.contextMenusCreate = o(chrome.contextMenus.create.bind(chrome.contextMenus)), a.contextMenusRemoveAll = o(chrome.contextMenus.removeAll.bind(chrome.contextMenus)), a.contextMenusUpdate = o(chrome.contextMenus.update.bind(chrome.contextMenus)), a.setActionIcon = o(chrome.action.setIcon.bind(chrome.action)), a.storageLocalGet = o(chrome.storage.local.get.bind(chrome.storage.local)), a.storageLocalSet = o(chrome.storage.local.set.bind(chrome.storage.local)), a.storageLocalRemove = o(chrome.storage.local.remove.bind(chrome.storage.local)), a.getPlatformInfo = o(chrome.runtime.getPlatformInfo.bind(chrome.runtime)), a.commandsGetAll = o(chrome.commands.getAll.bind(chrome.commands)), a.getContexts = o(chrome.runtime.getContexts.bind(chrome.runtime)), a.onPageChangedRemoveRules = chrome.declarativeContent ? o(chrome.declarativeContent.onPageChanged.removeRules.bind(chrome.declarativeContent.onPageChanged)) : r(t().mark((function e() {
        return t().wrap((function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                case "end":
                    return e.stop()
            }
        }), e)
    }))), a.onPageChangedAddRules = chrome.declarativeContent ? o(chrome.declarativeContent.onPageChanged.addRules.bind(chrome.declarativeContent.onPageChanged)) : r(t().mark((function e() {
        return t().wrap((function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                case "end":
                    return e.stop()
            }
        }), e)
    }))), a.actionDisable = o(chrome.action.disable.bind(chrome.action)), a.captureTab = o(chrome.tabs.captureVisibleTab.bind(chrome.tabs)), a.windowsCreate = o(chrome.windows.create.bind(chrome.windows)), a.windowsGetCurrent = o(chrome.windows.getCurrent.bind(chrome.windows)), a.updateSessionRules = chrome.declarativeNetRequest ? o(chrome.declarativeNetRequest.updateSessionRules.bind(chrome.declarativeNetRequest)) : r(t().mark((function e() {
        return t().wrap((function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                case "end":
                    return e.stop()
            }
        }), e)
    }))), a.sendOptionalMessage = function() {
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
    }(), a.sendOptionalMessageToTab = function() {
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
    const i = a,
        c = JSON.parse('[{"family":"Bo doi Geist","file":"geist-latin-ext.woff2","weight":"300 700","unicodeRange":"U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"},{"family":"Bo doi Geist","file":"geist-latin.woff2","weight":"300 700","unicodeRange":"U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},{"family":"Bo doi Geist Mono","file":"geistmono-latin-ext.woff2","weight":"300 700","unicodeRange":"U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"},{"family":"Bo doi Geist Mono","file":"geistmono-latin.woff2","weight":"300 700","unicodeRange":"U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"}]');

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
                    a = function() {};
                return {
                    s: a,
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
                    f: a
                }
            }
            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }
        var o, i = !0,
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
                c = !0, o = e
            },
            f: function() {
                try {
                    i || null == n.return || n.return()
                } finally {
                    if (c) throw o
                }
            }
        }
    }

    function l(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
        return r
    }
    var u = !1;

    function d() {
        if (!u) {
            var e, t = s(c);
            try {
                for (t.s(); !(e = t.n()).done;) {
                    var n = e.value,
                        r = n.family,
                        a = n.file,
                        o = n.weight,
                        i = n.unicodeRange;
                    document.fonts.add(new FontFace(r, 'url("'.concat(chrome.runtime.getURL("fonts/".concat(a)), '")'), {
                        weight: o,
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
            u = !0
        }
    }
    var p = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H72A16,16,0,0,0,56,56V72H40A16,16,0,0,0,24,88V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V184h16a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM184,88v16H40V88Zm0,112H40V120H184v80Zm32-32H200V88a16,16,0,0,0-16-16H72V56H216Z"></path></svg>',
        m = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z"></path></svg>',
        f = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,72a12,12,0,1,1,12-12A12,12,0,0,1,128,176Z"></path></svg>';
    const h = /^(?:calc|clamp|min|max)\s*\(.*\)/,
        v = /^-?[0-9.]+(px|rem|em|%|vw|vh|vmin|vmax|deg|s|ms)$/,
        g = ["top", "right", "bottom", "left", "center"];

    function y(e) {
        return e.startsWith("calc(")
    }

    function b(e) {
        return e.split("-")[0]
    }

    function w(e) {
        const t = e.split("-");
        return t[t.length - 1]
    }

    function x(e) {
        return e.startsWith("rgb")
    }

    function E(e) {
        return e.startsWith("linear-gradient") || e.startsWith("radial-gradient") || e.startsWith("conic-gradient")
    }

    function C(e) {
        return /^\d+\/\d+$/.test(e) || function(e) {
            return e.startsWith("url(")
        }(e) || function(e) {
            return t = e, /^#[0-9A-F]{2,}$/i.test(t) || x(e) || function(e) {
                return e.startsWith("hsl")
            }(e);
            var t
        }(e) || h.test(e) || v.test(e) || E(e) || S(e) || y(e) || function(e) {
            return e.startsWith("cubic-bezier")
        }(e) || function(e) {
            return /^attr\(/i.test(e)
        }(e) || function(e) {
            return /^repeating-linear-gradient\(/i.test(e)
        }(e) || function(e) {
            return /^repeating-radial-gradient\(/i.test(e)
        }(e) || function(e) {
            return /^constant\(/.test(e)
        }(e) || function(e) {
            return /^env\(/.test(e)
        }(e) || function(e) {
            return e.endsWith("turn")
        }(e)
    }

    function L(e, t, n = "", r = !1) {
        return e = String(e), r || C(e) ? `-[${n}${function(e,t="around"){return"pre"===t?e.replace(/(^\s*)/g,""):"post"===t?e.replace(/(\s*$)/g,""):"all"===t?e.replace(/\s+/g,""):"around"===t?e.replace(/(^\s*)|(\s*$)/g,""):e}(t?t(e):e,"all").replace(/['"]/g,"")}]` : n ? `-[${n}${t?t(e):e}]` : `-${t?t(e):e}`
    }

    function N(e) {
        if (e.endsWith("%") || e.endsWith("deg") || "0" === e) return e;
        const t = Math.round(100 * Number(e));
        return Number.isNaN(t) ? t : `${t}%`
    }

    function k(e) {
        return e.replace(/\s+/g, " ").split(/\s/g).join("-")
    }

    function _(e) {
        return e.replace(/\s+/g, " ").split(/\s/g).join("_")
    }

    function T(e, t = !0) {
        return t && (e = e.replace(/\s+/g, " ").replace(/\s*,\s*/g, ",").replace(/\s*\/\s*/g, "/")), /calc\([^)]+\)/.test(e) && (e = e.replace(/calc\(([^)]+)\)/g, ((e, t) => e.replace(t, t.replace(/\s/g, ""))))), /rgb/.test(e) && (e = e.replace(/rgba?\(([^)]+)\)/g, ((e, t) => {
            const n = t.trim().split(" ");
            return e.replace(t, n.map(((e, t) => e.endsWith(",") ? e : e + (n.length - 1 === t ? "" : ","))).join(""))
        }))), /hsl/.test(e) && (e = e.replace(/hsla?\(([^)]+)\)/g, ((e, t) => {
            const n = t.trim().split(" ");
            return e.replace(t, n.map(((e, t) => e.endsWith(",") ? e : e + (n.length - 1 === t ? "" : ","))).join(""))
        }))), /var\([^)]+\)/.test(e) && (e = e.replace(/var\(([^)]+)\)/g, ((e, t) => e.replace(t, t.replace(/\s/g, "_"))))), e.endsWith("!important") ? [e.replace(/\s*!important/, "").trim(), "!"] : [e.trim(), ""]
    }

    function S(e) {
        return e.startsWith("var(--")
    }
    const $ = /-webkit-|-moz-|-ms-|-o-/g,
        A = /linear-gradient\(\s*to([\w\s]+),?([\-\w()#%\s.]+)?,([\-\w()#%\s.]+)?,?([\-\w#%\s.]+)?\)$/,
        M = /linear-gradient\(\s*([^,]*),?([\-\w()#%\s.]+)?,([\-\w()#%\s.]+)?,?([\-\w#%\s.]+)?\)$/,
        O = /(radial|conic)-gradient\(([\-\w()#%\s.]+)?,([\-\w()#%\s.]+)?,?([\-\w#%\s.]+)?\)$/,
        I = "__comma__",
        R = ["align-self", "align-items", "align-content"];
    const j = ["animation", "animation-name", "animation-duration", "animation-delay", "animation-timing-function", "animation-iteration-count", "animation-direction", "animation-fill-mode", "animation-play-state"];
    const B = ["aspect-ratio"];
    const P = ["box-shadow", "drop-shadow"],
        D = ["box-sizing", "box-decoration-break", "box-shadow", "drop-shadow"];

    function U(e, t) {
        if (!D.includes(e)) return;
        const [n, r] = T(t);
        return e.startsWith("box-decoration") ? `${r}box-decoration-${n}` : "box-sizing" === e ? `${r}box-${b(n)}` : P.includes(e) ? `${r}shadow-[${n.split(" ").join("_")}]` : void 0
    }
    const H = ["contrast", "brightness", "saturate"],
        F = ["grayscale", "invert", "sepia"],
        G = ["filter", "backdrop-filter"];

    function q(e, t) {
        if (!G.includes(e)) return;
        const [n, r] = T(t), [a, o, i] = n.match(/([\w-]+)\((.*)\)/);
        if (H.includes(o) || F.includes(o)) {
            const e = N(i);
            return Number.isNaN(e) ? `${r}${o}${L(i)}` : `${r}${o}${L(N(i))}`
        }
        return "drop-shadow" === o ? `${r}drop-${U(o,i)}` : "hue-rotate" === o ? `${r}${o}${L(i.slice(0,-3))}` : `${r}${o}${L(i)}`
    }
    const W = ["backdrop-filter"];
    const V = ["background-color", "background-attachment", "background-position", "background-size", "background-image", "background", "background-blend-mode", "background-origin", "background-clip", "background-repeat"],
        z = "\\d*\\.?\\d+(?:px|em|rem|%|vw|vh)?",
        Y = `(${z})\\s+(${z})`,
        K = new RegExp(`${Y}\\s*,\\s*${Y}`);

    function X(e, t, n) {
        let r = "";
        if (t && !n && (n = t, t = ""), e) {
            e = e.replaceAll(I, ",");
            const [t, n] = e.split(" ");
            n ? r += ` from${L(t)} from${L(n)}` : t && (r += ` from${L(t)}`)
        }
        if (t) {
            t = t.replaceAll(I, ",");
            const [e, n] = t.split(" ");
            n ? r += ` via${L(e)} via${L(n)}` : e && (r += ` via${L(e)}`)
        }
        if (n) {
            n = n.replaceAll(I, ",");
            const [e, t] = n.split(" ");
            t ? r += ` to${L(e)} to${L(t)}` : e && (r += ` to${L(e)}`)
        }
        return r
    }
    const Z = "__transform_to_unocss__";

    function Q(e) {
        const t = {};
        let n = 0;
        return e = (e = e.replace(/(rgba?|hsla?|lab|lch|hwb|color)\(\)*\)/, (e => (t[n++] = e, `${Z}${n}}`)))).split(/\)\s*,/).map((e => `${e.replace(/\s*,\s*/g,",").replace(/\s+/g,"_")}`)).join("),"), Object.keys(t).forEach((n => {
            e = e.replace(`${Z}${n}}`, t[n])
        })), e
    }
    const J = ["border-left", "border-top", "border-right", "border-bottom"],
        ee = {
            inline: "x",
            block: "y",
            "inline-start": "s",
            "inline-end": "e",
            top: "t",
            right: "r",
            bottom: "b",
            left: "l"
        },
        te = {
            top: "t",
            right: "r",
            bottom: "b",
            left: "l",
            end: "e",
            start: "s"
        };
    const ne = ["color"];
    const re = ["column-gap"];
    const ae = ["content", "content-visibility"];
    const oe = ["cursor"];
    const ie = ["display", "visibility", "position"];

    function ce(e, t) {
        if (!ie.includes(e)) return;
        const [n, r] = T(t);
        return "none" === n ? `${r}hidden` : "hidden" === n ? `${r}invisible` : `${r}${n}`
    }
    const se = {
            show: "visible",
            hide: "hidden"
        },
        le = ["empty-cells"];
    const ue = ["flex-basis", "flex-shrink"],
        de = ["flex", "flex-grow", "flex-shrink", "flex-basis", "flex-wrap", "flex-direction"];
    const pe = ["float", "clear", "pointer-events", "fill", "order", "perspective", "columns", "break-inside", "break-before"];

    function me(e, t) {
        if (!pe.includes(e)) return;
        const [n, r] = T(t);
        return g.includes(n), `${r}${e}${L(n)}`
    }
    const fe = ["grid", "grid-row", "grid-column", "grid-template-columns", "grid-template-rows", "grid-auto-flow", "grid-auto-columns", "grid-auto-rows", "grid-column-start", "grid-column-end", "grid-row-start", "grid-row-end"];
    const he = ["isolation"];
    const ve = ["justify", "justify-content", "justify-items", "justify-self"];
    const ge = ["letter-spacing"];
    const ye = {
            1: "none",
            1.25: "tight",
            1.375: "snug",
            1.5: "normal",
            1.625: "relaxed",
            2: "loose"
        },
        be = ["line-height"];
    const we = ["list-style", "list-style-type", "list-style-position", "list-style-image", "caption-side", "appearance", "touch-action", "table-layout", "caret-color", "backface-visibility", "stroke-width", "stroke", "accent", "accent-color"];

    function xe(e, t) {
        if (!we.includes(e)) return;
        const [n, r] = T(t);
        return "list-style-image" === e && "none" === n ? `${r}${b(e)}-none` : `${r}${b(e)}${L(n)}`
    }
    const Ee = {
        "margin-left": "ml",
        "margin-right": "mr",
        "margin-top": "mt",
        "margin-bottom": "mb",
        "margin-inline-start": "ms",
        "margin-inline-end": "me",
        "padding-left": "pl",
        "padding-right": "pr",
        "padding-top": "pt",
        "padding-bottom": "pb",
        "padding-inline-start": "ps",
        "padding-inline-end": "pe"
    };

    function Ce(e, t) {
        const [n, r] = T(t), a = Ee[e];
        if (a) return `${r}${a}${L(n)}`;
        const o = n.split(" "),
            i = o.length;
        return 1 === i ? `${r}${e[0]}${L(o[0])}` : 2 === i ? `${r}${e[0]}x${L(o[1])} ${r}${e[0]}y${L(o[0])}` : 3 === i ? `${r}${e[0]}x${L(o[1])} ${r}${e[0]}t${L(o[0])} ${r}${e[0]}b${L(o[2])}` : `${r}${e[0]}t${L(o[0])} ${r}${e[0]}b${L(o[2])} ${r}${e[0]}l${L(o[3])} ${r}${e[0]}r${L(o[1])}`
    }
    const Le = ["mask-position", "mask-origin", "mask-repeat", "mask-size", "mask-type", "mask-image", "mask-mode", "mask-composite", "mask-clip", "mask-type"];

    function Ne(e, t, n, r) {
        let a = "";
        if (n && !r && (r = n, n = ""), t) {
            t = t.replaceAll(I, ",");
            const [n, r] = t.split(" ");
            r ? a += ` ${e}-from-${x(n)||S(n)?`[${n}]`:n} ${e}-from${L(r)}` : n && (a += ` ${e}-from-${x(n)||S(n)?`[${n}]`:n}`)
        }
        if (n) {
            n = n.replaceAll(I, ",");
            const [t, r] = n.split(" ");
            r ? a += ` ${e}-via${x(t)||S(t)?`[${t}]`:t} ${e}-via${L(r)}` : t && (a += ` ${e}-via${x(t)||S(t)?`[${t}]`:t}`)
        }
        if (r) {
            r = r.replaceAll(I, ",");
            const [t, n] = r.split(" ");
            n ? a += ` ${e}-to-${x(t)||S(t)?`[${t}]`:t} ${e}-to${L(n)}` : t && (a += ` ${e}-to-${x(t)||S(t)?`[${t}]`:t}`)
        }
        return a
    }
    const ke = ["max-height", "max-width", "max-block-size", "max-inline-size", "min-height", "min-width", "min-block-size", "min-inline-size"];

    function _e(e, t) {
        if (!ke.includes(e)) return;
        const [n, r] = T(t), a = e.split("-"), o = y(n) || S(n) ? L(n) : L(b(n));
        return `${r}${a[0]}-${a[1][0]}${o}`
    }
    const Te = ["object-fit", "object-position"];
    const Se = ["opacity"];
    const $e = ["outline-width", "outline-style", "outline-offset", "outline", "outline-color"];
    const Ae = ["overflow", "overflow-x", "overflow-y", "overflow-wrap"];
    const Me = ["overscroll-behavior", "overscroll-behavior-x", "overscroll-behavior-y"];
    const Oe = ["place-content", "place-items", "place-self"];
    const Ie = {
        vertical: "y",
        horizontal: "x"
    };
    const Re = ["row-gap"];
    const je = ["scroll-snap-type", "scroll-snap-stop", "scroll-snap-align", "scroll-padding", "scroll-padding-inline", "scroll-padding-block", "scroll-padding-inline-start", "scroll-padding-inline-end", "scroll-padding-block-start", "scroll-padding-block-end", "scroll-padding-top", "scroll-padding-right", "scroll-padding-bottom", "scroll-padding-left", "scroll-margin", "scroll-margin-inline", "scroll-margin-block", "scroll-margin-inline-start", "scroll-margin-inline-end", "scroll-margin-block-start", "scroll-margin-block-end", "scroll-margin-top", "scroll-margin-right", "scroll-margin-bottom", "scroll-margin-left", "scroll-behavior"];
    const Be = ["width", "height"];

    function Pe(e, t) {
        if (!Be.includes(e)) return;
        const [n, r] = T(t);
        return `${r}${e[0]}${L(n,C(n)?void 0:b)}`
    }
    const De = ["text-align", "text-align-last", "text-decoration", "text-decoration-line", "text-decoration-style", "text-decoration-color", "text-decoration-thickness", "text-indent", "text-underline-offset", "text-transform", "text-wrap", "text-overflow", "text-justify", "text-shadow"];
    const Ue = ["top", "right", "bottom", "left", "field-sizing", "forced-color-adjust", "hyphens", "gap", "gap-x", "gap-y"];

    function He(e, t) {
        if (!Ue.includes(e)) return;
        const [n, r] = T(t);
        return `${r}${e}${L(n)}`
    }
    const Fe = ["transform", "transform-origin", "transform-style"];
    const Ge = ["transition-delay", "transition-duration"],
        qe = ["transition", "transition-property", "transition-duration", "transition-delay", "transition-timing-function", "transition-behavior"];
    const We = ["user-select"];
    const Ve = ["vertical-align"];
    const ze = ["white-space"];
    const Ye = ["will-change"],
        Ke = {
            auto: "auto",
            "scroll-position": "scroll",
            contents: "contents",
            transform: "transform"
        };
    const Xe = ["word-break", "word-spacing", "word-wrap", "overflow-wrap"];
    const Ze = ["writing-mode"];
    const Qe = ["z-index"],
        Je = ["0", "10", "20", "30", "40", "50", "auto"];
    const et = {
            animation: function(e, t) {
                if (!j.includes(e)) return;
                const [n, r] = T(t);
                return `${r}animate-[${_(n)}]`
            },
            aspect: function(e, t) {
                if (!B.includes(e)) return;
                const [n, r] = T(t);
                return "auto" === n ? `${r}${b(e)}-${n}` : `${r}${b(e)}${L(n)}`
            },
            backface: xe,
            caption: xe,
            column: function(e, t) {
                if (!re.includes(e)) return;
                const [n, r] = T(t);
                return "column-gap" === e ? `${r}gap-x${L(n)}` : `${r}${e}${L(n)}`
            },
            columns: me,
            break: me,
            empty: function(e, t) {
                if (!le.includes(e)) return;
                const [n, r] = T(t);
                return se[n] ? `${r}table-empty-cells-${se[n]??n}` : void 0
            },
            box: U,
            writing: function(e, t) {
                if (!Ze.includes(e)) return;
                const [n, r] = T(t);
                return "horizontal-tb" === n ? `${r}write-normal` : `${r}write-${n.replace("-rl","-right").replace("-lr","-left")}`
            },
            display: ce,
            float: me,
            clear: me,
            isolation: function(e, t) {
                if (!he.includes(e)) return;
                const [n, r] = T(t);
                return "isolate" === t ? `${r}${n}` : `${r}${e}-${n}`
            },
            object: function(e, t) {
                if (!Te.includes(e)) return;
                const [n, r] = T(t);
                return "object-position" === e ? `${r}${b(e)}-${k(n)}` : `${r}${b(e)}-${n}`
            },
            overflow: function(e, t) {
                if (!Ae.includes(e)) return;
                const [n, r] = T(t);
                return "overflow-wrap" === e ? `${r}wrap-${n}` : `${r}${e}-${n}`
            },
            overscroll: function(e, t) {
                if (!Me.includes(e)) return;
                const [n, r] = T(t), [a, o, i] = e.split("-");
                return i ? `${r}${a}-${i}-${n}` : `${r}${a}-${n}`
            },
            position: ce,
            top: He,
            hyphens: He,
            mask: function(e, t) {
                if (!Le.includes(e)) return;
                const [n, r] = T(t);
                if (["mask-clip", "mask-origin", "mask-type"].includes(e)) return `${r}${e}-${b(n)}`;
                if (["mask-mode", "mask-composite"].includes(e)) return `${r}${b(e)}-${b(n)}`;
                if (["mask-position", "mask-size"].includes(e)) return C(n) ? `${r}${e}${L(n)}` : /\d/.test(n) ? `${r}[${e}:${_(n)}]` : `${r}${b(e)}-${k(n)}`;
                if ("mask-repeat" === e) return n.includes("-") ? `${r}mask-${n}` : `${r}${e}-${n}`;
                if ("mask-image" === e) {
                    if (E(n)) {
                        const e = n.replace(/rgba?\(([^)]+)\)/g, ((e, t) => e.replace(t, t.replace(/\s*,\s*/g, I)))).match(A);
                        if (!e) return;
                        let [t, r, a, o] = e.slice(1);
                        t = t.split(" ").map((e => e[0])).join("");
                        const i = n.startsWith("linear-gradient") ? "linear" : n.startsWith("radial-gradient") ? "radial" : n.startsWith("conic-gradient") ? "conic" : "";
                        return t ? `${Ne(`mask-${t}`,r,a,o).trim()}` : Ne(`mask-${i}`, r, a, o).trim()
                    }
                    return `${r}mask${L(n)}`
                }
                return `${r}${e}${L(n)}`
            },
            field: He,
            forced: He,
            left: He,
            right: He,
            bottom: He,
            visibility: ce,
            z: function(e, t) {
                if (!Qe.includes(e)) return;
                const [n, r] = T(t);
                return Je.includes(n) ? `${r}${e[0]}-${n}` : `${r}${e[0]}${L(n,void 0,void 0,!0)}`
            },
            flex: function(e, t) {
                if (!de.includes(e)) return;
                const [n, r] = T(t);
                if ("flex-shrink" === e && "1" === n) return `${r}shrink`;
                if ("flex-grow" === e) return "1" === n ? `${r}flex-grow` : `${r}flex-grow-${n}`;
                if (ue.includes(e)) return `${r}${w(e)}${L(n)}`;
                if ("1" === n) return `${r}flex-1`;
                const a = n[0];
                return "flex" !== e || "0" !== a && "1" !== a ? `${r}${b(e)}-${n.replace("column","col")}` : `${r}flex-[${_(n)}]`
            },
            order: me,
            grid: function(e, t) {
                if (!fe.includes(e)) return;
                const [n, r] = T(t);
                if (e.startsWith("grid-template")) {
                    const t = n.match(/repeat\s*\(\s*(\d+)/);
                    return t ? `${r}grid-${"rows"===w(e)?"rows":"cols"}-${t[1]}` : `${r}grid-${"rows"===w(e)?"rows":"cols"}-${n.includes(" ")?`[${_(n)}]`:n}`
                }
                if ("grid-auto-flow" === e) return `${r}grid-flow-${k(n).replace("column","col")}`;
                if (e.startsWith("grid-auto")) {
                    const t = n.match(/minmax\s*\(\s*0\s*,\s*1fr/);
                    return `${r}auto-${"rows"===w(e)?"rows":"cols"}-${t?"fr":b(n)}`
                }
                const a = n.match(/span\s+(\d)/);
                return a ? `${r}${e.slice(5).replace("column","col")}-span-${a[1]}` : "1/-1" === n ? `${r}${e.slice(5).replace("column","col")}-span-full` : `${r}${e.slice(5).replace("column","col")}-${n}`
            },
            gap: He,
            justify: function(e, t) {
                if (!ve.includes(e)) return;
                const [n, r] = T(t);
                return n.includes(" ") ? `${e}-${n.split(" ").reverse().map(w).join("-")}${r}` : "justify-content" === e ? `${r}justify-${w(n)}` : `${r}${e}-${w(n)}`
            },
            align: function(e, t) {
                if (!R.includes(e)) return;
                const [n, r] = T(t);
                return `${r}${w(e)}-${n.split(" ").reverse().map(w).join("-")}`
            },
            place: function(e, t) {
                if (!Oe.includes(e)) return;
                const [n, r] = T(t);
                return n.includes(" ") ? `${e}-${n.split(" ").reverse().map(w).join("-")}${r}` : `${r}${e}-${w(n)}`
            },
            padding: Ce,
            perspective: me,
            margin: Ce,
            width: Pe,
            min: _e,
            max: _e,
            height: Pe,
            font: function(e, t) {
                const [n, r] = T(t);
                if ("font-size" === e) return ["inherit", "initial", "revert", "unset", "revert-layer"].includes(n) ? `${r}font-size-${n}` : `${r}text${L(n)}`;
                if ("font-weight" === e) return `${r}font-[weight:${n}]`;
                if ("font-family" === e) {
                    const e = n.match(/ui-(\w{0,4})/);
                    if (!e) return `${r}font-[family-name:${_(t)}]`;
                    const [a, o] = e;
                    return `${r}font-${o}`
                }
                return "font-style" === e ? "normal" === n ? `${r}not-italic` : "italic" === n ? `${r}italic` : void 0 : "font-variant-numeric" === e ? "normal" === n ? `${r}normal-nums` : `${r}${n}` : function(e, t) {
                    return e.split(" ").map((e => /^\d/.test(e) ? `${t}text-[${e}]` : `${t}font-${e}`)).join(" ")
                }(n, r)
            },
            letter: function(e, t) {
                if (!ge.includes(e)) return;
                const [n, r] = T(t);
                return `${r}tracking${L(n)}`
            },
            line: function(e, t) {
                if (!be.includes(e)) return;
                const [n, r] = T(t);
                return ye[n] ? `${r}leading-${ye[n]}` : `${r}leading${L(n,(e=>/\d$/.test(e)?`[${e}]`:e))}`
            },
            list: xe,
            text: function(e, t) {
                if (!De.includes(e)) return;
                const [n, r] = T(t);
                return g.includes(n) ? `${r}text-${n}` : "text-decoration-line" === e ? "none" === n ? `${r}no-underline` : `${r}${n}` : "text-transform" === e ? "none" === n ? `${r}normal-case` : `${r}${n}` : "text-decoration" === e ? n.split(" ").map((e => e ? `${r}${e}` : "")).join(" ") : e.startsWith("text-decoration") || "text-indent" === e ? `${r}${e.split("-")[1]}${L(n)}` : "text-underline-offset" === e ? `${r}underline-offset-${n}` : ["inherit", "initial", "revert", "unset", "revert-layer"].includes(n) ? `${r}text-align-${n}` : `${r}text${L(n)}`
            },
            vertical: function(e, t) {
                if (!Ve.includes(e)) return;
                const [n, r] = T(t);
                return `${r}align${L(n)}`
            },
            white: function(e, t) {
                if (!ze.includes(e)) return;
                const [n, r] = T(t);
                return `${r}whitespace-${n}`
            },
            word: function(e, t) {
                if (!Xe.includes(e)) return;
                const [n, r] = T(t);
                return e.startsWith("word-spacing") ? `${r}word-spacing${L(t)}` : "keep-all" === n ? `${r}break-keep` : "break-word" === n ? `${r}break-words` : `${r}break-${w(n)}`
            },
            content: function(e, t) {
                if (!ae.includes(e)) return;
                const [n, r] = T(t, !1);
                if ("content-visibility" === e) return `content-visibility-${n}${r}`;
                const a = n.match(/^(["'])(.*?)\1$/);
                return a ? `content-['${a[2].replace(/\s/g,"_")}']${r}` : `content-[${n}]${r}`
            },
            background: function e(t, n) {
                if (!V.includes(t)) return;
                let [r, a] = T(n);
                if ("background-size" === t) return /\d/.test(r) ? `${a}bg${L(r,_,"length:",!0)}` : `${a}bg${L(r,k,"length:")}`;
                if ("background-position" === t) return /\d/.test(r), `${a}bg${L(r,_,"position:")}`;
                if (["background-color", "background-attachment"].includes(t)) return `${a}bg${L(r,_)}`;
                if (["background", "background-image"].includes(t)) {
                    if (o = r, h.test(o) || v.test(o) || g.includes(o)) return `${a}bg${L(r,k,"position:")}`;
                    const n = r.replace(/rgba?\([^)]+\)/g, "temp");
                    if (/\)\s*,/.test(n)) return `bg-[${Q(r)}]`;
                    if (r.startsWith("linear-gradient")) {
                        const e = r.replace(/rgba?\(([^)]+)\)/g, ((e, t) => e.replace(t, t.replace(/\s*,\s*/g, I)))),
                            t = e.match(A);
                        if (t) {
                            let [e, n, r, a] = t.slice(1);
                            return e = e.split(" ").map((e => e[0])).join(""), e ? `bg-gradient-to-${e}${X(n,r,a)}` : X(n, r, a)
                        }
                        const n = e.match(M);
                        return n ? `bg-gradient-linear bg-gradient-[${n[1]}${n[2]?`,${n[2].replace(/\s+/,"_").replaceAll(I,",")}`:""},${n[3].replace(/\s+/,"_").replaceAll(I,",")}]` : `bg-[${Q(r)}]`
                    }
                    if (/^(?:radial|conic)-gradient/.test(r)) {
                        const e = r.replace(/rgba?\(([^)]+)\)/g, ((e, t) => e.replace(t, t.replace(/\s*,\s*/g, I)))).match(O);
                        if (!e) return "";
                        const t = e[1];
                        let [n, a, o] = e.slice(2);
                        return `bg-gradient-${t}${X(n,a,o)}`
                    }
                    const i = r.match(/^rgba?\([^)]+\)$/);
                    if (i) {
                        const e = i[0];
                        r = r.replace(e, `[${e}]`)
                    }
                    const c = r.match(/^url\(["'\s.\-\w/@]*\)$/);
                    if (c) return `bg-${r.replace(c[0],`[${c[0].replace(/['"]/g,"")}]${a}`)}`;
                    const s = new Map;
                    let l = 0;
                    const u = r.replace(/url\([^)]+\)/g, (e => {
                        const t = "__URL__" + l++;
                        return s.set(t, e), t
                    })).replace(/rgba?\([^)]+\)/g, (e => {
                        const t = "__RGBA__" + l++;
                        return s.set(t, e), t
                    }));
                    if (u.includes("/")) {
                        const [n, r] = u.split("/").map((e => e.trim())), o = r.split(/\s+/), i = o.slice(0, 2), c = o.slice(2).map((e => {
                            const t = e.match(/__URL__(\d+)/);
                            if (t) return s.get(`__URL__${t[1]}`);
                            const n = e.match(/__RGBA__(\d+)/);
                            return n ? s.get(`__RGBA__${n[1]}`) : e
                        })), l = i.join(" "), d = e("background-position", `${n}${a?" !important":""}`), p = l ? e("background-size", `${l}${a?" !important":""}`) : "";
                        let m = "";
                        return c.length && (m = c.map((n => e(t, `${n}${a?" !important":""}`))).join(" ")), [d, p, m].filter(Boolean).join(" ")
                    }
                    if (u.includes(" ")) {
                        const n = u.match(K);
                        if (n) {
                            const r = u.replace(n[0], "").trim().split(" ").map((e => {
                                const t = e.match(/__URL__(\d+)/);
                                if (t) return s.get(`__URL__${t[1]}`);
                                const n = e.match(/__RGBA__(\d+)/);
                                return n ? s.get(`__RGBA__${n[1]}`) : e
                            }));
                            let o = "";
                            r.length && (o = r.map((n => e(t, `${n}${a?" !important":""}`))).join(" "));
                            return [e("background-position", `${n[0]}${a?" !important":""}`), o].filter(Boolean).join(" ")
                        }
                        let r = u.split(/\s+/).map((e => {
                            const t = e.match(/__URL__(\d+)/);
                            if (t) return s.get(`__URL__${t[1]}`);
                            const n = e.match(/__RGBA__(\d+)/);
                            return n ? s.get(`__RGBA__${n[1]}`) : e
                        })).map((n => e(t, `${n}${a?" !important":""}`))).join(" ");
                        const o = /bg-\[position:([^\]]*)\]/g,
                            i = r.match(o);
                        if (i && i.length > 1) {
                            const e = `bg-[position:${i.map((e=>e.replace(o,"$1"))).join("_")}]`;
                            r = `${r.replace(o,"").replace(/\s+/g," ").split(" ").filter(Boolean).concat([e]).join(" ")}`
                        }
                        return r
                    }
                    return `${a}bg${L(r,k)}`
                }
                return "background-blend-mode" === t ? `${a}bg-blend-${r}` : `${a}${function(e,t){return t.endsWith("repeat")?"bg":e.replace("background","bg")}(t,r)}-${function(e){return/border|content|padding-box/.test(e)?e.replace("-box",""):e.startsWith("repeat-")?e.replace("repeat-",""):k(e)}(r)}`;
                var o
            },
            border: function(e, t) {
                const [n, r] = T(t);
                if ("border-spacing" === e) return `${r}${e}${L(n,_,"",!0)}`;
                if ("border-color" === e) return `${r}border${L(n)}`;
                const a = e.match(/border(-start|-end|-top|-bottom)?(-start|-end|-left|-right)?-radius/);
                if (a) {
                    const [e, t, o] = a;
                    return t && o ? `${r}rounded-${te[t.slice(1)]}${te[o.slice(1)]}${L(n,_)}` : t || o ? `${r}rounded-${te[(null==t?void 0:t.slice(1))||(null==o?void 0:o.slice(1))]}${L(n,_)}` : `${r}rounded${L(n,_,"",!0)}`
                }
                const o = e.match(/border(-inline|-block|-inline-start|-inline-end|-top|-right|-bottom|-left)?-(width|color)/);
                if (o) {
                    if (o[1]) {
                        const e = ee[o[1].slice(1)];
                        return `${r}border-${e}${L(n,_,"length:")}`
                    }
                    return `${r}border${L(n,_,"length:")}`
                }
                if (J.some((t => e.startsWith(t)))) {
                    const t = e.split("-");
                    return "radius" === t.slice(-1)[0] ? n.split(" ").map((e => `${r}rounded-${t.slice(1,-1).map((e=>e[0])).join("")}${L(e)}`)).join(" ") : n.split(" ").filter((e => "solid" !== e)).map((t => `${r}border-${e.split("-")[1][0]}${L(t)}`)).join(" ")
                }
                return e.startsWith("border-image") ? void 0 : /^\d[%|(px)rem]$/.test(n) || "border-collapse" === e ? `${r}border-${n}` : "border-width" === e || "border-style" === e ? `${r}border${L(n)}` : "border-color" === e ? "currentColor" === n ? `${r}border-current` : `${r}border${L(n)}` : n.split(" ").map((e => "currentColor" === n ? `${r}border-current` : `${r}border${L(e)}`)).join(" ")
            },
            outline: function(e, t) {
                if (!$e.includes(e)) return;
                const [n, r] = T(t);
                return "outline-offset" === e ? `${r}${e}-${n}` : `${r}${b(e)}-${n}`
            },
            opacity: function(e, t) {
                if (!Se.includes(e)) return;
                const [n, r] = T(t);
                return t.endsWith("%") ? `${r}op-${n.replace(/%/g,"")}` : `${r}op-${100*+n}`
            },
            mix: function(e, t) {
                const [n, r] = T(t);
                return `${r}mix-blend-${n}`
            },
            filter: q,
            backdrop: function(e, t) {
                if (!W.includes(e)) return;
                const [n, r] = T(t);
                return `${r}backdrop-${q(e,n)}`
            },
            table: xe,
            transition: function(e, t) {
                if (!qe.includes(e)) return;
                const [n, r] = T(t);
                if ("transition-timing-function" === e) return "linear" === n ? `${r}ease-${n}` : `${r}ease-[${n}]`;
                if ("transition" === e) return function(e, t) {
                    let n = !1;
                    return e.split(" ").map((e => /^\d/.test(e) || /^\.\d/.test(e) ? n ? `${t}delay${L(e,void 0)}` : (n = !0, `${t}duration${L(e,void 0)}`) : "background-color" === e ? `${t}transition-colors` : /^(?:linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end)$/.test(e) || e.startsWith("cubic-bezier") || e.startsWith("steps") ? `${t}ease-[${e}]` : `${t}transition${L(e)}`)).join(" ")
                }(n, r);
                if ("transition-property" === e) return n.includes("color") ? `${r}transition-color` : "box-shadow" === n ? `${r}transition-shadow` : `${r}transition-${n}`;
                if ("transition-behavior" === e) return `${r}transition-${w(n)}`;
                const a = L(n);
                if (a === `-${n}` && Ge.includes(e)) {
                    let t = n.trim();
                    return t.endsWith("ms") ? t = t.replace(/ms$/, "") : t.endsWith("s") && (t = (1e3 * Number.parseFloat(t.replace(/s$/, ""))).toString()), `${r}${e.split("-")[1]}-${t}`
                }
                return `${r}${e.split("-")[1]}${a}`
            },
            transform: function(e, t) {
                if (!Fe.includes(e)) return;
                const [n, r] = T(t);
                return "transform-origin" === e ? S(n) || y(n) ? `${r}origin${L(n)}` : `${r}origin-${/\d/.test(n)&&n.includes(" ")?`[${_(n)}]`:k(n)}` : "transform-style" === e ? `${r}transform-${n}` : "none" === t ? `${r}${e}-none` : (a = n, a.replace(/\(\s*/g, "(").replace(/\s*\)/g, ")").replace(/\s*,\s*/g, ",")).split(" ").map((e => {
                    const t = e.match(/([a-z]+)(3d)?([A-Z])?\((.*)\)/);
                    if (!t) return;
                    const [n, a, o, i, c] = t;
                    if (i) {
                        const e = c.replace(/,(?![^()]*\))/g, " ").split(" ");
                        return e.length > 1 ? `${r}${a}-[${i.toLowerCase()}-${e.map((e=>S(e)?e:L("scale"===a?N(e):e))).join("_")}]` : `${r}${a}-${i.toLowerCase()}${S(e[0])?`-[${e[0]}]`:L("scale"===a?N(e[0]):e[0])}`
                    } {
                        const e = c.replace(/,(?![^()]*\))/g, " ").split(" ");
                        if ("scale" === a) return e.length > 1 ? `${r}${a}-[${e.join("_")}]` : `${r}${a}${S(c)||y(c)?`-[${c}]`:L("scale"===a?N(c):c)}`;
                        const [t, n] = e;
                        return `${r}${a}-x${L(t)} ${r}${a}-y${L(n??t)}`
                    }
                })).filter(Boolean).join(" ");
                var a
            },
            accent: xe,
            appearance: xe,
            cursor: function(e, t) {
                if (!oe.includes(e)) return;
                const [n, r] = T(t);
                return `${r}${e}${L(n)}`
            },
            caret: xe,
            pointer: me,
            resize: function(e, t) {
                const [n, r] = T(t);
                return "both" === n ? `${r}${e}` : `${r}${e}-${Ie[n]||n}`
            },
            scroll: function(e, t) {
                if (!je.includes(e)) return;
                const [n, r] = T(t);
                if (e.startsWith("scroll-snap")) {
                    if (n.includes(" ")) {
                        const [e, t] = n.split(" ");
                        return `${r}snap-${e}${L(t)}`
                    }
                    return `${r}snap-${n}`
                }
                if ("scroll-behavior" === e) return `${r}scroll-${n}`;
                const [a, o, i, c] = e.match(/scroll-(margin|padding)-?(\w+)?-?(\w+)?/);
                return "inline" === i && c ? `${r}scroll-${o[0]}${c[0]}${L(n)}` : i ? `${r}scroll-${o[0]}${i[0]}${L(n)}` : `${r}scroll-${o[0]}${L(n)}`
            },
            touch: xe,
            user: function(e, t) {
                if (!We.includes(e)) return;
                const [n, r] = T(t);
                return `${r}${w(e)}-${n}`
            },
            will: function(e, t) {
                if (!Ye.includes(e)) return;
                const [n, r] = T(t);
                return n in Ke ? `will-change-${Ke[n]}${r}` : `${r}${e}-[${_(n)}]`
            },
            fill: me,
            stroke: xe,
            color: function(e, t) {
                if (!ne.includes(e)) return;
                const [n, r] = T(t);
                return `${r}text${L(n)}`
            },
            row: function(e, t) {
                if (!Re.includes(e)) return;
                const [n, r] = T(t);
                return `${r}gap-y${L(n)}`
            }
        },
        tt = /([\w-]+)\s*:\s*([^;]+)/;

    function nt(e, t) {
        var n;
        const r = (e = e.replace($, "")).match(tt);
        if (!r) return;
        const [a, o, i] = r, c = b(o), s = null === (n = et[c]) || void 0 === n ? void 0 : n.call(et, o, i);
        return s && t ? s.replace(/-\[([0-9.]+)px\]/g, ((e, t) => `-[${+t/16}rem]`)) : s
    }

    function rt(e) {
        return t => {
            const n = e.anyMatch || [],
                r = e.priority || [];
            let a = null;
            if (n.length > 0 && (a = n.find((e => t[e.key] && (e.pattern instanceof RegExp ? e.pattern.test(t[e.key]) : t[e.key] === e.pattern))), !a)) return {
                transformedResult: "",
                deleteKeys: []
            };
            let o = "";
            if (n.length > 0 && r.length > 0)
                for (const e of r) {
                    const r = n.find((t => t.key === e));
                    if (r && t[e] && (r.pattern instanceof RegExp ? r.pattern.test(t[e]) : t[e] === r.pattern)) {
                        o = t[e];
                        break
                    }
                }
            const i = {
                    ...e.allMatch
                },
                c = Object.keys(i);
            for (const e of c) {
                const n = i[e];
                if (!(n instanceof RegExp ? n.test(t[e]) : t[e] === n)) return {
                    transformedResult: "",
                    deleteKeys: []
                }
            }
            const s = [...c, ...n.map((e => e.key))];
            return {
                transformedResult: "function" == typeof e.outputTemplate ? e.outputTemplate(o) : e.outputTemplate.replace("${value}", o),
                deleteKeys: s
            }
        }
    }
    const at = {
        "line-clamp-${number}": rt({
            allMatch: {
                overflow: "hidden",
                display: "-webkit-box",
                "-webkit-box-orient": "vertical"
            },
            anyMatch: [{
                key: "-webkit-line-clamp",
                pattern: /\d/
            }, {
                key: "line-clamp",
                pattern: /\d/
            }],
            priority: ["line-clamp", "-webkit-line-clamp"],
            outputTemplate: e => `line-clamp-${e}`
        }),
        "line-clamp-${prop}": rt({
            allMatch: {
                overflow: "visible",
                display: "block",
                "-webkit-box-orient": "horizontal"
            },
            anyMatch: [{
                key: "-webkit-line-clamp",
                pattern: /inherit|initial|revert|unset/
            }, {
                key: "line-clamp",
                pattern: /inherit|initial|revert|unset/
            }],
            priority: ["line-clamp", "-webkit-line-clamp"],
            outputTemplate: e => `line-clamp-${e}`
        }),
        truncate: rt({
            allMatch: {
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap"
            },
            outputTemplate: () => "truncate"
        })
    };

    function ot(e, t, n) {
        const r = n ? console.log : () => {};
        r("🔍 [DEBUG] Input styles:", e), r("🔍 [DEBUG] isRem:", t);
        const a = [],
            o = new Set,
            {
                newStyle: i,
                transformedResult: c
            } = function(e) {
                const t = [],
                    n = e.split(";").filter(Boolean).reduce(((e, t) => {
                        const n = function(e) {
                            let t = 0;
                            for (let n = 0; n < e.length; n++) {
                                const r = e[n];
                                if ("[" === r) t++;
                                else if ("]" === r) t--;
                                else if (":" === r && 0 === t) return n
                            }
                            return -1
                        }(t);
                        if (-1 === n) return e;
                        const r = t.substring(0, n).trim(),
                            a = t.substring(n + 1).trim();
                        return r && a && (e[r] = a), e
                    }), {});
                for (const e in at) {
                    const {
                        transformedResult: r,
                        deleteKeys: a
                    } = at[e](n);
                    r && a.length && (t.push(r), a.forEach((e => {
                        delete n[e]
                    })))
                }
                return {
                    transformedResult: t.join(" "),
                    newStyle: Object.entries(n).map((([e, t]) => `${e}: ${t}`)).join("; ")
                }
            }(e);
        if (r("🔍 [DEBUG] After transformStyleToTailwindPre:", {
                newStyle: i,
                transformedResult: c
            }), c) {
            r("🔍 [DEBUG] Using transformedResult path");
            const e = [c, i.split(";").filter(Boolean).reduce(((e, n) => {
                const i = n.replaceAll($, "").trim();
                if (r("🔍 [DEBUG] Processing style:", n, "-> key:", i), o.has(i)) return r("🔍 [DEBUG] Skipping duplicate key:", i), e;
                o.add(i);
                const c = nt(i, t) || "";
                return r("🔍 [DEBUG] Converted to Tailwind:", i, "->", c), c || (r("🔍 [DEBUG] No conversion found, adding to noTransfer:", n), a.push(n)), e + `${c} `
            }), "").trim().replace(/\s+/g, " ")].filter(Boolean).join(" ");
            return r("🔍 [DEBUG] Final result (transformedResult path):", e), r("🔍 [DEBUG] noTransfer:", a), [e, a]
        }
        r("🔍 [DEBUG] Using fallback path");
        const s = e.split(";").filter(Boolean).reduce(((e, n) => {
            const i = n.replaceAll($, "").trim();
            if (r("🔍 [DEBUG] Processing style:", n, "-> key:", i), o.has(i)) return r("🔍 [DEBUG] Skipping duplicate key:", i), e;
            o.add(i);
            const c = nt(i, t) || "";
            return r("🔍 [DEBUG] Converted to Tailwind:", i, "->", c), c || (r("🔍 [DEBUG] No conversion found, adding to noTransfer:", n), a.push(n)), e + `${c} `
        }), "").trim().replace(/\s+/g, " ");
        return r("🔍 [DEBUG] Final result (fallback path):", s), r("🔍 [DEBUG] noTransfer:", a), [s, a]
    }

    function it(e) {
        return it = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, it(e)
    }

    function ct() {
        ct = function() {
            return t
        };
        var e, t = {},
            n = Object.prototype,
            r = n.hasOwnProperty,
            a = Object.defineProperty || function(e, t, n) {
                e[t] = n.value
            },
            o = "function" == typeof Symbol ? Symbol : {},
            i = o.iterator || "@@iterator",
            c = o.asyncIterator || "@@asyncIterator",
            s = o.toStringTag || "@@toStringTag";

        function l(e, t, n) {
            return Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            l({}, "")
        } catch (e) {
            l = function(e, t, n) {
                return e[t] = n
            }
        }

        function u(e, t, n, r) {
            var o = t && t.prototype instanceof g ? t : g,
                i = Object.create(o.prototype),
                c = new $(r || []);
            return a(i, "_invoke", {
                value: k(e, n, c)
            }), i
        }

        function d(e, t, n) {
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
        t.wrap = u;
        var p = "suspendedStart",
            m = "suspendedYield",
            f = "executing",
            h = "completed",
            v = {};

        function g() {}

        function y() {}

        function b() {}
        var w = {};
        l(w, i, (function() {
            return this
        }));
        var x = Object.getPrototypeOf,
            E = x && x(x(A([])));
        E && E !== n && r.call(E, i) && (w = E);
        var C = b.prototype = g.prototype = Object.create(w);

        function L(e) {
            ["next", "throw", "return"].forEach((function(t) {
                l(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function N(e, t) {
            function n(a, o, i, c) {
                var s = d(e[a], e, o);
                if ("throw" !== s.type) {
                    var l = s.arg,
                        u = l.value;
                    return u && "object" == it(u) && r.call(u, "__await") ? t.resolve(u.__await).then((function(e) {
                        n("next", e, i, c)
                    }), (function(e) {
                        n("throw", e, i, c)
                    })) : t.resolve(u).then((function(e) {
                        l.value = e, i(l)
                    }), (function(e) {
                        return n("throw", e, i, c)
                    }))
                }
                c(s.arg)
            }
            var o;
            a(this, "_invoke", {
                value: function(e, r) {
                    function a() {
                        return new t((function(t, a) {
                            n(e, r, t, a)
                        }))
                    }
                    return o = o ? o.then(a, a) : a()
                }
            })
        }

        function k(t, n, r) {
            var a = p;
            return function(o, i) {
                if (a === f) throw Error("Generator is already running");
                if (a === h) {
                    if ("throw" === o) throw i;
                    return {
                        value: e,
                        done: !0
                    }
                }
                for (r.method = o, r.arg = i;;) {
                    var c = r.delegate;
                    if (c) {
                        var s = _(c, r);
                        if (s) {
                            if (s === v) continue;
                            return s
                        }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                        if (a === p) throw a = h, r.arg;
                        r.dispatchException(r.arg)
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    a = f;
                    var l = d(t, n, r);
                    if ("normal" === l.type) {
                        if (a = r.done ? h : m, l.arg === v) continue;
                        return {
                            value: l.arg,
                            done: r.done
                        }
                    }
                    "throw" === l.type && (a = h, r.method = "throw", r.arg = l.arg)
                }
            }
        }

        function _(t, n) {
            var r = n.method,
                a = t.iterator[r];
            if (a === e) return n.delegate = null, "throw" === r && t.iterator.return && (n.method = "return", n.arg = e, _(t, n), "throw" === n.method) || "return" !== r && (n.method = "throw", n.arg = new TypeError("The iterator does not provide a '" + r + "' method")), v;
            var o = d(a, t.iterator, n.arg);
            if ("throw" === o.type) return n.method = "throw", n.arg = o.arg, n.delegate = null, v;
            var i = o.arg;
            return i ? i.done ? (n[t.resultName] = i.value, n.next = t.nextLoc, "return" !== n.method && (n.method = "next", n.arg = e), n.delegate = null, v) : i : (n.method = "throw", n.arg = new TypeError("iterator result is not an object"), n.delegate = null, v)
        }

        function T(e) {
            var t = {
                tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
        }

        function S(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t
        }

        function $(e) {
            this.tryEntries = [{
                tryLoc: "root"
            }], e.forEach(T, this), this.reset(!0)
        }

        function A(t) {
            if (t || "" === t) {
                var n = t[i];
                if (n) return n.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var a = -1,
                        o = function n() {
                            for (; ++a < t.length;)
                                if (r.call(t, a)) return n.value = t[a], n.done = !1, n;
                            return n.value = e, n.done = !0, n
                        };
                    return o.next = o
                }
            }
            throw new TypeError(it(t) + " is not iterable")
        }
        return y.prototype = b, a(C, "constructor", {
            value: b,
            configurable: !0
        }), a(b, "constructor", {
            value: y,
            configurable: !0
        }), y.displayName = l(b, s, "GeneratorFunction"), t.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === y || "GeneratorFunction" === (t.displayName || t.name))
        }, t.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, b) : (e.__proto__ = b, l(e, s, "GeneratorFunction")), e.prototype = Object.create(C), e
        }, t.awrap = function(e) {
            return {
                __await: e
            }
        }, L(N.prototype), l(N.prototype, c, (function() {
            return this
        })), t.AsyncIterator = N, t.async = function(e, n, r, a, o) {
            void 0 === o && (o = Promise);
            var i = new N(u(e, n, r, a), o);
            return t.isGeneratorFunction(n) ? i : i.next().then((function(e) {
                return e.done ? e.value : i.next()
            }))
        }, L(C), l(C, s, "Generator"), l(C, i, (function() {
            return this
        })), l(C, "toString", (function() {
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
        }, t.values = A, $.prototype = {
            constructor: $,
            reset: function(t) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = e, this.done = !1, this.delegate = null, this.method = "next", this.arg = e, this.tryEntries.forEach(S), !t)
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

                function a(r, a) {
                    return c.type = "throw", c.arg = t, n.next = r, a && (n.method = "next", n.arg = e), !!a
                }
                for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                    var i = this.tryEntries[o],
                        c = i.completion;
                    if ("root" === i.tryLoc) return a("end");
                    if (i.tryLoc <= this.prev) {
                        var s = r.call(i, "catchLoc"),
                            l = r.call(i, "finallyLoc");
                        if (s && l) {
                            if (this.prev < i.catchLoc) return a(i.catchLoc, !0);
                            if (this.prev < i.finallyLoc) return a(i.finallyLoc)
                        } else if (s) {
                            if (this.prev < i.catchLoc) return a(i.catchLoc, !0)
                        } else {
                            if (!l) throw Error("try statement without catch or finally");
                            if (this.prev < i.finallyLoc) return a(i.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var a = this.tryEntries[n];
                    if (a.tryLoc <= this.prev && r.call(a, "finallyLoc") && this.prev < a.finallyLoc) {
                        var o = a;
                        break
                    }
                }
                o && ("break" === e || "continue" === e) && o.tryLoc <= t && t <= o.finallyLoc && (o = null);
                var i = o ? o.completion : {};
                return i.type = e, i.arg = t, o ? (this.method = "next", this.next = o.finallyLoc, v) : this.complete(i)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), v
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), S(n), v
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.tryLoc === e) {
                        var r = n.completion;
                        if ("throw" === r.type) {
                            var a = r.arg;
                            S(n)
                        }
                        return a
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(t, n, r) {
                return this.delegate = {
                    iterator: A(t),
                    resultName: n,
                    nextLoc: r
                }, "next" === this.method && (this.arg = e), v
            }
        }, t
    }

    function st(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t && (r = r.filter((function(t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable
            }))), n.push.apply(n, r)
        }
        return n
    }

    function lt(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2 ? st(Object(n), !0).forEach((function(t) {
                ut(e, t, n[t])
            })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : st(Object(n)).forEach((function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
            }))
        }
        return e
    }

    function ut(e, t, n) {
        return (t = function(e) {
            var t = function(e, t) {
                if ("object" != it(e) || !e) return e;
                var n = e[Symbol.toPrimitive];
                if (void 0 !== n) {
                    var r = n.call(e, t || "default");
                    if ("object" != it(r)) return r;
                    throw new TypeError("@@toPrimitive must return a primitive value.")
                }
                return ("string" === t ? String : Number)(e)
            }(e, "string");
            return "symbol" == it(t) ? t : t + ""
        }(t)) in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = n, e
    }

    function dt(e, t, n, r, a, o, i) {
        try {
            var c = e[o](i),
                s = c.value
        } catch (e) {
            return void n(e)
        }
        c.done ? t(s) : Promise.resolve(s).then(r, a)
    }

    function pt(e) {
        return function() {
            var t = this,
                n = arguments;
            return new Promise((function(r, a) {
                var o = e.apply(t, n);

                function i(e) {
                    dt(o, r, a, i, c, "next", e)
                }

                function c(e) {
                    dt(o, r, a, i, c, "throw", e)
                }
                i(void 0)
            }))
        }
    }
    var mt = null,
        ft = null,
        ht = null;

    function vt(e, t) {
        try {
            return chrome.i18n.getMessage(e) || t
        } catch (e) {
            return t
        }
    }

    function gt() {
        if (!mt || !mt.isConnected) {
            d(), (mt = document.createElement("div")).className = "exception-".concat(chrome.runtime.id), mt.style.all = "initial", ft = mt.attachShadow({
                mode: "open"
            });
            var e = document.createElement("style");
            e.textContent = '\n  :host {\n    all: initial;\n    --font-sans: "Bo doi Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", Arial, sans-serif;\n    --font-mono: "Bo doi Geist Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;\n    --primary: #1f1f1f;\n    --secondary: #74777c;\n    --quaternary: #b1b6bc;\n    --background: #ffffff;\n    --surface: #f2f2f2;\n    --elevated: #f2f2f2;\n    --surface-elevated: #ffffff;\n    --stroke: rgba(0, 0, 0, 0.08);\n    color-scheme: light;\n  }\n\n  @media (prefers-color-scheme: dark) {\n    :host {\n      --primary: #eeeeee;\n      --secondary: #c7c7c7;\n      --quaternary: #6c7075;\n      --background: #131313;\n      --surface: #1c1c1c;\n      --elevated: #2c2c2c;\n      --surface-elevated: #1f1f1f;\n      --stroke: rgba(255, 255, 255, 0.08);\n      color-scheme: dark;\n    }\n  }\n\n  :host(.force-light) {\n    --primary: #1f1f1f;\n    --secondary: #74777c;\n    --quaternary: #b1b6bc;\n    --background: #ffffff;\n    --surface: #f2f2f2;\n    --elevated: #f2f2f2;\n    --surface-elevated: #ffffff;\n    --stroke: rgba(0, 0, 0, 0.08);\n    color-scheme: light;\n  }\n\n  :host(.force-dark) {\n    --primary: #eeeeee;\n    --secondary: #c7c7c7;\n    --quaternary: #6c7075;\n    --background: #131313;\n    --surface: #1c1c1c;\n    --elevated: #2c2c2c;\n    --surface-elevated: #1f1f1f;\n    --stroke: rgba(255, 255, 255, 0.08);\n    color-scheme: dark;\n  }\n\n  .modal {\n    width: 400px;\n    max-width: calc(100vw - 32px);\n    max-height: 90vh;\n    padding: 0;\n    border: none;\n    border-radius: 16px;\n    margin: auto;\n    background: var(--surface-elevated);\n    color: var(--primary);\n    box-shadow: 0 0 0 1px var(--stroke), 0 2px 8px 0 rgba(0, 0, 0, 0.06);\n    font-family: var(--font-sans);\n    overflow: hidden;\n  }\n\n  .modal::backdrop {\n    background: rgba(0, 0, 0, 0.4);\n  }\n\n  .content-wrapper {\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n    padding: 24px;\n  }\n\n  h2 {\n    margin: 0;\n    font-size: 16px;\n    font-weight: 600;\n    color: var(--primary);\n  }\n\n  p {\n    margin: 0;\n    font-size: 14px;\n    line-height: 1.5;\n    color: var(--secondary);\n  }\n\n  p:empty {\n    display: none;\n  }\n\n  .input-mono {\n    height: 40px;\n    width: 100%;\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0 12px;\n    background: transparent;\n    border: 1px solid var(--stroke);\n    border-radius: 8px;\n    font-size: 14px;\n    font-family: var(--font-mono);\n    color: var(--primary);\n    outline: none;\n  }\n\n  .input-mono:focus {\n    border-color: var(--quaternary);\n  }\n\n  .input-mono::placeholder {\n    color: var(--secondary);\n  }\n\n  .dialog-fields {\n    display: flex;\n    gap: 12px;\n  }\n\n  .dialog-field {\n    flex: 1;\n    min-width: 0;\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n  }\n\n  .dialog-field-label {\n    padding-top: 8px;\n    font-size: 12px;\n    font-weight: 500;\n    color: var(--secondary);\n  }\n\n  .dialog-number {\n    position: relative;\n    display: flex;\n    align-items: center;\n  }\n\n  .dialog-unit {\n    position: absolute;\n    right: 12px;\n    font-size: 12px;\n    font-family: var(--font-mono);\n    color: var(--secondary);\n    pointer-events: none;\n  }\n\n  .dialog-number .input-mono {\n    padding-right: 32px;\n  }\n\n  .input-mono::-webkit-outer-spin-button,\n  .input-mono::-webkit-inner-spin-button {\n    -webkit-appearance: none;\n    margin: 0;\n  }\n\n  .input-mono[type="number"] {\n    -moz-appearance: textfield;\n    appearance: textfield;\n  }\n\n  .dialog-actions {\n    display: flex;\n    justify-content: flex-end;\n    gap: 8px;\n    padding-top: 8px;\n  }\n\n  .btn-dialog-primary,\n  .btn-dialog-secondary {\n    height: 36px;\n    padding: 0 16px;\n    border: none;\n    border-radius: 12px;\n    font-size: 14px;\n    font-weight: 500;\n    font-family: var(--font-sans);\n    cursor: pointer;\n    outline: none;\n  }\n\n  .btn-dialog-primary {\n    background: var(--primary);\n    color: var(--background);\n  }\n\n  .btn-dialog-primary:hover {\n    opacity: 0.9;\n  }\n\n  .btn-dialog-secondary {\n    background: transparent;\n    color: var(--primary);\n  }\n\n  .btn-dialog-secondary:hover {\n    background: var(--elevated);\n  }\n', ft.appendChild(e), document.body.appendChild(mt)
        }
    }

    function yt() {
        return bt.apply(this, arguments)
    }

    function bt() {
        return (bt = pt(ct().mark((function e() {
            var t, n;
            return ct().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return mt.classList.remove("force-light", "force-dark"), e.prev = 1, e.next = 4, chrome.storage.local.get({
                            theme: "system"
                        });
                    case 4:
                        t = e.sent, "dark" === (n = t.theme) ? mt.classList.add("force-dark") : "light" === n && mt.classList.add("force-light"), e.next = 11;
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

    function wt(e) {
        return xt.apply(this, arguments)
    }

    function xt() {
        return (xt = pt(ct().mark((function e(t) {
            return ct().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return gt(), e.next = 3, yt();
                    case 3:
                        return e.abrupt("return", new Promise((function(e) {
                            ht && (ht.remove(), ht = null);
                            var n = document.createElement("dialog");
                            n.className = "modal";
                            var r = document.createElement("div");
                            if (r.className = "content-wrapper", t.title) {
                                var a = document.createElement("h2");
                                a.textContent = t.title, r.appendChild(a)
                            }
                            var o = document.createElement("p");
                            o.textContent = t.body || "", r.appendChild(o);
                            var i = null,
                                c = null;
                            if ("size" === t.type) {
                                var s = document.createElement("div");
                                s.className = "dialog-fields";
                                var l = function(e, n, r) {
                                    var a = document.createElement("label");
                                    a.className = "dialog-field";
                                    var o = document.createElement("span");
                                    o.className = "dialog-field-label", o.textContent = e, a.appendChild(o);
                                    var i = document.createElement("div");
                                    i.className = "dialog-number";
                                    var c = document.createElement("input");
                                    c.type = "number", c.className = "input-mono", c.min = String(null != r ? r : 1), null != t.max && (c.max = String(t.max)), c.inputMode = "numeric", c.autocomplete = "off", null != n && (c.value = String(n)), i.appendChild(c);
                                    var l = document.createElement("span");
                                    return l.className = "dialog-unit", l.textContent = "px", i.appendChild(l), a.appendChild(i), s.appendChild(a), c
                                };
                                i = l(vt("LABEL_WIDTH", "Width"), t.width, t.minWidth), c = l(vt("LABEL_HEIGHT", "Height"), t.height, t.minHeight), r.appendChild(s)
                            }
                            var u = null;
                            "prompt" === t.type && ((u = document.createElement("input")).type = "text", u.className = "input-mono", u.autocomplete = "off", u.spellcheck = !1, t.placeholder && (u.placeholder = t.placeholder), t.value && (u.value = t.value), r.appendChild(u));
                            var d = document.createElement("div");
                            d.className = "dialog-actions";
                            var p = function(t) {
                                    try {
                                        n.close()
                                    } catch (e) {}
                                    n.remove(), ht === n && (ht = null), e(t)
                                },
                                m = "prompt" === t.type || "size" === t.type ? null : "confirm" !== t.type && void 0;
                            if ("alert" !== t.type) {
                                var f = document.createElement("button");
                                f.type = "button", f.className = "btn-dialog-secondary", f.textContent = t.cancelLabel || vt("DIALOG_CANCEL_BUTTON", "Cancel"), f.addEventListener("click", (function() {
                                    return p(m)
                                })), d.appendChild(f)
                            }
                            var h = document.createElement("button");
                            if (h.type = "button", h.className = "btn-dialog-primary", h.textContent = t.confirmLabel || ("alert" === t.type ? vt("DIALOG_OK", "OK") : vt("DIALOG_CONFIRM", "Confirm")), h.addEventListener("click", (function() {
                                    if ("prompt" === t.type) p(u.value);
                                    else if ("confirm" === t.type) p(!0);
                                    else if ("size" === t.type) {
                                        var e = parseInt(i.value, 10),
                                            n = parseInt(c.value, 10),
                                            r = function(e, n) {
                                                var r;
                                                return Math.min(null !== (r = t.max) && void 0 !== r ? r : 1 / 0, Math.max(null != n ? n : 1, e))
                                            };
                                        if (!Number.isFinite(e) || !Number.isFinite(n)) return void p(null);
                                        p({
                                            width: r(e, t.minWidth),
                                            height: r(n, t.minHeight)
                                        })
                                    } else p()
                                })), d.appendChild(h), r.appendChild(d), n.appendChild(r), n.addEventListener("cancel", (function(e) {
                                    e.preventDefault(), p(m)
                                })), n.addEventListener("click", (function(e) {
                                    e.target === n && p(m)
                                })), ft.appendChild(n), ht = n, n.showModal(), u && setTimeout((function() {
                                    return u.focus()
                                }), 50), i) {
                                setTimeout((function() {
                                    i.focus(), i.select()
                                }), 50);
                                for (var v = 0, g = [i, c]; v < g.length; v++) {
                                    g[v].addEventListener("keydown", (function(e) {
                                        "Enter" === e.key && (e.preventDefault(), h.click())
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
    const Et = {
        alert: function() {
            return wt(lt(lt({}, arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), {}, {
                type: "alert"
            }))
        },
        confirm: function() {
            return wt(lt(lt({}, arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), {}, {
                type: "confirm"
            }))
        },
        prompt: function() {
            return wt(lt(lt({}, arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), {}, {
                type: "prompt"
            }))
        },
        size: function() {
            return wt(lt(lt({}, arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}), {}, {
                type: "size"
            }))
        }
    };

    function Ct(e) {
        return Ct = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, Ct(e)
    }

    function Lt() {
        Lt = function() {
            return t
        };
        var e, t = {},
            n = Object.prototype,
            r = n.hasOwnProperty,
            a = Object.defineProperty || function(e, t, n) {
                e[t] = n.value
            },
            o = "function" == typeof Symbol ? Symbol : {},
            i = o.iterator || "@@iterator",
            c = o.asyncIterator || "@@asyncIterator",
            s = o.toStringTag || "@@toStringTag";

        function l(e, t, n) {
            return Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            l({}, "")
        } catch (e) {
            l = function(e, t, n) {
                return e[t] = n
            }
        }

        function u(e, t, n, r) {
            var o = t && t.prototype instanceof g ? t : g,
                i = Object.create(o.prototype),
                c = new $(r || []);
            return a(i, "_invoke", {
                value: k(e, n, c)
            }), i
        }

        function d(e, t, n) {
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
        t.wrap = u;
        var p = "suspendedStart",
            m = "suspendedYield",
            f = "executing",
            h = "completed",
            v = {};

        function g() {}

        function y() {}

        function b() {}
        var w = {};
        l(w, i, (function() {
            return this
        }));
        var x = Object.getPrototypeOf,
            E = x && x(x(A([])));
        E && E !== n && r.call(E, i) && (w = E);
        var C = b.prototype = g.prototype = Object.create(w);

        function L(e) {
            ["next", "throw", "return"].forEach((function(t) {
                l(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function N(e, t) {
            function n(a, o, i, c) {
                var s = d(e[a], e, o);
                if ("throw" !== s.type) {
                    var l = s.arg,
                        u = l.value;
                    return u && "object" == Ct(u) && r.call(u, "__await") ? t.resolve(u.__await).then((function(e) {
                        n("next", e, i, c)
                    }), (function(e) {
                        n("throw", e, i, c)
                    })) : t.resolve(u).then((function(e) {
                        l.value = e, i(l)
                    }), (function(e) {
                        return n("throw", e, i, c)
                    }))
                }
                c(s.arg)
            }
            var o;
            a(this, "_invoke", {
                value: function(e, r) {
                    function a() {
                        return new t((function(t, a) {
                            n(e, r, t, a)
                        }))
                    }
                    return o = o ? o.then(a, a) : a()
                }
            })
        }

        function k(t, n, r) {
            var a = p;
            return function(o, i) {
                if (a === f) throw Error("Generator is already running");
                if (a === h) {
                    if ("throw" === o) throw i;
                    return {
                        value: e,
                        done: !0
                    }
                }
                for (r.method = o, r.arg = i;;) {
                    var c = r.delegate;
                    if (c) {
                        var s = _(c, r);
                        if (s) {
                            if (s === v) continue;
                            return s
                        }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                        if (a === p) throw a = h, r.arg;
                        r.dispatchException(r.arg)
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    a = f;
                    var l = d(t, n, r);
                    if ("normal" === l.type) {
                        if (a = r.done ? h : m, l.arg === v) continue;
                        return {
                            value: l.arg,
                            done: r.done
                        }
                    }
                    "throw" === l.type && (a = h, r.method = "throw", r.arg = l.arg)
                }
            }
        }

        function _(t, n) {
            var r = n.method,
                a = t.iterator[r];
            if (a === e) return n.delegate = null, "throw" === r && t.iterator.return && (n.method = "return", n.arg = e, _(t, n), "throw" === n.method) || "return" !== r && (n.method = "throw", n.arg = new TypeError("The iterator does not provide a '" + r + "' method")), v;
            var o = d(a, t.iterator, n.arg);
            if ("throw" === o.type) return n.method = "throw", n.arg = o.arg, n.delegate = null, v;
            var i = o.arg;
            return i ? i.done ? (n[t.resultName] = i.value, n.next = t.nextLoc, "return" !== n.method && (n.method = "next", n.arg = e), n.delegate = null, v) : i : (n.method = "throw", n.arg = new TypeError("iterator result is not an object"), n.delegate = null, v)
        }

        function T(e) {
            var t = {
                tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
        }

        function S(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t
        }

        function $(e) {
            this.tryEntries = [{
                tryLoc: "root"
            }], e.forEach(T, this), this.reset(!0)
        }

        function A(t) {
            if (t || "" === t) {
                var n = t[i];
                if (n) return n.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var a = -1,
                        o = function n() {
                            for (; ++a < t.length;)
                                if (r.call(t, a)) return n.value = t[a], n.done = !1, n;
                            return n.value = e, n.done = !0, n
                        };
                    return o.next = o
                }
            }
            throw new TypeError(Ct(t) + " is not iterable")
        }
        return y.prototype = b, a(C, "constructor", {
            value: b,
            configurable: !0
        }), a(b, "constructor", {
            value: y,
            configurable: !0
        }), y.displayName = l(b, s, "GeneratorFunction"), t.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === y || "GeneratorFunction" === (t.displayName || t.name))
        }, t.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, b) : (e.__proto__ = b, l(e, s, "GeneratorFunction")), e.prototype = Object.create(C), e
        }, t.awrap = function(e) {
            return {
                __await: e
            }
        }, L(N.prototype), l(N.prototype, c, (function() {
            return this
        })), t.AsyncIterator = N, t.async = function(e, n, r, a, o) {
            void 0 === o && (o = Promise);
            var i = new N(u(e, n, r, a), o);
            return t.isGeneratorFunction(n) ? i : i.next().then((function(e) {
                return e.done ? e.value : i.next()
            }))
        }, L(C), l(C, s, "Generator"), l(C, i, (function() {
            return this
        })), l(C, "toString", (function() {
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
        }, t.values = A, $.prototype = {
            constructor: $,
            reset: function(t) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = e, this.done = !1, this.delegate = null, this.method = "next", this.arg = e, this.tryEntries.forEach(S), !t)
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

                function a(r, a) {
                    return c.type = "throw", c.arg = t, n.next = r, a && (n.method = "next", n.arg = e), !!a
                }
                for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                    var i = this.tryEntries[o],
                        c = i.completion;
                    if ("root" === i.tryLoc) return a("end");
                    if (i.tryLoc <= this.prev) {
                        var s = r.call(i, "catchLoc"),
                            l = r.call(i, "finallyLoc");
                        if (s && l) {
                            if (this.prev < i.catchLoc) return a(i.catchLoc, !0);
                            if (this.prev < i.finallyLoc) return a(i.finallyLoc)
                        } else if (s) {
                            if (this.prev < i.catchLoc) return a(i.catchLoc, !0)
                        } else {
                            if (!l) throw Error("try statement without catch or finally");
                            if (this.prev < i.finallyLoc) return a(i.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var a = this.tryEntries[n];
                    if (a.tryLoc <= this.prev && r.call(a, "finallyLoc") && this.prev < a.finallyLoc) {
                        var o = a;
                        break
                    }
                }
                o && ("break" === e || "continue" === e) && o.tryLoc <= t && t <= o.finallyLoc && (o = null);
                var i = o ? o.completion : {};
                return i.type = e, i.arg = t, o ? (this.method = "next", this.next = o.finallyLoc, v) : this.complete(i)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), v
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), S(n), v
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.tryLoc === e) {
                        var r = n.completion;
                        if ("throw" === r.type) {
                            var a = r.arg;
                            S(n)
                        }
                        return a
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(t, n, r) {
                return this.delegate = {
                    iterator: A(t),
                    resultName: n,
                    nextLoc: r
                }, "next" === this.method && (this.arg = e), v
            }
        }, t
    }

    function Nt(e, t) {
        if (e) {
            if ("string" == typeof e) return kt(e, t);
            var n = {}.toString.call(e).slice(8, -1);
            return "Object" === n && e.constructor && (n = e.constructor.name), "Map" === n || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? kt(e, t) : void 0
        }
    }

    function kt(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
        return r
    }

    function _t(e, t, n, r, a, o, i) {
        try {
            var c = e[o](i),
                s = c.value
        } catch (e) {
            return void n(e)
        }
        c.done ? t(s) : Promise.resolve(s).then(r, a)
    }

    function Tt(e) {
        return function() {
            var t = this,
                n = arguments;
            return new Promise((function(r, a) {
                var o = e.apply(t, n);

                function i(e) {
                    _t(o, r, a, i, c, "next", e)
                }

                function c(e) {
                    _t(o, r, a, i, c, "throw", e)
                }
                i(void 0)
            }))
        }
    }

    function St(e) {
        var t = e.match(/\d+(\.\d+)?/g);
        if (t.length < 3 || t.length > 4) throw new Error("Invalid RGB/RGBA input");
        var n = parseInt(t[0], 10),
            r = parseInt(t[1], 10),
            a = parseInt(t[2], 10),
            o = void 0 !== t[3] ? parseFloat(t[3]) : 1,
            i = function(e) {
                return e.toString(16).padStart(2, "0").toUpperCase()
            },
            c = i(n),
            s = i(r),
            l = i(a),
            u = o < 1 ? i(Math.round(255 * o)) : "";
        return "#".concat(c).concat(s).concat(l).concat(u)
    }

    function $t(e) {
        var t = e.match(/\d+(\.\d+)?/g);
        if (t.length < 3 || t.length > 4) throw new Error("Invalid RGB/RGBA input");
        var n, r, a = parseInt(t[0], 10) / 255,
            o = parseInt(t[1], 10) / 255,
            i = parseInt(t[2], 10) / 255,
            c = void 0 !== t[3] ? parseFloat(t[3]) : 1,
            s = Math.max(a, o, i),
            l = Math.min(a, o, i),
            u = (s + l) / 2;
        if (s === l) n = r = 0;
        else {
            var d = s - l;
            switch (r = u > .5 ? d / (2 - s - l) : d / (s + l), s) {
                case a:
                    n = (o - i) / d + (o < i ? 6 : 0);
                    break;
                case o:
                    n = (i - a) / d + 2;
                    break;
                case i:
                    n = (a - o) / d + 4
            }
            n /= 6
        }
        n = Math.round(360 * n), r = Math.round(100 * r), u = Math.round(100 * u);
        var p = "hsl(".concat(n, ", ").concat(r, "%, ").concat(u, "%)"),
            m = "hsla(".concat(n, ", ").concat(r, "%, ").concat(u, "%, ").concat(c, ")");
        return 1 === c ? p : m
    }

    function At(e) {
        var t = e.match(/\d+(\.\d+)?/g);
        if (t.length < 3 || t.length > 4) throw new Error("Invalid RGB/RGBA input");
        var n = parseInt(t[0], 10) / 255,
            r = parseInt(t[1], 10) / 255,
            a = parseInt(t[2], 10) / 255,
            o = void 0 !== t[3] ? parseFloat(t[3]) : 1,
            i = Math.max(n, r, a),
            c = Math.min(n, r, a),
            s = i - c,
            l = 0,
            u = 0 === i ? 0 : s / i,
            d = i;
        if (i !== c) {
            switch (i) {
                case n:
                    l = (r - a) / s + (r < a ? 6 : 0);
                    break;
                case r:
                    l = (a - n) / s + 2;
                    break;
                case a:
                    l = (n - r) / s + 4
            }
            l /= 6
        }
        return l = Math.round(360 * l), u = Math.round(100 * u), d = Math.round(100 * d), 1 === o ? "hsb(".concat(l, ", ").concat(u, "%, ").concat(d, "%)") : "hsba(".concat(l, ", ").concat(u, "%, ").concat(d, "%, ").concat(o, ")")
    }

    function Mt(e, t) {
        return e && "RGB" !== t ? e.replace(/rgba?\([^)]+\)/g, (function(e) {
            return function(e, t) {
                switch (t) {
                    case "HEX":
                        return St(e);
                    case "HSL":
                        return $t(e);
                    case "HSB":
                        return At(e);
                    default:
                        return e
                }
            }(e, t)
        })) : e
    }

    function Ot(e) {
        return It.apply(this, arguments)
    }

    function It() {
        return (It = Tt(Lt().mark((function e(t) {
            return Lt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, Rt();
                    case 2:
                        if (e.sent) {
                            e.next = 5;
                            break
                        }
                        return e.abrupt("return", {
                            success: !1
                        });
                    case 5:
                        return e.prev = 5, e.next = 8, navigator.clipboard.writeText(t);
                    case 8:
                        return e.abrupt("return", {
                            success: !0
                        });
                    case 11:
                        return e.prev = 11, e.t0 = e.catch(5), e.abrupt("return", {
                            success: !1
                        });
                    case 14:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [5, 11]
            ])
        })))).apply(this, arguments)
    }

    function Rt() {
        return jt.apply(this, arguments)
    }

    function jt() {
        return (jt = Tt(Lt().mark((function e() {
            return Lt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, new Promise((function(e) {
                            chrome.permissions.contains({
                                permissions: ["clipboardWrite"]
                            }, (function(t) {
                                e(t)
                            }))
                        }));
                    case 2:
                        if (e.sent) {
                            e.next = 7;
                            break
                        }
                        return e.next = 6, new Promise((function(e) {
                            chrome.permissions.request({
                                permissions: ["clipboardWrite"]
                            }, (function(t) {
                                e(t)
                            }))
                        }));
                    case 6:
                        return e.abrupt("return", e.sent);
                    case 7:
                        return e.abrupt("return", !0);
                    case 8:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function Bt(e) {
        return e ? 1 === e ? chrome.i18n.getMessage("EDIT_COUNT_ONE") : chrome.i18n.getMessage("EDIT_COUNT_OTHER", [String(e)]) : chrome.i18n.getMessage("EDIT_COUNT_NONE")
    }

    function Pt(e) {
        var t = document.createElement("div");
        t.className = "shortcut-list";
        var n, r = function(e, t) {
            var n = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (!n) {
                if (Array.isArray(e) || (n = Nt(e)) || t && e && "number" == typeof e.length) {
                    n && (e = n);
                    var r = 0,
                        a = function() {};
                    return {
                        s: a,
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
                        f: a
                    }
                }
                throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
            }
            var o, i = !0,
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
                    c = !0, o = e
                },
                f: function() {
                    try {
                        i || null == n.return || n.return()
                    } finally {
                        if (c) throw o
                    }
                }
            }
        }(e);
        try {
            for (r.s(); !(n = r.n()).done;) {
                var a = n.value,
                    o = document.createElement("span");
                o.className = "shortcut-name", o.textContent = a.name;
                var i = document.createElement("span");
                i.className = "shortcut-keys", i.textContent = a.keys, t.appendChild(o), t.appendChild(i)
            }
        } catch (e) {
            r.e(e)
        } finally {
            r.f()
        }
        return t
    }

    function Dt(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
        if (!e) return e;
        var n = e,
            r = [],
            a = [];
        return n = (n = (n = (n = (n = (n = (n = n.replace(/url\((['"]?)(.*?)\1\)/g, (function(e, n, a) {
            var o = a;
            if (t && !a.startsWith("data:") && !a.startsWith("http://") && !a.startsWith("https://") && !a.startsWith("//")) try {
                o = new URL(a, t).href
            } catch (e) {
                o = a
            }
            var i = String(o).replace(/"/g, "&quot;").replace(/'/g, "&#39;"),
                c = String(a).replace(/"/g, "&quot;").replace(/'/g, "&#39;"),
                s = 'url(<a href="'.concat(i, '" target="_blank" class="link preview-link">').concat(c, "</a>)");
            return r.push(s), "__LINK__".concat(r.length - 1, "__")
        }))).replace(/var\(\s*(--[\w-]+)/g, (function(e, t) {
            return a.push(t), "var(__VAR__".concat(a.length - 1, "__")
        }))).replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, (function(e) {
            return '<span class="string">'.concat(e, "</span>")
        }))).replace(/\b(\d+(\.\d+)?(px|em|rem|%|s|ms)?)\b/g, (function(e) {
            return '<span class="number">'.concat(e, "</span>")
        }))).replace(/\b(ease-in-out|ease-in|ease-out|step-start|step-end|flex-start|flex-end|row-reverse|column-reverse|wrap-reverse|inline-block|inline-flex|inline-grid|space-between|space-around|space-evenly|border-box|content-box|no-repeat|not-allowed|pre-wrap|pre-line|break-word|break-all|keep-all|list-item|auto|inherit|initial|unset|none|block|flex|grid|inline|inset|rgb|rgba|hsl|hsla|start|end|center|stretch|baseline|row|column|wrap|nowrap|normal|left|right|top|bottom|absolute|relative|fixed|sticky|static|hidden|visible|scroll|collapse|solid|dashed|dotted|double|uppercase|lowercase|capitalize|bold|bolder|lighter|italic|oblique|table|contents|repeat|cover|contain|pointer|move|grab|grabbing|default|wait|transparent|currentColor|ease|linear|middle|sub|super|pre)\b/g, (function(e) {
            return '<span class="keyword">'.concat(e, "</span>")
        }))).replace(/__LINK__(\d+)__/g, (function(e, t) {
            return r[parseInt(t, 10)]
        }))).replace(/__VAR__(\d+)__/g, (function(e, t) {
            return '<span class="variable">'.concat(a[parseInt(t, 10)], "</span>")
        }))
    }

    function Ut(e) {
        return String(e || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\S+/g, (function(e) {
            return e.includes("[") ? e.replace(/(\[)([^\]]+)(\])/g, '$1<span class="string">$2</span>$3') : e.replace(/(-)(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)\b/g, '$1<span class="number">$2</span>')
        }))
    }

    function Ht(e) {
        return Ht = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, Ht(e)
    }

    function Ft(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, a, o, i, c = [],
                    s = !0,
                    l = !1;
                try {
                    if (o = (n = n.call(e)).next, 0 === t) {
                        if (Object(n) !== n) return;
                        s = !1
                    } else
                        for (; !(s = (r = o.call(n)).done) && (c.push(r.value), c.length !== t); s = !0);
                } catch (e) {
                    l = !0, a = e
                } finally {
                    try {
                        if (!s && null != n.return && (i = n.return(), Object(i) !== i)) return
                    } finally {
                        if (l) throw a
                    }
                }
                return c
            }
        }(e, t) || Vt(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Gt() {
        Gt = function() {
            return t
        };
        var e, t = {},
            n = Object.prototype,
            r = n.hasOwnProperty,
            a = Object.defineProperty || function(e, t, n) {
                e[t] = n.value
            },
            o = "function" == typeof Symbol ? Symbol : {},
            i = o.iterator || "@@iterator",
            c = o.asyncIterator || "@@asyncIterator",
            s = o.toStringTag || "@@toStringTag";

        function l(e, t, n) {
            return Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            l({}, "")
        } catch (e) {
            l = function(e, t, n) {
                return e[t] = n
            }
        }

        function u(e, t, n, r) {
            var o = t && t.prototype instanceof g ? t : g,
                i = Object.create(o.prototype),
                c = new $(r || []);
            return a(i, "_invoke", {
                value: k(e, n, c)
            }), i
        }

        function d(e, t, n) {
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
        t.wrap = u;
        var p = "suspendedStart",
            m = "suspendedYield",
            f = "executing",
            h = "completed",
            v = {};

        function g() {}

        function y() {}

        function b() {}
        var w = {};
        l(w, i, (function() {
            return this
        }));
        var x = Object.getPrototypeOf,
            E = x && x(x(A([])));
        E && E !== n && r.call(E, i) && (w = E);
        var C = b.prototype = g.prototype = Object.create(w);

        function L(e) {
            ["next", "throw", "return"].forEach((function(t) {
                l(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function N(e, t) {
            function n(a, o, i, c) {
                var s = d(e[a], e, o);
                if ("throw" !== s.type) {
                    var l = s.arg,
                        u = l.value;
                    return u && "object" == Ht(u) && r.call(u, "__await") ? t.resolve(u.__await).then((function(e) {
                        n("next", e, i, c)
                    }), (function(e) {
                        n("throw", e, i, c)
                    })) : t.resolve(u).then((function(e) {
                        l.value = e, i(l)
                    }), (function(e) {
                        return n("throw", e, i, c)
                    }))
                }
                c(s.arg)
            }
            var o;
            a(this, "_invoke", {
                value: function(e, r) {
                    function a() {
                        return new t((function(t, a) {
                            n(e, r, t, a)
                        }))
                    }
                    return o = o ? o.then(a, a) : a()
                }
            })
        }

        function k(t, n, r) {
            var a = p;
            return function(o, i) {
                if (a === f) throw Error("Generator is already running");
                if (a === h) {
                    if ("throw" === o) throw i;
                    return {
                        value: e,
                        done: !0
                    }
                }
                for (r.method = o, r.arg = i;;) {
                    var c = r.delegate;
                    if (c) {
                        var s = _(c, r);
                        if (s) {
                            if (s === v) continue;
                            return s
                        }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                        if (a === p) throw a = h, r.arg;
                        r.dispatchException(r.arg)
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    a = f;
                    var l = d(t, n, r);
                    if ("normal" === l.type) {
                        if (a = r.done ? h : m, l.arg === v) continue;
                        return {
                            value: l.arg,
                            done: r.done
                        }
                    }
                    "throw" === l.type && (a = h, r.method = "throw", r.arg = l.arg)
                }
            }
        }

        function _(t, n) {
            var r = n.method,
                a = t.iterator[r];
            if (a === e) return n.delegate = null, "throw" === r && t.iterator.return && (n.method = "return", n.arg = e, _(t, n), "throw" === n.method) || "return" !== r && (n.method = "throw", n.arg = new TypeError("The iterator does not provide a '" + r + "' method")), v;
            var o = d(a, t.iterator, n.arg);
            if ("throw" === o.type) return n.method = "throw", n.arg = o.arg, n.delegate = null, v;
            var i = o.arg;
            return i ? i.done ? (n[t.resultName] = i.value, n.next = t.nextLoc, "return" !== n.method && (n.method = "next", n.arg = e), n.delegate = null, v) : i : (n.method = "throw", n.arg = new TypeError("iterator result is not an object"), n.delegate = null, v)
        }

        function T(e) {
            var t = {
                tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
        }

        function S(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t
        }

        function $(e) {
            this.tryEntries = [{
                tryLoc: "root"
            }], e.forEach(T, this), this.reset(!0)
        }

        function A(t) {
            if (t || "" === t) {
                var n = t[i];
                if (n) return n.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var a = -1,
                        o = function n() {
                            for (; ++a < t.length;)
                                if (r.call(t, a)) return n.value = t[a], n.done = !1, n;
                            return n.value = e, n.done = !0, n
                        };
                    return o.next = o
                }
            }
            throw new TypeError(Ht(t) + " is not iterable")
        }
        return y.prototype = b, a(C, "constructor", {
            value: b,
            configurable: !0
        }), a(b, "constructor", {
            value: y,
            configurable: !0
        }), y.displayName = l(b, s, "GeneratorFunction"), t.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === y || "GeneratorFunction" === (t.displayName || t.name))
        }, t.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, b) : (e.__proto__ = b, l(e, s, "GeneratorFunction")), e.prototype = Object.create(C), e
        }, t.awrap = function(e) {
            return {
                __await: e
            }
        }, L(N.prototype), l(N.prototype, c, (function() {
            return this
        })), t.AsyncIterator = N, t.async = function(e, n, r, a, o) {
            void 0 === o && (o = Promise);
            var i = new N(u(e, n, r, a), o);
            return t.isGeneratorFunction(n) ? i : i.next().then((function(e) {
                return e.done ? e.value : i.next()
            }))
        }, L(C), l(C, s, "Generator"), l(C, i, (function() {
            return this
        })), l(C, "toString", (function() {
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
        }, t.values = A, $.prototype = {
            constructor: $,
            reset: function(t) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = e, this.done = !1, this.delegate = null, this.method = "next", this.arg = e, this.tryEntries.forEach(S), !t)
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

                function a(r, a) {
                    return c.type = "throw", c.arg = t, n.next = r, a && (n.method = "next", n.arg = e), !!a
                }
                for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                    var i = this.tryEntries[o],
                        c = i.completion;
                    if ("root" === i.tryLoc) return a("end");
                    if (i.tryLoc <= this.prev) {
                        var s = r.call(i, "catchLoc"),
                            l = r.call(i, "finallyLoc");
                        if (s && l) {
                            if (this.prev < i.catchLoc) return a(i.catchLoc, !0);
                            if (this.prev < i.finallyLoc) return a(i.finallyLoc)
                        } else if (s) {
                            if (this.prev < i.catchLoc) return a(i.catchLoc, !0)
                        } else {
                            if (!l) throw Error("try statement without catch or finally");
                            if (this.prev < i.finallyLoc) return a(i.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var a = this.tryEntries[n];
                    if (a.tryLoc <= this.prev && r.call(a, "finallyLoc") && this.prev < a.finallyLoc) {
                        var o = a;
                        break
                    }
                }
                o && ("break" === e || "continue" === e) && o.tryLoc <= t && t <= o.finallyLoc && (o = null);
                var i = o ? o.completion : {};
                return i.type = e, i.arg = t, o ? (this.method = "next", this.next = o.finallyLoc, v) : this.complete(i)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), v
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), S(n), v
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.tryLoc === e) {
                        var r = n.completion;
                        if ("throw" === r.type) {
                            var a = r.arg;
                            S(n)
                        }
                        return a
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(t, n, r) {
                return this.delegate = {
                    iterator: A(t),
                    resultName: n,
                    nextLoc: r
                }, "next" === this.method && (this.arg = e), v
            }
        }, t
    }

    function qt(e) {
        return function(e) {
            if (Array.isArray(e)) return zt(e)
        }(e) || function(e) {
            if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e)
        }(e) || Vt(e) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Wt(e, t) {
        var n = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
        if (!n) {
            if (Array.isArray(e) || (n = Vt(e)) || t && e && "number" == typeof e.length) {
                n && (e = n);
                var r = 0,
                    a = function() {};
                return {
                    s: a,
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
                    f: a
                }
            }
            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }
        var o, i = !0,
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
                c = !0, o = e
            },
            f: function() {
                try {
                    i || null == n.return || n.return()
                } finally {
                    if (c) throw o
                }
            }
        }
    }

    function Vt(e, t) {
        if (e) {
            if ("string" == typeof e) return zt(e, t);
            var n = {}.toString.call(e).slice(8, -1);
            return "Object" === n && e.constructor && (n = e.constructor.name), "Map" === n || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? zt(e, t) : void 0
        }
    }

    function zt(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
        return r
    }

    function Yt(e, t, n, r, a, o, i) {
        try {
            var c = e[o](i),
                s = c.value
        } catch (e) {
            return void n(e)
        }
        c.done ? t(s) : Promise.resolve(s).then(r, a)
    }

    function Kt(e) {
        return function() {
            var t = this,
                n = arguments;
            return new Promise((function(r, a) {
                var o = e.apply(t, n);

                function i(e) {
                    Yt(o, r, a, i, c, "next", e)
                }

                function c(e) {
                    Yt(o, r, a, i, c, "throw", e)
                }
                i(void 0)
            }))
        }
    }
    var Xt = null;
    var Zt = null,
        Qt = null,
        Jt = null,
        en = null,
        tn = [],
        nn = -1,
        rn = null,
        an = "",
        on = 0,
        cn = 0,
        sn = 0,
        ln = null,
        un = new Map,
        dn = new Map,
        pn = ["inherit", "initial", "unset", "revert", "revert-layer"],
        mn = {
            display: ["block", "inline", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "none", "contents", "flow-root", "table", "table-row", "table-cell", "list-item"],
            position: ["static", "relative", "absolute", "fixed", "sticky"],
            "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
            "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
            "align-items": ["stretch", "flex-start", "flex-end", "center", "baseline", "start", "end", "self-start", "self-end"],
            "align-self": ["auto", "stretch", "flex-start", "flex-end", "center", "baseline"],
            "align-content": ["stretch", "flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
            "justify-content": ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly", "start", "end", "stretch"],
            "justify-items": ["stretch", "start", "end", "center"],
            "justify-self": ["auto", "stretch", "start", "end", "center"],
            "place-items": ["center", "start", "end", "stretch"],
            "place-content": ["center", "start", "end", "stretch", "space-between", "space-around", "space-evenly"],
            "text-align": ["left", "right", "center", "justify", "start", "end"],
            "font-weight": ["normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
            "font-style": ["normal", "italic", "oblique"],
            "text-transform": ["none", "capitalize", "uppercase", "lowercase"],
            "text-decoration": ["none", "underline", "overline", "line-through"],
            "text-decoration-line": ["none", "underline", "overline", "line-through"],
            "white-space": ["normal", "nowrap", "pre", "pre-wrap", "pre-line", "break-spaces"],
            "word-break": ["normal", "break-all", "keep-all", "break-word"],
            "overflow-wrap": ["normal", "break-word", "anywhere"],
            overflow: ["visible", "hidden", "scroll", "auto", "clip"],
            "overflow-x": ["visible", "hidden", "scroll", "auto", "clip"],
            "overflow-y": ["visible", "hidden", "scroll", "auto", "clip"],
            cursor: ["auto", "default", "pointer", "text", "move", "not-allowed", "grab", "grabbing", "wait", "help", "crosshair", "zoom-in", "zoom-out", "none"],
            "box-sizing": ["content-box", "border-box"],
            visibility: ["visible", "hidden", "collapse"],
            "pointer-events": ["auto", "none"],
            "object-fit": ["fill", "contain", "cover", "none", "scale-down"],
            "object-position": ["top", "bottom", "left", "right", "center"],
            "background-repeat": ["repeat", "repeat-x", "repeat-y", "no-repeat", "space", "round"],
            "background-size": ["auto", "cover", "contain"],
            "background-position": ["top", "bottom", "left", "right", "center"],
            "vertical-align": ["baseline", "top", "middle", "bottom", "sub", "super", "text-top", "text-bottom"],
            "list-style-type": ["none", "disc", "circle", "square", "decimal", "lower-alpha", "upper-alpha", "lower-roman", "upper-roman"],
            "border-style": ["none", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"],
            float: ["none", "left", "right"],
            clear: ["none", "left", "right", "both"],
            resize: ["none", "both", "horizontal", "vertical"],
            "user-select": ["auto", "none", "text", "all"],
            "writing-mode": ["horizontal-tb", "vertical-rl", "vertical-lr"],
            direction: ["ltr", "rtl"],
            isolation: ["auto", "isolate"],
            "mix-blend-mode": ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"],
            width: ["auto", "fit-content", "max-content", "min-content"],
            height: ["auto", "fit-content", "max-content", "min-content"],
            "flex-basis": ["auto", "content", "fit-content", "max-content", "min-content"],
            "flex-grow": ["0", "1"],
            "flex-shrink": ["0", "1"]
        },
        fn = null;

    function hn() {
        return vn.apply(this, arguments)
    }

    function vn() {
        return vn = Kt(Gt().mark((function e() {
            var t, n, r, a = arguments;
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return t = a.length > 0 && void 0 !== a[0] && a[0], n = a.length > 1 && void 0 !== a[1] ? a[1] : {}, r = a.length > 2 && void 0 !== a[2] ? a[2] : "tab-1", Qt = a.length > 3 && void 0 !== a[3] ? a[3] : null, yn(), gn(t, n), e.next = 9, bn();
                    case 9:
                        xn(),
                            function(e) {
                                var t, n = new MutationObserver(function() {
                                        var e = Kt(Gt().mark((function e(t) {
                                            var n, r, a, o, i;
                                            return Gt().wrap((function(e) {
                                                for (;;) switch (e.prev = e.next) {
                                                    case 0:
                                                        n = Wt(t);
                                                        try {
                                                            for (n.s(); !(r = n.n()).done;) "attributes" === (a = r.value).type && "class" === a.attributeName && ((o = a.target).classList.contains("hidden") || ("tab-1" === (i = o.dataset.tab) && pr(), "tab-2" === i && (dr(), setTimeout((function() {
                                                                mr(), pr()
                                                            }), 0))))
                                                        } catch (e) {
                                                            n.e(e)
                                                        } finally {
                                                            n.f()
                                                        }
                                                    case 2:
                                                    case "end":
                                                        return e.stop()
                                                }
                                            }), e)
                                        })));
                                        return function(t) {
                                            return e.apply(this, arguments)
                                        }
                                    }()),
                                    r = Wt(e);
                                try {
                                    for (r.s(); !(t = r.n()).done;) {
                                        var a = t.value;
                                        n.observe(a, {
                                            attributes: !0
                                        })
                                    }
                                } catch (e) {
                                    r.e(e)
                                } finally {
                                    r.f()
                                }
                            }(document.querySelectorAll("[data-tab]")), r && "tab-1" !== r && Ln(r);
                    case 12:
                    case "end":
                        return e.stop()
                }
            }), e)
        }))), vn.apply(this, arguments)
    }

    function gn(e, t) {
        var n = document.getElementById("edit_css-empty-shortcuts");
        if (n) {
            var r = e ? "⌘" : "Ctrl",
                a = e ? "⇧" : "Shift",
                o = [{
                    name: chrome.i18n.getMessage("SHORTCUT_TOGGLE_RULER"),
                    keys: t._execute_action
                }, {
                    name: chrome.i18n.getMessage("SHORTCUT_UNDO"),
                    keys: "".concat(r, "Z")
                }, {
                    name: chrome.i18n.getMessage("SHORTCUT_REDO"),
                    keys: "".concat(a).concat(r, "Z")
                }, {
                    name: chrome.i18n.getMessage("SHORTCUT_COPY"),
                    keys: "".concat(r, "C")
                }, {
                    name: chrome.i18n.getMessage("SHORTCUT_PASTE"),
                    keys: "".concat(r, "V")
                }].filter((function(e) {
                    return e.keys
                }));
            n.replaceChildren(Pt(o))
        }
    }

    function yn() {
        var e = document.querySelectorAll("[data-localize]");
        if (e) {
            var t, n = Wt(e);
            try {
                for (n.s(); !(t = n.n()).done;) {
                    var r = t.value;
                    r.innerHTML = chrome.i18n.getMessage(r.dataset.localize)
                }
            } catch (e) {
                n.e(e)
            } finally {
                n.f()
            }
        }
        var a = document.querySelectorAll("[data-placeholder]");
        if (a) {
            var o, i = Wt(a);
            try {
                for (i.s(); !(o = i.n()).done;) {
                    var c = o.value;
                    c.placeholder = chrome.i18n.getMessage(c.dataset.placeholder)
                }
            } catch (e) {
                i.e(e)
            } finally {
                i.f()
            }
        }
    }

    function bn() {
        return wn.apply(this, arguments)
    }

    function wn() {
        return wn = Kt(Gt().mark((function e() {
            var t, n, r, a, o, c;
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (t = null, n = new URLSearchParams(window.location.search), (r = parseInt(n.get("tabId"), 10)) && (t = parseInt(r, 10)), t && !isNaN(t)) {
                            e.next = 15;
                            break
                        }
                        return e.prev = 5, e.next = 8, i.tabsQuery({
                            active: !0,
                            currentWindow: !0
                        });
                    case 8:
                        c = e.sent, t = null !== (a = null === (o = c[0]) || void 0 === o ? void 0 : o.id) && void 0 !== a ? a : null, e.next = 15;
                        break;
                    case 12:
                        e.prev = 12, e.t0 = e.catch(5), t = null;
                    case 15:
                        Xt = t;
                    case 16:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [5, 12]
            ])
        }))), wn.apply(this, arguments)
    }

    function xn() {
        var e, t, n = document.querySelector(".edit-tab-bar");
        n && n.addEventListener("click", (function(e) {
            var t, n = e.target.closest(".edit-tab-btn");
            if (n) {
                var r = n.dataset.editTab;
                Ln(r), null === (t = Qt) || void 0 === t || t(r)
            }
        }));
        var r = document.getElementById("edit_element-list");
        null == r || r.addEventListener("click", $r), null == r || r.addEventListener("mouseover", Mr), null == r || r.addEventListener("mouseout", Ir), null === (e = document.getElementById("edit_revert-all")) || void 0 === e || e.addEventListener("click", Nn), null === (t = document.getElementById("edit-element-name")) || void 0 === t || t.addEventListener("click", _n)
    }
    chrome.runtime.onMessage.addListener((function(e, t, n) {
        var r, a, o;
        if ("editor_panel" !== e.target) return;
        null !== (r = t.tab) && void 0 !== r && r.id && (Xt = t.tab.id);
        switch (e.action) {
            case "clear":
                qn(), Sn();
                break;
            case "page_updated":
                ! function(e) {
                    e === Xt && (qn(), Sn(), n = document.getElementById("edit_element-list-container"), r = document.getElementById("edit_element-list"), a = document.getElementById("edit_no-results"), r.innerHTML = "", a.classList.remove("hidden"), n.classList.add("hidden"), null === (t = document.getElementById("edit_changes-name")) || void 0 === t || t.classList.add("hidden"));
                    var t, n, r, a
                }(e.tabId);
                break;
            case "content_script_ready":
                null !== (a = t.tab) && void 0 !== a && a.id && function(e) {
                    if (Zt) {
                        try {
                            Zt.disconnect()
                        } catch (e) {}
                        Zt = null
                    }
                    try {
                        (Zt = chrome.tabs.connect(e, {
                            name: "sidepanel_".concat(e)
                        })).onDisconnect.addListener((function() {
                            Zt = null, window.close()
                        }))
                    } catch (e) {
                        Zt = null
                    }
                }(Xt = t.tab.id);
                break;
            case "close_side_panel":
                window.close();
                break;
            case "refresh_changes":
                null !== (o = document.querySelector('[data-tab="tab-changes"]')) && void 0 !== o && o.classList.contains("hidden") || mr()
        }
    })), document.addEventListener("selectionchange", (function() {
        var e, t, n = window.getSelection(),
            r = null;
        if (n && n.rangeCount > 0) {
            var a, o = n.anchorNode,
                i = o && (1 === o.nodeType ? o : o.parentElement);
            null != i && null !== (a = i.closest) && void 0 !== a && a.call(i, ".edit-css-editor") && (r = i.closest(".line"))
        }
        if (r === fn) return;
        null === (e = fn) || void 0 === e || e.classList.remove("is-current-line"), fn = r, null === (t = fn) || void 0 === t || t.classList.add("is-current-line")
    })), document.addEventListener("scroll", (function(e) {
        if (!rr()) return;
        if (en.contains(e.target)) return;
        if (Date.now() - sn < 150) return void Qn();
        er()
    }), !0);
    var En = 0;

    function Cn() {
        return document.scrollingElement || document.documentElement
    }

    function Ln(e) {
        var t, n, r = document.querySelector(".edit-tab-bar .edit-tab-btn.active");
        "tab-1" === (null == r ? void 0 : r.dataset.editTab) && (En = Cn().scrollTop, fn && (fn.classList.remove("is-current-line"), fn = null));
        var a = document.querySelector(".edit-tab-bar");
        null == a || a.querySelectorAll(".edit-tab-btn").forEach((function(t) {
            return t.classList.toggle("active", t.dataset.editTab === e)
        })), document.querySelectorAll("#edit-view [data-tab]").forEach((function(t) {
            t.classList.toggle("hidden", t.dataset.tab !== e)
        })), null === (t = document.getElementById("edit-element-name")) || void 0 === t || t.classList.toggle("tab-hidden", "tab-1" !== e), null === (n = document.getElementById("edit_changes-name")) || void 0 === n || n.classList.toggle("tab-hidden", "tab-2" !== e), "tab-1" === e && requestAnimationFrame((function() {
            Cn().scrollTop = En
        }))
    }

    function Nn() {
        return kn.apply(this, arguments)
    }

    function kn() {
        return (kn = Kt(Gt().mark((function e() {
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, Et.confirm({
                            title: chrome.i18n.getMessage("DIALOG_TITLE_CLEAR_ALL_CHANGES"),
                            body: chrome.i18n.getMessage("CONFIRM_CLEAR_ALL_CHANGES")
                        });
                    case 2:
                        if (e.sent) {
                            e.next = 5;
                            break
                        }
                        return e.abrupt("return");
                    case 5:
                        return e.prev = 5, e.next = 8, i.sendMessageToTab(Xt, {
                            target: "rule_editor",
                            action: "revert_all_rule_changes"
                        }).catch((function() {}));
                    case 8:
                        return e.next = 10, i.sendMessageToTab(Xt, {
                            target: "editor",
                            action: "clear_changes"
                        });
                    case 10:
                        e.sent.success && mr(), e.next = 16;
                        break;
                    case 14:
                        e.prev = 14, e.t0 = e.catch(5);
                    case 16:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [5, 14]
            ])
        })))).apply(this, arguments)
    }

    function _n(e) {
        return Tn.apply(this, arguments)
    }

    function Tn() {
        return (Tn = Kt(Gt().mark((function e(t) {
            var n, r, a;
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (!(n = t.target.closest(".copy-button"))) {
                            e.next = 10;
                            break
                        }
                        if (r = n.dataset.copyTarget) {
                            e.next = 5;
                            break
                        }
                        return e.abrupt("return");
                    case 5:
                        return e.next = 7, Ot(r);
                    case 7:
                        return e.sent.success && (n.classList.add("no-events", "copy-success"), setTimeout((function() {
                            return n.classList.remove("no-events", "copy-success")
                        }), 1e3)), e.abrupt("return");
                    case 10:
                        if (!t.target.closest("[data-selector]")) {
                            e.next = 23;
                            break
                        }
                        return e.prev = 11, e.next = 14, i.sendMessage({
                            target: "background",
                            action: "go_to_tab",
                            tabId: Xt
                        });
                    case 14:
                        if (null == (a = e.sent) || !a.success) {
                            e.next = 18;
                            break
                        }
                        return e.next = 18, i.sendOptionalMessageToTab(Xt, {
                            target: "script",
                            action: "go_to_selected_element"
                        });
                    case 18:
                        e.next = 23;
                        break;
                    case 20:
                        e.prev = 20, e.t0 = e.catch(11);
                    case 23:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [11, 20]
            ])
        })))).apply(this, arguments)
    }

    function Sn() {
        var e = document.getElementById("edit-element-name");
        e && (e.innerHTML = "")
    }
    var $n = new WeakSet,
        An = new WeakMap;

    function Mn(e) {
        return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }

    function On(e) {
        var t = e.indexOf(":");
        if (t < 0) return Mn(e);
        var n = e.slice(0, t),
            r = e.slice(t + 1),
            a = "",
            o = r.lastIndexOf(";");
        return -1 !== o && "" === r.slice(o + 1).trim() && (a = r.slice(o), r = r.slice(0, o)), '<span class="property">'.concat(Mn(n), "</span>:").concat(Dt(Mn(r))).concat(Mn(a))
    }

    function In(e) {
        if (e) {
            var t = e.children.length || 1;
            e.style.setProperty("--max-line-digits", String(String(t).length))
        }
    }

    function Rn(e) {
        return qt(e.children).map((function(e) {
            return e.textContent
        })).join("\n")
    }

    function jn(e) {
        var t = window.getSelection();
        if (!t || 0 === t.rangeCount) return null;
        var n = t.getRangeAt(0);
        if (!e.contains(n.endContainer)) return null;
        var r, a = 0,
            o = Wt(e.children);
        try {
            for (o.s(); !(r = o.n()).done;) {
                var i = r.value;
                if (i === n.endContainer || i.contains(n.endContainer)) {
                    var c = n.cloneRange();
                    return c.selectNodeContents(i), c.setEnd(n.endContainer, n.endOffset), a + c.toString().length
                }
                a += i.textContent.length + 1
            }
        } catch (e) {
            o.e(e)
        } finally {
            o.f()
        }
        return a
    }

    function Bn(e, t) {
        for (var n = window.getSelection(), r = document.createRange(), a = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), o = a.nextNode(), i = null, c = t; o;) {
            if (i = o, o.length >= c) return r.setStart(o, c), r.collapse(!0), n.removeAllRanges(), void n.addRange(r);
            c -= o.length, o = a.nextNode()
        }
        r.setStart(i || e, i ? i.length : 0), r.collapse(!0), n.removeAllRanges(), n.addRange(r)
    }

    function Pn(e, t) {
        if (null != t) {
            var n = qt(e.children);
            if (0 !== n.length) {
                var r, a = t,
                    o = Wt(n);
                try {
                    for (o.s(); !(r = o.n()).done;) {
                        var i = r.value,
                            c = i.textContent.length;
                        if (a <= c) return void Bn(i, a);
                        a -= c + 1
                    }
                } catch (e) {
                    o.e(e)
                } finally {
                    o.f()
                }
                var s = n[n.length - 1];
                Bn(s, s.textContent.length)
            }
        }
    }
    var Dn = 0;

    function Un() {
        return Hn.apply(this, arguments)
    }

    function Hn() {
        return (Hn = Kt(Gt().mark((function e() {
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, i.sendMessageToTab(Xt, {
                            target: "script",
                            action: "enable_cross_origin_styles"
                        });
                    case 3:
                        e.next = 7;
                        break;
                    case 5:
                        e.prev = 5, e.t0 = e.catch(0);
                    case 7:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 5]
            ])
        })))).apply(this, arguments)
    }
    var Fn = !1;

    function Gn(e) {
        e.preventDefault(), Fn || (Fn = !0, chrome.permissions.request({
            origins: ["<all_urls>"]
        }, (function(e) {
            chrome.runtime.lastError, Fn = !1, e && Un()
        })))
    }

    function qn() {
        var e = document.getElementById("edit_css-sections"),
            t = document.getElementById("edit_css-body"),
            n = document.getElementById("edit_css-empty");
        e && e.replaceChildren(), null == t || t.classList.add("hidden"), null == n || n.classList.remove("hidden")
    }

    function Wn() {
        if (Jt) return Jt;
        var e = new Set,
            t = document.createElement("span").style;
        for (var n in t)
            if ("string" == typeof t[n] && "cssText" !== n && !/^(webkit|moz|ms|o)[A-Z]/.test(n)) {
                var r = "cssFloat" === n ? "float" : n.replace(/[A-Z]/g, (function(e) {
                    return "-".concat(e.toLowerCase())
                }));
                e.add(r)
            } return Jt = qt(e).sort()
    }

    function Vn(e, t) {
        var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 10,
            r = t.toLowerCase();
        if (!r) return e.slice(0, n);
        var a, o = [],
            i = [],
            c = Wt(e);
        try {
            for (c.s(); !(a = c.n()).done;) {
                var s = a.value,
                    l = s.toLowerCase().indexOf(r);
                0 === l ? o.push(s) : l > 0 && i.push(s)
            }
        } catch (e) {
            c.e(e)
        } finally {
            c.f()
        }
        return [].concat(o, i).slice(0, n)
    }

    function zn() {
        return Yn.apply(this, arguments)
    }

    function Yn() {
        return (Yn = Kt(Gt().mark((function e() {
            var t;
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (!ln) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return", ln);
                    case 2:
                        return e.prev = 2, e.next = 5, i.sendMessageToTab(Xt, {
                            target: "script",
                            action: "get_page_classes"
                        });
                    case 5:
                        t = e.sent, ln = Array.isArray(null == t ? void 0 : t.classes) ? t.classes : [], e.next = 12;
                        break;
                    case 9:
                        e.prev = 9, e.t0 = e.catch(2), ln = [];
                    case 12:
                        return e.abrupt("return", ln);
                    case 13:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [2, 9]
            ])
        })))).apply(this, arguments)
    }

    function Kn(e, t) {
        for (var n, r = Rn(e), a = null !== (n = jn(e)) && void 0 !== n ? n : r.length, o = a; o > 0 && !/\s/.test(r[o - 1]);) o--;
        for (var i = a; i < r.length && !/\s/.test(r[i]);) i++;
        var c = r.slice(o, i);
        if (!c) return null;
        var s = c.toLowerCase(),
            l = t.filter((function(e) {
                return e.toLowerCase().startsWith(s) && e !== c
            })).slice(0, 50);
        return 0 === l.length ? null : {
            kind: "class",
            token: c,
            start: o,
            end: i,
            items: l
        }
    }

    function Xn() {
        return (Xn = Kt(Gt().mark((function e(t) {
            var n, r, a;
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, zn();
                    case 2:
                        if (n = e.sent, r = Kn(t, n)) {
                            e.next = 6;
                            break
                        }
                        return e.abrupt("return", er());
                    case 6:
                        if (a = r.token.toLowerCase(), 0 !== r.items.length && (1 !== r.items.length || r.items[0].toLowerCase() !== a)) {
                            e.next = 9;
                            break
                        }
                        return e.abrupt("return", er());
                    case 9:
                        rn = t, tn = r.items, an = a, on = r.start, cn = r.end, nn = 0, Jn();
                    case 16:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function Zn() {
        en.replaceChildren(), tn.forEach((function(e, t) {
            var n = document.createElement("div");
            n.className = "css-autocomplete-item".concat(t === nn ? " is-active" : ""), n.dataset.index = String(t);
            var r = an ? e.toLowerCase().indexOf(an) : -1;
            if (r < 0) n.textContent = e;
            else {
                r > 0 && n.appendChild(document.createTextNode(e.slice(0, r)));
                var a = document.createElement("span");
                a.className = "css-autocomplete-match", a.textContent = e.slice(r, r + an.length), n.appendChild(a);
                var o = e.slice(r + an.length);
                o && n.appendChild(document.createTextNode(o))
            }
            en.appendChild(n)
        }))
    }

    function Qn() {
        var e = window.getSelection();
        if (e && 0 !== e.rangeCount) {
            var t = e.getRangeAt(0).getBoundingClientRect();
            if (!(t.width || t.height || t.top || t.left)) {
                var n, r = e.anchorNode,
                    a = r && (1 === r.nodeType ? r : r.parentElement),
                    o = null == a || null === (n = a.closest) || void 0 === n ? void 0 : n.call(a, ".line");
                o && (t = o.getBoundingClientRect())
            }
            var i = en.offsetWidth,
                c = en.offsetHeight,
                s = t.bottom + 2;
            s + c > window.innerHeight - 4 && (s = t.top - c - 2);
            var l = Math.max(4, Math.min(t.left, window.innerWidth - i - 4));
            en.style.left = "".concat(l, "px"), en.style.top = "".concat(Math.max(4, s), "px")
        }
    }

    function Jn() {
        en || ((en = document.createElement("div")).className = "css-autocomplete", en.addEventListener("mousedown", (function(e) {
            e.preventDefault();
            var t = e.target.closest(".css-autocomplete-item");
            t && (nn = Number(t.dataset.index), nr(rn))
        })), document.body.appendChild(en)), Zn(), en.classList.add("is-open"), sn = Date.now(), Qn()
    }

    function er() {
        en && en.classList.remove("is-open"), tn = [], nn = -1, rn = null
    }

    function tr(e) {
        var t;
        tn.length && (nn = Math.max(0, Math.min(nn + e, tn.length - 1)), Zn(), null === (t = en.querySelector(".css-autocomplete-item.is-active")) || void 0 === t || t.scrollIntoView({
            block: "center"
        }))
    }

    function nr(e) {
        if (e && tn.length) {
            var t = tn[nn >= 0 ? nn : 0],
                n = Rn(e),
                r = n.slice(cn).startsWith(" ") ? t : "".concat(t, " ");
            ! function(e, t, n) {
                $n.add(e), e.innerHTML = '<div class="line">'.concat(Ut(t) || "<br>", "</div>"), In(e), Pn(e, n), $n.delete(e)
            }(e, n.slice(0, on) + r + n.slice(cn), on + r.length), lr(e), er()
        }
    }

    function rr() {
        return en && en.classList.contains("is-open") && tn.length > 0
    }

    function ar(e) {
        if (rr()) switch (e.key) {
            case "ArrowDown":
                return e.preventDefault(), void tr(1);
            case "ArrowUp":
                return e.preventDefault(), void tr(-1);
            case "Enter":
            case "Tab":
                return e.preventDefault(), void nr(e.currentTarget);
            case "Escape":
                return e.preventDefault(), void er();
            case "ArrowLeft":
            case "ArrowRight":
            case "Home":
            case "End":
                return void er()
        }
        if (e.metaKey || e.ctrlKey) {
            var t = e.key.toLowerCase();
            "z" !== t || e.shiftKey ? ("z" === t && e.shiftKey || "y" === t) && (e.preventDefault(), function() {
                ir.apply(this, arguments)
            }(e.currentTarget)) : (e.preventDefault(), function() {
                or.apply(this, arguments)
            }(e.currentTarget))
        }
    }

    function or() {
        return (or = Kt(Gt().mark((function e() {
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, i.sendMessageToTab(Xt, {
                            target: "editor",
                            action: "undo"
                        });
                    case 3:
                        e.next = 7;
                        break;
                    case 5:
                        e.prev = 5, e.t0 = e.catch(0);
                    case 7:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 5]
            ])
        })))).apply(this, arguments)
    }

    function ir() {
        return (ir = Kt(Gt().mark((function e() {
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, i.sendMessageToTab(Xt, {
                            target: "editor",
                            action: "redo"
                        });
                    case 3:
                        e.next = 7;
                        break;
                    case 5:
                        e.prev = 5, e.t0 = e.catch(0);
                    case 7:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 5]
            ])
        })))).apply(this, arguments)
    }

    function cr(e) {
        var t = e.inputType || "";
        "insertParagraph" !== t && "insertLineBreak" !== t || e.preventDefault()
    }

    function sr(e) {
        var t = e.currentTarget;
        if (t && !$n.has(t)) {
            var n = jn(t);
            $n.add(t), t.innerHTML = '<div class="line">'.concat(Ut(Rn(t)) || "<br>", "</div>"), In(t), Pn(t, n), $n.delete(t), lr(t),
                function(e) {
                    Xn.apply(this, arguments)
                }(t)
        }
    }

    function lr(e) {
        if (e) {
            var t = An.get(e);
            t && clearTimeout(t);
            var n = setTimeout(Kt(Gt().mark((function t() {
                var n, r, a;
                return Gt().wrap((function(t) {
                    for (;;) switch (t.prev = t.next) {
                        case 0:
                            return An.delete(e), n = Rn(e).replace(/\s+/g, " ").trim(), t.prev = 2, t.next = 5, i.sendMessageToTab(Xt, {
                                target: "editor",
                                action: "set_element_classes",
                                data: {
                                    classes: n
                                }
                            });
                        case 5:
                            (r = t.sent) && "number" == typeof r.changeCount && ur(r.changeCount), r && "string" == typeof r.selector && (a = document.querySelector("#edit-element-name .element-name-label")) && (a.innerText = r.selector), t.next = 12;
                            break;
                        case 10:
                            t.prev = 10, t.t0 = t.catch(2);
                        case 12:
                        case "end":
                            return t.stop()
                    }
                }), t, null, [
                    [2, 10]
                ])
            }))), 200);
            An.set(e, n)
        }
    }

    function ur(e) {
        var t = document.querySelector("#edit-element-name .edit-count");
        t && (t.textContent = Bt(e))
    }

    function dr() {
        var e = document.getElementById("tab-loader");
        e && e.classList.remove("hidden")
    }

    function pr() {
        var e = document.getElementById("tab-loader");
        e && e.classList.add("hidden")
    }

    function mr() {
        return fr.apply(this, arguments)
    }

    function fr() {
        return (fr = Kt(Gt().mark((function e() {
            var t, n, r, a, o, c, s, l, u, d, p, m, f, h, v, g, y, b, w, x, E, C, L, N, k, _, T, S, $, A, M, O, I, R, j, B, P, D, U, H, F, G, q, W, V, z, Y;
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return t = document.getElementById("edit_element-list-container"), (n = document.getElementById("edit_element-list")).innerHTML = "", dn.clear(), r = document.getElementById("edit_no-results"), a = document.getElementById("edit_changes-name"), o = document.getElementById("edit_loader-tab-2"), c = setTimeout((function() {
                            o.classList.remove("hidden")
                        }), 150), e.next = 10, Promise.all([i.sendMessageToTab(Xt, {
                            target: "rule_editor",
                            action: "get_rule_changes"
                        }).catch((function() {
                            return null
                        })), i.sendMessageToTab(Xt, {
                            target: "editor",
                            action: "get_all_flattened_changes"
                        }).catch((function() {
                            return null
                        })), i.sendMessageToTab(Xt, {
                            target: "editor",
                            action: "get_html_changes"
                        }).catch((function() {
                            return null
                        }))]);
                    case 10:
                        s = e.sent, l = Ft(s, 3), u = l[0], d = l[1], p = l[2], m = u && u.success && Array.isArray(u.changes) ? u.changes : [], f = p && p.success && Array.isArray(p.changes) ? p.changes : [], clearTimeout(c), o.classList.add("hidden"), h = d && d.success && Array.isArray(d.changes) ? d.changes : [], v = new Map, g = Wt(h), e.prev = 22, b = Gt().mark((function e() {
                            var t, n, r, a, o, i, c;
                            return Gt().wrap((function(e) {
                                for (;;) switch (e.prev = e.next) {
                                    case 0:
                                        t = y.value, n = (t.originalClasses || "").trim().split(/\s+/).filter(Boolean), r = (t.updatedClasses || "").trim().split(/\s+/).filter(Boolean), a = new Set(n), o = new Set(r), i = r.filter((function(e) {
                                            return !a.has(e)
                                        })), c = n.filter((function(e) {
                                            return !o.has(e)
                                        })), (i.length > 0 || c.length > 0) && v.set(t.id, {
                                            added: i,
                                            removed: c
                                        });
                                    case 8:
                                    case "end":
                                        return e.stop()
                                }
                            }), e)
                        })), g.s();
                    case 25:
                        if ((y = g.n()).done) {
                            e.next = 29;
                            break
                        }
                        return e.delegateYield(b(), "t0", 27);
                    case 27:
                        e.next = 25;
                        break;
                    case 29:
                        e.next = 34;
                        break;
                    case 31:
                        e.prev = 31, e.t1 = e.catch(22), g.e(e.t1);
                    case 34:
                        return e.prev = 34, g.f(), e.finish(34);
                    case 37:
                        if (0 !== (w = h.filter((function(e) {
                                return v.has(e.id)
                            }))).length || 0 !== m.length || 0 !== f.length) {
                            e.next = 43;
                            break
                        }
                        return r.classList.remove("hidden"), t.classList.add("hidden"), null == a || a.classList.add("hidden"), e.abrupt("return");
                    case 43:
                        r.classList.add("hidden"), t.classList.remove("hidden"), n.innerHTML = "", x = new Set([].concat(qt(w.map((function(e) {
                            return e.id
                        }))), qt(f.map((function(e) {
                            return e.id
                        }))))).size, E = 0, C = Wt(m);
                        try {
                            for (C.s(); !(L = C.n()).done;) N = L.value, E += Nr(N)
                        } catch (e) {
                            C.e(e)
                        } finally {
                            C.f()
                        }
                        k = Wt(v.values());
                        try {
                            for (k.s(); !(_ = k.n()).done;) T = _.value, E += T.added.length + T.removed.length
                        } catch (e) {
                            k.e(e)
                        } finally {
                            k.f()
                        }
                        if (E += f.length, a && (a.classList.remove("hidden"), S = document.getElementById("edit_changes-elements"), $ = document.getElementById("edit_changes-count"), S && (S.textContent = x > 0 ? jr(x, "ELEMENTS_COUNT_ONE", "ELEMENTS_COUNT_OTHER") : jr(m.length, "RULES_COUNT_ONE", "RULES_COUNT_OTHER")), $ && ($.textContent = Bt(E)), (A = document.getElementById("edit_revert-all")) && (A.title = chrome.i18n.getMessage("BUTTON_CLEAR_CHANGES"))), m.length > 0) {
                            M = new Map, O = Wt(m);
                            try {
                                for (O.s(); !(I = O.n()).done;) R = I.value, j = R.stylesheet || "inline", M.has(j) || M.set(j, []), M.get(j).push(R)
                            } catch (e) {
                                O.e(e)
                            } finally {
                                O.f()
                            }
                            B = Wt(M);
                            try {
                                for (B.s(); !(P = B.n()).done;) D = Ft(P.value, 2), U = D[0], H = D[1], n.appendChild(Sr(U, H))
                            } catch (e) {
                                B.e(e)
                            } finally {
                                B.f()
                            }
                        }
                        F = qt(w).reverse(), G = Wt(F);
                        try {
                            for (G.s(); !(q = G.n()).done;) W = q.value, n.appendChild(Lr(W, v.get(W.id), W.selector))
                        } catch (e) {
                            G.e(e)
                        } finally {
                            G.f()
                        }
                        V = Wt(f);
                        try {
                            for (V.s(); !(z = V.n()).done;) Y = z.value, n.appendChild(Cr(Y))
                        } catch (e) {
                            V.e(e)
                        } finally {
                            V.f()
                        }
                    case 60:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [22, 31, 34, 37]
            ])
        })))).apply(this, arguments)
    }

    function hr(e, t, n) {
        for (var r = 0, a = Math.min(e.length, t.length); r < a && n(e, t, r, r);) r++;
        for (var o = 0, i = Math.min(e.length - r, t.length - r); o < i && n(e, t, e.length - 1 - o, t.length - 1 - o);) o++;
        return {
            pre: r,
            suf: o
        }
    }

    function vr(e, t) {
        if (e === t) return null;
        var n = hr(e, t, (function(e, t, n, r) {
                return e.charCodeAt(n) === t.charCodeAt(r)
            })),
            r = n.pre,
            a = n.suf;
        return {
            oldStart: r,
            oldEnd: e.length - a,
            newStart: r,
            newEnd: t.length - a
        }
    }

    function gr(e, t, n) {
        if (t >= n) return e;
        for (var r = '<span class="diff-changed">', a = "</span>", o = "", i = !1, c = !1, s = 0, l = 0; l < e.length; l++) {
            var u = e[l];
            i || "<" !== u ? i ? (o += u, ">" === u && (i = !1, c && (o += r))) : (s !== t || c || (o += r, c = !0), s === n && c && (o += a, c = !1), o += u, s++) : (c && (o += a), i = !0, o += u)
        }
        return c && (o += a), o
    }

    function yr(e) {
        if (!e) return "";
        var t = un.get(e);
        if (void 0 !== t) return t;
        var n = document.createElement("template");
        n.innerHTML = e;
        var r, a = [],
            o = function(e, t) {
                var n = "  ".repeat(t);
                if (e.nodeType !== Node.TEXT_NODE)
                    if (e.nodeType !== Node.COMMENT_NODE) {
                        if (e.nodeType === Node.ELEMENT_NODE) {
                            var r = e.cloneNode(!1).outerHTML,
                                i = "</" + e.localName + ">",
                                c = r.endsWith(i) ? r.slice(0, -i.length) : r,
                                s = Array.from("template" === e.localName && e.content ? e.content.childNodes : e.childNodes);
                            if (0 !== s.length)
                                if (s.every((function(e) {
                                        return e.nodeType === Node.TEXT_NODE
                                    }))) a.push(n + c + s.map((function(e) {
                                    return e.textContent
                                })).join("").trim() + i);
                                else {
                                    a.push(n + c);
                                    for (var l = 0, u = s; l < u.length; l++) {
                                        var d = u[l];
                                        o(d, t + 1)
                                    }
                                    a.push(n + i)
                                }
                            else a.push(n + r)
                        }
                    } else a.push(n + "\x3c!--" + e.textContent + "--\x3e");
                else {
                    var p = e.textContent.trim();
                    p && a.push(n + p)
                }
            },
            i = Wt(n.content.childNodes);
        try {
            for (i.s(); !(r = i.n()).done;) {
                var c = r.value;
                o(c, 0)
            }
        } catch (e) {
            i.e(e)
        } finally {
            i.f()
        }
        var s = a.join("\n");
        return e.length <= 65536 && (un.size >= 200 && un.clear(), un.set(e, s)), s
    }

    function br(e, t) {
        return "".concat(null != e ? '<span class="diff-num is-before">'.concat(e, "</span>") : "").concat(null != t ? '<span class="diff-num is-after">'.concat(t, "</span>") : "")
    }

    function wr(e) {
        return '<span class="diff-gutter-marker">'.concat("added" === e ? "+" : "-", "</span>")
    }

    function xr(e, t, n) {
        return '<div class="line diff-skip is-expandable">'.concat(_r(e, t, n), "</div>")
    }

    function Er(e) {
        return e.replace('class="line', 'class="line hidden-ctx')
    }

    function Cr(e) {
        var t = document.createElement("div");
        t.className = "change-block";
        var n = document.createElement("pre");
        n.className = "styles-block";
        var r, a, o, i = [],
            c = 1,
            s = 1,
            l = 1,
            u = function(e, t) {
                l = Math.max(l, c, s), i.push({
                    html: '<div class="line">'.concat(br(c, s)).concat(Mn(e), "</div>"),
                    changed: !1,
                    collapsible: !!t,
                    beforeNum: c,
                    afterNum: s,
                    consumesBefore: !0,
                    consumesAfter: !0
                }), c++, s++
            },
            d = function(e, t) {
                l = Math.max(l, c);
                var n = null != t ? t : Mn(e);
                i.push({
                    html: '<div class="line removed">'.concat(br(c, null)).concat(wr("removed")).concat(n, "</div>"),
                    changed: !0,
                    collapsible: !1,
                    beforeNum: c,
                    afterNum: null,
                    consumesBefore: !0,
                    consumesAfter: !1
                }), c++
            },
            p = function(e, t) {
                l = Math.max(l, s);
                var n = null != t ? t : Mn(e);
                i.push({
                    html: '<div class="line added">'.concat(br(null, s)).concat(wr("added")).concat(n, "</div>"),
                    changed: !0,
                    collapsible: !1,
                    beforeNum: null,
                    afterNum: s,
                    consumesBefore: !1,
                    consumesAfter: !0
                }), s++
            },
            m = yr(e.before),
            f = yr(e.after);
        if ("modified" === e.type && m === f) i.push({
            html: '<div class="line diff-note">'.concat(Mn(chrome.i18n.getMessage("LABEL_WHITESPACE_ONLY_CHANGE")), "</div>"),
            changed: !1,
            collapsible: !1,
            beforeNum: null,
            afterNum: null,
            consumesBefore: !1,
            consumesAfter: !1
        });
        else if ("modified" === e.type) {
            var h, v = function(e, t) {
                    var n = e ? e.split("\n") : [],
                        r = t ? t.split("\n") : [],
                        a = hr(n, r, (function(e, t, n, r) {
                            return e[n] === t[r]
                        })),
                        o = a.pre,
                        i = a.suf,
                        c = n.slice(o, n.length - i),
                        s = r.slice(o, r.length - i);
                    return {
                        prefixLines: n.slice(0, o),
                        removedLines: c,
                        addedLines: s,
                        suffixLines: n.slice(n.length - i)
                    }
                }(m, f),
                g = v.prefixLines,
                y = v.removedLines,
                b = v.addedLines,
                w = v.suffixLines,
                x = Wt(g);
            try {
                for (x.s(); !(h = x.n()).done;) {
                    u(h.value, !0)
                }
            } catch (e) {
                x.e(e)
            } finally {
                x.f()
            }
            for (var E = Math.min(y.length, b.length), C = 0; C < E; C++) {
                var L = (r = y[C], a = b[C], o = void 0, (o = vr(r, a)) ? {
                        oldHtml: Mn(r.slice(0, o.oldStart)) + '<span class="diff-changed">' + Mn(r.slice(o.oldStart, o.oldEnd)) + "</span>" + Mn(r.slice(o.oldEnd)),
                        newHtml: Mn(a.slice(0, o.newStart)) + '<span class="diff-changed">' + Mn(a.slice(o.newStart, o.newEnd)) + "</span>" + Mn(a.slice(o.newEnd))
                    } : {
                        oldHtml: Mn(r),
                        newHtml: Mn(a)
                    }),
                    N = L.oldHtml,
                    k = L.newHtml;
                d(y[C], N), p(b[C], k)
            }
            for (var _ = E; _ < y.length; _++) d(y[_]);
            for (var T = E; T < b.length; T++) p(b[T]);
            var S, $ = Wt(w);
            try {
                for ($.s(); !(S = $.n()).done;) {
                    u(S.value, !0)
                }
            } catch (e) {
                $.e(e)
            } finally {
                $.f()
            }
        } else if ("removed" === e.type) {
            var A, M = Wt(m.split("\n"));
            try {
                for (M.s(); !(A = M.n()).done;) {
                    d(A.value)
                }
            } catch (e) {
                M.e(e)
            } finally {
                M.f()
            }
        } else if ("added" === e.type) {
            var O, I = Wt(f.split("\n"));
            try {
                for (I.s(); !(O = I.n()).done;) {
                    p(O.value)
                }
            } catch (e) {
                I.e(e)
            } finally {
                I.f()
            }
        } else if ("detached" === e.type) {
            var R, j = Wt(m.split("\n"));
            try {
                for (j.s(); !(R = j.n()).done;) {
                    var B = R.value;
                    l = Math.max(l, c), i.push({
                        html: '<div class="line removed detached">'.concat(br(c, null)).concat(Mn(B), "</div>"),
                        changed: !1,
                        collapsible: !1,
                        beforeNum: c,
                        afterNum: null,
                        consumesBefore: !0,
                        consumesAfter: !1
                    }), c++
                }
            } catch (e) {
                j.e(e)
            } finally {
                j.f()
            }
        }! function(e) {
            for (var t = 0; t < e.length; t++)
                if (!e[t].collapsible) {
                    for (var n = t; n < e.length && !e[n].collapsible;) n++;
                    if (n - t > 4) {
                        for (var r = t + 2, a = n - 2, o = {
                                html: xr(e, a, null),
                                changed: !1,
                                collapsible: !1
                            }, i = r; i < a; i++) e[i].html = Er(e[i].html);
                        e.splice(r, 0, o), n++
                    }
                    t = n - 1
                }
        }(i), n.innerHTML = Tr(i), n.style.setProperty("--max-line-digits", String(String(l).length));
        var P = document.createElement("div");
        P.className = "change-body";
        var D = document.createElement("div");
        D.className = "pre-wrapper", D.appendChild(n);
        var U = document.createElement("div");
        U.className = "code-block-footer";
        var H = document.createElement("span");
        H.className = "change-selector", H.textContent = e.selector || "", "detached" !== e.type ? H.dataset.elementid = e.id : H.style.cursor = "default", U.appendChild(H);
        var F = document.createElement("div");
        if (F.className = "footer-actions", "detached" !== e.type) {
            var G = document.createElement("div");
            G.className = "section-action discard-action", G.title = chrome.i18n.getMessage("BUTTON_CLEAR_CHANGES"), G.dataset.elementids = JSON.stringify([e.id]), G.dataset.kind = "structure", F.appendChild(G)
        }
        dn.set(e.id, e.after || e.before || "");
        var q = document.createElement("div");
        return q.className = "section-action copy-action", q.dataset.copyid = e.id, F.appendChild(q), U.appendChild(F), D.appendChild(U), P.appendChild(D), t.appendChild(P), t
    }

    function Lr(e, t, n) {
        var r, a, o = document.createElement("div");
        o.className = "change-block";
        var i = document.createElement("pre");
        i.className = "styles-block";
        var c = String(e.element || "div").toLowerCase(),
            s = String(null !== (r = e.originalClasses) && void 0 !== r ? r : ""),
            l = String(null !== (a = e.updatedClasses) && void 0 !== a ? a : ""),
            u = function(e, t, n) {
                var r = n ? gr(t, n.start, n.end) : t,
                    a = '&lt;<span class="selector">'.concat(Mn(c), '</span> class=<span class="string">"').concat(r, '"</span>&gt;'),
                    o = "added" === e ? br(null, 1) : br(1, null);
                return '<div class="line '.concat(e, '">').concat(o).concat(wr(e)).concat(a, "</div>")
            },
            d = [];
        if (s !== l || t && (t.added.length > 0 || t.removed.length > 0)) {
            var p = Ut(s),
                m = Ut(l),
                f = vr(s, l);
            d.push(u("removed", p, f ? {
                start: f.oldStart,
                end: f.oldEnd
            } : null)), d.push(u("added", m, f ? {
                start: f.newStart,
                end: f.newEnd
            } : null))
        }
        i.innerHTML = d.join("");
        var h = document.createElement("div");
        h.className = "change-body";
        var v = document.createElement("div");
        v.className = "pre-wrapper", v.appendChild(i);
        var g = document.createElement("div");
        g.className = "code-block-footer";
        var y = document.createElement("span");
        y.className = "change-selector", y.dataset.elementid = e.id, y.textContent = n || "", g.appendChild(y);
        var b = document.createElement("div");
        b.className = "footer-actions";
        var w = document.createElement("div");
        w.className = "section-action discard-action", w.title = chrome.i18n.getMessage("BUTTON_CLEAR_CHANGES"), w.dataset.elementids = JSON.stringify([e.id]), w.dataset.kind = "html", b.appendChild(w);
        var x = document.createElement("div");
        return x.className = "section-action copy-action", x.dataset.content = "<".concat(c, ' class="').concat(l, '">'), b.appendChild(x), g.appendChild(b), v.appendChild(g), h.appendChild(v), o.appendChild(h), o
    }

    function Nr(e) {
        for (var t = e.before ? kr(e.before.declsText) : {}, n = kr(e.after.declsText), r = 0, a = 0, o = Object.entries(t); a < o.length; a++) {
            var i = Ft(o[a], 2),
                c = i[0],
                s = i[1],
                l = n[c];
            null != l && l === s || r++
        }
        for (var u = 0, d = Object.keys(n); u < d.length; u++) {
            d[u] in t || r++
        }
        return e.before && e.before.selector !== e.after.selector && r++, Math.max(r, 1)
    }

    function kr(e) {
        var t, n = {},
            r = Wt(function(e) {
                for (var t = [], n = 0, r = null, a = 0, o = 0; o < e.length; o++) {
                    var i = e[o];
                    r ? "\\" === i ? o++ : i === r && (r = null) : '"' === i || "'" === i ? r = i : "(" === i ? n++ : ")" === i ? n = Math.max(0, n - 1) : ";" === i && 0 === n && (t.push(e.slice(a, o)), a = o + 1)
                }
                return t.push(e.slice(a)), t
            }(String(e || "").replace(/\/\*[\s\S]*?\*\//g, "")));
        try {
            for (r.s(); !(t = r.n()).done;) {
                var a = t.value,
                    o = a.indexOf(":");
                if (!(o < 0)) {
                    var i = a.slice(0, o).trim().toLowerCase(),
                        c = a.slice(o + 1).trim();
                    i && c && (n[i] = c)
                }
            }
        } catch (e) {
            r.e(e)
        } finally {
            r.f()
        }
        return n
    }

    function _r(e, t, n) {
        for (var r, a, o = null, i = null, c = 0, s = 0, l = t; l < e.length && !(e[l].separator || n && n[l]); l++) {
            var u = e[l];
            u.consumesBefore && (null == o && (o = u.beforeNum), c++), u.consumesAfter && (null == i && (i = u.afterNum), s++)
        }
        for (var d = t - 1; d >= 0 && (null == o || null == i); d--) null == o && e[d].consumesBefore && (o = e[d].beforeNum), null == i && e[d].consumesAfter && (i = e[d].afterNum);
        return "@@ -".concat(null !== (r = o) && void 0 !== r ? r : 0, ",").concat(c, " +").concat(null !== (a = i) && void 0 !== a ? a : 0, ",").concat(s, " @@")
    }

    function Tr(e) {
        var t = [];
        e.forEach((function(e, n) {
            e.changed && t.push(n)
        }));
        for (var n = e.map((function(e, n) {
                return !(!e.collapsible || !t.length) && t.every((function(e) {
                    return Math.abs(e - n) > 2
                }))
            })), r = [], a = 0; a < e.length; a++)
            if (n[a]) {
                for (var o = a; o < e.length && n[o];) o++;
                var i = e.slice(a, o);
                i.length < 2 ? r.push.apply(r, qt(i.map((function(e) {
                    return e.html
                })))) : (r.push(xr(e, o, n)), r.push.apply(r, qt(i.map((function(e) {
                    return Er(e.html)
                }))))), a = o - 1
            } else r.push(e[a].html);
        return r.join("")
    }

    function Sr(e, t) {
        var n = document.createElement("div");
        n.className = "change-block";
        var r = "inline" === e || e.includes("/"),
            a = document.createElement("pre");
        a.className = "styles-block";
        var o = [],
            c = [],
            s = 1,
            l = 1,
            u = 1,
            d = function(e, t, n) {
                u = Math.max(u, s, l), o.push({
                    html: '<div class="line'.concat(t, '">').concat(br(s, l)).concat(e, "</div>"),
                    changed: !1,
                    collapsible: !!n,
                    beforeNum: s,
                    afterNum: l,
                    consumesBefore: !0,
                    consumesAfter: !0
                }), s++, l++
            },
            p = function(e, t) {
                u = Math.max(u, s), o.push({
                    html: '<div class="line removed'.concat(t, '">').concat(br(s, null)).concat(wr("removed")).concat(e, "</div>"),
                    changed: !0,
                    collapsible: !1,
                    beforeNum: s,
                    afterNum: null,
                    consumesBefore: !0,
                    consumesAfter: !1
                }), s++
            },
            m = function(e, t) {
                u = Math.max(u, l), o.push({
                    html: '<div class="line added'.concat(t, '">').concat(br(null, l)).concat(wr("added")).concat(e, "</div>"),
                    changed: !0,
                    collapsible: !1,
                    beforeNum: null,
                    afterNum: l,
                    consumesBefore: !1,
                    consumesAfter: !0
                }), l++
            };
        t.sort((function(e, t) {
            return (e.line || 0) - (t.line || 0)
        })), t.forEach((function(e, t) {
            if (t > 0) {
                var n = r && null != e.line;
                o.push(n ? {
                    separator: !0,
                    html: "",
                    changed: !1,
                    collapsible: !1
                } : {
                    html: '<div class="line">&nbsp;</div>',
                    changed: !1,
                    collapsible: !1
                })
            }
            var a = e.wrappers || [],
                i = a.length ? " media-nested" : "";
            s = Math.max(1, (e.line || 1) - a.length), l = s;
            var u, f = Wt(a);
            try {
                for (f.s(); !(u = f.n()).done;) {
                    var h = u.value;
                    d('<span class="selector">'.concat(Mn(h), "</span> {"), "", !1)
                }
            } catch (e) {
                f.e(e)
            } finally {
                f.f()
            }
            var v = e.before ? e.before.selector : null,
                g = e.after.selector,
                y = e.before ? kr(e.before.declsText) : {},
                b = kr(e.after.declsText),
                w = null == e.before;
            null != v && v !== g ? (p('<span class="selector">'.concat(Mn(v), "</span> {"), i), m('<span class="selector">'.concat(Mn(g), "</span> {"), i)) : w ? m('<span class="selector">'.concat(Mn(g), "</span> {"), i) : d('<span class="selector">'.concat(Mn(g), "</span> {"), i, !1);
            for (var x = " is-decl".concat(i), E = function(e, t) {
                    return On("".concat(e, ": ").concat(t, ";"))
                }, C = function(e, t, n, r) {
                    var a = On("".concat(e, ": ").concat(t, ";")),
                        o = e.length + 2;
                    return gr(a, o + n, o + r)
                }, L = [], N = 0, k = Object.entries(y); N < k.length; N++) {
                var _ = Ft(k[N], 2),
                    T = _[0],
                    S = _[1],
                    $ = b[T];
                if (null == $) p(E(T, S), x);
                else if ($ === S) d(E(T, $), x, !0), L.push("  ".concat(T, ": ").concat($, ";"));
                else {
                    var A = vr(String(S), String($));
                    A ? (p(C(T, S, A.oldStart, A.oldEnd), x), m(C(T, $, A.newStart, A.newEnd), x)) : (p(E(T, S), x), m(E(T, $), x)), L.push("  ".concat(T, ": ").concat($, ";"))
                }
            }
            for (var M = 0, O = Object.entries(b); M < O.length; M++) {
                var I = Ft(O[M], 2),
                    R = I[0],
                    j = I[1];
                null == y[R] && (m(E(R, j), x), L.push("  ".concat(R, ": ").concat(j, ";")))
            }
            w ? m("}", i) : d("}", i, !1);
            for (var B = 0; B < a.length; B++) d("}", "", !1);
            for (var P = "".concat(g, " {\n").concat(L.join("\n"), "\n}"), D = a.length - 1; D >= 0; D--) P = "".concat(a[D], " {\n  ").concat(P.replace(/\n/g, "\n  "), "\n}");
            c.push(P)
        }));
        for (var f = 0; f < o.length; f++) o[f].separator && (o[f].html = '<div class="line diff-skip">'.concat(_r(o, f + 1, null), "</div>"));
        a.innerHTML = Tr(o), a.style.setProperty("--max-line-digits", String(String(u).length));
        var h = document.createElement("div");
        h.className = "change-body";
        var v = document.createElement("div");
        v.className = "pre-wrapper", v.appendChild(a);
        var g = document.createElement("div");
        g.className = "code-block-footer";
        var y = document.createElement("span");
        y.className = "change-selector";
        var b = e.includes("/");
        y.textContent = "inline" === e ? "<style>" : b && e.split(/[?#]/)[0].split("/").pop() || e, b ? (y.title = e, y.addEventListener("click", (function(t) {
            t.stopPropagation(), i.tabsCreate({
                url: e,
                active: !0
            }).catch((function() {}))
        }))) : y.style.cursor = "default", g.appendChild(y);
        var w = document.createElement("div");
        w.className = "footer-actions";
        var x = document.createElement("div");
        x.className = "section-action discard-action", x.title = chrome.i18n.getMessage("BUTTON_CLEAR_CHANGES"), x.dataset.changeids = JSON.stringify(t.map((function(e) {
            return e.id
        }))), w.appendChild(x);
        var E = document.createElement("div");
        return E.className = "section-action copy-action", E.dataset.content = c.join("\n\n"), w.appendChild(E), g.appendChild(w), v.appendChild(g), h.appendChild(v), n.appendChild(h), n
    }

    function $r(e) {
        return Ar.apply(this, arguments)
    }

    function Ar() {
        return (Ar = Kt(Gt().mark((function e(t) {
            var n, r, a, o, c, s, l, u, d, p, m, f, h, v;
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (n = t.target, !(r = n.closest(".diff-skip.is-expandable"))) {
                            e.next = 7;
                            break
                        }
                        for (a = r.nextElementSibling; a && a.classList.contains("hidden-ctx");) a.classList.remove("hidden-ctx"), a = a.nextElementSibling;
                        return r.remove(), e.abrupt("return");
                    case 7:
                        if (!(o = n.closest(".copy-action"))) {
                            e.next = 15;
                            break
                        }
                        return c = null != o.dataset.copyid ? dn.get(o.dataset.copyid) : o.dataset.content, e.next = 12, Ot(c || "");
                    case 12:
                        return (s = e.sent) && s.success && (o.classList.add("copy-success"), setTimeout((function() {
                            return o.classList.remove("copy-success")
                        }), 1200)), e.abrupt("return");
                    case 15:
                        if (!(l = n.closest(".change-selector"))) {
                            e.next = 26;
                            break
                        }
                        return t.stopPropagation(), e.prev = 18, e.next = 21, i.sendMessageToTab(Xt, {
                            target: "script",
                            action: "select_edited_element",
                            elementId: l.dataset.elementid
                        });
                    case 21:
                        e.next = 25;
                        break;
                    case 23:
                        e.prev = 23, e.t0 = e.catch(18);
                    case 25:
                        return e.abrupt("return");
                    case 26:
                        if (!(u = n.closest(".discard-action"))) {
                            e.next = 70;
                            break
                        }
                        return t.stopPropagation(), e.next = 31, Et.confirm({
                            title: chrome.i18n.getMessage("DIALOG_TITLE_CLEAR_ELEMENT"),
                            body: chrome.i18n.getMessage("CONFIRM_CLEAR_ELEMENT")
                        });
                    case 31:
                        if (e.sent) {
                            e.next = 34;
                            break
                        }
                        return e.abrupt("return");
                    case 34:
                        if (!u.dataset.changeids) {
                            e.next = 60;
                            break
                        }
                        d = JSON.parse(u.dataset.changeids), e.prev = 36, p = Wt(d), e.prev = 38, p.s();
                    case 40:
                        if ((m = p.n()).done) {
                            e.next = 46;
                            break
                        }
                        return f = m.value, e.next = 44, i.sendMessageToTab(Xt, {
                            target: "rule_editor",
                            action: "revert_rule_change",
                            changeId: f
                        });
                    case 44:
                        e.next = 40;
                        break;
                    case 46:
                        e.next = 51;
                        break;
                    case 48:
                        e.prev = 48, e.t1 = e.catch(38), p.e(e.t1);
                    case 51:
                        return e.prev = 51, p.f(), e.finish(51);
                    case 54:
                        mr(), e.next = 59;
                        break;
                    case 57:
                        e.prev = 57, e.t2 = e.catch(36);
                    case 59:
                        return e.abrupt("return");
                    case 60:
                        return h = JSON.parse(u.dataset.elementids), v = u.dataset.kind || "all", e.prev = 62, e.next = 65, i.sendMessageToTab(Xt, {
                            target: "editor",
                            action: "clear_elements_by_ids",
                            elementIds: h,
                            kind: v
                        });
                    case 65:
                        mr(), e.next = 70;
                        break;
                    case 68:
                        e.prev = 68, e.t3 = e.catch(62);
                    case 70:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [18, 23],
                [36, 57],
                [38, 48, 51, 54],
                [62, 68]
            ])
        })))).apply(this, arguments)
    }

    function Mr(e) {
        return Or.apply(this, arguments)
    }

    function Or() {
        return (Or = Kt(Gt().mark((function e(t) {
            var n, r, a;
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (n = t.target, !(r = n.closest("[data-elementid]"))) {
                            e.next = 11;
                            break
                        }
                        return a = r.dataset.elementid, e.prev = 4, e.next = 7, i.sendMessageToTab(Xt, {
                            target: "editor",
                            action: "highlight_hovered",
                            elementId: a
                        });
                    case 7:
                        e.next = 11;
                        break;
                    case 9:
                        e.prev = 9, e.t0 = e.catch(4);
                    case 11:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [4, 9]
            ])
        })))).apply(this, arguments)
    }

    function Ir(e) {
        return Rr.apply(this, arguments)
    }

    function Rr() {
        return (Rr = Kt(Gt().mark((function e(t) {
            var n, r, a;
            return Gt().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (n = t.target, !(r = n.closest("[data-elementid]"))) {
                            e.next = 14;
                            break
                        }
                        return a = r.dataset.elementid, e.prev = 4, e.next = 7, i.sendMessageToTab(Xt, {
                            target: "editor",
                            action: "remove_highlight_hovered",
                            elementId: a
                        });
                    case 7:
                        e.sent.success || Et.alert({
                            title: chrome.i18n.getMessage("DIALOG_TITLE_ELEMENT_NOT_FOUND"),
                            body: chrome.i18n.getMessage("ALERT_NO_SELECTED_ELEMENT")
                        }), e.next = 14;
                        break;
                    case 11:
                        e.prev = 11, e.t0 = e.catch(4), Et.alert({
                            title: chrome.i18n.getMessage("DIALOG_TITLE_TAB_UNAVAILABLE"),
                            body: chrome.i18n.getMessage("ALERT_COULDNT_COMMUNICATE_WITH_TAB")
                        });
                    case 14:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [4, 11]
            ])
        })))).apply(this, arguments)
    }

    function jr(e, t, n) {
        return 1 === e ? chrome.i18n.getMessage(t) : chrome.i18n.getMessage(n, [String(e)])
    }

    function Br() {
        Br = function() {
            return t
        };
        var e, t = {},
            n = Object.prototype,
            r = n.hasOwnProperty,
            a = Object.defineProperty || function(e, t, n) {
                e[t] = n.value
            },
            o = "function" == typeof Symbol ? Symbol : {},
            i = o.iterator || "@@iterator",
            c = o.asyncIterator || "@@asyncIterator",
            s = o.toStringTag || "@@toStringTag";

        function l(e, t, n) {
            return Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            l({}, "")
        } catch (e) {
            l = function(e, t, n) {
                return e[t] = n
            }
        }

        function u(e, t, n, r) {
            var o = t && t.prototype instanceof g ? t : g,
                i = Object.create(o.prototype),
                c = new $(r || []);
            return a(i, "_invoke", {
                value: k(e, n, c)
            }), i
        }

        function d(e, t, n) {
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
        t.wrap = u;
        var p = "suspendedStart",
            m = "suspendedYield",
            f = "executing",
            h = "completed",
            v = {};

        function g() {}

        function y() {}

        function b() {}
        var w = {};
        l(w, i, (function() {
            return this
        }));
        var x = Object.getPrototypeOf,
            E = x && x(x(A([])));
        E && E !== n && r.call(E, i) && (w = E);
        var C = b.prototype = g.prototype = Object.create(w);

        function L(e) {
            ["next", "throw", "return"].forEach((function(t) {
                l(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function N(e, t) {
            function n(a, o, i, c) {
                var s = d(e[a], e, o);
                if ("throw" !== s.type) {
                    var l = s.arg,
                        u = l.value;
                    return u && "object" == Pr(u) && r.call(u, "__await") ? t.resolve(u.__await).then((function(e) {
                        n("next", e, i, c)
                    }), (function(e) {
                        n("throw", e, i, c)
                    })) : t.resolve(u).then((function(e) {
                        l.value = e, i(l)
                    }), (function(e) {
                        return n("throw", e, i, c)
                    }))
                }
                c(s.arg)
            }
            var o;
            a(this, "_invoke", {
                value: function(e, r) {
                    function a() {
                        return new t((function(t, a) {
                            n(e, r, t, a)
                        }))
                    }
                    return o = o ? o.then(a, a) : a()
                }
            })
        }

        function k(t, n, r) {
            var a = p;
            return function(o, i) {
                if (a === f) throw Error("Generator is already running");
                if (a === h) {
                    if ("throw" === o) throw i;
                    return {
                        value: e,
                        done: !0
                    }
                }
                for (r.method = o, r.arg = i;;) {
                    var c = r.delegate;
                    if (c) {
                        var s = _(c, r);
                        if (s) {
                            if (s === v) continue;
                            return s
                        }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                        if (a === p) throw a = h, r.arg;
                        r.dispatchException(r.arg)
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    a = f;
                    var l = d(t, n, r);
                    if ("normal" === l.type) {
                        if (a = r.done ? h : m, l.arg === v) continue;
                        return {
                            value: l.arg,
                            done: r.done
                        }
                    }
                    "throw" === l.type && (a = h, r.method = "throw", r.arg = l.arg)
                }
            }
        }

        function _(t, n) {
            var r = n.method,
                a = t.iterator[r];
            if (a === e) return n.delegate = null, "throw" === r && t.iterator.return && (n.method = "return", n.arg = e, _(t, n), "throw" === n.method) || "return" !== r && (n.method = "throw", n.arg = new TypeError("The iterator does not provide a '" + r + "' method")), v;
            var o = d(a, t.iterator, n.arg);
            if ("throw" === o.type) return n.method = "throw", n.arg = o.arg, n.delegate = null, v;
            var i = o.arg;
            return i ? i.done ? (n[t.resultName] = i.value, n.next = t.nextLoc, "return" !== n.method && (n.method = "next", n.arg = e), n.delegate = null, v) : i : (n.method = "throw", n.arg = new TypeError("iterator result is not an object"), n.delegate = null, v)
        }

        function T(e) {
            var t = {
                tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
        }

        function S(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t
        }

        function $(e) {
            this.tryEntries = [{
                tryLoc: "root"
            }], e.forEach(T, this), this.reset(!0)
        }

        function A(t) {
            if (t || "" === t) {
                var n = t[i];
                if (n) return n.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var a = -1,
                        o = function n() {
                            for (; ++a < t.length;)
                                if (r.call(t, a)) return n.value = t[a], n.done = !1, n;
                            return n.value = e, n.done = !0, n
                        };
                    return o.next = o
                }
            }
            throw new TypeError(Pr(t) + " is not iterable")
        }
        return y.prototype = b, a(C, "constructor", {
            value: b,
            configurable: !0
        }), a(b, "constructor", {
            value: y,
            configurable: !0
        }), y.displayName = l(b, s, "GeneratorFunction"), t.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === y || "GeneratorFunction" === (t.displayName || t.name))
        }, t.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, b) : (e.__proto__ = b, l(e, s, "GeneratorFunction")), e.prototype = Object.create(C), e
        }, t.awrap = function(e) {
            return {
                __await: e
            }
        }, L(N.prototype), l(N.prototype, c, (function() {
            return this
        })), t.AsyncIterator = N, t.async = function(e, n, r, a, o) {
            void 0 === o && (o = Promise);
            var i = new N(u(e, n, r, a), o);
            return t.isGeneratorFunction(n) ? i : i.next().then((function(e) {
                return e.done ? e.value : i.next()
            }))
        }, L(C), l(C, s, "Generator"), l(C, i, (function() {
            return this
        })), l(C, "toString", (function() {
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
        }, t.values = A, $.prototype = {
            constructor: $,
            reset: function(t) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = e, this.done = !1, this.delegate = null, this.method = "next", this.arg = e, this.tryEntries.forEach(S), !t)
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

                function a(r, a) {
                    return c.type = "throw", c.arg = t, n.next = r, a && (n.method = "next", n.arg = e), !!a
                }
                for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                    var i = this.tryEntries[o],
                        c = i.completion;
                    if ("root" === i.tryLoc) return a("end");
                    if (i.tryLoc <= this.prev) {
                        var s = r.call(i, "catchLoc"),
                            l = r.call(i, "finallyLoc");
                        if (s && l) {
                            if (this.prev < i.catchLoc) return a(i.catchLoc, !0);
                            if (this.prev < i.finallyLoc) return a(i.finallyLoc)
                        } else if (s) {
                            if (this.prev < i.catchLoc) return a(i.catchLoc, !0)
                        } else {
                            if (!l) throw Error("try statement without catch or finally");
                            if (this.prev < i.finallyLoc) return a(i.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var a = this.tryEntries[n];
                    if (a.tryLoc <= this.prev && r.call(a, "finallyLoc") && this.prev < a.finallyLoc) {
                        var o = a;
                        break
                    }
                }
                o && ("break" === e || "continue" === e) && o.tryLoc <= t && t <= o.finallyLoc && (o = null);
                var i = o ? o.completion : {};
                return i.type = e, i.arg = t, o ? (this.method = "next", this.next = o.finallyLoc, v) : this.complete(i)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), v
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), S(n), v
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.tryLoc === e) {
                        var r = n.completion;
                        if ("throw" === r.type) {
                            var a = r.arg;
                            S(n)
                        }
                        return a
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(t, n, r) {
                return this.delegate = {
                    iterator: A(t),
                    resultName: n,
                    nextLoc: r
                }, "next" === this.method && (this.arg = e), v
            }
        }, t
    }

    function Pr(e) {
        return Pr = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, Pr(e)
    }

    function Dr(e) {
        return function(e) {
            if (Array.isArray(e)) return qr(e)
        }(e) || function(e) {
            if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e)
        }(e) || Gr(e) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Ur(e, t, n, r, a, o, i) {
        try {
            var c = e[o](i),
                s = c.value
        } catch (e) {
            return void n(e)
        }
        c.done ? t(s) : Promise.resolve(s).then(r, a)
    }

    function Hr(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, a, o, i, c = [],
                    s = !0,
                    l = !1;
                try {
                    if (o = (n = n.call(e)).next, 0 === t) {
                        if (Object(n) !== n) return;
                        s = !1
                    } else
                        for (; !(s = (r = o.call(n)).done) && (c.push(r.value), c.length !== t); s = !0);
                } catch (e) {
                    l = !0, a = e
                } finally {
                    try {
                        if (!s && null != n.return && (i = n.return(), Object(i) !== i)) return
                    } finally {
                        if (l) throw a
                    }
                }
                return c
            }
        }(e, t) || Gr(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Fr(e, t) {
        var n = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
        if (!n) {
            if (Array.isArray(e) || (n = Gr(e)) || t && e && "number" == typeof e.length) {
                n && (e = n);
                var r = 0,
                    a = function() {};
                return {
                    s: a,
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
                    f: a
                }
            }
            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }
        var o, i = !0,
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
                c = !0, o = e
            },
            f: function() {
                try {
                    i || null == n.return || n.return()
                } finally {
                    if (c) throw o
                }
            }
        }
    }

    function Gr(e, t) {
        if (e) {
            if ("string" == typeof e) return qr(e, t);
            var n = {}.toString.call(e).slice(8, -1);
            return "Object" === n && e.constructor && (n = e.constructor.name), "Map" === n || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? qr(e, t) : void 0
        }
    }

    function qr(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
        return r
    }

    function Wr(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t && (r = r.filter((function(t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable
            }))), n.push.apply(n, r)
        }
        return n
    }

    function Vr(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2 ? Wr(Object(n), !0).forEach((function(t) {
                zr(e, t, n[t])
            })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : Wr(Object(n)).forEach((function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
            }))
        }
        return e
    }

    function zr(e, t, n) {
        return (t = function(e) {
            var t = function(e, t) {
                if ("object" != Pr(e) || !e) return e;
                var n = e[Symbol.toPrimitive];
                if (void 0 !== n) {
                    var r = n.call(e, t || "default");
                    if ("object" != Pr(r)) return r;
                    throw new TypeError("@@toPrimitive must return a primitive value.")
                }
                return ("string" === t ? String : Number)(e)
            }(e, "string");
            return "symbol" == Pr(t) ? t : t + ""
        }(t)) in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = n, e
    }
    var Yr = null,
        Kr = null,
        Xr = [],
        Zr = new WeakMap,
        Qr = new Map,
        Jr = null,
        ea = null,
        ta = 0,
        na = 0,
        ra = null,
        aa = null,
        oa = null,
        ia = new Map,
        ca = function(e) {
            return e.startsWith("--") ? e : e.toLowerCase()
        },
        sa = new WeakMap,
        la = new WeakMap,
        ua = new Map,
        da = document.createElement("div"),
        pa = 0,
        ma = null,
        fa = null,
        ha = [],
        va = -1,
        ga = null,
        ya = "",
        ba = "property",
        wa = 0,
        xa = 0,
        Ea = 0;

    function Ca(e) {
        return i.sendMessageToTab(Xt, Vr({
            target: "rule_editor"
        }, e))
    }

    function La(e) {
        var t = document.getElementById("edit_css-sections"),
            n = document.getElementById("edit_css-body"),
            r = document.getElementById("edit_css-empty");
        if (t) {
            var a = e && e.rulePayload;
            if (!a) return null == n || n.classList.add("hidden"), void(null == r || r.classList.remove("hidden"));
            null == r || r.classList.add("hidden"), null == n || n.classList.remove("hidden"), Yr = a.suggestedSelector || null, Kr = a.scopePath || null, Xr = a.customProperties || [], Jr = a.forcedState || null, pa = e && e.paySeq || a.paySeq || 0, ma = null, ea = null, ra = null, aa = null, oa = null, ia = new Map, Ha(), ho(), t.replaceChildren(), t.appendChild(function() {
                var e = document.createElement("div");
                e.className = "edit-css-section is-scratchpad";
                var t = qa(chrome.i18n.getMessage("LABEL_EFFECTIVE_STYLES") || "Effective Styles"),
                    n = t.card,
                    r = t.decls;
                return e.appendChild(n), ra = r, aa = e, e
            }());
            var o, i = !0,
                c = Fr(Array.isArray(a.sections) ? a.sections : []);
            try {
                for (c.s(); !(o = c.n()).done;) {
                    var s = o.value;
                    t.appendChild(ka(s, {
                        leadWithInline: i,
                        inlineStyle: a.inlineStyle || ""
                    })), i = !1
                }
            } catch (e) {
                c.e(e)
            } finally {
                c.f()
            }! function(e, t) {
                var n = document.createElement("div");
                n.className = "edit-css-section edit-classes-section";
                var r = document.createElement("div");
                r.className = "edit-css-section-header", r.textContent = "Classes", n.appendChild(r);
                var a = document.createElement("div");
                a.className = "edit-css-editor edit-classes-editor", a.contentEditable = "plaintext-only", a.spellcheck = !1, n.appendChild(a), e.appendChild(n), $n.add(a);
                var o = Ut(t || "");
                a.innerHTML = '<div class="line">'.concat(o || "<br>", "</div>"), In(a), $n.delete(a), a.addEventListener("beforeinput", cr), a.addEventListener("input", sr), a.addEventListener("keydown", ar), a.addEventListener("blur", er)
            }(t, e.classes || a.classes || ""), na = a.skippedCrossOriginCount || 0,
                function(e) {
                    var t = document.getElementById("edit_css-xo-note");
                    if (t) {
                        var n = ++Dn;
                        if (!e) return t.replaceChildren(), void t.classList.add("hidden");
                        var r = document.createElement("a");
                        r.href = "#", r.className = "link", r.textContent = chrome.i18n.getMessage("ENABLE_CROSS_ORIGIN"), r.addEventListener("click", Gn);
                        var a = chrome.i18n.getMessage("MATCHED_CROSS_ORIGIN_HIDDEN", [String(e)]) + " " + chrome.i18n.getMessage("EDITOR_CROSS_ORIGIN_MISSING") + " ",
                            o = document.createElement("span");
                        o.className = "xo-note-icon", o.innerHTML = f;
                        var i = document.createElement("span");
                        i.append(document.createTextNode(a), r, document.createTextNode(".")), t.replaceChildren(o, i), t.classList.remove("hidden"), chrome.permissions.contains({
                            origins: ["<all_urls>"]
                        }, (function(e) {
                            n === Dn && e && Un()
                        }))
                    }
                }(a.skippedCrossOriginCount || 0), Na(t), to()
        }
    }

    function Na(e) {
        var t = e.querySelectorAll(".edit-css-section-header");
        t.forEach((function(e, n) {
            e.style.zIndex = String(t.length - n)
        }))
    }

    function ka(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
            n = t.leadWithInline,
            r = void 0 !== n && n,
            a = t.inlineStyle,
            o = void 0 === a ? "" : a,
            i = e.wrappers || [],
            c = !!e.inheritedFrom,
            s = document.createElement("div");
        s.className = "edit-css-section", s.dataset.wrappers = i.join(" | "), c && (s.dataset.inheritedDepth = String(e.inheritedDepth || 0));
        var l = document.createElement("div");
        l.className = "edit-css-section-header", !1 === e.mediaActive && l.classList.add("greyed");
        var u = document.createElement("span");
        if (u.className = "edit-css-section-title", c) {
            var d = Hr((chrome.i18n.getMessage("LABEL_INHERITED_FROM", ["\0"]) || "Inherited from \0").split("\0"), 2),
                p = d[0],
                m = d[1],
                f = void 0 === m ? "" : m;
            p && u.appendChild(document.createTextNode(p));
            var h = document.createElement("span");
            h.className = "edit-css-section-selector", h.textContent = e.inheritedFrom, u.appendChild(h), f && u.appendChild(document.createTextNode(f)), i.length && u.appendChild(document.createTextNode(" ".concat(i.join(" ")))), l.title = (chrome.i18n.getMessage("LABEL_INHERITED_FROM", [e.inheritedFrom]) || "Inherited from ".concat(e.inheritedFrom)) + (i.length ? " ".concat(i.join(" ")) : "")
        } else u.textContent = i.length ? i.join(" ") : chrome.i18n.getMessage("LABEL_RULES") || "Rules", i.length && (l.title = i.join(" "));
        l.appendChild(u);
        var v = !1 !== e.mediaActive;
        if (!c) {
            var g = document.createElement("button");
            g.type = "button", g.className = "edit-css-section-add", g.title = chrome.i18n.getMessage("LABEL_ADD_RULE") || "Add Rule", g.setAttribute("aria-label", chrome.i18n.getMessage("LABEL_ADD_RULE") || "Add Rule"), g.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>', g.addEventListener("click", (function() {
                return function(e, t) {
                    return Fa.apply(this, arguments)
                }(s, i, !l.classList.contains("greyed"))
            })), l.appendChild(g)
        }
        if (s.appendChild(l), r) {
            var y = _a({
                scopeDepth: e.scopeDepth || 0,
                ruleRef: {
                    inline: !0
                },
                selector: "element.style",
                declsText: o,
                readOnly: !1,
                selectorReadOnly: !0
            }, {
                mediaActive: !0
            });
            ea = y, s.appendChild(y)
        }
        var b, w = Fr(e.rules || []);
        try {
            for (w.s(); !(b = w.n()).done;) {
                var x = b.value;
                s.appendChild(_a(x, {
                    mediaActive: v && !1 !== x.mediaActive,
                    wrappersLabel: i.length ? i.join(" ") : null
                }))
            }
        } catch (e) {
            w.e(e)
        } finally {
            w.f()
        }
        return s
    }

    function _a(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
            n = document.createElement("div");
        n.className = "css-rule", Zr.set(n, e.ruleRef), sa.set(n, {
            inline: !!e.ruleRef.inline || !0 === e.inline,
            inheritedDepth: "number" == typeof e.inheritedDepth ? e.inheritedDepth : 0,
            readOnly: !!e.readOnly,
            state: e.state || null,
            states: Array.isArray(e.states) ? e.states : e.state ? [e.state] : [],
            activeNow: !1 !== e.activeNow,
            pseudoElement: e.pseudoElement || null,
            mediaActive: !1 !== t.mediaActive,
            scopeDepth: e.scopeDepth || 0,
            specificity: "number" == typeof e.specificity ? e.specificity : 0,
            sourceIndex: "number" == typeof e.sourceIndex ? e.sourceIndex : null != e.ruleRef.own ? lo(e.ruleRef.own) : 0,
            layerRank: "number" == typeof e.layerRank ? e.layerRank : -1,
            cascadeUnknown: !0 === e.cascadeUnknown,
            sourceName: e.source && e.source.name || null,
            wrappersLabel: t.wrappersLabel || null
        });
        var r = document.createElement("div");
        r.className = "css-rule-selector";
        var a = document.createElement("span");
        a.className = "css-rule-selector-main";
        var o = document.createElement("span");
        if (o.className = "css-rule-selector-text", o.textContent = e.selector, a.appendChild(o), a.appendChild(document.createTextNode(" {")), r.appendChild(a), e.source && e.source.name) {
            var c = document.createElement("span");
            if (c.className = "css-rule-source", c.textContent = e.source.line ? "".concat(e.source.name, ":").concat(e.source.line) : e.source.name, e.source.full) {
                c.title = e.source.full, c.classList.add("is-link");
                var s = e.source.full;
                c.addEventListener("click", (function() {
                    i.tabsCreate({
                        url: s,
                        active: !0
                    }).catch((function() {}))
                }))
            }
            r.appendChild(c)
        }
        if (e.readOnly) {
            var l = document.createElement("span");
            l.className = "css-rule-badge", l.textContent = "read-only", r.appendChild(l)
        }
        n.appendChild(r), e.readOnly || e.selectorReadOnly || e.ruleRef.inline || (o.dataset.committed = e.selector, Zr.set(o, e.ruleRef), o.addEventListener("mousedown", (function(e) {
            o.isContentEditable || (e.preventDefault(), function(e) {
                if (e.isContentEditable) return;
                e.contentEditable = "plaintext-only", e.spellcheck = !1, e.classList.add("is-editing"), e.focus();
                var t = document.createRange();
                t.selectNodeContents(e);
                var n = window.getSelection();
                n.removeAllRanges(), n.addRange(t)
            }(o))
        })), o.addEventListener("beforeinput", (function(e) {
            var t = e.inputType || "";
            "insertParagraph" !== t && "insertLineBreak" !== t || (e.preventDefault(), o.blur())
        })), o.addEventListener("keydown", (function(e) {
            "Escape" === e.key && (e.preventDefault(), o.textContent = o.dataset.committed || "", o.blur())
        })), o.addEventListener("blur", (function() {
            return function(e) {
                if (!e.isContentEditable) return;
                e.contentEditable = "false", e.classList.remove("is-editing");
                var t = Zr.get(e);
                if (!t) return;
                var n = (e.textContent || "").trim(),
                    r = e.dataset.committed || "";
                if (!n) return void(e.textContent = r);
                if (n === r) return;
                var a = e.closest(".css-rule");
                Ca({
                    action: "rule_selector_edit",
                    ref: t,
                    selector: n
                }).then((function(e) {
                    if (e && e.success) {
                        e.ruleRef && Object.assign(t, e.ruleRef);
                        var n = a ? sa.get(a) : null;
                        n && ("number" == typeof e.specificity && (n.specificity = e.specificity), n.state = e.state || null, n.states = Array.isArray(e.states) ? e.states : e.state ? [e.state] : [], n.activeNow = !1 !== e.activeNow, n.pseudoElement = e.pseudoElement || null)
                    }
                    to()
                })).catch((function() {})), t.selector = n, e.dataset.committed = n, e.textContent = n
            }(o)
        })));
        var u = document.createElement("div");
        u.className = "css-decls";
        var d, p = Fr(yo(e.declsText || ""));
        try {
            for (p.s(); !(d = p.n()).done;) {
                var m = Hr(d.value, 2),
                    f = m[0],
                    h = m[1];
                u.appendChild(Ta(n, f, h, !e.readOnly))
            }
        } catch (e) {
            p.e(e)
        } finally {
            p.f()
        }
        n.appendChild(u);
        var v = document.createElement("div");
        return v.className = "css-rule-close", v.textContent = "}", n.appendChild(v), e.readOnly || n.addEventListener("mousedown", (function(e) {
            var t = e.target,
                o = t.closest ? t.closest(".decl-row") : null;
            o && t === o ? (e.preventDefault(), $a(n, u, o.nextElementSibling)) : t === r || t === a ? (e.preventDefault(), $a(n, u, u.firstElementChild)) : t !== u && t !== v || (e.preventDefault(), Sa(n))
        })), n
    }

    function Ta(e, t, n, r) {
        var a = document.createElement("div");
        if (a.className = "decl-row", r) {
            var o = document.createElement("input");
            o.type = "checkbox", o.className = "decl-toggle", o.checked = !0, o.addEventListener("change", (function() {
                a.classList.toggle("is-disabled", !o.checked), Da(e)
            })), a.appendChild(o)
        }
        var i = document.createElement("span");
        i.className = "decl-prop", i.textContent = t, i.dataset.raw = t;
        var c = document.createElement("span");
        if (c.className = "decl-value", c.dataset.raw = n, c.innerHTML = Dt(Mn(n)), a.appendChild(i), a.appendChild(document.createTextNode(": ")), a.appendChild(c), a.appendChild(document.createTextNode(";")), r)
            for (var s = function() {
                    var t = u[l];
                    t.addEventListener("mousedown", (function(n) {
                        t.isContentEditable || (n.preventDefault(), Ia(t, e))
                    })), t.addEventListener("keydown", (function(t) {
                        return ja(t, e)
                    })), t.addEventListener("input", (function() {
                        return Ba(t, e)
                    })), t.addEventListener("blur", (function() {
                        return Pa(t, e)
                    })), t.addEventListener("paste", (function(n) {
                        return Aa(n, t, e)
                    }))
                }, l = 0, u = [i, c]; l < u.length; l++) s();
        return a
    }

    function Sa(e) {
        $a(e, e.querySelector(".css-decls"), null)
    }

    function $a(e, t, n) {
        var r = t && t.classList.contains("css-decls") ? t : e.querySelector(".css-decls");
        if (r) {
            var a = Ta(e, "", "", !0);
            n && n.parentElement === r ? r.insertBefore(a, n) : r.appendChild(a), Ia(a.querySelector(".decl-prop"), e)
        }
    }

    function Aa(e, t, n) {
        if (t.isContentEditable) {
            var r = e.clipboardData && e.clipboardData.getData("text/plain") || "";
            if (r) {
                var a = t.closest(".decl-row.is-scratch");
                if (a) ! function(e, t, n, r) {
                    var a = !la.has(n),
                        o = t.classList.contains("decl-prop"),
                        i = Ma(r),
                        c = Oa(i);
                    if (o) {
                        if (!a || 0 === c.length) return;
                        e.preventDefault(), Ra(t);
                        var s = oa && oa.row === n ? oa : null;
                        s && (oa = null, Qa(s)), n.remove();
                        var l, u = Fr(c);
                        try {
                            for (u.s(); !(l = u.n()).done;) {
                                var d = l.value;
                                Ja(d.prop, d.value)
                            }
                        } catch (e) {
                            u.e(e)
                        } finally {
                            u.f()
                        }
                        return to(), void Va()
                    }
                    if (i.length < 2) return;
                    var p = Oa(i.slice(1));
                    if (0 === p.length) return;
                    e.preventDefault(), t.textContent = i[0].trim(), Ya(n, t), Pa(t, null);
                    var m, f = Fr(p);
                    try {
                        for (f.s(); !(m = f.n()).done;) {
                            var h = m.value;
                            Ja(h.prop, h.value)
                        }
                    } catch (e) {
                        f.e(e)
                    } finally {
                        f.f()
                    }
                    to()
                }(e, t, a, r);
                else {
                    var o, i = t.classList.contains("decl-prop"),
                        c = Ma(r),
                        s = Oa(c),
                        l = null;
                    if (i) {
                        if (0 === s.length) return;
                        o = s
                    } else {
                        if (c.length < 2) return;
                        var u = Oa(c.slice(1));
                        if (0 === u.length) return;
                        l = c[0].trim(), o = u
                    }
                    e.preventDefault();
                    var d = t.closest(".decl-row");
                    if (d) {
                        var p = d.parentElement,
                            m = d.querySelector(".decl-prop"),
                            f = d.querySelector(".decl-value");
                        if (Ra(t), i) {
                            var h = o.shift();
                            m.dataset.raw = h.prop, m.textContent = h.prop, f.dataset.raw = h.value, f.innerHTML = Dt(Mn(h.value))
                        } else f.dataset.raw = l, f.innerHTML = Dt(Mn(l));
                        var v, g = d.nextElementSibling,
                            y = d,
                            b = Fr(o);
                        try {
                            for (b.s(); !(v = b.n()).done;) {
                                var w = v.value,
                                    x = Ta(n, w.prop, w.value, !0);
                                p.insertBefore(x, g), y = x
                            }
                        } catch (e) {
                            b.e(e)
                        } finally {
                            b.f()
                        }
                        Da(n), $a(n, p, y.nextElementSibling)
                    }
                }
            }
        }
    }

    function Ma(e) {
        var t = String(e).replace(/\/\*[\s\S]*?\*\//g, ""),
            n = t.indexOf("{");
        if (-1 !== n) {
            var r = t.lastIndexOf("}");
            t = r > n ? t.slice(n + 1, r) : t.slice(n + 1)
        }
        for (var a = [], o = 0, i = null, c = 0, s = 0; s < t.length; s++) {
            var l = t[s];
            i ? l === i && (i = null) : '"' === l || "'" === l ? i = l : "(" === l ? o++ : ")" === l ? o = Math.max(0, o - 1) : ";" === l && 0 === o && (a.push(t.slice(c, s)), c = s + 1)
        }
        return a.push(t.slice(c)), a.filter((function(e) {
            return e.trim().length > 0
        }))
    }

    function Oa(e) {
        var t, n = [],
            r = Fr(e);
        try {
            for (r.s(); !(t = r.n()).done;) {
                var a = t.value,
                    o = a.indexOf(":");
                if (!(o <= 0)) {
                    var i = a.slice(0, o).trim(),
                        c = a.slice(o + 1).trim();
                    i && c && /^(--[\w-]+|[A-Za-z-]+)$/.test(i) && n.push({
                        prop: i,
                        value: c
                    })
                }
            }
        } catch (e) {
            r.e(e)
        } finally {
            r.f()
        }
        return n
    }

    function Ia(e, t) {
        if (!e.isContentEditable) {
            e.dataset.committed = e.dataset.raw || "", e.textContent = e.dataset.raw || "", e.contentEditable = "plaintext-only", e.spellcheck = !1, e.classList.add("is-editing"), e.focus();
            var n = document.createRange();
            n.selectNodeContents(e);
            var r = window.getSelection();
            r.removeAllRanges(), r.addRange(n), uo(e, t)
        }
    }

    function Ra(e) {
        e.contentEditable = "false", e.classList.remove("is-editing"), ho()
    }

    function ja(e, t) {
        var n = e.currentTarget;
        if (n.isContentEditable) {
            if (vo()) switch (e.key) {
                case "ArrowDown":
                    return e.preventDefault(), void go(1);
                case "ArrowUp":
                    return e.preventDefault(), void go(-1);
                case "Enter":
                case "Tab":
                    return e.preventDefault(), void po(n, t);
                case "Escape":
                    return e.preventDefault(), void ho()
            }
            if ("ArrowUp" !== e.key && "ArrowDown" !== e.key || !n.classList.contains("decl-value") || ! function(e, t) {
                    var n = e.textContent || "";
                    if (!n) return !1;
                    var r = function(e) {
                        var t = window.getSelection();
                        if (!t || 0 === t.rangeCount) return null;
                        var n = t.getRangeAt(0);
                        if (!e.contains(n.startContainer) || !e.contains(n.endContainer)) return null;
                        var r = n.cloneRange();
                        r.selectNodeContents(e), r.setEnd(n.startContainer, n.startOffset);
                        var a = r.toString().length;
                        return {
                            start: a,
                            end: a + n.toString().length
                        }
                    }(e);
                    if (!r) return !1;
                    var a = function(e) {
                            var t, n = [],
                                r = /"(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?|\burl\(\s*[^)]*\)?/gi;
                            for (; t = r.exec(e);) n.push([t.index, t.index + t[0].length]);
                            var a, o = [],
                                i = /-?\d*\.?\d+/g,
                                c = function() {
                                    var t = a.index,
                                        r = a[0];
                                    if (r.startsWith("-")) {
                                        var i = t > 0 ? e[t - 1] : "";
                                        if (i && !/[\s,(:]/.test(i)) {
                                            if (/[a-zA-Z_-]/.test(i)) return 0;
                                            t += 1, r = r.slice(1)
                                        }
                                    }
                                    var c = t > 0 ? e[t - 1] : "";
                                    return /[\w#.]/.test(c) || n.some((function(e) {
                                        var n = Hr(e, 2),
                                            r = n[0],
                                            a = n[1];
                                        return t >= r && t < a
                                    })) ? 0 : void o.push({
                                        start: t,
                                        end: t + r.length,
                                        text: r
                                    })
                                };
                            for (; a = i.exec(e);) c();
                            return o
                        }(n),
                        o = a.find((function(e) {
                            return e.end >= r.start && e.start <= r.end
                        }));
                    if (!o) return !1;
                    var i = t.altKey ? .1 : t.shiftKey ? 10 : 1,
                        c = "ArrowUp" === t.key ? 1 : -1,
                        s = Number.parseFloat(o.text);
                    if (!Number.isFinite(s)) return !1;
                    var l = Math.max((d = o.text, p = d.indexOf("."), p < 0 ? 0 : d.length - p - 1), t.altKey ? 1 : 0),
                        u = (s + c * i).toFixed(l);
                    var d, p;
                    u.includes(".") && (u = u.replace(/\.?0+$/, ""));
                    "-0" === u && (u = "0");
                    return e.textContent = n.slice(0, o.start) + u + n.slice(o.end),
                        function(e, t, n) {
                            var r = e.ownerDocument,
                                a = function(t) {
                                    for (var n = r.createTreeWalker(e, NodeFilter.SHOW_TEXT), a = n.nextNode(), o = t; a;) {
                                        var i = a.textContent.length;
                                        if (o <= i) return {
                                            node: a,
                                            offset: o
                                        };
                                        o -= i, a = n.nextNode()
                                    }
                                    return null
                                },
                                o = a(t),
                                i = a(n),
                                c = r.createRange();
                            o && i ? (c.setStart(o.node, o.offset), c.setEnd(i.node, i.offset)) : (c.selectNodeContents(e), c.collapse(!1));
                            var s = window.getSelection();
                            s.removeAllRanges(), s.addRange(c)
                        }(e, o.start, o.start + u.length), !0
                }(n, e)) {
                if ("Enter" === e.key) e.preventDefault(), Pa(n, t, n.classList.contains("decl-prop") ? "value" : "insert");
                else if ("Tab" === e.key) e.preventDefault(), Pa(n, t, n.classList.contains("decl-prop") ? "value" : "next");
                else if ("Escape" === e.key) e.preventDefault(), n.textContent = n.dataset.committed || "", Pa(n, t);
                else if (":" === e.key && n.classList.contains("decl-prop")) e.preventDefault(), Pa(n, t, "value");
                else if (";" === e.key && n.classList.contains("decl-value")) {
                    var r = n.textContent || "";
                    bo(n) === r.length && function(e) {
                        var t, n = 0,
                            r = null,
                            a = Fr(e);
                        try {
                            for (a.s(); !(t = a.n()).done;) {
                                var o = t.value;
                                r ? o === r && (r = null) : '"' === o || "'" === o ? r = o : "(" === o ? n++ : ")" === o && (n = Math.max(0, n - 1))
                            }
                        } catch (e) {
                            a.e(e)
                        } finally {
                            a.f()
                        }
                        return !r && 0 === n
                    }(r) && (e.preventDefault(), Pa(n, t, "next"))
                }
            } else {
                e.preventDefault(), ho();
                var a = n.closest(".decl-row.is-scratch");
                a ? Ya(a, n) : t && Ua(t)
            }
        }
    }

    function Ba(e, t) {
        if (e.isContentEditable) {
            var n = e.closest(".decl-row.is-scratch");
            if (n) return e.classList.contains("decl-value") && Ya(n, e), void uo(e, t);
            e.classList.contains("decl-value") && Ua(t), uo(e, t)
        }
    }

    function Pa(e, t) {
        var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null;
        if (e.isContentEditable) {
            var r = e.closest(".decl-row.is-scratch");
            if (r) ! function(e, t, n) {
                var r = !la.has(t),
                    a = oa && oa.row === t ? oa : null,
                    o = (e.textContent || "").trim();
                if (e.dataset.raw = o, Ra(e), r) {
                    var i = t.querySelector(".decl-prop"),
                        c = t.querySelector(".decl-value"),
                        s = (i.dataset.raw || "").trim(),
                        l = (c.dataset.raw || "").trim();
                    if ("value" === n && s) return void Ia(c, null);
                    if (a && (oa = null), s && l) {
                        if (!ia.has(ca(s))) {
                            for (var u = t.previousElementSibling; u && !la.has(u);) u = u.previousElementSibling;
                            var d = u ? la.get(u) : null;
                            d && ia.has(ca(d.prop)) && ia.set(ca(s), ia.get(ca(d.prop)) + .5)
                        }
                        if (a && a.targetRow && a.targetRow.isConnected) {
                            var p = a.targetRow.querySelector(".decl-value");
                            p.dataset.raw = Xa(a, l), p.innerHTML = Dt(Mn(p.dataset.raw)), Da(ea)
                        } else Ja(s, l);
                        if (t.remove(), to(), "insert" === n || "next" === n) {
                            var m, f = null,
                                h = Fr(ra ? ra.querySelectorAll(".decl-row") : []);
                            try {
                                for (h.s(); !(m = h.n()).done;) {
                                    var v = m.value,
                                        g = la.get(v);
                                    if (g && ca(g.prop) === ca(s) && !g.meta.pseudoElement) {
                                        f = v;
                                        break
                                    }
                                }
                            } catch (e) {
                                h.e(e)
                            } finally {
                                h.f()
                            }
                            Va(f)
                        }
                    } else a && Qa(a), t.remove(), e.blur(), to();
                    return
                }
                var y = t.querySelector(".decl-value");
                if (!a) return void(y.innerHTML = Dt(Mn(y.dataset.raw || "")));
                if (oa = null, !o || o === a.original) return y.dataset.raw = a.original, y.innerHTML = Dt(Mn(a.original)), Qa(a), e.blur(), void to();
                Ka(a, o), to(), ("insert" === n || "next" === n) && Va()
            }(e, r, n);
            else {
                var a = e.closest(".decl-row"),
                    o = a ? a.parentElement : null,
                    i = a ? a.nextElementSibling : null,
                    c = (e.textContent || "").trim();
                e.dataset.raw = c, Ra(e);
                var s = !1;
                if (a) {
                    var l = a.querySelector(".decl-value"),
                        u = (a.querySelector(".decl-prop").dataset.raw || "").trim(),
                        d = (l.dataset.raw || "").trim();
                    a.classList.contains("is-disabled") || d || u && "value" === n ? l.isContentEditable || (l.innerHTML = Dt(Mn(l.dataset.raw || ""))) : (a.remove(), s = !0)
                }
                Da(t), s ? e.blur() : "value" === n && a ? Ia(a.querySelector(".decl-value"), t) : "insert" === n ? $a(t, o, i) : "next" === n && (i && i.classList.contains("decl-row") ? Ia(i.querySelector(".decl-prop"), t) : $a(t, o, i))
            }
        }
    }

    function Da(e) {
        if (e && e.isConnected) {
            var t = Zr.get(e);
            if (t) {
                var n, r = [],
                    a = Fr(e.querySelectorAll(".decl-row"));
                try {
                    for (a.s(); !(n = a.n()).done;) {
                        var o = n.value;
                        if (!o.classList.contains("is-disabled")) {
                            var i = o.querySelector(".decl-prop"),
                                c = o.querySelector(".decl-value"),
                                s = (i.isContentEditable ? i.textContent : i.dataset.raw || "").trim(),
                                l = (c.isContentEditable ? c.textContent : c.dataset.raw || "").trim();
                            s && l && r.push("".concat(s, ": ").concat(l, ";"))
                        }
                    }
                } catch (e) {
                    a.e(e)
                } finally {
                    a.f()
                }
                var u = r.join(" ");
                Ca({
                    action: t.inline ? "inline_style_edit" : "rule_edit",
                    ref: t,
                    declsText: u
                }).catch((function() {})), to()
            }
        }
    }

    function Ua(e) {
        var t = Qr.get(e);
        t && clearTimeout(t);
        var n = setTimeout((function() {
            Qr.delete(e), Da(e)
        }), 120);
        Qr.set(e, n)
    }

    function Ha() {
        var e, t = Fr(Qr.values());
        try {
            for (t.s(); !(e = t.n()).done;) {
                var n = e.value;
                clearTimeout(n)
            }
        } catch (e) {
            t.e(e)
        } finally {
            t.f()
        }
        Qr.clear()
    }

    function Fa() {
        var e;
        return e = Br().mark((function e(t, n) {
            var r, a, o, i, c, s = arguments;
            return Br().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (r = !(s.length > 2 && void 0 !== s[2]) || s[2], Yr) {
                            e.next = 3;
                            break
                        }
                        return e.abrupt("return");
                    case 3:
                        return a = Yr + (Jr || ""), o = null, e.prev = 5, e.next = 8, Ca({
                            action: "rule_add",
                            selector: a,
                            wrappers: n,
                            scopePath: Kr
                        });
                    case 8:
                        o = e.sent, e.next = 13;
                        break;
                    case 11:
                        e.prev = 11, e.t0 = e.catch(5);
                    case 13:
                        if (o && o.success && null != o.ownId) {
                            e.next = 15;
                            break
                        }
                        return e.abrupt("return");
                    case 15:
                        i = _a({
                            ruleRef: {
                                own: o.ownId
                            },
                            selector: a,
                            declsText: "",
                            readOnly: !1,
                            selectorReadOnly: !1,
                            source: {
                                name: "screen-ruler",
                                line: null,
                                full: null
                            },
                            state: o.state || null,
                            states: Array.isArray(o.states) ? o.states : o.state ? [o.state] : [],
                            activeNow: !1 !== o.activeNow,
                            pseudoElement: o.pseudoElement || null,
                            specificity: "number" == typeof o.specificity ? o.specificity : 0,
                            sourceIndex: "number" == typeof o.sourceIndex ? o.sourceIndex : lo(o.ownId),
                            cascadeUnknown: !0 === o.cascadeUnknown
                        }, {
                            mediaActive: r,
                            wrappersLabel: n.length ? n.join(" ") : null
                        }), (c = t.firstElementChild) && c.nextElementSibling === ea && (c = ea), t.insertBefore(i, c ? c.nextSibling : null), i.scrollIntoView({
                            block: "nearest"
                        }), Sa(i);
                    case 21:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [5, 11]
            ])
        })), Fa = function() {
            var t = this,
                n = arguments;
            return new Promise((function(r, a) {
                var o = e.apply(t, n);

                function i(e) {
                    Ur(o, r, a, i, c, "next", e)
                }

                function c(e) {
                    Ur(o, r, a, i, c, "throw", e)
                }
                i(void 0)
            }))
        }, Fa.apply(this, arguments)
    }

    function Ga(e) {
        var t, n = e.currentTarget,
            r = null === (t = n.closest(".scratch-card")) || void 0 === t ? void 0 : t.classList.contains("is-pseudo"),
            a = e.target,
            o = a.closest ? a.closest(".decl-row") : null;
        if (o && a === o) {
            var i = la.get(o);
            if (!i) return void e.preventDefault();
            if (i.meta.pseudoElement) return void(o.classList.contains("is-readonly") || (e.preventDefault(), za(o)));
            if (o.classList.contains("is-readonly")) return;
            return e.preventDefault(), void Va(o)
        }
        r || a !== n && !a.classList.contains("css-decls") || (e.preventDefault(), Va())
    }

    function qa(e) {
        var t = document.createElement("div");
        t.className = "scratch-card";
        var n = document.createElement("div");
        n.className = "css-rule is-scratch-body";
        var r = document.createElement("div");
        r.className = "css-decls", n.appendChild(r), n.addEventListener("mousedown", Ga), t.appendChild(n);
        var a = document.createElement("div");
        a.className = "code-block-footer";
        var o = document.createElement("span");
        return o.className = "footer-label", o.textContent = e, a.appendChild(o), t.appendChild(a), {
            card: t,
            decls: r
        }
    }

    function Wa(e) {
        var t = document.createElement("div");
        t.className = "decl-row is-scratch", la.set(t, e);
        var n = document.createElement("span");
        n.className = "decl-prop", n.textContent = e.prop, n.dataset.raw = e.prop;
        var r = document.createElement("span");
        if (r.className = "decl-value", r.dataset.raw = e.value, r.innerHTML = Dt(Mn(e.value)), t.appendChild(n), t.appendChild(document.createTextNode(": ")), t.appendChild(r), t.appendChild(document.createTextNode(";")), e.meta.state) {
            var a = document.createElement("span");
            a.className = "css-rule-badge", a.textContent = e.meta.state, t.appendChild(a)
        }
        var o = "".concat(e.selectorText).concat(e.meta.sourceName ? " (".concat(e.meta.sourceName, ")") : "");
        return t.title = e.meta.inline ? "element.style" : e.meta.wrappersLabel ? "".concat(e.meta.wrappersLabel, " · ").concat(o) : o, (e.meta.state || e.meta.pseudoElement) && e.meta.readOnly ? (t.classList.add("is-readonly"), t.addEventListener("mousedown", (function(t) {
            t.preventDefault(),
                function(e) {
                    if (!e || !e.isConnected) return;
                    e.scrollIntoView({
                        block: "center",
                        behavior: "smooth"
                    }), e.classList.remove("is-flash"), e.offsetWidth, e.classList.add("is-flash"), e.addEventListener("animationend", (function() {
                        return e.classList.remove("is-flash")
                    }), {
                        once: !0
                    })
                }(e.block)
        })), t) : (n.addEventListener("mousedown", (function(e) {
            r.isContentEditable || (e.preventDefault(), za(t))
        })), r.addEventListener("mousedown", (function(e) {
            r.isContentEditable || (e.preventDefault(), za(t))
        })), r.addEventListener("keydown", (function(e) {
            return ja(e, null)
        })), r.addEventListener("input", (function() {
            return Ba(r, null)
        })), r.addEventListener("blur", (function() {
            return Pa(r, null)
        })), r.addEventListener("paste", (function(e) {
            return Aa(e, r, null)
        })), t)
    }

    function Va() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null;
        if (ra) {
            var t = document.createElement("div");
            t.className = "decl-row is-scratch";
            var n = document.createElement("span");
            n.className = "decl-prop", n.dataset.raw = "";
            var r = document.createElement("span");
            r.className = "decl-value", r.dataset.raw = "", t.appendChild(n), t.appendChild(document.createTextNode(": ")), t.appendChild(r), t.appendChild(document.createTextNode(";"));
            for (var a = function() {
                    var e = i[o];
                    e.addEventListener("mousedown", (function(t) {
                        if (!e.isContentEditable) {
                            t.preventDefault();
                            var a = e === n ? r : n;
                            a.isContentEditable && (a.dataset.raw = (a.textContent || "").trim(), Ra(a)), Ia(e, null)
                        }
                    })), e.addEventListener("keydown", (function(e) {
                        return ja(e, null)
                    })), e.addEventListener("input", (function() {
                        return Ba(e, null)
                    })), e.addEventListener("blur", (function() {
                        return Pa(e, null)
                    })), e.addEventListener("paste", (function(t) {
                        return Aa(t, e, null)
                    }))
                }, o = 0, i = [n, r]; o < i.length; o++) a();
            e && e.parentElement === ra ? ra.insertBefore(t, e.nextSibling) : ra.appendChild(t), Ia(n, null)
        }
    }

    function za(e) {
        var t = la.get(e);
        if (t) {
            var n = e.querySelector(".decl-value");
            n.isContentEditable || (Ia(n, null), oa = {
                kind: t.meta.inline || t.meta.state || t.meta.pseudoElement ? "owner" : "override",
                row: e,
                entry: t,
                original: n.dataset.raw || "",
                ownerValuePrev: null,
                targetRow: null,
                targetProp: null,
                targetPrev: null,
                createdRow: null
            })
        }
    }

    function Ya(e, t) {
        var n = la.get(e),
            r = (t.textContent || "").trim();
        if (n) {
            if (!oa || oa.row !== e) return;
            Ka(oa, r, null, !0)
        } else {
            var a = ((e.querySelector(".decl-prop") || {}).dataset || {}).raw || "";
            a.trim() && (oa && oa.row === e || (oa = {
                kind: "new",
                row: e,
                entry: null,
                original: "",
                ownerValuePrev: null,
                targetRow: null,
                targetProp: null,
                targetPrev: null,
                createdRow: null
            }), Ka(oa, r, a.trim(), !0))
        }
    }

    function Ka(e, t) {
        var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : null,
            r = arguments.length > 3 && void 0 !== arguments[3] && arguments[3];
        if ("owner" === e.kind) {
            var a = e.entry.row.querySelector(".decl-value");
            if (!a || a.isContentEditable) return;
            return null == e.ownerValuePrev && (e.ownerValuePrev = a.dataset.raw || ""), a.dataset.raw = t, a.innerHTML = Dt(Mn(t)), void(r ? Ua(e.entry.block) : Da(e.entry.block))
        }
        if (ea) {
            var o = "new" === e.kind ? n : e.entry.prop;
            if (o) {
                var i = Xa(e, t);
                if (function(e, t) {
                        if (e.targetRow && e.targetProp === t && e.targetRow.isConnected) return;
                        e.targetRow && e.targetProp !== t && Za(e);
                        var n = eo(t);
                        if (n) e.targetRow = n, e.targetPrev = n.querySelector(".decl-value").dataset.raw || "";
                        else {
                            var r = ea.querySelector(".css-decls"),
                                a = Ta(ea, t, "", !0);
                            r.appendChild(a), e.targetRow = a, e.createdRow = a, e.targetPrev = null
                        }
                        e.targetProp = t
                    }(e, o), e.targetRow) {
                    var c = e.targetRow.querySelector(".decl-value");
                    c.dataset.raw = i, c.isContentEditable || (c.innerHTML = Dt(Mn(i))), r ? Ua(ea) : Da(ea)
                }
            }
        }
    }

    function Xa(e, t) {
        return "override" === e.kind && e.entry.important && t && !/!\s*important\s*$/i.test(t) ? "".concat(t, " !important") : t
    }

    function Za(e) {
        if (e.createdRow && e.createdRow.isConnected) e.createdRow.remove();
        else if (e.targetRow && e.targetRow.isConnected && null != e.targetPrev) {
            var t = e.targetRow.querySelector(".decl-value");
            t.dataset.raw = e.targetPrev, t.isContentEditable || (t.innerHTML = Dt(Mn(e.targetPrev)))
        }
        e.targetRow = null, e.targetProp = null, e.targetPrev = null, e.createdRow = null
    }

    function Qa(e) {
        if ("owner" !== e.kind)(e.targetRow || e.createdRow) && (Za(e), Da(ea));
        else if (null != e.ownerValuePrev) {
            var t = e.entry.row.querySelector(".decl-value");
            t && !t.isContentEditable && (t.dataset.raw = e.ownerValuePrev, t.innerHTML = Dt(Mn(e.ownerValuePrev)), Da(e.entry.block))
        }
    }

    function Ja(e, t) {
        if (ea) {
            var n = eo(e);
            if (n) {
                var r = n.querySelector(".decl-value");
                r.dataset.raw = t, r.isContentEditable || (r.innerHTML = Dt(Mn(t)))
            } else {
                ea.querySelector(".css-decls").appendChild(Ta(ea, e, t, !0))
            }
            Da(ea)
        }
    }

    function eo(e) {
        if (!ea) return null;
        var t, n = e.startsWith("--") ? e : e.toLowerCase(),
            r = Fr(ea.querySelectorAll(".decl-row"));
        try {
            for (r.s(); !(t = r.n()).done;) {
                var a = t.value;
                if (!a.classList.contains("is-disabled")) {
                    var o = a.querySelector(".decl-prop");
                    if (o) {
                        var i = (o.dataset.raw || "").trim();
                        if ((i.startsWith("--") ? i : i.toLowerCase()) === n) return a
                    }
                }
            }
        } catch (e) {
            r.e(e)
        } finally {
            r.f()
        }
        return null
    }

    function to() {
        var e = document.getElementById("edit_css-sections");
        if (e) {
            var t, n = Fr(e.querySelectorAll(".decl-row.is-overridden, .decl-row.is-not-inherited, .decl-row.is-ghost"));
            try {
                for (n.s(); !(t = n.n()).done;) {
                    var r = t.value,
                        a = r.classList.contains("is-scratch");
                    r.classList.remove("is-overridden"), r.classList.remove("is-not-inherited"), r.classList.remove("is-ghost"), a || r.removeAttribute("title")
                }
            } catch (e) {
                n.e(e)
            } finally {
                n.f()
            }
            var o, i = function(e) {
                    var t, n = [],
                        r = Fr(e.querySelectorAll(".css-rule"));
                    try {
                        for (r.s(); !(t = r.n()).done;) {
                            var a = t.value,
                                o = sa.get(a);
                            if (o && o.mediaActive && !o.cascadeUnknown) {
                                var i = a.querySelector(".css-rule-selector-text"),
                                    c = o.inline ? "element.style" : i ? i.textContent : "";
                                if (o.states && o.states.length) {
                                    if (!Jr || !o.states.includes(Jr)) continue
                                } else if (!o.inline && !1 === o.activeNow) continue;
                                var s, l = Fr(a.querySelectorAll(".decl-row"));
                                try {
                                    for (l.s(); !(s = l.n()).done;) {
                                        var u = s.value,
                                            d = u.querySelector(".decl-prop"),
                                            p = u.querySelector(".decl-value");
                                        if (d && p) {
                                            var m = ((d.isContentEditable ? d.textContent : d.dataset.raw) || "").trim(),
                                                f = ((p.isContentEditable ? p.textContent : p.dataset.raw) || "").trim();
                                            if (m && f) {
                                                var h = co(m, f),
                                                    v = so(m, f),
                                                    g = v.longhands.length ? v.longhands : h ? [m.toLowerCase()] : null;
                                                g && ((o.inheritedDepth || 0) > 0 && !h && !g.some((function(e) {
                                                    return "all" === e || ro(e, ma)
                                                })) ? (u.classList.add("is-not-inherited"), u.title = chrome.i18n.getMessage("TITLE_NOT_INHERITED") || "Not inherited by this element") : u.classList.contains("is-disabled") || n.push({
                                                    block: a,
                                                    row: u,
                                                    meta: o,
                                                    prop: m,
                                                    value: f,
                                                    selectorText: c,
                                                    invalid: h,
                                                    important: v.important,
                                                    longhands: g,
                                                    sitOut: !h && 1 === g.length && "all" === g[0]
                                                }))
                                            }
                                        }
                                    }
                                } catch (e) {
                                    l.e(e)
                                } finally {
                                    l.f()
                                }
                            }
                        }
                    } catch (e) {
                        r.e(e)
                    } finally {
                        r.f()
                    }
                    return n
                }(e),
                c = i.filter((function(e) {
                    return !e.invalid && !e.sitOut
                })),
                s = new Map,
                l = Fr(c);
            try {
                for (l.s(); !(o = l.n()).done;) {
                    var u = o.value,
                        d = u.meta.inheritedDepth || 0,
                        p = s.get(d);
                    p || s.set(d, p = []), p.push(u)
                }
            } catch (e) {
                l.e(e)
            } finally {
                l.f()
            }
            var m, f = Dr(s.keys()).sort((function(e, t) {
                    return e - t
                })).map((function(e) {
                    return {
                        depth: e,
                        entries: s.get(e)
                    }
                })),
                h = function(e) {
                    var t, n = function(e) {
                            var t = String(e.value || "").replace(/!\s*important\s*$/i, "").trim().toLowerCase();
                            return "inherit" === t || "unset" === t || "revert" === t || "revert-layer" === t || t.includes("var(")
                        },
                        r = new Map,
                        a = new Map,
                        o = new Set,
                        i = Fr(e);
                    try {
                        for (i.s(); !(t = i.n()).done;) {
                            var c = t.value;
                            if (0 !== c.depth) {
                                var s, l = [],
                                    u = Fr(c.entries);
                                try {
                                    for (u.s(); !(s = u.n()).done;) {
                                        var d = s.value,
                                            p = d.longhands.filter((function(e) {
                                                return !o.has(e) && ro(e, ma)
                                            }));
                                        p.length && l.push({
                                            entry: Vr(Vr({}, d), {}, {
                                                longhands: p
                                            }),
                                            source: d
                                        })
                                    }
                                } catch (e) {
                                    u.e(e)
                                } finally {
                                    u.f()
                                }
                                if (l.length) {
                                    var m = ao(l.map((function(e) {
                                        return e.entry
                                    }))).get("");
                                    if (m) {
                                        var f, h = new Map(l.map((function(e) {
                                                return [e.entry, e.source]
                                            }))),
                                            v = Fr(m);
                                        try {
                                            for (v.s(); !(f = v.n()).done;) {
                                                var g = Hr(f.value, 2),
                                                    y = g[0],
                                                    b = g[1],
                                                    w = h.get(b) || b,
                                                    x = a.get(y);
                                                x || a.set(y, x = []), x.push(w), n(w) || o.add(y)
                                            }
                                        } catch (e) {
                                            v.e(e)
                                        } finally {
                                            v.f()
                                        }
                                    }
                                }
                            } else {
                                var E = (r = ao(c.entries)).get("");
                                if (E) {
                                    var C, L = Fr(E);
                                    try {
                                        for (L.s(); !(C = L.n()).done;) {
                                            var N = Hr(C.value, 2),
                                                k = N[0],
                                                _ = N[1];
                                            a.set(k, [_]), n(_) || o.add(k)
                                        }
                                    } catch (e) {
                                        L.e(e)
                                    } finally {
                                        L.f()
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        i.e(e)
                    } finally {
                        i.f()
                    }
                    return {
                        winnersByTarget: r,
                        baseWinners: a
                    }
                }(f),
                v = h.winnersByTarget,
                g = h.baseWinners,
                y = Fr(i);
            try {
                var b = function() {
                    var e = m.value;
                    if (e.invalid || e.sitOut) return 0;
                    if (0 === (e.meta.inheritedDepth || 0)) {
                        var t = v.get(e.meta.pseudoElement || "");
                        if (!t) return 0;
                        if (e.longhands.some((function(n) {
                                return t.get(n) === e
                            }))) return 0;
                        e.row.classList.add("is-overridden");
                        var n = t.get(e.longhands[0]),
                            r = n ? oo(n) : "";
                        return r && (e.row.title = chrome.i18n.getMessage("TITLE_OVERRIDDEN_BY", [r]) || "Overridden by ".concat(r)), 0
                    }
                    var a = e.longhands.filter((function(e) {
                        return ro(e, ma)
                    }));
                    if (a.some((function(t) {
                            return (g.get(t) || []).includes(e)
                        }))) return 0;
                    e.row.classList.add("is-overridden");
                    var o = g.get(a[0] || e.longhands[0]),
                        i = o && o[0],
                        c = i ? oo(i) : "";
                    c && (e.row.title = chrome.i18n.getMessage("TITLE_OVERRIDDEN_BY", [c]) || "Overridden by ".concat(c))
                };
                for (y.s(); !(m = y.n()).done;) b()
            } catch (e) {
                y.e(e)
            } finally {
                y.f()
            }
            var w, x = Fr(e.querySelectorAll(".decl-row"));
            try {
                for (x.s(); !(w = x.n()).done;) {
                    var E = w.value;
                    if (!E.querySelector(".is-editing") && (!oa || !(oa.targetRow === E || oa.entry && oa.entry.row === E))) {
                        var C = E.querySelector(".decl-prop"),
                            L = E.querySelector(".decl-value");
                        if (C && L) {
                            var N = (C.dataset.raw || "").trim(),
                                k = (L.dataset.raw || "").trim(),
                                _ = N && k ? co(N, k) : "",
                                T = E.classList.contains("is-invalid-prop") || E.classList.contains("is-invalid-value");
                            E.classList.toggle("is-invalid-prop", "property" === _), E.classList.toggle("is-invalid-value", "value" === _), "property" === _ ? E.title = chrome.i18n.getMessage("TITLE_INVALID_PROPERTY") || "Unknown property" : "value" === _ ? E.title = chrome.i18n.getMessage("TITLE_INVALID_VALUE") || "Invalid value" : T && !E.classList.contains("is-overridden") && E.removeAttribute("title")
                        }
                    }
                }
            } catch (e) {
                x.e(e)
            } finally {
                x.f()
            }! function(e, t) {
                if (!ra || !aa) return;
                if (oa || aa.querySelector(".is-editing")) return;
                ra.replaceChildren();
                var n, r = function(e, t) {
                        return e.prop.localeCompare(t.prop)
                    },
                    a = function(e) {
                        return t.get(e) || new Map
                    },
                    o = function(t) {
                        var n = a(t);
                        return e.filter((function(e) {
                            return (e.meta.pseudoElement || "") === t && (e.longhands.some((function(t) {
                                return n.get(t) === e
                            })) || e.invalid && e.meta.inline && !t)
                        })).sort(r)
                    },
                    i = o(""),
                    c = i.filter((function(e) {
                        return ia.has(ca(e.prop))
                    })).sort((function(e, t) {
                        return ia.get(ca(e.prop)) - ia.get(ca(t.prop))
                    })),
                    s = i.filter((function(e) {
                        return !ia.has(ca(e.prop))
                    })),
                    l = [].concat(Dr(c), Dr(s)),
                    u = ia.size ? Math.max.apply(Math, Dr(ia.values())) + 1 : 0,
                    d = Fr(s);
                try {
                    for (d.s(); !(n = d.n()).done;) {
                        var p = n.value;
                        ia.has(ca(p.prop)) || ia.set(ca(p.prop), u++)
                    }
                } catch (e) {
                    d.e(e)
                } finally {
                    d.f()
                }
                var m, f = Fr(l);
                try {
                    for (f.s(); !(m = f.n()).done;) {
                        var h = m.value,
                            v = Wa(h);
                        h.invalid && (v.classList.add("property" === h.invalid ? "is-invalid-prop" : "is-invalid-value"), v.title = chrome.i18n.getMessage("property" === h.invalid ? "TITLE_INVALID_PROPERTY" : "TITLE_INVALID_VALUE") || ("property" === h.invalid ? "Unknown property" : "Invalid value")), ra.appendChild(v)
                    }
                } catch (e) {
                    f.e(e)
                } finally {
                    f.f()
                }
                var g, y = Fr(aa.querySelectorAll(".scratch-card.is-pseudo"));
                try {
                    for (y.s(); !(g = y.n()).done;) {
                        g.value.remove()
                    }
                } catch (e) {
                    y.e(e)
                } finally {
                    y.f()
                }
                var b, w = function(e) {
                        var t = e.replace(/^:+/, "");
                        return "before" === t ? 0 : "after" === t ? 1 : 2
                    },
                    x = Dr(t.keys()).filter((function(e) {
                        return e
                    })).sort((function(e, t) {
                        return w(e) - w(t) || e.localeCompare(t)
                    })),
                    E = 0,
                    C = Fr(x);
                try {
                    for (C.s(); !(b = C.n()).done;) {
                        var L = b.value,
                            N = o(L);
                        if (N.length) {
                            var k = qa(L.replace(/^:+/, ":")),
                                _ = k.card,
                                T = k.decls;
                            _.classList.add("is-pseudo");
                            var S, $ = Fr(N);
                            try {
                                for ($.s(); !(S = $.n()).done;) {
                                    var A = S.value;
                                    T.appendChild(Wa(A))
                                }
                            } catch (e) {
                                $.e(e)
                            } finally {
                                $.f()
                            }
                            aa.appendChild(_), E++
                        }
                    }
                } catch (e) {
                    C.e(e)
                } finally {
                    C.f()
                }
                var M = !!ra.childElementCount,
                    O = ra.closest(".scratch-card");
                O && O.classList.toggle("hidden", !M);
                aa.classList.toggle("hidden", !M && !E)
            }(i.filter((function(e) {
                return !(e.meta.inheritedDepth > 0)
            })), v),
            function(e, t) {
                var n = ++ta;
                if (document.hidden || oa || Jr) return;
                var r = document.getElementById("edit_css-sections");
                if (!r || r.querySelector(".is-editing")) return;
                var a, o = /:(hover|active|focus-within|focus-visible|focus)/,
                    i = !1,
                    c = Fr(r.querySelectorAll(".css-rule"));
                try {
                    for (c.s(); !(a = c.n()).done;) {
                        var s = a.value,
                            l = sa.get(s);
                        if (l) {
                            if (l.cascadeUnknown) return;
                            if (l.states && l.states.length && (i = !0), !i) {
                                var u = s.querySelector(".css-rule-selector-text");
                                u && o.test(u.textContent) && (i = !0)
                            }
                        }
                    }
                } catch (e) {
                    c.e(e)
                } finally {
                    c.f()
                }
                var d = t.get("");
                if (!d) return;
                var p, m = [],
                    f = [],
                    h = Fr(e);
                try {
                    var v = function() {
                        var e = p.value;
                        if (e.meta.pseudoElement) return 0;
                        if (e.meta.states && e.meta.states.length) return 0;
                        if ((e.meta.inheritedDepth || 0) > 0) return 0;
                        if (o.test(e.selectorText)) return 0;
                        var t = e.longhands.filter((function(t) {
                            return d.get(t) === e
                        }));
                        if (!t.length) return 0;
                        m.push({
                            id: m.length,
                            prop: e.prop,
                            value: e.value.replace(/\s*!\s*important\s*$/i, ""),
                            longhands: t
                        }), f.push(e)
                    };
                    for (h.s(); !(p = h.n()).done;) v()
                } catch (e) {
                    h.e(e)
                } finally {
                    h.f()
                }
                if (!m.length) return;
                requestAnimationFrame((function() {
                    n !== ta || document.hidden || Ca({
                        action: "cascade_ghost_probe",
                        declarations: m,
                        paySeq: pa,
                        stateSensitive: i
                    }).then((function(e) {
                        n === ta && e && e.success && Array.isArray(e.flagged) && function(e) {
                            var t, n = (na > 0 ? chrome.i18n.getMessage("TITLE_OVERRIDDEN_HIDDEN_GRANT") : chrome.i18n.getMessage("TITLE_OVERRIDDEN_HIDDEN")) || "Overridden by a stylesheet Bo doi can't see",
                                r = new Set(e),
                                a = Fr(e);
                            try {
                                for (a.s(); !(t = a.n()).done;) {
                                    var o = t.value;
                                    o.row.isConnected && (o.row.classList.add("is-ghost"), o.row.title = n)
                                }
                            } catch (e) {
                                a.e(e)
                            } finally {
                                a.f()
                            }
                            if (!ra) return;
                            var i, c = Fr(ra.querySelectorAll(".decl-row"));
                            try {
                                for (c.s(); !(i = c.n()).done;) {
                                    var s = i.value,
                                        l = la.get(s);
                                    l && r.has(l) && s.classList.add("is-ghost")
                                }
                            } catch (e) {
                                c.e(e)
                            } finally {
                                c.f()
                            }
                        }(e.flagged.map((function(e) {
                            return f[e]
                        })).filter(Boolean))
                    })).catch((function() {}))
                }))
            }(c, v)
        }
    }
    document.addEventListener("scroll", (function(e) {
        if (!vo()) return;
        if (fa.contains(e.target)) return;
        if (Date.now() - Ea < 150) return void fo();
        ho()
    }), !0);
    var no = new Set(["color", "line-height", "letter-spacing", "word-spacing", "text-align", "text-align-last", "text-indent", "text-transform", "text-shadow", "text-rendering", "white-space-collapse", "text-wrap-mode", "text-wrap-style", "text-emphasis-style", "text-emphasis-color", "text-emphasis-position", "word-break", "line-break", "overflow-wrap", "hyphens", "tab-size", "visibility", "cursor", "direction", "writing-mode", "text-orientation", "quotes", "orphans", "widows", "list-style-type", "list-style-position", "list-style-image", "caption-side", "border-collapse", "empty-cells", "-webkit-border-horizontal-spacing", "-webkit-border-vertical-spacing", "color-scheme", "accent-color", "caret-color", "pointer-events", "image-rendering", "paint-order", "scrollbar-color", "text-underline-offset", "text-underline-position", "text-decoration-skip-ink", "-webkit-text-stroke-width", "-webkit-text-stroke-color", "-webkit-text-fill-color", "math-depth", "math-style", "print-color-adjust", "forced-color-adjust", "ruby-align", "ruby-position"]);

    function ro(e, t) {
        return e.startsWith("--") ? !(t && !1 === t.get(e)) : e.startsWith("font-") || no.has(e)
    }

    function ao(e) {
        var t, n = Number.MAX_SAFE_INTEGER,
            r = new Map,
            a = function(e) {
                var t, n, a, o = (t = e.meta.pseudoElement || "", (n = r.get(t)) || (n = new Map, r.set(t, n)), n),
                    i = Fr(e.longhands);
                try {
                    for (i.s(); !(a = i.n()).done;) {
                        var c = a.value;
                        o.set(c, e)
                    }
                } catch (e) {
                    i.e(e)
                } finally {
                    i.f()
                }
            },
            o = function(e) {
                return "number" == typeof e.meta.layerRank ? e.meta.layerRank : -1
            },
            i = function(e) {
                return o(e) < 0 ? n : o(e)
            },
            c = function(e) {
                return o(e) < 0 ? -1 : n - o(e)
            },
            s = function(e) {
                return e.meta.scopeDepth || 0
            },
            l = function(e) {
                return e.meta.inline ? 1 : 0
            },
            u = e.filter((function(e) {
                return e.meta.inline
            })),
            d = e.filter((function(e) {
                return !e.meta.state
            })),
            p = e.filter((function(e) {
                return e.meta.state
            })).sort((function(e, t) {
                return e.meta.specificity - t.meta.specificity || e.meta.sourceIndex - t.meta.sourceIndex
            })),
            m = Fr(Dr(d).sort((function(e, t) {
                return s(t) - s(e) || l(e) - l(t) || i(e) - i(t) || e.meta.specificity - t.meta.specificity || e.meta.sourceIndex - t.meta.sourceIndex
            })));
        try {
            for (m.s(); !(t = m.n()).done;) {
                var f = t.value;
                f.important || a(f)
            }
        } catch (e) {
            m.e(e)
        } finally {
            m.f()
        }
        var h, v = Fr(Dr(d).sort((function(e, t) {
            return s(e) - s(t) || l(e) - l(t) || c(e) - c(t) || e.meta.specificity - t.meta.specificity || e.meta.sourceIndex - t.meta.sourceIndex
        })));
        try {
            for (v.s(); !(h = v.n()).done;) {
                var g = h.value;
                g.important && a(g)
            }
        } catch (e) {
            v.e(e)
        } finally {
            v.f()
        }
        var y, b = Fr(p);
        try {
            for (b.s(); !(y = b.n()).done;) {
                var w = y.value;
                w.important || a(w)
            }
        } catch (e) {
            b.e(e)
        } finally {
            b.f()
        }
        var x, E = Fr(p);
        try {
            for (E.s(); !(x = E.n()).done;) {
                var C = x.value;
                C.important && a(C)
            }
        } catch (e) {
            E.e(e)
        } finally {
            E.f()
        }
        var L, N = Fr(u);
        try {
            for (N.s(); !(L = N.n()).done;) {
                var k = L.value;
                k.important && k.meta.state && a(k)
            }
        } catch (e) {
            N.e(e)
        } finally {
            N.f()
        }
        return r
    }

    function oo(e) {
        return e.meta.inline ? "element.style" : e.selectorText
    }
    var io = new Map;

    function co(e, t) {
        if (e.startsWith("--")) return "";
        var n = "".concat(e, "\0").concat(t),
            r = io.get(n);
        if (null != r) return r;
        var a = t.replace(/!\s*important\s*$/i, "").trim(),
            o = "";
        return CSS.supports(e, "initial") ? a && CSS.supports(e, a) || (o = "value") : o = "property", io.size > 2e3 && io.clear(), io.set(n, o), o
    }

    function so(e, t) {
        var n = "".concat(e, "\0").concat(t),
            r = ua.get(n);
        if (r) return r;
        var a, o = !1,
            i = t,
            c = t.match(/^([\s\S]*?)\s*!\s*important\s*$/i);
        if (c && (o = !0, i = c[1]), e.startsWith("--")) a = [e];
        else {
            da.style.cssText = "";
            try {
                da.style.setProperty(e.toLowerCase(), i)
            } catch (e) {}(a = Array.from(da.style)).length || (a = CSS.supports(e.toLowerCase(), "initial") ? [] : [e.toLowerCase()])
        }
        var s = {
            longhands: a,
            important: o
        };
        return ua.size > 2e3 && ua.clear(), ua.set(n, s), s
    }

    function lo(e) {
        var t = Number.parseInt(String(e).replace(/\D+/g, ""), 10);
        return 1e9 + (Number.isFinite(t) ? t : 0)
    }

    function uo(e, t) {
        var n = e.classList.contains("decl-prop"),
            r = e.textContent || "",
            a = bo(e);
        if (null == a) return ho();
        var o = r.slice(0, a),
            i = null;
        if (n) {
            var c = o.match(/[-a-zA-Z]*$/);
            i = {
                kind: "property",
                token: c[0],
                start: a - c[0].length,
                end: a,
                items: Vn(Wn(), c[0])
            }
        } else {
            var s = o.match(/var\(\s*([-\w]*)$/);
            if (s) i = {
                kind: "var",
                token: s[1],
                start: a - s[1].length,
                end: a,
                items: Vn(Xr, s[1])
            };
            else {
                var l, u = o.match(/[-a-zA-Z]*$/),
                    d = e.closest(".decl-row"),
                    p = d ? (d.querySelector(".decl-prop").dataset.raw || "").trim().toLowerCase() : "",
                    m = Dr(mn[p] || []),
                    f = Fr(pn);
                try {
                    for (f.s(); !(l = f.n()).done;) {
                        var h = l.value;
                        m.includes(h) || m.push(h)
                    }
                } catch (e) {
                    f.e(e)
                } finally {
                    f.f()
                }
                i = {
                    kind: "value",
                    token: u[0],
                    start: a - u[0].length,
                    end: a,
                    items: Vn(m, u[0])
                }
            }
        }
        var v = i.token.toLowerCase();
        return v || "var" === i.kind ? !i.items.length || 1 === i.items.length && i.items[0].toLowerCase() === v ? ho() : (ga = e, ha = i.items, ya = v, ba = i.kind, wa = i.start, xa = i.end, va = 0, function() {
            if (fa) return fa;
            var e = document.createElement("div");
            e.className = "css-autocomplete", e.addEventListener("mousedown", (function(e) {
                e.preventDefault();
                var t = e.target.closest(".css-autocomplete-item");
                if (t) {
                    va = Number(t.dataset.index);
                    var n = ga,
                        r = n ? n.closest(".css-rule") : null;
                    po(n, r)
                }
            })), document.body.appendChild(e), fa = e
        }(), mo(), fa.classList.add("is-open"), Ea = Date.now(), void fo()) : ho()
    }

    function po(e, t) {
        if (e && ha.length) {
            var n = ha[va >= 0 ? va : 0],
                r = e.textContent || "",
                a = n;
            "var" !== ba || r.slice(xa).startsWith(")") || (a = "".concat(n, ")"));
            var o = r.slice(0, wa) + a + r.slice(xa);
            if (e.textContent = o, function(e, t) {
                    var n = e.ownerDocument,
                        r = n.createRange(),
                        a = n.createTreeWalker(e, NodeFilter.SHOW_TEXT),
                        o = a.nextNode(),
                        i = t;
                    for (; o;) {
                        var c = o.textContent.length;
                        if (i <= c) {
                            r.setStart(o, i), r.collapse(!0);
                            var s = window.getSelection();
                            return s.removeAllRanges(), void s.addRange(r)
                        }
                        i -= c, o = a.nextNode()
                    }
                    r.selectNodeContents(e), r.collapse(!1);
                    var l = window.getSelection();
                    l.removeAllRanges(), l.addRange(r)
                }(e, wa + a.length), ho(), "property" === ba || e.classList.contains("decl-prop")) Pa(e, t, "value");
            else {
                var i = e.closest(".decl-row.is-scratch");
                i ? Ya(i, e) : t && Ua(t)
            }
        }
    }

    function mo() {
        fa.replaceChildren(), ha.forEach((function(e, t) {
            var n = document.createElement("div");
            n.className = "css-autocomplete-item".concat(t === va ? " is-active" : ""), n.dataset.index = String(t);
            var r = ya ? e.toLowerCase().indexOf(ya) : -1;
            if (r < 0) n.textContent = e;
            else {
                r > 0 && n.appendChild(document.createTextNode(e.slice(0, r)));
                var a = document.createElement("span");
                a.className = "css-autocomplete-match", a.textContent = e.slice(r, r + ya.length), n.appendChild(a);
                var o = e.slice(r + ya.length);
                o && n.appendChild(document.createTextNode(o))
            }
            fa.appendChild(n)
        }))
    }

    function fo() {
        var e = window.getSelection();
        if (e && 0 !== e.rangeCount) {
            var t = e.getRangeAt(0).getBoundingClientRect();
            t.width || t.height || t.top || t.left || !ga || (t = ga.getBoundingClientRect());
            var n = fa.offsetWidth,
                r = fa.offsetHeight,
                a = t.bottom + 2;
            a + r > window.innerHeight - 4 && (a = t.top - r - 2);
            var o = Math.max(4, Math.min(t.left, window.innerWidth - n - 4));
            fa.style.left = "".concat(o, "px"), fa.style.top = "".concat(Math.max(4, a), "px")
        }
    }

    function ho() {
        fa && fa.classList.remove("is-open"), ha = [], va = -1, ga = null
    }

    function vo() {
        return fa && fa.classList.contains("is-open") && ha.length > 0
    }

    function go(e) {
        var t;
        ha.length && (va = Math.max(0, Math.min(va + e, ha.length - 1)), mo(), null === (t = fa.querySelector(".css-autocomplete-item.is-active")) || void 0 === t || t.scrollIntoView({
            block: "center"
        }))
    }

    function yo(e) {
        var t, n = [],
            r = Fr(Ma(String(e || "").replace(/\/\*[\s\S]*?\*\//g, "")));
        try {
            for (r.s(); !(t = r.n()).done;) {
                var a = t.value,
                    o = a.indexOf(":");
                if (!(o < 0)) {
                    var i = a.slice(0, o).trim().toLowerCase(),
                        c = a.slice(o + 1).trim();
                    i && c && n.push([i, c])
                }
            }
        } catch (e) {
            r.e(e)
        } finally {
            r.f()
        }
        return n
    }

    function bo(e) {
        var t = window.getSelection();
        if (!t || 0 === t.rangeCount) return null;
        var n = t.getRangeAt(0);
        if (!e.contains(n.endContainer)) return null;
        var r = n.cloneRange();
        return r.selectNodeContents(e), r.setEnd(n.endContainer, n.endOffset), r.toString().length
    }

    function wo(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t && (r = r.filter((function(t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable
            }))), n.push.apply(n, r)
        }
        return n
    }

    function xo(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2 ? wo(Object(n), !0).forEach((function(t) {
                Eo(e, t, n[t])
            })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : wo(Object(n)).forEach((function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
            }))
        }
        return e
    }

    function Eo(e, t, n) {
        return (t = function(e) {
            var t = function(e, t) {
                if ("object" != So(e) || !e) return e;
                var n = e[Symbol.toPrimitive];
                if (void 0 !== n) {
                    var r = n.call(e, t || "default");
                    if ("object" != So(r)) return r;
                    throw new TypeError("@@toPrimitive must return a primitive value.")
                }
                return ("string" === t ? String : Number)(e)
            }(e, "string");
            return "symbol" == So(t) ? t : t + ""
        }(t)) in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = n, e
    }

    function Co(e) {
        return function(e) {
            if (Array.isArray(e)) return _o(e)
        }(e) || function(e) {
            if ("undefined" != typeof Symbol && null != e[Symbol.iterator] || null != e["@@iterator"]) return Array.from(e)
        }(e) || ko(e) || function() {
            throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function Lo(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var n = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != n) {
                var r, a, o, i, c = [],
                    s = !0,
                    l = !1;
                try {
                    if (o = (n = n.call(e)).next, 0 === t) {
                        if (Object(n) !== n) return;
                        s = !1
                    } else
                        for (; !(s = (r = o.call(n)).done) && (c.push(r.value), c.length !== t); s = !0);
                } catch (e) {
                    l = !0, a = e
                } finally {
                    try {
                        if (!s && null != n.return && (i = n.return(), Object(i) !== i)) return
                    } finally {
                        if (l) throw a
                    }
                }
                return c
            }
        }(e, t) || ko(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function No(e, t) {
        var n = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
        if (!n) {
            if (Array.isArray(e) || (n = ko(e)) || t && e && "number" == typeof e.length) {
                n && (e = n);
                var r = 0,
                    a = function() {};
                return {
                    s: a,
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
                    f: a
                }
            }
            throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }
        var o, i = !0,
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
                c = !0, o = e
            },
            f: function() {
                try {
                    i || null == n.return || n.return()
                } finally {
                    if (c) throw o
                }
            }
        }
    }

    function ko(e, t) {
        if (e) {
            if ("string" == typeof e) return _o(e, t);
            var n = {}.toString.call(e).slice(8, -1);
            return "Object" === n && e.constructor && (n = e.constructor.name), "Map" === n || "Set" === n ? Array.from(e) : "Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n) ? _o(e, t) : void 0
        }
    }

    function _o(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
        return r
    }

    function To() {
        To = function() {
            return t
        };
        var e, t = {},
            n = Object.prototype,
            r = n.hasOwnProperty,
            a = Object.defineProperty || function(e, t, n) {
                e[t] = n.value
            },
            o = "function" == typeof Symbol ? Symbol : {},
            i = o.iterator || "@@iterator",
            c = o.asyncIterator || "@@asyncIterator",
            s = o.toStringTag || "@@toStringTag";

        function l(e, t, n) {
            return Object.defineProperty(e, t, {
                value: n,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            l({}, "")
        } catch (e) {
            l = function(e, t, n) {
                return e[t] = n
            }
        }

        function u(e, t, n, r) {
            var o = t && t.prototype instanceof g ? t : g,
                i = Object.create(o.prototype),
                c = new $(r || []);
            return a(i, "_invoke", {
                value: k(e, n, c)
            }), i
        }

        function d(e, t, n) {
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
        t.wrap = u;
        var p = "suspendedStart",
            m = "suspendedYield",
            f = "executing",
            h = "completed",
            v = {};

        function g() {}

        function y() {}

        function b() {}
        var w = {};
        l(w, i, (function() {
            return this
        }));
        var x = Object.getPrototypeOf,
            E = x && x(x(A([])));
        E && E !== n && r.call(E, i) && (w = E);
        var C = b.prototype = g.prototype = Object.create(w);

        function L(e) {
            ["next", "throw", "return"].forEach((function(t) {
                l(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function N(e, t) {
            function n(a, o, i, c) {
                var s = d(e[a], e, o);
                if ("throw" !== s.type) {
                    var l = s.arg,
                        u = l.value;
                    return u && "object" == So(u) && r.call(u, "__await") ? t.resolve(u.__await).then((function(e) {
                        n("next", e, i, c)
                    }), (function(e) {
                        n("throw", e, i, c)
                    })) : t.resolve(u).then((function(e) {
                        l.value = e, i(l)
                    }), (function(e) {
                        return n("throw", e, i, c)
                    }))
                }
                c(s.arg)
            }
            var o;
            a(this, "_invoke", {
                value: function(e, r) {
                    function a() {
                        return new t((function(t, a) {
                            n(e, r, t, a)
                        }))
                    }
                    return o = o ? o.then(a, a) : a()
                }
            })
        }

        function k(t, n, r) {
            var a = p;
            return function(o, i) {
                if (a === f) throw Error("Generator is already running");
                if (a === h) {
                    if ("throw" === o) throw i;
                    return {
                        value: e,
                        done: !0
                    }
                }
                for (r.method = o, r.arg = i;;) {
                    var c = r.delegate;
                    if (c) {
                        var s = _(c, r);
                        if (s) {
                            if (s === v) continue;
                            return s
                        }
                    }
                    if ("next" === r.method) r.sent = r._sent = r.arg;
                    else if ("throw" === r.method) {
                        if (a === p) throw a = h, r.arg;
                        r.dispatchException(r.arg)
                    } else "return" === r.method && r.abrupt("return", r.arg);
                    a = f;
                    var l = d(t, n, r);
                    if ("normal" === l.type) {
                        if (a = r.done ? h : m, l.arg === v) continue;
                        return {
                            value: l.arg,
                            done: r.done
                        }
                    }
                    "throw" === l.type && (a = h, r.method = "throw", r.arg = l.arg)
                }
            }
        }

        function _(t, n) {
            var r = n.method,
                a = t.iterator[r];
            if (a === e) return n.delegate = null, "throw" === r && t.iterator.return && (n.method = "return", n.arg = e, _(t, n), "throw" === n.method) || "return" !== r && (n.method = "throw", n.arg = new TypeError("The iterator does not provide a '" + r + "' method")), v;
            var o = d(a, t.iterator, n.arg);
            if ("throw" === o.type) return n.method = "throw", n.arg = o.arg, n.delegate = null, v;
            var i = o.arg;
            return i ? i.done ? (n[t.resultName] = i.value, n.next = t.nextLoc, "return" !== n.method && (n.method = "next", n.arg = e), n.delegate = null, v) : i : (n.method = "throw", n.arg = new TypeError("iterator result is not an object"), n.delegate = null, v)
        }

        function T(e) {
            var t = {
                tryLoc: e[0]
            };
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
        }

        function S(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t
        }

        function $(e) {
            this.tryEntries = [{
                tryLoc: "root"
            }], e.forEach(T, this), this.reset(!0)
        }

        function A(t) {
            if (t || "" === t) {
                var n = t[i];
                if (n) return n.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var a = -1,
                        o = function n() {
                            for (; ++a < t.length;)
                                if (r.call(t, a)) return n.value = t[a], n.done = !1, n;
                            return n.value = e, n.done = !0, n
                        };
                    return o.next = o
                }
            }
            throw new TypeError(So(t) + " is not iterable")
        }
        return y.prototype = b, a(C, "constructor", {
            value: b,
            configurable: !0
        }), a(b, "constructor", {
            value: y,
            configurable: !0
        }), y.displayName = l(b, s, "GeneratorFunction"), t.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === y || "GeneratorFunction" === (t.displayName || t.name))
        }, t.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, b) : (e.__proto__ = b, l(e, s, "GeneratorFunction")), e.prototype = Object.create(C), e
        }, t.awrap = function(e) {
            return {
                __await: e
            }
        }, L(N.prototype), l(N.prototype, c, (function() {
            return this
        })), t.AsyncIterator = N, t.async = function(e, n, r, a, o) {
            void 0 === o && (o = Promise);
            var i = new N(u(e, n, r, a), o);
            return t.isGeneratorFunction(n) ? i : i.next().then((function(e) {
                return e.done ? e.value : i.next()
            }))
        }, L(C), l(C, s, "Generator"), l(C, i, (function() {
            return this
        })), l(C, "toString", (function() {
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
        }, t.values = A, $.prototype = {
            constructor: $,
            reset: function(t) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = e, this.done = !1, this.delegate = null, this.method = "next", this.arg = e, this.tryEntries.forEach(S), !t)
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

                function a(r, a) {
                    return c.type = "throw", c.arg = t, n.next = r, a && (n.method = "next", n.arg = e), !!a
                }
                for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                    var i = this.tryEntries[o],
                        c = i.completion;
                    if ("root" === i.tryLoc) return a("end");
                    if (i.tryLoc <= this.prev) {
                        var s = r.call(i, "catchLoc"),
                            l = r.call(i, "finallyLoc");
                        if (s && l) {
                            if (this.prev < i.catchLoc) return a(i.catchLoc, !0);
                            if (this.prev < i.finallyLoc) return a(i.finallyLoc)
                        } else if (s) {
                            if (this.prev < i.catchLoc) return a(i.catchLoc, !0)
                        } else {
                            if (!l) throw Error("try statement without catch or finally");
                            if (this.prev < i.finallyLoc) return a(i.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var a = this.tryEntries[n];
                    if (a.tryLoc <= this.prev && r.call(a, "finallyLoc") && this.prev < a.finallyLoc) {
                        var o = a;
                        break
                    }
                }
                o && ("break" === e || "continue" === e) && o.tryLoc <= t && t <= o.finallyLoc && (o = null);
                var i = o ? o.completion : {};
                return i.type = e, i.arg = t, o ? (this.method = "next", this.next = o.finallyLoc, v) : this.complete(i)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), v
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), S(n), v
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.tryLoc === e) {
                        var r = n.completion;
                        if ("throw" === r.type) {
                            var a = r.arg;
                            S(n)
                        }
                        return a
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(t, n, r) {
                return this.delegate = {
                    iterator: A(t),
                    resultName: n,
                    nextLoc: r
                }, "next" === this.method && (this.arg = e), v
            }
        }, t
    }

    function So(e) {
        return So = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, So(e)
    }

    function $o(e, t, n, r, a, o, i) {
        try {
            var c = e[o](i),
                s = c.value
        } catch (e) {
            return void n(e)
        }
        c.done ? t(s) : Promise.resolve(s).then(r, a)
    }

    function Ao(e) {
        return function() {
            var t = this,
                n = arguments;
            return new Promise((function(r, a) {
                var o = e.apply(t, n);

                function i(e) {
                    $o(o, r, a, i, c, "next", e)
                }

                function c(e) {
                    $o(o, r, a, i, c, "throw", e)
                }
                i(void 0)
            }))
        }
    }
    document.addEventListener("DOMContentLoaded", (function() {
        return Ni.apply(this, arguments)
    })), window.addEventListener("load", (function() {
        document.body.style.opacity = "1"
    })), window.addEventListener("beforeunload", (function() {
        qo && i.sendOptionalMessageToTab(qo, {
            target: "script",
            action: "side_panel_closed"
        })
    })), window.addEventListener("resize", (function() {
        Mc(document.querySelector(".assets-justified-container"))
    })), document.addEventListener("visibilitychange", (function() {
        Zo = "visible" === document.visibilityState, Ti()
    })), chrome.runtime.onMessage.addListener((function(e, t, n) {
        var r, a, o, c, s, l, u, d, p, m, f, h, v, g;
        if ("side_panel" !== e.target) return;
        if (Yo) return;
        switch (e.action) {
            case "ping":
                return void n({
                    success: !0,
                    isOpen: !0
                });
            case "tab_specific_ping":
                return Zo && qo && (null === (r = t.tab) || void 0 === r ? void 0 : r.id) === qo && n({
                    success: !0,
                    isOpen: !0
                }), !1;
            case "responsive_mode_ready":
                if (_i(null === (a = t.tab) || void 0 === a ? void 0 : a.id)) {
                    if (Ko) try {
                        Ko.disconnect()
                    } catch (e) {}(Ko = chrome.tabs.connect(qo, {
                        name: "sidepanel_".concat(Date.now())
                    })).onDisconnect.addListener((function() {
                        Ko = null
                    }))
                }
                return;
            case "close":
                if (Wo && e.tabId && e.tabId !== qo) return;
                return void window.close();
            case "select_element":
                if (!_i(null === (o = t.tab) || void 0 === o ? void 0 : o.id)) return;
                if (Xo = null !== (c = t.frameId) && void 0 !== c ? c : null, "edit" === e.mode) {
                    if (!ri) return ai = e.editDetails, void(ii = !1);
                    Ei(e.editDetails, !0)
                } else(function(e) {
                    return hc.apply(this, arguments)
                })(e.inspectDetails).then((function() {
                    return Gi()
                })).catch((function(e) {
                    var t = document.getElementById("container");
                    t && !t.childElementCount && Mi()
                })), ri ? Li(e.inspectDetails) : (oi = e.inspectDetails, ii = !0);
                return;
            case "edit_payload_extras":
                return void((null === (s = t.tab) || void 0 === s ? void 0 : s.id) === qo && (null !== (l = t.frameId) && void 0 !== l ? l : null) === Xo && function(e) {
                    var t = document.getElementById("edit_css-sections");
                    if (t && e && e.paySeq === pa) {
                        ma = new Map(e.registeredInherits || []);
                        var n, r = Fr(t.querySelectorAll(".edit-css-section[data-inherited-depth]"));
                        try {
                            for (r.s(); !(n = r.n()).done;) n.value.remove()
                        } catch (e) {
                            r.e(e)
                        } finally {
                            r.f()
                        }
                        var a, o = t.querySelectorAll(".edit-css-section:not(.edit-classes-section)"),
                            i = o.length ? o[o.length - 1] : null,
                            c = Fr(e.inherited || []);
                        try {
                            for (c.s(); !(a = c.n()).done;) {
                                var s = ka(a.value);
                                i && i.nextSibling ? t.insertBefore(s, i.nextSibling) : t.appendChild(s), i = s
                            }
                        } catch (e) {
                            c.e(e)
                        } finally {
                            c.f()
                        }
                        Na(t), to()
                    }
                }(e));
            case "media_activity":
                return void((null === (u = t.tab) || void 0 === u ? void 0 : u.id) === qo && function(e) {
                    var t = document.getElementById("edit_css-sections");
                    if (t && e) {
                        var n = aa ? aa.querySelector(".is-editing") : null;
                        if (n && n.blur(), !oa) {
                            var r, a = !1,
                                o = Fr(t.querySelectorAll(".edit-css-section"));
                            try {
                                for (o.s(); !(r = o.n()).done;) {
                                    var i, c = r.value,
                                        s = c.dataset.wrappers;
                                    if (s && s in e) {
                                        var l = !1 !== e[s];
                                        null === (i = c.querySelector(".edit-css-section-header")) || void 0 === i || i.classList.toggle("greyed", !l);
                                        var u, d = Fr(c.querySelectorAll(".css-rule"));
                                        try {
                                            for (d.s(); !(u = d.n()).done;) {
                                                var p = u.value,
                                                    m = sa.get(p);
                                                m && m.mediaActive !== l && (m.mediaActive = l, a = !0)
                                            }
                                        } catch (e) {
                                            d.e(e)
                                        } finally {
                                            d.f()
                                        }
                                    }
                                }
                            } catch (e) {
                                o.e(e)
                            } finally {
                                o.f()
                            }
                            a && to()
                        }
                    }
                }(e.activity));
            case "page_data":
                var y;
                if (_i(null === (d = t.tab) || void 0 === d ? void 0 : d.id)) null !== (y = e.pageData) && void 0 !== y && y.metadata ? (li = e.pageData.metadata, function(e) {
                    return Xi.apply(this, arguments)
                }(e.pageData.metadata).catch((function(e) {
                    var t = document.getElementById("page-tab");
                    t && !t.childElementCount && Ki()
                }))) : Ki(), yi();
                return;
            case "page_technologies":
                return void(_i(null === (p = t.tab) || void 0 === p ? void 0 : p.id) && function(e) {
                    return Zi.apply(this, arguments)
                }(e.technologies).catch((function(e) {})));
            case "content_script_loaded":
                if (_i(null === (m = t.tab) || void 0 === m ? void 0 : m.id)) {
                    if (Ko) try {
                        Ko.disconnect()
                    } catch (e) {}
                    Ko = chrome.tabs.connect(qo, {
                        name: "sidepanel_".concat(Date.now(), "_").concat(qo)
                    }), Qo = !1, Ao(To().mark((function e() {
                        var t;
                        return To().wrap((function(e) {
                            for (;;) switch (e.prev = e.next) {
                                case 0:
                                    return e.prev = 0, e.next = 3, i.sendMessageToTab(qo, {
                                        target: "script",
                                        action: "side_panel_loaded"
                                    });
                                case 3:
                                    null != (t = e.sent) && t.success && null != t && t.elementSelected || Mi(), Ti(), e.next = 11;
                                    break;
                                case 8:
                                    e.prev = 8, e.t0 = e.catch(0), Mi();
                                case 11:
                                case "end":
                                    return e.stop()
                            }
                        }), e, null, [
                            [0, 8]
                        ])
                    })))()
                }
                return;
            case "page_weight_update":
                return void(_i(null === (f = t.tab) || void 0 === f ? void 0 : f.id) && function(e) {
                    var t = document.getElementById("page-tab");
                    if (!t) return;
                    if ("page" !== ti) return;
                    fi().then((function(n) {
                        var r = !(null == n || !n.success),
                            a = t.querySelector("#pageWeight, .pro-section[data-feature='page-weight']");
                        if (e) {
                            var o = ms(e, r);
                            a ? a.replaceWith(o) : t.appendChild(o)
                        } else a && a.remove()
                    })).catch((function() {}))
                }(e.pageWeight));
            case "update_issues":
                return void(_i(null === (h = t.tab) || void 0 === h ? void 0 : h.id) && function(e) {
                    es.apply(this, arguments)
                }(e.issues));
            case "set_mode":
                return void(_i(null === (v = t.tab) || void 0 === v ? void 0 : v.id) && 0 === (null !== (g = t.frameId) && void 0 !== g ? g : 0) && bi(e.mode));
            case "clear":
                if (Wo && e.tabId && e.tabId !== qo) return;
                return void Mi()
        }
    })), chrome.storage.onChanged.addListener((function(e) {
        e.theme && e.theme.newValue && Hc(e.theme.newValue)
    })), document.addEventListener("keydown", (function(e) {
        if (!qo) return;
        var t = e.target;
        if (t && ("INPUT" === t.tagName || "TEXTAREA" === t.tagName || "SELECT" === t.tagName || t.isContentEditable)) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (!Go.has(e.key)) return;
        e.preventDefault(), i.sendMessageToTab(qo, {
            target: "script",
            action: "keyboard_shortcut",
            key: e.key
        }).catch((function() {}))
    }), !1);
    var Mo = 200,
        Oo = 100,
        Io = 16,
        Ro = 96,
        jo = 120,
        Bo = 8,
        Po = .66,
        Do = 2.5,
        Uo = 3,
        Ho = 128,
        Fo = 400;
    var Go = new Set(["Escape", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]),
        qo = null,
        Wo = !1,
        Vo = "1" === new URLSearchParams(window.location.search).get("detached"),
        zo = null,
        Yo = !1,
        Ko = null,
        Xo = null,
        Zo = !0,
        Qo = !1,
        Jo = !1,
        ei = {},
        ti = "element",
        ni = "tab-1",
        ri = !1,
        ai = null,
        oi = null,
        ii = !1,
        ci = "inspect";
    var si = {
            sectionVisibility: {
                layout: {
                    collapsed: !1
                },
                flexbox: {
                    collapsed: !1
                },
                textContent: {
                    collapsed: !1
                },
                css: {
                    collapsed: !1
                },
                assets: {
                    collapsed: !1
                },
                boxShadow: {
                    collapsed: !1
                },
                gradients: {
                    collapsed: !1
                },
                animations: {
                    collapsed: !1
                },
                transitions: {
                    collapsed: !1
                },
                colors: {
                    collapsed: !1
                },
                typography: {
                    collapsed: !1
                },
                documentOutline: {
                    collapsed: !1
                },
                issues: {
                    collapsed: !1
                },
                ogImage: {
                    collapsed: !1
                },
                metaTags: {
                    collapsed: !1
                },
                technologies: {
                    collapsed: !1
                },
                pageWeight: {
                    collapsed: !1
                },
                socialPreview: {
                    collapsed: !1
                },
                seoIssues: {
                    collapsed: !1
                }
            },
            colorFormat: "HEX",
            codeViewMode: "css",
            socialPreviewType: "facebook"
        },
        li = null,
        ui = 0,
        di = null;

    function fi() {
        return hi.apply(this, arguments)
    }

    function hi() {
        return hi = Ao(To().mark((function e() {
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.abrupt("return", {
                            success: !0,
                            status: "ready",
                            licenseTier: "studio",
                            trial: null
                        });
                    case 2:
                    case "end":
                        return e.stop()
                }
            }), e)
        }))), hi.apply(this, arguments)
    }

    function vi(e, t) {
        for (var n in e) "object" !== So(e[n]) || Array.isArray(e[n]) ? n in t || (t[n] = e[n]) : (t[n] || (t[n] = {}), vi(e[n], t[n]));
        return t
    }

    function gi(e) {
        if (!e) return "";
        try {
            var t = new URL(e);
            if ("http:" !== t.protocol && "https:" !== t.protocol) return e;
            var n = t.host + t.pathname + t.search + t.hash;
            return "/" !== t.pathname || t.search || t.hash || (n = t.host), n
        } catch (t) {
            return e
        }
    }

    function yi() {
        if (ui) {
            var e = ui,
                t = Date.now() - e,
                n = function() {
                    ui === e && (document.querySelectorAll(".refresh-button.refreshing").forEach((function(e) {
                        return e.classList.remove("refreshing")
                    })), ui = 0)
                };
            t >= 600 ? n() : setTimeout(n, 600 - t)
        }
    }

    function bi(e) {
        var t = document.getElementById("edit-view");
        ci = "edit" === e ? "edit" : "inspect", "edit" === e ? (document.querySelectorAll(".tab-content").forEach((function(e) {
            return e.classList.remove("active")
        })), t && t.classList.add("active")) : (t && t.classList.remove("active"), Wi("page" === ti ? "page" : "element"))
    }

    function wi() {
        return xi.apply(this, arguments)
    }

    function xi() {
        return (xi = Ao(To().mark((function e() {
            var t, n;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (t = document.getElementById("edit-view")) {
                            e.next = 3;
                            break
                        }
                        return e.abrupt("return");
                    case 3:
                        return e.prev = 3, e.next = 6, fetch(chrome.runtime.getURL("sidepanel/editor.html"));
                    case 6:
                        return n = e.sent, e.next = 9, n.text();
                    case 9:
                        t.innerHTML = e.sent, t.querySelectorAll(".panel-dock-button").forEach(Ri), hn(Jo, ei, ni, (function(e) {
                            ni = e
                        })), ri = !0, Ci(), e.next = 19;
                        break;
                    case 16:
                        e.prev = 16, e.t0 = e.catch(3);
                    case 19:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [3, 16]
            ])
        })))).apply(this, arguments)
    }

    function Ei(e, t) {
        if (Li(e), t) try {
            La(e), Gi()
        } catch (e) {}
    }

    function Ci() {
        var e = ai,
            t = oi,
            n = ii;
        ai = null, oi = null, ii = !1, e && Ei(e, !0), !t || !n && e || Ei(t, !1)
    }

    function Li(e) {
        var t, n, r, a = document.getElementById("edit-element-name");
        a && e && (a.innerHTML = "", a.appendChild(vc(e.name, e.type, null === (t = e.boxModel) || void 0 === t ? void 0 : t.width, null === (n = e.boxModel) || void 0 === n ? void 0 : n.height, e.availableStates, e.forcedState, null !== (r = e.editCount) && void 0 !== r ? r : 0)))
    }

    function Ni() {
        return (Ni = Ao(To().mark((function e() {
            var t, n, r, a, o;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return d(), (qo = ki()) && (Ko = chrome.tabs.connect(qo, {
                            name: "sidepanel_" + qo
                        })), Vo && (document.documentElement.classList.add("is-detached"), qi()), e.next = 6, Hi();
                    case 6:
                        return e.prev = 6, e.next = 9, i.getPlatformInfo();
                    case 9:
                        t = e.sent, n = t.os, Jo = "mac" === n, e.next = 17;
                        break;
                    case 14:
                        e.prev = 14, e.t0 = e.catch(6), Jo = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
                    case 17:
                        return e.prev = 17, e.next = 20, i.commandsGetAll();
                    case 20:
                        r = e.sent, ei = Object.fromEntries(r.map((function(e) {
                            return [e.name, e.shortcut]
                        }))), e.next = 27;
                        break;
                    case 24:
                        e.prev = 24, e.t1 = e.catch(17), ei = {};
                    case 27:
                        return e.prev = 27, e.next = 30, i.storageLocalGet({
                            theme: "system"
                        });
                    case 30:
                        a = e.sent, Hc(a.theme), e.next = 38;
                        break;
                    case 35:
                        e.prev = 35, e.t2 = e.catch(27), Hc("system");
                    case 38:
                        return e.next = 40, $i();
                    case 40:
                        return e.next = 42, wi();
                    case 42:
                        if ("edit" === ci ? bi("edit") : ti && Wi(ti), !qo) {
                            e.next = 59;
                            break
                        }
                        return e.prev = 44, e.next = 47, new Promise((function(e) {
                            return setTimeout(e, 50)
                        }));
                    case 47:
                        return e.next = 49, i.sendMessageToTab(qo, {
                            target: "script",
                            action: "side_panel_loaded"
                        });
                    case 49:
                        null != (o = e.sent) && o.success && null != o && o.elementSelected || Mi(), Ti(), e.next = 57;
                        break;
                    case 54:
                        e.prev = 54, e.t3 = e.catch(44), Mi();
                    case 57:
                        e.next = 60;
                        break;
                    case 59:
                        Mi();
                    case 60:
                        Si();
                    case 61:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [6, 14],
                [17, 24],
                [27, 35],
                [44, 54]
            ])
        })))).apply(this, arguments)
    }

    function ki() {
        var e = new URLSearchParams(window.location.search),
            t = parseInt(e.get("tabId"), 10);
        if (t) return Wo = !0, t
    }

    function _i(e) {
        return !!e && (e === qo || !Wo && (function(e) {
            if (qo !== e) {
                if (Qo && qo && (i.sendMessageToTab(qo, {
                        target: "script",
                        action: "page_weight_unsubscribe"
                    }).catch((function() {})), Qo = !1), qo = e, li = null, di = null, Ko) try {
                    Ko.disconnect()
                } catch (e) {}(Ko = chrome.tabs.connect(qo, {
                    name: "sidepanel_".concat(Date.now(), "_").concat(qo)
                })).onDisconnect.addListener((function() {
                    Ko = null
                })), Ti(), ji()
            }
        }(e), !0))
    }

    function Ti() {
        var e = Zo && "page" === ti && null !== qo;
        e && !Qo ? (Qo = !0, i.sendMessageToTab(qo, {
            target: "script",
            action: "page_weight_subscribe"
        }).catch((function() {}))) : !e && Qo && (Qo = !1, i.sendMessageToTab(qo, {
            target: "script",
            action: "page_weight_unsubscribe"
        }).catch((function() {})))
    }

    function Si() {
        document.addEventListener("click", (function(e) {
            e.target.closest && e.target.closest(".panel-dock-button") && (e.preventDefault(), e.stopPropagation(), function() {
                Bi.apply(this, arguments)
            }())
        }), !0), document.addEventListener("click", Qi, !1), document.addEventListener("change", nc, !1), document.addEventListener("mouseover", as, !1), document.addEventListener("mouseout", os, !1), document.documentElement.addEventListener("mouseleave", is, !1), document.addEventListener("scroll", cs, !0), chrome.tabs.onUpdated.addListener((function(e, t) {
            e === qo && t.title && qi(), e === qo && "loading" === t.status && (li = null, di = null, t.url && Ki(), i.sendMessageToTab(qo, {
                target: "script",
                action: "refresh_page_data"
            }).catch((function() {})))
        }))
    }

    function $i() {
        return Ai.apply(this, arguments)
    }

    function Ai() {
        return (Ai = Ao(To().mark((function e() {
            var t, n;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, i.storageLocalGet({
                            sidePanelPreferences: si
                        });
                    case 3:
                        return t = e.sent, n = t.sidePanelPreferences, si = vi(si, n), e.next = 8, i.storageLocalSet({
                            sidePanelPreferences: si
                        });
                    case 8:
                        e.next = 13;
                        break;
                    case 10:
                        e.prev = 10, e.t0 = e.catch(0);
                    case 13:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 10]
            ])
        })))).apply(this, arguments)
    }

    function Mi() {
        return Oi.apply(this, arguments)
    }

    function Oi() {
        return Oi = Ao(To().mark((function e() {
            var t, n, r, a, o, i, c, s, l;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        (t = document.getElementById("page-tab")) && !t.childElementCount && Ki(), (n = document.getElementById("container")) && (r = document.createDocumentFragment(), (a = document.createElement("div")).className = "header sticky-top", a.appendChild(Ii()), r.appendChild(a), (o = document.createElement("div")).className = "empty-container", i = document.createElement("div"), (c = document.createElement("div")).className = "empty-icon", c.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M168,132.69,214.08,115l.33-.13A16,16,0,0,0,213,85.07L52.92,32.8A15.95,15.95,0,0,0,32.8,52.92L85.07,213a15.82,15.82,0,0,0,14.41,11l.78,0a15.84,15.84,0,0,0,14.61-9.59l.13-.33L132.69,168,184,219.31a16,16,0,0,0,22.63,0l12.68-12.68a16,16,0,0,0,0-22.63ZM195.31,208,144,156.69a16,16,0,0,0-26,4.93c0,.11-.09.22-.13.32l-17.65,46L48,48l159.85,52.2-45.95,17.64-.32.13a16,16,0,0,0-4.93,26h0L208,195.31Z"></path></svg>', (s = document.createElement("h4")).className = "empty-title greyed", s.innerText = chrome.i18n.getMessage("EMPTY_MESSAGE_INSPECT"), l = Pt([{
                            name: chrome.i18n.getMessage("SHORTCUT_TOGGLE_RULER"),
                            keys: ei._execute_action
                        }, {
                            name: chrome.i18n.getMessage("SHORTCUT_PARENT"),
                            keys: ei.select_parent
                        }, {
                            name: chrome.i18n.getMessage("SHORTCUT_CHILD"),
                            keys: ei.select_child
                        }, {
                            name: chrome.i18n.getMessage("SHORTCUT_TOGGLE_PANEL"),
                            keys: "0"
                        }, {
                            name: chrome.i18n.getMessage("SHORTCUT_DESELECT"),
                            keys: "Esc"
                        }].filter((function(e) {
                            return e.keys
                        }))), i.appendChild(c), i.appendChild(s), i.appendChild(l), o.appendChild(i), r.appendChild(o), n.innerHTML = "", n.appendChild(r));
                    case 4:
                    case "end":
                        return e.stop()
                }
            }), e)
        }))), Oi.apply(this, arguments)
    }

    function Ii() {
        var e = document.createElement("div");
        e.className = "tab-row";
        var t = document.createElement("div");
        t.className = "tab-bar";
        var n = document.createElement("button");
        n.className = "tab-button" + ("page" !== ti ? " active" : ""), n.dataset.tab = "element", n.textContent = chrome.i18n.getMessage("TAB_ELEMENT");
        var r, a = document.createElement("button");
        return a.className = "tab-button" + ("page" === ti ? " active" : ""), a.dataset.tab = "page", a.textContent = chrome.i18n.getMessage("TAB_PAGE"), t.appendChild(n), t.appendChild(a), e.appendChild(t), e.appendChild(((r = document.createElement("button")).className = "panel-dock-button", r.type = "button", Ri(r), r)), e
    }

    function Ri(e) {
        e.innerHTML = Vo ? m : p, e.title = chrome.i18n.getMessage(Vo ? "PANEL_DOCK" : "PANEL_UNDOCK"), e.hidden = !qo || Yo
    }

    function ji() {
        document.querySelectorAll(".panel-dock-button").forEach(Ri)
    }

    function Bi() {
        return (Bi = Ao(To().mark((function e() {
            var t;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (qo) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        return e.prev = 2, e.next = 5, Di();
                    case 5:
                        if (!Vo) {
                            e.next = 10;
                            break
                        }
                        return e.next = 8, i.sendMessage({
                            target: "background",
                            action: "dock_panel",
                            tabId: qo
                        });
                    case 8:
                        e.next = 14;
                        break;
                    case 10:
                        return e.next = 12, i.sendMessage({
                            target: "background",
                            action: "detach_panel",
                            tabId: qo,
                            width: window.innerWidth,
                            height: window.innerHeight
                        });
                    case 12:
                        null != (t = e.sent) && t.success && (Yo = !0, ji(), window.close());
                    case 14:
                        e.next = 19;
                        break;
                    case 16:
                        e.prev = 16, e.t0 = e.catch(2);
                    case 19:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [2, 16]
            ])
        })))).apply(this, arguments)
    }

    function Pi() {
        return "panelHandoff:".concat(qo)
    }

    function Di() {
        return Ui.apply(this, arguments)
    }

    function Ui() {
        return (Ui = Ao(To().mark((function e() {
            var t;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (qo) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        return t = document.scrollingElement || document.documentElement, e.prev = 3, e.next = 6, chrome.storage.session.set(Eo({}, Pi(), {
                            selectedTab: ti,
                            selectedEditTab: ni,
                            scrollTop: t.scrollTop,
                            at: Date.now()
                        }));
                    case 6:
                        e.next = 10;
                        break;
                    case 8:
                        e.prev = 8, e.t0 = e.catch(3);
                    case 10:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [3, 8]
            ])
        })))).apply(this, arguments)
    }

    function Hi() {
        return Fi.apply(this, arguments)
    }

    function Fi() {
        return (Fi = Ao(To().mark((function e() {
            var t, n, r;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (qo) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        return t = Pi(), e.prev = 3, e.next = 6, chrome.storage.session.get(t);
                    case 6:
                        if (n = e.sent, r = n[t]) {
                            e.next = 10;
                            break
                        }
                        return e.abrupt("return");
                    case 10:
                        if (chrome.storage.session.remove(t).catch((function() {})), !(Date.now() - (r.at || 0) > 3e4)) {
                            e.next = 13;
                            break
                        }
                        return e.abrupt("return");
                    case 13:
                        "element" !== r.selectedTab && "page" !== r.selectedTab || (ti = r.selectedTab), "string" == typeof r.selectedEditTab && (ni = r.selectedEditTab), Number.isFinite(r.scrollTop) && r.scrollTop > 0 && (zo = r.scrollTop), e.next = 20;
                        break;
                    case 18:
                        e.prev = 18, e.t0 = e.catch(3);
                    case 20:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [3, 18]
            ])
        })))).apply(this, arguments)
    }

    function Gi() {
        if (null !== zo) {
            var e = zo;
            zo = null, requestAnimationFrame((function() {
                requestAnimationFrame((function() {
                    (document.scrollingElement || document.documentElement).scrollTop = e
                }))
            }))
        }
    }

    function qi() {
        Vo && qo && chrome.tabs.get(qo).then((function(e) {
            null != e && e.title && (document.title = e.title)
        })).catch((function() {}))
    }

    function Wi(e) {
        document.querySelectorAll(".tab-button").forEach((function(t) {
            return t.classList.toggle("active", t.dataset.tab === e)
        })), document.querySelectorAll(".tab-content").forEach((function(t) {
            return t.classList.toggle("active", t.id === "".concat(e, "-tab"))
        }))
    }

    function Vi(e, t, n, r) {
        var a = (null == e ? void 0 : e.openGraph) || {},
            o = (null == e ? void 0 : e.twitter) || {},
            i = "x" === t,
            c = i && o["twitter:title"] || a["og:title"] || o["twitter:title"] || n || "",
            s = a["og:description"] || o["twitter:description"] || "",
            l = a["og:image"] || null,
            u = o["twitter:image"] || null,
            d = i && u || l || u || null,
            p = "";
        try {
            p = new URL(r).hostname.replace(/^www\./, "")
        } catch (e) {}
        return {
            title: c,
            description: s,
            image: d,
            ogImage: l,
            domain: p
        }
    }

    function zi(e, t) {
        var n = document.createElement("div");
        if (n.className = "social-preview-card ".concat(t), "x" === t) {
            if (e.image) {
                var r = document.createElement("img");
                r.className = "social-preview-image", r.src = e.image, r.alt = "", r.onerror = function() {
                    return r.remove()
                }, n.appendChild(r)
            }
            if (e.title) {
                var a = document.createElement("div");
                a.className = "social-preview-x-overlay";
                var o = document.createElement("div");
                o.className = "social-preview-title", o.textContent = e.title, a.appendChild(o), n.appendChild(a)
            }
            return n
        }
        if (e.image) {
            var i = document.createElement("img");
            i.className = "social-preview-image", i.src = e.image, i.alt = "", i.onerror = function() {
                return i.remove()
            }, n.appendChild(i)
        }
        var c = document.createElement("div");
        if (c.className = "social-preview-content", "facebook" === t) {
            if (e.domain) {
                var s = document.createElement("div");
                s.className = "social-preview-domain-upper", s.textContent = e.domain, c.appendChild(s)
            }
            if (e.title) {
                var l = document.createElement("div");
                l.className = "social-preview-title", l.textContent = e.title, c.appendChild(l)
            }
            if (e.description) {
                var u = document.createElement("div");
                u.className = "social-preview-description", u.textContent = e.description, c.appendChild(u)
            }
        } else if ("linkedin" === t) {
            if (e.title) {
                var d = document.createElement("div");
                d.className = "social-preview-title", d.textContent = e.title, c.appendChild(d)
            }
            if (e.domain) {
                var p = document.createElement("div");
                p.className = "social-preview-domain-lower", p.textContent = e.domain, c.appendChild(p)
            }
        }
        return n.appendChild(c), n
    }

    function Yi(e) {
        var t, n = si.socialPreviewType || "facebook",
            r = Vi(e.meta, n, e.title, e.url);
        if (!r.ogImage) return null;
        var a = document.createElement("div");
        a.className = "section", a.id = "socialPreview", null !== (t = si.sectionVisibility.socialPreview) && void 0 !== t && t.collapsed && a.classList.add("collapsed");
        var o = document.createElement("div");
        o.className = "section-header";
        var i = document.createElement("div");
        i.className = "expandable-area expand-button";
        var c = document.createElement("div");
        c.className = "disclosure-icon";
        var s = document.createElement("div");
        s.className = "section-title", s.textContent = chrome.i18n.getMessage("PAGE_TAB_SOCIAL_PREVIEW"), i.appendChild(c), i.appendChild(s);
        var l = document.createElement("div");
        l.className = "section-actions";
        var u = document.createElement("div");
        u.className = "input-select-container";
        var d = document.createElement("select");
        d.className = "input-select", d.dataset.socialPreviewType = "true";
        for (var p = 0, m = [{
                value: "facebook",
                text: chrome.i18n.getMessage("SOCIAL_PREVIEW_FACEBOOK")
            }, {
                value: "x",
                text: chrome.i18n.getMessage("SOCIAL_PREVIEW_X")
            }, {
                value: "linkedin",
                text: chrome.i18n.getMessage("SOCIAL_PREVIEW_LINKEDIN")
            }]; p < m.length; p++) {
            var f = m[p],
                h = document.createElement("option");
            h.value = f.value, h.text = f.text, d.appendChild(h)
        }
        d.value = n, u.appendChild(d), l.appendChild(u), o.appendChild(i), o.appendChild(l), a.appendChild(o);
        var v = document.createElement("div");
        return v.className = "social-preview-card-container", v.appendChild(zi(r, n)), a.appendChild(v), a
    }

    function Ki() {
        var e = document.getElementById("page-tab");
        if (e) {
            var t = document.createDocumentFragment(),
                n = document.createElement("div");
            n.className = "header sticky-top", n.appendChild(Ii()), t.appendChild(n);
            var r = document.createElement("div");
            r.className = "empty-container";
            var a = document.createElement("div"),
                o = document.createElement("div");
            o.className = "empty-icon", o.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#e3e3e3"><path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5Zm156-35.17q60.67 0 114.17-19.5t97.16-55.5l-67-66.33Q594-265.67 557.5-252.83 521-240 480-240q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 41-13 77.67-13 36.66-35.33 67L738-269q35.33-43.67 55.33-97t20-114q0-139.33-97-236.33t-236.33-97q-139.33 0-236.33 97t-97 236.33q0 139.33 97 236.33t236.33 97Zm0-160q26.67 0 51.17-7.5T576.33-336l-69.66-69q-6.34 2.67-13 3.83Q487-400 480-400q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 7.33-1.5 14.5t-4.17 14.17l69.34 68q14.33-20.67 22-45.17 7.66-24.5 7.66-51.5 0-72-50.66-122.67Q552-653.33 480-653.33t-122.67 50.66Q306.67-552 306.67-480t50.66 122.67Q408-306.67 480-306.67Z"/></svg>';
            var i = document.createElement("h4");
            i.className = "empty-title greyed", i.textContent = chrome.i18n.getMessage("NO_PAGE_INFO_MESSAGE"), a.appendChild(o), a.appendChild(i), r.appendChild(a), t.appendChild(r), e.innerHTML = "", e.appendChild(t)
        }
    }

    function Xi() {
        return Xi = Ao(To().mark((function e(t) {
            var n, r, a, o, c, s, l, u, d, p, m, f, h, v, g, y, b, w, x, E, C, L, N, k, _, T, S, $, A, M, O, I, R, j, B, P, D, U, H;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if ((n = document.getElementById("page-tab")) && t) {
                            e.next = 3;
                            break
                        }
                        return e.abrupt("return");
                    case 3:
                        return r = document.createDocumentFragment(), (a = document.createElement("div")).className = "header sticky-top", a.appendChild(Ii()), (o = document.createElement("div")).className = "element-name-detail", (c = document.createElement("div")).className = "element-name", (s = document.createElement("div")).className = "element-name-label", s.style.cursor = "default", s.textContent = t.title || chrome.i18n.getMessage("PAGE_TAB_UNTITLED"), (l = document.createElement("div")).className = "element-dimensions", l.textContent = gi(t.url), o.appendChild(s), o.appendChild(l), c.appendChild(o), u = document.createElement("div"), (d = document.createElement("button")).className = "refresh-button", ui > 0 && d.classList.add("refreshing"), d.addEventListener("click", (function() {
                            if (qo) {
                                li = null;
                                var e = ui = Date.now();
                                d.classList.add("refreshing"), i.sendMessageToTab(qo, {
                                    target: "script",
                                    action: "refresh_page_data"
                                }).catch((function() {})), setTimeout((function() {
                                    ui === e && yi()
                                }), 5e3)
                            }
                        })), u.appendChild(d), c.appendChild(u), a.appendChild(c), r.appendChild(a), e.next = 32, fi();
                    case 32:
                        if (p = e.sent, m = p.success, (f = Yi(t)) && r.appendChild(f), h = [{
                                key: "seo",
                                label: chrome.i18n.getMessage("PAGE_TAB_META_SEO"),
                                attrName: "name"
                            }, {
                                key: "openGraph",
                                label: chrome.i18n.getMessage("PAGE_TAB_META_OG"),
                                attrName: "property"
                            }, {
                                key: "twitter",
                                label: chrome.i18n.getMessage("PAGE_TAB_META_TWITTER"),
                                attrName: "name"
                            }], v = h.some((function(e) {
                                var n, r = null === (n = t.meta) || void 0 === n ? void 0 : n[e.key];
                                return r && Object.values(r).some((function(e) {
                                    return null != e
                                }))
                            })), !v) {
                            e.next = 95;
                            break
                        }(y = document.createElement("div")).className = "section", y.id = "metaTags", null !== (g = si.sectionVisibility.metaTags) && void 0 !== g && g.collapsed && y.classList.add("collapsed"), (b = document.createElement("div")).className = "section-header", (w = document.createElement("div")).className = "expandable-area expand-button", (x = document.createElement("div")).className = "disclosure-icon", (E = document.createElement("div")).className = "section-title", E.textContent = chrome.i18n.getMessage("PAGE_TAB_META_TAGS"), w.appendChild(x), w.appendChild(E), b.appendChild(w), y.appendChild(b), (C = document.createElement("div")).className = "pre-wrapper", (L = document.createElement("pre")).className = "styles-block", N = No(h), e.prev = 61, N.s();
                    case 63:
                        if ((k = N.n()).done) {
                            e.next = 79;
                            break
                        }
                        if (T = k.value, S = null === (_ = t.meta) || void 0 === _ ? void 0 : _[T.key]) {
                            e.next = 68;
                            break
                        }
                        return e.abrupt("continue", 77);
                    case 68:
                        if (0 !== ($ = Object.entries(S).filter((function(e) {
                                return null != Lo(e, 2)[1]
                            }))).length) {
                            e.next = 71;
                            break
                        }
                        return e.abrupt("continue", 77);
                    case 71:
                        (A = document.createElement("div")).className = "line", A.innerHTML = '<span class="comment">/* '.concat(Lc(T.label), " */</span>"), L.appendChild(A), M = No($);
                        try {
                            for (M.s(); !(O = M.n()).done;) I = Lo(O.value, 2), R = I[0], j = I[1], (B = document.createElement("div")).className = "line", B.innerHTML = "title" === R ? '<span class="keyword">&lt;title&gt;</span><span class="string">'.concat(Lc(j), '</span><span class="keyword">&lt;/title&gt;</span>') : "canonical" === R ? '<span class="keyword">&lt;link</span> <span class="property">rel</span>=<span class="string">"canonical"</span> <span class="property">href</span>=<span class="string">"'.concat(Lc(j), '"</span> <span class="keyword">/&gt;</span>') : '<span class="keyword">&lt;meta</span> <span class="property">'.concat(T.attrName, '</span>=<span class="string">"').concat(Lc(R), '"</span> <span class="property">content</span>=<span class="string">"').concat(Lc(j), '"</span> <span class="keyword">/&gt;</span>'), L.appendChild(B)
                        } catch (e) {
                            M.e(e)
                        } finally {
                            M.f()
                        }
                    case 77:
                        e.next = 63;
                        break;
                    case 79:
                        e.next = 84;
                        break;
                    case 81:
                        e.prev = 81, e.t0 = e.catch(61), N.e(e.t0);
                    case 84:
                        return e.prev = 84, N.f(), e.finish(84);
                    case 87:
                        P = L.querySelectorAll(".line").length, D = P.toString().length, L.style.setProperty("--max-line-digits", D), C.appendChild(L), U = Array.from(L.querySelectorAll(".line")).map((function(e) {
                            return e.innerText.trim()
                        })).join("\n"), kc(C, U), y.appendChild(C), r.appendChild(y);
                    case 95:
                        t.pageWeight && r.appendChild(ms(t.pageWeight, m)), (H = ps(t.seoIssues)) && r.appendChild(H), n.innerHTML = "", n.appendChild(r);
                    case 100:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [61, 81, 84, 87]
            ])
        }))), Xi.apply(this, arguments)
    }

    function Zi() {
        return Zi = Ao(To().mark((function e(t) {
            var n, r, a, o, i, c, s, l, u, d, p, m, f, h, v, g, y, b, w, x, E, C, L, N, k;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (r = document.getElementById("page-tab")) {
                            e.next = 3;
                            break
                        }
                        return e.abrupt("return");
                    case 3:
                        if ((a = r.querySelector("#technologies, .pro-section[data-feature='technology']")) && a.remove(), t && 0 !== t.length) {
                            e.next = 7;
                            break
                        }
                        return e.abrupt("return");
                    case 7:
                        return e.next = 9, fi();
                    case 9:
                        if (o = e.sent, o.success) {
                            e.next = 17;
                            break
                        }
                        return i = t.length, c = Xc("".concat(i, " ").concat(chrome.i18n.getMessage(1 === i ? "LABEL_TECHNOLOGY" : "LABEL_TECHNOLOGIES")), "technology"), (s = r.querySelector("#seoIssues")) ? r.insertBefore(c, s) : r.appendChild(c), e.abrupt("return");
                    case 17:
                        (l = document.createElement("div")).className = "section", l.id = "technologies", null !== (n = si.sectionVisibility.technologies) && void 0 !== n && n.collapsed && l.classList.add("collapsed"), (u = document.createElement("div")).className = "section-header", (d = document.createElement("div")).className = "expandable-area expand-button", (p = document.createElement("div")).className = "disclosure-icon", (m = document.createElement("div")).className = "section-title", f = t.length, m.textContent = "".concat(f, " ").concat(chrome.i18n.getMessage(1 === f ? "LABEL_TECHNOLOGY" : "LABEL_TECHNOLOGIES")), d.appendChild(p), d.appendChild(m), u.appendChild(d), l.appendChild(u), (h = document.createElement("div")).className = "tech-chips", v = No(t);
                        try {
                            for (v.s(); !(g = v.n()).done;) y = g.value, b = y.name || y.id || "Unknown", (w = document.createElement("a")).className = "tech-pill", w.target = "_blank", w.rel = "noopener noreferrer", w.href = y.url || "https://www.google.com/search?q=".concat(encodeURIComponent(b)), y.icon ? (x = chrome.runtime.getURL("sidepanel/logos/".concat(y.icon, ".svg")), (E = document.createElement("img")).className = "tech-icon", E.src = x, E.alt = b, w.appendChild(E)) : ((C = document.createElement("div")).className = "tech-icon-placeholder", C.textContent = b.charAt(0).toUpperCase(), w.appendChild(C)), (L = document.createElement("span")).className = "tech-name", L.textContent = b, w.appendChild(L), y.version && ((N = document.createElement("div")).className = "tech-tooltip", N.textContent = y.version, w.appendChild(N)), h.appendChild(w)
                        } catch (e) {
                            v.e(e)
                        } finally {
                            v.f()
                        }
                        l.appendChild(h), (k = r.querySelector("#seoIssues")) ? r.insertBefore(l, k) : r.appendChild(l);
                    case 42:
                    case "end":
                        return e.stop()
                }
            }), e)
        }))), Zi.apply(this, arguments)
    }

    function Qi(e) {
        return Ji.apply(this, arguments)
    }

    function Ji() {
        return (Ji = Ao(To().mark((function e(t) {
            var n, r, a, o, c, s, l, u, d, p, m, f, h, v, g, y, b, w, x, E, C, L, N, k, _, T, S, $, A;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (!t.target.closest || !t.target.closest("#edit-view")) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        if (!t.target.classList.contains("tab-button")) {
                            e.next = 8;
                            break
                        }
                        return Wi(n = t.target.dataset.tab), ti = n, Ti(), e.abrupt("return");
                    case 8:
                        if ("downloadOgImage" !== t.target.id) {
                            e.next = 18;
                            break
                        }
                        return e.next = 11, ic();
                    case 11:
                        if (e.sent) {
                            e.next = 15;
                            break
                        }
                        return e.abrupt("return");
                    case 15:
                        return e.next = 17, Ic(t.target.dataset.url);
                    case 17:
                        return e.abrupt("return");
                    case 18:
                        if (!t.target.closest(".property-list-asset")) {
                            e.next = 47;
                            break
                        }
                        return e.next = 21, ic();
                    case 21:
                        if (e.sent) {
                            e.next = 25;
                            break
                        }
                        return e.abrupt("return");
                    case 25:
                        if ("src" !== (r = t.target.closest(".property-list-asset")).dataset.type && "background-image" !== r.dataset.type) {
                            e.next = 36;
                            break
                        }
                        if (!r.dataset.dataUrl) {
                            e.next = 32;
                            break
                        }
                        return e.next = 30, jc(r.dataset.dataUrl, r.dataset.fileExtension);
                    case 30:
                        e.next = 34;
                        break;
                    case 32:
                        return e.next = 34, Ic(r.dataset.url);
                    case 34:
                        e.next = 45;
                        break;
                    case 36:
                        if ("data-image" !== r.dataset.type) {
                            e.next = 41;
                            break
                        }
                        return e.next = 39, jc(r.dataset.dataUrl, r.dataset.fileExtension);
                    case 39:
                        e.next = 45;
                        break;
                    case 41:
                        if ("svg" !== r.dataset.type) {
                            e.next = 45;
                            break
                        }
                        return a = r.dataset.content, e.next = 45, Pc(a, "asset.svg");
                    case 45:
                        e.next = 211;
                        break;
                    case 47:
                        if (!t.target.classList.contains("expand-button") && !t.target.closest(".expand-button")) {
                            e.next = 62;
                            break
                        }
                        return o = t.target.closest(".section") || t.target.closest(".expand-button").closest(".section"), c = o.id, o.classList.toggle("collapsed"), si.sectionVisibility[c].collapsed = !si.sectionVisibility[c].collapsed, e.prev = 52, e.next = 55, i.storageLocalSet({
                            sidePanelPreferences: si
                        });
                    case 55:
                        e.next = 60;
                        break;
                    case 57:
                        e.prev = 57, e.t0 = e.catch(52);
                    case 60:
                        e.next = 211;
                        break;
                    case 62:
                        if ("downloadAllAssets" !== t.target.id) {
                            e.next = 73;
                            break
                        }
                        return e.next = 65, ic();
                    case 65:
                        if (e.sent) {
                            e.next = 69;
                            break
                        }
                        return e.abrupt("return");
                    case 69:
                        return e.next = 71, ac();
                    case 71:
                        e.next = 211;
                        break;
                    case 73:
                        if (!t.target.classList.contains("copy-action")) {
                            e.next = 81;
                            break
                        }
                        return s = t.target.dataset.content, e.next = 77, Ot(s);
                    case 77:
                        e.sent.success && (t.target.classList.add("no-events"), t.target.classList.add("copy-success"), setTimeout((function() {
                            t.target.classList.remove("no-events"), t.target.classList.remove("copy-success")
                        }), 1e3)), e.next = 211;
                        break;
                    case 81:
                        if (!t.target.closest(".color-item-inline")) {
                            e.next = 93;
                            break
                        }
                        return l = t.target.closest(".color-item-inline"), u = l.closest(".color-section"), d = u.dataset.activeFormat, p = l.dataset.colorValue, m = "HEX" === d ? St(p) : "HSL" === d ? $t(p) : "HSB" === d ? At(p) : p, e.next = 89, Ot(m);
                    case 89:
                        e.sent.success && (l.classList.add("copied"), setTimeout((function() {
                            l.classList.remove("copied")
                        }), 1e3)), e.next = 211;
                        break;
                    case 93:
                        if (!t.target.closest("[data-click-action]")) {
                            e.next = 113;
                            break
                        }
                        return t.stopPropagation(), f = t.target.closest("[data-click-action]").dataset.clickAction, e.prev = 96, e.next = 99, i.sendMessage({
                            target: "background",
                            action: "go_to_tab",
                            tabId: qo
                        });
                    case 99:
                        if (!e.sent.success) {
                            e.next = 106;
                            break
                        }
                        return e.next = 103, i.sendMessageToTab(qo, {
                            target: "script",
                            action: f
                        }).catch((function() {}));
                    case 103:
                        if ("go_to_selected_element" === f) {
                            e.next = 106;
                            break
                        }
                        return e.next = 106, i.sendMessageToTab(qo, {
                            target: "script",
                            action: "go_to_selected_element"
                        }).catch((function() {}));
                    case 106:
                        e.next = 111;
                        break;
                    case 108:
                        e.prev = 108, e.t1 = e.catch(96);
                    case 111:
                        e.next = 211;
                        break;
                    case 113:
                        if (!t.target.closest("[data-selector]")) {
                            e.next = 132;
                            break
                        }
                        if (t.stopPropagation(), qo) {
                            e.next = 118;
                            break
                        }
                        return e.abrupt("return");
                    case 118:
                        return e.prev = 118, e.next = 121, i.sendMessage({
                            target: "background",
                            action: "go_to_tab",
                            tabId: qo
                        });
                    case 121:
                        if (!e.sent.success) {
                            e.next = 125;
                            break
                        }
                        return e.next = 125, i.sendMessageToTab(qo, {
                            target: "script",
                            action: "go_to_selected_element"
                        }).catch((function() {}));
                    case 125:
                        e.next = 130;
                        break;
                    case 127:
                        e.prev = 127, e.t2 = e.catch(118);
                    case 130:
                        e.next = 211;
                        break;
                    case 132:
                        if (!t.target.closest(".copy-button")) {
                            e.next = 143;
                            break
                        }
                        if (h = t.target.closest(".copy-button"), v = h.dataset.copyTarget) {
                            e.next = 137;
                            break
                        }
                        return e.abrupt("return");
                    case 137:
                        return e.next = 139, Ot(v);
                    case 139:
                        e.sent.success && (h.classList.add("no-events", "copy-success"), setTimeout((function() {
                            h.classList.remove("no-events", "copy-success")
                        }), 1e3)), e.next = 211;
                        break;
                    case 143:
                        if (!t.target.closest("[data-color-copy]")) {
                            e.next = 154;
                            break
                        }
                        if (g = t.target.closest("[data-color-copy]"), y = g.dataset.colorCopy) {
                            e.next = 148;
                            break
                        }
                        return e.abrupt("return");
                    case 148:
                        return e.next = 150, Ot(y);
                    case 150:
                        e.sent.success && (t.target.classList.add("copy-success"), setTimeout((function() {
                            t.target.classList.remove("copy-success")
                        }), 1e3)), e.next = 211;
                        break;
                    case 154:
                        if (!t.target.closest(".issue-nav-button")) {
                            e.next = 180;
                            break
                        }
                        t.stopPropagation(), b = t.target.closest(".issue-nav-button"), w = b.closest(".issue-item"), x = JSON.parse(w.dataset.issueIds || "[]"), E = parseInt(w.dataset.currentIndex, 10), C = "true" === w.dataset.hasHighlighted, L = document.querySelectorAll(".issue-item"), N = No(L);
                        try {
                            for (N.s(); !(k = N.n()).done;)(_ = k.value) !== w && (_.dataset.hasHighlighted = "false", _.dataset.currentIndex = "0")
                        } catch (e) {
                            N.e(e)
                        } finally {
                            N.f()
                        }
                        if (C ? (E = b.classList.contains("issue-nav-prev") ? 0 === E ? x.length - 1 : E - 1 : E === x.length - 1 ? 0 : E + 1, w.dataset.currentIndex = E) : w.dataset.hasHighlighted = "true", !qo) {
                            e.next = 178;
                            break
                        }
                        return e.prev = 166, e.next = 169, i.sendMessage({
                            target: "background",
                            action: "go_to_tab",
                            tabId: qo
                        });
                    case 169:
                        if (!e.sent.success) {
                            e.next = 173;
                            break
                        }
                        return e.next = 173, i.sendMessageToTab(qo, {
                            target: "script",
                            action: "highlight_issue_element",
                            issueId: x[E]
                        }).catch((function() {}));
                    case 173:
                        e.next = 178;
                        break;
                    case 175:
                        e.prev = 175, e.t3 = e.catch(166);
                    case 178:
                        e.next = 211;
                        break;
                    case 180:
                        if (!t.target.closest(".issue-item")) {
                            e.next = 203;
                            break
                        }
                        if (T = t.target.closest(".issue-item"), S = JSON.parse(T.dataset.issueIds || "[]"), $ = parseInt(T.dataset.currentIndex, 10), A = S[$], rs(), T.dataset.hasHighlighted = "true", A && qo) {
                            e.next = 189;
                            break
                        }
                        return e.abrupt("return");
                    case 189:
                        return e.prev = 189, e.next = 192, i.sendMessage({
                            target: "background",
                            action: "go_to_tab",
                            tabId: qo
                        });
                    case 192:
                        if (!e.sent.success) {
                            e.next = 196;
                            break
                        }
                        return e.next = 196, i.sendMessageToTab(qo, {
                            target: "script",
                            action: "highlight_issue_element",
                            issueId: A
                        }).catch((function() {}));
                    case 196:
                        e.next = 201;
                        break;
                    case 198:
                        e.prev = 198, e.t4 = e.catch(189);
                    case 201:
                        e.next = 211;
                        break;
                    case 203:
                        if (!t.target.closest(".pro-section")) {
                            e.next = 208;
                            break
                        }
                        return e.next = 206, ec();
                    case 206:
                        e.next = 211;
                        break;
                    case 208:
                        if (!t.target.closest(".input-select-button[data-paywall-feature]")) {
                            e.next = 211;
                            break
                        }
                        return e.next = 211, ec();
                    case 211:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [52, 57],
                [96, 108],
                [118, 127],
                [166, 175],
                [189, 198]
            ])
        })))).apply(this, arguments)
    }

    function ec() {
        return tc.apply(this, arguments)
    }

    function tc() {
        return (tc = Ao(To().mark((function e() {
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.abrupt("return", Promise.resolve());
                    case 2:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function nc(e) {
        return rc.apply(this, arguments)
    }

    function rc() {
        return (rc = Ao(To().mark((function e(t) {
            var n, r, a, o, c, s, l, u, d, p, m, f;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (!t.target.matches("[data-social-preview-type]")) {
                            e.next = 8;
                            break
                        }
                        return n = t.target.value, si.socialPreviewType = n, e.next = 5, i.storageLocalSet({
                            sidePanelPreferences: si
                        });
                    case 5:
                        return (r = document.querySelector("#socialPreview .social-preview-card-container")) && li && (a = Vi(li.meta, n, li.title, li.url), r.innerHTML = "", r.appendChild(zi(a, n))), e.abrupt("return");
                    case 8:
                        if (!t.target.matches("[data-color-format]")) {
                            e.next = 16;
                            break
                        }
                        if (o = t.target, !(c = document.querySelector(".color-section"))) {
                            e.next = 16;
                            break
                        }
                        return c.dataset.activeFormat = o.value, si.colorFormat = o.value, e.next = 16, i.storageLocalSet({
                            sidePanelPreferences: si
                        });
                    case 16:
                        if (!t.target.matches("#css .input-select")) {
                            e.next = 27;
                            break
                        }
                        s = t.target.value, l = t.target.closest("#css"), u = l.querySelectorAll(".code-view-container"), d = No(u);
                        try {
                            for (d.s(); !(p = d.n()).done;)(m = p.value).style.display = m.dataset.view === s ? "" : "none"
                        } catch (e) {
                            d.e(e)
                        } finally {
                            d.f()
                        }
                        return (f = l.querySelector(".css-rules-wrapper")) && "matched" === s && "true" !== f.dataset.loaded && hs(f), si.codeViewMode = s, e.next = 27, i.storageLocalSet({
                            sidePanelPreferences: si
                        });
                    case 27:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function ac() {
        return oc.apply(this, arguments)
    }

    function oc() {
        return (oc = Ao(To().mark((function e() {
            var t, n, r, a, o;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (0 !== (t = document.querySelectorAll(".property-list-asset")).length) {
                            e.next = 3;
                            break
                        }
                        return e.abrupt("return");
                    case 3:
                        n = No(t), e.prev = 4, n.s();
                    case 6:
                        if ((r = n.n()).done) {
                            e.next = 24;
                            break
                        }
                        if ("src" !== (a = r.value).dataset.type && "background-image" !== a.dataset.type) {
                            e.next = 13;
                            break
                        }
                        return e.next = 11, Ic(a.dataset.url);
                    case 11:
                        e.next = 22;
                        break;
                    case 13:
                        if ("data-image" !== a.dataset.type) {
                            e.next = 18;
                            break
                        }
                        return e.next = 16, jc(a.dataset.dataUrl, a.dataset.fileExtension);
                    case 16:
                        e.next = 22;
                        break;
                    case 18:
                        if ("svg" !== a.dataset.type) {
                            e.next = 22;
                            break
                        }
                        return o = a.dataset.content, e.next = 22, Pc(o, chrome.i18n.getMessage("DEFAULT_SVG_FILENAME"));
                    case 22:
                        e.next = 6;
                        break;
                    case 24:
                        e.next = 29;
                        break;
                    case 26:
                        e.prev = 26, e.t0 = e.catch(4), n.e(e.t0);
                    case 29:
                        return e.prev = 29, n.f(), e.finish(29);
                    case 32:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [4, 26, 29, 32]
            ])
        })))).apply(this, arguments)
    }

    function ic() {
        return cc.apply(this, arguments)
    }

    function cc() {
        return (cc = Ao(To().mark((function e() {
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, sc();
                    case 2:
                        if (e.sent) {
                            e.next = 7;
                            break
                        }
                        return e.next = 6, uc();
                    case 6:
                        return e.abrupt("return", e.sent);
                    case 7:
                        return e.abrupt("return", !0);
                    case 8:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function sc() {
        return lc.apply(this, arguments)
    }

    function lc() {
        return (lc = Ao(To().mark((function e() {
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.abrupt("return", new Promise((function(e) {
                            chrome.permissions.contains({
                                permissions: ["downloads"]
                            }, (function(t) {
                                e(t)
                            }))
                        })));
                    case 1:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function uc() {
        return dc.apply(this, arguments)
    }

    function dc() {
        return (dc = Ao(To().mark((function e() {
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.abrupt("return", new Promise((function(e) {
                            chrome.permissions.request({
                                permissions: ["downloads"]
                            }, (function(t) {
                                e(t)
                            }))
                        })));
                    case 1:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function pc(e) {
        return mc.apply(this, arguments)
    }

    function mc() {
        return (mc = Ao(To().mark((function e(t) {
            var n, r;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, fetch(t);
                    case 2:
                        return n = e.sent, e.next = 5, n.text();
                    case 5:
                        return r = e.sent, e.abrupt("return", r);
                    case 7:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function fc() {
        var e = document.querySelectorAll("[data-localize]");
        if (e) {
            var t, n = No(e);
            try {
                for (n.s(); !(t = n.n()).done;) {
                    var r = t.value;
                    r.innerText = chrome.i18n.getMessage(r.dataset.localize)
                }
            } catch (e) {
                n.e(e)
            } finally {
                n.f()
            }
        }
    }

    function hc() {
        return (hc = Ao(To().mark((function e(t) {
            var n, r, a, o, i, c, s, l, u, d, p, m, f, h, v, g, y, b, w, x, E, C, L, N, k, _, T, S, $, A, M, O, I, R, j, B, P, D, U, H, F, G, q, W, V, z, Y;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (n = document.getElementById("container")) {
                            e.next = 3;
                            break
                        }
                        return e.abrupt("return");
                    case 3:
                        if (t && t.name && t.boxModel && t.boxModel.margin && t.boxModel.border && t.boxModel.padding) {
                            e.next = 6;
                            break
                        }
                        return Mi(), e.abrupt("return");
                    case 6:
                        return e.next = 8, fi();
                    case 8:
                        return r = e.sent, a = r.success, e.next = 12, $i();
                    case 12:
                        return o = document.createDocumentFragment(), (i = document.createElement("div")).className = "header sticky-top", i.appendChild(Ii()), c = vc(t.name, t.type, t.boxModel.width, t.boxModel.height, t.availableStates, t.forcedState), i.appendChild(c), o.appendChild(i), s = bc(t.name, t.parentName, t.childName, t.parentSelectable), si.sectionVisibility.documentOutline.collapsed && s.classList.add("collapsed"), o.appendChild(s), e.next = 24, gc(t.boxModel);
                    case 24:
                        l = e.sent, si.sectionVisibility.layout.collapsed && l.classList.add("collapsed"), o.appendChild(l), u = wc(t.css, t.before, t.after, a, t.matchedRules, t.selector, t.forcedState, t.skippedCrossOriginCount, t.edits || {}), si.sectionVisibility.css.collapsed && u.classList.add("collapsed"), o.appendChild(u), t.textContent && t.textContent.length > 0 && (d = Sc(t.textContent), si.sectionVisibility.textContent.collapsed && d.classList.add("collapsed"), o.appendChild(d)), t.layout && (a ? (m = ws(t.layout), null !== (p = si.sectionVisibility.layout) && void 0 !== p && p.collapsed && m.classList.add("collapsed"), o.appendChild(m)) : (f = Xc(chrome.i18n.getMessage("LABEL_FLEX_GRID_LAYOUT"), "layout"), o.appendChild(f))), t.canvas && (a ? (v = ss(t.canvas, a), null !== (h = si.sectionVisibility.canvas) && void 0 !== h && h.collapsed && v.classList.add("collapsed"), o.appendChild(v)) : (g = Xc(chrome.i18n.getMessage("LABEL_CANVAS"), "canvas"), o.appendChild(g))), t.colors && (t.colors.text.length > 0 || t.colors.background.length > 0 || t.colors.border.length > 0) && (x = ((null === (y = t.colors.text) || void 0 === y ? void 0 : y.length) || 0) + ((null === (b = t.colors.background) || void 0 === b ? void 0 : b.length) || 0) + ((null === (w = t.colors.border) || void 0 === w ? void 0 : w.length) || 0), a ? (E = $c(t.colors), si.sectionVisibility.colors.collapsed && E.classList.add("collapsed"), o.appendChild(E)) : (C = Xc("".concat(x, " ").concat(chrome.i18n.getMessage(1 === x ? "LABEL_COLOR" : "LABEL_COLORS")), "colors"), o.appendChild(C))), t.gradients && t.gradients.parsed.length > 0 && (a ? (N = ys(t.gradients), null !== (L = si.sectionVisibility.gradients) && void 0 !== L && L.collapsed && N.classList.add("collapsed"), o.appendChild(N)) : (k = t.gradients.parsed.length, _ = Xc("".concat(k, " ").concat(chrome.i18n.getMessage(1 === k ? "LABEL_GRADIENT" : "LABEL_GRADIENTS")), "gradients"), o.appendChild(_))), t.typography && t.typography.length > 0 && (a ? (S = Qc(t.typography), null !== (T = si.sectionVisibility.typography) && void 0 !== T && T.collapsed && S.classList.add("collapsed"), o.appendChild(S)) : ($ = t.typography.length, A = Xc("".concat($, " ").concat(chrome.i18n.getMessage(1 === $ ? "LABEL_TYPOGRAPHY_STYLE" : "LABEL_TYPOGRAPHY_STYLES")), "fonts"), o.appendChild(A))), t.boxShadow && t.boxShadow.parsed.length > 0 && (a ? (O = Zc(t.boxShadow), null !== (M = si.sectionVisibility.boxShadow) && void 0 !== M && M.collapsed && O.classList.add("collapsed"), o.appendChild(O)) : (I = t.boxShadow.parsed.length, R = Xc("".concat(I, " ").concat(chrome.i18n.getMessage(1 === I ? "LABEL_BOX_SHADOW" : "LABEL_BOX_SHADOWS")), "box-shadow"), o.appendChild(R))), t.animations && t.animations.length > 0 && (a ? (B = Fc(t.animations), null !== (j = si.sectionVisibility.animations) && void 0 !== j && j.collapsed && B.classList.add("collapsed"), o.appendChild(B)) : (P = t.animations.length, D = Xc("".concat(P, " ").concat(chrome.i18n.getMessage(1 === P ? "LABEL_ANIMATION" : "LABEL_ANIMATIONS")), "animation"), o.appendChild(D))), t.transitions && t.transitions.length > 0 && (a ? (H = Gc(t.transitions), null !== (U = si.sectionVisibility.transitions) && void 0 !== U && U.collapsed && H.classList.add("collapsed"), o.appendChild(H)) : (F = t.transitions.length, G = Xc("".concat(F, " ").concat(chrome.i18n.getMessage(1 === F ? "LABEL_TRANSITION" : "LABEL_TRANSITIONS")), "transition"), o.appendChild(G))), t.assets && t.assets.length > 0 && (a ? (q = Ac(t.assets), si.sectionVisibility.assets.collapsed && q.classList.add("collapsed"), o.appendChild(q)) : (W = t.assets.length, V = Xc("".concat(W, " ").concat(chrome.i18n.getMessage(1 === W ? "LABEL_ASSET" : "LABEL_ASSETS")), "assets"), o.appendChild(V))), t.issues && t.issues.length > 0 && (Y = Jc(t.issues), null !== (z = si.sectionVisibility.issues) && void 0 !== z && z.collapsed && Y.classList.add("collapsed"), o.appendChild(Y)), n.innerHTML = "", n.appendChild(o), fc();
                    case 44:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function vc(e, t, n, r, a, o) {
        var c = arguments.length > 6 && void 0 !== arguments[6] ? arguments[6] : null,
            s = document.createElement("div");
        s.className = "element-name-detail";
        var l = document.createElement("div");
        l.className = "element-name";
        var u = document.createElement("div");
        u.id = "selector", u.className = "element-name-label", u.innerText = e, u.dataset.selector = "true";
        var d = document.createElement("div");
        if (d.className = "element-dimensions", null !== c) d.classList.add("edit-count"), d.innerText = Bt(c);
        else {
            var p = function(e) {
                return "number" != typeof e || isNaN(e) ? "0" : e % 1 == 0 ? e.toString() : e.toFixed(3).replace(/\.?0+$/, "")
            };
            d.innerText = "".concat(p(n), " × ").concat(p(r))
        }
        s.appendChild(u), s.appendChild(d), l.appendChild(s);
        var m = document.createElement("div");
        m.className = "element-name-actions";
        var f = function(e, t) {
            if (!Array.isArray(e) || 0 === e.length) return null;
            var n = document.createElement("div");
            n.className = "state-button", t && n.classList.add("active");
            var r = document.createElement("select");
            r.className = "state-select-overlay";
            var a = document.createElement("option");
            a.value = "", a.text = "Default", r.appendChild(a);
            var o, c = No(e);
            try {
                for (c.s(); !(o = c.n()).done;) {
                    var s = o.value,
                        l = document.createElement("option");
                    l.value = s, l.text = s, r.appendChild(l)
                }
            } catch (e) {
                c.e(e)
            } finally {
                c.f()
            }
            return r.value = t || "", r.addEventListener("change", (function() {
                var e = r.value || null;
                i.sendMessageToTab(qo, {
                    target: "script",
                    action: "force_element_state",
                    state: e
                }).catch((function() {}))
            })), n.appendChild(r), n
        }(a, o);
        f && m.appendChild(f);
        var h = document.createElement("button");
        return h.className = "copy-button", h.dataset.copyTarget = e, h.innerHTML = "", m.appendChild(h), l.appendChild(m), l
    }

    function gc(e) {
        return yc.apply(this, arguments)
    }

    function yc() {
        return yc = Ao(To().mark((function e(t) {
            var n, r, a, o, i, c, s, l, u, d, p, m, f, h, v, g, y;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return (n = document.createElement("div")).className = "section", n.id = "layout", (r = document.createElement("div")).className = "section-header", (a = document.createElement("div")).className = "expandable-area expand-button", (o = document.createElement("div")).className = "disclosure-icon", (i = document.createElement("div")).className = "section-title", i.innerText = chrome.i18n.getMessage("LABEL_LAYOUT"), (c = document.createElement("div")).className = "section-actions", a.appendChild(o), a.appendChild(i), r.appendChild(a), r.appendChild(c), n.appendChild(r), (s = document.createElement("div")).className = "box-model-container", e.next = 23, pc("box-model.html");
                    case 23:
                        return l = e.sent, (u = document.createElement("template")).innerHTML = l, d = document.importNode(u.content, !0), p = function(e, t) {
                            var n = !(arguments.length > 2 && void 0 !== arguments[2]) || arguments[2] ? "-" : "";
                            d.querySelector(e).innerText = "number" == typeof t && 0 !== t ? t : n
                        }, m = function(e, t) {
                            var n = d.querySelector(e);
                            n && "number" == typeof t && 0 !== t && n.classList.add("active")
                        }, p(".box-model-value.mt", t.margin.top), p(".box-model-value.mr", t.margin.right), p(".box-model-value.mb", t.margin.bottom), p(".box-model-value.ml", t.margin.left), p(".box-model-value.bt", t.border.top), p(".box-model-value.br", t.border.right), p(".box-model-value.bb", t.border.bottom), p(".box-model-value.bl", t.border.left), p(".box-model-value.pt", t.padding.top), p(".box-model-value.pr", t.padding.right), p(".box-model-value.pb", t.padding.bottom), p(".box-model-value.pl", t.padding.left), m(".box-model-value.mt", t.margin.top), m(".box-model-value.mr", t.margin.right), m(".box-model-value.mb", t.margin.bottom), m(".box-model-value.ml", t.margin.left), f = d.querySelector(".box-model-margin"), (t.margin.top > 0 || t.margin.right > 0 || t.margin.bottom > 0 || t.margin.left > 0) && f.classList.add("active"), h = d.querySelector(".box-model-border"), (t.border.top > 0 || t.border.right > 0 || t.border.bottom > 0 || t.border.left > 0) && h.classList.add("active"), v = d.querySelector(".box-model-padding"), (t.padding.top > 0 || t.padding.right > 0 || t.padding.bottom > 0 || t.padding.left > 0) && v.classList.add("active"), (g = d.querySelector(".box-model-dimensions-value")) && (y = function(e) {
                            return e % 1 == 0 ? e.toString() : e.toFixed(3).replace(/\.?0+$/, "")
                        }, g.innerText = "".concat(y(t.contentWidth), " × ").concat(y(t.contentHeight))), s.appendChild(d), n.appendChild(s), e.abrupt("return", n);
                    case 56:
                    case "end":
                        return e.stop()
                }
            }), e)
        }))), yc.apply(this, arguments)
    }

    function bc(e, t, n) {
        var r = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3],
            a = document.createElement("div");
        a.className = "section", a.id = "documentOutline";
        var o = document.createElement("div");
        o.className = "section-header";
        var i = document.createElement("div");
        i.className = "expandable-area expand-button";
        var c = document.createElement("div");
        c.className = "disclosure-icon";
        var s = document.createElement("div");
        s.className = "section-title", s.innerText = chrome.i18n.getMessage("LABEL_DOCUMENT");
        var l = document.createElement("div");
        l.className = "section-actions", i.appendChild(c), i.appendChild(s), o.appendChild(i), o.appendChild(l), a.appendChild(o);
        var u = document.createElement("ul");
        u.className = "list";
        var d = function(e, t, n) {
            var r = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : "",
                a = document.createElement("li");
            a.className = "list-item ".concat(t, " ").concat(r).trim(), n && (a.dataset.clickAction = n);
            var o, i = document.createElement("div");
            i.className = "outline-icon outline-icon-".concat("div" === (o = (e || "").split(/[#.]/)[0].toLowerCase()) ? "div" : "img" === o ? "media-image" : "video" === o ? "media-video" : "audio" === o ? "media-audio" : "picture" === o ? "media-picture" : "canvas" === o ? "media-canvas" : "iframe" === o ? "media-iframe" : "p" === o ? "paragraph" : "pre" === o ? "text-pre" : "code" === o ? "text-code" : "blockquote" === o ? "text-quote" : "em" === o || "i" === o ? "text-italic" : "strong" === o || "b" === o ? "text-bold" : "mark" === o ? "text-highlight" : "h1" === o ? "heading-h1" : "h2" === o ? "heading-h2" : "h3" === o ? "heading-h3" : "h4" === o ? "heading-h4" : "h5" === o ? "heading-h5" : "h6" === o ? "heading-h6" : "a" === o ? "link" : "button" === o ? "input-button" : "input" === o ? "input-field" : "textarea" === o ? "input-textarea" : "select" === o ? "input-select" : "form" === o ? "form" : "label" === o ? "input-label" : "fieldset" === o ? "form-fieldset" : "legend" === o ? "form-legend" : "ul" === o ? "list-unordered" : "ol" === o ? "list-ordered" : "li" === o ? "list-item" : "table" === o ? "table" : "thead" === o ? "table-head" : "tbody" === o ? "table-body" : "tfoot" === o ? "table-foot" : "tr" === o ? "table-row" : "th" === o ? "table-header-cell" : "td" === o ? "table-cell" : "caption" === o ? "table-caption" : "header" === o ? "semantic-header" : "nav" === o ? "semantic-nav" : "main" === o ? "semantic-main" : "section" === o ? "semantic-section" : "article" === o ? "semantic-article" : "aside" === o ? "semantic-aside" : "footer" === o ? "semantic-footer" : "figure" === o ? "semantic-figure" : "figcaption" === o ? "semantic-figcaption" : "details" === o ? "semantic-details" : "summary" === o ? "semantic-summary" : "dialog" === o ? "semantic-dialog" : "svg" === o ? "svg" : "path" === o ? "svg-path" : "circle" === o ? "svg-circle" : "rect" === o ? "svg-rect" : "g" === o ? "svg-group" : "embed" === o ? "media-embed" : "body" === o ? "document-body" : "html" === o ? "document-root" : "general");
            var c = document.createElement("div");
            return c.className = "label", c.innerText = e, a.appendChild(i), a.appendChild(c), a
        };
        return t && u.appendChild(d(t, "parent-item", r ? "select_parent" : "", r ? "" : "disabled")), u.appendChild(d(e, "document-item", "go_to_selected_element", t ? "" : "no-parent")), n && u.appendChild(d(n, "child-item", "select_child")), a.appendChild(u), a
    }

    function wc(e, t, n, r, a, o) {
        var i = document.createElement("div");
        i.className = "section", i.id = "css";
        var c = document.createElement("div");
        c.className = "section-header";
        var s = document.createElement("div");
        s.className = "expandable-area expand-button";
        var l = document.createElement("div");
        l.className = "disclosure-icon";
        var u = document.createElement("div");
        u.className = "section-title", u.innerText = chrome.i18n.getMessage("LABEL_CODE");
        var d = document.createElement("div");
        d.className = "section-actions";
        var p = null,
            m = null,
            f = document.createElement("div");
        f.className = "input-select-container";
        var h = r && si.codeViewMode || "css";
        if (r) {
            var v = document.createElement("select");
            v.className = "input-select";
            for (var g = 0, y = [{
                    value: "css",
                    textKey: "LABEL_COMPUTED"
                }, {
                    value: "matched",
                    textKey: "LABEL_SOURCE"
                }, {
                    value: "tailwind",
                    textKey: "LABEL_TAILWIND"
                }]; g < y.length; g++) {
                var b = y[g],
                    w = document.createElement("option");
                w.value = b.value, w.text = chrome.i18n.getMessage(b.textKey), v.appendChild(w)
            }
            v.value = h, f.appendChild(v)
        } else {
            var x = document.createElement("button");
            x.className = "input-select input-select-button", x.type = "button", x.textContent = chrome.i18n.getMessage("LABEL_COMPUTED"), x.dataset.paywallFeature = "css-rules", f.appendChild(x)
        }
        d.appendChild(f), s.appendChild(l), s.appendChild(u), c.appendChild(s), c.appendChild(d), i.appendChild(c);
        var E = document.createElement("div");
        E.className = "code-view-container", E.dataset.view = "css", E.style.display = "css" === h ? "" : "none";
        var C = document.createElement("div");
        C.className = "pre-wrapper";
        var L = document.createElement("pre");
        L.id = "stylesBlock", L.className = "styles-block", Nc(o || null, e, L), t && Object.keys(t).length > 0 && Nc("".concat(o || "", "::before"), t, L), n && Object.keys(n).length > 0 && Nc("".concat(o || "", "::after"), n, L);
        var N;
        if (C.appendChild(L), kc(C, Array.from(L.querySelectorAll(".line")).map((function(e) {
                var t = parseInt(e.style.paddingLeft, 10) || 0;
                return "\t".repeat(Math.floor(t / 20)) + e.innerText.trim()
            })).join("\n")), E.appendChild(C), i.appendChild(E), r) {
            var k = document.createElement("div");
            k.className = "code-view-container", k.dataset.view = "matched", k.style.display = "matched" === h ? "" : "none", (m = document.createElement("div")).className = "pre-wrapper css-rules-wrapper", k.appendChild(m), i.appendChild(k), "matched" === h && (di && (m.innerHTML = di), hs(m));
            var _ = document.createElement("div");
            _.className = "code-view-container", _.dataset.view = "tailwind", _.style.display = "tailwind" === h ? "" : "none", (p = document.createElement("div")).className = "pre-wrapper";
            var T = document.createElement("pre");
            T.className = "styles-block";
            var S = "";
            try {
                var $ = ot(Object.entries(e).filter((function(e) {
                    var t = Lo(e, 2),
                        n = (t[0], t[1]);
                    return null != n && "" !== n
                })).map((function(e) {
                    var t = Lo(e, 2),
                        n = t[0],
                        r = t[1];
                    return "".concat(n, ": ").concat(r)
                })).join("; "));
                S = (Array.isArray($) ? $[0] : $ || "").replace(/,\s*$/, "").trim(), N = {
                    "shadow-sm": "shadow-xs",
                    shadow: "shadow-sm",
                    "drop-shadow-sm": "drop-shadow-xs",
                    "drop-shadow": "drop-shadow-sm",
                    "blur-sm": "blur-xs",
                    blur: "blur-sm",
                    "backdrop-blur-sm": "backdrop-blur-xs",
                    "backdrop-blur": "backdrop-blur-sm",
                    "rounded-sm": "rounded-xs",
                    rounded: "rounded-sm",
                    "outline-none": "outline-hidden",
                    ring: "ring-3",
                    "flex-shrink-0": "shrink-0",
                    "flex-shrink": "shrink",
                    "flex-grow-0": "grow-0",
                    "flex-grow": "grow",
                    "overflow-ellipsis": "text-ellipsis",
                    "decoration-slice": "box-decoration-slice",
                    "decoration-clone": "box-decoration-clone"
                }, S = S.split(" ").map((function(e) {
                    var t;
                    return null !== (t = N[e]) && void 0 !== t ? t : e
                })).join(" ")
            } catch (e) {
                S = ""
            }
            var A = document.createElement("div");
            A.className = "line", A.innerHTML = Ut(S), T.appendChild(A), p.appendChild(T), kc(p, S), _.appendChild(p), i.appendChild(_)
        }
        return i
    }

    function xc(e, t) {
        return !1 !== e.mediaActive && (!e.pseudoElement && (null == e.state || e.state === t))
    }

    function Ec(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null,
            n = document.createElement("div");
        if (n.className = "matched-rules-container", !e || 0 === e.length) {
            var r = document.createElement("div");
            r.className = "pre-wrapper";
            var a = document.createElement("pre");
            a.className = "styles-block matched-rules-block";
            var o = document.createElement("div");
            return o.className = "line", o.innerHTML = '<span class="comment">/* No matched rules found */</span>', a.appendChild(o), r.appendChild(a), kc(r, "/* No matched rules found */"), n.appendChild(r), n
        }
        var i, c = new Map,
            s = No(e);
        try {
            for (s.s(); !(i = s.n()).done;) {
                var l = i.value,
                    u = l.stylesheet || "inline";
                c.has(u) || c.set(u, []), c.get(u).push(l)
            }
        } catch (e) {
            s.e(e)
        } finally {
            s.f()
        }
        var d, p = No(c.values());
        try {
            for (p.s(); !(d = p.n()).done;) {
                d.value.sort((function(e, t) {
                    return e.sourceIndex - t.sourceIndex
                }))
            }
        } catch (e) {
            p.e(e)
        } finally {
            p.f()
        }
        for (var m = new Map, f = Co(e).sort((function(e, t) {
                return e.score - t.score
            })), h = f.length - 1; h >= 0; h--) {
            var v = f[h];
            if (xc(v, t))
                for (var g = 0, y = Object.entries(v.styles); g < y.length; g++) {
                    var b = Lo(y[g], 2),
                        w = b[0],
                        x = "important" === b[1].priority;
                    if (m.has(w)) {
                        var E = m.get(w);
                        x && !E.isImportant && m.set(w, {
                            rule: v,
                            isImportant: x
                        })
                    } else m.set(w, {
                        rule: v,
                        isImportant: x
                    })
                }
        }
        var C, L = No(c);
        try {
            for (L.s(); !(C = L.n()).done;) {
                var N = Lo(C.value, 2),
                    k = N[0],
                    _ = N[1];
                n.appendChild(Cc(k, _, m, t))
            }
        } catch (e) {
            L.e(e)
        } finally {
            L.f()
        }
        return n
    }

    function Cc(e, t, n, r) {
        var a = document.createElement("div");
        a.className = "pre-wrapper matched-block";
        var o = document.createElement("pre");
        o.className = "styles-block matched-rules-block";
        var i, c = [],
            s = function() {
                var e = document.createElement("div");
                e.className = "line", e.innerHTML = "&nbsp;", o.appendChild(e), c.push("")
            },
            l = function(e, t) {
                var a = t,
                    i = t > 0 ? "\t" : "",
                    s = document.createElement("div");
                s.className = "line matched-rule-selector", a && (s.style.paddingLeft = "".concat(a, "px")), s.innerHTML = '<span class="selector">'.concat(e.selector, "</span> {"), o.appendChild(s), c.push("".concat(i).concat(e.selector, " {"));
                for (var l = 0, u = Object.entries(e.styles); l < u.length; l++) {
                    var d = Lo(u[l], 2),
                        p = d[0],
                        m = d[1],
                        f = m.value,
                        h = "important" === m.priority,
                        v = n.get(p),
                        g = xc(e, r) && v && v.rule !== e,
                        y = document.createElement("div");
                    y.className = "line", y.style.paddingLeft = "".concat(20 + a, "px"), g && y.classList.add("overridden");
                    var b = Dt(f, e.stylesheet),
                        w = h ? " !important" : "";
                    y.innerHTML = '<span class="property">'.concat(p, '</span>: <span class="value">').concat(b).concat(w, "</span>;"), o.appendChild(y), c.push("".concat(i, "\t").concat(p, ": ").concat(f).concat(w, ";"))
                }
                var x = document.createElement("div");
                x.className = "line", a && (x.style.paddingLeft = "".concat(a, "px")), x.innerHTML = "}", o.appendChild(x), c.push("".concat(i, "}"))
            },
            u = new Map,
            d = No(t);
        try {
            for (d.s(); !(i = d.n()).done;) {
                var p = i.value,
                    m = p.media || "";
                u.has(m) || u.set(m, []), u.get(m).push(p)
            }
        } catch (e) {
            d.e(e)
        } finally {
            d.f()
        }
        var f, h = !0,
            v = No(u);
        try {
            for (v.s(); !(f = v.n()).done;) {
                var g = Lo(f.value, 2),
                    y = g[0],
                    b = g[1];
                if (h || s(), h = !1, y) {
                    var w = document.createElement("div");
                    w.className = "line matched-media-open", w.innerHTML = '<span class="keyword">@media</span> '.concat(Lc(y), " {"), o.appendChild(w), c.push("@media ".concat(y, " {")), b.forEach((function(e, t) {
                        t > 0 && s(), l(e, 20)
                    }));
                    var x = document.createElement("div");
                    x.className = "line", x.innerHTML = "}", o.appendChild(x), c.push("}")
                } else b.forEach((function(e, t) {
                    t > 0 && s(), l(e, 0)
                }))
            }
        } catch (e) {
            v.e(e)
        } finally {
            v.f()
        }
        var E = o.querySelectorAll(".line").length;
        o.style.setProperty("--max-line-digits", E.toString().length), a.appendChild(o), kc(a, c.join("\n"));
        var C, L = a.querySelector(".code-block-footer"),
            N = function(e) {
                if (!e || "inline" === e) return "inline";
                if (e.startsWith("constructed")) return "constructed";
                try {
                    return new URL(e).pathname.split("/").pop() || "stylesheet"
                } catch (t) {
                    return e.length > 30 ? "..." + e.slice(-27) : e
                }
            }(e);
        return e && "inline" !== e && /^https?:/i.test(e) ? ((C = document.createElement("a")).className = "matched-file-link", C.target = "_blank", C.rel = "noopener noreferrer", C.href = e, C.textContent = N) : ((C = document.createElement("span")).className = "matched-file-label", C.textContent = N), L.prepend(C), a
    }

    function Lc(e) {
        return e ? e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : ""
    }

    function Nc(e, t, n) {
        if (e) {
            if (n.children.length > 0) {
                var r = document.createElement("div");
                r.className = "line", r.innerHTML = "&nbsp;", n.appendChild(r)
            }
            var a = document.createElement("div");
            a.className = "line", a.innerText = "".concat(e, " {"), n.appendChild(a)
        }
        for (var o in t) {
            var i = t[o];
            if (null != i && i.length > 0) {
                var c = Dt(Mt(i, si.colorFormat)),
                    s = document.createElement("div");
                s.className = "line", s.innerHTML = '<span class="property">'.concat(o, '</span>: <span class="value">').concat(c, "</span>;"), e && (s.style.paddingLeft = "20px"), n.appendChild(s)
            }
        }
        var l = n.querySelectorAll(".line").length.toString().length;
        if (n.style.setProperty("--max-line-digits", l), e) {
            var u = document.createElement("div");
            u.className = "line", u.innerText = "}", n.appendChild(u)
        }
    }

    function kc(e, t) {
        var n = document.createElement("div");
        n.className = "code-block-footer";
        var r = document.createElement("div");
        return r.className = "section-action copy-action", r.dataset.content = t, n.appendChild(r), e.appendChild(n), r
    }

    function _c(e, t) {
        t && qo && chrome.permissions.contains({
            origins: ["<all_urls>"]
        }, (function(n) {
            if (n) i.sendMessageToTab(qo, {
                target: "script",
                action: "enable_cross_origin_styles"
            }).catch((function() {}));
            else {
                var r = document.createElement("div");
                r.className = "page-weight-note cross-origin-note", r.textContent = chrome.i18n.getMessage("MATCHED_CROSS_ORIGIN_HIDDEN", [String(t)]) + " ";
                var a = document.createElement("a");
                a.href = "#", a.className = "link", a.textContent = chrome.i18n.getMessage("ENABLE_CROSS_ORIGIN"), a.addEventListener("click", Tc), r.appendChild(a), r.appendChild(document.createTextNode(".")), e.appendChild(r)
            }
        }))
    }

    function Tc(e) {
        e.preventDefault(), chrome.permissions.request({
            origins: ["<all_urls>"]
        }, (function(e) {
            e && qo && i.sendMessageToTab(qo, {
                target: "script",
                action: "enable_cross_origin_styles"
            }).catch((function() {}))
        }))
    }

    function Sc(e) {
        var t = document.createElement("div");
        t.className = "section", t.id = "textContent";
        var n = document.createElement("div");
        n.className = "section-header";
        var r = document.createElement("div");
        r.className = "expandable-area expand-button";
        var a = document.createElement("div");
        a.className = "disclosure-icon";
        var o = document.createElement("div");
        o.className = "section-title", o.innerText = chrome.i18n.getMessage("LABEL_TEXT_CONTENT");
        var i = document.createElement("div");
        i.className = "section-actions", r.appendChild(a), r.appendChild(o), n.appendChild(r), n.appendChild(i), t.appendChild(n);
        var c = document.createElement("div");
        c.className = "pre-wrapper";
        var s = document.createElement("pre");
        return s.id = "contentBlock", s.className = "content-block", s.innerText = e, c.appendChild(s), kc(c, e), t.appendChild(c), t
    }

    function $c(e) {
        var t, n, r, a = document.createElement("div");
        a.className = "section", a.id = "colors";
        var o = document.createElement("div");
        o.className = "section-header";
        var i = document.createElement("div");
        i.className = "expandable-area expand-button";
        var c = document.createElement("div");
        c.className = "disclosure-icon";
        var s = ((null === (t = e.text) || void 0 === t ? void 0 : t.length) || 0) + ((null === (n = e.background) || void 0 === n ? void 0 : n.length) || 0) + ((null === (r = e.border) || void 0 === r ? void 0 : r.length) || 0),
            l = document.createElement("div");
        l.className = "section-title", l.innerText = "".concat(s, " ").concat(chrome.i18n.getMessage(1 === s ? "LABEL_COLOR" : "LABEL_COLORS"));
        var u = document.createElement("div");
        u.className = "section-actions";
        var d = document.createElement("div");
        d.className = "input-select-container";
        var p = document.createElement("select");
        p.className = "input-select", p.dataset.colorFormat = "true";
        for (var m = [{
                value: "HEX",
                text: "HEX/HEXA"
            }, {
                value: "RGB",
                text: "RGB/RGBA"
            }, {
                value: "HSL",
                text: "HSL/HSLA"
            }, {
                value: "HSB",
                text: "HSB/HSBA"
            }], f = 0, h = m; f < h.length; f++) {
            var v = h[f],
                g = document.createElement("option");
            g.value = v.value, g.text = v.text, p.appendChild(g)
        }
        p.value = si.colorFormat, d.appendChild(p), u.appendChild(d), i.appendChild(c), i.appendChild(l), o.appendChild(i), o.appendChild(u), a.appendChild(o);
        var y = document.createElement("div");

        function b(e, t, n) {
            if (0 !== t.length) {
                var r = document.createElement("div");
                r.className = "category-title", r.innerText = e, y.appendChild(r);
                var a = document.createElement("div");
                a.className = "color-grid";
                var o, i = No(t);
                try {
                    for (i.s(); !(o = i.n()).done;) {
                        var c = o.value,
                            s = document.createElement("div");
                        s.className = "color-item-inline", s.dataset.colorValue = c, s.dataset.colorType = n;
                        var l = document.createElement("div");
                        l.className = "color-swatch-inline", l.style.backgroundColor = c;
                        var u = document.createElement("div");
                        u.className = "color-checkmark-overlay", l.appendChild(u);
                        var d = document.createElement("div");
                        d.className = "color-labels-inline";
                        var p, f = No(m);
                        try {
                            for (f.s(); !(p = f.n()).done;) {
                                var h = p.value,
                                    v = document.createElement("span");
                                v.className = "color-label label-".concat(h.value), "HEX" === h.value ? v.innerText = St(c) : "HSL" === h.value ? v.innerText = $t(c) : "HSB" === h.value ? v.innerText = At(c) : v.innerText = c, d.appendChild(v)
                            }
                        } catch (e) {
                            f.e(e)
                        } finally {
                            f.f()
                        }
                        s.appendChild(l), s.appendChild(d), a.appendChild(s)
                    }
                } catch (e) {
                    i.e(e)
                } finally {
                    i.f()
                }
                y.appendChild(a)
            }
        }
        return y.className = "color-section", y.dataset.activeFormat = p.value, e.text.length > 0 && b(chrome.i18n.getMessage("LABEL_TEXT"), e.text, "colors"), e.background.length > 0 && b(chrome.i18n.getMessage("LABEL_BACKGROUNDS"), e.background, "backgrounds"), e.border.length > 0 && b(chrome.i18n.getMessage("LABEL_BORDERS"), e.border, "borders"), a.appendChild(y), a
    }

    function Ac(e) {
        var t = document.createElement("div");
        t.className = "section", t.id = "assets";
        var n = document.createElement("div");
        n.className = "section-header";
        var r = document.createElement("div");
        r.className = "expandable-area expand-button";
        var a = document.createElement("div");
        a.className = "disclosure-icon";
        var o = document.createElement("div");
        o.className = "section-title";
        var i = e.length;
        o.innerText = "".concat(i, " ").concat(chrome.i18n.getMessage(1 === i ? "LABEL_ASSET" : "LABEL_ASSETS"));
        var c = document.createElement("div");
        c.className = "section-actions";
        var s = document.createElement("button");
        s.id = "downloadAllAssets", s.className = "section-button", s.innerText = chrome.i18n.getMessage("BUTTON_DOWNLOAD_ALL"), c.appendChild(s), r.appendChild(a), r.appendChild(o), n.appendChild(r), n.appendChild(c), t.appendChild(n);
        var l = document.createElement("div");
        l.className = "assets-justified-container";
        var u = e.map((function(e, t) {
            return new Promise((function(n) {
                var r = {
                    asset: e,
                    index: t,
                    width: 100,
                    height: 100,
                    aspectRatio: 1,
                    type: "IMG",
                    loaded: !1
                };
                if ("svg" === e.type) {
                    var a = function(e) {
                        var t = (new DOMParser).parseFromString(e, "image/svg+xml").querySelector("svg");
                        if (!t) return null;
                        var n = t.getAttribute("width"),
                            r = t.getAttribute("height");
                        return n && r ? {
                            width: parseInt(n),
                            height: parseInt(r)
                        } : null
                    }(e.content);
                    a && (r.width = a.width, r.height = a.height, r.aspectRatio = a.width / a.height), r.type = "svg", r.loaded = !0, n(r)
                } else {
                    var o = new Image;
                    o.onload = function() {
                        if (r.width = o.naturalWidth, r.height = o.naturalHeight, r.aspectRatio = o.naturalWidth / o.naturalHeight, r.loaded = !0, e.fileExtension) r.type = e.fileExtension.toLowerCase();
                        else if (e.url) {
                            var t = function(e) {
                                try {
                                    if (e.startsWith("data:image")) return "data:image";
                                    var t = new URL(e).pathname,
                                        n = t.lastIndexOf(".");
                                    return -1 !== n && t.length - n <= 5 && 0 !== n ? t.substring(n + 1).toLowerCase() : null
                                } catch (e) {
                                    return null
                                }
                            }(e.url);
                            t && (r.type = t.toLowerCase())
                        }
                        n(r)
                    }, o.onerror = function() {
                        r.loaded = !0, n(r)
                    }, "data-image" === e.type ? o.src = e.dataUrl : o.src = e.url
                }
            }))
        }));
        return Promise.all(u).then((function(e) {
            l.assetDataList = e, Mc(l)
        })), t.appendChild(l), t
    }

    function Mc(e) {
        if (e && e.assetDataList) {
            var t = e.offsetWidth || 328,
                n = function(e, t) {
                    var n, r = [],
                        a = function(e) {
                            var t = Math.max(0, Math.floor((e - Fo) / Ho));
                            return Uo + t
                        }(t),
                        o = [],
                        i = 0,
                        c = No(e);
                    try {
                        for (c.s(); !(n = c.n()).done;) {
                            var s = n.value,
                                l = Ro * Oc(s.aspectRatio);
                            if (0 !== o.length)
                                if (o.length >= a) r.push(o), o = [s], i = l;
                                else {
                                    var u = i + (o.length - 1) * Bo,
                                        d = i + l + o.length * Bo;
                                    d > t && t - u < d - t ? (r.push(o), o = [s], i = l) : (o.push(s), i += l)
                                }
                            else o.push(s), i = l
                        }
                    } catch (e) {
                        c.e(e)
                    } finally {
                        c.f()
                    }
                    o.length > 0 && r.push(o);
                    return r
                }(e.assetDataList, t);
            e.innerHTML = "", n.forEach((function(t) {
                return e.appendChild(function(e) {
                    var t = document.createElement("div");
                    if (t.className = "assets-justified-row", e.forEach((function(e) {
                            t.appendChild(function(e) {
                                var t = e.asset,
                                    n = e.width,
                                    r = e.height,
                                    a = e.aspectRatio,
                                    o = e.type,
                                    i = document.createElement("div");
                                i.className = "asset-justified-item property-list-asset", i.dataset.type = t.type, i.style.flex = "".concat(Oc(a), " 1 0");
                                var c = document.createElement("div");
                                if (c.className = "asset-image-container", "svg" === t.type) {
                                    var s = document.createElement("div");
                                    s.className = "asset-svg-wrapper", s.innerHTML = t.content;
                                    var l = s.querySelector("svg");
                                    if (l && e.width && e.height) {
                                        var u = 96;
                                        e.width < u && e.height < u && (l.style.width = "".concat(e.width, "px"), l.style.height = "".concat(e.height, "px"))
                                    }
                                    c.appendChild(s), i.dataset.content = t.content
                                } else {
                                    var d = document.createElement("img");
                                    "data-image" === t.type ? (d.src = t.dataUrl, i.dataset.dataUrl = t.dataUrl, i.dataset.fileExtension = t.fileExtension) : (d.src = t.url, i.dataset.url = t.url), c.appendChild(d)
                                }
                                i.appendChild(c);
                                var p = document.createElement("div");
                                p.className = "asset-info";
                                var m = document.createElement("span");
                                m.className = "asset-type-label", m.textContent = o.toLowerCase();
                                var f = document.createElement("span");
                                return f.className = "asset-dimensions", f.textContent = "".concat(n, "×").concat(r), p.appendChild(m), p.appendChild(f), i.appendChild(p), i
                            }(e))
                        })), 1 === e.length) {
                        t.style.justifyContent = "flex-start";
                        var n = t.querySelector(".asset-justified-item");
                        n && (n.style.flex = "0 0 ".concat(jo * Oc(e[0].aspectRatio), "px"))
                    }
                    return t
                }(t))
            }))
        }
    }

    function Oc(e) {
        return Math.max(Po, Math.min(Do, e || 1))
    }

    function Ic(e) {
        return Rc.apply(this, arguments)
    }

    function Rc() {
        return (Rc = Ao(To().mark((function e(t) {
            var n, r, a, o, i, c, s;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, n = Uc(t), r = t, a = null, e.prev = 4, e.next = 7, fetch(t);
                    case 7:
                        return o = e.sent, e.next = 10, o.blob();
                    case 10:
                        i = e.sent, c = i.type, (s = fs(c)) && (n.toLowerCase().endsWith(".".concat(s)) || (n = "".concat(n, ".").concat(s))), a = URL.createObjectURL(i), r = a, e.next = 20;
                        break;
                    case 18:
                        e.prev = 18, e.t0 = e.catch(4);
                    case 20:
                        return e.next = 22, new Promise((function(e, t) {
                            chrome.downloads.download({
                                url: r,
                                filename: n
                            }, (function() {
                                chrome.runtime.lastError ? t(new Error(chrome.runtime.lastError.message)) : e()
                            }))
                        }));
                    case 22:
                        a && URL.revokeObjectURL(a), e.next = 28;
                        break;
                    case 25:
                        e.prev = 25, e.t1 = e.catch(0);
                    case 28:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 25],
                [4, 18]
            ])
        })))).apply(this, arguments)
    }

    function jc(e, t) {
        return Bc.apply(this, arguments)
    }

    function Bc() {
        return (Bc = Ao(To().mark((function e(t, n) {
            var r;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, r = "image.".concat(n), e.next = 4, new Promise((function(e, n) {
                            chrome.downloads.download({
                                url: t,
                                filename: r
                            }, (function() {
                                chrome.runtime.lastError ? n(new Error(chrome.runtime.lastError.message)) : e()
                            }))
                        }));
                    case 4:
                        e.next = 9;
                        break;
                    case 6:
                        e.prev = 6, e.t0 = e.catch(0);
                    case 9:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 6]
            ])
        })))).apply(this, arguments)
    }

    function Pc(e, t) {
        return Dc.apply(this, arguments)
    }

    function Dc() {
        return (Dc = Ao(To().mark((function e(t, n) {
            var r, a;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, r = new Blob([t], {
                            type: "image/svg+xml"
                        }), a = URL.createObjectURL(r), e.next = 5, new Promise((function(e, t) {
                            chrome.downloads.download({
                                url: a,
                                filename: n
                            }, (function() {
                                chrome.runtime.lastError ? t(new Error(chrome.runtime.lastError.message)) : e()
                            }))
                        }));
                    case 5:
                        URL.revokeObjectURL(a), e.next = 11;
                        break;
                    case 8:
                        e.prev = 8, e.t0 = e.catch(0);
                    case 11:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 8]
            ])
        })))).apply(this, arguments)
    }

    function Uc(e) {
        try {
            var t = new URL(e).pathname;
            return t.substring(t.lastIndexOf("/") + 1) || chrome.i18n.getMessage("DEFAULT_ASSET_NAME")
        } catch (e) {
            return chrome.i18n.getMessage("DEFAULT_DOWNLOAD_NAME")
        }
    }

    function Hc(e) {
        var t = document.documentElement;
        "system" === e ? t.classList.remove("force-light", "force-dark") : "dark" === e ? (t.classList.remove("force-light"), t.classList.add("force-dark")) : "light" === e && (t.classList.remove("force-dark"), t.classList.add("force-light"))
    }

    function Fc(e) {
        var t = document.createElement("div");
        t.className = "section", t.id = "animations";
        var n = document.createElement("div");
        n.className = "section-header";
        var r = document.createElement("div");
        r.className = "expandable-area expand-button";
        var a = document.createElement("div");
        a.className = "disclosure-icon";
        var o = document.createElement("div");
        o.className = "section-title";
        var i = e.length;
        o.innerText = "".concat(i, " ").concat(chrome.i18n.getMessage(1 === i ? "LABEL_ANIMATION" : "LABEL_ANIMATIONS"));
        var c = document.createElement("div");
        c.className = "section-actions", r.appendChild(a), r.appendChild(o), n.appendChild(r), n.appendChild(c), t.appendChild(n);
        var s = document.createElement("div");
        s.className = "animations-container";
        var l = e.filter((function(e) {
            return Wc(e.timingFunction)
        }));
        if (l.length > 0) {
            var u = qc(l, "animation");
            s.appendChild(u)
        }
        return t.appendChild(s), t
    }

    function Gc(e) {
        var t = document.createElement("div");
        t.className = "section", t.id = "transitions";
        var n = document.createElement("div");
        n.className = "section-header";
        var r = document.createElement("div");
        r.className = "expandable-area expand-button";
        var a = document.createElement("div");
        a.className = "disclosure-icon";
        var o = document.createElement("div");
        o.className = "section-title";
        var i = e.length;
        o.innerText = "".concat(i, " ").concat(chrome.i18n.getMessage(1 === i ? "LABEL_TRANSITION" : "LABEL_TRANSITIONS"));
        var c = document.createElement("div");
        c.className = "section-actions", r.appendChild(a), r.appendChild(o), n.appendChild(r), n.appendChild(c), t.appendChild(n);
        var s = document.createElement("div");
        s.className = "transitions-container";
        var l = e.filter((function(e) {
            return Wc(e.timingFunction)
        }));
        if (l.length > 0) {
            var u = qc(l, "transition");
            s.appendChild(u)
        }
        return t.appendChild(s), t
    }

    function qc(e, t) {
        var n = document.createElement("div");
        n.className = "animation-item";
        var r = function(e, t) {
            var n = document.createElement("div");
            n.className = "multi-curve-container";
            var r = document.createElement("div");
            r.className = "curve-container", r.addEventListener("mouseenter", (function() {
                return Yc(r)
            })), requestAnimationFrame((function() {
                return Yc(r)
            }));
            var a = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            a.setAttribute("viewBox", "0 0 ".concat(Mo, " ").concat(Oo)), a.setAttribute("class", "timing-curve-svg"), a.setAttribute("preserveAspectRatio", "none");
            var o = ["var(--curve-1)", "var(--curve-2)", "var(--curve-3)", "var(--curve-4)", "var(--curve-5)", "var(--curve-6)", "var(--curve-7)", "var(--curve-8)", "var(--curve-9)", "var(--primary)"],
                i = Vc();
            a.appendChild(i);
            var c = 0;
            if ("transition" === t) {
                var s, l = new Map,
                    u = No(e);
                try {
                    for (u.s(); !(s = u.n()).done;) {
                        var d = s.value,
                            p = "".concat(d.duration, " ").concat(d.timingFunction).concat(d.delay && "0s" !== d.delay ? " ".concat(d.delay) : "");
                        l.has(p) || (l.set(p, {
                            properties: [],
                            timing: p,
                            timingFunction: d.timingFunction,
                            duration: d.duration,
                            delay: d.delay,
                            color: o[c % o.length]
                        }), c++), l.get(p).properties.push(d.property)
                    }
                } catch (e) {
                    u.e(e)
                } finally {
                    u.f()
                }
                var m, f = No(l.values());
                try {
                    for (f.s(); !(m = f.n()).done;) {
                        var h = m.value,
                            v = Wc(h.timingFunction);
                        v && zc(a, v, {
                            color: h.color,
                            duration: h.duration,
                            timingFunction: h.timingFunction,
                            delay: h.delay
                        })
                    }
                } catch (e) {
                    f.e(e)
                } finally {
                    f.f()
                }
                r.appendChild(a), n.appendChild(r);
                var g = document.createElement("div");
                g.className = "pre-wrapper";
                var y = document.createElement("pre");
                y.className = "styles-block";
                for (var b = Array.from(l.values()), w = function() {
                        var e = b[x],
                            t = e.properties.map((function(t) {
                                return '<span style="color: '.concat(e.color, '">').concat(t, "</span>")
                            })).join(", "),
                            n = Dt(e.timing),
                            r = document.createElement("div");
                        if (r.className = "line", 0 === x) {
                            var a = 1 === b.length ? ";" : ",";
                            r.innerHTML = '<span class="property">transition</span>: <span class="value">'.concat(t, " ").concat(n, "</span>").concat(a)
                        } else {
                            var o = x === b.length - 1 ? ";" : ",";
                            r.innerHTML = '<span class="value">'.concat(t, " ").concat(n, "</span>").concat(o)
                        }
                        y.appendChild(r)
                    }, x = 0; x < b.length; x++) w();
                var E = y.children.length.toString().length;
                y.style.setProperty("--max-line-digits", E), g.appendChild(y);
                var C = Array.from(y.querySelectorAll(".line")).map((function(e) {
                    var t = parseInt(e.style.paddingLeft, 10) || 0;
                    return "\t".repeat(Math.floor(t / 20)) + e.innerText.trim()
                })).join("\n");
                kc(g, C), n.appendChild(g)
            } else {
                for (var L = 0; L < e.length; L++) {
                    var N = e[L],
                        k = Wc(N.timingFunction);
                    k && zc(a, k, {
                        color: o[L % o.length],
                        duration: N.duration,
                        timingFunction: N.timingFunction,
                        delay: N.delay,
                        extraClass: "curve-".concat(L)
                    })
                }
                r.appendChild(a), n.appendChild(r);
                var _ = document.createElement("div");
                _.className = "pre-wrapper";
                var T = document.createElement("pre");
                T.className = "styles-block";
                for (var S = 0; S < e.length; S++) {
                    var $ = e[S],
                        A = "".concat($.duration, " ").concat($.timingFunction);
                    $.delay && "0s" !== $.delay && (A += " ".concat($.delay)), $.iterationCount && "1" !== $.iterationCount && (A += " ".concat($.iterationCount));
                    var M = o[S % o.length],
                        O = '<span style="color: '.concat(M, '">').concat($.name, "</span>"),
                        I = Dt(A),
                        R = document.createElement("div");
                    if (R.className = "line", 0 === S) {
                        var j = 1 === e.length ? ";" : ",";
                        R.innerHTML = '<span class="property">animation</span>: <span class="value">'.concat(O, " ").concat(I, "</span>").concat(j)
                    } else {
                        var B = S === e.length - 1 ? ";" : ",";
                        R.innerHTML = '<span class="value">'.concat(O, " ").concat(I, "</span>").concat(B)
                    }
                    T.appendChild(R)
                }
                for (var P = 0; P < e.length; P++) {
                    var D = e[P];
                    if (D.keyframes && D.keyframes.length > 0) {
                        var U = document.createElement("div");
                        U.className = "line", U.innerHTML = "&nbsp;", T.appendChild(U);
                        var H = o[P % o.length],
                            F = document.createElement("div");
                        F.className = "line", F.innerHTML = '<span class="value">@keyframes</span> <span style="color: '.concat(H, '">').concat(D.name, '</span> <span class="value">{</span>'), T.appendChild(F);
                        for (var G = 0; G < D.keyframes.length; G++) {
                            var q = D.keyframes[G],
                                W = void 0;
                            if (null !== q.offset && void 0 !== q.offset) {
                                var V = (100 * q.offset).toFixed(0);
                                W = 2 === D.keyframes.length ? "0" === V ? "from" : "100" === V ? "to" : "".concat(V, "%") : "".concat(V, "%")
                            } else W = 0 === G ? "from" : "to";
                            var z = xo({}, q);
                            delete z.offset, delete z.computedOffset, delete z.easing, delete z.composite;
                            var Y = Object.entries(z).filter((function(e) {
                                var t = Lo(e, 2),
                                    n = t[0],
                                    r = t[1];
                                return null != r && "" !== r && !n.startsWith("_")
                            }));
                            if (Y.length > 0) {
                                var K = document.createElement("div");
                                K.className = "line", K.style.paddingLeft = "20px", K.innerHTML = '<span class="selector">'.concat(W, "</span> {"), T.appendChild(K);
                                var X, Z = No(Y);
                                try {
                                    for (Z.s(); !(X = Z.n()).done;) {
                                        var Q = Lo(X.value, 2),
                                            J = Q[0],
                                            ee = Q[1],
                                            te = document.createElement("div");
                                        te.className = "line", te.style.paddingLeft = "40px";
                                        var ne = Dt(Mt(ee.toString(), si.colorFormat));
                                        te.innerHTML = '<span class="property">'.concat(J, '</span>: <span class="value">').concat(ne, "</span>;"), T.appendChild(te)
                                    }
                                } catch (e) {
                                    Z.e(e)
                                } finally {
                                    Z.f()
                                }
                                var re = document.createElement("div");
                                re.className = "line", re.style.paddingLeft = "20px", re.innerHTML = "}", T.appendChild(re)
                            }
                        }
                        var ae = document.createElement("div");
                        ae.className = "line", ae.innerHTML = "}", T.appendChild(ae)
                    }
                }
                var oe = T.children.length.toString().length;
                T.style.setProperty("--max-line-digits", oe), _.appendChild(T);
                var ie = Array.from(T.querySelectorAll(".line")).map((function(e) {
                    var t = parseInt(e.style.paddingLeft, 10) || 0;
                    return "\t".repeat(Math.floor(t / 20)) + e.innerText.trim()
                })).join("\n");
                kc(_, ie), n.appendChild(_)
            }
            return n
        }(e, t);
        return n.appendChild(r), n
    }

    function Wc(e) {
        if (!e || "string" != typeof e) return null;
        var t = {
            linear: {
                type: "cubic-bezier",
                x1: 0,
                y1: 0,
                x2: 1,
                y2: 1
            },
            ease: {
                type: "cubic-bezier",
                x1: .25,
                y1: .1,
                x2: .25,
                y2: 1
            },
            "ease-in": {
                type: "cubic-bezier",
                x1: .42,
                y1: 0,
                x2: 1,
                y2: 1
            },
            "ease-out": {
                type: "cubic-bezier",
                x1: 0,
                y1: 0,
                x2: .58,
                y2: 1
            },
            "ease-in-out": {
                type: "cubic-bezier",
                x1: .42,
                y1: 0,
                x2: .58,
                y2: 1
            }
        };
        if (t[e]) return t[e];
        var n = e.match(/cubic-bezier\(([^)]+)\)/);
        if (n) {
            var r = n[1].split(",").map((function(e) {
                return parseFloat(e.trim())
            }));
            if (4 === r.length) return {
                type: "cubic-bezier",
                x1: r[0],
                y1: r[1],
                x2: r[2],
                y2: r[3]
            }
        }
        var a = e.match(/steps\((\d+)(?:,\s*(start|end))?\)/);
        return a ? {
            type: "steps",
            steps: parseInt(a[1]),
            position: a[2] || "end"
        } : null
    }

    function Vc() {
        var e = document.createElementNS("http://www.w3.org/2000/svg", "g");
        e.setAttribute("class", "curve-grid");
        var t = Mo - 2 * Io,
            n = Oo - 2 * Io,
            r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        r.setAttribute("x", Io), r.setAttribute("y", Io), r.setAttribute("width", t), r.setAttribute("height", n), r.setAttribute("fill", "var(--background)"), r.setAttribute("class", "grid-background"), e.appendChild(r);
        for (var a = 0; a <= 4; a++) {
            var o = document.createElementNS("http://www.w3.org/2000/svg", "line"),
                i = Io + a * (t / 4);
            o.setAttribute("x1", i), o.setAttribute("y1", Io), o.setAttribute("x2", i), o.setAttribute("y2", Io + n), o.setAttribute("class", "grid-line"), o.setAttribute("vector-effect", "non-scaling-stroke"), e.appendChild(o)
        }
        for (var c = 0; c <= 4; c++) {
            var s = document.createElementNS("http://www.w3.org/2000/svg", "line"),
                l = Io + c * (n / 4);
            s.setAttribute("x1", Io), s.setAttribute("y1", l), s.setAttribute("x2", Io + t), s.setAttribute("y2", l), s.setAttribute("class", "grid-line"), s.setAttribute("vector-effect", "non-scaling-stroke"), e.appendChild(s)
        }
        return e
    }

    function zc(e, t) {
        var n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
            r = n.color,
            a = n.duration,
            o = n.timingFunction,
            i = n.delay,
            c = n.extraClass,
            s = Kc(t);
        s.setAttribute("class", "multi-curve-track"), e.appendChild(s);
        var l = Kc(t);
        return l.setAttribute("stroke", r), l.setAttribute("class", "multi-curve-path".concat(c ? " ".concat(c) : "")), e.appendChild(l), l.style.setProperty("--draw-length", l.getTotalLength() || 0), l.style.setProperty("--draw-duration", a || "0.4s"), l.style.setProperty("--draw-ease", o || "ease"), l.style.setProperty("--draw-delay", i && "0s" !== i && "0ms" !== i ? i : "0s"), l
    }

    function Yc(e) {
        var t, n = No(e.querySelectorAll(".multi-curve-path"));
        try {
            for (n.s(); !(t = n.n()).done;) {
                var r = t.value,
                    a = r.ownerSVGElement;
                if (a) {
                    var o = a.getBoundingClientRect(),
                        i = a.viewBox.baseVal;
                    if (o.width && o.height && i.width && i.height) {
                        var c = o.width / i.width,
                            s = o.height / i.height,
                            l = r.getTotalLength();
                        if (l) {
                            for (var u = 0, d = r.getPointAtLength(0), p = 1; p <= 64; p++) {
                                var m = r.getPointAtLength(l * p / 64);
                                u += Math.hypot((m.x - d.x) * c, (m.y - d.y) * s), d = m
                            }
                            r.style.setProperty("--draw-length", u)
                        }
                    }
                }
            }
        } catch (e) {
            n.e(e)
        } finally {
            n.f()
        }
    }

    function Kc(e) {
        var t = document.createElementNS("http://www.w3.org/2000/svg", "path"),
            n = Mo - 2 * Io,
            r = Oo - 2 * Io;
        if ("steps" === e.type) {
            for (var a = e.steps, o = r / a, i = Io + r, c = function(e) {
                    return i - e * o
                }, s = function(e) {
                    return Io + e * n
                }, l = "start" === e.position, u = "M ".concat(Io, " ").concat(i), d = 0; d < a; d++) {
                var p = s(d / a),
                    m = s((d + 1) / a);
                u += l ? " L ".concat(p, " ").concat(c(d + 1), " L ").concat(m, " ").concat(c(d + 1)) : " L ".concat(m, " ").concat(c(d), " L ").concat(m, " ").concat(c(d + 1))
            }
            t.setAttribute("d", u)
        } else {
            var f = Io + e.x1 * n,
                h = Io + r - e.y1 * r,
                v = Io + e.x2 * n,
                g = Io + r - e.y2 * r,
                y = "M ".concat(Io, " ").concat(Io + r, " C ").concat(f, " ").concat(h, ", ").concat(v, " ").concat(g, ", ").concat(Io + n, " ").concat(Io);
            t.setAttribute("d", y)
        }
        return t.setAttribute("class", "timing-curve"), t.setAttribute("vector-effect", "non-scaling-stroke"), t
    }

    function Xc(e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "default",
            n = document.createElement("div");
        n.className = "section pro-section", n.dataset.feature = t;
        var r = document.createElement("div");
        r.className = "section-header";
        var a = document.createElement("div");
        a.className = "pro-header-title-container";
        var o = document.createElement("div");
        o.className = "pro-lock-icon";
        var i = document.createElement("div");
        return i.className = "section-title", i.textContent = e, a.appendChild(o), a.appendChild(i), r.appendChild(a), n.appendChild(r), n
    }

    function Zc(e) {
        var t = document.createElement("div");
        t.className = "section", t.id = "boxShadow";
        var n = document.createElement("div");
        n.className = "section-header";
        var r = document.createElement("div");
        r.className = "expandable-area expand-button";
        var a = document.createElement("div");
        a.className = "disclosure-icon";
        var o = document.createElement("div");
        o.className = "section-title";
        var i = e.parsed.length;
        o.innerText = "".concat(i, " ").concat(chrome.i18n.getMessage(1 === i ? "LABEL_BOX_SHADOW" : "LABEL_BOX_SHADOWS"));
        var c = document.createElement("div");
        c.className = "section-actions", r.appendChild(a), r.appendChild(o), n.appendChild(r), n.appendChild(c), t.appendChild(n);
        var s = document.createElement("div");
        s.className = "box-shadow-container";
        var l = function(e) {
            var t = document.createElement("div");
            t.className = "box-shadow-visualization";
            var n = document.createElement("div");
            n.className = "shadow-stack";
            var r, a = 80,
                o = 10;
            r = e.length * o > a ? a / e.length : o;
            var i = (e.length - 1) / 2 * r;
            e.reverse();
            for (var c = 0; c < e.length; c++) {
                var s = e[c],
                    l = document.createElement("div");
                l.className = "shadow-layer shadow", l.style.boxShadow = s, l.style.setProperty("--original-box-shadow", s), l.style.zIndex = c + 1, l.title = s;
                var u = -(c * r - i);
                l.style.setProperty("--explode-offset", "".concat(u, "px")), n.appendChild(l)
            }
            return t.appendChild(n), t
        }(e.parsed);
        s.appendChild(l);
        var u = document.createElement("div");
        u.className = "pre-wrapper";
        var d = document.createElement("pre");
        d.className = "styles-block";
        for (var p = 0; p < e.parsed.length; p++) {
            var m = e.parsed[p],
                f = document.createElement("div");
            f.className = "line";
            var h = Dt(Mt(m.trim(), si.colorFormat));
            if (0 === p) {
                var v = 1 === e.parsed.length ? ";" : ",";
                f.innerHTML = '<span class="property">box-shadow</span>: <span class="value">'.concat(h, "</span>").concat(v)
            } else {
                var g = p === e.parsed.length - 1 ? ";" : ",";
                f.innerHTML = '<span class="value">'.concat(h, "</span>").concat(g)
            }
            d.appendChild(f)
        }
        var y = d.children.length.toString().length;
        d.style.setProperty("--max-line-digits", y), u.appendChild(d);
        var b = Array.from(d.querySelectorAll(".line")).map((function(e) {
            return e.innerText.trim()
        })).join("\n");
        return kc(u, b), s.appendChild(u), t.appendChild(s), t
    }

    function Qc(e) {
        var t = document.createElement("div");
        t.className = "section", t.id = "typography";
        var n = document.createElement("div");
        n.className = "section-header";
        var r = document.createElement("div");
        r.className = "expandable-area expand-button";
        var a = document.createElement("div");
        a.className = "disclosure-icon";
        var o = document.createElement("div");
        o.className = "section-title";
        var i = e.length;
        o.innerText = "".concat(i, " ").concat(chrome.i18n.getMessage(1 === i ? "LABEL_TYPOGRAPHY_STYLE" : "LABEL_TYPOGRAPHY_STYLES"));
        var c = document.createElement("div");
        c.className = "section-actions", r.appendChild(a), r.appendChild(o), n.appendChild(r), n.appendChild(c), t.appendChild(n);
        var s = document.createElement("div");
        s.className = "typography-list";
        var l, u = No(e);
        try {
            for (u.s(); !(l = u.n()).done;) {
                var d = l.value,
                    p = document.createElement("div");
                p.className = "typography-item", p.dataset.typographyKey = d.typographyKey, p.className = "typography-item";
                var m = document.createElement("div");
                m.className = "typography-info";
                var f = document.createElement("div");
                f.className = "typography-details";
                var h = document.createElement("span");
                if (h.className = "typeface-name", h.textContent = d.fontFamily, f.appendChild(h), f.appendChild(document.createTextNode(" ".concat(d.fontSize, " ").concat(d.fontWeight))), d.letterSpacing) {
                    var v = document.createElement("span");
                    v.className = "bar", v.textContent = " | ", f.appendChild(v), f.appendChild(document.createTextNode(d.letterSpacing))
                }
                if (d.textTransform) {
                    var g = document.createElement("span");
                    g.className = "bar", g.textContent = " | ", f.appendChild(g), f.appendChild(document.createTextNode(d.textTransform))
                }
                m.appendChild(f);
                var y = document.createElement("div");
                y.className = "typography-sample-container";
                var b = document.createElement("img");
                b.className = "typography-sample", b.src = d.vectorSample, b.alt = "".concat(d.fontFamily, " sample"), b.style.height = "".concat(d.sampleHeight, "px"), p.appendChild(m), y.appendChild(b), p.appendChild(y), s.appendChild(p)
            }
        } catch (e) {
            u.e(e)
        } finally {
            u.f()
        }
        return t.appendChild(s), t
    }

    function Jc(e) {
        var t = document.createElement("div");
        t.className = "section", t.id = "issues";
        var n = document.createElement("div");
        n.className = "section-header";
        var r = document.createElement("div");
        r.className = "expandable-area expand-button";
        var a = document.createElement("div");
        a.className = "disclosure-icon";
        var o = document.createElement("div");
        o.className = "section-title";
        var i = e.length;
        o.innerText = "".concat(i, " ").concat(chrome.i18n.getMessage(1 === i ? "LABEL_ISSUE" : "LABEL_ISSUES"));
        var c = document.createElement("div");
        c.className = "section-actions", r.appendChild(a), r.appendChild(o), n.appendChild(r), n.appendChild(c), t.appendChild(n);
        var s = document.createElement("div");
        s.className = "issues-list";
        var l = ns(e);
        l.sort((function(e, t) {
            var n = {
                error: 0,
                warning: 1,
                info: 2
            };
            return n[e.severity] - n[t.severity]
        }));
        var u, d = No(l);
        try {
            for (d.s(); !(u = d.n()).done;) {
                var p = u.value,
                    m = ts(p, p.severity);
                s.appendChild(m)
            }
        } catch (e) {
            d.e(e)
        } finally {
            d.f()
        }
        return t.appendChild(s), t
    }

    function es() {
        return (es = Ao(To().mark((function e(t) {
            var n, r, a;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (r = document.getElementById("issues")) {
                            e.next = 3;
                            break
                        }
                        return e.abrupt("return");
                    case 3:
                        if (t && 0 !== t.length) {
                            e.next = 6;
                            break
                        }
                        return r.remove(), e.abrupt("return");
                    case 6:
                        a = Jc(t), null !== (n = si.sectionVisibility.issues) && void 0 !== n && n.collapsed && a.classList.add("collapsed"), r.replaceWith(a);
                    case 9:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function ts(e, t) {
        var n = document.createElement("div");
        n.className = "issue-item issue-".concat(t), n.dataset.issueIds = JSON.stringify(e.issueIds || []), n.dataset.currentIndex = "0", n.dataset.hasHighlighted = "false", n.dataset.issueType = e.type, n.dataset.issueCategory = e.category || "general";
        var r = document.createElement("div");
        r.className = "issue-icon issue-icon-".concat(t);
        var a = document.createElement("div");
        if (a.className = "issue-content", e.selector) {
            var o = document.createElement("div");
            o.className = "issue-selector-row";
            var i = document.createElement("div");
            if (i.className = "issue-selector", i.textContent = e.selector, e.count > 1) {
                var c = document.createElement("div");
                c.className = "issue-controls-wrapper";
                var s = document.createElement("span");
                s.className = "issue-count-badge", s.textContent = "".concat(e.count, " ").concat(chrome.i18n.getMessage("LABEL_INSTANCES"));
                var l = document.createElement("div");
                l.className = "issue-button-group";
                var u = document.createElement("button");
                u.className = "issue-nav-button issue-nav-prev";
                var d = document.createElement("button");
                d.className = "issue-nav-button issue-nav-next", l.appendChild(u), l.appendChild(d), c.appendChild(s), c.appendChild(l), o.appendChild(i), o.appendChild(c)
            } else o.appendChild(i);
            a.appendChild(o)
        }
        var p = document.createElement("div");
        p.className = "issue-message", p.textContent = e.message;
        var m = document.createElement("div");
        return m.className = "issue-recommendation", m.textContent = e.recommendation, a.appendChild(p), a.appendChild(m), n.appendChild(r), n.appendChild(a), n
    }

    function ns(e) {
        var t, n = new Map,
            r = No(e);
        try {
            for (r.s(); !(t = r.n()).done;) {
                var a = t.value,
                    o = a.groupingKey;
                if (n.has(o)) {
                    var i = n.get(o);
                    i.issueIds.push(a.id), i.count++
                } else n.set(o, xo(xo({}, a), {}, {
                    issueIds: [a.id],
                    count: 1
                }))
            }
        } catch (e) {
            r.e(e)
        } finally {
            r.f()
        }
        return Array.from(n.values())
    }

    function rs() {
        var e, t = No(document.querySelectorAll(".issue-item"));
        try {
            for (t.s(); !(e = t.n()).done;) {
                var n = e.value;
                n.dataset.hasHighlighted = "false", n.dataset.currentIndex = "0"
            }
        } catch (e) {
            t.e(e)
        } finally {
            t.f()
        }
    }

    function as(e) {
        if (e.target.classList.contains("preview-link")) {
            var t = e.target.getAttribute("href");
            t && function(e, t) {
                var n = document.querySelector(".image-preview-tooltip");
                n && n.remove();
                var r = document.createElement("div");
                r.className = "image-preview-tooltip", r.style.opacity = "0";
                var a = document.createElement("img");
                a.src = e, t.style.cursor = "wait", a.onerror = function() {
                    r.remove(), t.style.removeProperty("cursor")
                }, a.onload = function() {
                    t.style.removeProperty("cursor");
                    var e = t.getBoundingClientRect(),
                        n = window.pageXOffset || document.documentElement.scrollLeft,
                        a = window.pageYOffset || document.documentElement.scrollTop,
                        o = r.getBoundingClientRect(),
                        i = 15,
                        c = 8,
                        s = e.left + n + e.width / 2 - o.width / 2,
                        l = e.top + a - o.height - c;
                    s < i ? s = i : s + o.width > window.innerWidth - i && (s = window.innerWidth - o.width - i), l < a + i && (l = e.bottom + a + c), r.style.left = "".concat(s, "px"), r.style.top = "".concat(l, "px"), r.style.opacity = "1"
                }, r.appendChild(a), document.body.appendChild(r)
            }(t, e.target)
        }
        var n = e.target.closest(".color-item-inline");
        if (n) {
            var r = n.dataset.colorValue,
                a = n.dataset.colorType;
            r && a && qo && i.sendMessageToTab(qo, {
                target: "script",
                action: "highlight_elements_for_color",
                color: r,
                colorType: a
            }).catch((function() {}))
        }
        var o = e.target.closest(".typography-item");
        if (o) {
            var c = o.dataset.typographyKey;
            c && qo && i.sendMessageToTab(qo, {
                target: "script",
                action: "highlight_elements_for_typography",
                typographyKey: c
            }).catch((function() {}))
        }
        var s = e.target.closest(".issue-item");
        if (s) {
            var l = JSON.parse(s.dataset.issueIds || "[]");
            l.length > 0 && qo && i.sendMessageToTab(qo, {
                target: "script",
                action: "highlight_elements_for_issue",
                issueIds: l
            }).catch((function() {}))
        }
    }

    function os(e) {
        if (e.target.classList.contains("preview-link")) {
            e.target.style.removeProperty("cursor");
            var t = document.querySelector(".image-preview-tooltip");
            t && t.remove()
        }
        e.target.closest(".color-item-inline") && qo && i.sendMessageToTab(qo, {
            target: "script",
            action: "clear_element_highlights"
        }).catch((function() {})), e.target.closest(".typography-item") && qo && i.sendMessageToTab(qo, {
            target: "script",
            action: "clear_element_highlights"
        }).catch((function() {})), e.target.closest(".issue-item") && qo && i.sendMessageToTab(qo, {
            target: "script",
            action: "clear_element_highlights"
        }).catch((function() {}))
    }

    function is() {
        qo && i.sendMessageToTab(qo, {
            target: "script",
            action: "clear_element_highlights"
        }).catch((function() {}))
    }

    function cs() {
        var e = document.querySelector(".image-preview-tooltip");
        e && e.remove()
    }

    function ss(e, t) {
        var n = document.createElement("div");
        n.className = "section", n.id = "canvas";
        var r = document.createElement("div");
        r.className = "section-header";
        var a = document.createElement("div");
        a.className = "expandable-area expand-button";
        var o = document.createElement("div");
        o.className = "disclosure-icon";
        var i = document.createElement("div");
        i.className = "section-title", i.innerText = chrome.i18n.getMessage("LABEL_CANVAS");
        var c = document.createElement("div");
        c.className = "section-actions", a.appendChild(o), a.appendChild(i), r.appendChild(a), r.appendChild(c), n.appendChild(r);
        var s = document.createElement("ul");
        if (s.className = "property-list", e.contextType) {
            var l = ls(chrome.i18n.getMessage("LABEL_CONTEXT_TYPE"), e.contextType);
            s.appendChild(l)
        }
        if (e.dimensions) {
            var u = e.dimensions,
                d = u.width,
                p = u.height,
                m = ls(chrome.i18n.getMessage("LABEL_CANVAS_DIMENSIONS"), "".concat(d, " × ").concat(p));
            s.appendChild(m)
        }
        if (e.pixelRatio) {
            var f = ls(chrome.i18n.getMessage("LABEL_PIXEL_RATIO"), "".concat(e.pixelRatio, "x"));
            s.appendChild(f)
        }
        return n.appendChild(s), n
    }

    function ls(e, t) {
        var n = document.createElement("li");
        n.className = "property-item";
        var r = document.createElement("div");
        r.className = "property-label", r.textContent = e;
        var a = document.createElement("div");
        return a.className = "property-value", a.textContent = t, n.appendChild(r), n.appendChild(a), n
    }

    function us(e) {
        return e < 1024 ? "".concat(e, " B") : e < 1048576 ? "".concat((e / 1024).toFixed(1), " KB") : "".concat((e / 1048576).toFixed(2), " MB")
    }

    function ds(e) {
        var t = document.createElement("div");
        t.className = "issue-item issue-".concat(e.severity, " issue-item-static");
        var n = document.createElement("div");
        n.className = "issue-icon issue-icon-".concat(e.severity);
        var r = document.createElement("div");
        if (r.className = "issue-content", e.target) {
            var a = document.createElement("div");
            a.className = "issue-selector-row";
            var o = document.createElement("div");
            o.className = "issue-selector", o.textContent = e.target, a.appendChild(o), r.appendChild(a)
        }
        var i = document.createElement("div");
        if (i.className = "issue-message", i.textContent = e.message, r.appendChild(i), e.recommendation) {
            var c = document.createElement("div");
            c.className = "issue-recommendation", c.textContent = e.recommendation, r.appendChild(c)
        }
        return t.appendChild(n), t.appendChild(r), t
    }

    function ps(e) {
        var t;
        if (!e || 0 === e.length) return null;
        var n = ns(e),
            r = document.createElement("div");
        r.className = "section", r.id = "seoIssues", null !== (t = si.sectionVisibility.seoIssues) && void 0 !== t && t.collapsed && r.classList.add("collapsed");
        var a = document.createElement("div");
        a.className = "section-header";
        var o = document.createElement("div");
        o.className = "expandable-area expand-button";
        var i = document.createElement("div");
        i.className = "disclosure-icon";
        var c = document.createElement("div");
        c.className = "section-title", c.textContent = "".concat(n.length, " ").concat(chrome.i18n.getMessage(1 === n.length ? "SEO_LABEL_ISSUE" : "SEO_LABEL_ISSUES")), o.appendChild(i), o.appendChild(c), a.appendChild(o), r.appendChild(a);
        var s = document.createElement("div");
        s.className = "issues-list";
        var l, u = No(n.sort((function(e, t) {
            var n = {
                error: 0,
                warning: 1,
                info: 2
            };
            return n[e.severity] - n[t.severity]
        })));
        try {
            for (u.s(); !(l = u.n()).done;) {
                var d = l.value;
                d.selector ? s.appendChild(ts(d, d.severity)) : s.appendChild(ds(d))
            }
        } catch (e) {
            u.e(e)
        } finally {
            u.f()
        }
        return r.appendChild(s), r
    }

    function ms(e, t) {
        var n, r, a, o, i, c, s, l;
        if (!t) return Xc(chrome.i18n.getMessage("PAGE_TAB_PAGE_WEIGHT"), "page-weight");
        var u = document.createElement("div");
        u.className = "section", u.id = "pageWeight", null !== (n = si.sectionVisibility.pageWeight) && void 0 !== n && n.collapsed && u.classList.add("collapsed");
        var d = document.createElement("div");
        d.className = "section-header";
        var p = document.createElement("div");
        p.className = "expandable-area expand-button";
        var m = document.createElement("div");
        m.className = "disclosure-icon";
        var f = document.createElement("div");
        f.className = "section-title", f.textContent = chrome.i18n.getMessage("PAGE_TAB_PAGE_WEIGHT"), p.appendChild(m), p.appendChild(f), d.appendChild(p), u.appendChild(d);
        var h = e.total || 0,
            v = [{
                key: "document",
                value: e.document || 0,
                className: "pw-document"
            }, {
                key: "script",
                value: (null === (r = e.byType) || void 0 === r ? void 0 : r.script) || 0,
                className: "pw-script"
            }, {
                key: "css",
                value: (null === (a = e.byType) || void 0 === a ? void 0 : a.css) || 0,
                className: "pw-css"
            }, {
                key: "img",
                value: (null === (o = e.byType) || void 0 === o ? void 0 : o.img) || 0,
                className: "pw-img"
            }, {
                key: "font",
                value: (null === (i = e.byType) || void 0 === i ? void 0 : i.font) || 0,
                className: "pw-font"
            }, {
                key: "media",
                value: (null === (c = e.byType) || void 0 === c ? void 0 : c.media) || 0,
                className: "pw-media"
            }, {
                key: "fetch",
                value: (null === (s = e.byType) || void 0 === s ? void 0 : s.fetch) || 0,
                className: "pw-fetch"
            }, {
                key: "other",
                value: (null === (l = e.byType) || void 0 === l ? void 0 : l.other) || 0,
                className: "pw-other"
            }],
            g = document.createElement("div");
        g.className = "page-weight-total", g.textContent = us(h), u.appendChild(g);
        var y = {
            document: "LABEL_PW_DOCUMENT",
            script: "LABEL_PW_SCRIPTS",
            css: "LABEL_PW_CSS",
            img: "LABEL_PW_IMAGES",
            font: "LABEL_PW_FONTS",
            media: "LABEL_PW_MEDIA",
            fetch: "LABEL_PW_FETCH",
            other: "LABEL_PW_OTHER"
        };
        if (h > 0) {
            var b = document.createElement("div");
            b.className = "page-weight-visual";
            var w = document.createElement("div");
            w.className = "page-weight-bar";
            var x = document.createElement("div");
            x.className = "page-weight-legend";
            var E = document.createElement("div");
            E.className = "page-weight-tooltip";
            var C = document.createElement("span");
            C.className = "page-weight-tooltip-label";
            var L = document.createElement("span");
            L.className = "page-weight-tooltip-value", E.appendChild(C), E.appendChild(L);
            var N, k = {},
                _ = function(e, t) {
                    e.dataset.pwType = t, e.addEventListener("mouseenter", (function() {
                        return function(e) {
                            var t = k[e];
                            if (t) {
                                b.querySelectorAll('[data-pw-type="'.concat(e, '"]')).forEach((function(e) {
                                    return e.classList.add("is-hovered")
                                })), C.textContent = t.label, L.textContent = t.valueText, E.classList.add("is-visible");
                                var n = b.getBoundingClientRect(),
                                    r = t.segEl.getBoundingClientRect(),
                                    a = r.left + r.width / 2 - n.left,
                                    o = E.offsetWidth / 2,
                                    i = Math.max(o + 4, Math.min(a, n.width - o - 4));
                                E.style.left = "".concat(i, "px"), E.style.top = "".concat(w.getBoundingClientRect().top - n.top, "px")
                            }
                        }(t)
                    })), e.addEventListener("mouseleave", (function() {
                        return function(e) {
                            b.querySelectorAll('[data-pw-type="'.concat(e, '"]')).forEach((function(e) {
                                return e.classList.remove("is-hovered")
                            })), E.classList.remove("is-visible")
                        }(t)
                    }))
                },
                T = No(v);
            try {
                for (T.s(); !(N = T.n()).done;) {
                    var S = N.value;
                    if (S.value) {
                        var $ = S.value / h * 100,
                            A = $ > 0 && $ < 1 ? "<1%" : "".concat(Math.round($), "%"),
                            M = chrome.i18n.getMessage(y[S.key]),
                            O = document.createElement("div");
                        O.className = "page-weight-bar-segment ".concat(S.className), O.style.flexBasis = "".concat($, "%"), w.appendChild(O), _(O, S.key);
                        var I = document.createElement("div");
                        I.className = "page-weight-legend-item ".concat(S.className);
                        var R = document.createElement("span");
                        R.className = "page-weight-dot";
                        var j = document.createElement("span");
                        j.className = "page-weight-legend-label", j.textContent = M, I.appendChild(R), I.appendChild(j), x.appendChild(I), _(I, S.key), k[S.key] = {
                            segEl: O,
                            label: M,
                            valueText: "".concat(us(S.value), " · ").concat(A)
                        }
                    }
                }
            } catch (e) {
                T.e(e)
            } finally {
                T.f()
            }
            b.appendChild(E), b.appendChild(w), b.appendChild(x), u.appendChild(b)
        }
        if (e.unknownCount > 0) {
            var B = document.createElement("div");
            B.className = "page-weight-note", B.textContent = chrome.i18n.getMessage("PW_HIDDEN_NOTE", String(e.unknownCount)), u.appendChild(B)
        }
        if (e.bufferFull) {
            var P = document.createElement("div");
            P.className = "page-weight-note", P.textContent = chrome.i18n.getMessage("PW_BUFFER_FULL"), u.appendChild(P)
        }
        return u
    }

    function fs(e) {
        return {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/gif": "gif",
            "image/webp": "webp",
            "image/svg+xml": "svg",
            "image/bmp": "bmp",
            "image/x-icon": "ico",
            "image/tiff": "tiff",
            "image/avif": "avif"
        } [e] || null
    }

    function hs(e) {
        return vs.apply(this, arguments)
    }

    function vs() {
        return (vs = Ao(To().mark((function e(t) {
            var n, r;
            return To().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (qo && "true" !== t.dataset.loaded) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        return e.prev = 2, e.next = 5, i.sendMessageToTab(qo, {
                            target: "script",
                            action: "get_matched_rules"
                        });
                    case 5:
                        (n = e.sent).success && n.matchedRules ? (r = Ec(n.matchedRules, n.forcedState), t.innerHTML = "", t.appendChild(r), _c(t, n.skippedCrossOriginCount || 0), n.matchedRules.length > 0 && (t.dataset.loaded = "true"), di = t.innerHTML) : gs(t), e.next = 12;
                        break;
                    case 9:
                        e.prev = 9, e.t0 = e.catch(2), gs(t);
                    case 12:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [2, 9]
            ])
        })))).apply(this, arguments)
    }

    function gs(e) {
        e.innerHTML = "";
        var t = document.createElement("div");
        t.className = "pre-wrapper";
        var n = document.createElement("pre");
        n.className = "styles-block matched-rules-block", n.innerHTML = '<div class="line"><span class="comment">/* Could not retrieve CSS rules for this element */</span></div>', t.appendChild(n), kc(t, "/* Could not retrieve CSS rules for this element */"), e.appendChild(t)
    }

    function ys(e) {
        var t = document.createElement("div");
        t.className = "section", t.id = "gradients";
        var n = document.createElement("div");
        n.className = "section-header";
        var r = document.createElement("div");
        r.className = "expandable-area expand-button";
        var a = document.createElement("div");
        a.className = "disclosure-icon";
        var o = document.createElement("div");
        o.className = "section-title";
        var i = e.parsed.length;
        o.innerText = "".concat(i, " ").concat(chrome.i18n.getMessage(1 === i ? "LABEL_GRADIENT" : "LABEL_GRADIENTS"));
        var c = document.createElement("div");
        c.className = "section-actions", r.appendChild(a), r.appendChild(o), n.appendChild(r), n.appendChild(c), t.appendChild(n);
        var s = document.createElement("div");
        s.className = "gradient-container";
        var l, u = No(e.parsed);
        try {
            var d = function() {
                var e = l.value,
                    t = document.createElement("div");
                t.className = "gradient-item";
                var n = document.createElement("div");
                n.className = "gradient-visual";
                var r = e.stops.map((function(t) {
                        var n = bs(t, e.stops);
                        return "".concat(t.color, " ").concat(n, "%")
                    })).join(", "),
                    a = document.createElement("div");
                a.className = "gradient-track", a.style.setProperty("--gradient-track-bg", "linear-gradient(to right, ".concat(r, ")"));
                var o, i = No(e.stops);
                try {
                    var c = function() {
                        var t = o.value,
                            n = bs(t, e.stops),
                            r = document.createElement("div");
                        r.className = "gradient-stop-marker", r.style.left = "".concat(n, "%");
                        var i = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        i.setAttribute("class", "gradient-stop-pin"), i.setAttribute("viewBox", "0 0 24 33");
                        var c = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        c.setAttribute("d", "M7,1 H17 A6,6 0 0 1 23,7 V17 A6,6 0 0 1 17,23 H16 L12,29 L8,23 H7 A6,6 0 0 1 1,17 V7 A6,6 0 0 1 7,1 Z"), i.appendChild(c);
                        var s = document.createElement("div");
                        s.className = "gradient-stop-marker-color", s.style.backgroundColor = t.color;
                        var l = document.createElement("div");
                        l.className = "gradient-stop-tooltip", l.innerHTML = "".concat(Dt(Mt(t.color, si.colorFormat))).concat(null !== t.position ? " @ ".concat(parseFloat(t.position.toFixed(3))).concat(t.unit) : ""), r.appendChild(i), r.appendChild(s), r.appendChild(l), a.appendChild(r), requestAnimationFrame((function() {
                            var e = a.getBoundingClientRect(),
                                t = l.getBoundingClientRect(),
                                r = e.left + e.width * (n / 100),
                                o = t.width / 2,
                                i = r - o,
                                c = r + o,
                                s = 0;
                            i < e.left ? s = e.left - i : c > e.right && (s = e.right - c), 0 !== s && (l.style.transform = "translateX(calc(-50% + ".concat(s, "px))"))
                        }))
                    };
                    for (i.s(); !(o = i.n()).done;) c()
                } catch (e) {
                    i.e(e)
                } finally {
                    i.f()
                }
                n.appendChild(a), t.appendChild(n);
                var u = document.createElement("div");
                u.className = "pre-wrapper";
                var d = document.createElement("pre");
                d.className = "styles-block", Nc(null, {
                    "background-image": e.raw
                }, d), u.appendChild(d), kc(u, "background-image: ".concat(e.raw, ";")), t.appendChild(u), s.appendChild(t)
            };
            for (u.s(); !(l = u.n()).done;) d()
        } catch (e) {
            u.e(e)
        } finally {
            u.f()
        }
        return t.appendChild(s), t
    }

    function bs(e, t) {
        var n;
        if (null === e.position) return 0;
        if ("%" === e.unit) return e.position;
        if ("deg" === e.unit) return e.position / 360 * 100;
        if ("px" === e.unit) {
            var r = t.filter((function(e) {
                    return "px" === e.unit && null !== e.position
                })),
                a = Math.max.apply(Math, Co(r.map((function(e) {
                    return e.position
                }))));
            return 0 === a ? 0 : e.position / a * 100
        }
        return null !== (n = e.position) && void 0 !== n ? n : 0
    }

    function ws(e) {
        var t = document.createElement("div");
        t.className = "section", t.id = "layout-visual";
        var n = document.createElement("div");
        n.className = "section-header";
        var r = document.createElement("div");
        r.className = "expandable-area expand-button";
        var a = document.createElement("div");
        a.className = "disclosure-icon";
        var o = document.createElement("div");
        o.className = "section-title", o.innerText = chrome.i18n.getMessage("LABEL_FLEX_GRID_LAYOUT");
        var i = document.createElement("div");
        i.className = "section-actions", r.appendChild(a), r.appendChild(o), n.appendChild(r), n.appendChild(i), t.appendChild(n);
        var c = document.createElement("div");
        c.className = "layout-model";
        var s = document.createElement("div");
        s.className = "layout-outer";
        var l = "grid" === e.display || "inline-grid" === e.display,
            u = !l && ("row" === e.flexDirection || "row-reverse" === e.flexDirection),
            d = !l && ("row-reverse" === e.flexDirection || "column-reverse" === e.flexDirection),
            p = document.createElement("div");
        p.className = "layout-label layout-label-main-start ".concat(l || u ? "horizontal" : "vertical"), p.innerText = d ? "end" : "start";
        var m = document.createElement("div");
        m.className = "layout-label layout-label-main-end ".concat(l || u ? "horizontal" : "vertical"), m.innerText = d ? "start" : "end";
        var f = document.createElement("div");
        f.className = "layout-label layout-label-cross-start ".concat(l || u ? "horizontal" : "vertical"), f.innerText = "start";
        var h = document.createElement("div");
        h.className = "layout-label layout-label-cross-end ".concat(l || u ? "horizontal" : "vertical"), h.innerText = "end", s.appendChild(p), s.appendChild(m), s.appendChild(f), s.appendChild(h);
        var v = document.createElement("div");
        if (v.className = "layout-inner", l) {
            v.classList.add("grid"), v.style.justifyItems = e.justifyItems, v.style.alignItems = e.alignItems, v.style.justifyContent = e.justifyContent, v.style.alignContent = e.alignContent;
            var g = e.columnCount || 3,
                y = Math.min(e.rowCount || 1, 3);
            v.style.gridTemplateColumns = "repeat(".concat(g, ", 1fr)"), v.style.gridTemplateRows = "repeat(".concat(y, ", 1fr)");
            for (var b = g * y, w = 1; w <= b; w++) {
                var x = document.createElement("div");
                x.className = "layout-item", x.innerText = w, v.appendChild(x)
            }
            g > 6 && v.classList.add("hide-numbers")
        } else {
            var E = document.createElement("div");
            E.className = "layout-direction-line ".concat(u ? "horizontal" : "vertical").concat(d ? " reversed" : ""), s.appendChild(E), v.style.display = "flex", v.style.flexDirection = e.flexDirection, v.style.flexWrap = e.flexWrap, v.style.justifyContent = e.justifyContent, v.style.alignItems = e.alignItems, v.style.alignContent = e.alignContent;
            var C = "nowrap" === e.flexWrap ? 3 : 7;
            "nowrap" !== e.flexWrap && v.classList.add("wrapping");
            for (var L = 1; L <= C; L++) {
                var N = document.createElement("div");
                N.className = "layout-item", N.innerText = L, v.appendChild(N)
            }
        }
        s.appendChild(v), c.appendChild(s), t.appendChild(c);
        var k = document.createElement("div");
        k.className = "pre-wrapper";
        var _, T = document.createElement("pre");
        return T.className = "styles-block", Nc(null, _ = l ? {
            display: e.display,
            "grid-template-columns": e.gridTemplateColumns,
            "grid-template-rows": "none" !== e.gridTemplateRows ? e.gridTemplateRows : void 0,
            "justify-items": "normal" !== e.justifyItems ? e.justifyItems : void 0,
            "align-items": "normal" !== e.alignItems ? e.alignItems : void 0,
            "justify-content": "normal" !== e.justifyContent ? e.justifyContent : void 0,
            "align-content": "normal" !== e.alignContent ? e.alignContent : void 0,
            gap: "normal normal" !== e.gap && "0px" !== e.gap ? e.gap : void 0
        } : {
            display: e.display,
            "flex-direction": "row" !== e.flexDirection ? e.flexDirection : void 0,
            "flex-wrap": "nowrap" !== e.flexWrap ? e.flexWrap : void 0,
            "justify-content": "normal" !== e.justifyContent ? e.justifyContent : void 0,
            "align-items": "normal" !== e.alignItems ? e.alignItems : void 0,
            "align-content": "nowrap" !== e.flexWrap && "normal" !== e.alignContent ? e.alignContent : void 0,
            gap: "normal normal" !== e.gap && "0px" !== e.gap ? e.gap : void 0
        }, T), k.appendChild(T), kc(k, Object.entries(_).filter((function(e) {
            return void 0 !== Lo(e, 2)[1]
        })).map((function(e) {
            var t = Lo(e, 2),
                n = t[0],
                r = t[1];
            return "".concat(n, ": ").concat(r, ";")
        })).join("\n")), t.appendChild(k), t
    }
})();