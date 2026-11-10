# Inspect

## Inspector

Press `1` or click **Inspector** to turn hover inspecting on. PixelLens remembers this choice for the next time you turn it on.

While the inspector is on:

- Hovering an element outlines it, shades its margin (orange) and padding (green), shows its width and height, and labels it with `tag#id.class` below the element.
- Clicks, presses and context menus on the page are held back, so page menus and links do not fire while you inspect.
- Click an element to select it. Click it again to deselect it, or press `Esc`.
- The selected element gets a frame and guide lines through its edges across the page.

Turning the inspector off keeps the selection (the side panel still uses it) but stops drawing it, and removes every pinned panel.

## Floating info panel

Next to the hovered or selected element, a floating panel shows:

- **Box Model**: `width`, `height`, `display`, `gap`, `margin`, `padding`, `box-sizing`.
- **Appearance**: `border-radius`, `background-color`, `color`, with color swatches.
- **Text**: `font-family` (the font actually rendered), `font-size`, `font-weight`, `line-height` (as a ratio of the font size), `letter-spacing`, `text-align`.
- **Accessibility**: for text, the **Contrast** ratio with an `Aa` sample and the level reached (AAA, AA, or AA in red when it fails), plus **Suggested:** AA and AAA text colors. Click a suggestion to copy it.
- **Image**: for images, **Natural size**, **File size** and **Format**.

Default values (zero margins, `normal` letter spacing and so on) are left out. Colors use the color format from [Settings](settings.md).

**Copy CSS** at the top copies the element's CSS.

## Pinning

Press `Space` while the floating panel is shown to pin it. A pinned panel stays on the page at that spot and scrolls with it, so you can compare several elements:

- Drag a pinned panel by its header to move it; resize it from its corner.
- Hovering a pinned panel highlights its element on the page.
- Close it with its close button.

Until you pin your first panel, the floating panel ends with the hint **Press Space to pin**.

## Moving the selection

- **Select Parent** / **Select Child** on the dock, or `Alt+Shift+↑` / `Alt+Shift+↓`. Going down after going up returns along the same branch.
- `Alt+Shift+←` / `Alt+Shift+→` select the previous and next sibling.
- The side panel header has the same parent and child buttons.

## Distances

With an element selected and the inspector on, hover another element: PixelLens draws the gaps between the two, with the distance in pixels on each line.

## X-Ray Mode

Press `3` or click **X-Ray Mode** to outline every element on the page, one color per nesting level. Hidden elements and SVG internals are skipped. It also reaches into open shadow roots. PixelLens remembers whether X-Ray was on.

## Find Element

Press `2` or click **Find Element** and type a **CSS Selector** such as `.class`, `#id` or `tag`. The search runs as you type, also inside open shadow roots:

- Matches are highlighted on the page and the current one scrolls into view.
- The title shows the position, such as `2/7`, and how many matches are hidden (for example `3 hidden`).
- **Previous** and **Next** step through the matches.
- Closing the box removes the highlights. The query is kept for next time.

An invalid selector simply finds nothing. In responsive mode the search runs in every frame and the counts add up.
