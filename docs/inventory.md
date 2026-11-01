# Kiểm kê hành vi bản cũ

- **Nguồn:** `unpacked/` tại commit `3a54e1c`, đọc qua `legacy-src/`, `unpacked/scripts/bd/`, `unpacked/bd-background.js`, `unpacked/**/*.html`, `unpacked/manifest.json`.
- **Định dạng dòng:** `- [ ] <mục>.<nn> · đợt <1–8|bỏ> · <hành vi người dùng thấy, hoặc quy tắc ngầm> — <file:dòng> (<hàm/case>) · <tên liên quan>`.
- **Quy tắc:** đánh `[x]` khi bản mới đạt mục đó lúc thử tay, trong đợt tương ứng.
- Độ đủ được giữ bằng `docs/inventory.test.ts`.

## 1. Kích hoạt, vòng đời, phím tắt, menu

- [ ] 1.01 · đợt 1 · Bấm icon: tab hợp lệ thì inject `BD_CONTENT_FILES` + `scripts/content.js` nếu chưa có, rồi gửi `toggle_script`; tắt thì vô hiệu side panel của tab và đóng cửa sổ panel rời; cập nhật icon; gửi `clear` tới side panel — legacy-src/background.js:4867 (we/\_e/Ie, action.onClicked) · toggle_script, check_script_is_active, clear
- [ ] 1.02 · đợt 1 · Thứ tự inject: core → overlay → measure-guides → audit → capture/capture → capture/fullpage → capture/editor → content.js (overlay trước measure-guides để phím mũi tên của overlay thắng) — unpacked/bd-background.js:5 (BD_CONTENT_FILES), legacy-src/background.js:1 (importScripts) · BD_CONTENT_FILES
- [ ] 1.03 · đợt 1 · Không chạy trên URL `chrome:`, `edge:`, `chrome-extension:`, Chrome Web Store; tab discarded/unloaded bị bỏ qua — legacy-src/background.js:5445 (De) · De
- [ ] 1.04 · đợt 1 · Icon hiện trên trang http/https/file/ftp (declarativeContent ShowAction); `action.enable()` — legacy-src/background.js:4618 (oe/ue) · declarativeContent
- [ ] 1.05 · đợt 1 · Icon đổi `images/icon32_active.png` / `images/icon32.png` theo trạng thái bật của tab — legacy-src/background.js:5052 (Te/Pe) · setActionIcon
- [ ] 1.06 · đợt 1 · Cài/khởi động: dựng lại rule declarativeContent, tạo menu, tắt side panel toàn cục — legacy-src/background.js:4253 (J, runtime.onInstalled), legacy-src/background.js:4471 (ne, onStartup) · onInstalled
- [ ] 1.07 · đợt 1 · Menu chuột phải `activate` (tiêu đề EXT_NAME_SHORT) trên page/frame/selection/link/editable/image/video/audio; click thì bật như bấm icon — legacy-src/background.js:4560 (se/ie), legacy-src/background.js:5078 (Se, contextMenus.onClicked) · EXT_NAME_SHORT, activate
- [ ] 1.08 · đợt 1 · Alt+Shift+S = `_execute_action`; Alt+Shift+↑/↓ (lệnh manifest) chuyển xuống content thành action cùng tên — legacy-src/background.js:3797 (commands.onCommand), unpacked/manifest.json (commands) · select_parent, select_child
- [ ] 1.09 · đợt 1 · Nút thoát: gửi `toggle_script`, tắt side panel của tab nếu đã tắt, đóng cửa sổ rời, cập nhật icon — legacy-src/background.js:3717 (close_extension) · close_extension
- [ ] 1.10 · đợt 1 · Content hỏi tab id của chính nó — legacy-src/background.js:3555 (get_tab_id) · get_tab_id
- [ ] 1.11 · đợt 1 · Đóng tab: dọn cửa sổ panel rời, rule DNR, cờ responsive, hàng chờ sửa — legacy-src/background.js:3807 (tabs.onRemoved) · tabs.onRemoved
- [ ] 1.12 · đợt 1 · Mở link ngoài (chỉ http/https) ở tab mới ngay cạnh tab gọi, có openerTabId — legacy-src/background.js:3137 (open_external_tab) · open_external_tab
- [ ] 1.13 · đợt 1 · Mở trang cài đặt — legacy-src/background.js:3705 (open_options_page) · open_options_page
- [ ] 1.14 · đợt 1 · Chuyển tới một tab theo id — legacy-src/background.js:3602 (go_to_tab) · go_to_tab

## 2. Chọn & soi phần tử

