# iodob — Đợt 4: Side panel — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bản mới có side panel như bản cũ:
- panel theo từng tab, mở/đóng bằng nút dock hoặc phím `0`;
- tab **Phần tử** hiện chi tiết phần tử đang chọn (Document, Box model, Text, Code Computed/Source/Tailwind, Layout, Màu, Gradient, Typography, Box shadow, Animation/Transition, Canvas, Asset, lỗi tương phản), hover mục thì tô phần tử trên trang;
- tab **Trang** có Meta tags, xem trước khi share, 16 kiểm tra SEO, nhận diện công nghệ, dung lượng trang;
- panel tách ra cửa sổ riêng và gắn lại được, giữ tab đang xem và vị trí cuộn.

**Architecture:**
- **Entrypoint side panel** ở `src/entrypoints/sidepanel/` (`index.html`, `main.ts`, `App.svelte`, `sections/*.svelte`). WXT tự sinh `side_panel.default_path`. Panel theo tab mở bằng `sidePanel.setOptions({ tabId, path: 'sidepanel.html?tabId=N', enabled: true })`, như `me()` cũ (`background.js:4699`). Cửa sổ rời dùng thêm `&detached=1`.
- **Kênh có kiểu thứ ba:** `Target` thêm `'sidepanel'`, có `SidePanelApi`. Hiện có thể nhiều panel cùng lúc (một panel mỗi tab, cộng cửa sổ rời), nên `handleMessages` có thêm tuỳ chọn `accept(sender)`. Panel chỉ trả lời tin từ tab của nó. Tin không nhận thì không trả lời, đúng kiểu `return false` cũ.
- **Phía background** gom ở `src/background/panels.ts`, gọi từ `background.ts`. Gồm: mở/đóng panel, tách/gắn, `detachedPanels` (storage.session), `detachedPanelBounds`, `tabs.onActivated`, `windows.onRemoved` / `onBoundsChanged`. Cùng file có thêm các handler nhỏ: `get_tab_id`, `go_to_tab`, `open_external_tab`, `check_panel_api`, `has_host_permission`, `fetch_stylesheet`, `run_tech_detection`.
- **Phía content: một cầu nối** ở `src/content/sidepanel/`. Đây không phải công cụ trong registry, trừ nút dock `sidepanel` (phím 0). Cầu nối gồm:
  - `bridge.svelte.ts`: `$effect.root` theo `state.selected` gửi `select_element` / `clear`; nhận port `sidepanel_*`; handler `ContentApi` cho panel;
  - `details.ts`: gom dữ liệu phần tử, gọi các hàm thuần trong `src/lib`;
  - `page.ts`: `page_data`, `page_technologies`, PerformanceObserver cho dung lượng trang;
  - `highlight.ts`: painter `sidepanel` tô các phần tử theo màu / typography / issue / hover id.
- **Logic thuần ở `src/lib/`, có unit test** (theo bố cục spec §6.2):
  - `color.ts` (định dạng HEX/RGB/HSL/HSB);
  - `format.ts` (kích thước, byte);
  - `selector.ts` (selector hiển thị / duy nhất, id phần tử);
  - `element/*.ts` (box model, layout, typography, màu, gradient, shadow, easing, canvas palette, asset);
  - `a11y.ts` (lỗi tương phản);
  - `css/specificity.ts`, `css/matched.ts` (rule khớp, chỉ đọc), `css/tailwind.ts`;
  - `page/meta.ts`, `page/seo.ts`, `page/weight.ts`;
  - `tech/signatures.ts`;
  - `panels.ts` (đường dẫn, kích thước cửa sổ rời, handoff), `panel-keys.ts`.
- **Nhận diện công nghệ** là một unlisted script WXT (`src/entrypoints/detect-technologies.ts`). Background chạy nó ở MAIN world bằng `scripting.executeScript({ files, world: 'MAIN' })` và lấy kết quả từ `InjectionResult` (xem Quyết định). **Không thêm dependency.**

**Tech Stack:** Giữ nguyên stack Đợt 1–3: WXT 0.21.5, Svelte 5, Tailwind 4, `@lucide/svelte`, `@wxt-dev/i18n`, Vitest + happy-dom 21.0.3. **Không thêm dependency.**
- Nhận diện công nghệ: port `legacy-src/detect-technologies.js` (185 chữ ký).
- Logo: chép 159 file SVG từ `unpacked/sidepanel/logos/` vào `public/logos/`.
- Sinh class Tailwind: port từ `content.js`. Không dùng gói `tailwindcss` lúc chạy.
- Canvas 2D / `getImageData` không có trong happy-dom, nên test bảng màu canvas chạy trên `Uint8ClampedArray` giả.

**Spec:** `docs/superpowers/specs/2026-11-01-iodob-rewrite-design.md`. Các mục liên quan:
- §3 Ràng buộc: không có `host_permissions` cố định; `<all_urls>` và `downloads` là optional; MV3 cấm code từ xa (logo và font đóng gói sẵn)
- §4.1 (phím 0), §4.4 Side panel — tab Phần tử, §4.5 Side panel — tab Trang
- §6.2 (lib: css, page, tech), §6.3 DRY (kênh có kiểu duy nhất, một lớp settings, i18n, token)
- §7 Giao diện mới
- §8 Đợt 4
- §9 "Inspector / chọn" (bỏ qua phím khi gõ trong ô nhập; sự kiện panel không lọt xuống)
- §11 Để người làm tự quyết

**Checklist hành vi:** các dòng `đợt 4` trong `docs/inventory.md`, gồm 66 dòng:
- 1.10, 1.12, 1.14, 1.36, 1.37, 1.41
- 2.16–2.22
- 3.23
- 6.01–6.37, 6.48
- 7.01–7.18
- 9.14, 9.16, 9.24–9.26, 9.28, 9.32, 9.37, 9.38

Các dòng của đợt khác mà đợt này động tới một phần (tách ở Task 14): 5.21 (`get_matched_rules`, `enable_cross_origin_styles`) và 1.06 (tắt side panel toàn cục, chưa làm thật ở Đợt 1).

**Code cần port:**
- `legacy-src/background.js`:
  - `open_side_panel` `:3238`, `close_side_panel` `:3287`, `detach_panel` `:3327`, `dock_panel` `:3357`, `check_panel_api` `:3392`;
  - `get_tab_id` `:3555`, `has_host_permission` `:3558`, `run_tech_detection` `:3570`, `go_to_tab` `:3602`, `open_external_tab` `:3137`, `fetch_stylesheet` `:3211`;
  - `le`/`he`/`ve`/`me`/`ge`/`be`/`ye` `:4674–4870`, `Ce` (onActivated) `:5344`;
  - `windows.onRemoved` `:3814`, `onBoundsChanged` `:3872`, `Ue`/`qe` `:5454`, `:5543`.
- `legacy-src/content.js` (chỉ grep theo tên hàm hoặc `sed` theo khoảng dòng ghi ở kiểm kê, **không** đọc cả file):
  - `ensureElementId` `:15157`, `getDisplaySelector` / `getUniquePath` / `getFullPath` `:15233–15360`;
  - kênh `Wg` editor `:21524–21606`, `:23916`, `:24003`, `:24043`;
  - `sidePanelAction` `:39064`, `toggleSidePanel` `:39108`;
  - `collectPageMetadata` `:39207`, `collectSEOIssues` `:39254`, `collectPageWeight` `:39435`, `getPageData` `:39538`;
  - `sendElementToSidePanel` `:39602–40800`;
  - `getElementTailwind` `:40822` và bộ sinh Tailwind `:17948–20991`;
  - `collectA11yIssues` `:40909`, `getElementAssets` `:41154`, `getElementLayout` `:41324`, `getCanvasColors` `:41375`, `getElementTypography` `:41584`;
  - `calculateWCAGContrast` `:44186`, `watchViewportContrast` `:44465`, `selectElementById` `:47176`, `detectTechnologies` `:48056`;
  - `getAppliedRules` `:32318`, `loadCrossOriginStylesheets` `:31926`;
  - `highlightElementsFor*` `:27171–27222`;
  - hộp thoại `tu`/`au`/`ou` `:11899–12149`;
  - định dạng màu `Cu`/`Eu`/`_u` `:13096–13177`.
- `legacy-src/sidepanel.js` (11k dòng, chỉ đọc theo khoảng ghi ở kiểm kê):
  - kênh `:12371`, khởi động `Ni`/`ki`/`_i` `:12987–13130`;
  - tab và handoff `:13344–13600`, tab Trang `:13593–14240`;
  - các mục `:15383–18264`.
- `legacy-src/detect-technologies.js` toàn bộ (port gần như nguyên văn).
- `unpacked/sidepanel/{index.html,box-model.html,styles.css,element-types.css}`: chỉ để đối chiếu bố cục, **không** chép CSS (dùng token §7).

## Phạm vi — phần dời sang đợt khác và quyết định

Theo quy tắc "Dòng gộp" của `docs/inventory.md`, Task 14 tách các phần sau thành dòng mới (đánh số tiếp cuối mục, ghi `(tách từ X)`):

| Dòng | Phần dời | Sang |
| --- | --- | --- |
| 6.09 | Nhánh "chế độ sửa gửi `select_element` mode edit + editDetails"; trường `editCount` | 5 |
| 6.13 | `select_element` mode edit (editor chưa tải thì giữ lại), `edit_payload_extras`, `media_activity`, `set_mode` | 5 |
| 6.13 | `responsive_mode_ready` (nối lại port với iframe responsive) | 6 |
| 6.20 | Ô chọn trạng thái (Default + availableStates) → `force_element_state`: cần engine ép trạng thái của editor (`ad` attr, rule `:hover` viết lại) | 5 |
| 2.17 | "id trên phần tử đã sửa bị xoá khi hoàn tác hết" | 5 |
| 2.19 | `select_parent` / `select_child` "không ở responsive": nhánh responsive | 6 |
| 2.20 | "ở responsive bỏ qua" | 6 |
| 2.21 | Gửi `clear` cho `editor_panel` | 5 |
| 9.24 | Hộp thoại confirm / prompt / size (LABEL_WIDTH / LABEL_HEIGHT, DIALOG_CONFIRM): chỉ chế độ sửa và responsive dùng. Đợt này làm alert (DIALOG_OK) | 5 |
| 5.21 | `get_matched_rules` (chỉ đọc) và `enable_cross_origin_styles` làm ở **đợt này**, vì tab Source của 6.24–6.26 cần. Tách thành dòng `đợt 4` mới. `force_element_state`, `apply_pending_rule_edits`, `set_edit_mode`, `select_edited_element` ở lại đợt 5 | 4 (tách) |
| 1.06 | "tắt side panel toàn cục" làm thật ở đợt này: Đợt 1 chưa có side panel nên chưa có code. Tách thành dòng `đợt 4` | 4 (tách) |
| 9.37 | Logo và `detect-technologies` không cần `web_accessible_resources`. Logo chỉ dùng trong trang extension. Detector chạy bằng `scripting.executeScript({ files })`, mà lệnh này không cần WAR. Đánh `[x]` với ghi chú "không cần trong bản mới" | — |
| 6.14 | `side_panel_closed` qua `beforeunload` thay bằng `port.onDisconnect` (cùng port `sidepanel_*` của 9.32). Đánh `[x]` khi đạt, ghi "thay bằng port" | — |
| 6.07 | "huy hiệu cảnh báo (cờ hiện luôn tắt)": cờ luôn tắt nên không port huy hiệu. Tooltip DOCK_OPEN_PANEL_UNSUPPORTED vẫn làm | — |
| 6.09 / 6.33 | `update_canvas_fps` (đo FPS canvas): port nếu tìm thấy hàm đo trong `sendElementToSidePanel`. Nếu nó chỉ là Promise rỗng thì ghi "không áp dụng" | — |

**Quyết định khi spec, kiểm kê và code cũ lệch nhau:**
- **Kênh nhắn tin.** Bản cũ dùng `{ target: "side_panel" | "editor" | "script" | "background", action }`. Bản mới gom về ba `Target` có kiểu: `background`, `content`, `sidepanel`.
  - Tên lệnh giữ đúng tên cũ (`select_element`, `page_data`, `highlight_hovered`…).
  - `target: "editor"` / `"script"` gộp vào `ContentApi`.
  - `tabId` trong payload bỏ: bên nhận đọc `sender.tab.id`.
  - Panel gửi sang trang bằng `sendToTab(tabId, …, { frameId: 0 })`. Frame khác chỉ có ở responsive (đợt 6).
- **Lọc panel theo tab.** `handleMessages(target, handlers, signal, { accept })`: `accept(sender) === false` thì `return false` (không trả lời). Nhờ vậy panel của tab khác không chặn câu trả lời. `ping` và `tab_specific_ping` giữ đúng ngữ nghĩa cũ:
  - `ping`: panel trả lời khi có tab trùng;
  - `tab_specific_ping`: trả lời chỉ khi `document.visibilityState === 'visible'` và đúng tab.
