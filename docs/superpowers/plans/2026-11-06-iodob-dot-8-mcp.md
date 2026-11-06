# iodob — Đợt 8: MCP — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** cho AI agent (Claude Code, Cursor, Codex…) điều khiển iodob qua MCP server cục bộ, theo spec §4.8, §5 (chốt 5), §8 Đợt 8:

- Chuyển 47 lệnh MCP của bản cũ (10.15) sang API có kiểu.
- **Thiết kế lại kênh** extension ↔ MCP server cục bộ (bản cũ đã gỡ, xem dưới).
- Nút MCP trên dock + popover (1.46, 1.50, 10.06, 10.07), hàng MCP ở trang cài đặt (9.05), khoá `mcpIntent` (9.34), content nghe storage (9.30).

**Bản cũ chạy thế nào (kết quả khảo sát):**

- **Server:** gói npm riêng `@screen-ruler/mcp`, không có trong `legacy-src/` hay `unpacked/`. Agent chạy bằng `npx -y @screen-ruler/mcp` (stdio, Node ≥ 18); lời nhắc copy ở `legacy-src/content.js:21128`. Server phải tự bắc cầu stdio ↔ extension.
- **Kênh extension ↔ server: đã bị gỡ hoàn toàn.** Không còn WebSocket, `connectNative`, offscreen hay cổng nào trong `legacy-src/background.js` / `unpacked/background.js`. Manifest không có `nativeMessaging`. `We()` (kết nối, `background.js:5716`) rỗng; `request_mcp_status` luôn trả `connected: false`; `He()` (xử lý ảnh cho AI) rỗng. Không suy ra được cổng, giao thức hay handshake cũ.
- **Còn lại:**
  - router `target: "mcp"` trong `runtime.onMessage` (`background.js:2919`) → `F(type, payload)`, 47 lệnh, cổng "Studio tier" `G()` luôn true;
  - `q(target, action, payload)` chuyển xuống tab theo `tabId` số, timeout 12s / 40s, chờ reload sau responsive (10.02);
  - `MIN_MCP_SERVER_VERSION: "0.5.0"` (`background.js:759`); phát `mcp_status_changed` {connected, versionMismatch, client, eligible, intent} tới mọi tab đang bật;
  - phía trang: `Wg` / `Ag` / `Ig` (`content.js:21020–23650`) xử lý lệnh, chuyển xuống iframe responsive.
- **Hệ quả:** ai gửi được `runtime.sendMessage({target:'mcp'})` từ trong extension thì gọi được lệnh; từ ngoài thì không ai gọi được. Đợt này chọn transport, xác thực và giới hạn nguồn từ đầu.

**Architecture:**

- **Transport (Q1 đề xuất a):** background mở **WebSocket client** tới `ws://127.0.0.1:<port>/iodob` (Q2). Server MCP (stdio phía agent) mở WebSocket server chỉ bind `127.0.0.1`.
  - Không cần quyền mới: WebSocket không chịu `host_permissions` và CSP mặc định MV3 không chặn `connect-src`.
  - Chrome ≥ 116 (đã ghim `minimum_chrome_version`) giữ service worker sống khi WebSocket có lưu lượng. Server gửi `ping` mỗi 20s.
- **Giao thức** `src/lib/mcp/protocol.ts` (JSON, phiên bản `protocol: 1`):
  - extension → server `hello {protocol, token, extVersion}`;
  - server → extension `welcome {serverVersion, client: {name, version} | null}` hoặc `reject {reason}`;
  - server → extension `call {id, type, payload}`; extension → server `result {id, ok: true, data} | {id, ok: false, error}`;
  - server → extension `client {name, version}` khi agent đổi; `ping` / `pong`.
  - `serverVersion < MIN_MCP_SERVER_VERSION` ("0.5.0") → `versionMismatch` (vẫn nối, như cũ hiện cảnh báo).
