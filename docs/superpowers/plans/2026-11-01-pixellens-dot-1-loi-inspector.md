# PixelLens — Đợt 1: Lõi + Inspector — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bản mới bật/tắt được trên tab, có dock thật, và dùng được inspector: rê chuột thấy khung + số đo kiểu C, click chọn, chọn cha/con/anh/em, đo khoảng cách, panel inspector, ghim bằng Space.

**Architecture:**
- **Background** inject content script theo lệnh và giữ trạng thái icon từng tab.
- **Content** chạy một *phiên* (session):
  - gắn một shadow host bằng helper dùng chung;
  - mọi listener gắn qua một `AbortController`, nên tắt là gỡ sạch.
- **Registry** là nguồn sự thật duy nhất cho dock và phím tắt.
- **Lớp overlay** gom vẽ theo `requestAnimationFrame`; inspector và đo khoảng cách đăng ký hàm vẽ vào đó.
- **Phân chia code:**
  - logic thuần ở `src/lib/`, có unit test;
  - đường chạy liên tục viết TS thuần;
  - Svelte chỉ dùng cho dock và panel.

**Tech Stack:**
- Giữ nguyên stack Đợt 0: WXT 0.21.5, Svelte 5, Tailwind 4, Lucide, `@wxt-dev/i18n`, Vitest.
- Thêm `happy-dom` 21.0.3 làm môi trường DOM cho test.
- Dùng `storage` của WXT (`@wxt-dev/storage`, đã có sẵn qua `wxt`) và `fakeBrowser`/`WxtVitest` từ `wxt/testing`.

**Spec:** `docs/superpowers/specs/2026-11-01-pixellens-rewrite-design.md`. Các mục liên quan:
- §3 Ràng buộc
- §6.3 DRY
- §6.4 Đường chạy liên tục
- §7 Giao diện mới
- §8 Đợt 1
- §9 Checklist "Inspector / chọn" và "Giao diện trong trang"

**Checklist hành vi:** các dòng `đợt 1` trong `docs/inventory.md`. Code cũ cần port nằm ở vị trí `legacy-src/<file>:<dòng>` ghi trên từng dòng. **Tái dùng logic cũ** (spec §5.1): đọc hàm cũ trước khi viết, chỉ đổi khi có cách tốt hơn.

## Phạm vi — dòng `đợt 1` được dời đi

Bản kiểm kê gắn `đợt 1` cho một số dòng phụ thuộc phần chưa có. Task 9 đổi nhãn những dòng này (hoặc phần của dòng) sang đợt đúng:

| Dòng | Phần dời | Sang |
| --- | --- | --- |
| 1.02 | Thứ tự inject nhiều file: bản mới là một bundle, dòng này đánh `[x]` với ghi chú "thay bằng bundle" | — |
| 1.13 | Mở trang cài đặt | 7 |
| 1.14, 1.10, 1.12 | `go_to_tab`, `get_tab_id`, `open_external_tab` (chưa có nơi gọi) | 4 |
| 1.15, 1.32–1.34 | Nhánh responsive (iframe, gộp tìm kiếm, chuyển tiếp cài đặt) | 6 |
| 1.20, 1.35 | Công tắc chế độ Inspect/Edit | 5 |
| 1.28 | `--ui-scale` cho iframe responsive | 6 |
| 1.31 | Popover dock (chưa có popover nào) | 2 |
| 2.08, 1.01, 1.09 | Phần gửi `clear` / side panel / cửa sổ panel rời | 4 |
| 2.10 | Đổi định dạng màu theo `colorFormat` (Đợt 1 chỉ HEX) | 4 |
| 9.09 | Hộp thoại của trang cài đặt | 7 |
| 9.24 | Hộp thoại trong trang (chưa công cụ nào dùng) | 2 |
| 9.13, 9.22 | `sidePanelPreferences`, `screenshotPreferences`, `mcpIntent`, sửa chờ | 3/4/5/8 theo chủ đề |
| 9.14 | `sidePanelPreferences` | 4 |
| 9.16 | `mcpIntent` → 8; `detachedPanelBounds`, `detachedPanels`, `panelHandoff` → 4 | 4/8 |
| 9.19 | Từng mục web_accessible_resources → đợt dùng nó | 2–4 |
| 9.21 | `side_panel_loaded`, `refresh_page_data`, `page_weight_*` → 4; `save_screenshot` → 3; `*_iframe*` → 6 | 3/4/6 |

## Global Constraints

- **Giữ mọi ràng buộc của Đợt 0:**
  - phiên bản ghim chính xác;
  - manifest không có `host_permissions` / `content_scripts`;
  - chỉ `en` và `vi`;
  - không sửa `unpacked/` và `legacy-src/`;
  - commit kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`;
  - mọi lệnh chạy ở gốc repo bằng Git Bash.
- **Dependency mới duy nhất:** `happy-dom@21.0.3` (`pnpm add -D -E`). Không thêm thư viện messaging, store hay drag.
- **Chuỗi giao diện:**
  - chỉ qua `i18n.t()`, khoá lồng nhau trong `src/locales/{en,vi}.json`, không chuỗi cứng trong component;
  - chuỗi đã có ở `unpacked/_locales/{en,vi}/messages.json` thì chép nguyên văn;
  - chuỗi mới cho trong task.
- **Đơn vị trong trang:** chỉ `px` (Tailwind đã qua `shadowDomCss`). Không đăng ký `@property` lên trang.
- **Token giao diện (spec §7), khai báo một lần trong `src/ui/theme.css` bằng `@theme`:**
  - nền bề mặt `rgba(24,24,27,.9)`, blur 8px;
  - viền trắng 8–14%;
  - bo góc panel 12–14px, nút 8–9px;
  - chữ zinc-200/400, màu nhấn indigo `#6366f1`;
  - bản sáng: nền trắng, viền zinc-200.
  - Không viết khối CSS tay theo màn hình.
