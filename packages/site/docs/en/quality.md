# Quality checks

Tools for checking a page's colors, fonts, accessibility and performance. Most sit in the **More tools** menu.

## Page colors and fonts

Choose **Page colors & fonts** in **More tools**, or press `A`. The **Page styles** panel scans the page and has three tabs, each with its count:

- **Colors**: every color used.
- **Typography**: every font combination used.
- **Spacing**: every spacing value used. Values that are not multiples of 4px are shown in red, with a note of how many there are.

In each tab:

- Click a row to highlight the elements that use that value (up to 400); the first one scrolls into view.
- The copy button on a row copies its value; **All** copies every row of the tab.
- **Rescan** reads the page again.

## Color picker

Choose **Color Picker** in **More tools**, or press `C`. The PixelLens UI hides and the browser's color picker opens: click anywhere on screen to pick a color, or press `Esc` to cancel. The color is copied to the clipboard and shown briefly on the dock.

The color is written in the format chosen in [Settings](settings.md) (**Color Format**):

| Format   | Example              |
| -------- | -------------------- |
| HEX/HEXA | `#3B82F6`            |
| RGB/RGBA | `rgb(59, 130, 246)`  |
| HSL/HSLA | `hsl(217, 91%, 60%)` |
| HSB/HSBA | `hsb(217, 76%, 96%)` |

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

The filter applies to the whole page. Key `Y` toggles **Deuteranopia (no green)** on and off.

## Tab focus order

Choose **Tab focus order** in **More tools**, or press `T`. Every element you can reach with the `Tab` key gets an outline and a number, and a dashed line joins them in order. The numbers update as the page changes.

## Core Web Vitals

Choose **Core Web Vitals** in **More tools**, or press `W`. A chip at the top left shows the live values, each colored by its rating (green good, orange needs improvement, red poor):

| Metric                          | Good          | Poor         |
| ------------------------------- | ------------- | ------------ |
| LCP (Largest Contentful Paint)  | up to 2500 ms | over 4000 ms |
| CLS (Cumulative Layout Shift)   | up to 0.1     | over 0.25    |
| INP (Interaction to Next Paint) | up to 200 ms  | over 500 ms  |

On the page, the LCP element gets a dashed outline, and the elements that shifted the most (up to 30) are outlined with their CLS share. INP appears after you interact with the page.