- [ ] 2.01 · đợt 1 · Copy xin quyền tuỳ chọn `clipboardWrite` qua background — legacy-src/background.js:3409 (request_clipboard_permission) · request_clipboard_permission

## 3. Đo & căn chỉnh

## 4. Chụp màn hình

- [ ] 4.01 · đợt 3 · Chụp màn hình/vùng: `captureVisibleTab`, cắt theo `rect` bằng OffscreenCanvas (lỗi thì trả ảnh nguyên); URL cấm trả `INVALID_URL`, lỗi chụp `CAPTURE_FAILED` — legacy-src/background.js:3617 (capture_tab), legacy-src/background.js:5743 ($e) · capture_tab
- [ ] 4.02 · đợt 3 · Lưu ảnh: trả dataUrl (gửi lên hoặc chụp mới); `ze` chỉ trả lại ảnh — legacy-src/background.js:3679 (download_image), legacy-src/background.js:5761 (ze) · download_image
- [ ] 4.03 · đợt 3 · Chụp cả trang qua debugger (CDP 1.3): nới viewport tới hết chiều cao (+shift), chạy `before`, chờ 300ms, chụp từng khúc `chunk` (tránh giới hạn texture ~16384px), rồi `after`, xoá override, `restore`, detach — unpacked/bd-background.js:18 (full_capture, bdFullCapture) · full_capture, debugger

## 5. Sửa trực tiếp

- [ ] 5.01 · đợt 5 · Sau khi thoát responsive và trang reload: sửa CSS đang chờ (`ruleEdits`) áp lại bằng `apply_pending_rule_edits`; nếu `enterEditMode` thì mở side panel và gửi `set_edit_mode` — legacy-src/background.js:3179 (exit_responsive_mode), legacy-src/background.js:5103 (Oe) · apply_pending_rule_edits, set_edit_mode

## 6. Side panel — tab Phần tử

- [ ] 6.01 · đợt 4 · Mở side panel cho tab (đang có cửa sổ rời thì focus cửa sổ đó) — legacy-src/background.js:3238 (open_side_panel) · open_side_panel
- [ ] 6.02 · đợt 4 · Đóng side panel: focus cửa sổ rời nếu có, không thì nhắn side panel `close` — legacy-src/background.js:3287 (close_side_panel) · close_side_panel, close
- [ ] 6.03 · đợt 4 · Kiểm trình duyệt có `chrome.sidePanel` — legacy-src/background.js:3392 (check_panel_api) · check_panel_api
- [ ] 6.04 · đợt 4 · Side panel theo từng tab, path `sidepanel/index.html?tabId=N`; đổi tab thì hỏi content `side_panel_loaded`, không trả lời thì tắt panel và gửi `clear` — legacy-src/background.js:4699 (me), legacy-src/background.js:5344 (Ce, tabs.onActivated) · side_panel_loaded, sidePanel
- [ ] 6.05 · đợt 4 · Tải stylesheet khác domain qua background: chỉ http/https, chặn localhost/IP nội bộ, tối đa 5 redirect kiểm từng bước, `credentials: omit`, timeout 10s — legacy-src/background.js:3211 (fetch_stylesheet), legacy-src/background.js:5454 (Ue), legacy-src/background.js:5543 (qe) · fetch_stylesheet
- [ ] 6.06 · đợt 4 · Kiểm đã có quyền host `<all_urls>` — legacy-src/background.js:3558 (has_host_permission) · has_host_permission

## 7. Side panel — tab Trang, cửa sổ riêng

- [ ] 7.01 · đợt 4 · Nhận diện công nghệ: chạy `scripts/detect-technologies.js` ở MAIN world đúng frame gọi — legacy-src/background.js:3570 (run_tech_detection) · run_tech_detection
- [ ] 7.02 · đợt 4 · Tách panel ra cửa sổ popup (mặc định 400×800 hoặc kích thước gửi lên; nhớ vị trí/kích thước lần trước), tắt side panel của tab — legacy-src/background.js:3327 (detach_panel), legacy-src/background.js:4707 (be) · detach_panel
- [ ] 7.03 · đợt 4 · Gắn lại: bật side panel cho tab, mở nó, đóng cửa sổ rời — legacy-src/background.js:3357 (dock_panel), legacy-src/background.js:4823 (ye/xe) · dock_panel
- [ ] 7.04 · đợt 4 · Ánh xạ tab → cửa sổ rời lưu ở `storage.session` khoá `detachedPanels` (sống qua lúc service worker ngủ) — legacy-src/background.js:4677 (he/ve) · detachedPanels
- [ ] 7.05 · đợt 4 · Đóng cửa sổ rời: bật lại side panel cho tab nếu script còn bật — legacy-src/background.js:3814 (windows.onRemoved) · windows.onRemoved
- [ ] 7.06 · đợt 4 · Kéo/co cửa sổ rời thì lưu `detachedPanelBounds` — legacy-src/background.js:3872 (windows.onBoundsChanged) · detachedPanelBounds

