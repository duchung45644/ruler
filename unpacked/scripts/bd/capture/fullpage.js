// Full-page capture: the debugger renders the whole page at once behind a cover; scroll & stitch as fallback.
(() => {
    "use strict";
    const bd = globalThis.__bd;
    if (!bd || bd.mods["fullpage"]) return;
    bd.mods["fullpage"] = true;
    const { T, Z, h, sx, sy, CAPTURE_CSS, withHiddenUi, grabVisible, loadImg, frames, sleep } = bd;

    // fixed/sticky elements (headers, chat bubbles) would repeat in every slice; hide them after the first one.
    // ponytail: a sticky element further down the page (e.g. a table header) disappears from later slices
    function hideFixed() {
        const out = [];
        for (const el of document.body ? document.body.getElementsByTagName("*") : []) {
            const pos = getComputedStyle(el).position;
            if (pos !== "fixed" && pos !== "sticky") continue;
            out.push([el, el.style.getPropertyValue("visibility"), el.style.getPropertyPriority("visibility")]);
            el.style.setProperty("visibility", "hidden", "important");
        }
        return out;
    }

    // apps with a full-height layout scroll inside their own container, not the window: pick the biggest
    // visible element that actually scrolls vertically
    function findScroller() {
        let best = null, area = 0;
        const all = document.body ? [document.body, ...document.body.getElementsByTagName("*")] : [];
        for (const el of all) {
            if (el.clientHeight < 100 || el.scrollHeight <= el.clientHeight + 1) continue;
            const oy = getComputedStyle(el).overflowY;
            if (oy !== "auto" && oy !== "scroll" && oy !== "overlay") continue;
            const a = el.clientWidth * el.clientHeight;
            if (a > area) (area = a), (best = el);
        }
        return best;
    }

    // full-screen cover (frozen screen + loading bar) kept up during a full-page capture so the page
    // jumping underneath is never seen. Pixel size, not vh: vh changes while the viewport is enlarged.
    function showCover(snap) {
        const cover = h("div", { "data-bd-cover": "", style: `all:initial;position:fixed;left:0;top:0;width:${innerWidth}px;height:${innerHeight}px;z-index:${Z};pointer-events:auto;overflow:hidden;` });
        cover.attachShadow({ mode: "open" }).append(
            h("style", {
                text:
                    CAPTURE_CSS +
                    `
                .cv{position:absolute;inset:0;background:#000}
                .cv img{position:absolute;inset:0;width:100%;height:100%;filter:brightness(.55)}
                .card{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:260px;padding:14px 16px;border-radius:14px;background:var(--bg);color:var(--fg);box-shadow:0 0 0 1px var(--line),0 8px 24px rgba(0,0,0,.3);font-size:13px;font-weight:500}
                .track{margin-top:10px;height:4px;border-radius:2px;background:var(--sf);overflow:hidden}
                .track i{display:block;height:100%;width:40%;border-radius:2px;background:var(--acc);animation:bd-load 1s ease-in-out infinite}
                @keyframes bd-load{from{transform:translateX(-100%)}to{transform:translateX(250%)}}`,
            }),
            h("div", { class: "cv" }, snap ? h("img", { src: snap, alt: "" }) : null, h("div", { class: "card" }, T("Capturing full page…", "Đang chụp cả trang…"), h("div", { class: "track" }, h("i"))))
        );
        document.documentElement.append(cover);
        return cover;
    }

    // fast path: ask the background to render the whole page at once via the debugger API (like Edge, no scrolling)
    function fullPageViaDebugger() {
        const winTotal = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
        const el = winTotal - innerHeight < 50 ? findScroller() : null;
        const height = Math.round(el ? innerHeight + el.scrollHeight - el.clientHeight : winTotal);
        // the enlarged viewport holds the whole page, so no scrolling first. The background puts the scroll
        // position back itself right after shrinking the viewport (before detaching), so the page doesn't
        // visibly sit at the wrong spot while the reply travels back here.
        const x0 = sx(), y0 = sy(), s0 = el ? el.scrollTop : 0;
        el && el.setAttribute("data-bd-scroll", "");
        const restore = el
            ? `(document.querySelector("[data-bd-scroll]") || {}).scrollTop = ${s0}`
            : `scrollTo({ left: ${x0}, top: ${y0}, behavior: "instant" })`;
        const dpr = devicePixelRatio;
        // canvas height limit ~32767 device px: longer pages are cut
        const H = Math.min(height, Math.floor(32000 / dpr));
        // while capturing, the page is pushed down one screen (transform on <html>) and the cover moved up by the
        // same amount: the cover stays exactly where the user looks but sits above the captured area.
        // Run by the background inside the debugger session, right after enlarging / before shrinking the viewport.
        const ih = innerHeight;
        const before = `(() => { const s = document.documentElement.style; window.__bdT = [s.getPropertyValue("transform"), s.getPropertyPriority("transform")]; s.setProperty("transform", "translateY(${ih}px)", "important"); const c = document.querySelector("[data-bd-cover]"); c && (c.style.top = "-${ih}px"); })()`;
        const after = `(() => { const s = document.documentElement.style, t = window.__bdT || ["", ""]; s.setProperty("transform", t[0], t[1]); const c = document.querySelector("[data-bd-cover]"); c && (c.style.top = "0px"); })()`;
        return new Promise((res, rej) =>
            chrome.runtime.sendMessage({ target: "bd", action: "full_capture", width: innerWidth, height: H, dpr, chunk: Math.floor(8000 / dpr), restore, shift: ih, before, after }, (r) =>
                chrome.runtime.lastError || !r || !r.ok ? rej(new Error((r && r.error) || "debugger capture failed")) : res(r.parts)
            )
        )
            .then(async (parts) => {
                // stack the chunks into one image
                const imgs = await Promise.all(parts.map(loadImg));
                const c = h("canvas");
                c.width = imgs[0].width;
                c.height = imgs.reduce((n, i) => n + i.height, 0);
                const cx = c.getContext("2d");
                imgs.reduce((y, i) => (cx.drawImage(i, 0, y), y + i.height), 0);
                return c;
            })
            .finally(() => {
                // backup in case the background could not restore it
                el ? ((el.scrollTop = s0), el.removeAttribute("data-bd-scroll")) : scrollTo({ left: x0, top: y0, behavior: "instant" });
            });
    }

    async function captureFullPage(snap) {
        const cover = showCover(snap);
        let note = null;
        const fast = await withHiddenUi(fullPageViaDebugger).catch((e) => {
            // say why, so a slow scroll-and-stitch is never a mystery (most often: DevTools is open on this tab)
            note = T(
                `Fast capture failed (${e.message}), used scroll & stitch instead. Close DevTools on this tab if it is open.`,
                `Không chụp nhanh được (${e.message}), đã chuyển sang cuộn để chụp. Nếu đang mở DevTools ở tab này thì đóng lại rồi thử lại.`
            );
            return null;
        });
        if (fast) {
            // canvas source: the editor opens synchronously, so it is up before the cover goes away
            bd.openCaptureEditor(fast, false, note);
            cover.remove();
            return;
        }
        cover.remove(); // scroll & stitch shoots the real screen; the cover would end up in every slice
        const url = await stitchFullPage();
        url && bd.openCaptureEditor(url, false, note);
    }

    // fallback: scroll and stitch viewport shots. Scrolls the window, or the main scroll container when the window
    // itself (almost) doesn't scroll. Only the scrolling region is stitched; the rest of the screen
    // (sidebars, toolbars, status bar) is taken from the first/last shot.
    async function stitchFullPage() {
        const x0 = sx(), y0 = sy();
        const winTotal = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
        const el = winTotal - innerHeight < 50 ? findScroller() : null;
        const r = el && el.getBoundingClientRect();
        // scrolling region in viewport css px
        const L = el ? r.left + el.clientLeft : 0, Tp = el ? r.top + el.clientTop : 0;
        const VW = el ? el.clientWidth : innerWidth, VH = el ? el.clientHeight : innerHeight;
        const total = el ? el.scrollHeight : winTotal;
        const s0 = el ? el.scrollTop : y0;
        const getY = () => (el ? el.scrollTop : sy());
        const setY = (y) => (el ? el.scrollTo({ top: y, behavior: "instant" }) : scrollTo({ left: x0, top: y, behavior: "instant" }));
        const MAX_H = 32000; // browser canvas height limit is ~32767px
        let canvas = null, ctx = null, hidden = [], last = null, k = 1;
        const url = await withHiddenUi(async () => {
            try {
                for (let y = 0, i = 0; i < 60; i++) {
                    setY(y);
                    await frames();
                    // captureVisibleTab is limited to ~2 calls per second; this also lets lazy images load
                    if (i) await sleep(550);
                    const img = (last = await loadImg(await grabVisible()));
                    k = img.width / innerWidth;
                    if (!canvas) {
                        canvas = h("canvas");
                        canvas.width = img.width;
                        canvas.height = Math.min(Math.round((innerHeight - VH + total) * k), MAX_H);
                        ctx = canvas.getContext("2d");
                        ctx.fillStyle = "#fff";
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                    }
                    const top = getY(); // the browser clamps the last scroll, so draw where it really is
                    const sx_ = Math.round(L * k), sy_ = Math.round(Tp * k), sw = Math.round(VW * k), sh = Math.round(VH * k);
                    ctx.drawImage(img, sx_, sy_, sw, sh, sx_, Math.round((Tp + top) * k), sw, sh);
                    // fixed headers/chat bubbles would repeat in every window slice
                    if (i === 0 && !el) hidden = hideFixed();
                    if (top + VH >= total - 1 || (Tp + top + VH) * k >= MAX_H) break;
                    y = top + VH;
                }
                // whatever sits below the scroll container (status bar etc.) goes under the stitched content
                const below = innerHeight - Tp - VH;
                if (el && below > 0) ctx.drawImage(last, 0, Math.round((Tp + VH) * k), last.width, Math.round(below * k), 0, Math.round((Tp + total) * k), last.width, Math.round(below * k));
            } finally {
                hidden.forEach(([e, v, p]) => e.style.setProperty("visibility", v, p));
                setY(s0);
            }
            return canvas;
        }).catch(() => null);
        return url;
    }

    Object.assign(bd, { captureFullPage });
})();
