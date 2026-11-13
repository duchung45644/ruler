# Troubleshooting

## Nothing happens when I click the icon

PixelLens cannot run on:

- browser pages such as `edge://` and `chrome://` (settings, new tab page, extensions),
- extension pages,
- the Chrome Web Store and Edge Add-ons pages.

It runs on `http`, `https`, `ftp` and `file` pages. On the pages above, the icon and `Ctrl+Shift+F` simply do nothing.

A tab that the browser has put to sleep (discarded) must be reloaded first.

## It turned off after a reload

That is expected: PixelLens is turned on per page view, and a reload or a navigation turns it off. Turn it on again; the tools you left on come back, and saved CSS edits are restored.

## Local files (file://)

To use PixelLens on local files, allow it in the browser: open `edge://extensions` (or `chrome://extensions`), choose **Details** under PixelLens and turn on **Allow access to file URLs**. Saved edits for local files are kept per file path.

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

- PixelLens may be paused: the dock then shows only **Resume** and **Quit**. Press `H`.
- Keys are ignored while the focus is in a text field.
- While **Edit Text** is on, only **Inspector**, **Toggle Side Panel** and **Quit** work.
- The browser shortcuts (`Ctrl+Shift+F`, `Alt+Shift+↑`, `Alt+Shift+↓`) may clash with another extension. Check them at `edge://extensions/shortcuts`. If you type Vietnamese with Unikey or EVKey, shortcuts with `Alt+Shift` may never reach the browser; pick a `Ctrl+Shift` combination instead.

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
