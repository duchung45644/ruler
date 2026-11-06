# iodob — Đợt 7: Trang cài đặt — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** trang cài đặt (options page) theo spec §4.8:

- Giao diện: theme Hệ thống / Sáng / Tối (khoá `theme`).
- Extension: định dạng màu HEX/RGB/HSL/HSB (`sidePanelPreferences.colorFormat`).
- Chụp: công tắc theo `screenshotPreferences`, xem Q2.
- Xoá chỉnh sửa đã lưu: xoá mọi khoá `persistedRuleEdits:*`, gồm cả sửa CSS rule và sửa inline style (cùng khoá từ commit 4324434).
- MCP: chỉ hiện ở đợt 8 (Q3).
- Trang tự cập nhật khi storage đổi ở nơi khác (side panel, tab khác).
- Mở trang từ extension (`open_options_page`).

**Architecture:**

- **Entrypoint mới** `src/entrypoints/options/`:
  - `index.html`, `main.ts`, `App.svelte`, `style.css`;
  - WXT sinh `options_ui.page`. Giữ nhúng trong chrome://extensions như bản cũ (không `open_in_tab`), xem Q5.
- **Không thêm khoá storage.** Dùng lại các item có sẵn trong `src/lib/settings.ts`:
  - `themePref`;
  - `panelPrefsItem` / `updatePanelPrefs` (đã giữ các trường khác của object, 9.02);
  - `screenshotPrefs`.
- **Xoá sửa đã lưu:** thêm `clearAllPersistedEdits()` vào `src/lib/edit/persist-key.ts`, cạnh `listPersistedEdits` / `clearPersistedEdits` (9.15 đã chuẩn bị cho 9.06).
- **Theme trang:**
  - tách `applyTheme(pref, mql)` từ `src/entrypoints/sidepanel/store.svelte.ts:141` sang `src/lib/theme.ts` (hàm `applyDocTheme`);
  - side panel và options cùng dùng; đặt `data-theme` trên `<html>` (thay class force-light/force-dark của bản cũ).
- **Hộp thoại:** dùng lại `src/ui/Dialog.svelte` (kiểu confirm với `buttons`). Không viết dialog mới.
- **Font:** `src/ui/fonts.ts` (9.10 đã xong).
- **Chống nháy:** mô hình `main.ts` của side panel. Body ẩn tới khi nạp xong giá trị storage, font và theme (9.08).

**Mốc:**

| Mốc | Task | Nội dung |
| --- | --- | --- |
| M1 — Nền | 1–3 | Logic thuần, chuỗi, khung trang + theme |
| M2 — Các mục | 4–6 | Màu / chụp, xoá sửa đã lưu, đồng bộ storage |
| M3 — Nối | 7–8 | Mở trang từ extension, kiểm kê + thử tay |

**Tech Stack:** giữ nguyên Đợt 1–6. Không thêm dependency, không thêm quyền.

**Spec:** §4.3 (xoá sửa trong trang cài đặt), §4.8, §5 (chốt 4–7), §8 Đợt 7, §9.

**Kiểm kê:**

- các dòng `· đợt 7 ·`: 1.13, 9.01–9.09, 9.42, 9.43;
- dòng liên quan đã xong và được dùng lại: 1.26, 9.10, 9.11, 9.15.

---

## Phạm vi — đổi so với bản cũ