- **Xác thực và giới hạn nguồn** (bắt buộc, xem Review Focus 1):
  - **Token cặp:** extension sinh 32 byte ngẫu nhiên (`crypto.getRandomValues`, base64url) lần đầu bật MCP, lưu `local:mcpToken`. Lời nhắc copy chứa token (Q3). Server so token bằng so sánh thời gian hằng; sai → `reject` + đóng. Nút "tạo lại token" không có ở đợt này.
  - **Origin:** trình duyệt tự gắn `Origin: chrome-extension://<id>` vào handshake WebSocket, trang web không giả được. Server chỉ nhận đúng origin đó (id lấy từ token-prompt hoặc `--extension-id`); trang web mở `ws://127.0.0.1` sẽ bị từ chối ở bước upgrade. Ghi rõ vào đặc tả giao thức gửi cho phía server.
  - **Phía extension:** chỉ nối `ws://127.0.0.1` (không `localhost`, tránh DNS); không nhận lệnh trước `welcome`; mọi `call` qua validator thủ công theo từng lệnh (không thêm zod); khung > 1 MB bị bỏ; lệnh lạ → lỗi "Unknown action. Update the iodob extension to the latest version.".
  - **Phạm vi tab (Q4 đề xuất a):** lệnh theo tab chỉ chạy trên tab người dùng **đã bật** iodob (content `ping().active`); `list_tabs` chỉ liệt kê các tab đó. Không tự inject vào tab chưa bật.
  - **Opt-in:** `mcpIntent` mặc định false; chỉ nối khi người dùng bấm Connect (dock hoặc trang cài đặt). Disconnect đóng socket ngay.
  - `fetch_stylesheet` giữ chặn private/localhost (`background.js:2632`); HTML chèn vẫn qua sanitizer có sẵn (5.15).
- **Bố cục mã:**
  - `src/lib/mcp/protocol.ts` — kiểu khung, `compareVersion`, validator payload, `McpApi` (47 lệnh → kiểu đối số/kết quả);
  - `src/background/mcp-socket.ts` — vòng đời socket: connect / backoff (1s → 30s) / handshake / `status`;
  - `src/background/mcp.ts` — router lệnh (thay `F`), `forwardToTab` (thay `q`/`V`, timeout 12s/40s, chờ reload), `list_tabs`, `focus_tab`, `get_screenshot`, `fetch_stylesheet` (dùng lại `src/lib/stylesheet-fetch.ts`);
  - `BackgroundApi`: `mcp_status()`, `mcp_connect()`, `mcp_disconnect()`, `capture_for_ai(rect)`;
  - `ContentApi`: **một** cổng `mcp_call(type, payload)` có kiểu theo `McpPageApi` (giữ ContentApi gọn), xử lý ở `src/content/mcp/index.ts`, gọi lại các hàm sẵn có (edit engine, `sidepanel/details.ts`, `sidepanel/page.ts`, `lib/find.ts`, `lib/a11y.ts`, `responsive/shell.svelte.ts`, `responsive/forward.ts`);
  - `SidePanelApi` không đổi; content nghe `mcpIntent` + nhận `mcp_status_changed` (đổi tên `mcp_status`).
- **Settings:** `src/lib/settings.ts` thêm `mcpIntent` (`local:mcpIntent`, fallback false) và `mcpToken` (`local:mcpToken`, fallback null). Trạng thái kết nối (connected/client/versionMismatch) không lưu storage; background giữ trong bộ nhớ và phát tới tab + trang cài đặt.

**Mốc:**

| Mốc | Task | Nội dung |
| --- | --- | --- |
| M1 — Kênh | 1–3 | Giao thức + validator, socket + handshake + token, trạng thái + connect/disconnect |
| M2 — Lệnh | 4–8 | Router nền, lệnh trang/phân tích, phần tử, sửa, responsive + ảnh |
| M3 — Giao diện | 9–11 | Chuỗi, hàng MCP trang cài đặt, nút + popover dock |
| M4 — Nối | 12–13 | Server giả cho test tích hợp, kiểm kê + thử tay |

**Tech Stack:** giữ nguyên Đợt 1–7. Không thêm dependency (test dùng `WebSocket` giả toàn cục trong Vitest, xem Task 2). Không thêm quyền (Q1 a). Nếu chọn Q1 b thì thêm `nativeMessaging`; Q5 b thì thêm `alarms`.

**Spec:** §4.8 (MCP giữ, làm sau cùng), §5 (chốt 5: giữ MCP, bỏ gói/mua), §8 Đợt 8, §9 (Giao diện trong trang), §10 (rủi ro kênh MCP).

**Kiểm kê:**

