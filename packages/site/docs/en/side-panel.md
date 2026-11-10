# Side panel

The side panel shows the full details of the selected element and of the page, and holds the editing tools.

## Open it

Press `0` or click **Toggle Side Panel** on the dock. If the browser has no side panel support, the button reads **Side Panel Not Supported in This Browser** and stays disabled.

## Top bar

- Three tabs: **Element**, **Page** and **Changes**. The **Changes** tab shows a count while you have edits.
- The gear button opens **Settings**.
- **Open in a window** moves the panel into its own window; **Move to side panel** puts it back.

Every section can be collapsed by clicking its title. Sections start closed, and PixelLens remembers which ones you opened.

## Element tab

With nothing selected, the tab says **Pick an element on the page to see its details** and lists the shortcuts **Toggle Extension**, **Select Parent**, **Select Child**, **Toggle Panel** and **Deselect**.

With an element selected, from top to bottom:

- **Edit toolbar**: **Edit Text**, **Copy**, **Cut**, **Paste**, **Duplicate**, **Delete**, **Undo**, **Redo**. See [Editing](editing.md).
- **Force state** chips (`:hover`, `:focus`, `:focus-visible`, `:focus-within`, `:active`, `:visited`). See [Editing](editing.md#force-states).
- **Header**: the element's name, with **Select Parent** and **Select Child** buttons. Click the name to scroll the page to the element.
- **Box Model**: margin, border, padding and content sizes. Hovering a part highlights it on the page. For a `<canvas>`, **Canvas** shows the **Context Type**, **Canvas Dimensions** and **Pixel Ratio**.
- **Issues**: contrast problems in the element and its children, grouped, with the ratio found, the ratio required and the WCAG level. **Previous** / **Next** step through the **Instances** of an issue and highlight each on the page. Icons are checked against the 3:1 non-text rule (WCAG 1.4.11).
- **CSS**: the matched rules, editable. See [Editing](editing.md#editing-css).
- **Layout**: for flex and grid containers, the `display` value, the grid size (columns × rows) and the flex or grid properties in use.
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
- **Social Preview**: how a shared link looks on **Facebook**, **X** and **LinkedIn**, with a download button. Shown when the page has an `og:image`.
- **Meta Tags**: grouped as **SEO**, **Open Graph** and **Twitter Card**.
- **Technologies**: frameworks and libraries detected on the page.
- **CSS Variables**: the custom properties set on `:root`, grouped by prefix, with a **Filter variables** box. You can edit a value: press `Enter` to apply, `Esc` to cancel; clearing a value goes back to the stylesheet's value. Colors show a swatch. Long lists are capped; filter to narrow them down.
- **SEO Issues**: missing or weak title, description, H1, canonical link, viewport tag, `lang` attribute, `noindex`, image `alt` text and Open Graph tags, each with a recommendation. Click an item to highlight the element on the page.
- **Page Weight**: transferred size by type: **Document**, **Scripts**, **Stylesheets**, **Images**, **Fonts**, **Media**, **Fetch/XHR**, **Other**. Cross-origin resources whose size the browser hides are counted separately.

## Changes tab

The list of every edit you made on the page, with export and revert. See [Editing](editing.md#the-changes-list).

## In responsive mode

The panel follows the frame that holds the selection. See [Responsive mode](responsive.md).
