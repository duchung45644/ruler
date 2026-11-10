# Settings

## Open Settings

- Right-click the PixelLens icon in the browser toolbar and choose **Settings**.
- Or click the gear button at the top of the side panel.

## Appearance

**Theme** sets the colors of the PixelLens dock, panels and popovers:

- **System**: picks the opposite of the page, so the UI stands out (a light UI on a dark page, a dark UI on a light page). When the page's color cannot be read, it follows your operating system.
- **Light** or **Dark**: always that theme.

## Extension

- **Color Format** (Used by the inspector and color picker): **HEX/HEXA**, **RGB/RGBA**, **HSL/HSLA** or **HSB/HSBA**. The same choice applies to the side panel's color values; switching format in the side panel's **Colors** section changes it here too.
- **Welcome tour** (The short dock tour shown the first time you open PixelLens): **Show again** brings it back; the button then reads **Shows next time**.
- **Saved edits** (PixelLens remembers your CSS edits for each site and brings them back next time): **Clear** removes the remembered edits for every site, after a confirmation.

## Terminal AI

**MCP Server** (Let AI agents look at and edit pages through PixelLens): **Connect** or **Disconnect**. While connecting, the copy prompt for your agent is shown here as well. An outdated server is flagged with a warning icon (**MCP server outdated. Update via your AI client.**). See [MCP](mcp.md).

## What is stored where

PixelLens keeps everything in the browser's extension storage. Nothing is sent to the developer.

Synced with your browser account (when browser sync is on):

- theme and color format,
- tool states restored the next time you turn PixelLens on: inspector, X-Ray, rulers, breakpoints, layout grid and its settings,
- responsive mode frames, zoom, frame layout and scroll sync,
- measure box color and edge guides,
- design overlay preferences (blend mode, onion tint, split),
- side panel preferences (which sections are open, code view, social preview network),
- whether you have finished the welcome tour and the pin hint.

A preference too big for sync, or one the browser refuses to sync, stays on this device instead.

Only on this device:

- saved CSS edits per site,
- the MCP token and whether MCP is turned on,
- the size and position of the side panel window when you open it in a window.

Never stored: design overlay images (they go away when you turn PixelLens off) and screenshots (unless you save them yourself).