| Dòng | Bản cũ | Bản mới |
| --- | --- | --- |
| 9.01 | class `force-light` / `force-dark` trên `<html>` | `data-theme` như side panel; giá trị và mặc định `system` giữ nguyên |
| 9.03, 9.42 | Toggle `includePadding` (đọc nhưng không có tác dụng, xem `settings.ts:71`) | Xem Q2 |
| 9.04, 9.42, 9.43 | Toggle `includeHighlights` | Bỏ: chụp phần tử chỉ chụp phần tử (chốt của chủ dự án, ghi ở 9.42). Không xoá khoá cũ trong storage |
| 9.05 | Hàng MCP: connect/disconnect, cảnh báo phiên bản | Chuyển sang đợt 8 (Q3) |
| 9.06 | Xoá `persistedRuleEdits:*` (chỉ sửa rule) | Cùng khoá, nay gồm cả sửa inline style. Chuỗi giữ nguyên văn |
| 9.08 | `data-i18n` / `data-i18n-html` | `i18n.t()` trong Svelte; không dùng `{@html}` (Q4) |
| 9.09 | Dialog chung alert/confirm/prompt/size | Chỉ cần confirm; dùng `src/ui/Dialog.svelte` có sẵn (size đã có từ 9.45) |
| 1.13 | `open_options_page` + menu `enter_license` | Giữ `open_options_page`; `enter_license` đã bỏ (§4.8) |
| — | Không có cài đặt ngôn ngữ, phím tắt, chế độ sửa | Không thêm. Ngôn ngữ theo Chrome (en/vi); phím chữ I X G R B V M C F O A S P cố định; không còn chế độ sửa nên không có mục nào về nó |

## Global Constraints

- **Giữ mọi ràng buộc Đợt 0–6:**
  - phiên bản ghim; không thêm dependency;
  - manifest không có `host_permissions` / `content_scripts` (hook `build:manifestGenerated` kiểm); không thêm quyền;
  - chỉ `en` / `vi`; không sửa `unpacked/`, `legacy-src/`;
  - commit kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Không chạm** `src/ui/DockButton.svelte`, `src/ui/Toast.svelte`, `src/ui/ToolPanel.svelte` (có sửa chưa commit của chủ dự án). Không `git add -A`; chỉ add file của task.
- **Chuỗi:**
  - nhóm `options.*` và `theme.*` trong `src/locales/{en,vi}.json`;
  - chép nguyên văn từ `unpacked/_locales/{en,vi}/messages.json`, đúng các khoá `OPTIONS_*`, `THEME_*`;
  - dùng lại `dialog.cancel` / `dialog.confirm` có sẵn;
  - nhãn `HEX/HEXA`… để nguyên văn trong markup như bản cũ.
- **Storage:**
  - chỉ ghi qua item của `settings.ts`;
  - ghi `colorFormat` bằng `updatePanelPrefs` (giữ `sectionVisibility`, `codeViewMode`…);
  - ghi `screenshotPreferences` thì trộn với giá trị đang có.
- **Lệnh:** `corepack pnpm`.
- **Kiểm mỗi task:** test của file → `corepack pnpm typecheck`, `lint`, `prettier --check .`, `vitest run`, `build` PASS → commit.
- **Test:** `fakeBrowser` cho storage. Component test (happy-dom) mount `App.svelte` như `sidepanel/app.test.ts`.

## Review Focus

1. **Không ghi đè dữ liệu:** đổi định dạng màu không làm mất `sectionVisibility`; xoá sửa chỉ xoá khoá có tiền tố `persistedRuleEdits:`.
2. **Đồng bộ hai chiều:**
   - đổi ở trang cài đặt → side panel và content đang mở áp ngay (theme, colorFormat đã có watch ở `session.ts:75–86` và `store.svelte.ts:270`);
   - đổi ở side panel → trang cài đặt cập nhật.
3. **Không nháy theme** khi mở trang.
4. **Không quyền mới, không link ngoài** (§4.8 bỏ `www.iodob.com/*`).

---

### Task 1: Logic thuần — xoá sửa đã lưu, trộn screenshotPreferences, theme tài liệu

**Files:** `src/lib/edit/persist-key.ts`, `src/lib/settings.ts`, `src/lib/theme.ts` (+ test)

- [ ] `clearAllPersistedEdits(): Promise<number>`:
  - lấy `storage.local.get(null)`, chọn mọi khoá bắt đầu bằng `PERSIST_PREFIX`. Không lọc `isPersistedEdits`, để dọn cả bản hỏng, như legacy options.js:2879;
  - gọi `remove(keys)` một lần, trả số khoá đã xoá.
