// Guides dragged from the rulers, area measure box (drag, arrow keys, typed values, edge guides, color).
(() => {
    "use strict";
    const bd = globalThis.__bd;
    if (!bd || bd.mods["measure"]) return;
    bd.mods["measure"] = true;
    const { T, state, h, sx, sy, swallow, render, makePanel, isTyping, isOurs, isDock, elementAt } = bd;

    const SNAP = 6;
    const RULER = 20;
    const anyPointerTool = () => !globalThis.__bdViewerOpen && (state.active.measureArea || state.active.guides);

    // measure box as page-coordinate edges
    function mRect() {
        const m = state.measure;
        return { l: Math.min(m.x1, m.x2), t: Math.min(m.y1, m.y2), r: Math.max(m.x1, m.x2), b: Math.max(m.y1, m.y2) };
    }
    function setMRect({ l, t, r, b }) {
        state.measure = { x1: l, y1: t, x2: Math.max(l, r), y2: Math.max(t, b) };
    }
    const pageW = () => document.documentElement.scrollWidth;
    const pageH = () => document.documentElement.scrollHeight;

    chrome.storage.local
        .get({ bdMeasureColor: state.measureColor, bdMeasureGuides: state.measureGuides })
        .then((v) => ((state.measureColor = v.bdMeasureColor), (state.measureGuides = v.bdMeasureGuides)))
        .catch(() => {});
    const saveMeasurePrefs = () => chrome.storage.local.set({ bdMeasureColor: state.measureColor, bdMeasureGuides: state.measureGuides }).catch(() => {});

    bd.drawers.push((c, { X, Y, W, H }) => {
        if (state.active.guides) {
            c.append(h("div", { class: "zone", style: `left:0;top:0;width:100%;height:${RULER}px` }));
            c.append(h("div", { class: "zone", style: `left:0;top:0;width:${RULER}px;height:100%` }));
        }

        // guides + distances
        const hs = state.guides.filter((g) => g.axis === "h").map((g) => g.pos).sort((a, b) => a - b);
        const vs = state.guides.filter((g) => g.axis === "v").map((g) => g.pos).sort((a, b) => a - b);
        for (const g of state.guides) {
            const hot = state.drag && state.drag.guide === g;
            const p = g.axis === "h" ? g.pos - Y : g.pos - X;
            c.append(h("div", { class: `g ${g.axis}${hot ? " hot" : ""}`, style: g.axis === "h" ? `top:${p}px` : `left:${p}px` }));
            c.append(
                h("div", {
                    class: "lbl",
                    text: Math.round(g.pos),
                    style: g.axis === "h" ? `top:${p}px;left:${RULER + 22}px` : `left:${p}px;top:${RULER + 10}px`,
                })
            );
        }
        for (let i = 1; i < hs.length; i++) {
            const mid = (hs[i] + hs[i - 1]) / 2 - Y;
            c.append(h("div", { class: "lbl d", text: Math.round(hs[i] - hs[i - 1]), style: `top:${mid}px;left:${W / 2}px` }));
        }
        for (let i = 1; i < vs.length; i++) {
            const mid = (vs[i] + vs[i - 1]) / 2 - X;
            c.append(h("div", { class: "lbl d", text: Math.round(vs[i] - vs[i - 1]), style: `left:${mid}px;top:${H / 2}px` }));
        }

        // area measure
        if (state.measure) {
            const { l, t, r, b } = mRect();
            const w = r - l, hh = b - t;
            if (state.measureGuides)
                c.append(
                    h("div", { class: "mg h", style: `top:${t - Y}px` }),
                    h("div", { class: "mg h", style: `top:${b - Y}px` }),
                    h("div", { class: "mg v", style: `left:${l - X}px` }),
                    h("div", { class: "mg v", style: `left:${r - X}px` })
                );
            const box = h("div", { class: "m", style: `left:${l - X}px;top:${t - Y}px;width:${w}px;height:${hh}px` });
            box.append(h("div", { class: "lbl", text: `${Math.round(w)} × ${Math.round(hh)}`, style: `left:50%;top:${hh + 14}px` }));
            box.append(h("div", { class: "lbl d", text: `x ${Math.round(l)}  y ${Math.round(t)}`, style: `left:0;top:-14px;transform:translate(0,-50%)` }));
            c.append(box);
        }

        syncMeasureInputs();
    });

    // ---------- pointer handling (registered before content.js so it runs first) ----------
    function nearGuide(cx, cy) {
        let best = null, bd = 5;
        for (const g of state.guides) {
            const d = g.axis === "h" ? Math.abs(g.pos - sy() - cy) : Math.abs(g.pos - sx() - cx);
            if (d < bd) (bd = d), (best = g);
        }
        return best;
    }

    const MEASURE_CORNER = 10;
    function hitMeasure(cx, cy) {
        if (!state.measure) return null;
        const m = state.measure;
        const l = Math.min(m.x1, m.x2) - sx(), t = Math.min(m.y1, m.y2) - sy();
        const r = Math.max(m.x1, m.x2) - sx(), b = Math.max(m.y1, m.y2) - sy();
        const near = (v, p) => Math.abs(v - p) <= MEASURE_CORNER;
        const nearL = near(cx, l), nearR = near(cx, r), nearT = near(cy, t), nearB = near(cy, b);
        if (nearL && nearT) return { mode: "resize", corner: "tl" };
        if (nearR && nearT) return { mode: "resize", corner: "tr" };
        if (nearL && nearB) return { mode: "resize", corner: "bl" };
        if (nearR && nearB) return { mode: "resize", corner: "br" };
        if (cx > l && cx < r && cy > t && cy < b) return { mode: "move" };
        return null;
    }

    function snapGuide(g, cx, cy) {
        let pos = g.axis === "h" ? cy + sy() : cx + sx();
        const el = elementAt(cx, cy);
        if (el) {
            const r = el.getBoundingClientRect();
            const edges = g.axis === "h" ? [r.top, r.bottom, r.top + r.height / 2].map((v) => v + sy()) : [r.left, r.right, r.left + r.width / 2].map((v) => v + sx());
            for (const e of edges) if (Math.abs(e - pos) <= SNAP) { pos = e; break; }
        }
        g.pos = Math.round(pos);
    }

    let suppressClick = false;

    addEventListener(
        "pointerdown",
        (e) => {
            if (!anyPointerTool() || e.button !== 0 || isOurs(e) || isDock(e)) return;
            const { clientX: cx, clientY: cy } = e;
            if (state.active.guides) {
                const g = nearGuide(cx, cy);
                if (g) {
                    state.drag = { guide: g };
                } else if (cy < RULER || cx < RULER) {
                    // dragging out from the top (horizontal-looking) ruler strip makes a vertical guide, and vice versa
                    const ng = { axis: cy < RULER ? "v" : "h", pos: cy < RULER ? cx + sx() : cy + sy() };
                    state.guides.push(ng);
                    state.drag = { guide: ng };
                }
            }
            if (!state.drag && state.active.measureArea) {
                const hit = hitMeasure(cx, cy);
                if (hit) {
                    state.drag = { measureEdit: hit, start: { x: cx, y: cy }, orig: { ...state.measure } };
                } else {
                    state.drag = { measure: true };
                    state.measure = { x1: cx + sx(), y1: cy + sy(), x2: cx + sx(), y2: cy + sy() };
                }
            }
            if (state.drag) {
                suppressClick = true;
                swallow(e);
                render();
            }
        },
        true
    );

    addEventListener(
        "pointermove",
        (e) => {
            if (!state.drag) {
                if (globalThis.__bdViewerOpen) return;
                if (state.active.guides && bd.layer) document.documentElement.style.cursor = nearGuide(e.clientX, e.clientY) ? "move" : "";
                else if (state.active.measureArea && state.measure) {
                    const hit = hitMeasure(e.clientX, e.clientY);
                    document.documentElement.style.cursor = hit ? (hit.mode === "move" ? "move" : hit.corner === "tl" || hit.corner === "br" ? "nwse-resize" : "nesw-resize") : "";
                }
                return;
            }
            swallow(e);
            if (state.drag.guide) snapGuide(state.drag.guide, e.clientX, e.clientY);
            else if (state.drag.measure) (state.measure.x2 = e.clientX + sx()), (state.measure.y2 = e.clientY + sy());
            else if (state.drag.measureEdit) {
                const { measureEdit: hit, start, orig } = state.drag;
                if (hit.mode === "move") {
                    const dx = e.clientX - start.x, dy = e.clientY - start.y;
                    state.measure.x1 = orig.x1 + dx;
                    state.measure.x2 = orig.x2 + dx;
                    state.measure.y1 = orig.y1 + dy;
                    state.measure.y2 = orig.y2 + dy;
                } else {
                    let l = Math.min(orig.x1, orig.x2), r = Math.max(orig.x1, orig.x2);
                    let t = Math.min(orig.y1, orig.y2), b = Math.max(orig.y1, orig.y2);
                    const px = e.clientX + sx(), py = e.clientY + sy();
                    if (hit.corner.includes("l")) l = px;
                    if (hit.corner.includes("r")) r = px;
                    if (hit.corner.includes("t")) t = py;
                    if (hit.corner.includes("b")) b = py;
                    state.measure.x1 = l;
                    state.measure.x2 = r;
                    state.measure.y1 = t;
                    state.measure.y2 = b;
                }
            }
            render();
        },
        true
    );
    // block hover inspection while dragging
    addEventListener("mousemove", (e) => state.drag && e.stopImmediatePropagation(), true);

    addEventListener(
        "pointerup",
        (e) => {
            if (!state.drag) return;
            swallow(e);
            const g = state.drag.guide;
            // dropping a guide back onto the ruler it came from removes it
            if (g && (g.axis === "v" ? e.clientY < RULER : e.clientX < RULER)) state.guides = state.guides.filter((x) => x !== g);
            if (state.drag.measure) {
                const m = state.measure;
                if (Math.abs(m.x2 - m.x1) < 2 && Math.abs(m.y2 - m.y1) < 2) state.measure = null;
            }
            state.drag = null;
            // the trailing click (if any) fires right after pointerup; never let the flag linger
            setTimeout(() => (suppressClick = false), 50);
            render();
        },
        true
    );

    for (const type of ["mousedown", "mouseup", "click"]) {
        addEventListener(
            type,
            (e) => {
                if (!suppressClick) return;
                swallow(e);
                if (type === "click") suppressClick = false;
            },
            true
        );
    }

    addEventListener(
        "dblclick",
        (e) => {
            if (globalThis.__bdViewerOpen || !state.active.guides || isOurs(e)) return;
            const g = nearGuide(e.clientX, e.clientY);
            if (g) {
                swallow(e);
                state.guides = state.guides.filter((x) => x !== g);
                render();
            }
        },
        true
    );

    addEventListener(
        "keydown",
        (e) => {
            if (isTyping(e) || globalThis.__bdViewerOpen) return;
            if (e.key === "Escape" && state.measure) {
                state.measure = null;
                render();
                return swallow(e);
            }
            // measure box: arrows move, +Ctrl expand, +Ctrl+Alt shrink (Shift: 10px). Alt+Shift alone is left to sibling selection.
            if (state.active.measureArea && state.measure && e.key.startsWith("Arrow") && !e.metaKey && (e.ctrlKey || !e.altKey)) {
                const s = e.shiftKey ? 10 : 1;
                const k = e.key.slice(5);
                const m = mRect();
                if (!e.ctrlKey) {
                    const dx = k === "Left" ? -s : k === "Right" ? s : 0, dy = k === "Up" ? -s : k === "Down" ? s : 0;
                    (m.l += dx), (m.r += dx), (m.t += dy), (m.b += dy);
                } else {
                    const d = e.altKey ? -s : s;
                    if (k === "Left") m.l -= d;
                    if (k === "Right") m.r += d;
                    if (k === "Up") m.t -= d;
                    if (k === "Down") m.b += d;
                }
                setMRect(m);
                render();
                return swallow(e);
            }
        },
        true
    );

    // ---------- measure panel ----------
    let mInputs = null;
    const MFIELDS = ["w", "h", "l", "t", "r", "b"];

    function syncMeasureInputs() {
        if (!mInputs || !mInputs.w.isConnected) return;
        const m = state.measure && mRect();
        // r/b are distances to the page's right/bottom edge
        const v = m && { w: m.r - m.l, h: m.b - m.t, l: m.l, t: m.t, r: pageW() - m.r, b: pageH() - m.b };
        for (const k of MFIELDS) if (mInputs[k] !== bd.panelHost.shadowRoot.activeElement) mInputs[k].value = v ? Math.round(v[k]) : "";
    }

    function applyMeasureInput(k, val) {
        if (!state.measure) {
            // typing before drawing: start from a 100×100 box in the middle of the viewport
            const x = Math.round(sx() + innerWidth / 2 - 50), y = Math.round(sy() + innerHeight / 2 - 50);
            state.measure = { x1: x, y1: y, x2: x + 100, y2: y + 100 };
        }
        const m = mRect();
        if (k === "w") m.r = m.l + val;
        if (k === "h") m.b = m.t + val;
        if (k === "l") (m.r += val - m.l), (m.l = val);
        if (k === "t") (m.b += val - m.t), (m.t = val);
        if (k === "r") m.r = pageW() - val;
        if (k === "b") m.b = pageH() - val;
        setMRect(m);
        render();
    }

    function openMeasurePanel() {
        const p = makePanel("measureArea", T("Measure", "Đo vùng"), 0);
        const num = (k) => {
            const i = h("input", { type: "number", step: "1" });
            i.addEventListener("input", () => i.value !== "" && applyMeasureInput(k, Number(i.value)));
            // native arrows step 1; Shift+arrows step 10 like the old ruler
            i.addEventListener("keydown", (e) => {
                if (!e.shiftKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
                e.preventDefault();
                i.value = Number(i.value || 0) + (e.key === "ArrowUp" ? 10 : -10);
                applyMeasureInput(k, Number(i.value));
            });
            return i;
        };
        mInputs = Object.fromEntries(MFIELDS.map((k) => [k, num(k)]));
        const color = h("input", { type: "color", value: state.measureColor, title: T("Box color", "Màu khung đo") });
        color.addEventListener("input", () => ((state.measureColor = color.value), saveMeasurePrefs(), render()));
        const guides = h("button", {
            text: T("Edge guides", "Đường gióng"),
            title: T("Extend the box edges across the page", "Kéo dài các cạnh khung ra toàn trang"),
            onclick: () => ((state.measureGuides = !state.measureGuides), guides.classList.toggle("on", state.measureGuides), saveMeasurePrefs(), render()),
        });
        guides.classList.toggle("on", state.measureGuides);
        const clear = h("button", { text: T("Clear", "Xoá khung"), onclick: () => ((state.measure = null), render()) });
        p.append(
            h(
                "div",
                { class: "bd" },
                h("div", { class: "row" }, h("label", { text: "W / H" }), mInputs.w, mInputs.h),
                h("div", { class: "row" }, h("label", { text: T("Left / Top", "Trái / Trên") }), mInputs.l, mInputs.t),
                h("div", { class: "row" }, h("label", { text: T("To right / bottom edge", "Cách mép phải / dưới") }), mInputs.r, mInputs.b),
                h("div", { class: "row" }, color, guides, clear),
                h("div", {
                    class: "hint",
                    text: T(
                        "Drag to draw. Arrows move 1px (Shift: 10px), Ctrl+arrows expand, Ctrl+Alt+arrows shrink. Shift+↑/↓ in a field steps 10. Esc clears.",
                        "Kéo chuột để vẽ. Mũi tên dịch 1px (Shift: 10px), Ctrl+mũi tên nới rộng, Ctrl+Alt+mũi tên thu hẹp. Trong ô số, Shift+↑/↓ tăng giảm 10. Esc để xoá."
                    ),
                })
            )
        );
        syncMeasureInputs();
    }

    Object.assign(bd, { openMeasurePanel });
})();
