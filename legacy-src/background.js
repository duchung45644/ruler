importScripts("bd-background.js");
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
      return n;
    };
    let r;
    var n = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const s =
      Object.defineProperty ||
      ((e, t, r) => {
        e[t] = r.value;
      });
    const i = typeof Symbol === "function" ? Symbol : {};
    const o = i.iterator || "@@iterator";
    const u = i.asyncIterator || "@@asyncIterator";
    const l = i.toStringTag || "@@toStringTag";
    function p(e, t, r) {
      Object.defineProperty(e, t, {
        value: r,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      p({}, "");
    } catch (r) {
      p = function (e, t, r) {
        return (e[t] = r);
      };
    }
    function f(e, t, r, n) {
      const a = t && t.prototype instanceof y ? t : y;
      const c = Object.create(a.prototype);
      const i = new M(n || []);
      s(c, "_invoke", {
        value: P(e, r, i),
      });
      return c;
    }
    function d(e, t, r) {
      try {
        return {
          type: "normal",
          arg: e.call(t, r),
        };
      } catch (error) {
        return {
          type: "throw",
          arg: error,
        };
      }
    }
    n.wrap = f;
    var h = "suspendedStart";
    var v = "suspendedYield";
    var m = "executing";
    var g = "completed";
    var b = {};
    function y() {}
    function x() {}
    function w() {}
    let _ = {};
    p(_, o, function () {
      return this;
    });
    const I =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(R([])));
    if (I && I !== Object.prototype && hasOwnProperty.call(I, o)) {
      _ = I;
    }
    const L = (w.prototype = y.prototype = Object.create(_));
    function E(e) {
      ["next", "throw", "return"].forEach((t) => {
        p(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function T(t, r) {
      function n(a, s, i, o) {
        const u = d(t[a], t, s);
        if (u.type !== "throw") {
          const l = u.arg;
          const p = l.value;
          if (p && e(p) == "object" && hasOwnProperty.call(p, "__await")) {
            return r.resolve(p.__await).then(
              (e) => {
                n("next", e, i, o);
              },
              (e) => {
                n("throw", e, i, o);
              },
            );
          }
          return r.resolve(p).then(
            (e) => {
              l.value = e;
              i(l);
            },
            (e) => n("throw", e, i, o),
          );
        }
        o(u.arg);
      }
      let a;
      s(this, "_invoke", {
        value: function (e, t) {
          function c() {
            return new r(function (r, a) {
              n(e, t, r, a);
            });
          }
          return (a = a ? a.then(c, c) : c());
        },
      });
    }
    function P(e, t, n) {
      let a = h;
      return function (c, s) {
        if (a === m) {
          throw Error("Generator is already running");
        }
        if (a === g) {
          if (c === "throw") {
            throw s;
          }
          return {
            value: r,
            done: true,
          };
        }
        n.method = c;
        for (n.arg = s; ;) {
          const i = n.delegate;
          if (i) {
            const o = S(i, n);
            if (o) {
              if (o === b) {
                continue;
              }
              return o;
            }
          }
          if (n.method === "next") {
            n.sent = n._sent = n.arg;
          } else if (n.method === "throw") {
            if (a === h) {
              a = g;
              throw n.arg;
            }
            n.dispatchException(n.arg);
          } else {
            if (n.method === "return") {
              n.abrupt("return", n.arg);
            }
          }
          a = m;
          const u = d(e, t, n);
          if (u.type === "normal") {
            a = n.done ? g : v;
            if (u.arg === b) {
              continue;
            }
            return {
              value: u.arg,
              done: n.done,
            };
          }
          if (u.type === "throw") {
            a = g;
            n.method = "throw";
            n.arg = u.arg;
          }
        }
      };
    }
    function S(e, t) {
      const t_method = t.method;
      const a = e.iterator[t_method];
      if (a === r) {
        t.delegate = null;
        if (
          !(
            t_method === "throw" &&
            e.iterator.return &&
            ((t.method = "return"), (t.arg = r), S(e, t), t.method === "throw")
          )
        ) {
          if (t_method !== "return") {
            t.method = "throw";
            t.arg = new TypeError(
              `The iterator does not provide a '${t_method}' method`,
            );
          }
        }
        return b;
      }
      const c = d(a, e.iterator, t.arg);
      if (c.type === "throw") {
        t.method = "throw";
        t.arg = c.arg;
        t.delegate = null;
        return b;
      }
      const c_arg = c.arg;
      if (c_arg) {
        if (c_arg.done) {
          return (
            (t[e.resultName] = c_arg.value),
            (t.next = e.nextLoc),
            t.method !== "return" && ((t.method = "next"), (t.arg = r)),
            (t.delegate = null),
            b
          );
        }
        return c_arg;
      }
      return (
        (t.method = "throw"),
        (t.arg = new TypeError("iterator result is not an object")),
        (t.delegate = null),
        b
      );
    }
    function O(e) {
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
      e.forEach(O, this);
      this.reset(true);
    }
    function R(t) {
      if (t || t === "") {
        const n = t[o];
        if (n) {
          return n.call(t);
        }
        if (typeof t.next === "function") {
          return t;
        }
        if (!isNaN(t.length)) {
          let a = -1;
          const s = function e() {
            while (++a < t.length) {
              if (hasOwnProperty.call(t, a)) {
                e.value = t[a];
                e.done = false;
                return e;
              }
            }
            e.value = r;
            e.done = true;
            return e;
          };
          return (s.next = s);
        }
      }
      throw new TypeError(`${e(t)} is not iterable`);
    }
    x.prototype = w;
    s(L, "constructor", {
      value: w,
      configurable: true,
    });
    s(w, "constructor", {
      value: x,
      configurable: true,
    });
    x.displayName = p(w, l, "GeneratorFunction");
    n.isGeneratorFunction = function (e) {
      const t = typeof e === "function" && e.constructor;
      return (
        !!t && (t === x || (t.displayName || t.name) === "GeneratorFunction")
      );
    };
    n.mark = function (e) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(e, w);
      } else {
        e.__proto__ = w;
        p(e, l, "GeneratorFunction");
      }
      e.prototype = Object.create(L);
      return e;
    };
    n.awrap = function (e) {
      return {
        __await: e,
      };
    };
    E(T.prototype);
    p(T.prototype, u, function () {
      return this;
    });
    n.AsyncIterator = T;
    n.async = function (e, t, r, a, c = Promise) {
      const s = new T(f(e, t, r, a), c);
      if (n.isGeneratorFunction(t)) {
        return s;
      }
      return s.next().then((e) => {
        if (e.done) {
          return e.value;
        }
        return s.next();
      });
    };
    E(L);
    p(L, l, "Generator");
    p(L, o, function () {
      return this;
    });
    p(L, "toString", function () {
      return "[object Generator]";
    });
    n.keys = function (e) {
      const t = Object(e);
      const r = [];
      for (const n in t) {
        r.push(n);
      }
      r.reverse();
      return function e() {
        while (r.length) {
          const n = r.pop();
          if (n in t) {
            e.value = n;
            e.done = false;
            return e;
          }
        }
        e.done = true;
        return e;
      };
    };
    n.values = R;
    M.prototype = {
      constructor: M,
      reset: function (e) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = r;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = r;
        this.tryEntries.forEach(A);
        if (!e) {
          for (const t in this) {
            if (
              t.charAt(0) === "t" &&
              hasOwnProperty.call(this, t) &&
              !isNaN(+t.slice(1))
            ) {
              this[t] = r;
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
        function n(n, a) {
          i.type = "throw";
          i.arg = e;
          t.next = n;
          if (a) {
            t.method = "next";
            t.arg = r;
          }
          return !!a;
        }
        for (let a = this.tryEntries.length - 1; a >= 0; --a) {
          const s = this.tryEntries[a];
          var i = s.completion;
          if (s.tryLoc === "root") {
            return n("end");
          }
          if (s.tryLoc <= this.prev) {
            const o = hasOwnProperty.call(s, "catchLoc");
            const u = hasOwnProperty.call(s, "finallyLoc");
            if (o && u) {
              if (this.prev < s.catchLoc) {
                return n(s.catchLoc, true);
              }
              if (this.prev < s.finallyLoc) {
                return n(s.finallyLoc);
              }
            } else if (o) {
              if (this.prev < s.catchLoc) {
                return n(s.catchLoc, true);
              }
            } else {
              if (!u) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < s.finallyLoc) {
                return n(s.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let r = this.tryEntries.length - 1; r >= 0; --r) {
          const n = this.tryEntries[r];
          if (
            n.tryLoc <= this.prev &&
            hasOwnProperty.call(n, "finallyLoc") &&
            this.prev < n.finallyLoc
          ) {
            var a = n;
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
        const s = a ? a.completion : {};
        s.type = e;
        s.arg = t;
        if (a) {
          return ((this.method = "next"), (this.next = a.finallyLoc), b);
        }
        return this.complete(s);
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
        return b;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const r = this.tryEntries[t];
          if (r.finallyLoc === e) {
            this.complete(r.completion, r.afterLoc);
            A(r);
            return b;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const r = this.tryEntries[t];
          if (r.tryLoc === e) {
            const n = r.completion;
            if (n.type === "throw") {
              var a = n.arg;
              A(r);
            }
            return a;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (e, t, n) {
        this.delegate = {
          iterator: R(e),
          resultName: t,
          nextLoc: n,
        };
        if (this.method === "next") {
          this.arg = r;
        }
        return b;
      },
    };
    return n;
  }
  function r(e, t, r, n, a, c, s) {
    try {
      var i = e[c](s);
      var o = i.value;
    } catch (error) {
      return void r(error);
    }
    if (i.done) {
      t(o);
    } else {
      Promise.resolve(o).then(n, a);
    }
  }
  function n(e) {
    return function () {
      const t = this;
      const n = arguments;
      return new Promise((resolve, reject) => {
        const s = e.apply(t, n);
        function i(e) {
          r(s, resolve, reject, i, o, "next", e);
        }
        function o(e) {
          r(s, resolve, reject, i, o, "throw", e);
        }
        i(undefined);
      });
    };
  }
  var a = {};
  function c(e) {
    return function (...r) {
      return new Promise((resolve, reject) => {
        e(...r, function (e) {
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
  a.tabsQuery = c(chrome.tabs.query.bind(chrome.tabs));
  a.tabsCreate = c(chrome.tabs.create.bind(chrome.tabs));
  a.tabsUpdate = c(chrome.tabs.update.bind(chrome.tabs));
  a.windowsUpdate = c(chrome.windows.update.bind(chrome.windows));
  a.executeScript = c(chrome.scripting.executeScript.bind(chrome.scripting));
  a.sendMessageToTab = c(chrome.tabs.sendMessage.bind(chrome.tabs));
  a.sendMessage = c(chrome.runtime.sendMessage.bind(chrome.runtime));
  a.contextMenusCreate = c(
    chrome.contextMenus.create.bind(chrome.contextMenus),
  );
  a.contextMenusRemoveAll = c(
    chrome.contextMenus.removeAll.bind(chrome.contextMenus),
  );
  a.contextMenusUpdate = c(
    chrome.contextMenus.update.bind(chrome.contextMenus),
  );
  a.setActionIcon = c(chrome.action.setIcon.bind(chrome.action));
  a.storageLocalGet = c(chrome.storage.local.get.bind(chrome.storage.local));
  a.storageLocalSet = c(chrome.storage.local.set.bind(chrome.storage.local));
  a.storageLocalRemove = c(
    chrome.storage.local.remove.bind(chrome.storage.local),
  );
  a.getPlatformInfo = c(chrome.runtime.getPlatformInfo.bind(chrome.runtime));
  a.commandsGetAll = c(chrome.commands.getAll.bind(chrome.commands));
  a.getContexts = c(chrome.runtime.getContexts.bind(chrome.runtime));
  a.onPageChangedRemoveRules = chrome.declarativeContent
    ? c(
        chrome.declarativeContent.onPageChanged.removeRules.bind(
          chrome.declarativeContent.onPageChanged,
        ),
      )
    : n(
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
    ? c(
        chrome.declarativeContent.onPageChanged.addRules.bind(
          chrome.declarativeContent.onPageChanged,
        ),
      )
    : n(
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
  a.actionDisable = c(chrome.action.disable.bind(chrome.action));
  a.captureTab = c(chrome.tabs.captureVisibleTab.bind(chrome.tabs));
  a.windowsCreate = c(chrome.windows.create.bind(chrome.windows));
  a.windowsGetCurrent = c(chrome.windows.getCurrent.bind(chrome.windows));
  a.updateSessionRules = chrome.declarativeNetRequest
    ? c(
        chrome.declarativeNetRequest.updateSessionRules.bind(
          chrome.declarativeNetRequest,
        ),
      )
    : n(
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
    const e = n(
      t().mark(function e(r) {
        return t().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  e.next = 3;
                  return new Promise((resolve) => {
                    chrome.runtime.sendMessage(r, function (t) {
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
    const e = n(
      t().mark(function e(r, n) {
        return t().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  e.next = 3;
                  return new Promise((resolve) => {
                    chrome.tabs.sendMessage(r, n, function (t) {
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
    return function (t, r) {
      return e.apply(this, arguments);
    };
  })();
  const s = a;
  const i = {
    MIN_MCP_SERVER_VERSION: "0.5.0",
  };
  function o(e) {
    o =
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
    return o(e);
  }
  function u() {
    u = function () {
      return t;
    };
    let e;
    var t = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const a =
      Object.defineProperty ||
      ((e, t, r) => {
        e[t] = r.value;
      });
    const c = typeof Symbol === "function" ? Symbol : {};
    const s = c.iterator || "@@iterator";
    const i = c.asyncIterator || "@@asyncIterator";
    const l = c.toStringTag || "@@toStringTag";
    function p(e, t, r) {
      Object.defineProperty(e, t, {
        value: r,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      p({}, "");
    } catch (e) {
      p = function (e, t, r) {
        return (e[t] = r);
      };
    }
    function f(e, t, r, n) {
      const c = t && t.prototype instanceof y ? t : y;
      const s = Object.create(c.prototype);
      const i = new M(n || []);
      a(s, "_invoke", {
        value: P(e, r, i),
      });
      return s;
    }
    function d(e, t, r) {
      try {
        return {
          type: "normal",
          arg: e.call(t, r),
        };
      } catch (error) {
        return {
          type: "throw",
          arg: error,
        };
      }
    }
    t.wrap = f;
    var h = "suspendedStart";
    var v = "suspendedYield";
    var m = "executing";
    var g = "completed";
    var b = {};
    function y() {}
    function x() {}
    function w() {}
    let _ = {};
    p(_, s, function () {
      return this;
    });
    const I =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(R([])));
    if (I && I !== Object.prototype && hasOwnProperty.call(I, s)) {
      _ = I;
    }
    const L = (w.prototype = y.prototype = Object.create(_));
    function E(e) {
      ["next", "throw", "return"].forEach((t) => {
        p(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function T(e, t) {
      function r(a, c, s, i) {
        const u = d(e[a], e, c);
        if (u.type !== "throw") {
          const l = u.arg;
          const p = l.value;
          if (p && o(p) == "object" && hasOwnProperty.call(p, "__await")) {
            return t.resolve(p.__await).then(
              (e) => {
                r("next", e, s, i);
              },
              (e) => {
                r("throw", e, s, i);
              },
            );
          }
          return t.resolve(p).then(
            (e) => {
              l.value = e;
              s(l);
            },
            (e) => r("throw", e, s, i),
          );
        }
        i(u.arg);
      }
      let c;
      a(this, "_invoke", {
        value: function (e, n) {
          function a() {
            return new t(function (t, a) {
              r(e, n, t, a);
            });
          }
          return (c = c ? c.then(a, a) : a());
        },
      });
    }
    function P(t, r, n) {
      let a = h;
      return function (c, s) {
        if (a === m) {
          throw Error("Generator is already running");
        }
        if (a === g) {
          if (c === "throw") {
            throw s;
          }
          return {
            value: e,
            done: true,
          };
        }
        n.method = c;
        for (n.arg = s; ;) {
          const i = n.delegate;
          if (i) {
            const o = S(i, n);
            if (o) {
              if (o === b) {
                continue;
              }
              return o;
            }
          }
          if (n.method === "next") {
            n.sent = n._sent = n.arg;
          } else if (n.method === "throw") {
            if (a === h) {
              a = g;
              throw n.arg;
            }
            n.dispatchException(n.arg);
          } else {
            if (n.method === "return") {
              n.abrupt("return", n.arg);
            }
          }
          a = m;
          const u = d(t, r, n);
          if (u.type === "normal") {
            a = n.done ? g : v;
            if (u.arg === b) {
              continue;
            }
            return {
              value: u.arg,
              done: n.done,
            };
          }
          if (u.type === "throw") {
            a = g;
            n.method = "throw";
            n.arg = u.arg;
          }
        }
      };
    }
    function S(t, r) {
      const r_method = r.method;
      const a = t.iterator[r_method];
      if (a === e) {
        r.delegate = null;
        if (
          !(
            r_method === "throw" &&
            t.iterator.return &&
            ((r.method = "return"), (r.arg = e), S(t, r), r.method === "throw")
          )
        ) {
          if (r_method !== "return") {
            r.method = "throw";
            r.arg = new TypeError(
              `The iterator does not provide a '${r_method}' method`,
            );
          }
        }
        return b;
      }
      const c = d(a, t.iterator, r.arg);
      if (c.type === "throw") {
        r.method = "throw";
        r.arg = c.arg;
        r.delegate = null;
        return b;
      }
      const c_arg = c.arg;
      if (c_arg) {
        if (c_arg.done) {
          return (
            (r[t.resultName] = c_arg.value),
            (r.next = t.nextLoc),
            r.method !== "return" && ((r.method = "next"), (r.arg = e)),
            (r.delegate = null),
            b
          );
        }
        return c_arg;
      }
      return (
        (r.method = "throw"),
        (r.arg = new TypeError("iterator result is not an object")),
        (r.delegate = null),
        b
      );
    }
    function O(e) {
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
      e.forEach(O, this);
      this.reset(true);
    }
    function R(t) {
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
          const c = function r() {
            while (++a < t.length) {
              if (hasOwnProperty.call(t, a)) {
                r.value = t[a];
                r.done = false;
                return r;
              }
            }
            r.value = e;
            r.done = true;
            return r;
          };
          return (c.next = c);
        }
      }
      throw new TypeError(`${o(t)} is not iterable`);
    }
    x.prototype = w;
    a(L, "constructor", {
      value: w,
      configurable: true,
    });
    a(w, "constructor", {
      value: x,
      configurable: true,
    });
    x.displayName = p(w, l, "GeneratorFunction");
    t.isGeneratorFunction = function (e) {
      const t = typeof e === "function" && e.constructor;
      return (
        !!t && (t === x || (t.displayName || t.name) === "GeneratorFunction")
      );
    };
    t.mark = function (e) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(e, w);
      } else {
        e.__proto__ = w;
        p(e, l, "GeneratorFunction");
      }
      e.prototype = Object.create(L);
      return e;
    };
    t.awrap = function (e) {
      return {
        __await: e,
      };
    };
    E(T.prototype);
    p(T.prototype, i, function () {
      return this;
    });
    t.AsyncIterator = T;
    t.async = function (e, r, n, a, c = Promise) {
      const s = new T(f(e, r, n, a), c);
      if (t.isGeneratorFunction(r)) {
        return s;
      }
      return s.next().then((e) => {
        if (e.done) {
          return e.value;
        }
        return s.next();
      });
    };
    E(L);
    p(L, l, "Generator");
    p(L, s, function () {
      return this;
    });
    p(L, "toString", function () {
      return "[object Generator]";
    });
    t.keys = function (e) {
      const t = Object(e);
      const r = [];
      for (const n in t) {
        r.push(n);
      }
      r.reverse();
      return function e() {
        while (r.length) {
          const n = r.pop();
          if (n in t) {
            e.value = n;
            e.done = false;
            return e;
          }
        }
        e.done = true;
        return e;
      };
    };
    t.values = R;
    M.prototype = {
      constructor: M,
      reset: function (t) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = e;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = e;
        this.tryEntries.forEach(A);
        if (!t) {
          for (const r in this) {
            if (
              r.charAt(0) === "t" &&
              hasOwnProperty.call(this, r) &&
              !isNaN(+r.slice(1))
            ) {
              this[r] = e;
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
        const r = this;
        function a(n, a) {
          i.type = "throw";
          i.arg = t;
          r.next = n;
          if (a) {
            r.method = "next";
            r.arg = e;
          }
          return !!a;
        }
        for (let c = this.tryEntries.length - 1; c >= 0; --c) {
          const s = this.tryEntries[c];
          var i = s.completion;
          if (s.tryLoc === "root") {
            return a("end");
          }
          if (s.tryLoc <= this.prev) {
            const o = hasOwnProperty.call(s, "catchLoc");
            const u = hasOwnProperty.call(s, "finallyLoc");
            if (o && u) {
              if (this.prev < s.catchLoc) {
                return a(s.catchLoc, true);
              }
              if (this.prev < s.finallyLoc) {
                return a(s.finallyLoc);
              }
            } else if (o) {
              if (this.prev < s.catchLoc) {
                return a(s.catchLoc, true);
              }
            } else {
              if (!u) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < s.finallyLoc) {
                return a(s.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let r = this.tryEntries.length - 1; r >= 0; --r) {
          const a = this.tryEntries[r];
          if (
            a.tryLoc <= this.prev &&
            hasOwnProperty.call(a, "finallyLoc") &&
            this.prev < a.finallyLoc
          ) {
            var c = a;
            break;
          }
        }
        if (
          c &&
          (e === "break" || e === "continue") &&
          c.tryLoc <= t &&
          t <= c.finallyLoc
        ) {
          c = null;
        }
        const s = c ? c.completion : {};
        s.type = e;
        s.arg = t;
        if (c) {
          return ((this.method = "next"), (this.next = c.finallyLoc), b);
        }
        return this.complete(s);
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
        return b;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const r = this.tryEntries[t];
          if (r.finallyLoc === e) {
            this.complete(r.completion, r.afterLoc);
            A(r);
            return b;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const r = this.tryEntries[t];
          if (r.tryLoc === e) {
            const n = r.completion;
            if (n.type === "throw") {
              var a = n.arg;
              A(r);
            }
            return a;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (t, r, n) {
        this.delegate = {
          iterator: R(t),
          resultName: r,
          nextLoc: n,
        };
        if (this.method === "next") {
          this.arg = e;
        }
        return b;
      },
    };
    return t;
  }
  function l(e, t, r) {
    if (
      (t = ((e) => {
        const computeT = (e) => {
          const t = "string";
          if (o(e) != "object" || !e) {
            return e;
          }
          const r = e[Symbol.toPrimitive];
          if (r !== undefined) {
            const n = r.call(e, t || "default");
            if (o(n) != "object") {
              return n;
            }
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return (t === "string" ? String : Number)(e);
        };
        const t = computeT(e);
        if (o(t) == "symbol") {
          return t;
        }
        return `${t}`;
      })(t)) in e
    ) {
      Object.defineProperty(e, t, {
        value: r,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      e[t] = r;
    }
    return e;
  }
  function p(e, t, r, n, a, c, s) {
    try {
      var i = e[c](s);
      var o = i.value;
    } catch (error) {
      return void r(error);
    }
    if (i.done) {
      t(o);
    } else {
      Promise.resolve(o).then(n, a);
    }
  }
  function f(e) {
    return function () {
      const t = this;
      const r = arguments;
      return new Promise((resolve, reject) => {
        const c = e.apply(t, r);
        function s(e) {
          p(c, resolve, reject, s, i, "next", e);
        }
        function i(e) {
          p(c, resolve, reject, s, i, "throw", e);
        }
        s(undefined);
      });
    };
  }
  var h = new Set(["installedAt"]);
  var v = Symbol("removed");
  var m = new Map();
  function g(e, newValue) {
    if (e === v) {
      return newValue === undefined;
    }
    return newValue !== undefined && newValue === e;
  }
  function b(e, t) {
    return y.apply(this, arguments);
  }
  function y() {
    return (y = f(
      u().mark(function e(t, r) {
        return u().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                if (r !== undefined) {
                  e.next = 2;
                  break;
                }
                return e.abrupt("return", x(t));
              case 2:
                m.set(t, r);
                e.next = 5;
                return s.storageLocalSet(l({}, t, r));
              case 5:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function x(e) {
    return w.apply(this, arguments);
  }
  function w() {
    return (w = f(
      u().mark(function e(t) {
        return u().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                m.set(t, v);
                e.next = 3;
                return s.storageLocalRemove(t);
              case 3:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function _() {
    return (_ = f(
      u().mark(function e(t, r) {
        let n;
        let a;
        let c;
        let s;
        let i;
        return u().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (r === "local") {
                    e.next = 2;
                    break;
                  }
                  return e.abrupt("return");
                case 2:
                  n = 0;
                  a = Object.keys(t);
                case 3:
                  if (!(n < a.length)) {
                    e.next = 27;
                    break;
                  }
                  c = a[n];
                  if (h.has(c)) {
                    e.next = 7;
                    break;
                  }
                  return e.abrupt("continue", 24);
                case 7:
                  s = t[c];
                  if (!m.has(c)) {
                    m.set(c, s.oldValue === undefined ? v : s.oldValue);
                  }
                  if (!g((i = m.get(c)), s.newValue)) {
                    e.next = 12;
                    break;
                  }
                  return e.abrupt("continue", 24);
                case 12:
                  e.prev = 12;
                  if (i !== v) {
                    e.next = 18;
                    break;
                  }
                  e.next = 16;
                  return x(c);
                case 16:
                  e.next = 20;
                  break;
                case 18:
                  e.next = 20;
                  return b(c, i);
                case 20:
                  e.next = 24;
                  break;
                case 22:
                  e.prev = 22;
                  e.t0 = e.catch(12);
                case 24:
                  n++;
                  e.next = 3;
                  break;
                case 27:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[12, 22]],
        );
      }),
    )).apply(this, arguments);
  }
  function k(e) {
    k =
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
    return k(e);
  }
  function I(e, t) {
    const r = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      let n = Object.getOwnPropertySymbols(e);
      if (t) {
        n = n.filter((t) => Object.getOwnPropertyDescriptor(e, t).enumerable);
      }
      r.push(...n);
    }
    return r;
  }
  function L(e) {
    for (let t = 1; t < arguments.length; t++) {
      var r = arguments[t] ?? {};
      if (t % 2) {
        I(Object(r), true).forEach((t) => {
          E(e, t, r[t]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(e, Object.getOwnPropertyDescriptors(r));
      } else {
        I(Object(r)).forEach((t) => {
          Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
        });
      }
    }
    return e;
  }
  function E(e, t, r) {
    if (
      (t = ((e) => {
        const computeT = (e) => {
          const t = "string";
          if (k(e) != "object" || !e) {
            return e;
          }
          const r = e[Symbol.toPrimitive];
          if (r !== undefined) {
            const n = r.call(e, t || "default");
            if (k(n) != "object") {
              return n;
            }
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return (t === "string" ? String : Number)(e);
        };
        const t = computeT(e);
        if (k(t) == "symbol") {
          return t;
        }
        return `${t}`;
      })(t)) in e
    ) {
      Object.defineProperty(e, t, {
        value: r,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      e[t] = r;
    }
    return e;
  }
  function T(e, t) {
    let r =
      (typeof Symbol !== "undefined" && e[Symbol.iterator]) || e["@@iterator"];
    if (!r) {
      if (
        Array.isArray(e) ||
        (r = O(e)) ||
        (t && e && typeof e.length === "number")
      ) {
        if (r) {
          e = r;
        }
        let n = 0;
        const a = function () {};
        return {
          s: a,
          n: function () {
            if (n >= e.length) {
              return {
                done: true,
              };
            }
            return {
              done: false,
              value: e[n++],
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
    let c;
    let s = true;
    let i = false;
    return {
      s: function () {
        r = r.call(e);
      },
      n: function () {
        const e = r.next();
        s = e.done;
        return e;
      },
      e: function (e) {
        i = true;
        c = e;
      },
      f: function () {
        try {
          if (!(s || r.return == null)) {
            r.return();
          }
        } finally {
          if (i) {
            throw c;
          }
        }
      },
    };
  }
  function P() {
    P = function () {
      return t;
    };
    let e;
    var t = {};
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const a =
      Object.defineProperty ||
      ((e, t, r) => {
        e[t] = r.value;
      });
    const c = typeof Symbol === "function" ? Symbol : {};
    const s = c.iterator || "@@iterator";
    const i = c.asyncIterator || "@@asyncIterator";
    const o = c.toStringTag || "@@toStringTag";
    function u(e, t, r) {
      Object.defineProperty(e, t, {
        value: r,
        enumerable: true,
        configurable: true,
        writable: true,
      });
      return e[t];
    }
    try {
      u({}, "");
    } catch (e) {
      u = function (e, t, r) {
        return (e[t] = r);
      };
    }
    function l(e, t, r, n) {
      const c = t && t.prototype instanceof g ? t : g;
      const s = Object.create(c.prototype);
      const i = new M(n || []);
      a(s, "_invoke", {
        value: T(e, r, i),
      });
      return s;
    }
    function p(e, t, r) {
      try {
        return {
          type: "normal",
          arg: e.call(t, r),
        };
      } catch (error) {
        return {
          type: "throw",
          arg: error,
        };
      }
    }
    t.wrap = l;
    var f = "suspendedStart";
    var d = "suspendedYield";
    var h = "executing";
    var v = "completed";
    var m = {};
    function g() {}
    function b() {}
    function y() {}
    let x = {};
    u(x, s, function () {
      return this;
    });
    const _ =
      Object.getPrototypeOf &&
      Object.getPrototypeOf(Object.getPrototypeOf(R([])));
    if (_ && _ !== Object.prototype && hasOwnProperty.call(_, s)) {
      x = _;
    }
    const I = (y.prototype = g.prototype = Object.create(x));
    function L(e) {
      ["next", "throw", "return"].forEach((t) => {
        u(e, t, function (e) {
          return this._invoke(t, e);
        });
      });
    }
    function E(e, t) {
      function r(a, c, s, i) {
        const o = p(e[a], e, c);
        if (o.type !== "throw") {
          const u = o.arg;
          const l = u.value;
          if (l && k(l) == "object" && hasOwnProperty.call(l, "__await")) {
            return t.resolve(l.__await).then(
              (e) => {
                r("next", e, s, i);
              },
              (e) => {
                r("throw", e, s, i);
              },
            );
          }
          return t.resolve(l).then(
            (e) => {
              u.value = e;
              s(u);
            },
            (e) => r("throw", e, s, i),
          );
        }
        i(o.arg);
      }
      let c;
      a(this, "_invoke", {
        value: function (e, n) {
          function a() {
            return new t(function (t, a) {
              r(e, n, t, a);
            });
          }
          return (c = c ? c.then(a, a) : a());
        },
      });
    }
    function T(t, r, n) {
      let a = f;
      return function (c, s) {
        if (a === h) {
          throw Error("Generator is already running");
        }
        if (a === v) {
          if (c === "throw") {
            throw s;
          }
          return {
            value: e,
            done: true,
          };
        }
        n.method = c;
        for (n.arg = s; ;) {
          const i = n.delegate;
          if (i) {
            const o = S(i, n);
            if (o) {
              if (o === m) {
                continue;
              }
              return o;
            }
          }
          if (n.method === "next") {
            n.sent = n._sent = n.arg;
          } else if (n.method === "throw") {
            if (a === f) {
              a = v;
              throw n.arg;
            }
            n.dispatchException(n.arg);
          } else {
            if (n.method === "return") {
              n.abrupt("return", n.arg);
            }
          }
          a = h;
          const u = p(t, r, n);
          if (u.type === "normal") {
            a = n.done ? v : d;
            if (u.arg === m) {
              continue;
            }
            return {
              value: u.arg,
              done: n.done,
            };
          }
          if (u.type === "throw") {
            a = v;
            n.method = "throw";
            n.arg = u.arg;
          }
        }
      };
    }
    function S(t, r) {
      const r_method = r.method;
      const a = t.iterator[r_method];
      if (a === e) {
        r.delegate = null;
        if (
          !(
            r_method === "throw" &&
            t.iterator.return &&
            ((r.method = "return"), (r.arg = e), S(t, r), r.method === "throw")
          )
        ) {
          if (r_method !== "return") {
            r.method = "throw";
            r.arg = new TypeError(
              `The iterator does not provide a '${r_method}' method`,
            );
          }
        }
        return m;
      }
      const c = p(a, t.iterator, r.arg);
      if (c.type === "throw") {
        r.method = "throw";
        r.arg = c.arg;
        r.delegate = null;
        return m;
      }
      const c_arg = c.arg;
      if (c_arg) {
        if (c_arg.done) {
          return (
            (r[t.resultName] = c_arg.value),
            (r.next = t.nextLoc),
            r.method !== "return" && ((r.method = "next"), (r.arg = e)),
            (r.delegate = null),
            m
          );
        }
        return c_arg;
      }
      return (
        (r.method = "throw"),
        (r.arg = new TypeError("iterator result is not an object")),
        (r.delegate = null),
        m
      );
    }
    function O(e) {
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
      e.forEach(O, this);
      this.reset(true);
    }
    function R(t) {
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
          const c = function r() {
            while (++a < t.length) {
              if (hasOwnProperty.call(t, a)) {
                r.value = t[a];
                r.done = false;
                return r;
              }
            }
            r.value = e;
            r.done = true;
            return r;
          };
          return (c.next = c);
        }
      }
      throw new TypeError(`${k(t)} is not iterable`);
    }
    b.prototype = y;
    a(I, "constructor", {
      value: y,
      configurable: true,
    });
    a(y, "constructor", {
      value: b,
      configurable: true,
    });
    b.displayName = u(y, o, "GeneratorFunction");
    t.isGeneratorFunction = function (e) {
      const t = typeof e === "function" && e.constructor;
      return (
        !!t && (t === b || (t.displayName || t.name) === "GeneratorFunction")
      );
    };
    t.mark = function (e) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(e, y);
      } else {
        e.__proto__ = y;
        u(e, o, "GeneratorFunction");
      }
      e.prototype = Object.create(I);
      return e;
    };
    t.awrap = function (e) {
      return {
        __await: e,
      };
    };
    L(E.prototype);
    u(E.prototype, i, function () {
      return this;
    });
    t.AsyncIterator = E;
    t.async = function (e, r, n, a, c = Promise) {
      const s = new E(l(e, r, n, a), c);
      if (t.isGeneratorFunction(r)) {
        return s;
      }
      return s.next().then((e) => {
        if (e.done) {
          return e.value;
        }
        return s.next();
      });
    };
    L(I);
    u(I, o, "Generator");
    u(I, s, function () {
      return this;
    });
    u(I, "toString", function () {
      return "[object Generator]";
    });
    t.keys = function (e) {
      const t = Object(e);
      const r = [];
      for (const n in t) {
        r.push(n);
      }
      r.reverse();
      return function e() {
        while (r.length) {
          const n = r.pop();
          if (n in t) {
            e.value = n;
            e.done = false;
            return e;
          }
        }
        e.done = true;
        return e;
      };
    };
    t.values = R;
    M.prototype = {
      constructor: M,
      reset: function (t) {
        this.prev = 0;
        this.next = 0;
        this.sent = this._sent = e;
        this.done = false;
        this.delegate = null;
        this.method = "next";
        this.arg = e;
        this.tryEntries.forEach(A);
        if (!t) {
          for (const r in this) {
            if (
              r.charAt(0) === "t" &&
              hasOwnProperty.call(this, r) &&
              !isNaN(+r.slice(1))
            ) {
              this[r] = e;
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
        const r = this;
        function a(n, a) {
          i.type = "throw";
          i.arg = t;
          r.next = n;
          if (a) {
            r.method = "next";
            r.arg = e;
          }
          return !!a;
        }
        for (let c = this.tryEntries.length - 1; c >= 0; --c) {
          const s = this.tryEntries[c];
          var i = s.completion;
          if (s.tryLoc === "root") {
            return a("end");
          }
          if (s.tryLoc <= this.prev) {
            const o = hasOwnProperty.call(s, "catchLoc");
            const u = hasOwnProperty.call(s, "finallyLoc");
            if (o && u) {
              if (this.prev < s.catchLoc) {
                return a(s.catchLoc, true);
              }
              if (this.prev < s.finallyLoc) {
                return a(s.finallyLoc);
              }
            } else if (o) {
              if (this.prev < s.catchLoc) {
                return a(s.catchLoc, true);
              }
            } else {
              if (!u) {
                throw Error("try statement without catch or finally");
              }
              if (this.prev < s.finallyLoc) {
                return a(s.finallyLoc);
              }
            }
          }
        }
      },
      abrupt: function (e, t) {
        for (let r = this.tryEntries.length - 1; r >= 0; --r) {
          const a = this.tryEntries[r];
          if (
            a.tryLoc <= this.prev &&
            hasOwnProperty.call(a, "finallyLoc") &&
            this.prev < a.finallyLoc
          ) {
            var c = a;
            break;
          }
        }
        if (
          c &&
          (e === "break" || e === "continue") &&
          c.tryLoc <= t &&
          t <= c.finallyLoc
        ) {
          c = null;
        }
        const s = c ? c.completion : {};
        s.type = e;
        s.arg = t;
        if (c) {
          return ((this.method = "next"), (this.next = c.finallyLoc), m);
        }
        return this.complete(s);
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
        return m;
      },
      finish: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const r = this.tryEntries[t];
          if (r.finallyLoc === e) {
            this.complete(r.completion, r.afterLoc);
            A(r);
            return m;
          }
        }
      },
      catch: function (e) {
        for (let t = this.tryEntries.length - 1; t >= 0; --t) {
          const r = this.tryEntries[t];
          if (r.tryLoc === e) {
            const n = r.completion;
            if (n.type === "throw") {
              var a = n.arg;
              A(r);
            }
            return a;
          }
        }
        throw Error("illegal catch attempt");
      },
      delegateYield: function (t, r, n) {
        this.delegate = {
          iterator: R(t),
          resultName: r,
          nextLoc: n,
        };
        if (this.method === "next") {
          this.arg = e;
        }
        return m;
      },
    };
    return t;
  }
  function S(e, t) {
    return (
      ((e) => {
        if (Array.isArray(e)) {
          return e;
        }
      })(e) ||
      ((e, t) => {
        let r =
          e == null
            ? null
            : (typeof Symbol !== "undefined" && e[Symbol.iterator]) ||
              e["@@iterator"];
        if (r != null) {
          let n;
          let a;
          let c;
          let s;
          const i = [];
          let o = true;
          let u = false;
          try {
            c = (r = r.call(e)).next;
            if (t === 0) {
              if (Object(r) !== r) {
                return;
              }
              o = false;
            } else {
              for (
                ;
                !(o = (n = c.call(r)).done) &&
                (i.push(n.value), i.length !== t);
                o = true
              );
            }
          } catch (error) {
            u = true;
            a = error;
          } finally {
            try {
              if (
                !o &&
                r.return != null &&
                ((s = r.return()), Object(s) !== s)
              ) {
                return;
              }
            } finally {
              if (u) {
                throw a;
              }
            }
          }
          return i;
        }
      })(e, t) ||
      O(e, t) ||
      (() => {
        throw new TypeError(
          "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function O(e, t) {
    if (e) {
      if (typeof e === "string") {
        return A(e, t);
      }
      let r = Object.prototype.toString.call(e).slice(8, -1);
      if (r === "Object" && e.constructor) {
        r = e.constructor.name;
      }
      if (r === "Map" || r === "Set") {
        return Array.from(e);
      }
      if (
        r === "Arguments" ||
        /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
      ) {
        return A(e, t);
      }
      return undefined;
    }
  }
  function A(e, t) {
    if (t == null || t > e.length) {
      t = e.length;
    }
    for (var r = 0, n = Array(t); r < t; r++) {
      n[r] = e[r];
    }
    return n;
  }
  function M(e, t, r, n, a, c, s) {
    try {
      var i = e[c](s);
      var o = i.value;
    } catch (error) {
      return void r(error);
    }
    if (i.done) {
      t(o);
    } else {
      Promise.resolve(o).then(n, a);
    }
  }
  function R(e) {
    return function () {
      const t = this;
      const r = arguments;
      return new Promise((resolve, reject) => {
        const c = e.apply(t, r);
        function s(e) {
          M(c, resolve, reject, s, i, "next", e);
        }
        function i(e) {
          M(c, resolve, reject, s, i, "throw", e);
        }
        s(undefined);
      });
    };
  }
  var N = new Map();
  function j(e) {
    const t = N.get(e);
    return (
      t !== undefined && (!(Date.now() - t > 15000) || (N.delete(e), false))
    );
  }
  var C = new Set();
  var D = new Map();
  var U = Promise.resolve();
  function G() {
    return K.apply(this, arguments);
  }
  function K() {
    return (K = R(
      P().mark(function e() {
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                return e.abrupt("return", true);
              case 2:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function F() {
    return (F = R(
      P().mark(function e(t, r) {
        let n;
        let a;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.next = 2;
                  return G();
                case 2:
                  if (e.sent) {
                    e.next = 4;
                    break;
                  }
                  return e.abrupt("return", {
                    error: "Bo doi MCP requires the Studio tier.",
                  });
                case 4:
                  e.t0 = t;
                  e.next =
                    e.t0 === "list_tabs"
                      ? 7
                      : e.t0 === "focus_tab"
                        ? 10
                        : e.t0 === "get_page_info"
                          ? 13
                          : e.t0 === "get_selected_element"
                            ? 16
                            : e.t0 === "get_element_details"
                              ? 19
                              : e.t0 === "get_elements_details"
                                ? 22
                                : e.t0 === "get_element_outline"
                                  ? 25
                                  : e.t0 === "query_selector"
                                    ? 28
                                    : e.t0 === "get_element_matched_rules"
                                      ? 31
                                      : e.t0 === "get_breakpoints"
                                        ? 34
                                        : e.t0 === "get_seo_issues"
                                          ? 37
                                          : e.t0 === "get_meta_tags"
                                            ? 40
                                            : e.t0 === "get_page_weight"
                                              ? 43
                                              : e.t0 ===
                                                  "get_css_custom_properties"
                                                ? 46
                                                : e.t0 === "get_typography"
                                                  ? 49
                                                  : e.t0 ===
                                                      "calculate_specificity"
                                                    ? 52
                                                    : e.t0 === "get_colors"
                                                      ? 55
                                                      : e.t0 === "get_assets"
                                                        ? 58
                                                        : e.t0 === "get_layout"
                                                          ? 61
                                                          : e.t0 ===
                                                              "force_element_state"
                                                            ? 64
                                                            : e.t0 ===
                                                                "detect_technologies"
                                                              ? 67
                                                              : e.t0 ===
                                                                  "get_a11y_issues"
                                                                ? 70
                                                                : e.t0 ===
                                                                    "get_tailwind"
                                                                  ? 73
                                                                  : e.t0 ===
                                                                      "fetch_stylesheet"
                                                                    ? 76
                                                                    : e.t0 ===
                                                                        "enter_responsive_mode"
                                                                      ? 91
                                                                      : e.t0 ===
                                                                          "exit_responsive_mode"
                                                                        ? 94
                                                                        : e.t0 ===
                                                                            "set_viewport"
                                                                          ? 97
                                                                          : e.t0 ===
                                                                              "get_viewport"
                                                                            ? 100
                                                                            : e.t0 ===
                                                                                "set_viewports"
                                                                              ? 103
                                                                              : e.t0 ===
                                                                                  "add_viewport"
                                                                                ? 106
                                                                                : e.t0 ===
                                                                                    "remove_viewport"
                                                                                  ? 109
                                                                                  : e.t0 ===
                                                                                      "set_zoom"
                                                                                    ? 112
                                                                                    : e.t0 ===
                                                                                        "set_breakpoints_mode"
                                                                                      ? 115
                                                                                      : e.t0 ===
                                                                                          "get_my_edits"
                                                                                        ? 118
                                                                                        : e.t0 ===
                                                                                            "set_text_content"
                                                                                          ? 121
                                                                                          : e.t0 ===
                                                                                              "set_inner_html"
                                                                                            ? 124
                                                                                            : e.t0 ===
                                                                                                "insert_html"
                                                                                              ? 127
                                                                                              : e.t0 ===
                                                                                                  "select_element"
                                                                                                ? 130
                                                                                                : e.t0 ===
                                                                                                    "get_screenshot"
                                                                                                  ? 133
                                                                                                  : e.t0 ===
                                                                                                      "apply_styles"
                                                                                                    ? 136
                                                                                                    : e.t0 ===
                                                                                                        "add_rule"
                                                                                                      ? 143
                                                                                                      : e.t0 ===
                                                                                                          "set_rule_selector"
                                                                                                        ? 146
                                                                                                        : e.t0 ===
                                                                                                            "revert_css_change"
                                                                                                          ? 149
                                                                                                          : e.t0 ===
                                                                                                              "revert_all_edits"
                                                                                                            ? 152
                                                                                                            : e.t0 ===
                                                                                                                "set_element_classes"
                                                                                                              ? 155
                                                                                                              : e.t0 ===
                                                                                                                  "delete_element"
                                                                                                                ? 158
                                                                                                                : e.t0 ===
                                                                                                                    "duplicate_element"
                                                                                                                  ? 161
                                                                                                                  : 164;
                  break;
                case 7:
                  e.next = 9;
                  return $();
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
                  e.next = 12;
                  return H(r);
                case 13:
                  e.next = 15;
                  return q("script", "get_page_info", r);
                case 16:
                  e.next = 18;
                  return q("script", "get_selected_element", r);
                case 19:
                  e.next = 21;
                  return q("script", "get_element_details", r, {
                    elementId: r.elementId,
                    viewportId: r.viewportId,
                  });
                case 22:
                  e.next = 24;
                  return q("script", "get_elements_details", r, {
                    elementIds: r.elementIds,
                    viewportId: r.viewportId,
                  });
                case 25:
                  e.next = 27;
                  return q("script", "get_element_outline", r, {
                    elementId: r.elementId,
                    maxDepth: r.maxDepth,
                    maxChildren: r.maxChildren,
                    viewportId: r.viewportId,
                  });
                case 28:
                  e.next = 30;
                  return q("script", "query_selector", r, {
                    selector: r.selector,
                    limit: r.limit,
                    rootId: r.rootId,
                    viewportId: r.viewportId,
                  });
                case 31:
                  e.next = 33;
                  return q("script", "get_element_matched_rules", r, {
                    elementId: r.elementId,
                    viewportId: r.viewportId,
                  });
                case 34:
                  e.next = 36;
                  return q("script", "get_breakpoints", r);
                case 37:
                  e.next = 39;
                  return q("script", "get_seo_issues", r);
                case 40:
                  e.next = 42;
                  return q("script", "get_meta_tags", r);
                case 43:
                  e.next = 45;
                  return q("script", "get_page_weight", r);
                case 46:
                  e.next = 48;
                  return q("script", "get_css_custom_properties", r);
                case 49:
                  e.next = 51;
                  return q("script", "get_typography", r, {
                    elementId: r.elementId,
                  });
                case 52:
                  e.next = 54;
                  return q("script", "calculate_specificity", r, {
                    selector: r.selector,
                  });
                case 55:
                  e.next = 57;
                  return q("script", "get_colors", r, {
                    elementId: r.elementId,
                  });
                case 58:
                  e.next = 60;
                  return q("script", "get_assets", r, {
                    elementId: r.elementId,
                  });
                case 61:
                  e.next = 63;
                  return q("script", "get_layout", r, {
                    elementId: r.elementId,
                    viewportId: r.viewportId,
                  });
                case 64:
                  e.next = 66;
                  return q("script", "force_element_state", r, {
                    elementId: r.elementId,
                    state: r.state,
                  });
                case 67:
                  e.next = 69;
                  return q("script", "detect_technologies", r);
                case 70:
                  e.next = 72;
                  return q("script", "get_a11y_issues", r, {
                    limit: r.limit,
                  });
                case 73:
                  e.next = 75;
                  return q("script", "get_tailwind", r, {
                    elementId: r.elementId,
                  });
                case 76:
                  if (Ue(r.url)) {
                    e.next = 78;
                    break;
                  }
                  return e.abrupt("return", {
                    error:
                      "fetch_stylesheet rejected: URL must be http(s) and not a private/localhost host.",
                  });
                case 78:
                  e.prev = 78;
                  e.next = 81;
                  return Fe(r.url);
                case 81:
                  n = e.sent;
                  e.next = 84;
                  return n.text();
                case 84:
                  a = e.sent;
                  return e.abrupt("return", {
                    success: true,
                    status: n.status,
                    text: a,
                  });
                case 88:
                  e.prev = 88;
                  e.t1 = e.catch(78);
                  return e.abrupt("return", {
                    success: false,
                    error: String(e.t1 && e.t1.message ? e.t1.message : e.t1),
                  });
                case 91:
                  e.next = 93;
                  return q("script", "enter_responsive_mode", r);
                case 94:
                  e.next = 96;
                  return q("script", "exit_responsive_mode", r);
                case 97:
                  e.next = 99;
                  return q("script", "set_viewport", r, {
                    width: r.width,
                    height: r.height,
                    viewportId: r.viewportId,
                  });
                case 100:
                  e.next = 102;
                  return q("script", "get_viewport", r);
                case 103:
                  e.next = 105;
                  return q("script", "set_viewports", r, {
                    viewports: r.viewports,
                  });
                case 106:
                  e.next = 108;
                  return q("script", "add_viewport", r, {
                    width: r.width,
                    height: r.height,
                    name: r.name,
                  });
                case 109:
                  e.next = 111;
                  return q("script", "remove_viewport", r, {
                    viewportId: r.viewportId,
                  });
                case 112:
                  e.next = 114;
                  return q("script", "set_zoom", r, {
                    zoom: r.zoom,
                  });
                case 115:
                  e.next = 117;
                  return q("script", "set_breakpoints_mode", r, {
                    enabled: r.enabled,
                  });
                case 118:
                  e.next = 120;
                  return q("script", "get_my_edits", r);
                case 121:
                  e.next = 123;
                  return q("script", "set_text_content", r, {
                    elementId: r.elementId,
                    text: r.text,
                  });
                case 124:
                  e.next = 126;
                  return q("script", "set_inner_html", r, {
                    elementId: r.elementId,
                    html: r.html,
                  });
                case 127:
                  e.next = 129;
                  return q("script", "insert_html", r, {
                    elementId: r.elementId,
                    html: r.html,
                    position: r.position,
                  });
                case 130:
                  e.next = 132;
                  return q("script", "select_edited_element", r, {
                    elementId: r.elementId,
                  });
                case 133:
                  e.next = 135;
                  return q("script", "capture_for_ai", r);
                case 136:
                  if (!r.ruleRef) {
                    e.next = 140;
                    break;
                  }
                  e.next = 139;
                  return q("rule_editor", "merge_rule_styles", r, {
                    ref: r.ruleRef,
                    styles: r.styles || {},
                  });
                case 140:
                  e.next = 142;
                  return q("editor", "set_element_styles", r, {
                    elementId: r.elementId,
                    data: {
                      styles: r.styles || {},
                      state: r.state || "",
                      media: r.media || "",
                      pseudo: r.pseudo || "",
                    },
                  });
                case 143:
                  e.next = 145;
                  return q("rule_editor", "rule_add", r, {
                    selector: r.selector,
                    wrappers: r.wrappers || [],
                    styles: r.styles || null,
                    elementId: r.elementId || null,
                  });
                case 146:
                  e.next = 148;
                  return q("rule_editor", "rule_selector_edit", r, {
                    ref: r.ruleRef,
                    selector: r.selector,
                  });
                case 149:
                  e.next = 151;
                  return q("rule_editor", "revert_rule_change", r, {
                    changeId: r.changeId,
                  });
                case 152:
                  e.next = 154;
                  return q("rule_editor", "revert_all_edits", r);
                case 155:
                  e.next = 157;
                  return q("editor", "set_element_classes", r, {
                    elementId: r.elementId,
                    data: {
                      classes: r.classes || "",
                    },
                  });
                case 158:
                  e.next = 160;
                  return q("editor", "delete_element", r, {
                    elementId: r.elementId,
                  });
                case 161:
                  e.next = 163;
                  return q("editor", "duplicate_element", r, {
                    elementId: r.elementId,
                  });
                case 164:
                  return e.abrupt("return", {
                    error: `Unknown MCP type: ${t}`,
                  });
                case 165:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[78, 88]],
        );
      }),
    )).apply(this, arguments);
  }
  function q(e, t, r) {
    return V.apply(this, arguments);
  }
  function V() {
    V = R(
      P().mark(function e(t, r, n) {
        let a;
        let c;
        let i;
        let o;
        let u;
        const l = arguments;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  a = l.length > 3 && l[3] !== undefined ? l[3] : {};
                  if (typeof (c = n && n.tabId) === "number") {
                    e.next = 4;
                    break;
                  }
                  return e.abrupt("return", {
                    error: `${r} requires a numeric tabId.`,
                  });
                case 4:
                  if (r === "exit_responsive_mode") {
                    N.set(c, Date.now());
                  }
                  if (r === "exit_responsive_mode" || !j(c)) {
                    e.next = 11;
                    break;
                  }
                  e.next = 8;
                  return W(c, 10000);
                case 8:
                  if (!(e.sent > 5000)) {
                    e.next = 11;
                    break;
                  }
                  return e.abrupt("return", {
                    error: `The page was reloading after a responsive-mode change and is only just ready. Retry ${r} now.`,
                  });
                case 11:
                  i = B.has(r) ? 40000 : 12000;
                  o = null;
                  e.prev = 13;
                  e.next = 16;
                  return Promise.race([
                    s.sendMessageToTab(
                      c,
                      L(
                        {
                          target: t,
                          action: r,
                        },
                        a,
                      ),
                    ),
                    new Promise((resolve) => {
                      o = setTimeout(
                        () =>
                          resolve({
                            error: `${r} timed out inside the extension. The page may be busy or mid-reload; try again.`,
                          }),
                        i,
                      );
                    }),
                  ]);
                case 16:
                  u = e.sent;
                  return e.abrupt(
                    "return",
                    u || {
                      error: "Empty response from content script.",
                    },
                  );
                case 20:
                  e.prev = 20;
                  e.t0 = e.catch(13);
                  return e.abrupt("return", {
                    error:
                      "Bo doi is not active on this tab. Ask the user to click the Bo doi toolbar icon on that tab.",
                  });
                case 23:
                  e.prev = 23;
                  if (o !== null) {
                    clearTimeout(o);
                  }
                  return e.finish(23);
                case 26:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[13, 20, 23, 26]],
        );
      }),
    );
    return V.apply(this, arguments);
  }
  chrome.runtime.onInstalled.addListener(function (e) {
    return J.apply(this, arguments);
  });
  chrome.runtime.onStartup.addListener(function () {
    return ne.apply(this, arguments);
  });
  chrome.action.onClicked.addListener(we);
  chrome.runtime.onMessage.addListener(function (e, t, r) {
    if (e.target === "mcp") {
      (function (e, t) {
        return F.apply(this, arguments);
      })(e.type, e.payload)
        .then((e) => r(e))
        .catch((e) =>
          r({
            error: String(e),
          }),
        );
      return true;
    }
    if (e.target !== "background") {
      return false;
    }
    if (e.action === "request_mcp_connect") {
      R(
        P().mark(function e() {
          return P().wrap(
            function (e) {
              while (true) {
                switch ((e.prev = e.next)) {
                  case 0:
                    e.prev = 0;
                    e.next = 3;
                    return s.storageLocalSet({
                      mcpIntent: true,
                    });
                  case 3:
                    e.next = 5;
                    return We();
                  case 5:
                    r({
                      success: true,
                    });
                    return e.abrupt("return");
                  case 14:
                  case "end":
                    return e.stop();
                }
              }
            },
            e,
            null,
            [[0, 11]],
          );
        }),
      )();
      return true;
    }
    if (e.action === "mcp_status_changed") {
      R(
        P().mark(function t() {
          let r;
          let n;
          let c;
          let i;
          return P().wrap(
            function (t) {
              while (true) {
                switch ((t.prev = t.next)) {
                  case 0:
                    t.prev = 0;
                    t.next = 3;
                    return G();
                  case 3:
                    r = t.sent;
                    t.next = 6;
                    return s.storageLocalGet({
                      mcpIntent: false,
                    });
                  case 6:
                    n = t.sent;
                    ({ mcpIntent: c = false } = n);
                    t.next = 11;
                    return $();
                  case 11:
                    i = t.sent;
                    t.next = 14;
                    return Promise.all(
                      i.map((t) =>
                        s
                          .sendMessageToTab(t.tabId, {
                            target: "script",
                            action: "mcp_status_changed",
                            connected: !!e.connected,
                            versionMismatch: !!e.versionMismatch,
                            client: e.client || null,
                            eligible: r,
                            intent: c,
                          })
                          .catch(() => {}),
                      ),
                    );
                  case 14:
                    t.next = 18;
                    break;
                  case 16:
                    t.prev = 16;
                    t.t0 = t.catch(0);
                  case 18:
                  case "end":
                    return t.stop();
                }
              }
            },
            t,
            null,
            [[0, 16]],
          );
        }),
      )();
      return false;
    }
    if (e.action === "request_mcp_status") {
      R(
        P().mark(function e() {
          let t;
          let a;
          let c;
          return P().wrap(
            function (e) {
              while (true) {
                switch ((e.prev = e.next)) {
                  case 0:
                    e.prev = 0;
                    e.next = 3;
                    return s.storageLocalGet({
                      mcpIntent: false,
                    });
                  case 3:
                    t = e.sent;
                    ({ mcpIntent: a = false } = t);
                    e.next = 8;
                    return G();
                  case 8:
                    c = e.sent;
                    r({
                      intent: a,
                      eligible: c,
                      connected: false,
                    });
                    return e.abrupt("return");
                  case 16:
                    r(
                      L(
                        {
                          intent: a,
                          eligible: c,
                        },
                        {
                          connected: false,
                        },
                      ),
                    );
                    return e.abrupt("return");
                  case 22:
                    e.prev = 22;
                    e.t0 = e.catch(0);
                    r({
                      intent: false,
                      eligible: false,
                      connected: false,
                    });
                  case 25:
                  case "end":
                    return e.stop();
                }
              }
            },
            e,
            null,
            [[0, 22]],
          );
        }),
      )();
      return true;
    }
    if (e.action === "request_mcp_disconnect") {
      R(
        P().mark(function e() {
          return P().wrap(
            function (e) {
              while (true) {
                switch ((e.prev = e.next)) {
                  case 0:
                    e.prev = 0;
                    e.next = 3;
                    return s.storageLocalSet({
                      mcpIntent: false,
                    });
                  case 3:
                    r({
                      success: true,
                    });
                    return e.abrupt("return");
                  case 16:
                    e.prev = 16;
                    e.t0 = e.catch(0);
                    r({
                      success: false,
                      error: String(e.t0 && e.t0.message ? e.t0.message : e.t0),
                    });
                  case 19:
                  case "end":
                    return e.stop();
                }
              }
            },
            e,
            null,
            [[0, 16]],
          );
        }),
      )();
      return true;
    }
    switch (e.action) {
      case "open_external_tab":
        var n = e.url;
        if (typeof n !== "string" || !/^https?:/i.test(n)) {
          r({
            success: false,
            message: "Invalid URL.",
          });
          return false;
        }
        const a = {
          url: n,
          active: true,
        };
        if (t.tab && t.tab.id != null) {
          a.openerTabId = t.tab.id;
          if (typeof t.tab.index === "number") {
            a.index = t.tab.index + 1;
          }
        }
        s.tabsCreate(a)
          .then(() =>
            r({
              success: true,
            }),
          )
          .catch(() => {
            s.tabsCreate({
              url: n,
              active: true,
            })
              .then(() =>
                r({
                  success: true,
                }),
              )
              .catch(() =>
                r({
                  success: false,
                }),
              );
          });
        return true;
      case "exit_responsive_mode":
        let c;
        let o;
        let u;
        Ne(t.tab.id);
        N.set(t.tab.id, Date.now());
        if (Array.isArray(e.ruleEdits) && e.ruleEdits.length) {
          D.set(t.tab.id, e.ruleEdits);
        }
        if (e.enterEditMode) {
          C.add(t.tab.id);
          if (
            !(
              (c = chrome.sidePanel) === null ||
              c === undefined ||
              (o = c.open) === null ||
              o === undefined ||
              (o = o.call(c, {
                tabId: t.tab.id,
              })) === null ||
              o === undefined ||
              (u = o.catch) === null ||
              u === undefined
            )
          ) {
            u.call(o, function () {});
          }
        }
        r({
          success: true,
        });
        break;
      case "fetch_stylesheet":
        if (Ue(e.url)) {
          return (
            Fe(e.url, {
              signal: AbortSignal.timeout(10000),
            })
              .then((e) => e.text())
              .then((text) =>
                r({
                  success: true,
                  text,
                }),
              )
              .catch(() =>
                r({
                  success: false,
                }),
              ),
            true
          );
        }
        return (
          r({
            success: false,
          }),
          true
        );
      case "open_side_panel":
        const l = le.get(t.tab.id);
        if (l !== undefined) {
          return (
            s
              .windowsUpdate(l, {
                focused: true,
              })
              .then(() =>
                r({
                  success: true,
                }),
              )
              .catch(() => {
                ge(t.tab.id);
                r({
                  success: false,
                });
              }),
            true
          );
        }
        if (chrome.sidePanel) {
          return (
            chrome.sidePanel
              .open({
                tabId: t.tab.id,
              })
              .then(() =>
                r({
                  success: true,
                }),
              )
              .catch((e) => {
                r({
                  success: false,
                  error: e.message,
                });
              }),
            true
          );
        }
        return (
          r({
            success: false,
            error: "Side panel API not available in this browser",
          }),
          false
        );
      case "close_side_panel":
        const p = le.get(t.tab.id);
        if (p !== undefined) {
          return (
            s
              .windowsUpdate(p, {
                focused: true,
              })
              .then(() =>
                r({
                  success: true,
                }),
              )
              .catch(() =>
                r({
                  success: false,
                }),
              ),
            true
          );
        }
        return (
          chrome.runtime
            .sendMessage({
              target: "side_panel",
              action: "close",
              tabId: t.tab.id,
            })
            .then(() =>
              r({
                success: true,
              }),
            )
            .catch(() =>
              r({
                success: false,
              }),
            ),
          true
        );
      case "detach_panel":
        const f = Number(e.tabId);
        if (f) {
          return (
            (function (e) {
              return be.apply(this, arguments);
            })(f, {
              width: Number(e.width),
              height: Number(e.height),
            })
              .then(() =>
                r({
                  success: true,
                }),
              )
              .catch((e) =>
                r({
                  success: false,
                  error: String(e?.message || e),
                }),
              ),
            true
          );
        }
        return (
          r({
            success: false,
          }),
          false
        );
      case "dock_panel":
        var d = Number(e.tabId);
        if (d && chrome.sidePanel) {
          return (
            chrome.sidePanel.setOptions({
              tabId: d,
              path: me(d),
              enabled: true,
            }),
            Promise.resolve(
              chrome.sidePanel.open({
                tabId: d,
              }),
            )
              .then(() => ye(d))
              .then(() =>
                r({
                  success: true,
                }),
              )
              .catch((e) =>
                r({
                  success: false,
                  error: String(e?.message || e),
                }),
              ),
            true
          );
        }
        return (
          r({
            success: false,
          }),
          false
        );
      case "check_panel_api":
        try {
          if (chrome.sidePanel) {
            r({
              success: true,
            });
          } else {
            r({
              success: false,
            });
          }
        } catch (e) {
          r({
            success: false,
          });
        }
        break;
      case "request_clipboard_permission":
        chrome.permissions.request(
          {
            permissions: ["clipboardWrite"],
          },
          function (granted) {
            r({
              granted,
            });
          },
        );
        return true;
      case "enable_frame_header_rule":
        R(
          P().mark(function e() {
            let n;
            return P().wrap(
              function (e) {
                while (true) {
                  switch ((e.prev = e.next)) {
                    case 0:
                      n = t.tab && t.tab.id;
                      e.t0 = !Number.isInteger(n);
                      if (e.t0) {
                        e.next = 6;
                        break;
                      }
                      e.next = 5;
                      return new Promise((resolve) => {
                        try {
                          chrome.permissions.contains(
                            {
                              origins: ["<all_urls>"],
                            },
                            function (t) {
                              resolve(!!t && !chrome.runtime.lastError);
                            },
                          );
                        } catch (t) {
                          resolve(false);
                        }
                      });
                    case 5:
                      e.t0 = !e.sent;
                    case 6:
                      if (!e.t0) {
                        e.next = 9;
                        break;
                      }
                      r({
                        enabled: false,
                      });
                      return e.abrupt("return");
                    case 9:
                      e.prev = 9;
                      e.next = 12;
                      return Me(n);
                    case 12:
                      r({
                        enabled: true,
                      });
                      e.next = 19;
                      break;
                    case 15:
                      e.prev = 15;
                      e.t1 = e.catch(9);
                      r({
                        enabled: false,
                      });
                    case 19:
                    case "end":
                      return e.stop();
                  }
                }
              },
              e,
              null,
              [[9, 15]],
            );
          }),
        )();
        return true;
      case "request_frame_unblock":
        chrome.permissions.request(
          {
            origins: ["<all_urls>"],
          },
          (() => {
            const e = R(
              P().mark(function e(n) {
                let a;
                return P().wrap(
                  function (e) {
                    while (true) {
                      switch ((e.prev = e.next)) {
                        case 0:
                          if (!chrome.runtime.lastError && n) {
                            e.next = 3;
                            break;
                          }
                          r({
                            granted: false,
                            enabled: false,
                          });
                          return e.abrupt("return");
                        case 3:
                          a = t.tab && t.tab.id;
                          e.prev = 4;
                          if (!Number.isInteger(a)) {
                            e.next = 8;
                            break;
                          }
                          e.next = 8;
                          return Me(a);
                        case 8:
                          r({
                            granted: true,
                            enabled: true,
                          });
                          e.next = 14;
                          break;
                        case 11:
                          e.prev = 11;
                          e.t0 = e.catch(4);
                          r({
                            granted: true,
                            enabled: false,
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
            );
            return function (t) {
              return e.apply(this, arguments);
            };
          })(),
        );
        return true;
      case "get_tab_id":
        r(t.tab.id);
        break;
      case "has_host_permission":
        chrome.permissions.contains(
          {
            origins: ["<all_urls>"],
          },
          function (e) {
            r({
              granted: !!e,
            });
          },
        );
        return true;
      case "run_tech_detection":
        const h = t.tab.id;
        const v = t.frameId;
        if (!h) {
          r({
            success: false,
            error: "No tab ID",
          });
          return false;
        }
        const m = {
          tabId: h,
          frameIds: v ? [v] : undefined,
        };
        chrome.scripting
          .executeScript({
            target: m,
            files: ["scripts/detect-technologies.js"],
            world: "MAIN",
          })
          .then(() => {
            r({
              success: true,
            });
          })
          .catch((e) => {
            r({
              success: false,
              error: e.message,
            });
          });
        return true;
      case "go_to_tab":
        s.tabsUpdate(Number(e.tabId), {
          active: true,
        })
          .then(() =>
            r({
              success: true,
            }),
          )
          .catch(() =>
            r({
              success: false,
            }),
          );
        return true;
      case "capture_tab":
        if (De(t.tab.url)) {
          return (
            s
              .captureTab()
              .then((t) =>
                (function (e, t, r) {
                  return $e.apply(this, arguments);
                })(e.data, e.rect, t),
              )
              .then((t) =>
                r({
                  success: true,
                  dataUrl: t,
                }),
              )
              .catch((e) => {
                r({
                  success: false,
                  error: "CAPTURE_FAILED",
                  message: "Failed to capture screenshot",
                });
              }),
            true
          );
        }
        return void r({
          success: false,
          error: "INVALID_URL",
          message:
            "Screenshots are not available on extension pages or restricted URLs",
        });
      case "capture_tab_for_ai":
        if (De(t.tab.url)) {
          return (
            (e.dataUrl ? Promise.resolve(e.dataUrl) : s.captureTab())
              .then((e) =>
                (function (e) {
                  return He.apply(this, arguments);
                })(e),
              )
              .then((e) =>
                r(
                  e || {
                    ok: false,
                    reason: "no_response",
                  },
                ),
              )
              .catch(() =>
                r({
                  ok: false,
                  reason: "capture_failed",
                }),
              ),
            true
          );
        }
        return void r({
          ok: false,
          reason: "invalid_url",
        });
      case "download_image":
        if (De(t.tab.url)) {
          return (
            (e.dataUrl ? Promise.resolve(e.dataUrl) : s.captureTab())
              .then((t) =>
                (function (e, t) {
                  return ze.apply(this, arguments);
                })(t, e.pageUrl),
              )
              .then((t) =>
                r({
                  success: true,
                  dataUrl: t,
                }),
              )
              .catch(() =>
                r({
                  success: false,
                }),
              ),
            true
          );
        }
        return void r({
          success: false,
        });
      case "open_options_page":
        try {
          chrome.runtime.openOptionsPage();
          r({
            success: true,
          });
        } catch (e) {
          r({
            success: false,
          });
        }
        return true;
      case "close_extension":
        s.sendMessageToTab(t.tab.id, {
          target: "script",
          action: "toggle_script",
        })
          .then((e) => {
            let r;
            let n;
            if (!e.scriptIsActive) {
              if (
                !(
                  (r = chrome.sidePanel) === null ||
                  r === undefined ||
                  (n = r.setOptions) === null ||
                  n === undefined
                )
              ) {
                n.call(r, {
                  tabId: t.tab.id,
                  path: "sidepanel/index.html",
                  enabled: false,
                });
              }
              ye(t.tab.id);
            }
            Te(t.tab.id, e.scriptIsActive);
          })
          .catch((e) => {})
          .finally(() =>
            r({
              success: true,
            }),
          );
        return true;
      case "inject_and_activate_iframe":
        s.executeScript({
          target: {
            tabId: t.tab.id,
            allFrames: true,
          },
          files: [...BD_CONTENT_FILES, "scripts/content.js"],
        })
          .then(() =>
            r({
              success: true,
            }),
          )
          .catch((e) => {
            r({
              success: false,
            });
          });
        return true;
      case "responsive_iframe_ready":
        if (t.tab && t.tab.id && t.frameId) {
          chrome.tabs.sendMessage(
            t.tab.id,
            {
              target: "script",
              action: "toggle_script_in_iframe_only",
            },
            {
              frameId: t.frameId,
            },
          );
        }
        return true;
      default:
        return false;
    }
  });
  chrome.contextMenus.onClicked.addListener(function (e, t) {
    return Se.apply(this, arguments);
  });
  chrome.tabs.onUpdated.addListener(function (e, t, r) {
    return Oe.apply(this, arguments);
  });
  chrome.tabs.onActivated.addListener(function (e) {
    return Ce.apply(this, arguments);
  });
  chrome.commands.onCommand.addListener(function (e, t) {
    if (!((e !== "select_parent" && e !== "select_child") || !t || !t.id)) {
      chrome.tabs
        .sendMessage(t.id, {
          target: "script",
          action: e,
        })
        .catch(() => {});
    }
  });
  chrome.tabs.onRemoved.addListener(function (e) {
    ye(e);
    Ne(e);
    N.delete(e);
    C.delete(e);
    D.delete(e);
  });
  chrome.windows.onRemoved.addListener(function (e) {
    de.delete(e);
    he.then(() => {
      let t;
      const r = T(le);
      try {
        let n;
        const a = () => {
          const r = S(t.value, 2);
          const n = r[0];
          if (r[1] !== e) {
            return 0;
          }
          return (
            ge(n),
            s
              .sendMessageToTab(n, {
                target: "script",
                action: "check_script_is_active",
              })
              .then((e) => {
                let t;
                let r;
                if (e != null && e.scriptIsActive) {
                  if (
                    !(
                      (t = chrome.sidePanel) === null ||
                      t === undefined ||
                      (r = t.setOptions) === null ||
                      r === undefined
                    )
                  ) {
                    r.call(t, {
                      tabId: n,
                      path: me(n),
                      enabled: true,
                    });
                  }
                }
              })
              .catch(() => {}),
            {
              v: undefined,
            }
          );
        };
        for (r.s(); !(t = r.n()).done;) {
          if ((n = a()) !== 0 && n) {
            return n.v;
          }
        }
      } catch (error) {
        r.e(error);
      } finally {
        r.f();
      }
    });
  });
  chrome.windows.onBoundsChanged?.addListener(function (e) {
    he.then(
      R(
        P().mark(function t() {
          let r;
          let n;
          let a;
          let c;
          let left;
          let top;
          let u;
          let l;
          let p;
          let f;
          let detachedPanelBounds;
          return P().wrap(
            function (t) {
              while (true) {
                switch ((t.prev = t.next)) {
                  case 0:
                    r = T(le.values());
                    t.prev = 1;
                    r.s();
                  case 3:
                    if ((n = r.n()).done) {
                      t.next = 20;
                      break;
                    }
                    if (n.value === e.id) {
                      t.next = 7;
                      break;
                    }
                    return t.abrupt("continue", 18);
                  case 7:
                    a = e.width;
                    c = e.height;
                    left = e.left;
                    top = e.top;
                    u = de.get(e.id);
                    l = !u || u.width !== a || u.height !== c;
                    t.next = 12;
                    return s.storageLocalGet({
                      detachedPanelBounds: null,
                    });
                  case 12:
                    p = t.sent;
                    f = p.detachedPanelBounds;
                    detachedPanelBounds = L(
                      L({}, f || {}),
                      {},
                      {
                        left,
                        top,
                      },
                    );
                    if (l) {
                      detachedPanelBounds.width = a;
                      detachedPanelBounds.height = c;
                    }
                    s.storageLocalSet({
                      detachedPanelBounds,
                    }).catch(() => {});
                    return t.abrupt("return");
                  case 18:
                    t.next = 3;
                    break;
                  case 20:
                    t.next = 25;
                    break;
                  case 22:
                    t.prev = 22;
                    t.t0 = t.catch(1);
                    r.e(t.t0);
                  case 25:
                    t.prev = 25;
                    r.f();
                    return t.finish(25);
                  case 28:
                  case "end":
                    return t.stop();
                }
              }
            },
            t,
            null,
            [[1, 22, 25, 28]],
          );
        }),
      ),
    );
  });
  chrome.runtime.onMessageExternal.addListener(function (e, t, r) {
    if (e.action === "install_timestamp") {
      R(
        P().mark(function t() {
          let n;
          let isNew;
          let o;
          return P().wrap(
            function (t) {
              while (true) {
                switch ((t.prev = t.next)) {
                  case 0:
                    t.prev = 0;
                    t.next = 3;
                    return s.storageLocalGet({
                      installedAt: null,
                    });
                  case 3:
                    n = t.sent;
                    isNew = !n.installedAt;
                    if (isNew) {
                      o = String(Date.now());
                    } else {
                      o = n.installedAt;
                    }
                    t.next = 9;
                    return b("installedAt", o);
                  case 9:
                    r({
                      success: true,
                      isNew,
                    });
                    t.next = 15;
                    break;
                  case 12:
                    t.prev = 12;
                    t.t0 = t.catch(0);
                    r({
                      success: false,
                    });
                  case 15:
                  case "end":
                    return t.stop();
                }
              }
            },
            t,
            null,
            [[0, 21]],
          );
        }),
      )();
      return true;
    }
  });
  chrome.storage.onChanged.addListener(function (e, t) {
    return _.apply(this, arguments);
  });
  ae().catch(() => {});
  var B = new Set([
    "capture_for_ai",
    "enter_responsive_mode",
    "exit_responsive_mode",
    "set_viewport",
  ]);
  function W(e, t) {
    return Y.apply(this, arguments);
  }
  function Y() {
    return (Y = R(
      P().mark(function e(t, r) {
        let n;
        let a;
        let c;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  n = Date.now();
                  a = n + r;
                case 2:
                  if (!(Date.now() < a)) {
                    e.next = 18;
                    break;
                  }
                  if (j(t)) {
                    e.next = 14;
                    break;
                  }
                  e.prev = 4;
                  e.next = 7;
                  return s.sendMessageToTab(t, {
                    target: "script",
                    action: "check_script_is_active",
                  });
                case 7:
                  if (!(c = e.sent) || !c.scriptIsActive) {
                    e.next = 10;
                    break;
                  }
                  return e.abrupt("return", Date.now() - n);
                case 10:
                  e.next = 14;
                  break;
                case 12:
                  e.prev = 12;
                  e.t0 = e.catch(4);
                case 14:
                  e.next = 16;
                  return new Promise((resolve) => setTimeout(resolve, 250));
                case 16:
                  e.next = 2;
                  break;
                case 18:
                  return e.abrupt("return", Date.now() - n);
                case 19:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[4, 12]],
        );
      }),
    )).apply(this, arguments);
  }
  function $() {
    return z.apply(this, arguments);
  }
  function z() {
    z = R(
      P().mark(function e() {
        let t;
        let r;
        let n;
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                e.next = 2;
                return s.tabsQuery({});
              case 2:
                t = e.sent;
                r = t.map(
                  (() => {
                    const e = R(
                      P().mark(function e(t) {
                        let r;
                        return P().wrap(
                          function (e) {
                            while (true) {
                              switch ((e.prev = e.next)) {
                                case 0:
                                  if (t.id) {
                                    e.next = 2;
                                    break;
                                  }
                                  return e.abrupt("return", null);
                                case 2:
                                  e.prev = 2;
                                  e.next = 5;
                                  return s.sendMessageToTab(t.id, {
                                    target: "script",
                                    action: "check_script_is_active",
                                  });
                                case 5:
                                  if (
                                    (r = e.sent) &&
                                    r.scriptIsActive === true
                                  ) {
                                    e.next = 8;
                                    break;
                                  }
                                  return e.abrupt("return", null);
                                case 8:
                                  return e.abrupt("return", {
                                    tabId: t.id,
                                    url: t.url || null,
                                    title: t.title || null,
                                  });
                                case 11:
                                  e.prev = 11;
                                  e.t0 = e.catch(2);
                                  return e.abrupt("return", null);
                                case 14:
                                case "end":
                                  return e.stop();
                              }
                            }
                          },
                          e,
                          null,
                          [[2, 11]],
                        );
                      }),
                    );
                    return function (t) {
                      return e.apply(this, arguments);
                    };
                  })(),
                );
                e.next = 6;
                return Promise.all(r);
              case 6:
                n = e.sent;
                return e.abrupt(
                  "return",
                  n.filter((e) => e !== null),
                );
              case 8:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    );
    return z.apply(this, arguments);
  }
  function H(e) {
    return Q.apply(this, arguments);
  }
  function Q() {
    return (Q = R(
      P().mark(function e(t) {
        let r;
        let n;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (typeof (r = t && t.tabId) === "number") {
                    e.next = 3;
                    break;
                  }
                  return e.abrupt("return", {
                    success: false,
                    error: "focus_tab requires a numeric tabId.",
                  });
                case 3:
                  e.prev = 3;
                  e.next = 6;
                  return new Promise((resolve, reject) => {
                    chrome.tabs.get(r, function (r) {
                      if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                      } else {
                        resolve(r);
                      }
                    });
                  });
                case 6:
                  n = e.sent;
                  e.next = 9;
                  return s.tabsUpdate(r, {
                    active: true,
                  });
                case 9:
                  e.next = 11;
                  return s.windowsUpdate(n.windowId, {
                    focused: true,
                  });
                case 11:
                  return e.abrupt("return", {
                    success: true,
                  });
                case 14:
                  e.prev = 14;
                  e.t0 = e.catch(3);
                  return e.abrupt("return", {
                    success: false,
                    error: String(e.t0 && e.t0.message ? e.t0.message : e.t0),
                  });
                case 17:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[3, 14]],
        );
      }),
    )).apply(this, arguments);
  }
  function J() {
    return (J = R(
      P().mark(function e(t) {
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                e.next = 2;
                return oe();
              case 2:
                e.next = 4;
                return se();
              case 4:
                chrome.sidePanel?.setOptions?.({
                  enabled: false,
                });
                if (t.reason !== "install") {
                  ae().catch(() => {});
                }
              case 6:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function X() {
    return Z.apply(this, arguments);
  }
  function Z() {
    return (Z = R(
      P().mark(function e() {
        let t;
        let r;
        let n;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  t = chrome.runtime.id;
                  r = chrome.i18n.getUILanguage();
                  n = `${t}&lang=${r}`;
                  e.prev = 3;
                  e.next = 6;
                  return s.tabsCreate({
                    url: n,
                    active: true,
                  });
                case 6:
                  e.next = 11;
                  break;
                case 8:
                  e.prev = 8;
                  e.t0 = e.catch(3);
                case 11:
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
  function ee() {
    return (ee = R(
      P().mark(function e() {
        let t;
        let r;
        let n;
        let a;
        let c;
        let i;
        let o;
        let u;
        let l;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  t = chrome.runtime.id;
                  r = chrome.i18n.getUILanguage();
                  e.next = 4;
                  return s.storageLocalGet({
                    theme: "system",
                  });
                case 4:
                  n = e.sent;
                  a = n.theme;
                  c = `https://www.bodoi.com/pricing/?extId=${t}&lang=${r}`;
                  if (!(a !== "light" && a !== "dark")) {
                    c += `&theme=${a}`;
                  }
                  e.prev = 8;
                  i = {
                    url: c,
                    active: true,
                  };
                  e.prev = 10;
                  e.next = 13;
                  return s.tabsQuery({
                    active: true,
                    currentWindow: true,
                  });
                case 13:
                  o = e.sent;
                  u = S(o, 1);
                  if (((l = u[0]) == null ? undefined : l.id) != null) {
                    i.openerTabId = l.id;
                  }
                  e.next = 21;
                  break;
                case 19:
                  e.prev = 19;
                  e.t0 = e.catch(10);
                case 21:
                  e.next = 23;
                  return s.tabsCreate(i);
                case 23:
                  e.next = 28;
                  break;
                case 25:
                  e.prev = 25;
                  e.t1 = e.catch(8);
                case 28:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [
            [8, 25],
            [10, 19],
          ],
        );
      }),
    )).apply(this, arguments);
  }
  function te() {
    return (te = R(
      P().mark(function e() {
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                return e.abrupt("return", null);
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function re(e) {
    const currency = typeof e?.currency === "string" && e.currency.trim();
    const a = typeof e?.inspect?.amount === "string" && e.inspect.amount.trim();
    const c = typeof e?.studio?.amount === "string" && e.studio.amount.trim();
    if (!currency || !a || !c) {
      return null;
    }
    const s = {
      currency,
      inspect: {
        amount: a,
      },
      studio: {
        amount: c,
      },
    };
    const computeI = (e) => {
      const code = typeof e?.code === "string" && e.code.trim();
      const c = typeof e?.endsAt === "string" ? Date.parse(e.endsAt) : NaN;
      if (!code || !Number.isFinite(c) || c <= Date.now()) {
        return null;
      }
      if (typeof e?.text?.en !== "string" || !e.text.en) {
        return null;
      }
      const s = {};
      for (let i = 0, o = Object.entries(e.text); i < o.length; i++) {
        const u = S(o[i], 2);
        const [l, p] = u;
        if (typeof p === "string" && p) {
          s[l] = p;
        }
      }
      const f = {
        code,
        endsAt: e.endsAt,
        text: s,
      };
      const d =
        typeof e?.inspect?.amount === "string" && e.inspect.amount.trim();
      const h = typeof e?.studio?.amount === "string" && e.studio.amount.trim();
      if (d && h) {
        f.inspect = {
          amount: d,
        };
        f.studio = {
          amount: h,
        };
      }
      return f;
    };
    const i = computeI(e?.offer);
    if (i) {
      s.offer = i;
    }
    return s;
  }
  function ne() {
    return (ne = R(
      P().mark(function e() {
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                e.next = 2;
                return oe();
              case 2:
                return e.abrupt("return", Promise.resolve());
              case 4:
                chrome.sidePanel?.setOptions?.({
                  enabled: false,
                });
                ae().catch(() => {});
              case 6:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function ae() {
    return ce.apply(this, arguments);
  }
  function ce() {
    return (ce = R(
      P().mark(function e() {
        let t;
        let r;
        let n;
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                e.next = 2;
                return s.storageLocalGet({
                  mcpIntent: false,
                });
              case 2:
                t = e.sent;
                r = t.mcpIntent;
                if (r !== undefined && r) {
                  e.next = 7;
                  break;
                }
                return e.abrupt("return");
              case 7:
                e.next = 10;
                return G();
              case 10:
                if (e.sent) {
                  e.next = 25;
                  break;
                }
                return e.abrupt("return");
              case 20:
                e.next = 22;
                return s.storageLocalSet({
                  mcpIntent: false,
                });
              case 24:
                return e.abrupt("return");
              case 25:
                e.next = 27;
                return Ve(n);
              case 27:
                if (!e.sent) {
                  e.next = 29;
                  break;
                }
                return e.abrupt("return");
              case 29:
                e.next = 31;
                return We();
              case 31:
                return e.abrupt("return");
              case 33:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function se() {
    return ie.apply(this, arguments);
  }
  function ie() {
    return (ie = R(
      P().mark(function e() {
        let t;
        let n;
        let a;
        let c;
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                e.next = 2;
                return s.contextMenusRemoveAll();
              case 2:
                t = [
                  {
                    title: chrome.i18n.getMessage("EXT_NAME_SHORT"),
                    id: "activate",
                    contexts: [
                      "page",
                      "frame",
                      "selection",
                      "link",
                      "editable",
                      "image",
                      "video",
                      "audio",
                    ],
                    type: "normal",
                  },
                ];
                n = 0;
                a = t;
                return (e.next = 9);
              case 9:
                if (!(n < a.length)) {
                  e.next = 16;
                  break;
                }
                c = a[n];
                e.next = 13;
                return s.contextMenusCreate(c);
              case 13:
                n++;
                e.next = 9;
                break;
              case 16:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function oe() {
    return ue.apply(this, arguments);
  }
  function ue() {
    return (ue = R(
      P().mark(function e() {
        let t;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (chrome.declarativeContent) {
                    e.next = 2;
                    break;
                  }
                  return e.abrupt("return");
                case 2:
                  e.next = 4;
                  return chrome.action.enable();
                case 4:
                  e.prev = 4;
                  e.next = 7;
                  return s.onPageChangedRemoveRules(undefined);
                case 7:
                  t = {
                    conditions: [
                      new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                          schemes: ["http", "https", "file", "ftp"],
                        },
                      }),
                    ],
                    actions: [new chrome.declarativeContent.ShowAction()],
                  };
                  e.next = 10;
                  return s.onPageChangedAddRules([t]);
                case 10:
                  e.next = 15;
                  break;
                case 12:
                  e.prev = 12;
                  e.t0 = e.catch(4);
                case 15:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[4, 12]],
        );
      }),
    )).apply(this, arguments);
  }
  var le = new Map();
  var pe = 400;
  var fe = 800;
  var de = new Map();
  var he = chrome.storage.session
    .get({
      detachedPanels: {},
    })
    .then(({ detachedPanels }) => {
      for (let r = 0, n = Object.entries(detachedPanels); r < n.length; r++) {
        const a = S(n[r], 2);
        const [c, s] = a;
        if (!le.has(Number(c))) {
          le.set(Number(c), s);
        }
      }
    })
    .catch(() => {});
  function ve() {
    chrome.storage.session
      .set({
        detachedPanels: Object.fromEntries(le),
      })
      .catch(() => {});
  }
  function me(e) {
    return `sidepanel/index.html?tabId=${e}`;
  }
  function ge(e) {
    if (le.delete(e)) {
      ve();
    }
  }
  function be() {
    be = R(
      P().mark(function e(t) {
        let i;
        let o;
        let u;
        let l;
        let p;
        let f;
        let d;
        const h = arguments;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  i = h.length > 1 && h[1] !== undefined ? h[1] : null;
                  e.next = 3;
                  return he;
                case 3:
                  if ((o = le.get(t)) === undefined) {
                    e.next = 14;
                    break;
                  }
                  e.prev = 5;
                  e.next = 8;
                  return s.windowsUpdate(o, {
                    focused: true,
                  });
                case 8:
                  return e.abrupt("return", o);
                case 11:
                  e.prev = 11;
                  e.t0 = e.catch(5);
                  ge(t);
                case 14:
                  e.next = 16;
                  return s.storageLocalGet({
                    detachedPanelBounds: null,
                  });
                case 16:
                  u = e.sent;
                  l = u.detachedPanelBounds;
                  p = {
                    width:
                      l?.width > 0
                        ? l.width
                        : i?.width > 0
                          ? Math.round(i.width)
                          : pe,
                    height:
                      l?.height > 0
                        ? l.height
                        : i?.height > 0
                          ? Math.round(i.height)
                          : fe,
                  };
                  if (Number.isFinite(l?.left) && Number.isFinite(l?.top)) {
                    p.left = l.left;
                    p.top = l.top;
                  }
                  f = chrome.runtime.getURL(`${me(t)}&detached=1`);
                  e.next = 23;
                  return s.windowsCreate(
                    L(
                      {
                        url: f,
                        type: "popup",
                        focused: true,
                      },
                      p,
                    ),
                  );
                case 23:
                  d = e.sent;
                  le.set(t, d.id);
                  de.set(d.id, {
                    width: d.width ?? p.width,
                    height: d.height ?? p.height,
                  });
                  ve();
                  if (
                    Number.isFinite(d.left) &&
                    Number.isFinite(d.top) &&
                    (d.left !== p.left || d.top !== p.top)
                  ) {
                    s.storageLocalSet({
                      detachedPanelBounds: L(
                        L({}, l || {}),
                        {},
                        {
                          left: d.left,
                          top: d.top,
                        },
                      ),
                    }).catch(() => {});
                  }
                  chrome.sidePanel?.setOptions?.({
                    tabId: t,
                    enabled: false,
                  });
                  return e.abrupt("return", d.id);
                case 30:
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
    );
    return be.apply(this, arguments);
  }
  function ye(e) {
    return xe.apply(this, arguments);
  }
  function xe() {
    return (xe = R(
      P().mark(function e(t) {
        let r;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.next = 2;
                  return he;
                case 2:
                  if ((r = le.get(t)) !== undefined) {
                    e.next = 5;
                    break;
                  }
                  return e.abrupt("return");
                case 5:
                  ge(t);
                  e.prev = 6;
                  e.next = 9;
                  return chrome.windows.remove(r);
                case 9:
                  e.next = 13;
                  break;
                case 11:
                  e.prev = 11;
                  e.t0 = e.catch(6);
                case 13:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[6, 11]],
        );
      }),
    )).apply(this, arguments);
  }
  function we(e) {
    return _e.apply(this, arguments);
  }
  function _e() {
    return (_e = R(
      P().mark(function e(t) {
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                if (
                  De(t.url.toLowerCase()) &&
                  !t.discarded &&
                  t.status !== "unloaded"
                ) {
                  e.next = 3;
                  break;
                }
                return e.abrupt("return");
              case 3:
                chrome.sidePanel?.setOptions?.({
                  tabId: t.id,
                  path: `sidepanel/index.html?tabId=${t.id}`,
                  enabled: true,
                });
                e.next = 6;
                return ke(t);
              case 6:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function ke(e) {
    return Ie.apply(this, arguments);
  }
  function Ie() {
    return (Ie = R(
      P().mark(function e(t) {
        let r;
        let n;
        let a;
        let c;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 1;
                  e.next = 4;
                  return s.sendMessageToTab(t.id, {
                    target: "script",
                    action: "check_script_is_active",
                  });
                case 4:
                  e.next = 17;
                  break;
                case 6:
                  e.prev = 6;
                  e.t0 = e.catch(1);
                  if (!t.id) {
                    e.next = 17;
                    break;
                  }
                  e.prev = 9;
                  e.next = 12;
                  return s.executeScript({
                    target: {
                      tabId: t.id,
                    },
                    files: [...BD_CONTENT_FILES, "scripts/content.js"],
                  });
                case 12:
                  e.next = 17;
                  break;
                case 14:
                  e.prev = 14;
                  e.t1 = e.catch(9);
                case 17:
                  e.prev = 17;
                  e.prev = 18;
                  e.next = 21;
                  return s.sendMessageToTab(t.id, {
                    target: "script",
                    action: "toggle_script",
                  });
                case 21:
                  r = e.sent;
                  if (!(n = r.scriptIsActive)) {
                    if (
                      !(
                        (a = chrome.sidePanel) === null ||
                        a === undefined ||
                        (c = a.setOptions) === null ||
                        c === undefined
                      )
                    ) {
                      c.call(a, {
                        tabId: t.id,
                        path: "sidepanel/index.html",
                        enabled: false,
                      });
                    }
                    ye(t.id);
                  }
                  Te(t.id, n);
                  if (n) {
                    e.next = 28;
                    break;
                  }
                  e.next = 28;
                  return s.sendOptionalMessage({
                    target: "side_panel",
                    action: "clear",
                    tabId: t.id,
                  });
                case 28:
                  e.next = 33;
                  break;
                case 30:
                  e.prev = 30;
                  e.t2 = e.catch(18);
                case 33:
                  return e.finish(17);
                case 34:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [
            [1, 6, 17, 34],
            [9, 14],
            [18, 30],
          ],
        );
      }),
    )).apply(this, arguments);
  }
  function Le(e) {
    return Ee.apply(this, arguments);
  }
  function Ee() {
    return (Ee = R(
      P().mark(function e(t) {
        let r;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.prev = 0;
                  e.next = 3;
                  return s.sendMessageToTab(t, {
                    target: "script",
                    action: "check_script_is_active",
                  });
                case 3:
                  r = e.sent;
                  e.next = 6;
                  return Te(t, r.scriptIsActive);
                case 6:
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
  function Te(e, t) {
    return Pe.apply(this, arguments);
  }
  function Pe() {
    return (Pe = R(
      P().mark(function e(tabId, r) {
        let path;
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                path = r ? "images/icon32_active.png" : "images/icon32.png";
                e.next = 3;
                return s.setActionIcon({
                  path,
                  tabId,
                });
              case 3:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function Se() {
    return (Se = R(
      P().mark(function e(t, r) {
        let n;
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                if ((n = t.menuItemId) === "activate" && r) {
                  we(r);
                }
                if (n === "enter_license") {
                  try {
                    chrome.runtime.openOptionsPage();
                  } catch (e) {}
                }
              case 3:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function Oe() {
    return (Oe = R(
      P().mark(function e(t, r, n) {
        let a;
        let c;
        let i;
        let edits;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (r.status === "loading") {
                    Ne(t);
                  }
                  if (r.status !== "complete") {
                    e.next = 54;
                    break;
                  }
                  if (De(n.url) && !n.discarded && n.status !== "unloaded") {
                    e.next = 4;
                    break;
                  }
                  return e.abrupt("return");
                case 4:
                  if (!N.has(t)) {
                    e.next = 52;
                    break;
                  }
                  N.delete(t);
                  e.prev = 6;
                  a = false;
                  e.prev = 8;
                  e.next = 11;
                  return s.sendMessageToTab(t, {
                    target: "script",
                    action: "check_script_is_active",
                  });
                case 11:
                  e.next = 13;
                  return s.sendMessageToTab(t, {
                    target: "script",
                    action: "toggle_script",
                  });
                case 13:
                  c = e.sent;
                  a = c.scriptIsActive;
                  e.next = 25;
                  break;
                case 17:
                  e.prev = 17;
                  e.t0 = e.catch(8);
                  e.next = 21;
                  return s.executeScript({
                    target: {
                      tabId: t,
                    },
                    files: [...BD_CONTENT_FILES, "scripts/content.js"],
                  });
                case 21:
                  e.next = 23;
                  return s.sendMessageToTab(t, {
                    target: "script",
                    action: "toggle_script",
                  });
                case 23:
                  i = e.sent;
                  a = i.scriptIsActive;
                case 25:
                  e.next = 27;
                  return Te(t, a);
                case 27:
                  if (!(edits = D.get(t))) {
                    e.next = 37;
                    break;
                  }
                  D.delete(t);
                  e.prev = 30;
                  e.next = 33;
                  return s.sendMessageToTab(t, {
                    target: "script",
                    action: "apply_pending_rule_edits",
                    edits,
                  });
                case 33:
                  e.next = 37;
                  break;
                case 35:
                  e.prev = 35;
                  e.t1 = e.catch(30);
                case 37:
                  if (!C.has(t)) {
                    e.next = 46;
                    break;
                  }
                  C.delete(t);
                  e.prev = 39;
                  e.next = 42;
                  return s.sendMessageToTab(t, {
                    target: "script",
                    action: "set_edit_mode",
                  });
                case 42:
                  e.next = 46;
                  break;
                case 44:
                  e.prev = 44;
                  e.t2 = e.catch(39);
                case 46:
                  return e.abrupt("return");
                case 49:
                  e.prev = 49;
                  e.t3 = e.catch(6);
                case 52:
                  e.next = 54;
                  return Le(t);
                case 54:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [
            [6, 49],
            [8, 17],
            [30, 35],
            [39, 44],
          ],
        );
      }),
    )).apply(this, arguments);
  }
  var Ae = {
    priority: 1,
    action: {
      type: "modifyHeaders",
      responseHeaders: [
        {
          header: "x-frame-options",
          operation: "remove",
        },
        {
          header: "frame-options",
          operation: "remove",
        },
        {
          header: "content-security-policy",
          operation: "remove",
        },
        {
          header: "content-security-policy-report-only",
          operation: "remove",
        },
      ],
    },
  };
  function Me(e) {
    return Re.apply(this, arguments);
  }
  function Re() {
    return (Re = R(
      P().mark(function e(id) {
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                if (Number.isInteger(id) && !(id < 1)) {
                  e.next = 2;
                  break;
                }
                throw new Error(`bad tabId ${id}`);
              case 2:
                e.next = 4;
                return s.updateSessionRules({
                  removeRuleIds: [id],
                  addRules: [
                    L(
                      L({}, Ae),
                      {},
                      {
                        id,
                        condition: {
                          resourceTypes: ["sub_frame"],
                          tabIds: [id],
                        },
                      },
                    ),
                  ],
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
  function Ne(e) {
    return je.apply(this, arguments);
  }
  function je() {
    return (je = R(
      P().mark(function e(t) {
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  if (Number.isInteger(t) && !(t < 1)) {
                    e.next = 2;
                    break;
                  }
                  return e.abrupt("return");
                case 2:
                  e.prev = 2;
                  e.next = 5;
                  return s.updateSessionRules({
                    removeRuleIds: [t],
                  });
                case 5:
                  e.next = 10;
                  break;
                case 7:
                  e.prev = 7;
                  e.t0 = e.catch(2);
                case 10:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[2, 7]],
        );
      }),
    )).apply(this, arguments);
  }
  function Ce() {
    return (Ce = R(
      P().mark(function e(t) {
        let r;
        let n;
        let a;
        let c;
        let i;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.next = 2;
                  return he;
                case 2:
                  r = T(le.values());
                  e.prev = 3;
                  r.s();
                case 5:
                  if ((n = r.n()).done) {
                    e.next = 11;
                    break;
                  }
                  if (n.value !== t.windowId) {
                    e.next = 9;
                    break;
                  }
                  return e.abrupt("return");
                case 9:
                  e.next = 5;
                  break;
                case 11:
                  e.next = 16;
                  break;
                case 13:
                  e.prev = 13;
                  e.t0 = e.catch(3);
                  r.e(e.t0);
                case 16:
                  e.prev = 16;
                  r.f();
                  return e.finish(16);
                case 19:
                  e.prev = 19;
                  e.next = 22;
                  return s.sendMessageToTab(t.tabId, {
                    target: "script",
                    action: "side_panel_loaded",
                  });
                case 22:
                  if (!((a = e.sent) != null && a.success)) {
                    if (
                      !(
                        (c = chrome.sidePanel) === null ||
                        c === undefined ||
                        (i = c.setOptions) === null ||
                        i === undefined
                      )
                    ) {
                      i.call(c, {
                        tabId: t.tabId,
                        enabled: false,
                      });
                    }
                    s.sendMessage({
                      target: "side_panel",
                      action: "clear",
                      tabId: t.tabId,
                    }).catch(() => {});
                  }
                  e.next = 30;
                  break;
                case 26:
                  e.prev = 26;
                  e.t1 = e.catch(19);
                  chrome.sidePanel?.setOptions?.({
                    tabId: t.tabId,
                    enabled: false,
                  });
                  s.sendMessage({
                    target: "side_panel",
                    action: "clear",
                    tabId: t.tabId,
                  }).catch(() => {});
                case 30:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [
            [3, 13, 16, 19],
            [19, 26],
          ],
        );
      }),
    )).apply(this, arguments);
  }
  function De(e) {
    return ![
      /^chrome:/,
      /^edge:/,
      /^chrome-extension:/,
      /^(https?:\/\/)?(www\.)?chrome\.google\.com\/webstore/,
      /^(https?:\/\/)?chromewebstore\.google\.com/,
    ].some((t) => t.test(e));
  }
  function Ue(e) {
    let t;
    try {
      t = new URL(e);
    } catch (e) {
      return false;
    }
    if (t.protocol !== "http:" && t.protocol !== "https:") {
      return false;
    }
    const r = t.hostname.toLowerCase();
    return (
      r !== "localhost" &&
      !r.endsWith(".localhost") &&
      (r.startsWith("[")
        ? !((e) => {
            const t = e.replace(/^\[/, "").replace(/\]$/, "");
            if (t === "::" || t === "::1") {
              return true;
            }
            if (t.startsWith("::")) {
              if (!t.startsWith("::ffff:")) {
                return true;
              }
              const r = t.slice(7);
              if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(r)) {
                return Ge(r);
              }
              const n = r.split(":");
              if (n.length > 2) {
                return true;
              }
              if (n.some((e) => !/^[0-9a-f]{1,4}$/.test(e))) {
                return true;
              }
              let a;
              let c = 0;
              const s = T(n);
              try {
                for (s.s(); !(a = s.n()).done;) {
                  const i = a.value;
                  c = 65536 * c + parseInt(i, 16);
                }
              } catch (error) {
                s.e(error);
              } finally {
                s.f();
              }
              return Ge(
                `${(c >>> 24) & 255}.${(c >>> 16) & 255}.${(c >>> 8) & 255}.${255 & c}`,
              );
            }
            const o = t.split(":")[0];
            if (!/^[0-9a-f]{1,4}$/.test(o)) {
              return true;
            }
            const u = parseInt(o, 16);
            return (u >= 64512 && u <= 65023) || (u >= 65152 && u <= 65215);
          })(r)
        : !Ge(r))
    );
  }
  function Ge(e) {
    const t = e.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (!t) {
      return false;
    }
    const r = Number(t[1]);
    const n = Number(t[2]);
    return (
      r === 0 ||
      r === 127 ||
      r === 10 ||
      (r === 100 && n >= 64 && n <= 127) ||
      (r === 169 && n === 254) ||
      (r === 192 && n === 168) ||
      (r === 172 && n >= 16 && n <= 31)
    );
  }
  function Ke(e) {
    try {
      return new URL(e).hostname || e;
    } catch (t) {
      return e;
    }
  }
  function Fe(e) {
    return qe.apply(this, arguments);
  }
  function qe() {
    qe = R(
      P().mark(function e(t) {
        let r;
        let n;
        let a;
        let c;
        let s;
        let i;
        const o = arguments;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  r = o.length > 1 && o[1] !== undefined ? o[1] : {};
                  n = t;
                  a = 0;
                case 3:
                  if (!(a <= 5)) {
                    e.next = 31;
                    break;
                  }
                  if (Ue(n)) {
                    e.next = 6;
                    break;
                  }
                  throw new Error(
                    `Blocked request to disallowed host: ${Ke(n)}`,
                  );
                case 6:
                  e.next = 8;
                  return fetch(
                    n,
                    L(
                      L({}, r),
                      {},
                      {
                        credentials: "omit",
                        redirect: "manual",
                      },
                    ),
                  );
                case 8:
                  c = e.sent;
                  if (
                    c.type === "opaqueredirect" ||
                    (c.status >= 300 && c.status <= 399)
                  ) {
                    e.next = 12;
                    break;
                  }
                  return e.abrupt("return", c);
                case 12:
                  if (!(s = c.headers.get("location"))) {
                    e.next = 22;
                    break;
                  }
                  e.prev = 14;
                  n = new URL(s, n).href;
                  e.next = 21;
                  break;
                case 18:
                  e.prev = 18;
                  e.t0 = e.catch(14);
                  throw new Error(
                    "Blocked redirect: Location header could not be resolved.",
                  );
                case 21:
                  return e.abrupt("continue", 28);
                case 22:
                  e.next = 24;
                  return fetch(
                    n,
                    L(
                      L({}, r),
                      {},
                      {
                        credentials: "omit",
                        redirect: "follow",
                      },
                    ),
                  );
                case 24:
                  if ((i = e.sent).url && Ue(i.url)) {
                    e.next = 27;
                    break;
                  }
                  throw new Error(
                    `Blocked redirect to disallowed host: ${Ke(i.url || n)}`,
                  );
                case 27:
                  return e.abrupt("return", i);
                case 28:
                  a++;
                  e.next = 3;
                  break;
                case 31:
                  throw new Error(`Blocked request: more than ${5} redirects.`);
                case 32:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[14, 18]],
        );
      }),
    );
    return qe.apply(this, arguments);
  }
  function Ve(e) {
    return Be.apply(this, arguments);
  }
  function Be() {
    return (Be = R(
      P().mark(function e(t) {
        let r;
        let n;
        let a;
        return P().wrap(
          function (e) {
            while (true) {
              switch ((e.prev = e.next)) {
                case 0:
                  e.next = 2;
                  return self.clients.matchAll().catch((e) => false);
                case 2:
                  r = e.sent;
                  n = T(r);
                  e.prev = 4;
                  n.s();
                case 6:
                  if ((a = n.n()).done) {
                    e.next = 12;
                    break;
                  }
                  if (a.value.url !== t) {
                    e.next = 10;
                    break;
                  }
                  return e.abrupt("return", true);
                case 10:
                  e.next = 6;
                  break;
                case 12:
                  e.next = 17;
                  break;
                case 14:
                  e.prev = 14;
                  e.t0 = e.catch(4);
                  n.e(e.t0);
                case 17:
                  e.prev = 17;
                  n.f();
                  return e.finish(17);
                case 20:
                  return e.abrupt("return", false);
                case 21:
                case "end":
                  return e.stop();
              }
            }
          },
          e,
          null,
          [[4, 14, 17, 20]],
        );
      }),
    )).apply(this, arguments);
  }
  function We() {
    return Ye.apply(this, arguments);
  }
  function Ye() {
    return (Ye = R(
      P().mark(function e() {
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                return e.abrupt("return", Promise.resolve());
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function bdBlobToDataURL(e) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = function () {
        return resolve(r.result);
      };
      r.onerror = reject;
      r.readAsDataURL(e);
    });
  }
  async function $e(e, t, n) {
    try {
      const r = await fetch(n);
      const i = await r.blob();
      const a = await createImageBitmap(i);
      const o = Math.max(1, Math.round(t.right - t.left));
      const s = Math.max(1, Math.round(t.bottom - t.top));
      const l = new OffscreenCanvas(o, s);
      const c = l.getContext("2d");
      c.drawImage(a, t.left, t.top, o, s, 0, 0, o, s);
      const u = await l.convertToBlob({
        type: "image/png",
      });
      return await bdBlobToDataURL(u);
    } catch (e) {
      return n;
    }
  }
  async function ze(e, t) {
    return e;
  }
  function He() {
    return (He = R(
      P().mark(function e(t) {
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                return e.abrupt("return", Promise.resolve());
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
  function Qe() {
    return (Qe = R(
      P().mark(function e() {
        return P().wrap(function (e) {
          while (true) {
            switch ((e.prev = e.next)) {
              case 0:
                return e.abrupt("return", false);
              case 2:
              case "end":
                return e.stop();
            }
          }
        }, e);
      }),
    )).apply(this, arguments);
  }
})();
