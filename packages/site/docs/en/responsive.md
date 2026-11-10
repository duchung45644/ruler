# Responsive mode

Responsive mode shows the current page in several frames of different sizes, side by side, in the same tab. The PixelLens tools work inside every frame at once.

## Turn it on

Press `5` or click **Responsive Mode · B: breakpoints** on the dock. Press again to leave. While it is on, video and audio on the page are paused.

The first time, you start with three frames: Phone (390×844), Tablet (768×1024) and Desktop (1280×800). PixelLens remembers your frames, zoom, layout and scroll sync for next time.

If you have inline style, markup or class edits, PixelLens asks first: **Your CSS rule changes will be kept. Inline style, markup and class edits will be discarded.** The same happens when you leave. On leaving, the first frame's CSS rule edits and its current URL come back to the page.

## Toolbar

The toolbar above the frames has, from left to right:

- **Zoom Out**, **Zoom** (25% to 200%; 65% by default) and **Zoom In**.
- **Refresh**: reloads every frame.
- The page URL.
- **Reset Viewports**: goes back to the default frames, after a confirmation.
- **Sync Scrolling**: scrolling one frame scrolls the others. If the page keeps scrolling against it, sync turns itself off and says so.
- **Frame Layout**: switches between one row and frames that wrap onto several rows.
- **Breakpoints (B)**: one frame per breakpoint of the page (see below).
- **Add Viewport**: adds a frame from the device list, or **Custom** for your own size.

## Devices and custom sizes

**Add Viewport** lists phones (iPhone, Galaxy, Pixel, Xiaomi / Redmi, OPPO / vivo, generic Android sizes), tablets (iPad, Galaxy Tab) and laptop and desktop sizes up to 4K, each with its width and height. **Custom** opens **Custom Viewport**, where you type a **Width** and a **Height** (320 to 3840 px).

You can have up to 20 frames.

## Each frame

Each frame has a header with:

- **Move Left** / **Move Right** to reorder frames.
- The frame's name and size.
- A warning icon when **Content overflows horizontally**.
- **Rotate**: swaps width and height.
- **Color Scheme**: cycles **System**, **Light** and **Dark** (the `prefers-color-scheme` the frame sees).
- **Remove Viewport**, after a confirmation.
- **More Actions**: **Refresh**, **Rotate**, **Color Scheme** and **Remove Viewport**.

Drag a frame's right edge, bottom edge or bottom-right corner to resize it.

## Tools in frames

Tools you switch on from the dock or with their keys run in every frame: inspector, X-Ray, layout grid, rulers, measure, design overlay and color picker. Select an element in any frame; the side panel then follows that frame. **Find Element** searches all frames and adds up the counts.

**Capture Screenshot** works on the whole view; its **Element** mode captures the element selected in a frame. **Capture full page** is not available in responsive view.

## Breakpoints

With the breakpoints tool on (key `B`, or the **Breakpoints** toolbar button), the frames are rebuilt with one frame per breakpoint width of the page, each marked with its breakpoint (`≥768px`, `≤767px`). The button is disabled when the page declares no breakpoints. **Add Viewport** is not available in this mode.

## Pages that block the preview

Many sites forbid being shown inside a frame. To load them anyway, PixelLens needs access to all sites, which it asks for only here. A blocked frame shows **This site blocks loading in the preview. Grant access to show it.** Click **Grant access** and accept the browser prompt; the frames reload.

With that permission, PixelLens removes the blocking response headers only for the frames of this tab, and only while responsive mode is on.

Some sites block framing with a script or an in-page policy that cannot be removed. Those show **This site blocks loading in the preview. It does this with a script or an in-page policy that can't be stripped.** A frame that never finishes loading shows **This page did not finish loading.**