- **Số đo kiểu C (spec §7):**
  - font mono ~10px đậm, không nền;
  - rộng: giữa, phía trên cạnh trên; cao: trong cạnh phải, giữa theo chiều dọc;
  - viền phần tử nét liền 1.5px + nền nhấn ~7%;
  - không gióng nét đứt;
  - màu số đo: trang sáng `#4f46e5`, trang tối `#a5b4fc`.
- **Font:**
  - family `PixelLens Geist` / `PixelLens Geist Mono` (tên riêng, tránh trùng font của trang);
  - nhúng woff2 dạng data URL qua `?inline`, không cần `web_accessible_resources`;
  - unicode-range theo `legacy-src/content.js:11134` (`Hc`).
- **DRY (spec §6.3):**
  - dock và phím số đọc từ registry;
  - một kênh message có kiểu;
  - một lớp settings;
  - một helper gắn UI Svelte vào shadow root;
  - một lớp overlay.
- **Đường chạy liên tục** (hover, cuộn, kéo, vẽ overlay) viết TS thuần, thao tác DOM trực tiếp, gom theo rAF.
- **`pnpm check` và `pnpm build`** phải qua ở cuối mỗi task.

## Review Focus

1. **Đang gõ trong ô nhập của trang** (`input`/`textarea`/`select`/`contentEditable`, kể cả ô trong shadow DOM của trang).
   - Mong đợi: phím số, Space, Esc không kích hoạt công cụ. Riêng Ctrl+Q vẫn thoát.
   - Kiểm bằng: `keys.test.ts` (Task 5).
2. **Sự kiện trong dock / panel của extension** (click nút, rê chuột trên dock, gõ trong ô của panel).
   - Mong đợi: không chọn, không highlight phần tử trang. Phím gõ trong UI không lọt ra trang.
   - Kiểm bằng: `isOwnEvent` trong `events.test.ts` (Task 6); `isolateEvents: true` (Task 3).
3. **Phần tử đang chọn bị gỡ khỏi DOM hoặc thành `display:none`.**
   - Mong đợi: tự bỏ chọn ở lần cập nhật kế tiếp, không vẽ khung ở toạ độ 0,0.
   - Kiểm bằng: `isRendered` trong `dom.test.ts` (Task 6).
4. **Bật/tắt liên tục, hoặc reload trang khi đang bật.**
   - Mong đợi: luôn chỉ một `<pixellens-ui>`; tắt thì không còn listener nào; icon về trạng thái tắt sau khi trang tải lại.
   - Kiểm bằng: `session.test.ts` (Task 3); `tabs.onUpdated` trong `background.test.ts` (Task 2).
5. **Trang nền tối, hoặc trang đặt `html { font-size: 10px }`.**
   - Mong đợi: số đo đổi sang `#a5b4fc` trên nền tối; theme "Hệ thống" của UI ngược với nền; kích thước UI không co.
   - Kiểm bằng: `theme.test.ts` (Task 4); thử tay (Task 9).

---

### Task 1: Hạ tầng test, kênh message có kiểu, settings

**Files:**

- Create:
  - `vitest.config.ts`
  - `src/lib/messaging.ts`, `src/lib/messaging.test.ts`
  - `src/lib/settings.ts`, `src/lib/settings.test.ts`
- Modify: `package.json` (thêm `happy-dom`)

**Interfaces:**

- Produces:
  - Test chạy với `WxtVitest()` (alias `#imports`, `fakeBrowser`), `environment: 'happy-dom'`.
  - `src/lib/messaging.ts`:
    - `interface BackgroundApi { close_extension(): void; request_clipboard_permission(): boolean }`
    - `interface ContentApi { ping(): { active: boolean }; toggle_script(): { active: boolean }; select_parent(): void; select_child(): void }`
    - `sendToBackground<K extends keyof BackgroundApi>(type: K, ...data: Parameters<BackgroundApi[K]>): Promise<ReturnType<BackgroundApi[K]>>`
    - `sendToTab<K extends keyof ContentApi>(tabId: number, type: K, ...data: Parameters<ContentApi[K]>): Promise<ReturnType<ContentApi[K]>>`
    - `handleMessages<T extends 'background' | 'content'>(target: T, handlers: Partial<T extends 'background' ? BackgroundApi : ContentApi>, signal?: AbortSignal): void`
    - Dạng gói tin: `{ target, type, data }`. Handler có thể trả Promise. Kiểu `type` lạ thì không trả lời, giống `return false` của bản cũ (9.17).
    - Các đợt sau chỉ thêm method vào hai interface.
  - `src/lib/settings.ts`:
    - `interface Settings { inspectIsOn: boolean }` (các đợt sau thêm trường)
    - `DEFAULT_SETTINGS: Settings = { inspectIsOn: false }`
    - `getSettings(): Promise<Settings>`: trộn mặc định với bản lưu.
    - `updateSettings(patch: Partial<Settings>): Promise<void>`: chỉ ghi khoá đổi, trộn với bản lưu (1.26).
    - `themePref` = `storage.defineItem<'system' | 'light' | 'dark'>('local:theme', { fallback: 'system' })`
    - `pinHintDone` = `storage.defineItem<boolean>('local:inspectorPinHintDone', { fallback: false })`
  - Khoá storage giữ đúng tên bản cũ: `settings`, `theme`, `inspectorPinHintDone` (9.11–9.13).

