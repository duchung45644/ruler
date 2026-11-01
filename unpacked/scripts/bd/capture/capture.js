// Capture: mode bar (area / visible / full page), frozen-screen area select with copy / save / markup, shared capture helpers.
(() => {
    "use strict";
    const bd = globalThis.__bd;
    if (!bd || bd.mods["capture"]) return;
    bd.mods["capture"] = true;
    const { T, Z, h, swallow } = bd;

    // same tokens as PANEL_CSS so the capture UI matches the dock and the tool panels
    const CAPTURE_CSS = `
        :host{all:initial;--bg:#fff;--fg:#1f1f1f;--mut:#74777c;--line:rgba(0,0,0,.08);--sf:#f2f2f2;--acc:#5B5BF0}
        @media (prefers-color-scheme:dark){:host{--bg:#1f1f1f;--fg:#eee;--mut:#a5a8ad;--line:rgba(255,255,255,.1);--sf:#2c2c2c}}
        *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
        .bar{position:fixed;top:16px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:2px;padding:5px;background:var(--bg);color:var(--fg);border-radius:14px;box-shadow:0 0 0 1px var(--line),0 8px 24px rgba(0,0,0,.18);pointer-events:auto;font-size:12px;font-weight:500;white-space:nowrap;animation:bd-in .15s ease}
        @keyframes bd-in{from{opacity:0;translate:0 -4px}}
        button{display:inline-flex;align-items:center;gap:6px;height:32px;font:inherit;color:inherit;background:none;border:0;border-radius:9px;padding:0 10px;cursor:pointer}
        button:hover{background:var(--sf)}
        button.on{background:var(--acc);color:#fff}
        button:disabled{opacity:.5;cursor:default}
        button.x{width:32px;padding:0;justify-content:center;color:var(--mut)}
        .sep{width:1px;height:20px;background:var(--line);margin:0 4px}
        svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
        .frz{position:fixed;left:0;top:0;pointer-events:none}
        .shade{position:fixed;inset:0;pointer-events:auto;cursor:crosshair;background:rgba(0,0,0,.45)}
        .shade.has{background:none}
        .hint{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:8px 14px;border-radius:10px;background:var(--bg);color:var(--fg);box-shadow:0 0 0 1px var(--line),0 8px 24px rgba(0,0,0,.18);font-size:12px;pointer-events:none}
        .sel{position:fixed;outline:2px dashed #fff;box-shadow:0 0 0 100vmax rgba(0,0,0,.45);pointer-events:none}
        .hd{position:absolute;width:11px;height:11px;margin:-5.5px 0 0 -5.5px;border-radius:50%;background:#fff;border:1.5px solid #222}
        .selbar{position:fixed;transform:none;top:auto;left:auto}
        .ed{position:fixed;inset:0;background:rgba(0,0,0,.72);pointer-events:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px 0}
        @keyframes bd-fade{from{opacity:0}}
        .ed .bar{position:static;transform:none;margin-top:14px;flex-shrink:0}
        .stage{flex:0 1 auto;min-height:0;width:100%;overflow:auto;display:flex;justify-content:center;align-items:flex-start;padding:0 16px}
        canvas{display:block;box-shadow:0 8px 32px rgba(0,0,0,.4);border-radius:10px;background:#fff}
        canvas.mark{cursor:crosshair}
        canvas.mark.typing{cursor:text}
        canvas.prev{position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;box-shadow:none;border-radius:0;background:none}
        .note{max-width:min(720px,calc(100vw - 32px));margin-bottom:12px;padding:8px 12px;border-radius:10px;background:var(--bg);color:var(--fg);box-shadow:inset 3px 0 0 #F0A03C,0 0 0 1px var(--line);font-size:12px;line-height:1.4;flex-shrink:0}
        .txt{position:fixed;min-width:40px;field-sizing:content;padding:0 2px;margin:0;border:0;outline:1.5px dashed var(--acc);background:transparent;font-weight:600;line-height:1.2;pointer-events:auto}
        .ed .bar{flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 32px)}
        .sw{width:22px;height:22px;padding:0;border-radius:50%;box-shadow:inset 0 0 0 1px var(--line)}
        .sw.on{background-clip:content-box;padding:2px;box-shadow:0 0 0 2px var(--acc)}
        .sw:hover{filter:brightness(.95)}
        .tools{display:flex;align-items:center;gap:4px}
        .tools button.on:not(.sw){background:var(--sf);color:var(--fg);box-shadow:inset 0 0 0 1.5px var(--acc)}
    `;
    const ICONS = {
        area: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
        screen: '<rect x="3" y="5" width="18" height="14" rx="2"/>',
        full: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h6"/>',
        element: '<path d="M5 4l6 16 2.4-6.6L20 11z"/>',
        copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
        save: '<path d="M5 4h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M8 4v5h7M8 20v-6h8v6"/>',
        markup: '<path d="M15 5l4 4L8 20H4v-4z"/>',
        arrow: '<path d="M5 19L19 5M10 5h9v9"/>',
        rect: '<rect x="4" y="6" width="16" height="12" rx="1.5"/>',
        hl: '<path d="M4 20h16"/><path d="M14 4l5 5-8 8H6v-5z"/>',
        text: '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
        undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    };

    let capHost = null;
    let capHooks = { hideUi() {}, showUi() {} };
    let capKey = null; // keydown handler of the open capture UI

    function icon(name) {
        const s = h("span", { style: "display:inline-flex" });
        s.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[name]}</svg>`;
        return s;
    }
    const capBtn = (name, text, onclick) => h("button", { onclick }, icon(name), text ? h("span", { text }) : null);

    function onCapKeydown(e) {
        if (!capHost) return;
        if (e.composedPath()[0] instanceof HTMLInputElement) return; // typing a text label: Esc/Enter belong to the input
        if (e.key === "Escape") return swallow(e), closeCapture();
        capKey && capKey(e);
    }

    function capRoot(keyHandler) {
        capHost && capHost.remove();
        capHost = h("div", { style: `all:initial;position:fixed;inset:0;z-index:${Z};pointer-events:none;` });
        capHost.attachShadow({ mode: "open" }).append(h("style", { text: CAPTURE_CSS }));
        document.documentElement.append(capHost);
        capKey = keyHandler || null;
        globalThis.__bdViewerOpen = true;
        removeEventListener("keydown", onCapKeydown, true);
        addEventListener("keydown", onCapKeydown, true);
        return capHost.shadowRoot;
    }

    // the dock / inspector / tool panels stay hidden for the whole capture session (no flicker between steps)
    let capUiHidden = false;
    function hideCapUi() {
        if (capUiHidden) return;
        capUiHidden = true;
        capHooks.hideUi();
        bd.panelHost && (bd.panelHost.style.display = "none");
    }
    function showCapUi() {
        if (!capUiHidden) return;
        capUiHidden = false;
        capHooks.showUi();
        bd.panelHost && (bd.panelHost.style.display = "");
    }

    function closeCapture() {
        showCapUi();
        if (!capHost) return;
        capHost.remove();
        capHost = capKey = null;
        globalThis.__bdViewerOpen = false;
        removeEventListener("keydown", onCapKeydown, true);
    }

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const loadImg = (src) =>
        new Promise((res, rej) => {
            const i = new Image();
            i.onload = () => res(i);
            i.onerror = rej;
            i.src = src;
        });
    const toBlob = (c) => new Promise((r) => c.toBlob(r, "image/png"));

    // the background's "download_image" action returns captureVisibleTab as a data URL (it doesn't download anything)
    function grabVisible() {
        return new Promise((res, rej) =>
            chrome.runtime.sendMessage({ target: "background", action: "download_image", pageUrl: location.href }, (r) =>
                chrome.runtime.lastError || !r || !r.success ? rej(new Error("capture failed")) : res(r.dataUrl)
            )
        );
    }

    // hide every extension UI (dock, inspector, our panels and capture UI) while fn grabs the tab
    async function withHiddenUi(fn) {
        const wasOpen = globalThis.__bdViewerOpen;
        globalThis.__bdViewerOpen = true;
        const wasHidden = capUiHidden;
        capHost && (capHost.style.display = "none");
        hideCapUi();
        await frames();
        try {
            return await fn();
        } finally {
            wasHidden || showCapUi();
            capHost && (capHost.style.display = "");
            globalThis.__bdViewerOpen = wasOpen;
        }
    }

    async function copyCanvas(c) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": toBlob(c) })]);
    }

    async function saveCanvas(c) {
        const url = URL.createObjectURL(await toBlob(c));
        const a = h("a", { href: url, download: `${location.hostname || "screenshot"}-${new Date().toISOString().replace(/[:.]/g, "-")}.png` });
        document.documentElement.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    }

    // run a copy/save action and show the result on the button itself
    async function capAction(btn, fn, doneText, close) {
        const label = btn.lastChild.textContent;
        btn.disabled = true;
        try {
            await fn();
            btn.lastChild.textContent = doneText;
            close ? setTimeout(closeCapture, 700) : setTimeout(() => ((btn.lastChild.textContent = label), (btn.disabled = false)), 1200);
        } catch (err) {
            btn.lastChild.textContent = T("Failed", "Lỗi");
            setTimeout(() => ((btn.lastChild.textContent = label), (btn.disabled = false)), 1500);
        }
    }

    async function openCaptureBar(hooks) {
        capHooks = Object.assign({ hideUi() {}, showUi() {} }, hooks);
        // grab the screen once up front and freeze it: area copy/save/markup and "visible area" all cut from this shot
        globalThis.__bdViewerOpen = true;
        hideCapUi();
        await frames();
        const snap = await grabVisible().catch(() => null);
        if (!snap) return (showCapUi(), (globalThis.__bdViewerOpen = false));
        const root = capRoot();
        const pick = (fn) => () => (closeCapture(), fn());
        const areaB = capBtn("area", T("Capture area", "Chụp vùng"));
        areaB.classList.add("on");
        const modeBar = h(
            "div",
            { class: "bar" },
            hooks && hooks.element ? capBtn("element", T("Selected element", "Phần tử đang chọn"), pick(hooks.element)) : null,
            areaB,
            capBtn("screen", T("Capture visible area", "Chụp màn hình"), () => bd.openCaptureEditor(snap)),
            capBtn("full", T("Capture full page", "Chụp cả trang"), () => (closeCapture(), bd.captureFullPage(snap))),
            h("div", { class: "sep" }),
            h("button", { class: "x", text: "✕", title: T("Close (Esc)", "Đóng (Esc)"), onclick: closeCapture })
        );
        // area mode is active right away: drag immediately, or pick another mode first.
        // Once an area is drawn the mode bar goes away, like Edge.
        startAreaSelect(root, snap, () => modeBar.remove());
        root.append(modeBar);
    }

    function startAreaSelect(root, snap, onDrawn) {
        const frozen = h("img", { class: "frz", src: snap, alt: "", style: `width:${innerWidth}px;height:${innerHeight}px` });
        const shade = h("div", { class: "shade" });
        const hint = h("div", { class: "hint", text: T("Drag to select an area · Esc to cancel", "Kéo chuột để chọn vùng · Esc để huỷ") });
        // 8 round handles, just visual — hit-testing is done on the shade
        const sel = h("div", { class: "sel", style: "display:none" }, ...["0 0", "50% 0", "100% 0", "0 50%", "100% 50%", "0 100%", "50% 100%", "100% 100%"].map((p) => {
            const [x, y] = p.split(" ");
            return h("div", { class: "hd", style: `left:${x};top:${y}` });
        }));
        let r = null;

        // crop the selected viewport rect out of a fresh tab capture
        const crop = async () => {
            const img = await loadImg(snap);
            const k = img.width / innerWidth;
            const c = h("canvas");
            c.width = Math.max(1, Math.round(r.w * k));
            c.height = Math.max(1, Math.round(r.h * k));
            c.getContext("2d").drawImage(img, Math.round(r.x * k), Math.round(r.y * k), c.width, c.height, 0, 0, c.width, c.height);
            return c;
        };
        const copyB = capBtn("copy", T("Copy", "Copy"));
        const saveB = capBtn("save", T("Save", "Lưu"));
        const markB = capBtn("markup", T("Markup capture", "Vẽ chú thích"));
        copyB.onclick = () => capAction(copyB, async () => copyCanvas(await crop()), T("Copied", "Đã copy"), true);
        saveB.onclick = () => capAction(saveB, async () => saveCanvas(await crop()), T("Saved", "Đã lưu"), true);
        markB.onclick = async () => {
            const c = await crop().catch(() => null);
            c && bd.openCaptureEditor(c, true);
        };
        const bar = h("div", { class: "bar selbar", style: "display:none" }, copyB, saveB, markB, h("div", { class: "sep" }), h("button", { class: "x", text: "✕", title: T("Close (Esc)", "Đóng (Esc)"), onclick: closeCapture }));

        const placeBar = () => {
            bar.style.display = "flex";
            const bw = bar.offsetWidth, bh = bar.offsetHeight;
            // below the selection, else above, else inside its bottom edge
            let top = r.y + r.h + 8;
            if (top + bh > innerHeight - 8) top = r.y - bh - 8 >= 8 ? r.y - bh - 8 : r.y + r.h - bh - 8;
            bar.style.top = `${Math.max(8, top)}px`;
            bar.style.left = `${Math.min(Math.max(8, r.x + r.w - bw), innerWidth - bw - 8)}px`;
        };

        // like the measure tool: drag inside to move, an edge/corner to resize, outside to draw a new area
        const EDGE = 8;
        const CURSORS = { t: "ns-resize", b: "ns-resize", l: "ew-resize", r: "ew-resize", tl: "nwse-resize", br: "nwse-resize", tr: "nesw-resize", bl: "nesw-resize", move: "move" };
        const hitSel = (x, y) => {
            if (!r) return null;
            const inX = x > r.x - EDGE && x < r.x + r.w + EDGE, inY = y > r.y - EDGE && y < r.y + r.h + EDGE;
            let s = "";
            if (inX && Math.abs(y - r.y) <= EDGE) s += "t";
            else if (inX && Math.abs(y - r.y - r.h) <= EDGE) s += "b";
            if (inY && Math.abs(x - r.x) <= EDGE) s += "l";
            else if (inY && Math.abs(x - r.x - r.w) <= EDGE) s += "r";
            if (s) return s;
            return x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h ? "move" : null;
        };
        const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
        shade.addEventListener("pointermove", (e) => (shade.style.cursor = CURSORS[hitSel(e.clientX, e.clientY)] || "crosshair"));

        shade.addEventListener("pointerdown", (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            const x0 = e.clientX, y0 = e.clientY;
            const mode = hitSel(x0, y0), o = r && { ...r };
            bar.style.display = "none";
            hint.remove();
            shade.setPointerCapture(e.pointerId);
            const mv = (ev) => {
                const cx = clamp(ev.clientX, 0, innerWidth), cy = clamp(ev.clientY, 0, innerHeight);
                if (!mode) r = { x: Math.min(x0, cx), y: Math.min(y0, cy), w: Math.abs(cx - x0), h: Math.abs(cy - y0) };
                else if (mode === "move") r = { ...o, x: clamp(o.x + cx - x0, 0, innerWidth - o.w), y: clamp(o.y + cy - y0, 0, innerHeight - o.h) };
                else {
                    let l = o.x, t = o.y, rt = o.x + o.w, b = o.y + o.h;
                    if (mode.includes("l")) l = cx;
                    if (mode.includes("r")) rt = cx;
                    if (mode.includes("t")) t = cy;
                    if (mode.includes("b")) b = cy;
                    r = { x: Math.min(l, rt), y: Math.min(t, b), w: Math.abs(rt - l), h: Math.abs(b - t) };
                }
                shade.classList.add("has");
                sel.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`;
                onDrawn && r.w >= 4 && r.h >= 4 && (onDrawn(), (onDrawn = null));
            };
            const up = () => {
                shade.removeEventListener("pointermove", mv);
                shade.removeEventListener("pointerup", up);
                if (!r || r.w < 4 || r.h < 4) {
                    r = null;
                    shade.classList.remove("has");
                    sel.style.display = "none";
                    return;
                }
                placeBar();
            };
            shade.addEventListener("pointermove", mv);
            shade.addEventListener("pointerup", up);
        });
        root.append(frozen, shade, hint, sel, bar);
    }

    Object.assign(bd, { CAPTURE_CSS, capRoot, closeCapture, capBtn, capAction, withHiddenUi, grabVisible, loadImg, frames, sleep, copyCanvas, saveCanvas, openCaptureBar });
})();
