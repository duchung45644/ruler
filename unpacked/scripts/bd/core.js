// Bo doi design tools — shared core. Loaded first, before the feature modules and content.js.
// Every bd/* file runs in the same isolated world as content.js and shares one namespace, globalThis.__bd:
// core puts helpers/state there, each module adds its own functions to it. content.js only talks to
// globalThis.__bdTools (the public api below).
(() => {
    "use strict";
    if (globalThis.__bd) return; // already injected into this page

    const VI = (chrome.i18n.getUILanguage() || "").toLowerCase().startsWith("vi");
    const T = (en, vi) => (VI ? vi : en);
    const Z = 2147483647;

    const state = {
        active: { designOverlay: false, guides: false, measureArea: false, styleAudit: false },
        guides: [], // {axis: "h"|"v", pos: page px}
        drag: null,
        measure: null, // {x1,y1,x2,y2} page coords
        measureColor: "#FF3B6B",
        measureGuides: false, // extend the measure box edges across the page
        overlays: [], // {src, img, x, y, scale, opacity, mode, visible, fixed}
        sel: -1, // index of the overlay the panel edits
        audit: null,
        highlights: [],
    };

    const bd = (globalThis.__bd = {
        mods: {}, // modules already loaded (guards against double injection)
        drawers: [], // (container, {X, Y, W, H}) => void, run in module load order on every render
        layer: null, // drawings (fixed, pointer-events none)
        panelHost: null, // interactive panels
    });

    const api = {
        onChange: null,
        isActive: (n) => !!state.active[n],
        toggle(name, on) {
            if (!(name in state.active)) return false;
            const next = on === undefined ? !state.active[name] : !!on;
            state.active[name] = next;
            ensureLayer();
            if (name === "designOverlay") next ? bd.openOverlayPanel() : closePanel("designOverlay");
            if (name === "styleAudit") next ? bd.openAuditPanel() : (closePanel("styleAudit"), (state.highlights = []));
            if (name === "measureArea") next ? bd.openMeasurePanel() : (closePanel("measureArea"), (state.measure = null));
            if (name === "guides" && !next) state.drag = null;
            api.onChange && api.onChange(name, next);
            render();
            return next;
        },
        openCaptureBar: (hooks) => bd.openCaptureBar(hooks),
        openCaptureEditor: (src) => bd.openCaptureEditor(src),
        destroy() {
            bd.closeCapture && bd.closeCapture();
            Object.keys(state.active).forEach((k) => (state.active[k] = false));
            state.guides = [];
            state.measure = null;
            state.highlights = [];
            state.audit = null;
            state.overlays.forEach((o) => o.img.remove());
            state.overlays = [];
            state.sel = -1;
            bd.layer && bd.layer.remove();
            bd.panelHost && bd.panelHost.remove();
            bd.layer = bd.panelHost = null;
        },
    };
    globalThis.__bdTools = api;

    // ---------- helpers ----------
    const sx = () => window.scrollX;
    const sy = () => window.scrollY;
    const isOurs = (e) => e.composedPath().some((n) => n === bd.panelHost);
    const isDock = (e) =>
        e.composedPath().some((n) => n.classList && [...n.classList].some((c) => c.startsWith("control-bar-") || c.startsWith("popover-")));
    const isTyping = (e) => e.composedPath().some((n) => n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.tagName === "SELECT" || n.isContentEditable);
    const extHosts = () => [...document.querySelectorAll("body > div[data-id]")].filter((e) => e.shadowRoot);
    // elements that belong to us or to the extension UI, never to the page
    const ownNodes = () => new Set([...extHosts(), bd.layer, bd.panelHost, ...state.overlays.map((o) => o.img)]);

    function elementAt(x, y) {
        const skip = ownNodes();
        return document.elementsFromPoint(x, y).find((el) => !skip.has(el) && el !== document.documentElement && el !== document.body) || null;
    }

    function h(tag, props = {}, ...kids) {
        const el = document.createElement(tag);
        for (const [k, v] of Object.entries(props)) {
            if (k === "style") el.style.cssText = v;
            else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
            else if (k === "text") el.textContent = v;
            else el.setAttribute(k, v);
        }
        kids.flat().forEach((c) => c != null && el.append(c));
        return el;
    }

    function toHex(c) {
        const m = c.match(/rgba?\(([^)]+)\)/);
        if (!m) return c;
        const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        if (p.length > 3 && p[3] === 0) return null;
        const hex = "#" + p.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();
        return p.length > 3 && p[3] < 1 ? hex + Math.round(p[3] * 255).toString(16).padStart(2, "0").toUpperCase() : hex;
    }

    function copy(text) {
        navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {});
    }

    function swallow(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    // ---------- drawing layer ----------
    function ensureLayer() {
        if (bd.layer && bd.layer.isConnected) return;
        bd.layer = h("div", {
            style: `position:fixed;inset:0;pointer-events:none;z-index:${Z};overflow:hidden;contain:strict;`,
        });
        bd.layer.attachShadow({ mode: "open" }).append(
            h("style", {
                text: `
                :host{all:initial}
                .g{position:absolute;background:#00B3FF;}
                .g.h{left:0;right:0;height:1px}
                .g.v{top:0;bottom:0;width:1px}
                .g.hot{background:#FF3B6B}
                .lbl{position:absolute;font:600 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#fff;background:#00B3FF;padding:3px 5px;border-radius:4px;white-space:nowrap;transform:translate(-50%,-50%)}
                .lbl.d{background:#1f1f1f}
                .m{position:absolute;border:1px solid var(--mc);background:color-mix(in srgb,var(--mc) 12%,transparent)}
                .m .lbl{background:var(--mc)}
                .mg{position:absolute;opacity:.7}
                .mg.h{left:0;right:0;border-top:1px dashed var(--mc)}
                .mg.v{top:0;bottom:0;border-left:1px dashed var(--mc)}
                .hl{position:absolute;outline:2px solid #7C4DFF;background:rgba(124,77,255,.12);border-radius:2px}
                .zone{position:absolute;background:rgba(0,179,255,.08)}
            `,
            }),
            h("div", { id: "c" })
        );
        document.documentElement.append(bd.layer);
    }

    let raf = 0;
    function render() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
    }

    function draw() {
        if (!bd.layer) return;
        const c = bd.layer.shadowRoot.getElementById("c");
        c.replaceChildren();
        c.style.setProperty("--mc", state.measureColor);
        const view = { X: sx(), Y: sy(), W: innerWidth, H: innerHeight };
        bd.drawers.forEach((fn) => fn(c, view));
    }

    addEventListener("scroll", () => (state.guides.length || state.measure || state.highlights.length || state.overlays.length) && render(), { capture: true, passive: true });
    addEventListener("resize", render, { passive: true });

    // ---------- panels ----------
    const PANEL_CSS = `
        :host{all:initial;--bg:#fff;--fg:#1f1f1f;--mut:#74777c;--line:rgba(0,0,0,.08);--sf:#f2f2f2;--acc:#5B5BF0}
        @media (prefers-color-scheme:dark){:host{--bg:#1f1f1f;--fg:#eee;--mut:#a5a8ad;--line:rgba(255,255,255,.1);--sf:#2c2c2c}}
        *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
        .p{position:fixed;top:16px;right:16px;width:300px;max-height:calc(100vh - 120px);display:flex;flex-direction:column;background:var(--bg);color:var(--fg);border-radius:14px;box-shadow:0 0 0 1px var(--line),0 8px 24px rgba(0,0,0,.18);font-size:12px;pointer-events:auto;overflow:hidden}
        .hd{display:flex;align-items:center;gap:6px;padding:10px 12px;cursor:move;border-bottom:1px solid var(--line);font-weight:600;font-size:13px;user-select:none}
        .hd span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .hd button{flex-shrink:0;white-space:nowrap}
        button{font:inherit;color:inherit;background:var(--sf);border:0;border-radius:8px;padding:6px 10px;cursor:pointer}
        button:hover{filter:brightness(.95)}
        button.x{background:none;padding:2px 6px;font-size:16px;line-height:1}
        button.on{background:var(--acc);color:#fff}
        .bd{padding:12px;display:flex;flex-direction:column;gap:10px;overflow:auto}
        .row{display:flex;align-items:center;gap:8px}
        .row label{width:72px;color:var(--mut)}
        .row input[type=number]{width:70px}
        input[type=number],select{font:inherit;color:inherit;background:var(--sf);border:1px solid var(--line);border-radius:8px;padding:5px 8px}
        input[type=range]{flex:1;accent-color:var(--acc)}
        .drop{border:1.5px dashed var(--line);border-radius:10px;padding:18px;text-align:center;color:var(--mut);cursor:pointer}
        .drop.over{border-color:var(--acc);color:var(--acc)}
        .thumbs{display:flex;flex-wrap:wrap;gap:6px}
        .thumbs:empty{display:none}
        .thumbs button{padding:2px;border:2px solid transparent;border-radius:8px}
        .thumbs button.on{border-color:var(--acc)}
        .thumbs img{display:block;height:40px;max-width:72px;object-fit:cover;border-radius:5px}
        .tabs{display:flex;gap:4px;padding:8px 12px 0}
        .tabs button{flex:1;background:none}
        .tabs button.on{background:var(--sf);color:var(--fg)}
        .item{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;cursor:pointer}
        .item:hover,.item.sel{background:var(--sf)}
        .sw{width:18px;height:18px;border-radius:5px;box-shadow:inset 0 0 0 1px var(--line);flex-shrink:0}
        .v{flex:1;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .n{color:var(--mut);font-variant-numeric:tabular-nums}
        .cp{background:none;padding:2px 6px;color:var(--mut)}
        .hint{color:var(--mut);line-height:1.4}
        .off{color:#E5484D}
    `;

    function ensurePanelHost() {
        if (bd.panelHost && bd.panelHost.isConnected) {
            document.documentElement.append(bd.panelHost); // keep above the extension UI
            return bd.panelHost.shadowRoot;
        }
        bd.panelHost = h("div", { style: `position:fixed;inset:0;pointer-events:none;z-index:${Z};` });
        bd.panelHost.attachShadow({ mode: "open" }).append(h("style", { text: PANEL_CSS }));
        document.documentElement.append(bd.panelHost);
        return bd.panelHost.shadowRoot;
    }

    function closePanel(name) {
        const root = bd.panelHost && bd.panelHost.shadowRoot;
        const p = root && root.querySelector(`[data-panel="${name}"]`);
        p && p.remove();
    }

    function makePanel(name, title, offset) {
        const root = ensurePanelHost();
        closePanel(name);
        const close = h("button", { class: "x", text: "×", title: T("Close", "Đóng"), onclick: () => api.toggle(name, false) });
        const hd = h("div", { class: "hd" }, h("span", { text: title }), close);
        const p = h("div", { class: "p", "data-panel": name, style: `top:${16 + offset}px` }, hd);
        // drag the panel by its header
        hd.addEventListener("pointerdown", (e) => {
            if (e.target === close) return;
            const r = p.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
            const mv = (ev) => {
                p.style.left = `${Math.max(0, ev.clientX - ox)}px`;
                p.style.top = `${Math.max(0, ev.clientY - oy)}px`;
                p.style.right = "auto";
            };
            const up = () => (removeEventListener("pointermove", mv, true), removeEventListener("pointerup", up, true));
            addEventListener("pointermove", mv, true);
            addEventListener("pointerup", up, true);
        });
        // keep panel events away from the inspector
        for (const t of ["click", "mousedown", "pointerdown", "mousemove", "keydown"]) p.addEventListener(t, (e) => e.stopPropagation());
        root.append(p);
        return p;
    }

    Object.assign(bd, {
        VI, T, Z, state, api,
        sx, sy, isOurs, isDock, isTyping, extHosts, ownNodes, elementAt,
        h, toHex, copy, swallow,
        ensureLayer, render,
        makePanel, closePanel,
    });
})();
