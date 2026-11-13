# Dock and shortcuts

## Dock buttons

The dock groups its buttons by purpose. From left to right:

| Button                               | Key           | What it does                                                                                             |
| ------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------- |
| **Select Parent**                    | `Alt+Shift+↑` | Moves the selection to the parent element. Shown only while an element is selected.                      |
| **Select Child**                     | `Alt+Shift+↓` | Moves the selection back down to a child element. Shown only while an element is selected.               |
| **Inspector**                        | `1`           | Turns hover inspecting on or off. See [Inspect](inspect.md).                                             |
| **Find Element**                     | `2`           | Opens a box to find elements by CSS selector.                                                            |
| **X-Ray Mode**                       | `3`           | Outlines every element on the page.                                                                      |
| **Layout Grid**                      | `4`           | Shows a column grid over the page, with its settings panel. See [Measure](measure.md#layout-grid).       |
| **Responsive Mode · B: breakpoints** | `5`           | Shows the page in several device frames side by side. See [Responsive mode](responsive.md).              |
| **Page Rulers**                      | `6`           | Shows rulers along the top and left edges, for guides. See [Measure](measure.md#page-rulers-and-guides). |
| **Measure area (drag)**              | `7`           | Draws a measuring box. See [Measure](measure.md#measure-area).                                           |
| **Capture Screenshot**               | `8`           | Takes a screenshot. See [Capture](capture.md).                                                           |
| **More tools** (⋯)                   | `9`           | Opens the menu of less used tools.                                                                       |
| **Toggle Side Panel**                | `0`           | Opens or closes the side panel. See [Side panel](side-panel.md).                                         |
| **Resume**                           | `H`           | Shown only while paused.                                                                                 |
| **Quit**                             | `Ctrl+Q`      | Turns PixelLens off for this tab.                                                                        |

The **More tools** button lights up while one of its tools is on, and shows a dot while an AI agent is connected.

## More tools menu

| Item                     | Key             | What it does                                                                                                                                            |
| ------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design overlay**       | `O`             | Lays design images over the page. See [Design overlay](design-overlay.md).                                                                              |
| **Page colors & fonts**  | `A`             | Lists every color, font and spacing value used on the page. See [Quality checks](quality.md#page-colors-and-fonts).                                     |
| **Color Picker**         | `C`             | Picks a color from anywhere on screen and copies it.                                                                                                    |
| **Vision simulator**     | `Y`             | Shows the page as seen with a color vision deficiency or blur.                                                                                          |
| **Tab focus order**      | `T`             | Numbers the elements in keyboard Tab order.                                                                                                             |
| **Core Web Vitals**      | `W`             | Shows LCP, CLS and INP live.                                                                                                                            |
| **MCP**                  | —               | Connects an AI agent. Its label shows the state: **Connect Agent**, **Waiting for agent**, **MCP connected** or **MCP out of date**. See [MCP](mcp.md). |
| **Pause**                | `H`             | Pauses PixelLens.                                                                                                                                       |
| **Commands & shortcuts** | `Ctrl+K` or `?` | Opens the command palette.                                                                                                                              |

## Command palette

Press `Ctrl+K` (`Cmd+K` on macOS) or `?` to open **Commands**. It lists every tool with its key. Type to filter (**Search tools…**); the search ignores accents and also matches letters in order. Use `↑` `↓` to move, `Enter` to run, `Esc` to close.

## All keys

### Tools

| Key            | Action                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `1` … `9`, `0` | The dock buttons, as in the table above                                                                            |
| `B`            | **Breakpoints**: lines at the page's media query widths. In responsive mode, switches to one frame per breakpoint. |
| `O`            | **Design overlay**                                                                                                 |
| `A`            | **Page colors & fonts**                                                                                            |
| `C`            | **Color Picker**                                                                                                   |
| `Y`            | Turns the vision simulator on (Deuteranopia) or off. Click the menu item to pick another mode.                     |
| `T`            | **Tab focus order**                                                                                                |
| `W`            | **Core Web Vitals**                                                                                                |
| `H`            | **Pause** / **Resume**                                                                                             |
| `Ctrl+K`, `?`  | Command palette                                                                                                    |
| `Ctrl+Q`       | **Quit**                                                                                                           |
| `Esc`          | Clears the selection; if nothing is selected, closes the open popover                                              |

### Selection

| Key                           | Action                                                           |
| ----------------------------- | ---------------------------------------------------------------- |
| `Alt+Shift+↑`                 | Select the parent element                                        |
| `Alt+Shift+↓`                 | Select the child element (back down the same branch you came up) |
| `Alt+Shift+←` / `Alt+Shift+→` | Select the previous / next sibling                               |
| `Space`                       | Pin the floating inspector panel                                 |

`Ctrl+Shift+F`, `Alt+Shift+↑` and `Alt+Shift+↓` are browser shortcuts. You can change them at `edge://extensions/shortcuts` (`chrome://extensions/shortcuts` in Chrome).

### Editing the page

These work on the selected element while PixelLens is on. On macOS use `Cmd` instead of `Ctrl`.

| Key                            | Action                                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copy, cut, paste the selected element (with a text selection on the page, copy and cut stay the browser's own) |
| `Ctrl+D`                       | Duplicate the selected element                                                                                 |
| `Delete` / `Backspace`         | Delete the selected element                                                                                    |
| `Ctrl+Z`                       | Undo                                                                                                           |
| `Ctrl+Shift+Z`, `Ctrl+Y`       | Redo                                                                                                           |

See [Editing](editing.md) for what undo covers.

### Inside tools

- Measure box: arrows move it 1px (`Shift`: 10px), `Ctrl+arrows` grow it, `Ctrl+Alt+arrows` shrink it, `Esc` clears it.
- Design overlay: arrows nudge the selected image 1px (`Shift`: 10px).
- Page rulers: `Delete` or `Backspace` removes the clicked guide.
- Capture: `Esc` closes; in markup, `P` `A` `R` `H` `T` pick a tool and `Ctrl+Z` undoes.

## When keys are ignored

- While you type in a text field, a select or an editable area, PixelLens leaves the keys alone.
- While paused, every key goes to the page except `H` (resume) and `Ctrl+Q` (quit). The page keeps its own `Ctrl+K` and `?`.
- While **Edit Text** is on, only **Inspector**, **Toggle Side Panel** and **Quit** stay usable.
- During a capture, keys go to the capture tool, except `Ctrl+Q`.
