// Page styles audit: colors, fonts and spacing used on the page; click a row to highlight its elements.
(() => {
    "use strict";
    const bd = globalThis.__bd;
    if (!bd || bd.mods["audit"]) return;
    bd.mods["audit"] = true;
    const { T, state, h, toHex, copy, render, makePanel, extHosts, ownNodes } = bd;

    function scanPage() {
        const colors = new Map(), fonts = new Map(), spacing = new Map();
        const add = (map, key, el, extra) => {
            let v = map.get(key);
            if (!v) map.set(key, (v = { key, els: new Set(), ...extra }));
            v.els.add(el);
        };
        const skip = ownNodes();
        const all = document.body ? [document.documentElement, document.body, ...document.body.getElementsByTagName("*")] : [];
        let n = 0;
        for (const el of all) {
            if (n++ > 8000) break;
            if (skip.has(el) || el.closest("[data-id]") && extHosts().includes(el.closest("[data-id]"))) continue;
            if (["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "META", "LINK", "BR"].includes(el.tagName)) continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === "hidden" || cs.display === "none") continue;
            const hasText = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
            if (hasText) {
                const c = toHex(cs.color);
                c && add(colors, c, el, { uses: new Set() }), c && colors.get(c).uses.add("text");
                const fam = cs.fontFamily.split(",")[0].replace(/["']/g, "").trim();
                const round2 = (v) => Math.round(v * 100) / 100;
                const fsize = round2(parseFloat(cs.fontSize));
                const lh = cs.lineHeight === "normal" ? "normal" : round2(parseFloat(cs.lineHeight)) + "px";
                // one row per font family — the exact sizes/weights/line-heights it's used with
                // are tracked as a set and shown in the row's tooltip instead of splitting into rows
                let fv = fonts.get(fam);
                fv || fonts.set(fam, (fv = { key: fam, els: new Set(), size: 0, variants: new Set() }));
                fv.els.add(el);
                fv.variants.add(`${fsize}px / ${cs.fontWeight} / ${lh}`);
                fv.size = Math.max(fv.size, fsize);
            }
            const bg = toHex(cs.backgroundColor);
            bg && (add(colors, bg, el, { uses: new Set() }), colors.get(bg).uses.add("bg"));
            if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none") {
                const b = toHex(cs.borderTopColor);
                b && (add(colors, b, el, { uses: new Set() }), colors.get(b).uses.add("border"));
            }
            if (el instanceof SVGElement) {
                for (const prop of ["fill", "stroke"]) {
                    const v = cs[prop];
                    if (v && v.startsWith("rgb")) {
                        const c = toHex(v);
                        c && (add(colors, c, el, { uses: new Set() }), colors.get(c).uses.add(prop));
                    }
                }
            }
            for (const prop of ["marginTop", "marginRight", "marginBottom", "marginLeft", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "rowGap", "columnGap"]) {
                const v = parseFloat(cs[prop]);
                if (v > 0) add(spacing, Math.round(v * 10) / 10, el);
            }
        }
        const sort = (m) => [...m.values()].sort((a, b) => b.els.size - a.els.size);
        return {
            colors: sort(colors),
            fonts: [...fonts.values()].sort((a, b) => b.size - a.size || b.els.size - a.els.size),
            spacing: [...spacing.values()].sort((a, b) => a.key - b.key),
        };
    }

    function openAuditPanel() {
        const p = makePanel("styleAudit", T("Page styles", "Màu & font của trang"), 0);
        state.audit = scanPage();
        let tab = "colors", selected = null;
        const tabs = h("div", { class: "tabs" });
        const body = h("div", { class: "bd", style: "gap:2px" });
        const rescan = h("button", { class: "cp", text: "↻", title: T("Rescan", "Quét lại"), onclick: () => ((state.audit = scanPage()), (selected = null), (state.highlights = []), paint(), render()) });
        const copyAll = h("button", {
            class: "cp",
            text: "⧉ " + T("All", "Tất cả"),
            title: T("Copy all rows in this tab", "Copy toàn bộ danh sách của tab này"),
            onclick: () => {
                const list = state.audit[tab];
                const lines = list.map((it) => (tab === "spacing" ? `${it.key}px` : it.key));
                copy(lines.join("\n"));
            },
        });
        p.querySelector(".hd").insertBefore(copyAll, p.querySelector(".hd .x"));
        p.querySelector(".hd").insertBefore(rescan, p.querySelector(".hd .x"));

        const names = { colors: T("Colors", "Màu"), fonts: T("Typography", "Font chữ"), spacing: T("Spacing", "Khoảng cách") };
        const paint = () => {
            tabs.replaceChildren(
                ...Object.keys(names).map((k) =>
                    h("button", { class: k === tab ? "on" : "", text: `${names[k]} (${state.audit[k].length})`, onclick: () => ((tab = k), (selected = null), (state.highlights = []), paint(), render()) })
                )
            );
            body.replaceChildren();
            const list = state.audit[tab];
            if (!list.length) body.append(h("div", { class: "hint", text: T("Nothing found.", "Không tìm thấy.") }));
            if (tab === "spacing") {
                const off = list.filter((s) => s.key % 4 !== 0).length;
                off && body.append(h("div", { class: "hint", style: "padding:0 8px 6px", text: T(`${off} value(s) are not multiples of 4px (shown in red).`, `${off} giá trị không phải bội số của 4px (tô đỏ).`) }));
            }
            for (const it of list) {
                const label = tab === "spacing" ? `${it.key}px` : it.key;
                const row = h(
                    "div",
                    {
                        class: "item" + (selected === it ? " sel" : ""),
                        title: T("Click to highlight elements", "Bấm để highlight các phần tử dùng giá trị này"),
                        onclick: () => {
                            selected = selected === it ? null : it;
                            state.highlights = selected ? [...it.els].slice(0, 400) : [];
                            const first = state.highlights[0];
                            first && first.scrollIntoView({ block: "center", behavior: "smooth" });
                            paint();
                            render();
                        },
                    },
                    tab === "colors" ? h("div", { class: "sw", style: `background:${it.key}` }) : null,
                    h("div", {
                        class: "v" + (tab === "spacing" && it.key % 4 !== 0 ? " off" : ""),
                        text: label,
                        title: tab === "colors" ? [...it.uses].join(", ") : tab === "fonts" ? [...it.variants].sort().join("\n") : label,
                    }),
                    h("div", { class: "n", text: it.els.size }),
                    h("button", { class: "cp", text: "⧉", title: T("Copy", "Copy"), onclick: (e) => (e.stopPropagation(), copy(String(label))) })
                );
                body.append(row);
            }
        };
        p.append(tabs, body);
        paint();
    }

    bd.drawers.push((c, { H }) => {
        for (const el of state.highlights) {
            if (!el.isConnected) continue;
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > H || r.width === 0) continue;
            c.append(h("div", { class: "hl", style: `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px` }));
        }
    });

    Object.assign(bd, { openAuditPanel });
})();
