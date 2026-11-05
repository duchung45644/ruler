# Bo doi — Đợt 6: Responsive mode — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** responsive mode như bản cũ (spec §4.6):

- Nhiều khung (viewport) cạnh nhau, mỗi khung là một iframe tải đúng URL trang.
  - Thêm khung theo thiết bị hoặc tuỳ chỉnh.
  - Di chuyển, co giãn bằng tay kéo, xoay, xoá, đặt lại; đổi sáng/tối từng khung.
- Thanh trên: zoom 25–200%, tải lại mọi khung, đồng bộ cuộn, bố cục một hàng / xuống dòng, cảnh báo tràn ngang.
- **Chế độ khung theo breakpoint:** mỗi mốc media query một khung.
- Khung giữ đồng bộ khi trang SPA chuyển trang; link khác domain mở tab mới.
- Trang chặn nhúng (X-Frame-Options / CSP `frame-ancestors`): gỡ header bằng rule session `declarativeNetRequest` theo tab. Cần quyền `<all_urls>` (optional) và có lớp phủ hướng dẫn.
- **Sửa CSS ở side panel áp vào các khung.**
  - Sửa đã có trên trang được mang vào khung khi vào responsive.
  - Sửa trong khung được mang về trang khi thoát.
- Công cụ dock (inspect, X-Ray, grid, thước, đo, tìm, pause…) chạy trong khung; tìm gộp kết quả qua các khung.

**Architecture:**

- **Khung cha (shell)**, frame 0, thư mục `src/content/responsive/`:
  - `shell.svelte.ts`: vào/thoát, viewports, zoom, wrap, sync;
  - `Shell.svelte`: thanh trên, canvas chấm, danh sách khung;
  - `frame.ts`: iframe, tay kéo, loading/timeout, lớp phủ bị chặn, kiểm tràn. Là đường chạy liên tục (§6.4) nên viết TS thuần;
  - `bridge.ts`: postMessage có kiểu giữa cha và khung;
  - `forward.ts`: chuyển tiếp lệnh dock, pause, find, sửa xuống khung.
- **Phía khung (frame mode):**
  - content script trong iframe nhận ra mình qua `window.name` = `bo-doi-rv-<extId>-<n>`;
  - chạy công cụ và overlay tại chỗ; không có dock, không mở side panel;
  - trả lời cha qua `bridge.ts`; đặt `inResponsiveFrame = true` trong `src/content/edit/persist.ts`.
- **Kênh cha↔khung (§6.3):**
  - không đi qua `runtime.sendMessage`. Hai bên cùng origin nhưng khác isolated world; postMessage nhanh và giữ thứ tự;
  - `ShellApi` / `FrameApi` định nghĩa một lần trong `src/lib/responsive/channel.ts`, cùng kiểu `Handlers<>` với `messaging.ts`;
  - gói tin `{ __bd: <extId>, dir, type, data, id? }`; kiểm `event.source` và `event.origin === location.origin`.
- **Kênh extension** (`src/lib/messaging.ts`): thêm vào `BackgroundApi`, `ContentApi`, `SidePanelApi` (Task 3). Side panel gửi theo `frameId` của khung đang chọn.
- **Background:** file mới `src/background/responsive.ts` gồm:
  - rule DNR session (id = tabId);
  - nạp script vào khung responsive;
  - hand-off khi thoát: `storage.session`, mốc 15s, `tabs.onUpdated`.
- **Logic thuần** trong `src/lib/responsive/`, đều có unit test: `devices.ts` (8.10), `viewports.ts`, `zoom.ts`, `scroll-sync.ts`, `nav.ts`, `find-agg.ts`, `history-agg.ts`, `frame-name.ts`.

**Mốc:** mỗi mốc build xanh và commit được.

| Mốc | Task | Nội dung |
| --- | --- | --- |
| M1 — Nền | 1–5 | Logic thuần, kênh, background, frame mode tối thiểu |
| M2 — Shell | 6–10 | Vào/thoát, khung, thanh trên, lưu cài đặt, chặn nhúng, cuộn, điều hướng, chế độ breakpoint |
| M3 — Công cụ & sửa | 11–16 | Chuyển tiếp dock/pause/tìm, panel ↔ khung, sửa CSS, chụp, hồi quy, kiểm kê |

**Tech Stack:** giữ nguyên Đợt 1–5. Không thêm dependency, không thêm quyền. Manifest đã có `declarativeNetRequestWithHostAccess` và `optional_host_permissions: ['<all_urls>']`.

