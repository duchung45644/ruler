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
    const s = c.iterator || "@@iterator";
    const l = c.asyncIterator || "@@asyncIterator";
    const u = c.toStringTag || "@@toStringTag";
    function d(e, t, n) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      d({}, "");
    } catch (n) {
      d = function (e, t, n) {
        return (e[t] = n);
      };
    }
    function p(e, t, n, r) {
      const a = t && t.prototype instanceof b ? t : b;
      const o = Object.create(a.prototype);
      const c = new M(r || []);
      i(o, "_invoke", {
        value: T(e, n, c),
      });
      return o;
    }
    function m(e, t, n) {
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
    r.wrap = p;
    var f = "suspendedStart";
    var h = "suspendedYield";
    var v = "executing";
    var g = "completed";
    var y = {};
    function b() {}
    function w() {}
    function x() {}
    let E = {};
    d(E, s, function () {
      return this;
    });
    const L =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(O([])));
    if (L && L !== Object.prototype && hasOwnProperty.call(L, s)) {
      E = L;
    }
    const N = (x.prototype = b.prototype = Object.create(E));
    function k(e) {
      ["next", "throw", "return"].forEach((t) => {
        d(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function _(t, n) {
      function r(a, i, c, s) {
        const l = m(t[a], t, i);
        if (l.type !== "throw") {
          const u = l.arg;
          const d = u.value;
          if (d && e(d) == "object" && hasOwnProperty.call(d, "__await")) {
            return n.resolve(d.__await).then(
              (e) => {
                r("next", e, c, s);
              },
              (e) => {
                r("throw", e, c, s);
              },
            );
          }
          return n.resolve(d).then(
            (e) => {
              u.value = e;
              c(u);
            },
            (e) => r("throw", e, c, s),
          );
        }
        s(l.arg);
      }
      let a;
      i(this, "_invoke", {
        value: function (e, t) {
          function o() {
            return new n(function (n, a) {
              r(e, t, n, a);
            });
          }
          return (a = a ? a.then(o, o) : o());
        },
      });
    }
    function T(e, t, r) {
      let a = f;
      return function (o, i) {
        if (a === v) {
          throw Error("Generator is already running");
        }
        if (a === g) {
          if (o === "throw") {
            throw i;
          }
          return {
            value: n,
            done: true,
          };
        }
        r.method = o;
        for (r.arg = i; ;) {
          const c = r.delegate;
          if (c) {
            const s = S(c, r);
            if (s) {
              if (s === y) {
                continue;
              }
              return s;
            }
          }
          if (r.method === "next") {
            r.sent = r._sent = r.arg;
          } else if (r.method === "throw") {
            if (a === f) {
              a = g;
              throw r.arg;
            }
            r.dispatchException(r.arg);
          } else {
            if (r.method === "return") {
              r.abrupt("return", r.arg);
            }
          }
          a = v;
          const l = m(e, t, r);
          if (l.type === "normal") {
            a = r.done ? g : h;
            if (l.arg === y) {
              continue;
            }
            return {
              value: l.arg,
              done: r.done,
            };
          }
          if (l.type === "throw") {
            a = g;
            r.method = "throw";
            r.arg = l.arg;
          }
        }
      };
    }
    function S(e, t) {
      const t_method = t.method;
      const a = e.iterator[t_method];
      if (a === n) {
        t.delegate = null;
        if (
          !(
            t_method === "throw" &&
            e.iterator.return &&
            ((t.method = "return"), (t.arg = n), S(e, t), t.method === "throw")
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
      const o = m(a, e.iterator, t.arg);
      if (o.type === "throw") {
        t.method = "throw";
        t.arg = o.arg;
        t.delegate = null;
        return y;
      }
      const o_arg = o.arg;
      if (o_arg) {
        if (o_arg.done) {
          return (
            (t[e.resultName] = o_arg.value),
            (t.next = e.nextLoc),
            t.method !== "return" && ((t.method = "next"), (t.arg = n)),
            (t.delegate = null),
            y
          );
        }
        return o_arg;
      }
      return (
        (t.method = "throw"),
        (t.arg = new TypeError("iterator result is not an object")),
        (t.delegate = null),
        y
      );
    }
    function $(e) {
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
    function A(e) {
      const t = e.completion || {};
      t.type = "normal";
      delete t.arg;
      e.completion = t;
    }
    function M(e) {
      this.tryEntries = [
        {
          tryLoc: "root",
        },
      ];
      e.forEach($, this);
      this.reset(true);
    }
    function O(t) {
      if (t || t === "") {
        const r = t[s];
        if (r) {
          return r.call(t);
        }
        if (typeof t.next === "function") {
          return t;
        }
        if (!isNaN(t.length)) {
          let a = -1;
          const i = function e() {
            while (++a < t.length) {
              if (hasOwnProperty.call(t, a)) {
                e.value = t[a];
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
    w.prototype = x;
    i(N, "constructor", {
      value: x,
      configurable: true,
    });
    i(x, "constructor", {
      value: w,
      configurable: true,
    });
    w.displayName = d(x, u, "GeneratorFunction");
    r.isGeneratorFunction = function (e) {
      const t = typeof e === "function" && e.constructor;
      return (
        !!t && (t === w || (t.displayName || t.name) === "GeneratorFunction")
      );
    };
    r.mark = function (e) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(e, x);
      } else {
        e.__proto__ = x;
        d(e, u, "GeneratorFunction");
      }
      e.prototype = Object.create(N);
      return e;
    };
    r.awrap = function (e) {
      return {
        __await: e,
      };
    };
    k(_.prototype);
    d(_.prototype, l, function () {
      return this;
    });
    r.AsyncIterator = _;
    r.async = function (e, t, n, a, o = Promise) {
      const i = new _(p(e, t, n, a), o);
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
    k(N);
    d(N, u, "Generator");
    d(N, s, function () {
      return this;
    });
    d(N, "toString", function () {
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
    r.values = O;
    M.prototype = {
      constructor: M,
      reset: function (e) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = n;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = n;
        this.tryEntries.forEach(A);
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
        function r(r, a) {
          c.type = "throw";
          c.arg = e;
          t.next = r;
          if (a) {
            t.method = "next";
            t.arg = n;
          }
          return !!a;
        }
        for (let a = this.tryEntries.length - 1; a >= 0; --a) {
          const i = this.tryEntries[a];
          var c = i.completion;
          if (i.tryLoc === "root") {
            return r("end");
          }
          if (i.tryLoc <= this.prev) {
            const s = hasOwnProperty.call(i, "catchLoc");
            const l = hasOwnProperty.call(i, "finallyLoc");
            if (s && l) {
              if (this.prev < i.catchLoc) {
                return r(i.catchLoc, true);
              }
              if (this.prev < i.finallyLoc) {
                return r(i.finallyLoc);
              }
            } else if (s) {
              if (this.prev < i.catchLoc) {
                return r(i.catchLoc, true);
              }
            } else {
              if (!l) {
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
            var a = r;
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
            A(n);
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
              var a = r.arg;
              A(n);
            }
            return a;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (e, t, r) {
        this.delegate = {
          iterator: O(e),
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
  function n(e, t, n, r, a, o, i) {
    try {
      var c = e[o](i);
      var s = c.value;
    } catch (error) {
      return void n(error);
    }
    if (c.done) {
      t(s);
    } else {
      Promise.resolve(s).then(r, a);
    }
  }
  function r(e) {
    return function () {
      const t = this;
      const r = arguments;
      return new Promise((resolve, reject) => {
        const i = e.apply(t, r);
        function c(e) {
          n(i, resolve, reject, c, s, "next", e);
        }
        function s(e) {
          n(i, resolve, reject, c, s, "throw", e);
        }
        c(undefined);
      });
    };
  }
  var a = {};
  function o(e) {
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
  a.tabsQuery = o(chrome.tabs.query.bind(chrome.tabs));
  a.tabsCreate = o(chrome.tabs.create.bind(chrome.tabs));
  a.tabsUpdate = o(chrome.tabs.update.bind(chrome.tabs));
  a.windowsUpdate = o(chrome.windows.update.bind(chrome.windows));
  a.executeScript = o(chrome.scripting.executeScript.bind(chrome.scripting));
  a.sendMessageToTab = o(chrome.tabs.sendMessage.bind(chrome.tabs));
  a.sendMessage = o(chrome.runtime.sendMessage.bind(chrome.runtime));
  a.contextMenusCreate = o(
    chrome.contextMenus.create.bind(chrome.contextMenus),
  );
  a.contextMenusRemoveAll = o(
    chrome.contextMenus.removeAll.bind(chrome.contextMenus),
  );
  a.contextMenusUpdate = o(
    chrome.contextMenus.update.bind(chrome.contextMenus),
  );
  a.setActionIcon = o(chrome.action.setIcon.bind(chrome.action));
  a.storageLocalGet = o(chrome.storage.local.get.bind(chrome.storage.local));
  a.storageLocalSet = o(chrome.storage.local.set.bind(chrome.storage.local));
  a.storageLocalRemove = o(
    chrome.storage.local.remove.bind(chrome.storage.local),
  );
  a.getPlatformInfo = o(chrome.runtime.getPlatformInfo.bind(chrome.runtime));
  a.commandsGetAll = o(chrome.commands.getAll.bind(chrome.commands));
  a.getContexts = o(chrome.runtime.getContexts.bind(chrome.runtime));
  a.onPageChangedRemoveRules = chrome.declarativeContent
    ? o(
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
  a.onPageChangedAddRules = chrome.declarativeContent
    ? o(
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
  a.actionDisable = o(chrome.action.disable.bind(chrome.action));
  a.captureTab = o(chrome.tabs.captureVisibleTab.bind(chrome.tabs));
  a.windowsCreate = o(chrome.windows.create.bind(chrome.windows));
  a.windowsGetCurrent = o(chrome.windows.getCurrent.bind(chrome.windows));
  a.updateSessionRules = chrome.declarativeNetRequest
    ? o(
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
  a.sendOptionalMessage = (() => {
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
  a.sendOptionalMessageToTab = (() => {
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
  const i = a;
  const c = JSON.parse(
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
        const a = function () {};
        return {
          s: a,
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
          f: a,
        };
      }
      throw new TypeError(
        "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
      );
    }
    let o;
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
        o = e;
      },
      f: function () {
        try {
          if (!(i || n.return == null)) {
            n.return();
          }
        } finally {
          if (c) {
            throw o;
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
  var u = false;
  function d() {
    if (!u) {
      for (const n of c) {
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
      u = true;
    }
  }
  var p =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H72A16,16,0,0,0,56,56V72H40A16,16,0,0,0,24,88V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V184h16a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM184,88v16H40V88Zm0,112H40V120H184v80Zm32-32H200V88a16,16,0,0,0-16-16H72V56H216Z"></path></svg>';
  var m =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H80V200H40ZM216,200H96V56H216V200Z"></path></svg>';
  var f =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,72a12,12,0,1,1,12-12A12,12,0,0,1,128,176Z"></path></svg>';
  const h = /^(?:calc|clamp|min|max)\s*\(.*\)/;
  const v = /^-?[0-9.]+(px|rem|em|%|vw|vh|vmin|vmax|deg|s|ms)$/;
  const g = ["top", "right", "bottom", "left", "center"];
  function y(e) {
    return e.startsWith("calc(");
  }
  function b(e) {
    return e.split("-")[0];
  }
  function w(e) {
    const t = e.split("-");
    return t[t.length - 1];
  }
  function x(e) {
    return e.startsWith("rgb");
  }
  function E(e) {
    return (
      e.startsWith("linear-gradient") ||
      e.startsWith("radial-gradient") ||
      e.startsWith("conic-gradient")
    );
  }
  function C(e) {
    return (
      /^\d+\/\d+$/.test(e) ||
      ((e) => e.startsWith("url("))(e) ||
      ((e) => {
        t = e;
        return (
          /^#[0-9A-F]{2,}$/i.test(t) || x(e) || ((e) => e.startsWith("hsl"))(e)
        );
        var t;
      })(e) ||
      h.test(e) ||
      v.test(e) ||
      E(e) ||
      S(e) ||
      y(e) ||
      ((e) => e.startsWith("cubic-bezier"))(e) ||
      ((e) => /^attr\(/i.test(e))(e) ||
      ((e) => /^repeating-linear-gradient\(/i.test(e))(e) ||
      ((e) => /^repeating-radial-gradient\(/i.test(e))(e) ||
      ((e) => /^constant\(/.test(e))(e) ||
      ((e) => /^env\(/.test(e))(e) ||
      ((e) => e.endsWith("turn"))(e)
    );
  }
  function L(e, t, n = "", r = false) {
    e = String(e);
    if (r || C(e)) {
      return `-[${n}${((e, t = "around") => {
        switch (t) {
          case "pre":
            return e.replace(/(^\s*)/g, "");
          case "post":
            return e.replace(/(\s*$)/g, "");
          case "all":
            return e.replace(/\s+/g, "");
          case "around":
            return e.replace(/(^\s*)|(\s*$)/g, "");
          default:
            return e;
        }
      })(t ? t(e) : e, "all").replace(/['"]/g, "")}]`;
    }
    if (n) {
      return `-[${n}${t ? t(e) : e}]`;
    }
    return `-${t ? t(e) : e}`;
  }
  function N(e) {
    if (e.endsWith("%") || e.endsWith("deg") || e === "0") {
      return e;
    }
    const t = Math.round(100 * Number(e));
    if (Number.isNaN(t)) {
      return t;
    }
    return `${t}%`;
  }
  function k(e) {
    return e.replace(/\s+/g, " ").split(/\s/g).join("-");
  }
  function _(e) {
    return e.replace(/\s+/g, " ").split(/\s/g).join("_");
  }
  function T(e, t = true) {
    if (t) {
      e = e
        .replace(/\s+/g, " ")
        .replace(/\s*,\s*/g, ",")
        .replace(/\s*\/\s*/g, "/");
    }
    if (/calc\([^)]+\)/.test(e)) {
      e = e.replace(/calc\(([^)]+)\)/g, (e, t) =>
        e.replace(t, t.replace(/\s/g, "")),
      );
    }
    if (/rgb/.test(e)) {
      e = e.replace(/rgba?\(([^)]+)\)/g, (e, t) => {
        const n = t.trim().split(" ");
        return e.replace(
          t,
          n
            .map((e, t) => {
              if (e.endsWith(",")) {
                return e;
              }
              return e + (n.length - 1 === t ? "" : ",");
            })
            .join(""),
        );
      });
    }
    if (/hsl/.test(e)) {
      e = e.replace(/hsla?\(([^)]+)\)/g, (e, t) => {
        const n = t.trim().split(" ");
        return e.replace(
          t,
          n
            .map((e, t) => {
              if (e.endsWith(",")) {
                return e;
              }
              return e + (n.length - 1 === t ? "" : ",");
            })
            .join(""),
        );
      });
    }
    if (/var\([^)]+\)/.test(e)) {
      e = e.replace(/var\(([^)]+)\)/g, (e, t) =>
        e.replace(t, t.replace(/\s/g, "_")),
      );
    }
    if (e.endsWith("!important")) {
      return [e.replace(/\s*!important/, "").trim(), "!"];
    }
    return [e.trim(), ""];
  }
  function S(e) {
    return e.startsWith("var(--");
  }
  const $ = /-webkit-|-moz-|-ms-|-o-/g;
  const A =
    /linear-gradient\(\s*to([\w\s]+),?([\-\w()#%\s.]+)?,([\-\w()#%\s.]+)?,?([\-\w#%\s.]+)?\)$/;
  const M =
    /linear-gradient\(\s*([^,]*),?([\-\w()#%\s.]+)?,([\-\w()#%\s.]+)?,?([\-\w#%\s.]+)?\)$/;
  const O =
    /(radial|conic)-gradient\(([\-\w()#%\s.]+)?,([\-\w()#%\s.]+)?,?([\-\w#%\s.]+)?\)$/;
  const I = "__comma__";
  const R = ["align-self", "align-items", "align-content"];
  const j = [
    "animation",
    "animation-name",
    "animation-duration",
    "animation-delay",
    "animation-timing-function",
    "animation-iteration-count",
    "animation-direction",
    "animation-fill-mode",
    "animation-play-state",
  ];
  const B = ["aspect-ratio"];
  const P = ["box-shadow", "drop-shadow"];
  const D = ["box-sizing", "box-decoration-break", "box-shadow", "drop-shadow"];
  function box(e, t) {
    if (!D.includes(e)) {
      return;
    }
    const [n, r] = T(t);
    if (e.startsWith("box-decoration")) {
      return `${r}box-decoration-${n}`;
    }
    if (e === "box-sizing") {
      return `${r}box-${b(n)}`;
    }
    if (P.includes(e)) {
      return `${r}shadow-[${n.split(" ").join("_")}]`;
    }
  }
  const H = ["contrast", "brightness", "saturate"];
  const F = ["grayscale", "invert", "sepia"];
  const G = ["filter", "backdrop-filter"];
  function filter(e, t) {
    if (!G.includes(e)) {
      return;
    }
    const [n, r] = T(t);
    const [a, o, i] = n.match(/([\w-]+)\((.*)\)/);
    if (H.includes(o) || F.includes(o)) {
      const e = N(i);
      if (Number.isNaN(e)) {
        return `${r}${o}${L(i)}`;
      }
      return `${r}${o}${L(N(i))}`;
    }
    switch (o) {
      case "drop-shadow":
        return `${r}drop-${box(o, i)}`;
      case "hue-rotate":
        return `${r}${o}${L(i.slice(0, -3))}`;
      default:
        return `${r}${o}${L(i)}`;
    }
  }
  const W = ["backdrop-filter"];
  const V = [
    "background-color",
    "background-attachment",
    "background-position",
    "background-size",
    "background-image",
    "background",
    "background-blend-mode",
    "background-origin",
    "background-clip",
    "background-repeat",
  ];
  const z = "\\d*\\.?\\d+(?:px|em|rem|%|vw|vh)?";
  const Y = `(${z})\\s+(${z})`;
  const K = new RegExp(`${Y}\\s*,\\s*${Y}`);
  function X(e, t, n) {
    let r = "";
    if (t && !n) {
      n = t;
      t = "";
    }
    if (e) {
      e = e.replaceAll(I, ",");
      const [t, n] = e.split(" ");
      if (n) {
        r += ` from${L(t)} from${L(n)}`;
      } else if (t) {
        r += ` from${L(t)}`;
      }
    }
    if (t) {
      t = t.replaceAll(I, ",");
      const [e, n] = t.split(" ");
      if (n) {
        r += ` via${L(e)} via${L(n)}`;
      } else if (e) {
        r += ` via${L(e)}`;
      }
    }
    if (n) {
      n = n.replaceAll(I, ",");
      const [e, t] = n.split(" ");
      if (t) {
        r += ` to${L(e)} to${L(t)}`;
      } else if (e) {
        r += ` to${L(e)}`;
      }
    }
    return r;
  }
  const Z = "__transform_to_unocss__";
  function Q(e) {
    const t = {};
    let n = 0;
    e = (e = e.replace(/(rgba?|hsla?|lab|lch|hwb|color)\(\)*\)/, (e) => {
      t[n++] = e;
      return `${Z}${n}}`;
    }))
      .split(/\)\s*,/)
      .map((e) => `${e.replace(/\s*,\s*/g, ",").replace(/\s+/g, "_")}`)
      .join("),");
    Object.keys(t).forEach((n) => {
      e = e.replace(`${Z}${n}}`, t[n]);
    });
    return e;
  }
  const J = ["border-left", "border-top", "border-right", "border-bottom"];
  const ee = {
    inline: "x",
    block: "y",
    "inline-start": "s",
    "inline-end": "e",
    top: "t",
    right: "r",
    bottom: "b",
    left: "l",
  };
  const te = {
    top: "t",
    right: "r",
    bottom: "b",
    left: "l",
    end: "e",
    start: "s",
  };
  const ne = ["color"];
  const re = ["column-gap"];
  const ae = ["content", "content-visibility"];
  const oe = ["cursor"];
  const ie = ["display", "visibility", "position"];
  function ce(e, t) {
    if (!ie.includes(e)) {
      return;
    }
    const [n, r] = T(t);
    switch (n) {
      case "none":
        return `${r}hidden`;
      case "hidden":
        return `${r}invisible`;
      default:
        return `${r}${n}`;
    }
  }
  const se = {
    show: "visible",
    hide: "hidden",
  };
  const le = ["empty-cells"];
  const ue = ["flex-basis", "flex-shrink"];
  const de = [
    "flex",
    "flex-grow",
    "flex-shrink",
    "flex-basis",
    "flex-wrap",
    "flex-direction",
  ];
  const pe = [
    "float",
    "clear",
    "pointer-events",
    "fill",
    "order",
    "perspective",
    "columns",
    "break-inside",
    "break-before",
  ];
  function me(e, t) {
    if (!pe.includes(e)) {
      return;
    }
    const [n, r] = T(t);
    g.includes(n);
    return `${r}${e}${L(n)}`;
  }
  const fe = [
    "grid",
    "grid-row",
    "grid-column",
    "grid-template-columns",
    "grid-template-rows",
    "grid-auto-flow",
    "grid-auto-columns",
    "grid-auto-rows",
    "grid-column-start",
    "grid-column-end",
    "grid-row-start",
    "grid-row-end",
  ];
  const he = ["isolation"];
  const ve = ["justify", "justify-content", "justify-items", "justify-self"];
  const ge = ["letter-spacing"];
  const ye = {
    1: "none",
    1.25: "tight",
    1.375: "snug",
    1.5: "normal",
    1.625: "relaxed",
    2: "loose",
  };
  const be = ["line-height"];
  const we = [
    "list-style",
    "list-style-type",
    "list-style-position",
    "list-style-image",
    "caption-side",
    "appearance",
    "touch-action",
    "table-layout",
    "caret-color",
    "backface-visibility",
    "stroke-width",
    "stroke",
    "accent",
    "accent-color",
  ];
  function xe(e, t) {
    if (!we.includes(e)) {
      return;
    }
    const [n, r] = T(t);
    if (e === "list-style-image" && n === "none") {
      return `${r}${b(e)}-none`;
    }
    return `${r}${b(e)}${L(n)}`;
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
    "padding-inline-end": "pe",
  };
  function Ce(e, t) {
    const [n, r] = T(t);
    const a = Ee[e];
    if (a) {
      return `${r}${a}${L(n)}`;
    }
    const o = n.split(" ");
    const o_length = o.length;
    switch (o_length) {
      case 1:
        return `${r}${e[0]}${L(o[0])}`;
      case 2:
        return `${r}${e[0]}x${L(o[1])} ${r}${e[0]}y${L(o[0])}`;
      case 3:
        return `${r}${e[0]}x${L(o[1])} ${r}${e[0]}t${L(o[0])} ${r}${e[0]}b${L(o[2])}`;
      default:
        return `${r}${e[0]}t${L(o[0])} ${r}${e[0]}b${L(o[2])} ${r}${e[0]}l${L(o[3])} ${r}${e[0]}r${L(o[1])}`;
    }
  }
  const Le = [
    "mask-position",
    "mask-origin",
    "mask-repeat",
    "mask-size",
    "mask-type",
    "mask-image",
    "mask-mode",
    "mask-composite",
    "mask-clip",
    "mask-type",
  ];
  function Ne(e, t, n, r) {
    let a = "";
    if (n && !r) {
      r = n;
      n = "";
    }
    if (t) {
      t = t.replaceAll(I, ",");
      const [n, r] = t.split(" ");
      if (r) {
        a += ` ${e}-from-${x(n) || S(n) ? `[${n}]` : n} ${e}-from${L(r)}`;
      } else if (n) {
        a += ` ${e}-from-${x(n) || S(n) ? `[${n}]` : n}`;
      }
    }
    if (n) {
      n = n.replaceAll(I, ",");
      const [t, r] = n.split(" ");
      if (r) {
        a += ` ${e}-via${x(t) || S(t) ? `[${t}]` : t} ${e}-via${L(r)}`;
      } else if (t) {
        a += ` ${e}-via${x(t) || S(t) ? `[${t}]` : t}`;
      }
    }
    if (r) {
      r = r.replaceAll(I, ",");
      const [t, n] = r.split(" ");
      if (n) {
        a += ` ${e}-to-${x(t) || S(t) ? `[${t}]` : t} ${e}-to${L(n)}`;
      } else if (t) {
        a += ` ${e}-to-${x(t) || S(t) ? `[${t}]` : t}`;
      }
    }
    return a;
  }
  const ke = [
    "max-height",
    "max-width",
    "max-block-size",
    "max-inline-size",
    "min-height",
    "min-width",
    "min-block-size",
    "min-inline-size",
  ];
  function _e(e, t) {
    if (!ke.includes(e)) {
      return;
    }
    const [n, r] = T(t);
    const a = e.split("-");
    const o = y(n) || S(n) ? L(n) : L(b(n));
    return `${r}${a[0]}-${a[1][0]}${o}`;
  }
  const Te = ["object-fit", "object-position"];
  const Se = ["opacity"];
  const $e = [
    "outline-width",
    "outline-style",
    "outline-offset",
    "outline",
    "outline-color",
  ];
  const Ae = ["overflow", "overflow-x", "overflow-y", "overflow-wrap"];
  const Me = [
    "overscroll-behavior",
    "overscroll-behavior-x",
    "overscroll-behavior-y",
  ];
  const Oe = ["place-content", "place-items", "place-self"];
  const Ie = {
    vertical: "y",
    horizontal: "x",
  };
  const Re = ["row-gap"];
  const je = [
    "scroll-snap-type",
    "scroll-snap-stop",
    "scroll-snap-align",
    "scroll-padding",
    "scroll-padding-inline",
    "scroll-padding-block",
    "scroll-padding-inline-start",
    "scroll-padding-inline-end",
    "scroll-padding-block-start",
    "scroll-padding-block-end",
    "scroll-padding-top",
    "scroll-padding-right",
    "scroll-padding-bottom",
    "scroll-padding-left",
    "scroll-margin",
    "scroll-margin-inline",
    "scroll-margin-block",
    "scroll-margin-inline-start",
    "scroll-margin-inline-end",
    "scroll-margin-block-start",
    "scroll-margin-block-end",
    "scroll-margin-top",
    "scroll-margin-right",
    "scroll-margin-bottom",
    "scroll-margin-left",
    "scroll-behavior",
  ];
  const Be = ["width", "height"];
  function Pe(e, t) {
    if (!Be.includes(e)) {
      return;
    }
    const [n, r] = T(t);
    return `${r}${e[0]}${L(n, C(n) ? undefined : b)}`;
  }
  const De = [
    "text-align",
    "text-align-last",
    "text-decoration",
    "text-decoration-line",
    "text-decoration-style",
    "text-decoration-color",
    "text-decoration-thickness",
    "text-indent",
    "text-underline-offset",
    "text-transform",
    "text-wrap",
    "text-overflow",
    "text-justify",
    "text-shadow",
  ];
  const Ue = [
    "top",
    "right",
    "bottom",
    "left",
    "field-sizing",
    "forced-color-adjust",
    "hyphens",
    "gap",
    "gap-x",
    "gap-y",
  ];
  function He(e, t) {
    if (!Ue.includes(e)) {
      return;
    }
    const [n, r] = T(t);
    return `${r}${e}${L(n)}`;
  }
  const Fe = ["transform", "transform-origin", "transform-style"];
  const Ge = ["transition-delay", "transition-duration"];
  const qe = [
    "transition",
    "transition-property",
    "transition-duration",
    "transition-delay",
    "transition-timing-function",
    "transition-behavior",
  ];
  const We = ["user-select"];
  const Ve = ["vertical-align"];
  const ze = ["white-space"];
  const Ye = ["will-change"];
  const Ke = {
    auto: "auto",
    "scroll-position": "scroll",
    contents: "contents",
    transform: "transform",
  };
  const Xe = ["word-break", "word-spacing", "word-wrap", "overflow-wrap"];
  const Ze = ["writing-mode"];
  const Qe = ["z-index"];
  const Je = ["0", "10", "20", "30", "40", "50", "auto"];
  const et = {
    animation: function (e, t) {
      if (!j.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      return `${r}animate-[${_(n)}]`;
    },
    aspect: function (e, t) {
      if (!B.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (n === "auto") {
        return `${r}${b(e)}-${n}`;
      }
      return `${r}${b(e)}${L(n)}`;
    },
    backface: xe,
    caption: xe,
    column: function (e, t) {
      if (!re.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (e === "column-gap") {
        return `${r}gap-x${L(n)}`;
      }
      return `${r}${e}${L(n)}`;
    },
    columns: me,
    break: me,
    empty: function (e, t) {
      if (!le.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (se[n]) {
        return `${r}table-empty-cells-${se[n] ?? n}`;
      }
    },
    box,
    writing: function (e, t) {
      if (!Ze.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (n === "horizontal-tb") {
        return `${r}write-normal`;
      }
      return `${r}write-${n.replace("-rl", "-right").replace("-lr", "-left")}`;
    },
    display: ce,
    float: me,
    clear: me,
    isolation: function (e, t) {
      if (!he.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (t === "isolate") {
        return `${r}${n}`;
      }
      return `${r}${e}-${n}`;
    },
    object: function (e, t) {
      if (!Te.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (e === "object-position") {
        return `${r}${b(e)}-${k(n)}`;
      }
      return `${r}${b(e)}-${n}`;
    },
    overflow: function (e, t) {
      if (!Ae.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (e === "overflow-wrap") {
        return `${r}wrap-${n}`;
      }
      return `${r}${e}-${n}`;
    },
    overscroll: function (e, t) {
      if (!Me.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      const [a, o, i] = e.split("-");
      if (i) {
        return `${r}${a}-${i}-${n}`;
      }
      return `${r}${a}-${n}`;
    },
    position: ce,
    top: He,
    hyphens: He,
    mask: function (e, t) {
      if (!Le.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (["mask-clip", "mask-origin", "mask-type"].includes(e)) {
        return `${r}${e}-${b(n)}`;
      }
      if (["mask-mode", "mask-composite"].includes(e)) {
        return `${r}${b(e)}-${b(n)}`;
      }
      if (["mask-position", "mask-size"].includes(e)) {
        if (C(n)) {
          return `${r}${e}${L(n)}`;
        }
        if (/\d/.test(n)) {
          return `${r}[${e}:${_(n)}]`;
        }
        return `${r}${b(e)}-${k(n)}`;
      }
      if (e === "mask-repeat") {
        if (n.includes("-")) {
          return `${r}mask-${n}`;
        }
        return `${r}${e}-${n}`;
      }
      if (e === "mask-image") {
        if (E(n)) {
          const e = n
            .replace(/rgba?\(([^)]+)\)/g, (e, t) =>
              e.replace(t, t.replace(/\s*,\s*/g, I)),
            )
            .match(A);
          if (!e) {
            return;
          }
          let [t, r, a, o] = e.slice(1);
          t = t
            .split(" ")
            .map((e) => e[0])
            .join("");
          const i = n.startsWith("linear-gradient")
            ? "linear"
            : n.startsWith("radial-gradient")
              ? "radial"
              : n.startsWith("conic-gradient")
                ? "conic"
                : "";
          if (t) {
            return `${Ne(`mask-${t}`, r, a, o).trim()}`;
          }
          return Ne(`mask-${i}`, r, a, o).trim();
        }
        return `${r}mask${L(n)}`;
      }
      return `${r}${e}${L(n)}`;
    },
    field: He,
    forced: He,
    left: He,
    right: He,
    bottom: He,
    visibility: ce,
    z: function (e, t) {
      if (!Qe.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (Je.includes(n)) {
        return `${r}${e[0]}-${n}`;
      }
      return `${r}${e[0]}${L(n, undefined, undefined, true)}`;
    },
    flex: function (e, t) {
      if (!de.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (e === "flex-shrink" && n === "1") {
        return `${r}shrink`;
      }
      if (e === "flex-grow") {
        if (n === "1") {
          return `${r}flex-grow`;
        }
        return `${r}flex-grow-${n}`;
      }
      if (ue.includes(e)) {
        return `${r}${w(e)}${L(n)}`;
      }
      if (n === "1") {
        return `${r}flex-1`;
      }
      const a = n[0];
      if (e !== "flex" || (a !== "0" && a !== "1")) {
        return `${r}${b(e)}-${n.replace("column", "col")}`;
      }
      return `${r}flex-[${_(n)}]`;
    },
    order: me,
    grid: function (e, t) {
      if (!fe.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (e.startsWith("grid-template")) {
        const t = n.match(/repeat\s*\(\s*(\d+)/);
        if (t) {
          return `${r}grid-${w(e) === "rows" ? "rows" : "cols"}-${t[1]}`;
        }
        return `${r}grid-${w(e) === "rows" ? "rows" : "cols"}-${n.includes(" ") ? `[${_(n)}]` : n}`;
      }
      if (e === "grid-auto-flow") {
        return `${r}grid-flow-${k(n).replace("column", "col")}`;
      }
      if (e.startsWith("grid-auto")) {
        const t = n.match(/minmax\s*\(\s*0\s*,\s*1fr/);
        return `${r}auto-${w(e) === "rows" ? "rows" : "cols"}-${t ? "fr" : b(n)}`;
      }
      const a = n.match(/span\s+(\d)/);
      if (a) {
        return `${r}${e.slice(5).replace("column", "col")}-span-${a[1]}`;
      }
      if (n === "1/-1") {
        return `${r}${e.slice(5).replace("column", "col")}-span-full`;
      }
      return `${r}${e.slice(5).replace("column", "col")}-${n}`;
    },
    gap: He,
    justify: function (e, t) {
      if (!ve.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (n.includes(" ")) {
        return `${e}-${n.split(" ").reverse().map(w).join("-")}${r}`;
      }
      if (e === "justify-content") {
        return `${r}justify-${w(n)}`;
      }
      return `${r}${e}-${w(n)}`;
    },
    align: function (e, t) {
      if (!R.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      return `${r}${w(e)}-${n.split(" ").reverse().map(w).join("-")}`;
    },
    place: function (e, t) {
      if (!Oe.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (n.includes(" ")) {
        return `${e}-${n.split(" ").reverse().map(w).join("-")}${r}`;
      }
      return `${r}${e}-${w(n)}`;
    },
    padding: Ce,
    perspective: me,
    margin: Ce,
    width: Pe,
    min: _e,
    max: _e,
    height: Pe,
    font: function (e, t) {
      const [n, r] = T(t);
      if (e === "font-size") {
        if (
          ["inherit", "initial", "revert", "unset", "revert-layer"].includes(n)
        ) {
          return `${r}font-size-${n}`;
        }
        return `${r}text${L(n)}`;
      }
      if (e === "font-weight") {
        return `${r}font-[weight:${n}]`;
      }
      if (e === "font-family") {
        const e = n.match(/ui-(\w{0,4})/);
        if (!e) {
          return `${r}font-[family-name:${_(t)}]`;
        }
        const [a, o] = e;
        return `${r}font-${o}`;
      }
      switch (e) {
        case "font-style":
          switch (n) {
            case "normal":
              return `${r}not-italic`;
            case "italic":
              return `${r}italic`;
            default:
              return undefined;
          }
        case "font-variant-numeric":
          if (n === "normal") {
            return `${r}normal-nums`;
          }
          return `${r}${n}`;
        default:
          return ((e, t) =>
            e
              .split(" ")
              .map((e) => {
                if (/^\d/.test(e)) {
                  return `${t}text-[${e}]`;
                }
                return `${t}font-${e}`;
              })
              .join(" "))(n, r);
      }
    },
    letter: function (e, t) {
      if (!ge.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      return `${r}tracking${L(n)}`;
    },
    line: function (e, t) {
      if (!be.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (ye[n]) {
        return `${r}leading-${ye[n]}`;
      }
      return `${r}leading${L(n, (e) => {
        if (/\d$/.test(e)) {
          return `[${e}]`;
        }
        return e;
      })}`;
    },
    list: xe,
    text: function (e, t) {
      if (!De.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (g.includes(n)) {
        return `${r}text-${n}`;
      }
      if (e === "text-decoration-line") {
        if (n === "none") {
          return `${r}no-underline`;
        }
        return `${r}${n}`;
      }
      if (e === "text-transform") {
        if (n === "none") {
          return `${r}normal-case`;
        }
        return `${r}${n}`;
      }
      if (e === "text-decoration") {
        return n
          .split(" ")
          .map((e) => {
            if (e) {
              return `${r}${e}`;
            }
            return "";
          })
          .join(" ");
      }
      if (e.startsWith("text-decoration") || e === "text-indent") {
        return `${r}${e.split("-")[1]}${L(n)}`;
      }
      if (e === "text-underline-offset") {
        return `${r}underline-offset-${n}`;
      }
      if (
        ["inherit", "initial", "revert", "unset", "revert-layer"].includes(n)
      ) {
        return `${r}text-align-${n}`;
      }
      return `${r}text${L(n)}`;
    },
    vertical: function (e, t) {
      if (!Ve.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      return `${r}align${L(n)}`;
    },
    white: function (e, t) {
      if (!ze.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      return `${r}whitespace-${n}`;
    },
    word: function (e, t) {
      if (!Xe.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (e.startsWith("word-spacing")) {
        return `${r}word-spacing${L(t)}`;
      }
      if (n === "keep-all") {
        return `${r}break-keep`;
      }
      if (n === "break-word") {
        return `${r}break-words`;
      }
      return `${r}break-${w(n)}`;
    },
    content: function (e, t) {
      if (!ae.includes(e)) {
        return;
      }
      const [n, r] = T(t, false);
      if (e === "content-visibility") {
        return `content-visibility-${n}${r}`;
      }
      const a = n.match(/^(["'])(.*?)\1$/);
      if (a) {
        return `content-['${a[2].replace(/\s/g, "_")}']${r}`;
      }
      return `content-[${n}]${r}`;
    },
    background: function e(t, n) {
      if (!V.includes(t)) {
        return;
      }
      let [r, a] = T(n);
      if (t === "background-size") {
        if (/\d/.test(r)) {
          return `${a}bg${L(r, _, "length:", true)}`;
        }
        return `${a}bg${L(r, k, "length:")}`;
      }
      if (t === "background-position") {
        /\d/.test(r);
        return `${a}bg${L(r, _, "position:")}`;
      }
      if (["background-color", "background-attachment"].includes(t)) {
        return `${a}bg${L(r, _)}`;
      }
      if (["background", "background-image"].includes(t)) {
        o = r;
        if (h.test(o) || v.test(o) || g.includes(o)) {
          return `${a}bg${L(r, k, "position:")}`;
        }
        const n = r.replace(/rgba?\([^)]+\)/g, "temp");
        if (/\)\s*,/.test(n)) {
          return `bg-[${Q(r)}]`;
        }
        if (r.startsWith("linear-gradient")) {
          const e = r.replace(/rgba?\(([^)]+)\)/g, (e, t) =>
            e.replace(t, t.replace(/\s*,\s*/g, I)),
          );
          const t = e.match(A);
          if (t) {
            let [e, n, r, a] = t.slice(1);
            e = e
              .split(" ")
              .map((e) => e[0])
              .join("");
            if (e) {
              return `bg-gradient-to-${e}${X(n, r, a)}`;
            }
            return X(n, r, a);
          }
          const n = e.match(M);
          if (n) {
            return `bg-gradient-linear bg-gradient-[${n[1]}${n[2] ? `,${n[2].replace(/\s+/, "_").replaceAll(I, ",")}` : ""},${n[3].replace(/\s+/, "_").replaceAll(I, ",")}]`;
          }
          return `bg-[${Q(r)}]`;
        }
        if (/^(?:radial|conic)-gradient/.test(r)) {
          const e = r
            .replace(/rgba?\(([^)]+)\)/g, (e, t) =>
              e.replace(t, t.replace(/\s*,\s*/g, I)),
            )
            .match(O);
          if (!e) {
            return "";
          }
          const t = e[1];
          let [n, a, o] = e.slice(2);
          return `bg-gradient-${t}${X(n, a, o)}`;
        }
        const i = r.match(/^rgba?\([^)]+\)$/);
        if (i) {
          const e = i[0];
          r = r.replace(e, `[${e}]`);
        }
        const c = r.match(/^url\(["'\s.\-\w/@]*\)$/);
        if (c) {
          return `bg-${r.replace(c[0], `[${c[0].replace(/['"]/g, "")}]${a}`)}`;
        }
        const s = new Map();
        let l = 0;
        const u = r
          .replace(/url\([^)]+\)/g, (e) => {
            const t = `__URL__${l++}`;
            s.set(t, e);
            return t;
          })
          .replace(/rgba?\([^)]+\)/g, (e) => {
            const t = `__RGBA__${l++}`;
            s.set(t, e);
            return t;
          });
        if (u.includes("/")) {
          const [n, r] = u.split("/").map((e) => e.trim());
          const o = r.split(/\s+/);
          const i = o.slice(0, 2);
          const c = o.slice(2).map((e) => {
            const t = e.match(/__URL__(\d+)/);
            if (t) {
              return s.get(`__URL__${t[1]}`);
            }
            const n = e.match(/__RGBA__(\d+)/);
            if (n) {
              return s.get(`__RGBA__${n[1]}`);
            }
            return e;
          });
          const l = i.join(" ");
          const d = e("background-position", `${n}${a ? " !important" : ""}`);
          const p = l
            ? e("background-size", `${l}${a ? " !important" : ""}`)
            : "";
          let m = "";
          if (c.length) {
            m = c.map((n) => e(t, `${n}${a ? " !important" : ""}`)).join(" ");
          }
          return [d, p, m].filter(Boolean).join(" ");
        }
        if (u.includes(" ")) {
          const n = u.match(K);
          if (n) {
            const r = u
              .replace(n[0], "")
              .trim()
              .split(" ")
              .map((e) => {
                const t = e.match(/__URL__(\d+)/);
                if (t) {
                  return s.get(`__URL__${t[1]}`);
                }
                const n = e.match(/__RGBA__(\d+)/);
                if (n) {
                  return s.get(`__RGBA__${n[1]}`);
                }
                return e;
              });
            let o = "";
            if (r.length) {
              o = r.map((n) => e(t, `${n}${a ? " !important" : ""}`)).join(" ");
            }
            return [
              e("background-position", `${n[0]}${a ? " !important" : ""}`),
              o,
            ]
              .filter(Boolean)
              .join(" ");
          }
          let r = u
            .split(/\s+/)
            .map((e) => {
              const t = e.match(/__URL__(\d+)/);
              if (t) {
                return s.get(`__URL__${t[1]}`);
              }
              const n = e.match(/__RGBA__(\d+)/);
              if (n) {
                return s.get(`__RGBA__${n[1]}`);
              }
              return e;
            })
            .map((n) => e(t, `${n}${a ? " !important" : ""}`))
            .join(" ");
          const o = /bg-\[position:([^\]]*)\]/g;
          const i = r.match(o);
          if (i && i.length > 1) {
            const e = `bg-[position:${i.map((e) => e.replace(o, "$1")).join("_")}]`;
            r = `${r
              .replace(o, "")
              .replace(/\s+/g, " ")
              .split(" ")
              .filter(Boolean)
              .concat([e])
              .join(" ")}`;
          }
          return r;
        }
        return `${a}bg${L(r, k)}`;
      }
      if (t === "background-blend-mode") {
        return `${a}bg-blend-${r}`;
      }
      return `${a}${((e, t) => {
        if (t.endsWith("repeat")) {
          return "bg";
        }
        return e.replace("background", "bg");
      })(t, r)}-${((e) => {
        if (/border|content|padding-box/.test(e)) {
          return e.replace("-box", "");
        }
        if (e.startsWith("repeat-")) {
          return e.replace("repeat-", "");
        }
        return k(e);
      })(r)}`;
      var o;
    },
    border: function (e, t) {
      const [n, r] = T(t);
      if (e === "border-spacing") {
        return `${r}${e}${L(n, _, "", true)}`;
      }
      if (e === "border-color") {
        return `${r}border${L(n)}`;
      }
      const a = e.match(
        /border(-start|-end|-top|-bottom)?(-start|-end|-left|-right)?-radius/,
      );
      if (a) {
        const [e, t, o] = a;
        if (t && o) {
          return `${r}rounded-${te[t.slice(1)]}${te[o.slice(1)]}${L(n, _)}`;
        }
        if (t || o) {
          return `${r}rounded-${te[t?.slice(1) || o?.slice(1)]}${L(n, _)}`;
        }
        return `${r}rounded${L(n, _, "", true)}`;
      }
      const o = e.match(
        /border(-inline|-block|-inline-start|-inline-end|-top|-right|-bottom|-left)?-(width|color)/,
      );
      if (o) {
        if (o[1]) {
          const e = ee[o[1].slice(1)];
          return `${r}border-${e}${L(n, _, "length:")}`;
        }
        return `${r}border${L(n, _, "length:")}`;
      }
      if (J.some((t) => e.startsWith(t))) {
        const t = e.split("-");
        if (t.slice(-1)[0] === "radius") {
          return n
            .split(" ")
            .map(
              (e) =>
                `${r}rounded-${t
                  .slice(1, -1)
                  .map((e) => e[0])
                  .join("")}${L(e)}`,
            )
            .join(" ");
        }
        return n
          .split(" ")
          .filter((e) => e !== "solid")
          .map((t) => `${r}border-${e.split("-")[1][0]}${L(t)}`)
          .join(" ");
      }
      if (e.startsWith("border-image")) {
        return undefined;
      }
      if (/^\d[%|(px)rem]$/.test(n) || e === "border-collapse") {
        return `${r}border-${n}`;
      }
      if (e === "border-width" || e === "border-style") {
        return `${r}border${L(n)}`;
      }
      if (e === "border-color") {
        if (n === "currentColor") {
          return `${r}border-current`;
        }
        return `${r}border${L(n)}`;
      }
      return n
        .split(" ")
        .map((e) => {
          if (n === "currentColor") {
            return `${r}border-current`;
          }
          return `${r}border${L(e)}`;
        })
        .join(" ");
    },
    outline: function (e, t) {
      if (!$e.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (e === "outline-offset") {
        return `${r}${e}-${n}`;
      }
      return `${r}${b(e)}-${n}`;
    },
    opacity: function (e, t) {
      if (!Se.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (t.endsWith("%")) {
        return `${r}op-${n.replace(/%/g, "")}`;
      }
      return `${r}op-${100 * Number(n)}`;
    },
    mix: function (e, t) {
      const [n, r] = T(t);
      return `${r}mix-blend-${n}`;
    },
    filter,
    backdrop: function (e, t) {
      if (!W.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      return `${r}backdrop-${filter(e, n)}`;
    },
    table: xe,
    transition: function (e, t) {
      if (!qe.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (e === "transition-timing-function") {
        if (n === "linear") {
          return `${r}ease-${n}`;
        }
        return `${r}ease-[${n}]`;
      }
      if (e === "transition") {
        return ((e, t) => {
          let n = false;
          return e
            .split(" ")
            .map((e) => {
              if (/^\d/.test(e) || /^\.\d/.test(e)) {
                if (n) {
                  return `${t}delay${L(e, undefined)}`;
                }
                return ((n = true), `${t}duration${L(e, undefined)}`);
              }
              if (e === "background-color") {
                return `${t}transition-colors`;
              }
              if (
                /^(?:linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end)$/.test(
                  e,
                ) ||
                e.startsWith("cubic-bezier") ||
                e.startsWith("steps")
              ) {
                return `${t}ease-[${e}]`;
              }
              return `${t}transition${L(e)}`;
            })
            .join(" ");
        })(n, r);
      }
      if (e === "transition-property") {
        if (n.includes("color")) {
          return `${r}transition-color`;
        }
        if (n === "box-shadow") {
          return `${r}transition-shadow`;
        }
        return `${r}transition-${n}`;
      }
      if (e === "transition-behavior") {
        return `${r}transition-${w(n)}`;
      }
      const a = L(n);
      if (a === `-${n}` && Ge.includes(e)) {
        let t = n.trim();
        if (t.endsWith("ms")) {
          t = t.replace(/ms$/, "");
        } else if (t.endsWith("s")) {
          t = (1000 * Number.parseFloat(t.replace(/s$/, ""))).toString();
        }
        return `${r}${e.split("-")[1]}-${t}`;
      }
      return `${r}${e.split("-")[1]}${a}`;
    },
    transform: function (e, t) {
      if (!Fe.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (e === "transform-origin") {
        if (S(n) || y(n)) {
          return `${r}origin${L(n)}`;
        }
        return `${r}origin-${/\d/.test(n) && n.includes(" ") ? `[${_(n)}]` : k(n)}`;
      }
      if (e === "transform-style") {
        return `${r}transform-${n}`;
      }
      if (t === "none") {
        return `${r}${e}-none`;
      }
      return ((a = n),
      a
        .replace(/\(\s*/g, "(")
        .replace(/\s*\)/g, ")")
        .replace(/\s*,\s*/g, ","))
        .split(" ")
        .map((e) => {
          const t = e.match(/([a-z]+)(3d)?([A-Z])?\((.*)\)/);
          if (!t) {
            return;
          }
          const [n, a, o, i, c] = t;
          if (i) {
            const e = c.replace(/,(?![^()]*\))/g, " ").split(" ");
            if (e.length > 1) {
              return `${r}${a}-[${i.toLowerCase()}-${e
                .map((e) => {
                  if (S(e)) {
                    return e;
                  }
                  return L(a === "scale" ? N(e) : e);
                })
                .join("_")}]`;
            }
            return `${r}${a}-${i.toLowerCase()}${S(e[0]) ? `-[${e[0]}]` : L(a === "scale" ? N(e[0]) : e[0])}`;
          }
          {
            const e = c.replace(/,(?![^()]*\))/g, " ").split(" ");
            if (a === "scale") {
              if (e.length > 1) {
                return `${r}${a}-[${e.join("_")}]`;
              }
              return `${r}${a}${S(c) || y(c) ? `-[${c}]` : L(a === "scale" ? N(c) : c)}`;
            }
            const [t, n] = e;
            return `${r}${a}-x${L(t)} ${r}${a}-y${L(n ?? t)}`;
          }
        })
        .filter(Boolean)
        .join(" ");
      var a;
    },
    accent: xe,
    appearance: xe,
    cursor: function (e, t) {
      if (!oe.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      return `${r}${e}${L(n)}`;
    },
    caret: xe,
    pointer: me,
    resize: function (e, t) {
      const [n, r] = T(t);
      if (n === "both") {
        return `${r}${e}`;
      }
      return `${r}${e}-${Ie[n] || n}`;
    },
    scroll: function (e, t) {
      if (!je.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (e.startsWith("scroll-snap")) {
        if (n.includes(" ")) {
          const [e, t] = n.split(" ");
          return `${r}snap-${e}${L(t)}`;
        }
        return `${r}snap-${n}`;
      }
      if (e === "scroll-behavior") {
        return `${r}scroll-${n}`;
      }
      const [a, o, i, c] = e.match(/scroll-(margin|padding)-?(\w+)?-?(\w+)?/);
      if (i === "inline" && c) {
        return `${r}scroll-${o[0]}${c[0]}${L(n)}`;
      }
      if (i) {
        return `${r}scroll-${o[0]}${i[0]}${L(n)}`;
      }
      return `${r}scroll-${o[0]}${L(n)}`;
    },
    touch: xe,
    user: function (e, t) {
      if (!We.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      return `${r}${w(e)}-${n}`;
    },
    will: function (e, t) {
      if (!Ye.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      if (n in Ke) {
        return `will-change-${Ke[n]}${r}`;
      }
      return `${r}${e}-[${_(n)}]`;
    },
    fill: me,
    stroke: xe,
    color: function (e, t) {
      if (!ne.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      return `${r}text${L(n)}`;
    },
    row: function (e, t) {
      if (!Re.includes(e)) {
        return;
      }
      const [n, r] = T(t);
      return `${r}gap-y${L(n)}`;
    },
  };
  const tt = /([\w-]+)\s*:\s*([^;]+)/;
  function nt(e, t) {
    const r = (e = e.replace($, "")).match(tt);
    if (!r) {
      return;
    }
    const [a, o, i] = r;
    const c = b(o);
    const s = et[c]?.(o, i);
    if (s && t) {
      return s.replace(
        /-\[([0-9.]+)px\]/g,
        (e, t) => `-[${Number(t) / 16}rem]`,
      );
    }
    return s;
  }
  function rt(e) {
    return (t) => {
      const n = e.anyMatch || [];
      const r = e.priority || [];
      let a = null;
      if (
        n.length > 0 &&
        ((a = n.find(
          (e) =>
            t[e.key] &&
            (e.pattern instanceof RegExp
              ? e.pattern.test(t[e.key])
              : t[e.key] === e.pattern),
        )),
        !a)
      ) {
        return {
          transformedResult: "",
          deleteKeys: [],
        };
      }
      let o = "";
      if (n.length > 0 && r.length > 0) {
        for (const e of r) {
          const r = n.find((t) => t.key === e);
          if (
            r &&
            t[e] &&
            (r.pattern instanceof RegExp
              ? r.pattern.test(t[e])
              : t[e] === r.pattern)
          ) {
            o = t[e];
            break;
          }
        }
      }
      const i = {
        ...e.allMatch,
      };
      const c = Object.keys(i);
      for (const e of c) {
        const n = i[e];
        if (!(n instanceof RegExp ? n.test(t[e]) : t[e] === n)) {
          return {
            transformedResult: "",
            deleteKeys: [],
          };
        }
      }
      const deleteKeys = [...c, ...n.map((e) => e.key)];
      return {
        transformedResult:
          typeof e.outputTemplate === "function"
            ? e.outputTemplate(o)
            : e.outputTemplate.replace("${value}", o),
        deleteKeys,
      };
    };
  }
  const at = {
    "line-clamp-${number}": rt({
      allMatch: {
        overflow: "hidden",
        display: "-webkit-box",
        "-webkit-box-orient": "vertical",
      },
      anyMatch: [
        {
          key: "-webkit-line-clamp",
          pattern: /\d/,
        },
        {
          key: "line-clamp",
          pattern: /\d/,
        },
      ],
      priority: ["line-clamp", "-webkit-line-clamp"],
      outputTemplate: (e) => `line-clamp-${e}`,
    }),
    "line-clamp-${prop}": rt({
      allMatch: {
        overflow: "visible",
        display: "block",
        "-webkit-box-orient": "horizontal",
      },
      anyMatch: [
        {
          key: "-webkit-line-clamp",
          pattern: /inherit|initial|revert|unset/,
        },
        {
          key: "line-clamp",
          pattern: /inherit|initial|revert|unset/,
        },
      ],
      priority: ["line-clamp", "-webkit-line-clamp"],
      outputTemplate: (e) => `line-clamp-${e}`,
    }),
    truncate: rt({
      allMatch: {
        overflow: "hidden",
        "text-overflow": "ellipsis",
        "white-space": "nowrap",
      },
      outputTemplate: () => "truncate",
    }),
  };
  function ot(e, t, n) {
    const r = n ? console.log : () => {};
    r("🔍 [DEBUG] Input styles:", e);
    r("🔍 [DEBUG] isRem:", t);
    const a = [];
    const o = new Set();
    const computeNewStyle = (e) => {
      const t = [];
      const n = e
        .split(";")
        .filter(Boolean)
        .reduce((acc, item) => {
          const computeN = (item_1) => {
            let t = 0;
            for (let n = 0; n < item_1.length; n++) {
              const r = item_1[n];
              if (r === "[") {
                t++;
              } else if (r === "]") {
                t--;
              } else if (r === ":" && t === 0) {
                return n;
              }
            }
            return -1;
          };
          const n = computeN(item);
          if (n === -1) {
            return acc;
          }
          const r = item.substring(0, n).trim();
          const a = item.substring(n + 1).trim();
          if (r && a) {
            acc[r] = a;
          }
          return acc;
        }, {});
      for (const e in at) {
        const { transformedResult, deleteKeys } = at[e](n);
        if (transformedResult && deleteKeys.length) {
          t.push(transformedResult);
          deleteKeys.forEach((e) => {
            delete n[e];
          });
        }
      }
      return {
        transformedResult: t.join(" "),
        newStyle: Object.entries(n)
          .map(([e, t]) => `${e}: ${t}`)
          .join("; "),
      };
    };
    const { newStyle, transformedResult } = computeNewStyle(e);
    r("🔍 [DEBUG] After transformStyleToTailwindPre:", {
      newStyle,
      transformedResult,
    });
    if (transformedResult) {
      r("🔍 [DEBUG] Using transformedResult path");
      const e = [
        transformedResult,
        newStyle
          .split(";")
          .filter(Boolean)
          .reduce((acc, item) => {
            const i = item.replaceAll($, "").trim();
            r("🔍 [DEBUG] Processing style:", item, "-> key:", i);
            if (o.has(i)) {
              r("🔍 [DEBUG] Skipping duplicate key:", i);
              return acc;
            }
            o.add(i);
            const c = nt(i, t) || "";
            r("🔍 [DEBUG] Converted to Tailwind:", i, "->", c);
            if (!c) {
              r("🔍 [DEBUG] No conversion found, adding to noTransfer:", item);
              a.push(item);
            }
            return acc + `${c} `;
          }, "")
          .trim()
          .replace(/\s+/g, " "),
      ]
        .filter(Boolean)
        .join(" ");
      r("🔍 [DEBUG] Final result (transformedResult path):", e);
      r("🔍 [DEBUG] noTransfer:", a);
      return [e, a];
    }
    r("🔍 [DEBUG] Using fallback path");
    const s = e
      .split(";")
      .filter(Boolean)
      .reduce((acc, item) => {
        const i = item.replaceAll($, "").trim();
        r("🔍 [DEBUG] Processing style:", item, "-> key:", i);
        if (o.has(i)) {
          r("🔍 [DEBUG] Skipping duplicate key:", i);
          return acc;
        }
        o.add(i);
        const c = nt(i, t) || "";
        r("🔍 [DEBUG] Converted to Tailwind:", i, "->", c);
        if (!c) {
          r("🔍 [DEBUG] No conversion found, adding to noTransfer:", item);
          a.push(item);
        }
        return acc + `${c} `;
      }, "")
      .trim()
      .replace(/\s+/g, " ");
    r("🔍 [DEBUG] Final result (fallback path):", s);
    r("🔍 [DEBUG] noTransfer:", a);
    return [s, a];
  }
  function it(e) {
    it =
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
    return it(e);
  }
  function ct() {
    ct = function () {
      return t;
    };
    let e;
    var t = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const a =
      Object.defineProperty ||
      ((e, t, n) => {
        e[t] = n.value;
      });
    const o = typeof Symbol === "function" ? Symbol : {};
    const i = o.iterator || "@@iterator";
    const c = o.asyncIterator || "@@asyncIterator";
    const s = o.toStringTag || "@@toStringTag";
    function l(e, t, n) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      l({}, "");
    } catch (e) {
      l = function (e, t, n) {
        return (e[t] = n);
      };
    }
    function u(e, t, n, r) {
      const o = t && t.prototype instanceof g ? t : g;
      const i = Object.create(o.prototype);
      const c = new $(r || []);
      a(i, "_invoke", {
        value: k(e, n, c),
      });
      return i;
    }
    function d(e, t, n) {
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
    t.wrap = u;
    var p = "suspendedStart";
    var m = "suspendedYield";
    var f = "executing";
    var h = "completed";
    var v = {};
    function g() {}
    function y() {}
    function b() {}
    let w = {};
    l(w, i, function () {
      return this;
    });
    const E =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(A([])));
    if (E && E !== Object.prototype && hasOwnProperty.call(E, i)) {
      w = E;
    }
    const C = (b.prototype = g.prototype = Object.create(w));
    function L(e) {
      ["next", "throw", "return"].forEach((t) => {
        l(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function N(e, t) {
      function n(a, o, i, c) {
        const s = d(e[a], e, o);
        if (s.type !== "throw") {
          const l = s.arg;
          const u = l.value;
          if (u && it(u) == "object" && hasOwnProperty.call(u, "__await")) {
            return t.resolve(u.__await).then(
              (e) => {
                n("next", e, i, c);
              },
              (e) => {
                n("throw", e, i, c);
              },
            );
          }
          return t.resolve(u).then(
            (e) => {
              l.value = e;
              i(l);
            },
            (e) => n("throw", e, i, c),
          );
        }
        c(s.arg);
      }
      let o;
      a(this, "_invoke", {
        value: function (e, r) {
          function a() {
            return new t(function (t, a) {
              n(e, r, t, a);
            });
          }
          return (o = o ? o.then(a, a) : a());
        },
      });
    }
    function k(t, n, r) {
      let a = p;
      return function (o, i) {
        if (a === f) {
          throw Error("Generator is already running");
        }
        if (a === h) {
          if (o === "throw") {
            throw i;
          }
          return {
            value: e,
            done: true,
          };
        }
        r.method = o;
        for (r.arg = i; ;) {
          const c = r.delegate;
          if (c) {
            const s = _(c, r);
            if (s) {
              if (s === v) {
                continue;
              }
              return s;
            }
          }
          if (r.method === "next") {
            r.sent = r._sent = r.arg;
          } else if (r.method === "throw") {
            if (a === p) {
              a = h;
              throw r.arg;
            }
            r.dispatchException(r.arg);
          } else {
            if (r.method === "return") {
              r.abrupt("return", r.arg);
            }
          }
          a = f;
          const l = d(t, n, r);
          if (l.type === "normal") {
            a = r.done ? h : m;
            if (l.arg === v) {
              continue;
            }
            return {
              value: l.arg,
              done: r.done,
            };
          }
          if (l.type === "throw") {
            a = h;
            r.method = "throw";
            r.arg = l.arg;
          }
        }
      };
    }
    function _(t, n) {
      const n_method = n.method;
      const a = t.iterator[n_method];
      if (a === e) {
        n.delegate = null;
        if (
          !(
            n_method === "throw" &&
            t.iterator.return &&
            ((n.method = "return"), (n.arg = e), _(t, n), n.method === "throw")
          )
        ) {
          if (n_method !== "return") {
            n.method = "throw";
            n.arg = new TypeError(
              `The iterator does not provide a '${n_method}' method`,
            );
          }
        }
        return v;
      }
      const o = d(a, t.iterator, n.arg);
      if (o.type === "throw") {
        n.method = "throw";
        n.arg = o.arg;
        n.delegate = null;
        return v;
      }
      const o_arg = o.arg;
      if (o_arg) {
        if (o_arg.done) {
          return (
            (n[t.resultName] = o_arg.value),
            (n.next = t.nextLoc),
            n.method !== "return" && ((n.method = "next"), (n.arg = e)),
            (n.delegate = null),
            v
          );
        }
        return o_arg;
      }
      return (
        (n.method = "throw"),
        (n.arg = new TypeError("iterator result is not an object")),
        (n.delegate = null),
        v
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
    function S(e) {
      const t = e.completion || {};
      t.type = "normal";
      delete t.arg;
      e.completion = t;
    }
    function $(e) {
      this.tryEntries = [
        {
          tryLoc: "root",
        },
      ];
      e.forEach(T, this);
      this.reset(true);
    }
    function A(t) {
      if (t || t === "") {
        const n = t[i];
        if (n) {
          return n.call(t);
        }
        if (typeof t.next === "function") {
          return t;
        }
        if (!isNaN(t.length)) {
          let a = -1;
          const o = function n() {
            while (++a < t.length) {
              if (hasOwnProperty.call(t, a)) {
                n.value = t[a];
                n.done = false;
                return n;
              }
            }
            n.value = e;
            n.done = true;
            return n;
          };
          return (o.next = o);
        }
      }
      throw new TypeError(`${it(t)} is not iterable`);
    }
    y.prototype = b;
    a(C, "constructor", {
      value: b,
      configurable: true,
    });
    a(b, "constructor", {
      value: y,
      configurable: true,
    });
    y.displayName = l(b, s, "GeneratorFunction");
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
        l(e, s, "GeneratorFunction");
      }
      e.prototype = Object.create(C);
      return e;
    };
    t.awrap = function (e) {
      return {
        __await: e,
      };
    };
    L(N.prototype);
    l(N.prototype, c, function () {
      return this;
    });
    t.AsyncIterator = N;
    t.async = function (e, n, r, a, o = Promise) {
      const i = new N(u(e, n, r, a), o);
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
    L(C);
    l(C, s, "Generator");
    l(C, i, function () {
      return this;
    });
    l(C, "toString", function () {
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
    t.values = A;
    $.prototype = {
      constructor: $,
      reset: function (t) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = e;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = e;
        this.tryEntries.forEach(S);
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
        function a(r, a) {
          c.type = "throw";
          c.arg = t;
          n.next = r;
          if (a) {
            n.method = "next";
            n.arg = e;
          }
          return !!a;
        }
        for (let o = this.tryEntries.length - 1; o >= 0; --o) {
          const i = this.tryEntries[o];
          var c = i.completion;
          if (i.tryLoc === "root") {
            return a("end");
          }
          if (i.tryLoc <= this.prev) {
            const s = hasOwnProperty.call(i, "catchLoc");
            const l = hasOwnProperty.call(i, "finallyLoc");
            if (s && l) {
              if (this.prev < i.catchLoc) {
                return a(i.catchLoc, true);
              }
              if (this.prev < i.finallyLoc) {
                return a(i.finallyLoc);
              }
            } else if (s) {
              if (this.prev < i.catchLoc) {
                return a(i.catchLoc, true);
              }
            } else {
              if (!l) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < i.finallyLoc) {
                return a(i.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let n = this.tryEntries.length - 1; n >= 0; --n) {
          const a = this.tryEntries[n];
          if (
            a.tryLoc <= this.prev &&
            hasOwnProperty.call(a, "finallyLoc") &&
            this.prev < a.finallyLoc
          ) {
            var o = a;
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
          return ((this.method = "next"), (this.next = o.finallyLoc), v);
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
        return v;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.finallyLoc === e) {
            this.complete(n.completion, n.afterLoc);
            S(n);
            return v;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.tryLoc === e) {
            const r = n.completion;
            if (r.type === "throw") {
              var a = r.arg;
              S(n);
            }
            return a;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (t, n, r) {
        this.delegate = {
          iterator: A(t),
          resultName: n,
          nextLoc: r,
        };
        if (this.method === "next") {
          this.arg = e;
        }
        return v;
      },
    };
    return t;
  }
  function st(e, t) {
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
  function lt(e) {
    for (let t = 1; t < arguments.length; t++) {
      var n = arguments[t] ?? {};
      if (t % 2) {
        st(Object(n), true).forEach((t) => {
          ut(e, t, n[t]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(e, Object.getOwnPropertyDescriptors(n));
      } else {
        st(Object(n)).forEach((t) => {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
        });
      }
    }
    return e;
  }
  function ut(e, t, n) {
    if (
      (t = ((e) => {
        const computeT = (e) => {
          const t = "string";
          if (it(e) != "object" || !e) {
            return e;
          }
          const n = e[Symbol.toPrimitive];
          if (n !== undefined) {
            const r = n.call(e, t || "default");
            if (it(r) != "object") {
              return r;
            }
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return (t === "string" ? String : Number)(e);
        };
        const t = computeT(e);
        if (it(t) == "symbol") {
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
  function dt(e, t, n, r, a, o, i) {
    try {
      var c = e[o](i);
      var s = c.value;
    } catch (error) {
      return void n(error);
    }
    if (c.done) {
      t(s);
    } else {
      Promise.resolve(s).then(r, a);
    }
  }
  function pt(e) {
    return function () {
      const t = this;
      const n = arguments;
      return new Promise((resolve, reject) => {
        const o = e.apply(t, n);
        function i(e) {
          dt(o, resolve, reject, i, c, "next", e);
        }
        function c(e) {
          dt(o, resolve, reject, i, c, "throw", e);
        }
        i(undefined);
      });
    };
  }
  var mt = null;
  var ft = null;
  var ht = null;
  function vt(e, t) {
    try {
      return chrome.i18n.getMessage(e) || t;
    } catch (e) {
      return t;
    }
  }
  function gt() {
    if (!mt || !mt.isConnected) {
      d();
      mt = document.createElement("div");
      mt.className = `exception-${chrome.runtime.id}`;
      mt.style.all = "initial";
      ft = mt.attachShadow({
        mode: "open",
      });
      const e = document.createElement("style");
      e.textContent =
        '\n  :host {\n    all: initial;\n    --font-sans: "Bo doi Geist", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", Arial, sans-serif;\n    --font-mono: "Bo doi Geist Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;\n    --primary: #1f1f1f;\n    --secondary: #74777c;\n    --quaternary: #b1b6bc;\n    --background: #ffffff;\n    --surface: #f2f2f2;\n    --elevated: #f2f2f2;\n    --surface-elevated: #ffffff;\n    --stroke: rgba(0, 0, 0, 0.08);\n    color-scheme: light;\n  }\n\n  @media (prefers-color-scheme: dark) {\n    :host {\n      --primary: #eeeeee;\n      --secondary: #c7c7c7;\n      --quaternary: #6c7075;\n      --background: #131313;\n      --surface: #1c1c1c;\n      --elevated: #2c2c2c;\n      --surface-elevated: #1f1f1f;\n      --stroke: rgba(255, 255, 255, 0.08);\n      color-scheme: dark;\n    }\n  }\n\n  :host(.force-light) {\n    --primary: #1f1f1f;\n    --secondary: #74777c;\n    --quaternary: #b1b6bc;\n    --background: #ffffff;\n    --surface: #f2f2f2;\n    --elevated: #f2f2f2;\n    --surface-elevated: #ffffff;\n    --stroke: rgba(0, 0, 0, 0.08);\n    color-scheme: light;\n  }\n\n  :host(.force-dark) {\n    --primary: #eeeeee;\n    --secondary: #c7c7c7;\n    --quaternary: #6c7075;\n    --background: #131313;\n    --surface: #1c1c1c;\n    --elevated: #2c2c2c;\n    --surface-elevated: #1f1f1f;\n    --stroke: rgba(255, 255, 255, 0.08);\n    color-scheme: dark;\n  }\n\n  .modal {\n    width: 400px;\n    max-width: calc(100vw - 32px);\n    max-height: 90vh;\n    padding: 0;\n    border: none;\n    border-radius: 16px;\n    margin: auto;\n    background: var(--surface-elevated);\n    color: var(--primary);\n    box-shadow: 0 0 0 1px var(--stroke), 0 2px 8px 0 rgba(0, 0, 0, 0.06);\n    font-family: var(--font-sans);\n    overflow: hidden;\n  }\n\n  .modal::backdrop {\n    background: rgba(0, 0, 0, 0.4);\n  }\n\n  .content-wrapper {\n    display: flex;\n    flex-direction: column;\n    gap: 8px;\n    padding: 24px;\n  }\n\n  h2 {\n    margin: 0;\n    font-size: 16px;\n    font-weight: 600;\n    color: var(--primary);\n  }\n\n  p {\n    margin: 0;\n    font-size: 14px;\n    line-height: 1.5;\n    color: var(--secondary);\n  }\n\n  p:empty {\n    display: none;\n  }\n\n  .input-mono {\n    height: 40px;\n    width: 100%;\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0 12px;\n    background: transparent;\n    border: 1px solid var(--stroke);\n    border-radius: 8px;\n    font-size: 14px;\n    font-family: var(--font-mono);\n    color: var(--primary);\n    outline: none;\n  }\n\n  .input-mono:focus {\n    border-color: var(--quaternary);\n  }\n\n  .input-mono::placeholder {\n    color: var(--secondary);\n  }\n\n  .dialog-fields {\n    display: flex;\n    gap: 12px;\n  }\n\n  .dialog-field {\n    flex: 1;\n    min-width: 0;\n    display: flex;\n    flex-direction: column;\n    gap: 6px;\n  }\n\n  .dialog-field-label {\n    padding-top: 8px;\n    font-size: 12px;\n    font-weight: 500;\n    color: var(--secondary);\n  }\n\n  .dialog-number {\n    position: relative;\n    display: flex;\n    align-items: center;\n  }\n\n  .dialog-unit {\n    position: absolute;\n    right: 12px;\n    font-size: 12px;\n    font-family: var(--font-mono);\n    color: var(--secondary);\n    pointer-events: none;\n  }\n\n  .dialog-number .input-mono {\n    padding-right: 32px;\n  }\n\n  .input-mono::-webkit-outer-spin-button,\n  .input-mono::-webkit-inner-spin-button {\n    -webkit-appearance: none;\n    margin: 0;\n  }\n\n  .input-mono[type="number"] {\n    -moz-appearance: textfield;\n    appearance: textfield;\n  }\n\n  .dialog-actions {\n    display: flex;\n    justify-content: flex-end;\n    gap: 8px;\n    padding-top: 8px;\n  }\n\n  .btn-dialog-primary,\n  .btn-dialog-secondary {\n    height: 36px;\n    padding: 0 16px;\n    border: none;\n    border-radius: 12px;\n    font-size: 14px;\n    font-weight: 500;\n    font-family: var(--font-sans);\n    cursor: pointer;\n    outline: none;\n  }\n\n  .btn-dialog-primary {\n    background: var(--primary);\n    color: var(--background);\n  }\n\n  .btn-dialog-primary:hover {\n    opacity: 0.9;\n  }\n\n  .btn-dialog-secondary {\n    background: transparent;\n    color: var(--primary);\n  }\n\n  .btn-dialog-secondary:hover {\n    background: var(--elevated);\n  }\n';
      ft.appendChild(e);
      document.body.appendChild(mt);
    }
  }
  function yt() {
    return bt.apply(this, arguments);
  }
  function bt() {
    return (bt = pt(
      ct().mark(function e() {
        let t;
        let n;
        return ct().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  mt.classList.remove("force-light", "force-dark");
                  e.prev = 1;
                  e.next = 4;
                  return chrome.storage.local.get({
                    theme: "system",
                  });
                case 4:
                  t = e.sent;
                  if ((n = t.theme) === "dark") {
                    mt.classList.add("force-dark");
                  } else if (n === "light") {
                    mt.classList.add("force-light");
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
  function wt(e) {
    return xt.apply(this, arguments);
  }
  function xt() {
    return (xt = pt(
      ct().mark(function e(t) {
        return ct().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                gt();
                e.next = 3;
                return yt();
              case 3:
                return e.abrupt(
                  "return",
                  new Promise((resolve) => {
                    if (ht) {
                      ht.remove();
                      ht = null;
                    }
                    const n = document.createElement("dialog");
                    n.className = "modal";
                    const r = document.createElement("div");
                    r.className = "content-wrapper";
                    if (t.title) {
                      const a = document.createElement("h2");
                      a.textContent = t.title;
                      r.appendChild(a);
                    }
                    const o = document.createElement("p");
                    o.textContent = t.body || "";
                    r.appendChild(o);
                    let i = null;
                    let c = null;
                    if (t.type === "size") {
                      const s = document.createElement("div");
                      s.className = "dialog-fields";
                      const l = (e, n, r) => {
                        const a = document.createElement("label");
                        a.className = "dialog-field";
                        const o = document.createElement("span");
                        o.className = "dialog-field-label";
                        o.textContent = e;
                        a.appendChild(o);
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
                        const l = document.createElement("span");
                        l.className = "dialog-unit";
                        l.textContent = "px";
                        i.appendChild(l);
                        a.appendChild(i);
                        s.appendChild(a);
                        return c;
                      };
                      i = l(vt("LABEL_WIDTH", "Width"), t.width, t.minWidth);
                      c = l(
                        vt("LABEL_HEIGHT", "Height"),
                        t.height,
                        t.minHeight,
                      );
                      r.appendChild(s);
                    }
                    let u = null;
                    if (t.type === "prompt") {
                      (u = document.createElement("input")).type = "text";
                      u.className = "input-mono";
                      u.autocomplete = "off";
                      u.spellcheck = false;
                      if (t.placeholder) {
                        u.placeholder = t.placeholder;
                      }
                      if (t.value) {
                        u.value = t.value;
                      }
                      r.appendChild(u);
                    }
                    const d = document.createElement("div");
                    d.className = "dialog-actions";
                    const p = (t) => {
                      try {
                        n.close();
                      } catch (e) {}
                      n.remove();
                      if (ht === n) {
                        ht = null;
                      }
                      resolve(t);
                    };
                    const m =
                      t.type === "prompt" || t.type === "size"
                        ? null
                        : t.type !== "confirm" && undefined;
                    if (t.type !== "alert") {
                      const f = document.createElement("button");
                      f.type = "button";
                      f.className = "btn-dialog-secondary";
                      f.textContent =
                        t.cancelLabel || vt("DIALOG_CANCEL_BUTTON", "Cancel");
                      f.addEventListener("click", function () {
                        return p(m);
                      });
                      d.appendChild(f);
                    }
                    const h = document.createElement("button");
                    h.type = "button";
                    h.className = "btn-dialog-primary";
                    h.textContent =
                      t.confirmLabel ||
                      (t.type === "alert"
                        ? vt("DIALOG_OK", "OK")
                        : vt("DIALOG_CONFIRM", "Confirm"));
                    h.addEventListener("click", function () {
                      if (t.type === "prompt") {
                        p(u.value);
                      } else if (t.type === "confirm") {
                        p(true);
                      } else if (t.type === "size") {
                        const e = parseInt(i.value, 10);
                        const n = parseInt(c.value, 10);
                        const r = (e, n) =>
                          Math.min(t.max ?? Infinity, Math.max(n ?? 1, e));
                        if (!Number.isFinite(e) || !Number.isFinite(n)) {
                          return void p(null);
                        }
                        p({
                          width: r(e, t.minWidth),
                          height: r(n, t.minHeight),
                        });
                      } else {
                        p();
                      }
                    });
                    d.appendChild(h);
                    r.appendChild(d);
                    n.appendChild(r);
                    n.addEventListener("cancel", function (e) {
                      e.preventDefault();
                      p(m);
                    });
                    n.addEventListener("click", function (e) {
                      if (e.target === n) {
                        p(m);
                      }
                    });
                    ft.appendChild(n);
                    ht = n;
                    n.showModal();
                    if (u) {
                      setTimeout(() => u.focus(), 50);
                    }
                    if (i) {
                      setTimeout(() => {
                        i.focus();
                        i.select();
                      }, 50);
                      for (let v = 0, g = [i, c]; v < g.length; v++) {
                        g[v].addEventListener("keydown", function (e) {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            h.click();
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
  const Et = {
    alert: function (_param_0 = {}) {
      return wt(
        lt(
          lt({}, _param_0),
          {},
          {
            type: "alert",
          },
        ),
      );
    },
    confirm: function (_param_0 = {}) {
      return wt(
        lt(
          lt({}, _param_0),
          {},
          {
            type: "confirm",
          },
        ),
      );
    },
    prompt: function (_param_0 = {}) {
      return wt(
        lt(
          lt({}, _param_0),
          {},
          {
            type: "prompt",
          },
        ),
      );
    },
    size: function (_param_0 = {}) {
      return wt(
        lt(
          lt({}, _param_0),
          {},
          {
            type: "size",
          },
        ),
      );
    },
  };
  function Ct(e) {
    Ct =
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
    return Ct(e);
  }
  function Lt() {
    Lt = function () {
      return t;
    };
    let e;
    var t = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const a =
      Object.defineProperty ||
      ((e, t, n) => {
        e[t] = n.value;
      });
    const o = typeof Symbol === "function" ? Symbol : {};
    const i = o.iterator || "@@iterator";
    const c = o.asyncIterator || "@@asyncIterator";
    const s = o.toStringTag || "@@toStringTag";
    function l(e, t, n) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      l({}, "");
    } catch (e) {
      l = function (e, t, n) {
        return (e[t] = n);
      };
    }
    function u(e, t, n, r) {
      const o = t && t.prototype instanceof g ? t : g;
      const i = Object.create(o.prototype);
      const c = new $(r || []);
      a(i, "_invoke", {
        value: k(e, n, c),
      });
      return i;
    }
    function d(e, t, n) {
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
    t.wrap = u;
    var p = "suspendedStart";
    var m = "suspendedYield";
    var f = "executing";
    var h = "completed";
    var v = {};
    function g() {}
    function y() {}
    function b() {}
    let w = {};
    l(w, i, function () {
      return this;
    });
    const E =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(A([])));
    if (E && E !== Object.prototype && hasOwnProperty.call(E, i)) {
      w = E;
    }
    const C = (b.prototype = g.prototype = Object.create(w));
    function L(e) {
      ["next", "throw", "return"].forEach((t) => {
        l(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function N(e, t) {
      function n(a, o, i, c) {
        const s = d(e[a], e, o);
        if (s.type !== "throw") {
          const l = s.arg;
          const u = l.value;
          if (u && Ct(u) == "object" && hasOwnProperty.call(u, "__await")) {
            return t.resolve(u.__await).then(
              (e) => {
                n("next", e, i, c);
              },
              (e) => {
                n("throw", e, i, c);
              },
            );
          }
          return t.resolve(u).then(
            (e) => {
              l.value = e;
              i(l);
            },
            (e) => n("throw", e, i, c),
          );
        }
        c(s.arg);
      }
      let o;
      a(this, "_invoke", {
        value: function (e, r) {
          function a() {
            return new t(function (t, a) {
              n(e, r, t, a);
            });
          }
          return (o = o ? o.then(a, a) : a());
        },
      });
    }
    function k(t, n, r) {
      let a = p;
      return function (o, i) {
        if (a === f) {
          throw Error("Generator is already running");
        }
        if (a === h) {
          if (o === "throw") {
            throw i;
          }
          return {
            value: e,
            done: true,
          };
        }
        r.method = o;
        for (r.arg = i; ;) {
          const c = r.delegate;
          if (c) {
            const s = _(c, r);
            if (s) {
              if (s === v) {
                continue;
              }
              return s;
            }
          }
          if (r.method === "next") {
            r.sent = r._sent = r.arg;
          } else if (r.method === "throw") {
            if (a === p) {
              a = h;
              throw r.arg;
            }
            r.dispatchException(r.arg);
          } else {
            if (r.method === "return") {
              r.abrupt("return", r.arg);
            }
          }
          a = f;
          const l = d(t, n, r);
          if (l.type === "normal") {
            a = r.done ? h : m;
            if (l.arg === v) {
              continue;
            }
            return {
              value: l.arg,
              done: r.done,
            };
          }
          if (l.type === "throw") {
            a = h;
            r.method = "throw";
            r.arg = l.arg;
          }
        }
      };
    }
    function _(t, n) {
      const n_method = n.method;
      const a = t.iterator[n_method];
      if (a === e) {
        n.delegate = null;
        if (
          !(
            n_method === "throw" &&
            t.iterator.return &&
            ((n.method = "return"), (n.arg = e), _(t, n), n.method === "throw")
          )
        ) {
          if (n_method !== "return") {
            n.method = "throw";
            n.arg = new TypeError(
              `The iterator does not provide a '${n_method}' method`,
            );
          }
        }
        return v;
      }
      const o = d(a, t.iterator, n.arg);
      if (o.type === "throw") {
        n.method = "throw";
        n.arg = o.arg;
        n.delegate = null;
        return v;
      }
      const o_arg = o.arg;
      if (o_arg) {
        if (o_arg.done) {
          return (
            (n[t.resultName] = o_arg.value),
            (n.next = t.nextLoc),
            n.method !== "return" && ((n.method = "next"), (n.arg = e)),
            (n.delegate = null),
            v
          );
        }
        return o_arg;
      }
      return (
        (n.method = "throw"),
        (n.arg = new TypeError("iterator result is not an object")),
        (n.delegate = null),
        v
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
    function S(e) {
      const t = e.completion || {};
      t.type = "normal";
      delete t.arg;
      e.completion = t;
    }
    function $(e) {
      this.tryEntries = [
        {
          tryLoc: "root",
        },
      ];
      e.forEach(T, this);
      this.reset(true);
    }
    function A(t) {
      if (t || t === "") {
        const n = t[i];
        if (n) {
          return n.call(t);
        }
        if (typeof t.next === "function") {
          return t;
        }
        if (!isNaN(t.length)) {
          let a = -1;
          const o = function n() {
            while (++a < t.length) {
              if (hasOwnProperty.call(t, a)) {
                n.value = t[a];
                n.done = false;
                return n;
              }
            }
            n.value = e;
            n.done = true;
            return n;
          };
          return (o.next = o);
        }
      }
      throw new TypeError(`${Ct(t)} is not iterable`);
    }
    y.prototype = b;
    a(C, "constructor", {
      value: b,
      configurable: true,
    });
    a(b, "constructor", {
      value: y,
      configurable: true,
    });
    y.displayName = l(b, s, "GeneratorFunction");
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
        l(e, s, "GeneratorFunction");
      }
      e.prototype = Object.create(C);
      return e;
    };
    t.awrap = function (e) {
      return {
        __await: e,
      };
    };
    L(N.prototype);
    l(N.prototype, c, function () {
      return this;
    });
    t.AsyncIterator = N;
    t.async = function (e, n, r, a, o = Promise) {
      const i = new N(u(e, n, r, a), o);
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
    L(C);
    l(C, s, "Generator");
    l(C, i, function () {
      return this;
    });
    l(C, "toString", function () {
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
    t.values = A;
    $.prototype = {
      constructor: $,
      reset: function (t) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = e;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = e;
        this.tryEntries.forEach(S);
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
        function a(r, a) {
          c.type = "throw";
          c.arg = t;
          n.next = r;
          if (a) {
            n.method = "next";
            n.arg = e;
          }
          return !!a;
        }
        for (let o = this.tryEntries.length - 1; o >= 0; --o) {
          const i = this.tryEntries[o];
          var c = i.completion;
          if (i.tryLoc === "root") {
            return a("end");
          }
          if (i.tryLoc <= this.prev) {
            const s = hasOwnProperty.call(i, "catchLoc");
            const l = hasOwnProperty.call(i, "finallyLoc");
            if (s && l) {
              if (this.prev < i.catchLoc) {
                return a(i.catchLoc, true);
              }
              if (this.prev < i.finallyLoc) {
                return a(i.finallyLoc);
              }
            } else if (s) {
              if (this.prev < i.catchLoc) {
                return a(i.catchLoc, true);
              }
            } else {
              if (!l) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < i.finallyLoc) {
                return a(i.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let n = this.tryEntries.length - 1; n >= 0; --n) {
          const a = this.tryEntries[n];
          if (
            a.tryLoc <= this.prev &&
            hasOwnProperty.call(a, "finallyLoc") &&
            this.prev < a.finallyLoc
          ) {
            var o = a;
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
          return ((this.method = "next"), (this.next = o.finallyLoc), v);
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
        return v;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.finallyLoc === e) {
            this.complete(n.completion, n.afterLoc);
            S(n);
            return v;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.tryLoc === e) {
            const r = n.completion;
            if (r.type === "throw") {
              var a = r.arg;
              S(n);
            }
            return a;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (t, n, r) {
        this.delegate = {
          iterator: A(t),
          resultName: n,
          nextLoc: r,
        };
        if (this.method === "next") {
          this.arg = e;
        }
        return v;
      },
    };
    return t;
  }
  function Nt(e, t) {
    if (e) {
      if (typeof e === "string") {
        return kt(e, t);
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
        return kt(e, t);
      }
      return undefined;
    }
  }
  function kt(e, t) {
    if (t == null || t > e.length) {
      t = e.length;
    }
    for (var n = 0, r = Array(t); n < t; n++) {
      r[n] = e[n];
    }
    return r;
  }
  function _t(e, t, n, r, a, o, i) {
    try {
      var c = e[o](i);
      var s = c.value;
    } catch (error) {
      return void n(error);
    }
    if (c.done) {
      t(s);
    } else {
      Promise.resolve(s).then(r, a);
    }
  }
  function Tt(e) {
    return function () {
      const t = this;
      const n = arguments;
      return new Promise((resolve, reject) => {
        const o = e.apply(t, n);
        function i(e) {
          _t(o, resolve, reject, i, c, "next", e);
        }
        function c(e) {
          _t(o, resolve, reject, i, c, "throw", e);
        }
        i(undefined);
      });
    };
  }
  function St(e) {
    const t = e.match(/\d+(\.\d+)?/g);
    if (t.length < 3 || t.length > 4) {
      throw new Error("Invalid RGB/RGBA input");
    }
    const n = parseInt(t[0], 10);
    const r = parseInt(t[1], 10);
    const a = parseInt(t[2], 10);
    const o = t[3] !== undefined ? parseFloat(t[3]) : 1;
    const i = (e) => e.toString(16).padStart(2, "0").toUpperCase();
    const c = i(n);
    const s = i(r);
    const l = i(a);
    const u = o < 1 ? i(Math.round(255 * o)) : "";
    return `#${c}${s}${l}${u}`;
  }
  function $t(e) {
    const t = e.match(/\d+(\.\d+)?/g);
    if (t.length < 3 || t.length > 4) {
      throw new Error("Invalid RGB/RGBA input");
    }
    let n;
    let r;
    const a = parseInt(t[0], 10) / 255;
    const o = parseInt(t[1], 10) / 255;
    const i = parseInt(t[2], 10) / 255;
    const c = t[3] !== undefined ? parseFloat(t[3]) : 1;
    const s = Math.max(a, o, i);
    const l = Math.min(a, o, i);
    let u = (s + l) / 2;
    if (s === l) {
      r = 0;
      n = 0;
    } else {
      const d = s - l;
      r = u > 0.5 ? d / (2 - s - l) : d / (s + l);
      switch (s) {
        case a:
          n = (o - i) / d + (o < i ? 6 : 0);
          break;
        case o:
          n = (i - a) / d + 2;
          break;
        case i:
          n = (a - o) / d + 4;
      }
      n /= 6;
    }
    n = Math.round(360 * n);
    r = Math.round(100 * r);
    u = Math.round(100 * u);
    const p = `hsl(${n}, ${r}%, ${u}%)`;
    const m = `hsla(${n}, ${r}%, ${u}%, ${c})`;
    if (c === 1) {
      return p;
    }
    return m;
  }
  function At(e) {
    const t = e.match(/\d+(\.\d+)?/g);
    if (t.length < 3 || t.length > 4) {
      throw new Error("Invalid RGB/RGBA input");
    }
    const n = parseInt(t[0], 10) / 255;
    const r = parseInt(t[1], 10) / 255;
    const a = parseInt(t[2], 10) / 255;
    const o = t[3] !== undefined ? parseFloat(t[3]) : 1;
    const i = Math.max(n, r, a);
    const c = Math.min(n, r, a);
    const s = i - c;
    let l = 0;
    let u = i === 0 ? 0 : s / i;
    let d = i;
    if (i !== c) {
      switch (i) {
        case n:
          l = (r - a) / s + (r < a ? 6 : 0);
          break;
        case r:
          l = (a - n) / s + 2;
          break;
        case a:
          l = (n - r) / s + 4;
      }
      l /= 6;
    }
    l = Math.round(360 * l);
    u = Math.round(100 * u);
    d = Math.round(100 * d);
    if (o === 1) {
      return `hsb(${l}, ${u}%, ${d}%)`;
    }
    return `hsba(${l}, ${u}%, ${d}%, ${o})`;
  }
  function Mt(e, colorFormat) {
    if (e && colorFormat !== "RGB") {
      return e.replace(/rgba?\([^)]+\)/g, (e) =>
        ((e, colorFormat_1) => {
          switch (colorFormat_1) {
            case "HEX":
              return St(e);
            case "HSL":
              return $t(e);
            case "HSB":
              return At(e);
            default:
              return e;
          }
        })(e, colorFormat),
      );
    }
    return e;
  }
  function Ot(e) {
    return It.apply(this, arguments);
  }
  function It() {
    return (It = Tt(
      Lt().mark(function e(t) {
        return Lt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.next = 2;
                  return Rt();
                case 2:
                  if (e.sent) {
                    e.next = 5;
                    break;
                  }
                  return e.abrupt("return", {
                    success: false,
                  });
                case 5:
                  e.prev = 5;
                  e.next = 8;
                  return navigator.clipboard.writeText(t);
                case 8:
                  return e.abrupt("return", {
                    success: true,
                  });
                case 11:
                  e.prev = 11;
                  e.t0 = e.catch(5);
                  return e.abrupt("return", {
                    success: false,
                  });
                case 14:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[5, 11]],
        );
      }),
    )).apply(this, arguments);
  }
  function Rt() {
    return jt.apply(this, arguments);
  }
  function jt() {
    return (jt = Tt(
      Lt().mark(function e() {
        return Lt().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                e.next = 2;
                return new Promise((resolve) => {
                  chrome.permissions.contains(
                    {
                      permissions: ["clipboardWrite"],
                    },
                    function (t) {
                      resolve(t);
                    },
                  );
                });
              case 2:
                if (e.sent) {
                  e.next = 7;
                  break;
                }
                e.next = 6;
                return new Promise((resolve) => {
                  chrome.permissions.request(
                    {
                      permissions: ["clipboardWrite"],
                    },
                    function (t) {
                      resolve(t);
                    },
                  );
                });
              case 6:
                return e.abrupt("return", e.sent);
              case 7:
                return e.abrupt("return", true);
              case 8:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function Bt(e) {
    if (e) {
      if (e === 1) {
        return chrome.i18n.getMessage("EDIT_COUNT_ONE");
      }
      return chrome.i18n.getMessage("EDIT_COUNT_OTHER", [String(e)]);
    }
    return chrome.i18n.getMessage("EDIT_COUNT_NONE");
  }
  function Pt(e) {
    const t = document.createElement("div");
    t.className = "shortcut-list";
    for (const a of e) {
      const o = document.createElement("span");
      o.className = "shortcut-name";
      o.textContent = a.name;
      const i = document.createElement("span");
      i.className = "shortcut-keys";
      i.textContent = a.keys;
      t.appendChild(o);
      t.appendChild(i);
    }
    return t;
  }
  function Dt(e, t = null) {
    if (!e) {
      return e;
    }
    let n = e;
    const r = [];
    const a = [];
    return (n = (n = (n = (n = (n = (n = (n = n.replace(
      /url\((['"]?)(.*?)\1\)/g,
      (e, n, a) => {
        let o = a;
        if (
          t &&
          !a.startsWith("data:") &&
          !a.startsWith("http://") &&
          !a.startsWith("https://") &&
          !a.startsWith("//")
        ) {
          try {
            o = new URL(a, t).href;
          } catch (e) {
            o = a;
          }
        }
        const i = String(o).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        const c = String(a).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
        const s = `url(<a href="${i}" target="_blank" class="link preview-link">${c}</a>)`;
        r.push(s);
        return `__LINK__${r.length - 1}__`;
      },
    )).replace(/var\(\s*(--[\w-]+)/g, (e, t) => {
      a.push(t);
      return `var(__VAR__${a.length - 1}__`;
    })).replace(
      /(["'])(?:(?=(\\?))\2.)*?\1/g,
      (e) => `<span class="string">${e}</span>`,
    )).replace(
      /\b(\d+(\.\d+)?(px|em|rem|%|s|ms)?)\b/g,
      (e) => `<span class="number">${e}</span>`,
    )).replace(
      /\b(ease-in-out|ease-in|ease-out|step-start|step-end|flex-start|flex-end|row-reverse|column-reverse|wrap-reverse|inline-block|inline-flex|inline-grid|space-between|space-around|space-evenly|border-box|content-box|no-repeat|not-allowed|pre-wrap|pre-line|break-word|break-all|keep-all|list-item|auto|inherit|initial|unset|none|block|flex|grid|inline|inset|rgb|rgba|hsl|hsla|start|end|center|stretch|baseline|row|column|wrap|nowrap|normal|left|right|top|bottom|absolute|relative|fixed|sticky|static|hidden|visible|scroll|collapse|solid|dashed|dotted|double|uppercase|lowercase|capitalize|bold|bolder|lighter|italic|oblique|table|contents|repeat|cover|contain|pointer|move|grab|grabbing|default|wait|transparent|currentColor|ease|linear|middle|sub|super|pre)\b/g,
      (e) => `<span class="keyword">${e}</span>`,
    )).replace(/__LINK__(\d+)__/g, (e, t) => r[parseInt(t, 10)])).replace(
      /__VAR__(\d+)__/g,
      (e, t) => `<span class="variable">${a[parseInt(t, 10)]}</span>`,
    ));
  }
  function Ut(e) {
    return String(e || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\S+/g, (e) => {
        if (e.includes("[")) {
          return e.replace(
            /(\[)([^\]]+)(\])/g,
            '$1<span class="string">$2</span>$3',
          );
        }
        return e.replace(
          /(-)(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)\b/g,
          '$1<span class="number">$2</span>',
        );
      });
  }
  function Ht(e) {
    Ht =
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
    return Ht(e);
  }
  function Ft(e, t) {
    return (
      ((e) => {
        if (Array.isArray(e)) {
          return e;
        }
      })(e) ||
      ((e, t) => {
        let n =
          e == null
            ? null
            : (typeof Symbol !== "undefined" && e[Symbol.iterator]) ||
              e["@@iterator"];
        if (n != null) {
          let r;
          let a;
          let o;
          let i;
          const c = [];
          let s = true;
          let l = false;
          try {
            o = (n = n.call(e)).next;
            if (t === 0) {
              if (Object(n) !== n) {
                return;
              }
              s = false;
            } else {
              for (
                ;
                !(s = (r = o.call(n)).done) &&
                (c.push(r.value), c.length !== t);
                s = true
              );
            }
          } catch (error) {
            l = true;
            a = error;
          } finally {
            try {
              if (
                !s &&
                n.return != null &&
                ((i = n.return()), Object(i) !== i)
              ) {
                return;
              }
            } finally {
              if (l) {
                throw a;
              }
            }
          }
          return c;
        }
      })(e, t) ||
      Vt(e, t) ||
      (() => {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function Gt() {
    Gt = function () {
      return t;
    };
    let e;
    var t = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const a =
      Object.defineProperty ||
      ((e, t, n) => {
        e[t] = n.value;
      });
    const o = typeof Symbol === "function" ? Symbol : {};
    const i = o.iterator || "@@iterator";
    const c = o.asyncIterator || "@@asyncIterator";
    const s = o.toStringTag || "@@toStringTag";
    function l(e, t, n) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      l({}, "");
    } catch (e) {
      l = function (e, t, n) {
        return (e[t] = n);
      };
    }
    function u(e, t, n, r) {
      const o = t && t.prototype instanceof g ? t : g;
      const i = Object.create(o.prototype);
      const c = new $(r || []);
      a(i, "_invoke", {
        value: k(e, n, c),
      });
      return i;
    }
    function d(e, t, n) {
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
    t.wrap = u;
    var p = "suspendedStart";
    var m = "suspendedYield";
    var f = "executing";
    var h = "completed";
    var v = {};
    function g() {}
    function y() {}
    function b() {}
    let w = {};
    l(w, i, function () {
      return this;
    });
    const E =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(A([])));
    if (E && E !== Object.prototype && hasOwnProperty.call(E, i)) {
      w = E;
    }
    const C = (b.prototype = g.prototype = Object.create(w));
    function L(e) {
      ["next", "throw", "return"].forEach((t) => {
        l(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function N(e, t) {
      function n(a, o, i, c) {
        const s = d(e[a], e, o);
        if (s.type !== "throw") {
          const l = s.arg;
          const u = l.value;
          if (u && Ht(u) == "object" && hasOwnProperty.call(u, "__await")) {
            return t.resolve(u.__await).then(
              (e) => {
                n("next", e, i, c);
              },
              (e) => {
                n("throw", e, i, c);
              },
            );
          }
          return t.resolve(u).then(
            (e) => {
              l.value = e;
              i(l);
            },
            (e) => n("throw", e, i, c),
          );
        }
        c(s.arg);
      }
      let o;
      a(this, "_invoke", {
        value: function (e, r) {
          function a() {
            return new t(function (t, a) {
              n(e, r, t, a);
            });
          }
          return (o = o ? o.then(a, a) : a());
        },
      });
    }
    function k(t, n, r) {
      let a = p;
      return function (o, i) {
        if (a === f) {
          throw Error("Generator is already running");
        }
        if (a === h) {
          if (o === "throw") {
            throw i;
          }
          return {
            value: e,
            done: true,
          };
        }
        r.method = o;
        for (r.arg = i; ;) {
          const c = r.delegate;
          if (c) {
            const s = _(c, r);
            if (s) {
              if (s === v) {
                continue;
              }
              return s;
            }
          }
          if (r.method === "next") {
            r.sent = r._sent = r.arg;
          } else if (r.method === "throw") {
            if (a === p) {
              a = h;
              throw r.arg;
            }
            r.dispatchException(r.arg);
          } else {
            if (r.method === "return") {
              r.abrupt("return", r.arg);
            }
          }
          a = f;
          const l = d(t, n, r);
          if (l.type === "normal") {
            a = r.done ? h : m;
            if (l.arg === v) {
              continue;
            }
            return {
              value: l.arg,
              done: r.done,
            };
          }
          if (l.type === "throw") {
            a = h;
            r.method = "throw";
            r.arg = l.arg;
          }
        }
      };
    }
    function _(t, n) {
      const n_method = n.method;
      const a = t.iterator[n_method];
      if (a === e) {
        n.delegate = null;
        if (
          !(
            n_method === "throw" &&
            t.iterator.return &&
            ((n.method = "return"), (n.arg = e), _(t, n), n.method === "throw")
          )
        ) {
          if (n_method !== "return") {
            n.method = "throw";
            n.arg = new TypeError(
              `The iterator does not provide a '${n_method}' method`,
            );
          }
        }
        return v;
      }
      const o = d(a, t.iterator, n.arg);
      if (o.type === "throw") {
        n.method = "throw";
        n.arg = o.arg;
        n.delegate = null;
        return v;
      }
      const o_arg = o.arg;
      if (o_arg) {
        if (o_arg.done) {
          return (
            (n[t.resultName] = o_arg.value),
            (n.next = t.nextLoc),
            n.method !== "return" && ((n.method = "next"), (n.arg = e)),
            (n.delegate = null),
            v
          );
        }
        return o_arg;
      }
      return (
        (n.method = "throw"),
        (n.arg = new TypeError("iterator result is not an object")),
        (n.delegate = null),
        v
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
    function S(e) {
      const t = e.completion || {};
      t.type = "normal";
      delete t.arg;
      e.completion = t;
    }
    function $(e) {
      this.tryEntries = [
        {
          tryLoc: "root",
        },
      ];
      e.forEach(T, this);
      this.reset(true);
    }
    function A(t) {
      if (t || t === "") {
        const n = t[i];
        if (n) {
          return n.call(t);
        }
        if (typeof t.next === "function") {
          return t;
        }
        if (!isNaN(t.length)) {
          let a = -1;
          const o = function n() {
            while (++a < t.length) {
              if (hasOwnProperty.call(t, a)) {
                n.value = t[a];
                n.done = false;
                return n;
              }
            }
            n.value = e;
            n.done = true;
            return n;
          };
          return (o.next = o);
        }
      }
      throw new TypeError(`${Ht(t)} is not iterable`);
    }
    y.prototype = b;
    a(C, "constructor", {
      value: b,
      configurable: true,
    });
    a(b, "constructor", {
      value: y,
      configurable: true,
    });
    y.displayName = l(b, s, "GeneratorFunction");
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
        l(e, s, "GeneratorFunction");
      }
      e.prototype = Object.create(C);
      return e;
    };
    t.awrap = function (e) {
      return {
        __await: e,
      };
    };
    L(N.prototype);
    l(N.prototype, c, function () {
      return this;
    });
    t.AsyncIterator = N;
    t.async = function (e, n, r, a, o = Promise) {
      const i = new N(u(e, n, r, a), o);
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
    L(C);
    l(C, s, "Generator");
    l(C, i, function () {
      return this;
    });
    l(C, "toString", function () {
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
    t.values = A;
    $.prototype = {
      constructor: $,
      reset: function (t) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = e;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = e;
        this.tryEntries.forEach(S);
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
        function a(r, a) {
          c.type = "throw";
          c.arg = t;
          n.next = r;
          if (a) {
            n.method = "next";
            n.arg = e;
          }
          return !!a;
        }
        for (let o = this.tryEntries.length - 1; o >= 0; --o) {
          const i = this.tryEntries[o];
          var c = i.completion;
          if (i.tryLoc === "root") {
            return a("end");
          }
          if (i.tryLoc <= this.prev) {
            const s = hasOwnProperty.call(i, "catchLoc");
            const l = hasOwnProperty.call(i, "finallyLoc");
            if (s && l) {
              if (this.prev < i.catchLoc) {
                return a(i.catchLoc, true);
              }
              if (this.prev < i.finallyLoc) {
                return a(i.finallyLoc);
              }
            } else if (s) {
              if (this.prev < i.catchLoc) {
                return a(i.catchLoc, true);
              }
            } else {
              if (!l) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < i.finallyLoc) {
                return a(i.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let n = this.tryEntries.length - 1; n >= 0; --n) {
          const a = this.tryEntries[n];
          if (
            a.tryLoc <= this.prev &&
            hasOwnProperty.call(a, "finallyLoc") &&
            this.prev < a.finallyLoc
          ) {
            var o = a;
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
          return ((this.method = "next"), (this.next = o.finallyLoc), v);
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
        return v;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.finallyLoc === e) {
            this.complete(n.completion, n.afterLoc);
            S(n);
            return v;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.tryLoc === e) {
            const r = n.completion;
            if (r.type === "throw") {
              var a = r.arg;
              S(n);
            }
            return a;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (t, n, r) {
        this.delegate = {
          iterator: A(t),
          resultName: n,
          nextLoc: r,
        };
        if (this.method === "next") {
          this.arg = e;
        }
        return v;
      },
    };
    return t;
  }
  function qt(e) {
    return (
      ((e) => {
        if (Array.isArray(e)) {
          return zt(e);
        }
      })(e) ||
      ((e) => {
        if (
          (typeof Symbol !== "undefined" && e[Symbol.iterator] != null) ||
          e["@@iterator"] != null
        ) {
          return Array.from(e);
        }
      })(e) ||
      Vt(e) ||
      (() => {
        throw new TypeError(
          "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function Wt(e, t) {
    let n =
      (typeof Symbol !== "undefined" && e[Symbol.iterator]) || e["@@iterator"];
    if (!n) {
      if (
        Array.isArray(e) ||
        (n = Vt(e)) ||
        (t && e && typeof e.length === "number")
      ) {
        if (n) {
          e = n;
        }
        let r = 0;
        const a = function () {};
        return {
          s: a,
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
          f: a,
        };
      }
      throw new TypeError(
        "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
      );
    }
    let o;
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
        o = e;
      },
      f: function () {
        try {
          if (!(i || n.return == null)) {
            n.return();
          }
        } finally {
          if (c) {
            throw o;
          }
        }
      },
    };
  }
  function Vt(e, t) {
    if (e) {
      if (typeof e === "string") {
        return zt(e, t);
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
        return zt(e, t);
      }
      return undefined;
    }
  }
  function zt(e, t) {
    if (t == null || t > e.length) {
      t = e.length;
    }
    for (var n = 0, r = Array(t); n < t; n++) {
      r[n] = e[n];
    }
    return r;
  }
  function Yt(e, t, n, r, a, o, i) {
    try {
      var c = e[o](i);
      var s = c.value;
    } catch (error) {
      return void n(error);
    }
    if (c.done) {
      t(s);
    } else {
      Promise.resolve(s).then(r, a);
    }
  }
  function Kt(e) {
    return function () {
      const t = this;
      const n = arguments;
      return new Promise((resolve, reject) => {
        const o = e.apply(t, n);
        function i(e) {
          Yt(o, resolve, reject, i, c, "next", e);
        }
        function c(e) {
          Yt(o, resolve, reject, i, c, "throw", e);
        }
        i(undefined);
      });
    };
  }
  var Xt = null;
  var Zt = null;
  var Qt = null;
  var Jt = null;
  var en = null;
  var tn = [];
  var nn = -1;
  var rn = null;
  var an = "";
  var on = 0;
  var cn = 0;
  var sn = 0;
  var ln = null;
  var un = new Map();
  var dn = new Map();
  var pn = ["inherit", "initial", "unset", "revert", "revert-layer"];
  var mn = {
    display: [
      "block",
      "inline",
      "inline-block",
      "flex",
      "inline-flex",
      "grid",
      "inline-grid",
      "none",
      "contents",
      "flow-root",
      "table",
      "table-row",
      "table-cell",
      "list-item",
    ],
    position: ["static", "relative", "absolute", "fixed", "sticky"],
    "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
    "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
    "align-items": [
      "stretch",
      "flex-start",
      "flex-end",
      "center",
      "baseline",
      "start",
      "end",
      "self-start",
      "self-end",
    ],
    "align-self": [
      "auto",
      "stretch",
      "flex-start",
      "flex-end",
      "center",
      "baseline",
    ],
    "align-content": [
      "stretch",
      "flex-start",
      "flex-end",
      "center",
      "space-between",
      "space-around",
      "space-evenly",
    ],
    "justify-content": [
      "flex-start",
      "flex-end",
      "center",
      "space-between",
      "space-around",
      "space-evenly",
      "start",
      "end",
      "stretch",
    ],
    "justify-items": ["stretch", "start", "end", "center"],
    "justify-self": ["auto", "stretch", "start", "end", "center"],
    "place-items": ["center", "start", "end", "stretch"],
    "place-content": [
      "center",
      "start",
      "end",
      "stretch",
      "space-between",
      "space-around",
      "space-evenly",
    ],
    "text-align": ["left", "right", "center", "justify", "start", "end"],
    "font-weight": [
      "normal",
      "bold",
      "bolder",
      "lighter",
      "100",
      "200",
      "300",
      "400",
      "500",
      "600",
      "700",
      "800",
      "900",
    ],
    "font-style": ["normal", "italic", "oblique"],
    "text-transform": ["none", "capitalize", "uppercase", "lowercase"],
    "text-decoration": ["none", "underline", "overline", "line-through"],
    "text-decoration-line": ["none", "underline", "overline", "line-through"],
    "white-space": [
      "normal",
      "nowrap",
      "pre",
      "pre-wrap",
      "pre-line",
      "break-spaces",
    ],
    "word-break": ["normal", "break-all", "keep-all", "break-word"],
    "overflow-wrap": ["normal", "break-word", "anywhere"],
    overflow: ["visible", "hidden", "scroll", "auto", "clip"],
    "overflow-x": ["visible", "hidden", "scroll", "auto", "clip"],
    "overflow-y": ["visible", "hidden", "scroll", "auto", "clip"],
    cursor: [
      "auto",
      "default",
      "pointer",
      "text",
      "move",
      "not-allowed",
      "grab",
      "grabbing",
      "wait",
      "help",
      "crosshair",
      "zoom-in",
      "zoom-out",
      "none",
    ],
    "box-sizing": ["content-box", "border-box"],
    visibility: ["visible", "hidden", "collapse"],
    "pointer-events": ["auto", "none"],
    "object-fit": ["fill", "contain", "cover", "none", "scale-down"],
    "object-position": ["top", "bottom", "left", "right", "center"],
    "background-repeat": [
      "repeat",
      "repeat-x",
      "repeat-y",
      "no-repeat",
      "space",
      "round",
    ],
    "background-size": ["auto", "cover", "contain"],
    "background-position": ["top", "bottom", "left", "right", "center"],
    "vertical-align": [
      "baseline",
      "top",
      "middle",
      "bottom",
      "sub",
      "super",
      "text-top",
      "text-bottom",
    ],
    "list-style-type": [
      "none",
      "disc",
      "circle",
      "square",
      "decimal",
      "lower-alpha",
      "upper-alpha",
      "lower-roman",
      "upper-roman",
    ],
    "border-style": [
      "none",
      "solid",
      "dashed",
      "dotted",
      "double",
      "groove",
      "ridge",
      "inset",
      "outset",
    ],
    float: ["none", "left", "right"],
    clear: ["none", "left", "right", "both"],
    resize: ["none", "both", "horizontal", "vertical"],
    "user-select": ["auto", "none", "text", "all"],
    "writing-mode": ["horizontal-tb", "vertical-rl", "vertical-lr"],
    direction: ["ltr", "rtl"],
    isolation: ["auto", "isolate"],
    "mix-blend-mode": [
      "normal",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-dodge",
      "color-burn",
      "hard-light",
      "soft-light",
      "difference",
      "exclusion",
      "hue",
      "saturation",
      "color",
      "luminosity",
    ],
    width: ["auto", "fit-content", "max-content", "min-content"],
    height: ["auto", "fit-content", "max-content", "min-content"],
    "flex-basis": [
      "auto",
      "content",
      "fit-content",
      "max-content",
      "min-content",
    ],
    "flex-grow": ["0", "1"],
    "flex-shrink": ["0", "1"],
  };
  var fn = null;
  function hn() {
    return vn.apply(this, arguments);
  }
  function vn() {
    vn = Kt(
      Gt().mark(function e() {
        let t;
        let n;
        let r;
        const a = arguments;
        return Gt().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                t = a.length > 0 && a[0] !== undefined && a[0];
                n = a.length > 1 && a[1] !== undefined ? a[1] : {};
                r = a.length > 2 && a[2] !== undefined ? a[2] : "tab-1";
                Qt = a.length > 3 && a[3] !== undefined ? a[3] : null;
                yn();
                gn(t, n);
                e.next = 9;
                return bn();
              case 9:
                xn();
                ((e) => {
                  let t;
                  const n = new MutationObserver(
                    (() => {
                      const e = Kt(
                        Gt().mark(function e(t) {
                          let n;
                          let r;
                          let a;
                          let o;
                          let i;
                          return Gt().wrap(function (e) {
                            while (true) {
                              switch ((e.prev = e.next)) {
                                case 0:
                                  n = Wt(t);
                                  try {
                                    for (n.s(); !(r = n.n()).done;) {
                                      if (
                                        (a = r.value).type === "attributes" &&
                                        a.attributeName === "class"
                                      ) {
                                        if (
                                          !(o = a.target).classList.contains(
                                            "hidden",
                                          )
                                        ) {
                                          if ((i = o.dataset.tab) === "tab-1") {
                                            pr();
                                          }
                                          if (i === "tab-2") {
                                            dr();
                                            setTimeout(() => {
                                              mr();
                                              pr();
                                            }, 0);
                                          }
                                        }
                                      }
                                    }
                                  } catch (error) {
                                    n.e(error);
                                  } finally {
                                    n.f();
                                  }
                                case 2:
                                case "end":
                                  return e.stop();
                              }
                            }
                          }, e);
                        }),
                      );
                      return function (t) {
                        return e.apply(this, arguments);
                      };
                    })(),
                  );
                  const r = Wt(e);
                  try {
                    for (r.s(); !(t = r.n()).done;) {
                      const a = t.value;
                      n.observe(a, {
                        attributes: true,
                      });
                    }
                  } catch (error) {
                    r.e(error);
                  } finally {
                    r.f();
                  }
                })(document.querySelectorAll("[data-tab]"));
                if (r && r !== "tab-1") {
                  Ln(r);
                }
              case 12:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    );
    return vn.apply(this, arguments);
  }
  function gn(e, t) {
    const n = document.getElementById("edit_css-empty-shortcuts");
    if (n) {
      const r = e ? "⌘" : "Ctrl";
      const a = e ? "⇧" : "Shift";
      const o = [
        {
          name: chrome.i18n.getMessage("SHORTCUT_TOGGLE_RULER"),
          keys: t._execute_action,
        },
        {
          name: chrome.i18n.getMessage("SHORTCUT_UNDO"),
          keys: `${r}Z`,
        },
        {
          name: chrome.i18n.getMessage("SHORTCUT_REDO"),
          keys: `${a}${r}Z`,
        },
        {
          name: chrome.i18n.getMessage("SHORTCUT_COPY"),
          keys: `${r}C`,
        },
        {
          name: chrome.i18n.getMessage("SHORTCUT_PASTE"),
          keys: `${r}V`,
        },
      ].filter((e) => e.keys);
      n.replaceChildren(Pt(o));
    }
  }
  function yn() {
    const e = document.querySelectorAll("[data-localize]");
    if (e) {
      for (const r of e) {
        r.innerHTML = chrome.i18n.getMessage(r.dataset.localize);
      }
    }
    const a = document.querySelectorAll("[data-placeholder]");
    if (a) {
      for (const c of a) {
        c.placeholder = chrome.i18n.getMessage(c.dataset.placeholder);
      }
    }
  }
  function bn() {
    return wn.apply(this, arguments);
  }
  function wn() {
    wn = Kt(
      Gt().mark(function e() {
        let t;
        let n;
        let r;
        let c;
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  t = null;
                  n = new URLSearchParams(window.location.search);
                  if ((r = parseInt(n.get("tabId"), 10))) {
                    t = parseInt(r, 10);
                  }
                  if (t && !isNaN(t)) {
                    e.next = 15;
                    break;
                  }
                  e.prev = 5;
                  e.next = 8;
                  return i.tabsQuery({
                    active: true,
                    currentWindow: true,
                  });
                case 8:
                  c = e.sent;
                  t = c[0]?.id ?? null;
                  e.next = 15;
                  break;
                case 12:
                  e.prev = 12;
                  e.t0 = e.catch(5);
                  t = null;
                case 15:
                  Xt = t;
                case 16:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[5, 12]],
        );
      }),
    );
    return wn.apply(this, arguments);
  }
  function xn() {
    const n = document.querySelector(".edit-tab-bar");
    if (n) {
      n.addEventListener("click", function (e) {
        let t;
        const n = e.target.closest(".edit-tab-btn");
        if (n) {
          const r = n.dataset.editTab;
          Ln(r);
          if (!((t = Qt) === null || t === undefined)) {
            t(r);
          }
        }
      });
    }
    const r = document.getElementById("edit_element-list");
    r?.addEventListener("click", $r);
    r?.addEventListener("mouseover", Mr);
    r?.addEventListener("mouseout", Ir);
    document.getElementById("edit_revert-all")?.addEventListener("click", Nn);
    document.getElementById("edit-element-name")?.addEventListener("click", _n);
  }
  chrome.runtime.onMessage.addListener(function (e, t, n) {
    if (e.target !== "editor_panel") {
      return;
    }
    if (t.tab?.id) {
      Xt = t.tab.id;
    }
    switch (e.action) {
      case "clear":
        qn();
        Sn();
        break;
      case "page_updated":
        ((e) => {
          if (e === Xt) {
            qn();
            Sn();
            n = document.getElementById("edit_element-list-container");
            r = document.getElementById("edit_element-list");
            a = document.getElementById("edit_no-results");
            r.innerHTML = "";
            a.classList.remove("hidden");
            n.classList.add("hidden");
            if (
              !(
                (t = document.getElementById("edit_changes-name")) === null ||
                t === undefined
              )
            ) {
              t.classList.add("hidden");
            }
          }
          var t;
          var n;
          var r;
          var a;
        })(e.tabId);
        break;
      case "content_script_ready":
        if (t.tab?.id) {
          ((e) => {
            if (Zt) {
              try {
                Zt.disconnect();
              } catch (e) {}
              Zt = null;
            }
            try {
              (Zt = chrome.tabs.connect(e, {
                name: `sidepanel_${e}`,
              })).onDisconnect.addListener(function () {
                Zt = null;
                window.close();
              });
            } catch (e) {
              Zt = null;
            }
          })((Xt = t.tab.id));
        }
        break;
      case "close_side_panel":
        window.close();
        break;
      case "refresh_changes":
        if (
          !document
            .querySelector('[data-tab="tab-changes"]')
            ?.classList.contains("hidden")
        ) {
          mr();
        }
    }
  });
  document.addEventListener("selectionchange", function () {
    const n = window.getSelection();
    let r = null;
    if (n && n.rangeCount > 0) {
      const o = n.anchorNode;
      const i = o && (o.nodeType === 1 ? o : o.parentElement);
      if (i?.closest?.(".edit-css-editor")) {
        r = i.closest(".line");
      }
    }
    if (r === fn) {
      return;
    }
    fn?.classList.remove("is-current-line");
    fn = r;
    fn?.classList.add("is-current-line");
  });
  document.addEventListener(
    "scroll",
    function (e) {
      if (!rr()) {
        return;
      }
      if (en.contains(e.target)) {
        return;
      }
      if (Date.now() - sn < 150) {
        return void Qn();
      }
      er();
    },
    true,
  );
  var En = 0;
  function Cn() {
    return document.scrollingElement || document.documentElement;
  }
  function Ln(e) {
    const r = document.querySelector(".edit-tab-bar .edit-tab-btn.active");
    if (r?.dataset.editTab === "tab-1") {
      En = Cn().scrollTop;
      if (fn) {
        fn.classList.remove("is-current-line");
        fn = null;
      }
    }
    const a = document.querySelector(".edit-tab-bar");
    if (a != null) {
      a.querySelectorAll(".edit-tab-btn").forEach((t) =>
        t.classList.toggle("active", t.dataset.editTab === e),
      );
    }
    document.querySelectorAll("#edit-view [data-tab]").forEach((t) => {
      t.classList.toggle("hidden", t.dataset.tab !== e);
    });
    document
      .getElementById("edit-element-name")
      ?.classList.toggle("tab-hidden", e !== "tab-1");
    document
      .getElementById("edit_changes-name")
      ?.classList.toggle("tab-hidden", e !== "tab-2");
    if (e === "tab-1") {
      requestAnimationFrame(() => {
        Cn().scrollTop = En;
      });
    }
  }
  function Nn() {
    return kn.apply(this, arguments);
  }
  function kn() {
    return (kn = Kt(
      Gt().mark(function e() {
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.next = 2;
                  return Et.confirm({
                    title: chrome.i18n.getMessage(
                      "DIALOG_TITLE_CLEAR_ALL_CHANGES",
                    ),
                    body: chrome.i18n.getMessage("CONFIRM_CLEAR_ALL_CHANGES"),
                  });
                case 2:
                  if (e.sent) {
                    e.next = 5;
                    break;
                  }
                  return e.abrupt("return");
                case 5:
                  e.prev = 5;
                  e.next = 8;
                  return i
                    .sendMessageToTab(Xt, {
                      target: "rule_editor",
                      action: "revert_all_rule_changes",
                    })
                    .catch(() => {});
                case 8:
                  e.next = 10;
                  return i.sendMessageToTab(Xt, {
                    target: "editor",
                    action: "clear_changes",
                  });
                case 10:
                  if (e.sent.success) {
                    mr();
                  }
                  e.next = 16;
                  break;
                case 14:
                  e.prev = 14;
                  e.t0 = e.catch(5);
                case 16:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[5, 14]],
        );
      }),
    )).apply(this, arguments);
  }
  function _n(e) {
    return Tn.apply(this, arguments);
  }
  function Tn() {
    return (Tn = Kt(
      Gt().mark(function e(t) {
        let n;
        let r;
        let a;
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (!(n = t.target.closest(".copy-button"))) {
                    e.next = 10;
                    break;
                  }
                  if ((r = n.dataset.copyTarget)) {
                    e.next = 5;
                    break;
                  }
                  return e.abrupt("return");
                case 5:
                  e.next = 7;
                  return Ot(r);
                case 7:
                  if (e.sent.success) {
                    n.classList.add("no-events", "copy-success");
                    setTimeout(
                      () => n.classList.remove("no-events", "copy-success"),
                      1000,
                    );
                  }
                  return e.abrupt("return");
                case 10:
                  if (!t.target.closest("[data-selector]")) {
                    e.next = 23;
                    break;
                  }
                  e.prev = 11;
                  e.next = 14;
                  return i.sendMessage({
                    target: "background",
                    action: "go_to_tab",
                    tabId: Xt,
                  });
                case 14:
                  if ((a = e.sent) == null || !a.success) {
                    e.next = 18;
                    break;
                  }
                  e.next = 18;
                  return i.sendOptionalMessageToTab(Xt, {
                    target: "script",
                    action: "go_to_selected_element",
                  });
                case 18:
                  e.next = 23;
                  break;
                case 20:
                  e.prev = 20;
                  e.t0 = e.catch(11);
                case 23:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[11, 20]],
        );
      }),
    )).apply(this, arguments);
  }
  function Sn() {
    const e = document.getElementById("edit-element-name");
    if (e) {
      e.innerHTML = "";
    }
  }
  var $n = new WeakSet();
  var An = new WeakMap();
  function Mn(e) {
    return String(e)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function On(e) {
    const t = e.indexOf(":");
    if (t < 0) {
      return Mn(e);
    }
    const n = e.slice(0, t);
    let r = e.slice(t + 1);
    let a = "";
    const o = r.lastIndexOf(";");
    if (o !== -1 && r.slice(o + 1).trim() === "") {
      a = r.slice(o);
      r = r.slice(0, o);
    }
    return `<span class="property">${Mn(n)}</span>:${Dt(Mn(r))}${Mn(a)}`;
  }
  function In(e) {
    if (e) {
      const t = e.children.length || 1;
      e.style.setProperty("--max-line-digits", String(String(t).length));
    }
  }
  function Rn(e) {
    return qt(e.children)
      .map((e) => e.textContent)
      .join("\n");
  }
  function jn(e) {
    const t = window.getSelection();
    if (!t || t.rangeCount === 0) {
      return null;
    }
    const n = t.getRangeAt(0);
    if (!e.contains(n.endContainer)) {
      return null;
    }
    let r;
    let a = 0;
    const o = Wt(e.children);
    try {
      for (o.s(); !(r = o.n()).done;) {
        const i = r.value;
        if (i === n.endContainer || i.contains(n.endContainer)) {
          const c = n.cloneRange();
          c.selectNodeContents(i);
          c.setEnd(n.endContainer, n.endOffset);
          return a + c.toString().length;
        }
        a += i.textContent.length + 1;
      }
    } catch (error) {
      o.e(error);
    } finally {
      o.f();
    }
    return a;
  }
  function Bn(e, t) {
    const n = window.getSelection();
    const r = document.createRange();
    const a = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    for (var o = a.nextNode(), i = null, c = t; o;) {
      i = o;
      if (o.length >= c) {
        r.setStart(o, c);
        r.collapse(true);
        n.removeAllRanges();
        return void n.addRange(r);
      }
      c -= o.length;
      o = a.nextNode();
    }
    r.setStart(i || e, i ? i.length : 0);
    r.collapse(true);
    n.removeAllRanges();
    n.addRange(r);
  }
  function Pn(e, t) {
    if (t != null) {
      const n = qt(e.children);
      if (n.length !== 0) {
        let r;
        let a = t;
        const o = Wt(n);
        try {
          for (o.s(); !(r = o.n()).done;) {
            const i = r.value;
            const c = i.textContent.length;
            if (a <= c) {
              return void Bn(i, a);
            }
            a -= c + 1;
          }
        } catch (error) {
          o.e(error);
        } finally {
          o.f();
        }
        const s = n[n.length - 1];
        Bn(s, s.textContent.length);
      }
    }
  }
  var Dn = 0;
  function Un() {
    return Hn.apply(this, arguments);
  }
  function Hn() {
    return (Hn = Kt(
      Gt().mark(function e() {
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  e.next = 3;
                  return i.sendMessageToTab(Xt, {
                    target: "script",
                    action: "enable_cross_origin_styles",
                  });
                case 3:
                  e.next = 7;
                  break;
                case 5:
                  e.prev = 5;
                  e.t0 = e.catch(0);
                case 7:
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
    )).apply(this, arguments);
  }
  var Fn = false;
  function Gn(e) {
    e.preventDefault();
    if (!Fn) {
      Fn = true;
      chrome.permissions.request(
        {
          origins: ["<all_urls>"],
        },
        function (e) {
          chrome.runtime.lastError;
          Fn = false;
          if (e) {
            Un();
          }
        },
      );
    }
  }
  function qn() {
    const e = document.getElementById("edit_css-sections");
    const t = document.getElementById("edit_css-body");
    const n = document.getElementById("edit_css-empty");
    if (e) {
      e.replaceChildren();
    }
    if (t != null) {
      t.classList.add("hidden");
    }
    if (n != null) {
      n.classList.remove("hidden");
    }
  }
  function Wn() {
    if (Jt) {
      return Jt;
    }
    const e = new Set();
    const style = document.createElement("span").style;
    for (const n in style) {
      if (
        typeof style[n] === "string" &&
        n !== "cssText" &&
        !/^(webkit|moz|ms|o)[A-Z]/.test(n)
      ) {
        const r =
          n === "cssFloat"
            ? "float"
            : n.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
        e.add(r);
      }
    }
    return (Jt = qt(e).sort());
  }
  function Vn(e, t, n = 10) {
    const r = t.toLowerCase();
    if (!r) {
      return e.slice(0, n);
    }
    let a;
    const o = [];
    const i = [];
    const c = Wt(e);
    try {
      for (c.s(); !(a = c.n()).done;) {
        const s = a.value;
        const l = s.toLowerCase().indexOf(r);
        if (l === 0) {
          o.push(s);
        } else if (l > 0) {
          i.push(s);
        }
      }
    } catch (error) {
      c.e(error);
    } finally {
      c.f();
    }
    return [...o, ...i].slice(0, n);
  }
  function zn() {
    return Yn.apply(this, arguments);
  }
  function Yn() {
    return (Yn = Kt(
      Gt().mark(function e() {
        let t;
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (!ln) {
                    e.next = 2;
                    break;
                  }
                  return e.abrupt("return", ln);
                case 2:
                  e.prev = 2;
                  e.next = 5;
                  return i.sendMessageToTab(Xt, {
                    target: "script",
                    action: "get_page_classes",
                  });
                case 5:
                  t = e.sent;
                  ln = Array.isArray(t?.classes) ? t.classes : [];
                  e.next = 12;
                  break;
                case 9:
                  e.prev = 9;
                  e.t0 = e.catch(2);
                  ln = [];
                case 12:
                  return e.abrupt("return", ln);
                case 13:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[2, 9]],
        );
      }),
    )).apply(this, arguments);
  }
  function Kn(e, t) {
    for (
      var r = Rn(e), a = jn(e) ?? r.length, start = a;
      start > 0 && !/\s/.test(r[start - 1]);
    ) {
      start--;
    }
    for (var i = a; i < r.length && !/\s/.test(r[i]);) {
      i++;
    }
    const token = r.slice(start, i);
    if (!token) {
      return null;
    }
    const s = token.toLowerCase();
    const items = t
      .filter((e) => e.toLowerCase().startsWith(s) && e !== token)
      .slice(0, 50);
    if (items.length === 0) {
      return null;
    }
    return {
      kind: "class",
      token,
      start,
      end: i,
      items,
    };
  }
  function Xn() {
    return (Xn = Kt(
      Gt().mark(function e(t) {
        let n;
        let r;
        let a;
        return Gt().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                e.next = 2;
                return zn();
              case 2:
                n = e.sent;
                if ((r = Kn(t, n))) {
                  e.next = 6;
                  break;
                }
                return e.abrupt("return", er());
              case 6:
                a = r.token.toLowerCase();
                if (
                  r.items.length !== 0 &&
                  (r.items.length !== 1 || r.items[0].toLowerCase() !== a)
                ) {
                  e.next = 9;
                  break;
                }
                return e.abrupt("return", er());
              case 9:
                rn = t;
                tn = r.items;
                an = a;
                on = r.start;
                cn = r.end;
                nn = 0;
                Jn();
              case 16:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function Zn() {
    en.replaceChildren();
    tn.forEach((e, t) => {
      const n = document.createElement("div");
      n.className = `css-autocomplete-item${t === nn ? " is-active" : ""}`;
      n.dataset.index = String(t);
      const r = an ? e.toLowerCase().indexOf(an) : -1;
      if (r < 0) {
        n.textContent = e;
      } else {
        if (r > 0) {
          n.appendChild(document.createTextNode(e.slice(0, r)));
        }
        const a = document.createElement("span");
        a.className = "css-autocomplete-match";
        a.textContent = e.slice(r, r + an.length);
        n.appendChild(a);
        const o = e.slice(r + an.length);
        if (o) {
          n.appendChild(document.createTextNode(o));
        }
      }
      en.appendChild(n);
    });
  }
  function Qn() {
    const e = window.getSelection();
    if (e && e.rangeCount !== 0) {
      let t = e.getRangeAt(0).getBoundingClientRect();
      if (!(t.width || t.height || t.top || t.left)) {
        const r = e.anchorNode;
        const a = r && (r.nodeType === 1 ? r : r.parentElement);
        const o = a?.closest?.(".line");
        if (o) {
          t = o.getBoundingClientRect();
        }
      }
      const { offsetWidth, offsetHeight } = en;
      let s = t.bottom + 2;
      if (s + offsetHeight > window.innerHeight - 4) {
        s = t.top - offsetHeight - 2;
      }
      const l = Math.max(
        4,
        Math.min(t.left, window.innerWidth - offsetWidth - 4),
      );
      en.style.left = `${l}px`;
      en.style.top = `${Math.max(4, s)}px`;
    }
  }
  function Jn() {
    if (!en) {
      (en = document.createElement("div")).className = "css-autocomplete";
      en.addEventListener("mousedown", function (e) {
        e.preventDefault();
        const t = e.target.closest(".css-autocomplete-item");
        if (t) {
          nn = Number(t.dataset.index);
          nr(rn);
        }
      });
      document.body.appendChild(en);
    }
    Zn();
    en.classList.add("is-open");
    sn = Date.now();
    Qn();
  }
  function er() {
    if (en) {
      en.classList.remove("is-open");
    }
    tn = [];
    nn = -1;
    rn = null;
  }
  function tr(e) {
    let t;
    if (tn.length) {
      nn = Math.max(0, Math.min(nn + e, tn.length - 1));
      Zn();
      if (
        !(
          (t = en.querySelector(".css-autocomplete-item.is-active")) === null ||
          t === undefined
        )
      ) {
        t.scrollIntoView({
          block: "center",
        });
      }
    }
  }
  function nr(e) {
    if (e && tn.length) {
      const t = tn[nn >= 0 ? nn : 0];
      const n = Rn(e);
      const r = n.slice(cn).startsWith(" ") ? t : `${t} `;
      ((e, t, n) => {
        $n.add(e);
        e.innerHTML = `<div class="line">${Ut(t) || "<br>"}</div>`;
        In(e);
        Pn(e, n);
        $n.delete(e);
      })(e, n.slice(0, on) + r + n.slice(cn), on + r.length);
      lr(e);
      er();
    }
  }
  function rr() {
    return en && en.classList.contains("is-open") && tn.length > 0;
  }
  function ar(e) {
    if (rr()) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          return void tr(1);
        case "ArrowUp":
          e.preventDefault();
          return void tr(-1);
        case "Enter":
        case "Tab":
          e.preventDefault();
          return void nr(e.currentTarget);
        case "Escape":
          e.preventDefault();
          return void er();
        case "ArrowLeft":
        case "ArrowRight":
        case "Home":
        case "End":
          return void er();
      }
    }
    if (e.metaKey || e.ctrlKey) {
      const t = e.key.toLowerCase();
      if (t !== "z" || e.shiftKey) {
        if ((t === "z" && e.shiftKey) || t === "y") {
          e.preventDefault();
          (function () {
            ir.apply(this, arguments);
          })(e.currentTarget);
        }
      } else {
        e.preventDefault();
        (function () {
          or.apply(this, arguments);
        })(e.currentTarget);
      }
    }
  }
  function or() {
    return (or = Kt(
      Gt().mark(function e() {
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  e.next = 3;
                  return i.sendMessageToTab(Xt, {
                    target: "editor",
                    action: "undo",
                  });
                case 3:
                  e.next = 7;
                  break;
                case 5:
                  e.prev = 5;
                  e.t0 = e.catch(0);
                case 7:
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
    )).apply(this, arguments);
  }
  function ir() {
    return (ir = Kt(
      Gt().mark(function e() {
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  e.next = 3;
                  return i.sendMessageToTab(Xt, {
                    target: "editor",
                    action: "redo",
                  });
                case 3:
                  e.next = 7;
                  break;
                case 5:
                  e.prev = 5;
                  e.t0 = e.catch(0);
                case 7:
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
    )).apply(this, arguments);
  }
  function cr(e) {
    const t = e.inputType || "";
    if (!(t !== "insertParagraph" && t !== "insertLineBreak")) {
      e.preventDefault();
    }
  }
  function sr({ currentTarget }) {
    if (currentTarget && !$n.has(currentTarget)) {
      const n = jn(currentTarget);
      $n.add(currentTarget);
      currentTarget.innerHTML = `<div class="line">${Ut(Rn(currentTarget)) || "<br>"}</div>`;
      In(currentTarget);
      Pn(currentTarget, n);
      $n.delete(currentTarget);
      lr(currentTarget);
      (function (currentTarget_1) {
        Xn.apply(this, arguments);
      })(currentTarget);
    }
  }
  function lr(e) {
    if (e) {
      const t = An.get(e);
      if (t) {
        clearTimeout(t);
      }
      const n = setTimeout(
        Kt(
          Gt().mark(function t() {
            let classes;
            let r;
            let a;
            return Gt().wrap(
              function (t) {
                while (true) {
                  switch ((t.prev = t.next)) {
                    case 0:
                      An.delete(e);
                      classes = Rn(e).replace(/\s+/g, " ").trim();
                      t.prev = 2;
                      t.next = 5;
                      return i.sendMessageToTab(Xt, {
                        target: "editor",
                        action: "set_element_classes",
                        data: {
                          classes,
                        },
                      });
                    case 5:
                      if ((r = t.sent) && typeof r.changeCount === "number") {
                        ur(r.changeCount);
                      }
                      if (
                        r &&
                        typeof r.selector === "string" &&
                        (a = document.querySelector(
                          "#edit-element-name .element-name-label",
                        ))
                      ) {
                        a.innerText = r.selector;
                      }
                      t.next = 12;
                      break;
                    case 10:
                      t.prev = 10;
                      t.t0 = t.catch(2);
                    case 12:
                    case "end":
                      return t.stop();
                  }
                }
              },
              t,
              null,
              [[2, 10]],
            );
          }),
        ),
        200,
      );
      An.set(e, n);
    }
  }
  function ur(changeCount) {
    const t = document.querySelector("#edit-element-name .edit-count");
    if (t) {
      t.textContent = Bt(changeCount);
    }
  }
  function dr() {
    const e = document.getElementById("tab-loader");
    if (e) {
      e.classList.remove("hidden");
    }
  }
  function pr() {
    const e = document.getElementById("tab-loader");
    if (e) {
      e.classList.add("hidden");
    }
  }
  function mr() {
    return fr.apply(this, arguments);
  }
  function fr() {
    return (fr = Kt(
      Gt().mark(function e() {
        let t;
        let n;
        let r;
        let a;
        let o;
        let c;
        let s;
        let l;
        let u;
        let d;
        let p;
        let m;
        let f;
        let h;
        let v;
        let g;
        let y;
        let b;
        let w;
        let x;
        let E;
        let C;
        let L;
        let N;
        let k;
        let _;
        let T;
        let S;
        let $;
        let A;
        let M;
        let O;
        let I;
        let R;
        let j;
        let B;
        let P;
        let D;
        let U;
        let H;
        let F;
        let G;
        let q;
        let W;
        let V;
        let z;
        let Y;
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  t = document.getElementById("edit_element-list-container");
                  n = document.getElementById("edit_element-list");
                  n.innerHTML = "";
                  dn.clear();
                  r = document.getElementById("edit_no-results");
                  a = document.getElementById("edit_changes-name");
                  o = document.getElementById("edit_loader-tab-2");
                  c = setTimeout(() => {
                    o.classList.remove("hidden");
                  }, 150);
                  e.next = 10;
                  return Promise.all([
                    i
                      .sendMessageToTab(Xt, {
                        target: "rule_editor",
                        action: "get_rule_changes",
                      })
                      .catch(() => null),
                    i
                      .sendMessageToTab(Xt, {
                        target: "editor",
                        action: "get_all_flattened_changes",
                      })
                      .catch(() => null),
                    i
                      .sendMessageToTab(Xt, {
                        target: "editor",
                        action: "get_html_changes",
                      })
                      .catch(() => null),
                  ]);
                case 10:
                  s = e.sent;
                  l = Ft(s, 3);
                  u = l[0];
                  d = l[1];
                  p = l[2];
                  m =
                    u && u.success && Array.isArray(u.changes) ? u.changes : [];
                  f =
                    p && p.success && Array.isArray(p.changes) ? p.changes : [];
                  clearTimeout(c);
                  o.classList.add("hidden");
                  h =
                    d && d.success && Array.isArray(d.changes) ? d.changes : [];
                  v = new Map();
                  g = Wt(h);
                  e.prev = 22;
                  b = Gt().mark(function e() {
                    let t;
                    let n;
                    let r;
                    let a;
                    let o;
                    let added;
                    let removed;
                    return Gt().wrap(function (e) {
                      while (true) {
                        switch ((e.prev = e.next)) {
                          case 0:
                            t = y.value;
                            n = (t.originalClasses || "")
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean);
                            r = (t.updatedClasses || "")
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean);
                            a = new Set(n);
                            o = new Set(r);
                            added = r.filter((e) => !a.has(e));
                            removed = n.filter((e) => !o.has(e));
                            if (added.length > 0 || removed.length > 0) {
                              v.set(t.id, {
                                added,
                                removed,
                              });
                            }
                          case 8:
                          case "end":
                            return e.stop();
                        }
                      }
                    }, e);
                  });
                  g.s();
                case 25:
                  if ((y = g.n()).done) {
                    e.next = 29;
                    break;
                  }
                  return e.delegateYield(b(), "t0", 27);
                case 27:
                  e.next = 25;
                  break;
                case 29:
                  e.next = 34;
                  break;
                case 31:
                  e.prev = 31;
                  e.t1 = e.catch(22);
                  g.e(e.t1);
                case 34:
                  e.prev = 34;
                  g.f();
                  return e.finish(34);
                case 37:
                  if (
                    (w = h.filter((e) => v.has(e.id))).length !== 0 ||
                    m.length !== 0 ||
                    f.length !== 0
                  ) {
                    e.next = 43;
                    break;
                  }
                  r.classList.remove("hidden");
                  t.classList.add("hidden");
                  if (a != null) {
                    a.classList.add("hidden");
                  }
                  return e.abrupt("return");
                case 43:
                  r.classList.add("hidden");
                  t.classList.remove("hidden");
                  n.innerHTML = "";
                  x = new Set([
                    ...qt(w.map((e) => e.id)),
                    ...qt(f.map((e) => e.id)),
                  ]).size;
                  E = 0;
                  C = Wt(m);
                  try {
                    for (C.s(); !(L = C.n()).done;) {
                      N = L.value;
                      E += Nr(N);
                    }
                  } catch (error) {
                    C.e(error);
                  } finally {
                    C.f();
                  }
                  k = Wt(v.values());
                  try {
                    for (k.s(); !(_ = k.n()).done;) {
                      T = _.value;
                      E += T.added.length + T.removed.length;
                    }
                  } catch (error) {
                    k.e(error);
                  } finally {
                    k.f();
                  }
                  E += f.length;
                  if (a) {
                    a.classList.remove("hidden");
                    S = document.getElementById("edit_changes-elements");
                    $ = document.getElementById("edit_changes-count");
                    if (S) {
                      S.textContent =
                        x > 0
                          ? jr(x, "ELEMENTS_COUNT_ONE", "ELEMENTS_COUNT_OTHER")
                          : jr(
                              m.length,
                              "RULES_COUNT_ONE",
                              "RULES_COUNT_OTHER",
                            );
                    }
                    if ($) {
                      $.textContent = Bt(E);
                    }
                    if ((A = document.getElementById("edit_revert-all"))) {
                      A.title = chrome.i18n.getMessage("BUTTON_CLEAR_CHANGES");
                    }
                  }
                  if (m.length > 0) {
                    M = new Map();
                    O = Wt(m);
                    try {
                      for (O.s(); !(I = O.n()).done;) {
                        R = I.value;
                        j = R.stylesheet || "inline";
                        if (!M.has(j)) {
                          M.set(j, []);
                        }
                        M.get(j).push(R);
                      }
                    } catch (error) {
                      O.e(error);
                    } finally {
                      O.f();
                    }
                    B = Wt(M);
                    try {
                      for (B.s(); !(P = B.n()).done;) {
                        D = Ft(P.value, 2);
                        U = D[0];
                        H = D[1];
                        n.appendChild(Sr(U, H));
                      }
                    } catch (error) {
                      B.e(error);
                    } finally {
                      B.f();
                    }
                  }
                  F = qt(w).reverse();
                  G = Wt(F);
                  try {
                    for (G.s(); !(q = G.n()).done;) {
                      W = q.value;
                      n.appendChild(Lr(W, v.get(W.id), W.selector));
                    }
                  } catch (error) {
                    G.e(error);
                  } finally {
                    G.f();
                  }
                  V = Wt(f);
                  try {
                    for (V.s(); !(z = V.n()).done;) {
                      Y = z.value;
                      n.appendChild(Cr(Y));
                    }
                  } catch (error) {
                    V.e(error);
                  } finally {
                    V.f();
                  }
                case 60:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[22, 31, 34, 37]],
        );
      }),
    )).apply(this, arguments);
  }
  function hr(e, t, n) {
    for (
      var pre = 0, a = Math.min(e.length, t.length);
      pre < a && n(e, t, pre, pre);
    ) {
      pre++;
    }
    for (
      var suf = 0, i = Math.min(e.length - pre, t.length - pre);
      suf < i && n(e, t, e.length - 1 - suf, t.length - 1 - suf);
    ) {
      suf++;
    }
    return {
      pre,
      suf,
    };
  }
  function vr(e, t) {
    if (e === t) {
      return null;
    }
    const n = hr(e, t, (e, t, n, r) => e.charCodeAt(n) === t.charCodeAt(r));
    const { pre, suf } = n;
    return {
      oldStart: pre,
      oldEnd: e.length - suf,
      newStart: pre,
      newEnd: t.length - suf,
    };
  }
  function gr(e, t, n) {
    if (t >= n) {
      return e;
    }
    const r = '<span class="diff-changed">';
    const a = "</span>";
    let o = "";
    let i = false;
    let c = false;
    let s = 0;
    for (const u of e) {
      if (i || u !== "<") {
        if (i) {
          o += u;
          if (u === ">") {
            i = false;
            if (c) {
              o += r;
            }
          }
        } else {
          if (!(s !== t || c)) {
            o += r;
            c = true;
          }
          if (s === n && c) {
            o += a;
            c = false;
          }
          o += u;
          s++;
        }
      } else {
        if (c) {
          o += a;
        }
        i = true;
        o += u;
      }
    }
    if (c) {
      o += a;
    }
    return o;
  }
  function yr(e) {
    if (!e) {
      return "";
    }
    const t = un.get(e);
    if (t !== undefined) {
      return t;
    }
    const n = document.createElement("template");
    n.innerHTML = e;
    let r;
    const a = [];
    const o = (e, t) => {
      const n = "  ".repeat(t);
      if (e.nodeType !== Node.TEXT_NODE) {
        if (e.nodeType !== Node.COMMENT_NODE) {
          if (e.nodeType === Node.ELEMENT_NODE) {
            const r = e.cloneNode(false).outerHTML;
            const i = `</${e.localName}>`;
            const c = r.endsWith(i) ? r.slice(0, -i.length) : r;
            const s = Array.from(
              e.localName === "template" && e.content
                ? e.content.childNodes
                : e.childNodes,
            );
            if (s.length !== 0) {
              if (s.every((e) => e.nodeType === Node.TEXT_NODE)) {
                a.push(
                  n +
                    c +
                    s
                      .map((e) => e.textContent)
                      .join("")
                      .trim() +
                    i,
                );
              } else {
                a.push(n + c);
                for (const d of s) {
                  o(d, t + 1);
                }
                a.push(n + i);
              }
            } else {
              a.push(n + r);
            }
          }
        } else {
          a.push(`${n}<!--${e.textContent}-->`);
        }
      } else {
        const p = e.textContent.trim();
        if (p) {
          a.push(n + p);
        }
      }
    };
    const i = Wt(n.content.childNodes);
    try {
      for (i.s(); !(r = i.n()).done;) {
        const c = r.value;
        o(c, 0);
      }
    } catch (error) {
      i.e(error);
    } finally {
      i.f();
    }
    const s = a.join("\n");
    if (e.length <= 65536) {
      if (un.size >= 200) {
        un.clear();
      }
      un.set(e, s);
    }
    return s;
  }
  function br(e, t) {
    return `${e != null ? `<span class="diff-num is-before">${e}</span>` : ""}${t != null ? `<span class="diff-num is-after">${t}</span>` : ""}`;
  }
  function wr(e) {
    return `<span class="diff-gutter-marker">${e === "added" ? "+" : "-"}</span>`;
  }
  function xr(e, t, n) {
    return `<div class="line diff-skip is-expandable">${_r(e, t, n)}</div>`;
  }
  function Er(html) {
    return html.replace('class="line', 'class="line hidden-ctx');
  }
  function Cr(e) {
    const t = document.createElement("div");
    t.className = "change-block";
    const n = document.createElement("pre");
    n.className = "styles-block";
    let r;
    let a;
    let o;
    const i = [];
    let c = 1;
    let s = 1;
    let l = 1;
    const u = (e, t) => {
      l = Math.max(l, c, s);
      i.push({
        html: `<div class="line">${br(c, s)}${Mn(e)}</div>`,
        changed: false,
        collapsible: !!t,
        beforeNum: c,
        afterNum: s,
        consumesBefore: true,
        consumesAfter: true,
      });
      c++;
      s++;
    };
    const d = (e, t) => {
      l = Math.max(l, c);
      const n = t ?? Mn(e);
      i.push({
        html: `<div class="line removed">${br(c, null)}${wr("removed")}${n}</div>`,
        changed: true,
        collapsible: false,
        beforeNum: c,
        afterNum: null,
        consumesBefore: true,
        consumesAfter: false,
      });
      c++;
    };
    const p = (e, t) => {
      l = Math.max(l, s);
      const n = t ?? Mn(e);
      i.push({
        html: `<div class="line added">${br(null, s)}${wr("added")}${n}</div>`,
        changed: true,
        collapsible: false,
        beforeNum: null,
        afterNum: s,
        consumesBefore: false,
        consumesAfter: true,
      });
      s++;
    };
    const m = yr(e.before);
    const f = yr(e.after);
    if (e.type === "modified" && m === f) {
      i.push({
        html: `<div class="line diff-note">${Mn(chrome.i18n.getMessage("LABEL_WHITESPACE_ONLY_CHANGE"))}</div>`,
        changed: false,
        collapsible: false,
        beforeNum: null,
        afterNum: null,
        consumesBefore: false,
        consumesAfter: false,
      });
    } else if (e.type === "modified") {
      let h;
      const computeV = (e, t) => {
        const n = e ? e.split("\n") : [];
        const r = t ? t.split("\n") : [];
        const a = hr(n, r, (e, t, n, r) => e[n] === t[r]);
        const { pre, suf } = a;
        const removedLines_1 = n.slice(pre, n.length - suf);
        const addedLines_1 = r.slice(pre, r.length - suf);
        return {
          prefixLines: n.slice(0, pre),
          removedLines: removedLines_1,
          addedLines: addedLines_1,
          suffixLines: n.slice(n.length - suf),
        };
      };
      const v = computeV(m, f);
      const { prefixLines, removedLines, addedLines, suffixLines } = v;
      const x = Wt(prefixLines);
      try {
        for (x.s(); !(h = x.n()).done;) {
          u(h.value, true);
        }
      } catch (error) {
        x.e(error);
      } finally {
        x.f();
      }
      for (
        var E = Math.min(removedLines.length, addedLines.length), C = 0;
        C < E;
        C++
      ) {
        r = removedLines[C];
        a = addedLines[C];
        o = undefined;
        const L = (o = vr(r, a))
          ? {
              oldHtml: `${Mn(r.slice(0, o.oldStart))}<span class="diff-changed">${Mn(r.slice(o.oldStart, o.oldEnd))}</span>${Mn(r.slice(o.oldEnd))}`,
              newHtml: `${Mn(a.slice(0, o.newStart))}<span class="diff-changed">${Mn(a.slice(o.newStart, o.newEnd))}</span>${Mn(a.slice(o.newEnd))}`,
            }
          : {
              oldHtml: Mn(r),
              newHtml: Mn(a),
            };
        const { oldHtml, newHtml } = L;
        d(removedLines[C], oldHtml);
        p(addedLines[C], newHtml);
      }
      for (let _ = E; _ < removedLines.length; _++) {
        d(removedLines[_]);
      }
      for (let T = E; T < addedLines.length; T++) {
        p(addedLines[T]);
      }
      for (const S of suffixLines) {
        u(S, true);
      }
    } else if (e.type === "removed") {
      for (const A of m.split("\n")) {
        d(A);
      }
    } else if (e.type === "added") {
      for (const O of f.split("\n")) {
        p(O);
      }
    } else if (e.type === "detached") {
      for (const B of m.split("\n")) {
        l = Math.max(l, c);
        i.push({
          html: `<div class="line removed detached">${br(c, null)}${Mn(B)}</div>`,
          changed: false,
          collapsible: false,
          beforeNum: c,
          afterNum: null,
          consumesBefore: true,
          consumesAfter: false,
        });
        c++;
      }
    }
    ((e) => {
      for (let t = 0; t < e.length; t++) {
        if (!e[t].collapsible) {
          for (var n = t; n < e.length && !e[n].collapsible;) {
            n++;
          }
          if (n - t > 4) {
            const r = t + 2;
            for (
              var a = n - 2,
                o = {
                  html: xr(e, a, null),
                  changed: false,
                  collapsible: false,
                },
                i = r;
              i < a;
              i++
            ) {
              e[i].html = Er(e[i].html);
            }
            e.splice(r, 0, o);
            n++;
          }
          t = n - 1;
        }
      }
    })(i);
    n.innerHTML = Tr(i);
    n.style.setProperty("--max-line-digits", String(String(l).length));
    const P = document.createElement("div");
    P.className = "change-body";
    const D = document.createElement("div");
    D.className = "pre-wrapper";
    D.appendChild(n);
    const U = document.createElement("div");
    U.className = "code-block-footer";
    const H = document.createElement("span");
    H.className = "change-selector";
    H.textContent = e.selector || "";
    if (e.type !== "detached") {
      H.dataset.elementid = e.id;
    } else {
      H.style.cursor = "default";
    }
    U.appendChild(H);
    const F = document.createElement("div");
    F.className = "footer-actions";
    if (e.type !== "detached") {
      const G = document.createElement("div");
      G.className = "section-action discard-action";
      G.title = chrome.i18n.getMessage("BUTTON_CLEAR_CHANGES");
      G.dataset.elementids = JSON.stringify([e.id]);
      G.dataset.kind = "structure";
      F.appendChild(G);
    }
    dn.set(e.id, e.after || e.before || "");
    const q = document.createElement("div");
    q.className = "section-action copy-action";
    q.dataset.copyid = e.id;
    F.appendChild(q);
    U.appendChild(F);
    D.appendChild(U);
    P.appendChild(D);
    t.appendChild(P);
    return t;
  }
  function Lr(e, t, selector) {
    const o = document.createElement("div");
    o.className = "change-block";
    const i = document.createElement("pre");
    i.className = "styles-block";
    const c = String(e.element || "div").toLowerCase();
    const s = String(e.originalClasses ?? "");
    const l = String(e.updatedClasses ?? "");
    const u = (e, t, n) => {
      const r = n ? gr(t, n.start, n.end) : t;
      const a = `&lt;<span class="selector">${Mn(c)}</span> class=<span class="string">"${r}"</span>&gt;`;
      const o = e === "added" ? br(null, 1) : br(1, null);
      return `<div class="line ${e}">${o}${wr(e)}${a}</div>`;
    };
    const d = [];
    if (s !== l || (t && (t.added.length > 0 || t.removed.length > 0))) {
      const p = Ut(s);
      const m = Ut(l);
      const f = vr(s, l);
      d.push(
        u(
          "removed",
          p,
          f
            ? {
                start: f.oldStart,
                end: f.oldEnd,
              }
            : null,
        ),
      );
      d.push(
        u(
          "added",
          m,
          f
            ? {
                start: f.newStart,
                end: f.newEnd,
              }
            : null,
        ),
      );
    }
    i.innerHTML = d.join("");
    const h = document.createElement("div");
    h.className = "change-body";
    const v = document.createElement("div");
    v.className = "pre-wrapper";
    v.appendChild(i);
    const g = document.createElement("div");
    g.className = "code-block-footer";
    const y = document.createElement("span");
    y.className = "change-selector";
    y.dataset.elementid = e.id;
    y.textContent = selector || "";
    g.appendChild(y);
    const b = document.createElement("div");
    b.className = "footer-actions";
    const w = document.createElement("div");
    w.className = "section-action discard-action";
    w.title = chrome.i18n.getMessage("BUTTON_CLEAR_CHANGES");
    w.dataset.elementids = JSON.stringify([e.id]);
    w.dataset.kind = "html";
    b.appendChild(w);
    const x = document.createElement("div");
    x.className = "section-action copy-action";
    x.dataset.content = `<${c} class="${l}">`;
    b.appendChild(x);
    g.appendChild(b);
    v.appendChild(g);
    h.appendChild(v);
    o.appendChild(h);
    return o;
  }
  function Nr(e) {
    const t = e.before ? kr(e.before.declsText) : {};
    const n = kr(e.after.declsText);
    let r = 0;
    for (let a = 0, o = Object.entries(t); a < o.length; a++) {
      const i = Ft(o[a], 2);
      const [c, s] = i;
      const l = n[c];
      if (!(l != null && l === s)) {
        r++;
      }
    }
    for (let u = 0, d = Object.keys(n); u < d.length; u++) {
      if (!(d[u] in t)) {
        r++;
      }
    }
    if (e.before && e.before.selector !== e.after.selector) {
      r++;
    }
    return Math.max(r, 1);
  }
  function kr(declsText) {
    let t;
    const n = {};
    const r = Wt(
      ((e) => {
        const t = [];
        let n = 0;
        let r = null;
        let a = 0;
        for (let o = 0; o < e.length; o++) {
          const i = e[o];
          if (r) {
            if (i === "\\") {
              o++;
            } else if (i === r) {
              r = null;
            }
          } else if (i === '"' || i === "'") {
            r = i;
          } else if (i === "(") {
            n++;
          } else if (i === ")") {
            n = Math.max(0, n - 1);
          } else if (i === ";" && n === 0) {
            t.push(e.slice(a, o));
            a = o + 1;
          }
        }
        t.push(e.slice(a));
        return t;
      })(String(declsText || "").replace(/\/\*[\s\S]*?\*\//g, "")),
    );
    try {
      for (r.s(); !(t = r.n()).done;) {
        const a = t.value;
        const o = a.indexOf(":");
        if (!(o < 0)) {
          const i = a.slice(0, o).trim().toLowerCase();
          const c = a.slice(o + 1).trim();
          if (i && c) {
            n[i] = c;
          }
        }
      }
    } catch (error) {
      r.e(error);
    } finally {
      r.f();
    }
    return n;
  }
  function _r(e, t, n) {
    let o = null;
    let i = null;
    let c = 0;
    let s = 0;
    for (let l = t; l < e.length && !(e[l].separator || (n && n[l])); l++) {
      const u = e[l];
      if (u.consumesBefore) {
        if (o == null) {
          o = u.beforeNum;
        }
        c++;
      }
      if (u.consumesAfter) {
        if (i == null) {
          i = u.afterNum;
        }
        s++;
      }
    }
    for (let d = t - 1; d >= 0 && (o == null || i == null); d--) {
      if (o == null && e[d].consumesBefore) {
        o = e[d].beforeNum;
      }
      if (i == null && e[d].consumesAfter) {
        i = e[d].afterNum;
      }
    }
    return `@@ -${o ?? 0},${c} +${i ?? 0},${s} @@`;
  }
  function Tr(e) {
    const t = [];
    e.forEach((e, n) => {
      if (e.changed) {
        t.push(n);
      }
    });
    const n = e.map(
      (e, n) =>
        !(!e.collapsible || !t.length) && t.every((e) => Math.abs(e - n) > 2),
    );
    const r = [];
    for (let a = 0; a < e.length; a++) {
      if (n[a]) {
        for (var o = a; o < e.length && n[o];) {
          o++;
        }
        const i = e.slice(a, o);
        if (i.length < 2) {
          r.push(...qt(i.map((e) => e.html)));
        } else {
          r.push(xr(e, o, n));
          r.push(...qt(i.map((e) => Er(e.html))));
        }
        a = o - 1;
      } else {
        r.push(e[a].html);
      }
    }
    return r.join("");
  }
  function Sr(e, t) {
    const n = document.createElement("div");
    n.className = "change-block";
    const r = e === "inline" || e.includes("/");
    const a = document.createElement("pre");
    a.className = "styles-block";
    const o = [];
    const c = [];
    let s = 1;
    let l = 1;
    let u = 1;
    const d = (e, t, n) => {
      u = Math.max(u, s, l);
      o.push({
        html: `<div class="line${t}">${br(s, l)}${e}</div>`,
        changed: false,
        collapsible: !!n,
        beforeNum: s,
        afterNum: l,
        consumesBefore: true,
        consumesAfter: true,
      });
      s++;
      l++;
    };
    const p = (e, t) => {
      u = Math.max(u, s);
      o.push({
        html: `<div class="line removed${t}">${br(s, null)}${wr("removed")}${e}</div>`,
        changed: true,
        collapsible: false,
        beforeNum: s,
        afterNum: null,
        consumesBefore: true,
        consumesAfter: false,
      });
      s++;
    };
    const m = (e, t) => {
      u = Math.max(u, l);
      o.push({
        html: `<div class="line added${t}">${br(null, l)}${wr("added")}${e}</div>`,
        changed: true,
        collapsible: false,
        beforeNum: null,
        afterNum: l,
        consumesBefore: false,
        consumesAfter: true,
      });
      l++;
    };
    t.sort((e, t) => (e.line || 0) - (t.line || 0));
    t.forEach((e, t) => {
      if (t > 0) {
        const n = r && e.line != null;
        o.push(
          n
            ? {
                separator: true,
                html: "",
                changed: false,
                collapsible: false,
              }
            : {
                html: '<div class="line">&nbsp;</div>',
                changed: false,
                collapsible: false,
              },
        );
      }
      const a = e.wrappers || [];
      const i = a.length ? " media-nested" : "";
      s = Math.max(1, (e.line || 1) - a.length);
      l = s;
      for (const h of a) {
        d(`<span class="selector">${Mn(h)}</span> {`, "", false);
      }
      const v = e.before ? e.before.selector : null;
      const selector = e.after.selector;
      const y = e.before ? kr(e.before.declsText) : {};
      const b = kr(e.after.declsText);
      const w = e.before == null;
      if (v != null && v !== selector) {
        p(`<span class="selector">${Mn(v)}</span> {`, i);
        m(`<span class="selector">${Mn(selector)}</span> {`, i);
      } else if (w) {
        m(`<span class="selector">${Mn(selector)}</span> {`, i);
      } else {
        d(`<span class="selector">${Mn(selector)}</span> {`, i, false);
      }
      const x = ` is-decl${i}`;
      const E = (e, t) => On(`${e}: ${t};`);
      const C = (e, t, n, r) => {
        const a = On(`${e}: ${t};`);
        const o = e.length + 2;
        return gr(a, o + n, o + r);
      };
      const L = [];
      for (let N = 0, k = Object.entries(y); N < k.length; N++) {
        const _ = Ft(k[N], 2);
        const [T, S] = _;
        const $ = b[T];
        if ($ == null) {
          p(E(T, S), x);
        } else if ($ === S) {
          d(E(T, $), x, true);
          L.push(`  ${T}: ${$};`);
        } else {
          const A = vr(String(S), String($));
          if (A) {
            p(C(T, S, A.oldStart, A.oldEnd), x);
            m(C(T, $, A.newStart, A.newEnd), x);
          } else {
            p(E(T, S), x);
            m(E(T, $), x);
          }
          L.push(`  ${T}: ${$};`);
        }
      }
      for (let M = 0, O = Object.entries(b); M < O.length; M++) {
        const I = Ft(O[M], 2);
        const [R, j] = I;
        if (y[R] == null) {
          m(E(R, j), x);
          L.push(`  ${R}: ${j};`);
        }
      }
      if (w) {
        m("}", i);
      } else {
        d("}", i, false);
      }
      for (let B = 0; B < a.length; B++) {
        d("}", "", false);
      }
      let P = `${selector} {
${L.join("\n")}
}`;
      for (let D = a.length - 1; D >= 0; D--) {
        P = `${a[D]} {
  ${P.replace(/\n/g, "\n  ")}
}`;
      }
      c.push(P);
    });
    for (let f = 0; f < o.length; f++) {
      if (o[f].separator) {
        o[f].html = `<div class="line diff-skip">${_r(o, f + 1, null)}</div>`;
      }
    }
    a.innerHTML = Tr(o);
    a.style.setProperty("--max-line-digits", String(String(u).length));
    const h = document.createElement("div");
    h.className = "change-body";
    const v = document.createElement("div");
    v.className = "pre-wrapper";
    v.appendChild(a);
    const g = document.createElement("div");
    g.className = "code-block-footer";
    const y = document.createElement("span");
    y.className = "change-selector";
    const b = e.includes("/");
    y.textContent =
      e === "inline"
        ? "<style>"
        : (b && e.split(/[?#]/)[0].split("/").pop()) || e;
    if (b) {
      y.title = e;
      y.addEventListener("click", function (t) {
        t.stopPropagation();
        i.tabsCreate({
          url: e,
          active: true,
        }).catch(() => {});
      });
    } else {
      y.style.cursor = "default";
    }
    g.appendChild(y);
    const w = document.createElement("div");
    w.className = "footer-actions";
    const x = document.createElement("div");
    x.className = "section-action discard-action";
    x.title = chrome.i18n.getMessage("BUTTON_CLEAR_CHANGES");
    x.dataset.changeids = JSON.stringify(t.map((e) => e.id));
    w.appendChild(x);
    const E = document.createElement("div");
    E.className = "section-action copy-action";
    E.dataset.content = c.join("\n\n");
    w.appendChild(E);
    g.appendChild(w);
    v.appendChild(g);
    h.appendChild(v);
    n.appendChild(h);
    return n;
  }
  function $r(e) {
    return Ar.apply(this, arguments);
  }
  function Ar() {
    return (Ar = Kt(
      Gt().mark(function e(t) {
        let n;
        let r;
        let a;
        let o;
        let c;
        let s;
        let l;
        let u;
        let d;
        let p;
        let m;
        let changeId;
        let elementIds;
        let kind;
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  n = t.target;
                  if (!(r = n.closest(".diff-skip.is-expandable"))) {
                    e.next = 7;
                    break;
                  }
                  for (
                    a = r.nextElementSibling;
                    a && a.classList.contains("hidden-ctx");
                  ) {
                    a.classList.remove("hidden-ctx");
                    a = a.nextElementSibling;
                  }
                  r.remove();
                  return e.abrupt("return");
                case 7:
                  if (!(o = n.closest(".copy-action"))) {
                    e.next = 15;
                    break;
                  }
                  c =
                    o.dataset.copyid != null
                      ? dn.get(o.dataset.copyid)
                      : o.dataset.content;
                  e.next = 12;
                  return Ot(c || "");
                case 12:
                  if ((s = e.sent) && s.success) {
                    o.classList.add("copy-success");
                    setTimeout(() => o.classList.remove("copy-success"), 1200);
                  }
                  return e.abrupt("return");
                case 15:
                  if (!(l = n.closest(".change-selector"))) {
                    e.next = 26;
                    break;
                  }
                  t.stopPropagation();
                  e.prev = 18;
                  e.next = 21;
                  return i.sendMessageToTab(Xt, {
                    target: "script",
                    action: "select_edited_element",
                    elementId: l.dataset.elementid,
                  });
                case 21:
                  e.next = 25;
                  break;
                case 23:
                  e.prev = 23;
                  e.t0 = e.catch(18);
                case 25:
                  return e.abrupt("return");
                case 26:
                  if (!(u = n.closest(".discard-action"))) {
                    e.next = 70;
                    break;
                  }
                  t.stopPropagation();
                  e.next = 31;
                  return Et.confirm({
                    title: chrome.i18n.getMessage("DIALOG_TITLE_CLEAR_ELEMENT"),
                    body: chrome.i18n.getMessage("CONFIRM_CLEAR_ELEMENT"),
                  });
                case 31:
                  if (e.sent) {
                    e.next = 34;
                    break;
                  }
                  return e.abrupt("return");
                case 34:
                  if (!u.dataset.changeids) {
                    e.next = 60;
                    break;
                  }
                  d = JSON.parse(u.dataset.changeids);
                  e.prev = 36;
                  p = Wt(d);
                  e.prev = 38;
                  p.s();
                case 40:
                  if ((m = p.n()).done) {
                    e.next = 46;
                    break;
                  }
                  changeId = m.value;
                  e.next = 44;
                  return i.sendMessageToTab(Xt, {
                    target: "rule_editor",
                    action: "revert_rule_change",
                    changeId,
                  });
                case 44:
                  e.next = 40;
                  break;
                case 46:
                  e.next = 51;
                  break;
                case 48:
                  e.prev = 48;
                  e.t1 = e.catch(38);
                  p.e(e.t1);
                case 51:
                  e.prev = 51;
                  p.f();
                  return e.finish(51);
                case 54:
                  mr();
                  e.next = 59;
                  break;
                case 57:
                  e.prev = 57;
                  e.t2 = e.catch(36);
                case 59:
                  return e.abrupt("return");
                case 60:
                  elementIds = JSON.parse(u.dataset.elementids);
                  kind = u.dataset.kind || "all";
                  e.prev = 62;
                  e.next = 65;
                  return i.sendMessageToTab(Xt, {
                    target: "editor",
                    action: "clear_elements_by_ids",
                    elementIds,
                    kind,
                  });
                case 65:
                  mr();
                  e.next = 70;
                  break;
                case 68:
                  e.prev = 68;
                  e.t3 = e.catch(62);
                case 70:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [
            [18, 23],
            [36, 57],
            [38, 48, 51, 54],
            [62, 68],
          ],
        );
      }),
    )).apply(this, arguments);
  }
  function Mr(e) {
    return Or.apply(this, arguments);
  }
  function Or() {
    return (Or = Kt(
      Gt().mark(function e(t) {
        let n;
        let r;
        let a;
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  n = t.target;
                  if (!(r = n.closest("[data-elementid]"))) {
                    e.next = 11;
                    break;
                  }
                  a = r.dataset.elementid;
                  e.prev = 4;
                  e.next = 7;
                  return i.sendMessageToTab(Xt, {
                    target: "editor",
                    action: "highlight_hovered",
                    elementId: a,
                  });
                case 7:
                  e.next = 11;
                  break;
                case 9:
                  e.prev = 9;
                  e.t0 = e.catch(4);
                case 11:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[4, 9]],
        );
      }),
    )).apply(this, arguments);
  }
  function Ir(e) {
    return Rr.apply(this, arguments);
  }
  function Rr() {
    return (Rr = Kt(
      Gt().mark(function e(t) {
        let n;
        let r;
        let a;
        return Gt().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  n = t.target;
                  if (!(r = n.closest("[data-elementid]"))) {
                    e.next = 14;
                    break;
                  }
                  a = r.dataset.elementid;
                  e.prev = 4;
                  e.next = 7;
                  return i.sendMessageToTab(Xt, {
                    target: "editor",
                    action: "remove_highlight_hovered",
                    elementId: a,
                  });
                case 7:
                  if (!e.sent.success) {
                    Et.alert({
                      title: chrome.i18n.getMessage(
                        "DIALOG_TITLE_ELEMENT_NOT_FOUND",
                      ),
                      body: chrome.i18n.getMessage("ALERT_NO_SELECTED_ELEMENT"),
                    });
                  }
                  e.next = 14;
                  break;
                case 11:
                  e.prev = 11;
                  e.t0 = e.catch(4);
                  Et.alert({
                    title: chrome.i18n.getMessage(
                      "DIALOG_TITLE_TAB_UNAVAILABLE",
                    ),
                    body: chrome.i18n.getMessage(
                      "ALERT_COULDNT_COMMUNICATE_WITH_TAB",
                    ),
                  });
                case 14:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[4, 11]],
        );
      }),
    )).apply(this, arguments);
  }
  function jr(e, t, n) {
    if (e === 1) {
      return chrome.i18n.getMessage(t);
    }
    return chrome.i18n.getMessage(n, [String(e)]);
  }
  function Br() {
    Br = function () {
      return t;
    };
    let e;
    var t = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const a =
      Object.defineProperty ||
      ((e, t, n) => {
        e[t] = n.value;
      });
    const o = typeof Symbol === "function" ? Symbol : {};
    const i = o.iterator || "@@iterator";
    const c = o.asyncIterator || "@@asyncIterator";
    const s = o.toStringTag || "@@toStringTag";
    function l(e, t, n) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      l({}, "");
    } catch (e) {
      l = function (e, t, n) {
        return (e[t] = n);
      };
    }
    function u(e, t, n, r) {
      const o = t && t.prototype instanceof g ? t : g;
      const i = Object.create(o.prototype);
      const c = new $(r || []);
      a(i, "_invoke", {
        value: k(e, n, c),
      });
      return i;
    }
    function d(e, t, n) {
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
    t.wrap = u;
    var p = "suspendedStart";
    var m = "suspendedYield";
    var f = "executing";
    var h = "completed";
    var v = {};
    function g() {}
    function y() {}
    function b() {}
    let w = {};
    l(w, i, function () {
      return this;
    });
    const E =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(A([])));
    if (E && E !== Object.prototype && hasOwnProperty.call(E, i)) {
      w = E;
    }
    const C = (b.prototype = g.prototype = Object.create(w));
    function L(e) {
      ["next", "throw", "return"].forEach((t) => {
        l(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function N(e, t) {
      function n(a, o, i, c) {
        const s = d(e[a], e, o);
        if (s.type !== "throw") {
          const l = s.arg;
          const u = l.value;
          if (u && Pr(u) == "object" && hasOwnProperty.call(u, "__await")) {
            return t.resolve(u.__await).then(
              (e) => {
                n("next", e, i, c);
              },
              (e) => {
                n("throw", e, i, c);
              },
            );
          }
          return t.resolve(u).then(
            (e) => {
              l.value = e;
              i(l);
            },
            (e) => n("throw", e, i, c),
          );
        }
        c(s.arg);
      }
      let o;
      a(this, "_invoke", {
        value: function (e, r) {
          function a() {
            return new t(function (t, a) {
              n(e, r, t, a);
            });
          }
          return (o = o ? o.then(a, a) : a());
        },
      });
    }
    function k(t, n, r) {
      let a = p;
      return function (o, i) {
        if (a === f) {
          throw Error("Generator is already running");
        }
        if (a === h) {
          if (o === "throw") {
            throw i;
          }
          return {
            value: e,
            done: true,
          };
        }
        r.method = o;
        for (r.arg = i; ;) {
          const c = r.delegate;
          if (c) {
            const s = _(c, r);
            if (s) {
              if (s === v) {
                continue;
              }
              return s;
            }
          }
          if (r.method === "next") {
            r.sent = r._sent = r.arg;
          } else if (r.method === "throw") {
            if (a === p) {
              a = h;
              throw r.arg;
            }
            r.dispatchException(r.arg);
          } else {
            if (r.method === "return") {
              r.abrupt("return", r.arg);
            }
          }
          a = f;
          const l = d(t, n, r);
          if (l.type === "normal") {
            a = r.done ? h : m;
            if (l.arg === v) {
              continue;
            }
            return {
              value: l.arg,
              done: r.done,
            };
          }
          if (l.type === "throw") {
            a = h;
            r.method = "throw";
            r.arg = l.arg;
          }
        }
      };
    }
    function _(t, n) {
      const n_method = n.method;
      const a = t.iterator[n_method];
      if (a === e) {
        n.delegate = null;
        if (
          !(
            n_method === "throw" &&
            t.iterator.return &&
            ((n.method = "return"), (n.arg = e), _(t, n), n.method === "throw")
          )
        ) {
          if (n_method !== "return") {
            n.method = "throw";
            n.arg = new TypeError(
              `The iterator does not provide a '${n_method}' method`,
            );
          }
        }
        return v;
      }
      const o = d(a, t.iterator, n.arg);
      if (o.type === "throw") {
        n.method = "throw";
        n.arg = o.arg;
        n.delegate = null;
        return v;
      }
      const o_arg = o.arg;
      if (o_arg) {
        if (o_arg.done) {
          return (
            (n[t.resultName] = o_arg.value),
            (n.next = t.nextLoc),
            n.method !== "return" && ((n.method = "next"), (n.arg = e)),
            (n.delegate = null),
            v
          );
        }
        return o_arg;
      }
      return (
        (n.method = "throw"),
        (n.arg = new TypeError("iterator result is not an object")),
        (n.delegate = null),
        v
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
    function S(e) {
      const t = e.completion || {};
      t.type = "normal";
      delete t.arg;
      e.completion = t;
    }
    function $(e) {
      this.tryEntries = [
        {
          tryLoc: "root",
        },
      ];
      e.forEach(T, this);
      this.reset(true);
    }
    function A(t) {
      if (t || t === "") {
        const n = t[i];
        if (n) {
          return n.call(t);
        }
        if (typeof t.next === "function") {
          return t;
        }
        if (!isNaN(t.length)) {
          let a = -1;
          const o = function n() {
            while (++a < t.length) {
              if (hasOwnProperty.call(t, a)) {
                n.value = t[a];
                n.done = false;
                return n;
              }
            }
            n.value = e;
            n.done = true;
            return n;
          };
          return (o.next = o);
        }
      }
      throw new TypeError(`${Pr(t)} is not iterable`);
    }
    y.prototype = b;
    a(C, "constructor", {
      value: b,
      configurable: true,
    });
    a(b, "constructor", {
      value: y,
      configurable: true,
    });
    y.displayName = l(b, s, "GeneratorFunction");
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
        l(e, s, "GeneratorFunction");
      }
      e.prototype = Object.create(C);
      return e;
    };
    t.awrap = function (e) {
      return {
        __await: e,
      };
    };
    L(N.prototype);
    l(N.prototype, c, function () {
      return this;
    });
    t.AsyncIterator = N;
    t.async = function (e, n, r, a, o = Promise) {
      const i = new N(u(e, n, r, a), o);
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
    L(C);
    l(C, s, "Generator");
    l(C, i, function () {
      return this;
    });
    l(C, "toString", function () {
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
    t.values = A;
    $.prototype = {
      constructor: $,
      reset: function (t) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = e;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = e;
        this.tryEntries.forEach(S);
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
        function a(r, a) {
          c.type = "throw";
          c.arg = t;
          n.next = r;
          if (a) {
            n.method = "next";
            n.arg = e;
          }
          return !!a;
        }
        for (let o = this.tryEntries.length - 1; o >= 0; --o) {
          const i = this.tryEntries[o];
          var c = i.completion;
          if (i.tryLoc === "root") {
            return a("end");
          }
          if (i.tryLoc <= this.prev) {
            const s = hasOwnProperty.call(i, "catchLoc");
            const l = hasOwnProperty.call(i, "finallyLoc");
            if (s && l) {
              if (this.prev < i.catchLoc) {
                return a(i.catchLoc, true);
              }
              if (this.prev < i.finallyLoc) {
                return a(i.finallyLoc);
              }
            } else if (s) {
              if (this.prev < i.catchLoc) {
                return a(i.catchLoc, true);
              }
            } else {
              if (!l) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < i.finallyLoc) {
                return a(i.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let n = this.tryEntries.length - 1; n >= 0; --n) {
          const a = this.tryEntries[n];
          if (
            a.tryLoc <= this.prev &&
            hasOwnProperty.call(a, "finallyLoc") &&
            this.prev < a.finallyLoc
          ) {
            var o = a;
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
          return ((this.method = "next"), (this.next = o.finallyLoc), v);
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
        return v;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.finallyLoc === e) {
            this.complete(n.completion, n.afterLoc);
            S(n);
            return v;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.tryLoc === e) {
            const r = n.completion;
            if (r.type === "throw") {
              var a = r.arg;
              S(n);
            }
            return a;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (t, n, r) {
        this.delegate = {
          iterator: A(t),
          resultName: n,
          nextLoc: r,
        };
        if (this.method === "next") {
          this.arg = e;
        }
        return v;
      },
    };
    return t;
  }
  function Pr(e) {
    Pr =
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
    return Pr(e);
  }
  function Dr(e) {
    return (
      ((e) => {
        if (Array.isArray(e)) {
          return qr(e);
        }
      })(e) ||
      ((e) => {
        if (
          (typeof Symbol !== "undefined" && e[Symbol.iterator] != null) ||
          e["@@iterator"] != null
        ) {
          return Array.from(e);
        }
      })(e) ||
      Gr(e) ||
      (() => {
        throw new TypeError(
          "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function Ur(e, t, n, r, a, o, i) {
    try {
      var c = e[o](i);
      var s = c.value;
    } catch (error) {
      return void n(error);
    }
    if (c.done) {
      t(s);
    } else {
      Promise.resolve(s).then(r, a);
    }
  }
  function Hr(e, t) {
    return (
      ((e) => {
        if (Array.isArray(e)) {
          return e;
        }
      })(e) ||
      ((e, t) => {
        let n =
          e == null
            ? null
            : (typeof Symbol !== "undefined" && e[Symbol.iterator]) ||
              e["@@iterator"];
        if (n != null) {
          let r;
          let a;
          let o;
          let i;
          const c = [];
          let s = true;
          let l = false;
          try {
            o = (n = n.call(e)).next;
            if (t === 0) {
              if (Object(n) !== n) {
                return;
              }
              s = false;
            } else {
              for (
                ;
                !(s = (r = o.call(n)).done) &&
                (c.push(r.value), c.length !== t);
                s = true
              );
            }
          } catch (error) {
            l = true;
            a = error;
          } finally {
            try {
              if (
                !s &&
                n.return != null &&
                ((i = n.return()), Object(i) !== i)
              ) {
                return;
              }
            } finally {
              if (l) {
                throw a;
              }
            }
          }
          return c;
        }
      })(e, t) ||
      Gr(e, t) ||
      (() => {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function Fr(e, t) {
    let n =
      (typeof Symbol !== "undefined" && e[Symbol.iterator]) || e["@@iterator"];
    if (!n) {
      if (
        Array.isArray(e) ||
        (n = Gr(e)) ||
        (t && e && typeof e.length === "number")
      ) {
        if (n) {
          e = n;
        }
        let r = 0;
        const a = function () {};
        return {
          s: a,
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
          f: a,
        };
      }
      throw new TypeError(
        "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
      );
    }
    let o;
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
        o = e;
      },
      f: function () {
        try {
          if (!(i || n.return == null)) {
            n.return();
          }
        } finally {
          if (c) {
            throw o;
          }
        }
      },
    };
  }
  function Gr(e, t) {
    if (e) {
      if (typeof e === "string") {
        return qr(e, t);
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
        return qr(e, t);
      }
      return undefined;
    }
  }
  function qr(e, t) {
    if (t == null || t > e.length) {
      t = e.length;
    }
    for (var n = 0, r = Array(t); n < t; n++) {
      r[n] = e[n];
    }
    return r;
  }
  function Wr(e, t) {
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
  function Vr(e) {
    for (let t = 1; t < arguments.length; t++) {
      var n = arguments[t] ?? {};
      if (t % 2) {
        Wr(Object(n), true).forEach((t) => {
          zr(e, t, n[t]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(e, Object.getOwnPropertyDescriptors(n));
      } else {
        Wr(Object(n)).forEach((t) => {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
        });
      }
    }
    return e;
  }
  function zr(e, t, n) {
    if (
      (t = ((e) => {
        const computeT = (e) => {
          const t = "string";
          if (Pr(e) != "object" || !e) {
            return e;
          }
          const n = e[Symbol.toPrimitive];
          if (n !== undefined) {
            const r = n.call(e, t || "default");
            if (Pr(r) != "object") {
              return r;
            }
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return (t === "string" ? String : Number)(e);
        };
        const t = computeT(e);
        if (Pr(t) == "symbol") {
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
  var Yr = null;
  var scopePath = null;
  var Xr = [];
  var Zr = new WeakMap();
  var Qr = new Map();
  var Jr = null;
  var ea = null;
  var ta = 0;
  var na = 0;
  var ra = null;
  var aa = null;
  var oa = null;
  var ia = new Map();
  var ca = (e) => {
    if (e.startsWith("--")) {
      return e;
    }
    return e.toLowerCase();
  };
  var sa = new WeakMap();
  var la = new WeakMap();
  var ua = new Map();
  var da = document.createElement("div");
  var paySeq = 0;
  var ma = null;
  var fa = null;
  var ha = [];
  var va = -1;
  var ga = null;
  var ya = "";
  var ba = "property";
  var wa = 0;
  var xa = 0;
  var Ea = 0;
  function Ca(e) {
    return i.sendMessageToTab(
      Xt,
      Vr(
        {
          target: "rule_editor",
        },
        e,
      ),
    );
  }
  function La(e) {
    const t = document.getElementById("edit_css-sections");
    const n = document.getElementById("edit_css-body");
    const r = document.getElementById("edit_css-empty");
    if (t) {
      const a = e && e.rulePayload;
      if (!a) {
        if (n != null) {
          n.classList.add("hidden");
        }
        return void (r == null || r.classList.remove("hidden"));
      }
      if (r != null) {
        r.classList.add("hidden");
      }
      if (n != null) {
        n.classList.remove("hidden");
      }
      Yr = a.suggestedSelector || null;
      scopePath = a.scopePath || null;
      Xr = a.customProperties || [];
      Jr = a.forcedState || null;
      paySeq = (e && e.paySeq) || a.paySeq || 0;
      ma = null;
      ea = null;
      ra = null;
      aa = null;
      oa = null;
      ia = new Map();
      Ha();
      ho();
      t.replaceChildren();
      t.appendChild(
        (() => {
          const e = document.createElement("div");
          e.className = "edit-css-section is-scratchpad";
          const t = qa(
            chrome.i18n.getMessage("LABEL_EFFECTIVE_STYLES") ||
              "Effective Styles",
          );
          const { card, decls } = t;
          e.appendChild(card);
          ra = decls;
          aa = e;
          return e;
        })(),
      );
      let o;
      let leadWithInline = true;
      const c = Fr(Array.isArray(a.sections) ? a.sections : []);
      try {
        for (c.s(); !(o = c.n()).done;) {
          const s = o.value;
          t.appendChild(
            ka(s, {
              leadWithInline,
              inlineStyle: a.inlineStyle || "",
            }),
          );
          leadWithInline = false;
        }
      } catch (error) {
        c.e(error);
      } finally {
        c.f();
      }
      ((e, t) => {
        const n = document.createElement("div");
        n.className = "edit-css-section edit-classes-section";
        const r = document.createElement("div");
        r.className = "edit-css-section-header";
        r.textContent = "Classes";
        n.appendChild(r);
        const a = document.createElement("div");
        a.className = "edit-css-editor edit-classes-editor";
        a.contentEditable = "plaintext-only";
        a.spellcheck = false;
        n.appendChild(a);
        e.appendChild(n);
        $n.add(a);
        const o = Ut(t || "");
        a.innerHTML = `<div class="line">${o || "<br>"}</div>`;
        In(a);
        $n.delete(a);
        a.addEventListener("beforeinput", cr);
        a.addEventListener("input", sr);
        a.addEventListener("keydown", ar);
        a.addEventListener("blur", er);
      })(t, e.classes || a.classes || "");
      na = a.skippedCrossOriginCount || 0;
      ((e) => {
        const t = document.getElementById("edit_css-xo-note");
        if (t) {
          const n = ++Dn;
          if (!e) {
            t.replaceChildren();
            return void t.classList.add("hidden");
          }
          const r = document.createElement("a");
          r.href = "#";
          r.className = "link";
          r.textContent = chrome.i18n.getMessage("ENABLE_CROSS_ORIGIN");
          r.addEventListener("click", Gn);
          const a = `${chrome.i18n.getMessage("MATCHED_CROSS_ORIGIN_HIDDEN", [
            String(e),
          ])} ${chrome.i18n.getMessage("EDITOR_CROSS_ORIGIN_MISSING")} `;
          const o = document.createElement("span");
          o.className = "xo-note-icon";
          o.innerHTML = f;
          const i = document.createElement("span");
          i.append(document.createTextNode(a), r, document.createTextNode("."));
          t.replaceChildren(o, i);
          t.classList.remove("hidden");
          chrome.permissions.contains(
            {
              origins: ["<all_urls>"],
            },
            function (e) {
              if (n === Dn && e) {
                Un();
              }
            },
          );
        }
      })(a.skippedCrossOriginCount || 0);
      Na(t);
      to();
    }
  }
  function Na(e) {
    const t = e.querySelectorAll(".edit-css-section-header");
    t.forEach((e, n) => {
      e.style.zIndex = String(t.length - n);
    });
  }
  function ka(e, t = {}) {
    const t_leadWithInline = t.leadWithInline;
    const r = t_leadWithInline !== undefined && t_leadWithInline;
    const t_inlineStyle = t.inlineStyle;
    const o = t_inlineStyle === undefined ? "" : t_inlineStyle;
    const i = e.wrappers || [];
    const c = !!e.inheritedFrom;
    const s = document.createElement("div");
    s.className = "edit-css-section";
    s.dataset.wrappers = i.join(" | ");
    if (c) {
      s.dataset.inheritedDepth = String(e.inheritedDepth || 0);
    }
    const l = document.createElement("div");
    l.className = "edit-css-section-header";
    if (e.mediaActive === false) {
      l.classList.add("greyed");
    }
    const u = document.createElement("span");
    u.className = "edit-css-section-title";
    if (c) {
      const [p, f = ""] = Hr(
        (
          chrome.i18n.getMessage("LABEL_INHERITED_FROM", ["\0"]) ||
          "Inherited from \0"
        ).split("\0"),
        2,
      );
      if (p) {
        u.appendChild(document.createTextNode(p));
      }
      const h = document.createElement("span");
      h.className = "edit-css-section-selector";
      h.textContent = e.inheritedFrom;
      u.appendChild(h);
      if (f) {
        u.appendChild(document.createTextNode(f));
      }
      if (i.length) {
        u.appendChild(document.createTextNode(` ${i.join(" ")}`));
      }
      l.title =
        (chrome.i18n.getMessage("LABEL_INHERITED_FROM", [e.inheritedFrom]) ||
          `Inherited from ${e.inheritedFrom}`) +
        (i.length ? ` ${i.join(" ")}` : "");
    } else {
      u.textContent = i.length
        ? i.join(" ")
        : chrome.i18n.getMessage("LABEL_RULES") || "Rules";
      if (i.length) {
        l.title = i.join(" ");
      }
    }
    l.appendChild(u);
    const v = e.mediaActive !== false;
    if (!c) {
      const g = document.createElement("button");
      g.type = "button";
      g.className = "edit-css-section-add";
      g.title = chrome.i18n.getMessage("LABEL_ADD_RULE") || "Add Rule";
      g.setAttribute(
        "aria-label",
        chrome.i18n.getMessage("LABEL_ADD_RULE") || "Add Rule",
      );
      g.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="currentColor"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>';
      g.addEventListener("click", function () {
        return (function (e, t) {
          return Fa.apply(this, arguments);
        })(s, i, !l.classList.contains("greyed"));
      });
      l.appendChild(g);
    }
    s.appendChild(l);
    if (r) {
      const y = _a(
        {
          scopeDepth: e.scopeDepth || 0,
          ruleRef: {
            inline: true,
          },
          selector: "element.style",
          declsText: o,
          readOnly: false,
          selectorReadOnly: true,
        },
        {
          mediaActive: true,
        },
      );
      ea = y;
      s.appendChild(y);
    }
    for (const x of e.rules || []) {
      s.appendChild(
        _a(x, {
          mediaActive: v && x.mediaActive !== false,
          wrappersLabel: i.length ? i.join(" ") : null,
        }),
      );
    }
    return s;
  }
  function _a(e, t = {}) {
    const n = document.createElement("div");
    n.className = "css-rule";
    Zr.set(n, e.ruleRef);
    sa.set(n, {
      inline: !!e.ruleRef.inline || e.inline === true,
      inheritedDepth:
        typeof e.inheritedDepth === "number" ? e.inheritedDepth : 0,
      readOnly: !!e.readOnly,
      state: e.state || null,
      states: Array.isArray(e.states) ? e.states : e.state ? [e.state] : [],
      activeNow: e.activeNow !== false,
      pseudoElement: e.pseudoElement || null,
      mediaActive: t.mediaActive !== false,
      scopeDepth: e.scopeDepth || 0,
      specificity: typeof e.specificity === "number" ? e.specificity : 0,
      sourceIndex:
        typeof e.sourceIndex === "number"
          ? e.sourceIndex
          : e.ruleRef.own != null
            ? lo(e.ruleRef.own)
            : 0,
      layerRank: typeof e.layerRank === "number" ? e.layerRank : -1,
      cascadeUnknown: e.cascadeUnknown === true,
      sourceName: (e.source && e.source.name) || null,
      wrappersLabel: t.wrappersLabel || null,
    });
    const r = document.createElement("div");
    r.className = "css-rule-selector";
    const a = document.createElement("span");
    a.className = "css-rule-selector-main";
    const o = document.createElement("span");
    o.className = "css-rule-selector-text";
    o.textContent = e.selector;
    a.appendChild(o);
    a.appendChild(document.createTextNode(" {"));
    r.appendChild(a);
    if (e.source && e.source.name) {
      const c = document.createElement("span");
      c.className = "css-rule-source";
      c.textContent = e.source.line
        ? `${e.source.name}:${e.source.line}`
        : e.source.name;
      if (e.source.full) {
        c.title = e.source.full;
        c.classList.add("is-link");
        const s = e.source.full;
        c.addEventListener("click", function () {
          i.tabsCreate({
            url: s,
            active: true,
          }).catch(() => {});
        });
      }
      r.appendChild(c);
    }
    if (e.readOnly) {
      const l = document.createElement("span");
      l.className = "css-rule-badge";
      l.textContent = "read-only";
      r.appendChild(l);
    }
    n.appendChild(r);
    if (!(e.readOnly || e.selectorReadOnly || e.ruleRef.inline)) {
      o.dataset.committed = e.selector;
      Zr.set(o, e.ruleRef);
      o.addEventListener("mousedown", function (e) {
        if (!o.isContentEditable) {
          e.preventDefault();
          ((e) => {
            if (e.isContentEditable) {
              return;
            }
            e.contentEditable = "plaintext-only";
            e.spellcheck = false;
            e.classList.add("is-editing");
            e.focus();
            const t = document.createRange();
            t.selectNodeContents(e);
            const n = window.getSelection();
            n.removeAllRanges();
            n.addRange(t);
          })(o);
        }
      });
      o.addEventListener("beforeinput", function (e) {
        const t = e.inputType || "";
        if (!(t !== "insertParagraph" && t !== "insertLineBreak")) {
          e.preventDefault();
          o.blur();
        }
      });
      o.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          e.preventDefault();
          o.textContent = o.dataset.committed || "";
          o.blur();
        }
      });
      o.addEventListener("blur", function () {
        return ((e) => {
          if (!e.isContentEditable) {
            return;
          }
          e.contentEditable = "false";
          e.classList.remove("is-editing");
          const t = Zr.get(e);
          if (!t) {
            return;
          }
          const n = (e.textContent || "").trim();
          const r = e.dataset.committed || "";
          if (!n) {
            return void (e.textContent = r);
          }
          if (n === r) {
            return;
          }
          const a = e.closest(".css-rule");
          Ca({
            action: "rule_selector_edit",
            ref: t,
            selector: n,
          })
            .then((e) => {
              if (e && e.success) {
                if (e.ruleRef) {
                  Object.assign(t, e.ruleRef);
                }
                const n = a ? sa.get(a) : null;
                if (n) {
                  if (typeof e.specificity === "number") {
                    n.specificity = e.specificity;
                  }
                  n.state = e.state || null;
                  n.states = Array.isArray(e.states)
                    ? e.states
                    : e.state
                      ? [e.state]
                      : [];
                  n.activeNow = e.activeNow !== false;
                  n.pseudoElement = e.pseudoElement || null;
                }
              }
              to();
            })
            .catch(() => {});
          t.selector = n;
          e.dataset.committed = n;
          e.textContent = n;
        })(o);
      });
    }
    const u = document.createElement("div");
    u.className = "css-decls";
    for (const [f, h] of yo(e.declsText || "")) {
      u.appendChild(Ta(n, f, h, !e.readOnly));
    }
    n.appendChild(u);
    const v = document.createElement("div");
    v.className = "css-rule-close";
    v.textContent = "}";
    n.appendChild(v);
    if (!e.readOnly) {
      n.addEventListener("mousedown", function (e) {
        const e_target = e.target;
        const o = e_target.closest ? e_target.closest(".decl-row") : null;
        if (o && e_target === o) {
          e.preventDefault();
          $a(n, u, o.nextElementSibling);
        } else if (e_target === r || e_target === a) {
          e.preventDefault();
          $a(n, u, u.firstElementChild);
        } else if (!(e_target !== u && e_target !== v)) {
          e.preventDefault();
          Sa(n);
        }
      });
    }
    return n;
  }
  function Ta(e, t, n, r) {
    const a = document.createElement("div");
    a.className = "decl-row";
    if (r) {
      const o = document.createElement("input");
      o.type = "checkbox";
      o.className = "decl-toggle";
      o.checked = true;
      o.addEventListener("change", function () {
        a.classList.toggle("is-disabled", !o.checked);
        Da(e);
      });
      a.appendChild(o);
    }
    const i = document.createElement("span");
    i.className = "decl-prop";
    i.textContent = t;
    i.dataset.raw = t;
    const c = document.createElement("span");
    c.className = "decl-value";
    c.dataset.raw = n;
    c.innerHTML = Dt(Mn(n));
    a.appendChild(i);
    a.appendChild(document.createTextNode(": "));
    a.appendChild(c);
    a.appendChild(document.createTextNode(";"));
    if (r) {
      const s = () => {
        const t = u[l];
        t.addEventListener("mousedown", function (n) {
          if (!t.isContentEditable) {
            n.preventDefault();
            Ia(t, e);
          }
        });
        t.addEventListener("keydown", function (t) {
          return ja(t, e);
        });
        t.addEventListener("input", function () {
          return Ba(t, e);
        });
        t.addEventListener("blur", function () {
          return Pa(t, e);
        });
        t.addEventListener("paste", function (n) {
          return Aa(n, t, e);
        });
      };
      for (var l = 0, u = [i, c]; l < u.length; l++) {
        s();
      }
    }
    return a;
  }
  function Sa(e) {
    $a(e, e.querySelector(".css-decls"), null);
  }
  function $a(e, t, n) {
    const r =
      t && t.classList.contains("css-decls")
        ? t
        : e.querySelector(".css-decls");
    if (r) {
      const a = Ta(e, "", "", true);
      if (n && n.parentElement === r) {
        r.insertBefore(a, n);
      } else {
        r.appendChild(a);
      }
      Ia(a.querySelector(".decl-prop"), e);
    }
  }
  function Aa(e, t, n) {
    if (t.isContentEditable) {
      const r =
        (e.clipboardData && e.clipboardData.getData("text/plain")) || "";
      if (r) {
        const a = t.closest(".decl-row.is-scratch");
        if (a) {
          ((e, t, n, r) => {
            const a = !la.has(n);
            const o = t.classList.contains("decl-prop");
            const i = Ma(r);
            const c = Oa(i);
            if (o) {
              if (!a || c.length === 0) {
                return;
              }
              e.preventDefault();
              Ra(t);
              const s = oa && oa.row === n ? oa : null;
              if (s) {
                oa = null;
                Qa(s);
              }
              n.remove();
              for (const d of c) {
                Ja(d.prop, d.value);
              }
              to();
              return void Va();
            }
            if (i.length < 2) {
              return;
            }
            const p = Oa(i.slice(1));
            if (p.length === 0) {
              return;
            }
            e.preventDefault();
            t.textContent = i[0].trim();
            Ya(n, t);
            Pa(t, null);
            for (const h of p) {
              Ja(h.prop, h.value);
            }
            to();
          })(e, t, a, r);
        } else {
          let o;
          const i = t.classList.contains("decl-prop");
          const c = Ma(r);
          const s = Oa(c);
          let l = null;
          if (i) {
            if (s.length === 0) {
              return;
            }
            o = s;
          } else {
            if (c.length < 2) {
              return;
            }
            const u = Oa(c.slice(1));
            if (u.length === 0) {
              return;
            }
            l = c[0].trim();
            o = u;
          }
          e.preventDefault();
          const d = t.closest(".decl-row");
          if (d) {
            const p = d.parentElement;
            const m = d.querySelector(".decl-prop");
            const f = d.querySelector(".decl-value");
            Ra(t);
            if (i) {
              const h = o.shift();
              m.dataset.raw = h.prop;
              m.textContent = h.prop;
              f.dataset.raw = h.value;
              f.innerHTML = Dt(Mn(h.value));
            } else {
              f.dataset.raw = l;
              f.innerHTML = Dt(Mn(l));
            }
            let v;
            const g = d.nextElementSibling;
            let y = d;
            const b = Fr(o);
            try {
              for (b.s(); !(v = b.n()).done;) {
                const w = v.value;
                const x = Ta(n, w.prop, w.value, true);
                p.insertBefore(x, g);
                y = x;
              }
            } catch (error) {
              b.e(error);
            } finally {
              b.f();
            }
            Da(n);
            $a(n, p, y.nextElementSibling);
          }
        }
      }
    }
  }
  function Ma(e) {
    let t = String(e).replace(/\/\*[\s\S]*?\*\//g, "");
    const n = t.indexOf("{");
    if (n !== -1) {
      const r = t.lastIndexOf("}");
      t = r > n ? t.slice(n + 1, r) : t.slice(n + 1);
    }
    const a = [];
    let o = 0;
    let i = null;
    let c = 0;
    for (let s = 0; s < t.length; s++) {
      const l = t[s];
      if (i) {
        if (l === i) {
          i = null;
        }
      } else if (l === '"' || l === "'") {
        i = l;
      } else if (l === "(") {
        o++;
      } else if (l === ")") {
        o = Math.max(0, o - 1);
      } else if (l === ";" && o === 0) {
        a.push(t.slice(c, s));
        c = s + 1;
      }
    }
    a.push(t.slice(c));
    return a.filter((e) => e.trim().length > 0);
  }
  function Oa(e) {
    let t;
    const n = [];
    const r = Fr(e);
    try {
      for (r.s(); !(t = r.n()).done;) {
        const a = t.value;
        const o = a.indexOf(":");
        if (!(o <= 0)) {
          const i = a.slice(0, o).trim();
          const c = a.slice(o + 1).trim();
          if (i && c && /^(--[\w-]+|[A-Za-z-]+)$/.test(i)) {
            n.push({
              prop: i,
              value: c,
            });
          }
        }
      }
    } catch (error) {
      r.e(error);
    } finally {
      r.f();
    }
    return n;
  }
  function Ia(e, t) {
    if (!e.isContentEditable) {
      e.dataset.committed = e.dataset.raw || "";
      e.textContent = e.dataset.raw || "";
      e.contentEditable = "plaintext-only";
      e.spellcheck = false;
      e.classList.add("is-editing");
      e.focus();
      const n = document.createRange();
      n.selectNodeContents(e);
      const r = window.getSelection();
      r.removeAllRanges();
      r.addRange(n);
      uo(e, t);
    }
  }
  function Ra(e) {
    e.contentEditable = "false";
    e.classList.remove("is-editing");
    ho();
  }
  function ja(e, t) {
    const e_currentTarget = e.currentTarget;
    if (e_currentTarget.isContentEditable) {
      if (vo()) {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            return void go(1);
          case "ArrowUp":
            e.preventDefault();
            return void go(-1);
          case "Enter":
          case "Tab":
            e.preventDefault();
            return void po(e_currentTarget, t);
          case "Escape":
            e.preventDefault();
            return void ho();
        }
      }
      if (
        (e.key !== "ArrowUp" && e.key !== "ArrowDown") ||
        !e_currentTarget.classList.contains("decl-value") ||
        !((e_currentTarget_1, t) => {
          const n = e_currentTarget_1.textContent || "";
          if (!n) {
            return false;
          }
          const computeR = (e) => {
            const t = window.getSelection();
            if (!t || t.rangeCount === 0) {
              return null;
            }
            const n = t.getRangeAt(0);
            if (!e.contains(n.startContainer) || !e.contains(n.endContainer)) {
              return null;
            }
            const r = n.cloneRange();
            r.selectNodeContents(e);
            r.setEnd(n.startContainer, n.startOffset);
            const length = r.toString().length;
            return {
              start: length,
              end: length + n.toString().length,
            };
          };
          const r = computeR(e_currentTarget_1);
          if (!r) {
            return false;
          }
          const computeA = (e) => {
            let t;
            const n = [];
            const r =
              /"(?:\\.|[^"\\])*"?|'(?:\\.|[^'\\])*'?|\burl\(\s*[^)]*\)?/gi;
            while ((t = r.exec(e))) {
              n.push([t.index, t.index + t[0].length]);
            }
            let a;
            const o = [];
            const i = /-?\d*\.?\d+/g;
            const c = () => {
              let a_index = a.index;
              let text = a[0];
              if (text.startsWith("-")) {
                const i = a_index > 0 ? e[a_index - 1] : "";
                if (i && !/[\s,(:]/.test(i)) {
                  if (/[a-zA-Z_-]/.test(i)) {
                    return 0;
                  }
                  a_index += 1;
                  text = text.slice(1);
                }
              }
              const c = a_index > 0 ? e[a_index - 1] : "";
              if (
                /[\w#.]/.test(c) ||
                n.some((e) => {
                  const n = Hr(e, 2);
                  const [r, a] = n;
                  return a_index >= r && a_index < a;
                })
              ) {
                return 0;
              }
              o.push({
                start: a_index,
                end: a_index + text.length,
                text,
              });
            };
            while ((a = i.exec(e))) {
              c();
            }
            return o;
          };
          const a = computeA(n);
          const o = a.find((e) => e.end >= r.start && e.start <= r.end);
          if (!o) {
            return false;
          }
          const i = t.altKey ? 0.1 : t.shiftKey ? 10 : 1;
          const c = t.key === "ArrowUp" ? 1 : -1;
          const s = Number.parseFloat(o.text);
          if (!Number.isFinite(s)) {
            return false;
          }
          const l = Math.max(
            ((d = o.text), (p = d.indexOf(".")), p < 0 ? 0 : d.length - p - 1),
            t.altKey ? 1 : 0,
          );
          let u = (s + c * i).toFixed(l);
          var d;
          var p;
          if (u.includes(".")) {
            u = u.replace(/\.?0+$/, "");
          }
          if (u === "-0") {
            u = "0";
          }
          e_currentTarget_1.textContent =
            n.slice(0, o.start) + u + n.slice(o.end);
          ((e, t, n) => {
            const e_ownerDocument = e.ownerDocument;
            const a = (t) => {
              const n = e_ownerDocument.createTreeWalker(
                e,
                NodeFilter.SHOW_TEXT,
              );
              for (let node = n.nextNode(), offset = t; node;) {
                const i = node.textContent.length;
                if (offset <= i) {
                  return {
                    node,
                    offset,
                  };
                }
                offset -= i;
                node = n.nextNode();
              }
              return null;
            };
            const o = a(t);
            const i = a(n);
            const c = e_ownerDocument.createRange();
            if (o && i) {
              c.setStart(o.node, o.offset);
              c.setEnd(i.node, i.offset);
            } else {
              c.selectNodeContents(e);
              c.collapse(false);
            }
            const s = window.getSelection();
            s.removeAllRanges();
            s.addRange(c);
          })(e_currentTarget_1, o.start, o.start + u.length);
          return true;
        })(e_currentTarget, e)
      ) {
        if (e.key === "Enter") {
          e.preventDefault();
          Pa(
            e_currentTarget,
            t,
            e_currentTarget.classList.contains("decl-prop")
              ? "value"
              : "insert",
          );
        } else if (e.key === "Tab") {
          e.preventDefault();
          Pa(
            e_currentTarget,
            t,
            e_currentTarget.classList.contains("decl-prop") ? "value" : "next",
          );
        } else if (e.key === "Escape") {
          e.preventDefault();
          e_currentTarget.textContent = e_currentTarget.dataset.committed || "";
          Pa(e_currentTarget, t);
        } else if (
          e.key === ":" &&
          e_currentTarget.classList.contains("decl-prop")
        ) {
          e.preventDefault();
          Pa(e_currentTarget, t, "value");
        } else if (
          e.key === ";" &&
          e_currentTarget.classList.contains("decl-value")
        ) {
          const r = e_currentTarget.textContent || "";
          if (
            bo(e_currentTarget) === r.length &&
            ((e) => {
              let t;
              let n = 0;
              let r = null;
              const a = Fr(e);
              try {
                for (a.s(); !(t = a.n()).done;) {
                  const o = t.value;
                  if (r) {
                    if (o === r) {
                      r = null;
                    }
                  } else if (o === '"' || o === "'") {
                    r = o;
                  } else if (o === "(") {
                    n++;
                  } else if (o === ")") {
                    n = Math.max(0, n - 1);
                  }
                }
              } catch (error) {
                a.e(error);
              } finally {
                a.f();
              }
              return !r && n === 0;
            })(r)
          ) {
            e.preventDefault();
            Pa(e_currentTarget, t, "next");
          }
        }
      } else {
        e.preventDefault();
        ho();
        const a = e_currentTarget.closest(".decl-row.is-scratch");
        if (a) {
          Ya(a, e_currentTarget);
        } else if (t) {
          Ua(t);
        }
      }
    }
  }
  function Ba(e, t) {
    if (e.isContentEditable) {
      const n = e.closest(".decl-row.is-scratch");
      if (n) {
        if (e.classList.contains("decl-value")) {
          Ya(n, e);
        }
        return void uo(e, t);
      }
      if (e.classList.contains("decl-value")) {
        Ua(t);
      }
      uo(e, t);
    }
  }
  function Pa(e, t, n = null) {
    if (e.isContentEditable) {
      const r = e.closest(".decl-row.is-scratch");
      if (r) {
        ((e, t, n) => {
          const r = !la.has(t);
          const a = oa && oa.row === t ? oa : null;
          const o = (e.textContent || "").trim();
          e.dataset.raw = o;
          Ra(e);
          if (r) {
            const i = t.querySelector(".decl-prop");
            const c = t.querySelector(".decl-value");
            const s = (i.dataset.raw || "").trim();
            const l = (c.dataset.raw || "").trim();
            if (n === "value" && s) {
              return void Ia(c, null);
            }
            if (a) {
              oa = null;
            }
            if (s && l) {
              if (!ia.has(ca(s))) {
                for (var u = t.previousElementSibling; u && !la.has(u);) {
                  u = u.previousElementSibling;
                }
                const d = u ? la.get(u) : null;
                if (d && ia.has(ca(d.prop))) {
                  ia.set(ca(s), ia.get(ca(d.prop)) + 0.5);
                }
              }
              if (a && a.targetRow && a.targetRow.isConnected) {
                const p = a.targetRow.querySelector(".decl-value");
                p.dataset.raw = Xa(a, l);
                p.innerHTML = Dt(Mn(p.dataset.raw));
                Da(ea);
              } else {
                Ja(s, l);
              }
              t.remove();
              to();
              if (n === "insert" || n === "next") {
                let m;
                let f = null;
                const h = Fr(ra ? ra.querySelectorAll(".decl-row") : []);
                try {
                  for (h.s(); !(m = h.n()).done;) {
                    const v = m.value;
                    const g = la.get(v);
                    if (g && ca(g.prop) === ca(s) && !g.meta.pseudoElement) {
                      f = v;
                      break;
                    }
                  }
                } catch (error) {
                  h.e(error);
                } finally {
                  h.f();
                }
                Va(f);
              }
            } else {
              if (a) {
                Qa(a);
              }
              t.remove();
              e.blur();
              to();
            }
            return;
          }
          const y = t.querySelector(".decl-value");
          if (!a) {
            return void (y.innerHTML = Dt(Mn(y.dataset.raw || "")));
          }
          oa = null;
          if (!o || o === a.original) {
            y.dataset.raw = a.original;
            y.innerHTML = Dt(Mn(a.original));
            Qa(a);
            e.blur();
            return void to();
          }
          Ka(a, o);
          to();
          if (n === "insert" || n === "next") {
            Va();
          }
        })(e, r, n);
      } else {
        const a = e.closest(".decl-row");
        const o = a ? a.parentElement : null;
        const i = a ? a.nextElementSibling : null;
        const c = (e.textContent || "").trim();
        e.dataset.raw = c;
        Ra(e);
        let s = false;
        if (a) {
          const l = a.querySelector(".decl-value");
          const u = (a.querySelector(".decl-prop").dataset.raw || "").trim();
          const d = (l.dataset.raw || "").trim();
          if (
            a.classList.contains("is-disabled") ||
            d ||
            (u && n === "value")
          ) {
            if (!l.isContentEditable) {
              l.innerHTML = Dt(Mn(l.dataset.raw || ""));
            }
          } else {
            a.remove();
            s = true;
          }
        }
        Da(t);
        if (s) {
          e.blur();
        } else if (n === "value" && a) {
          Ia(a.querySelector(".decl-value"), t);
        } else if (n === "insert") {
          $a(t, o, i);
        } else {
          if (n === "next") {
            if (i && i.classList.contains("decl-row")) {
              Ia(i.querySelector(".decl-prop"), t);
            } else {
              $a(t, o, i);
            }
          }
        }
      }
    }
  }
  function Da(e) {
    if (e && e.isConnected) {
      const t = Zr.get(e);
      if (t) {
        let n;
        const r = [];
        const a = Fr(e.querySelectorAll(".decl-row"));
        try {
          for (a.s(); !(n = a.n()).done;) {
            const o = n.value;
            if (!o.classList.contains("is-disabled")) {
              const i = o.querySelector(".decl-prop");
              const c = o.querySelector(".decl-value");
              const s = (
                i.isContentEditable ? i.textContent : i.dataset.raw || ""
              ).trim();
              const l = (
                c.isContentEditable ? c.textContent : c.dataset.raw || ""
              ).trim();
              if (s && l) {
                r.push(`${s}: ${l};`);
              }
            }
          }
        } catch (error) {
          a.e(error);
        } finally {
          a.f();
        }
        const u = r.join(" ");
        Ca({
          action: t.inline ? "inline_style_edit" : "rule_edit",
          ref: t,
          declsText: u,
        }).catch(() => {});
        to();
      }
    }
  }
  function Ua(e) {
    const t = Qr.get(e);
    if (t) {
      clearTimeout(t);
    }
    const n = setTimeout(() => {
      Qr.delete(e);
      Da(e);
    }, 120);
    Qr.set(e, n);
  }
  function Ha() {
    for (const n of Qr.values()) {
      clearTimeout(n);
    }
    Qr.clear();
  }
  function Fa() {
    const e = Br().mark(function e(t, wrappers) {
      let mediaActive;
      let a;
      let o;
      let i;
      let c;
      const s = arguments;
      return Br().wrap(
        function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                mediaActive = !(s.length > 2 && s[2] !== undefined) || s[2];
                if (Yr) {
                  e.next = 3;
                  break;
                }
                return e.abrupt("return");
              case 3:
                a = Yr + (Jr || "");
                o = null;
                e.prev = 5;
                e.next = 8;
                return Ca({
                  action: "rule_add",
                  selector: a,
                  wrappers,
                  scopePath,
                });
              case 8:
                o = e.sent;
                e.next = 13;
                break;
              case 11:
                e.prev = 11;
                e.t0 = e.catch(5);
              case 13:
                if (o && o.success && o.ownId != null) {
                  e.next = 15;
                  break;
                }
                return e.abrupt("return");
              case 15:
                i = _a(
                  {
                    ruleRef: {
                      own: o.ownId,
                    },
                    selector: a,
                    declsText: "",
                    readOnly: false,
                    selectorReadOnly: false,
                    source: {
                      name: "screen-ruler",
                      line: null,
                      full: null,
                    },
                    state: o.state || null,
                    states: Array.isArray(o.states)
                      ? o.states
                      : o.state
                        ? [o.state]
                        : [],
                    activeNow: o.activeNow !== false,
                    pseudoElement: o.pseudoElement || null,
                    specificity:
                      typeof o.specificity === "number" ? o.specificity : 0,
                    sourceIndex:
                      typeof o.sourceIndex === "number"
                        ? o.sourceIndex
                        : lo(o.ownId),
                    cascadeUnknown: o.cascadeUnknown === true,
                  },
                  {
                    mediaActive,
                    wrappersLabel: wrappers.length ? wrappers.join(" ") : null,
                  },
                );
                if ((c = t.firstElementChild) && c.nextElementSibling === ea) {
                  c = ea;
                }
                t.insertBefore(i, c ? c.nextSibling : null);
                i.scrollIntoView({
                  block: "nearest",
                });
                Sa(i);
              case 21:
              case "end":
                return e.stop();
            }
          }
        },
        e,
        null,
        [[5, 11]],
      );
    });
    Fa = function () {
      const t = this;
      const n = arguments;
      return new Promise((resolve, reject) => {
        const o = e.apply(t, n);
        function i(e) {
          Ur(o, resolve, reject, i, c, "next", e);
        }
        function c(e) {
          Ur(o, resolve, reject, i, c, "throw", e);
        }
        i(undefined);
      });
    };
    return Fa.apply(this, arguments);
  }
  function Ga(e) {
    const e_currentTarget = e.currentTarget;
    const r = e_currentTarget
      .closest(".scratch-card")
      ?.classList.contains("is-pseudo");
    const e_target = e.target;
    const o = e_target.closest ? e_target.closest(".decl-row") : null;
    if (o && e_target === o) {
      const i = la.get(o);
      if (!i) {
        return void e.preventDefault();
      }
      if (i.meta.pseudoElement) {
        return void (
          o.classList.contains("is-readonly") || (e.preventDefault(), za(o))
        );
      }
      if (o.classList.contains("is-readonly")) {
        return;
      }
      e.preventDefault();
      return void Va(o);
    }
    if (
      !(
        r ||
        (e_target !== e_currentTarget &&
          !e_target.classList.contains("css-decls"))
      )
    ) {
      e.preventDefault();
      Va();
    }
  }
  function qa(e) {
    const card = document.createElement("div");
    card.className = "scratch-card";
    const n = document.createElement("div");
    n.className = "css-rule is-scratch-body";
    const decls = document.createElement("div");
    decls.className = "css-decls";
    n.appendChild(decls);
    n.addEventListener("mousedown", Ga);
    card.appendChild(n);
    const a = document.createElement("div");
    a.className = "code-block-footer";
    const o = document.createElement("span");
    o.className = "footer-label";
    o.textContent = e;
    a.appendChild(o);
    card.appendChild(a);
    return {
      card,
      decls,
    };
  }
  function Wa(e) {
    const t = document.createElement("div");
    t.className = "decl-row is-scratch";
    la.set(t, e);
    const n = document.createElement("span");
    n.className = "decl-prop";
    n.textContent = e.prop;
    n.dataset.raw = e.prop;
    const r = document.createElement("span");
    r.className = "decl-value";
    r.dataset.raw = e.value;
    r.innerHTML = Dt(Mn(e.value));
    t.appendChild(n);
    t.appendChild(document.createTextNode(": "));
    t.appendChild(r);
    t.appendChild(document.createTextNode(";"));
    if (e.meta.state) {
      const a = document.createElement("span");
      a.className = "css-rule-badge";
      a.textContent = e.meta.state;
      t.appendChild(a);
    }
    const o = `${e.selectorText}${e.meta.sourceName ? ` (${e.meta.sourceName})` : ""}`;
    t.title = e.meta.inline
      ? "element.style"
      : e.meta.wrappersLabel
        ? `${e.meta.wrappersLabel} · ${o}`
        : o;
    if ((e.meta.state || e.meta.pseudoElement) && e.meta.readOnly) {
      return (
        t.classList.add("is-readonly"),
        t.addEventListener("mousedown", function (t) {
          t.preventDefault();
          ((e) => {
            if (!e || !e.isConnected) {
              return;
            }
            e.scrollIntoView({
              block: "center",
              behavior: "smooth",
            });
            e.classList.remove("is-flash");
            e.offsetWidth;
            e.classList.add("is-flash");
            e.addEventListener(
              "animationend",
              function () {
                return e.classList.remove("is-flash");
              },
              {
                once: true,
              },
            );
          })(e.block);
        }),
        t
      );
    }
    return (
      n.addEventListener("mousedown", function (e) {
        if (!r.isContentEditable) {
          e.preventDefault();
          za(t);
        }
      }),
      r.addEventListener("mousedown", function (e) {
        if (!r.isContentEditable) {
          e.preventDefault();
          za(t);
        }
      }),
      r.addEventListener("keydown", function (e) {
        return ja(e, null);
      }),
      r.addEventListener("input", function () {
        return Ba(r, null);
      }),
      r.addEventListener("blur", function () {
        return Pa(r, null);
      }),
      r.addEventListener("paste", function (e) {
        return Aa(e, r, null);
      }),
      t
    );
  }
  function Va(e = null) {
    if (ra) {
      const t = document.createElement("div");
      t.className = "decl-row is-scratch";
      const n = document.createElement("span");
      n.className = "decl-prop";
      n.dataset.raw = "";
      const r = document.createElement("span");
      r.className = "decl-value";
      r.dataset.raw = "";
      t.appendChild(n);
      t.appendChild(document.createTextNode(": "));
      t.appendChild(r);
      t.appendChild(document.createTextNode(";"));
      const a = () => {
        const e = i[o];
        e.addEventListener("mousedown", function (t) {
          if (!e.isContentEditable) {
            t.preventDefault();
            const a = e === n ? r : n;
            if (a.isContentEditable) {
              a.dataset.raw = (a.textContent || "").trim();
              Ra(a);
            }
            Ia(e, null);
          }
        });
        e.addEventListener("keydown", function (e) {
          return ja(e, null);
        });
        e.addEventListener("input", function () {
          return Ba(e, null);
        });
        e.addEventListener("blur", function () {
          return Pa(e, null);
        });
        e.addEventListener("paste", function (t) {
          return Aa(t, e, null);
        });
      };
      for (var o = 0, i = [n, r]; o < i.length; o++) {
        a();
      }
      if (e && e.parentElement === ra) {
        ra.insertBefore(t, e.nextSibling);
      } else {
        ra.appendChild(t);
      }
      Ia(n, null);
    }
  }
  function za(e) {
    const entry = la.get(e);
    if (entry) {
      const n = e.querySelector(".decl-value");
      if (!n.isContentEditable) {
        Ia(n, null);
        oa = {
          kind:
            entry.meta.inline || entry.meta.state || entry.meta.pseudoElement
              ? "owner"
              : "override",
          row: e,
          entry,
          original: n.dataset.raw || "",
          ownerValuePrev: null,
          targetRow: null,
          targetProp: null,
          targetPrev: null,
          createdRow: null,
        };
      }
    }
  }
  function Ya(e, t) {
    const n = la.get(e);
    const r = (t.textContent || "").trim();
    if (n) {
      if (!oa || oa.row !== e) {
        return;
      }
      Ka(oa, r, null, true);
    } else {
      const a = ((e.querySelector(".decl-prop") || {}).dataset || {}).raw || "";
      if (a.trim()) {
        if (!(oa && oa.row === e)) {
          oa = {
            kind: "new",
            row: e,
            entry: null,
            original: "",
            ownerValuePrev: null,
            targetRow: null,
            targetProp: null,
            targetPrev: null,
            createdRow: null,
          };
        }
        Ka(oa, r, a.trim(), true);
      }
    }
  }
  function Ka(e, t, n = null) {
    const r =
      arguments.length > 3 && arguments[3] !== undefined && arguments[3];
    if (e.kind === "owner") {
      const a = e.entry.row.querySelector(".decl-value");
      if (!a || a.isContentEditable) {
        return;
      }
      if (e.ownerValuePrev == null) {
        e.ownerValuePrev = a.dataset.raw || "";
      }
      a.dataset.raw = t;
      a.innerHTML = Dt(Mn(t));
      return void (r ? Ua(e.entry.block) : Da(e.entry.block));
    }
    if (ea) {
      const o = e.kind === "new" ? n : e.entry.prop;
      if (o) {
        const i = Xa(e, t);
        ((e, t) => {
          if (e.targetRow && e.targetProp === t && e.targetRow.isConnected) {
            return;
          }
          if (e.targetRow && e.targetProp !== t) {
            Za(e);
          }
          const n = eo(t);
          if (n) {
            e.targetRow = n;
            e.targetPrev = n.querySelector(".decl-value").dataset.raw || "";
          } else {
            const r = ea.querySelector(".css-decls");
            const a = Ta(ea, t, "", true);
            r.appendChild(a);
            e.targetRow = a;
            e.createdRow = a;
            e.targetPrev = null;
          }
          e.targetProp = t;
        })(e, o);
        if (e.targetRow) {
          const c = e.targetRow.querySelector(".decl-value");
          c.dataset.raw = i;
          if (!c.isContentEditable) {
            c.innerHTML = Dt(Mn(i));
          }
          if (r) {
            Ua(ea);
          } else {
            Da(ea);
          }
        }
      }
    }
  }
  function Xa(e, t) {
    if (
      e.kind === "override" &&
      e.entry.important &&
      t &&
      !/!\s*important\s*$/i.test(t)
    ) {
      return `${t} !important`;
    }
    return t;
  }
  function Za(e) {
    if (e.createdRow && e.createdRow.isConnected) {
      e.createdRow.remove();
    } else if (e.targetRow && e.targetRow.isConnected && e.targetPrev != null) {
      const t = e.targetRow.querySelector(".decl-value");
      t.dataset.raw = e.targetPrev;
      if (!t.isContentEditable) {
        t.innerHTML = Dt(Mn(e.targetPrev));
      }
    }
    e.targetRow = null;
    e.targetProp = null;
    e.targetPrev = null;
    e.createdRow = null;
  }
  function Qa(e) {
    if (e.kind !== "owner") {
      if (e.targetRow || e.createdRow) {
        Za(e);
        Da(ea);
      }
    } else if (e.ownerValuePrev != null) {
      const t = e.entry.row.querySelector(".decl-value");
      if (t && !t.isContentEditable) {
        t.dataset.raw = e.ownerValuePrev;
        t.innerHTML = Dt(Mn(e.ownerValuePrev));
        Da(e.entry.block);
      }
    }
  }
  function Ja(e, t) {
    if (ea) {
      const n = eo(e);
      if (n) {
        const r = n.querySelector(".decl-value");
        r.dataset.raw = t;
        if (!r.isContentEditable) {
          r.innerHTML = Dt(Mn(t));
        }
      } else {
        ea.querySelector(".css-decls").appendChild(Ta(ea, e, t, true));
      }
      Da(ea);
    }
  }
  function eo(e) {
    if (!ea) {
      return null;
    }
    let t;
    const n = e.startsWith("--") ? e : e.toLowerCase();
    const r = Fr(ea.querySelectorAll(".decl-row"));
    try {
      for (r.s(); !(t = r.n()).done;) {
        const a = t.value;
        if (!a.classList.contains("is-disabled")) {
          const o = a.querySelector(".decl-prop");
          if (o) {
            const i = (o.dataset.raw || "").trim();
            if ((i.startsWith("--") ? i : i.toLowerCase()) === n) {
              return a;
            }
          }
        }
      }
    } catch (error) {
      r.e(error);
    } finally {
      r.f();
    }
    return null;
  }
  function to() {
    const e = document.getElementById("edit_css-sections");
    if (e) {
      for (const r of e.querySelectorAll(
        ".decl-row.is-overridden, .decl-row.is-not-inherited, .decl-row.is-ghost",
      )) {
        const a = r.classList.contains("is-scratch");
        r.classList.remove("is-overridden");
        r.classList.remove("is-not-inherited");
        r.classList.remove("is-ghost");
        if (!a) {
          r.removeAttribute("title");
        }
      }
      let o;
      const computeI = (e) => {
        let t;
        const n = [];
        const r = Fr(e.querySelectorAll(".css-rule"));
        try {
          for (r.s(); !(t = r.n()).done;) {
            const block = t.value;
            const meta = sa.get(block);
            if (meta && meta.mediaActive && !meta.cascadeUnknown) {
              const i = block.querySelector(".css-rule-selector-text");
              const selectorText = meta.inline
                ? "element.style"
                : i
                  ? i.textContent
                  : "";
              if (meta.states && meta.states.length) {
                if (!Jr || !meta.states.includes(Jr)) {
                  continue;
                }
              } else if (!meta.inline && meta.activeNow === false) {
                continue;
              }
              for (const u of block.querySelectorAll(".decl-row")) {
                const d = u.querySelector(".decl-prop");
                const p = u.querySelector(".decl-value");
                if (d && p) {
                  const m = (
                    (d.isContentEditable ? d.textContent : d.dataset.raw) || ""
                  ).trim();
                  const f = (
                    (p.isContentEditable ? p.textContent : p.dataset.raw) || ""
                  ).trim();
                  if (m && f) {
                    const invalid = co(m, f);
                    const v = so(m, f);
                    const g = v.longhands.length
                      ? v.longhands
                      : invalid
                        ? [m.toLowerCase()]
                        : null;
                    if (g) {
                      if (
                        (meta.inheritedDepth || 0) > 0 &&
                        !invalid &&
                        !g.some((e) => e === "all" || ro(e, ma))
                      ) {
                        u.classList.add("is-not-inherited");
                        u.title =
                          chrome.i18n.getMessage("TITLE_NOT_INHERITED") ||
                          "Not inherited by this element";
                      } else if (!u.classList.contains("is-disabled")) {
                        n.push({
                          block,
                          row: u,
                          meta,
                          prop: m,
                          value: f,
                          selectorText,
                          invalid,
                          important: v.important,
                          longhands: g,
                          sitOut: !invalid && g.length === 1 && g[0] === "all",
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          r.e(error);
        } finally {
          r.f();
        }
        return n;
      };
      const i = computeI(e);
      const c = i.filter((e) => !e.invalid && !e.sitOut);
      const s = new Map();
      const l = Fr(c);
      try {
        for (l.s(); !(o = l.n()).done;) {
          const u = o.value;
          const d = u.meta.inheritedDepth || 0;
          let p = s.get(d);
          if (!p) {
            s.set(d, (p = []));
          }
          p.push(u);
        }
      } catch (error) {
        l.e(error);
      } finally {
        l.f();
      }
      let m;
      const f = Dr(s.keys())
        .sort((e, t) => e - t)
        .map((depth) => ({
          depth,
          entries: s.get(depth),
        }));
      const computeH = (e) => {
        let t;
        const n = (e) => {
          const t = String(e.value || "")
            .replace(/!\s*important\s*$/i, "")
            .trim()
            .toLowerCase();
          return (
            t === "inherit" ||
            t === "unset" ||
            t === "revert" ||
            t === "revert-layer" ||
            t.includes("var(")
          );
        };
        let winnersByTarget_1 = new Map();
        const baseWinners_1 = new Map();
        const o = new Set();
        const i = Fr(e);
        try {
          for (i.s(); !(t = i.n()).done;) {
            const c = t.value;
            if (c.depth !== 0) {
              let s;
              const l = [];
              const u = Fr(c.entries);
              try {
                for (u.s(); !(s = u.n()).done;) {
                  const source = s.value;
                  const p = source.longhands.filter(
                    (e) => !o.has(e) && ro(e, ma),
                  );
                  if (p.length) {
                    l.push({
                      entry: Vr(
                        Vr({}, source),
                        {},
                        {
                          longhands: p,
                        },
                      ),
                      source,
                    });
                  }
                }
              } catch (error) {
                u.e(error);
              } finally {
                u.f();
              }
              if (l.length) {
                const m = ao(l.map((e) => e.entry)).get("");
                if (m) {
                  let f;
                  const h = new Map(l.map((e) => [e.entry, e.source]));
                  const v = Fr(m);
                  try {
                    for (v.s(); !(f = v.n()).done;) {
                      const g = Hr(f.value, 2);
                      const [y, b] = g;
                      const w = h.get(b) || b;
                      let x = baseWinners_1.get(y);
                      if (!x) {
                        baseWinners_1.set(y, (x = []));
                      }
                      x.push(w);
                      if (!n(w)) {
                        o.add(y);
                      }
                    }
                  } catch (error) {
                    v.e(error);
                  } finally {
                    v.f();
                  }
                }
              }
            } else {
              const E = (winnersByTarget_1 = ao(c.entries)).get("");
              if (E) {
                for (const [k, _] of E) {
                  baseWinners_1.set(k, [_]);
                  if (!n(_)) {
                    o.add(k);
                  }
                }
              }
            }
          }
        } catch (error) {
          i.e(error);
        } finally {
          i.f();
        }
        return {
          winnersByTarget: winnersByTarget_1,
          baseWinners: baseWinners_1,
        };
      };
      const h = computeH(f);
      const { winnersByTarget, baseWinners } = h;
      const y = Fr(i);
      try {
        const b = () => {
          const m_value = m.value;
          if (m_value.invalid || m_value.sitOut) {
            return 0;
          }
          if ((m_value.meta.inheritedDepth || 0) === 0) {
            const t = winnersByTarget.get(m_value.meta.pseudoElement || "");
            if (!t) {
              return 0;
            }
            if (m_value.longhands.some((n) => t.get(n) === m_value)) {
              return 0;
            }
            m_value.row.classList.add("is-overridden");
            const n = t.get(m_value.longhands[0]);
            const r = n ? oo(n) : "";
            if (r) {
              m_value.row.title =
                chrome.i18n.getMessage("TITLE_OVERRIDDEN_BY", [r]) ||
                `Overridden by ${r}`;
            }
            return 0;
          }
          const a = m_value.longhands.filter((e) => ro(e, ma));
          if (a.some((t) => (baseWinners.get(t) || []).includes(m_value))) {
            return 0;
          }
          m_value.row.classList.add("is-overridden");
          const o = baseWinners.get(a[0] || m_value.longhands[0]);
          const i = o && o[0];
          const c = i ? oo(i) : "";
          if (c) {
            m_value.row.title =
              chrome.i18n.getMessage("TITLE_OVERRIDDEN_BY", [c]) ||
              `Overridden by ${c}`;
          }
        };
        for (y.s(); !(m = y.n()).done;) {
          b();
        }
      } catch (error) {
        y.e(error);
      } finally {
        y.f();
      }
      for (const E of e.querySelectorAll(".decl-row")) {
        if (
          !E.querySelector(".is-editing") &&
          (!oa || !(oa.targetRow === E || (oa.entry && oa.entry.row === E)))
        ) {
          const C = E.querySelector(".decl-prop");
          const L = E.querySelector(".decl-value");
          if (C && L) {
            const N = (C.dataset.raw || "").trim();
            const k = (L.dataset.raw || "").trim();
            const _ = N && k ? co(N, k) : "";
            const T =
              E.classList.contains("is-invalid-prop") ||
              E.classList.contains("is-invalid-value");
            E.classList.toggle("is-invalid-prop", _ === "property");
            E.classList.toggle("is-invalid-value", _ === "value");
            switch (_) {
              case "property":
                E.title =
                  chrome.i18n.getMessage("TITLE_INVALID_PROPERTY") ||
                  "Unknown property";
                break;
              case "value":
                E.title =
                  chrome.i18n.getMessage("TITLE_INVALID_VALUE") ||
                  "Invalid value";
                break;
              default:
                if (T && !E.classList.contains("is-overridden")) {
                  E.removeAttribute("title");
                }
            }
          }
        }
      }
      ((e, winnersByTarget_1) => {
        if (!ra || !aa) {
          return;
        }
        if (oa || aa.querySelector(".is-editing")) {
          return;
        }
        ra.replaceChildren();
        let n;
        const r = function (e, t) {
          return e.prop.localeCompare(t.prop);
        };
        const a = (e) => winnersByTarget_1.get(e) || new Map();
        const o = (t) => {
          const n = a(t);
          return e
            .filter(
              (e) =>
                (e.meta.pseudoElement || "") === t &&
                (e.longhands.some((t) => n.get(t) === e) ||
                  (e.invalid && e.meta.inline && !t)),
            )
            .sort(r);
        };
        const i = o("");
        const c = i
          .filter((e) => ia.has(ca(e.prop)))
          .sort((e, t) => ia.get(ca(e.prop)) - ia.get(ca(t.prop)));
        const s = i.filter((e) => !ia.has(ca(e.prop)));
        const l = [...Dr(c), ...Dr(s)];
        let u = ia.size ? Math.max(...Dr(ia.values())) + 1 : 0;
        const d = Fr(s);
        try {
          for (d.s(); !(n = d.n()).done;) {
            const p = n.value;
            if (!ia.has(ca(p.prop))) {
              ia.set(ca(p.prop), u++);
            }
          }
        } catch (error) {
          d.e(error);
        } finally {
          d.f();
        }
        for (const h of l) {
          const v = Wa(h);
          if (h.invalid) {
            v.classList.add(
              h.invalid === "property" ? "is-invalid-prop" : "is-invalid-value",
            );
            v.title =
              chrome.i18n.getMessage(
                h.invalid === "property"
                  ? "TITLE_INVALID_PROPERTY"
                  : "TITLE_INVALID_VALUE",
              ) ||
              (h.invalid === "property" ? "Unknown property" : "Invalid value");
          }
          ra.appendChild(v);
        }
        for (const g of aa.querySelectorAll(".scratch-card.is-pseudo")) {
          g.remove();
        }
        let b;
        const w = (e) => {
          const t = e.replace(/^:+/, "");
          switch (t) {
            case "before":
              return 0;
            case "after":
              return 1;
            default:
              return 2;
          }
        };
        const x = Dr(winnersByTarget_1.keys())
          .filter((e) => e)
          .sort((e, t) => w(e) - w(t) || e.localeCompare(t));
        let E = 0;
        const C = Fr(x);
        try {
          for (C.s(); !(b = C.n()).done;) {
            const L = b.value;
            const N = o(L);
            if (N.length) {
              const k = qa(L.replace(/^:+/, ":"));
              const { card, decls } = k;
              card.classList.add("is-pseudo");
              for (const A of N) {
                decls.appendChild(Wa(A));
              }
              aa.appendChild(card);
              E++;
            }
          }
        } catch (error) {
          C.e(error);
        } finally {
          C.f();
        }
        const M = !!ra.childElementCount;
        const O = ra.closest(".scratch-card");
        if (O) {
          O.classList.toggle("hidden", !M);
        }
        aa.classList.toggle("hidden", !M && !E);
      })(
        i.filter((e) => !(e.meta.inheritedDepth > 0)),
        winnersByTarget,
      );
      ((e, winnersByTarget_1) => {
        const n = ++ta;
        if (document.hidden || oa || Jr) {
          return;
        }
        const r = document.getElementById("edit_css-sections");
        if (!r || r.querySelector(".is-editing")) {
          return;
        }
        let a;
        const o = /:(hover|active|focus-within|focus-visible|focus)/;
        let stateSensitive = false;
        const c = Fr(r.querySelectorAll(".css-rule"));
        try {
          for (c.s(); !(a = c.n()).done;) {
            const s = a.value;
            const l = sa.get(s);
            if (l) {
              if (l.cascadeUnknown) {
                return;
              }
              if (l.states && l.states.length) {
                stateSensitive = true;
              }
              if (!stateSensitive) {
                const u = s.querySelector(".css-rule-selector-text");
                if (u && o.test(u.textContent)) {
                  stateSensitive = true;
                }
              }
            }
          }
        } catch (error) {
          c.e(error);
        } finally {
          c.f();
        }
        const d = winnersByTarget_1.get("");
        if (!d) {
          return;
        }
        let p;
        const declarations = [];
        const f = [];
        const h = Fr(e);
        try {
          const v = () => {
            const p_value = p.value;
            if (p_value.meta.pseudoElement) {
              return 0;
            }
            if (p_value.meta.states && p_value.meta.states.length) {
              return 0;
            }
            if ((p_value.meta.inheritedDepth || 0) > 0) {
              return 0;
            }
            if (o.test(p_value.selectorText)) {
              return 0;
            }
            const t = p_value.longhands.filter((t) => d.get(t) === p_value);
            if (!t.length) {
              return 0;
            }
            declarations.push({
              id: declarations.length,
              prop: p_value.prop,
              value: p_value.value.replace(/\s*!\s*important\s*$/i, ""),
              longhands: t,
            });
            f.push(p_value);
          };
          for (h.s(); !(p = h.n()).done;) {
            v();
          }
        } catch (error) {
          h.e(error);
        } finally {
          h.f();
        }
        if (!declarations.length) {
          return;
        }
        requestAnimationFrame(() => {
          if (!(n !== ta || document.hidden)) {
            Ca({
              action: "cascade_ghost_probe",
              declarations,
              paySeq,
              stateSensitive,
            })
              .then((e) => {
                if (n === ta && e && e.success && Array.isArray(e.flagged)) {
                  ((e) => {
                    let t;
                    const n =
                      (na > 0
                        ? chrome.i18n.getMessage(
                            "TITLE_OVERRIDDEN_HIDDEN_GRANT",
                          )
                        : chrome.i18n.getMessage("TITLE_OVERRIDDEN_HIDDEN")) ||
                      "Overridden by a stylesheet Bo doi can't see";
                    const r = new Set(e);
                    const a = Fr(e);
                    try {
                      for (a.s(); !(t = a.n()).done;) {
                        const o = t.value;
                        if (o.row.isConnected) {
                          o.row.classList.add("is-ghost");
                          o.row.title = n;
                        }
                      }
                    } catch (error) {
                      a.e(error);
                    } finally {
                      a.f();
                    }
                    if (!ra) {
                      return;
                    }
                    for (const s of ra.querySelectorAll(".decl-row")) {
                      const l = la.get(s);
                      if (l && r.has(l)) {
                        s.classList.add("is-ghost");
                      }
                    }
                  })(e.flagged.map((e) => f[e]).filter(Boolean));
                }
              })
              .catch(() => {});
          }
        });
      })(c, winnersByTarget);
    }
  }
  document.addEventListener(
    "scroll",
    function (e) {
      if (!vo()) {
        return;
      }
      if (fa.contains(e.target)) {
        return;
      }
      if (Date.now() - Ea < 150) {
        return void fo();
      }
      ho();
    },
    true,
  );
  var no = new Set([
    "color",
    "line-height",
    "letter-spacing",
    "word-spacing",
    "text-align",
    "text-align-last",
    "text-indent",
    "text-transform",
    "text-shadow",
    "text-rendering",
    "white-space-collapse",
    "text-wrap-mode",
    "text-wrap-style",
    "text-emphasis-style",
    "text-emphasis-color",
    "text-emphasis-position",
    "word-break",
    "line-break",
    "overflow-wrap",
    "hyphens",
    "tab-size",
    "visibility",
    "cursor",
    "direction",
    "writing-mode",
    "text-orientation",
    "quotes",
    "orphans",
    "widows",
    "list-style-type",
    "list-style-position",
    "list-style-image",
    "caption-side",
    "border-collapse",
    "empty-cells",
    "-webkit-border-horizontal-spacing",
    "-webkit-border-vertical-spacing",
    "color-scheme",
    "accent-color",
    "caret-color",
    "pointer-events",
    "image-rendering",
    "paint-order",
    "scrollbar-color",
    "text-underline-offset",
    "text-underline-position",
    "text-decoration-skip-ink",
    "-webkit-text-stroke-width",
    "-webkit-text-stroke-color",
    "-webkit-text-fill-color",
    "math-depth",
    "math-style",
    "print-color-adjust",
    "forced-color-adjust",
    "ruby-align",
    "ruby-position",
  ]);
  function ro(e, t) {
    if (e.startsWith("--")) {
      return !(t && t.get(e) === false);
    }
    return e.startsWith("font-") || no.has(e);
  }
  function ao(e) {
    let t;
    const r = new Map();
    const a = (e) => {
      let n;
      let a;
      const t = e.meta.pseudoElement || "";
      if (!(n = r.get(t))) {
        n = new Map();
        r.set(t, n);
      }
      const o = n;
      const i = Fr(e.longhands);
      try {
        for (i.s(); !(a = i.n()).done;) {
          const c = a.value;
          o.set(c, e);
        }
      } catch (error) {
        i.e(error);
      } finally {
        i.f();
      }
    };
    const o = (e) => {
      if (typeof e.meta.layerRank === "number") {
        return e.meta.layerRank;
      }
      return -1;
    };
    const i = (e) => {
      if (o(e) < 0) {
        return Number.MAX_SAFE_INTEGER;
      }
      return o(e);
    };
    const c = (e) => {
      if (o(e) < 0) {
        return -1;
      }
      return Number.MAX_SAFE_INTEGER - o(e);
    };
    const s = (e) => e.meta.scopeDepth || 0;
    const l = (e) => {
      if (e.meta.inline) {
        return 1;
      }
      return 0;
    };
    const u = e.filter((e) => e.meta.inline);
    const d = e.filter((e) => !e.meta.state);
    const p = e
      .filter((e) => e.meta.state)
      .sort(
        (e, t) =>
          e.meta.specificity - t.meta.specificity ||
          e.meta.sourceIndex - t.meta.sourceIndex,
      );
    const m = Fr(
      Dr(d).sort(
        (e, t) =>
          s(t) - s(e) ||
          l(e) - l(t) ||
          i(e) - i(t) ||
          e.meta.specificity - t.meta.specificity ||
          e.meta.sourceIndex - t.meta.sourceIndex,
      ),
    );
    try {
      for (m.s(); !(t = m.n()).done;) {
        const f = t.value;
        if (!f.important) {
          a(f);
        }
      }
    } catch (error) {
      m.e(error);
    } finally {
      m.f();
    }
    for (const g of Dr(d).sort(
      (e, t) =>
        s(e) - s(t) ||
        l(e) - l(t) ||
        c(e) - c(t) ||
        e.meta.specificity - t.meta.specificity ||
        e.meta.sourceIndex - t.meta.sourceIndex,
    )) {
      if (g.important) {
        a(g);
      }
    }
    for (const w of p) {
      if (!w.important) {
        a(w);
      }
    }
    for (const C of p) {
      if (C.important) {
        a(C);
      }
    }
    for (const k of u) {
      if (k.important && k.meta.state) {
        a(k);
      }
    }
    return r;
  }
  function oo(e) {
    if (e.meta.inline) {
      return "element.style";
    }
    return e.selectorText;
  }
  var io = new Map();
  function co(e, t) {
    if (e.startsWith("--")) {
      return "";
    }
    const n = `${e}\x00${t}`;
    const r = io.get(n);
    if (r != null) {
      return r;
    }
    const a = t.replace(/!\s*important\s*$/i, "").trim();
    let o = "";
    if (CSS.supports(e, "initial")) {
      if (!(a && CSS.supports(e, a))) {
        o = "value";
      }
    } else {
      o = "property";
    }
    if (io.size > 2000) {
      io.clear();
    }
    io.set(n, o);
    return o;
  }
  function so(e, t) {
    const n = `${e}\x00${t}`;
    const r = ua.get(n);
    if (r) {
      return r;
    }
    let a;
    let important = false;
    let i = t;
    const c = t.match(/^([\s\S]*?)\s*!\s*important\s*$/i);
    if (c) {
      important = true;
      i = c[1];
    }
    if (e.startsWith("--")) {
      a = [e];
    } else {
      da.style.cssText = "";
      try {
        da.style.setProperty(e.toLowerCase(), i);
      } catch (e) {}
      if (!(a = Array.from(da.style)).length) {
        a = CSS.supports(e.toLowerCase(), "initial") ? [] : [e.toLowerCase()];
      }
    }
    const s = {
      longhands: a,
      important,
    };
    if (ua.size > 2000) {
      ua.clear();
    }
    ua.set(n, s);
    return s;
  }
  function lo(e) {
    const t = Number.parseInt(String(e).replace(/\D+/g, ""), 10);
    return 1000000000 + (Number.isFinite(t) ? t : 0);
  }
  function uo(e, t) {
    const n = e.classList.contains("decl-prop");
    const r = e.textContent || "";
    const a = bo(e);
    if (a == null) {
      return ho();
    }
    const o = r.slice(0, a);
    let i = null;
    if (n) {
      const c = o.match(/[-a-zA-Z]*$/);
      i = {
        kind: "property",
        token: c[0],
        start: a - c[0].length,
        end: a,
        items: Vn(Wn(), c[0]),
      };
    } else {
      const s = o.match(/var\(\s*([-\w]*)$/);
      if (s) {
        i = {
          kind: "var",
          token: s[1],
          start: a - s[1].length,
          end: a,
          items: Vn(Xr, s[1]),
        };
      } else {
        let l;
        const u = o.match(/[-a-zA-Z]*$/);
        const d = e.closest(".decl-row");
        const p = d
          ? (d.querySelector(".decl-prop").dataset.raw || "")
              .trim()
              .toLowerCase()
          : "";
        const m = Dr(mn[p] || []);
        const f = Fr(pn);
        try {
          for (f.s(); !(l = f.n()).done;) {
            const h = l.value;
            if (!m.includes(h)) {
              m.push(h);
            }
          }
        } catch (error) {
          f.e(error);
        } finally {
          f.f();
        }
        i = {
          kind: "value",
          token: u[0],
          start: a - u[0].length,
          end: a,
          items: Vn(m, u[0]),
        };
      }
    }
    const v = i.token.toLowerCase();
    if (v || i.kind === "var") {
      if (
        !i.items.length ||
        (i.items.length === 1 && i.items[0].toLowerCase() === v)
      ) {
        return ho();
      }
      return (
        (ga = e),
        (ha = i.items),
        (ya = v),
        (ba = i.kind),
        (wa = i.start),
        (xa = i.end),
        (va = 0),
        (() => {
          if (fa) {
            return fa;
          }
          const e = document.createElement("div");
          e.className = "css-autocomplete";
          e.addEventListener("mousedown", function (e) {
            e.preventDefault();
            const t = e.target.closest(".css-autocomplete-item");
            if (t) {
              va = Number(t.dataset.index);
              const n = ga;
              const r = n ? n.closest(".css-rule") : null;
              po(n, r);
            }
          });
          document.body.appendChild(e);
          fa = e;
        })(),
        mo(),
        fa.classList.add("is-open"),
        (Ea = Date.now()),
        void fo()
      );
    }
    return ho();
  }
  function po(e, t) {
    if (e && ha.length) {
      const n = ha[va >= 0 ? va : 0];
      const r = e.textContent || "";
      let a = n;
      if (!(ba !== "var" || r.slice(xa).startsWith(")"))) {
        a = `${n})`;
      }
      const o = r.slice(0, wa) + a + r.slice(xa);
      e.textContent = o;
      ((e, t) => {
        const e_ownerDocument = e.ownerDocument;
        const r = e_ownerDocument.createRange();
        const a = e_ownerDocument.createTreeWalker(e, NodeFilter.SHOW_TEXT);
        let o = a.nextNode();
        let i = t;
        while (o) {
          const c = o.textContent.length;
          if (i <= c) {
            r.setStart(o, i);
            r.collapse(true);
            const s = window.getSelection();
            s.removeAllRanges();
            return void s.addRange(r);
          }
          i -= c;
          o = a.nextNode();
        }
        r.selectNodeContents(e);
        r.collapse(false);
        const l = window.getSelection();
        l.removeAllRanges();
        l.addRange(r);
      })(e, wa + a.length);
      ho();
      if (ba === "property" || e.classList.contains("decl-prop")) {
        Pa(e, t, "value");
      } else {
        const i = e.closest(".decl-row.is-scratch");
        if (i) {
          Ya(i, e);
        } else if (t) {
          Ua(t);
        }
      }
    }
  }
  function mo() {
    fa.replaceChildren();
    ha.forEach((e, t) => {
      const n = document.createElement("div");
      n.className = `css-autocomplete-item${t === va ? " is-active" : ""}`;
      n.dataset.index = String(t);
      const r = ya ? e.toLowerCase().indexOf(ya) : -1;
      if (r < 0) {
        n.textContent = e;
      } else {
        if (r > 0) {
          n.appendChild(document.createTextNode(e.slice(0, r)));
        }
        const a = document.createElement("span");
        a.className = "css-autocomplete-match";
        a.textContent = e.slice(r, r + ya.length);
        n.appendChild(a);
        const o = e.slice(r + ya.length);
        if (o) {
          n.appendChild(document.createTextNode(o));
        }
      }
      fa.appendChild(n);
    });
  }
  function fo() {
    const e = window.getSelection();
    if (e && e.rangeCount !== 0) {
      let t = e.getRangeAt(0).getBoundingClientRect();
      if (!(t.width || t.height || t.top || t.left || !ga)) {
        t = ga.getBoundingClientRect();
      }
      const { offsetWidth, offsetHeight } = fa;
      let a = t.bottom + 2;
      if (a + offsetHeight > window.innerHeight - 4) {
        a = t.top - offsetHeight - 2;
      }
      const o = Math.max(
        4,
        Math.min(t.left, window.innerWidth - offsetWidth - 4),
      );
      fa.style.left = `${o}px`;
      fa.style.top = `${Math.max(4, a)}px`;
    }
  }
  function ho() {
    if (fa) {
      fa.classList.remove("is-open");
    }
    ha = [];
    va = -1;
    ga = null;
  }
  function vo() {
    return fa && fa.classList.contains("is-open") && ha.length > 0;
  }
  function go(e) {
    let t;
    if (ha.length) {
      va = Math.max(0, Math.min(va + e, ha.length - 1));
      mo();
      if (
        !(
          (t = fa.querySelector(".css-autocomplete-item.is-active")) === null ||
          t === undefined
        )
      ) {
        t.scrollIntoView({
          block: "center",
        });
      }
    }
  }
  function yo(e) {
    let t;
    const n = [];
    const r = Fr(Ma(String(e || "").replace(/\/\*[\s\S]*?\*\//g, "")));
    try {
      for (r.s(); !(t = r.n()).done;) {
        const a = t.value;
        const o = a.indexOf(":");
        if (!(o < 0)) {
          const i = a.slice(0, o).trim().toLowerCase();
          const c = a.slice(o + 1).trim();
          if (i && c) {
            n.push([i, c]);
          }
        }
      }
    } catch (error) {
      r.e(error);
    } finally {
      r.f();
    }
    return n;
  }
  function bo(e) {
    const t = window.getSelection();
    if (!t || t.rangeCount === 0) {
      return null;
    }
    const n = t.getRangeAt(0);
    if (!e.contains(n.endContainer)) {
      return null;
    }
    const r = n.cloneRange();
    r.selectNodeContents(e);
    r.setEnd(n.endContainer, n.endOffset);
    return r.toString().length;
  }
  function wo(e, t) {
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
  function xo(e) {
    for (let t = 1; t < arguments.length; t++) {
      var n = arguments[t] ?? {};
      if (t % 2) {
        wo(Object(n), true).forEach((t) => {
          Eo(e, t, n[t]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(e, Object.getOwnPropertyDescriptors(n));
      } else {
        wo(Object(n)).forEach((t) => {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
        });
      }
    }
    return e;
  }
  function Eo(e, t, n) {
    if (
      (t = ((e) => {
        const computeT = (e) => {
          const t = "string";
          if (So(e) != "object" || !e) {
            return e;
          }
          const n = e[Symbol.toPrimitive];
          if (n !== undefined) {
            const r = n.call(e, t || "default");
            if (So(r) != "object") {
              return r;
            }
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return (t === "string" ? String : Number)(e);
        };
        const t = computeT(e);
        if (So(t) == "symbol") {
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
  function Co(e) {
    return (
      ((e) => {
        if (Array.isArray(e)) {
          return _o(e);
        }
      })(e) ||
      ((e) => {
        if (
          (typeof Symbol !== "undefined" && e[Symbol.iterator] != null) ||
          e["@@iterator"] != null
        ) {
          return Array.from(e);
        }
      })(e) ||
      ko(e) ||
      (() => {
        throw new TypeError(
          "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function Lo(e, t) {
    return (
      ((e) => {
        if (Array.isArray(e)) {
          return e;
        }
      })(e) ||
      ((e, t) => {
        let n =
          e == null
            ? null
            : (typeof Symbol !== "undefined" && e[Symbol.iterator]) ||
              e["@@iterator"];
        if (n != null) {
          let r;
          let a;
          let o;
          let i;
          const c = [];
          let s = true;
          let l = false;
          try {
            o = (n = n.call(e)).next;
            if (t === 0) {
              if (Object(n) !== n) {
                return;
              }
              s = false;
            } else {
              for (
                ;
                !(s = (r = o.call(n)).done) &&
                (c.push(r.value), c.length !== t);
                s = true
              );
            }
          } catch (error) {
            l = true;
            a = error;
          } finally {
            try {
              if (
                !s &&
                n.return != null &&
                ((i = n.return()), Object(i) !== i)
              ) {
                return;
              }
            } finally {
              if (l) {
                throw a;
              }
            }
          }
          return c;
        }
      })(e, t) ||
      ko(e, t) ||
      (() => {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function No(e, t) {
    let n =
      (typeof Symbol !== "undefined" && e[Symbol.iterator]) || e["@@iterator"];
    if (!n) {
      if (
        Array.isArray(e) ||
        (n = ko(e)) ||
        (t && e && typeof e.length === "number")
      ) {
        if (n) {
          e = n;
        }
        let r = 0;
        const a = function () {};
        return {
          s: a,
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
          f: a,
        };
      }
      throw new TypeError(
        "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
      );
    }
    let o;
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
        o = e;
      },
      f: function () {
        try {
          if (!(i || n.return == null)) {
            n.return();
          }
        } finally {
          if (c) {
            throw o;
          }
        }
      },
    };
  }
  function ko(e, t) {
    if (e) {
      if (typeof e === "string") {
        return _o(e, t);
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
        return _o(e, t);
      }
      return undefined;
    }
  }
  function _o(e, t) {
    if (t == null || t > e.length) {
      t = e.length;
    }
    for (var n = 0, r = Array(t); n < t; n++) {
      r[n] = e[n];
    }
    return r;
  }
  function To() {
    To = function () {
      return t;
    };
    let e;
    var t = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const a =
      Object.defineProperty ||
      ((e, t, n) => {
        e[t] = n.value;
      });
    const o = typeof Symbol === "function" ? Symbol : {};
    const i = o.iterator || "@@iterator";
    const c = o.asyncIterator || "@@asyncIterator";
    const s = o.toStringTag || "@@toStringTag";
    function l(e, t, n) {
      Object.defineProperty(e, t, {
        value: n,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      l({}, "");
    } catch (e) {
      l = function (e, t, n) {
        return (e[t] = n);
      };
    }
    function u(e, t, n, r) {
      const o = t && t.prototype instanceof g ? t : g;
      const i = Object.create(o.prototype);
      const c = new $(r || []);
      a(i, "_invoke", {
        value: k(e, n, c),
      });
      return i;
    }
    function d(e, t, n) {
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
    t.wrap = u;
    var p = "suspendedStart";
    var m = "suspendedYield";
    var f = "executing";
    var h = "completed";
    var v = {};
    function g() {}
    function y() {}
    function b() {}
    let w = {};
    l(w, i, function () {
      return this;
    });
    const E =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(A([])));
    if (E && E !== Object.prototype && hasOwnProperty.call(E, i)) {
      w = E;
    }
    const C = (b.prototype = g.prototype = Object.create(w));
    function L(e) {
      ["next", "throw", "return"].forEach((t) => {
        l(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function N(e, t) {
      function n(a, o, i, c) {
        const s = d(e[a], e, o);
        if (s.type !== "throw") {
          const l = s.arg;
          const u = l.value;
          if (u && So(u) == "object" && hasOwnProperty.call(u, "__await")) {
            return t.resolve(u.__await).then(
              (e) => {
                n("next", e, i, c);
              },
              (e) => {
                n("throw", e, i, c);
              },
            );
          }
          return t.resolve(u).then(
            (e) => {
              l.value = e;
              i(l);
            },
            (e) => n("throw", e, i, c),
          );
        }
        c(s.arg);
      }
      let o;
      a(this, "_invoke", {
        value: function (e, r) {
          function a() {
            return new t(function (t, a) {
              n(e, r, t, a);
            });
          }
          return (o = o ? o.then(a, a) : a());
        },
      });
    }
    function k(t, n, r) {
      let a = p;
      return function (o, i) {
        if (a === f) {
          throw Error("Generator is already running");
        }
        if (a === h) {
          if (o === "throw") {
            throw i;
          }
          return {
            value: e,
            done: true,
          };
        }
        r.method = o;
        for (r.arg = i; ;) {
          const c = r.delegate;
          if (c) {
            const s = _(c, r);
            if (s) {
              if (s === v) {
                continue;
              }
              return s;
            }
          }
          if (r.method === "next") {
            r.sent = r._sent = r.arg;
          } else if (r.method === "throw") {
            if (a === p) {
              a = h;
              throw r.arg;
            }
            r.dispatchException(r.arg);
          } else {
            if (r.method === "return") {
              r.abrupt("return", r.arg);
            }
          }
          a = f;
          const l = d(t, n, r);
          if (l.type === "normal") {
            a = r.done ? h : m;
            if (l.arg === v) {
              continue;
            }
            return {
              value: l.arg,
              done: r.done,
            };
          }
          if (l.type === "throw") {
            a = h;
            r.method = "throw";
            r.arg = l.arg;
          }
        }
      };
    }
    function _(t, n) {
      const n_method = n.method;
      const a = t.iterator[n_method];
      if (a === e) {
        n.delegate = null;
        if (
          !(
            n_method === "throw" &&
            t.iterator.return &&
            ((n.method = "return"), (n.arg = e), _(t, n), n.method === "throw")
          )
        ) {
          if (n_method !== "return") {
            n.method = "throw";
            n.arg = new TypeError(
              `The iterator does not provide a '${n_method}' method`,
            );
          }
        }
        return v;
      }
      const o = d(a, t.iterator, n.arg);
      if (o.type === "throw") {
        n.method = "throw";
        n.arg = o.arg;
        n.delegate = null;
        return v;
      }
      const o_arg = o.arg;
      if (o_arg) {
        if (o_arg.done) {
          return (
            (n[t.resultName] = o_arg.value),
            (n.next = t.nextLoc),
            n.method !== "return" && ((n.method = "next"), (n.arg = e)),
            (n.delegate = null),
            v
          );
        }
        return o_arg;
      }
      return (
        (n.method = "throw"),
        (n.arg = new TypeError("iterator result is not an object")),
        (n.delegate = null),
        v
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
    function S(e) {
      const t = e.completion || {};
      t.type = "normal";
      delete t.arg;
      e.completion = t;
    }
    function $(e) {
      this.tryEntries = [
        {
          tryLoc: "root",
        },
      ];
      e.forEach(T, this);
      this.reset(true);
    }
    function A(t) {
      if (t || t === "") {
        const n = t[i];
        if (n) {
          return n.call(t);
        }
        if (typeof t.next === "function") {
          return t;
        }
        if (!isNaN(t.length)) {
          let a = -1;
          const o = function n() {
            while (++a < t.length) {
              if (hasOwnProperty.call(t, a)) {
                n.value = t[a];
                n.done = false;
                return n;
              }
            }
            n.value = e;
            n.done = true;
            return n;
          };
          return (o.next = o);
        }
      }
      throw new TypeError(`${So(t)} is not iterable`);
    }
    y.prototype = b;
    a(C, "constructor", {
      value: b,
      configurable: true,
    });
    a(b, "constructor", {
      value: y,
      configurable: true,
    });
    y.displayName = l(b, s, "GeneratorFunction");
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
        l(e, s, "GeneratorFunction");
      }
      e.prototype = Object.create(C);
      return e;
    };
    t.awrap = function (e) {
      return {
        __await: e,
      };
    };
    L(N.prototype);
    l(N.prototype, c, function () {
      return this;
    });
    t.AsyncIterator = N;
    t.async = function (e, n, r, a, o = Promise) {
      const i = new N(u(e, n, r, a), o);
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
    L(C);
    l(C, s, "Generator");
    l(C, i, function () {
      return this;
    });
    l(C, "toString", function () {
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
    t.values = A;
    $.prototype = {
      constructor: $,
      reset: function (t) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = e;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = e;
        this.tryEntries.forEach(S);
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
        function a(r, a) {
          c.type = "throw";
          c.arg = t;
          n.next = r;
          if (a) {
            n.method = "next";
            n.arg = e;
          }
          return !!a;
        }
        for (let o = this.tryEntries.length - 1; o >= 0; --o) {
          const i = this.tryEntries[o];
          var c = i.completion;
          if (i.tryLoc === "root") {
            return a("end");
          }
          if (i.tryLoc <= this.prev) {
            const s = hasOwnProperty.call(i, "catchLoc");
            const l = hasOwnProperty.call(i, "finallyLoc");
            if (s && l) {
              if (this.prev < i.catchLoc) {
                return a(i.catchLoc, true);
              }
              if (this.prev < i.finallyLoc) {
                return a(i.finallyLoc);
              }
            } else if (s) {
              if (this.prev < i.catchLoc) {
                return a(i.catchLoc, true);
              }
            } else {
              if (!l) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < i.finallyLoc) {
                return a(i.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let n = this.tryEntries.length - 1; n >= 0; --n) {
          const a = this.tryEntries[n];
          if (
            a.tryLoc <= this.prev &&
            hasOwnProperty.call(a, "finallyLoc") &&
            this.prev < a.finallyLoc
          ) {
            var o = a;
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
          return ((this.method = "next"), (this.next = o.finallyLoc), v);
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
        return v;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.finallyLoc === e) {
            this.complete(n.completion, n.afterLoc);
            S(n);
            return v;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const n = this.tryEntries[t];
          if (n.tryLoc === e) {
            const r = n.completion;
            if (r.type === "throw") {
              var a = r.arg;
              S(n);
            }
            return a;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (t, n, r) {
        this.delegate = {
          iterator: A(t),
          resultName: n,
          nextLoc: r,
        };
        if (this.method === "next") {
          this.arg = e;
        }
        return v;
      },
    };
    return t;
  }
  function So(e) {
    So =
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
    return So(e);
  }
  function $o(e, t, n, r, a, o, i) {
    try {
      var c = e[o](i);
      var s = c.value;
    } catch (error) {
      return void n(error);
    }
    if (c.done) {
      t(s);
    } else {
      Promise.resolve(s).then(r, a);
    }
  }
  function Ao(e) {
    return function () {
      const t = this;
      const n = arguments;
      return new Promise((resolve, reject) => {
        const o = e.apply(t, n);
        function i(e) {
          $o(o, resolve, reject, i, c, "next", e);
        }
        function c(e) {
          $o(o, resolve, reject, i, c, "throw", e);
        }
        i(undefined);
      });
    };
  }
  document.addEventListener("DOMContentLoaded", function () {
    return Ni.apply(this, arguments);
  });
  window.addEventListener("load", function () {
    document.body.style.opacity = "1";
  });
  window.addEventListener("beforeunload", function () {
    if (qo) {
      i.sendOptionalMessageToTab(qo, {
        target: "script",
        action: "side_panel_closed",
      });
    }
  });
  window.addEventListener("resize", function () {
    Mc(document.querySelector(".assets-justified-container"));
  });
  document.addEventListener("visibilitychange", function () {
    Zo = document.visibilityState === "visible";
    Ti();
  });
  chrome.runtime.onMessage.addListener(function (e, t, n) {
    if (e.target !== "side_panel") {
      return;
    }
    if (Yo) {
      return;
    }
    switch (e.action) {
      case "ping":
        return void n({
          success: true,
          isOpen: true,
        });
      case "tab_specific_ping":
        if (Zo && qo && t.tab?.id === qo) {
          n({
            success: true,
            isOpen: true,
          });
        }
        return false;
      case "responsive_mode_ready":
        if (_i(t.tab?.id)) {
          if (Ko) {
            try {
              Ko.disconnect();
            } catch (e) {}
          }
          (Ko = chrome.tabs.connect(qo, {
            name: `sidepanel_${Date.now()}`,
          })).onDisconnect.addListener(function () {
            Ko = null;
          });
        }
        return;
      case "close":
        if (Wo && e.tabId && e.tabId !== qo) {
          return;
        }
        return void window.close();
      case "select_element":
        if (!_i(t.tab?.id)) {
          return;
        }
        Xo = t.frameId ?? null;
        if (e.mode === "edit") {
          if (!ri) {
            ai = e.editDetails;
            return void (ii = false);
          }
          Ei(e.editDetails, true);
        } else {
          (function (e) {
            return hc.apply(this, arguments);
          })(e.inspectDetails)
            .then(() => Gi())
            .catch((e) => {
              const t = document.getElementById("container");
              if (t && !t.childElementCount) {
                Mi();
              }
            });
          if (ri) {
            Li(e.inspectDetails);
          } else {
            oi = e.inspectDetails;
            ii = true;
          }
        }
        return;
      case "edit_payload_extras":
        return void (
          t.tab?.id === qo &&
          (t.frameId ?? null) === Xo &&
          ((e) => {
            const t = document.getElementById("edit_css-sections");
            if (t && e && e.paySeq === paySeq) {
              ma = new Map(e.registeredInherits || []);
              for (const n of t.querySelectorAll(
                ".edit-css-section[data-inherited-depth]",
              )) {
                n.remove();
              }
              let a;
              const o = t.querySelectorAll(
                ".edit-css-section:not(.edit-classes-section)",
              );
              let i = o.length ? o[o.length - 1] : null;
              const c = Fr(e.inherited || []);
              try {
                for (c.s(); !(a = c.n()).done;) {
                  const s = ka(a.value);
                  if (i && i.nextSibling) {
                    t.insertBefore(s, i.nextSibling);
                  } else {
                    t.appendChild(s);
                  }
                  i = s;
                }
              } catch (error) {
                c.e(error);
              } finally {
                c.f();
              }
              Na(t);
              to();
            }
          })(e)
        );
      case "media_activity":
        return void (
          t.tab?.id === qo &&
          ((e) => {
            const t = document.getElementById("edit_css-sections");
            if (t && e) {
              const n = aa ? aa.querySelector(".is-editing") : null;
              if (n) {
                n.blur();
              }
              if (!oa) {
                let r;
                let a = false;
                const o = Fr(t.querySelectorAll(".edit-css-section"));
                try {
                  for (o.s(); !(r = o.n()).done;) {
                    const c = r.value;
                    const s = c.dataset.wrappers;
                    if (s && s in e) {
                      const l = e[s] !== false;
                      c.querySelector(
                        ".edit-css-section-header",
                      )?.classList.toggle("greyed", !l);
                      for (const p of c.querySelectorAll(".css-rule")) {
                        const m = sa.get(p);
                        if (m && m.mediaActive !== l) {
                          m.mediaActive = l;
                          a = true;
                        }
                      }
                    }
                  }
                } catch (error) {
                  o.e(error);
                } finally {
                  o.f();
                }
                if (a) {
                  to();
                }
              }
            }
          })(e.activity)
        );
      case "page_data":
        if (_i(t.tab?.id)) {
          if (e.pageData?.metadata) {
            li = e.pageData.metadata;
            (function (e) {
              return Xi.apply(this, arguments);
            })(e.pageData.metadata).catch((e) => {
              const t = document.getElementById("page-tab");
              if (t && !t.childElementCount) {
                Ki();
              }
            });
          } else {
            Ki();
          }
          yi();
        }
        return;
      case "page_technologies":
        return void (
          _i(t.tab?.id) &&
          (function (e) {
            return Zi.apply(this, arguments);
          })(e.technologies).catch((e) => {})
        );
      case "content_script_loaded":
        if (_i(t.tab?.id)) {
          if (Ko) {
            try {
              Ko.disconnect();
            } catch (e) {}
          }
          Ko = chrome.tabs.connect(qo, {
            name: `sidepanel_${Date.now()}_${qo}`,
          });
          Qo = false;
          Ao(
            To().mark(function e() {
              let t;
              return To().wrap(
                function (e) {
                  while (true) {
                    switch ((e.prev = e.next)) {
                      case 0:
                        e.prev = 0;
                        e.next = 3;
                        return i.sendMessageToTab(qo, {
                          target: "script",
                          action: "side_panel_loaded",
                        });
                      case 3:
                        if (
                          !(
                            (t = e.sent) != null &&
                            t.success &&
                            t != null &&
                            t.elementSelected
                          )
                        ) {
                          Mi();
                        }
                        Ti();
                        e.next = 11;
                        break;
                      case 8:
                        e.prev = 8;
                        e.t0 = e.catch(0);
                        Mi();
                      case 11:
                      case "end":
                        return e.stop();
                    }
                  }
                },
                e,
                null,
                [[0, 8]],
              );
            }),
          )();
        }
        return;
      case "page_weight_update":
        return void (
          _i(t.tab?.id) &&
          ((e) => {
            const t = document.getElementById("page-tab");
            if (!t) {
              return;
            }
            if (selectedTab !== "page") {
              return;
            }
            fi()
              .then((n) => {
                const r = !(n == null || !n.success);
                const a = t.querySelector(
                  "#pageWeight, .pro-section[data-feature='page-weight']",
                );
                if (e) {
                  const o = ms(e, r);
                  if (a) {
                    a.replaceWith(o);
                  } else {
                    t.appendChild(o);
                  }
                } else {
                  if (a) {
                    a.remove();
                  }
                }
              })
              .catch(() => {});
          })(e.pageWeight)
        );
      case "update_issues":
        return void (
          _i(t.tab?.id) &&
          (function (e) {
            es.apply(this, arguments);
          })(e.issues)
        );
      case "set_mode":
        return void (_i(t.tab?.id) && (t.frameId ?? 0) === 0 && bi(e.mode));
      case "clear":
        if (Wo && e.tabId && e.tabId !== qo) {
          return;
        }
        return void Mi();
    }
  });
  chrome.storage.onChanged.addListener(function (e) {
    if (e.theme && e.theme.newValue) {
      Hc(e.theme.newValue);
    }
  });
  document.addEventListener(
    "keydown",
    function (e) {
      if (!qo) {
        return;
      }
      const e_target = e.target;
      if (
        e_target &&
        (e_target.tagName === "INPUT" ||
          e_target.tagName === "TEXTAREA" ||
          e_target.tagName === "SELECT" ||
          e_target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
      if (!Go.has(e.key)) {
        return;
      }
      e.preventDefault();
      i.sendMessageToTab(qo, {
        target: "script",
        action: "keyboard_shortcut",
        key: e.key,
      }).catch(() => {});
    },
    false,
  );
  var Mo = 200;
  var Oo = 100;
  var Io = 16;
  var Ro = 96;
  var jo = 120;
  var Bo = 8;
  var Po = 0.66;
  var Do = 2.5;
  var Uo = 3;
  var Ho = 128;
  var Fo = 400;
  var Go = new Set([
    "Escape",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
  ]);
  var qo = null;
  var Wo = false;
  var Vo = new URLSearchParams(window.location.search).get("detached") === "1";
  var zo = null;
  var Yo = false;
  var Ko = null;
  var Xo = null;
  var Zo = true;
  var Qo = false;
  var Jo = false;
  var ei = {};
  var selectedTab = "element";
  var selectedEditTab = "tab-1";
  var ri = false;
  var ai = null;
  var oi = null;
  var ii = false;
  var ci = "inspect";
  var sidePanelPreferences = {
    sectionVisibility: {
      layout: {
        collapsed: false,
      },
      flexbox: {
        collapsed: false,
      },
      textContent: {
        collapsed: false,
      },
      css: {
        collapsed: false,
      },
      assets: {
        collapsed: false,
      },
      boxShadow: {
        collapsed: false,
      },
      gradients: {
        collapsed: false,
      },
      animations: {
        collapsed: false,
      },
      transitions: {
        collapsed: false,
      },
      colors: {
        collapsed: false,
      },
      typography: {
        collapsed: false,
      },
      documentOutline: {
        collapsed: false,
      },
      issues: {
        collapsed: false,
      },
      ogImage: {
        collapsed: false,
      },
      metaTags: {
        collapsed: false,
      },
      technologies: {
        collapsed: false,
      },
      pageWeight: {
        collapsed: false,
      },
      socialPreview: {
        collapsed: false,
      },
      seoIssues: {
        collapsed: false,
      },
    },
    colorFormat: "HEX",
    codeViewMode: "css",
    socialPreviewType: "facebook",
  };
  var li = null;
  var ui = 0;
  var di = null;
  function fi() {
    return hi.apply(this, arguments);
  }
  function hi() {
    hi = Ao(
      To().mark(function e() {
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                return e.abrupt("return", {
                  success: true,
                  status: "ready",
                  licenseTier: "studio",
                  trial: null,
                });
              case 2:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    );
    return hi.apply(this, arguments);
  }
  function vi(e, t) {
    for (const n in e) {
      if (So(e[n]) !== "object" || Array.isArray(e[n])) {
        if (!(n in t)) {
          t[n] = e[n];
        }
      } else {
        if (!t[n]) {
          t[n] = {};
        }
        vi(e[n], t[n]);
      }
    }
    return t;
  }
  function gi(url) {
    if (!url) {
      return "";
    }
    try {
      const t = new URL(url);
      if (t.protocol !== "http:" && t.protocol !== "https:") {
        return url;
      }
      let n = t.host + t.pathname + t.search + t.hash;
      if (!(t.pathname !== "/" || t.search || t.hash)) {
        n = t.host;
      }
      return n;
    } catch (t) {
      return url;
    }
  }
  function yi() {
    if (ui) {
      const e = ui;
      const t = Date.now() - e;
      const n = function () {
        if (ui === e) {
          document
            .querySelectorAll(".refresh-button.refreshing")
            .forEach((e) => e.classList.remove("refreshing"));
          ui = 0;
        }
      };
      if (t >= 600) {
        n();
      } else {
        setTimeout(n, 600 - t);
      }
    }
  }
  function bi(e) {
    const t = document.getElementById("edit-view");
    ci = e === "edit" ? "edit" : "inspect";
    if (e === "edit") {
      document
        .querySelectorAll(".tab-content")
        .forEach((e) => e.classList.remove("active"));
      if (t) {
        t.classList.add("active");
      }
    } else {
      if (t) {
        t.classList.remove("active");
      }
      Wi(selectedTab === "page" ? "page" : "element");
    }
  }
  function wi() {
    return xi.apply(this, arguments);
  }
  function xi() {
    return (xi = Ao(
      To().mark(function e() {
        let t;
        let n;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if ((t = document.getElementById("edit-view"))) {
                    e.next = 3;
                    break;
                  }
                  return e.abrupt("return");
                case 3:
                  e.prev = 3;
                  e.next = 6;
                  return fetch(chrome.runtime.getURL("sidepanel/editor.html"));
                case 6:
                  n = e.sent;
                  e.next = 9;
                  return n.text();
                case 9:
                  t.innerHTML = e.sent;
                  t.querySelectorAll(".panel-dock-button").forEach(Ri);
                  hn(Jo, ei, selectedEditTab, function (e) {
                    selectedEditTab = e;
                  });
                  ri = true;
                  Ci();
                  e.next = 19;
                  break;
                case 16:
                  e.prev = 16;
                  e.t0 = e.catch(3);
                case 19:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[3, 16]],
        );
      }),
    )).apply(this, arguments);
  }
  function Ei(e, t) {
    Li(e);
    if (t) {
      try {
        La(e);
        Gi();
      } catch (e) {}
    }
  }
  function Ci() {
    const e = ai;
    const t = oi;
    const n = ii;
    ai = null;
    oi = null;
    ii = false;
    if (e) {
      Ei(e, true);
    }
    if (!(!t || (!n && e))) {
      Ei(t, false);
    }
  }
  function Li(e) {
    const a = document.getElementById("edit-element-name");
    if (a && e) {
      a.innerHTML = "";
      a.appendChild(
        vc(
          e.name,
          e.type,
          e.boxModel?.width,
          e.boxModel?.height,
          e.availableStates,
          e.forcedState,
          e.editCount ?? 0,
        ),
      );
    }
  }
  function Ni() {
    return (Ni = Ao(
      To().mark(function e() {
        let t;
        let n;
        let r;
        let a;
        let o;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  d();
                  if ((qo = ki())) {
                    Ko = chrome.tabs.connect(qo, {
                      name: `sidepanel_${qo}`,
                    });
                  }
                  if (Vo) {
                    document.documentElement.classList.add("is-detached");
                    qi();
                  }
                  e.next = 6;
                  return Hi();
                case 6:
                  e.prev = 6;
                  e.next = 9;
                  return i.getPlatformInfo();
                case 9:
                  t = e.sent;
                  n = t.os;
                  Jo = n === "mac";
                  e.next = 17;
                  break;
                case 14:
                  e.prev = 14;
                  e.t0 = e.catch(6);
                  Jo = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
                case 17:
                  e.prev = 17;
                  e.next = 20;
                  return i.commandsGetAll();
                case 20:
                  r = e.sent;
                  ei = Object.fromEntries(r.map((e) => [e.name, e.shortcut]));
                  e.next = 27;
                  break;
                case 24:
                  e.prev = 24;
                  e.t1 = e.catch(17);
                  ei = {};
                case 27:
                  e.prev = 27;
                  e.next = 30;
                  return i.storageLocalGet({
                    theme: "system",
                  });
                case 30:
                  a = e.sent;
                  Hc(a.theme);
                  e.next = 38;
                  break;
                case 35:
                  e.prev = 35;
                  e.t2 = e.catch(27);
                  Hc("system");
                case 38:
                  e.next = 40;
                  return $i();
                case 40:
                  e.next = 42;
                  return wi();
                case 42:
                  if (ci === "edit") {
                    bi("edit");
                  } else if (selectedTab) {
                    Wi(selectedTab);
                  }
                  if (!qo) {
                    e.next = 59;
                    break;
                  }
                  e.prev = 44;
                  e.next = 47;
                  return new Promise((resolve) => setTimeout(resolve, 50));
                case 47:
                  e.next = 49;
                  return i.sendMessageToTab(qo, {
                    target: "script",
                    action: "side_panel_loaded",
                  });
                case 49:
                  if (
                    !(
                      (o = e.sent) != null &&
                      o.success &&
                      o != null &&
                      o.elementSelected
                    )
                  ) {
                    Mi();
                  }
                  Ti();
                  e.next = 57;
                  break;
                case 54:
                  e.prev = 54;
                  e.t3 = e.catch(44);
                  Mi();
                case 57:
                  e.next = 60;
                  break;
                case 59:
                  Mi();
                case 60:
                  Si();
                case 61:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [
            [6, 14],
            [17, 24],
            [27, 35],
            [44, 54],
          ],
        );
      }),
    )).apply(this, arguments);
  }
  function ki() {
    const e = new URLSearchParams(window.location.search);
    const t = parseInt(e.get("tabId"), 10);
    if (t) {
      Wo = true;
      return t;
    }
  }
  function _i(e) {
    return (
      !!e &&
      (e === qo ||
        (!Wo &&
          (((e) => {
            if (qo !== e) {
              if (Qo && qo) {
                i.sendMessageToTab(qo, {
                  target: "script",
                  action: "page_weight_unsubscribe",
                }).catch(() => {});
                Qo = false;
              }
              qo = e;
              li = null;
              di = null;
              if (Ko) {
                try {
                  Ko.disconnect();
                } catch (e) {}
              }
              (Ko = chrome.tabs.connect(qo, {
                name: `sidepanel_${Date.now()}_${qo}`,
              })).onDisconnect.addListener(function () {
                Ko = null;
              });
              Ti();
              ji();
            }
          })(e),
          true)))
    );
  }
  function Ti() {
    const e = Zo && selectedTab === "page" && qo !== null;
    if (e && !Qo) {
      Qo = true;
      i.sendMessageToTab(qo, {
        target: "script",
        action: "page_weight_subscribe",
      }).catch(() => {});
    } else if (!e && Qo) {
      Qo = false;
      i.sendMessageToTab(qo, {
        target: "script",
        action: "page_weight_unsubscribe",
      }).catch(() => {});
    }
  }
  function Si() {
    document.addEventListener(
      "click",
      function (e) {
        if (e.target.closest && e.target.closest(".panel-dock-button")) {
          e.preventDefault();
          e.stopPropagation();
          (function () {
            Bi.apply(this, arguments);
          })();
        }
      },
      true,
    );
    document.addEventListener("click", Qi, false);
    document.addEventListener("change", nc, false);
    document.addEventListener("mouseover", as, false);
    document.addEventListener("mouseout", os, false);
    document.documentElement.addEventListener("mouseleave", is, false);
    document.addEventListener("scroll", cs, true);
    chrome.tabs.onUpdated.addListener(function (e, t) {
      if (e === qo && t.title) {
        qi();
      }
      if (e === qo && t.status === "loading") {
        li = null;
        di = null;
        if (t.url) {
          Ki();
        }
        i.sendMessageToTab(qo, {
          target: "script",
          action: "refresh_page_data",
        }).catch(() => {});
      }
    });
  }
  function $i() {
    return Ai.apply(this, arguments);
  }
  function Ai() {
    return (Ai = Ao(
      To().mark(function e() {
        let t;
        let n;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  e.next = 3;
                  return i.storageLocalGet({
                    sidePanelPreferences,
                  });
                case 3:
                  t = e.sent;
                  n = t.sidePanelPreferences;
                  sidePanelPreferences = vi(sidePanelPreferences, n);
                  e.next = 8;
                  return i.storageLocalSet({
                    sidePanelPreferences,
                  });
                case 8:
                  e.next = 13;
                  break;
                case 10:
                  e.prev = 10;
                  e.t0 = e.catch(0);
                case 13:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[0, 10]],
        );
      }),
    )).apply(this, arguments);
  }
  function Mi() {
    return Oi.apply(this, arguments);
  }
  function Oi() {
    Oi = Ao(
      To().mark(function e() {
        let t;
        let n;
        let r;
        let a;
        let o;
        let i;
        let c;
        let s;
        let l;
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                if (
                  (t = document.getElementById("page-tab")) &&
                  !t.childElementCount
                ) {
                  Ki();
                }
                if ((n = document.getElementById("container"))) {
                  r = document.createDocumentFragment();
                  (a = document.createElement("div")).className =
                    "header sticky-top";
                  a.appendChild(Ii());
                  r.appendChild(a);
                  (o = document.createElement("div")).className =
                    "empty-container";
                  i = document.createElement("div");
                  (c = document.createElement("div")).className = "empty-icon";
                  c.innerHTML =
                    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M168,132.69,214.08,115l.33-.13A16,16,0,0,0,213,85.07L52.92,32.8A15.95,15.95,0,0,0,32.8,52.92L85.07,213a15.82,15.82,0,0,0,14.41,11l.78,0a15.84,15.84,0,0,0,14.61-9.59l.13-.33L132.69,168,184,219.31a16,16,0,0,0,22.63,0l12.68-12.68a16,16,0,0,0,0-22.63ZM195.31,208,144,156.69a16,16,0,0,0-26,4.93c0,.11-.09.22-.13.32l-17.65,46L48,48l159.85,52.2-45.95,17.64-.32.13a16,16,0,0,0-4.93,26h0L208,195.31Z"></path></svg>';
                  (s = document.createElement("h4")).className =
                    "empty-title greyed";
                  s.innerText = chrome.i18n.getMessage("EMPTY_MESSAGE_INSPECT");
                  l = Pt(
                    [
                      {
                        name: chrome.i18n.getMessage("SHORTCUT_TOGGLE_RULER"),
                        keys: ei._execute_action,
                      },
                      {
                        name: chrome.i18n.getMessage("SHORTCUT_PARENT"),
                        keys: ei.select_parent,
                      },
                      {
                        name: chrome.i18n.getMessage("SHORTCUT_CHILD"),
                        keys: ei.select_child,
                      },
                      {
                        name: chrome.i18n.getMessage("SHORTCUT_TOGGLE_PANEL"),
                        keys: "0",
                      },
                      {
                        name: chrome.i18n.getMessage("SHORTCUT_DESELECT"),
                        keys: "Esc",
                      },
                    ].filter((e) => e.keys),
                  );
                  i.appendChild(c);
                  i.appendChild(s);
                  i.appendChild(l);
                  o.appendChild(i);
                  r.appendChild(o);
                  n.innerHTML = "";
                  n.appendChild(r);
                }
              case 4:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    );
    return Oi.apply(this, arguments);
  }
  function Ii() {
    const e = document.createElement("div");
    e.className = "tab-row";
    const t = document.createElement("div");
    t.className = "tab-bar";
    const n = document.createElement("button");
    n.className = `tab-button${selectedTab !== "page" ? " active" : ""}`;
    n.dataset.tab = "element";
    n.textContent = chrome.i18n.getMessage("TAB_ELEMENT");
    let r;
    const a = document.createElement("button");
    a.className = `tab-button${selectedTab === "page" ? " active" : ""}`;
    a.dataset.tab = "page";
    a.textContent = chrome.i18n.getMessage("TAB_PAGE");
    t.appendChild(n);
    t.appendChild(a);
    e.appendChild(t);
    e.appendChild(
      (((r = document.createElement("button")).className = "panel-dock-button"),
      (r.type = "button"),
      Ri(r),
      r),
    );
    return e;
  }
  function Ri(e) {
    e.innerHTML = Vo ? m : p;
    e.title = chrome.i18n.getMessage(Vo ? "PANEL_DOCK" : "PANEL_UNDOCK");
    e.hidden = !qo || Yo;
  }
  function ji() {
    document.querySelectorAll(".panel-dock-button").forEach(Ri);
  }
  function Bi() {
    return (Bi = Ao(
      To().mark(function e() {
        let t;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (qo) {
                    e.next = 2;
                    break;
                  }
                  return e.abrupt("return");
                case 2:
                  e.prev = 2;
                  e.next = 5;
                  return Di();
                case 5:
                  if (!Vo) {
                    e.next = 10;
                    break;
                  }
                  e.next = 8;
                  return i.sendMessage({
                    target: "background",
                    action: "dock_panel",
                    tabId: qo,
                  });
                case 8:
                  e.next = 14;
                  break;
                case 10:
                  e.next = 12;
                  return i.sendMessage({
                    target: "background",
                    action: "detach_panel",
                    tabId: qo,
                    width: window.innerWidth,
                    height: window.innerHeight,
                  });
                case 12:
                  if ((t = e.sent) != null && t.success) {
                    Yo = true;
                    ji();
                    window.close();
                  }
                case 14:
                  e.next = 19;
                  break;
                case 16:
                  e.prev = 16;
                  e.t0 = e.catch(2);
                case 19:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[2, 16]],
        );
      }),
    )).apply(this, arguments);
  }
  function Pi() {
    return `panelHandoff:${qo}`;
  }
  function Di() {
    return Ui.apply(this, arguments);
  }
  function Ui() {
    return (Ui = Ao(
      To().mark(function e() {
        let t;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (qo) {
                    e.next = 2;
                    break;
                  }
                  return e.abrupt("return");
                case 2:
                  t = document.scrollingElement || document.documentElement;
                  e.prev = 3;
                  e.next = 6;
                  return chrome.storage.session.set(
                    Eo({}, Pi(), {
                      selectedTab,
                      selectedEditTab,
                      scrollTop: t.scrollTop,
                      at: Date.now(),
                    }),
                  );
                case 6:
                  e.next = 10;
                  break;
                case 8:
                  e.prev = 8;
                  e.t0 = e.catch(3);
                case 10:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[3, 8]],
        );
      }),
    )).apply(this, arguments);
  }
  function Hi() {
    return Fi.apply(this, arguments);
  }
  function Fi() {
    return (Fi = Ao(
      To().mark(function e() {
        let t;
        let n;
        let r;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (qo) {
                    e.next = 2;
                    break;
                  }
                  return e.abrupt("return");
                case 2:
                  t = Pi();
                  e.prev = 3;
                  e.next = 6;
                  return chrome.storage.session.get(t);
                case 6:
                  n = e.sent;
                  if ((r = n[t])) {
                    e.next = 10;
                    break;
                  }
                  return e.abrupt("return");
                case 10:
                  chrome.storage.session.remove(t).catch(() => {});
                  if (!(Date.now() - (r.at || 0) > 30000)) {
                    e.next = 13;
                    break;
                  }
                  return e.abrupt("return");
                case 13:
                  if (
                    !(r.selectedTab !== "element" && r.selectedTab !== "page")
                  ) {
                    selectedTab = r.selectedTab;
                  }
                  if (typeof r.selectedEditTab === "string") {
                    selectedEditTab = r.selectedEditTab;
                  }
                  if (Number.isFinite(r.scrollTop) && r.scrollTop > 0) {
                    zo = r.scrollTop;
                  }
                  e.next = 20;
                  break;
                case 18:
                  e.prev = 18;
                  e.t0 = e.catch(3);
                case 20:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[3, 18]],
        );
      }),
    )).apply(this, arguments);
  }
  function Gi() {
    if (zo !== null) {
      const e = zo;
      zo = null;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          (document.scrollingElement || document.documentElement).scrollTop = e;
        });
      });
    }
  }
  function qi() {
    if (Vo && qo) {
      chrome.tabs
        .get(qo)
        .then((e) => {
          if (e != null && e.title) {
            document.title = e.title;
          }
        })
        .catch(() => {});
    }
  }
  function Wi(e) {
    document
      .querySelectorAll(".tab-button")
      .forEach((t) => t.classList.toggle("active", t.dataset.tab === e));
    document
      .querySelectorAll(".tab-content")
      .forEach((t) => t.classList.toggle("active", t.id === `${e}-tab`));
  }
  function Vi(meta, t, n, url) {
    const a = meta?.openGraph || {};
    const o = meta?.twitter || {};
    const i = t === "x";
    const title =
      (i && o["twitter:title"]) ||
      a["og:title"] ||
      o["twitter:title"] ||
      n ||
      "";
    const description = a["og:description"] || o["twitter:description"] || "";
    const ogImage = a["og:image"] || null;
    const u = o["twitter:image"] || null;
    const image = (i && u) || ogImage || u || null;
    let domain = "";
    try {
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {}
    return {
      title,
      description,
      image,
      ogImage,
      domain,
    };
  }
  function zi(e, t) {
    const n = document.createElement("div");
    n.className = `social-preview-card ${t}`;
    if (t === "x") {
      if (e.image) {
        const r = document.createElement("img");
        r.className = "social-preview-image";
        r.src = e.image;
        r.alt = "";
        r.onerror = function () {
          return r.remove();
        };
        n.appendChild(r);
      }
      if (e.title) {
        const a = document.createElement("div");
        a.className = "social-preview-x-overlay";
        const o = document.createElement("div");
        o.className = "social-preview-title";
        o.textContent = e.title;
        a.appendChild(o);
        n.appendChild(a);
      }
      return n;
    }
    if (e.image) {
      const i = document.createElement("img");
      i.className = "social-preview-image";
      i.src = e.image;
      i.alt = "";
      i.onerror = function () {
        return i.remove();
      };
      n.appendChild(i);
    }
    const c = document.createElement("div");
    c.className = "social-preview-content";
    if (t === "facebook") {
      if (e.domain) {
        const s = document.createElement("div");
        s.className = "social-preview-domain-upper";
        s.textContent = e.domain;
        c.appendChild(s);
      }
      if (e.title) {
        const l = document.createElement("div");
        l.className = "social-preview-title";
        l.textContent = e.title;
        c.appendChild(l);
      }
      if (e.description) {
        const u = document.createElement("div");
        u.className = "social-preview-description";
        u.textContent = e.description;
        c.appendChild(u);
      }
    } else if (t === "linkedin") {
      if (e.title) {
        const d = document.createElement("div");
        d.className = "social-preview-title";
        d.textContent = e.title;
        c.appendChild(d);
      }
      if (e.domain) {
        const p = document.createElement("div");
        p.className = "social-preview-domain-lower";
        p.textContent = e.domain;
        c.appendChild(p);
      }
    }
    n.appendChild(c);
    return n;
  }
  function Yi(e) {
    const n = sidePanelPreferences.socialPreviewType || "facebook";
    const r = Vi(e.meta, n, e.title, e.url);
    if (!r.ogImage) {
      return null;
    }
    const a = document.createElement("div");
    a.className = "section";
    a.id = "socialPreview";
    if (sidePanelPreferences.sectionVisibility.socialPreview?.collapsed) {
      a.classList.add("collapsed");
    }
    const o = document.createElement("div");
    o.className = "section-header";
    const i = document.createElement("div");
    i.className = "expandable-area expand-button";
    const c = document.createElement("div");
    c.className = "disclosure-icon";
    const s = document.createElement("div");
    s.className = "section-title";
    s.textContent = chrome.i18n.getMessage("PAGE_TAB_SOCIAL_PREVIEW");
    i.appendChild(c);
    i.appendChild(s);
    const l = document.createElement("div");
    l.className = "section-actions";
    const u = document.createElement("div");
    u.className = "input-select-container";
    const d = document.createElement("select");
    d.className = "input-select";
    d.dataset.socialPreviewType = "true";
    for (const f of [
      {
        value: "facebook",
        text: chrome.i18n.getMessage("SOCIAL_PREVIEW_FACEBOOK"),
      },
      {
        value: "x",
        text: chrome.i18n.getMessage("SOCIAL_PREVIEW_X"),
      },
      {
        value: "linkedin",
        text: chrome.i18n.getMessage("SOCIAL_PREVIEW_LINKEDIN"),
      },
    ]) {
      const h = document.createElement("option");
      h.value = f.value;
      h.text = f.text;
      d.appendChild(h);
    }
    d.value = n;
    u.appendChild(d);
    l.appendChild(u);
    o.appendChild(i);
    o.appendChild(l);
    a.appendChild(o);
    const v = document.createElement("div");
    v.className = "social-preview-card-container";
    v.appendChild(zi(r, n));
    a.appendChild(v);
    return a;
  }
  function Ki() {
    const e = document.getElementById("page-tab");
    if (e) {
      const t = document.createDocumentFragment();
      const n = document.createElement("div");
      n.className = "header sticky-top";
      n.appendChild(Ii());
      t.appendChild(n);
      const r = document.createElement("div");
      r.className = "empty-container";
      const a = document.createElement("div");
      const o = document.createElement("div");
      o.className = "empty-icon";
      o.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#e3e3e3"><path d="M324-111.5Q251-143 197-197t-85.5-127Q80-397 80-480t31.5-156Q143-709 197-763t127-85.5Q397-880 480-880t156 31.5Q709-817 763-763t85.5 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80t-156-31.5Zm156-35.17q60.67 0 114.17-19.5t97.16-55.5l-67-66.33Q594-265.67 557.5-252.83 521-240 480-240q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 41-13 77.67-13 36.66-35.33 67L738-269q35.33-43.67 55.33-97t20-114q0-139.33-97-236.33t-236.33-97q-139.33 0-236.33 97t-97 236.33q0 139.33 97 236.33t236.33 97Zm0-160q26.67 0 51.17-7.5T576.33-336l-69.66-69q-6.34 2.67-13 3.83Q487-400 480-400q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 7.33-1.5 14.5t-4.17 14.17l69.34 68q14.33-20.67 22-45.17 7.66-24.5 7.66-51.5 0-72-50.66-122.67Q552-653.33 480-653.33t-122.67 50.66Q306.67-552 306.67-480t50.66 122.67Q408-306.67 480-306.67Z"/></svg>';
      const i = document.createElement("h4");
      i.className = "empty-title greyed";
      i.textContent = chrome.i18n.getMessage("NO_PAGE_INFO_MESSAGE");
      a.appendChild(o);
      a.appendChild(i);
      r.appendChild(a);
      t.appendChild(r);
      e.innerHTML = "";
      e.appendChild(t);
    }
  }
  function Xi() {
    Xi = Ao(
      To().mark(function e(t) {
        let n;
        let r;
        let a;
        let o;
        let c;
        let s;
        let l;
        let u;
        let d;
        let p;
        let m;
        let f;
        let h;
        let v;
        let y;
        let b;
        let w;
        let x;
        let E;
        let C;
        let L;
        let N;
        let k;
        let T;
        let S;
        let $;
        let A;
        let M;
        let O;
        let I;
        let R;
        let j;
        let B;
        let P;
        let D;
        let U;
        let H;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if ((n = document.getElementById("page-tab")) && t) {
                    e.next = 3;
                    break;
                  }
                  return e.abrupt("return");
                case 3:
                  r = document.createDocumentFragment();
                  a = document.createElement("div");
                  a.className = "header sticky-top";
                  a.appendChild(Ii());
                  o = document.createElement("div");
                  o.className = "element-name-detail";
                  c = document.createElement("div");
                  c.className = "element-name";
                  s = document.createElement("div");
                  s.className = "element-name-label";
                  s.style.cursor = "default";
                  s.textContent =
                    t.title || chrome.i18n.getMessage("PAGE_TAB_UNTITLED");
                  l = document.createElement("div");
                  l.className = "element-dimensions";
                  l.textContent = gi(t.url);
                  o.appendChild(s);
                  o.appendChild(l);
                  c.appendChild(o);
                  u = document.createElement("div");
                  d = document.createElement("button");
                  d.className = "refresh-button";
                  if (ui > 0) {
                    d.classList.add("refreshing");
                  }
                  d.addEventListener("click", function () {
                    if (qo) {
                      li = null;
                      const e = (ui = Date.now());
                      d.classList.add("refreshing");
                      i.sendMessageToTab(qo, {
                        target: "script",
                        action: "refresh_page_data",
                      }).catch(() => {});
                      setTimeout(() => {
                        if (ui === e) {
                          yi();
                        }
                      }, 5000);
                    }
                  });
                  u.appendChild(d);
                  c.appendChild(u);
                  a.appendChild(c);
                  r.appendChild(a);
                  e.next = 32;
                  return fi();
                case 32:
                  p = e.sent;
                  m = p.success;
                  if ((f = Yi(t))) {
                    r.appendChild(f);
                  }
                  h = [
                    {
                      key: "seo",
                      label: chrome.i18n.getMessage("PAGE_TAB_META_SEO"),
                      attrName: "name",
                    },
                    {
                      key: "openGraph",
                      label: chrome.i18n.getMessage("PAGE_TAB_META_OG"),
                      attrName: "property",
                    },
                    {
                      key: "twitter",
                      label: chrome.i18n.getMessage("PAGE_TAB_META_TWITTER"),
                      attrName: "name",
                    },
                  ];
                  v = h.some((e) => {
                    const r = t.meta?.[e.key];
                    return r && Object.values(r).some((e) => e != null);
                  });
                  if (!v) {
                    e.next = 95;
                    break;
                  }
                  y = document.createElement("div");
                  y.className = "section";
                  y.id = "metaTags";
                  if (
                    sidePanelPreferences.sectionVisibility.metaTags?.collapsed
                  ) {
                    y.classList.add("collapsed");
                  }
                  b = document.createElement("div");
                  b.className = "section-header";
                  w = document.createElement("div");
                  w.className = "expandable-area expand-button";
                  x = document.createElement("div");
                  x.className = "disclosure-icon";
                  E = document.createElement("div");
                  E.className = "section-title";
                  E.textContent = chrome.i18n.getMessage("PAGE_TAB_META_TAGS");
                  w.appendChild(x);
                  w.appendChild(E);
                  b.appendChild(w);
                  y.appendChild(b);
                  C = document.createElement("div");
                  C.className = "pre-wrapper";
                  L = document.createElement("pre");
                  L.className = "styles-block";
                  N = No(h);
                  e.prev = 61;
                  N.s();
                case 63:
                  if ((k = N.n()).done) {
                    e.next = 79;
                    break;
                  }
                  T = k.value;
                  if ((S = t.meta?.[T.key])) {
                    e.next = 68;
                    break;
                  }
                  return e.abrupt("continue", 77);
                case 68:
                  if (
                    ($ = Object.entries(S).filter((e) => Lo(e, 2)[1] != null))
                      .length !== 0
                  ) {
                    e.next = 71;
                    break;
                  }
                  return e.abrupt("continue", 77);
                case 71:
                  A = document.createElement("div");
                  A.className = "line";
                  A.innerHTML = `<span class="comment">/* ${Lc(T.label)} */</span>`;
                  L.appendChild(A);
                  M = No($);
                  try {
                    for (M.s(); !(O = M.n()).done;) {
                      I = Lo(O.value, 2);
                      R = I[0];
                      j = I[1];
                      (B = document.createElement("div")).className = "line";
                      B.innerHTML =
                        R === "title"
                          ? `<span class="keyword">&lt;title&gt;</span><span class="string">${Lc(j)}</span><span class="keyword">&lt;/title&gt;</span>`
                          : R === "canonical"
                            ? `<span class="keyword">&lt;link</span> <span class="property">rel</span>=<span class="string">"canonical"</span> <span class="property">href</span>=<span class="string">"${Lc(j)}"</span> <span class="keyword">/&gt;</span>`
                            : `<span class="keyword">&lt;meta</span> <span class="property">${T.attrName}</span>=<span class="string">"${Lc(R)}"</span> <span class="property">content</span>=<span class="string">"${Lc(j)}"</span> <span class="keyword">/&gt;</span>`;
                      L.appendChild(B);
                    }
                  } catch (error) {
                    M.e(error);
                  } finally {
                    M.f();
                  }
                case 77:
                  e.next = 63;
                  break;
                case 79:
                  e.next = 84;
                  break;
                case 81:
                  e.prev = 81;
                  e.t0 = e.catch(61);
                  N.e(e.t0);
                case 84:
                  e.prev = 84;
                  N.f();
                  return e.finish(84);
                case 87:
                  P = L.querySelectorAll(".line").length;
                  D = P.toString().length;
                  L.style.setProperty("--max-line-digits", D);
                  C.appendChild(L);
                  U = Array.from(L.querySelectorAll(".line"))
                    .map((e) => e.innerText.trim())
                    .join("\n");
                  kc(C, U);
                  y.appendChild(C);
                  r.appendChild(y);
                case 95:
                  if (t.pageWeight) {
                    r.appendChild(ms(t.pageWeight, m));
                  }
                  if ((H = ps(t.seoIssues))) {
                    r.appendChild(H);
                  }
                  n.innerHTML = "";
                  n.appendChild(r);
                case 100:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[61, 81, 84, 87]],
        );
      }),
    );
    return Xi.apply(this, arguments);
  }
  function Zi() {
    Zi = Ao(
      To().mark(function e(t) {
        let r;
        let a;
        let o;
        let i;
        let c;
        let s;
        let l;
        let u;
        let d;
        let p;
        let m;
        let f;
        let h;
        let v;
        let g;
        let y;
        let b;
        let w;
        let x;
        let E;
        let C;
        let L;
        let N;
        let k;
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                if ((r = document.getElementById("page-tab"))) {
                  e.next = 3;
                  break;
                }
                return e.abrupt("return");
              case 3:
                if (
                  (a = r.querySelector(
                    "#technologies, .pro-section[data-feature='technology']",
                  ))
                ) {
                  a.remove();
                }
                if (t && t.length !== 0) {
                  e.next = 7;
                  break;
                }
                return e.abrupt("return");
              case 7:
                e.next = 9;
                return fi();
              case 9:
                o = e.sent;
                if (o.success) {
                  e.next = 17;
                  break;
                }
                i = t.length;
                c = Xc(
                  `${i} ${chrome.i18n.getMessage(i === 1 ? "LABEL_TECHNOLOGY" : "LABEL_TECHNOLOGIES")}`,
                  "technology",
                );
                if ((s = r.querySelector("#seoIssues"))) {
                  r.insertBefore(c, s);
                } else {
                  r.appendChild(c);
                }
                return e.abrupt("return");
              case 17:
                l = document.createElement("div");
                l.className = "section";
                l.id = "technologies";
                if (
                  sidePanelPreferences.sectionVisibility.technologies?.collapsed
                ) {
                  l.classList.add("collapsed");
                }
                u = document.createElement("div");
                u.className = "section-header";
                d = document.createElement("div");
                d.className = "expandable-area expand-button";
                p = document.createElement("div");
                p.className = "disclosure-icon";
                m = document.createElement("div");
                m.className = "section-title";
                f = t.length;
                m.textContent = `${f} ${chrome.i18n.getMessage(f === 1 ? "LABEL_TECHNOLOGY" : "LABEL_TECHNOLOGIES")}`;
                d.appendChild(p);
                d.appendChild(m);
                u.appendChild(d);
                l.appendChild(u);
                h = document.createElement("div");
                h.className = "tech-chips";
                v = No(t);
                try {
                  for (v.s(); !(g = v.n()).done;) {
                    y = g.value;
                    b = y.name || y.id || "Unknown";
                    (w = document.createElement("a")).className = "tech-pill";
                    w.target = "_blank";
                    w.rel = "noopener noreferrer";
                    w.href =
                      y.url ||
                      `https://www.google.com/search?q=${encodeURIComponent(b)}`;
                    if (y.icon) {
                      x = chrome.runtime.getURL(
                        `sidepanel/logos/${y.icon}.svg`,
                      );
                      (E = document.createElement("img")).className =
                        "tech-icon";
                      E.src = x;
                      E.alt = b;
                      w.appendChild(E);
                    } else {
                      (C = document.createElement("div")).className =
                        "tech-icon-placeholder";
                      C.textContent = b.charAt(0).toUpperCase();
                      w.appendChild(C);
                    }
                    (L = document.createElement("span")).className =
                      "tech-name";
                    L.textContent = b;
                    w.appendChild(L);
                    if (y.version) {
                      (N = document.createElement("div")).className =
                        "tech-tooltip";
                      N.textContent = y.version;
                      w.appendChild(N);
                    }
                    h.appendChild(w);
                  }
                } catch (error) {
                  v.e(error);
                } finally {
                  v.f();
                }
                l.appendChild(h);
                if ((k = r.querySelector("#seoIssues"))) {
                  r.insertBefore(l, k);
                } else {
                  r.appendChild(l);
                }
              case 42:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    );
    return Zi.apply(this, arguments);
  }
  function Qi(e) {
    return Ji.apply(this, arguments);
  }
  function Ji() {
    return (Ji = Ao(
      To().mark(function e(t) {
        let n;
        let r;
        let a;
        let o;
        let c;
        let s;
        let l;
        let u;
        let d;
        let p;
        let m;
        let action;
        let h;
        let v;
        let g;
        let y;
        let b;
        let w;
        let x;
        let E;
        let C;
        let L;
        let N;
        let k;
        let _;
        let T;
        let S;
        let $;
        let issueId;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (!t.target.closest || !t.target.closest("#edit-view")) {
                    e.next = 2;
                    break;
                  }
                  return e.abrupt("return");
                case 2:
                  if (!t.target.classList.contains("tab-button")) {
                    e.next = 8;
                    break;
                  }
                  Wi((n = t.target.dataset.tab));
                  selectedTab = n;
                  Ti();
                  return e.abrupt("return");
                case 8:
                  if (t.target.id !== "downloadOgImage") {
                    e.next = 18;
                    break;
                  }
                  e.next = 11;
                  return ic();
                case 11:
                  if (e.sent) {
                    e.next = 15;
                    break;
                  }
                  return e.abrupt("return");
                case 15:
                  e.next = 17;
                  return Ic(t.target.dataset.url);
                case 17:
                  return e.abrupt("return");
                case 18:
                  if (!t.target.closest(".property-list-asset")) {
                    e.next = 47;
                    break;
                  }
                  e.next = 21;
                  return ic();
                case 21:
                  if (e.sent) {
                    e.next = 25;
                    break;
                  }
                  return e.abrupt("return");
                case 25:
                  if (
                    (r = t.target.closest(".property-list-asset")).dataset
                      .type !== "src" &&
                    r.dataset.type !== "background-image"
                  ) {
                    e.next = 36;
                    break;
                  }
                  if (!r.dataset.dataUrl) {
                    e.next = 32;
                    break;
                  }
                  e.next = 30;
                  return jc(r.dataset.dataUrl, r.dataset.fileExtension);
                case 30:
                  e.next = 34;
                  break;
                case 32:
                  e.next = 34;
                  return Ic(r.dataset.url);
                case 34:
                  e.next = 45;
                  break;
                case 36:
                  if (r.dataset.type !== "data-image") {
                    e.next = 41;
                    break;
                  }
                  e.next = 39;
                  return jc(r.dataset.dataUrl, r.dataset.fileExtension);
                case 39:
                  e.next = 45;
                  break;
                case 41:
                  if (r.dataset.type !== "svg") {
                    e.next = 45;
                    break;
                  }
                  a = r.dataset.content;
                  e.next = 45;
                  return Pc(a, "asset.svg");
                case 45:
                  e.next = 211;
                  break;
                case 47:
                  if (
                    !t.target.classList.contains("expand-button") &&
                    !t.target.closest(".expand-button")
                  ) {
                    e.next = 62;
                    break;
                  }
                  o =
                    t.target.closest(".section") ||
                    t.target.closest(".expand-button").closest(".section");
                  c = o.id;
                  o.classList.toggle("collapsed");
                  sidePanelPreferences.sectionVisibility[c].collapsed =
                    !sidePanelPreferences.sectionVisibility[c].collapsed;
                  e.prev = 52;
                  e.next = 55;
                  return i.storageLocalSet({
                    sidePanelPreferences,
                  });
                case 55:
                  e.next = 60;
                  break;
                case 57:
                  e.prev = 57;
                  e.t0 = e.catch(52);
                case 60:
                  e.next = 211;
                  break;
                case 62:
                  if (t.target.id !== "downloadAllAssets") {
                    e.next = 73;
                    break;
                  }
                  e.next = 65;
                  return ic();
                case 65:
                  if (e.sent) {
                    e.next = 69;
                    break;
                  }
                  return e.abrupt("return");
                case 69:
                  e.next = 71;
                  return ac();
                case 71:
                  e.next = 211;
                  break;
                case 73:
                  if (!t.target.classList.contains("copy-action")) {
                    e.next = 81;
                    break;
                  }
                  s = t.target.dataset.content;
                  e.next = 77;
                  return Ot(s);
                case 77:
                  if (e.sent.success) {
                    t.target.classList.add("no-events");
                    t.target.classList.add("copy-success");
                    setTimeout(() => {
                      t.target.classList.remove("no-events");
                      t.target.classList.remove("copy-success");
                    }, 1000);
                  }
                  e.next = 211;
                  break;
                case 81:
                  if (!t.target.closest(".color-item-inline")) {
                    e.next = 93;
                    break;
                  }
                  l = t.target.closest(".color-item-inline");
                  u = l.closest(".color-section");
                  d = u.dataset.activeFormat;
                  p = l.dataset.colorValue;
                  m =
                    d === "HEX"
                      ? St(p)
                      : d === "HSL"
                        ? $t(p)
                        : d === "HSB"
                          ? At(p)
                          : p;
                  e.next = 89;
                  return Ot(m);
                case 89:
                  if (e.sent.success) {
                    l.classList.add("copied");
                    setTimeout(() => {
                      l.classList.remove("copied");
                    }, 1000);
                  }
                  e.next = 211;
                  break;
                case 93:
                  if (!t.target.closest("[data-click-action]")) {
                    e.next = 113;
                    break;
                  }
                  t.stopPropagation();
                  action = t.target.closest("[data-click-action]").dataset
                    .clickAction;
                  e.prev = 96;
                  e.next = 99;
                  return i.sendMessage({
                    target: "background",
                    action: "go_to_tab",
                    tabId: qo,
                  });
                case 99:
                  if (!e.sent.success) {
                    e.next = 106;
                    break;
                  }
                  e.next = 103;
                  return i
                    .sendMessageToTab(qo, {
                      target: "script",
                      action,
                    })
                    .catch(() => {});
                case 103:
                  if (action === "go_to_selected_element") {
                    e.next = 106;
                    break;
                  }
                  e.next = 106;
                  return i
                    .sendMessageToTab(qo, {
                      target: "script",
                      action: "go_to_selected_element",
                    })
                    .catch(() => {});
                case 106:
                  e.next = 111;
                  break;
                case 108:
                  e.prev = 108;
                  e.t1 = e.catch(96);
                case 111:
                  e.next = 211;
                  break;
                case 113:
                  if (!t.target.closest("[data-selector]")) {
                    e.next = 132;
                    break;
                  }
                  t.stopPropagation();
                  if (qo) {
                    e.next = 118;
                    break;
                  }
                  return e.abrupt("return");
                case 118:
                  e.prev = 118;
                  e.next = 121;
                  return i.sendMessage({
                    target: "background",
                    action: "go_to_tab",
                    tabId: qo,
                  });
                case 121:
                  if (!e.sent.success) {
                    e.next = 125;
                    break;
                  }
                  e.next = 125;
                  return i
                    .sendMessageToTab(qo, {
                      target: "script",
                      action: "go_to_selected_element",
                    })
                    .catch(() => {});
                case 125:
                  e.next = 130;
                  break;
                case 127:
                  e.prev = 127;
                  e.t2 = e.catch(118);
                case 130:
                  e.next = 211;
                  break;
                case 132:
                  if (!t.target.closest(".copy-button")) {
                    e.next = 143;
                    break;
                  }
                  h = t.target.closest(".copy-button");
                  if ((v = h.dataset.copyTarget)) {
                    e.next = 137;
                    break;
                  }
                  return e.abrupt("return");
                case 137:
                  e.next = 139;
                  return Ot(v);
                case 139:
                  if (e.sent.success) {
                    h.classList.add("no-events", "copy-success");
                    setTimeout(() => {
                      h.classList.remove("no-events", "copy-success");
                    }, 1000);
                  }
                  e.next = 211;
                  break;
                case 143:
                  if (!t.target.closest("[data-color-copy]")) {
                    e.next = 154;
                    break;
                  }
                  g = t.target.closest("[data-color-copy]");
                  if ((y = g.dataset.colorCopy)) {
                    e.next = 148;
                    break;
                  }
                  return e.abrupt("return");
                case 148:
                  e.next = 150;
                  return Ot(y);
                case 150:
                  if (e.sent.success) {
                    t.target.classList.add("copy-success");
                    setTimeout(() => {
                      t.target.classList.remove("copy-success");
                    }, 1000);
                  }
                  e.next = 211;
                  break;
                case 154:
                  if (!t.target.closest(".issue-nav-button")) {
                    e.next = 180;
                    break;
                  }
                  t.stopPropagation();
                  b = t.target.closest(".issue-nav-button");
                  w = b.closest(".issue-item");
                  x = JSON.parse(w.dataset.issueIds || "[]");
                  E = parseInt(w.dataset.currentIndex, 10);
                  C = w.dataset.hasHighlighted === "true";
                  L = document.querySelectorAll(".issue-item");
                  N = No(L);
                  try {
                    for (N.s(); !(k = N.n()).done;) {
                      if ((_ = k.value) !== w) {
                        _.dataset.hasHighlighted = "false";
                        _.dataset.currentIndex = "0";
                      }
                    }
                  } catch (error) {
                    N.e(error);
                  } finally {
                    N.f();
                  }
                  if (C) {
                    E = b.classList.contains("issue-nav-prev")
                      ? E === 0
                        ? x.length - 1
                        : E - 1
                      : E === x.length - 1
                        ? 0
                        : E + 1;
                    w.dataset.currentIndex = E;
                  } else {
                    w.dataset.hasHighlighted = "true";
                  }
                  if (!qo) {
                    e.next = 178;
                    break;
                  }
                  e.prev = 166;
                  e.next = 169;
                  return i.sendMessage({
                    target: "background",
                    action: "go_to_tab",
                    tabId: qo,
                  });
                case 169:
                  if (!e.sent.success) {
                    e.next = 173;
                    break;
                  }
                  e.next = 173;
                  return i
                    .sendMessageToTab(qo, {
                      target: "script",
                      action: "highlight_issue_element",
                      issueId: x[E],
                    })
                    .catch(() => {});
                case 173:
                  e.next = 178;
                  break;
                case 175:
                  e.prev = 175;
                  e.t3 = e.catch(166);
                case 178:
                  e.next = 211;
                  break;
                case 180:
                  if (!t.target.closest(".issue-item")) {
                    e.next = 203;
                    break;
                  }
                  T = t.target.closest(".issue-item");
                  S = JSON.parse(T.dataset.issueIds || "[]");
                  $ = parseInt(T.dataset.currentIndex, 10);
                  issueId = S[$];
                  rs();
                  T.dataset.hasHighlighted = "true";
                  if (issueId && qo) {
                    e.next = 189;
                    break;
                  }
                  return e.abrupt("return");
                case 189:
                  e.prev = 189;
                  e.next = 192;
                  return i.sendMessage({
                    target: "background",
                    action: "go_to_tab",
                    tabId: qo,
                  });
                case 192:
                  if (!e.sent.success) {
                    e.next = 196;
                    break;
                  }
                  e.next = 196;
                  return i
                    .sendMessageToTab(qo, {
                      target: "script",
                      action: "highlight_issue_element",
                      issueId,
                    })
                    .catch(() => {});
                case 196:
                  e.next = 201;
                  break;
                case 198:
                  e.prev = 198;
                  e.t4 = e.catch(189);
                case 201:
                  e.next = 211;
                  break;
                case 203:
                  if (!t.target.closest(".pro-section")) {
                    e.next = 208;
                    break;
                  }
                  e.next = 206;
                  return ec();
                case 206:
                  e.next = 211;
                  break;
                case 208:
                  if (
                    !t.target.closest(
                      ".input-select-button[data-paywall-feature]",
                    )
                  ) {
                    e.next = 211;
                    break;
                  }
                  e.next = 211;
                  return ec();
                case 211:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [
            [52, 57],
            [96, 108],
            [118, 127],
            [166, 175],
            [189, 198],
          ],
        );
      }),
    )).apply(this, arguments);
  }
  function ec() {
    return tc.apply(this, arguments);
  }
  function tc() {
    return (tc = Ao(
      To().mark(function e() {
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                return e.abrupt("return", Promise.resolve());
              case 2:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function nc(e) {
    return rc.apply(this, arguments);
  }
  function rc() {
    return (rc = Ao(
      To().mark(function e(t) {
        let n;
        let r;
        let a;
        let o;
        let c;
        let s;
        let l;
        let u;
        let d;
        let p;
        let m;
        let f;
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                if (!t.target.matches("[data-social-preview-type]")) {
                  e.next = 8;
                  break;
                }
                n = t.target.value;
                sidePanelPreferences.socialPreviewType = n;
                e.next = 5;
                return i.storageLocalSet({
                  sidePanelPreferences,
                });
              case 5:
                if (
                  (r = document.querySelector(
                    "#socialPreview .social-preview-card-container",
                  )) &&
                  li
                ) {
                  a = Vi(li.meta, n, li.title, li.url);
                  r.innerHTML = "";
                  r.appendChild(zi(a, n));
                }
                return e.abrupt("return");
              case 8:
                if (!t.target.matches("[data-color-format]")) {
                  e.next = 16;
                  break;
                }
                o = t.target;
                if (!(c = document.querySelector(".color-section"))) {
                  e.next = 16;
                  break;
                }
                c.dataset.activeFormat = o.value;
                sidePanelPreferences.colorFormat = o.value;
                e.next = 16;
                return i.storageLocalSet({
                  sidePanelPreferences,
                });
              case 16:
                if (!t.target.matches("#css .input-select")) {
                  e.next = 27;
                  break;
                }
                s = t.target.value;
                l = t.target.closest("#css");
                u = l.querySelectorAll(".code-view-container");
                d = No(u);
                try {
                  for (d.s(); !(p = d.n()).done;) {
                    (m = p.value).style.display =
                      m.dataset.view === s ? "" : "none";
                  }
                } catch (error) {
                  d.e(error);
                } finally {
                  d.f();
                }
                if (
                  (f = l.querySelector(".css-rules-wrapper")) &&
                  s === "matched" &&
                  f.dataset.loaded !== "true"
                ) {
                  hs(f);
                }
                sidePanelPreferences.codeViewMode = s;
                e.next = 27;
                return i.storageLocalSet({
                  sidePanelPreferences,
                });
              case 27:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function ac() {
    return oc.apply(this, arguments);
  }
  function oc() {
    return (oc = Ao(
      To().mark(function e() {
        let t;
        let n;
        let r;
        let a;
        let o;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (
                    (t = document.querySelectorAll(".property-list-asset"))
                      .length !== 0
                  ) {
                    e.next = 3;
                    break;
                  }
                  return e.abrupt("return");
                case 3:
                  n = No(t);
                  e.prev = 4;
                  n.s();
                case 6:
                  if ((r = n.n()).done) {
                    e.next = 24;
                    break;
                  }
                  if (
                    (a = r.value).dataset.type !== "src" &&
                    a.dataset.type !== "background-image"
                  ) {
                    e.next = 13;
                    break;
                  }
                  e.next = 11;
                  return Ic(a.dataset.url);
                case 11:
                  e.next = 22;
                  break;
                case 13:
                  if (a.dataset.type !== "data-image") {
                    e.next = 18;
                    break;
                  }
                  e.next = 16;
                  return jc(a.dataset.dataUrl, a.dataset.fileExtension);
                case 16:
                  e.next = 22;
                  break;
                case 18:
                  if (a.dataset.type !== "svg") {
                    e.next = 22;
                    break;
                  }
                  o = a.dataset.content;
                  e.next = 22;
                  return Pc(o, chrome.i18n.getMessage("DEFAULT_SVG_FILENAME"));
                case 22:
                  e.next = 6;
                  break;
                case 24:
                  e.next = 29;
                  break;
                case 26:
                  e.prev = 26;
                  e.t0 = e.catch(4);
                  n.e(e.t0);
                case 29:
                  e.prev = 29;
                  n.f();
                  return e.finish(29);
                case 32:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[4, 26, 29, 32]],
        );
      }),
    )).apply(this, arguments);
  }
  function ic() {
    return cc.apply(this, arguments);
  }
  function cc() {
    return (cc = Ao(
      To().mark(function e() {
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                e.next = 2;
                return sc();
              case 2:
                if (e.sent) {
                  e.next = 7;
                  break;
                }
                e.next = 6;
                return uc();
              case 6:
                return e.abrupt("return", e.sent);
              case 7:
                return e.abrupt("return", true);
              case 8:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function sc() {
    return lc.apply(this, arguments);
  }
  function lc() {
    return (lc = Ao(
      To().mark(function e() {
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                return e.abrupt(
                  "return",
                  new Promise((resolve) => {
                    chrome.permissions.contains(
                      {
                        permissions: ["downloads"],
                      },
                      function (t) {
                        resolve(t);
                      },
                    );
                  }),
                );
              case 1:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function uc() {
    return dc.apply(this, arguments);
  }
  function dc() {
    return (dc = Ao(
      To().mark(function e() {
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                return e.abrupt(
                  "return",
                  new Promise((resolve) => {
                    chrome.permissions.request(
                      {
                        permissions: ["downloads"],
                      },
                      function (t) {
                        resolve(t);
                      },
                    );
                  }),
                );
              case 1:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function pc(e) {
    return mc.apply(this, arguments);
  }
  function mc() {
    return (mc = Ao(
      To().mark(function e(t) {
        let n;
        let r;
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                e.next = 2;
                return fetch(t);
              case 2:
                n = e.sent;
                e.next = 5;
                return n.text();
              case 5:
                r = e.sent;
                return e.abrupt("return", r);
              case 7:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function fc() {
    const e = document.querySelectorAll("[data-localize]");
    if (e) {
      for (const r of e) {
        r.innerText = chrome.i18n.getMessage(r.dataset.localize);
      }
    }
  }
  function hc() {
    return (hc = Ao(
      To().mark(function e(t) {
        let n;
        let r;
        let a;
        let o;
        let i;
        let c;
        let s;
        let l;
        let u;
        let d;
        let p;
        let m;
        let f;
        let h;
        let v;
        let g;
        let x;
        let E;
        let C;
        let L;
        let N;
        let k;
        let _;
        let T;
        let S;
        let $;
        let A;
        let M;
        let O;
        let I;
        let R;
        let j;
        let B;
        let P;
        let D;
        let U;
        let H;
        let F;
        let G;
        let q;
        let W;
        let V;
        let Y;
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                if ((n = document.getElementById("container"))) {
                  e.next = 3;
                  break;
                }
                return e.abrupt("return");
              case 3:
                if (
                  t &&
                  t.name &&
                  t.boxModel &&
                  t.boxModel.margin &&
                  t.boxModel.border &&
                  t.boxModel.padding
                ) {
                  e.next = 6;
                  break;
                }
                Mi();
                return e.abrupt("return");
              case 6:
                e.next = 8;
                return fi();
              case 8:
                r = e.sent;
                a = r.success;
                e.next = 12;
                return $i();
              case 12:
                o = document.createDocumentFragment();
                i = document.createElement("div");
                i.className = "header sticky-top";
                i.appendChild(Ii());
                c = vc(
                  t.name,
                  t.type,
                  t.boxModel.width,
                  t.boxModel.height,
                  t.availableStates,
                  t.forcedState,
                );
                i.appendChild(c);
                o.appendChild(i);
                s = bc(t.name, t.parentName, t.childName, t.parentSelectable);
                if (
                  sidePanelPreferences.sectionVisibility.documentOutline
                    .collapsed
                ) {
                  s.classList.add("collapsed");
                }
                o.appendChild(s);
                e.next = 24;
                return gc(t.boxModel);
              case 24:
                l = e.sent;
                if (sidePanelPreferences.sectionVisibility.layout.collapsed) {
                  l.classList.add("collapsed");
                }
                o.appendChild(l);
                u = wc(
                  t.css,
                  t.before,
                  t.after,
                  a,
                  t.matchedRules,
                  t.selector,
                  t.forcedState,
                  t.skippedCrossOriginCount,
                  t.edits || {},
                );
                if (sidePanelPreferences.sectionVisibility.css.collapsed) {
                  u.classList.add("collapsed");
                }
                o.appendChild(u);
                if (t.textContent && t.textContent.length > 0) {
                  d = Sc(t.textContent);
                  if (
                    sidePanelPreferences.sectionVisibility.textContent.collapsed
                  ) {
                    d.classList.add("collapsed");
                  }
                  o.appendChild(d);
                }
                if (t.layout) {
                  if (a) {
                    m = ws(t.layout);
                    if (
                      (p = sidePanelPreferences.sectionVisibility.layout) !==
                        null &&
                      p !== undefined &&
                      p.collapsed
                    ) {
                      m.classList.add("collapsed");
                    }
                    o.appendChild(m);
                  } else {
                    f = Xc(
                      chrome.i18n.getMessage("LABEL_FLEX_GRID_LAYOUT"),
                      "layout",
                    );
                    o.appendChild(f);
                  }
                }
                if (t.canvas) {
                  if (a) {
                    v = ss(t.canvas, a);
                    if (
                      (h = sidePanelPreferences.sectionVisibility.canvas) !==
                        null &&
                      h !== undefined &&
                      h.collapsed
                    ) {
                      v.classList.add("collapsed");
                    }
                    o.appendChild(v);
                  } else {
                    g = Xc(chrome.i18n.getMessage("LABEL_CANVAS"), "canvas");
                    o.appendChild(g);
                  }
                }
                if (
                  t.colors &&
                  (t.colors.text.length > 0 ||
                    t.colors.background.length > 0 ||
                    t.colors.border.length > 0)
                ) {
                  x =
                    (t.colors.text?.length || 0) +
                    (t.colors.background?.length || 0) +
                    (t.colors.border?.length || 0);
                  if (a) {
                    E = $c(t.colors);
                    if (
                      sidePanelPreferences.sectionVisibility.colors.collapsed
                    ) {
                      E.classList.add("collapsed");
                    }
                    o.appendChild(E);
                  } else {
                    C = Xc(
                      `${x} ${chrome.i18n.getMessage(x === 1 ? "LABEL_COLOR" : "LABEL_COLORS")}`,
                      "colors",
                    );
                    o.appendChild(C);
                  }
                }
                if (t.gradients && t.gradients.parsed.length > 0) {
                  if (a) {
                    N = ys(t.gradients);
                    if (
                      (L = sidePanelPreferences.sectionVisibility.gradients) !==
                        null &&
                      L !== undefined &&
                      L.collapsed
                    ) {
                      N.classList.add("collapsed");
                    }
                    o.appendChild(N);
                  } else {
                    k = t.gradients.parsed.length;
                    _ = Xc(
                      `${k} ${chrome.i18n.getMessage(k === 1 ? "LABEL_GRADIENT" : "LABEL_GRADIENTS")}`,
                      "gradients",
                    );
                    o.appendChild(_);
                  }
                }
                if (t.typography && t.typography.length > 0) {
                  if (a) {
                    S = Qc(t.typography);
                    if (
                      (T =
                        sidePanelPreferences.sectionVisibility.typography) !==
                        null &&
                      T !== undefined &&
                      T.collapsed
                    ) {
                      S.classList.add("collapsed");
                    }
                    o.appendChild(S);
                  } else {
                    $ = t.typography.length;
                    A = Xc(
                      `${$} ${chrome.i18n.getMessage($ === 1 ? "LABEL_TYPOGRAPHY_STYLE" : "LABEL_TYPOGRAPHY_STYLES")}`,
                      "fonts",
                    );
                    o.appendChild(A);
                  }
                }
                if (t.boxShadow && t.boxShadow.parsed.length > 0) {
                  if (a) {
                    O = Zc(t.boxShadow);
                    if (
                      (M = sidePanelPreferences.sectionVisibility.boxShadow) !==
                        null &&
                      M !== undefined &&
                      M.collapsed
                    ) {
                      O.classList.add("collapsed");
                    }
                    o.appendChild(O);
                  } else {
                    I = t.boxShadow.parsed.length;
                    R = Xc(
                      `${I} ${chrome.i18n.getMessage(I === 1 ? "LABEL_BOX_SHADOW" : "LABEL_BOX_SHADOWS")}`,
                      "box-shadow",
                    );
                    o.appendChild(R);
                  }
                }
                if (t.animations && t.animations.length > 0) {
                  if (a) {
                    B = Fc(t.animations);
                    if (
                      (j =
                        sidePanelPreferences.sectionVisibility.animations) !==
                        null &&
                      j !== undefined &&
                      j.collapsed
                    ) {
                      B.classList.add("collapsed");
                    }
                    o.appendChild(B);
                  } else {
                    P = t.animations.length;
                    D = Xc(
                      `${P} ${chrome.i18n.getMessage(P === 1 ? "LABEL_ANIMATION" : "LABEL_ANIMATIONS")}`,
                      "animation",
                    );
                    o.appendChild(D);
                  }
                }
                if (t.transitions && t.transitions.length > 0) {
                  if (a) {
                    H = Gc(t.transitions);
                    if (
                      (U =
                        sidePanelPreferences.sectionVisibility.transitions) !==
                        null &&
                      U !== undefined &&
                      U.collapsed
                    ) {
                      H.classList.add("collapsed");
                    }
                    o.appendChild(H);
                  } else {
                    F = t.transitions.length;
                    G = Xc(
                      `${F} ${chrome.i18n.getMessage(F === 1 ? "LABEL_TRANSITION" : "LABEL_TRANSITIONS")}`,
                      "transition",
                    );
                    o.appendChild(G);
                  }
                }
                if (t.assets && t.assets.length > 0) {
                  if (a) {
                    q = Ac(t.assets);
                    if (
                      sidePanelPreferences.sectionVisibility.assets.collapsed
                    ) {
                      q.classList.add("collapsed");
                    }
                    o.appendChild(q);
                  } else {
                    W = t.assets.length;
                    V = Xc(
                      `${W} ${chrome.i18n.getMessage(W === 1 ? "LABEL_ASSET" : "LABEL_ASSETS")}`,
                      "assets",
                    );
                    o.appendChild(V);
                  }
                }
                if (t.issues && t.issues.length > 0) {
                  Y = Jc(t.issues);
                  if (
                    sidePanelPreferences.sectionVisibility.issues?.collapsed
                  ) {
                    Y.classList.add("collapsed");
                  }
                  o.appendChild(Y);
                }
                n.innerHTML = "";
                n.appendChild(o);
                fc();
              case 44:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function vc(name, t, n, r, availableStates, forcedState, c = null) {
    const s = document.createElement("div");
    s.className = "element-name-detail";
    const l = document.createElement("div");
    l.className = "element-name";
    const u = document.createElement("div");
    u.id = "selector";
    u.className = "element-name-label";
    u.innerText = name;
    u.dataset.selector = "true";
    const d = document.createElement("div");
    d.className = "element-dimensions";
    if (c !== null) {
      d.classList.add("edit-count");
      d.innerText = Bt(c);
    } else {
      const p = (e) => {
        if (typeof e !== "number" || isNaN(e)) {
          return "0";
        }
        if (e % 1 == 0) {
          return e.toString();
        }
        return e.toFixed(3).replace(/\.?0+$/, "");
      };
      d.innerText = `${p(n)} × ${p(r)}`;
    }
    s.appendChild(u);
    s.appendChild(d);
    l.appendChild(s);
    const m = document.createElement("div");
    m.className = "element-name-actions";
    const computeF = (availableStates_1, forcedState_1) => {
      if (!Array.isArray(availableStates_1) || availableStates_1.length === 0) {
        return null;
      }
      const n = document.createElement("div");
      n.className = "state-button";
      if (forcedState_1) {
        n.classList.add("active");
      }
      const r = document.createElement("select");
      r.className = "state-select-overlay";
      const a = document.createElement("option");
      a.value = "";
      a.text = "Default";
      r.appendChild(a);
      for (const s of availableStates_1) {
        const l = document.createElement("option");
        l.value = s;
        l.text = s;
        r.appendChild(l);
      }
      r.value = forcedState_1 || "";
      r.addEventListener("change", function () {
        const state = r.value || null;
        i.sendMessageToTab(qo, {
          target: "script",
          action: "force_element_state",
          state,
        }).catch(() => {});
      });
      n.appendChild(r);
      return n;
    };
    const f = computeF(availableStates, forcedState);
    if (f) {
      m.appendChild(f);
    }
    const h = document.createElement("button");
    h.className = "copy-button";
    h.dataset.copyTarget = name;
    h.innerHTML = "";
    m.appendChild(h);
    l.appendChild(m);
    return l;
  }
  function gc(e) {
    return yc.apply(this, arguments);
  }
  function yc() {
    yc = Ao(
      To().mark(function e(t) {
        let n;
        let r;
        let a;
        let o;
        let i;
        let c;
        let s;
        let l;
        let u;
        let d;
        let p;
        let m;
        let f;
        let h;
        let v;
        let g;
        let y;
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                n = document.createElement("div");
                n.className = "section";
                n.id = "layout";
                r = document.createElement("div");
                r.className = "section-header";
                a = document.createElement("div");
                a.className = "expandable-area expand-button";
                o = document.createElement("div");
                o.className = "disclosure-icon";
                i = document.createElement("div");
                i.className = "section-title";
                i.innerText = chrome.i18n.getMessage("LABEL_LAYOUT");
                c = document.createElement("div");
                c.className = "section-actions";
                a.appendChild(o);
                a.appendChild(i);
                r.appendChild(a);
                r.appendChild(c);
                n.appendChild(r);
                s = document.createElement("div");
                s.className = "box-model-container";
                e.next = 23;
                return pc("box-model.html");
              case 23:
                l = e.sent;
                u = document.createElement("template");
                u.innerHTML = l;
                d = document.importNode(u.content, true);
                p = function (e, t, _param_2 = true) {
                  const n = _param_2 ? "-" : "";
                  d.querySelector(e).innerText =
                    typeof t === "number" && t !== 0 ? t : n;
                };
                m = function (e, t) {
                  const n = d.querySelector(e);
                  if (n && typeof t === "number" && t !== 0) {
                    n.classList.add("active");
                  }
                };
                p(".box-model-value.mt", t.margin.top);
                p(".box-model-value.mr", t.margin.right);
                p(".box-model-value.mb", t.margin.bottom);
                p(".box-model-value.ml", t.margin.left);
                p(".box-model-value.bt", t.border.top);
                p(".box-model-value.br", t.border.right);
                p(".box-model-value.bb", t.border.bottom);
                p(".box-model-value.bl", t.border.left);
                p(".box-model-value.pt", t.padding.top);
                p(".box-model-value.pr", t.padding.right);
                p(".box-model-value.pb", t.padding.bottom);
                p(".box-model-value.pl", t.padding.left);
                m(".box-model-value.mt", t.margin.top);
                m(".box-model-value.mr", t.margin.right);
                m(".box-model-value.mb", t.margin.bottom);
                m(".box-model-value.ml", t.margin.left);
                f = d.querySelector(".box-model-margin");
                if (
                  t.margin.top > 0 ||
                  t.margin.right > 0 ||
                  t.margin.bottom > 0 ||
                  t.margin.left > 0
                ) {
                  f.classList.add("active");
                }
                h = d.querySelector(".box-model-border");
                if (
                  t.border.top > 0 ||
                  t.border.right > 0 ||
                  t.border.bottom > 0 ||
                  t.border.left > 0
                ) {
                  h.classList.add("active");
                }
                v = d.querySelector(".box-model-padding");
                if (
                  t.padding.top > 0 ||
                  t.padding.right > 0 ||
                  t.padding.bottom > 0 ||
                  t.padding.left > 0
                ) {
                  v.classList.add("active");
                }
                if ((g = d.querySelector(".box-model-dimensions-value"))) {
                  y = function (e) {
                    if (e % 1 == 0) {
                      return e.toString();
                    }
                    return e.toFixed(3).replace(/\.?0+$/, "");
                  };
                  g.innerText = `${y(t.contentWidth)} × ${y(t.contentHeight)}`;
                }
                s.appendChild(d);
                n.appendChild(s);
                return e.abrupt("return", n);
              case 56:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    );
    return yc.apply(this, arguments);
  }
  function bc(name, parentName, childName, r = true) {
    const a = document.createElement("div");
    a.className = "section";
    a.id = "documentOutline";
    const o = document.createElement("div");
    o.className = "section-header";
    const i = document.createElement("div");
    i.className = "expandable-area expand-button";
    const c = document.createElement("div");
    c.className = "disclosure-icon";
    const s = document.createElement("div");
    s.className = "section-title";
    s.innerText = chrome.i18n.getMessage("LABEL_DOCUMENT");
    const l = document.createElement("div");
    l.className = "section-actions";
    i.appendChild(c);
    i.appendChild(s);
    o.appendChild(i);
    o.appendChild(l);
    a.appendChild(o);
    const u = document.createElement("ul");
    u.className = "list";
    const d = (e, t, n, r = "") => {
      const a = document.createElement("li");
      a.className = `list-item ${t} ${r}`.trim();
      if (n) {
        a.dataset.clickAction = n;
      }
      let o;
      const i = document.createElement("div");
      i.className = `outline-icon outline-icon-${(o = (e || "").split(/[#.]/)[0].toLowerCase()) === "div" ? "div" : o === "img" ? "media-image" : o === "video" ? "media-video" : o === "audio" ? "media-audio" : o === "picture" ? "media-picture" : o === "canvas" ? "media-canvas" : o === "iframe" ? "media-iframe" : o === "p" ? "paragraph" : o === "pre" ? "text-pre" : o === "code" ? "text-code" : o === "blockquote" ? "text-quote" : o === "em" || o === "i" ? "text-italic" : o === "strong" || o === "b" ? "text-bold" : o === "mark" ? "text-highlight" : o === "h1" ? "heading-h1" : o === "h2" ? "heading-h2" : o === "h3" ? "heading-h3" : o === "h4" ? "heading-h4" : o === "h5" ? "heading-h5" : o === "h6" ? "heading-h6" : o === "a" ? "link" : o === "button" ? "input-button" : o === "input" ? "input-field" : o === "textarea" ? "input-textarea" : o === "select" ? "input-select" : o === "form" ? "form" : o === "label" ? "input-label" : o === "fieldset" ? "form-fieldset" : o === "legend" ? "form-legend" : o === "ul" ? "list-unordered" : o === "ol" ? "list-ordered" : o === "li" ? "list-item" : o === "table" ? "table" : o === "thead" ? "table-head" : o === "tbody" ? "table-body" : o === "tfoot" ? "table-foot" : o === "tr" ? "table-row" : o === "th" ? "table-header-cell" : o === "td" ? "table-cell" : o === "caption" ? "table-caption" : o === "header" ? "semantic-header" : o === "nav" ? "semantic-nav" : o === "main" ? "semantic-main" : o === "section" ? "semantic-section" : o === "article" ? "semantic-article" : o === "aside" ? "semantic-aside" : o === "footer" ? "semantic-footer" : o === "figure" ? "semantic-figure" : o === "figcaption" ? "semantic-figcaption" : o === "details" ? "semantic-details" : o === "summary" ? "semantic-summary" : o === "dialog" ? "semantic-dialog" : o === "svg" ? "svg" : o === "path" ? "svg-path" : o === "circle" ? "svg-circle" : o === "rect" ? "svg-rect" : o === "g" ? "svg-group" : o === "embed" ? "media-embed" : o === "body" ? "document-body" : o === "html" ? "document-root" : "general"}`;
      const c = document.createElement("div");
      c.className = "label";
      c.innerText = e;
      a.appendChild(i);
      a.appendChild(c);
      return a;
    };
    if (parentName) {
      u.appendChild(
        d(
          parentName,
          "parent-item",
          r ? "select_parent" : "",
          r ? "" : "disabled",
        ),
      );
    }
    u.appendChild(
      d(
        name,
        "document-item",
        "go_to_selected_element",
        parentName ? "" : "no-parent",
      ),
    );
    if (childName) {
      u.appendChild(d(childName, "child-item", "select_child"));
    }
    a.appendChild(u);
    return a;
  }
  function wc(css, before, after, r, a, selector) {
    const i = document.createElement("div");
    i.className = "section";
    i.id = "css";
    const c = document.createElement("div");
    c.className = "section-header";
    const s = document.createElement("div");
    s.className = "expandable-area expand-button";
    const l = document.createElement("div");
    l.className = "disclosure-icon";
    const u = document.createElement("div");
    u.className = "section-title";
    u.innerText = chrome.i18n.getMessage("LABEL_CODE");
    const d = document.createElement("div");
    d.className = "section-actions";
    let p = null;
    let m = null;
    const f = document.createElement("div");
    f.className = "input-select-container";
    const h = (r && sidePanelPreferences.codeViewMode) || "css";
    if (r) {
      const v = document.createElement("select");
      v.className = "input-select";
      for (const b of [
        {
          value: "css",
          textKey: "LABEL_COMPUTED",
        },
        {
          value: "matched",
          textKey: "LABEL_SOURCE",
        },
        {
          value: "tailwind",
          textKey: "LABEL_TAILWIND",
        },
      ]) {
        const w = document.createElement("option");
        w.value = b.value;
        w.text = chrome.i18n.getMessage(b.textKey);
        v.appendChild(w);
      }
      v.value = h;
      f.appendChild(v);
    } else {
      const x = document.createElement("button");
      x.className = "input-select input-select-button";
      x.type = "button";
      x.textContent = chrome.i18n.getMessage("LABEL_COMPUTED");
      x.dataset.paywallFeature = "css-rules";
      f.appendChild(x);
    }
    d.appendChild(f);
    s.appendChild(l);
    s.appendChild(u);
    c.appendChild(s);
    c.appendChild(d);
    i.appendChild(c);
    const E = document.createElement("div");
    E.className = "code-view-container";
    E.dataset.view = "css";
    E.style.display = h === "css" ? "" : "none";
    const C = document.createElement("div");
    C.className = "pre-wrapper";
    const L = document.createElement("pre");
    L.id = "stylesBlock";
    L.className = "styles-block";
    Nc(selector || null, css, L);
    if (before && Object.keys(before).length > 0) {
      Nc(`${selector || ""}::before`, before, L);
    }
    if (after && Object.keys(after).length > 0) {
      Nc(`${selector || ""}::after`, after, L);
    }
    let N;
    C.appendChild(L);
    kc(
      C,
      Array.from(L.querySelectorAll(".line"))
        .map((e) => {
          const t = parseInt(e.style.paddingLeft, 10) || 0;
          return "\t".repeat(Math.floor(t / 20)) + e.innerText.trim();
        })
        .join("\n"),
    );
    E.appendChild(C);
    i.appendChild(E);
    if (r) {
      const k = document.createElement("div");
      k.className = "code-view-container";
      k.dataset.view = "matched";
      k.style.display = h === "matched" ? "" : "none";
      m = document.createElement("div");
      m.className = "pre-wrapper css-rules-wrapper";
      k.appendChild(m);
      i.appendChild(k);
      if (h === "matched") {
        if (di) {
          m.innerHTML = di;
        }
        hs(m);
      }
      const _ = document.createElement("div");
      _.className = "code-view-container";
      _.dataset.view = "tailwind";
      _.style.display = h === "tailwind" ? "" : "none";
      p = document.createElement("div");
      p.className = "pre-wrapper";
      const T = document.createElement("pre");
      T.className = "styles-block";
      let S = "";
      try {
        const $ = ot(
          Object.entries(css)
            .filter((e) => {
              const t = Lo(e, 2);
              t[0];
              const n = t[1];
              return n != null && n !== "";
            })
            .map((e) => {
              const t = Lo(e, 2);
              const [n, r] = t;
              return `${n}: ${r}`;
            })
            .join("; "),
        );
        S = (Array.isArray($) ? $[0] : $ || "").replace(/,\s*$/, "").trim();
        N = {
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
          "decoration-clone": "box-decoration-clone",
        };
        S = S.split(" ")
          .map((e) => N[e] ?? e)
          .join(" ");
      } catch (e) {
        S = "";
      }
      const A = document.createElement("div");
      A.className = "line";
      A.innerHTML = Ut(S);
      T.appendChild(A);
      p.appendChild(T);
      kc(p, S);
      _.appendChild(p);
      i.appendChild(_);
    }
    return i;
  }
  function xc(e, t) {
    return (
      e.mediaActive !== false &&
      !e.pseudoElement &&
      (e.state == null || e.state === t)
    );
  }
  function Ec(matchedRules, t = null) {
    const n = document.createElement("div");
    n.className = "matched-rules-container";
    if (!matchedRules || matchedRules.length === 0) {
      const r = document.createElement("div");
      r.className = "pre-wrapper";
      const a = document.createElement("pre");
      a.className = "styles-block matched-rules-block";
      const o = document.createElement("div");
      o.className = "line";
      o.innerHTML = '<span class="comment">/* No matched rules found */</span>';
      a.appendChild(o);
      r.appendChild(a);
      kc(r, "/* No matched rules found */");
      n.appendChild(r);
      return n;
    }
    let i;
    const c = new Map();
    const s = No(matchedRules);
    try {
      for (s.s(); !(i = s.n()).done;) {
        const l = i.value;
        const u = l.stylesheet || "inline";
        if (!c.has(u)) {
          c.set(u, []);
        }
        c.get(u).push(l);
      }
    } catch (error) {
      s.e(error);
    } finally {
      s.f();
    }
    for (const d of c.values()) {
      d.sort((e, t) => e.sourceIndex - t.sourceIndex);
    }
    const m = new Map();
    const f = Co(matchedRules).sort((e, t) => e.score - t.score);
    for (let h = f.length - 1; h >= 0; h--) {
      const rule = f[h];
      if (xc(rule, t)) {
        for (let g = 0, y = Object.entries(rule.styles); g < y.length; g++) {
          const b = Lo(y[g], 2);
          const w = b[0];
          const isImportant = b[1].priority === "important";
          if (m.has(w)) {
            const E = m.get(w);
            if (isImportant && !E.isImportant) {
              m.set(w, {
                rule,
                isImportant,
              });
            }
          } else {
            m.set(w, {
              rule,
              isImportant,
            });
          }
        }
      }
    }
    for (const [k, _] of c) {
      n.appendChild(Cc(k, _, m, t));
    }
    return n;
  }
  function Cc(e, t, n, r) {
    const a = document.createElement("div");
    a.className = "pre-wrapper matched-block";
    const o = document.createElement("pre");
    o.className = "styles-block matched-rules-block";
    let i;
    const c = [];
    const s = () => {
      const e = document.createElement("div");
      e.className = "line";
      e.innerHTML = "&nbsp;";
      o.appendChild(e);
      c.push("");
    };
    const l = (e, t) => {
      const a = t;
      const i = t > 0 ? "\t" : "";
      const s = document.createElement("div");
      s.className = "line matched-rule-selector";
      if (a) {
        s.style.paddingLeft = `${a}px`;
      }
      s.innerHTML = `<span class="selector">${e.selector}</span> {`;
      o.appendChild(s);
      c.push(`${i}${e.selector} {`);
      for (let l = 0, u = Object.entries(e.styles); l < u.length; l++) {
        const d = Lo(u[l], 2);
        const [p, m] = d;
        const f = m.value;
        const h = m.priority === "important";
        const v = n.get(p);
        const g = xc(e, r) && v && v.rule !== e;
        const y = document.createElement("div");
        y.className = "line";
        y.style.paddingLeft = `${20 + a}px`;
        if (g) {
          y.classList.add("overridden");
        }
        const b = Dt(f, e.stylesheet);
        const w = h ? " !important" : "";
        y.innerHTML = `<span class="property">${p}</span>: <span class="value">${b}${w}</span>;`;
        o.appendChild(y);
        c.push(`${i}\t${p}: ${f}${w};`);
      }
      const x = document.createElement("div");
      x.className = "line";
      if (a) {
        x.style.paddingLeft = `${a}px`;
      }
      x.innerHTML = "}";
      o.appendChild(x);
      c.push(`${i}}`);
    };
    const u = new Map();
    const d = No(t);
    try {
      for (d.s(); !(i = d.n()).done;) {
        const p = i.value;
        const m = p.media || "";
        if (!u.has(m)) {
          u.set(m, []);
        }
        u.get(m).push(p);
      }
    } catch (error) {
      d.e(error);
    } finally {
      d.f();
    }
    let f;
    let h = true;
    const v = No(u);
    try {
      for (v.s(); !(f = v.n()).done;) {
        const g = Lo(f.value, 2);
        const [y, b] = g;
        if (!h) {
          s();
        }
        h = false;
        if (y) {
          const w = document.createElement("div");
          w.className = "line matched-media-open";
          w.innerHTML = `<span class="keyword">@media</span> ${Lc(y)} {`;
          o.appendChild(w);
          c.push(`@media ${y} {`);
          b.forEach((e, t) => {
            if (t > 0) {
              s();
            }
            l(e, 20);
          });
          const x = document.createElement("div");
          x.className = "line";
          x.innerHTML = "}";
          o.appendChild(x);
          c.push("}");
        } else {
          b.forEach((e, t) => {
            if (t > 0) {
              s();
            }
            l(e, 0);
          });
        }
      }
    } catch (error) {
      v.e(error);
    } finally {
      v.f();
    }
    const length = o.querySelectorAll(".line").length;
    o.style.setProperty("--max-line-digits", length.toString().length);
    a.appendChild(o);
    kc(a, c.join("\n"));
    let C;
    const L = a.querySelector(".code-block-footer");
    const computeN = (e) => {
      if (!e || e === "inline") {
        return "inline";
      }
      if (e.startsWith("constructed")) {
        return "constructed";
      }
      try {
        return new URL(e).pathname.split("/").pop() || "stylesheet";
      } catch (t) {
        if (e.length > 30) {
          return `...${e.slice(-27)}`;
        }
        return e;
      }
    };
    const N = computeN(e);
    if (e && e !== "inline" && /^https?:/i.test(e)) {
      (C = document.createElement("a")).className = "matched-file-link";
      C.target = "_blank";
      C.rel = "noopener noreferrer";
      C.href = e;
      C.textContent = N;
    } else {
      (C = document.createElement("span")).className = "matched-file-label";
      C.textContent = N;
    }
    L.prepend(C);
    return a;
  }
  function Lc(e) {
    if (e) {
      return e
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
    return "";
  }
  function Nc(e, t, n) {
    if (e) {
      if (n.children.length > 0) {
        const r = document.createElement("div");
        r.className = "line";
        r.innerHTML = "&nbsp;";
        n.appendChild(r);
      }
      const a = document.createElement("div");
      a.className = "line";
      a.innerText = `${e} {`;
      n.appendChild(a);
    }
    for (const o in t) {
      const i = t[o];
      if (i != null && i.length > 0) {
        const c = Dt(Mt(i, sidePanelPreferences.colorFormat));
        const s = document.createElement("div");
        s.className = "line";
        s.innerHTML = `<span class="property">${o}</span>: <span class="value">${c}</span>;`;
        if (e) {
          s.style.paddingLeft = "20px";
        }
        n.appendChild(s);
      }
    }
    const length = n.querySelectorAll(".line").length.toString().length;
    n.style.setProperty("--max-line-digits", length);
    if (e) {
      const u = document.createElement("div");
      u.className = "line";
      u.innerText = "}";
      n.appendChild(u);
    }
  }
  function kc(e, t) {
    const n = document.createElement("div");
    n.className = "code-block-footer";
    const r = document.createElement("div");
    r.className = "section-action copy-action";
    r.dataset.content = t;
    n.appendChild(r);
    e.appendChild(n);
    return r;
  }
  function _c(e, t) {
    if (t && qo) {
      chrome.permissions.contains(
        {
          origins: ["<all_urls>"],
        },
        function (n) {
          if (n) {
            i.sendMessageToTab(qo, {
              target: "script",
              action: "enable_cross_origin_styles",
            }).catch(() => {});
          } else {
            const r = document.createElement("div");
            r.className = "page-weight-note cross-origin-note";
            r.textContent = `${chrome.i18n.getMessage(
              "MATCHED_CROSS_ORIGIN_HIDDEN",
              [String(t)],
            )} `;
            const a = document.createElement("a");
            a.href = "#";
            a.className = "link";
            a.textContent = chrome.i18n.getMessage("ENABLE_CROSS_ORIGIN");
            a.addEventListener("click", Tc);
            r.appendChild(a);
            r.appendChild(document.createTextNode("."));
            e.appendChild(r);
          }
        },
      );
    }
  }
  function Tc(e) {
    e.preventDefault();
    chrome.permissions.request(
      {
        origins: ["<all_urls>"],
      },
      function (e) {
        if (e && qo) {
          i.sendMessageToTab(qo, {
            target: "script",
            action: "enable_cross_origin_styles",
          }).catch(() => {});
        }
      },
    );
  }
  function Sc(textContent) {
    const t = document.createElement("div");
    t.className = "section";
    t.id = "textContent";
    const n = document.createElement("div");
    n.className = "section-header";
    const r = document.createElement("div");
    r.className = "expandable-area expand-button";
    const a = document.createElement("div");
    a.className = "disclosure-icon";
    const o = document.createElement("div");
    o.className = "section-title";
    o.innerText = chrome.i18n.getMessage("LABEL_TEXT_CONTENT");
    const i = document.createElement("div");
    i.className = "section-actions";
    r.appendChild(a);
    r.appendChild(o);
    n.appendChild(r);
    n.appendChild(i);
    t.appendChild(n);
    const c = document.createElement("div");
    c.className = "pre-wrapper";
    const s = document.createElement("pre");
    s.id = "contentBlock";
    s.className = "content-block";
    s.innerText = textContent;
    c.appendChild(s);
    kc(c, textContent);
    t.appendChild(c);
    return t;
  }
  function $c(colors) {
    const a = document.createElement("div");
    a.className = "section";
    a.id = "colors";
    const o = document.createElement("div");
    o.className = "section-header";
    const i = document.createElement("div");
    i.className = "expandable-area expand-button";
    const c = document.createElement("div");
    c.className = "disclosure-icon";
    const s =
      (colors.text?.length || 0) +
      (colors.background?.length || 0) +
      (colors.border?.length || 0);
    const l = document.createElement("div");
    l.className = "section-title";
    l.innerText = `${s} ${chrome.i18n.getMessage(s === 1 ? "LABEL_COLOR" : "LABEL_COLORS")}`;
    const u = document.createElement("div");
    u.className = "section-actions";
    const d = document.createElement("div");
    d.className = "input-select-container";
    const p = document.createElement("select");
    p.className = "input-select";
    p.dataset.colorFormat = "true";
    const m = [
      {
        value: "HEX",
        text: "HEX/HEXA",
      },
      {
        value: "RGB",
        text: "RGB/RGBA",
      },
      {
        value: "HSL",
        text: "HSL/HSLA",
      },
      {
        value: "HSB",
        text: "HSB/HSBA",
      },
    ];
    for (const v of m) {
      const g = document.createElement("option");
      g.value = v.value;
      g.text = v.text;
      p.appendChild(g);
    }
    p.value = sidePanelPreferences.colorFormat;
    d.appendChild(p);
    u.appendChild(d);
    i.appendChild(c);
    i.appendChild(l);
    o.appendChild(i);
    o.appendChild(u);
    a.appendChild(o);
    const y = document.createElement("div");
    function b(e, t, n) {
      if (t.length !== 0) {
        const r = document.createElement("div");
        r.className = "category-title";
        r.innerText = e;
        y.appendChild(r);
        const a = document.createElement("div");
        a.className = "color-grid";
        for (const c of t) {
          const s = document.createElement("div");
          s.className = "color-item-inline";
          s.dataset.colorValue = c;
          s.dataset.colorType = n;
          const l = document.createElement("div");
          l.className = "color-swatch-inline";
          l.style.backgroundColor = c;
          const u = document.createElement("div");
          u.className = "color-checkmark-overlay";
          l.appendChild(u);
          const d = document.createElement("div");
          d.className = "color-labels-inline";
          for (const h of m) {
            const v = document.createElement("span");
            v.className = `color-label label-${h.value}`;
            if (h.value === "HEX") {
              v.innerText = St(c);
            } else if (h.value === "HSL") {
              v.innerText = $t(c);
            } else if (h.value === "HSB") {
              v.innerText = At(c);
            } else {
              v.innerText = c;
            }
            d.appendChild(v);
          }
          s.appendChild(l);
          s.appendChild(d);
          a.appendChild(s);
        }
        y.appendChild(a);
      }
    }
    y.className = "color-section";
    y.dataset.activeFormat = p.value;
    if (colors.text.length > 0) {
      b(chrome.i18n.getMessage("LABEL_TEXT"), colors.text, "colors");
    }
    if (colors.background.length > 0) {
      b(
        chrome.i18n.getMessage("LABEL_BACKGROUNDS"),
        colors.background,
        "backgrounds",
      );
    }
    if (colors.border.length > 0) {
      b(chrome.i18n.getMessage("LABEL_BORDERS"), colors.border, "borders");
    }
    a.appendChild(y);
    return a;
  }
  function Ac(assets) {
    const t = document.createElement("div");
    t.className = "section";
    t.id = "assets";
    const n = document.createElement("div");
    n.className = "section-header";
    const r = document.createElement("div");
    r.className = "expandable-area expand-button";
    const a = document.createElement("div");
    a.className = "disclosure-icon";
    const o = document.createElement("div");
    o.className = "section-title";
    const e_length = assets.length;
    o.innerText = `${e_length} ${chrome.i18n.getMessage(e_length === 1 ? "LABEL_ASSET" : "LABEL_ASSETS")}`;
    const c = document.createElement("div");
    c.className = "section-actions";
    const s = document.createElement("button");
    s.id = "downloadAllAssets";
    s.className = "section-button";
    s.innerText = chrome.i18n.getMessage("BUTTON_DOWNLOAD_ALL");
    c.appendChild(s);
    r.appendChild(a);
    r.appendChild(o);
    n.appendChild(r);
    n.appendChild(c);
    t.appendChild(n);
    const l = document.createElement("div");
    l.className = "assets-justified-container";
    const u = assets.map(
      (asset, index) =>
        new Promise((resolve) => {
          const r = {
            asset,
            index,
            width: 100,
            height: 100,
            aspectRatio: 1,
            type: "IMG",
            loaded: false,
          };
          if (asset.type === "svg") {
            const computeA = (e) => {
              const t = new DOMParser()
                .parseFromString(e, "image/svg+xml")
                .querySelector("svg");
              if (!t) {
                return null;
              }
              const n = t.getAttribute("width");
              const r = t.getAttribute("height");
              if (n && r) {
                return {
                  width: parseInt(n),
                  height: parseInt(r),
                };
              }
              return null;
            };
            const a = computeA(asset.content);
            if (a) {
              r.width = a.width;
              r.height = a.height;
              r.aspectRatio = a.width / a.height;
            }
            r.type = "svg";
            r.loaded = true;
            resolve(r);
          } else {
            const o = new Image();
            o.onload = function () {
              r.width = o.naturalWidth;
              r.height = o.naturalHeight;
              r.aspectRatio = o.naturalWidth / o.naturalHeight;
              r.loaded = true;
              if (asset.fileExtension) {
                r.type = asset.fileExtension.toLowerCase();
              } else if (asset.url) {
                const computeT = (e) => {
                  try {
                    if (e.startsWith("data:image")) {
                      return "data:image";
                    }
                    const t = new URL(e).pathname;
                    const n = t.lastIndexOf(".");
                    if (n !== -1 && t.length - n <= 5 && n !== 0) {
                      return t.substring(n + 1).toLowerCase();
                    }
                    return null;
                  } catch (e) {
                    return null;
                  }
                };
                const t = computeT(asset.url);
                if (t) {
                  r.type = t.toLowerCase();
                }
              }
              resolve(r);
            };
            o.onerror = function () {
              r.loaded = true;
              resolve(r);
            };
            if (asset.type === "data-image") {
              o.src = asset.dataUrl;
            } else {
              o.src = asset.url;
            }
          }
        }),
    );
    Promise.all(u).then((e) => {
      l.assetDataList = e;
      Mc(l);
    });
    t.appendChild(l);
    return t;
  }
  function Mc(e) {
    if (e && e.assetDataList) {
      const t = e.offsetWidth || 328;
      const computeN = (e, t) => {
        let n;
        const r = [];
        const computeA = (e) => {
          const t = Math.max(0, Math.floor((e - Fo) / Ho));
          return Uo + t;
        };
        const a = computeA(t);
        let o = [];
        let i = 0;
        const c = No(e);
        try {
          for (c.s(); !(n = c.n()).done;) {
            const s = n.value;
            const l = Ro * Oc(s.aspectRatio);
            if (o.length !== 0) {
              if (o.length >= a) {
                r.push(o);
                o = [s];
                i = l;
              } else {
                const u = i + (o.length - 1) * Bo;
                const d = i + l + o.length * Bo;
                if (d > t && t - u < d - t) {
                  r.push(o);
                  o = [s];
                  i = l;
                } else {
                  o.push(s);
                  i += l;
                }
              }
            } else {
              o.push(s);
              i = l;
            }
          }
        } catch (error) {
          c.e(error);
        } finally {
          c.f();
        }
        if (o.length > 0) {
          r.push(o);
        }
        return r;
      };
      const n = computeN(e.assetDataList, t);
      e.innerHTML = "";
      n.forEach((t) =>
        e.appendChild(
          ((e) => {
            const t = document.createElement("div");
            t.className = "assets-justified-row";
            e.forEach((e) => {
              t.appendChild(
                ((e) => {
                  const { asset, width, height, aspectRatio, type } = e;
                  const i = document.createElement("div");
                  i.className = "asset-justified-item property-list-asset";
                  i.dataset.type = asset.type;
                  i.style.flex = `${Oc(aspectRatio)} 1 0`;
                  const c = document.createElement("div");
                  c.className = "asset-image-container";
                  if (asset.type === "svg") {
                    const s = document.createElement("div");
                    s.className = "asset-svg-wrapper";
                    s.innerHTML = asset.content;
                    const l = s.querySelector("svg");
                    if (l && e.width && e.height) {
                      const u = 96;
                      if (e.width < u && e.height < u) {
                        l.style.width = `${e.width}px`;
                        l.style.height = `${e.height}px`;
                      }
                    }
                    c.appendChild(s);
                    i.dataset.content = asset.content;
                  } else {
                    const d = document.createElement("img");
                    if (asset.type === "data-image") {
                      d.src = asset.dataUrl;
                      i.dataset.dataUrl = asset.dataUrl;
                      i.dataset.fileExtension = asset.fileExtension;
                    } else {
                      d.src = asset.url;
                      i.dataset.url = asset.url;
                    }
                    c.appendChild(d);
                  }
                  i.appendChild(c);
                  const p = document.createElement("div");
                  p.className = "asset-info";
                  const m = document.createElement("span");
                  m.className = "asset-type-label";
                  m.textContent = type.toLowerCase();
                  const f = document.createElement("span");
                  f.className = "asset-dimensions";
                  f.textContent = `${width}×${height}`;
                  p.appendChild(m);
                  p.appendChild(f);
                  i.appendChild(p);
                  return i;
                })(e),
              );
            });
            if (e.length === 1) {
              t.style.justifyContent = "flex-start";
              const n = t.querySelector(".asset-justified-item");
              if (n) {
                n.style.flex = `0 0 ${jo * Oc(e[0].aspectRatio)}px`;
              }
            }
            return t;
          })(t),
        ),
      );
    }
  }
  function Oc(aspectRatio) {
    return Math.max(Po, Math.min(Do, aspectRatio || 1));
  }
  function Ic(e) {
    return Rc.apply(this, arguments);
  }
  function Rc() {
    return (Rc = Ao(
      To().mark(function e(t) {
        let n;
        let r;
        let a;
        let o;
        let i;
        let c;
        let s;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  n = Uc(t);
                  r = t;
                  a = null;
                  e.prev = 4;
                  e.next = 7;
                  return fetch(t);
                case 7:
                  o = e.sent;
                  e.next = 10;
                  return o.blob();
                case 10:
                  i = e.sent;
                  c = i.type;
                  if ((s = fs(c))) {
                    if (!n.toLowerCase().endsWith(`.${s}`)) {
                      n = `${n}.${s}`;
                    }
                  }
                  a = URL.createObjectURL(i);
                  r = a;
                  e.next = 20;
                  break;
                case 18:
                  e.prev = 18;
                  e.t0 = e.catch(4);
                case 20:
                  e.next = 22;
                  return new Promise((resolve, reject) => {
                    chrome.downloads.download(
                      {
                        url: r,
                        filename: n,
                      },
                      function () {
                        if (chrome.runtime.lastError) {
                          reject(new Error(chrome.runtime.lastError.message));
                        } else {
                          resolve();
                        }
                      },
                    );
                  });
                case 22:
                  if (a) {
                    URL.revokeObjectURL(a);
                  }
                  e.next = 28;
                  break;
                case 25:
                  e.prev = 25;
                  e.t1 = e.catch(0);
                case 28:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [
            [0, 25],
            [4, 18],
          ],
        );
      }),
    )).apply(this, arguments);
  }
  function jc(e, t) {
    return Bc.apply(this, arguments);
  }
  function Bc() {
    return (Bc = Ao(
      To().mark(function e(t, n) {
        let r;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  r = `image.${n}`;
                  e.next = 4;
                  return new Promise((resolve, reject) => {
                    chrome.downloads.download(
                      {
                        url: t,
                        filename: r,
                      },
                      function () {
                        if (chrome.runtime.lastError) {
                          reject(new Error(chrome.runtime.lastError.message));
                        } else {
                          resolve();
                        }
                      },
                    );
                  });
                case 4:
                  e.next = 9;
                  break;
                case 6:
                  e.prev = 6;
                  e.t0 = e.catch(0);
                case 9:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[0, 6]],
        );
      }),
    )).apply(this, arguments);
  }
  function Pc(e, t) {
    return Dc.apply(this, arguments);
  }
  function Dc() {
    return (Dc = Ao(
      To().mark(function e(t, filename) {
        let r;
        let a;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  r = new Blob([t], {
                    type: "image/svg+xml",
                  });
                  a = URL.createObjectURL(r);
                  e.next = 5;
                  return new Promise((resolve, reject) => {
                    chrome.downloads.download(
                      {
                        url: a,
                        filename,
                      },
                      function () {
                        if (chrome.runtime.lastError) {
                          reject(new Error(chrome.runtime.lastError.message));
                        } else {
                          resolve();
                        }
                      },
                    );
                  });
                case 5:
                  URL.revokeObjectURL(a);
                  e.next = 11;
                  break;
                case 8:
                  e.prev = 8;
                  e.t0 = e.catch(0);
                case 11:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[0, 8]],
        );
      }),
    )).apply(this, arguments);
  }
  function Uc(e) {
    try {
      const t = new URL(e).pathname;
      return (
        t.substring(t.lastIndexOf("/") + 1) ||
        chrome.i18n.getMessage("DEFAULT_ASSET_NAME")
      );
    } catch (e) {
      return chrome.i18n.getMessage("DEFAULT_DOWNLOAD_NAME");
    }
  }
  function Hc(e) {
    const document_documentElement = document.documentElement;
    switch (e) {
      case "system":
        document_documentElement.classList.remove("force-light", "force-dark");
        break;
      case "dark":
        document_documentElement.classList.remove("force-light");
        document_documentElement.classList.add("force-dark");
        break;
      default:
        if (e === "light") {
          document_documentElement.classList.remove("force-dark");
          document_documentElement.classList.add("force-light");
        }
    }
  }
  function Fc(animations) {
    const t = document.createElement("div");
    t.className = "section";
    t.id = "animations";
    const n = document.createElement("div");
    n.className = "section-header";
    const r = document.createElement("div");
    r.className = "expandable-area expand-button";
    const a = document.createElement("div");
    a.className = "disclosure-icon";
    const o = document.createElement("div");
    o.className = "section-title";
    const e_length = animations.length;
    o.innerText = `${e_length} ${chrome.i18n.getMessage(e_length === 1 ? "LABEL_ANIMATION" : "LABEL_ANIMATIONS")}`;
    const c = document.createElement("div");
    c.className = "section-actions";
    r.appendChild(a);
    r.appendChild(o);
    n.appendChild(r);
    n.appendChild(c);
    t.appendChild(n);
    const s = document.createElement("div");
    s.className = "animations-container";
    const l = animations.filter((e) => Wc(e.timingFunction));
    if (l.length > 0) {
      const u = qc(l, "animation");
      s.appendChild(u);
    }
    t.appendChild(s);
    return t;
  }
  function Gc(transitions) {
    const t = document.createElement("div");
    t.className = "section";
    t.id = "transitions";
    const n = document.createElement("div");
    n.className = "section-header";
    const r = document.createElement("div");
    r.className = "expandable-area expand-button";
    const a = document.createElement("div");
    a.className = "disclosure-icon";
    const o = document.createElement("div");
    o.className = "section-title";
    const e_length = transitions.length;
    o.innerText = `${e_length} ${chrome.i18n.getMessage(e_length === 1 ? "LABEL_TRANSITION" : "LABEL_TRANSITIONS")}`;
    const c = document.createElement("div");
    c.className = "section-actions";
    r.appendChild(a);
    r.appendChild(o);
    n.appendChild(r);
    n.appendChild(c);
    t.appendChild(n);
    const s = document.createElement("div");
    s.className = "transitions-container";
    const l = transitions.filter((e) => Wc(e.timingFunction));
    if (l.length > 0) {
      const u = qc(l, "transition");
      s.appendChild(u);
    }
    t.appendChild(s);
    return t;
  }
  function qc(e, t) {
    const n = document.createElement("div");
    n.className = "animation-item";
    const computeR = (e, t) => {
      const n = document.createElement("div");
      n.className = "multi-curve-container";
      const r = document.createElement("div");
      r.className = "curve-container";
      r.addEventListener("mouseenter", function () {
        return Yc(r);
      });
      requestAnimationFrame(() => Yc(r));
      const a = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      a.setAttribute("viewBox", `0 0 ${Mo} ${Oo}`);
      a.setAttribute("class", "timing-curve-svg");
      a.setAttribute("preserveAspectRatio", "none");
      const o = [
        "var(--curve-1)",
        "var(--curve-2)",
        "var(--curve-3)",
        "var(--curve-4)",
        "var(--curve-5)",
        "var(--curve-6)",
        "var(--curve-7)",
        "var(--curve-8)",
        "var(--curve-9)",
        "var(--primary)",
      ];
      const i = Vc();
      a.appendChild(i);
      let c = 0;
      if (t === "transition") {
        let s;
        const l = new Map();
        const u = No(e);
        try {
          for (u.s(); !(s = u.n()).done;) {
            const d = s.value;
            const timing = `${d.duration} ${d.timingFunction}${d.delay && d.delay !== "0s" ? ` ${d.delay}` : ""}`;
            if (!l.has(timing)) {
              l.set(timing, {
                properties: [],
                timing,
                timingFunction: d.timingFunction,
                duration: d.duration,
                delay: d.delay,
                color: o[c % o.length],
              });
              c++;
            }
            l.get(timing).properties.push(d.property);
          }
        } catch (error) {
          u.e(error);
        } finally {
          u.f();
        }
        for (const h of l.values()) {
          const v = Wc(h.timingFunction);
          if (v) {
            zc(a, v, {
              color: h.color,
              duration: h.duration,
              timingFunction: h.timingFunction,
              delay: h.delay,
            });
          }
        }
        r.appendChild(a);
        n.appendChild(r);
        const g = document.createElement("div");
        g.className = "pre-wrapper";
        const y = document.createElement("pre");
        y.className = "styles-block";
        for (
          var b = Array.from(l.values()),
            w = () => {
              const e = b[x];
              const t = e.properties
                .map((t) => `<span style="color: ${e.color}">${t}</span>`)
                .join(", ");
              const n = Dt(e.timing);
              const r = document.createElement("div");
              r.className = "line";
              if (x === 0) {
                const a = b.length === 1 ? ";" : ",";
                r.innerHTML = `<span class="property">transition</span>: <span class="value">${t} ${n}</span>${a}`;
              } else {
                const o = x === b.length - 1 ? ";" : ",";
                r.innerHTML = `<span class="value">${t} ${n}</span>${o}`;
              }
              y.appendChild(r);
            },
            x = 0;
          x < b.length;
          x++
        ) {
          w();
        }
        const E = y.children.length.toString().length;
        y.style.setProperty("--max-line-digits", E);
        g.appendChild(y);
        const C = Array.from(y.querySelectorAll(".line"))
          .map((e) => {
            const t = parseInt(e.style.paddingLeft, 10) || 0;
            return "\t".repeat(Math.floor(t / 20)) + e.innerText.trim();
          })
          .join("\n");
        kc(g, C);
        n.appendChild(g);
      } else {
        for (let L = 0; L < e.length; L++) {
          const N = e[L];
          const k = Wc(N.timingFunction);
          if (k) {
            zc(a, k, {
              color: o[L % o.length],
              duration: N.duration,
              timingFunction: N.timingFunction,
              delay: N.delay,
              extraClass: `curve-${L}`,
            });
          }
        }
        r.appendChild(a);
        n.appendChild(r);
        const _ = document.createElement("div");
        _.className = "pre-wrapper";
        const T = document.createElement("pre");
        T.className = "styles-block";
        for (let S = 0; S < e.length; S++) {
          const $ = e[S];
          let A = `${$.duration} ${$.timingFunction}`;
          if ($.delay && $.delay !== "0s") {
            A += ` ${$.delay}`;
          }
          if ($.iterationCount && $.iterationCount !== "1") {
            A += ` ${$.iterationCount}`;
          }
          const M = o[S % o.length];
          const O = `<span style="color: ${M}">${$.name}</span>`;
          const I = Dt(A);
          const R = document.createElement("div");
          R.className = "line";
          if (S === 0) {
            const j = e.length === 1 ? ";" : ",";
            R.innerHTML = `<span class="property">animation</span>: <span class="value">${O} ${I}</span>${j}`;
          } else {
            const B = S === e.length - 1 ? ";" : ",";
            R.innerHTML = `<span class="value">${O} ${I}</span>${B}`;
          }
          T.appendChild(R);
        }
        for (let P = 0; P < e.length; P++) {
          const D = e[P];
          if (D.keyframes && D.keyframes.length > 0) {
            const U = document.createElement("div");
            U.className = "line";
            U.innerHTML = "&nbsp;";
            T.appendChild(U);
            const H = o[P % o.length];
            const F = document.createElement("div");
            F.className = "line";
            F.innerHTML = `<span class="value">@keyframes</span> <span style="color: ${H}">${D.name}</span> <span class="value">{</span>`;
            T.appendChild(F);
            for (let G = 0; G < D.keyframes.length; G++) {
              const keyframe = D.keyframes[G];
              let W;
              if (keyframe.offset !== null && keyframe.offset !== undefined) {
                const V = (100 * keyframe.offset).toFixed(0);
                W =
                  D.keyframes.length === 2
                    ? V === "0"
                      ? "from"
                      : V === "100"
                        ? "to"
                        : `${V}%`
                    : `${V}%`;
              } else {
                W = G === 0 ? "from" : "to";
              }
              const z = xo({}, keyframe);
              delete z.offset;
              delete z.computedOffset;
              delete z.easing;
              delete z.composite;
              const Y = Object.entries(z).filter((e) => {
                const t = Lo(e, 2);
                const [n, r] = t;
                return r != null && r !== "" && !n.startsWith("_");
              });
              if (Y.length > 0) {
                const K = document.createElement("div");
                K.className = "line";
                K.style.paddingLeft = "20px";
                K.innerHTML = `<span class="selector">${W}</span> {`;
                T.appendChild(K);
                for (const [J, ee] of Y) {
                  const te = document.createElement("div");
                  te.className = "line";
                  te.style.paddingLeft = "40px";
                  const ne = Dt(
                    Mt(ee.toString(), sidePanelPreferences.colorFormat),
                  );
                  te.innerHTML = `<span class="property">${J}</span>: <span class="value">${ne}</span>;`;
                  T.appendChild(te);
                }
                const re = document.createElement("div");
                re.className = "line";
                re.style.paddingLeft = "20px";
                re.innerHTML = "}";
                T.appendChild(re);
              }
            }
            const ae = document.createElement("div");
            ae.className = "line";
            ae.innerHTML = "}";
            T.appendChild(ae);
          }
        }
        const oe = T.children.length.toString().length;
        T.style.setProperty("--max-line-digits", oe);
        _.appendChild(T);
        const ie = Array.from(T.querySelectorAll(".line"))
          .map((e) => {
            const t = parseInt(e.style.paddingLeft, 10) || 0;
            return "\t".repeat(Math.floor(t / 20)) + e.innerText.trim();
          })
          .join("\n");
        kc(_, ie);
        n.appendChild(_);
      }
      return n;
    };
    const r = computeR(e, t);
    n.appendChild(r);
    return n;
  }
  function Wc(timingFunction) {
    if (!timingFunction || typeof timingFunction !== "string") {
      return null;
    }
    const t = {
      linear: {
        type: "cubic-bezier",
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 1,
      },
      ease: {
        type: "cubic-bezier",
        x1: 0.25,
        y1: 0.1,
        x2: 0.25,
        y2: 1,
      },
      "ease-in": {
        type: "cubic-bezier",
        x1: 0.42,
        y1: 0,
        x2: 1,
        y2: 1,
      },
      "ease-out": {
        type: "cubic-bezier",
        x1: 0,
        y1: 0,
        x2: 0.58,
        y2: 1,
      },
      "ease-in-out": {
        type: "cubic-bezier",
        x1: 0.42,
        y1: 0,
        x2: 0.58,
        y2: 1,
      },
    };
    if (t[timingFunction]) {
      return t[timingFunction];
    }
    const n = timingFunction.match(/cubic-bezier\(([^)]+)\)/);
    if (n) {
      const r = n[1].split(",").map((e) => parseFloat(e.trim()));
      if (r.length === 4) {
        return {
          type: "cubic-bezier",
          x1: r[0],
          y1: r[1],
          x2: r[2],
          y2: r[3],
        };
      }
    }
    const a = timingFunction.match(/steps\((\d+)(?:,\s*(start|end))?\)/);
    if (a) {
      return {
        type: "steps",
        steps: parseInt(a[1]),
        position: a[2] || "end",
      };
    }
    return null;
  }
  function Vc() {
    const e = document.createElementNS("http://www.w3.org/2000/svg", "g");
    e.setAttribute("class", "curve-grid");
    const t = Mo - 2 * Io;
    const n = Oo - 2 * Io;
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("x", Io);
    r.setAttribute("y", Io);
    r.setAttribute("width", t);
    r.setAttribute("height", n);
    r.setAttribute("fill", "var(--background)");
    r.setAttribute("class", "grid-background");
    e.appendChild(r);
    for (let a = 0; a <= 4; a++) {
      const o = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const i = Io + a * (t / 4);
      o.setAttribute("x1", i);
      o.setAttribute("y1", Io);
      o.setAttribute("x2", i);
      o.setAttribute("y2", Io + n);
      o.setAttribute("class", "grid-line");
      o.setAttribute("vector-effect", "non-scaling-stroke");
      e.appendChild(o);
    }
    for (let c = 0; c <= 4; c++) {
      const s = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const l = Io + c * (n / 4);
      s.setAttribute("x1", Io);
      s.setAttribute("y1", l);
      s.setAttribute("x2", Io + t);
      s.setAttribute("y2", l);
      s.setAttribute("class", "grid-line");
      s.setAttribute("vector-effect", "non-scaling-stroke");
      e.appendChild(s);
    }
    return e;
  }
  function zc(
    e,
    t,
    { color, duration, timingFunction, delay, extraClass } = {},
  ) {
    const s = Kc(t);
    s.setAttribute("class", "multi-curve-track");
    e.appendChild(s);
    const l = Kc(t);
    l.setAttribute("stroke", color);
    l.setAttribute(
      "class",
      `multi-curve-path${extraClass ? ` ${extraClass}` : ""}`,
    );
    e.appendChild(l);
    l.style.setProperty("--draw-length", l.getTotalLength() || 0);
    l.style.setProperty("--draw-duration", duration || "0.4s");
    l.style.setProperty("--draw-ease", timingFunction || "ease");
    l.style.setProperty(
      "--draw-delay",
      delay && delay !== "0s" && delay !== "0ms" ? delay : "0s",
    );
    return l;
  }
  function Yc(e) {
    for (const r of e.querySelectorAll(".multi-curve-path")) {
      const a = r.ownerSVGElement;
      if (a) {
        const o = a.getBoundingClientRect();
        const i = a.viewBox.baseVal;
        if (o.width && o.height && i.width && i.height) {
          const c = o.width / i.width;
          const s = o.height / i.height;
          const l = r.getTotalLength();
          if (l) {
            let u = 0;
            let d = r.getPointAtLength(0);
            for (let p = 1; p <= 64; p++) {
              const m = r.getPointAtLength((l * p) / 64);
              u += Math.hypot((m.x - d.x) * c, (m.y - d.y) * s);
              d = m;
            }
            r.style.setProperty("--draw-length", u);
          }
        }
      }
    }
  }
  function Kc(e) {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const n = Mo - 2 * Io;
    const r = Oo - 2 * Io;
    if (e.type === "steps") {
      for (
        var a = e.steps,
          o = r / a,
          i = Io + r,
          c = (e) => i - e * o,
          s = (e) => Io + e * n,
          l = e.position === "start",
          u = `M ${Io} ${i}`,
          d = 0;
        d < a;
        d++
      ) {
        const p = s(d / a);
        const m = s((d + 1) / a);
        u += l
          ? ` L ${p} ${c(d + 1)} L ${m} ${c(d + 1)}`
          : ` L ${m} ${c(d)} L ${m} ${c(d + 1)}`;
      }
      t.setAttribute("d", u);
    } else {
      const f = Io + e.x1 * n;
      const h = Io + r - e.y1 * r;
      const v = Io + e.x2 * n;
      const g = Io + r - e.y2 * r;
      const y = `M ${Io} ${Io + r} C ${f} ${h}, ${v} ${g}, ${Io + n} ${Io}`;
      t.setAttribute("d", y);
    }
    t.setAttribute("class", "timing-curve");
    t.setAttribute("vector-effect", "non-scaling-stroke");
    return t;
  }
  function Xc(e, t = "default") {
    const n = document.createElement("div");
    n.className = "section pro-section";
    n.dataset.feature = t;
    const r = document.createElement("div");
    r.className = "section-header";
    const a = document.createElement("div");
    a.className = "pro-header-title-container";
    const o = document.createElement("div");
    o.className = "pro-lock-icon";
    const i = document.createElement("div");
    i.className = "section-title";
    i.textContent = e;
    a.appendChild(o);
    a.appendChild(i);
    r.appendChild(a);
    n.appendChild(r);
    return n;
  }
  function Zc(boxShadow) {
    const t = document.createElement("div");
    t.className = "section";
    t.id = "boxShadow";
    const n = document.createElement("div");
    n.className = "section-header";
    const r = document.createElement("div");
    r.className = "expandable-area expand-button";
    const a = document.createElement("div");
    a.className = "disclosure-icon";
    const o = document.createElement("div");
    o.className = "section-title";
    const length = boxShadow.parsed.length;
    o.innerText = `${length} ${chrome.i18n.getMessage(length === 1 ? "LABEL_BOX_SHADOW" : "LABEL_BOX_SHADOWS")}`;
    const c = document.createElement("div");
    c.className = "section-actions";
    r.appendChild(a);
    r.appendChild(o);
    n.appendChild(r);
    n.appendChild(c);
    t.appendChild(n);
    const s = document.createElement("div");
    s.className = "box-shadow-container";
    const computeL = (e) => {
      const t = document.createElement("div");
      t.className = "box-shadow-visualization";
      const n = document.createElement("div");
      n.className = "shadow-stack";
      let r;
      const a = 80;
      const o = 10;
      r = e.length * o > a ? a / e.length : o;
      const i = ((e.length - 1) / 2) * r;
      e.reverse();
      for (let c = 0; c < e.length; c++) {
        const s = e[c];
        const l = document.createElement("div");
        l.className = "shadow-layer shadow";
        l.style.boxShadow = s;
        l.style.setProperty("--original-box-shadow", s);
        l.style.zIndex = c + 1;
        l.title = s;
        const u = -(c * r - i);
        l.style.setProperty("--explode-offset", `${u}px`);
        n.appendChild(l);
      }
      t.appendChild(n);
      return t;
    };
    const l = computeL(boxShadow.parsed);
    s.appendChild(l);
    const u = document.createElement("div");
    u.className = "pre-wrapper";
    const d = document.createElement("pre");
    d.className = "styles-block";
    for (let p = 0; p < boxShadow.parsed.length; p++) {
      const m = boxShadow.parsed[p];
      const f = document.createElement("div");
      f.className = "line";
      const h = Dt(Mt(m.trim(), sidePanelPreferences.colorFormat));
      if (p === 0) {
        const v = boxShadow.parsed.length === 1 ? ";" : ",";
        f.innerHTML = `<span class="property">box-shadow</span>: <span class="value">${h}</span>${v}`;
      } else {
        const g = p === boxShadow.parsed.length - 1 ? ";" : ",";
        f.innerHTML = `<span class="value">${h}</span>${g}`;
      }
      d.appendChild(f);
    }
    const length_1 = d.children.length.toString().length;
    d.style.setProperty("--max-line-digits", length_1);
    u.appendChild(d);
    const b = Array.from(d.querySelectorAll(".line"))
      .map((e) => e.innerText.trim())
      .join("\n");
    kc(u, b);
    s.appendChild(u);
    t.appendChild(s);
    return t;
  }
  function Qc(typography) {
    const t = document.createElement("div");
    t.className = "section";
    t.id = "typography";
    const n = document.createElement("div");
    n.className = "section-header";
    const r = document.createElement("div");
    r.className = "expandable-area expand-button";
    const a = document.createElement("div");
    a.className = "disclosure-icon";
    const o = document.createElement("div");
    o.className = "section-title";
    const e_length = typography.length;
    o.innerText = `${e_length} ${chrome.i18n.getMessage(e_length === 1 ? "LABEL_TYPOGRAPHY_STYLE" : "LABEL_TYPOGRAPHY_STYLES")}`;
    const c = document.createElement("div");
    c.className = "section-actions";
    r.appendChild(a);
    r.appendChild(o);
    n.appendChild(r);
    n.appendChild(c);
    t.appendChild(n);
    const s = document.createElement("div");
    s.className = "typography-list";
    for (const d of typography) {
      const p = document.createElement("div");
      p.className = "typography-item";
      p.dataset.typographyKey = d.typographyKey;
      p.className = "typography-item";
      const m = document.createElement("div");
      m.className = "typography-info";
      const f = document.createElement("div");
      f.className = "typography-details";
      const h = document.createElement("span");
      h.className = "typeface-name";
      h.textContent = d.fontFamily;
      f.appendChild(h);
      f.appendChild(document.createTextNode(` ${d.fontSize} ${d.fontWeight}`));
      if (d.letterSpacing) {
        const v = document.createElement("span");
        v.className = "bar";
        v.textContent = " | ";
        f.appendChild(v);
        f.appendChild(document.createTextNode(d.letterSpacing));
      }
      if (d.textTransform) {
        const g = document.createElement("span");
        g.className = "bar";
        g.textContent = " | ";
        f.appendChild(g);
        f.appendChild(document.createTextNode(d.textTransform));
      }
      m.appendChild(f);
      const y = document.createElement("div");
      y.className = "typography-sample-container";
      const b = document.createElement("img");
      b.className = "typography-sample";
      b.src = d.vectorSample;
      b.alt = `${d.fontFamily} sample`;
      b.style.height = `${d.sampleHeight}px`;
      p.appendChild(m);
      y.appendChild(b);
      p.appendChild(y);
      s.appendChild(p);
    }
    t.appendChild(s);
    return t;
  }
  function Jc(e) {
    const t = document.createElement("div");
    t.className = "section";
    t.id = "issues";
    const n = document.createElement("div");
    n.className = "section-header";
    const r = document.createElement("div");
    r.className = "expandable-area expand-button";
    const a = document.createElement("div");
    a.className = "disclosure-icon";
    const o = document.createElement("div");
    o.className = "section-title";
    const e_length = e.length;
    o.innerText = `${e_length} ${chrome.i18n.getMessage(e_length === 1 ? "LABEL_ISSUE" : "LABEL_ISSUES")}`;
    const c = document.createElement("div");
    c.className = "section-actions";
    r.appendChild(a);
    r.appendChild(o);
    n.appendChild(r);
    n.appendChild(c);
    t.appendChild(n);
    const s = document.createElement("div");
    s.className = "issues-list";
    const l = ns(e);
    l.sort((e, t) => {
      const n = {
        error: 0,
        warning: 1,
        info: 2,
      };
      return n[e.severity] - n[t.severity];
    });
    for (const p of l) {
      const m = ts(p, p.severity);
      s.appendChild(m);
    }
    t.appendChild(s);
    return t;
  }
  function es() {
    return (es = Ao(
      To().mark(function e(t) {
        let r;
        let a;
        return To().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                if ((r = document.getElementById("issues"))) {
                  e.next = 3;
                  break;
                }
                return e.abrupt("return");
              case 3:
                if (t && t.length !== 0) {
                  e.next = 6;
                  break;
                }
                r.remove();
                return e.abrupt("return");
              case 6:
                a = Jc(t);
                if (sidePanelPreferences.sectionVisibility.issues?.collapsed) {
                  a.classList.add("collapsed");
                }
                r.replaceWith(a);
              case 9:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function ts(e, severity) {
    const n = document.createElement("div");
    n.className = `issue-item issue-${severity}`;
    n.dataset.issueIds = JSON.stringify(e.issueIds || []);
    n.dataset.currentIndex = "0";
    n.dataset.hasHighlighted = "false";
    n.dataset.issueType = e.type;
    n.dataset.issueCategory = e.category || "general";
    const r = document.createElement("div");
    r.className = `issue-icon issue-icon-${severity}`;
    const a = document.createElement("div");
    a.className = "issue-content";
    if (e.selector) {
      const o = document.createElement("div");
      o.className = "issue-selector-row";
      const i = document.createElement("div");
      i.className = "issue-selector";
      i.textContent = e.selector;
      if (e.count > 1) {
        const c = document.createElement("div");
        c.className = "issue-controls-wrapper";
        const s = document.createElement("span");
        s.className = "issue-count-badge";
        s.textContent = `${e.count} ${chrome.i18n.getMessage("LABEL_INSTANCES")}`;
        const l = document.createElement("div");
        l.className = "issue-button-group";
        const u = document.createElement("button");
        u.className = "issue-nav-button issue-nav-prev";
        const d = document.createElement("button");
        d.className = "issue-nav-button issue-nav-next";
        l.appendChild(u);
        l.appendChild(d);
        c.appendChild(s);
        c.appendChild(l);
        o.appendChild(i);
        o.appendChild(c);
      } else {
        o.appendChild(i);
      }
      a.appendChild(o);
    }
    const p = document.createElement("div");
    p.className = "issue-message";
    p.textContent = e.message;
    const m = document.createElement("div");
    m.className = "issue-recommendation";
    m.textContent = e.recommendation;
    a.appendChild(p);
    a.appendChild(m);
    n.appendChild(r);
    n.appendChild(a);
    return n;
  }
  function ns(e) {
    let t;
    const n = new Map();
    const r = No(e);
    try {
      for (r.s(); !(t = r.n()).done;) {
        const a = t.value;
        const o = a.groupingKey;
        if (n.has(o)) {
          const i = n.get(o);
          i.issueIds.push(a.id);
          i.count++;
        } else {
          n.set(
            o,
            xo(
              xo({}, a),
              {},
              {
                issueIds: [a.id],
                count: 1,
              },
            ),
          );
        }
      }
    } catch (error) {
      r.e(error);
    } finally {
      r.f();
    }
    return Array.from(n.values());
  }
  function rs() {
    for (const n of document.querySelectorAll(".issue-item")) {
      n.dataset.hasHighlighted = "false";
      n.dataset.currentIndex = "0";
    }
  }
  function as(e) {
    if (e.target.classList.contains("preview-link")) {
      const t = e.target.getAttribute("href");
      if (t) {
        ((e, t) => {
          const n = document.querySelector(".image-preview-tooltip");
          if (n) {
            n.remove();
          }
          const r = document.createElement("div");
          r.className = "image-preview-tooltip";
          r.style.opacity = "0";
          const a = document.createElement("img");
          a.src = e;
          t.style.cursor = "wait";
          a.onerror = function () {
            r.remove();
            t.style.removeProperty("cursor");
          };
          a.onload = function () {
            t.style.removeProperty("cursor");
            const e = t.getBoundingClientRect();
            const n = window.pageXOffset || document.documentElement.scrollLeft;
            const a = window.pageYOffset || document.documentElement.scrollTop;
            const o = r.getBoundingClientRect();
            const i = 15;
            const c = 8;
            let s = e.left + n + e.width / 2 - o.width / 2;
            let l = e.top + a - o.height - c;
            if (s < i) {
              s = i;
            } else if (s + o.width > window.innerWidth - i) {
              s = window.innerWidth - o.width - i;
            }
            if (l < a + i) {
              l = e.bottom + a + c;
            }
            r.style.left = `${s}px`;
            r.style.top = `${l}px`;
            r.style.opacity = "1";
          };
          r.appendChild(a);
          document.body.appendChild(r);
        })(t, e.target);
      }
    }
    const n = e.target.closest(".color-item-inline");
    if (n) {
      const color = n.dataset.colorValue;
      const colorType = n.dataset.colorType;
      if (color && colorType && qo) {
        i.sendMessageToTab(qo, {
          target: "script",
          action: "highlight_elements_for_color",
          color,
          colorType,
        }).catch(() => {});
      }
    }
    const o = e.target.closest(".typography-item");
    if (o) {
      const typographyKey = o.dataset.typographyKey;
      if (typographyKey && qo) {
        i.sendMessageToTab(qo, {
          target: "script",
          action: "highlight_elements_for_typography",
          typographyKey,
        }).catch(() => {});
      }
    }
    const s = e.target.closest(".issue-item");
    if (s) {
      const issueIds = JSON.parse(s.dataset.issueIds || "[]");
      if (issueIds.length > 0 && qo) {
        i.sendMessageToTab(qo, {
          target: "script",
          action: "highlight_elements_for_issue",
          issueIds,
        }).catch(() => {});
      }
    }
  }
  function os(e) {
    if (e.target.classList.contains("preview-link")) {
      e.target.style.removeProperty("cursor");
      const t = document.querySelector(".image-preview-tooltip");
      if (t) {
        t.remove();
      }
    }
    if (e.target.closest(".color-item-inline") && qo) {
      i.sendMessageToTab(qo, {
        target: "script",
        action: "clear_element_highlights",
      }).catch(() => {});
    }
    if (e.target.closest(".typography-item") && qo) {
      i.sendMessageToTab(qo, {
        target: "script",
        action: "clear_element_highlights",
      }).catch(() => {});
    }
    if (e.target.closest(".issue-item") && qo) {
      i.sendMessageToTab(qo, {
        target: "script",
        action: "clear_element_highlights",
      }).catch(() => {});
    }
  }
  function is() {
    if (qo) {
      i.sendMessageToTab(qo, {
        target: "script",
        action: "clear_element_highlights",
      }).catch(() => {});
    }
  }
  function cs() {
    const e = document.querySelector(".image-preview-tooltip");
    if (e) {
      e.remove();
    }
  }
  function ss(canvas, t) {
    const n = document.createElement("div");
    n.className = "section";
    n.id = "canvas";
    const r = document.createElement("div");
    r.className = "section-header";
    const a = document.createElement("div");
    a.className = "expandable-area expand-button";
    const o = document.createElement("div");
    o.className = "disclosure-icon";
    const i = document.createElement("div");
    i.className = "section-title";
    i.innerText = chrome.i18n.getMessage("LABEL_CANVAS");
    const c = document.createElement("div");
    c.className = "section-actions";
    a.appendChild(o);
    a.appendChild(i);
    r.appendChild(a);
    r.appendChild(c);
    n.appendChild(r);
    const s = document.createElement("ul");
    s.className = "property-list";
    if (canvas.contextType) {
      const l = ls(
        chrome.i18n.getMessage("LABEL_CONTEXT_TYPE"),
        canvas.contextType,
      );
      s.appendChild(l);
    }
    if (canvas.dimensions) {
      const u = canvas.dimensions;
      const { width, height } = u;
      const m = ls(
        chrome.i18n.getMessage("LABEL_CANVAS_DIMENSIONS"),
        `${width} × ${height}`,
      );
      s.appendChild(m);
    }
    if (canvas.pixelRatio) {
      const f = ls(
        chrome.i18n.getMessage("LABEL_PIXEL_RATIO"),
        `${canvas.pixelRatio}x`,
      );
      s.appendChild(f);
    }
    n.appendChild(s);
    return n;
  }
  function ls(e, t) {
    const n = document.createElement("li");
    n.className = "property-item";
    const r = document.createElement("div");
    r.className = "property-label";
    r.textContent = e;
    const a = document.createElement("div");
    a.className = "property-value";
    a.textContent = t;
    n.appendChild(r);
    n.appendChild(a);
    return n;
  }
  function us(e) {
    if (e < 1024) {
      return `${e} B`;
    }
    if (e < 1048576) {
      return `${(e / 1024).toFixed(1)} KB`;
    }
    return `${(e / 1048576).toFixed(2)} MB`;
  }
  function ds(e) {
    const t = document.createElement("div");
    t.className = `issue-item issue-${e.severity} issue-item-static`;
    const n = document.createElement("div");
    n.className = `issue-icon issue-icon-${e.severity}`;
    const r = document.createElement("div");
    r.className = "issue-content";
    if (e.target) {
      const a = document.createElement("div");
      a.className = "issue-selector-row";
      const o = document.createElement("div");
      o.className = "issue-selector";
      o.textContent = e.target;
      a.appendChild(o);
      r.appendChild(a);
    }
    const i = document.createElement("div");
    i.className = "issue-message";
    i.textContent = e.message;
    r.appendChild(i);
    if (e.recommendation) {
      const c = document.createElement("div");
      c.className = "issue-recommendation";
      c.textContent = e.recommendation;
      r.appendChild(c);
    }
    t.appendChild(n);
    t.appendChild(r);
    return t;
  }
  function ps(seoIssues) {
    if (!seoIssues || seoIssues.length === 0) {
      return null;
    }
    const n = ns(seoIssues);
    const r = document.createElement("div");
    r.className = "section";
    r.id = "seoIssues";
    if (sidePanelPreferences.sectionVisibility.seoIssues?.collapsed) {
      r.classList.add("collapsed");
    }
    const a = document.createElement("div");
    a.className = "section-header";
    const o = document.createElement("div");
    o.className = "expandable-area expand-button";
    const i = document.createElement("div");
    i.className = "disclosure-icon";
    const c = document.createElement("div");
    c.className = "section-title";
    c.textContent = `${n.length} ${chrome.i18n.getMessage(n.length === 1 ? "SEO_LABEL_ISSUE" : "SEO_LABEL_ISSUES")}`;
    o.appendChild(i);
    o.appendChild(c);
    a.appendChild(o);
    r.appendChild(a);
    const s = document.createElement("div");
    s.className = "issues-list";
    for (const d of n.sort((e, t) => {
      const n = {
        error: 0,
        warning: 1,
        info: 2,
      };
      return n[e.severity] - n[t.severity];
    })) {
      if (d.selector) {
        s.appendChild(ts(d, d.severity));
      } else {
        s.appendChild(ds(d));
      }
    }
    r.appendChild(s);
    return r;
  }
  function ms(e, t) {
    if (!t) {
      return Xc(chrome.i18n.getMessage("PAGE_TAB_PAGE_WEIGHT"), "page-weight");
    }
    const u = document.createElement("div");
    u.className = "section";
    u.id = "pageWeight";
    if (sidePanelPreferences.sectionVisibility.pageWeight?.collapsed) {
      u.classList.add("collapsed");
    }
    const d = document.createElement("div");
    d.className = "section-header";
    const p = document.createElement("div");
    p.className = "expandable-area expand-button";
    const m = document.createElement("div");
    m.className = "disclosure-icon";
    const f = document.createElement("div");
    f.className = "section-title";
    f.textContent = chrome.i18n.getMessage("PAGE_TAB_PAGE_WEIGHT");
    p.appendChild(m);
    p.appendChild(f);
    d.appendChild(p);
    u.appendChild(d);
    const h = e.total || 0;
    const v = [
      {
        key: "document",
        value: e.document || 0,
        className: "pw-document",
      },
      {
        key: "script",
        value: e.byType?.script || 0,
        className: "pw-script",
      },
      {
        key: "css",
        value: e.byType?.css || 0,
        className: "pw-css",
      },
      {
        key: "img",
        value: e.byType?.img || 0,
        className: "pw-img",
      },
      {
        key: "font",
        value: e.byType?.font || 0,
        className: "pw-font",
      },
      {
        key: "media",
        value: e.byType?.media || 0,
        className: "pw-media",
      },
      {
        key: "fetch",
        value: e.byType?.fetch || 0,
        className: "pw-fetch",
      },
      {
        key: "other",
        value: e.byType?.other || 0,
        className: "pw-other",
      },
    ];
    const g = document.createElement("div");
    g.className = "page-weight-total";
    g.textContent = us(h);
    u.appendChild(g);
    const y = {
      document: "LABEL_PW_DOCUMENT",
      script: "LABEL_PW_SCRIPTS",
      css: "LABEL_PW_CSS",
      img: "LABEL_PW_IMAGES",
      font: "LABEL_PW_FONTS",
      media: "LABEL_PW_MEDIA",
      fetch: "LABEL_PW_FETCH",
      other: "LABEL_PW_OTHER",
    };
    if (h > 0) {
      const b = document.createElement("div");
      b.className = "page-weight-visual";
      const w = document.createElement("div");
      w.className = "page-weight-bar";
      const x = document.createElement("div");
      x.className = "page-weight-legend";
      const E = document.createElement("div");
      E.className = "page-weight-tooltip";
      const C = document.createElement("span");
      C.className = "page-weight-tooltip-label";
      const L = document.createElement("span");
      L.className = "page-weight-tooltip-value";
      E.appendChild(C);
      E.appendChild(L);
      let N;
      const k = {};
      const _ = (e, key) => {
        e.dataset.pwType = key;
        e.addEventListener("mouseenter", function () {
          return ((key_1) => {
            const t = k[key_1];
            if (t) {
              b.querySelectorAll(`[data-pw-type="${key_1}"]`).forEach((e) =>
                e.classList.add("is-hovered"),
              );
              C.textContent = t.label;
              L.textContent = t.valueText;
              E.classList.add("is-visible");
              const n = b.getBoundingClientRect();
              const r = t.segEl.getBoundingClientRect();
              const a = r.left + r.width / 2 - n.left;
              const o = E.offsetWidth / 2;
              const i = Math.max(o + 4, Math.min(a, n.width - o - 4));
              E.style.left = `${i}px`;
              E.style.top = `${w.getBoundingClientRect().top - n.top}px`;
            }
          })(key);
        });
        e.addEventListener("mouseleave", function () {
          return ((key_1) => {
            b.querySelectorAll(`[data-pw-type="${key_1}"]`).forEach((e) =>
              e.classList.remove("is-hovered"),
            );
            E.classList.remove("is-visible");
          })(key);
        });
      };
      const T = No(v);
      try {
        for (T.s(); !(N = T.n()).done;) {
          const S = N.value;
          if (S.value) {
            const $ = (S.value / h) * 100;
            const A = $ > 0 && $ < 1 ? "<1%" : `${Math.round($)}%`;
            const label = chrome.i18n.getMessage(y[S.key]);
            const segEl = document.createElement("div");
            segEl.className = `page-weight-bar-segment ${S.className}`;
            segEl.style.flexBasis = `${$}%`;
            w.appendChild(segEl);
            _(segEl, S.key);
            const I = document.createElement("div");
            I.className = `page-weight-legend-item ${S.className}`;
            const R = document.createElement("span");
            R.className = "page-weight-dot";
            const j = document.createElement("span");
            j.className = "page-weight-legend-label";
            j.textContent = label;
            I.appendChild(R);
            I.appendChild(j);
            x.appendChild(I);
            _(I, S.key);
            k[S.key] = {
              segEl,
              label,
              valueText: `${us(S.value)} · ${A}`,
            };
          }
        }
      } catch (error) {
        T.e(error);
      } finally {
        T.f();
      }
      b.appendChild(E);
      b.appendChild(w);
      b.appendChild(x);
      u.appendChild(b);
    }
    if (e.unknownCount > 0) {
      const B = document.createElement("div");
      B.className = "page-weight-note";
      B.textContent = chrome.i18n.getMessage(
        "PW_HIDDEN_NOTE",
        String(e.unknownCount),
      );
      u.appendChild(B);
    }
    if (e.bufferFull) {
      const P = document.createElement("div");
      P.className = "page-weight-note";
      P.textContent = chrome.i18n.getMessage("PW_BUFFER_FULL");
      u.appendChild(P);
    }
    return u;
  }
  function fs(e) {
    return (
      {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "image/bmp": "bmp",
        "image/x-icon": "ico",
        "image/tiff": "tiff",
        "image/avif": "avif",
      }[e] || null
    );
  }
  function hs(e) {
    return vs.apply(this, arguments);
  }
  function vs() {
    return (vs = Ao(
      To().mark(function e(t) {
        let n;
        let r;
        return To().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (qo && t.dataset.loaded !== "true") {
                    e.next = 2;
                    break;
                  }
                  return e.abrupt("return");
                case 2:
                  e.prev = 2;
                  e.next = 5;
                  return i.sendMessageToTab(qo, {
                    target: "script",
                    action: "get_matched_rules",
                  });
                case 5:
                  if ((n = e.sent).success && n.matchedRules) {
                    r = Ec(n.matchedRules, n.forcedState);
                    t.innerHTML = "";
                    t.appendChild(r);
                    _c(t, n.skippedCrossOriginCount || 0);
                    if (n.matchedRules.length > 0) {
                      t.dataset.loaded = "true";
                    }
                    di = t.innerHTML;
                  } else {
                    gs(t);
                  }
                  e.next = 12;
                  break;
                case 9:
                  e.prev = 9;
                  e.t0 = e.catch(2);
                  gs(t);
                case 12:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[2, 9]],
        );
      }),
    )).apply(this, arguments);
  }
  function gs(e) {
    e.innerHTML = "";
    const t = document.createElement("div");
    t.className = "pre-wrapper";
    const n = document.createElement("pre");
    n.className = "styles-block matched-rules-block";
    n.innerHTML =
      '<div class="line"><span class="comment">/* Could not retrieve CSS rules for this element */</span></div>';
    t.appendChild(n);
    kc(t, "/* Could not retrieve CSS rules for this element */");
    e.appendChild(t);
  }
  function ys(gradients) {
    const t = document.createElement("div");
    t.className = "section";
    t.id = "gradients";
    const n = document.createElement("div");
    n.className = "section-header";
    const r = document.createElement("div");
    r.className = "expandable-area expand-button";
    const a = document.createElement("div");
    a.className = "disclosure-icon";
    const o = document.createElement("div");
    o.className = "section-title";
    const length = gradients.parsed.length;
    o.innerText = `${length} ${chrome.i18n.getMessage(length === 1 ? "LABEL_GRADIENT" : "LABEL_GRADIENTS")}`;
    const c = document.createElement("div");
    c.className = "section-actions";
    r.appendChild(a);
    r.appendChild(o);
    n.appendChild(r);
    n.appendChild(c);
    t.appendChild(n);
    const s = document.createElement("div");
    s.className = "gradient-container";
    let l;
    const u = No(gradients.parsed);
    try {
      const d = () => {
        const l_value = l.value;
        const t = document.createElement("div");
        t.className = "gradient-item";
        const n = document.createElement("div");
        n.className = "gradient-visual";
        const r = l_value.stops
          .map((t) => {
            const n = bs(t, l_value.stops);
            return `${t.color} ${n}%`;
          })
          .join(", ");
        const a = document.createElement("div");
        a.className = "gradient-track";
        a.style.setProperty(
          "--gradient-track-bg",
          `linear-gradient(to right, ${r})`,
        );
        let o;
        const i = No(l_value.stops);
        try {
          const c = () => {
            const o_value = o.value;
            const n = bs(o_value, l_value.stops);
            const r = document.createElement("div");
            r.className = "gradient-stop-marker";
            r.style.left = `${n}%`;
            const i = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "svg",
            );
            i.setAttribute("class", "gradient-stop-pin");
            i.setAttribute("viewBox", "0 0 24 33");
            const c = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "path",
            );
            c.setAttribute(
              "d",
              "M7,1 H17 A6,6 0 0 1 23,7 V17 A6,6 0 0 1 17,23 H16 L12,29 L8,23 H7 A6,6 0 0 1 1,17 V7 A6,6 0 0 1 7,1 Z",
            );
            i.appendChild(c);
            const s = document.createElement("div");
            s.className = "gradient-stop-marker-color";
            s.style.backgroundColor = o_value.color;
            const l = document.createElement("div");
            l.className = "gradient-stop-tooltip";
            l.innerHTML = `${Dt(Mt(o_value.color, sidePanelPreferences.colorFormat))}${o_value.position !== null ? ` @ ${parseFloat(o_value.position.toFixed(3))}${o_value.unit}` : ""}`;
            r.appendChild(i);
            r.appendChild(s);
            r.appendChild(l);
            a.appendChild(r);
            requestAnimationFrame(() => {
              const e = a.getBoundingClientRect();
              const t = l.getBoundingClientRect();
              const r = e.left + e.width * (n / 100);
              const o = t.width / 2;
              const i = r - o;
              const c = r + o;
              let s = 0;
              if (i < e.left) {
                s = e.left - i;
              } else if (c > e.right) {
                s = e.right - c;
              }
              if (s !== 0) {
                l.style.transform = `translateX(calc(-50% + ${s}px))`;
              }
            });
          };
          for (i.s(); !(o = i.n()).done;) {
            c();
          }
        } catch (error) {
          i.e(error);
        } finally {
          i.f();
        }
        n.appendChild(a);
        t.appendChild(n);
        const u = document.createElement("div");
        u.className = "pre-wrapper";
        const d = document.createElement("pre");
        d.className = "styles-block";
        Nc(
          null,
          {
            "background-image": l_value.raw,
          },
          d,
        );
        u.appendChild(d);
        kc(u, `background-image: ${l_value.raw};`);
        t.appendChild(u);
        s.appendChild(t);
      };
      for (u.s(); !(l = u.n()).done;) {
        d();
      }
    } catch (error) {
      u.e(error);
    } finally {
      u.f();
    }
    t.appendChild(s);
    return t;
  }
  function bs(e, stops) {
    if (e.position === null) {
      return 0;
    }
    if (e.unit === "%") {
      return e.position;
    }
    if (e.unit === "deg") {
      return (e.position / 360) * 100;
    }
    if (e.unit === "px") {
      const r = stops.filter((e) => e.unit === "px" && e.position !== null);
      const a = Math.max(...Co(r.map((e) => e.position)));
      if (a === 0) {
        return 0;
      }
      return (e.position / a) * 100;
    }
    return e.position ?? 0;
  }
  function ws(layout) {
    const t = document.createElement("div");
    t.className = "section";
    t.id = "layout-visual";
    const n = document.createElement("div");
    n.className = "section-header";
    const r = document.createElement("div");
    r.className = "expandable-area expand-button";
    const a = document.createElement("div");
    a.className = "disclosure-icon";
    const o = document.createElement("div");
    o.className = "section-title";
    o.innerText = chrome.i18n.getMessage("LABEL_FLEX_GRID_LAYOUT");
    const i = document.createElement("div");
    i.className = "section-actions";
    r.appendChild(a);
    r.appendChild(o);
    n.appendChild(r);
    n.appendChild(i);
    t.appendChild(n);
    const c = document.createElement("div");
    c.className = "layout-model";
    const s = document.createElement("div");
    s.className = "layout-outer";
    const l = layout.display === "grid" || layout.display === "inline-grid";
    const u =
      !l &&
      (layout.flexDirection === "row" ||
        layout.flexDirection === "row-reverse");
    const d =
      !l &&
      (layout.flexDirection === "row-reverse" ||
        layout.flexDirection === "column-reverse");
    const p = document.createElement("div");
    p.className = `layout-label layout-label-main-start ${l || u ? "horizontal" : "vertical"}`;
    p.innerText = d ? "end" : "start";
    const m = document.createElement("div");
    m.className = `layout-label layout-label-main-end ${l || u ? "horizontal" : "vertical"}`;
    m.innerText = d ? "start" : "end";
    const f = document.createElement("div");
    f.className = `layout-label layout-label-cross-start ${l || u ? "horizontal" : "vertical"}`;
    f.innerText = "start";
    const h = document.createElement("div");
    h.className = `layout-label layout-label-cross-end ${l || u ? "horizontal" : "vertical"}`;
    h.innerText = "end";
    s.appendChild(p);
    s.appendChild(m);
    s.appendChild(f);
    s.appendChild(h);
    const v = document.createElement("div");
    v.className = "layout-inner";
    if (l) {
      v.classList.add("grid");
      v.style.justifyItems = layout.justifyItems;
      v.style.alignItems = layout.alignItems;
      v.style.justifyContent = layout.justifyContent;
      v.style.alignContent = layout.alignContent;
      const g = layout.columnCount || 3;
      const y = Math.min(layout.rowCount || 1, 3);
      v.style.gridTemplateColumns = `repeat(${g}, 1fr)`;
      v.style.gridTemplateRows = `repeat(${y}, 1fr)`;
      for (let b = g * y, w = 1; w <= b; w++) {
        const x = document.createElement("div");
        x.className = "layout-item";
        x.innerText = w;
        v.appendChild(x);
      }
      if (g > 6) {
        v.classList.add("hide-numbers");
      }
    } else {
      const E = document.createElement("div");
      E.className = `layout-direction-line ${u ? "horizontal" : "vertical"}${d ? " reversed" : ""}`;
      s.appendChild(E);
      v.style.display = "flex";
      v.style.flexDirection = layout.flexDirection;
      v.style.flexWrap = layout.flexWrap;
      v.style.justifyContent = layout.justifyContent;
      v.style.alignItems = layout.alignItems;
      v.style.alignContent = layout.alignContent;
      const C = layout.flexWrap === "nowrap" ? 3 : 7;
      if (layout.flexWrap !== "nowrap") {
        v.classList.add("wrapping");
      }
      for (let L = 1; L <= C; L++) {
        const N = document.createElement("div");
        N.className = "layout-item";
        N.innerText = L;
        v.appendChild(N);
      }
    }
    s.appendChild(v);
    c.appendChild(s);
    t.appendChild(c);
    const k = document.createElement("div");
    k.className = "pre-wrapper";
    let _;
    const T = document.createElement("pre");
    T.className = "styles-block";
    Nc(
      null,
      (_ = l
        ? {
            display: layout.display,
            "grid-template-columns": layout.gridTemplateColumns,
            "grid-template-rows":
              layout.gridTemplateRows !== "none"
                ? layout.gridTemplateRows
                : undefined,
            "justify-items":
              layout.justifyItems !== "normal"
                ? layout.justifyItems
                : undefined,
            "align-items":
              layout.alignItems !== "normal" ? layout.alignItems : undefined,
            "justify-content":
              layout.justifyContent !== "normal"
                ? layout.justifyContent
                : undefined,
            "align-content":
              layout.alignContent !== "normal"
                ? layout.alignContent
                : undefined,
            gap:
              layout.gap !== "normal normal" && layout.gap !== "0px"
                ? layout.gap
                : undefined,
          }
        : {
            display: layout.display,
            "flex-direction":
              layout.flexDirection !== "row" ? layout.flexDirection : undefined,
            "flex-wrap":
              layout.flexWrap !== "nowrap" ? layout.flexWrap : undefined,
            "justify-content":
              layout.justifyContent !== "normal"
                ? layout.justifyContent
                : undefined,
            "align-items":
              layout.alignItems !== "normal" ? layout.alignItems : undefined,
            "align-content":
              layout.flexWrap !== "nowrap" && layout.alignContent !== "normal"
                ? layout.alignContent
                : undefined,
            gap:
              layout.gap !== "normal normal" && layout.gap !== "0px"
                ? layout.gap
                : undefined,
          }),
      T,
    );
    k.appendChild(T);
    kc(
      k,
      Object.entries(_)
        .filter((e) => Lo(e, 2)[1] !== undefined)
        .map((e) => {
          const t = Lo(e, 2);
          const [n, r] = t;
          return `${n}: ${r};`;
        })
        .join("\n"),
    );
    t.appendChild(k);
    return t;
  }
})();