- dòng `· đợt 8 ·`: 1.46, 1.50, 5.28, 9.05 (chuyển từ đợt 7), 9.30, 9.34, 9.41, 10.01–10.16;
- dòng liên quan đã xong, dùng lại: 2.16, 2.17 (id phần tử), 5.14, 5.15, 5.17 (engine sửa), 9.17 (kênh nền), các dòng responsive đợt 6;
- 11.11 (bỏ, Studio tier).

---

## Phạm vi — đổi so với bản cũ

| Dòng | Bản cũ | Bản mới |
| --- | --- | --- |
| — (kênh) | Đã gỡ: `We()` rỗng, `connected` luôn false | WebSocket tới `127.0.0.1` + token + kiểm Origin (Q1–Q3) |
| 10.01, 11.11 | Cổng "Studio tier" `G()` (luôn true), lỗi "…requires the Studio tier." | Bỏ cổng; `eligible` luôn true nên nút dock luôn hiện khi script bật |
| 9.17, 10.01 | `runtime.onMessage` `target: "mcp"` nhận lệnh từ bất kỳ trang extension nào | Bỏ đường này; lệnh chỉ vào qua socket đã xác thực. Không còn `target` chuỗi (kênh có kiểu D3) |
| 10.03, 10.04 | `request_mcp_connect/disconnect/status`, `mcp_status_changed` | `mcp_connect` / `mcp_disconnect` / `mcp_status` trên `BackgroundApi`; phát `mcp_status` tới tab đang bật và trang cài đặt |
| 10.05, 10.14 | `capture_tab_for_ai` → `He` rỗng | `capture_for_ai` dùng hàng đợi chụp có sẵn; trả dataUrl PNG, thu nhỏ cạnh dài ≤ 2000 px (Q6) |
| 10.12, 5.28 | Lỗi "Editor not active." khi chưa vào chế độ sửa | **Không còn chế độ sửa**: lệnh sửa chạy khi script bật; lỗi chỉ còn "iodob is not active on this page." và "Cannot edit <tag>. Target a child element instead." |
| 10.11 | `select_element` → `select_edited_element` cần edit mode | `select_edited_element` chọn qua inspector (2.16), không bật chế độ nào |
| 10.12 | Sửa từ MCP chỉ sống trong phiên | Sửa đi qua engine nên **được lưu theo site** như sửa tay (inline + rule, đợt 5); `revert_all_edits` xoá cả bản lưu |
| 10.12 | `apply_styles` từ chối state/media/pseudo | Giữ nguyên văn lỗi (`content.js:21565`) |
| 10.13, 10.08 | Responsive: iframe forward qua `__forwarded_message__`, overlay cũ | Dùng `responsive/forward.ts` + shell mới (đợt 6, overlay đáp ứng); mô tả khung lấy từ `shell` |
| 10.14 | Ẩn UI 32ms trước khi chụp | Ẩn shadow host của overlay (dock, panel, shell toolbar) đúng một khung hình rồi chụp; không đụng `ToolPanel.svelte` |
| 10.06, 9.41 | Icon agent (antigravity/claude/cursor/windsurf/cline/codex/gemini/vs-code) từ `scripts/patterns/*` qua web_accessible_resources | Q7 |
| 10.07 | Popover dock: lời nhắc copy `npx -y @screen-ruler/mcp` | Giữ, thêm token theo Q3; chuỗi nguyên văn `MCP_CONNECT_HINT` |
| 9.05 | `OPTIONS_MCP_SERVER_SECONDARY` có link "Setup guide" `www.iodob.com` | **Đã chốt (đợt 7 Q4a):** bỏ `<a>`, chỉ giữ câu "Allow AI agents to inspect or make edits." |
| 1.46, 10.06 | Quit nằm cuối nhóm MCP | Dock 5 nhóm đã chốt: MCP là nút cuối nhóm cuối, Quit ngay sau (sửa `Dock.svelte` + registry, không đụng `DockButton.svelte`) |
| — | Phím số; không có phím cho MCP | Không thêm phím chữ cho MCP |

## Global Constraints

- **Giữ mọi ràng buộc Đợt 0–7:**
  - phiên bản ghim; **không thêm dependency** (không `zod`, không `ws` — test dùng mock `WebSocket`);
  - manifest không có `host_permissions` / `content_scripts` (hook kiểm); **không thêm quyền** trừ khi Q1/Q5 chốt khác;
  - chỉ `en` / `vi`; không sửa `unpacked/`, `legacy-src/`;
  - commit kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Không chạm** `src/ui/DockButton.svelte`, `src/ui/Toast.svelte`, `src/ui/ToolPanel.svelte`. Không `git add -A`.
