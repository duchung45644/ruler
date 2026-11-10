# MCP (AI agents)

PixelLens can be driven by an AI agent (Claude Code, Cursor or any other client that speaks the Model Context Protocol). The agent can read pages, inspect elements, apply CSS, switch to responsive mode and take screenshots, through the same tools you use.

## How it works

```
agent ⇄ (stdio, MCP) ⇄ PixelLens MCP server ⇄ (WebSocket) ⇄ extension ⇄ tab
```

The MCP server is a small Node program that runs on your computer. The agent starts it, and the extension connects to it at `ws://127.0.0.1:47347/pixellens`. Nothing leaves your machine.

## Build the server

The server lives in the repository as `packages/mcp-server` (`@pixellens/mcp-server`). It needs Node 18 or newer. From a checkout:

```sh
corepack pnpm install
corepack pnpm --filter @pixellens/mcp-server build
```

The program is then `packages/mcp-server/dist/cli.js`.

## Connect

1. Turn PixelLens on in a tab.
2. Open **More tools** and choose **Connect Agent** (the MCP item).
3. The popover shows **Paste this into your AI agent to connect it:** followed by a ready-made prompt that carries a pairing token (created once and kept on this device). Copy it with the copy button.
4. Click **Connect**.
5. Paste the prompt into your agent, or add the server to its configuration yourself (examples below).
6. While PixelLens waits, the item reads **Waiting for agent** (**Waiting for your agent…** in the popover). Once the agent's server is running, it reads **MCP connected** and the popover shows the agent's name and version and the server version. The **More tools** button shows a dot.

**Disconnect** in the same popover closes the connection. You can also connect and disconnect from [Settings](settings.md) (**MCP Server** under **Terminal AI**).

The copied prompt looks like this:

```
Add the PixelLens MCP server to this agent. Command: npx -y @pixellens/mcp-server --extension-id bkgdfebicmlicjnkgbemlidlnpbnaofh
with environment variable PIXELLENS_MCP_TOKEN=<token> (stdio transport, requires Node 18 or newer).
After adding it, call its ping tool to verify the connection.
```

The server needs two things:

- `--extension-id`: the PixelLens extension ID, `bkgdfebicmlicjnkgbemlidlnpbnaofh` for both the store version and unpacked builds.
- `PIXELLENS_MCP_TOKEN`: the token from the copied prompt.

## Configuration examples

### Claude Code (`.mcp.json`)

With a local build:

```json
{
  "mcpServers": {
    "PixelLens": {
      "command": "node",
      "args": [
        "/path/to/ruler/packages/mcp-server/dist/cli.js",
        "--extension-id",
        "bkgdfebicmlicjnkgbemlidlnpbnaofh"
      ],
      "env": { "PIXELLENS_MCP_TOKEN": "<token>" }
    }
  }
}
```

### Other clients

Any MCP client that can start a stdio server works. Give it:

- command: `node`
- arguments: `/path/to/ruler/packages/mcp-server/dist/cli.js --extension-id bkgdfebicmlicjnkgbemlidlnpbnaofh`
- environment variable: `PIXELLENS_MCP_TOKEN=<token>`

After adding it, ask the agent to call the `ping` tool to check the connection.

## Security model

- **Opt-in**: the extension opens no connection until you press **Connect**. **Disconnect** closes it at once.
- **Local only**: the server listens on `127.0.0.1` only.
- **Origin check**: the server accepts only connections from the PixelLens extension's origin, which a web page cannot fake.
- **Pairing token**: a random 43-character token, stored only on this device, proves to the extension that it talks to your server. Neither side logs it.
- **Tab scope**: the agent only sees tabs where you turned PixelLens on. It cannot turn PixelLens on in other tabs.

## Edits made by the agent

Agent edits go through the same path as yours: they appear in the side panel's **Changes** list and are saved per site. Markup, text and class edits join the undo history (`Ctrl+Z`); CSS edits are reverted from the **Changes** list or with `revert_css_change` / `revert_all_edits`.

## Command reference

The server offers one tool per command, plus `ping`. Every command except `list_tabs` and `fetch_stylesheet` takes a `tabId` from `list_tabs`. In responsive mode, element and edit commands accept an optional `viewportId` to target a frame.

