# Privacy and permissions

PixelLens does not collect, sell or share personal data. There is no analytics, tracking, advertising or telemetry, no account and no server run by the developer. Page data (styles, colors, fonts, screenshots) is processed inside your browser and shown only to you.

The full text is in the [privacy policy](privacy-policy).

## When PixelLens runs

PixelLens runs on a tab only after you turn it on for that tab. It has no standing access to the sites you visit: the extension declares no site access up front, and its script is added to a tab only when you click the icon, press `Alt+Shift+S` or use the context menu.

## Permissions

| Permission                                   | Why                                                                                    |
| -------------------------------------------- | -------------------------------------------------------------------------------------- |
| `activeTab`, `scripting`                     | Run the toolkit on the tab where you turn it on                                        |
| `storage`                                    | Save your preferences and saved edits                                                  |
| `sidePanel`                                  | Show element and page details in the side panel                                        |
| `contextMenus`                               | The **PixelLens** item in the page's context menu and **Settings** on the toolbar icon |
| `debugger`                                   | Full-page screenshots, only when you take one; detached right after                    |
| `declarativeNetRequestWithHostAccess`        | Responsive mode: let the current page load inside its own preview frames on that tab   |
| Optional: access to all sites (`<all_urls>`) | Requested only for responsive mode and reading cross-origin stylesheets                |
| Optional: `downloads`                        | Requested when you download assets or the social preview image from the side panel     |
| Optional: `clipboardWrite`                   | Requested only if the browser refuses a copy                                           |

Optional permissions are asked for at the moment you use the feature, and you can refuse them; the rest of PixelLens keeps working.

## Network access

- The optional MCP feature connects only to `ws://127.0.0.1` on your own computer, and only after you press **Connect**. It is protected by a token and the extension's origin. See [MCP](mcp.md#security-model).
- To read a page's stylesheets, PixelLens may download those same stylesheets from the site you are viewing (only with access to all sites granted).

## What is stored

- **Preferences** (theme, tool settings, panel layout) are kept in the browser's extension storage. If browser sync is on, the browser syncs them between your devices; PixelLens never sees or controls that sync.
- **Saved CSS edits** for each site stay on your device only.
- **The MCP token** stays on your device only.

None of this is sent to the developer or to anyone else. Details: [Settings](settings.md#what-is-stored-where).