- **Chuỗi:** nhóm `mcp.*` và `options.mcp*` trong `src/locales/{en,vi}.json`, chép nguyên văn `DOCK_MCP_*`, `MCP_*`, `OPTIONS_MCP_*`, `OPTIONS_ROW_MCP_SERVER`, `OPTIONS_SECTION_TERMINAL_AI` từ `unpacked/_locales/{en,vi}/messages.json`; `$1/$2` → tham số `i18n.t`. Thông báo lỗi trả cho agent là tiếng Anh nguyên văn bản cũ (không i18n).
- **Bảo mật:** không log token; không đưa token vào `mcp_status` gửi tới content (chỉ trang cài đặt / popover lấy qua `mcp_prompt()` riêng); không nhận lệnh trước handshake.
- **Lệnh:** `corepack pnpm`.
- **Kiểm mỗi task:** test của file → `corepack pnpm typecheck`, `lint`, `prettier --check .`, `vitest run`, `build` PASS → commit.
- **Test:** `fakeBrowser`; `WebSocket` giả (`vi.stubGlobal`) có `open/message/close`; component test happy-dom như `options/app.test.ts`.

## Review Focus

1. **Bề mặt bảo mật:**
   - không có đường nào ngoài socket đã `welcome` gọi được lệnh MCP (không còn `target: 'mcp'` trong `runtime.onMessage`);
   - token đúng, origin do server kiểm (ghi trong đặc tả cho server); extension chỉ nối `127.0.0.1`;
   - lệnh chỉ tới tab đã bật iodob; `focus_tab` cũng vậy;
   - validator chặn payload sai kiểu, `limit` kẹp 1–200, selector độ dài ≤ 1000, html ≤ 200 KB.
2. **Không treo:** mọi `call` có timeout và luôn trả `result`; socket đóng giữa chừng → các lời gọi đang chờ bị huỷ; tab đóng → lỗi rõ.
3. **Đồng nhất với sửa tay:** sửa từ MCP vào cùng undo/redo, lưu theo site, hiện trong side panel (`refresh_changes`).
4. **Trạng thái khớp ở 3 nơi:** dock, popover, trang cài đặt đổi cùng lúc khi connect/disconnect/agent đổi.
5. **Không đổi hành vi khi MCP tắt:** không mở socket, không timer, nút dock ở trạng thái "Connect Agent".

---

### Task 1: Giao thức, validator, so phiên bản

**Files:** `src/lib/mcp/protocol.ts`, `src/lib/mcp/validate.ts` (+ test)

- [ ] Kiểu khung `hello / welcome / reject / call / result / client / ping / pong`; `PROTOCOL = 1`; `MIN_MCP_SERVER_VERSION = '0.5.0'`; `MCP_PORT` theo Q2.
- [ ] `parseFrame(text)`: JSON hỏng / thiếu trường / > 1 MB → null.
- [ ] `McpApi`: 47 tên lệnh của 10.15 → kiểu payload; `isMcpType(name)`.
- [ ] `validate(type, payload)`: kiểm `tabId` số (lỗi nguyên văn "`<type>` requires a numeric tabId."), `elementId` dạng `v-…`, `limit` kẹp, chuỗi giới hạn độ dài.
- [ ] `compareVersion('0.4.9','0.5.0') < 0`; chuỗi không phải semver → coi là unknown (`OPTIONS_MCP_VERSION_UNKNOWN`).
- [ ] Test: mỗi nhánh lỗi; đủ 47 tên (so với danh sách 10.15).
- [ ] Commit: `feat(mcp): protocol frames, validators and version check`

### Task 2: Socket, handshake, token

**Files:** `src/background/mcp-socket.ts`, `src/lib/settings.ts` (+ test)