## 8. Responsive mode

- [ ] 8.01 · đợt 6 · Thoát responsive: xoá rule DNR của tab, ghi mốc 15s để tự bật lại sau reload — legacy-src/background.js:3179 (exit_responsive_mode), legacy-src/background.js:2292 (N/j) · exit_responsive_mode
- [ ] 8.02 · đợt 6 · Reload trong 15s đó: inject lại, `toggle_script`, cập nhật icon; reload bắt đầu (`loading`) thì xoá rule DNR — legacy-src/background.js:5103 (Oe, tabs.onUpdated) · tabs.onUpdated
- [ ] 8.03 · đợt 6 · Trang chặn iframe: rule session DNR (id = tabId) bỏ x-frame-options, frame-options, content-security-policy, content-security-policy-report-only cho sub_frame của tab; chỉ khi có quyền `<all_urls>` — legacy-src/background.js:3421 (enable_frame_header_rule), legacy-src/background.js:5237 (Ae/Re), legacy-src/background.js:5303 (Ne/je) · enable_frame_header_rule, declarativeNetRequest
- [ ] 8.04 · đợt 6 · Xin quyền `<all_urls>` rồi bật rule gỡ header — legacy-src/background.js:3491 (request_frame_unblock) · request_frame_unblock
- [ ] 8.05 · đợt 6 · Inject content vào mọi frame của tab — legacy-src/background.js:3751 (inject_and_activate_iframe) · inject_and_activate_iframe
- [ ] 8.06 · đợt 6 · Iframe responsive sẵn sàng thì bật script chỉ trong frame đó — legacy-src/background.js:3770 (responsive_iframe_ready) · responsive_iframe_ready, toggle_script_in_iframe_only
- [ ] 8.07 · đợt 6 · Cờ `sr-responsive-exit-*` trong sessionStorage của trang báo vừa thoát responsive — legacy-src/content.js:35147 (consumeResponsiveExitFlag) · consumeResponsiveExitFlag

## 9. Cài đặt, dữ liệu lưu, kênh nền