- [ ] Test:
  - khoá khác tiền tố còn nguyên;
  - có cả mục `inline`;
  - storage rỗng → 0.
- [ ] `updateScreenshotPrefs(patch)`: trộn với giá trị đang có (null → `{}`). Chỉ cần nếu Q2 giữ hàng chụp.
- [ ] `applyDocTheme(doc, pref, mql)` trong `src/lib/theme.ts` (chuyển từ `store.svelte.ts:141`). Side panel gọi hàm mới; hành vi không đổi.
- [ ] Commit: `feat(settings): clear all saved edits and shared document theme helper`

### Task 2: Chuỗi

**Files:** `src/locales/en.json`, `src/locales/vi.json`, `src/locales/locales.test.ts`

- [ ] Thêm `theme.{system,light,dark}` và `options.*`:
  - `pageTitle`;
  - `sectionAppearance`, `sectionExtension`, `sectionScreenshots`;
  - `rowTheme`, `rowColorFormat`, `colorFormatSecondary`;
  - `savedEditsTitle` / `Secondary` / `Clear` / `ConfirmTitle` / `ConfirmBody`;
  - hàng chụp theo Q2;
  - khoá MCP để đợt 8.
- [ ] Nguyên văn en/vi. Kiểm `__MSG_` cho `<title>` (Q6).
- [ ] Test: vi có đủ khoá của en (test có sẵn).
- [ ] Commit: `feat(i18n): options page strings`

### Task 3: Khung trang + theme

**Files:** `src/entrypoints/options/{index.html,main.ts,App.svelte,style.css}`

- [ ] `index.html` có `<meta name="manifest.open_in_tab" content="false">` (Q5). Kiểm manifest build có `options_ui.page`.
- [ ] `main.ts`:
  - nạp font;
  - đọc `themePref` trước khi mount;
  - `applyDocTheme`;
  - nghe `matchMedia('(prefers-color-scheme: dark)')`;
  - body hiện khi xong (9.08).
- [ ] Mục Giao diện:
  - select theme, ghi `themePref`;
  - Tailwind + token trong `src/ui/theme.css`, kiểu kính mờ §7, khổ hẹp hợp với trang nhúng.
- [ ] Test `App.svelte`: đổi select → storage `theme`; giá trị ban đầu từ storage.
- [ ] Commit: `feat(options): options page shell with theme setting`

### Task 4: Định dạng màu và mục chụp

- [ ] Select HEX/RGB/HSL/HSB → `updatePanelPrefs({ colorFormat })` (9.02).
- [ ] Hàng chụp theo Q2. Nếu giữ padding:
  - nối `includePadding` vào trình xuất ảnh, đọc lúc chụp (9.43);
  - không sửa `ToolPanel.svelte`.
- [ ] Test:
  - `sectionVisibility` còn nguyên sau khi đổi màu;
  - toggle ghi đúng trường.
- [ ] Commit: `feat(options): color format and screenshot settings`

### Task 5: Xoá chỉnh sửa đã lưu

- [ ] Hàng `savedEditsTitle` + nút `savedEditsClear`:
  - confirm bằng `Dialog.svelte` (`buttons: {cancel, confirm}`);
  - OK → `clearAllPersistedEdits()`.
- [ ] Tab đang bật extension vẫn giữ sửa trong bộ nhớ và sẽ lưu lại khi sửa tiếp. Giữ như bản cũ (Q7).
- [ ] Test: huỷ không xoá; OK xoá đúng khoá.
- [ ] Commit: `feat(options): clear saved edits`

### Task 6: Đồng bộ khi storage đổi nơi khác (9.07)

- [ ] `themePref.watch`, `panelPrefsItem.watch`, `screenshotPrefs.watch` cập nhật state của trang. Gỡ watcher khi unmount.
- [ ] Test: ghi storage từ ngoài → select / toggle đổi theo.
- [ ] Commit: `feat(options): follow storage changes`

