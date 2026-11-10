# Capture

Press `8` or click **Capture Screenshot**. The screen freezes, the PixelLens UI hides, and a bar appears at the bottom with the capture modes. `Esc` closes the capture at any point.

## Modes

| Mode                     | What it captures                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Element**              | Pick an element with the inspector (click it; `Esc` cancels). The capture is cropped to the element and opens framed with padding. |
| **Capture area**         | Active right away: drag to select an area.                                                                                         |
| **Capture visible area** | The visible part of the page.                                                                                                      |
| **Capture full page**    | The whole page, top to bottom. Not available in responsive view.                                                                   |

## After selecting an area

A small bar next to the selection offers:

- **Copy**: copies the image to the clipboard.
- **Save**: downloads it as a PNG file.
- **Markup capture**: opens the image in the editor to annotate it.

## The editor

Visible-area, full-page and element captures open straight in the editor. Its bar has:

- **Copy** and **Save**.
- **Markup**: turns the drawing tools on or off.
- **Padding**: `0`, `16`, `32` or `64` pixels of frame around the image. With padding, pick a backdrop: two gradients, light or dark.

Drawing tools, each with its key:

| Tool          | Key |
| ------------- | --- |
| **Pen**       | `P` |
| **Arrow**     | `A` |
| **Rectangle** | `R` |
| **Highlight** | `H` |
| **Text**      | `T` |

Pick one of six colors and one of three stroke sizes. With **Text**, click to place the text, type, and press `Enter`. **Undo (Ctrl+Z)** removes the last mark.

The copy and save buttons show **Copied**, **Saved** or **Failed** for a moment.

## Full page

PixelLens first tries a fast capture that renders the whole page at once through the browser's debugging interface (the `debugger` permission). It attaches only for that capture and detaches right after; the browser may show a notice bar while it is attached.

If the fast capture fails (most often because DevTools is open on that tab), PixelLens scrolls the page and stitches the pieces instead, and tells you why: **Fast capture failed (…), used scroll & stitch instead. Close DevTools on this tab if it is open.**

## Copy and save

- **Copy** needs a secure page (HTTPS). On other pages the button says **Copy needs HTTPS — use Save**. If the browser refuses clipboard access, PixelLens asks for the optional clipboard permission once.
- **Save** downloads the PNG through the browser's normal download.
