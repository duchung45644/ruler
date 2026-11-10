# Chrome Web Store — nội dung đăng

Mô tả, ảnh và gói dùng chung với [edge-listing.md](edge-listing.md). Chrome cần thêm tab **Privacy practices**:

## Single purpose

PixelLens is a toolkit for inspecting, measuring and adjusting the layout and styles of the web page the user is viewing.

## Permission justifications

- **activeTab:** Runs the toolkit on the current tab only after the user clicks the toolbar button.
- **scripting:** Injects the toolkit into the tab the user turned it on for. There are no content scripts in the manifest.
- **storage:** Saves the user's preferences and the CSS edits they make on a site (saved per site, locally).
- **sidePanel:** Shows element and page details (box model, CSS rules, fonts, colors) in the side panel.
- **contextMenus:** Adds a right-click entry to turn the toolkit on and open its options.
- **debugger:** Used only when the user takes a full-page screenshot. It resizes the viewport to capture the whole page, then detaches right away.
- **declarativeNetRequestWithHostAccess:** Responsive mode removes frame-blocking headers (X-Frame-Options / CSP frame-ancestors) only for sub-frames on that one tab, so the current page can be previewed at several device sizes. The session rule is removed when responsive mode ends.
- **Host permission (optional `<all_urls>`):** Requested at runtime only when the user starts responsive mode or the toolkit needs to read a cross-origin stylesheet of the page being inspected.
- **Optional downloads / clipboardWrite:** Requested only when the user saves a screenshot or asset, or copies a value.

## Remote code

**No, I am not using remote code.** All code is bundled in the package.

## Data usage

Tick **nothing** in "What user data do you plan to collect". Then tick all three certifications:
- I do not sell or transfer user data to third parties…
- I do not use or transfer user data for purposes unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

## Privacy policy URL

Same public link as for Edge (`docs/privacy-policy.md`).