### Task 7: Mở trang cài đặt (1.13)

- [ ] `BackgroundApi.open_options_page` → `browser.runtime.openOptionsPage()` trong `src/entrypoints/background.ts`.
- [ ] Nút mở theo Q1. Test router background bằng `fakeBrowser`.
- [ ] Commit: `feat(options): open options page from the extension`

### Task 8: Kiểm kê và thử tay trên Edge

- [ ] Đánh dấu `[x]` cho 1.13, 9.01–9.03, 9.06–9.09, 9.42, 9.43; ghi chú bỏ/đổi cho 9.04, 9.05 (→ đợt 8) theo bảng Phạm vi.
- [ ] Thử tay:
  - mở từ chrome://extensions và từ nút Q1;
  - đổi theme khi side panel + trang đang bật → áp ngay;
  - đổi màu ở side panel → trang cài đặt đổi;
  - xoá sửa đã lưu → reload site không còn toast khôi phục; cả sửa inline cũng hết;
  - vi/en;
  - không nháy theme.
- [ ] Commit: `docs(inventory): dot 7 options page`

## Xong khi

- Mọi dòng đợt 7 là `[x]` hoặc đã ghi chú bỏ / đổi / chuyển đợt 8.
- Kiểm tra và build PASS; manifest có `options_ui`, không thêm quyền, không thêm dependency.
- Checklist Task 8 qua trên Edge.

## Quyết định cần chốt

- **Q1 — Chỗ mở trang cài đặt.**
  - a) Icon bánh răng ở `TabBar` của side panel;
  - b) Mục menu chuột phải của icon (`contexts: ['action']`);
  - c) Chỉ chrome://extensions.
  - **Đề xuất:** a + b. Không thêm nút dock (dock 5 nhóm đã chốt).
- **Q2 — Mục chụp.** `includePadding` bản cũ không có tác dụng; `includeHighlights` đã bỏ.
  - a) Bỏ cả mục Screenshots;
  - b) Giữ toggle padding và làm cho có tác dụng (nền đệm khi xuất ảnh);
  - c) Giữ toggle padding như bản cũ (không tác dụng).
  - **Đề xuất:** a. Nếu muốn nền đệm thì làm b trong một task riêng.
- **Q3 — MCP.**
  - a) Ẩn hẳn tới đợt 8;
  - b) Hiện hàng bị vô hiệu "sắp có".
  - **Đề xuất:** a.
- **Q4 — Link "Setup guide" trong `OPTIONS_MCP_SERVER_SECONDARY`** (trỏ `www.iodob.com`, §4.8 bỏ).
  - a) Bỏ phần `<a>`, chỉ giữ câu đầu;
  - b) Giữ nguyên văn.
  - **Đề xuất:** a, ở đợt 8.
- **Q5 — Mở nhúng hay tab riêng.**
  - a) Nhúng như cũ;
  - b) `open_in_tab: true`.
  - **Đề xuất:** a.
- **Q6 — Tiêu đề trang.**
  - a) `<title>` đặt bằng `i18n.t('options.pageTitle')` trong `main.ts`;
  - b) `__MSG_` (cần khoá phẳng kiểu `extName`).
  - **Đề xuất:** a.
- **Q7 — Xoá sửa khi tab đang bật extension.**
  - a) Như cũ: chỉ xoá storage;
  - b) Báo các tab đang chạy xoá luôn sửa trong bộ nhớ.
  - **Đề xuất:** a.
- **Q8 — Hiện số site đang có sửa đã lưu cạnh nút Clear.**
  - a) Không (như cũ);
  - b) Có, dùng `listPersistedEdits` (cần chuỗi mới không có trong bản cũ).
  - **Đề xuất:** a.

## Quyết định đã chốt (2026-11-06)

Chủ dự án chọn theo đề xuất: Q1 a + b; Q2 a (bỏ mục Screenshots); Q3 a; Q4 a (đợt 8); Q5 a; Q6 a; Q7 a; Q8 a.