- [ ] **Step 1: Cài và cấu hình.**
  - `pnpm add -D -E happy-dom@21.0.3`
  - `vitest.config.ts`: `defineConfig({ plugins: [WxtVitest()], test: { environment: 'happy-dom' } })`.
  - Chạy `pnpm test`. Expected: 11 test cũ vẫn qua.
- [ ] **Step 2: Viết test fail.**
  - `messaging.test.ts`, dùng `fakeBrowser` (gọi `fakeBrowser.reset()` trong `beforeEach`):
    - `sendToBackground('request_clipboard_permission')` trả giá trị handler async trả về;
    - handler `target: 'content'` không nhận gói tin `target: 'background'`;
    - abort `signal` thì handler bị gỡ.
  - `settings.test.ts`:
    - storage rỗng thì `getSettings()` bằng `DEFAULT_SETTINGS`;
    - bản lưu `{ inspectIsOn: true, khoáLạ: 1 }` thì giữ cả hai;
    - `updateSettings({ inspectIsOn: true })` không xoá khoá khác đang lưu;
    - `themePref.getValue()` mặc định `'system'`.
  - Run: `pnpm vitest run src/lib`. Expected: FAIL (module chưa có).
- [ ] **Step 3: Viết `messaging.ts` và `settings.ts`** theo Interfaces. Dùng `browser` và `storage` từ `#imports`.
- [ ] **Step 4: Chạy lại.**
  - Run: `pnpm vitest run src/lib`. Expected: PASS.
  - Run: `pnpm check`. Expected: PASS.
- [ ] **Step 5: Commit.** `git add -A && git commit -m "feat: typed messaging, settings store and DOM test env" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 2: Background — bật/tắt theo tab, icon, menu, phím lệnh

**Files:**

- Create:
  - `src/lib/tabs.ts`, `src/lib/tabs.test.ts`
  - `src/entrypoints/background.test.ts`
- Modify:
  - `src/entrypoints/background.ts`
  - `src/locales/{en,vi}.json` (thêm `menu.activate`)

**Interfaces:**

- Consumes: `sendToTab`, `handleMessages` (Task 1).
- Produces:
  - `isInjectable(url: string | undefined): boolean` trong `src/lib/tabs.ts` (1.03).
  - `toggleTab(tabId: number): Promise<void>`, export từ `background.ts` để test:
    1. `sendToTab(tabId, 'toggle_script')`.
    2. Nếu lỗi vì chưa có content script thì `scripting.executeScript({ target: { tabId }, files: ['/content-scripts/content.js'] })`. Content tự bật khi nạp (Task 3).
    3. Đặt icon theo kết quả.
  - Icon: `icon32_active.png` khi bật, `icon32.png` khi tắt, đặt theo `tabId` (1.05). `tabs.onUpdated` với `status === 'loading'` thì đặt lại icon tắt.

- [ ] **Step 1: Viết test fail.**
  - `tabs.test.ts`, bảng giá trị cho `isInjectable`:
    - `true`: `https://a.com`, `http://localhost:5173`, `file:///C:/a.html`;
    - `false`: `chrome://extensions`, `edge://settings`, `chrome-extension://x/y.html`, `https://chromewebstore.google.com/detail/x`, `https://chrome.google.com/webstore/x`, `https://microsoftedge.microsoft.com/addons/x`, `about:blank`, `undefined`.
    - Đối chiếu danh sách với `legacy-src/background.js:5445` (`De`), thêm URL nào bản cũ có.
  - `background.test.ts` (`fakeBrowser`, stub `scripting.executeScript` / `action.setIcon` / `tabs.sendMessage` bằng `vi.spyOn`):
    - tab chưa có content script (sendMessage reject) thì `executeScript` được gọi đúng một lần với `files: ['/content-scripts/content.js']`;
    - content trả `{ active: false }` thì không inject lại, icon tắt;
    - `tabs.onUpdated` loading thì `setIcon` với path `images/icon32.png`.
  - Run: `pnpm vitest run src/lib/tabs.test.ts src/entrypoints/background.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết `background.ts`.**
  - `action.onClicked` và `contextMenus.onClicked` đều gọi `toggleTab` (1.01, 1.07). Tab có `discarded` hoặc URL không inject được thì bỏ qua.
  - `runtime.onInstalled` / `onStartup`: dựng rule `declarativeContent` cho http/https/file/ftp (1.04, 1.06), tạo menu `activate` (tiêu đề `i18n.t('extNameShort')`, contexts theo 1.07). Port từ `legacy-src/background.js:4253`, `:4471`, `:4560`, `:4618`.
  - `commands.onCommand`: `select_parent` / `select_child` gửi `sendToTab` cùng tên (1.08).
  - `handleMessages('background', …)`:
    - `close_extension` (1.09, phần không dính side panel): gửi `toggle_script` rồi cập nhật icon;
    - `request_clipboard_permission` (2.01): port `legacy-src/background.js:3409`.
- [ ] **Step 3: Chạy test.** Expected: PASS. Run `pnpm check && pnpm build`. Expected: PASS.
- [ ] **Step 4: Commit.** `git commit -am "feat: background activation, per-tab icon, context menu and commands" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"` (nhớ `git add` file mới).

### Task 3: Phiên content, helper gắn UI, theme và font