- [ ] `mcpIntent`, `mcpToken` trong `settings.ts` (9.34); `ensureToken()` sinh 32 byte base64url nếu null.
- [ ] `McpSocket.start()`: mở `ws://127.0.0.1:${MCP_PORT}/iodob`; `open` → gửi `hello`; chờ `welcome` tối đa 5s, không có → đóng, backoff.
- [ ] Backoff 1s, 2s, 4s… tối đa 30s khi `mcpIntent` vẫn true; `stop()` huỷ timer + đóng socket.
- [ ] Trước `welcome` mọi `call` bị bỏ (không trả lời). `reject` → dừng tự nối lại tới khi người dùng bấm Connect lại; trạng thái `rejected` (popover hiện lại lời nhắc).
- [ ] `pong` cho `ping`.
- [ ] Test (WebSocket giả): handshake đúng; token sai → `reject`; call trước welcome bị bỏ; backoff; stop.
- [ ] Commit: `feat(mcp): authenticated websocket channel to the local server`

### Task 3: Trạng thái, connect/disconnect, tự nối lúc khởi động

**Files:** `src/background/mcp.ts`, `src/entrypoints/background.ts`, `src/lib/messaging.ts` (+ test)

- [ ] `McpStatus = {intent, connected, waiting, versionMismatch, serverVersion, client}`.
- [ ] `BackgroundApi.mcp_status()`, `mcp_connect()` (ghi `mcpIntent=true`, `ensureToken`, `start`), `mcp_disconnect()` (ghi false, `stop`), `mcp_prompt()` (lời nhắc copy có token; chỉ gửi cho trang extension: `sender.tab` undefined hoặc tab đang bật — Q3).
- [ ] Đổi trạng thái → `sendToTab(id, 'mcp_status', s)` cho mọi tab đang bật (dùng danh sách tab bật của `panels.ts`) + `runtime.sendMessage` cho trang cài đặt.
- [ ] `defineBackground`: nếu `mcpIntent` thì `start()` ngay khi worker chạy (10.04); `mcpIntent.watch` để đổi từ nơi khác.
- [ ] Test: connect ghi storage và mở socket; disconnect đóng; phát trạng thái tới tab.
- [ ] Commit: `feat(mcp): connection status and connect/disconnect`

### Task 4: Router lệnh nền + chuyển xuống tab

**Files:** `src/background/mcp.ts`, `src/lib/messaging.ts` (+ test)

- [ ] `handleCall(type, payload)`: validate → nhánh nền (`list_tabs`, `focus_tab`, `fetch_stylesheet`, `get_screenshot`) hoặc `forwardToTab`.
- [ ] `list_tabs`: chỉ tab đang bật (Q4): `{tabId, title, url, active}`. `focus_tab`: tab không bật → lỗi "iodob is not active on this tab.".
- [ ] `fetch_stylesheet`: dùng `stylesheet-fetch.ts`, giữ lỗi nguyên văn chặn private/localhost.
- [ ] `forwardToTab`: `ContentApi.mcp_call(type, payload)` ở frame 0; timeout 40s cho `get_screenshot`/`enter_responsive_mode`/`exit_responsive_mode`/`set_viewport`, 12s cho lệnh khác; trang đang reload sau responsive → chờ `complete` tối đa 10s (10.02).
- [ ] `select_element` → `select_edited_element` (10.15).
- [ ] Không còn nhánh `target: 'mcp'` trong `runtime.onMessage` (Review 1).
- [ ] Test: timeout; tab không bật; lệnh lạ; ánh xạ select_element.
- [ ] Commit: `feat(mcp): background command router`

### Task 5: Lệnh trang & phân tích (10.09, 10.10)

**Files:** `src/content/mcp/index.ts`, `src/content/mcp/page.ts`, `src/content/mcp/ai-data.ts` (+ test)

- [ ] Cổng `mcp_call` trong content: script tắt → "iodob is not active on this page."; lệnh cấp trang chỉ khung top; lệnh lạ → "Unknown action. Update the iodob extension to the latest version.".
- [ ] `buildPageInfo`, `extractAiAttributes` (data-* ≤5, aria-* ≤8), `buildOutlineTree`, `buildElementSummary`, `queryBySelector` (1–200, mặc định 50) theo 10.09.
- [ ] `get_page_info`, `get_page_classes`, `get_breakpoints`, `get_seo_issues`, `get_meta_tags`, `get_page_weight`, `get_css_custom_properties`, `get_typography`, `calculate_specificity`, `get_colors`, `get_assets`, `get_layout`, `get_tailwind`, `detect_technologies`, `get_a11y_issues` (gộp nhóm, warning trước info, tương phản thấp trước): gọi `sidepanel/page.ts`, `lib/a11y.ts`, `lib/breakpoints.ts`, `lib/selector.ts`… không viết lại.
- [ ] Test happy-dom cho từng hàm dựng dữ liệu; thứ tự a11y.
- [ ] Commit: `feat(mcp): page and analysis commands`

