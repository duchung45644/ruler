# Measure

## Page rulers and guides

Press `6` or click **Page Rulers** to show pixel rulers along the top and left edges of the window. A crosshair on each ruler follows the pointer. PixelLens remembers whether the rulers were on.

Creating guides:

- Drag from the top ruler to make a vertical guide.
- Drag from the left ruler to make a horizontal guide.
- Drag from the corner where the rulers meet to make both at once.

While you drag, a guide snaps to the edges and the center of the element under the pointer. Each guide shows its position in page pixels, and the distance between neighbouring guides is shown between them.

Changing and removing guides:

- Drag a guide to move it (the cursor changes when you are over one).
- Drag a guide back onto the ruler it came from to remove it.
- Double-click a guide to remove it.
- Click a guide to select it, then press `Delete` or `Backspace`. `Esc` or a click elsewhere drops the selection.

Guides stay for as long as PixelLens is on in the tab, but they are only shown while the rulers are on.

## Measure area

Press `7` or click **Measure area (drag)**, then drag on the page to draw a box. The box shows its size (`W × H`) and its `x` / `y` position on the page.

- Drag inside the box to move it; drag a corner to resize it.
- Arrows move the box 1px (`Shift`: 10px), `Ctrl+arrows` expand it, `Ctrl+Alt+arrows` shrink it.
- `Esc` clears the box.

The **Measure** panel lets you type exact values:

- **Left / Top**: the box position from the page's left and top edges.
- **To right / bottom edge**: the distance from the box to the page's right and bottom edges.
- `Shift+↑` / `Shift+↓` in a field steps by 10.
- **Box color** sets the box color.
- **Edge guides** extends the box edges across the page.
- **Clear** removes the box.

Box color and edge guides are remembered.

## Layout Grid

Press `4` or click **Layout Grid** to show a column grid over the page together with its settings panel. Pressing again (or closing the panel) turns the grid off.

| Setting       | Range                               | Default   |
| ------------- | ----------------------------------- | --------- |
| **Columns**   | 1 to 24                             | 8         |
| **Max Width** | a number in px, or empty for `auto` | `auto`    |
| **Gutter**    | 0 to 100 px                         | 20        |
| **Margin**    | 0 to 350 px                         | 40        |
| **Color**     | color picker or hex value           | `#FC48FF` |
| **Opacity**   | 5% to 100%                          | 30%       |

The grid is centered in the window. Settings are saved, and the grid comes back on the next time you turn PixelLens on if you left it on.

## Breakpoints

Press `B` to show the page's breakpoints: a vertical line at every width used in a `min-width` or `max-width` media query, labelled `≥768px`, `≤767px` and so on. Green lines are `min-width`, cyan lines are `max-width`, amber lines are used as both.

The tool rescans each time you turn it on and when a new stylesheet loads. Stylesheets served from another origin (a CDN) can only be read after you allow access to all sites; see [Privacy and permissions](privacy-permissions.md).

Breakpoints has no dock button of its own outside responsive mode. In [Responsive mode](responsive.md#breakpoints) the toolbar has a **Breakpoints** button and `B` shows one frame per breakpoint instead.