**Files:**

- Create:
  - `src/ui/mount.ts`: helper gắn Svelte vào shadow root
  - `src/ui/theme.css`: `@theme` token, `@font-face` không dùng
  - `src/ui/fonts.ts`: nạp `FontFace` từ data URL
  - `src/ui/fonts/`: chép (4 file woff2 + 2 file OFL từ `unpacked/fonts/`).
  - `src/content/core/state.svelte.ts`
  - `src/content/core/session.ts`, `src/content/core/session.test.ts`
  - `src/lib/theme.ts`, `src/lib/theme.test.ts`
  - `src/ui/Dock.svelte` (khung rỗng; Task 5 điền)
- Modify:
  - `src/entrypoints/content/index.ts`
  - `src/entrypoints/content/style.css` (`@import 'tailwindcss'; @import '../../ui/theme.css';`)
  - `wxt.config.ts` (thêm `use_dynamic_url: true` cho mục `content-scripts/content.css`)
- Delete: `src/entrypoints/content/Smoke.svelte`

**Interfaces:**

- Produces:
  - `mountUi(ctx: ContentScriptContext, component: Component, props?: Record<string, unknown>): Promise<{ host: HTMLElement; shadow: ShadowRoot; remove(): void }>`
    - Bọc `createShadowRootUi` với `name: 'pixellens-ui'`, `position: 'inline'`, `anchor: 'html'`, `isolateEvents: true`.
    - `remove()` gọi `ui.remove()`, nên `onRemove` sẽ `unmount` (sửa carry-over Đợt 0).
  - `state` (`$state`) trong `state.svelte.ts`: `{ active: boolean; paused: boolean; dockCollapsed: boolean; inspectOn: boolean; hovered: Element | null; selected: Element | null; theme: 'light' | 'dark' }`.
  - `src/content/core/session.ts`:
    - `startSession(ctx): Promise<void>`
    - `stopSession(): void`
    - `sessionSignal(): AbortSignal`: mọi listener của content gắn `{ signal: sessionSignal() }`; `stopSession` abort nó.
    - `onStop(fn: () => void): void`: công cụ đăng ký việc dọn (1.30).
  - `src/lib/theme.ts`:
    - `detectPageIsDark(doc: Document): boolean | null`: port `legacy-src/content.js:21133`.
    - `resolveTheme(pref: 'system' | 'light' | 'dark', pageIsDark: boolean | null, prefersDark: boolean): 'light' | 'dark'`: "system" ngược với nền trang; không đọc được nền thì theo `prefersDark` (9.23).
    - `measureColor(pageIsDark: boolean | null): '#4f46e5' | '#a5b4fc'`.
  - `loadFonts(): void` (chỉ chạy một lần): thêm 4 `FontFace` vào `document.fonts`.

- [ ] **Step 1: Viết test fail.**
  - `theme.test.ts`:
    - `resolveTheme('system', true, false) === 'light'`; `resolveTheme('system', false, true) === 'dark'`; `resolveTheme('system', null, true) === 'dark'`; `resolveTheme('dark', false, false) === 'dark'`.
    - `measureColor(true) === '#a5b4fc'`, `measureColor(false) === '#4f46e5'`.
    - `detectPageIsDark` với `body` nền `rgb(10,10,10)` → `true`; nền trắng → `false`; nền trong suốt toàn bộ → `null`.
  - `session.test.ts` (happy-dom, `ContentScriptContext` từ `wxt/utils/content-script-context`, nếu không tạo được thì mock `mountUi`):
    - gọi `startSession` hai lần thì chỉ một `pixellens-ui` trong document;
    - `stopSession()` thì không còn `pixellens-ui`, và listener `keydown` gắn qua `sessionSignal()` không chạy nữa;
    - hàm đăng ký qua `onStop` chạy đúng một lần.
  - Run: `pnpm vitest run src/lib/theme.test.ts src/content`. Expected: FAIL.
- [ ] **Step 2: Viết code.**
  - **`content/index.ts`:**
    - chặn chạy trùng bằng `window.__PIXELLENS__` (9.20);
    - nạp lần đầu thì `startSession`;
    - `handleMessages('content', { ping, toggle_script }, …)`: `toggle_script` bật/tắt phiên, trả `{ active }`.
  - **Theme:**
    - đọc `themePref`, `watch` thay đổi (phần `theme` của 9.22);
    - đặt `data-theme` trên host (1.27).
  - **Token:** `theme.css` khai báo màu, bo góc, blur, font của spec §7. Biến thể sáng qua `:host([data-theme=light])`.
  - **Mockup:** `.superpowers/brainstorm/1648-1793529345/content/visual-style-v2.html` (chỉ đọc).
- [ ] **Step 3: Chạy test và build.** Expected: PASS. `pnpm check && pnpm build` PASS.
  - `grep -c "@font-face" .output/chrome-mv3/content-scripts/content.css` ra `0`.
  - `web_accessible_resources` trong manifest có `use_dynamic_url: true`.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: content session lifecycle, shadow UI helper, theme tokens and fonts" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 4: Lớp overlay và hình học số đo

**Files:**

- Create:
  - `src/content/core/overlay.ts`
  - `src/lib/geometry.ts`, `src/lib/geometry.test.ts`

**Interfaces:**