### Task 6: Lệnh phần tử (10.11)

- [ ] `get_selected_element`, `get_element_outline`, `get_element_details(s)` (dùng `collectElementDetails`), `query_selector`, `get_element_matched_rules` (rule có `ruleRef`, tối đa 60, số bị cắt, inlineStyle), `get_my_edits` (`get_all_flattened_changes`), `select_edited_element`, `force_element_state`.
- [ ] Id phần tử qua `ensureElementId` / `resolveElementById` (2.17); không thấy → lỗi rõ, không mở hộp thoại trên trang.
- [ ] Test: ruleRef khớp với `merge_rule_styles`; cắt 60.
- [ ] Commit: `feat(mcp): element commands`

### Task 7: Lệnh sửa (10.12, 5.28)

- [ ] `set_text_content`, `set_inner_html`, `insert_html`, `apply_styles` (ruleRef → `merge_rule_styles`, không → `inline_style_edit`), `add_rule` → `rule_add`, `set_rule_selector` → `rule_selector_edit`, `revert_css_change` → `revert_rule_change` (id lạ → gợi ý `get_my_edits`), `revert_all_edits`, `set_element_classes`, `delete_element`, `duplicate_element`.
- [ ] Gọi thẳng hàm của `src/content/edit/handlers.ts` (cùng engine với side panel) để có undo, lưu theo site, `refresh_changes` tới side panel.
- [ ] Bỏ điều kiện "Editor not active."; giữ "Cannot edit <tag>…" cho html/head/body.
- [ ] Test: sửa → có trong `get_my_edits` và trong bản lưu; html được làm sạch; revert_all xoá bản lưu.
- [ ] Commit: `feat(mcp): edit commands through the edit engine`

### Task 8: Responsive và ảnh cho AI (10.08, 10.13, 10.14, 10.16)

- [ ] `enter/exit_responsive_mode`, `set_viewport` (kẹp ≥ 200×300; "No viewport with id …"), `set_viewports`, `add_viewport`, `remove_viewport`, `set_zoom` (0,25–2), `set_breakpoints_mode` ("This page reports no usable breakpoints."), `get_viewport`: gọi `shell.svelte.ts`; trả mô tả khung.
- [ ] Ở responsive, lệnh phần tử/sửa chuyển xuống khung đang chọn qua `responsive/forward.ts`; gom thay đổi mọi khung (id `v<n>:…` + nhãn viewport) cho `get_my_edits`; trong iframe responsive bỏ lệnh responsive (10.16).
- [ ] `get_screenshot`: content ẩn overlay một khung hình → `BackgroundApi.capture_for_ai(rect|null)` (hàng đợi chụp có sẵn) → hiện lại; trong iframe dùng ảnh dựng từ DOM kèm ghi chú "best-effort"; lỗi `capture_failed` / `script_inactive`. Thu nhỏ theo Q6.
- [ ] Test: kẹp kích thước; forward về khung chọn; overlay hiện lại cả khi chụp lỗi.
- [ ] Commit: `feat(mcp): responsive and screenshot commands`

### Task 9: Chuỗi

**Files:** `src/locales/{en,vi}.json`

- [ ] `mcp.{dockTitle, connected, connectAgent, outdated, waiting, connectHint, unknownAgent, waitingForAgent}` từ `DOCK_MCP_*`, `MCP_*`; dùng lại `DOCK_COPY` nếu đã có khoá copy.
- [ ] `options.{sectionTerminalAi, rowMcpServer, mcpServerSecondary, mcpConnect, mcpDisconnect, mcpOutdatedTooltip, mcpOutdatedTitle, mcpOutdatedBody, mcpVersionUnknown}`; `mcpServerSecondary` chỉ câu đầu (đã chốt).
- [ ] Commit: `feat(i18n): mcp strings`

### Task 10: Hàng MCP ở trang cài đặt (9.05, 9.07)

**Files:** `src/entrypoints/options/App.svelte` (+ `app.test.ts`)

