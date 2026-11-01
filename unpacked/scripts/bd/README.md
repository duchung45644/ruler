# Bo doi additions

Our own features, kept apart from the original extension code (`content.js`, `background.js`).

## Files

| File | What |
|---|---|
| `core.js` | Shared namespace `globalThis.__bd`, state, helpers (`h`, `T`, `swallow`…), tool panels, drawing layer. Public api for content.js: `globalThis.__bdTools` |
| `overlay.js` | Design overlay: stacked design images (`O`) |
| `measure-guides.js` | Ruler guides + measure box, arrow keys, measure panel (`M`) |
| `audit.js` | Page colors / fonts / spacing (`A`) |
| `capture/capture.js` | Capture mode bar, frozen-screen area select, copy/save, shared capture helpers |
| `capture/fullpage.js` | Full-page capture (debugger, behind a cover) + scroll & stitch fallback |
| `capture/editor.js` | Capture editor: copy / save / markup (pen, arrow, rect, highlight, text) |
| `../../bd-background.js` | Service-worker side: injected file list (`BD_CONTENT_FILES`) and the debugger full-page capture |

## How modules connect

- Load order is `BD_CONTENT_FILES` in `bd-background.js`, then `content.js`. A new file must be added there.
- Each module: `const { ...used helpers } = bd;` at the top, `Object.assign(bd, { ...exports })` at the bottom.
  It can only destructure what earlier files export; for something from a later file call `bd.fn()`.
- Drawing on the overlay layer: push a function to `bd.drawers` — `(container, {X, Y, W, H}) => {}`.

## Hooks inside content.js (search for these)

- `globalThis.__bdTools` — toggles from the dock / keys `O` `M` `A`, guides, destroy on quit
- `bdShowScreenshotPreview` — screenshots open the capture editor
- `!this._bdDirectShot` in `saveScreenshot` — capture button opens the mode bar
- `selectSibling` + `Alt+Shift+Left/Right` — previous/next sibling
- `bdFirstRealChild` — child selection skips our nodes
- `hover-highlight on scroll` — no hover highlight while Inspector is off