| Command                     | What it does                                                                |
| --------------------------- | --------------------------------------------------------------------------- |
| `list_tabs`                 | Lists the tabs where PixelLens is on                                        |
| `focus_tab`                 | Brings a PixelLens tab to the front                                         |
| `fetch_stylesheet`          | Downloads a public stylesheet by URL (needs access to all sites)            |
| `get_page_info`             | URL, title, language, meta, H1, viewport, page size, scroll and pixel ratio |
| `get_selected_element`      | Summary of the element you selected                                         |
| `get_element_details`       | Details of one element                                                      |
| `get_elements_details`      | Details of up to 50 elements                                                |
| `get_element_outline`       | Tree outline of an element or the page                                      |
| `query_selector`            | Finds elements by CSS selector                                              |
| `get_element_matched_rules` | CSS rules matching an element, plus its inline style                        |
| `get_breakpoints`           | The page's media query breakpoints                                          |
| `get_seo_issues`            | SEO issues of the page                                                      |
| `get_meta_tags`             | Meta tags of the page                                                       |
| `get_page_weight`           | Transferred size by resource type                                           |
| `get_css_custom_properties` | CSS variables of the page                                                   |
| `detect_technologies`       | Frameworks and libraries detected                                           |
| `get_typography`            | Typography of an element                                                    |
| `get_colors`                | Colors of an element                                                        |
| `get_assets`                | Images and SVGs in an element                                               |
| `get_layout`                | Flex or grid layout of an element                                           |
| `get_tailwind`              | Tailwind classes for an element's CSS                                       |
| `calculate_specificity`     | Specificity of a selector                                                   |
| `force_element_state`       | Forces a pseudo-class (`:hover` … `:visited`) or clears it                  |
| `get_a11y_issues`           | Accessibility (contrast) issues, grouped                                    |
| `enter_responsive_mode`     | Turns responsive mode on                                                    |
| `exit_responsive_mode`      | Turns responsive mode off                                                   |
| `get_viewport`              | Current viewport(s)                                                         |
| `set_viewport`              | Sets a frame's width and height                                             |
| `set_viewports`             | Replaces the frames (1 to 20)                                               |
| `add_viewport`              | Adds a frame                                                                |
| `remove_viewport`           | Removes a frame                                                             |
| `set_zoom`                  | Sets the responsive zoom (0.25 to 2)                                        |
| `set_breakpoints_mode`      | Turns breakpoint frames on or off                                           |
| `get_my_edits`              | All edits on the page (rule and markup changes)                             |
| `set_text_content`          | Replaces an element's text                                                  |
| `set_inner_html`            | Replaces an element's HTML (sanitized)                                      |
| `insert_html`               | Inserts HTML before, after, or inside an element (sanitized)                |
| `select_element`            | Selects an element in the inspector                                         |
| `get_screenshot`            | Screenshot of the tab as a PNG (longest side up to 2000 px)                 |
| `apply_styles`              | Sets CSS on a matched rule or on the element's inline style                 |
| `add_rule`                  | Adds a CSS rule                                                             |
| `set_rule_selector`         | Changes a rule's selector                                                   |
| `revert_css_change`         | Reverts one CSS change                                                      |
| `revert_all_edits`          | Reverts every edit and clears the edits saved for the site                  |
| `set_element_classes`       | Sets an element's classes                                                   |
| `delete_element`            | Deletes an element                                                          |
| `duplicate_element`         | Duplicates an element                                                       |

The full payload of each command is in `docs/mcp-protocol.md` in the repository.

## Troubleshooting

- **Stays on Waiting for agent**: the server is not running. Check that the agent started it (its MCP list or logs), that the path to `cli.js` is right and that Node 18+ is installed.
- **The server exits at once**: port 47347 is already taken (another copy of the server is running), the token is missing or malformed, or `--extension-id` is missing. The server prints the reason.
- **The connection is refused**: the token in the agent's configuration does not match the one PixelLens shows, or the extension ID is wrong. Copy the prompt again and update the configuration. After a refusal, press **Connect** again.
- **MCP out of date**: the server is older than the extension expects. Rebuild it or restart your agent so it starts the new version.
- **"PixelLens is not active on this tab."**: turn PixelLens on in that tab; the agent only reaches tabs where it is on.
