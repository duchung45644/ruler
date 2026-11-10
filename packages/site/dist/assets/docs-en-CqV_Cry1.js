var e = Object.fromEntries(
  Object.entries(
    Object.assign({
      '../docs/en/capture.md': `# Capture

Press \`8\` or click **Capture Screenshot**. The screen freezes, the PixelLens UI hides, and a bar appears at the bottom with the capture modes. \`Esc\` closes the capture at any point.

## Modes

| Mode                     | What it captures                                                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Element**              | Pick an element with the inspector (click it; \`Esc\` cancels). The capture is cropped to the element and opens framed with padding. |
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
- **Padding**: \`0\`, \`16\`, \`32\` or \`64\` pixels of frame around the image. With padding, pick a backdrop: two gradients, light or dark.

Drawing tools, each with its key:

| Tool          | Key |
| ------------- | --- |
| **Pen**       | \`P\` |
| **Arrow**     | \`A\` |
| **Rectangle** | \`R\` |
| **Highlight** | \`H\` |
| **Text**      | \`T\` |

Pick one of six colors and one of three stroke sizes. With **Text**, click to place the text, type, and press \`Enter\`. **Undo (Ctrl+Z)** removes the last mark.

The copy and save buttons show **Copied**, **Saved** or **Failed** for a moment.

## Full page

PixelLens first tries a fast capture that renders the whole page at once through the browser's debugging interface (the \`debugger\` permission). It attaches only for that capture and detaches right after; the browser may show a notice bar while it is attached.

If the fast capture fails (most often because DevTools is open on that tab), PixelLens scrolls the page and stitches the pieces instead, and tells you why: **Fast capture failed (…), used scroll & stitch instead. Close DevTools on this tab if it is open.**

## Copy and save

- **Copy** needs a secure page (HTTPS). On other pages the button says **Copy needs HTTPS — use Save**. If the browser refuses clipboard access, PixelLens asks for the optional clipboard permission once.
- **Save** downloads the PNG through the browser's normal download.
`,
      '../docs/en/design-overlay.md': `# Design overlay

The design overlay lays your design images (mockups, exports from a design tool) over the live page so you can compare them pixel by pixel.

## Open it

Choose **Design overlay** in the **More tools** menu, or press \`O\`.

## Add images

In the panel, **Drop, paste or click to choose design images**:

- drop image files on the box,
- paste an image with \`Ctrl+V\` while the overlay is open,
- or click the box to pick files.

You can keep up to 5 images. Once one is added, the **+** button (**Add another image…**) adds more. Thumbnails at the top of the panel show the images; click one (or the image itself) to select it.

Images are not saved: they disappear when you turn PixelLens off.

## Move and resize

- Drag the middle of an image to move it; drag a corner to resize it.
- Arrow keys nudge the selected image 1px (\`Shift\`: 10px).
- **Scale %** sets the size as a percentage of the image's natural size.
- **Pin to screen** keeps the image fixed while the page scrolls.
- **Visible** / **Hidden** shows or hides the selected image.
- **Remove** deletes it.

## Blend modes

**Blend** sets how the selected image mixes with the page:

| Mode           | Result                                                                           |
| -------------- | -------------------------------------------------------------------------------- |
| **Normal**     | The image on top, with the **Opacity** you set.                                  |
| **Difference** | Identical pixels turn black, so any offset stands out. Opacity is fixed at 100%. |
| **Onion skin** | A see-through layer, at most 60% opacity, with a tint of your choice.            |

With **Onion skin**, pick the tint:

- **Normal**: the image as is.
- **Invert**: inverted colors.
- **Two-tone**: a single colored tone, easy to tell apart from the page.

New images start with the last blend mode you picked.

## Before/after split

Turn on **Before/after split** to show the design on one side of a divider and the live page on the other. Drag the divider to compare. **Design on the left** chooses which side shows the design.

The blend mode, onion tint, split setting, divider position and side are remembered for next time.
`,
      '../docs/en/dock-and-shortcuts.md':
        "# Dock and shortcuts\n\n## Dock buttons\n\nThe dock groups its buttons by purpose. From left to right:\n\n| Button                               | Key           | What it does                                                                                             |\n| ------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------- |\n| **Select Parent**                    | `Alt+Shift+↑` | Moves the selection to the parent element. Shown only while an element is selected.                      |\n| **Select Child**                     | `Alt+Shift+↓` | Moves the selection back down to a child element. Shown only while an element is selected.               |\n| **Inspector**                        | `1`           | Turns hover inspecting on or off. See [Inspect](inspect.md).                                             |\n| **Find Element**                     | `2`           | Opens a box to find elements by CSS selector.                                                            |\n| **X-Ray Mode**                       | `3`           | Outlines every element on the page.                                                                      |\n| **Layout Grid**                      | `4`           | Shows a column grid over the page, with its settings panel. See [Measure](measure.md#layout-grid).       |\n| **Responsive Mode · B: breakpoints** | `5`           | Shows the page in several device frames side by side. See [Responsive mode](responsive.md).              |\n| **Page Rulers**                      | `6`           | Shows rulers along the top and left edges, for guides. See [Measure](measure.md#page-rulers-and-guides). |\n| **Measure area (drag)**              | `7`           | Draws a measuring box. See [Measure](measure.md#measure-area).                                           |\n| **Capture Screenshot**               | `8`           | Takes a screenshot. See [Capture](capture.md).                                                           |\n| **More tools** (⋯)                   | `9`           | Opens the menu of less used tools.                                                                       |\n| **Toggle Side Panel**                | `0`           | Opens or closes the side panel. See [Side panel](side-panel.md).                                         |\n| **Resume**                           | `H`           | Shown only while paused.                                                                                 |\n| **Quit**                             | `Ctrl+Q`      | Turns PixelLens off for this tab.                                                                        |\n\nThe **More tools** button lights up while one of its tools is on, and shows a dot while an AI agent is connected.\n\n## More tools menu\n\n| Item                     | Key             | What it does                                                                                                                                            |\n| ------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |\n| **Design overlay**       | `O`             | Lays design images over the page. See [Design overlay](design-overlay.md).                                                                              |\n| **Page colors & fonts**  | `A`             | Lists every color, font and spacing value used on the page. See [Quality checks](quality.md#page-colors-and-fonts).                                     |\n| **Color Picker**         | `C`             | Picks a color from anywhere on screen and copies it.                                                                                                    |\n| **Vision simulator**     | `Y`             | Shows the page as seen with a color vision deficiency or blur.                                                                                          |\n| **Tab focus order**      | `T`             | Numbers the elements in keyboard Tab order.                                                                                                             |\n| **Core Web Vitals**      | `W`             | Shows LCP, CLS and INP live.                                                                                                                            |\n| **MCP**                  | —               | Connects an AI agent. Its label shows the state: **Connect Agent**, **Waiting for agent**, **MCP connected** or **MCP out of date**. See [MCP](mcp.md). |\n| **Pause**                | `H`             | Pauses PixelLens.                                                                                                                                       |\n| **Commands & shortcuts** | `Ctrl+K` or `?` | Opens the command palette.                                                                                                                              |\n\n## Command palette\n\nPress `Ctrl+K` (`Cmd+K` on macOS) or `?` to open **Commands**. It lists every tool with its key. Type to filter (**Search tools…**); the search ignores accents and also matches letters in order. Use `↑` `↓` to move, `Enter` to run, `Esc` to close.\n\n## All keys\n\n### Tools\n\n| Key            | Action                                                                                                             |\n| -------------- | ------------------------------------------------------------------------------------------------------------------ |\n| `1` … `9`, `0` | The dock buttons, as in the table above                                                                            |\n| `B`            | **Breakpoints**: lines at the page's media query widths. In responsive mode, switches to one frame per breakpoint. |\n| `O`            | **Design overlay**                                                                                                 |\n| `A`            | **Page colors & fonts**                                                                                            |\n| `C`            | **Color Picker**                                                                                                   |\n| `Y`            | Turns the vision simulator on (Deuteranopia) or off. Click the menu item to pick another mode.                     |\n| `T`            | **Tab focus order**                                                                                                |\n| `W`            | **Core Web Vitals**                                                                                                |\n| `H`            | **Pause** / **Resume**                                                                                             |\n| `Ctrl+K`, `?`  | Command palette                                                                                                    |\n| `Ctrl+Q`       | **Quit**                                                                                                           |\n| `Esc`          | Clears the selection; if nothing is selected, closes the open popover                                              |\n\n### Selection\n\n| Key                           | Action                                                           |\n| ----------------------------- | ---------------------------------------------------------------- |\n| `Alt+Shift+↑`                 | Select the parent element                                        |\n| `Alt+Shift+↓`                 | Select the child element (back down the same branch you came up) |\n| `Alt+Shift+←` / `Alt+Shift+→` | Select the previous / next sibling                               |\n| `Space`                       | Pin the floating inspector panel                                 |\n\n`Alt+Shift+S`, `Alt+Shift+↑` and `Alt+Shift+↓` are browser shortcuts. You can change them at `edge://extensions/shortcuts` (`chrome://extensions/shortcuts` in Chrome).\n\n### Editing the page\n\nThese work on the selected element while PixelLens is on. On macOS use `Cmd` instead of `Ctrl`.\n\n| Key                            | Action                                                                                                         |\n| ------------------------------ | -------------------------------------------------------------------------------------------------------------- |\n| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copy, cut, paste the selected element (with a text selection on the page, copy and cut stay the browser's own) |\n| `Ctrl+D`                       | Duplicate the selected element                                                                                 |\n| `Delete` / `Backspace`         | Delete the selected element                                                                                    |\n| `Ctrl+Z`                       | Undo                                                                                                           |\n| `Ctrl+Shift+Z`, `Ctrl+Y`       | Redo                                                                                                           |\n\nSee [Editing](editing.md) for what undo covers.\n\n### Inside tools\n\n- Measure box: arrows move it 1px (`Shift`: 10px), `Ctrl+arrows` grow it, `Ctrl+Alt+arrows` shrink it, `Esc` clears it.\n- Design overlay: arrows nudge the selected image 1px (`Shift`: 10px).\n- Page rulers: `Delete` or `Backspace` removes the clicked guide.\n- Capture: `Esc` closes; in markup, `P` `A` `R` `H` `T` pick a tool and `Ctrl+Z` undoes.\n\n## When keys are ignored\n\n- While you type in a text field, a select or an editable area, PixelLens leaves the keys alone.\n- While paused, every key goes to the page except `H` (resume) and `Ctrl+Q` (quit). The page keeps its own `Ctrl+K` and `?`.\n- While **Edit Text** is on, only **Inspector**, **Toggle Side Panel** and **Quit** stay usable.\n- During a capture, keys go to the capture tool, except `Ctrl+Q`.\n",
      '../docs/en/editing.md': `# Editing

PixelLens lets you change a page's CSS, text and markup right in the browser, then copy the result as code. Edits only change the page in your browser; they never touch the site's files.

Editing lives in the side panel's **Element** tab (press \`0\`) and works on the selected element.

## Editing CSS

The **CSS** section lists, like DevTools: \`element.style\` (the inline style) first, then the matched rules in cascade order, then inherited rules (**Inherited from …**).

- Click a property or value to edit it. \`Enter\` in a property moves to its value; \`Enter\` in a value applies it and moves to the next line; \`Esc\` leaves the field.
- Property names suggest completions as you type: \`↑\` \`↓\` to choose, \`Enter\` or \`Tab\` to accept.
- In a numeric value, \`↑\` / \`↓\` change the number by 1, with \`Shift\` by 10, with \`Alt\` by 0.1.
- The checkbox before a declaration (**Turn this declaration on or off**) disables it without deleting it.
- A rule's selector can be edited when the rule is editable: \`Enter\` applies, \`Esc\` restores it.
- **Filter** keeps only rules whose selector or property names match.
- **Add Rule** (the + button) adds a new rule for the selected element.
- **.cls** (**Classes**) shows a field to edit the element's classes, with suggestions from the page.

Markers explain each line:

- A red dot and **Unknown property** or **Invalid value** for something the browser rejects.
- Struck-through with **Overridden by …** when another rule wins.
- Dimmed with **Not inherited by this element** for an inherited property that does not apply.
- An amber dot with **Overridden by a stylesheet PixelLens can't read** when a cross-origin stylesheet wins. Use **Grant access** to let PixelLens read such stylesheets ("Some styles may be missing.").

## Force states

The **Force state** chips force a pseudo-class on the selected element: \`:hover\`, \`:focus\`, \`:focus-visible\`, \`:focus-within\`, \`:active\`, \`:visited\`. Dimmed chips mean **No rule uses this state on this element**. Click a chip again to release it. Forced states are dropped when you deselect the element.

## Editing text

**Edit Text** (the T button in the edit toolbar) makes the page's text editable: click anywhere and type. Click it again to stop. While it is on, the other edit buttons are disabled and only **Inspector**, **Toggle Side Panel** and **Quit** work on the dock.

## Editing elements

The edit toolbar acts on the selected element:

| Button        | Key                   | Action                                                      |
| ------------- | --------------------- | ----------------------------------------------------------- |
| **Copy**      | \`Ctrl+C\`              | Copy the element                                            |
| **Cut**       | \`Ctrl+X\`              | Cut the element                                             |
| **Paste**     | \`Ctrl+V\`              | Paste the copied element (enabled once something is copied) |
| **Duplicate** | \`Ctrl+D\`              | Duplicate the element                                       |
| **Delete**    | \`Delete\`, \`Backspace\` | Delete the element                                          |

On macOS use \`Cmd\`. When text is selected on the page, \`Ctrl+C\` and \`Ctrl+X\` keep their normal browser meaning.

## Undo and redo

**Undo** and **Redo** in the edit toolbar, or \`Ctrl+Z\`, \`Ctrl+Shift+Z\` and \`Ctrl+Y\` (on the page or in the side panel), step through text, markup and class edits.

CSS rule and inline style edits are not part of that history. To take one back, edit the value again or revert it in the **Changes** list.

## Saved per site

PixelLens remembers your CSS rule edits and inline style edits for each site (each origin; for local files, each file path) and puts them back the next time you turn PixelLens on there. A message such as **3 saved edits restored** confirms it. Text and markup edits are not saved.

To forget every saved edit, open [Settings](settings.md) and use **Clear** next to **Saved edits**.

## The Changes list

The **Changes** tab lists every change on the page, grouped by element (**1 Element**, **3 Elements**):

- Each group shows the element and its number of rules changed. Click the element to select it on the page.
- Each changed rule shows its source file and a before/after diff. The revert button on a rule undoes that change.
- The trash button on a group discards every change on that element, after a confirmation.
- Markup changes are listed with the group too. Changes that only touch whitespace are marked **Whitespace-only changes**.
- **Clear All Changes** discards every change on the page, after a confirmation.

When there are none, the tab shows **No changes found**.

## Copy all

**Copy all** copies every change as code, in the format picked next to it (**Export format**):

- **CSS**: the changed rules as CSS.
- **Tailwind**: the changes as Tailwind classes.
- **AI prompt**: a prompt describing the changes and the page URL, ready to paste into an AI coding assistant.
`,
      '../docs/en/getting-started.md': `# Getting started

PixelLens is a toolkit for inspecting, measuring and adjusting web pages, right on the page. It runs in Microsoft Edge and other Chromium-based browsers, version 116 or newer.

## Install

### From Edge Add-ons

PixelLens is being published on Edge Add-ons. Once the listing is live, open it in Edge and choose **Get**. Until then, use the developer install below.

### Load unpacked (developers)

You need Node 22.12 or newer and pnpm (through corepack).

\`\`\`sh
corepack pnpm install
corepack pnpm build
\`\`\`

The build lands in \`.output/chrome-mv3\`. Then:

1. Open \`edge://extensions\` (or \`chrome://extensions\`).
2. Turn on **Developer mode**.
3. Choose **Load unpacked** and pick the \`.output/chrome-mv3\` folder.

The build carries the Edge Add-ons key, so the extension ID is always \`bkgdfebicmlicjnkgbemlidlnpbnaofh\`, the same as the store version. This matters when you connect an AI agent (see [MCP](mcp.md)).

## Turn PixelLens on

PixelLens does nothing on a tab until you turn it on there. Any of these toggles it on or off for the current tab:

- Click the PixelLens icon in the browser toolbar. The icon is colored while PixelLens is on in that tab and grey while it is off.
- Press \`Alt+Shift+S\`.
- Right-click anywhere on the page and choose **PixelLens** from the context menu.

PixelLens turns off when the tab loads a new page (a reload or a navigation). Turn it on again to continue. Tools you left on, such as the inspector, X-Ray, rulers, breakpoints and the layout grid, come back the next time you turn it on.

PixelLens cannot run on browser pages (\`edge://\`, \`chrome://\`), extension pages or the extension stores. See [Troubleshooting](troubleshooting.md).

## The dock

When PixelLens is on, a toolbar called the dock appears at the bottom center of the page. Every tool starts from it. Hover a button to see its name and shortcut. The less used tools sit behind the **More tools** button (⋯).

The full list of buttons and keys is in [Dock and shortcuts](dock-and-shortcuts.md).

## Pause and quit

- **Pause** (in the **More tools** menu, key \`H\`) hides everything PixelLens draws and gives the page back its mouse and keyboard, without losing your state. While paused, the dock shrinks to **Resume** and **Quit**. Press \`H\` or click **Resume** to continue.
- **Quit** (the X at the right end of the dock, or \`Ctrl+Q\`) turns PixelLens off for the tab and closes its side panel.

## Welcome tour

The first time you open PixelLens, a short tour points at the dock in four steps: **Your toolbar**, **Number keys**, **More tools** and **Ctrl+K anywhere**. Use **Next** to go on, **Skip** to close it, and **Got it** on the last step. To see it again, open [Settings](settings.md) and choose **Show again** next to **Welcome tour**.

## First steps

- Press \`1\` to turn on the **Inspector**, then hover the page: each element shows its size, spacing and a floating info panel. Click to select an element. See [Inspect](inspect.md).
- Press \`Space\` while the info panel is shown to pin it to the page.
- Press \`Ctrl+K\` (or \`?\`) to search every tool by name and run it with \`Enter\`.
- Press \`0\` to open the side panel with the full details of the selected element and of the page. See [Side panel](side-panel.md).
- Press \`Esc\` to clear the selection or close the open popover.
`,
      '../docs/en/inspect.md':
        "# Inspect\n\n## Inspector\n\nPress `1` or click **Inspector** to turn hover inspecting on. PixelLens remembers this choice for the next time you turn it on.\n\nWhile the inspector is on:\n\n- Hovering an element outlines it, shades its margin (orange) and padding (green), shows its width and height, and labels it with `tag#id.class` below the element.\n- Clicks, presses and context menus on the page are held back, so page menus and links do not fire while you inspect.\n- Click an element to select it. Click it again to deselect it, or press `Esc`.\n- The selected element gets a frame and guide lines through its edges across the page.\n\nTurning the inspector off keeps the selection (the side panel still uses it) but stops drawing it, and removes every pinned panel.\n\n## Floating info panel\n\nNext to the hovered or selected element, a floating panel shows:\n\n- **Box Model**: `width`, `height`, `display`, `gap`, `margin`, `padding`, `box-sizing`.\n- **Appearance**: `border-radius`, `background-color`, `color`, with color swatches.\n- **Text**: `font-family` (the font actually rendered), `font-size`, `font-weight`, `line-height` (as a ratio of the font size), `letter-spacing`, `text-align`.\n- **Accessibility**: for text, the **Contrast** ratio with an `Aa` sample and the level reached (AAA, AA, or AA in red when it fails), plus **Suggested:** AA and AAA text colors. Click a suggestion to copy it.\n- **Image**: for images, **Natural size**, **File size** and **Format**.\n\nDefault values (zero margins, `normal` letter spacing and so on) are left out. Colors use the color format from [Settings](settings.md).\n\n**Copy CSS** at the top copies the element's CSS.\n\n## Pinning\n\nPress `Space` while the floating panel is shown to pin it. A pinned panel stays on the page at that spot and scrolls with it, so you can compare several elements:\n\n- Drag a pinned panel by its header to move it; resize it from its corner.\n- Hovering a pinned panel highlights its element on the page.\n- Close it with its close button.\n\nUntil you pin your first panel, the floating panel ends with the hint **Press Space to pin**.\n\n## Moving the selection\n\n- **Select Parent** / **Select Child** on the dock, or `Alt+Shift+↑` / `Alt+Shift+↓`. Going down after going up returns along the same branch.\n- `Alt+Shift+←` / `Alt+Shift+→` select the previous and next sibling.\n- The side panel header has the same parent and child buttons.\n\n## Distances\n\nWith an element selected and the inspector on, hover another element: PixelLens draws the gaps between the two, with the distance in pixels on each line.\n\n## X-Ray Mode\n\nPress `3` or click **X-Ray Mode** to outline every element on the page, one color per nesting level. Hidden elements and SVG internals are skipped. It also reaches into open shadow roots. PixelLens remembers whether X-Ray was on.\n\n## Find Element\n\nPress `2` or click **Find Element** and type a **CSS Selector** such as `.class`, `#id` or `tag`. The search runs as you type, also inside open shadow roots:\n\n- Matches are highlighted on the page and the current one scrolls into view.\n- The title shows the position, such as `2/7`, and how many matches are hidden (for example `3 hidden`).\n- **Previous** and **Next** step through the matches.\n- Closing the box removes the highlights. The query is kept for next time.\n\nAn invalid selector simply finds nothing. In responsive mode the search runs in every frame and the counts add up.\n",
      '../docs/en/mcp.md':
        '# MCP (AI agents)\n\nPixelLens can be driven by an AI agent (Claude Code, Cursor or any other client that speaks the Model Context Protocol). The agent can read pages, inspect elements, apply CSS, switch to responsive mode and take screenshots, through the same tools you use.\n\n## How it works\n\n```\nagent ⇄ (stdio, MCP) ⇄ PixelLens MCP server ⇄ (WebSocket) ⇄ extension ⇄ tab\n```\n\nThe MCP server is a small Node program that runs on your computer. The agent starts it, and the extension connects to it at `ws://127.0.0.1:47347/pixellens`. Nothing leaves your machine.\n\n## Build the server\n\nThe server lives in the repository as `packages/mcp-server` (`@pixellens/mcp-server`). It needs Node 18 or newer. From a checkout:\n\n```sh\ncorepack pnpm install\ncorepack pnpm --filter @pixellens/mcp-server build\n```\n\nThe program is then `packages/mcp-server/dist/cli.js`.\n\n## Connect\n\n1. Turn PixelLens on in a tab.\n2. Open **More tools** and choose **Connect Agent** (the MCP item).\n3. The popover shows **Paste this into your AI agent to connect it:** followed by a ready-made prompt that carries a pairing token (created once and kept on this device). Copy it with the copy button.\n4. Click **Connect**.\n5. Paste the prompt into your agent, or add the server to its configuration yourself (examples below).\n6. While PixelLens waits, the item reads **Waiting for agent** (**Waiting for your agent…** in the popover). Once the agent\'s server is running, it reads **MCP connected** and the popover shows the agent\'s name and version and the server version. The **More tools** button shows a dot.\n\n**Disconnect** in the same popover closes the connection. You can also connect and disconnect from [Settings](settings.md) (**MCP Server** under **Terminal AI**).\n\nThe copied prompt looks like this:\n\n```\nAdd the PixelLens MCP server to this agent. Command: npx -y @pixellens/mcp-server --extension-id bkgdfebicmlicjnkgbemlidlnpbnaofh\nwith environment variable PIXELLENS_MCP_TOKEN=<token> (stdio transport, requires Node 18 or newer).\nAfter adding it, call its ping tool to verify the connection.\n```\n\nThe server needs two things:\n\n- `--extension-id`: the PixelLens extension ID, `bkgdfebicmlicjnkgbemlidlnpbnaofh` for both the store version and unpacked builds.\n- `PIXELLENS_MCP_TOKEN`: the token from the copied prompt.\n\n## Configuration examples\n\n### Claude Code (`.mcp.json`)\n\nWith a local build:\n\n```json\n{\n  "mcpServers": {\n    "PixelLens": {\n      "command": "node",\n      "args": [\n        "/path/to/ruler/packages/mcp-server/dist/cli.js",\n        "--extension-id",\n        "bkgdfebicmlicjnkgbemlidlnpbnaofh"\n      ],\n      "env": { "PIXELLENS_MCP_TOKEN": "<token>" }\n    }\n  }\n}\n```\n\n### Other clients\n\nAny MCP client that can start a stdio server works. Give it:\n\n- command: `node`\n- arguments: `/path/to/ruler/packages/mcp-server/dist/cli.js --extension-id bkgdfebicmlicjnkgbemlidlnpbnaofh`\n- environment variable: `PIXELLENS_MCP_TOKEN=<token>`\n\nAfter adding it, ask the agent to call the `ping` tool to check the connection.\n\n## Security model\n\n- **Opt-in**: the extension opens no connection until you press **Connect**. **Disconnect** closes it at once.\n- **Local only**: the server listens on `127.0.0.1` only.\n- **Origin check**: the server accepts only connections from the PixelLens extension\'s origin, which a web page cannot fake.\n- **Pairing token**: a random 43-character token, stored only on this device, proves to the extension that it talks to your server. Neither side logs it.\n- **Tab scope**: the agent only sees tabs where you turned PixelLens on. It cannot turn PixelLens on in other tabs.\n\n## Edits made by the agent\n\nAgent edits go through the same path as yours: they appear in the side panel\'s **Changes** list and are saved per site. Markup, text and class edits join the undo history (`Ctrl+Z`); CSS edits are reverted from the **Changes** list or with `revert_css_change` / `revert_all_edits`.\n\n## Command reference\n\nThe server offers one tool per command, plus `ping`. Every command except `list_tabs` and `fetch_stylesheet` takes a `tabId` from `list_tabs`. In responsive mode, element and edit commands accept an optional `viewportId` to target a frame.\n\n| Command                     | What it does                                                                |\n| --------------------------- | --------------------------------------------------------------------------- |\n| `list_tabs`                 | Lists the tabs where PixelLens is on                                        |\n| `focus_tab`                 | Brings a PixelLens tab to the front                                         |\n| `fetch_stylesheet`          | Downloads a public stylesheet by URL (needs access to all sites)            |\n| `get_page_info`             | URL, title, language, meta, H1, viewport, page size, scroll and pixel ratio |\n| `get_selected_element`      | Summary of the element you selected                                         |\n| `get_element_details`       | Details of one element                                                      |\n| `get_elements_details`      | Details of up to 50 elements                                                |\n| `get_element_outline`       | Tree outline of an element or the page                                      |\n| `query_selector`            | Finds elements by CSS selector                                              |\n| `get_element_matched_rules` | CSS rules matching an element, plus its inline style                        |\n| `get_breakpoints`           | The page\'s media query breakpoints                                          |\n| `get_seo_issues`            | SEO issues of the page                                                      |\n| `get_meta_tags`             | Meta tags of the page                                                       |\n| `get_page_weight`           | Transferred size by resource type                                           |\n| `get_css_custom_properties` | CSS variables of the page                                                   |\n| `detect_technologies`       | Frameworks and libraries detected                                           |\n| `get_typography`            | Typography of an element                                                    |\n| `get_colors`                | Colors of an element                                                        |\n| `get_assets`                | Images and SVGs in an element                                               |\n| `get_layout`                | Flex or grid layout of an element                                           |\n| `get_tailwind`              | Tailwind classes for an element\'s CSS                                       |\n| `calculate_specificity`     | Specificity of a selector                                                   |\n| `force_element_state`       | Forces a pseudo-class (`:hover` … `:visited`) or clears it                  |\n| `get_a11y_issues`           | Accessibility (contrast) issues, grouped                                    |\n| `enter_responsive_mode`     | Turns responsive mode on                                                    |\n| `exit_responsive_mode`      | Turns responsive mode off                                                   |\n| `get_viewport`              | Current viewport(s)                                                         |\n| `set_viewport`              | Sets a frame\'s width and height                                             |\n| `set_viewports`             | Replaces the frames (1 to 20)                                               |\n| `add_viewport`              | Adds a frame                                                                |\n| `remove_viewport`           | Removes a frame                                                             |\n| `set_zoom`                  | Sets the responsive zoom (0.25 to 2)                                        |\n| `set_breakpoints_mode`      | Turns breakpoint frames on or off                                           |\n| `get_my_edits`              | All edits on the page (rule and markup changes)                             |\n| `set_text_content`          | Replaces an element\'s text                                                  |\n| `set_inner_html`            | Replaces an element\'s HTML (sanitized)                                      |\n| `insert_html`               | Inserts HTML before, after, or inside an element (sanitized)                |\n| `select_element`            | Selects an element in the inspector                                         |\n| `get_screenshot`            | Screenshot of the tab as a PNG (longest side up to 2000 px)                 |\n| `apply_styles`              | Sets CSS on a matched rule or on the element\'s inline style                 |\n| `add_rule`                  | Adds a CSS rule                                                             |\n| `set_rule_selector`         | Changes a rule\'s selector                                                   |\n| `revert_css_change`         | Reverts one CSS change                                                      |\n| `revert_all_edits`          | Reverts every edit and clears the edits saved for the site                  |\n| `set_element_classes`       | Sets an element\'s classes                                                   |\n| `delete_element`            | Deletes an element                                                          |\n| `duplicate_element`         | Duplicates an element                                                       |\n\nThe full payload of each command is in `docs/mcp-protocol.md` in the repository.\n\n## Troubleshooting\n\n- **Stays on Waiting for agent**: the server is not running. Check that the agent started it (its MCP list or logs), that the path to `cli.js` is right and that Node 18+ is installed.\n- **The server exits at once**: port 47347 is already taken (another copy of the server is running), the token is missing or malformed, or `--extension-id` is missing. The server prints the reason.\n- **The connection is refused**: the token in the agent\'s configuration does not match the one PixelLens shows, or the extension ID is wrong. Copy the prompt again and update the configuration. After a refusal, press **Connect** again.\n- **MCP out of date**: the server is older than the extension expects. Rebuild it or restart your agent so it starts the new version.\n- **"PixelLens is not active on this tab."**: turn PixelLens on in that tab; the agent only reaches tabs where it is on.\n',
      '../docs/en/measure.md': `# Measure

## Page rulers and guides

Press \`6\` or click **Page Rulers** to show pixel rulers along the top and left edges of the window. A crosshair on each ruler follows the pointer. PixelLens remembers whether the rulers were on.

Creating guides:

- Drag from the top ruler to make a vertical guide.
- Drag from the left ruler to make a horizontal guide.
- Drag from the corner where the rulers meet to make both at once.

While you drag, a guide snaps to the edges and the center of the element under the pointer. Each guide shows its position in page pixels, and the distance between neighbouring guides is shown between them.

Changing and removing guides:

- Drag a guide to move it (the cursor changes when you are over one).
- Drag a guide back onto the ruler it came from to remove it.
- Double-click a guide to remove it.
- Click a guide to select it, then press \`Delete\` or \`Backspace\`. \`Esc\` or a click elsewhere drops the selection.

Guides stay for as long as PixelLens is on in the tab, but they are only shown while the rulers are on.

## Measure area

Press \`7\` or click **Measure area (drag)**, then drag on the page to draw a box. The box shows its size (\`W × H\`) and its \`x\` / \`y\` position on the page.

- Drag inside the box to move it; drag a corner to resize it.
- Arrows move the box 1px (\`Shift\`: 10px), \`Ctrl+arrows\` expand it, \`Ctrl+Alt+arrows\` shrink it.
- \`Esc\` clears the box.

The **Measure** panel lets you type exact values:

- **Left / Top**: the box position from the page's left and top edges.
- **To right / bottom edge**: the distance from the box to the page's right and bottom edges.
- \`Shift+↑\` / \`Shift+↓\` in a field steps by 10.
- **Box color** sets the box color.
- **Edge guides** extends the box edges across the page.
- **Clear** removes the box.

Box color and edge guides are remembered.

## Layout Grid

Press \`4\` or click **Layout Grid** to show a column grid over the page together with its settings panel. Pressing again (or closing the panel) turns the grid off.

| Setting       | Range                               | Default   |
| ------------- | ----------------------------------- | --------- |
| **Columns**   | 1 to 24                             | 8         |
| **Max Width** | a number in px, or empty for \`auto\` | \`auto\`    |
| **Gutter**    | 0 to 100 px                         | 20        |
| **Margin**    | 0 to 350 px                         | 40        |
| **Color**     | color picker or hex value           | \`#FC48FF\` |
| **Opacity**   | 5% to 100%                          | 30%       |

The grid is centered in the window. Settings are saved, and the grid comes back on the next time you turn PixelLens on if you left it on.

## Breakpoints

Press \`B\` to show the page's breakpoints: a vertical line at every width used in a \`min-width\` or \`max-width\` media query, labelled \`≥768px\`, \`≤767px\` and so on. Green lines are \`min-width\`, cyan lines are \`max-width\`, amber lines are used as both.

The tool rescans each time you turn it on and when a new stylesheet loads. Stylesheets served from another origin (a CDN) can only be read after you allow access to all sites; see [Privacy and permissions](privacy-permissions.md).

Breakpoints has no dock button of its own outside responsive mode. In [Responsive mode](responsive.md#breakpoints) the toolbar has a **Breakpoints** button and \`B\` shows one frame per breakpoint instead.
`,
      '../docs/en/privacy-permissions.md': `# Privacy and permissions

PixelLens does not collect, sell or share personal data. There is no analytics, tracking, advertising or telemetry, no account and no server run by the developer. Page data (styles, colors, fonts, screenshots) is processed inside your browser and shown only to you.

The full text is in the [privacy policy](privacy-policy).

## When PixelLens runs

PixelLens runs on a tab only after you turn it on for that tab. It has no standing access to the sites you visit: the extension declares no site access up front, and its script is added to a tab only when you click the icon, press \`Alt+Shift+S\` or use the context menu.

## Permissions

| Permission                                   | Why                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| \`activeTab\`, \`scripting\`                     | Run the toolkit on the tab where you turn it on                                        |
| \`storage\`                                    | Save your preferences and saved edits                                                  |
| \`sidePanel\`                                  | Show element and page details in the side panel                                        |
| \`contextMenus\`                               | The **PixelLens** item in the page's context menu and **Settings** on the toolbar icon |
| \`debugger\`                                   | Full-page screenshots, only when you take one; detached right after                    |
| \`declarativeNetRequestWithHostAccess\`        | Responsive mode: let the current page load inside its own preview frames on that tab   |
| Optional: access to all sites (\`<all_urls>\`) | Requested only for responsive mode and reading cross-origin stylesheets                |
| Optional: \`downloads\`                        | Requested when you download assets or the social preview image from the side panel     |
| Optional: \`clipboardWrite\`                   | Requested only if the browser refuses a copy                                           |

Optional permissions are asked for at the moment you use the feature, and you can refuse them; the rest of PixelLens keeps working.

## Network access

- The optional MCP feature connects only to \`ws://127.0.0.1\` on your own computer, and only after you press **Connect**. It is protected by a token and the extension's origin. See [MCP](mcp.md#security-model).
- To read a page's stylesheets, PixelLens may download those same stylesheets from the site you are viewing (only with access to all sites granted).

## What is stored

- **Preferences** (theme, tool settings, panel layout) are kept in the browser's extension storage. If browser sync is on, the browser syncs them between your devices; PixelLens never sees or controls that sync.
- **Saved CSS edits** for each site stay on your device only.
- **The MCP token** stays on your device only.

None of this is sent to the developer or to anyone else. Details: [Settings](settings.md#what-is-stored-where).
`,
      '../docs/en/quality.md': `# Quality checks

Tools for checking a page's colors, fonts, accessibility and performance. Most sit in the **More tools** menu.

## Page colors and fonts

Choose **Page colors & fonts** in **More tools**, or press \`A\`. The **Page styles** panel scans the page and has three tabs, each with its count:

- **Colors**: every color used.
- **Typography**: every font combination used.
- **Spacing**: every spacing value used. Values that are not multiples of 4px are shown in red, with a note of how many there are.

In each tab:

- Click a row to highlight the elements that use that value (up to 400); the first one scrolls into view.
- The copy button on a row copies its value; **All** copies every row of the tab.
- **Rescan** reads the page again.

## Color picker

Choose **Color Picker** in **More tools**, or press \`C\`. The PixelLens UI hides and the browser's color picker opens: click anywhere on screen to pick a color, or press \`Esc\` to cancel. The color is copied to the clipboard and shown briefly on the dock.

The color is written in the format chosen in [Settings](settings.md) (**Color Format**):

| Format   | Example              |
| -------- | -------------------- |
| HEX/HEXA | \`#3B82F6\`            |
| RGB/RGBA | \`rgb(59, 130, 246)\`  |
| HSL/HSLA | \`hsl(217, 91%, 60%)\` |
| HSB/HSBA | \`hsb(217, 76%, 96%)\` |

The same format is used by the inspector panel and the side panel. The color picker needs a browser with the EyeDropper API (Edge and Chrome have it).

## Contrast and WCAG suggestions

Contrast is checked in two places:

- The inspector's floating panel (**Accessibility**) shows the **Contrast** ratio of the hovered or selected text and the level it reaches: AAA, AA, or AA in red when it fails.
- The side panel's **Issues** section lists contrast failures in the selected element and its children, with the ratio found and the ratio required. Normal text needs 4.5:1 for AA and 7:1 for AAA; large text needs 3:1 and 4.5:1; icons and other non-text elements need 3:1 (WCAG 1.4.11).

Both show **Suggested:** text colors that would reach AA and AAA. Click one to copy it.

## Vision simulator

Choose **Vision simulator** in **More tools** and pick a mode:

- **Normal vision**
- **Protanopia (no red)**
- **Deuteranopia (no green)**
- **Tritanopia (no blue)**
- **Achromatopsia (no color)**
- **Blurred vision**

The filter applies to the whole page. Key \`Y\` toggles **Deuteranopia (no green)** on and off.

## Tab focus order

Choose **Tab focus order** in **More tools**, or press \`T\`. Every element you can reach with the \`Tab\` key gets an outline and a number, and a dashed line joins them in order. The numbers update as the page changes.

## Core Web Vitals

Choose **Core Web Vitals** in **More tools**, or press \`W\`. A chip at the top left shows the live values, each colored by its rating (green good, orange needs improvement, red poor):

| Metric                          | Good          | Poor         |
| ------------------------------- | ------------- | ------------ |
| LCP (Largest Contentful Paint)  | up to 2500 ms | over 4000 ms |
| CLS (Cumulative Layout Shift)   | up to 0.1     | over 0.25    |
| INP (Interaction to Next Paint) | up to 200 ms  | over 500 ms  |

On the page, the LCP element gets a dashed outline, and the elements that shifted the most (up to 30) are outlined with their CLS share. INP appears after you interact with the page.
`,
      '../docs/en/responsive.md': `# Responsive mode

Responsive mode shows the current page in several frames of different sizes, side by side, in the same tab. The PixelLens tools work inside every frame at once.

## Turn it on

Press \`5\` or click **Responsive Mode · B: breakpoints** on the dock. Press again to leave. While it is on, video and audio on the page are paused.

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
- **Color Scheme**: cycles **System**, **Light** and **Dark** (the \`prefers-color-scheme\` the frame sees).
- **Remove Viewport**, after a confirmation.
- **More Actions**: **Refresh**, **Rotate**, **Color Scheme** and **Remove Viewport**.

Drag a frame's right edge, bottom edge or bottom-right corner to resize it.

## Tools in frames

Tools you switch on from the dock or with their keys run in every frame: inspector, X-Ray, layout grid, rulers, measure, design overlay and color picker. Select an element in any frame; the side panel then follows that frame. **Find Element** searches all frames and adds up the counts.

**Capture Screenshot** works on the whole view; its **Element** mode captures the element selected in a frame. **Capture full page** is not available in responsive view.

## Breakpoints

With the breakpoints tool on (key \`B\`, or the **Breakpoints** toolbar button), the frames are rebuilt with one frame per breakpoint width of the page, each marked with its breakpoint (\`≥768px\`, \`≤767px\`). The button is disabled when the page declares no breakpoints. **Add Viewport** is not available in this mode.

## Pages that block the preview

Many sites forbid being shown inside a frame. To load them anyway, PixelLens needs access to all sites, which it asks for only here. A blocked frame shows **This site blocks loading in the preview. Grant access to show it.** Click **Grant access** and accept the browser prompt; the frames reload.

With that permission, PixelLens removes the blocking response headers only for the frames of this tab, and only while responsive mode is on.

Some sites block framing with a script or an in-page policy that cannot be removed. Those show **This site blocks loading in the preview. It does this with a script or an in-page policy that can't be stripped.** A frame that never finishes loading shows **This page did not finish loading.**
`,
      '../docs/en/settings.md': `# Settings

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
`,
      '../docs/en/side-panel.md': `# Side panel

The side panel shows the full details of the selected element and of the page, and holds the editing tools.

## Open it

Press \`0\` or click **Toggle Side Panel** on the dock. If the browser has no side panel support, the button reads **Side Panel Not Supported in This Browser** and stays disabled.

## Top bar

- Three tabs: **Element**, **Page** and **Changes**. The **Changes** tab shows a count while you have edits.
- The gear button opens **Settings**.
- **Open in a window** moves the panel into its own window; **Move to side panel** puts it back.

Every section can be collapsed by clicking its title. Sections start closed, and PixelLens remembers which ones you opened.

## Element tab

With nothing selected, the tab says **Pick an element on the page to see its details** and lists the shortcuts **Toggle Extension**, **Select Parent**, **Select Child**, **Toggle Panel** and **Deselect**.

With an element selected, from top to bottom:

- **Edit toolbar**: **Edit Text**, **Copy**, **Cut**, **Paste**, **Duplicate**, **Delete**, **Undo**, **Redo**. See [Editing](editing.md).
- **Force state** chips (\`:hover\`, \`:focus\`, \`:focus-visible\`, \`:focus-within\`, \`:active\`, \`:visited\`). See [Editing](editing.md#force-states).
- **Header**: the element's name, with **Select Parent** and **Select Child** buttons. Click the name to scroll the page to the element.
- **Box Model**: margin, border, padding and content sizes. Hovering a part highlights it on the page. For a \`<canvas>\`, **Canvas** shows the **Context Type**, **Canvas Dimensions** and **Pixel Ratio**.
- **Issues**: contrast problems in the element and its children, grouped, with the ratio found, the ratio required and the WCAG level. **Previous** / **Next** step through the **Instances** of an issue and highlight each on the page. Icons are checked against the 3:1 non-text rule (WCAG 1.4.11).
- **CSS**: the matched rules, editable. See [Editing](editing.md#editing-css).
- **Layout**: for flex and grid containers, the \`display\` value, the grid size (columns × rows) and the flex or grid properties in use.
- **Typography Style**: the text styles used in the element, with their font properties.
- **Colors**: text, background and border colors. The **HEX** / **RGB** / **HSL** / **HSB** buttons switch the format; click a value to copy it.
- **Gradients** and **Box Shadow**, when the element has them.
- **Animation** and **Transition**: the animations and transitions on the element, with a curve preview of the easing.
- **Text Content**: the element's text.
- **Assets**: images, background images and inline SVGs in the element, with a preview, **Download** for each and **Download All**.
- **Code**: the element's CSS in three views: **Computed**, **Source** (the matched rules as written) and **Tailwind** (Tailwind classes converted from the computed CSS).

When some stylesheets come from another origin, the panel shows how many are hidden and a **Grant access** button that lets PixelLens read them. See [Privacy and permissions](privacy-permissions.md).

## Page tab

- **Header**: the page title and URL, with **Refresh** to read the page again.
- **Social Preview**: how a shared link looks on **Facebook**, **X** and **LinkedIn**, with a download button. Shown when the page has an \`og:image\`.
- **Meta Tags**: grouped as **SEO**, **Open Graph** and **Twitter Card**.
- **Technologies**: frameworks and libraries detected on the page.
- **CSS Variables**: the custom properties set on \`:root\`, grouped by prefix, with a **Filter variables** box. You can edit a value: press \`Enter\` to apply, \`Esc\` to cancel; clearing a value goes back to the stylesheet's value. Colors show a swatch. Long lists are capped; filter to narrow them down.
- **SEO Issues**: missing or weak title, description, H1, canonical link, viewport tag, \`lang\` attribute, \`noindex\`, image \`alt\` text and Open Graph tags, each with a recommendation. Click an item to highlight the element on the page.
- **Page Weight**: transferred size by type: **Document**, **Scripts**, **Stylesheets**, **Images**, **Fonts**, **Media**, **Fetch/XHR**, **Other**. Cross-origin resources whose size the browser hides are counted separately.

## Changes tab

The list of every edit you made on the page, with export and revert. See [Editing](editing.md#the-changes-list).

## In responsive mode

The panel follows the frame that holds the selection. See [Responsive mode](responsive.md).
`,
      '../docs/en/troubleshooting.md': `# Troubleshooting

## Nothing happens when I click the icon

PixelLens cannot run on:

- browser pages such as \`edge://\` and \`chrome://\` (settings, new tab page, extensions),
- extension pages,
- the Chrome Web Store and Edge Add-ons pages.

It runs on \`http\`, \`https\`, \`ftp\` and \`file\` pages. On the pages above, the icon and \`Alt+Shift+S\` simply do nothing.

A tab that the browser has put to sleep (discarded) must be reloaded first.

## It turned off after a reload

That is expected: PixelLens is turned on per page view, and a reload or a navigation turns it off. Turn it on again; the tools you left on come back, and saved CSS edits are restored.

## Local files (file://)

To use PixelLens on local files, allow it in the browser: open \`edge://extensions\` (or \`chrome://extensions\`), choose **Details** under PixelLens and turn on **Allow access to file URLs**. Saved edits for local files are kept per file path.

## Frames on the page (iframes)

The inspector and the other tools work on the page you turned PixelLens on in; they do not reach into iframes embedded by that page. Responsive mode is the exception: its own preview frames get the tools.

## Some styles are missing in the side panel

Stylesheets from another origin (a CDN, for example) cannot be read without extra permission. The side panel then shows how many are hidden, or marks properties with **Overridden by a stylesheet PixelLens can't read**. Click **Grant access** and accept the browser prompt to allow access to all sites. The breakpoints tool also needs it to see breakpoints in such stylesheets.

## Responsive frames stay blank

The site forbids being shown inside a frame. Click **Grant access** in the frame and accept the prompt; PixelLens then removes the blocking headers for that tab's preview frames. If the frame says **It does this with a script or an in-page policy that can't be stripped**, the site cannot be previewed this way. See [Responsive mode](responsive.md#pages-that-block-the-preview).

## Copy does not work in Capture

Copying an image needs a secure (HTTPS) page. On other pages, use **Save**.

## Full page capture is slow or shows a warning

The fast capture fails when DevTools is open on the tab. Close DevTools and capture again; otherwise PixelLens falls back to scrolling and stitching.

## Keys do nothing

- PixelLens may be paused: the dock then shows only **Resume** and **Quit**. Press \`H\`.
- Keys are ignored while the focus is in a text field.
- While **Edit Text** is on, only **Inspector**, **Toggle Side Panel** and **Quit** work.
- The browser shortcuts (\`Alt+Shift+S\`, \`Alt+Shift+↑\`, \`Alt+Shift+↓\`) may clash with another extension. Check them at \`edge://extensions/shortcuts\`.

## The color picker does nothing

It needs the browser's EyeDropper API, available in current Edge and Chrome.

## The side panel button is disabled

Your browser does not support the side panel (**Side Panel Not Supported in This Browser**).

## Reset

- Saved CSS edits: **Settings** → **Saved edits** → **Clear**.
- Edits on the current page: side panel → **Changes** → **Clear All Changes**.
- Responsive frames: **Reset Viewports** in the responsive toolbar.
- Welcome tour: **Settings** → **Welcome tour** → **Show again**.
- Everything else: removing and reinstalling the extension clears all of its stored data.
`,
    }),
  ).map(([e, t]) => [e.slice(e.lastIndexOf(`/`) + 1, -3), t]),
);
export { e as default };