- [ ] 9.01 · đợt 7 · Theme: khoá `theme`, mặc định "system"; select THEME_SYSTEM / THEME_LIGHT / THEME_DARK trong mục OPTIONS_SECTION_APPEARANCE, dòng OPTIONS_ROW_THEME; đặt class force-light/force-dark trên `<html>` — legacy-src/options.js:2711 (q/Y), legacy-src/options.js:2696 (H), unpacked/options/index.html:12 · theme
- [ ] 9.02 · đợt 7 · Định dạng màu: `sidePanelPreferences.colorFormat`, mặc định "HEX"; select HEX/RGB/HSL/HSB trong mục OPTIONS_SECTION_EXTENSION, dòng OPTIONS_ROW_COLOR_FORMAT + OPTIONS_COLOR_FORMAT_SECONDARY; giữ các trường khác của object — legacy-src/options.js:2738 (z), legacy-src/options.js:2770 (W) · colorFormat
- [ ] 9.03 · đợt 7 · Chụp kèm padding: `screenshotPreferences.includePadding`, mặc định true; toggle, dòng OPTIONS_ROW_SCREENSHOT_PADDING + OPTIONS_SCREENSHOT_PADDING_SECONDARY — legacy-src/options.js:2810 (Q/$) · includePadding
- [ ] 9.04 · đợt 7 · Chụp kèm highlight: `screenshotPreferences.includeHighlights`, mặc định true; toggle, dòng OPTIONS_ROW_SCREENSHOT_HIGHLIGHTS + OPTIONS_SCREENSHOT_HIGHLIGHTS_SECONDARY — legacy-src/options.js:2810 (Q/$) · includeHighlights
- [ ] 9.05 · đợt 7 · MCP: nút OPTIONS_MCP_CONNECT_BUTTON / OPTIONS_MCP_DISCONNECT_BUTTON, dòng OPTIONS_ROW_MCP_SERVER + OPTIONS_MCP_SERVER_SECONDARY (HTML); icon cảnh báo OPTIONS_MCP_VERSION_OUTDATED_TOOLTIP; lệch phiên bản thì hộp thoại OPTIONS_MCP_VERSION_OUTDATED_TITLE / OPTIONS_MCP_VERSION_OUTDATED_BODY (OPTIONS_MCP_VERSION_UNKNOWN khi không rõ phiên bản) — legacy-src/options.js:2517 (B/G) · request_mcp_status, request_mcp_connect, request_mcp_disconnect
- [ ] 9.06 · đợt 7 · Xoá chỉnh sửa đã lưu: dòng OPTIONS_SAVED_EDITS_TITLE + OPTIONS_SAVED_EDITS_SECONDARY, nút OPTIONS_SAVED_EDITS_CLEAR, xác nhận OPTIONS_SAVED_EDITS_CONFIRM_TITLE / OPTIONS_SAVED_EDITS_CONFIRM_BODY; xoá mọi khoá `persistedRuleEdits:*` — legacy-src/options.js:2879 (re) · persistedRuleEdits
- [ ] 9.07 · đợt 7 · Trang cài đặt cập nhật khi storage đổi ở nơi khác (theme, mcpIntent, colorFormat, screenshotPreferences) — legacy-src/options.js:2485 (storage.onChanged) · storage.onChanged
- [ ] 9.08 · đợt 7 · Dịch `data-i18n` (textContent) và `data-i18n-html` (innerHTML); body opacity 0 tới khi nạp xong — legacy-src/options.js:2682 (V), legacy-src/options.js:2440 (j) · data-i18n
- [ ] 9.09 · đợt 1 · Hộp thoại dùng chung alert/confirm/prompt/size: nút DIALOG_CANCEL_BUTTON, DIALOG_OK (alert), DIALOG_CONFIRM; kiểu size có ô LABEL_WIDTH / LABEL_HEIGHT; theme theo `theme` — legacy-src/options.js:1764 (k), legacy-src/options.js:1647, legacy-src/options.js:1686 · dialog
- [ ] 9.10 · đợt 1 · Nạp font Geist / Geist Mono từ `fonts/*.woff2` — legacy-src/options.js:859 (d) · fonts
- [ ] 9.11 · đợt 1 · Khoá `settings`, mặc định {inspectIsOn: false, xrayModeIsOn: false, rulerIsOn: false, breakpointsIsOn: false, layoutGrid: {isOn: false, columns: 8, maxWidth: "auto", gutter: 20, margin: 40, color: "#FC48FF", opacity: 0.3}, responsiveMode: {selectedPresetKey: "iphone-17-pro", customWidth: 375, customHeight: 667, selectedZoom: 0.65, framesWrap: false, syncScrollEnabled: true, viewports: []}} — legacy-src/content.js:26931, legacy-src/content.js:20979, legacy-src/content.js:29629 (persistSettings), legacy-src/content.js:29723 (initSettings) · settings
- [ ] 9.12 · đợt 1 · Khoá `inspectorPinHintDone`, mặc định false (đã xem gợi ý ghim bằng Space) — legacy-src/content.js:29735 (initSettings) · inspectorPinHintDone
- [ ] 9.13 · đợt 1 · Content đọc `theme` ("system"), `sidePanelPreferences` ({}), `screenshotPreferences` (null → giữ padding/highlight = true) — legacy-src/content.js:29535, legacy-src/content.js:29551, legacy-src/content.js:29570 (setupEnvironment), legacy-src/content.js:11931, legacy-src/content.js:49718 · screenshotPreferences
- [ ] 9.14 · đợt 1 · Khoá `sidePanelPreferences`, mặc định {sectionVisibility: {layout, flexbox, textContent, css, assets, boxShadow, gradients, animations, transitions, colors, typography, documentOutline, issues, ogImage, metaTags, technologies, pageWeight, socialPreview, seoIssues — mỗi mục {collapsed: false}}, colorFormat: "HEX", codeViewMode: "css", socialPreviewType: "facebook"}; đọc thì trộn với mặc định — legacy-src/sidepanel.js:12733, legacy-src/sidepanel.js:13232 (Ai), legacy-src/sidepanel.js:3330, legacy-src/sidepanel.js:13042 · sidePanelPreferences
- [ ] 9.15 · đợt 5 · Khoá `persistedRuleEdits:<origin>` (trang file: dùng `file://<pathname>`) = {edits, updatedAt} — legacy-src/content.js:34975 (persistedEditsKey) · persistedRuleEdits
- [ ] 9.16 · đợt 1 · Khoá `mcpIntent` mặc định false; `detachedPanelBounds` mặc định null; storage.session: `detachedPanels` ({}), `panelHandoff:<tabId>` ({selectedTab, selectedEditTab, …}) — legacy-src/background.js:2988, legacy-src/background.js:3914, legacy-src/background.js:4678, legacy-src/sidepanel.js:13443 (Pi) · mcpIntent, panelHandoff
- [ ] 9.17 · đợt 1 · Kênh nền: `runtime.onMessage` phân theo `target` — "mcp" → router MCP, "background" → switch action, "bd" → full_capture; tới content dùng `target: "script"`, tới side panel `target: "side_panel"`; action lạ trả false — legacy-src/background.js:2918 (runtime.onMessage), unpacked/bd-background.js:18 · target
- [ ] 9.18 · đợt 1 · Quyền manifest: scripting, activeTab, contextMenus, storage, declarativeContent, sidePanel, declarativeNetRequestWithHostAccess, debugger; tuỳ chọn downloads, clipboardWrite, host `<all_urls>`; minimum_chrome_version 116 — unpacked/manifest.json · permissions
- [ ] 9.19 · đợt 1 · web_accessible_resources (matches `<all_urls>`): `scripts/patterns/*.svg|*.png` (hoạ tiết, icon, logo AI agent cho UI trên trang), `scripts/patterns/screenshots/*.png` (ảnh minh hoạ), `sidepanel/logos/*.svg` (logo công nghệ), `scripts/detect-technologies.js` (chạy MAIN world), `fonts/*.woff2` (Geist cho UI trên trang) — unpacked/manifest.json · web_accessible_resources

