// Design overlay: stack design images over the page (drag, resize, opacity, difference blend, pin to screen).
(() => {
    "use strict";
    const bd = globalThis.__bd;
    if (!bd || bd.mods["overlay"]) return;
    bd.mods["overlay"] = true;
    const { T, Z, state, h, sx, sy, swallow, render, makePanel, isTyping } = bd;

    // several images can be stacked; the panel controls edit the selected one (state.sel)
    let ovInputs = null;
    const cur = () => state.overlays[state.sel] || null;

    // click the middle of an image to drag it, a corner to resize it — same interaction as the measure tool
    const OVERLAY_CORNER = 14;

    function hitOverlayLocal(r, lx, ly) {
        const C = OVERLAY_CORNER;
        const nearL = lx <= C, nearR = lx >= r.width - C;
        const nearT = ly <= C, nearB = ly >= r.height - C;
        if (nearL && nearT) return "tl";
        if (nearR && nearT) return "tr";
        if (nearL && nearB) return "bl";
        if (nearR && nearB) return "br";
        return null;
    }

    function overlayPointerMove(e) {
        if (state.drag || globalThis.__bdViewerOpen) return;
        const img = e.currentTarget;
        const r = img.getBoundingClientRect();
        const corner = hitOverlayLocal(r, e.clientX - r.left, e.clientY - r.top);
        img.style.cursor = corner ? (corner === "tl" || corner === "br" ? "nwse-resize" : "nesw-resize") : "move";
    }

    function overlayPointerDown(e) {
        if (e.button !== 0 || globalThis.__bdViewerOpen) return;
        const i = state.overlays.findIndex((o) => o.img === e.currentTarget);
        if (i < 0) return;
        state.sel = i;
        syncOverlayInputs();
        const o = state.overlays[i];
        const r = o.img.getBoundingClientRect();
        const corner = hitOverlayLocal(r, e.clientX - r.left, e.clientY - r.top);
        corner ? startOverlayResize(e, o, corner) : startOverlayMove(e, o);
    }

    function dragTracking(onMove, onEnd) {
        const mv = (e) => onMove(e);
        const up = (e) => {
            removeEventListener("pointermove", mv, true);
            removeEventListener("pointerup", up, true);
            onEnd && onEnd(e);
        };
        addEventListener("pointermove", mv, true);
        addEventListener("pointerup", up, true);
    }

    function startOverlayMove(e, o) {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.clientX, startY = e.clientY, ox = o.x, oy = o.y;
        document.documentElement.style.cursor = "move";
        dragTracking(
            (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                o.x = ox + (ev.clientX - startX);
                o.y = oy + (ev.clientY - startY);
                syncOverlayInputs();
                render();
            },
            () => (document.documentElement.style.cursor = "")
        );
    }

    function startOverlayResize(e, o, corner) {
        e.preventDefault();
        e.stopPropagation();
        const natW = o.img.naturalWidth || 1;
        const natH = o.img.naturalHeight || 1;
        const aspect = natH / natW;
        const left0 = o.fixed ? o.x : o.x - sx();
        const top0 = o.fixed ? o.y : o.y - sy();
        const width0 = (natW * o.scale) / 100;
        const height0 = width0 * aspect;
        const right0 = left0 + width0, bottom0 = top0 + height0;
        document.documentElement.style.cursor = corner === "tl" || corner === "br" ? "nwse-resize" : "nesw-resize";
        dragTracking(
            (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                const width = Math.max(20, corner.includes("l") ? right0 - ev.clientX : ev.clientX - left0);
                const height = width * aspect;
                o.scale = Math.max(2, Math.round((width / natW) * 100));
                if (corner.includes("l")) o.x = (o.fixed ? right0 : right0 + sx()) - width;
                if (corner.includes("t")) o.y = (o.fixed ? bottom0 : bottom0 + sy()) - height;
                syncOverlayInputs();
                render();
            },
            () => (document.documentElement.style.cursor = "")
        );
    }

    function positionOverlay() {
        const many = state.overlays.length > 1;
        state.overlays.forEach((o, i) => {
            const img = o.img;
            if (!state.active.designOverlay || !o.visible) {
                img.style.display = "none";
                return;
            }
            if (!img.isConnected) document.documentElement.append(img);
            const left = o.fixed ? o.x : o.x - sx();
            const top = o.fixed ? o.y : o.y - sy();
            const widthPx = img.naturalWidth ? (img.naturalWidth * o.scale) / 100 : 0;
            const shadow = o.mode === "difference" ? "none" : "0 4px 24px rgba(0,0,0,.35), 0 1px 3px rgba(0,0,0,.25)";
            // outline the selected image so it's clear which one the panel/arrow keys edit
            const outline = many && i === state.sel ? "2px solid #5B5BF0" : "none";
            img.style.cssText = `all:initial;position:fixed;left:${left}px;top:${top}px;z-index:${Z - 1};pointer-events:auto;cursor:move;
                width:${widthPx ? widthPx + "px" : "auto"};max-width:none;box-shadow:${shadow};outline:${outline};
                opacity:${o.mode === "difference" ? 1 : o.opacity / 100};mix-blend-mode:${o.mode};display:block;`;
        });
    }

    function loadOverlayFile(file) {
        if (!file || !file.type.startsWith("image/")) return;
        const fr = new FileReader();
        fr.onload = () => {
            const img = h("img", { alt: "" });
            img.addEventListener("pointerdown", overlayPointerDown);
            img.addEventListener("pointermove", overlayPointerMove);
            const o = { src: fr.result, img, x: 0, y: 0, scale: 100, opacity: 50, mode: "normal", visible: true, fixed: false };
            img.onload = () => {
                // retina exports (@2x) are usually twice the CSS size
                o.scale = img.naturalWidth >= innerWidth * 1.8 ? 50 : 100;
                const w = (img.naturalWidth * o.scale) / 100;
                const hh = (img.naturalHeight * o.scale) / 100;
                // center in the current viewport, in page coordinates
                o.x = Math.round(innerWidth / 2 - w / 2 + sx());
                o.y = Math.round(innerHeight / 2 - hh / 2 + sy());
                state.overlays.push(o);
                state.sel = state.overlays.length - 1;
                syncOverlayInputs();
                render();
            };
            img.src = fr.result;
        };
        fr.readAsDataURL(file);
    }
    const loadOverlayFiles = (files) => [...(files || [])].forEach(loadOverlayFile);

    function syncOverlayInputs() {
        if (!ovInputs) return;
        // rebuild thumbnails only when the list, selection or visibility changes (this runs on every drag move)
        const key = state.overlays.map((o, i) => `${i === state.sel}${o.visible}`).join();
        if (ovInputs.thumbKey !== key) {
            ovInputs.thumbKey = key;
            ovInputs.thumbs.replaceChildren(
                ...state.overlays.map((it, i) =>
                    h(
                        "button",
                        { class: i === state.sel ? "on" : "", style: it.visible ? "" : "opacity:.4", title: T(`Image ${i + 1}`, `Ảnh ${i + 1}`), onclick: () => ((state.sel = i), syncOverlayInputs(), render()) },
                        h("img", { src: it.src, alt: "" })
                    )
                )
            );
        }
        ovInputs.drop.textContent = state.overlays.length ? T("Add another image…", "Thêm ảnh khác…") : T("Drop, paste or click to choose design images", "Thả, dán (Ctrl+V) hoặc bấm để chọn ảnh thiết kế");
        const o = cur();
        ovInputs.controls.style.display = o ? "flex" : "none";
        if (!o) return;
        ovInputs.x.value = o.x;
        ovInputs.y.value = o.y;
        ovInputs.scale.value = o.scale;
        ovInputs.opacity.value = o.opacity;
        for (const b of ovInputs.mode.children) b.classList.toggle("on", b.dataset.mode === o.mode);
        ovInputs.vis.classList.toggle("on", o.visible);
        ovInputs.vis.textContent = o.visible ? T("Visible", "Đang hiện") : T("Hidden", "Đang ẩn");
        ovInputs.fixed.classList.toggle("on", o.fixed);
    }

    function openOverlayPanel() {
        const p = makePanel("designOverlay", T("Design overlay", "Đè ảnh thiết kế"), 0);
        // every control edits the currently selected image
        const edit = (fn) => () => {
            const o = cur();
            o && (fn(o), syncOverlayInputs(), render());
        };
        const file = h("input", { type: "file", accept: "image/*", multiple: "", style: "display:none" });
        file.addEventListener("change", () => (loadOverlayFiles(file.files), (file.value = "")));
        const drop = h("div", { class: "drop", onclick: () => file.click() });
        drop.addEventListener("dragover", (e) => (e.preventDefault(), drop.classList.add("over")));
        drop.addEventListener("dragleave", () => drop.classList.remove("over"));
        drop.addEventListener("drop", (e) => (e.preventDefault(), drop.classList.remove("over"), loadOverlayFiles(e.dataTransfer.files)));
        const thumbs = h("div", { class: "thumbs" });

        const num = (key) => {
            const i = h("input", { type: "number", step: "1" });
            i.addEventListener("input", edit((o) => (o[key] = Number(i.value) || 0)));
            return i;
        };
        const x = num("x"), y = num("y"), scale = num("scale");
        const opacity = h("input", { type: "range", min: "0", max: "100" });
        opacity.addEventListener("input", edit((o) => (o.opacity = Number(opacity.value))));
        // one click per mode instead of a dropdown
        const modeBtn = (value, text) => h("button", { "data-mode": value, text, onclick: edit((o) => (o.mode = value)) });
        const mode = h("div", { class: "row", style: "gap:4px" }, modeBtn("normal", T("Normal", "Bình thường")), modeBtn("difference", "Difference"));
        const vis = h("button", { onclick: edit((o) => (o.visible = !o.visible)) });
        const fixed = h("button", {
            text: T("Pin to screen", "Ghim theo màn hình"),
            title: T("Keep the image fixed while scrolling", "Ảnh đứng yên khi cuộn trang"),
            // convert between page and screen coordinates so the image doesn't jump
            onclick: edit((o) => (o.fixed ? ((o.x += sx()), (o.y += sy())) : ((o.x -= sx()), (o.y -= sy())), (o.fixed = !o.fixed))),
        });
        const remove = h("button", {
            text: T("Remove", "Xoá ảnh"),
            onclick: edit((o) => {
                o.img.remove();
                state.overlays.splice(state.sel, 1);
                state.sel = Math.min(state.sel, state.overlays.length - 1);
            }),
        });

        const controls = h(
            "div",
            { style: "display:flex;flex-direction:column;gap:10px" },
            h("div", { class: "row" }, h("label", { text: T("Opacity", "Độ mờ") }), opacity),
            h("div", { class: "row" }, h("label", { text: T("Blend", "Chế độ") }), mode),
            h("div", { class: "row" }, h("label", { text: "X / Y" }), x, y),
            h("div", { class: "row" }, h("label", { text: T("Scale %", "Tỉ lệ %") }), scale),
            h("div", { class: "row" }, vis, fixed, remove),
            h("div", {
                class: "hint",
                text: T(
                    "Click an image (or its thumbnail) to select it. Drag the middle to move, a corner to resize. Arrow keys nudge the selected image 1px (Shift: 10px).",
                    "Bấm vào ảnh (hoặc ảnh nhỏ ở trên) để chọn. Kéo giữa ảnh để di chuyển, kéo góc để co giãn. Phím mũi tên dịch ảnh đang chọn 1px (giữ Shift: 10px)."
                ),
            })
        );
        p.append(h("div", { class: "bd" }, thumbs, drop, file, controls));
        ovInputs = { x, y, scale, opacity, mode, vis, fixed, drop, controls, thumbs, thumbKey: null };
        syncOverlayInputs();
    }

    addEventListener(
        "paste",
        (e) => {
            if (!state.active.designOverlay) return;
            const files = [...(e.clipboardData ? e.clipboardData.files : [])].filter((f) => f.type.startsWith("image/"));
            if (files.length) {
                e.preventDefault();
                loadOverlayFiles(files);
            }
        },
        true
    );

    addEventListener(
        "keydown",
        (e) => {
            if (isTyping(e) || globalThis.__bdViewerOpen) return;
            // nudge the design overlay
            const ov = cur();
            if (state.active.designOverlay && ov && e.key.startsWith("Arrow") && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const s = e.shiftKey ? 10 : 1;
                if (e.key === "ArrowLeft") ov.x -= s;
                if (e.key === "ArrowRight") ov.x += s;
                if (e.key === "ArrowUp") ov.y -= s;
                if (e.key === "ArrowDown") ov.y += s;
                syncOverlayInputs();
                render();
                return swallow(e);
            }
        },
        true
    );

    bd.drawers.push(() => positionOverlay());

    Object.assign(bd, { openOverlayPanel });
})();