- Consumes: `mountUi` / host (Task 3), `sessionSignal`, `onStop`.
- Produces:
  - `type Rect = { x: number; y: number; width: number; height: number }`: toạ độ viewport.
  - `src/lib/geometry.ts`:
    - `sizeLabels(r: Rect): { width: { x: number; y: number }; height: { x: number; y: number } }`:
      - nhãn rộng ở `x = r.x + r.width / 2`, `y = r.y - 4` (neo đáy);
      - nhãn cao ở `x = r.x + r.width - 4` (neo phải), `y = r.y + r.height / 2`.
    - `gapLines(a: Rect, b: Rect): Array<{ x1: number; y1: number; x2: number; y2: number; value: number }>`:
      - đo trên/phải/dưới/trái giữa phần tử chọn `a` và phần tử rê `b`;
      - chồng nhau thì đo cạnh–cạnh;
      - port đúng `legacy-src/content.js:45001` (`drawAllMeasurementLines`) và `:45036`.
    - `placeNear(point: { x: number; y: number }, size: { width: number; height: number }, viewport: { width: number; height: number }, avoid: Rect[]): { x: number; y: number }`:
      - đặt panel cạnh chuột, kẹp trong màn hình, tránh các `avoid` (dock);
      - port `legacy-src/content.js:47784`.
  - `src/content/core/overlay.ts`:
    - `addPainter(id: string, paint: (layer: HTMLElement) => void): () => void`
    - `requestPaint(): void`: gom mọi lần gọi trong một frame vào một `requestAnimationFrame`.
    - `layer`: `div` `position: fixed; inset: 0; pointer-events: none` trong shadow root.
    - Mỗi painter có một container con riêng, chỉ painter đó được ghi vào.

- [ ] **Step 1: Viết test fail** (`geometry.test.ts`):
  - `sizeLabels({ x: 10, y: 20, width: 100, height: 50 })` → `width: { x: 60, y: 16 }`, `height: { x: 106, y: 45 }`.
  - Hai hộp cách ngang: `a = {x:0,y:0,width:50,height:50}`, `b = {x:80,y:0,width:50,height:50}` → có một đường ngang `value: 30`.
  - Hộp lồng nhau `a` chứa `b` → 4 đường cạnh–cạnh, giá trị bằng khoảng cách từng cạnh.
  - `placeNear` sát mép phải màn hình thì panel lật sang trái con trỏ, và không đè lên rect `avoid`.
  - Đối chiếu kết quả với bản cũ ở cùng đầu vào. Nếu bản cũ cho số khác, dùng số của bản cũ và ghi lý do trong report.
  - Run: `pnpm vitest run src/lib/geometry.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết `geometry.ts` và `overlay.ts`.** Test cho `requestPaint`: gọi 3 lần trong một tick, paint chạy 1 lần (dùng `vi.useFakeTimers()` hoặc stub `requestAnimationFrame`).
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: rAF overlay layer and measurement geometry" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 5: Registry, dock và phím tắt

**Files:**

- Create:
  - `src/content/core/registry.ts`
  - `src/content/core/keys.ts`, `src/content/core/keys.test.ts`
  - `src/ui/DockButton.svelte`
- Modify:
  - `src/ui/Dock.svelte`, `src/content/core/session.ts`
  - `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `state`, `sessionSignal`, `onStop`, `sendToBackground` (Task 1, 3).
- Produces:
  - `src/content/core/registry.ts`:
    - `type DockGroup = 'selections' | 'inspectTools' | 'utilities' | 'quit'`. Thứ tự hiển thị theo 1.16; các đợt sau thêm nhóm.
    - `interface DockItem { id: string; icon: Component; label: MessageKey; key?: string; group: DockGroup; run(): void; isActive?(): boolean; isDisabled?(): boolean }`
    - `registerItem(item: DockItem): void` và `items` (`$state` mảng).
    - Dock render từ `items`. Tooltip = `label`, kèm `(key)` nếu có; tooltip kẹp cách mép 8px (1.16, port `attachTooltipClamp` `:35658`).
  - Mục đăng ký trong task này:
    - `pause` (1.17): tạm dừng thì ẩn overlay và khoá mọi nút trừ `pause` / `quit`;
    - `quit` (1.18): `sendToBackground('close_extension')`;
    - `minimize` (1.19): `state.dockCollapsed`.
  - `src/content/core/keys.ts`:
    - `shouldIgnoreKey(e: KeyboardEvent, s: { paused: boolean }): boolean`. Trả `true` khi:
      - tiêu điểm thật (`composedPath()[0]`) là `INPUT` / `TEXTAREA` / `SELECT` / `isContentEditable`;
      - hoặc `s.paused`.
      - Port `legacy-src/content.js:47311` (1.21).
    - `isQuitKey(e): boolean`: Ctrl+Q, không meta/shift/alt; luôn thoát, kể cả khi pause.
    - `routeKey(e): void` theo thứ tự:
      1. Quit.
      2. Bỏ qua nếu `shouldIgnoreKey`.
      3. Esc (1.23): có phần tử chọn thì bỏ chọn và `preventDefault`.
      4. Phím khớp `item.key` (không ctrl/meta/alt) thì `item.run()` (1.22).
      5. Space và Alt+Shift+←/→ thì gọi hook do Task 6 / 8 đăng ký qua `onKey(key: string, fn: (e: KeyboardEvent) => boolean)`. Hook trả `true` nghĩa là đã xử lý.
    - Listener `keydown` trên `window`, không capture, gắn `{ signal }`.
  - Nhãn `W × H` khi resize: hiện 800ms, tắt transition của dock 150ms (1.29).
- Khoá i18n mới:

| Khoá | en | vi |
| --- | --- | --- |
| `dock.pause` | Pause | Tạm dừng |
| `dock.resume` | Resume | Tiếp tục |
| `dock.quit` | Quit | Thoát |
| `dock.hide` | Hide Dock | Ẩn dock |
| `dock.show` | Show Dock | Hiện dock |

- [ ] **Step 1: Viết test fail** (`keys.test.ts`, happy-dom):
  - `keydown` `'1'` với tiêu điểm trong `<input>` → `shouldIgnoreKey === true`.
  - Tiêu điểm trong `<div contenteditable>` → `true`.
  - Tiêu điểm trong `<input>` nằm trong shadow root của một custom element của trang → `true`. Event dispatch từ input, `composed: true`.
  - `paused: true` + phím `'1'` → `true`; `paused: true` + Ctrl+Q → `isQuitKey === true`.
  - `routeKey` phím `'1'` gọi `run` của item có `key: '1'`; Ctrl+1 không gọi.
  - Run: `pnpm vitest run src/content/core/keys.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết `registry.ts`, `keys.ts`, `Dock.svelte`, `DockButton.svelte`.**
  - Icon Lucide: `Pause`/`Play`, `X`, `PanelBottomClose`/`PanelBottomOpen`.
  - Dock đặt và trông theo mockup §7.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: tool registry, dock and keyboard routing" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 6: Hover, chọn, cha/con/anh/em, đo khoảng cách

**Files:**

- Create:
  - `src/lib/dom.ts`, `src/lib/dom.test.ts`
  - `src/content/core/events.ts`, `src/content/core/events.test.ts`
  - `src/content/tools/inspector/index.ts`: đăng ký mục dock, hover/click, painter khung + số đo kiểu C
  - `src/content/tools/distance/index.ts`: painter đường đo
- Modify:
  - `src/entrypoints/content/index.ts` (nối `select_parent` / `select_child` vào handler)
  - `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `addPainter`, `requestPaint`, `gapLines`, `sizeLabels`, `measureColor`, `registerItem`, `onKey`, `state`, `updateSettings`.
- Produces:
  - `src/lib/dom.ts`:
    - `SKIP_TAGS = ['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT', 'TEMPLATE']`
    - `isRendered(el: Element): boolean`: còn trong document và có hộp khác 0 (port `:44391`).
    - `parentOf(el: Element): Element | null`: dừng ở `body` (trả `null` nếu cha là `body`/`html`).
    - `firstChildOf(el: Element, isOwn: (n: Element) => boolean): Element | null`: con thật đầu tiên, bỏ `SKIP_TAGS` và node của extension (port `bdFirstRealChild`).
    - `siblingOf(el: Element, dir: -1 | 1, isOwn: (n: Element) => boolean): Element | null`: bỏ `SKIP_TAGS` và node của extension (2.05).
  - `src/content/core/events.ts`:
    - `isOwnEvent(e: Event, host: Element): boolean`: `composedPath()` có `host`.
    - `pageElementAt(x: number, y: number, host: Element): Element | null`: `document.elementsFromPoint`, bỏ `host`, `html` và `body`.
  - `inspector` (registry):
    - mục `inspect`, `key: '1'`, icon `SquareDashedMousePointer`, label `dock.inspect`;
    - lưu `inspectIsOn` qua `updateSettings`;
    - lúc khởi động bật lại theo settings (2.02, 1.26).
  - `selectParent()` / `selectChild()`: ngăn xếp phần tử cũ để "con" quay lại đúng nhánh (2.03, 2.04).
  - Nút dock `select_parent` / `select_child`:
    - icon `ArrowUpToLine` / `ArrowDownToLine`;
    - label `dock.selectParent` / `dock.selectChild`;
    - khoá khi không đi tiếp được.
  - Hook Alt+Shift+←/→ qua `onKey`: chỉ khi có phần tử chọn và không ctrl/meta (2.05).
- Hành vi port:
  - **hover** (2.06):
    - chỉ khi inspector bật, không pause;
    - listener `mousemove` capture;
    - bỏ qua `isOwnEvent`;
    - không highlight `body` / `html`;
    - khung + margin/padding + tag `tag#id.class` + số đo kiểu C.
  - **click** (2.07):
    - listener `click` capture;
    - khi inspector bật thì `preventDefault` + `stopPropagation`;
    - click lại cùng phần tử thì bỏ chọn;
    - 4 đường gióng của phần tử chọn là nét liền (spec §7 cấm nét đứt).
  - **cuộn** (2.09): `scroll` capture thì `requestPaint`; inspector tắt thì không hover lại.
  - **blur / mouseleave** (2.09): xoá hover.
  - **phần tử chọn hết render** (2.15): `isRendered` sai ở lần vẽ kế thì bỏ chọn.
  - **phím khác ↑/↓** (1.24): cập nhật như cuộn.
  - **đo khoảng cách** (3.01): đang có phần tử chọn và rê phần tử khác thì vẽ `gapLines`. Số dùng cùng kiểu chữ C, màu `measureColor`.
- Khoá i18n mới:

| Khoá | en | vi |
| --- | --- | --- |
| `dock.inspect` | Inspector | Trình kiểm tra |
| `dock.selectParent` | Select Parent | Chọn Phần tử Cha |
| `dock.selectChild` | Select Child | Chọn Phần tử Con |