**Spec:** §3, §4.6, §5 (chốt 6–8), §6.3, §6.4, §7, §8 Đợt 6, §9.

**Kiểm kê:** các dòng `· đợt 6 ·`:

- 1.28, 1.32, 1.33, 1.34, 1.40, 1.47, 1.48, 1.49;
- 2.23, 2.25, 2.26;
- 3.22;
- 4.06, 4.15, 4.17;
- 5.23–5.27;
- 6.51;
- 8.01–8.23;
- 9.40, 9.45.

---

## Phạm vi — đổi so với bản cũ do chốt 2026-11-05

| Dòng | Bản cũ | Bản mới |
| --- | --- | --- |
| 1.40, 8.08 | Phím `9` | Phím chữ (Q1) |
| 5.23 | `enterEditMode` sau khi thoát | Bỏ; chỉ còn `apply_pending_rule_edits` |
| 5.24, 8.19 | `responsive_set_edit_mode` / `responsive_exit_edit_mode` | Bỏ; lệnh sửa của side panel đi thẳng tới khung đang chọn (Task 12) |
| 8.20 | Nút dock sửa nghe `iframe_editor_*` | Không có nút dock sửa; giữ lịch sử chung `editor_op_recorded`; gộp thành `frame_edit_state(EditState)` |
| 8.09 | Tắt sửa chữ khi vào | Vẫn tắt (`state.textEditOn = false`) |
| 2.26 | `highlight_issue_element` bỏ qua ở responsive | Giữ |
| 4.06 | Chụp trong khung bằng dựng ảnh từ DOM | Xem Q6 |
| 9.40 | `toggle_script` ở responsive thì reload | Giữ (= thoát) |

## Global Constraints

- **Giữ mọi ràng buộc Đợt 0–5:**
  - phiên bản ghim; không thêm dependency;
  - manifest không có `host_permissions` / `content_scripts`; không thêm quyền;
  - chỉ `en` / `vi`; không sửa `unpacked/`, `legacy-src/`;
  - commit kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Chuỗi:**
  - dùng `i18n.t()`, nhóm `responsive.*`;
  - chép nguyên văn từ `unpacked/_locales/{en,vi}/messages.json`;
  - tên thiết bị không dịch.
- **An toàn:**
  - mọi tin postMessage kiểm `__bd === browser.runtime.id`, `source`, `origin`; tin lạ bỏ qua;
  - khung không `eval` dữ liệu từ cha;
  - rule DNR chỉ `tabIds: [tabId]`, `resourceTypes: ['sub_frame']`;
  - xoá rule khi: thoát; tab tải lại mà không còn responsive; tab đóng; SW khởi động (dọn rule mồ côi).
- **Phía khung:**
  - không mount dock, không mở side panel, không ghi storage cài đặt;
  - không lưu sửa CSS theo site (5.25);
  - phím trong khung chuyển lên cha (`shortcut`).
- **DRY:** lệnh chuyển xuống khung lấy từ cờ `forward` của item trong registry, không viết `switch` mới.
- **Test:**
  - happy-dom không tải iframe và không tính layout. Logic thuần và `bridge.ts` test bằng `Window` giả / `MessageEvent`;
  - phần cần trình duyệt thật đánh dấu **[Chromium]**: kiểm tay trên Edge, hoặc Chromium headless bằng script ngoài CI;
  - `fakeBrowser` cho storage / messaging; `vi.useFakeTimers()` cho các mốc thời gian.
- **Kiểm mỗi task:** test của file → typecheck, lint, prettier, test, build PASS → commit.

## Review Focus

1. **Không rò rỉ khi thoát:** listener, ResizeObserver, timer, rule DNR.
2. **Kênh:** script của trang không giả được lệnh.
3. **Sửa CSS không mất:** vào → khung áp đủ; sửa ở khung → khung khác nhận; thoát → trang áp và lưu, không có toast khôi phục (5.26).
4. **Side panel đúng khung:** chọn ở khung 2 thì `toPage` tới `frameId` của khung 2; khung khác bỏ chọn.
5. **Phím / §9:** gõ trong ô của trang trong khung không kích hoạt phím; không chạy hai lần.
6. **DNR chỉ khi có quyền.**

---

### Task 1: Logic thuần — thiết bị, viewports, zoom, breakpoint frames, tên khung

**Files:** `src/lib/responsive/devices.ts`, `viewports.ts`, `zoom.ts`, `frame-name.ts`, kèm test.

