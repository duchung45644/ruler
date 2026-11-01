// Capture editor: copy / save, and markup with pen, arrow, rectangle, highlight and text.
(() => {
    "use strict";
    const bd = globalThis.__bd;
    if (!bd || bd.mods["editor"]) return;
    bd.mods["editor"] = true;
    const { T, h, swallow, capRoot, closeCapture, capBtn, capAction, copyCanvas, saveCanvas, loadImg } = bd;

    const MARK_COLORS = ["#FF3B30", "#FFCC00", "#34C759", "#0A84FF", "#111111", "#FFFFFF"];
    const MARK_SIZES = [2, 4, 8];

    // markup tools; the last one used is remembered for the next capture
    const MARK_TOOLS = [
        { id: "pen", key: "p", icon: "markup", en: "Pen", vi: "Bút" },
        { id: "arrow", key: "a", icon: "arrow", en: "Arrow", vi: "Mũi tên" },
        { id: "rect", key: "r", icon: "rect", en: "Rectangle", vi: "Khung" },
        { id: "hl", key: "h", icon: "hl", en: "Highlight", vi: "Tô sáng" },
        { id: "text", key: "t", icon: "text", en: "Text", vi: "Chữ" },
    ];
    let markTool = "arrow";

    // markup: open with the pen already on (coming from the area bar's "Markup capture")
    // src: data URL, or an already drawn canvas (skips a slow PNG encode/decode for big shots)
    async function openCaptureEditor(src, markup, note) {
        const img = typeof src === "string" ? await loadImg(src) : src;
        const canvas = h("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        const items = []; // {tool, color, size, k, pts, text?, fs?} in image pixels
        let marking = !!markup, color = MARK_COLORS[0], size = MARK_SIZES[1];
        let textInput = null;

        const drawItem = (s, from = 1, c = ctx) => {
            const [a, b] = s.pts;
            c.save();
            c.strokeStyle = c.fillStyle = s.color;
            c.lineWidth = s.size;
            c.lineCap = c.lineJoin = "round";
            if (s.tool === "pen") {
                const p = s.pts;
                const st = p[Math.max(0, from - 1)];
                c.beginPath();
                c.moveTo(st[0], st[1]);
                for (let i = from; i < p.length; i++) c.lineTo(p[i][0], p[i][1]);
                if (p.length === 1) c.lineTo(st[0] + 0.01, st[1]); // a click leaves a dot
                c.stroke();
            } else if (s.tool === "arrow" && b) {
                const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
                const head = s.size * 3 + 8 * s.k;
                // stop the shaft inside the head so its round cap doesn't poke through the tip
                c.beginPath();
                c.moveTo(a[0], a[1]);
                c.lineTo(b[0] - Math.cos(ang) * head * 0.6, b[1] - Math.sin(ang) * head * 0.6);
                c.stroke();
                c.beginPath();
                c.moveTo(b[0], b[1]);
                for (const d of [-0.45, 0.45]) c.lineTo(b[0] - head * Math.cos(ang + d), b[1] - head * Math.sin(ang + d));
                c.closePath();
                c.fill();
            } else if ((s.tool === "rect" || s.tool === "hl") && b) {
                const x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(b[0] - a[0]), hh = Math.abs(b[1] - a[1]);
                if (s.tool === "rect") c.strokeRect(x, y, w, hh);
                else (c.globalAlpha = 0.35), c.fillRect(x, y, w, hh);
            } else if (s.tool === "text") {
                c.font = `600 ${s.fs}px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif`;
                c.textBaseline = "middle";
                c.fillText(s.text, a[0], a[1]);
            }
            c.restore();
        };
        const paint = () => {
            ctx.drawImage(img, 0, 0);
            items.forEach((s) => drawItem(s));
        };

        const undo = () => {
            items.pop();
            paint();
            undoB.disabled = !items.length;
        };
        const root = capRoot((e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") return swallow(e), undo();
            const t = marking && !e.ctrlKey && !e.metaKey && !e.altKey && MARK_TOOLS.find((t) => t.key === e.key.toLowerCase());
            t && (swallow(e), (markTool = t.id), syncTools());
        });

        const commitText = () => {
            const t = textInput;
            if (!t) return;
            textInput = null;
            const v = t.inp.value.trim();
            t.inp.remove();
            if (!v) return;
            const it = { tool: "text", color: t.color, pts: [[t.x, t.y]], fs: t.fs, text: v };
            items.push(it);
            undoB.disabled = false;
            drawItem(it);
        };
        const startText = (e, b, k) => {
            const fsCss = 10 + size * 3;
            const inp = h("input", { class: "txt", style: `left:${e.clientX}px;top:${e.clientY - fsCss / 2 - 2}px;font-size:${fsCss}px;color:${color}` });
            textInput = { inp, x: (e.clientX - b.left) * k, y: (e.clientY - b.top) * k, fs: fsCss * k, color };
            inp.addEventListener("keydown", (ev) => {
                if (ev.key === "Enter") commitText();
                if (ev.key === "Escape") (textInput = null), inp.remove();
            });
            inp.addEventListener("blur", commitText);
            ed.append(inp);
            setTimeout(() => inp.focus());
        };

        canvas.addEventListener("pointerdown", (e) => {
            if (!marking || e.button !== 0) return;
            e.preventDefault();
            // a click while typing just finishes the text
            if (textInput) return commitText();
            const b = canvas.getBoundingClientRect(), k = canvas.width / b.width;
            if (markTool === "text") return startText(e, b, k);
            const pt = (ev) => [(ev.clientX - b.left) * k, (ev.clientY - b.top) * k];
            const s = { tool: markTool, color, size: size * k, k, pts: [pt(e)] };
            items.push(s);
            undoB.disabled = false;
            s.tool === "pen" && drawItem(s);
            canvas.setPointerCapture(e.pointerId);
            // shapes are previewed on a screen-sized layer and drawn into the image once on release:
            // repainting a full-page shot on every move is what made it lag
            const dpr = devicePixelRatio;
            const prev = s.tool === "pen" ? null : h("canvas", { class: "prev" });
            const pctx = prev && prev.getContext("2d");
            if (prev) (prev.width = Math.round(innerWidth * dpr)), (prev.height = Math.round(innerHeight * dpr)), ed.append(prev);
            const mv = (ev) => {
                // pen draws only the new segment
                if (s.tool === "pen") return s.pts.push(pt(ev)), drawItem(s, s.pts.length - 1);
                s.pts[1] = pt(ev);
                pctx.setTransform(1, 0, 0, 1, 0, 0);
                pctx.clearRect(0, 0, prev.width, prev.height);
                pctx.setTransform(dpr / k, 0, 0, dpr / k, b.left * dpr, b.top * dpr);
                drawItem(s, 1, pctx);
            };
            const up = () => {
                canvas.removeEventListener("pointermove", mv);
                canvas.removeEventListener("pointerup", up);
                prev && prev.remove();
                if (s.tool === "pen") return;
                // a shape needs an actual drag; drop plain clicks
                const [a, z] = s.pts;
                if (!z || Math.hypot(z[0] - a[0], z[1] - a[1]) < 4 * k) items.pop(), (undoB.disabled = !items.length);
                else drawItem(s);
            };
            canvas.addEventListener("pointermove", mv);
            canvas.addEventListener("pointerup", up);
        });

        const copyB = capBtn("copy", T("Copy", "Copy"));
        const saveB = capBtn("save", T("Save", "Lưu"));
        const markB = capBtn("markup", T("Markup", "Vẽ chú thích"));
        const undoB = capBtn("undo", "", undo);
        undoB.title = T("Undo (Ctrl+Z)", "Hoàn tác (Ctrl+Z)");
        undoB.disabled = true;
        copyB.onclick = () => (commitText(), capAction(copyB, () => copyCanvas(canvas), T("Copied", "Đã copy")));
        saveB.onclick = () => (commitText(), capAction(saveB, () => saveCanvas(canvas), T("Saved", "Đã lưu")));

        const toolBtns = MARK_TOOLS.map((t) => {
            const b = capBtn(t.icon, "", () => ((markTool = t.id), syncTools()));
            b.title = `${T(t.en, t.vi)} (${t.key.toUpperCase()})`;
            return b;
        });
        const swatches = MARK_COLORS.map((c) => h("button", { class: "sw", style: `background-color:${c}`, title: c, onclick: () => ((color = c), syncTools()) }));
        const sizes = MARK_SIZES.map((n) =>
            h("button", { title: `${n}px`, onclick: () => ((size = n), syncTools()) }, h("span", { style: `display:block;width:${n + 4}px;height:${n + 4}px;border-radius:50%;background:currentColor` }))
        );
        const tools = h("div", { class: "tools" }, h("div", { class: "sep" }), ...toolBtns, h("div", { class: "sep" }), ...swatches, h("div", { class: "sep" }), ...sizes, undoB);
        const syncTools = () => {
            markB.classList.toggle("on", marking);
            canvas.classList.toggle("mark", marking);
            canvas.classList.toggle("typing", markTool === "text");
            tools.style.display = marking ? "flex" : "none";
            toolBtns.forEach((b, i) => b.classList.toggle("on", MARK_TOOLS[i].id === markTool));
            swatches.forEach((b, i) => b.classList.toggle("on", MARK_COLORS[i] === color));
            sizes.forEach((b, i) => b.classList.toggle("on", MARK_SIZES[i] === size));
        };
        markB.onclick = () => (commitText(), (marking = !marking), syncTools());

        // 1:1 with the page, shrunk to fit; tall full-page shots scroll instead of shrinking to a sliver
        const tall = img.height / img.width > 2;
        canvas.style.cssText = `max-width:min(100%, ${img.width / devicePixelRatio}px);max-height:${tall ? "none" : "calc(100vh - 100px)"}`;
        paint();
        syncTools();
        const ed = h(
            "div",
            { class: "ed" },
            note ? h("div", { class: "note", text: note }) : null,
            h("div", { class: "stage" }, canvas),
            // toolbar under the image; the pair is centered vertically
            h("div", { class: "bar" }, copyB, saveB, markB, tools, h("div", { class: "sep" }), h("button", { class: "x", text: "✕", title: T("Close (Esc)", "Đóng (Esc)"), onclick: closeCapture }))
        );
        root.append(ed);
    }

    Object.assign(bd, { openCaptureEditor });
})();