- [ ] **Step 1: Viết test fail.**
  - `dom.test.ts`:
    - `<div><script></script><style></style><p id=a></p></div>`: `firstChildOf(div)` là `#a`.
    - Anh/em: `<p id=a></p><template></template><pixellens-ui></pixellens-ui><p id=b></p>`, với `isOwn = n => n.tagName === 'PIXELLENS-UI'`: `siblingOf(a, 1)` là `#b`, `siblingOf(b, -1)` là `#a`.
    - `parentOf(con trực tiếp của body)` là `null`.
    - `isRendered` sau `el.remove()` là `false`; với `display:none` (stub `getBoundingClientRect` trả 0×0 nếu happy-dom không tính layout) cũng là `false`.
  - `events.test.ts`:
    - event dispatch từ nút trong shadow root của host (`composed: true`) → `isOwnEvent === true`;
    - event từ phần tử trang → `false`.
  - Run: `pnpm vitest run src/lib/dom.test.ts src/content/core/events.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code** theo Interfaces và hành vi port. Mọi listener gắn `{ signal: sessionSignal(), capture: … }`.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: hover, selection traversal and distance measuring" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 7: Panel inspector — nội dung, Copy CSS, tương phản, ảnh

**Files:**

- Create:
  - `src/lib/color.ts`, `src/lib/color.test.ts`
  - `src/lib/css/inspect.ts`, `src/lib/css/inspect.test.ts`
  - `src/lib/clipboard.ts`
  - `src/content/tools/inspector/InspectPanel.svelte`
- Modify:
  - `src/content/tools/inspector/index.ts`
  - `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `state.hovered` / `state.selected`, `placeNear`, `sendToBackground('request_clipboard_permission')`.
- Produces:
  - `src/lib/color.ts`:
    - `parseColor(css: string): { r: number; g: number; b: number; a: number } | null`
    - `toHex(c): string`: `#rrggbb`, hoặc `#rrggbbaa` khi `a < 1`.
    - `contrastRatio(fg, bg): number`
    - `wcagLevel(ratio: number, largeText: boolean): 'AAA' | 'AA' | 'fail'`
  - `src/lib/css/inspect.ts`:
    - `type InspectGroup = { label: 'inspect.layout' | 'inspect.appearance' | 'inspect.text'; rows: Array<[prop: string, value: string]> }`
    - `inspectGroups(style: Pick<CSSStyleDeclaration, 'getPropertyValue'>, renderedFont: string): InspectGroup[]`:
      - các thuộc tính đúng như 2.10;
      - bỏ giá trị mặc định;
      - line-height ra tỉ lệ;
      - màu ra HEX;
      - port `legacy-src/content.js:42881`.
    - `elementSelector(el: Element): string`: port `:42775`.
    - `cssSnippet(el: Element, style): string`: port `:42791` (2.11).
  - `copyText(text: string): Promise<boolean>`, theo thứ tự:
    1. `navigator.clipboard.writeText`;
    2. lỗi thì `request_clipboard_permission` rồi thử lại;
    3. cuối cùng `document.execCommand('copy')` qua textarea tạm.
  - `InspectPanel.svelte`: hiện các nhóm, mục "Accessibility" (tương phản chữ/nền + mức WCAG) và "Image" (2.12). Nút Copy CSS đổi chữ thành "Copied!" trong 1200ms.
  - Vị trí panel do TS đặt (`placeNear`, tránh rect của dock), cập nhật trong painter.
  - Panel nhận `pointer-events` để Task 8 ghim.
- Khoá i18n mới:

| Khoá | en | vi |
| --- | --- | --- |
| `inspect.layout` | Box Model | Box Model |
| `inspect.appearance` | Appearance | Giao diện |
| `inspect.text` | Text | Văn bản |
| `inspect.accessibility` | Accessibility | Trợ năng |
| `inspect.image` | Image | Hình ảnh |
| `inspect.copyCss` | Copy CSS | Copy CSS |
| `inspect.copied` | Copied! | Đã copy! |

- [ ] **Step 1: Viết test fail.**
  - `color.test.ts`:
    - `parseColor('rgb(255, 0, 0)')` → `{r:255,g:0,b:0,a:1}`; `parseColor('rgba(0,0,0,0.5)').a === 0.5`; `parseColor('transparent').a === 0`.
    - `toHex({r:99,g:102,b:241,a:1}) === '#6366f1'`.
    - `contrastRatio(đen, trắng)` ≈ 21; `wcagLevel(4.5, false) === 'AA'`; `wcagLevel(3, true) === 'AA'`; `wcagLevel(2.9, true) === 'fail'`.
  - `inspect.test.ts`: dùng style giả là object có `getPropertyValue`.
    - `display: 'block'`, `padding: '0px'` → không có dòng `padding`.
    - `font-size: '16px'`, `line-height: '24px'` → dòng line-height là `1.5`.
    - `color: 'rgb(99, 102, 241)'` → `#6366f1`.
    - `elementSelector(<div id="x" class="a b">)` === `div#x.a.b`, hoặc đúng định dạng của bản cũ nếu khác; ghi lại trong report.
  - Run: `pnpm vitest run src/lib/color.test.ts src/lib/css`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Thông tin ảnh port `renderImageInfo` / `getImageFileSize` (`:43127`, `:43219`):
  - kích thước gốc;
  - dung lượng từ `performance.getEntriesByName`, rồi HEAD, rồi fetch; có cache;
  - lỗi mạng thì bỏ trống, không báo lỗi.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: inspector panel with copy CSS, contrast and image info" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 8: Ghim inspector bằng Space

**Files:**

- Create:
  - `src/content/tools/inspector/pins.svelte.ts`
  - `src/content/tools/inspector/PinnedInspector.svelte`, `src/content/tools/inspector/pins.test.ts`