```ts
type Scheme = 'system' | 'light' | 'dark';
interface Viewport { id: number; name: string; device?: string; width: number; height: number; scheme: Scheme }
interface ResponsiveSettings { viewports: Viewport[]; zoom: number; framesWrap: boolean; syncScrollEnabled: boolean }
```

- [ ] **`DEVICE_PRESETS`** theo 8.10, cộng `custom`.
- [ ] **`viewports.ts`:**
  - `defaultViewports()` theo Q3;
  - `clampSize`: 200×300 khi kéo; lưu kẹp 320–3840;
  - `rotate`, `move`, `reset`, `cycleScheme`;
  - `normalizeSaved` (tối đa 20);
  - `breakpointViewports(bps, current)`: port `buildBreakpointViewports :35492`.
- [ ] **`zoom.ts`:** `ZOOM_LEVELS = [25,50,75,100,125,150,200]`, `stepZoom` ±5%, `clampZoom`, `zoomOptions`.
- [ ] **`frame-name.ts`:** `frameName` / `parseFrameName`.
- [ ] **Tests:** mỗi file một test.
- [ ] **Commit.**

### Task 2: Logic thuần — cuộn, điều hướng, tìm gộp, lịch sử chung

**Files:** `scroll-sync.ts` (ratio, phát hiện xung đột ≥5 lần/700ms), `nav.ts` (8.18), `find-agg.ts` (8.21), `history-agg.ts` (8.20), kèm test.

- [ ] Mỗi hàm một test.
- [ ] **Commit.**

### Task 3: Kênh — postMessage cha↔khung và lệnh extension mới

**Files:**

- Create: `src/lib/responsive/channel.ts`, `src/content/responsive/bridge.ts`, kèm test.
- Modify: `src/lib/messaging.ts`.

- [ ] **`FrameApi`** (cha → khung): `ready_ack`, `apply_rule_edits`, `collect_rule_edits`, `get_current_url`, `get_breakpoints`, `run_item`, `set_paused`, `set_setting`, `find`, `find_goto`, `clear_selection`, `apply_scroll_sync`, `reset_scroll_conflict`, `apply_spa_navigation`, `update_ui_scale`, `edit_undo`, `edit_redo`.
- [ ] **`ShellApi`** (khung → cha): `ready_for_state_sync`, `scroll_sync`, `scroll_sync_conflict`, `spa_navigation`, `overflow_status`, `report_find_count`, `selection_changed`, `editor_op_recorded`, `frame_edit_state`, `rule_edits_changed`, `shortcut`, `request_ui_scale`, `pin_inspector_top`, `open_external`.
- [ ] **`bridge.ts`:** request/response theo `id`, timeout 500ms; kiểm `__bd` / `source` / `origin`; gỡ listener theo `AbortSignal`.
- [ ] **`messaging.ts`:**
  - `BackgroundApi` thêm `enable_frame_header_rule`, `disable_frame_header_rule`, `inject_responsive_frames`, `exit_responsive_mode`;
  - `ContentApi` thêm `start_frame_mode`;
  - `SidePanelApi` thêm `responsive_state`.
- [ ] **Tests:** trả lời; timeout; tin giả bị bỏ; abort.
- [ ] **Commit.**

### Task 4: Background — DNR, nạp script vào khung, hand-off

**Files:** `src/background/responsive.ts` kèm test; `src/entrypoints/background.ts`.

- [ ] **DNR (8.03):**
  - chỉ khi `permissions.contains({origins:['<all_urls>']})`;
  - xoá 4 header (x-frame-options, frame-options, content-security-policy, content-security-policy-report-only) cho `sub_frame` của tab;
  - dọn khi `tabs.onRemoved` và lúc SW khởi động.
- [ ] **Nạp script (8.05 / 8.06):**
  - `executeScript({allFrames:true, func: () => window.name})` để lọc `frameId` đúng tiền tố;
  - nạp `content.js` vào đúng các frameId đó rồi gửi `start_frame_mode`;
  - bắt lỗi với frame khác origin.
- [ ] **Thoát (8.01 / 8.02):** xoá rule; ghi hand-off theo Q8.
- [ ] **Tests:** không quyền thì không gọi DNR; shape rule; `onRemoved`; lọc frameId; hand-off trong/ngoài 15s.
- [ ] **Commit.**

### Task 5: Frame mode tối thiểu

**Files:**