- **`sidePanel.open` cần cử chỉ người dùng.** Handler `open_side_panel` / `dock_panel` gọi `browser.sidePanel.open` **trước mọi `await`**. Map `detachedPanels` được nạp sẵn vào bộ nhớ lúc SW khởi động. Bản cũ cũng tra `le` đồng bộ. `handleMessages` hiện chạy handler sau một microtask (`Promise.resolve().then`). Task 3 kiểm điều này trên Edge. Nếu mất cử chỉ thì gọi thẳng trong listener (xem Quyết định đã chốt #2).
- **Đóng panel.** `port.onDisconnect` phía content thay `side_panel_closed`, dùng để xoá tô màu (9.32) và đặt `panelOpen = false`.
- **Theme side panel (6.16).** "Hệ thống" ở panel là `prefers-color-scheme`: panel không nằm trên trang nên không có "tương phản với trang". `data-theme` đặt trên `<html>`. `theme.css` thêm selector `:root[data-theme='light']` cạnh `:host([data-theme='light'])`. Panel là trang extension nên dùng được `rem`, nhưng vẫn dùng px cho thống nhất với token.
- **Font panel** dùng lại `src/ui/fonts/*.woff2` qua `@font-face` trong CSS của panel (trang extension, không vướng CSP trang).
- **Dữ liệu phần tử** giữ đúng tên trường của `inspectDetails` cũ (`name`, `boxModel`, `colors`, `gradients`, `textContent`, `assets`, `animations`, `transitions`, `boxShadow`, `typography`, `issues`, `canvas`, `layout`, `selector`, `css`, `before`, `after`, `tailwind`, `id`, `skippedCrossOriginCount`). Kiểu đặt một lần trong `src/lib/element/types.ts`. Đợt 8 (MCP `get_element_details`) dùng lại kiểu này.
- **Rule khớp (6.24–6.26).** Bản cũ lấy từ `getAppliedRules` của engine sửa. Bản mới viết bản **chỉ đọc** ở `src/lib/css/matched.ts`:
  - duyệt `document.styleSheets` + `adoptedStyleSheets` + shadow root của phần tử; `@media` / `@supports` / `@layer` thành `wrappers`, có `mediaActive`;
  - specificity, `sourceIndex`; xếp theo `score`;
  - đợt 5 mở rộng file này (`ruleRef`, `readOnly`, edit), không viết lại.
- **Stylesheet khác domain (6.05, 6.26).**
  - Content đếm stylesheet đọc `cssRules` bị ném lỗi (`skippedCrossOriginCount`).
  - Có quyền `<all_urls>` thì content gọi `fetch_stylesheet(href)` ở background (kiểm kiểu `Ue`/`qe`), rồi dựng `CSSStyleSheet` rời bằng `replaceSync` để đọc rule.
  - **Không** gắn sheet vào trang.
- **Tailwind (6.24, 9.26):** port bộ sinh class của `content.js:17948–20991` sang `src/lib/css/tailwind.ts`, kèm bảng đổi tên v3 → v4 của 6.24. Đây là phần port lớn nhất. Test theo bảng mẫu (Task 8).
- **Nhận diện công nghệ (7.01, 7.17).** Bản cũ: content nghe `postMessage` `TECH_DETECTION_RESULT` tới origin trang, chờ 2s. Script trên trang có thể giả tin này. Bản mới: unlisted script trả mảng kết quả làm giá trị cuối, background trả nó qua `run_tech_detection`. Vẫn có timeout 2s phía content. Nếu WXT không trả giá trị của unlisted script thì dùng lại `postMessage` cũ, kiểm `e.source === window` (xem Quyết định đã chốt #3).
- **Hộp thoại "không tìm thấy phần tử" (2.16, 2.20).** `alertDialog(title, msg)` mới ở `src/ui/Dialog.svelte`, gắn vào host chính, token §7. Không có shadow root riêng như bản cũ, vì host chính đã cách ly.
- **Định dạng màu (2.22, 3.23, 9.25, 9.28, 9.32).**
  - Content đọc `sidePanelPreferences.colorFormat` và `watch`.
  - Panel inspector nổi và hút màu dùng `formatColor`.
  - Màu `lab()` / `oklab()` / `oklch()` đã đi qua `parseColor` (Đợt 1).
- **Asset (6.34).** Tải bằng `browser.downloads.download` từ trang panel. Trước đó xin quyền `downloads` (optional) bằng `permissions.request` ngay trong click. Không đi qua background.
- **Mục Trang tự làm mới.** Bản cũ nghe `tabs.onUpdated` `status: loading` trong panel (7.12). Bản mới giữ, và lọc theo `tabId` của panel.
- **Không có màn hình bán hàng / Pro** trong panel (spec §4.8 "Bỏ").

## Global Constraints

- **Giữ mọi ràng buộc của Đợt 0–3:**
  - phiên bản ghim chính xác; **không thêm dependency**;
  - manifest không có `host_permissions` / `content_scripts`;
  - `sidePanel` đã có trong `permissions`; `downloads` và `<all_urls>` vẫn optional; **không thêm quyền**;
  - chỉ `en` và `vi`;
  - không sửa `unpacked/` và `legacy-src/`;
  - commit kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`;
  - mọi lệnh chạy ở gốc repo bằng Git Bash.
- **Chuỗi giao diện:**
  - chỉ qua `i18n.t()`, khoá lồng nhau trong `src/locales/{en,vi}.json`, nhóm `panel.*`, `page.*`, `seo.*`, `issue.*`, `dialog.*`;
  - chuỗi lấy từ `unpacked/_locales/{en,vi}/messages.json` chép **nguyên văn**;
  - placeholder `$COUNT$` cũ đổi sang substitution `$1` của `@wxt-dev/i18n`;
  - số ít/số nhiều giữ cặp khoá cũ (`LABEL_ISSUE` / `LABEL_ISSUES`…);
  - chuỗi `T()` không có trong `_locales` thì dịch theo văn phong cũ và ghi trong bảng khoá của task.
- **Khoá storage giữ đúng tên bản cũ:**
  - `sidePanelPreferences` (local; 9.14);
  - `detachedPanelBounds` (local, mặc định `null`);
  - `detachedPanels`, `panelHandoff:<tabId>` (session; 9.16);
  - `theme` (đã có).
- **Tên lệnh giữ đúng tên bản cũ.** Không thêm tên mới, trừ `get_matched_rules` / `enable_cross_origin_styles`, vốn có từ 5.21.
- **Panel không giữ tham chiếu DOM của trang.** Phần tử đi qua `id` (`data-sr-id-<extId>`, 2.17). Dữ liệu là JSON thuần (structured-clone được). Mọi hàm gom dữ liệu trả object thuần.
- **Đường chạy liên tục:**
  - hover mục ở panel → trang: highlight vẽ bằng painter `sidepanel` qua lớp overlay chung, gom rAF;
  - PerformanceObserver gửi `page_weight_update` tối đa 4 lần/giây (7.09);
  - theo dõi tương phản ngoài màn hình dùng `IntersectionObserver` (port `watchViewportContrast`);
  - không gửi tin trong `mousemove` của trang.
- **Listener và observer:**
  - phía content gắn `{ signal: sessionSignal() }`;
  - observer (`PerformanceObserver`, `IntersectionObserver`) ngắt trong `onStop` và khi phần tử chọn đổi;
  - phía panel: listener `runtime` / `storage` / `tabs` gỡ trong `onDestroy` của `App.svelte`.
- **Token §7** từ `src/ui/theme.css`, dùng lại cho panel (bản sáng/tối). Không chép `styles.css` cũ. Không thêm khối CSS tay theo màn hình, trừ `box-model` (lưới lồng 4 lớp) viết bằng utility Tailwind.
- **`pnpm check` và `pnpm build`** phải qua ở cuối mỗi task.

## Review Focus

1. **Mở panel bằng nút dock / phím `0` (cử chỉ người dùng) và khi đã có cửa sổ rời.**
   - Mong đợi: bấm lần đầu thì panel mở, không có lỗi `sidePanel.open() may only be called in response to a user gesture` trong console SW. Bấm lại khi panel đang hiện thì panel đóng. Có cửa sổ rời thì cửa sổ đó được focus, không mở panel thứ hai.
   - Kiểm bằng: `background.test.ts` (Task 3: `open_side_panel` gọi `sidePanel.open` đồng bộ, trước `await` đầu tiên, dùng một spy ghi thứ tự; có `detachedPanels[tab]` thì gọi `windows.update(focused)`); thử tay mục 3–4.
2. **Đổi tab, đóng tab, tắt extension khi panel đang mở.**
   - Mong đợi: sang tab chưa bật iodob thì panel tắt cho tab đó và nhận `clear`. Đóng tab thì cửa sổ rời đóng theo, `detachedPanels` không còn tab đó. Ctrl+Q / bấm icon thì panel tắt, cửa sổ rời đóng.
   - Kiểm bằng: `background.test.ts` (Task 3: `onActivated` không có trả lời `side_panel_loaded` → `setOptions({ enabled:false })`; `tabs.onRemoved` → `windows.remove`; `close_extension` → `setOptions enabled:false` + `windows.remove`).
3. **Hai panel cùng lúc** (panel của tab A trong cửa sổ 1, cửa sổ rời của tab B).
   - Mong đợi: chọn phần tử ở tab B chỉ cập nhật panel B. `tab_specific_ping` từ A chỉ được panel A trả lời.
   - Kiểm bằng: `messaging.test.ts` (Task 2: `accept` trả `false` → listener trả `false`, không gọi `sendResponse`); `App` test (Task 4).
4. **Gõ trong ô nhập ở panel, và phím số chuyển sang trang.**
   - Mong đợi: gõ `1`…`9` trong ô tìm / select / contentEditable của panel không bật công cụ. Ngoài ô nhập: `0`–`9` và Esc chuyển sang trang thành `keyboard_shortcut`, có tác dụng như nhấn ở trang. Ctrl+1 không chuyển.
   - Kiểm bằng: `panel-keys.test.ts` (Task 4); `keys.test.ts` content (Task 5: `keyboard_shortcut('2')` chạy item `2` như nhấn phím; đang pause hoặc `capturing` thì bỏ qua).
5. **Trang có stylesheet khác domain, và trang có `<link>` về `localhost` / `192.168.*`.**
   - Mong đợi: chưa có quyền thì tab Source hiện "N … bị ẩn" + link. Bấm link thì xin quyền, rồi rule xuất hiện. `fetch_stylesheet` từ chối URL nội bộ, redirect quá 5 lần và timeout 10s. Không có request nào kèm cookie.
   - Kiểm bằng: `stylesheet-fetch.test.ts` (Task 3: `isAllowedStylesheetUrl` chặn `http://127.0.0.1`, `http://10.0.0.1`, `http://[::1]`, `http://foo.localhost`, `file:`; vòng redirect `manual` dừng ở 5; `credentials: 'omit'`).
6. **Thoát (Ctrl+Q) và dừng khi đang có observer / highlight.**
   - Mong đợi: `data-sr-id-*` vẫn còn trên trang như bản cũ (Quyết định đã chốt #5). Không còn painter `sidepanel`. PerformanceObserver và IntersectionObserver đã ngắt. Panel nhận `clear`.
   - Kiểm bằng: `bridge.test.ts` (Task 5/7/10: `stopSession()` → `disconnect` được gọi; `clear_element_highlights` không còn box).
7. **Nhận diện công nghệ trên trang giả kết quả.**
   - Mong đợi: script trang `postMessage({type:'TECH_DETECTION_RESULT', technologies:[…]})` không làm đổi mục công nghệ. Hết 2s không có kết quả thì mục rỗng, không treo.
   - Kiểm bằng: `page.test.ts` (Task 11: `detectTechnologies` chỉ lấy từ trả lời `run_tech_detection`; timeout 2s bằng fake timers).

---

### Task 1: Định dạng màu, kích thước, `sidePanelPreferences`; inspector và hút màu theo `colorFormat`

**Files:**

- Modify:
  - `src/lib/color.ts`, `src/lib/color.test.ts`
  - `src/lib/settings.ts`, `src/lib/settings.test.ts`
  - `src/content/tools/inspector/InspectPanel.svelte`
  - `src/content/tools/eyedropper/index.ts`
  - `src/content/core/state.svelte.ts` (`colorFormat`)
  - `src/content/core/session.ts` (đọc và `watch` prefs)
- Create: `src/lib/format.ts`, `src/lib/format.test.ts`

**Interfaces:**

- Produces:
  - `src/lib/color.ts`:
    - `type ColorFormat = 'HEX' | 'RGB' | 'HSL' | 'HSB'`
    - `formatColor(c: Rgba, f: ColorFormat): string`: port `Cu` / `Eu` / `_u` (`content.js:13096–13177`). Chép đúng chuỗi ra của bản cũ:
      - HEX hoa, có alpha thì 8 ký tự;
      - `rgb(r, g, b)` / `rgba(r, g, b, a)`;
      - `hsl(h, s%, l%)`;
      - HSB như bản cũ in ra (đọc `_u`).
    - `formatCss(css: string, f: ColorFormat): string`: `parseColor` rồi `formatColor`; không parse được thì trả nguyên.
  - `src/lib/format.ts`:
    - `formatDim(n: number): string`: tối đa 3 số lẻ, bỏ 0 thừa (6.20; `Number(n.toFixed(3)).toString()`).
    - `formatSize(w: number, h: number): string` → `` `${formatDim(w)} × ${formatDim(h)}` ``.
    - `formatBytes(b: number): string`: B / KB / MB như `us` (`sidepanel.js:17758`), đọc nguyên ngưỡng và số lẻ ở đó.
  - `src/lib/settings.ts`:
    - `SECTION_IDS`: 19 id của 6.19 / 9.14, đúng thứ tự cũ.
    - `type SidePanelPrefs = { sectionVisibility: Record<SectionId, { collapsed: boolean }>; colorFormat: ColorFormat; codeViewMode: 'css' | 'source' | 'tailwind'; socialPreviewType: 'facebook' | 'x' | 'linkedin' }`. Giá trị chuỗi của `codeViewMode` / `socialPreviewType` đối chiếu `sidepanel.js:12733`.
    - `DEFAULT_PANEL_PREFS`.
    - `panelPrefsItem = storage.defineItem<Partial<SidePanelPrefs>>('local:sidePanelPreferences', { fallback: {} })`.
    - `mergePanelPrefs(p): SidePanelPrefs`: trộn sâu `sectionVisibility` (port `Ai` `:13232`).
    - `getPanelPrefs()`, `updatePanelPrefs(patch)`.
  - `state.colorFormat: ColorFormat` ('HEX'). `startSession` đọc `panelPrefsItem`, `watch` cập nhật (9.28, 9.32 phần storage), gỡ trong `onStop`.
  - InspectPanel: mọi màu hiển thị và copy qua `formatCss(_, state.colorFormat)` (2.22). Hút màu copy theo `state.colorFormat` (3.23).

- [ ] **Step 1: Viết test fail.**
  - `color.test.ts`:
    - `formatColor({r:255,g:0,b:0,a:1}, 'HEX') === '#FF0000'`;
    - `'RGB'` → `'rgb(255, 0, 0)'`; `'HSL'` → `'hsl(0, 100%, 50%)'`; `'HSB'` theo chuỗi bản cũ (lấy từ `_u`, viết vào test);
    - alpha 0.5 → `'#FF000080'` / `'rgba(255, 0, 0, 0.5)'`;
    - `formatCss('oklch(0.628 0.258 29.23)', 'HEX')` gần `#FF0000` (±1 kênh).
  - `format.test.ts`: `formatDim(12.5000)` → `'12.5'`; `formatDim(1/3)` → `'0.333'`; `formatSize(100, 20.25)` → `'100 × 20.25'`; `formatBytes(1536)` theo bản cũ.
  - `settings.test.ts`:
    - storage rỗng → `getPanelPrefs()` bằng `DEFAULT_PANEL_PREFS` (19 mục `collapsed:false`, HEX, css, facebook);
    - `{ sectionVisibility: { css: { collapsed: true } } }` → các mục khác vẫn còn.
  - `inspector.test.ts`: `state.colorFormat = 'RGB'` → panel hiện `rgb(`.
  - Run: `pnpm vitest run src/lib/color.test.ts src/lib/format.test.ts src/lib/settings.test.ts src/content/tools/inspector`. Expected: FAIL.
- [ ] **Step 2: Viết code** theo Interfaces.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: color formats, side panel preferences, inspector honours colorFormat" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 2: Kênh có kiểu cho side panel

**Files:**

- Modify: `src/lib/messaging.ts`, `src/lib/messaging.test.ts`
- Create: `src/lib/element/types.ts`, `src/lib/page/types.ts`

**Interfaces:**

- Produces:
  - `type Target = 'background' | 'content' | 'sidepanel'`.
  - `handleMessages(target, handlers, signal?, opts?: { accept?: (sender) => boolean })`.
  - `sendToSidePanel<K extends keyof SidePanelApi>(type, ...data)`: `runtime.sendMessage`. "Receiving end does not exist" → `undefined`, không ném: panel đóng là chuyện bình thường.
  - `sendToTab(tabId, type, ...data)` thêm overload có `{ frameId }`. Panel luôn gửi `frameId: 0`.
  - `BackgroundApi` thêm:
    ```ts
    get_tab_id(): number | undefined;
    go_to_tab(tabId: number): boolean;
    open_external_tab(url: string): boolean;
    open_side_panel(): { success: boolean; error?: string };
    close_side_panel(): { success: boolean };
    check_panel_api(): boolean;
    has_host_permission(): boolean;
    detach_panel(tabId: number, size: { width: number; height: number }): { success: boolean; error?: string };
    dock_panel(tabId: number): { success: boolean; error?: string };
    fetch_stylesheet(url: string): { ok: true; text: string; finalUrl: string } | { ok: false; error: string };
    run_tech_detection(): { success: true; technologies: Technology[] } | { success: false; error: string };
    ```
  - `ContentApi` thêm (thay kênh `editor` / `script` cũ):
    ```ts
    side_panel_loaded(): void;            // gửi page_data + phần tử chọn (9.38)
    refresh_page_data(): void;
    page_weight_subscribe(): void; page_weight_unsubscribe(): void;
    highlight_hovered(id: string): void; remove_highlight_hovered(): void;
    go_to_selected_element(id?: string): boolean;
    select_parent(id?: string): void; select_child(id?: string): void;   // mở rộng chữ ký cũ
    get_host_name(): string; get_url(): string;
    highlight_issue_element(id: string): void;
    highlight_elements_for_color(color: string): void;
    highlight_elements_for_typography(key: string): void;
    highlight_elements_for_issue(issueId: string): void;
    clear_element_highlights(): void;
    keyboard_shortcut(key: string): void;
    get_matched_rules(): { success: boolean; matchedRules: MatchedRule[]; skippedCrossOriginCount?: number };
    enable_cross_origin_styles(): { success: boolean };
    check_script_is_active(): { scriptIsActive: boolean };
    ```
  - `SidePanelApi`:
    ```ts
    ping(): { isOpen: true };
    tab_specific_ping(): { isOpen: true };
    content_script_loaded(): void;
    close(): void;
    select_element(d: ElementDetails): void;
    update_canvas_fps(fps: number): void;
    page_data(d: PageData): void;
    page_technologies(t: Technology[]): void;
    page_weight_update(w: PageWeight): void;
    update_issues(issues: Issue[]): void;
    clear(): void;
    ```
  - `src/lib/element/types.ts`: `ElementDetails` (tên trường như `inspectDetails` cũ, xem Quyết định), `Issue`, `MatchedRule`.
  - `src/lib/page/types.ts`: `PageData`, `PageWeight`, `Technology`, `SeoIssue`.

- [ ] **Step 1: Viết test fail** (`messaging.test.ts`, `fakeBrowser`):
  - handler `sidepanel` với `accept: (s) => s.tab?.id === 5`: tin từ tab 7 → listener trả `false`, handler không chạy; từ tab 5 → chạy, trả lời;
  - `sendToSidePanel` khi `sendMessage` ném "Could not establish connection. Receiving end does not exist." → resolve `undefined`;
  - `sendToTab(3, 'get_url', { frameId: 0 })` → `tabs.sendMessage(3, packet, { frameId: 0 })`.
  - Run: `pnpm vitest run src/lib/messaging.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Chữ ký có `{ frameId }` ở cuối phải không phá kiểu `Parameters<…>`. Dùng hàm riêng `sendToFrame(tabId, frameId, type, …)` nếu overload làm rối kiểu.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: typed side panel channel with per-tab accept filter" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 3: Background — panel theo tab, tách/gắn cửa sổ, handler phụ, `fetch_stylesheet`

**Files:**

- Create:
  - `src/background/panels.ts`
  - `src/lib/panels.ts`, `src/lib/panels.test.ts`
  - `src/lib/stylesheet-fetch.ts`, `src/lib/stylesheet-fetch.test.ts`
- Modify: `src/entrypoints/background.ts`, `src/background.test.ts`

**Interfaces:**

- Consumes: `handleMessages`, `sendToTab`, `sendToSidePanel`, `isInjectable`.
- Produces:
  - `src/lib/panels.ts`:
    - `panelPath(tabId, detached = false)`: `` `sidepanel.html?tabId=${tabId}` `` + `&detached=1`.
    - `DETACH_W = 400`, `DETACH_H = 800`.
    - `detachBounds(saved: Bounds | null, sent: { width?: number; height?: number } | null): Bounds`: port `be` (`:4707`). Ưu tiên `saved.width/height > 0`, rồi `round(sent)`, rồi 400×800. `left/top` chỉ khi cả hai `Number.isFinite`.
    - `HANDOFF_TTL = 30000`.
    - `type Handoff = { selectedTab: 'element' | 'page'; scrollTop: number; at: number }`. Thêm `selectedEditTab?`, giữ chỗ cho đợt 5.
    - `readHandoff(h: Handoff | undefined, now): Handoff | null`: quá 30s thì `null` (7.11).
  - `src/lib/stylesheet-fetch.ts` (port `Ue` `:5454`, `qe` `:5543`):
    - `isAllowedStylesheetUrl(u: string): boolean`: chỉ http/https. Chặn `localhost`, `*.localhost`, `127.*`, `10.*`, `172.16–31.*`, `192.168.*`, `169.254.*`, `0.0.0.0`, `::1`, `fc00::/7`, `fe80::/10`. Đọc đủ danh sách ở `Ue` và chép.
    - `fetchStylesheet(url, fetchFn = fetch): Promise<{ ok: true; text; finalUrl } | { ok: false; error }>`:
      - `redirect: 'manual'`, `credentials: 'omit'`, `AbortSignal.timeout(10000)`;
      - mỗi bước redirect kiểm lại `isAllowedStylesheetUrl`; tối đa 5 lần.
  - `src/background/panels.ts`:
    - `detached: Map<number, number>` (tab → window), nạp từ `storage.session` `detachedPanels` lúc SW chạy (`ready` promise như `he`). `save()` ghi lại (7.04).
    - `enableFor(tabId)`: `sidePanel.setOptions({ tabId, path: panelPath(tabId), enabled: true })`. `disableFor(tabId)`: `enabled: false`.
    - Handler (port từng nhánh cũ):
      - `open_side_panel` (6.01): có `detached.get(tab)` → `windows.update({ focused: true })` (lỗi thì xoá mục); không thì `setOptions` + `sidePanel.open({ tabId })` **gọi đồng bộ, trước mọi `await`**; không có `sidePanel` thì `{ success:false, error:'Side panel API not available in this browser' }`.
      - `close_side_panel` (6.02): có cửa sổ rời thì focus nó; không thì `sendToSidePanel('close')`.
      - `detach_panel(tabId, size)` (7.02): đã có thì focus; không thì `windows.create({ url: getURL(panelPath(tabId, true)), type: 'popup', focused: true, ...detachBounds(...) })`; lưu map; `disableFor(tabId)`; ghi `detachedPanelBounds` khi trình duyệt đặt vị trí khác.
      - `dock_panel(tabId)` (7.03): `setOptions(enabled:true)` + `open` (đồng bộ), rồi `windows.remove` cửa sổ rời.
      - `check_panel_api` (6.03) → `!!browser.sidePanel`.
      - `has_host_permission` (6.06) → `permissions.contains({ origins: ['<all_urls>'] })`.
      - `get_tab_id` (1.10) → `sender.tab?.id`.
      - `go_to_tab` (1.14) → `tabs.update(id, { active: true })` + `windows.update(tab.windowId, { focused: true })`.
      - `open_external_tab(url)` (1.12): chỉ http/https; `tabs.create({ url, index: sender.tab.index + 1, openerTabId })`.
      - `fetch_stylesheet(url)` (6.05): có quyền `<all_urls>` mới chạy, không thì `{ ok:false, error:'no permission' }`.
    - Sự kiện:
      - `tabs.onActivated` (6.04, port `Ce`): cửa sổ là cửa sổ rời thì thôi; hỏi content `check_script_is_active`; không trả lời hoặc `false` thì `disableFor` + `sendToSidePanel('clear')`; có thì `enableFor`.
      - `tabs.onRemoved`: `dock` (đóng cửa sổ rời của tab), xoá map.
      - `windows.onRemoved` (7.05): cửa sổ rời đóng → xoá map; tab còn bật script thì `enableFor`.
      - `windows.onBoundsChanged` (7.06): cửa sổ rời → `detachedPanelBounds = { left, top, width, height }`.
    - `setup()` (tách từ 1.06): `sidePanel.setOptions({ enabled: false })` toàn cục, `setPanelBehavior({ openPanelOnActionClick: false })`.
    - Bật script (`toggleTab` active) → `enableFor(tabId)`. Tắt / `close_extension` (1.36, 1.37) → `disableFor`, đóng cửa sổ rời, `sendToSidePanel('clear')`.

- [ ] **Step 1: Viết test fail.**
  - `panels.test.ts`:
    - `detachBounds(null, null)` → `{width:400,height:800}`;
    - `(null, {width:350.6,height:0})` → `{width:351,height:800}`;
    - `({width:500,height:900,left:10,top:NaN}, null)` → không có `left/top`;
    - `readHandoff({…, at:0}, 30001) === null`.
  - `stylesheet-fetch.test.ts`: chặn các URL nội bộ ở Review Focus 5. Redirect 6 lần → `ok:false`. Redirect tới `http://127.0.0.1/x.css` → `ok:false`. `fetchFn` nhận `credentials: 'omit'`.
  - `background.test.ts` (`fakeBrowser`; stub `browser.sidePanel` / `browser.windows` bằng `vi.fn()` nếu fake thiếu):
    - `open_side_panel`: thứ tự gọi ghi bằng spy. `sidePanel.open` được gọi trước khi promise handler resolve lần đầu, tức là trong cùng tick đồng bộ của handler (Review Focus 1);
    - có cửa sổ rời → `windows.update(w, { focused: true })`, không gọi `open`;
    - `detach_panel(5, {width:300,height:700})` → `windows.create` với `type:'popup'`, url chứa `tabId=5&detached=1`; `storage.session` có `detachedPanels: {5: id}`; `setOptions({tabId:5, enabled:false})`;
    - `windows.onRemoved(id)` khi tab 5 trả `scriptIsActive: true` → `setOptions({tabId:5, path:…, enabled:true})`;
    - `onActivated` với tab không trả lời → `setOptions(enabled:false)` + tin `clear` (Review Focus 2);
    - `close_extension` → `setOptions(enabled:false)`, `windows.remove` cửa sổ rời;
    - `open_external_tab('javascript:alert(1)')` → `false`, không `tabs.create`.
  - Run: `pnpm vitest run src/lib/panels.test.ts src/lib/stylesheet-fetch.test.ts src/background.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code.** `background.ts` chỉ gọi `initPanels()` và gộp handler. Map `detached` nạp **trước** khi đăng ký listener, nhưng các handler cần cử chỉ không `await ready`. Lúc SW vừa thức mà map chưa nạp xong thì đi nhánh mở panel thường, vẫn chấp nhận được.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: per-tab side panel, detach/dock windows, stylesheet fetch in background" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 4: Khung side panel — entrypoint, theme, hàng tab, trạng thái trống, phím, handoff

**Files:**

- Create:
  - `src/entrypoints/sidepanel/index.html`, `main.ts`, `App.svelte`, `style.css`
  - `src/entrypoints/sidepanel/store.svelte.ts` (`panel` state: tabId, detached, selectedTab, element, page, prefs)
  - `src/entrypoints/sidepanel/TabBar.svelte`, `EmptyElement.svelte`, `Section.svelte` (khung mục thu gọn được)
  - `src/lib/panel-keys.ts`, `src/lib/panel-keys.test.ts`
  - `src/entrypoints/sidepanel/app.test.ts`
- Modify: `src/ui/theme.css` (`:root[data-theme='light']`), `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: Task 1 (`getPanelPrefs`, `updatePanelPrefs`, `themePref`), Task 2 (kênh), Task 3 (`readHandoff`, `detach_panel`, `dock_panel`).
- Produces:
  - Khởi động (6.12, port `Ni` / `ki`):
    - `tabId` từ `?tabId=`;
    - `detached` từ `?detached=1` → class `is-detached` trên `<html>`, `document.title` = title của tab (7.11);
    - nối port `browser.tabs.connect(tabId, { name: \`sidepanel_${Date.now()}\` })`;
    - đọc `commands.getAll()` (phím thật của `_execute_action`, `select_parent`, `select_child`);
    - đọc theme, prefs, handoff;
    - chờ 50ms rồi `sendToTab(tabId, 'side_panel_loaded')`. Lỗi thì giữ trạng thái trống.
  - `handleMessages('sidepanel', {...}, signal, { accept: (s) => s.tab?.id === panel.tabId })` (6.13 phần đợt 4):
    - `ping`;
    - `tab_specific_ping`: chỉ khi `visibilityState === 'visible'`;
    - `content_script_loaded`: nối lại port, gọi lại `side_panel_loaded`;
    - `close`: `window.close()`;
    - `select_element`, `update_canvas_fps`, `page_data`, `page_technologies`, `page_weight_update`, `update_issues`;
    - `clear`: xoá phần tử, trạng thái trống.
    - Trong lúc đang tách/gắn (`switching`) thì bỏ qua mọi tin, như `Yo` cũ.
  - `TabBar` (6.17, 7.10):
    - TAB_ELEMENT / TAB_PAGE; tab đang chọn được nhớ trong handoff, không lưu storage, đúng bản cũ;
    - vào tab Trang khi panel hiện → `page_weight_subscribe`; rời tab hoặc `visibilitychange` ẩn → `page_weight_unsubscribe`;
    - nút PANEL_UNDOCK (panel thường) / PANEL_DOCK (cửa sổ rời), ẩn khi chưa có `tabId` hoặc đang chuyển. Bấm thì:
      - ghi `panelHandoff:<tabId>` = `{ selectedTab, scrollTop, at: Date.now() }`;
      - `detach_panel(tabId, { width: innerWidth, height: outerHeight })` hoặc `dock_panel(tabId)`;
      - thành công thì `window.close()`.
  - Handoff lúc mở: `readHandoff`, xoá khoá, chọn tab, khôi phục `scrollTop` sau khi vẽ (`tick()` + rAF).
  - `EmptyElement` (6.18): EMPTY_MESSAGE_INSPECT + bảng phím. Mỗi dòng: SHORTCUT_TOGGLE_RULER (phím thật `_execute_action`), SHORTCUT_PARENT, SHORTCUT_CHILD (phím thật), SHORTCUT_TOGGLE_PANEL (`0`), SHORTCUT_DESELECT (`Esc`). Phím chưa gán thì ẩn dòng. Mac hiện `⌥⇧` như `Pt` (`sidepanel.js:4409`).
  - `Section.svelte` (6.19): tiêu đề + nút expand. Trạng thái `collapsed` đọc từ `prefs.sectionVisibility[id]`; bấm thì `updatePanelPrefs`. Props `{ id: SectionId; title: string; count?: number; children }`.
  - `src/lib/panel-keys.ts` (6.15, port `Go` `:12702`):
    - `forwardKey(e: { key; ctrlKey; metaKey; altKey; shiftKey; target }): string | null`:
      - `Escape` hoặc `0`–`9`, không modifier, target không phải input/textarea/select/contentEditable → trả phím;
      - ngoài ra `null`.
    - Panel gửi `sendToTab(tabId, 'keyboard_shortcut', key)`.
  - Theme (6.16): `themePref` → `data-theme` (`system` → `matchMedia('(prefers-color-scheme: dark)')`, có nghe đổi). `watch` storage. `body` opacity 0 → 1 sau `load`.
  - `style.css`: `@import 'tailwindcss'`, `@import '../../ui/theme.css'`, `@font-face` Geist/Geist Mono từ `../../ui/fonts/`. Nền panel dùng `--color-surface` đặc (không blur).
- Khoá i18n mới (chép nguyên văn từ `_locales`):

| Khoá | Khoá cũ |
| --- | --- |
| `panel.tabElement` | TAB_ELEMENT |
| `panel.tabPage` | TAB_PAGE |
| `panel.undock` | PANEL_UNDOCK |
| `panel.dock` | PANEL_DOCK |
| `panel.emptyInspect` | EMPTY_MESSAGE_INSPECT |
| `panel.shortcutToggleRuler` | SHORTCUT_TOGGLE_RULER |
| `panel.shortcutParent` | SHORTCUT_PARENT |
| `panel.shortcutChild` | SHORTCUT_CHILD |
| `panel.shortcutTogglePanel` | SHORTCUT_TOGGLE_PANEL |
| `panel.shortcutDeselect` | SHORTCUT_DESELECT |

  Người làm điền cột en/vi bằng giá trị nguyên văn trong `unpacked/_locales/{en,vi}/messages.json`, ví dụ TAB_ELEMENT = "Element" / "Phần tử", PANEL_UNDOCK = "Open in a window".

- [ ] **Step 1: Viết test fail.**
  - `panel-keys.test.ts`:
    - `{key:'3'}` từ `<div>` → `'3'`; `{key:'Escape'}` → `'Escape'`;
    - `{key:'3', ctrlKey:true}` → `null`;
    - từ `<input>`, `<select>`, `[contenteditable]` → `null`; `{key:'a'}` → `null`.
  - `app.test.ts` (mount `App` với `location.search = '?tabId=5'`, `fakeBrowser`):
    - lúc đầu hiện EMPTY_MESSAGE_INSPECT; `commands.getAll` không có `select_child.shortcut` → dòng SHORTCUT_CHILD bị ẩn;
    - sau 50ms đã gửi `side_panel_loaded` tới tab 5 với `frameId: 0`;
    - tin `select_element` từ tab 7 → không đổi; từ tab 5 → hết trạng thái trống (Review Focus 3);
    - bấm TAB_PAGE → gửi `page_weight_subscribe`; `visibilitychange` ẩn → `page_weight_unsubscribe`;
    - handoff `{selectedTab:'page', scrollTop:120, at: now}` → mở thẳng tab Trang, khoá handoff bị xoá;
    - bấm PANEL_UNDOCK → `storage.session` có `panelHandoff:5`, đã gửi `detach_panel(5, …)`;
    - `?detached=1` → nút là PANEL_DOCK, `<html>` có class `is-detached`.
  - Run: `pnpm vitest run src/lib/panel-keys.test.ts src/entrypoints/sidepanel`. Expected: FAIL.
- [ ] **Step 2: Viết code.**
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS. Manifest build có `side_panel.default_path`.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: side panel shell — tabs, empty state, key forwarding, detach handoff" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 5: Cầu nối phía content — id phần tử, selector, chọn theo id, nút dock `0`, hộp thoại

**Files:**

- Create:
  - `src/lib/selector.ts`, `src/lib/selector.test.ts`
  - `src/content/sidepanel/bridge.svelte.ts`, `src/content/sidepanel/index.ts` (mục registry + `initSidePanelBridge`)
  - `src/content/sidepanel/highlight.ts`
  - `src/content/sidepanel/bridge.test.ts`
  - `src/ui/Dialog.svelte`, `src/content/core/dialog.ts`
- Modify:
  - `src/content/tools/index.ts`
  - `src/entrypoints/content/index.ts`
  - `src/content/core/keys.ts`, `keys.test.ts` (`runShortcut(key)` dùng chung cho phím thật và `keyboard_shortcut`)
  - `src/content/tools/inspector/index.ts` (`selectParent/Child`, `selectElement(el, { scroll })`)
  - `src/locales/{en,vi}.json`

**Interfaces:**

- Produces:
  - `src/lib/selector.ts` (port `content.js:15151–15360`):
    - `ID_ATTR = (extId: string) => \`data-sr-id-${extId}\``.
    - `generateId(rand = Math.random): string` → `` `v-${rand().toString(36).substr(2, 9)}` ``.
    - `ensureElementId(el, attr, map: Map<string, WeakRef<Element>>): string` và `resolveElementById(id, attr, map, root = document): Element | null`. Tra map trước, rồi `querySelector([attr="id"])` cả trong shadow root (2.17).
    - `displaySelector(el): string`: `tag#id.class` (dùng lại `elementSelector` của `src/lib/css/inspect.ts` nếu cùng kết quả; khác thì port `getDisplaySelector`).
    - `STATE_CLASSES = ['active','disabled','hidden','visible','open','closed','selected','hover','focus']`.
    - `uniquePath(el): string`, `shadowHostPath(el): string`, `fullPath(el): string` (2.18): id hợp lệ → class duy nhất (bỏ class trạng thái) → `tag.class` → chuỗi `a > b:nth-child(n)` tới id gần nhất; qua shadow root nối ` >>> `.
  - `src/content/core/dialog.ts`: `alertDialog(title: string, message: string): Promise<void>`. Mount `Dialog.svelte` vào host chính (`role="alertdialog"`, nút DIALOG_OK, Enter/Esc đóng, focus nút). Phím trong dialog không lọt xuống công cụ: `routeKey` bỏ qua khi `state.dialog` mở (9.24 phần alert).
  - `keys.ts`: `runShortcut(key: string): boolean`, tách từ `routeKey`: tra item theo `key`, kiểm `paused` / `capturing` / `isDisabled`. `routeKey` gọi nó. Handler `keyboard_shortcut` gọi nó, `Escape` → bỏ chọn như Esc thật (6.15).
  - Mục registry:

| id | key | group | icon Lucide | label | Hành vi |
| --- | --- | --- | --- | --- | --- |
| `sidepanel` | `0` | `environment` (đối chiếu vị trí trong `getControlBar :30105`; chỉnh nếu bản cũ khác) | `PanelRight` | `dock.sidePanel` | 6.07, 1.41: `run` = `toggleSidePanel()`; `isActive` = `bridge.panelOpen`; khi `check_panel_api === false` thì `isDisabled` + label `dock.sidePanelUnsupported` |

  - `toggleSidePanel()` (port `:39108`): `sendToSidePanel('tab_specific_ping')`. Có trả lời thì `close_side_panel`, không thì `open_side_panel`. **Gửi `open_side_panel` ngay trong click**, không chờ việc khác ngoài ping (Review Focus 1).
  - `bridge.svelte.ts`:
    - `browser.runtime.onConnect`: port tên `sidepanel_*` → `panelOpen = true`; `onDisconnect` → `panelOpen = false`, `clearHighlights()` (9.32, 6.14).
    - `$effect.root` theo `state.selected` (6.08, 2.21): có phần tử và panel mở → `sendElement(el)` (Task 6); `null` → `sendToSidePanel('clear')`.
    - Handler `ContentApi` (2.19):
      - `highlight_hovered(id)` / `remove_highlight_hovered`: painter `sidepanel` tô một box;
      - `go_to_selected_element(id?)` (2.16): `resolveElementById`; không thấy → `alertDialog(DIALOG_TITLE_ELEMENT_NOT_FOUND, ALERT_ISSUE_ELEMENT_NOT_FOUND)`, trả `false`; thấy → `scrollIntoView({ block:'center', behavior:'smooth' })` rồi `selectElement`;
      - `select_parent(id?)` / `select_child(id?)`: có `id` thì chọn phần tử đó trước;
      - `get_host_name`, `get_url`;
      - `check_script_is_active` → `{ scriptIsActive: state.active }` (chỉ khung top);
      - `side_panel_loaded` (9.38): `sendPageData()` (Task 10) + có `state.selected` thì `sendElement`;
      - `keyboard_shortcut(key)`.
    - Bật session (`startSession` xong) → `sendToSidePanel('content_script_loaded')`.
    - `onStop` → `sendToSidePanel('clear')`, xoá painter. Map id giữ nguyên (xem Quyết định đã chốt #5).
- Khoá i18n mới:

| Khoá | Khoá cũ |
| --- | --- |
| `dock.sidePanel` | DOCK_OPEN_PANEL |
| `dock.sidePanelUnsupported` | DOCK_OPEN_PANEL_UNSUPPORTED |
| `dialog.ok` | DIALOG_OK |
| `dialog.elementNotFoundTitle` | DIALOG_TITLE_ELEMENT_NOT_FOUND |
| `dialog.issueElementNotFound` | ALERT_ISSUE_ELEMENT_NOT_FOUND |

- [ ] **Step 1: Viết test fail.**
  - `selector.test.ts` (happy-dom):
    - `generateId(() => 0.123456789)` có dạng `/^v-[0-9a-z]{1,9}$/`;
    - `ensureElementId` gán attr một lần; gọi lại trả cùng id; `resolveElementById` sau khi xoá map vẫn tìm bằng attr;
    - `uniquePath`: `<div id="app"><ul><li class="active item">` → `'.item'` khi duy nhất (bỏ `active`); hai `li.item` → `#app > ul > li:nth-child(2)`;
    - phần tử trong shadow root của `<x-card id="c">` → `'#c >>> …'`.
  - `keys.test.ts`: `runShortcut('2')` chạy item `2`; `state.paused` → `false`, không chạy; `state.capturing` → không chạy.
  - `bridge.test.ts` (stub `sendToSidePanel`, `sendToBackground`):
    - `toggleSidePanel()` khi ping trả `undefined` → gửi `open_side_panel`; trả `{isOpen:true}` → `close_side_panel`;
    - `go_to_selected_element('v-missing')` → có `[role=alertdialog]` trong host, trả `false`; Enter đóng dialog; phím `2` lúc dialog mở không bật công cụ;
    - port `sidepanel_1` disconnect → `panelOpen === false`, painter `sidepanel` không còn box;
    - `state.selected = null` khi panel mở → gửi `clear`;
    - `stopSession()` → gửi `clear`.
  - Run: `pnpm vitest run src/lib/selector.test.ts src/content/core src/content/sidepanel`. Expected: FAIL.
- [ ] **Step 2: Viết code.** `initSidePanelBridge()` gọi trong `initTools()`. Handler content mới gộp vào `handleMessages('content', …)` ở `entrypoints/content/index.ts`; phần cầu nối export một object handler để gộp.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: content bridge for side panel — element ids, selectors, dock button 0, alert dialog" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 6: Gom dữ liệu phần tử — box model, layout, chữ, màu, gradient, shadow, animation, canvas, asset

**Files:**

- Create:
  - `src/lib/element/box.ts`, `layout.ts`, `typography.ts`, `colors.ts`, `gradients.ts`, `shadow.ts`, `motion.ts`, `canvas.ts`, `assets.ts`. Mỗi file có `*.test.ts`.
  - `src/content/sidepanel/details.ts`, `details.test.ts`
- Modify: `src/content/sidepanel/bridge.svelte.ts`

**Interfaces:**

- Consumes: `parseColor`, `formatColor` (Task 1), `ensureElementId`, `displaySelector` (Task 5), `ElementDetails` (Task 2).
- Produces (mỗi hàm nhận `CSSStyleDeclaration`-like `{ getPropertyValue }` hoặc dữ liệu thuần, để test không cần layout thật):
  - `splitTopLevel(s: string): string[]`: hàm `B` đầu `sendElementToSidePanel`; tách theo `,` ngoài ngoặc.
  - `box.ts`: `boxModel(style, rect): { margin: Sides; border: Sides; padding: Sides; width; height }` (6.22).
  - `layout.ts`: `elementLayout(style): FlexInfo | GridInfo | null` (6.27; port `getElementLayout` `:41324`, lấy đúng danh sách thuộc tính).
  - `typography.ts`: `typographyStyles(el, getStyle): TypographyStyle[]` (6.30; port `:41584`). Key nhóm (`family|size|weight|lineHeight|letterSpacing`) dùng lại cho highlight (6.11).
  - `colors.ts`: `elementColors(entries): { text: string[]; backgrounds: string[]; borders: string[] }` (6.28). Gộp trùng theo HEX chuẩn hoá, giữ thứ tự gặp.
  - `canvas.ts`:
    - `canvasPalette(data: Uint8ClampedArray, w: number, h: number): string[]` (6.48, port `getCanvasColors` `:41375`): lượng tử bước 15, bỏ alpha < 128, giữ màu ≥1% số pixel, xếp theo tần suất. Lấy mẫu 64×64 phía content (`drawImage` lên canvas 64×64; canvas bị taint thì bỏ qua).
    - `canvasInfo(el)`: context type, `W × H`, `devicePixelRatio` (6.33).
  - `gradients.ts`: `parseGradients(backgroundImage: string): Gradient[]` (6.29; port `ys`/`bs` phía panel, `:18111`, `:18244`, nếu panel tự tách thì giữ tách ở lib, gọi từ panel).
  - `shadow.ts`: `splitShadows(boxShadow: string): Shadow[]` (6.31; `{ inset, x, y, blur, spread, color }`).
  - `motion.ts` (6.32):
    - `animations(style, keyframesLookup)`, `transitions(style)`;
    - `EASING = { ease: [0.25,0.1,0.25,1], 'ease-in': [0.42,0,1,1], 'ease-out': [0,0,0.58,1], 'ease-in-out': [0.42,0,0.58,1], linear: [0,0,1,1] }`;
    - `parseEasing(s): [number, number, number, number] | null` (`cubic-bezier(...)` hoặc từ khoá; `steps()` → `null`);
    - `easingPath(b, w, h): string` (SVG path cho đường cong).
  - `assets.ts` (6.34):
    - `collectAssetRefs(el)`: `src`, `currentSrc`, `background-image: url()`, `<svg>` inline, data-image;
    - `assetFileName(url, fallback): string` (tên từ URL, bỏ query; không có thì `DEFAULT_ASSET_NAME` / `DEFAULT_DOWNLOAD_NAME`, SVG inline → `DEFAULT_SVG_FILENAME`);
    - `justifiedRows(items: {w;h}[], width, targetH, gap): Row[]`: port `Mc` (`:16411`).
  - `details.ts`: `collectElementDetails(el): ElementDetails` (6.09 phần soi; port `:39602–40760`):
    - `name` = `displaySelector`, `selector` = `uniquePath`, `id` = `ensureElementId`;
    - `css` = computed theo danh sách thuộc tính cũ; `before` / `after` khi `content` khác `none` / `""` (6.24 Computed);
    - các trường của các file trên; `textContent` (6.23, chỉ khi có chữ);
    - `issues` = Task 7; `tailwind`, `skippedCrossOriginCount` = Task 8.
  - `sendElement(el)`: kiểm `ping` (6.09: panel đóng thì thôi), rồi `sendToSidePanel('select_element', collectElementDetails(el))`. Gọi lại khi `state.selected` đổi; gom bằng `queueMicrotask` để chọn liên tục không gửi dồn.

- [ ] **Step 1: Viết test fail.**
  - `splitTopLevel('rgb(1, 2, 3) 0 0 4px, red 1px 1px')` → 2 phần.
  - `splitShadows('inset 0 1px 2px rgba(0,0,0,.2), 0 0 0 1px red')` → `[{inset:true, y:'1px', blur:'2px', …}, {spread:'1px', color:'red'}]`.
  - `parseEasing('ease-in')` → `[0.42,0,1,1]`; `parseEasing('cubic-bezier(.1,.7,1,.1)')` → `[0.1,0.7,1,0.1]`; `'steps(4)'` → `null`; `easingPath([0,0,1,1],100,100)` bắt đầu `M0 100`.
  - `canvasPalette`: 100 pixel đỏ + 1 pixel xanh alpha 50 → `['#FF0000']`-tương đương (sau lượng tử); 99 đỏ + 1 lam (1%) → giữ cả hai.
  - `boxModel` với `margin-top: 8px`, các cạnh khác 0 → `margin.top === 8`, các cạnh khác `0`.
  - `assetFileName('https://a.com/img/logo.png?v=2', 'asset')` → `'logo.png'`; `('data:image/png;base64,…', 'asset')` → `'asset.png'`.
  - `justifiedRows([{w:100,h:100},{w:200,h:100}], 300, 100, 0)` → 1 hàng, chiều cao 100.
  - `details.test.ts`: `<p style="color:red">Hi</p>` → `textContent === 'Hi'`, `colors.text` chứa đỏ, `id` khớp `/^v-/`; phần tử có `::before { content: "x" }` → có `before`.
  - Run: `pnpm vitest run src/lib/element src/content/sidepanel`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Đọc từng khoảng dòng cũ trước khi viết mỗi file. Giữ đúng danh sách thuộc tính và thứ tự trường.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: element details for the side panel — box, layout, type, colors, motion, canvas, assets" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 7: Lỗi tương phản WCAG và highlight theo màu / typography / issue

**Files:**

- Create:
  - `src/lib/a11y.ts`, `src/lib/a11y.test.ts`
  - `src/content/sidepanel/issues.ts`
- Modify:
  - `src/content/sidepanel/highlight.ts`, `details.ts`, `bridge.test.ts`
  - `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `contrastRatio`, `wcagLevel`, `compositeBackground` (Đợt 1), `typographyStyles` key (Task 6), painter overlay.
- Produces:
  - `src/lib/a11y.ts` (port `collectA11yIssues` `:40909`, `calculateWCAGContrast` `:44186`):
    - `isLargeText(px: number, weight: number): boolean`: ≥24px, hoặc ≥18.66px và weight ≥700 (đối chiếu ngưỡng ở bản cũ).
    - `contrastIssue(ratio, large): Issue | null`:
      - dưới AA → `{ level:'warning', id:'contrast-aa', message:'ISSUE_CONTRAST_FAILURE_AA_MESSAGE', recommendation:… }`;
      - đạt AA chưa AAA → `level:'info'`, khoá AAA; size text TEXT_SIZE_LARGE / TEXT_SIZE_NORMAL làm tham số.
    - `iconContrastIssue(ratio, sizePx): Issue | null`: SVG ≥ 8px và < 3:1 → ISSUE_ICON_CONTRAST_*.
    - `Issue = { id; level: 'warning' | 'info'; messageKey; recommendationKey; params; elementIds: string[] }`. Nhóm theo mức, đếm instances.
  - `issues.ts`:
    - `collectIssues(root: Element): Issue[]`: duyệt phần tử chữ / SVG trong phần tử chọn, gán id;
    - phần tử ngoài màn hình → đăng ký `IntersectionObserver` (port `watchViewportContrast` `:44465`); vào màn hình thì tính lại và `sendToSidePanel('update_issues', …)`;
    - observer ngắt khi chọn phần tử khác và trong `onStop`.
  - `highlight.ts` (6.11, 6.36 phía trang; 2.20):
    - `highlightForColor(color)`: viền các phần tử có `color` / `background-color` / `border-color` bằng màu đó (so theo HEX chuẩn hoá, trong phần tử chọn như bản cũ);
    - `highlightForTypography(key)`, `highlightForIssue(issueId)`;
    - `highlightIssueElement(id)`: tô + cuộn tới; không thấy thì `alertDialog`;
    - `clearHighlights()`;
    - vẽ qua painter `sidepanel`, gom rAF; box nét liền 1.5px màu nhấn, như highlight inspector.
- Khoá i18n mới: ISSUE_CONTRAST_FAILURE_AA_MESSAGE, ISSUE_CONTRAST_FAILURE_AA_RECOMMENDATION, ISSUE_CONTRAST_FAILURE_AAA_MESSAGE, ISSUE_CONTRAST_FAILURE_AAA_RECOMMENDATION, TEXT_SIZE_LARGE, TEXT_SIZE_NORMAL, ISSUE_ICON_CONTRAST_MESSAGE, ISSUE_ICON_CONTRAST_RECOMMENDATION → nhóm `issue.*`, nguyên văn, placeholder `$X$` → `$1…`.

- [ ] **Step 1: Viết test fail.**
  - `a11y.test.ts`:
    - `contrastIssue(3.0, false)` → warning AA; `contrastIssue(5.0, false)` → info AAA; `contrastIssue(7.5, false)` → `null`; `contrastIssue(3.2, true)` → info (AA chữ lớn = 3);
    - `iconContrastIssue(2.5, 16)` → issue; `(2.5, 6)` → `null`.
  - `bridge.test.ts`:
    - `<div style="background:#fff"><span style="color:#eee">x</span></div>` → issue warning, `elementIds` có id của span;
    - `highlight_elements_for_color('#eeeeee')` → painter có 1 box; `clear_element_highlights` → 0;
    - `highlight_issue_element('v-x')` không tồn tại → dialog;
    - đổi `state.selected` → `IntersectionObserver.disconnect` được gọi (stub).
  - Run: `pnpm vitest run src/lib/a11y.test.ts src/content/sidepanel`. Expected: FAIL.
- [ ] **Step 2: Viết code.**
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: WCAG contrast issues and page highlights driven from the side panel" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 8: CSS — specificity, rule khớp (chỉ đọc), stylesheet khác domain, sinh class Tailwind

**Files:**

- Create:
  - `src/lib/css/specificity.ts`, `specificity.test.ts`
  - `src/lib/css/matched.ts`, `matched.test.ts`
  - `src/lib/css/tailwind.ts`, `tailwind.test.ts`
  - `src/content/sidepanel/rules.ts`
- Modify: `src/content/sidepanel/details.ts`, `bridge.svelte.ts`

**Interfaces:**

- Consumes: `fetch_stylesheet`, `has_host_permission` (Task 3).
- Produces:
  - `specificity(sel: string): { array: [number, number, number]; score: number }`: port `calculateSpecificityOnce`, kể cả `:is()` / `:not()` / `:where()` như bản cũ.
  - `splitState(sel)`: `{ state: string | null; pseudoElement: string | null }` (port `Jg`).
  - `matched.ts`:
    - `collectRules(sheets: CSSStyleSheet[], scopeRoot?): KnownRule[]`: duyệt đệ quy `CSSMediaRule` / `CSSSupportsRule` / `CSSLayerBlockRule` / `CSSContainerRule` → `wrappers`; `mediaActive` = `matchMedia`;
    - `matchedRules(el, rules): MatchedRule[]`: `el.matches(selector)`, bỏ pseudo-element và state khác; xếp `score` giảm dần, rồi `sourceIndex`;
    - `groupBySource(rules)`: theo `stylesheet` (href hoặc `inline`), thứ tự nguồn (6.25);
    - `overriddenDecls(rules, inlineStyle): Set<string>`: khai báo bị đè theo specificity + `!important` + thứ tự; bỏ rule `mediaActive === false`;
    - `MatchedRule = { selector; stylesheet; wrappers: string[]; mediaActive: boolean; specificity; score; styles: Array<{ prop; value; important }>; sourceIndex }`. Đợt 5 thêm `ruleRef`, `readOnly`.
  - `rules.ts` (phía content):
    - `skippedCrossOrigin`: tập href ném khi đọc `cssRules`;
    - `get_matched_rules()` (tách từ 5.21) → `{ success, matchedRules, skippedCrossOriginCount }`;
    - `enable_cross_origin_styles()` (port `loadCrossOriginStylesheets` `:31926`): với mỗi href → `fetch_stylesheet` → `new CSSStyleSheet({ baseURL: finalUrl }).replaceSync(text)` → cache theo href. Không gắn vào trang.
    - Panel mở lần đầu và đã có quyền thì tự gọi (6.26).
  - `tailwind.ts` (9.26, 6.24; port `:17948–20991`, `getElementTailwind` `:40822`):
    - `tailwindClasses(css: Record<string, string>, ctx?: { rootFontSize: number }): string[]`;
    - `V4_RENAMES`: bảng 6.24 (`shadow-sm→shadow-xs`, `shadow→shadow-sm`, `blur→blur-sm`, `rounded→rounded-sm`, `outline-none→outline-hidden`, `ring→ring-3`, `flex-grow→grow`, `flex-shrink→shrink`, `overflow-ellipsis→text-ellipsis`, `decoration-slice/clone→box-decoration-*`);
    - `toV4(cls: string[]): string[]`, áp **một lượt** (tránh `shadow-sm→shadow-xs` bị đổi lần hai).

- [ ] **Step 1: Viết test fail.**
  - `specificity.test.ts`: `'#a .b p'` → `[1,1,1]`; `':not(#x) a:hover'` → `[1,1,1]`; `'::before'` → `[0,0,1]`; `':where(.a) b'` → `[0,0,1]`.
  - `matched.test.ts` (happy-dom, `<style>` thật):
    - `.a{color:red} #b{color:blue}` với `<p id="b" class="a">` → thứ tự `#b`, `.a`; `color` của `.a` nằm trong `overriddenDecls`;
    - `.a{color:red!important}` → `#b` bị đè;
    - `@media (min-width: 99999px){ .a{…} }` → `mediaActive === false`, không tính khi đè;
    - `.a:hover{}` không vào danh sách; `.a::before{}` không vào;
    - hai `<style>` → `groupBySource` hai nhóm `inline` theo thứ tự nguồn (đối chiếu cách bản cũ đặt tên nhóm inline).
  - `tailwind.test.ts`: bảng mẫu tối thiểu 15 cặp lấy từ chạy bản cũ (`display:flex` → `flex`; `padding: 16px` → `p-4`; `border-radius: 4px` → `rounded`; sau `toV4` → `rounded-sm`; `box-shadow` mặc định → `shadow-sm` sau v4…). Người làm chạy bản cũ trên một trang mẫu để lấy kết quả thật rồi chép vào test.
  - Run: `pnpm vitest run src/lib/css`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Tailwind port theo từng nhóm thuộc tính, mỗi nhóm một commit nhỏ nếu cần. `details.ts` điền `tailwind` (đã `toV4`) và `skippedCrossOriginCount`.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: read-only matched rules, cross-origin sheets and Tailwind class generation" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 9: Tab Phần tử — các mục giao diện

**Files:**

- Create, trong `src/entrypoints/sidepanel/element/`:
  - `ElementTab.svelte`, `Header.svelte`, `DocumentSection.svelte`, `BoxModel.svelte`, `TextContent.svelte`, `CodeSection.svelte`, `LayoutSection.svelte`
  - `ColorsSection.svelte`, `GradientsSection.svelte`, `TypographySection.svelte`, `ShadowSection.svelte`, `MotionSection.svelte`, `EasingCurve.svelte`
  - `CanvasSection.svelte`, `AssetsSection.svelte`, `IssuesSection.svelte`, `CopyButton.svelte`
  - `element.test.ts`
- Modify: `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `panel.element: ElementDetails | null`, `Section.svelte` (Task 4), `formatColor`, `formatSize` (Task 1), `parseGradients`, `easingPath`, `justifiedRows`, `assetFileName` (Task 6), `groupBySource`, `overriddenDecls` (Task 8), kênh `ContentApi`.
- Produces (thứ tự mục theo `sectionVisibility` cũ; mỗi mục ẩn khi không có dữ liệu như bản cũ):
  - `Header` (6.20):
    - selector (click → `go_to_tab` rồi `go_to_selected_element(id)`);
    - `formatSize(w, h)`;
    - nút copy selector.
    - **Không** có ô trạng thái (dời đợt 5).
  - `DocumentSection` (6.21): dòng cha / phần tử / con. Cha → `select_parent(id)` (không chọn được thì `disabled`). Con → `select_child(id)`. Phần tử → `go_to_selected_element`. Mọi lần đều `go_to_tab` trước.
  - `BoxModel` (6.22): 4 lớp lồng (margin / border / padding / content). Cạnh 0 hiện `-`. Lớp và cạnh khác 0 được tô (màu theo `box-model.html` cũ, đổi về token nếu có). Nội dung hiện `W × H`.
  - `TextContent` (6.23).
  - `CodeSection` (6.24–6.26):
    - ô chọn Computed / Source / Tailwind, lưu `codeViewMode`;
    - Computed: `css` + `::before` / `::after`;
    - Source: lần đầu mở thì `get_matched_rules` (cache theo `id` phần tử); nhóm theo nguồn; khai báo bị đè gạch ngang; rule `mediaActive === false` mờ; rỗng thì `/* No matched rules found */`; `skippedCrossOriginCount > 0` và chưa có quyền → MATCHED_CROSS_ORIGIN_HIDDEN (`$1` = số) + link ENABLE_CROSS_ORIGIN. Bấm link thì `permissions.request({ origins: ['<all_urls>'] })` trong click, rồi `enable_cross_origin_styles`, rồi tải lại rule;
    - Tailwind: danh sách class;
    - mỗi view có nút copy.
  - `LayoutSection` (6.27).
  - `ColorsSection` (6.28, 6.48):
    - tổng LABEL_COLOR / LABEL_COLORS; nhóm LABEL_TEXT / LABEL_BACKGROUNDS (gồm bảng màu canvas) / LABEL_BORDERS;
    - nút định dạng HEX / RGB / HSL / HSB (lưu `colorFormat`; content đổi theo nhờ Task 1);
    - click màu → copy theo định dạng (`[data-color-copy]`);
    - hover → `highlight_elements_for_color`.
  - `GradientsSection` (6.29), `TypographySection` (6.30, hover → `highlight_elements_for_typography`), `ShadowSection` (6.31).
  - `MotionSection` + `EasingCurve` (6.32): SVG 64×64 vẽ `easingPath`, có 2 tay đòn.
  - `CanvasSection` (6.33): context, `W × H`, `Nx`; có `fps` thì hiện.
  - `AssetsSection` (6.34):
    - lưới justified theo `ResizeObserver` bề rộng panel;
    - nút tải từng asset và BUTTON_DOWNLOAD_ALL;
    - trước khi tải: `permissions.request({ permissions: ['downloads'] })` **trong click**;
    - src / background-image: `fetch → blob → URL.createObjectURL → downloads.download({ url, filename })`; data-image tải thẳng; SVG inline → blob `image/svg+xml`;
    - lỗi `fetch` (CORS) thì `downloads.download({ url: gốc })`.
  - `IssuesSection` (6.35):
    - LABEL_ISSUE / LABEL_ISSUES, nhóm theo mức, LABEL_INSTANCES;
    - click hoặc nút trước/sau → `go_to_tab` + `highlight_issue_element(elementIds[i])`, duyệt vòng;
    - `update_issues` vẽ lại;
    - hover → `highlight_elements_for_issue`.
  - Rời mục, `mouseleave` panel, `scroll` panel → `clear_element_highlights` (6.36).
  - `CopyButton` (6.37): `copyText` (dùng lại `src/lib/clipboard.ts`), đổi nhãn "Đã copy" 1,5s.
- Khoá i18n mới (chép nguyên văn; nhóm `panel.*`):
  - LABEL_DOCUMENT, LABEL_LAYOUT, LABEL_MARGIN, LABEL_BORDER, LABEL_PADDING, LABEL_TEXT_CONTENT
  - LABEL_CODE, LABEL_COMPUTED, LABEL_SOURCE, LABEL_TAILWIND, MATCHED_CROSS_ORIGIN_HIDDEN, ENABLE_CROSS_ORIGIN
  - LABEL_FLEX_GRID_LAYOUT
  - LABEL_COLOR, LABEL_COLORS, LABEL_TEXT, LABEL_BACKGROUNDS, LABEL_BORDERS
  - LABEL_GRADIENT, LABEL_GRADIENTS, LABEL_TYPOGRAPHY_STYLE, LABEL_TYPOGRAPHY_STYLES, LABEL_BOX_SHADOW, LABEL_BOX_SHADOWS
  - LABEL_ANIMATION, LABEL_ANIMATIONS, LABEL_TRANSITION, LABEL_TRANSITIONS
  - LABEL_CANVAS, LABEL_CONTEXT_TYPE, LABEL_CANVAS_DIMENSIONS, LABEL_PIXEL_RATIO
  - LABEL_ASSET, LABEL_ASSETS, BUTTON_DOWNLOAD_ALL, DEFAULT_SVG_FILENAME, DEFAULT_ASSET_NAME, DEFAULT_DOWNLOAD_NAME
  - LABEL_ISSUE, LABEL_ISSUES, LABEL_INSTANCES

- [ ] **Step 1: Viết test fail** (`element.test.ts`; mount `ElementTab` với `ElementDetails` mẫu dựng tay; stub `sendToTab`, `sendToBackground`, `permissions`, `downloads`):
  - header hiện `p.lead`, `100 × 20.25`; click selector → gửi `go_to_tab` rồi `go_to_selected_element('v-1')` theo đúng thứ tự;
  - box model: `margin.top = 8` → ô trên hiện `8`, ô khác `-`;
  - Code: chọn Source → gửi `get_matched_rules` một lần; chọn lại không gửi nữa; `skippedCrossOriginCount: 2` + `has_host_permission false` → hiện chuỗi chứa `2`;
  - Colors: bấm RGB → `sidePanelPreferences.colorFormat === 'RGB'`, ô màu hiện `rgb(`;
  - thu gọn mục Colors → `sectionVisibility.colors.collapsed === true`;
  - Issues: 2 instances, bấm "sau" hai lần → `highlight_issue_element` nhận id 1, 2, rồi quay về 1;
  - `mouseleave` panel → `clear_element_highlights`;
  - Assets: bấm tải khi `permissions.request` trả `false` → không gọi `downloads.download`.
  - Run: `pnpm vitest run src/entrypoints/sidepanel`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Bố cục đối chiếu `unpacked/sidepanel` chạy thật (load bản cũ, chụp màn hình từng mục); giao diện theo token §7.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: side panel element tab sections" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 10: Dữ liệu trang — meta, SEO, dung lượng trang

**Files:**

- Create:
  - `src/lib/page/meta.ts`, `seo.ts`, `weight.ts`, mỗi file có `*.test.ts`
  - `src/content/sidepanel/page.ts`, `page.test.ts`
- Modify: `src/content/sidepanel/bridge.svelte.ts`

**Interfaces:**

- Produces:
  - `meta.ts`: `collectPageMetadata(doc): { title; url; ogImage; seo: MetaTag[]; openGraph: MetaTag[]; twitter: MetaTag[] }` (port `:39207`). `MetaTag = { kind: 'title' | 'link' | 'meta'; attr: 'name' | 'property' | 'rel'; key; value }`.
  - `seo.ts` (port `collectSEOIssues` `:39254`):
    - `SEO_CHECKS` có 16 id. Khoá dịch `SEO_<ID>_MESSAGE` / `_RECOMMENDATION`;
    - `collectSeoIssues(doc): SeoIssue[]`: thiếu / ngắn (<30) / dài (>60) title; thiếu / ngắn (<70) / dài (>160) description; thiếu h1; nhiều h1 (mỗi h1 một mục); thiếu canonical, viewport, `lang`; robots `noindex`; img thiếu alt; thiếu `og:title` / `og:description` / `og:image`;
    - thứ tự trả về giữ như bản cũ.
  - `weight.ts` (port `collectPageWeight` `:39435`):
    - `PW_TYPES = ['document','script','css','img','font','fetch','media','other']`;
    - `classifyResource(e: { initiatorType; name }): PwType`;
    - `pageWeight(nav, resources): PageWeight` = `{ byType: Record<PwType, { bytes; count }>; hidden: number; bufferFull: boolean }`. `hidden` đếm `transferSize === 0 && decodedBodySize === 0` khác cache, theo đúng điều kiện cũ.
  - `page.ts`:
    - `getPageData()` (port `:39538`): meta + `pageWeight` + `seoIssues` → `sendToSidePanel('page_data', …)`; sau đó `detectTechnologies()` (Task 11) → `page_technologies`;
    - làm mới khi `popstate` / `hashchange` (7.07);
    - `refresh_page_data` (7.12) → `getPageData()`;
    - `page_weight_subscribe` (7.09): `PerformanceObserver({ type: 'resource', buffered: false })`, gom; gửi `page_weight_update` tối đa 4 lần/giây (≥250ms); `resourcetimingbufferfull` → `bufferFull = true`;
    - `page_weight_unsubscribe`, `onStop` → `disconnect`.

- [ ] **Step 1: Viết test fail.**
  - `seo.test.ts`:
    - trang rỗng → có `missing-title`, `missing-description`, `missing-h1`, `missing-canonical`, `missing-viewport`, `missing-lang`, `missing-og-title/description/image`;
    - title 20 ký tự → `short-title`; 70 → `long-title`; hai `<h1>` → 2 mục `multiple-h1`; `<meta name=robots content="noindex,follow">` → `noindex`; `<img>` không alt → `missing-alt`;
    - tổng số loại khác nhau trong `SEO_CHECKS` là 16.
  - `meta.test.ts`: `og:image` tương đối → `ogImage` tuyệt đối theo `baseURI`; `twitter:title` vào nhóm `twitter`.
  - `weight.test.ts`: `classifyResource({initiatorType:'link', name:'a.css'})` → `css`; `'img'` → `img`; `.woff2` → `font`; `'xmlhttprequest'` → `fetch`; tổng bytes theo `transferSize`.
  - `page.test.ts`: subscribe + 10 entry trong 100ms (fake timers) → `page_weight_update` gửi 1 lần, sau 250ms lần nữa; `unsubscribe` → `disconnect`; `hashchange` → gửi lại `page_data`.
  - Run: `pnpm vitest run src/lib/page src/content/sidepanel`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Đọc `collectSEOIssues` để lấy **đúng id** từng kiểm tra (khoá dịch dựa vào id) và đúng điều kiện biên (`<` hay `<=`).
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: page metadata, SEO checks and live page weight" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 11: Nhận diện công nghệ

**Files:**

- Create:
  - `src/lib/tech/signatures.ts`, `signatures.test.ts`
  - `src/entrypoints/detect-technologies.ts` (unlisted script)
  - `public/logos/*.svg` (chép 159 file từ `unpacked/sidepanel/logos/`)
- Modify: `src/background/panels.ts` (`run_tech_detection`), `src/content/sidepanel/page.ts`, `page.test.ts`, `src/background.test.ts`

**Interfaces:**

- Produces:
  - `signatures.ts`: `SIGNATURES: Record<string, { id; icon; url; test(w: Window): { version: string | string[] | null } | false | null }>`. Port **nguyên văn** 185 chữ ký của `detect-technologies.js:270–3200`, giữ thứ tự. Chỉ đổi cú pháp decompile về JS gọn; không đổi logic.
  - `detectAll(w: Window): Technology[]` (`:3205`): try/catch từng chữ ký; `version` mảng thì nối `', '`; có next / gatsby / remix / astro mà chưa có react thì thêm React.
  - `detect-technologies.ts`: `export default defineUnlistedScript(() => detectAll(window))`. Giá trị trả về là kết quả của `executeScript`.
  - Background `run_tech_detection` (7.01): `scripting.executeScript({ target: { tabId, frameIds: [sender.frameId ?? 0] }, files: ['/detect-technologies.js'], world: 'MAIN' })` → `{ success: true, technologies: results[0]?.result ?? [] }`; lỗi → `{ success:false, error }`.
  - Content `detectTechnologies()`: `Promise.race` với timeout 2000ms → `[]`. **Không nghe `postMessage`** (Review Focus 7).
  - Logo: panel dùng `browser.runtime.getURL('/logos/<icon>.svg')`. Không có file (kiểm bằng `import.meta.glob('/public/logos/*.svg')` lúc build thành tập tên) → chữ cái đầu.

- [ ] **Step 1: Viết test fail.**
  - `signatures.test.ts`:
    - `Object.keys(SIGNATURES).length === 185`;
    - `detectAll({ React: { version: '18.2.0' }, document })` có `{ id: 'react', version: '18.2.0' }` (dùng đúng biến toàn cục mà chữ ký React kiểm);
    - window có `__NEXT_DATA__` → có `next` và `react`;
    - một chữ ký ném lỗi không làm hỏng cả lượt;
    - mọi `icon` không rỗng đều có file trong `public/logos/` (đọc thư mục bằng `node:fs`).
  - `background.test.ts`: `run_tech_detection` → `executeScript` với `world: 'MAIN'`, `frameIds: [0]`; trả `result`.
  - `page.test.ts`: `window.postMessage({type:'TECH_DETECTION_RESULT', technologies:[{id:'x'}]})` không đổi kết quả; `run_tech_detection` không trả lời → sau 2000ms kết quả `[]`.
  - Run: `pnpm vitest run src/lib/tech src/content/sidepanel src/background.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Kiểm `.output/chrome-mv3/detect-technologies.js` tồn tại và kết thúc bằng biểu thức trả mảng. Nếu WXT bọc IIFE mà không trả giá trị, xem Quyết định đã chốt #3.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: technology detection in the page main world" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 12: Tab Trang — giao diện

**Files:**

- Create, trong `src/entrypoints/sidepanel/page/`:
  - `PageTab.svelte`, `PageHeader.svelte`, `SocialPreview.svelte`, `MetaTags.svelte`, `TechSection.svelte`, `SeoSection.svelte`, `PageWeight.svelte`
  - `page.test.ts`
- Modify: `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `panel.page: PageData | null`, `panel.technologies`, `panel.weight`, `formatBytes` (Task 1), `Section.svelte`.
- Produces:
  - `PageHeader` (7.12):
    - tiêu đề (rỗng thì PAGE_TAB_UNTITLED), URL rút gọn (host + path);
    - nút làm mới → `refresh_page_data`; icon xoay ít nhất 600ms, tối đa 5s;
    - `tabs.onUpdated` của `tabId` với `status: 'loading'` → xoá dữ liệu, NO_PAGE_INFO_MESSAGE, rồi `refresh_page_data` khi `complete`. Bản cũ gửi ngay; đối chiếu `Si` `:13180` và giữ đúng.
  - `SocialPreview` (7.13):
    - chỉ khi có `og:image`;
    - chọn SOCIAL_PREVIEW_FACEBOOK / X / LINKEDIN (lưu `socialPreviewType`);
    - X ưu tiên `twitter:title` / `twitter:image`;
    - thẻ có ảnh, domain, title, description (tuỳ mạng, theo bố cục từng mạng như bản cũ);
    - ảnh lỗi thì ẩn ảnh;
    - nút tải ảnh OG (cùng đường tải của Task 9).
  - `MetaTags` (7.14): nhóm PAGE_TAB_META_SEO / OG / TWITTER, in dạng mã HTML tô màu (`<title>`, `<link rel="canonical">`, `<meta name|property>`), có số dòng, nút copy. Không có meta thì ẩn mục.
  - `TechSection` (7.16):
    - LABEL_TECHNOLOGY / LABEL_TECHNOLOGIES; logo hoặc chữ cái đầu;
    - link tới `url`, không có thì `https://www.google.com/search?q=<name>`; `target=_blank rel=noopener`;
    - tooltip version;
    - đặt **trước** mục SEO.
  - `SeoSection` (7.15): SEO_LABEL_ISSUE / SEO_LABEL_ISSUES, mỗi lỗi có message + recommendation.
  - `PageWeight` (7.18): dòng theo loại LABEL_PW_* (`formatBytes`, số lượng); PW_HIDDEN_NOTE (`$1`); PW_BUFFER_FULL; chỉ cập nhật trực tiếp khi tab Trang đang hiện (đã nối ở Task 4).
- Khoá i18n mới (chép nguyên văn; nhóm `page.*`, `seo.*`):
  - PAGE_TAB_UNTITLED, NO_PAGE_INFO_MESSAGE, PAGE_TAB_SOCIAL_PREVIEW, SOCIAL_PREVIEW_FACEBOOK, SOCIAL_PREVIEW_X, SOCIAL_PREVIEW_LINKEDIN
  - PAGE_TAB_META_TAGS, PAGE_TAB_META_SEO, PAGE_TAB_META_OG, PAGE_TAB_META_TWITTER
  - LABEL_TECHNOLOGY, LABEL_TECHNOLOGIES, SEO_LABEL_ISSUE, SEO_LABEL_ISSUES
  - 32 khoá `SEO_*_MESSAGE` / `SEO_*_RECOMMENDATION`
  - PAGE_TAB_PAGE_WEIGHT, LABEL_PW_DOCUMENT, LABEL_PW_SCRIPTS, LABEL_PW_CSS, LABEL_PW_IMAGES, LABEL_PW_FONTS, LABEL_PW_MEDIA, LABEL_PW_FETCH, LABEL_PW_OTHER, PW_HIDDEN_NOTE, PW_BUFFER_FULL

  Thêm test trong `src/locales/locales.test.ts`: mọi `SEO_CHECKS` id có đủ hai khoá ở cả `en` và `vi`.

- [ ] **Step 1: Viết test fail** (`page.test.ts`, mount `PageTab` với `PageData` mẫu):
  - không có `og:image` → không có SocialPreview; có → mặc định Facebook; bấm X → `socialPreviewType === 'x'`, title lấy `twitter:title`;
  - bấm làm mới → gửi `refresh_page_data`; icon còn xoay sau 500ms, hết sau 600ms (fake timers) khi `page_data` đến sớm;
  - `tabs.onUpdated(tabId, {status:'loading'})` → hiện NO_PAGE_INFO_MESSAGE;
  - tech có `icon: 'react'` → `<img src` chứa `/logos/react.svg`; tech `icon` không có file → chữ cái đầu;
  - mục công nghệ đứng trước mục SEO trong DOM;
  - `page_weight_update` khi đang ở tab Phần tử → bảng không đổi khi quay lại cho tới tin kế (đúng bản cũ: chỉ đăng ký khi ở tab Trang).
  - Run: `pnpm vitest run src/entrypoints/sidepanel src/locales`. Expected: FAIL.
- [ ] **Step 2: Viết code.**
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: side panel page tab — meta, social preview, SEO, technologies, page weight" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 13: Ghép nối và hồi quy — tách/gắn mang theo trạng thái, nhiều tab, theme

**Files:**

- Modify:
  - `src/entrypoints/sidepanel/app.test.ts`
  - `src/content/sidepanel/bridge.test.ts`
  - `src/background.test.ts`

**Interfaces:**

- Consumes: toàn bộ Task 2–12. Không có API mới. Task này chỉ thêm test hồi quy cho các luồng cắt ngang và sửa lỗi lộ ra.

- [ ] **Step 1: Viết test.**
  - Tách: panel tab 5 đang ở tab Trang, cuộn 300px → bấm undock → cửa sổ mới (mount `App` với `?tabId=5&detached=1`) mở tab Trang, `scrollTop` về 300 sau rAF; handoff quá 30s thì mở tab Phần tử.
  - Gắn: `?detached=1` bấm dock → gửi `dock_panel(5)`; `success` → `window.close` được gọi.
  - Đang `switching` → tin `select_element` bị bỏ qua.
  - Theme: `storage.local.theme = 'light'` → `<html data-theme="light">` ngay, không cần mở lại.
  - Content: `state.selected` đổi 5 lần trong một tick → `select_element` gửi 1 lần.
  - `keyboard_shortcut('Escape')` khi có phần tử chọn → `state.selected === null` và panel nhận `clear`.
  - Run: `pnpm vitest run`. Expected: PASS sau khi sửa.
- [ ] **Step 2: Sửa lỗi** mà test lộ ra.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "test: side panel handoff, multi-tab and theme regressions" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 14: Đổi nhãn kiểm kê, thử tay trên Edge

**Files:**

- Modify: `docs/inventory.md`

- [ ] **Step 1: Đổi nhãn theo bảng "Phạm vi"** ở đầu plan.
  - Dòng chỉ dời một phần thì tách thành dòng mới, đánh số tiếp cuối mục (1.42…; 2.23…; 5.22…; 6.49…; 9.42… — lấy số tiếp theo thật trong file), ghi `(tách từ X)`, giữ nguyên tham chiếu code cũ:
    - 6.09: nhánh chế độ sửa + `editCount` → `đợt 5`;
    - 6.13: `select_element` mode edit, `edit_payload_extras`, `media_activity`, `set_mode` → `đợt 5`; `responsive_mode_ready` → `đợt 6`;
    - 6.20: ô chọn trạng thái + `force_element_state` → `đợt 5`;
    - 2.17: xoá id khi hoàn tác hết → `đợt 5`;
    - 2.19 / 2.20: nhánh responsive → `đợt 6`;
    - 2.21: `clear` cho `editor_panel` → `đợt 5`;
    - 9.24: confirm / prompt / size → `đợt 5`;
    - 5.21: `get_matched_rules` (chỉ đọc) + `enable_cross_origin_styles` → dòng mới `đợt 4`;
    - 1.06: tắt side panel toàn cục → dòng mới `đợt 4`.
  - 9.37 đánh `[x]` với ghi chú "không cần trong bản mới". 6.14 ghi "thay bằng port `sidepanel_*`". 6.07 ghi "huy hiệu cảnh báo không port: cờ cũ luôn tắt".
  - Run: `pnpm vitest run docs/inventory.test.ts`. Expected: PASS (không mất tên nào).
- [ ] **Step 2: Build và đưa checklist cho chủ dự án.** Controller **trình bày danh sách dưới đây rồi đi tiếp, không chờ kết quả**. Chủ dự án tự đánh `[x]` sau khi thử.
  1. `pnpm build`, reload `.output/chrome-mv3` trong `edge://extensions`, không có lỗi đỏ (cả service worker và trang side panel: chuột phải panel → Inspect).
  2. Chưa bật iodob ở tab: biểu tượng side panel của Edge không mở panel iodob (đã tắt toàn cục).
  3. Bật iodob, bấm nút Side panel trên dock:
     - panel mở bên phải, hiện "Nhấp vào một phần tử để chọn" + bảng phím đúng phím thật;
     - không lỗi "user gesture" trong console SW;
     - bấm lại thì panel đóng; phím `0` làm giống hệt.
  4. Click một phần tử:
     - panel hiện selector, `W × H`, Document (cha / phần tử / con), Box model, Code, Màu, Typography…;
     - click dòng cha → trang chọn cha; click selector → trang cuộn tới và chọn.
  5. Code:
     - Computed có `::before` khi phần tử có;
     - Source nhóm theo file, khai báo bị đè gạch ngang, rule `@media` không áp thì mờ;
     - Tailwind có class, đúng tên v4 (`rounded-sm`, `shadow-xs`…).
  6. Trang có CSS từ CDN (vd. một trang dùng Google Fonts / jsDelivr):
     - Source báo "N … bị ẩn" + link;
     - bấm link → Edge hỏi quyền → cho phép → rule hiện ra;
     - lần sau tự hiện.
  7. Màu:
     - đổi HEX → RGB → HSL → HSB ở panel: ô màu đổi; inspector nổi trên trang và hút màu (phím 6) copy cùng định dạng;
     - hover một màu → trang viền các phần tử dùng màu đó; chuột ra khỏi panel → hết viền.
  8. Lỗi tương phản: chọn một khối có chữ xám nhạt trên nền trắng → có cảnh báo AA. Bấm "sau" → trang cuộn và tô từng phần tử. Phần tử ngoài màn hình được tính khi cuộn tới.
  9. Asset:
     - chọn khối có ảnh: lưới ảnh co giãn khi kéo rộng panel;
     - bấm tải → Edge hỏi quyền `downloads` lần đầu → file có tên đúng;
     - "Tải tất cả" tải đủ.
  10. Canvas (vd. một trang có `<canvas>` vẽ màu): mục Canvas có context, kích thước, `Nx`; Màu có nhóm nền từ canvas.
  11. Tab Trang:
      - tiêu đề, URL rút gọn; nút làm mới xoay;
      - Meta tags dạng mã có số dòng, copy được;
      - xem trước Facebook / X / LinkedIn đổi được và được nhớ;
      - công nghệ có logo (vd. trang React / Next.js: có cả Next.js và React), link mở tab mới;
      - lỗi SEO có message + gợi ý;
      - dung lượng trang tăng dần khi cuộn trang tải ảnh lười.
  12. Gõ địa chỉ mới ở tab đó: tab Trang hiện "Không tìm thấy thông tin trang" rồi tự nạp lại.
  13. Tách cửa sổ:
      - bấm "Mở trong cửa sổ" khi đang ở tab Trang, cuộn giữa → cửa sổ popup 400×800 (lần đầu) mở đúng tab Trang, đúng vị trí cuộn, tiêu đề = title trang;
      - side panel trong tab tắt;
      - kéo / co cửa sổ, đóng, tách lại → cửa sổ ở vị trí và kích thước cũ.
  14. Gắn lại: bấm "Chuyển về bảng bên" → panel mở trong tab, cửa sổ rời đóng, giữ tab đang xem.
  15. Đóng cửa sổ rời bằng nút X của Windows → nút dock / phím `0` lại mở panel trong tab.
  16. Hai tab cùng bật iodob, panel mở ở cả hai: chọn phần tử ở tab B không đổi panel tab A. Sang một tab chưa bật iodob → panel tắt. Quay lại → panel bật lại.
  17. Ctrl+Q / bấm icon khi panel đang mở (cả khi có cửa sổ rời): panel tắt, cửa sổ rời đóng, không còn viền tô trên trang.
  18. Trong panel (không trong ô nhập) nhấn `2` → X-Ray bật trên trang; Esc → bỏ chọn. Gõ `2` trong ô chọn của panel → không có gì.
  19. Theme: đổi `chrome.storage.local.set({theme:'light'})` trong console SW → panel đổi sáng ngay. `system` theo theme Windows.
  20. Chọn phần tử đã bị xoá khỏi trang (SPA đổi trang) rồi bấm selector ở panel → hộp thoại "không tìm thấy phần tử", Enter đóng được.
- [ ] **Step 3: Commit nhãn mới.** `git commit -am "docs: retag deferred phase-4 inventory lines" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

## Xong khi

- `pnpm check` và `pnpm build` qua.
- Manifest build có `side_panel`, không có `host_permissions` / `content_scripts`, không thêm quyền.
- Checklist thử tay ở Task 14 đã chuyển cho chủ dự án.
- Mọi dòng `đợt 4` trong `docs/inventory.md` hoặc đã đổi nhãn theo bảng Phạm vi, hoặc chờ chủ dự án đánh `[x]` sau khi thử tay.

## Ghi chú cho các đợt sau

- **Kênh:** tin mới cho panel thêm vào `SidePanelApi`, không dùng `runtime.sendMessage` trần. Panel luôn lọc theo `accept`. Tin gửi tới trang từ panel luôn có `frameId`.
- **Đợt 5:**
  - `select_element` mode edit, `edit_payload_extras`, `media_activity`, `set_mode`, view sửa (`editor.html`), kênh `editor_panel`;
  - ô chọn trạng thái + `force_element_state` ở header;
  - mở rộng `src/lib/css/matched.ts` (`ruleRef`, `readOnly`, `scopeAddress`) thay vì viết engine thứ hai;
  - hộp thoại confirm / prompt / size dùng lại `Dialog.svelte`;
  - `set_edit_mode` mở side panel trước khi vào chế độ sửa (1.35) dùng `open_side_panel` có sẵn; `editCount` vào `ElementDetails`;
  - handoff có sẵn chỗ `selectedEditTab`.
- **Đợt 6:**
  - panel nhận tin từ iframe responsive: nhớ `sender.frameId` (biến `Xo` cũ) và gửi lại đúng frame;
  - `responsive_mode_ready` nối lại port;
  - `select_parent` / `select_child` / `highlight_issue_element` bỏ qua ở responsive;
  - `run_tech_detection` đã nhận `frameId`.
- **Đợt 7:** trang cài đặt đổi `colorFormat` thì ghi vào `sidePanelPreferences.colorFormat` (cùng khoá với panel). Content và panel đã nghe sẵn.
- **Đợt 8:** MCP `get_element_details` / `get_page_info` dùng lại `collectElementDetails`, `getPageData`, `ElementDetails`, `PageData`; `get_element_matched_rules` dùng `get_matched_rules`; `query_selector` dùng `uniquePath` / `resolveElementById`.

## Quyết định đã chốt (chủ dự án, 2026-11-03)

Đồng ý toàn bộ khuyến nghị:

1. Giao hai mốc: **4a** = Task 1–9 (trừ phần Tailwind của Task 8); **4b** = Tailwind + Task 10–13.
2. `open_side_panel` / `dock_panel` gọi thẳng trong listener (cờ `syncHandlers`) để giữ cử chỉ người dùng.
3. Nhận diện công nghệ lấy kết quả từ giá trị trả về của `executeScript`, không qua `postMessage`.
4. Tra nguồn chữ ký / logo trong Task 11; MIT thì thêm LICENSE + ghi công, chưa rõ thì giữ như bản cũ và ghi rủi ro.
5. Giữ `data-sr-id-<extId>` trên trang như bản cũ.
6. Panel theo `prefers-color-scheme` khi theme = Hệ thống.
7. Panel nền đặc (`zinc-900` / trắng), cùng token chữ/viền/nhấn/bo góc/font, không `backdrop-blur`.
8. `update_canvas_fps`: không port nếu bản cũ không đo thật; có thì port nguyên văn.
9. Ô chọn trạng thái (6.20) dời sang đợt 5.

**Bố cục:** chủ dự án cho phép thiết kế lại bố cục panel cho hợp lý hơn, **không cần giống bản cũ**. Giữ đủ thông tin và hành vi trong kiểm kê; cách sắp xếp mục, nhóm, thứ tự và hình thức hiển thị do người làm chọn theo §7.