- Modify:
  - `src/content/tools/inspector/index.ts`, `InspectPanel.svelte`
  - `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `onKey`, `InspectPanel` content, `pinHintDone` (Task 1), `sessionSignal`, `onStop`.
- Produces:
  - `pins` (`$state` mảng `{ id: number; el: Element; pageX: number; pageY: number; width?: number; height?: number }`).
  - Mỗi pin là một `PinnedInspector`. Toạ độ lưu theo trang, nên bám theo cuộn.
- Hành vi (2.13, 2.14; port `:43481`, `:43574`, `:43606`, `:43667`):
  - **Ghim:** Space khi inspector bật, panel đang hiện và có hover hoặc chọn. Ghim xong thì `preventDefault`, để trang không cuộn.
  - **Thanh kéo:**
    - kéo để di chuyển, kẹp trong màn hình;
    - kéo không gây click lên trang: chặn click ngay sau khi thả, cờ tự xoá sau ~50ms (spec §9);
    - không hover-inspect trong lúc kéo.
  - **Khác:** nút đóng; chữ ký `tag#id.class`; góc resize.
  - **Rê chuột lên pin** thì highlight phần tử nguồn; bấm vào thì pin nổi lên trên.
  - **Gợi ý ghim:**
    - chân panel hiện `inspect.pinHint` khi `pinHintDone` là `false`;
    - lần ghim đầu ghi `pinHintDone = true`. Đây là chỗ ghi khoá, sửa carry-over "chỉ đọc".
  - **Tắt inspector hoặc dừng phiên** thì gỡ mọi pin.
- Khoá i18n mới:

| Khoá | en | vi |
| --- | --- | --- |
| `inspect.pinHint` | Press Space to pin | Nhấn Space để ghim |
| `common.close` | Close | Đóng |

- [ ] **Step 1: Viết test fail** (`pins.test.ts`, cạnh `pins.svelte.ts`):
  - `addPin(el, {x, y})` tăng `pins.length`;
  - `removePin(id)` giảm;
  - `clearPins()` về 0;
  - toạ độ lưu = toạ độ viewport + `scrollX`/`scrollY` lúc ghim.
  - Run: `pnpm vitest run src/content/tools/inspector`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Hook Space đăng ký qua `onKey(' ', …)`.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: pin inspectors with Space" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 9: Đổi nhãn kiểm kê, thử tay trên Edge

**Files:**

- Modify: `docs/inventory.md`

- [ ] **Step 1: Đổi nhãn theo bảng "Phạm vi"** ở đầu plan.
  - Dòng chỉ dời một phần thì tách thành dòng mới, đánh số tiếp cuối mục (như 1.32–1.35), ghi `(tách từ X)`, giữ nguyên tham chiếu code cũ.
  - Run: `pnpm vitest run docs/inventory.test.ts`. Expected: PASS (không mất tên nào).
- [ ] **Step 2: Build và nhờ chủ dự án thử tay** (controller chuyển danh sách này):
  1. `pnpm build`, rồi reload `.output/chrome-mv3` trong `edge://extensions`, không lỗi đỏ.
     - Trang vẫn có style. Nếu UI mất style vì `use_dynamic_url`, ghi lại; Task 3 bỏ `use_dynamic_url` và ghi lý do.
  2. Trên một trang thường: bấm icon thì dock hiện, icon đổi sang active. Bấm lại thì dock mất, icon về thường. Lặp 5 lần: DevTools chỉ có một `<pixellens-ui>`.
  3. Phím `1` bật inspector. Rê chuột thấy khung viền liền, nền nhấn nhạt, số rộng phía trên, số cao trong cạnh phải, font mono.
  4. Click chọn phần tử, rồi rê sang phần tử khác: thấy đường đo khoảng cách có số.
  5. Alt+Shift+↑/↓ chọn cha/con; Alt+Shift+←/→ chọn anh/em; Esc bỏ chọn.
  6. Gõ chữ `1` trong ô tìm kiếm của trang thì inspector không đổi trạng thái.
  7. Space ghim panel. Kéo thanh ghim không bấm nhầm link phía dưới. Cuộn trang thì pin bám theo.
  8. Copy CSS: dán ra được CSS. Nút đổi "Copied!" rồi trở lại.
  9. Trang nền tối (vd. github.com bật dark): số đo màu `#a5b4fc`, dock theme sáng (theme "Hệ thống").
  10. Console `document.documentElement.style.fontSize = '10px'`: dock và panel không co.
  11. Pause: hover không còn, nút khoá trừ Pause/Quit; Ctrl+Q vẫn thoát.
  12. Reload trang khi đang bật: icon về thường, không còn dock.
- [ ] **Step 3: Đánh `[x]`** các dòng `đợt 1` đã đạt khi thử tay. Commit: `git commit -am "docs: retag deferred phase-1 inventory lines, tick phase 1" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

## Xong khi

- `pnpm check` và `pnpm build` qua.
- 12 bước thử tay ở Task 9 đạt.
- Không dòng `đợt 1` nào trong `docs/inventory.md` còn `[ ]`.

## Ghi chú cho các đợt sau

- **Thêm công cụ:** chỉ cần `registerItem` và một thư mục `src/content/tools/<tên>/`. Không thêm `switch` theo id ở dock hay phím.
- **Popover dock** (1.31) làm ở Đợt 2, cùng popover grid.
- **Đợt 4:** khi có side panel, thêm `clear` / `select` vào `ContentApi`/`BackgroundApi` và nối với `releaseSelectedElement` / chọn phần tử.