- Create: `src/content/responsive/frame-mode.ts`, kèm test.
- Modify:
  - `src/entrypoints/content/index.ts`;
  - `src/content/core/session.ts` (`state.inFrame`, không mount dock);
  - `src/content/edit/persist.ts`;
  - `src/content/core/keys.ts` (phím trong khung chuyển lên cha).

- [ ] Khung khởi động: `connectToParent` rồi gửi `ready_for_state_sync`; `run_item` chạy item tại chỗ.
- [ ] **Tests:**
  - `window.name` khớp thì `inFrame`, không có dock, persist tắt;
  - phím `x` chuyển lên cha;
  - gõ trong `<input>` thì không gửi.
- [ ] **Commit.**
- **Checklist M1 [Chromium]:** script chỉ vào đúng iframe có tên; rule DNR gỡ header khi có quyền.

**— Hết M1. —**

### Task 6: Vào / thoát, nút dock, phím

**Files:** `src/content/responsive/{index.ts,shell.svelte.ts,Shell.svelte}` kèm test; `registry.svelte.ts` (Q1); `tools/index.ts`; locales.

- [ ] **Item `responsive`:** icon `MonitorSmartphone`, phím theo Q1, `isActive: () => state.responsiveOn`.
- [ ] **Vào (8.09):**
  1. Hỏi nếu có sửa HTML không mang được.
  2. Lấy `serialize()` của RuleTracker và breakpoints.
  3. Hiện shell theo Q2.
  4. Gọi `enable_frame_header_rule`.
  5. Dựng khung từ cài đặt hoặc mặc định; dùng chế độ breakpoint nếu `breakpointsIsOn` (Q5).
- [ ] **Thoát (8.23 / 1.48):** theo Q8.
- [ ] Quit / `toggle_script` khi đang responsive thì thoát.
- [ ] **Tests:** item đúng nhóm; phím; hỏi / Huỷ; tạo đủ iframe có tên đúng; thoát gửi `ruleEdits`; không có toast khôi phục.
- [ ] **Commit.**

### Task 7: Khung — header, tay kéo, loading, tràn, sáng/tối

**Files:** `src/content/responsive/frame.ts`, `FrameHeader.svelte`, kèm test.

- [ ] **iframe (8.14):** `sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"`, `color-scheme` theo `scheme`; khi `load` thì gọi `inject_responsive_frames`.
- [ ] **Header (8.12):** tên (W×H), di chuyển, xoay, sáng/tối, xoá (có hỏi), menu thêm.
- [ ] **Tay kéo** qua `core/drag.ts`, tối thiểu 200×300; chặn click 50ms sau kéo (§9).
- [ ] **Loading:** timeout 15s.
- [ ] **Tràn ngang** theo `overflow_status`.
- [ ] **Tests.** **[Chromium]:** tay kéo, loading thật.
- [ ] **Commit.**

### Task 8: Thanh trên, zoom, bố cục, lưu cài đặt, thêm khung, ui-scale

**Files:** `Toolbar.svelte` kèm test; `src/lib/settings.ts` (`responsiveMode`); `src/ui/Dialog.svelte` (ô W/H, 9.45).

- [ ] **Thanh trên (8.11):** zoom, tải lại, URL, đặt lại (có hỏi), đồng bộ cuộn, bố cục, thêm khung (thiết bị theo nhóm, Custom 200×300–3840).
- [ ] **Zoom:** `transform: scale(z)`; gửi `update_ui_scale(1/z)` cho khung (1.28).
- [ ] **Lưu (8.16):** trễ 400ms; chế độ breakpoint không ghi đè viewports đã lưu.
- [ ] **Dock** của cha giữ nguyên, nằm dưới thanh trên.
- [ ] **Tests.**
- [ ] **Commit.**

### Task 9: Trang chặn nhúng, xin quyền

**Files:** `src/content/responsive/blocked.ts` kèm test; side panel theo Q4.

- [ ] **Phát hiện:** `load` mà 1,5s không có `ready`, và document là `null` / `about:blank`.
- [ ] **Lớp phủ (8.15)** kèm link cấp quyền theo Q4.
- [ ] **Khi có quyền** (`permissions.onAdded`): `enableRule` rồi tải lại khung.
- [ ] Vẫn bị chặn thì hiện RESPONSIVE_FRAME_BLOCKED_STILL.
- [ ] **Tests.** **[Chromium]:** github.com.
- [ ] **Commit.**

