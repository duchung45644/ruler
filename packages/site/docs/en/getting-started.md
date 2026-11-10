# Getting started

PixelLens is a toolkit for inspecting, measuring and adjusting web pages, right on the page. It runs in Microsoft Edge and other Chromium-based browsers, version 116 or newer.

## Install

### From Edge Add-ons

PixelLens is being published on Edge Add-ons. Once the listing is live, open it in Edge and choose **Get**. Until then, use the developer install below.

### Load unpacked (developers)

You need Node 22.12 or newer and pnpm (through corepack).

```sh
corepack pnpm install
corepack pnpm build
```

The build lands in `.output/chrome-mv3`. Then:

1. Open `edge://extensions` (or `chrome://extensions`).
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and pick the `.output/chrome-mv3` folder.

The build carries the Edge Add-ons key, so the extension ID is always `bkgdfebicmlicjnkgbemlidlnpbnaofh`, the same as the store version. This matters when you connect an AI agent (see [MCP](mcp.md)).

## Turn PixelLens on

PixelLens does nothing on a tab until you turn it on there. Any of these toggles it on or off for the current tab:

- Click the PixelLens icon in the browser toolbar. The icon is colored while PixelLens is on in that tab and grey while it is off.
- Press `Alt+Shift+S`.
- Right-click anywhere on the page and choose **PixelLens** from the context menu.

PixelLens turns off when the tab loads a new page (a reload or a navigation). Turn it on again to continue. Tools you left on, such as the inspector, X-Ray, rulers, breakpoints and the layout grid, come back the next time you turn it on.

PixelLens cannot run on browser pages (`edge://`, `chrome://`), extension pages or the extension stores. See [Troubleshooting](troubleshooting.md).

## The dock

When PixelLens is on, a toolbar called the dock appears at the bottom center of the page. Every tool starts from it. Hover a button to see its name and shortcut. The less used tools sit behind the **More tools** button (⋯).

The full list of buttons and keys is in [Dock and shortcuts](dock-and-shortcuts.md).

## Pause and quit

- **Pause** (in the **More tools** menu, key `H`) hides everything PixelLens draws and gives the page back its mouse and keyboard, without losing your state. While paused, the dock shrinks to **Resume** and **Quit**. Press `H` or click **Resume** to continue.
- **Quit** (the X at the right end of the dock, or `Ctrl+Q`) turns PixelLens off for the tab and closes its side panel.

## Welcome tour

The first time you open PixelLens, a short tour points at the dock in four steps: **Your toolbar**, **Number keys**, **More tools** and **Ctrl+K anywhere**. Use **Next** to go on, **Skip** to close it, and **Got it** on the last step. To see it again, open [Settings](settings.md) and choose **Show again** next to **Welcome tour**.

## First steps

- Press `1` to turn on the **Inspector**, then hover the page: each element shows its size, spacing and a floating info panel. Click to select an element. See [Inspect](inspect.md).
- Press `Space` while the info panel is shown to pin it to the page.
- Press `Ctrl+K` (or `?`) to search every tool by name and run it with `Enter`.
- Press `0` to open the side panel with the full details of the selected element and of the page. See [Side panel](side-panel.md).
- Press `Esc` to clear the selection or close the open popover.