- [ ] Mục `sectionTerminalAi`, hàng `rowMcpServer` + `mcpServerSecondary` (text thường, không `{@html}`).
- [ ] Nút Connect / Disconnect theo `intent`; icon cảnh báo + tooltip khi `versionMismatch`; bấm icon → `Dialog.svelte` với `mcpOutdatedTitle` / `mcpOutdatedBody(server ?? mcpVersionUnknown, MIN)`.
- [ ] Đọc `mcp_status` khi mount; nghe `mcpIntent.watch` và tin `mcp_status` từ nền (9.07).
- [ ] Test: bấm Connect → gọi `mcp_connect`; trạng thái đổi → nút đổi; dialog phiên bản.
- [ ] Commit: `feat(options): mcp server row`

### Task 11: Nút + popover MCP trên dock (1.46, 1.50, 10.06, 10.07, 9.30)

**Files:** `src/content/core/registry.svelte.ts`, `src/ui/Dock.svelte`, `src/content/mcp/Popover.svelte` (+ test)

- [ ] Mục registry `mcp` ở nhóm cuối, trước Quit; chấm trạng thái idle / waiting / connected / outdated; tooltip `connected` (hoặc tên agent viết hoa + icon theo Q7) / `outdated` / `waiting` / `connectAgent`.
- [ ] Popover dùng `src/ui/Popover.svelte`: đã nối → tên agent (`unknownAgent`), phiên bản, cảnh báo, nút ngắt; chưa nối → `connectHint`, ô lời nhắc (`mcp_prompt()`) có nút copy, nút kết nối, `waitingForAgent` khi chờ. Mở popover này đóng popover khác (1.50).
- [ ] Content nghe `mcpIntent.watch` + `mcp_status` (9.30).
- [ ] Test: render theo từng trạng thái; copy gọi clipboard; Quit vẫn cuối.
- [ ] Commit: `feat(mcp): dock status button and popover`

### Task 12: Server giả và test tích hợp

**Files:** `src/background/mcp.integration.test.ts`; đặc tả giao thức nằm trong JSDoc của `protocol.ts`

- [ ] WebSocket giả đóng vai server: handshake → `call get_page_info` → content (fakeBrowser, happy-dom) → `result`.
- [ ] Ca bảo mật: không welcome thì call bị bỏ; tab chưa bật bị từ chối; payload sai kiểu bị từ chối; socket đóng giữa lời gọi → không treo.
- [ ] Commit: `test(mcp): end-to-end channel with a fake server`

### Task 13: Kiểm kê và thử tay trên Edge

- [ ] `[x]` cho 1.46, 1.50, 5.28, 9.05, 9.30, 9.34, 9.41 (hoặc ghi bỏ theo Q7), 10.01–10.16; ghi chú đổi theo bảng Phạm vi; 11.11 giữ "bỏ".
- [ ] Thử tay với server cục bộ (bản dựng theo đặc tả, Q8): connect từ dock và trang cài đặt; trang web thử `new WebSocket('ws://127.0.0.1:<port>/iodob')` bị server từ chối; token sai bị từ chối; agent đọc trang, sửa style (thấy trong side panel, reload vẫn còn), responsive, chụp ảnh; disconnect cắt ngay; vi/en.
- [ ] Commit: `docs(inventory): dot 8 mcp`

## Xong khi

- Mọi dòng đợt 8 là `[x]` hoặc có ghi chú bỏ / đổi.
- Kiểm tra và build PASS; manifest không thêm quyền (hoặc đúng quyền Q1/Q5 đã chốt), không thêm dependency, không `host_permissions` / `content_scripts`.
- Không đường nào gọi lệnh MCP ngoài socket đã xác thực; test tích hợp Task 12 xanh.
- Thử tay Task 13 qua trên Edge.

## Quyết định cần chốt

- **Q1 — Transport extension ↔ server.**
  - a) WebSocket client ở background tới `127.0.0.1` (server mở cổng); không quyền mới; Chrome ≥ 116 giữ worker sống.
  - b) Native messaging (`connectNative`): thêm quyền `nativeMessaging`, người dùng phải cài host manifest vào hệ điều hành; xác thực sẵn nhờ `allowed_origins`, không mở cổng mạng.
  - c) HTTP long-poll tới `127.0.0.1`: không cần giữ socket nhưng trễ và tốn hơn.
  - **Đề xuất:** a. Cài đặt bằng `npx` một dòng như bản cũ; b an toàn hơn nhưng thêm quyền và bước cài thủ công.
