(() => {
  "use strict";
  function e(t) {
    e =
      typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            if (
              e &&
              typeof Symbol === "function" &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
            ) {
              return "symbol";
            }
            return typeof e;
          };
    return e(t);
  }
  function t() {
    t = function () {
      return r;
    };
    let n;
    var r = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const i =
      Object.defineProperty ||
      ((e, t, n) => {
        e[t] = n.value;
      });
    const c = typeof Symbol === "function" ? Symbol : {};
    const u = c.iterator || "@@iterator";
    const s = c.asyncIterator || "@@asyncIterator";
    const l = c.toStringTag || "@@toStringTag";
    function f(e, t, n) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      f({}, "");
    } catch (n) {
      f = function (e, t, n) {
        return (e[t] = n);
      };
    }
    function d(e, t, n, r) {
      const o = t && t.prototype instanceof b ? t : b;
      const a = Object.create(o.prototype);
      const c = new N(r || []);
      i(a, "_invoke", {
        value: C(e, n, c),
      });
      return a;
    }
    function h(e, t, n) {
      try {
        return {
          type: "normal",
          arg: e.call(t, n),
        };
      } catch (error) {
        return {
          type: "throw",
          arg: error,
        };
      }
    }
    r.wrap = d;
    var p = "suspendedStart";
    var m = "suspendedYield";
    var g = "executing";
    var v = "completed";
    var y = {};
    function b() {}
    function w() {}
    function E() {}
    let x = {};
    f(x, u, function () {
      return this;
    });
    const O =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(U([])));
    if (O && O !== Object.prototype && hasOwnProperty.call(O, u)) {
      x = O;
    }
    const _ = (E.prototype = b.prototype = Object.create(x));
    function I(e) {
      ["next", "throw", "return"].forEach((t) => {
        f(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function S(t, n) {
      function r(o, i, c, u) {
        const s = h(t[o], t, i);
        if (s.type !== "throw") {
          const l = s.arg;
          const f = l.value;
          if (f && e(f) == "object" && hasOwnProperty.call(f, "__await")) {
            return n.resolve(f.__await).then(
              (e) => {
                r("next", e, c, u);
              },
              (e) => {
                r("throw", e, c, u);
              },
            );
          }
          return n.resolve(f).then(
            (e) => {
              l.value = e;
              c(l);
            },
            (e) => r("throw", e, c, u),
          );
        }
        u(s.arg);
      }
      let o;
      i(this, "_invoke", {
        value: function (e, t) {
          function a() {
            return new n(function (n, o) {
              r(e, t, n, o);
            });
          }
          return (o = o ? o.then(a, a) : a());
        },
      });
    }
    function C(e, t, r) {
      let o = p;
      return function (a, i) {
        if (o === g) {
          throw Error("Generator is already running");
        }
        if (o === v) {
          if (a === "throw") {
            throw i;
          }
          return {
            value: n,
            done: true,
          };
        }
        r.method = a;
        for (r.arg = i; ;) {
          const c = r.delegate;
          if (c) {
            const u = k(c, r);
            if (u) {
              if (u === y) {
                continue;
              }
              return u;
            }
          }
          if (r.method === "next") {
            r.sent = r._sent = r.arg;
          } else if (r.method === "throw") {
            if (o === p) {
              o = v;
              throw r.arg;
            }
            r.dispatchException(r.arg);
          } else {
            if (r.method === "return") {
              r.abrupt("return", r.arg);
            }
          }
          o = g;
          const s = h(e, t, r);
          if (s.type === "normal") {
            o = r.done ? v : m;
            if (s.arg === y) {
              continue;
            }
            return {
              value: s.arg,
              done: r.done,
            };
          }
          if (s.type === "throw") {
            o = v;
            r.method = "throw";
            r.arg = s.arg;
          }
        }
      };
    }
    function k(e, t) {
      const t_method = t.method;
      const o = e.iterator[t_method];
      if (o === n) {
        t.delegate = null;
        if (
          !(
            t_method === "throw" &&
            e.iterator.return &&
            ((t.method = "return"), (t.arg = n), k(e, t), t.method === "throw")
          )
        ) {
          if (t_method !== "return") {
            t.method = "throw";
            t.arg = new TypeError(
              `The iterator does not provide a '${t_method}' method`,
            );
          }
        }
        return y;
      }
      const a = h(o, e.iterator, t.arg);
      if (a.type === "throw") {
        t.method = "throw";
        t.arg = a.arg;
        t.delegate = null;
        return y;
      }
      const a_arg = a.arg;
      if (a_arg) {
        if (a_arg.done) {
          return (
            (t[e.resultName] = a_arg.value),
            (t.next = e.nextLoc),
            t.method !== "return" && ((t.method = "next"), (t.arg = n)),
            (t.delegate = null),
            y
          );
        }
        return a_arg;
      }
      return (
        (t.method = "throw"),
        (t.arg = new TypeError("iterator result is not an object")),
        (t.delegate = null),
        y
      );
    }
    function T(e) {
      const t = {
        tryLoc: e[0],
      };
      if (1 in e) {
        t.catchLoc = e[1];
      }
      if (2 in e) {
        t.finallyLoc = e[2];
        t.afterLoc = e[3];
      }
      this.tryEntries.push(t);
    }
    function P(e) {
      const t = e.completion || {};
      t.type = "normal";
      delete t.arg;
      e.completion = t;
    }
    function N(e) {
      this.tryEntries = [
        {
          tryLoc: "root",
        },
      ];
      e.forEach(T, this);
      this.reset(true);
    }
    function U(t) {
      if (t || t === "") {
        const r = t[u];
        if (r) {
          return r.call(t);
        }
        if (typeof t.next === "function") {
          return t;
        }
        if (!isNaN(t.length)) {
          let o = -1;
          const i = function e() {
            while (++o < t.length) {
              if (hasOwnProperty.call(t, o)) {
                e.value = t[o];
                e.done = false;
                return e;
              }
            }
            e.value = n;
            e.done = true;
            return e;
          };
          return (i.next = i);
        }
      }
      throw new TypeError(`${e(t)} is not iterable`);
    }
    w.prototype = E;
    i(_, "constructor", {
      value: E,
      configurable: true,
    });
    i(E, "constructor", {
      value: w,
      configurable: true,
    });
    w.displayName = f(E, l, "GeneratorFunction");
    r.isGeneratorFunction = function (e) {
      const t = typeof e === "function" && e.constructor;
      return (
        !!t && (t === w || (t.displayName || t.name) === "GeneratorFunction")
      );
    };
    r.mark = function (e) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(e, E);
      } else {
        e.__proto__ = E;
        f(e, l, "GeneratorFunction");
      }
      e.prototype = Object.create(_);
      return e;
    };
    r.awrap = function (e) {
      return {
        __await: e,
      };
    };
    I(S.prototype);
    f(S.prototype, s, function () {
      return this;
    });
    r.AsyncIterator = S;
    r.async = function (e, t, n, o, a = Promise) {
      const i = new S(d(e, t, n, o), a);
      if (r.isGeneratorFunction(t)) {
        return i;
      }
      return i.next().then((e) => {
        if (e.done) {
          return e.value;
        }
        return i.next();
      });
    };
    I(_);
    f(_, l, "Generator");
    f(_, u, function () {
      return this;
    });
    f(_, "toString", function () {
      return "[object Generator]";
    });
    r.keys = function (e) {
      const t = Object(e);
      const n = [];
      for (const r in t) {
        n.push(r);
      }
      n.reverse();
      return function e() {
        while (n.length) {
          const r = n.pop();
          if (r in t) {
            e.value = r;
            e.done = false;
            return e;
          }
        }
        e.done = true;
        return e;
      };
    };
    r.values = U;
    N.prototype = {
      constructor: N,
      reset: function (e) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = n;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = n;
        this.tryEntries.forEach(P);
        if (!e) {
          for (const t in this) {
            if (
              t.charAt(0) === "t" &&
              hasOwnProperty.call(this, t) &&
              !isNaN(+t.slice(1))
            ) {
              this[t] = n;
            }
          }
        }
      },
      stop: function () {
        this.done = true;
        const completion = this.tryEntries[0].completion;
        if (completion.type === "throw") {
          throw completion.arg;
        }
        return this.rval;
      },
      dispatchException: function (e) {
        if (this.done) {
          throw e;
        }
        const t = this;
        function r(r, o) {
          c.type = "throw";
          c.arg = e;
          t.next = r;
          if (o) {
            t.method = "next";
            t.arg = n;
          }
          return !!o;
        }
        for (let o = this.tryEntries.length - 1; o >= 0; --o) {
          const i = this.tryEntries[o];
          var c = i.completion;
          if (i.tryLoc === "root") {
            return r("end");
          }
          if (i.tryLoc <= this.prev) {
            const u = hasOwnProperty.call(i, "catchLoc");
            const s = hasOwnProperty.call(i, "finallyLoc");
            if (u && s) {
              if (this.prev < i.catchLoc) {
                return r(i.catchLoc, true);
              }
              if (this.prev < i.finallyLoc) {
                return r(i.finallyLoc);
              }
            } else if (u) {
              if (this.prev < i.catchLoc) {
                return r(i.catchLoc, true);
              }
            } else {
              if (!s) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < i.finallyLoc) {
                return r(i.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let n = this.tryEntries.length - 1; n >= 0; --n) {
          const r = this.tryEntries[n];
          if (
            r.tryLoc <= this.prev &&
            hasOwnProperty.call(r, "finallyLoc") &&
            this.prev < r.finallyLoc
          ) {
            var o = r;
            break;
          }
        }
        if (
          o &&
          (e === "break" || e === "continue") &&
          o.tryLoc <= t &&
          t <= o.finallyLoc
        ) {
          o = null;
        }
        const i = o ? o.completion : {};
        i.type = e;
        i.arg = t;
        if (o) {
          return ((this.method = "next"), (this.next = o.finallyLoc), y);
        }
        return this.complete(i);
      },
      complete: function (e, t) {
        if (e.type === "throw") {
          throw e.arg;
        }
        if (e.type === "break" || e.type === "continue") {
          this.next = e.arg;
        } else if (e.type === "return") {
          this.rval = this.arg = e.arg;
          this.method = "return";
          this.next = "end";
        } else if (e.type === "normal" && t) {
          this.next = t;
        }
        return y;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.finallyLoc === e) {
            this.complete(n.completion, n.afterLoc);
            P(n);
            return y;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.tryLoc === e) {
            const r = n.completion;
            if (r.type === "throw") {
              var o = r.arg;
              P(n);
            }
            return o;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (e, t, r) {
        this.delegate = {
          iterator: U(e),
          resultName: t,
          nextLoc: r,
        };
        if (this.method === "next") {
          this.arg = n;
        }
        return y;
      },
    };
    return r;
  }
  function n(e, t, n, r, o, a, i) {
    try {
      var c = e[a](i);
      var u = c.value;
    } catch (error) {
      return void n(error);
    }
    if (c.done) {
      t(u);
    } else {
      Promise.resolve(u).then(r, o);
    }
  }
  function r(e) {
    return function () {
      const t = this;
      const r = arguments;
      return new Promise((resolve, reject) => {
        const i = e.apply(t, r);
        function c(e) {
          n(i, resolve, reject, c, u, "next", e);
        }
        function u(e) {
          n(i, resolve, reject, c, u, "throw", e);
        }
        c(undefined);
      });
    };
  }
  var o = {};
  function a(e) {
    return function (...n) {
      return new Promise((resolve, reject) => {
        e(...n, function (e) {
          if (chrome.runtime.lastError) {
            reject(
              new Error(
                chrome.runtime.lastError.message ||
                  JSON.stringify(chrome.runtime.lastError),
              ),
            );
          } else {
            resolve(e);
          }
        });
      });
    };
  }
  o.tabsQuery = a(chrome.tabs.query.bind(chrome.tabs));
  o.tabsCreate = a(chrome.tabs.create.bind(chrome.tabs));
  o.tabsUpdate = a(chrome.tabs.update.bind(chrome.tabs));
  o.windowsUpdate = a(chrome.windows.update.bind(chrome.windows));
  o.executeScript = a(chrome.scripting.executeScript.bind(chrome.scripting));
  o.sendMessageToTab = a(chrome.tabs.sendMessage.bind(chrome.tabs));
  o.sendMessage = a(chrome.runtime.sendMessage.bind(chrome.runtime));
  o.contextMenusCreate = a(
    chrome.contextMenus.create.bind(chrome.contextMenus),
  );
  o.contextMenusRemoveAll = a(
    chrome.contextMenus.removeAll.bind(chrome.contextMenus),
  );
  o.contextMenusUpdate = a(
    chrome.contextMenus.update.bind(chrome.contextMenus),
  );
  o.setActionIcon = a(chrome.action.setIcon.bind(chrome.action));
  o.storageLocalGet = a(chrome.storage.local.get.bind(chrome.storage.local));
  o.storageLocalSet = a(chrome.storage.local.set.bind(chrome.storage.local));
  o.storageLocalRemove = a(
    chrome.storage.local.remove.bind(chrome.storage.local),
  );
  o.getPlatformInfo = a(chrome.runtime.getPlatformInfo.bind(chrome.runtime));
  o.commandsGetAll = a(chrome.commands.getAll.bind(chrome.commands));
  o.getContexts = a(chrome.runtime.getContexts.bind(chrome.runtime));
  o.onPageChangedRemoveRules = chrome.declarativeContent
    ? a(
        chrome.declarativeContent.onPageChanged.removeRules.bind(
          chrome.declarativeContent.onPageChanged,
        ),
      )
    : r(
        t().mark(function e() {
          return t().wrap(function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                case "end":
                  return e.stop();
              }
            }
          }, e);
        }),
      );
  o.onPageChangedAddRules = chrome.declarativeContent
    ? a(
        chrome.declarativeContent.onPageChanged.addRules.bind(
          chrome.declarativeContent.onPageChanged,
        ),
      )
    : r(
        t().mark(function e() {
          return t().wrap(function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                case "end":
                  return e.stop();
              }
            }
          }, e);
        }),
      );
  o.actionDisable = a(chrome.action.disable.bind(chrome.action));
  o.captureTab = a(chrome.tabs.captureVisibleTab.bind(chrome.tabs));
  o.windowsCreate = a(chrome.windows.create.bind(chrome.windows));
  o.windowsGetCurrent = a(chrome.windows.getCurrent.bind(chrome.windows));
  o.updateSessionRules = chrome.declarativeNetRequest
    ? a(
        chrome.declarativeNetRequest.updateSessionRules.bind(
          chrome.declarativeNetRequest,
        ),
      )
    : r(
        t().mark(function e() {
          return t().wrap(function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                case "end":
                  return e.stop();
              }
            }
          }, e);
        }),
      );
  o.sendOptionalMessage = (() => {
    const e = r(
      t().mark(function e(n) {
        return t().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  e.next = 3;
                  return new Promise((resolve) => {
                    chrome.runtime.sendMessage(n, function (t) {
                      if (chrome.runtime.lastError) {
                        resolve();
                      } else {
                        resolve(t);
                      }
                    });
                  });
                case 3:
                  e.next = 8;
                  break;
                case 5:
                  e.prev = 5;
                  e.t0 = e.catch(0);
                case 8:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[0, 5]],
        );
      }),
    );
    return function (t) {
      return e.apply(this, arguments);
    };
  })();
  o.sendOptionalMessageToTab = (() => {
    const e = r(
      t().mark(function e(n, r) {
        return t().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  e.next = 3;
                  return new Promise((resolve) => {
                    chrome.tabs.sendMessage(n, r, function (t) {
                      if (chrome.runtime.lastError) {
                        resolve();
                      } else {
                        resolve(t);
                      }
                    });
                  });
                case 3:
                  e.next = 8;
                  break;
                case 5:
                  e.prev = 5;
                  e.t0 = e.catch(0);
                case 8:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[0, 5]],
        );
      }),
    );
    return function (t, n) {
      return e.apply(this, arguments);
    };
  })();
  const i = o;
  const c = {
    MIN_MCP_SERVER_VERSION: "0.5.0",
  };
  const u = JSON.parse(
    '[{"family":"Bo doi Geist","file":"geist-latin-ext.woff2","weight":"300 700","unicodeRange":"U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"},{"family":"Bo doi Geist","file":"geist-latin.woff2","weight":"300 700","unicodeRange":"U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"},{"family":"Bo doi Geist Mono","file":"geistmono-latin-ext.woff2","weight":"300 700","unicodeRange":"U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF"},{"family":"Bo doi Geist Mono","file":"geistmono-latin.woff2","weight":"300 700","unicodeRange":"U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"}]',
  );
  function s(e, t) {
    let n =
      (typeof Symbol !== "undefined" && e[Symbol.iterator]) || e["@@iterator"];
    if (!n) {
      if (
        Array.isArray(e) ||
        (n = ((e, t) => {
          if (e) {
            if (typeof e === "string") {
              return l(e, t);
            }
            let n = Object.prototype.toString.call(e).slice(8, -1);
            if (n === "Object" && e.constructor) {
              n = e.constructor.name;
            }
            if (n === "Map" || n === "Set") {
              return Array.from(e);
            }
            if (
              n === "Arguments" ||
              /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
            ) {
              return l(e, t);
            }
            return undefined;
          }
        })(e)) ||
        (t && e && typeof e.length === "number")
      ) {
        if (n) {
          e = n;
        }
        let r = 0;
        const o = function () {};
        return {
          s: o,
          n: function () {
            if (r >= e.length) {
              return {
                done: true,
              };
            }
            return {
              done: false,
              value: e[r++],
            };
          },
          e: function (e) {
            throw e;
          },
          f: o,
        };
      }
      throw new TypeError(
        "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
      );
    }
    let a;
    let i = true;
    let c = false;
    return {
      s: function () {
        n = n.call(e);
      },
      n: function () {
        const e = n.next();
        i = e.done;
        return e;
      },
      e: function (e) {
        c = true;
        a = e;
      },
      f: function () {
        try {
          if (!(i || n.return == null)) {
            n.return();
          }
        } finally {
          if (c) {
            throw a;
          }
        }
      },
    };
  }
  function l(e, t) {
    if (t == null || t > e.length) {
      t = e.length;
    }
    for (var n = 0, r = Array(t); n < t; n++) {
      r[n] = e[n];
    }
    return r;
  }
  var f = false;
  function d() {
    if (!f) {
      for (const n of u) {
        const { family, file, weight, unicodeRange } = n;
        document.fonts.add(
          new FontFace(
            family,
            `url("${chrome.runtime.getURL(`fonts/${file}`)}")`,
            {
              weight,
              unicodeRange,
              style: "normal",
              display: "swap",
            },
          ),
        );
      }
      f = true;
    }
  }
  function h(e) {
    h =
      typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            if (
              e &&
              typeof Symbol === "function" &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
            ) {
              return "symbol";
            }
            return typeof e;
          };
    return h(e);
  }
  function p() {
    p = function () {
      return t;
    };
    let e;
    var t = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const o =
      Object.defineProperty ||
      ((e, t, n) => {
        e[t] = n.value;
      });
    const a = typeof Symbol === "function" ? Symbol : {};
    const i = a.iterator || "@@iterator";
    const c = a.asyncIterator || "@@asyncIterator";
    const u = a.toStringTag || "@@toStringTag";
    function s(e, t, n) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      s({}, "");
    } catch (e) {
      s = function (e, t, n) {
        return (e[t] = n);
      };
    }
    function l(e, t, n, r) {
      const a = t && t.prototype instanceof b ? t : b;
      const i = Object.create(a.prototype);
      const c = new N(r || []);
      o(i, "_invoke", {
        value: C(e, n, c),
      });
      return i;
    }
    function f(e, t, n) {
      try {
        return {
          type: "normal",
          arg: e.call(t, n),
        };
      } catch (error) {
        return {
          type: "throw",
          arg: error,
        };
      }
    }
    t.wrap = l;
    var d = "suspendedStart";
    var m = "suspendedYield";
    var g = "executing";
    var v = "completed";
    var y = {};
    function b() {}
    function w() {}
    function E() {}
    let x = {};
    s(x, i, function () {
      return this;
    });
    const O =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(U([])));
    if (O && O !== Object.prototype && hasOwnProperty.call(O, i)) {
      x = O;
    }
    const _ = (E.prototype = b.prototype = Object.create(x));
    function I(e) {
      ["next", "throw", "return"].forEach((t) => {
        s(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function S(e, t) {
      function n(o, a, i, c) {
        const u = f(e[o], e, a);
        if (u.type !== "throw") {
          const s = u.arg;
          const l = s.value;
          if (l && h(l) == "object" && hasOwnProperty.call(l, "__await")) {
            return t.resolve(l.__await).then(
              (e) => {
                n("next", e, i, c);
              },
              (e) => {
                n("throw", e, i, c);
              },
            );
          }
          return t.resolve(l).then(
            (e) => {
              s.value = e;
              i(s);
            },
            (e) => n("throw", e, i, c),
          );
        }
        c(u.arg);
      }
      let a;
      o(this, "_invoke", {
        value: function (e, r) {
          function o() {
            return new t(function (t, o) {
              n(e, r, t, o);
            });
          }
          return (a = a ? a.then(o, o) : o());
        },
      });
    }
    function C(t, n, r) {
      let o = d;
      return function (a, i) {
        if (o === g) {
          throw Error("Generator is already running");
        }
        if (o === v) {
          if (a === "throw") {
            throw i;
          }
          return {
            value: e,
            done: true,
          };
        }
        r.method = a;
        for (r.arg = i; ;) {
          const c = r.delegate;
          if (c) {
            const u = k(c, r);
            if (u) {
              if (u === y) {
                continue;
              }
              return u;
            }
          }
          if (r.method === "next") {
            r.sent = r._sent = r.arg;
          } else if (r.method === "throw") {
            if (o === d) {
              o = v;
              throw r.arg;
            }
            r.dispatchException(r.arg);
          } else {
            if (r.method === "return") {
              r.abrupt("return", r.arg);
            }
          }
          o = g;
          const s = f(t, n, r);
          if (s.type === "normal") {
            o = r.done ? v : m;
            if (s.arg === y) {
              continue;
            }
            return {
              value: s.arg,
              done: r.done,
            };
          }
          if (s.type === "throw") {
            o = v;
            r.method = "throw";
            r.arg = s.arg;
          }
        }
      };
    }
    function k(t, n) {
      const n_method = n.method;
      const o = t.iterator[n_method];
      if (o === e) {
        n.delegate = null;
        if (
          !(
            n_method === "throw" &&
            t.iterator.return &&
            ((n.method = "return"), (n.arg = e), k(t, n), n.method === "throw")
          )
        ) {
          if (n_method !== "return") {
            n.method = "throw";
            n.arg = new TypeError(
              `The iterator does not provide a '${n_method}' method`,
            );
          }
        }
        return y;
      }
      const a = f(o, t.iterator, n.arg);
      if (a.type === "throw") {
        n.method = "throw";
        n.arg = a.arg;
        n.delegate = null;
        return y;
      }
      const a_arg = a.arg;
      if (a_arg) {
        if (a_arg.done) {
          return (
            (n[t.resultName] = a_arg.value),
            (n.next = t.nextLoc),
            n.method !== "return" && ((n.method = "next"), (n.arg = e)),
            (n.delegate = null),
            y
          );
        }
        return a_arg;
      }
      return (
        (n.method = "throw"),
        (n.arg = new TypeError("iterator result is not an object")),
        (n.delegate = null),
        y
      );
    }
    function T(e) {
      const t = {
        tryLoc: e[0],
      };
      if (1 in e) {
        t.catchLoc = e[1];
      }
      if (2 in e) {
        t.finallyLoc = e[2];
        t.afterLoc = e[3];
      }
      this.tryEntries.push(t);
    }
    function P(e) {
      const t = e.completion || {};
      t.type = "normal";
      delete t.arg;
      e.completion = t;
    }
    function N(e) {
      this.tryEntries = [
        {
          tryLoc: "root",
        },
      ];
      e.forEach(T, this);
      this.reset(true);
    }
    function U(t) {
      if (t || t === "") {
        const n = t[i];
        if (n) {
          return n.call(t);
        }
        if (typeof t.next === "function") {
          return t;
        }
        if (!isNaN(t.length)) {
          let o = -1;
          const a = function n() {
            while (++o < t.length) {
              if (hasOwnProperty.call(t, o)) {
                n.value = t[o];
                n.done = false;
                return n;
              }
            }
            n.value = e;
            n.done = true;
            return n;
          };
          return (a.next = a);
        }
      }
      throw new TypeError(`${h(t)} is not iterable`);
    }
    w.prototype = E;
    o(_, "constructor", {
      value: E,
      configurable: true,
    });
    o(E, "constructor", {
      value: w,
      configurable: true,
    });
    w.displayName = s(E, u, "GeneratorFunction");
    t.isGeneratorFunction = function (e) {
      const t = typeof e === "function" && e.constructor;
      return (
        !!t && (t === w || (t.displayName || t.name) === "GeneratorFunction")
      );
    };
    t.mark = function (e) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(e, E);
      } else {
        e.__proto__ = E;
        s(e, u, "GeneratorFunction");
      }
      e.prototype = Object.create(_);
      return e;
    };
    t.awrap = function (e) {
      return {
        __await: e,
      };
    };
    I(S.prototype);
    s(S.prototype, c, function () {
      return this;
    });
    t.AsyncIterator = S;
    t.async = function (e, n, r, o, a = Promise) {
      const i = new S(l(e, n, r, o), a);
      if (t.isGeneratorFunction(n)) {
        return i;
      }
      return i.next().then((e) => {
        if (e.done) {
          return e.value;
        }
        return i.next();
      });
    };
    I(_);
    s(_, u, "Generator");
    s(_, i, function () {
      return this;
    });
    s(_, "toString", function () {
      return "[object Generator]";
    });
    t.keys = function (e) {
      const t = Object(e);
      const n = [];
      for (const r in t) {
        n.push(r);
      }
      n.reverse();
      return function e() {
        while (n.length) {
          const r = n.pop();
          if (r in t) {
            e.value = r;
            e.done = false;
            return e;
          }
        }
        e.done = true;
        return e;
      };
    };
    t.values = U;
    N.prototype = {
      constructor: N,
      reset: function (t) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = e;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = e;
        this.tryEntries.forEach(P);
        if (!t) {
          for (const n in this) {
            if (
              n.charAt(0) === "t" &&
              hasOwnProperty.call(this, n) &&
              !isNaN(+n.slice(1))
            ) {
              this[n] = e;
            }
          }
        }
      },
      stop: function () {
        this.done = true;
        const completion = this.tryEntries[0].completion;
        if (completion.type === "throw") {
          throw completion.arg;
        }
        return this.rval;
      },
      dispatchException: function (t) {
        if (this.done) {
          throw t;
        }
        const n = this;
        function o(r, o) {
          c.type = "throw";
          c.arg = t;
          n.next = r;
          if (o) {
            n.method = "next";
            n.arg = e;
          }
          return !!o;
        }
        for (let a = this.tryEntries.length - 1; a >= 0; --a) {
          const i = this.tryEntries[a];
          var c = i.completion;
          if (i.tryLoc === "root") {
            return o("end");
          }
          if (i.tryLoc <= this.prev) {
            const u = hasOwnProperty.call(i, "catchLoc");
            const s = hasOwnProperty.call(i, "finallyLoc");
            if (u && s) {
              if (this.prev < i.catchLoc) {
                return o(i.catchLoc, true);
              }
              if (this.prev < i.finallyLoc) {
                return o(i.finallyLoc);
              }
            } else if (u) {
              if (this.prev < i.catchLoc) {
                return o(i.catchLoc, true);
              }
            } else {
              if (!s) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < i.finallyLoc) {
                return o(i.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let n = this.tryEntries.length - 1; n >= 0; --n) {
          const o = this.tryEntries[n];
          if (
            o.tryLoc <= this.prev &&
            hasOwnProperty.call(o, "finallyLoc") &&
            this.prev < o.finallyLoc
          ) {
            var a = o;
            break;
          }
        }
        if (
          a &&
          (e === "break" || e === "continue") &&
          a.tryLoc <= t &&
          t <= a.finallyLoc
        ) {
          a = null;
        }
        const i = a ? a.completion : {};
        i.type = e;
        i.arg = t;
        if (a) {
          return ((this.method = "next"), (this.next = a.finallyLoc), y);
        }
        return this.complete(i);
      },
      complete: function (e, t) {
        if (e.type === "throw") {
          throw e.arg;
        }
        if (e.type === "break" || e.type === "continue") {
          this.next = e.arg;
        } else if (e.type === "return") {
          this.rval = this.arg = e.arg;
          this.method = "return";
          this.next = "end";
        } else if (e.type === "normal" && t) {
          this.next = t;
        }
        return y;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.finallyLoc === e) {
            this.complete(n.completion, n.afterLoc);
            P(n);
            return y;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.tryLoc === e) {
            const r = n.completion;
            if (r.type === "throw") {
              var o = r.arg;
              P(n);
            }
            return o;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (t, n, r) {
        this.delegate = {
          iterator: U(t),
          resultName: n,
          nextLoc: r,
        };
        if (this.method === "next") {
          this.arg = e;
        }
        return y;
      },
    };
    return t;
  }
  function m(e, t) {
    const n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      let r = Object.getOwnPropertySymbols(e);
      if (t) {
        r = r.filter((t) => Object.getOwnPropertyDescriptor(e, t).enumerable);
      }
      n.push(...r);
    }
    return n;
  }
  function g(e) {
    for (let t = 1; t < arguments.length; t++) {
      var n = arguments[t] ?? {};
      if (t % 2) {
        m(Object(n), true).forEach((t) => {
          v(e, t, n[t]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(e, Object.getOwnPropertyDescriptors(n));
      } else {
        m(Object(n)).forEach((t) => {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
        });
      }
    }
    return e;
  }
  function v(e, t, n) {
    if (
      (t = ((e) => {
        const computeT = (e) => {
          const t = "string";
          if (h(e) != "object" || !e) {
            return e;
          }
          const n = e[Symbol.toPrimitive];
          if (n !== undefined) {
            const r = n.call(e, t || "default");
            if (h(r) != "object") {
              return r;
            }
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return (t === "string" ? String : Number)(e);
        };
        const t = computeT(e);
        if (h(t) == "symbol") {
          return t;
        }
        return `${t}`;
      })(t)) in e
    ) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      e[t] = n;
    }
    return e;
  }
  function y(e, t, n, r, o, a, i) {
    try {
      var c = e[a](i);
      var u = c.value;
    } catch (error) {
      return void n(error);
    }
    if (c.done) {
      t(u);
    } else {
      Promise.resolve(u).then(r, o);
    }
  }
  function b(e) {
    return function () {
      const t = this;
      const n = arguments;
      return new Promise((resolve, reject) => {
        const a = e.apply(t, n);
        function i(e) {
          y(a, resolve, reject, i, c, "next", e);
        }
        function c(e) {
          y(a, resolve, reject, i, c, "throw", e);
        }
        i(undefined);
      });
    };
  }
  var w = null;
  var E = null;
  var x = null;
  function L(e, t) {
    try {
      return chrome.i18n.getMessage(e) || t;
    } catch (e) {
      return t;
    }
  }
  function O() {
    if (!w || !w.isConnected) {
      d();
      w = document.createElement("div");
      w.className = `exception-${chrome.runtime.id}`;
      w.style.all = "initial";
      E = w.attachShadow({
        mode: "open",
      });
      const e = document.createElement("style");
      e.textContent =
        '\n  :host {\n    all: initial;\n    --font-sans: "Bo doi Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", Arial, sans-serif;\n    --font-mono: "Bo doi Geist Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;\n    --primary: #1f1f1f;\n    --secondary: #74777c;\n    --quaternary: #b1b6bc;\n    --background: #ffffff;\n    --surface: #f2f2f2;\n    --elevated: #f2f2f2;\n    --surface-elevated: #ffffff;\n    --stroke: rgba(0, 0, 0, 0.08);\n    color-scheme: light;\n  }\n\n  @media (prefers-color-scheme: dark) {\n    :host {\n      --primary: #eeeeee;\n      --secondary: #c7c7c7;\n      --quaternary: #6c7075;\n      --background: #131313;\n      --surface: #1c1c1c;\n      --elevated: #2c2c2c;\n      --surface-elevated: #1f1f1f;\n      --stroke: rgba(255, 255, 255, 0.08);\n      color-scheme: dark;\n    }\n  }\n\n  :host(.force-light) {\n    --primary: #1f1f1f;\n    --secondary: #74777c;\n    --quaternary: #b1b6bc;\n    --background: #ffffff;\n    --surface: #f2f2f2;\n    --elevated: #f2f2f2;\n    --surface-elevated: #ffffff;\n    --stroke: rgba(0, 0, 0, 0.08);\n    color-scheme: light;\n  }\n\n  :host(.force-dark) {\n    --primary: #eeeeee;\n    --secondary: #c7c7c7;\n    --quaternary: #6c7075;\n    --background: #131313;\n    --surface: #1c1c1c;\n    --elevated: #2c2c2c;\n    --surface-elevated: #1f1f1f;\n    --stroke: rgba(255, 255, 255, 0.08);\n    color-scheme: dark;\n  }\n\n  .modal {\n    width: 400px;\n    max-width: calc(100vw - 32px);\n    max-height: 90vh;\n    padding: 0;\n    border: none;\n    border-radius: 16px;\n    margin: auto;\n    background: var(--surface-elevated);\n    color: var(--primary);\n    box-shadow: 0 0 0 1px var(--stroke), 0 2px 8px 0 rgba(0, 0, 0, 0.06);\n    font-family: var(--font-sans);\n    overflow: hidden;\n  }\n\n  .modal::backdrop {\n    background: rgba(0, 0, 0, 0.4);\n  }\n\n  .content-wrapper {\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n    padding: 24px;\n  }\n\n  h2 {\n    margin: 0;\n    font-size: 16px;\n    font-weight: 600;\n    color: var(--primary);\n  }\n\n  p {\n    margin: 0;\n    font-size: 14px;\n    line-height: 1.5;\n    color: var(--secondary);\n  }\n\n  p:empty {\n    display: none;\n  }\n\n  .input-mono {\n    height: 40px;\n    width: 100%;\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0 12px;\n    background: transparent;\n    border: 1px solid var(--stroke);\n    border-radius: 8px;\n    font-size: 14px;\n    font-family: var(--font-mono);\n    color: var(--primary);\n    outline: none;\n  }\n\n  .input-mono:focus {\n    border-color: var(--quaternary);\n  }\n\n  .input-mono::placeholder {\n    color: var(--secondary);\n  }\n\n  .dialog-fields {\n    display: flex;\n    gap: 12px;\n  }\n\n  .dialog-field {\n    flex: 1;\n    min-width: 0;\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n  }\n\n  .dialog-field-label {\n    padding-top: 8px;\n    font-size: 12px;\n    font-weight: 500;\n    color: var(--secondary);\n  }\n\n  .dialog-number {\n    position: relative;\n    display: flex;\n    align-items: center;\n  }\n\n  .dialog-unit {\n    position: absolute;\n    right: 12px;\n    font-size: 12px;\n    font-family: var(--font-mono);\n    color: var(--secondary);\n    pointer-events: none;\n  }\n\n  .dialog-number .input-mono {\n    padding-right: 32px;\n  }\n\n  .input-mono::-webkit-outer-spin-button,\n  .input-mono::-webkit-inner-spin-button {\n    -webkit-appearance: none;\n    margin: 0;\n  }\n\n  .input-mono[type="number"] {\n    -moz-appearance: textfield;\n    appearance: textfield;\n  }\n\n  .dialog-actions {\n    display: flex;\n    justify-content: flex-end;\n    gap: 8px;\n    padding-top: 8px;\n  }\n\n  .btn-dialog-primary,\n  .btn-dialog-secondary {\n    height: 36px;\n    padding: 0 16px;\n    border: none;\n    border-radius: 12px;\n    font-size: 14px;\n    font-weight: 500;\n    font-family: var(--font-sans);\n    cursor: pointer;\n    outline: none;\n  }\n\n  .btn-dialog-primary {\n    background: var(--primary);\n    color: var(--background);\n  }\n\n  .btn-dialog-primary:hover {\n    opacity: 0.9;\n  }\n\n  .btn-dialog-secondary {\n    background: transparent;\n    color: var(--primary);\n  }\n\n  .btn-dialog-secondary:hover {\n    background: var(--elevated);\n  }\n';
      E.appendChild(e);
      document.body.appendChild(w);
    }
  }
  function _() {
    return I.apply(this, arguments);
  }
  function I() {
    return (I = b(
      p().mark(function e() {
        let t;
        let n;
        return p().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  w.classList.remove("force-light", "force-dark");
                  e.prev = 1;
                  e.next = 4;
                  return chrome.storage.local.get({
                    theme: "system",
                  });
                case 4:
                  t = e.sent;
                  if ((n = t.theme) === "dark") {
                    w.classList.add("force-dark");
                  } else if (n === "light") {
                    w.classList.add("force-light");
                  }
                  e.next = 11;
                  break;
                case 9:
                  e.prev = 9;
                  e.t0 = e.catch(1);
                case 11:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[1, 9]],
        );
      }),
    )).apply(this, arguments);
  }
  function S(e) {
    return C.apply(this, arguments);
  }
  function C() {
    return (C = b(
      p().mark(function e(t) {
        return p().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                O();
                e.next = 3;
                return _();
              case 3:
                return e.abrupt(
                  "return",
                  new Promise((resolve) => {
                    if (x) {
                      x.remove();
                      x = null;
                    }
                    const n = document.createElement("dialog");
                    n.className = "modal";
                    const r = document.createElement("div");
                    r.className = "content-wrapper";
                    if (t.title) {
                      const o = document.createElement("h2");
                      o.textContent = t.title;
                      r.appendChild(o);
                    }
                    const a = document.createElement("p");
                    a.textContent = t.body || "";
                    r.appendChild(a);
                    let i = null;
                    let c = null;
                    if (t.type === "size") {
                      const u = document.createElement("div");
                      u.className = "dialog-fields";
                      const s = (e, n, r) => {
                        const o = document.createElement("label");
                        o.className = "dialog-field";
                        const a = document.createElement("span");
                        a.className = "dialog-field-label";
                        a.textContent = e;
                        o.appendChild(a);
                        const i = document.createElement("div");
                        i.className = "dialog-number";
                        const c = document.createElement("input");
                        c.type = "number";
                        c.className = "input-mono";
                        c.min = String(r ?? 1);
                        if (t.max != null) {
                          c.max = String(t.max);
                        }
                        c.inputMode = "numeric";
                        c.autocomplete = "off";
                        if (n != null) {
                          c.value = String(n);
                        }
                        i.appendChild(c);
                        const s = document.createElement("span");
                        s.className = "dialog-unit";
                        s.textContent = "px";
                        i.appendChild(s);
                        o.appendChild(i);
                        u.appendChild(o);
                        return c;
                      };
                      i = s(L("LABEL_WIDTH", "Width"), t.width, t.minWidth);
                      c = s(L("LABEL_HEIGHT", "Height"), t.height, t.minHeight);
                      r.appendChild(u);
                    }
                    let l = null;
                    if (t.type === "prompt") {
                      (l = document.createElement("input")).type = "text";
                      l.className = "input-mono";
                      l.autocomplete = "off";
                      l.spellcheck = false;
                      if (t.placeholder) {
                        l.placeholder = t.placeholder;
                      }
                      if (t.value) {
                        l.value = t.value;
                      }
                      r.appendChild(l);
                    }
                    const f = document.createElement("div");
                    f.className = "dialog-actions";
                    const d = (t) => {
                      try {
                        n.close();
                      } catch (e) {}
                      n.remove();
                      if (x === n) {
                        x = null;
                      }
                      resolve(t);
                    };
                    const h =
                      t.type === "prompt" || t.type === "size"
                        ? null
                        : t.type !== "confirm" && undefined;
                    if (t.type !== "alert") {
                      const p = document.createElement("button");
                      p.type = "button";
                      p.className = "btn-dialog-secondary";
                      p.textContent =
                        t.cancelLabel || L("DIALOG_CANCEL_BUTTON", "Cancel");
                      p.addEventListener("click", function () {
                        return d(h);
                      });
                      f.appendChild(p);
                    }
                    const m = document.createElement("button");
                    m.type = "button";
                    m.className = "btn-dialog-primary";
                    m.textContent =
                      t.confirmLabel ||
                      (t.type === "alert"
                        ? L("DIALOG_OK", "OK")
                        : L("DIALOG_CONFIRM", "Confirm"));
                    m.addEventListener("click", function () {
                      if (t.type === "prompt") {
                        d(l.value);
                      } else if (t.type === "confirm") {
                        d(true);
                      } else if (t.type === "size") {
                        const e = parseInt(i.value, 10);
                        const n = parseInt(c.value, 10);
                        const r = (e, n) =>
                          Math.min(t.max ?? Infinity, Math.max(n ?? 1, e));
                        if (!Number.isFinite(e) || !Number.isFinite(n)) {
                          return void d(null);
                        }
                        d({
                          width: r(e, t.minWidth),
                          height: r(n, t.minHeight),
                        });
                      } else {
                        d();
                      }
                    });
                    f.appendChild(m);
                    r.appendChild(f);
                    n.appendChild(r);
                    n.addEventListener("cancel", function (e) {
                      e.preventDefault();
                      d(h);
                    });
                    n.addEventListener("click", function (e) {
                      if (e.target === n) {
                        d(h);
                      }
                    });
                    E.appendChild(n);
                    x = n;
                    n.showModal();
                    if (l) {
                      setTimeout(() => l.focus(), 50);
                    }
                    if (i) {
                      setTimeout(() => {
                        i.focus();
                        i.select();
                      }, 50);
                      for (let g = 0, v = [i, c]; g < v.length; g++) {
                        v[g].addEventListener("keydown", function (e) {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            m.click();
                          }
                        });
                      }
                    }
                  }),
                );
              case 4:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  const k = {
    alert: function (_param_0 = {}) {
      return S(
        g(
          g({}, _param_0),
          {},
          {
            type: "alert",
          },
        ),
      );
    },
    confirm: function (_param_0 = {}) {
      return S(
        g(
          g({}, _param_0),
          {},
          {
            type: "confirm",
          },
        ),
      );
    },
    prompt: function (_param_0 = {}) {
      return S(
        g(
          g({}, _param_0),
          {},
          {
            type: "prompt",
          },
        ),
      );
    },
    size: function (_param_0 = {}) {
      return S(
        g(
          g({}, _param_0),
          {},
          {
            type: "size",
          },
        ),
      );
    },
  };
  function T(e) {
    T =
      typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
        ? function (e) {
            return typeof e;
          }
        : function (e) {
            if (
              e &&
              typeof Symbol === "function" &&
              e.constructor === Symbol &&
              e !== Symbol.prototype
            ) {
              return "symbol";
            }
            return typeof e;
          };
    return T(e);
  }
  function P(e, t) {
    const n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      let r = Object.getOwnPropertySymbols(e);
      if (t) {
        r = r.filter((t) => Object.getOwnPropertyDescriptor(e, t).enumerable);
      }
      n.push(...r);
    }
    return n;
  }
  function N(e) {
    for (let t = 1; t < arguments.length; t++) {
      var n = arguments[t] ?? {};
      if (t % 2) {
        P(Object(n), true).forEach((t) => {
          U(e, t, n[t]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(e, Object.getOwnPropertyDescriptors(n));
      } else {
        P(Object(n)).forEach((t) => {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
        });
      }
    }
    return e;
  }
  function U(e, t, n) {
    if (
      (t = ((e) => {
        const computeT = (e) => {
          const t = "string";
          if (T(e) != "object" || !e) {
            return e;
          }
          const n = e[Symbol.toPrimitive];
          if (n !== undefined) {
            const r = n.call(e, t || "default");
            if (T(r) != "object") {
              return r;
            }
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return (t === "string" ? String : Number)(e);
        };
        const t = computeT(e);
        if (T(t) == "symbol") {
          return t;
        }
        return `${t}`;
      })(t)) in e
    ) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      e[t] = n;
    }
    return e;
  }
  function M() {
    M = function () {
      return t;
    };
    let e;
    var t = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const o =
      Object.defineProperty ||
      ((e, t, n) => {
        e[t] = n.value;
      });
    const a = typeof Symbol === "function" ? Symbol : {};
    const i = a.iterator || "@@iterator";
    const c = a.asyncIterator || "@@asyncIterator";
    const u = a.toStringTag || "@@toStringTag";
    function s(e, t, n) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      s({}, "");
    } catch (e) {
      s = function (e, t, n) {
        return (e[t] = n);
      };
    }
    function l(e, t, n, r) {
      const a = t && t.prototype instanceof v ? t : v;
      const i = Object.create(a.prototype);
      const c = new P(r || []);
      o(i, "_invoke", {
        value: I(e, n, c),
      });
      return i;
    }
    function f(e, t, n) {
      try {
        return {
          type: "normal",
          arg: e.call(t, n),
        };
      } catch (error) {
        return {
          type: "throw",
          arg: error,
        };
      }
    }
    t.wrap = l;
    var d = "suspendedStart";
    var h = "suspendedYield";
    var p = "executing";
    var m = "completed";
    var g = {};
    function v() {}
    function y() {}
    function b() {}
    let w = {};
    s(w, i, function () {
      return this;
    });
    const x =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(N([])));
    if (x && x !== Object.prototype && hasOwnProperty.call(x, i)) {
      w = x;
    }
    const L = (b.prototype = v.prototype = Object.create(w));
    function O(e) {
      ["next", "throw", "return"].forEach((t) => {
        s(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function _(e, t) {
      function n(o, a, i, c) {
        const u = f(e[o], e, a);
        if (u.type !== "throw") {
          const s = u.arg;
          const l = s.value;
          if (l && T(l) == "object" && hasOwnProperty.call(l, "__await")) {
            return t.resolve(l.__await).then(
              (e) => {
                n("next", e, i, c);
              },
              (e) => {
                n("throw", e, i, c);
              },
            );
          }
          return t.resolve(l).then(
            (e) => {
              s.value = e;
              i(s);
            },
            (e) => n("throw", e, i, c),
          );
        }
        c(u.arg);
      }
      let a;
      o(this, "_invoke", {
        value: function (e, r) {
          function o() {
            return new t(function (t, o) {
              n(e, r, t, o);
            });
          }
          return (a = a ? a.then(o, o) : o());
        },
      });
    }
    function I(t, n, r) {
      let o = d;
      return function (a, i) {
        if (o === p) {
          throw Error("Generator is already running");
        }
        if (o === m) {
          if (a === "throw") {
            throw i;
          }
          return {
            value: e,
            done: true,
          };
        }
        r.method = a;
        for (r.arg = i; ;) {
          const c = r.delegate;
          if (c) {
            const u = S(c, r);
            if (u) {
              if (u === g) {
                continue;
              }
              return u;
            }
          }
          if (r.method === "next") {
            r.sent = r._sent = r.arg;
          } else if (r.method === "throw") {
            if (o === d) {
              o = m;
              throw r.arg;
            }
            r.dispatchException(r.arg);
          } else {
            if (r.method === "return") {
              r.abrupt("return", r.arg);
            }
          }
          o = p;
          const s = f(t, n, r);
          if (s.type === "normal") {
            o = r.done ? m : h;
            if (s.arg === g) {
              continue;
            }
            return {
              value: s.arg,
              done: r.done,
            };
          }
          if (s.type === "throw") {
            o = m;
            r.method = "throw";
            r.arg = s.arg;
          }
        }
      };
    }
    function S(t, n) {
      const n_method = n.method;
      const o = t.iterator[n_method];
      if (o === e) {
        n.delegate = null;
        if (
          !(
            n_method === "throw" &&
            t.iterator.return &&
            ((n.method = "return"), (n.arg = e), S(t, n), n.method === "throw")
          )
        ) {
          if (n_method !== "return") {
            n.method = "throw";
            n.arg = new TypeError(
              `The iterator does not provide a '${n_method}' method`,
            );
          }
        }
        return g;
      }
      const a = f(o, t.iterator, n.arg);
      if (a.type === "throw") {
        n.method = "throw";
        n.arg = a.arg;
        n.delegate = null;
        return g;
      }
      const a_arg = a.arg;
      if (a_arg) {
        if (a_arg.done) {
          return (
            (n[t.resultName] = a_arg.value),
            (n.next = t.nextLoc),
            n.method !== "return" && ((n.method = "next"), (n.arg = e)),
            (n.delegate = null),
            g
          );
        }
        return a_arg;
      }
      return (
        (n.method = "throw"),
        (n.arg = new TypeError("iterator result is not an object")),
        (n.delegate = null),
        g
      );
    }
    function C(e) {
      const t = {
        tryLoc: e[0],
      };
      if (1 in e) {
        t.catchLoc = e[1];
      }
      if (2 in e) {
        t.finallyLoc = e[2];
        t.afterLoc = e[3];
      }
      this.tryEntries.push(t);
    }
    function k(e) {
      const t = e.completion || {};
      t.type = "normal";
      delete t.arg;
      e.completion = t;
    }
    function P(e) {
      this.tryEntries = [
        {
          tryLoc: "root",
        },
      ];
      e.forEach(C, this);
      this.reset(true);
    }
    function N(t) {
      if (t || t === "") {
        const n = t[i];
        if (n) {
          return n.call(t);
        }
        if (typeof t.next === "function") {
          return t;
        }
        if (!isNaN(t.length)) {
          let o = -1;
          const a = function n() {
            while (++o < t.length) {
              if (hasOwnProperty.call(t, o)) {
                n.value = t[o];
                n.done = false;
                return n;
              }
            }
            n.value = e;
            n.done = true;
            return n;
          };
          return (a.next = a);
        }
      }
      throw new TypeError(`${T(t)} is not iterable`);
    }
    y.prototype = b;
    o(L, "constructor", {
      value: b,
      configurable: true,
    });
    o(b, "constructor", {
      value: y,
      configurable: true,
    });
    y.displayName = s(b, u, "GeneratorFunction");
    t.isGeneratorFunction = function (e) {
      const t = typeof e === "function" && e.constructor;
      return (
        !!t && (t === y || (t.displayName || t.name) === "GeneratorFunction")
      );
    };
    t.mark = function (e) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(e, b);
      } else {
        e.__proto__ = b;
        s(e, u, "GeneratorFunction");
      }
      e.prototype = Object.create(L);
      return e;
    };
    t.awrap = function (e) {
      return {
        __await: e,
      };
    };
    O(_.prototype);
    s(_.prototype, c, function () {
      return this;
    });
    t.AsyncIterator = _;
    t.async = function (e, n, r, o, a = Promise) {
      const i = new _(l(e, n, r, o), a);
      if (t.isGeneratorFunction(n)) {
        return i;
      }
      return i.next().then((e) => {
        if (e.done) {
          return e.value;
        }
        return i.next();
      });
    };
    O(L);
    s(L, u, "Generator");
    s(L, i, function () {
      return this;
    });
    s(L, "toString", function () {
      return "[object Generator]";
    });
    t.keys = function (e) {
      const t = Object(e);
      const n = [];
      for (const r in t) {
        n.push(r);
      }
      n.reverse();
      return function e() {
        while (n.length) {
          const r = n.pop();
          if (r in t) {
            e.value = r;
            e.done = false;
            return e;
          }
        }
        e.done = true;
        return e;
      };
    };
    t.values = N;
    P.prototype = {
      constructor: P,
      reset: function (t) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = e;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = e;
        this.tryEntries.forEach(k);
        if (!t) {
          for (const n in this) {
            if (
              n.charAt(0) === "t" &&
              hasOwnProperty.call(this, n) &&
              !isNaN(+n.slice(1))
            ) {
              this[n] = e;
            }
          }
        }
      },
      stop: function () {
        this.done = true;
        const completion = this.tryEntries[0].completion;
        if (completion.type === "throw") {
          throw completion.arg;
        }
        return this.rval;
      },
      dispatchException: function (t) {
        if (this.done) {
          throw t;
        }
        const n = this;
        function o(r, o) {
          c.type = "throw";
          c.arg = t;
          n.next = r;
          if (o) {
            n.method = "next";
            n.arg = e;
          }
          return !!o;
        }
        for (let a = this.tryEntries.length - 1; a >= 0; --a) {
          const i = this.tryEntries[a];
          var c = i.completion;
          if (i.tryLoc === "root") {
            return o("end");
          }
          if (i.tryLoc <= this.prev) {
            const u = hasOwnProperty.call(i, "catchLoc");
            const s = hasOwnProperty.call(i, "finallyLoc");
            if (u && s) {
              if (this.prev < i.catchLoc) {
                return o(i.catchLoc, true);
              }
              if (this.prev < i.finallyLoc) {
                return o(i.finallyLoc);
              }
            } else if (u) {
              if (this.prev < i.catchLoc) {
                return o(i.catchLoc, true);
              }
            } else {
              if (!s) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < i.finallyLoc) {
                return o(i.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let n = this.tryEntries.length - 1; n >= 0; --n) {
          const o = this.tryEntries[n];
          if (
            o.tryLoc <= this.prev &&
            hasOwnProperty.call(o, "finallyLoc") &&
            this.prev < o.finallyLoc
          ) {
            var a = o;
            break;
          }
        }
        if (
          a &&
          (e === "break" || e === "continue") &&
          a.tryLoc <= t &&
          t <= a.finallyLoc
        ) {
          a = null;
        }
        const i = a ? a.completion : {};
        i.type = e;
        i.arg = t;
        if (a) {
          return ((this.method = "next"), (this.next = a.finallyLoc), g);
        }
        return this.complete(i);
      },
      complete: function (e, t) {
        if (e.type === "throw") {
          throw e.arg;
        }
        if (e.type === "break" || e.type === "continue") {
          this.next = e.arg;
        } else if (e.type === "return") {
          this.rval = this.arg = e.arg;
          this.method = "return";
          this.next = "end";
        } else if (e.type === "normal" && t) {
          this.next = t;
        }
        return g;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.finallyLoc === e) {
            this.complete(n.completion, n.afterLoc);
            k(n);
            return g;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.tryLoc === e) {
            const r = n.completion;
            if (r.type === "throw") {
              var o = r.arg;
              k(n);
            }
            return o;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (t, n, r) {
        this.delegate = {
          iterator: N(t),
          resultName: n,
          nextLoc: r,
        };
        if (this.method === "next") {
          this.arg = e;
        }
        return g;
      },
    };
    return t;
  }
  function D(e, t, n, r, o, a, i) {
    try {
      var c = e[a](i);
      var u = c.value;
    } catch (error) {
      return void n(error);
    }
    if (c.done) {
      t(u);
    } else {
      Promise.resolve(u).then(r, o);
    }
  }
  function A(e) {
    return function () {
      const t = this;
      const n = arguments;
      return new Promise((resolve, reject) => {
        const a = e.apply(t, n);
        function i(e) {
          D(a, resolve, reject, i, c, "next", e);
        }
        function c(e) {
          D(a, resolve, reject, i, c, "throw", e);
        }
        i(undefined);
      });
    };
  }
  function j() {
    return (j = A(
      M().mark(function e() {
        let t;
        let n;
        let r;
        return M().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                d();
                V();
                e.next = 4;
                return i.storageLocalGet({
                  theme: "system",
                });
              case 4:
                t = e.sent;
                H((n = t.theme));
                r = document.getElementById("theme-select");
                r.value = n;
                r.addEventListener("change", q);
                return (e.next = 12);
              case 12:
                re();
                e.next = 16;
                return z();
              case 16:
                e.next = 18;
                return Q();
              case 18:
                B();
                document.body.style.opacity = "1";
              case 20:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  document.addEventListener("DOMContentLoaded", function () {
    return j.apply(this, arguments);
  });
  chrome.storage.onChanged.addListener(function (e) {
    if (e.theme) {
      const t = e.theme.newValue || "system";
      H(t);
      const n = document.getElementById("theme-select");
      if (n && n.value !== t) {
        n.value = t;
      }
    }
    if (e.mcpIntent && F) {
      F(!!e.mcpIntent.newValue);
    }
    if (e.sidePanelPreferences) {
      const o = e.sidePanelPreferences.newValue?.colorFormat;
      const a = document.getElementById("color-format-select");
      if (a && o && a.value !== o) {
        a.value = o;
      }
    }
    if (e.screenshotPreferences) {
      const i = e.screenshotPreferences.newValue || {};
      const c = document.getElementById("screenshot-padding-toggle");
      const u = document.getElementById("screenshot-highlights-toggle");
      if (c && typeof i.includePadding === "boolean") {
        c.checked = i.includePadding;
      }
      if (u && typeof i.includeHighlights === "boolean") {
        u.checked = i.includeHighlights;
      }
    }
  });
  var F = null;
  function B() {
    return G.apply(this, arguments);
  }
  function G() {
    return (G = A(
      M().mark(function e() {
        let n;
        let s;
        let l;
        let f;
        let d;
        let h;
        return M().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if ((n = document.getElementById("mcp-connect-button"))) {
                    e.next = 3;
                    break;
                  }
                  return e.abrupt("return");
                case 3:
                  if ((s = document.getElementById("mcp-version-warning"))) {
                    s.setAttribute(
                      "title",
                      chrome.i18n.getMessage(
                        "OPTIONS_MCP_VERSION_OUTDATED_TOOLTIP",
                      ),
                    );
                  }
                  l = function (e) {
                    if (s) {
                      s.hidden = !(e && e.versionMismatch);
                    }
                  };
                  f = function () {
                    n.textContent = chrome.i18n.getMessage(
                      "OPTIONS_MCP_DISCONNECT_BUTTON",
                    );
                    n.dataset.state = "connected";
                  };
                  d = function () {
                    n.textContent = chrome.i18n.getMessage(
                      "OPTIONS_MCP_CONNECT_BUTTON",
                    );
                    n.dataset.state = "disconnected";
                  };
                  F = function (e) {
                    if (e) {
                      f();
                    } else {
                      d();
                      l(null);
                    }
                  };
                  e.prev = 21;
                  e.next = 24;
                  return i.sendMessage({
                    target: "background",
                    action: "request_mcp_status",
                  });
                case 24:
                  if ((h = e.sent) && h.intent) {
                    f();
                  } else {
                    d();
                  }
                  l(h);
                  e.next = 33;
                  break;
                case 29:
                  e.prev = 29;
                  e.t0 = e.catch(21);
                  d();
                  l(null);
                case 33:
                  n.addEventListener(
                    "click",
                    A(
                      M().mark(function e() {
                        let t;
                        let r;
                        return M().wrap(
                          function (e) {
                            while (true) {
                              switch ((e.prev = e.next)) {
                                case 0:
                                  t = n.dataset.state === "connected";
                                  n.disabled = true;
                                  e.prev = 2;
                                  if (!t) {
                                    e.next = 10;
                                    break;
                                  }
                                  e.next = 6;
                                  return i.sendMessage({
                                    target: "background",
                                    action: "request_mcp_disconnect",
                                  });
                                case 6:
                                  d();
                                  l(null);
                                  e.next = 18;
                                  break;
                                case 10:
                                  e.next = 12;
                                  return i.sendMessage({
                                    target: "background",
                                    action: "request_mcp_connect",
                                  });
                                case 12:
                                  r = e.sent;
                                  f();
                                  l(r);
                                  if (!r || !r.versionMismatch) {
                                    e.next = 18;
                                    break;
                                  }
                                  e.next = 18;
                                  return k.alert({
                                    title: chrome.i18n.getMessage(
                                      "OPTIONS_MCP_VERSION_OUTDATED_TITLE",
                                    ),
                                    body: chrome.i18n.getMessage(
                                      "OPTIONS_MCP_VERSION_OUTDATED_BODY",
                                      [
                                        r.serverVersion ||
                                          chrome.i18n.getMessage(
                                            "OPTIONS_MCP_VERSION_UNKNOWN",
                                          ),
                                        c.MIN_MCP_SERVER_VERSION,
                                      ],
                                    ),
                                  });
                                case 18:
                                  e.prev = 18;
                                  n.disabled = false;
                                  return e.finish(18);
                                case 21:
                                case "end":
                                  return e.stop();
                              }
                            }
                          },
                          e,
                          null,
                          [[2, , 18, 21]],
                        );
                      }),
                    ),
                  );
                case 34:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[21, 29]],
        );
      }),
    )).apply(this, arguments);
  }
  function V() {
    document.querySelectorAll("[data-i18n]").forEach((e) => {
      const t = chrome.i18n.getMessage(e.dataset.i18n);
      if (t) {
        e.textContent = t;
      }
    });
    document.querySelectorAll("[data-i18n-html]").forEach((e) => {
      const t = chrome.i18n.getMessage(e.dataset.i18nHtml);
      if (t) {
        e.innerHTML = t;
      }
    });
  }
  function H(e) {
    const document_documentElement = document.documentElement;
    switch (e) {
      case "dark":
        document_documentElement.classList.remove("force-light");
        document_documentElement.classList.add("force-dark");
        break;
      case "light":
        document_documentElement.classList.remove("force-dark");
        document_documentElement.classList.add("force-light");
        break;
      default:
        document_documentElement.classList.remove("force-light", "force-dark");
    }
  }
  function q(e) {
    return Y.apply(this, arguments);
  }
  function Y() {
    return (Y = A(
      M().mark(function e(t) {
        let theme;
        return M().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                theme = t.target.value;
                e.next = 3;
                return i.storageLocalSet({
                  theme,
                });
              case 3:
                H(theme);
              case 4:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function z() {
    return K.apply(this, arguments);
  }
  function K() {
    return (K = A(
      M().mark(function e() {
        let t;
        let n;
        let r;
        return M().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                t = document.getElementById("color-format-select");
                e.next = 3;
                return i.storageLocalGet({
                  sidePanelPreferences: {},
                });
              case 3:
                n = e.sent;
                r = n.sidePanelPreferences;
                t.value = r?.colorFormat || "HEX";
                t.addEventListener("change", W);
              case 7:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function W(e) {
    return J.apply(this, arguments);
  }
  function J() {
    return (J = A(
      M().mark(function e(t) {
        let n;
        let r;
        let sidePanelPreferences;
        return M().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                e.next = 2;
                return i.storageLocalGet({
                  sidePanelPreferences: {},
                });
              case 2:
                n = e.sent;
                r = n.sidePanelPreferences;
                sidePanelPreferences = N(
                  N({}, r || {}),
                  {},
                  {
                    colorFormat: t.target.value,
                  },
                );
                e.next = 7;
                return i.storageLocalSet({
                  sidePanelPreferences,
                });
              case 7:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function Q() {
    return X.apply(this, arguments);
  }
  function X() {
    return (X = A(
      M().mark(function e() {
        let t;
        let n;
        let r;
        let o;
        return M().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                t = document.getElementById("screenshot-padding-toggle");
                n = document.getElementById("screenshot-highlights-toggle");
                e.next = 4;
                return i.storageLocalGet({
                  screenshotPreferences: {
                    includePadding: true,
                    includeHighlights: true,
                  },
                });
              case 4:
                r = e.sent;
                o = r.screenshotPreferences;
                t.checked = o.includePadding !== false;
                n.checked = o.includeHighlights !== false;
                t.addEventListener("change", $);
                n.addEventListener("change", $);
              case 10:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function $() {
    return Z.apply(this, arguments);
  }
  function Z() {
    return (Z = A(
      M().mark(function e() {
        let t;
        let n;
        return M().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                t = document.getElementById("screenshot-padding-toggle");
                n = document.getElementById("screenshot-highlights-toggle");
                e.next = 4;
                return i.storageLocalSet({
                  screenshotPreferences: {
                    includePadding: t.checked,
                    includeHighlights: n.checked,
                  },
                });
              case 4:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function re() {
    const e = document.getElementById("clear-saved-edits-button");
    if (e) {
      e.textContent = chrome.i18n.getMessage("OPTIONS_SAVED_EDITS_CLEAR");
      e.addEventListener(
        "click",
        A(
          M().mark(function e() {
            let t;
            let n;
            return M().wrap(function (e) {
              while (true) {
                switch ((e.prev = e.next)) {
                  case 0:
                    e.next = 2;
                    return k.confirm({
                      title: chrome.i18n.getMessage(
                        "OPTIONS_SAVED_EDITS_CONFIRM_TITLE",
                      ),
                      body: chrome.i18n.getMessage(
                        "OPTIONS_SAVED_EDITS_CONFIRM_BODY",
                      ),
                    });
                  case 2:
                    if (e.sent) {
                      e.next = 5;
                      break;
                    }
                    return e.abrupt("return");
                  case 5:
                    e.next = 7;
                    return i.storageLocalGet(null);
                  case 7:
                    t = e.sent;
                    if (
                      !(n = Object.keys(t).filter((e) =>
                        e.startsWith("persistedRuleEdits:"),
                      )).length
                    ) {
                      e.next = 12;
                      break;
                    }
                    e.next = 12;
                    return i.storageLocalRemove(n);
                  case 12:
                  case "end":
                    return e.stop();
                }
              }
            }, e);
          }),
        ),
      );
    }
  }
})();