### Task 10: Đồng bộ cuộn, SPA, điều hướng, chế độ breakpoint

**Files:** `src/content/responsive/sync.ts` kèm test; `tools/breakpoints/index.ts`.

- [ ] **Cuộn (8.17):**
  - ratio gửi theo rAF; khung ngoài màn hình phát lại khi hiện;
  - xung đột thì tắt sync và hiện toast 8s.
- [ ] **SPA / điều hướng (8.18):**
  - `decideNavigation` quyết định; link ngoài gọi `open_external_tab`;
  - dò URL bằng `navigation.addEventListener('navigate')`, fallback poll 500ms;
  - khung lạc domain: sau 2,5s đặt lại `src`.
- [ ] **Chế độ breakpoint (3.22 / 8.22):** theo Q5; khoá thêm khung; nút B khoá khi trang không có breakpoint; màu dùng chung `COLORS`.
- [ ] **Tests.** **[Chromium]:** SPA, cuộn hai khung.
- [ ] **Commit.**
- **Checklist M2 (Edge):**
  - vào / thoát trên trang tĩnh, SPA, trang chặn nhúng;
  - zoom; wrap; thêm, custom, xoay, kéo, xoá, đặt lại; sáng/tối;
  - cài đặt còn sau khi tải lại;
  - chế độ breakpoint trên trang Tailwind v4.

**— Hết M2. —**

### Task 11: Chuyển tiếp dock, pause, cài đặt, tìm gộp

**Files:** `src/content/responsive/forward.ts` kèm test; `registry.svelte.ts` (`DockItem.forward?`); các tool; `tools/find/*`.

- [ ] **Item `forward`:** inspect, xray, grid, ruler, measure, eyedropper, overlay, select_parent, select_child (2.25). Nhóm cục bộ chạy ở cha (1.49).
- [ ] **Cài đặt:** gửi `set_setting`; khung mới nhận toàn bộ trạng thái qua `ready_ack` (1.32 / 1.47).
- [ ] **Pause** (1.47).
- [ ] **Tìm gộp** (1.33 / 8.21).
- [ ] **Ghim inspector** (2.23).
- [ ] **Tests.**
- [ ] **Commit.**

### Task 12: Side panel nói với khung đang chọn

**Files:** `src/entrypoints/sidepanel/store.svelte.ts` (`panel.frameId`); `src/content/sidepanel/bridge.svelte.ts`; bộ lọc `accept` của panel.

- [ ] **Chọn ở khung n:** cha gửi `clear_selection` cho khung khác; panel đặt `frameId = sender.frameId`.
- [ ] **Vào / thoát:** `responsive_state({on})` (6.51); thoát thì `frameId = 0`.
- [ ] Handoff khi tách panel giữ `frameId`.
- [ ] Bỏ qua `highlight_issue_element` (2.26).
- [ ] **Tests.**
- [ ] **Commit.**

### Task 13: Sửa CSS trong responsive

**Files:** `src/content/responsive/edits.ts` kèm test; `edit/handlers.ts`; `edit/persist.ts`.

- [ ] **Mang vào (5.27):** qua `ready_ack` + `apply_pending_rule_edits`.
- [ ] **Đồng bộ:**
  - lệnh rule ở khung chọn → `rule_edits_changed` → cha gửi `apply_rule_edits` cho khung khác;
  - sửa HTML chỉ ở khung chọn.
- [ ] **Lịch sử chung (8.20).**
- [ ] **Mang về:** cha giữ bản mới nhất.
- [ ] **Sửa HTML không mang được (8.08):** hỏi khi thoát.
- [ ] **Tests.**
- [ ] **Commit.**

### Task 14: Chụp trong responsive

- [ ] Theo Q6 (đề xuất: `captureVisibleTab` của cha rồi cắt theo khung / phần tử; tạm tắt chụp cả trang).
- [ ] **Tests:** quy đổi rect qua offset iframe và zoom.
- [ ] **Commit.**

### Task 15: Ghép nối và hồi quy

- [ ] **Test luồng:** vào → bấm X → chọn ở khung 2 → panel sửa rule → khung 1 nhận → thoát → trang áp và lưu.
- [ ] **Hai tab:** không ảnh hưởng nhau.
- [ ] **§9:** phím và sự kiện không lọt.
- [ ] **Chạy toàn bộ kiểm tra.**
- [ ] **Commit.**

### Task 16: Kiểm kê và thử tay trên Edge