## 10. MCP

- [ ] 10.01 · đợt 8 · Router MCP (`target: "mcp"`): ~55 lệnh (list_tabs, focus_tab, get_page_info, get_selected_element, get_element_details, get_elements_details, get_element_outline, query_selector, get_element_matched_rules, get_breakpoints, get_seo_issues, get_meta_tags, get_page_weight, apply_styles, add_rule, revert_*, set_text_content, get_screenshot, set_viewport…); cổng "Studio tier" (G) luôn trả true — legacy-src/background.js:2322 (F), legacy-src/background.js:2302 (G) · get_element_matched_rules
- [ ] 10.02 · đợt 8 · Chuyển lệnh MCP xuống content: cần tabId số; chờ trang reload sau responsive (tối đa 10s); timeout 40s cho capture_for_ai / enter_responsive_mode / exit_responsive_mode / set_viewport, 12s cho lệnh khác — legacy-src/background.js:2810 (V), legacy-src/background.js:4022 (B), legacy-src/background.js:4028 (W) · capture_for_ai
- [ ] 10.03 · đợt 8 · `request_mcp_connect` ghi mcpIntent = true rồi gọi kết nối (hàm rỗng); `request_mcp_disconnect` ghi false; `request_mcp_status` trả {intent, eligible, connected: false}; `mcp_status_changed` phát tới mọi tab đang bật — legacy-src/background.js:2933 · request_mcp_connect, request_mcp_disconnect, request_mcp_status, mcp_status_changed
- [ ] 10.04 · đợt 8 · Tự kết nối lúc khởi động nếu mcpIntent — legacy-src/background.js:4496 (ae/ce), legacy-src/background.js:5656 (Ve), legacy-src/background.js:5716 (We, rỗng) · mcpIntent
- [ ] 10.05 · đợt 8 · Ảnh cho AI: chụp (hoặc dùng dataUrl gửi lên) rồi xử lý bằng `He` (đang rỗng) — legacy-src/background.js:3649 (capture_tab_for_ai), legacy-src/background.js:5764 (He) · capture_tab_for_ai

## 11. Bỏ

- [ ] 11.01 · bỏ · Listener ngoài `install_timestamp` ghi `installedAt` — legacy-src/background.js:3963 (onMessageExternal) · install_timestamp, onMessageExternal
- [ ] 11.02 · bỏ · Chặn sửa khoá `installedAt` (storage.onChanged ghi lại giá trị cũ) — legacy-src/background.js:1363 (h), legacy-src/background.js:1422 (\_) · installedAt
- [ ] 11.03 · bỏ · Mở trang giá `www.bodoi.com/pricing` kèm extId/lang/theme — legacy-src/background.js:4323 (ee) · pricing
- [ ] 11.04 · bỏ · Mở tab giới thiệu (URL đã bị gỡ) — legacy-src/background.js:4281 (X/Z) · welcome
- [ ] 11.05 · bỏ · Đọc gói/khuyến mãi (currency, inspect/studio amount, offer) — legacy-src/background.js:4400 (te), legacy-src/background.js:4414 (re) · offer
- [ ] 11.06 · bỏ · Mục menu `enter_license` mở trang cài đặt — legacy-src/background.js:5078 (Se) · enter_license
- [ ] 11.07 · bỏ · Hàm stub còn sót: Ye, Qe — legacy-src/background.js:5719, legacy-src/background.js:5778 · stub
