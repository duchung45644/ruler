// Bo doi additions to the service worker, loaded by importScripts() at the top of background.js.

// Bo doi content scripts, injected before content.js in this order: core first, then the modules
// (overlay before measure-guides so its arrow-key nudge takes precedence).
self.BD_CONTENT_FILES = [
    "scripts/bd/core.js",
    "scripts/bd/overlay.js",
    "scripts/bd/measure-guides.js",
    "scripts/bd/audit.js",
    "scripts/bd/capture/capture.js",
    "scripts/bd/capture/fullpage.js",
    "scripts/bd/capture/editor.js",
];

// Full-page capture through the DevTools protocol: the browser renders the whole page in one shot, no scrolling.
// The viewport is enlarged to the full height first: captureBeyondViewport alone leaves the off-screen part
// unpainted and Chromium repeats the first screen. Inner scroll containers expand to fit the same way.
chrome.runtime.onMessage.addListener(function (msg, sender, respond) {
    if (!msg || msg.target !== "bd" || msg.action !== "full_capture" || !sender.tab) return false;
    bdFullCapture(sender.tab.id, msg).then(
        function (parts) { respond({ ok: true, parts: parts }); },
        function (e) { respond({ ok: false, error: String((e && e.message) || e) }); }
    );
    return true;
});

async function bdFullCapture(tabId, o) {
    const target = { tabId: tabId };
    const send = (method, params) => chrome.debugger.sendCommand(target, method, params);
    await chrome.debugger.attach(target, "1.3");
    try {
        // o.shift: the page is pushed down by that much (o.before) so the cover the user sees sits above
        // the captured area; the viewport grows by the same amount
        const shift = o.shift || 0;
        await send("Emulation.setDeviceMetricsOverride", { width: o.width, height: o.height + shift, deviceScaleFactor: o.dpr, mobile: false });
        if (o.before) await send("Runtime.evaluate", { expression: o.before });
        await new Promise((r) => setTimeout(r, 300)); // let the layout and lazy images settle at the new size
        // read back in chunks: one capture taller than a GPU texture (~16384px) repeats tiles
        const parts = [];
        for (let y = 0; y < o.height; y += o.chunk) {
            const res = await send("Page.captureScreenshot", {
                format: "png",
                captureBeyondViewport: false,
                optimizeForSpeed: true, // faster PNG encoding, same pixels
                clip: { x: 0, y: y + shift, width: o.width, height: Math.min(o.chunk, o.height - y), scale: 1 },
            });
            parts.push("data:image/png;base64," + res.data);
        }
        return parts;
    } finally {
        if (o.after) await send("Runtime.evaluate", { expression: o.after }).catch(() => {});
        await send("Emulation.clearDeviceMetricsOverride").catch(() => {});
        // put the reader back where they were right away (the content script does it too, but later)
        if (o.restore) await send("Runtime.evaluate", { expression: o.restore }).catch(() => {});
        await chrome.debugger.detach(target).catch(() => {});
    }
}