- **Q2 — Cổng.**
  - a) Cổng cố định (ví dụ 47347) đặt trong `protocol.ts`;
  - b) Dải cổng thử lần lượt (47347–47351);
  - c) Người dùng nhập cổng ở trang cài đặt.
  - **Đề xuất:** a; server báo lỗi rõ khi cổng bận.
- **Q3 — Token cặp.**
  - a) Extension sinh token, nhét vào lời nhắc copy (`npx -y @screen-ruler/mcp`, env `IODOB_MCP_TOKEN=…`, `--extension-id`); không cần chuỗi mới (lời nhắc tiếng Anh nguyên văn + tham số);
  - b) Server sinh token, người dùng dán vào trang cài đặt (cần chuỗi + ô nhập mới);
  - c) Không token, chỉ dựa Origin.
  - **Đề xuất:** a. c không đủ: tiến trình cục bộ khác có thể chiếm cổng trước và giả server.
- **Q4 — Phạm vi tab.**
  - a) Chỉ tab đã bật iodob;
  - b) Mọi tab thường; MCP tự inject content khi cần (activeTab không đủ, cần `<all_urls>` optional đã có).
  - **Đề xuất:** a — người dùng kiểm soát rõ agent chạm được tab nào.
- **Q5 — Nối lại khi server chưa chạy.**
  - a) Backoff bằng `setTimeout` khi worker còn sống; worker ngủ thì nối lại ở lần thức kế tiếp (mở tab, bấm icon, mở dock);
  - b) Thêm quyền `alarms` để thử mỗi phút;
  - **Đề xuất:** a; nút Connect trong popover luôn thử lại ngay.
- **Q6 — Ảnh cho AI (`He` rỗng ở bản cũ).**
  - a) PNG thu nhỏ cạnh dài ≤ 2000 px;
  - b) Ảnh gốc;
  - c) JPEG chất lượng 0.8.
  - **Đề xuất:** a.
- **Q7 — Icon agent (9.41).**
  - a) Chép 8 logo từ `unpacked/scripts/patterns/` vào `public/` (dùng trong overlay qua `browser.runtime.getURL`, thêm web_accessible_resources cho đúng các file này);
  - b) Chỉ tên agent, không icon; bỏ 9.41.
  - **Đề xuất:** b — bớt tài nguyên phải lộ ra trang web và logo bên thứ ba.
- **Q8 — Phía server.** Repo không có server; gói `@screen-ruler/mcp` cũ không tương thích giao thức mới.
  - a) Đợt này chỉ làm phía extension + đặc tả giao thức; server làm ở dự án/đợt riêng;
  - b) Thêm package `mcp-server/` trong repo (cần `@modelcontextprotocol/sdk` + `ws`: dependency mới);
  - **Đề xuất:** a, kèm đặc tả trong `protocol.ts`; đổi tên gói trong lời nhắc khi server mới có tên.
- **Q9 — Lệnh sửa từ MCP có lưu theo site không.**
  - a) Có, như sửa tay (một engine);
  - b) Không, chỉ trong phiên.
  - **Đề xuất:** a.

## Quyết định đã chốt (2026-11-06)

Chủ dự án chọn theo đề xuất: Q1 a (WebSocket 127.0.0.1); Q2 a (một cổng cố định); Q3 a (extension tạo token, gắn vào prompt); Q4 a (chỉ tab đang bật iodob); Q5 a (backoff setTimeout); Q6 a (PNG cạnh dài ≤ 2000px); Q7 b (chỉ tên agent, bỏ 9.41); Q9 a (lưu sửa theo site).

**Q8 đổi thành b:** viết server trong repo, package riêng `packages/mcp-server` (stdio MCP server + WebSocket server theo giao thức của plan). Dependency của server (`@modelcontextprotocol/sdk`, `ws`) chỉ thuộc package đó, không vào bundle extension. Thêm sau Task 12:

- **Task 12b — Server:** khung package; WebSocket server 127.0.0.1 kiểm token + Origin; ánh xạ mỗi lệnh thành một MCP tool (schema từ validator ở Task 1); test với extension giả.
- **Task 12c — Nối thật:** test end-to-end server ↔ background thật trong Chromium headless; cập nhật prompt copy (`npx`/đường dẫn cục bộ).