- [ ] Đánh `[x]` các dòng đợt 6; ghi chú các dòng đổi theo bảng Phạm vi.
- [ ] **Thử tay** trên trang tĩnh, SPA, github.com, trang Tailwind v4:
  - vào / ra;
  - khung (thêm, xoá, xoay, kéo, sáng/tối, zoom, wrap, đặt lại, nhớ cài đặt);
  - trang chặn nhúng;
  - cuộn đồng bộ;
  - SPA;
  - chế độ breakpoint;
  - công cụ trong khung, pause, tìm;
  - panel với khung 2 và sửa CSS áp mọi khung;
  - chụp;
  - theme và ngôn ngữ.
- [ ] **Commit** `docs: retag phase-6 inventory lines`.

**— Hết M3. —**

## Xong khi

- Mọi dòng đợt 6 là `[x]` hoặc đã ghi chú bỏ / đổi.
- Kiểm tra và build PASS; không thêm quyền, không thêm dependency.
- Checklist Task 16 qua trên Edge.
- Không còn rule DNR sau khi thoát hoặc đóng tab.

## Quyết định cần chốt

- **Q1 — Nút và phím.**
  - Lựa chọn: nhóm 2 (cạnh Breakpoint), nhóm 4, hoặc nhóm 5.
  - Phím: `v`, `d` hoặc `w`.
  - **Đề xuất:** nhóm 2 + `v`.
- **Q2 — Cách hiện.**
  - a) Phủ toàn màn hình trên trang (shadow host), dừng media;
  - b) Như cũ, xoá DOM trang;
  - c) Tab mới (cần `<all_urls>` cho mọi site).
  - **Đề xuất:** a.
- **Q3 — Viewports mặc định.**
  - a) Phone 390×844 / Tablet 768×1024 / Desktop 1280×800;
  - b) iPhone 17 Pro / iPad Air / Laptop 1440×900.
  - **Đề xuất:** a.
- **Q4 — Xin quyền khi trang chặn nhúng.**
  - a) Mở side panel tới nút cấp quyền có sẵn;
  - b) Trang `grant.html` riêng;
  - c) Chỉ hướng dẫn chữ.
  - **Đề xuất:** a.
- **Q5 — Vào chế độ khung theo breakpoint.**
  - a) Như cũ: ở responsive, nút B chuyển sang chế độ khung;
  - b) Công tắc riêng trên thanh trên.
  - **Đề xuất:** a.
- **Q6 — Chụp trong khung.**
  - a) `captureVisibleTab` của cha rồi cắt; tạm tắt chụp cả trang;
  - b) Port dựng ảnh từ DOM (~900 dòng).
  - **Đề xuất:** a.
- **Q7 — Bỏ của bản cũ.** Đề xuất bỏ:
  - các lệnh chế độ sửa;
  - `iframe_editor_*` (gộp thành `frame_edit_state`);
  - `ping_target_iframe` / `toggle_script_in_iframe_only`;
  - `display_technologies` qua khung;
  - `inspect_content` / `inspect_position` (khung tự vẽ, trừ ghim).

  Giữ: đồng bộ cuộn kèm phát hiện xung đột, đồng bộ SPA, lịch sử undo chung.
- **Q8 — Thoát có bắt buộc reload.**
  - a) Có, như cũ;
  - b) Gỡ shell không reload, áp sửa CSS trực tiếp; chỉ reload / hand-off khi URL khung đầu khác URL trang.
  - **Đề xuất:** b.

## Quyết định đã chốt

Chủ dự án duyệt toàn bộ đề xuất (2026-11-05):

- **Q1:** nút `responsive` ở nhóm 2 sau `breakpoints`; phím `v`.
- **Q2:** shell phủ toàn màn hình trên trang (shadow host), dừng media.
- **Q3:** Phone 390×844 / Tablet 768×1024 / Desktop 1280×800.
- **Q4:** link trong lớp phủ mở side panel tới nút cấp quyền có sẵn.
- **Q5:** ở responsive, nút B chuyển sang chế độ khung; `breakpointsIsOn` lúc vào thì vào thẳng.
- **Q6:** chụp bằng `captureVisibleTab` của cha rồi cắt; tạm tắt chụp cả trang khi responsive.
- **Q7:** bỏ các mục đã liệt kê; giữ đồng bộ cuộn, SPA, lịch sử undo chung.
- **Q8:** thoát gỡ shell không reload, áp sửa CSS trực tiếp; chỉ reload / hand-off khi URL khung đầu khác URL trang.
