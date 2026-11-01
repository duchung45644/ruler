// Bo doi additions (kept out of this file): the content-script list and the full-page capture handler.
importScripts("bd-background.js");
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
            return n
        };
        var r, n = {},
            a = Object.prototype,
            c = a.hasOwnProperty,
            s = Object.defineProperty || function(e, t, r) {
                e[t] = r.value
            },
            i = "function" == typeof Symbol ? Symbol : {},
            o = i.iterator || "@@iterator",
            u = i.asyncIterator || "@@asyncIterator",
            l = i.toStringTag || "@@toStringTag";

        function p(e, t, r) {
            return Object.defineProperty(e, t, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            p({}, "")
        } catch (r) {
            p = function(e, t, r) {
                return e[t] = r
            }
        }

        function f(e, t, r, n) {
            var a = t && t.prototype instanceof y ? t : y,
                c = Object.create(a.prototype),
                i = new M(n || []);
            return s(c, "_invoke", {
                value: P(e, r, i)
            }), c
        }

        function d(e, t, r) {
            try {
                return {
                    type: "normal",
                    arg: e.call(t, r)
                }
            } catch (e) {
                return {
                    type: "throw",
                    arg: e
                }
            }
        }
        n.wrap = f;
        var h = "suspendedStart",
            v = "suspendedYield",
            m = "executing",
            g = "completed",
            b = {};

        function y() {}

        function x() {}

        function w() {}
        var _ = {};
        p(_, o, (function() {
            return this
        }));
        var k = Object.getPrototypeOf,
            I = k && k(k(R([])));
        I && I !== a && c.call(I, o) && (_ = I);
        var L = w.prototype = y.prototype = Object.create(_);

        function E(e) {
            ["next", "throw", "return"].forEach((function(t) {
                p(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function T(t, r) {
            function n(a, s, i, o) {
                var u = d(t[a], t, s);
                if ("throw" !== u.type) {
                    var l = u.arg,
                        p = l.value;
                    return p && "object" == e(p) && c.call(p, "__await") ? r.resolve(p.__await).then((function(e) {
                        n("next", e, i, o)
                    }), (function(e) {
                        n("throw", e, i, o)
                    })) : r.resolve(p).then((function(e) {
                        l.value = e, i(l)
                    }), (function(e) {
                        return n("throw", e, i, o)
                    }))
                }
                o(u.arg)
            }
            var a;
            s(this, "_invoke", {
                value: function(e, t) {
                    function c() {
                        return new r((function(r, a) {
                            n(e, t, r, a)
                        }))
                    }
                    return a = a ? a.then(c, c) : c()
                }
            })
        }

        function P(e, t, n) {
            var a = h;
            return function(c, s) {
                if (a === m) throw Error("Generator is already running");
                if (a === g) {
                    if ("throw" === c) throw s;
                    return {
                        value: r,
                        done: !0
                    }
                }
                for (n.method = c, n.arg = s;;) {
                    var i = n.delegate;
                    if (i) {
                        var o = S(i, n);
                        if (o) {
                            if (o === b) continue;
                            return o
                        }
                    }
                    if ("next" === n.method) n.sent = n._sent = n.arg;
                    else if ("throw" === n.method) {
                        if (a === h) throw a = g, n.arg;
                        n.dispatchException(n.arg)
                    } else "return" === n.method && n.abrupt("return", n.arg);
                    a = m;
                    var u = d(e, t, n);
                    if ("normal" === u.type) {
                        if (a = n.done ? g : v, u.arg === b) continue;
                        return {
                            value: u.arg,
                            done: n.done
                        }
                    }
                    "throw" === u.type && (a = g, n.method = "throw", n.arg = u.arg)
                }
            }
        }

        function S(e, t) {
            var n = t.method,
                a = e.iterator[n];
            if (a === r) return t.delegate = null, "throw" === n && e.iterator.return && (t.method = "return", t.arg = r, S(e, t), "throw" === t.method) || "return" !== n && (t.method = "throw", t.arg = new TypeError("The iterator does not provide a '" + n + "' method")), b;
            var c = d(a, e.iterator, t.arg);
            if ("throw" === c.type) return t.method = "throw", t.arg = c.arg, t.delegate = null, b;
            var s = c.arg;
            return s ? s.done ? (t[e.resultName] = s.value, t.next = e.nextLoc, "return" !== t.method && (t.method = "next", t.arg = r), t.delegate = null, b) : s : (t.method = "throw", t.arg = new TypeError("iterator result is not an object"), t.delegate = null, b)
        }

        function O(e) {
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
            }], e.forEach(O, this), this.reset(!0)
        }

        function R(t) {
            if (t || "" === t) {
                var n = t[o];
                if (n) return n.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var a = -1,
                        s = function e() {
                            for (; ++a < t.length;)
                                if (c.call(t, a)) return e.value = t[a], e.done = !1, e;
                            return e.value = r, e.done = !0, e
                        };
                    return s.next = s
                }
            }
            throw new TypeError(e(t) + " is not iterable")
        }
        return x.prototype = w, s(L, "constructor", {
            value: w,
            configurable: !0
        }), s(w, "constructor", {
            value: x,
            configurable: !0
        }), x.displayName = p(w, l, "GeneratorFunction"), n.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === x || "GeneratorFunction" === (t.displayName || t.name))
        }, n.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, w) : (e.__proto__ = w, p(e, l, "GeneratorFunction")), e.prototype = Object.create(L), e
        }, n.awrap = function(e) {
            return {
                __await: e
            }
        }, E(T.prototype), p(T.prototype, u, (function() {
            return this
        })), n.AsyncIterator = T, n.async = function(e, t, r, a, c) {
            void 0 === c && (c = Promise);
            var s = new T(f(e, t, r, a), c);
            return n.isGeneratorFunction(t) ? s : s.next().then((function(e) {
                return e.done ? e.value : s.next()
            }))
        }, E(L), p(L, l, "Generator"), p(L, o, (function() {
            return this
        })), p(L, "toString", (function() {
            return "[object Generator]"
        })), n.keys = function(e) {
            var t = Object(e),
                r = [];
            for (var n in t) r.push(n);
            return r.reverse(),
                function e() {
                    for (; r.length;) {
                        var n = r.pop();
                        if (n in t) return e.value = n, e.done = !1, e
                    }
                    return e.done = !0, e
                }
        }, n.values = R, M.prototype = {
            constructor: M,
            reset: function(e) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = r, this.done = !1, this.delegate = null, this.method = "next", this.arg = r, this.tryEntries.forEach(A), !e)
                    for (var t in this) "t" === t.charAt(0) && c.call(this, t) && !isNaN(+t.slice(1)) && (this[t] = r)
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

                function n(n, a) {
                    return i.type = "throw", i.arg = e, t.next = n, a && (t.method = "next", t.arg = r), !!a
                }
                for (var a = this.tryEntries.length - 1; a >= 0; --a) {
                    var s = this.tryEntries[a],
                        i = s.completion;
                    if ("root" === s.tryLoc) return n("end");
                    if (s.tryLoc <= this.prev) {
                        var o = c.call(s, "catchLoc"),
                            u = c.call(s, "finallyLoc");
                        if (o && u) {
                            if (this.prev < s.catchLoc) return n(s.catchLoc, !0);
                            if (this.prev < s.finallyLoc) return n(s.finallyLoc)
                        } else if (o) {
                            if (this.prev < s.catchLoc) return n(s.catchLoc, !0)
                        } else {
                            if (!u) throw Error("try statement without catch or finally");
                            if (this.prev < s.finallyLoc) return n(s.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                    var n = this.tryEntries[r];
                    if (n.tryLoc <= this.prev && c.call(n, "finallyLoc") && this.prev < n.finallyLoc) {
                        var a = n;
                        break
                    }
                }
                a && ("break" === e || "continue" === e) && a.tryLoc <= t && t <= a.finallyLoc && (a = null);
                var s = a ? a.completion : {};
                return s.type = e, s.arg = t, a ? (this.method = "next", this.next = a.finallyLoc, b) : this.complete(s)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), b
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var r = this.tryEntries[t];
                    if (r.finallyLoc === e) return this.complete(r.completion, r.afterLoc), A(r), b
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var r = this.tryEntries[t];
                    if (r.tryLoc === e) {
                        var n = r.completion;
                        if ("throw" === n.type) {
                            var a = n.arg;
                            A(r)
                        }
                        return a
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(e, t, n) {
                return this.delegate = {
                    iterator: R(e),
                    resultName: t,
                    nextLoc: n
                }, "next" === this.method && (this.arg = r), b
            }
        }, n
    }

    function r(e, t, r, n, a, c, s) {
        try {
            var i = e[c](s),
                o = i.value
        } catch (e) {
            return void r(e)
        }
        i.done ? t(o) : Promise.resolve(o).then(n, a)
    }

    function n(e) {
        return function() {
            var t = this,
                n = arguments;
            return new Promise((function(a, c) {
                var s = e.apply(t, n);

                function i(e) {
                    r(s, a, c, i, o, "next", e)
                }

                function o(e) {
                    r(s, a, c, i, o, "throw", e)
                }
                i(void 0)
            }))
        }
    }
    var a = {};

    function c(e) {
        return function() {
            for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++) r[n] = arguments[n];
            return new Promise((function(t, n) {
                e.apply(void 0, r.concat([function(e) {
                    chrome.runtime.lastError ? n(new Error(chrome.runtime.lastError.message || JSON.stringify(chrome.runtime.lastError))) : t(e)
                }]))
            }))
        }
    }
    a.tabsQuery = c(chrome.tabs.query.bind(chrome.tabs)), a.tabsCreate = c(chrome.tabs.create.bind(chrome.tabs)), a.tabsUpdate = c(chrome.tabs.update.bind(chrome.tabs)), a.windowsUpdate = c(chrome.windows.update.bind(chrome.windows)), a.executeScript = c(chrome.scripting.executeScript.bind(chrome.scripting)), a.sendMessageToTab = c(chrome.tabs.sendMessage.bind(chrome.tabs)), a.sendMessage = c(chrome.runtime.sendMessage.bind(chrome.runtime)), a.contextMenusCreate = c(chrome.contextMenus.create.bind(chrome.contextMenus)), a.contextMenusRemoveAll = c(chrome.contextMenus.removeAll.bind(chrome.contextMenus)), a.contextMenusUpdate = c(chrome.contextMenus.update.bind(chrome.contextMenus)), a.setActionIcon = c(chrome.action.setIcon.bind(chrome.action)), a.storageLocalGet = c(chrome.storage.local.get.bind(chrome.storage.local)), a.storageLocalSet = c(chrome.storage.local.set.bind(chrome.storage.local)), a.storageLocalRemove = c(chrome.storage.local.remove.bind(chrome.storage.local)), a.getPlatformInfo = c(chrome.runtime.getPlatformInfo.bind(chrome.runtime)), a.commandsGetAll = c(chrome.commands.getAll.bind(chrome.commands)), a.getContexts = c(chrome.runtime.getContexts.bind(chrome.runtime)), a.onPageChangedRemoveRules = chrome.declarativeContent ? c(chrome.declarativeContent.onPageChanged.removeRules.bind(chrome.declarativeContent.onPageChanged)) : n(t().mark((function e() {
        return t().wrap((function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                case "end":
                    return e.stop()
            }
        }), e)
    }))), a.onPageChangedAddRules = chrome.declarativeContent ? c(chrome.declarativeContent.onPageChanged.addRules.bind(chrome.declarativeContent.onPageChanged)) : n(t().mark((function e() {
        return t().wrap((function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                case "end":
                    return e.stop()
            }
        }), e)
    }))), a.actionDisable = c(chrome.action.disable.bind(chrome.action)), a.captureTab = c(chrome.tabs.captureVisibleTab.bind(chrome.tabs)), a.windowsCreate = c(chrome.windows.create.bind(chrome.windows)), a.windowsGetCurrent = c(chrome.windows.getCurrent.bind(chrome.windows)), a.updateSessionRules = chrome.declarativeNetRequest ? c(chrome.declarativeNetRequest.updateSessionRules.bind(chrome.declarativeNetRequest)) : n(t().mark((function e() {
        return t().wrap((function(e) {
            for (;;) switch (e.prev = e.next) {
                case 0:
                case "end":
                    return e.stop()
            }
        }), e)
    }))), a.sendOptionalMessage = function() {
        var e = n(t().mark((function e(r) {
            return t().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, new Promise((function(e) {
                            chrome.runtime.sendMessage(r, (function(t) {
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
        var e = n(t().mark((function e(r, n) {
            return t().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, new Promise((function(e) {
                            chrome.tabs.sendMessage(r, n, (function(t) {
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
        return function(t, r) {
            return e.apply(this, arguments)
        }
    }();
    const s = a;
    const i = { MIN_MCP_SERVER_VERSION: "0.5.0" };

    function o(e) {
        return o = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, o(e)
    }

    function u() {
        u = function() {
            return t
        };
        var e, t = {},
            r = Object.prototype,
            n = r.hasOwnProperty,
            a = Object.defineProperty || function(e, t, r) {
                e[t] = r.value
            },
            c = "function" == typeof Symbol ? Symbol : {},
            s = c.iterator || "@@iterator",
            i = c.asyncIterator || "@@asyncIterator",
            l = c.toStringTag || "@@toStringTag";

        function p(e, t, r) {
            return Object.defineProperty(e, t, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            p({}, "")
        } catch (e) {
            p = function(e, t, r) {
                return e[t] = r
            }
        }

        function f(e, t, r, n) {
            var c = t && t.prototype instanceof y ? t : y,
                s = Object.create(c.prototype),
                i = new M(n || []);
            return a(s, "_invoke", {
                value: P(e, r, i)
            }), s
        }

        function d(e, t, r) {
            try {
                return {
                    type: "normal",
                    arg: e.call(t, r)
                }
            } catch (e) {
                return {
                    type: "throw",
                    arg: e
                }
            }
        }
        t.wrap = f;
        var h = "suspendedStart",
            v = "suspendedYield",
            m = "executing",
            g = "completed",
            b = {};

        function y() {}

        function x() {}

        function w() {}
        var _ = {};
        p(_, s, (function() {
            return this
        }));
        var k = Object.getPrototypeOf,
            I = k && k(k(R([])));
        I && I !== r && n.call(I, s) && (_ = I);
        var L = w.prototype = y.prototype = Object.create(_);

        function E(e) {
            ["next", "throw", "return"].forEach((function(t) {
                p(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function T(e, t) {
            function r(a, c, s, i) {
                var u = d(e[a], e, c);
                if ("throw" !== u.type) {
                    var l = u.arg,
                        p = l.value;
                    return p && "object" == o(p) && n.call(p, "__await") ? t.resolve(p.__await).then((function(e) {
                        r("next", e, s, i)
                    }), (function(e) {
                        r("throw", e, s, i)
                    })) : t.resolve(p).then((function(e) {
                        l.value = e, s(l)
                    }), (function(e) {
                        return r("throw", e, s, i)
                    }))
                }
                i(u.arg)
            }
            var c;
            a(this, "_invoke", {
                value: function(e, n) {
                    function a() {
                        return new t((function(t, a) {
                            r(e, n, t, a)
                        }))
                    }
                    return c = c ? c.then(a, a) : a()
                }
            })
        }

        function P(t, r, n) {
            var a = h;
            return function(c, s) {
                if (a === m) throw Error("Generator is already running");
                if (a === g) {
                    if ("throw" === c) throw s;
                    return {
                        value: e,
                        done: !0
                    }
                }
                for (n.method = c, n.arg = s;;) {
                    var i = n.delegate;
                    if (i) {
                        var o = S(i, n);
                        if (o) {
                            if (o === b) continue;
                            return o
                        }
                    }
                    if ("next" === n.method) n.sent = n._sent = n.arg;
                    else if ("throw" === n.method) {
                        if (a === h) throw a = g, n.arg;
                        n.dispatchException(n.arg)
                    } else "return" === n.method && n.abrupt("return", n.arg);
                    a = m;
                    var u = d(t, r, n);
                    if ("normal" === u.type) {
                        if (a = n.done ? g : v, u.arg === b) continue;
                        return {
                            value: u.arg,
                            done: n.done
                        }
                    }
                    "throw" === u.type && (a = g, n.method = "throw", n.arg = u.arg)
                }
            }
        }

        function S(t, r) {
            var n = r.method,
                a = t.iterator[n];
            if (a === e) return r.delegate = null, "throw" === n && t.iterator.return && (r.method = "return", r.arg = e, S(t, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), b;
            var c = d(a, t.iterator, r.arg);
            if ("throw" === c.type) return r.method = "throw", r.arg = c.arg, r.delegate = null, b;
            var s = c.arg;
            return s ? s.done ? (r[t.resultName] = s.value, r.next = t.nextLoc, "return" !== r.method && (r.method = "next", r.arg = e), r.delegate = null, b) : s : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, b)
        }

        function O(e) {
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
            }], e.forEach(O, this), this.reset(!0)
        }

        function R(t) {
            if (t || "" === t) {
                var r = t[s];
                if (r) return r.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var a = -1,
                        c = function r() {
                            for (; ++a < t.length;)
                                if (n.call(t, a)) return r.value = t[a], r.done = !1, r;
                            return r.value = e, r.done = !0, r
                        };
                    return c.next = c
                }
            }
            throw new TypeError(o(t) + " is not iterable")
        }
        return x.prototype = w, a(L, "constructor", {
            value: w,
            configurable: !0
        }), a(w, "constructor", {
            value: x,
            configurable: !0
        }), x.displayName = p(w, l, "GeneratorFunction"), t.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === x || "GeneratorFunction" === (t.displayName || t.name))
        }, t.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, w) : (e.__proto__ = w, p(e, l, "GeneratorFunction")), e.prototype = Object.create(L), e
        }, t.awrap = function(e) {
            return {
                __await: e
            }
        }, E(T.prototype), p(T.prototype, i, (function() {
            return this
        })), t.AsyncIterator = T, t.async = function(e, r, n, a, c) {
            void 0 === c && (c = Promise);
            var s = new T(f(e, r, n, a), c);
            return t.isGeneratorFunction(r) ? s : s.next().then((function(e) {
                return e.done ? e.value : s.next()
            }))
        }, E(L), p(L, l, "Generator"), p(L, s, (function() {
            return this
        })), p(L, "toString", (function() {
            return "[object Generator]"
        })), t.keys = function(e) {
            var t = Object(e),
                r = [];
            for (var n in t) r.push(n);
            return r.reverse(),
                function e() {
                    for (; r.length;) {
                        var n = r.pop();
                        if (n in t) return e.value = n, e.done = !1, e
                    }
                    return e.done = !0, e
                }
        }, t.values = R, M.prototype = {
            constructor: M,
            reset: function(t) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = e, this.done = !1, this.delegate = null, this.method = "next", this.arg = e, this.tryEntries.forEach(A), !t)
                    for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = e)
            },
            stop: function() {
                this.done = !0;
                var e = this.tryEntries[0].completion;
                if ("throw" === e.type) throw e.arg;
                return this.rval
            },
            dispatchException: function(t) {
                if (this.done) throw t;
                var r = this;

                function a(n, a) {
                    return i.type = "throw", i.arg = t, r.next = n, a && (r.method = "next", r.arg = e), !!a
                }
                for (var c = this.tryEntries.length - 1; c >= 0; --c) {
                    var s = this.tryEntries[c],
                        i = s.completion;
                    if ("root" === s.tryLoc) return a("end");
                    if (s.tryLoc <= this.prev) {
                        var o = n.call(s, "catchLoc"),
                            u = n.call(s, "finallyLoc");
                        if (o && u) {
                            if (this.prev < s.catchLoc) return a(s.catchLoc, !0);
                            if (this.prev < s.finallyLoc) return a(s.finallyLoc)
                        } else if (o) {
                            if (this.prev < s.catchLoc) return a(s.catchLoc, !0)
                        } else {
                            if (!u) throw Error("try statement without catch or finally");
                            if (this.prev < s.finallyLoc) return a(s.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                    var a = this.tryEntries[r];
                    if (a.tryLoc <= this.prev && n.call(a, "finallyLoc") && this.prev < a.finallyLoc) {
                        var c = a;
                        break
                    }
                }
                c && ("break" === e || "continue" === e) && c.tryLoc <= t && t <= c.finallyLoc && (c = null);
                var s = c ? c.completion : {};
                return s.type = e, s.arg = t, c ? (this.method = "next", this.next = c.finallyLoc, b) : this.complete(s)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), b
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var r = this.tryEntries[t];
                    if (r.finallyLoc === e) return this.complete(r.completion, r.afterLoc), A(r), b
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var r = this.tryEntries[t];
                    if (r.tryLoc === e) {
                        var n = r.completion;
                        if ("throw" === n.type) {
                            var a = n.arg;
                            A(r)
                        }
                        return a
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(t, r, n) {
                return this.delegate = {
                    iterator: R(t),
                    resultName: r,
                    nextLoc: n
                }, "next" === this.method && (this.arg = e), b
            }
        }, t
    }

    function l(e, t, r) {
        return (t = function(e) {
            var t = function(e, t) {
                if ("object" != o(e) || !e) return e;
                var r = e[Symbol.toPrimitive];
                if (void 0 !== r) {
                    var n = r.call(e, t || "default");
                    if ("object" != o(n)) return n;
                    throw new TypeError("@@toPrimitive must return a primitive value.")
                }
                return ("string" === t ? String : Number)(e)
            }(e, "string");
            return "symbol" == o(t) ? t : t + ""
        }(t)) in e ? Object.defineProperty(e, t, {
            value: r,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = r, e
    }

    function p(e, t, r, n, a, c, s) {
        try {
            var i = e[c](s),
                o = i.value
        } catch (e) {
            return void r(e)
        }
        i.done ? t(o) : Promise.resolve(o).then(n, a)
    }

    function f(e) {
        return function() {
            var t = this,
                r = arguments;
            return new Promise((function(n, a) {
                var c = e.apply(t, r);

                function s(e) {
                    p(c, n, a, s, i, "next", e)
                }

                function i(e) {
                    p(c, n, a, s, i, "throw", e)
                }
                s(void 0)
            }))
        }
    }
    var d, h = new Set(["installedAt"]),
        v = Symbol("removed"),
        m = new Map;

    function g(e, t) {
        return e === v ? void 0 === t : void 0 !== t && t === e
    }

    function b(e, t) {
        return y.apply(this, arguments)
    }

    function y() {
        return (y = f(u().mark((function e(t, r) {
            return u().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (void 0 !== r) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return", x(t));
                    case 2:
                        return m.set(t, r), e.next = 5, s.storageLocalSet(l({}, t, r));
                    case 5:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function x(e) {
        return w.apply(this, arguments)
    }

    function w() {
        return (w = f(u().mark((function e(t) {
            return u().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return m.set(t, v), e.next = 3, s.storageLocalRemove(t);
                    case 3:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function _() {
        return (_ = f(u().mark((function e(t, r) {
            var n, a, c, s, i;
            return u().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if ("local" === r) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        n = 0, a = Object.keys(t);
                    case 3:
                        if (!(n < a.length)) {
                            e.next = 27;
                            break
                        }
                        if (c = a[n], h.has(c)) {
                            e.next = 7;
                            break
                        }
                        return e.abrupt("continue", 24);
                    case 7:
                        if (s = t[c], m.has(c) || m.set(c, void 0 === s.oldValue ? v : s.oldValue), !g(i = m.get(c), s.newValue)) {
                            e.next = 12;
                            break
                        }
                        return e.abrupt("continue", 24);
                    case 12:
                        if (e.prev = 12, i !== v) {
                            e.next = 18;
                            break
                        }
                        return e.next = 16, x(c);
                    case 16:
                        e.next = 20;
                        break;
                    case 18:
                        return e.next = 20, b(c, i);
                    case 20:
                        e.next = 24;
                        break;
                    case 22:
                        e.prev = 22, e.t0 = e.catch(12);
                    case 24:
                        n++, e.next = 3;
                        break;
                    case 27:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [12, 22]
            ])
        })))).apply(this, arguments)
    }

    function k(e) {
        return k = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        } : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, k(e)
    }

    function I(e, t) {
        var r = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var n = Object.getOwnPropertySymbols(e);
            t && (n = n.filter((function(t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable
            }))), r.push.apply(r, n)
        }
        return r
    }

    function L(e) {
        for (var t = 1; t < arguments.length; t++) {
            var r = null != arguments[t] ? arguments[t] : {};
            t % 2 ? I(Object(r), !0).forEach((function(t) {
                E(e, t, r[t])
            })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r)) : I(Object(r)).forEach((function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t))
            }))
        }
        return e
    }

    function E(e, t, r) {
        return (t = function(e) {
            var t = function(e, t) {
                if ("object" != k(e) || !e) return e;
                var r = e[Symbol.toPrimitive];
                if (void 0 !== r) {
                    var n = r.call(e, t || "default");
                    if ("object" != k(n)) return n;
                    throw new TypeError("@@toPrimitive must return a primitive value.")
                }
                return ("string" === t ? String : Number)(e)
            }(e, "string");
            return "symbol" == k(t) ? t : t + ""
        }(t)) in e ? Object.defineProperty(e, t, {
            value: r,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = r, e
    }

    function T(e, t) {
        var r = "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
        if (!r) {
            if (Array.isArray(e) || (r = O(e)) || t && e && "number" == typeof e.length) {
                r && (e = r);
                var n = 0,
                    a = function() {};
                return {
                    s: a,
                    n: function() {
                        return n >= e.length ? {
                            done: !0
                        } : {
                            done: !1,
                            value: e[n++]
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
        var c, s = !0,
            i = !1;
        return {
            s: function() {
                r = r.call(e)
            },
            n: function() {
                var e = r.next();
                return s = e.done, e
            },
            e: function(e) {
                i = !0, c = e
            },
            f: function() {
                try {
                    s || null == r.return || r.return()
                } finally {
                    if (i) throw c
                }
            }
        }
    }

    function P() {
        P = function() {
            return t
        };
        var e, t = {},
            r = Object.prototype,
            n = r.hasOwnProperty,
            a = Object.defineProperty || function(e, t, r) {
                e[t] = r.value
            },
            c = "function" == typeof Symbol ? Symbol : {},
            s = c.iterator || "@@iterator",
            i = c.asyncIterator || "@@asyncIterator",
            o = c.toStringTag || "@@toStringTag";

        function u(e, t, r) {
            return Object.defineProperty(e, t, {
                value: r,
                enumerable: !0,
                configurable: !0,
                writable: !0
            }), e[t]
        }
        try {
            u({}, "")
        } catch (e) {
            u = function(e, t, r) {
                return e[t] = r
            }
        }

        function l(e, t, r, n) {
            var c = t && t.prototype instanceof g ? t : g,
                s = Object.create(c.prototype),
                i = new M(n || []);
            return a(s, "_invoke", {
                value: T(e, r, i)
            }), s
        }

        function p(e, t, r) {
            try {
                return {
                    type: "normal",
                    arg: e.call(t, r)
                }
            } catch (e) {
                return {
                    type: "throw",
                    arg: e
                }
            }
        }
        t.wrap = l;
        var f = "suspendedStart",
            d = "suspendedYield",
            h = "executing",
            v = "completed",
            m = {};

        function g() {}

        function b() {}

        function y() {}
        var x = {};
        u(x, s, (function() {
            return this
        }));
        var w = Object.getPrototypeOf,
            _ = w && w(w(R([])));
        _ && _ !== r && n.call(_, s) && (x = _);
        var I = y.prototype = g.prototype = Object.create(x);

        function L(e) {
            ["next", "throw", "return"].forEach((function(t) {
                u(e, t, (function(e) {
                    return this._invoke(t, e)
                }))
            }))
        }

        function E(e, t) {
            function r(a, c, s, i) {
                var o = p(e[a], e, c);
                if ("throw" !== o.type) {
                    var u = o.arg,
                        l = u.value;
                    return l && "object" == k(l) && n.call(l, "__await") ? t.resolve(l.__await).then((function(e) {
                        r("next", e, s, i)
                    }), (function(e) {
                        r("throw", e, s, i)
                    })) : t.resolve(l).then((function(e) {
                        u.value = e, s(u)
                    }), (function(e) {
                        return r("throw", e, s, i)
                    }))
                }
                i(o.arg)
            }
            var c;
            a(this, "_invoke", {
                value: function(e, n) {
                    function a() {
                        return new t((function(t, a) {
                            r(e, n, t, a)
                        }))
                    }
                    return c = c ? c.then(a, a) : a()
                }
            })
        }

        function T(t, r, n) {
            var a = f;
            return function(c, s) {
                if (a === h) throw Error("Generator is already running");
                if (a === v) {
                    if ("throw" === c) throw s;
                    return {
                        value: e,
                        done: !0
                    }
                }
                for (n.method = c, n.arg = s;;) {
                    var i = n.delegate;
                    if (i) {
                        var o = S(i, n);
                        if (o) {
                            if (o === m) continue;
                            return o
                        }
                    }
                    if ("next" === n.method) n.sent = n._sent = n.arg;
                    else if ("throw" === n.method) {
                        if (a === f) throw a = v, n.arg;
                        n.dispatchException(n.arg)
                    } else "return" === n.method && n.abrupt("return", n.arg);
                    a = h;
                    var u = p(t, r, n);
                    if ("normal" === u.type) {
                        if (a = n.done ? v : d, u.arg === m) continue;
                        return {
                            value: u.arg,
                            done: n.done
                        }
                    }
                    "throw" === u.type && (a = v, n.method = "throw", n.arg = u.arg)
                }
            }
        }

        function S(t, r) {
            var n = r.method,
                a = t.iterator[n];
            if (a === e) return r.delegate = null, "throw" === n && t.iterator.return && (r.method = "return", r.arg = e, S(t, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), m;
            var c = p(a, t.iterator, r.arg);
            if ("throw" === c.type) return r.method = "throw", r.arg = c.arg, r.delegate = null, m;
            var s = c.arg;
            return s ? s.done ? (r[t.resultName] = s.value, r.next = t.nextLoc, "return" !== r.method && (r.method = "next", r.arg = e), r.delegate = null, m) : s : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, m)
        }

        function O(e) {
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
            }], e.forEach(O, this), this.reset(!0)
        }

        function R(t) {
            if (t || "" === t) {
                var r = t[s];
                if (r) return r.call(t);
                if ("function" == typeof t.next) return t;
                if (!isNaN(t.length)) {
                    var a = -1,
                        c = function r() {
                            for (; ++a < t.length;)
                                if (n.call(t, a)) return r.value = t[a], r.done = !1, r;
                            return r.value = e, r.done = !0, r
                        };
                    return c.next = c
                }
            }
            throw new TypeError(k(t) + " is not iterable")
        }
        return b.prototype = y, a(I, "constructor", {
            value: y,
            configurable: !0
        }), a(y, "constructor", {
            value: b,
            configurable: !0
        }), b.displayName = u(y, o, "GeneratorFunction"), t.isGeneratorFunction = function(e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === b || "GeneratorFunction" === (t.displayName || t.name))
        }, t.mark = function(e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, y) : (e.__proto__ = y, u(e, o, "GeneratorFunction")), e.prototype = Object.create(I), e
        }, t.awrap = function(e) {
            return {
                __await: e
            }
        }, L(E.prototype), u(E.prototype, i, (function() {
            return this
        })), t.AsyncIterator = E, t.async = function(e, r, n, a, c) {
            void 0 === c && (c = Promise);
            var s = new E(l(e, r, n, a), c);
            return t.isGeneratorFunction(r) ? s : s.next().then((function(e) {
                return e.done ? e.value : s.next()
            }))
        }, L(I), u(I, o, "Generator"), u(I, s, (function() {
            return this
        })), u(I, "toString", (function() {
            return "[object Generator]"
        })), t.keys = function(e) {
            var t = Object(e),
                r = [];
            for (var n in t) r.push(n);
            return r.reverse(),
                function e() {
                    for (; r.length;) {
                        var n = r.pop();
                        if (n in t) return e.value = n, e.done = !1, e
                    }
                    return e.done = !0, e
                }
        }, t.values = R, M.prototype = {
            constructor: M,
            reset: function(t) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = e, this.done = !1, this.delegate = null, this.method = "next", this.arg = e, this.tryEntries.forEach(A), !t)
                    for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = e)
            },
            stop: function() {
                this.done = !0;
                var e = this.tryEntries[0].completion;
                if ("throw" === e.type) throw e.arg;
                return this.rval
            },
            dispatchException: function(t) {
                if (this.done) throw t;
                var r = this;

                function a(n, a) {
                    return i.type = "throw", i.arg = t, r.next = n, a && (r.method = "next", r.arg = e), !!a
                }
                for (var c = this.tryEntries.length - 1; c >= 0; --c) {
                    var s = this.tryEntries[c],
                        i = s.completion;
                    if ("root" === s.tryLoc) return a("end");
                    if (s.tryLoc <= this.prev) {
                        var o = n.call(s, "catchLoc"),
                            u = n.call(s, "finallyLoc");
                        if (o && u) {
                            if (this.prev < s.catchLoc) return a(s.catchLoc, !0);
                            if (this.prev < s.finallyLoc) return a(s.finallyLoc)
                        } else if (o) {
                            if (this.prev < s.catchLoc) return a(s.catchLoc, !0)
                        } else {
                            if (!u) throw Error("try statement without catch or finally");
                            if (this.prev < s.finallyLoc) return a(s.finallyLoc)
                        }
                    }
                }
            },
            abrupt: function(e, t) {
                for (var r = this.tryEntries.length - 1; r >= 0; --r) {
                    var a = this.tryEntries[r];
                    if (a.tryLoc <= this.prev && n.call(a, "finallyLoc") && this.prev < a.finallyLoc) {
                        var c = a;
                        break
                    }
                }
                c && ("break" === e || "continue" === e) && c.tryLoc <= t && t <= c.finallyLoc && (c = null);
                var s = c ? c.completion : {};
                return s.type = e, s.arg = t, c ? (this.method = "next", this.next = c.finallyLoc, m) : this.complete(s)
            },
            complete: function(e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), m
            },
            finish: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var r = this.tryEntries[t];
                    if (r.finallyLoc === e) return this.complete(r.completion, r.afterLoc), A(r), m
                }
            },
            catch: function(e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var r = this.tryEntries[t];
                    if (r.tryLoc === e) {
                        var n = r.completion;
                        if ("throw" === n.type) {
                            var a = n.arg;
                            A(r)
                        }
                        return a
                    }
                }
                throw Error("illegal catch attempt")
            },
            delegateYield: function(t, r, n) {
                return this.delegate = {
                    iterator: R(t),
                    resultName: r,
                    nextLoc: n
                }, "next" === this.method && (this.arg = e), m
            }
        }, t
    }

    function S(e, t) {
        return function(e) {
            if (Array.isArray(e)) return e
        }(e) || function(e, t) {
            var r = null == e ? null : "undefined" != typeof Symbol && e[Symbol.iterator] || e["@@iterator"];
            if (null != r) {
                var n, a, c, s, i = [],
                    o = !0,
                    u = !1;
                try {
                    if (c = (r = r.call(e)).next, 0 === t) {
                        if (Object(r) !== r) return;
                        o = !1
                    } else
                        for (; !(o = (n = c.call(r)).done) && (i.push(n.value), i.length !== t); o = !0);
                } catch (e) {
                    u = !0, a = e
                } finally {
                    try {
                        if (!o && null != r.return && (s = r.return(), Object(s) !== s)) return
                    } finally {
                        if (u) throw a
                    }
                }
                return i
            }
        }(e, t) || O(e, t) || function() {
            throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")
        }()
    }

    function O(e, t) {
        if (e) {
            if ("string" == typeof e) return A(e, t);
            var r = {}.toString.call(e).slice(8, -1);
            return "Object" === r && e.constructor && (r = e.constructor.name), "Map" === r || "Set" === r ? Array.from(e) : "Arguments" === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r) ? A(e, t) : void 0
        }
    }

    function A(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
        return n
    }

    function M(e, t, r, n, a, c, s) {
        try {
            var i = e[c](s),
                o = i.value
        } catch (e) {
            return void r(e)
        }
        i.done ? t(o) : Promise.resolve(o).then(n, a)
    }

    function R(e) {
        return function() {
            var t = this,
                r = arguments;
            return new Promise((function(n, a) {
                var c = e.apply(t, r);

                function s(e) {
                    M(c, n, a, s, i, "next", e)
                }

                function i(e) {
                    M(c, n, a, s, i, "throw", e)
                }
                s(void 0)
            }))
        }
    }
    var N = new Map;

    function j(e) {
        var t = N.get(e);
        return void 0 !== t && (!(Date.now() - t > 15e3) || (N.delete(e), !1))
    }
    var C = new Set,
        D = new Map,
        U = Promise.resolve();

    function G() {
        return K.apply(this, arguments)
    }

    function K() {
        return (K = R(P().mark((function e() {
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.abrupt("return", !0);
                    case 2:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function F() {
        return (F = R(P().mark((function e(t, r) {
            var n, a;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, G();
                    case 2:
                        if (e.sent) {
                            e.next = 4;
                            break
                        }
                        return e.abrupt("return", {
                            error: "Bo doi MCP requires the Studio tier."
                        });
                    case 4:
                        e.t0 = t, e.next = "list_tabs" === e.t0 ? 7 : "focus_tab" === e.t0 ? 10 : "get_page_info" === e.t0 ? 13 : "get_selected_element" === e.t0 ? 16 : "get_element_details" === e.t0 ? 19 : "get_elements_details" === e.t0 ? 22 : "get_element_outline" === e.t0 ? 25 : "query_selector" === e.t0 ? 28 : "get_element_matched_rules" === e.t0 ? 31 : "get_breakpoints" === e.t0 ? 34 : "get_seo_issues" === e.t0 ? 37 : "get_meta_tags" === e.t0 ? 40 : "get_page_weight" === e.t0 ? 43 : "get_css_custom_properties" === e.t0 ? 46 : "get_typography" === e.t0 ? 49 : "calculate_specificity" === e.t0 ? 52 : "get_colors" === e.t0 ? 55 : "get_assets" === e.t0 ? 58 : "get_layout" === e.t0 ? 61 : "force_element_state" === e.t0 ? 64 : "detect_technologies" === e.t0 ? 67 : "get_a11y_issues" === e.t0 ? 70 : "get_tailwind" === e.t0 ? 73 : "fetch_stylesheet" === e.t0 ? 76 : "enter_responsive_mode" === e.t0 ? 91 : "exit_responsive_mode" === e.t0 ? 94 : "set_viewport" === e.t0 ? 97 : "get_viewport" === e.t0 ? 100 : "set_viewports" === e.t0 ? 103 : "add_viewport" === e.t0 ? 106 : "remove_viewport" === e.t0 ? 109 : "set_zoom" === e.t0 ? 112 : "set_breakpoints_mode" === e.t0 ? 115 : "get_my_edits" === e.t0 ? 118 : "set_text_content" === e.t0 ? 121 : "set_inner_html" === e.t0 ? 124 : "insert_html" === e.t0 ? 127 : "select_element" === e.t0 ? 130 : "get_screenshot" === e.t0 ? 133 : "apply_styles" === e.t0 ? 136 : "add_rule" === e.t0 ? 143 : "set_rule_selector" === e.t0 ? 146 : "revert_css_change" === e.t0 ? 149 : "revert_all_edits" === e.t0 ? 152 : "set_element_classes" === e.t0 ? 155 : "delete_element" === e.t0 ? 158 : "duplicate_element" === e.t0 ? 161 : 164;
                        break;
                    case 7:
                        return e.next = 9, $();
                    case 9:
                    case 12:
                    case 15:
                    case 18:
                    case 21:
                    case 24:
                    case 27:
                    case 30:
                    case 33:
                    case 36:
                    case 39:
                    case 42:
                    case 45:
                    case 48:
                    case 51:
                    case 54:
                    case 57:
                    case 60:
                    case 63:
                    case 66:
                    case 69:
                    case 72:
                    case 75:
                    case 93:
                    case 96:
                    case 99:
                    case 102:
                    case 105:
                    case 108:
                    case 111:
                    case 114:
                    case 117:
                    case 120:
                    case 123:
                    case 126:
                    case 129:
                    case 132:
                    case 135:
                    case 139:
                    case 142:
                    case 145:
                    case 148:
                    case 151:
                    case 154:
                    case 157:
                    case 160:
                    case 163:
                        return e.abrupt("return", e.sent);
                    case 10:
                        return e.next = 12, H(r);
                    case 13:
                        return e.next = 15, q("script", "get_page_info", r);
                    case 16:
                        return e.next = 18, q("script", "get_selected_element", r);
                    case 19:
                        return e.next = 21, q("script", "get_element_details", r, {
                            elementId: r.elementId,
                            viewportId: r.viewportId
                        });
                    case 22:
                        return e.next = 24, q("script", "get_elements_details", r, {
                            elementIds: r.elementIds,
                            viewportId: r.viewportId
                        });
                    case 25:
                        return e.next = 27, q("script", "get_element_outline", r, {
                            elementId: r.elementId,
                            maxDepth: r.maxDepth,
                            maxChildren: r.maxChildren,
                            viewportId: r.viewportId
                        });
                    case 28:
                        return e.next = 30, q("script", "query_selector", r, {
                            selector: r.selector,
                            limit: r.limit,
                            rootId: r.rootId,
                            viewportId: r.viewportId
                        });
                    case 31:
                        return e.next = 33, q("script", "get_element_matched_rules", r, {
                            elementId: r.elementId,
                            viewportId: r.viewportId
                        });
                    case 34:
                        return e.next = 36, q("script", "get_breakpoints", r);
                    case 37:
                        return e.next = 39, q("script", "get_seo_issues", r);
                    case 40:
                        return e.next = 42, q("script", "get_meta_tags", r);
                    case 43:
                        return e.next = 45, q("script", "get_page_weight", r);
                    case 46:
                        return e.next = 48, q("script", "get_css_custom_properties", r);
                    case 49:
                        return e.next = 51, q("script", "get_typography", r, {
                            elementId: r.elementId
                        });
                    case 52:
                        return e.next = 54, q("script", "calculate_specificity", r, {
                            selector: r.selector
                        });
                    case 55:
                        return e.next = 57, q("script", "get_colors", r, {
                            elementId: r.elementId
                        });
                    case 58:
                        return e.next = 60, q("script", "get_assets", r, {
                            elementId: r.elementId
                        });
                    case 61:
                        return e.next = 63, q("script", "get_layout", r, {
                            elementId: r.elementId,
                            viewportId: r.viewportId
                        });
                    case 64:
                        return e.next = 66, q("script", "force_element_state", r, {
                            elementId: r.elementId,
                            state: r.state
                        });
                    case 67:
                        return e.next = 69, q("script", "detect_technologies", r);
                    case 70:
                        return e.next = 72, q("script", "get_a11y_issues", r, {
                            limit: r.limit
                        });
                    case 73:
                        return e.next = 75, q("script", "get_tailwind", r, {
                            elementId: r.elementId
                        });
                    case 76:
                        if (Ue(r.url)) {
                            e.next = 78;
                            break
                        }
                        return e.abrupt("return", {
                            error: "fetch_stylesheet rejected: URL must be http(s) and not a private/localhost host."
                        });
                    case 78:
                        return e.prev = 78, e.next = 81, Fe(r.url);
                    case 81:
                        return n = e.sent, e.next = 84, n.text();
                    case 84:
                        return a = e.sent, e.abrupt("return", {
                            success: !0,
                            status: n.status,
                            text: a
                        });
                    case 88:
                        return e.prev = 88, e.t1 = e.catch(78), e.abrupt("return", {
                            success: !1,
                            error: String(e.t1 && e.t1.message ? e.t1.message : e.t1)
                        });
                    case 91:
                        return e.next = 93, q("script", "enter_responsive_mode", r);
                    case 94:
                        return e.next = 96, q("script", "exit_responsive_mode", r);
                    case 97:
                        return e.next = 99, q("script", "set_viewport", r, {
                            width: r.width,
                            height: r.height,
                            viewportId: r.viewportId
                        });
                    case 100:
                        return e.next = 102, q("script", "get_viewport", r);
                    case 103:
                        return e.next = 105, q("script", "set_viewports", r, {
                            viewports: r.viewports
                        });
                    case 106:
                        return e.next = 108, q("script", "add_viewport", r, {
                            width: r.width,
                            height: r.height,
                            name: r.name
                        });
                    case 109:
                        return e.next = 111, q("script", "remove_viewport", r, {
                            viewportId: r.viewportId
                        });
                    case 112:
                        return e.next = 114, q("script", "set_zoom", r, {
                            zoom: r.zoom
                        });
                    case 115:
                        return e.next = 117, q("script", "set_breakpoints_mode", r, {
                            enabled: r.enabled
                        });
                    case 118:
                        return e.next = 120, q("script", "get_my_edits", r);
                    case 121:
                        return e.next = 123, q("script", "set_text_content", r, {
                            elementId: r.elementId,
                            text: r.text
                        });
                    case 124:
                        return e.next = 126, q("script", "set_inner_html", r, {
                            elementId: r.elementId,
                            html: r.html
                        });
                    case 127:
                        return e.next = 129, q("script", "insert_html", r, {
                            elementId: r.elementId,
                            html: r.html,
                            position: r.position
                        });
                    case 130:
                        return e.next = 132, q("script", "select_edited_element", r, {
                            elementId: r.elementId
                        });
                    case 133:
                        return e.next = 135, q("script", "capture_for_ai", r);
                    case 136:
                        if (!r.ruleRef) {
                            e.next = 140;
                            break
                        }
                        return e.next = 139, q("rule_editor", "merge_rule_styles", r, {
                            ref: r.ruleRef,
                            styles: r.styles || {}
                        });
                    case 140:
                        return e.next = 142, q("editor", "set_element_styles", r, {
                            elementId: r.elementId,
                            data: {
                                styles: r.styles || {},
                                state: r.state || "",
                                media: r.media || "",
                                pseudo: r.pseudo || ""
                            }
                        });
                    case 143:
                        return e.next = 145, q("rule_editor", "rule_add", r, {
                            selector: r.selector,
                            wrappers: r.wrappers || [],
                            styles: r.styles || null,
                            elementId: r.elementId || null
                        });
                    case 146:
                        return e.next = 148, q("rule_editor", "rule_selector_edit", r, {
                            ref: r.ruleRef,
                            selector: r.selector
                        });
                    case 149:
                        return e.next = 151, q("rule_editor", "revert_rule_change", r, {
                            changeId: r.changeId
                        });
                    case 152:
                        return e.next = 154, q("rule_editor", "revert_all_edits", r);
                    case 155:
                        return e.next = 157, q("editor", "set_element_classes", r, {
                            elementId: r.elementId,
                            data: {
                                classes: r.classes || ""
                            }
                        });
                    case 158:
                        return e.next = 160, q("editor", "delete_element", r, {
                            elementId: r.elementId
                        });
                    case 161:
                        return e.next = 163, q("editor", "duplicate_element", r, {
                            elementId: r.elementId
                        });
                    case 164:
                        return e.abrupt("return", {
                            error: "Unknown MCP type: " + t
                        });
                    case 165:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [78, 88]
            ])
        })))).apply(this, arguments)
    }

    function q(e, t, r) {
        return V.apply(this, arguments)
    }

    function V() {
        return V = R(P().mark((function e(t, r, n) {
            var a, c, i, o, u, l = arguments;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (a = l.length > 3 && void 0 !== l[3] ? l[3] : {}, "number" == typeof(c = n && n.tabId)) {
                            e.next = 4;
                            break
                        }
                        return e.abrupt("return", {
                            error: r + " requires a numeric tabId."
                        });
                    case 4:
                        if ("exit_responsive_mode" === r && N.set(c, Date.now()), "exit_responsive_mode" === r || !j(c)) {
                            e.next = 11;
                            break
                        }
                        return e.next = 8, W(c, 1e4);
                    case 8:
                        if (!(e.sent > 5e3)) {
                            e.next = 11;
                            break
                        }
                        return e.abrupt("return", {
                            error: "The page was reloading after a responsive-mode change and is only just ready. Retry " + r + " now."
                        });
                    case 11:
                        return i = B.has(r) ? 4e4 : 12e3, o = null, e.prev = 13, e.next = 16, Promise.race([s.sendMessageToTab(c, L({
                            target: t,
                            action: r
                        }, a)), new Promise((function(e) {
                            o = setTimeout((function() {
                                return e({
                                    error: r + " timed out inside the extension. The page may be busy or mid-reload; try again."
                                })
                            }), i)
                        }))]);
                    case 16:
                        return u = e.sent, e.abrupt("return", u || {
                            error: "Empty response from content script."
                        });
                    case 20:
                        return e.prev = 20, e.t0 = e.catch(13), e.abrupt("return", {
                            error: "Bo doi is not active on this tab. Ask the user to click the Bo doi toolbar icon on that tab."
                        });
                    case 23:
                        return e.prev = 23, null !== o && clearTimeout(o), e.finish(23);
                    case 26:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [13, 20, 23, 26]
            ])
        }))), V.apply(this, arguments)
    }
    chrome.runtime.onInstalled.addListener((function(e) {
        return J.apply(this, arguments)
    })), chrome.runtime.onStartup.addListener((function() {
        return ne.apply(this, arguments)
    })), chrome.action.onClicked.addListener(we), chrome.runtime.onMessage.addListener((function(e, t, r) {
        if ("mcp" === e.target) return function(e, t) {
            return F.apply(this, arguments)
        }(e.type, e.payload).then((function(e) {
            return r(e)
        })).catch((function(e) {
            return r({
                error: String(e)
            })
        })), !0;
        if ("background" !== e.target) return !1;
        if ("request_mcp_connect" === e.action) return R(P().mark((function e() {
            var t;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, s.storageLocalSet({
                            mcpIntent: !0
                        });
                    case 3:
                        return e.next = 5, We();
                    case 5:
                        return r({ success: !0 }), e.abrupt("return");
                    case 14:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 11]
            ])
        })))(), !0;
        if ("mcp_status_changed" === e.action) return R(P().mark((function t() {
            var r, n, a, c, i;
            return P().wrap((function(t) {
                for (;;) switch (t.prev = t.next) {
                    case 0:
                        return t.prev = 0, t.next = 3, G();
                    case 3:
                        return r = t.sent, t.next = 6, s.storageLocalGet({
                            mcpIntent: !1
                        });
                    case 6:
                        return n = t.sent, a = n.mcpIntent, c = void 0 !== a && a, t.next = 11, $();
                    case 11:
                        return i = t.sent, t.next = 14, Promise.all(i.map((function(t) {
                            return s.sendMessageToTab(t.tabId, {
                                target: "script",
                                action: "mcp_status_changed",
                                connected: !!e.connected,
                                versionMismatch: !!e.versionMismatch,
                                client: e.client || null,
                                eligible: r,
                                intent: c
                            }).catch((function() {}))
                        })));
                    case 14:
                        t.next = 18;
                        break;
                    case 16:
                        t.prev = 16, t.t0 = t.catch(0);
                    case 18:
                    case "end":
                        return t.stop()
                }
            }), t, null, [
                [0, 16]
            ])
        })))(), !1;
        if ("request_mcp_status" === e.action) return R(P().mark((function e() {
            var t, n, a, c, i, o;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, s.storageLocalGet({
                            mcpIntent: !1
                        });
                    case 3:
                        return t = e.sent, n = t.mcpIntent, a = void 0 !== n && n, e.next = 8, G();
                    case 8:
                        return c = e.sent, r({
                            intent: a,
                            eligible: c,
                            connected: !1
                        }), e.abrupt("return");
                    case 16:
                        return r(L({
                            intent: a,
                            eligible: c
                        }, {
                            connected: !1
                        })), e.abrupt("return");
                    case 22:
                        e.prev = 22, e.t0 = e.catch(0), r({
                            intent: !1,
                            eligible: !1,
                            connected: !1
                        });
                    case 25:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 22]
            ])
        })))(), !0;
        if ("request_mcp_disconnect" === e.action) return R(P().mark((function e() {
            var t, n;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, s.storageLocalSet({
                            mcpIntent: !1
                        });
                    case 3:
                        return r({ success: !0 }), e.abrupt("return");
                    case 16:
                        e.prev = 16, e.t0 = e.catch(0), r({
                            success: !1,
                            error: String(e.t0 && e.t0.message ? e.t0.message : e.t0)
                        });
                    case 19:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [0, 16]
            ])
        })))(), !0;
        switch (e.action) {
            case "open_external_tab":
                var n = e.url;
                if ("string" != typeof n || !/^https?:/i.test(n)) return r({
                    success: !1,
                    message: "Invalid URL."
                }), !1;
                var a = {
                    url: n,
                    active: !0
                };
                return t.tab && null != t.tab.id && (a.openerTabId = t.tab.id, "number" == typeof t.tab.index && (a.index = t.tab.index + 1)), s.tabsCreate(a).then((function() {
                    return r({
                        success: !0
                    })
                })).catch((function() {
                    s.tabsCreate({
                        url: n,
                        active: !0
                    }).then((function() {
                        return r({
                            success: !0
                        })
                    })).catch((function() {
                        return r({
                            success: !1
                        })
                    }))
                })), !0;
            case "exit_responsive_mode":
                var c, o, u;
                if (Ne(t.tab.id), N.set(t.tab.id, Date.now()), Array.isArray(e.ruleEdits) && e.ruleEdits.length && D.set(t.tab.id, e.ruleEdits), e.enterEditMode) C.add(t.tab.id), null === (c = chrome.sidePanel) || void 0 === c || null === (o = c.open) || void 0 === o || null === (o = o.call(c, {
                    tabId: t.tab.id
                })) || void 0 === o || null === (u = o.catch) || void 0 === u || u.call(o, (function() {}));
                r({
                    success: !0
                });
                break;
            case "fetch_stylesheet":
                return Ue(e.url) ? (Fe(e.url, {
                    signal: AbortSignal.timeout(1e4)
                }).then((function(e) {
                    return e.text()
                })).then((function(e) {
                    return r({
                        success: !0,
                        text: e
                    })
                })).catch((function() {
                    return r({
                        success: !1
                    })
                })), !0) : (r({
                    success: !1
                }), !0);

            case "open_side_panel":
                var l = le.get(t.tab.id);
                return void 0 !== l ? (s.windowsUpdate(l, {
                    focused: !0
                }).then((function() {
                    return r({
                        success: !0
                    })
                })).catch((function() {
                    ge(t.tab.id), r({
                        success: !1
                    })
                })), !0) : chrome.sidePanel ? (chrome.sidePanel.open({
                    tabId: t.tab.id
                }).then((function() {
                    return r({
                        success: !0
                    })
                })).catch((function(e) {
                    r({
                        success: !1,
                        error: e.message
                    })
                })), !0) : (r({
                    success: !1,
                    error: "Side panel API not available in this browser"
                }), !1);
            case "close_side_panel":
                var p = le.get(t.tab.id);
                return void 0 !== p ? (s.windowsUpdate(p, {
                    focused: !0
                }).then((function() {
                    return r({
                        success: !0
                    })
                })).catch((function() {
                    return r({
                        success: !1
                    })
                })), !0) : (chrome.runtime.sendMessage({
                    target: "side_panel",
                    action: "close",
                    tabId: t.tab.id
                }).then((function() {
                    return r({
                        success: !0
                    })
                })).catch((function() {
                    return r({
                        success: !1
                    })
                })), !0);
            case "detach_panel":
                var f = Number(e.tabId);
                return f ? (function(e) {
                    return be.apply(this, arguments)
                }(f, {
                    width: Number(e.width),
                    height: Number(e.height)
                }).then((function() {
                    return r({
                        success: !0
                    })
                })).catch((function(e) {
                    return r({
                        success: !1,
                        error: String((null == e ? void 0 : e.message) || e)
                    })
                })), !0) : (r({
                    success: !1
                }), !1);
            case "dock_panel":
                var d = Number(e.tabId);
                return d && chrome.sidePanel ? (chrome.sidePanel.setOptions({
                    tabId: d,
                    path: me(d),
                    enabled: !0
                }), Promise.resolve(chrome.sidePanel.open({
                    tabId: d
                })).then((function() {
                    return ye(d)
                })).then((function() {
                    return r({
                        success: !0
                    })
                })).catch((function(e) {
                    return r({
                        success: !1,
                        error: String((null == e ? void 0 : e.message) || e)
                    })
                })), !0) : (r({
                    success: !1
                }), !1);
            case "check_panel_api":
                try {
                    chrome.sidePanel ? r({
                        success: !0
                    }) : r({
                        success: !1
                    })
                } catch (e) {
                    r({
                        success: !1
                    })
                }
                break;
            case "request_clipboard_permission":
                return chrome.permissions.request({
                    permissions: ["clipboardWrite"]
                }, (function(e) {
                    r({
                        granted: e
                    })
                })), !0;
            case "enable_frame_header_rule":
                return R(P().mark((function e() {
                    var n;
                    return P().wrap((function(e) {
                        for (;;) switch (e.prev = e.next) {
                            case 0:
                                if (n = t.tab && t.tab.id, e.t0 = !Number.isInteger(n), e.t0) {
                                    e.next = 6;
                                    break
                                }
                                return e.next = 5, new Promise((function(e) {
                                    try {
                                        chrome.permissions.contains({
                                            origins: ["<all_urls>"]
                                        }, (function(t) {
                                            e(!!t && !chrome.runtime.lastError)
                                        }))
                                    } catch (t) {
                                        e(!1)
                                    }
                                }));
                            case 5:
                                e.t0 = !e.sent;
                            case 6:
                                if (!e.t0) {
                                    e.next = 9;
                                    break
                                }
                                return r({
                                    enabled: !1
                                }), e.abrupt("return");
                            case 9:
                                return e.prev = 9, e.next = 12, Me(n);
                            case 12:
                                r({
                                    enabled: !0
                                }), e.next = 19;
                                break;
                            case 15:
                                e.prev = 15, e.t1 = e.catch(9), r({
                                    enabled: !1
                                });
                            case 19:
                            case "end":
                                return e.stop()
                        }
                    }), e, null, [
                        [9, 15]
                    ])
                })))(), !0;
            case "request_frame_unblock":
                return chrome.permissions.request({
                    origins: ["<all_urls>"]
                }, function() {
                    var e = R(P().mark((function e(n) {
                        var a;
                        return P().wrap((function(e) {
                            for (;;) switch (e.prev = e.next) {
                                case 0:
                                    if (!chrome.runtime.lastError && n) {
                                        e.next = 3;
                                        break
                                    }
                                    return r({
                                        granted: !1,
                                        enabled: !1
                                    }), e.abrupt("return");
                                case 3:
                                    if (a = t.tab && t.tab.id, e.prev = 4, !Number.isInteger(a)) {
                                        e.next = 8;
                                        break
                                    }
                                    return e.next = 8, Me(a);
                                case 8:
                                    r({
                                        granted: !0,
                                        enabled: !0
                                    }), e.next = 14;
                                    break;
                                case 11:
                                    e.prev = 11, e.t0 = e.catch(4), r({
                                        granted: !0,
                                        enabled: !1
                                    });
                                case 14:
                                case "end":
                                    return e.stop()
                            }
                        }), e, null, [
                            [4, 11]
                        ])
                    })));
                    return function(t) {
                        return e.apply(this, arguments)
                    }
                }()), !0;
            case "get_tab_id":
                r(t.tab.id);
                break;
            case "has_host_permission":
                return chrome.permissions.contains({
                    origins: ["<all_urls>"]
                }, (function(e) {
                    r({
                        granted: !!e
                    })
                })), !0;
            case "run_tech_detection":
                var h = t.tab.id,
                    v = t.frameId;
                if (!h) return r({
                    success: !1,
                    error: "No tab ID"
                }), !1;
                var m = {
                    tabId: h,
                    frameIds: v ? [v] : void 0
                };
                return chrome.scripting.executeScript({
                    target: m,
                    files: ["scripts/detect-technologies.js"],
                    world: "MAIN"
                }).then((function() {
                    r({
                        success: !0
                    })
                })).catch((function(e) {
                    r({
                        success: !1,
                        error: e.message
                    })
                })), !0;
            case "go_to_tab":
                return s.tabsUpdate(Number(e.tabId), {
                    active: !0
                }).then((function() {
                    return r({
                        success: !0
                    })
                })).catch((function() {
                    return r({
                        success: !1
                    })
                })), !0;
            case "capture_tab":
                return De(t.tab.url) ? (s.captureTab().then((function(t) {
                    return function(e, t, r) {
                        return $e.apply(this, arguments)
                    }(e.data, e.rect, t)
                })).then((function(t) {
                    return r({
                        success: !0,
                        dataUrl: t
                    })
                })).catch((function(e) {
                    r({
                        success: !1,
                        error: "CAPTURE_FAILED",
                        message: "Failed to capture screenshot"
                    })
                })), !0) : void r({
                    success: !1,
                    error: "INVALID_URL",
                    message: "Screenshots are not available on extension pages or restricted URLs"
                });
            case "capture_tab_for_ai":
                return De(t.tab.url) ? ((e.dataUrl ? Promise.resolve(e.dataUrl) : s.captureTab()).then((function(e) {
                    return function(e) {
                        return He.apply(this, arguments)
                    }(e)
                })).then((function(e) {
                    return r(e || {
                        ok: !1,
                        reason: "no_response"
                    })
                })).catch((function() {
                    return r({
                        ok: !1,
                        reason: "capture_failed"
                    })
                })), !0) : void r({
                    ok: !1,
                    reason: "invalid_url"
                });
            case "download_image":
                return De(t.tab.url) ? ((e.dataUrl ? Promise.resolve(e.dataUrl) : s.captureTab()).then((function(t) {
                    return function(e, t) {
                        return ze.apply(this, arguments)
                    }(t, e.pageUrl)
                })).then((function(t) {
                    return r({
                        success: !0,
                        dataUrl: t
                    })
                })).catch((function() {
                    return r({
                        success: !1
                    })
                })), !0) : void r({
                    success: !1
                });

            case "open_options_page":
                try {
                    chrome.runtime.openOptionsPage(), r({
                        success: !0
                    })
                } catch (e) {
                    r({
                        success: !1
                    })
                }
                return !0;
            case "close_extension":
                return s.sendMessageToTab(t.tab.id, {
                    target: "script",
                    action: "toggle_script"
                }).then((function(e) {
                    var r, n;
                    e.scriptIsActive || (null === (r = chrome.sidePanel) || void 0 === r || null === (n = r.setOptions) || void 0 === n || n.call(r, {
                        tabId: t.tab.id,
                        path: "sidepanel/index.html",
                        enabled: !1
                    }), ye(t.tab.id));
                    Te(t.tab.id, e.scriptIsActive)
                })).catch((function(e) {})).finally((function() {
                    return r({
                        success: !0
                    })
                })), !0;
            case "inject_and_activate_iframe":
                return s.executeScript({
                    target: {
                        tabId: t.tab.id,
                        allFrames: !0
                    },
                    files: [...BD_CONTENT_FILES, "scripts/content.js"]
                }).then((function() {
                    return r({
                        success: !0
                    })
                })).catch((function(e) {
                    r({
                        success: !1
                    })
                })), !0;
            case "responsive_iframe_ready":
                return t.tab && t.tab.id && t.frameId && chrome.tabs.sendMessage(t.tab.id, {
                    target: "script",
                    action: "toggle_script_in_iframe_only"
                }, {
                    frameId: t.frameId
                }), !0;
            default:
                return !1
        }
    })), chrome.contextMenus.onClicked.addListener((function(e, t) {
        return Se.apply(this, arguments)
    })), chrome.tabs.onUpdated.addListener((function(e, t, r) {
        return Oe.apply(this, arguments)
    })), chrome.tabs.onActivated.addListener((function(e) {
        return Ce.apply(this, arguments)
    })), chrome.commands.onCommand.addListener((function(e, t) {
        "select_parent" !== e && "select_child" !== e || !t || !t.id || chrome.tabs.sendMessage(t.id, {
            target: "script",
            action: e
        }).catch((function() {}))
    })), chrome.tabs.onRemoved.addListener((function(e) {
        ye(e), Ne(e), N.delete(e), C.delete(e), D.delete(e)
    })), chrome.windows.onRemoved.addListener((function(e) {
        de.delete(e), he.then((function() {
            var t, r = T(le);
            try {
                var n, a = function() {
                    var r = S(t.value, 2),
                        n = r[0];
                    return r[1] !== e ? 0 : (ge(n), s.sendMessageToTab(n, {
                        target: "script",
                        action: "check_script_is_active"
                    }).then((function(e) {
                        var t, r;
                        null != e && e.scriptIsActive && (null === (t = chrome.sidePanel) || void 0 === t || null === (r = t.setOptions) || void 0 === r || r.call(t, {
                            tabId: n,
                            path: me(n),
                            enabled: !0
                        }))
                    })).catch((function() {})), {
                        v: void 0
                    })
                };
                for (r.s(); !(t = r.n()).done;)
                    if (0 !== (n = a()) && n) return n.v
            } catch (e) {
                r.e(e)
            } finally {
                r.f()
            }
        }))
    })), null === (d = chrome.windows.onBoundsChanged) || void 0 === d || d.addListener((function(e) {
        he.then(R(P().mark((function t() {
            var r, n, a, c, i, o, u, l, p, f, d;
            return P().wrap((function(t) {
                for (;;) switch (t.prev = t.next) {
                    case 0:
                        r = T(le.values()), t.prev = 1, r.s();
                    case 3:
                        if ((n = r.n()).done) {
                            t.next = 20;
                            break
                        }
                        if (n.value === e.id) {
                            t.next = 7;
                            break
                        }
                        return t.abrupt("continue", 18);
                    case 7:
                        return a = e.width, c = e.height, i = e.left, o = e.top, u = de.get(e.id), l = !u || u.width !== a || u.height !== c, t.next = 12, s.storageLocalGet({
                            detachedPanelBounds: null
                        });
                    case 12:
                        return p = t.sent, f = p.detachedPanelBounds, d = L(L({}, f || {}), {}, {
                            left: i,
                            top: o
                        }), l && (d.width = a, d.height = c), s.storageLocalSet({
                            detachedPanelBounds: d
                        }).catch((function() {})), t.abrupt("return");
                    case 18:
                        t.next = 3;
                        break;
                    case 20:
                        t.next = 25;
                        break;
                    case 22:
                        t.prev = 22, t.t0 = t.catch(1), r.e(t.t0);
                    case 25:
                        return t.prev = 25, r.f(), t.finish(25);
                    case 28:
                    case "end":
                        return t.stop()
                }
            }), t, null, [
                [1, 22, 25, 28]
            ])
        }))))
    })), chrome.runtime.onMessageExternal.addListener((function(e, t, r) {
        if ("install_timestamp" === e.action) return R(P().mark((function t() {
            var n, a, o;
            return P().wrap((function(t) {
                for (;;) switch (t.prev = t.next) {
                    case 0:
                        return t.prev = 0, t.next = 3, s.storageLocalGet({
                            installedAt: null
                        });
                    case 3:
                        return n = t.sent, a = !n.installedAt, a ? (o = String(Date.now())) : o = n.installedAt, t.next = 9, b("installedAt", o);
                    case 9:
                        r({
                            success: !0,
                            isNew: a
                        }), t.next = 15;
                        break;
                    case 12:
                        t.prev = 12, t.t0 = t.catch(0), r({
                            success: !1
                        });
                    case 15:
                    case "end":
                        return t.stop()
                }
            }), t, null, [
                [0, 21]
            ])
        })))(), !0;
        
    })), chrome.storage.onChanged.addListener((function(e, t) {
        return _.apply(this, arguments)
    })), ae().catch((function() {}));
    var B = new Set(["capture_for_ai", "enter_responsive_mode", "exit_responsive_mode", "set_viewport"]);

    function W(e, t) {
        return Y.apply(this, arguments)
    }

    function Y() {
        return (Y = R(P().mark((function e(t, r) {
            var n, a, c;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        n = Date.now(), a = n + r;
                    case 2:
                        if (!(Date.now() < a)) {
                            e.next = 18;
                            break
                        }
                        if (j(t)) {
                            e.next = 14;
                            break
                        }
                        return e.prev = 4, e.next = 7, s.sendMessageToTab(t, {
                            target: "script",
                            action: "check_script_is_active"
                        });
                    case 7:
                        if (!(c = e.sent) || !c.scriptIsActive) {
                            e.next = 10;
                            break
                        }
                        return e.abrupt("return", Date.now() - n);
                    case 10:
                        e.next = 14;
                        break;
                    case 12:
                        e.prev = 12, e.t0 = e.catch(4);
                    case 14:
                        return e.next = 16, new Promise((function(e) {
                            return setTimeout(e, 250)
                        }));
                    case 16:
                        e.next = 2;
                        break;
                    case 18:
                        return e.abrupt("return", Date.now() - n);
                    case 19:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [4, 12]
            ])
        })))).apply(this, arguments)
    }

    function $() {
        return z.apply(this, arguments)
    }

    function z() {
        return z = R(P().mark((function e() {
            var t, r, n;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, s.tabsQuery({});
                    case 2:
                        return t = e.sent, r = t.map(function() {
                            var e = R(P().mark((function e(t) {
                                var r;
                                return P().wrap((function(e) {
                                    for (;;) switch (e.prev = e.next) {
                                        case 0:
                                            if (t.id) {
                                                e.next = 2;
                                                break
                                            }
                                            return e.abrupt("return", null);
                                        case 2:
                                            return e.prev = 2, e.next = 5, s.sendMessageToTab(t.id, {
                                                target: "script",
                                                action: "check_script_is_active"
                                            });
                                        case 5:
                                            if ((r = e.sent) && !0 === r.scriptIsActive) {
                                                e.next = 8;
                                                break
                                            }
                                            return e.abrupt("return", null);
                                        case 8:
                                            return e.abrupt("return", {
                                                tabId: t.id,
                                                url: t.url || null,
                                                title: t.title || null
                                            });
                                        case 11:
                                            return e.prev = 11, e.t0 = e.catch(2), e.abrupt("return", null);
                                        case 14:
                                        case "end":
                                            return e.stop()
                                    }
                                }), e, null, [
                                    [2, 11]
                                ])
                            })));
                            return function(t) {
                                return e.apply(this, arguments)
                            }
                        }()), e.next = 6, Promise.all(r);
                    case 6:
                        return n = e.sent, e.abrupt("return", n.filter((function(e) {
                            return null !== e
                        })));
                    case 8:
                    case "end":
                        return e.stop()
                }
            }), e)
        }))), z.apply(this, arguments)
    }

    function H(e) {
        return Q.apply(this, arguments)
    }

    function Q() {
        return (Q = R(P().mark((function e(t) {
            var r, n;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if ("number" == typeof(r = t && t.tabId)) {
                            e.next = 3;
                            break
                        }
                        return e.abrupt("return", {
                            success: !1,
                            error: "focus_tab requires a numeric tabId."
                        });
                    case 3:
                        return e.prev = 3, e.next = 6, new Promise((function(e, t) {
                            chrome.tabs.get(r, (function(r) {
                                chrome.runtime.lastError ? t(new Error(chrome.runtime.lastError.message)) : e(r)
                            }))
                        }));
                    case 6:
                        return n = e.sent, e.next = 9, s.tabsUpdate(r, {
                            active: !0
                        });
                    case 9:
                        return e.next = 11, s.windowsUpdate(n.windowId, {
                            focused: !0
                        });
                    case 11:
                        return e.abrupt("return", {
                            success: !0
                        });
                    case 14:
                        return e.prev = 14, e.t0 = e.catch(3), e.abrupt("return", {
                            success: !1,
                            error: String(e.t0 && e.t0.message ? e.t0.message : e.t0)
                        });
                    case 17:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [3, 14]
            ])
        })))).apply(this, arguments)
    }

    function J() {
        return (J = R(P().mark((function e(t) {
            var r, n;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, oe();
                    case 2:
                        return e.next = 4, se();
case 4:
                        null === (r = chrome.sidePanel) || void 0 === r || null === (n = r.setOptions) || void 0 === n || n.call(r, {
                            enabled: !1
                        }), "install" === t.reason || ae().catch((function() {}));
                        case 6:
                        case "end":
                            return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function X() {
        return Z.apply(this, arguments)
    }

    function Z() {
        return (Z = R(P().mark((function e() {
            var t, r, n;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return t = chrome.runtime.id, r = chrome.i18n.getUILanguage(), n = "".concat(t, "&lang=").concat(r), e.prev = 3, e.next = 6, s.tabsCreate({
                            url: n,
                            active: !0
                        });
                    case 6:
                        e.next = 11;
                        break;
                    case 8:
                        e.prev = 8, e.t0 = e.catch(3);
                    case 11:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [3, 8]
            ])
        })))).apply(this, arguments)
    }

    function ee() {
        return (ee = R(P().mark((function e() {
            var t, r, n, a, c, i, o, u, l;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return t = chrome.runtime.id, r = chrome.i18n.getUILanguage(), e.next = 4, s.storageLocalGet({
                            theme: "system"
                        });
                    case 4:
                        return n = e.sent, a = n.theme, c = "https://www.bodoi.com/pricing/?extId=".concat(t, "&lang=").concat(r), "light" !== a && "dark" !== a || (c += "&theme=".concat(a)), e.prev = 8, i = {
                            url: c,
                            active: !0
                        }, e.prev = 10, e.next = 13, s.tabsQuery({
                            active: !0,
                            currentWindow: !0
                        });
                    case 13:
                        o = e.sent, u = S(o, 1), null != (null == (l = u[0]) ? void 0 : l.id) && (i.openerTabId = l.id), e.next = 21;
                        break;
                    case 19:
                        e.prev = 19, e.t0 = e.catch(10);
                    case 21:
                        return e.next = 23, s.tabsCreate(i);
                    case 23:
                        e.next = 28;
                        break;
                    case 25:
                        e.prev = 25, e.t1 = e.catch(8);
                    case 28:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [8, 25],
                [10, 19]
            ])
        })))).apply(this, arguments)
    }

    function te() {
        return (te = R(P().mark((function e() {
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.abrupt("return", null);
                }
            }), e)
        })))).apply(this, arguments)
    }

    function re(e) {
        var t, r, n = "string" == typeof(null == e ? void 0 : e.currency) && e.currency.trim(),
            a = "string" == typeof(null == e || null === (t = e.inspect) || void 0 === t ? void 0 : t.amount) && e.inspect.amount.trim(),
            c = "string" == typeof(null == e || null === (r = e.studio) || void 0 === r ? void 0 : r.amount) && e.studio.amount.trim();
        if (!n || !a || !c) return null;
        var s = {
                currency: n,
                inspect: {
                    amount: a
                },
                studio: {
                    amount: c
                }
            },
            i = function(e) {
                var t, r, n, a = "string" == typeof(null == e ? void 0 : e.code) && e.code.trim(),
                    c = "string" == typeof(null == e ? void 0 : e.endsAt) ? Date.parse(e.endsAt) : NaN;
                if (!a || !Number.isFinite(c) || c <= Date.now()) return null;
                if ("string" != typeof(null == e || null === (t = e.text) || void 0 === t ? void 0 : t.en) || !e.text.en) return null;
                for (var s = {}, i = 0, o = Object.entries(e.text); i < o.length; i++) {
                    var u = S(o[i], 2),
                        l = u[0],
                        p = u[1];
                    "string" == typeof p && p && (s[l] = p)
                }
                var f = {
                        code: a,
                        endsAt: e.endsAt,
                        text: s
                    },
                    d = "string" == typeof(null == e || null === (r = e.inspect) || void 0 === r ? void 0 : r.amount) && e.inspect.amount.trim(),
                    h = "string" == typeof(null == e || null === (n = e.studio) || void 0 === n ? void 0 : n.amount) && e.studio.amount.trim();
                d && h && (f.inspect = {
                    amount: d
                }, f.studio = {
                    amount: h
                });
                return f
            }(null == e ? void 0 : e.offer);
        return i && (s.offer = i), s
    }

    function ne() {
        return (ne = R(P().mark((function e() {
            var t, r;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, oe();
                    case 2:
                        return e.abrupt("return", Promise.resolve());
                    case 4:
                        null === (t = chrome.sidePanel) || void 0 === t || null === (r = t.setOptions) || void 0 === r || r.call(t, {
                            enabled: !1
                        }), ae().catch((function() {}));
                    case 6:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function ae() {
        return ce.apply(this, arguments)
    }

    function ce() {
        return (ce = R(P().mark((function e() {
            var t, r, n;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, s.storageLocalGet({
                            mcpIntent: !1
                        });
                    case 2:
                        if (t = e.sent, r = t.mcpIntent, void 0 !== r && r) {
                            e.next = 7;
                            break
                        }
                        return e.abrupt("return");
                    case 7:
                        return e.next = 10, G();
                    case 10:
                        if (e.sent) {
                            e.next = 25;
                            break
                        }
                        return e.abrupt("return");
                    case 20:
                        return e.next = 22, s.storageLocalSet({
                            mcpIntent: !1
                        });
                    case 24:
                        return e.abrupt("return");
                    case 25:
                        return e.next = 27, Ve(n);
                    case 27:
                        if (!e.sent) {
                            e.next = 29;
                            break
                        }
                        return e.abrupt("return");
                    case 29:
                        return e.next = 31, We();
                    case 31:
                        return e.abrupt("return");
                    case 33:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function se() {
        return ie.apply(this, arguments)
    }

    function ie() {
        return (ie = R(P().mark((function e() {
            var t, r, n, a, c;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, s.contextMenusRemoveAll();
                    case 2:
                        return t = [{
                            title: chrome.i18n.getMessage("EXT_NAME_SHORT"),
                            id: "activate",
                            contexts: ["page", "frame", "selection", "link", "editable", "image", "video", "audio"],
                            type: "normal"
                        }], n = 0, a = t, e.next = 9;
                    case 9:
                        if (!(n < a.length)) {
                            e.next = 16;
                            break
                        }
                        return c = a[n], e.next = 13, s.contextMenusCreate(c);
                    case 13:
                        n++, e.next = 9;
                        break;
                    case 16:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function oe() {
        return ue.apply(this, arguments)
    }

    function ue() {
        return (ue = R(P().mark((function e() {
            var t;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (chrome.declarativeContent) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        return e.next = 4, chrome.action.enable();
                    case 4:
                        return e.prev = 4, e.next = 7, s.onPageChangedRemoveRules(void 0);
                    case 7:
                        return t = {
                            conditions: [new chrome.declarativeContent.PageStateMatcher({
                                pageUrl: {
                                    schemes: ["http", "https", "file", "ftp"]
                                }
                            })],
                            actions: [new chrome.declarativeContent.ShowAction]
                        }, e.next = 10, s.onPageChangedAddRules([t]);
                    case 10:
                        e.next = 15;
                        break;
                    case 12:
                        e.prev = 12, e.t0 = e.catch(4);
                    case 15:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [4, 12]
            ])
        })))).apply(this, arguments)
    }
    var le = new Map,
        pe = 400,
        fe = 800,
        de = new Map,
        he = chrome.storage.session.get({
            detachedPanels: {}
        }).then((function(e) {
            for (var t = e.detachedPanels, r = 0, n = Object.entries(t); r < n.length; r++) {
                var a = S(n[r], 2),
                    c = a[0],
                    s = a[1];
                le.has(Number(c)) || le.set(Number(c), s)
            }
        })).catch((function() {}));

    function ve() {
        chrome.storage.session.set({
            detachedPanels: Object.fromEntries(le)
        }).catch((function() {}))
    }

    function me(e) {
        return "sidepanel/index.html?tabId=".concat(e)
    }

    function ge(e) {
        le.delete(e) && ve()
    }

    function be() {
        return be = R(P().mark((function e(t) {
            var r, n, a, c, i, o, u, l, p, f, d, h = arguments;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return i = h.length > 1 && void 0 !== h[1] ? h[1] : null, e.next = 3, he;
                    case 3:
                        if (void 0 === (o = le.get(t))) {
                            e.next = 14;
                            break
                        }
                        return e.prev = 5, e.next = 8, s.windowsUpdate(o, {
                            focused: !0
                        });
                    case 8:
                        return e.abrupt("return", o);
                    case 11:
                        e.prev = 11, e.t0 = e.catch(5), ge(t);
                    case 14:
                        return e.next = 16, s.storageLocalGet({
                            detachedPanelBounds: null
                        });
                    case 16:
                        return u = e.sent, l = u.detachedPanelBounds, p = {
                            width: (null == l ? void 0 : l.width) > 0 ? l.width : (null == i ? void 0 : i.width) > 0 ? Math.round(i.width) : pe,
                            height: (null == l ? void 0 : l.height) > 0 ? l.height : (null == i ? void 0 : i.height) > 0 ? Math.round(i.height) : fe
                        }, Number.isFinite(null == l ? void 0 : l.left) && Number.isFinite(null == l ? void 0 : l.top) && (p.left = l.left, p.top = l.top), f = chrome.runtime.getURL("".concat(me(t), "&detached=1")), e.next = 23, s.windowsCreate(L({
                            url: f,
                            type: "popup",
                            focused: !0
                        }, p));
                    case 23:
                        return d = e.sent, le.set(t, d.id), de.set(d.id, {
                            width: null !== (r = d.width) && void 0 !== r ? r : p.width,
                            height: null !== (n = d.height) && void 0 !== n ? n : p.height
                        }), ve(), Number.isFinite(d.left) && Number.isFinite(d.top) && (d.left !== p.left || d.top !== p.top) && s.storageLocalSet({
                            detachedPanelBounds: L(L({}, l || {}), {}, {
                                left: d.left,
                                top: d.top
                            })
                        }).catch((function() {})), null === (a = chrome.sidePanel) || void 0 === a || null === (c = a.setOptions) || void 0 === c || c.call(a, {
                            tabId: t,
                            enabled: !1
                        }), e.abrupt("return", d.id);
                    case 30:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [5, 11]
            ])
        }))), be.apply(this, arguments)
    }

    function ye(e) {
        return xe.apply(this, arguments)
    }

    function xe() {
        return (xe = R(P().mark((function e(t) {
            var r;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, he;
                    case 2:
                        if (void 0 !== (r = le.get(t))) {
                            e.next = 5;
                            break
                        }
                        return e.abrupt("return");
                    case 5:
                        return ge(t), e.prev = 6, e.next = 9, chrome.windows.remove(r);
                    case 9:
                        e.next = 13;
                        break;
                    case 11:
                        e.prev = 11, e.t0 = e.catch(6);
                    case 13:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [6, 11]
            ])
        })))).apply(this, arguments)
    }

    function we(e) {
        return _e.apply(this, arguments)
    }

    function _e() {
        return (_e = R(P().mark((function e(t) {
            var r, n;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (De(t.url.toLowerCase()) && !t.discarded && "unloaded" !== t.status) {
                            e.next = 3;
                            break
                        }
                        return e.abrupt("return");
                    case 3:
                        return null === (r = chrome.sidePanel) || void 0 === r || null === (n = r.setOptions) || void 0 === n || n.call(r, {
                            tabId: t.id,
                            path: "sidepanel/index.html?tabId=".concat(t.id),
                            enabled: !0
                        }), e.next = 6, ke(t);
                    case 6:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function ke(e) {
        return Ie.apply(this, arguments)
    }

    function Ie() {
        return (Ie = R(P().mark((function e(t) {
            var r, n, a, c;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 1, e.next = 4, s.sendMessageToTab(t.id, {
                            target: "script",
                            action: "check_script_is_active"
                        });
                    case 4:
                        e.next = 17;
                        break;
                    case 6:
                        if (e.prev = 6, e.t0 = e.catch(1), !t.id) {
                            e.next = 17;
                            break
                        }
                        return e.prev = 9, e.next = 12, s.executeScript({
                            target: {
                                tabId: t.id
                            },
                            files: [...BD_CONTENT_FILES, "scripts/content.js"]
                        });
                    case 12:
                        e.next = 17;
                        break;
                    case 14:
                        e.prev = 14, e.t1 = e.catch(9);
                    case 17:
                        return e.prev = 17, e.prev = 18, e.next = 21, s.sendMessageToTab(t.id, {
                            target: "script",
                            action: "toggle_script"
                        });
                    case 21:
                        if (r = e.sent, (n = r.scriptIsActive) || (null === (a = chrome.sidePanel) || void 0 === a || null === (c = a.setOptions) || void 0 === c || c.call(a, {
                                tabId: t.id,
                                path: "sidepanel/index.html",
                                enabled: !1
                            }), ye(t.id)), Te(t.id, n), n) {
                            e.next = 28;
                            break
                        }
                        return e.next = 28, s.sendOptionalMessage({
                            target: "side_panel",
                            action: "clear",
                            tabId: t.id
                        });
                    case 28:
                        e.next = 33;
                        break;
                    case 30:
                        e.prev = 30, e.t2 = e.catch(18);
                    case 33:
                        return e.finish(17);
                    case 34:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [1, 6, 17, 34],
                [9, 14],
                [18, 30]
            ])
        })))).apply(this, arguments)
    }

    function Le(e) {
        return Ee.apply(this, arguments)
    }

    function Ee() {
        return (Ee = R(P().mark((function e(t) {
            var r;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.prev = 0, e.next = 3, s.sendMessageToTab(t, {
                            target: "script",
                            action: "check_script_is_active"
                        });
                    case 3:
                        return r = e.sent, e.next = 6, Te(t, r.scriptIsActive);
                    case 6:
                        e.next = 11;
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

    function Te(e, t) {
        return Pe.apply(this, arguments)
    }

    function Pe() {
        return (Pe = R(P().mark((function e(t, r) {
            var n;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return n = r ? "images/icon32_active.png" : "images/icon32.png", e.next = 3, s.setActionIcon({
                            path: n,
                            tabId: t
                        });
                    case 3:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function Se() {
        return (Se = R(P().mark((function e(t, r) {
            var n;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if ("activate" === (n = t.menuItemId) && r && we(r), "enter_license" === n) try {
                            chrome.runtime.openOptionsPage()
                        } catch (e) {}
                        case 3: case "end": return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function Oe() {
        return (Oe = R(P().mark((function e(t, r, n) {
            var a, c, i, o;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if ("loading" === r.status && Ne(t), "complete" !== r.status) {
                            e.next = 54;
                            break
                        }
                        if (De(n.url) && !n.discarded && "unloaded" !== n.status) {
                            e.next = 4;
                            break
                        }
                        return e.abrupt("return");
                    case 4:
                        if (!N.has(t)) {
                            e.next = 52;
                            break
                        }
                        return N.delete(t), e.prev = 6, a = !1, e.prev = 8, e.next = 11, s.sendMessageToTab(t, {
                            target: "script",
                            action: "check_script_is_active"
                        });
                    case 11:
                        return e.next = 13, s.sendMessageToTab(t, {
                            target: "script",
                            action: "toggle_script"
                        });
                    case 13:
                        c = e.sent, a = c.scriptIsActive, e.next = 25;
                        break;
                    case 17:
                        return e.prev = 17, e.t0 = e.catch(8), e.next = 21, s.executeScript({
                            target: {
                                tabId: t
                            },
                            files: [...BD_CONTENT_FILES, "scripts/content.js"]
                        });
                    case 21:
                        return e.next = 23, s.sendMessageToTab(t, {
                            target: "script",
                            action: "toggle_script"
                        });
                    case 23:
                        i = e.sent, a = i.scriptIsActive;
                    case 25:
                        return e.next = 27, Te(t, a);
                    case 27:
                        if (!(o = D.get(t))) {
                            e.next = 37;
                            break
                        }
                        return D.delete(t), e.prev = 30, e.next = 33, s.sendMessageToTab(t, {
                            target: "script",
                            action: "apply_pending_rule_edits",
                            edits: o
                        });
                    case 33:
                        e.next = 37;
                        break;
                    case 35:
                        e.prev = 35, e.t1 = e.catch(30);
                    case 37:
                        if (!C.has(t)) {
                            e.next = 46;
                            break
                        }
                        return C.delete(t), e.prev = 39, e.next = 42, s.sendMessageToTab(t, {
                            target: "script",
                            action: "set_edit_mode"
                        });
                    case 42:
                        e.next = 46;
                        break;
                    case 44:
                        e.prev = 44, e.t2 = e.catch(39);
                    case 46:
                        return e.abrupt("return");
                    case 49:
                        e.prev = 49, e.t3 = e.catch(6);
                    case 52:
                        return e.next = 54, Le(t);
                    case 54:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [6, 49],
                [8, 17],
                [30, 35],
                [39, 44]
            ])
        })))).apply(this, arguments)
    }
    var Ae = {
        priority: 1,
        action: {
            type: "modifyHeaders",
            responseHeaders: [{
                header: "x-frame-options",
                operation: "remove"
            }, {
                header: "frame-options",
                operation: "remove"
            }, {
                header: "content-security-policy",
                operation: "remove"
            }, {
                header: "content-security-policy-report-only",
                operation: "remove"
            }]
        }
    };

    function Me(e) {
        return Re.apply(this, arguments)
    }

    function Re() {
        return (Re = R(P().mark((function e(t) {
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (Number.isInteger(t) && !(t < 1)) {
                            e.next = 2;
                            break
                        }
                        throw new Error("bad tabId ".concat(t));
                    case 2:
                        return e.next = 4, s.updateSessionRules({
                            removeRuleIds: [t],
                            addRules: [L(L({}, Ae), {}, {
                                id: t,
                                condition: {
                                    resourceTypes: ["sub_frame"],
                                    tabIds: [t]
                                }
                            })]
                        });
                    case 4:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    function Ne(e) {
        return je.apply(this, arguments)
    }

    function je() {
        return (je = R(P().mark((function e(t) {
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        if (Number.isInteger(t) && !(t < 1)) {
                            e.next = 2;
                            break
                        }
                        return e.abrupt("return");
                    case 2:
                        return e.prev = 2, e.next = 5, s.updateSessionRules({
                            removeRuleIds: [t]
                        });
                    case 5:
                        e.next = 10;
                        break;
                    case 7:
                        e.prev = 7, e.t0 = e.catch(2);
                    case 10:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [2, 7]
            ])
        })))).apply(this, arguments)
    }

    function Ce() {
        return (Ce = R(P().mark((function e(t) {
            var r, n, a, c, i, o, u;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, he;
                    case 2:
                        r = T(le.values()), e.prev = 3, r.s();
                    case 5:
                        if ((n = r.n()).done) {
                            e.next = 11;
                            break
                        }
                        if (n.value !== t.windowId) {
                            e.next = 9;
                            break
                        }
                        return e.abrupt("return");
                    case 9:
                        e.next = 5;
                        break;
                    case 11:
                        e.next = 16;
                        break;
                    case 13:
                        e.prev = 13, e.t0 = e.catch(3), r.e(e.t0);
                    case 16:
                        return e.prev = 16, r.f(), e.finish(16);
                    case 19:
                        return e.prev = 19, e.next = 22, s.sendMessageToTab(t.tabId, {
                            target: "script",
                            action: "side_panel_loaded"
                        });
                    case 22:
                        null != (a = e.sent) && a.success || (null === (c = chrome.sidePanel) || void 0 === c || null === (i = c.setOptions) || void 0 === i || i.call(c, {
                            tabId: t.tabId,
                            enabled: !1
                        }), s.sendMessage({
                            target: "side_panel",
                            action: "clear",
                            tabId: t.tabId
                        }).catch((function() {}))), e.next = 30;
                        break;
                    case 26:
                        e.prev = 26, e.t1 = e.catch(19), null === (o = chrome.sidePanel) || void 0 === o || null === (u = o.setOptions) || void 0 === u || u.call(o, {
                            tabId: t.tabId,
                            enabled: !1
                        }), s.sendMessage({
                            target: "side_panel",
                            action: "clear",
                            tabId: t.tabId
                        }).catch((function() {}));
                    case 30:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [3, 13, 16, 19],
                [19, 26]
            ])
        })))).apply(this, arguments)
    }

    function De(e) {
        return ![/^chrome:/, /^edge:/, /^chrome-extension:/, /^(https?:\/\/)?(www\.)?chrome\.google\.com\/webstore/, /^(https?:\/\/)?chromewebstore\.google\.com/].some((function(t) {
            return t.test(e)
        }))
    }

    function Ue(e) {
        var t;
        try {
            t = new URL(e)
        } catch (e) {
            return !1
        }
        if ("http:" !== t.protocol && "https:" !== t.protocol) return !1;
        var r = t.hostname.toLowerCase();
        return "localhost" !== r && !r.endsWith(".localhost") && (r.startsWith("[") ? ! function(e) {
            var t = e.replace(/^\[/, "").replace(/\]$/, "");
            if ("::" === t || "::1" === t) return !0;
            if (t.startsWith("::")) {
                if (!t.startsWith("::ffff:")) return !0;
                var r = t.slice(7);
                if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(r)) return Ge(r);
                var n = r.split(":");
                if (n.length > 2) return !0;
                if (n.some((function(e) {
                        return !/^[0-9a-f]{1,4}$/.test(e)
                    }))) return !0;
                var a, c = 0,
                    s = T(n);
                try {
                    for (s.s(); !(a = s.n()).done;) {
                        var i = a.value;
                        c = 65536 * c + parseInt(i, 16)
                    }
                } catch (e) {
                    s.e(e)
                } finally {
                    s.f()
                }
                return Ge("".concat(c >>> 24 & 255, ".").concat(c >>> 16 & 255, ".").concat(c >>> 8 & 255, ".").concat(255 & c))
            }
            var o = t.split(":")[0];
            if (!/^[0-9a-f]{1,4}$/.test(o)) return !0;
            var u = parseInt(o, 16);
            return u >= 64512 && u <= 65023 || u >= 65152 && u <= 65215
        }(r) : !Ge(r))
    }

    function Ge(e) {
        var t = e.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
        if (!t) return !1;
        var r = Number(t[1]),
            n = Number(t[2]);
        return 0 === r || 127 === r || 10 === r || (100 === r && n >= 64 && n <= 127 || (169 === r && 254 === n || (192 === r && 168 === n || 172 === r && n >= 16 && n <= 31)))
    }

    function Ke(e) {
        try {
            return new URL(e).hostname || e
        } catch (t) {
            return e
        }
    }

    function Fe(e) {
        return qe.apply(this, arguments)
    }

    function qe() {
        return qe = R(P().mark((function e(t) {
            var r, n, a, c, s, i, o = arguments;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        r = o.length > 1 && void 0 !== o[1] ? o[1] : {}, n = t, a = 0;
                    case 3:
                        if (!(a <= 5)) {
                            e.next = 31;
                            break
                        }
                        if (Ue(n)) {
                            e.next = 6;
                            break
                        }
                        throw new Error("Blocked request to disallowed host: ".concat(Ke(n)));
                    case 6:
                        return e.next = 8, fetch(n, L(L({}, r), {}, {
                            credentials: "omit",
                            redirect: "manual"
                        }));
                    case 8:
                        if (c = e.sent, "opaqueredirect" === c.type || c.status >= 300 && c.status <= 399) {
                            e.next = 12;
                            break
                        }
                        return e.abrupt("return", c);
                    case 12:
                        if (!(s = c.headers.get("location"))) {
                            e.next = 22;
                            break
                        }
                        e.prev = 14, n = new URL(s, n).href, e.next = 21;
                        break;
                    case 18:
                        throw e.prev = 18, e.t0 = e.catch(14), new Error("Blocked redirect: Location header could not be resolved.");
                    case 21:
                        return e.abrupt("continue", 28);
                    case 22:
                        return e.next = 24, fetch(n, L(L({}, r), {}, {
                            credentials: "omit",
                            redirect: "follow"
                        }));
                    case 24:
                        if ((i = e.sent).url && Ue(i.url)) {
                            e.next = 27;
                            break
                        }
                        throw new Error("Blocked redirect to disallowed host: ".concat(Ke(i.url || n)));
                    case 27:
                        return e.abrupt("return", i);
                    case 28:
                        a++, e.next = 3;
                        break;
                    case 31:
                        throw new Error("Blocked request: more than ".concat(5, " redirects."));
                    case 32:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [14, 18]
            ])
        }))), qe.apply(this, arguments)
    }

    function Ve(e) {
        return Be.apply(this, arguments)
    }

    function Be() {
        return (Be = R(P().mark((function e(t) {
            var r, n, a;
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, self.clients.matchAll().catch((function(e) {
                            return !1
                        }));
                    case 2:
                        r = e.sent, n = T(r), e.prev = 4, n.s();
                    case 6:
                        if ((a = n.n()).done) {
                            e.next = 12;
                            break
                        }
                        if (a.value.url !== t) {
                            e.next = 10;
                            break
                        }
                        return e.abrupt("return", !0);
                    case 10:
                        e.next = 6;
                        break;
                    case 12:
                        e.next = 17;
                        break;
                    case 14:
                        e.prev = 14, e.t0 = e.catch(4), n.e(e.t0);
                    case 17:
                        return e.prev = 17, n.f(), e.finish(17);
                    case 20:
                        return e.abrupt("return", !1);
                    case 21:
                    case "end":
                        return e.stop()
                }
            }), e, null, [
                [4, 14, 17, 20]
            ])
        })))).apply(this, arguments)
    }

    function We() { return Ye.apply(this, arguments) }

    function Ye() {
        return (Ye = R(P().mark((function e() {
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.abrupt("return", Promise.resolve());
                }
            }), e)
        })))).apply(this, arguments)
    }

    function bdBlobToDataURL(e) {
        return new Promise((function(t, n) {
            var r = new FileReader;
            r.onload = function() {
                return t(r.result)
            }, r.onerror = n, r.readAsDataURL(e)
        }))
    }

    // Crops the captured tab screenshot down to the given device-pixel rect
    // (used for the "screenshot of selected/hovered element" flow).
    async function $e(e, t, n) {
        try {
            var r = await fetch(n),
                i = await r.blob(),
                a = await createImageBitmap(i),
                o = Math.max(1, Math.round(t.right - t.left)),
                s = Math.max(1, Math.round(t.bottom - t.top)),
                l = new OffscreenCanvas(o, s),
                c = l.getContext("2d");
            c.drawImage(a, t.left, t.top, o, s, 0, 0, o, s);
            var u = await l.convertToBlob({
                type: "image/png"
            });
            return await bdBlobToDataURL(u)
        } catch (e) {
            return n
        }
    }

    // No cropping needed for a plain viewport capture — just pass the data URL
    // straight through so the caller (content script) can trigger the actual
    // file download itself (a service worker has no DOM to do that with).
    async function ze(e, t) {
        return e
    }

    function He() {
        return (He = R(P().mark((function e(t) {
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.abrupt("return", Promise.resolve());
                }
            }), e)
        })))).apply(this, arguments)
    }

    function Qe() {
        return (Qe = R(P().mark((function e() {
            return P().wrap((function(e) {
                for (;;) switch (e.prev = e.next) {
                    case 0:
                        return e.abrupt("return", !1);
                    case 2:
                    case "end":
                        return e.stop()
                }
            }), e)
        })))).apply(this, arguments)
    }

    
})();
