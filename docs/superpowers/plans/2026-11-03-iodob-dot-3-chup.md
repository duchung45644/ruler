# iodob — Đợt 3: Chụp — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bản mới chụp được như bản cũ: nút Chụp / phím 8 mở thanh chế độ trên màn hình đã đóng băng; có chụp vùng (Copy / Lưu / Vẽ chú thích), chụp màn hình, chụp cả trang qua `chrome.debugger` (lỗi thì cuộn-ghép), chụp phần tử đang chọn, và trình sửa ảnh có vẽ chú thích. Trong lúc UI chụp mở, mọi công cụ trên trang tạm dừng.

**Architecture:**
- **Background** (`src/entrypoints/background.ts`) có hai handler typed mới trong `BackgroundApi`:
  - `capture_tab(rect | null)`: `captureVisibleTab`, nếu có `rect` thì cắt bằng `OffscreenCanvas`;
  - `full_capture(opts)`: port `bdFullCapture` của `bd-background.js`.
  - Mọi lệnh `captureVisibleTab` đi qua **một hàng đợi giãn cách** (≥550ms giữa hai lần, spec §3 "~2 lần/giây").
- **Một module chụp** ở `src/content/tools/capture/`: mục registry `capture` (phím 8), phiên chụp (`openCaptureBar`, `openCaptureEditor`, `closeCapture`), chụp cả trang, chụp phần tử.
- **UI chụp nằm ở host shadow riêng** (`iodob-capture`, và `iodob-cover` cho lớp che khi chụp cả trang). Dựng bằng `mountUi` (thêm tham số `name`). Lý do: host chính (`iodob-ui`) phải ẩn hẳn lúc chụp (dock, panel, popover, layer). UI chụp nằm chung host thì sẽ ẩn theo. Bản cũ cũng tách `capHost` / cover như vậy.
- **Cờ `state.capturing`** thay `globalThis.__bdViewerOpen`.
  - `routeKey`: khi cờ bật, chỉ chuyển phím cho handler của phiên chụp. Phím số, phím chữ và `addKeyHandler` của công cụ không chạy.
  - `startDrag` và các handler của inspector bỏ qua khi cờ bật.
  - Ctrl+Q vẫn thoát. `onStop` đóng phiên chụp.
- **Đường chạy liên tục** (kéo vùng chọn, vẽ bút, preview hình) viết TS thuần, gắn thẳng vào phần tử canvas/shade. Svelte chỉ vẽ các thanh nút và trạng thái chữ trên nút ("Đã copy"…).
- **Logic thuần** ở `src/lib/`, có unit test:
  - hình học vùng chọn, vị trí thanh, vùng chụp phần tử, tên file: `capture.ts`;
  - kế hoạch chụp cả trang, script before/after/restore, ghép: `fullpage.ts`;
  - hình học chú thích, hằng số công cụ: `markup.ts`;
  - cắt ảnh, chia khúc, giãn cách gọi: `capture-bg.ts`.

**Tech Stack:** Giữ nguyên stack Đợt 1–2: WXT 0.21.5, Svelte 5, Tailwind 4, `@lucide/svelte`, `@wxt-dev/i18n`, Vitest + happy-dom 21.0.3. **Không thêm dependency.** Canvas 2D không có trong happy-dom, nên test vẽ dùng context giả ghi lại các lệnh gọi. Không thêm `canvas` / `jsdom`.

**Spec:** `docs/superpowers/specs/2026-11-01-iodob-rewrite-design.md`. Các mục liên quan:
- §3 Ràng buộc: `debugger`; `downloads` và `clipboardWrite` là optional; `captureVisibleTab` ~2 lần/giây; canvas ~32 767px; clipboard ảnh cần secure context
- §4.1 (phím 8), §4.7 Chụp màn hình
- §6.3 DRY (một helper gắn UI Svelte vào shadow root), §6.4 Đường chạy liên tục
- §7 Giao diện mới
- §8 Đợt 3
- §9 "Inspector / chọn" (UI chụp mở thì công cụ tạm dừng), "Chụp", "Chụp cả trang"
- §11 Để người làm tự quyết

**Checklist hành vi:** các dòng `đợt 3` trong `docs/inventory.md`, gồm 22 dòng:
- 1.39
- 3.24, 3.25
- 4.01–4.14
- 9.29, 9.33, 9.36, 9.39

**Code cần port:**
- `unpacked/scripts/bd/capture/{capture,fullpage,editor}.js` và `unpacked/bd-background.js`: code của chủ dự án. Port sát, giữ nguyên hành vi, số, chuỗi.
- `legacy-src/content.js` (chỉ grep theo tên hàm, không đọc cả file):
  - `saveScreenshot` `:46588`
  - `calculateElementCoordinates` `:45410`
  - `saveViewportScreenshot` `:46887`
  - `animateScreenshotEffect` `:47765`
  - `bdDownloadDataUrl` `:21175`
  - `bdShowScreenshotPreview` `:21193`
  - đọc `screenshotPreferences` `:29570`, `:24150`
- `legacy-src/background.js`: `capture_tab` `:3617`, `download_image` `:3679`, `$e` `:5743`, `De` `:5445`.

## Phạm vi — phần dời sang đợt khác và quyết định

Theo quy tắc "Dòng gộp" của `docs/inventory.md`, Task 8 tách các phần sau thành dòng mới (đánh số tiếp cuối mục, ghi `(tách từ X)`):

| Dòng | Phần dời | Sang |
| --- | --- | --- |
| 4.05 | "ẩn cả highlight nếu chế độ sửa" (`isEditMode`) | 5 |
| 4.06 | Toàn bộ: chụp trong iframe responsive (snapshot DOM → SVG foreignObject, `screenshot_flash`). Đổi nhãn `đợt 3` → `đợt 6` | 6 |
| 4.13 | Thẻ preview góc phải dưới 8s (SCREENSHOT_PREVIEW_SAVE/SAVED, DIALOG_CANCEL) và trình xem toàn màn hình `bdOpenScreenshotViewer`: chỉ dùng ở khung **không** có bd, tức iframe responsive. Phần "khung top mở trình sửa ảnh" làm ở đợt này | 6 |
| 4.02 | `download_image` gộp vào `capture_tab(null)`: `ze` chỉ trả lại ảnh. Nhánh "gửi dataUrl lên" chỉ do 4.06 dùng, nên dời theo 4.06 | 6 |
| 9.36 | `scripts/patterns/screenshots/*.png`: thư mục không có trong `unpacked/`, không file nào tham chiếu. Đánh `[x]` với ghi chú "không có trong bản cũ — không áp dụng" | — |
| 9.29 / 9.33 | `includePadding` được đọc và lưu nhưng không có tác dụng: bản cũ gửi lên background và `$e` bỏ qua nó. Đợt này giữ đúng như vậy (đọc và nghe storage). Công tắc trong trang cài đặt làm ở đợt 7 | 7 (UI) |

**Quyết định khi spec, kiểm kê và code cũ lệch nhau:**
- **`__bdTools.openCaptureBar` / `openCaptureEditor` (3.24)** thành hàm export của `src/content/tools/capture/session.ts`. Hook `hideUi` / `showUi` thay bằng `hideUi(mode)` trong core (Task 3). Cờ `_bdDirectShot` thành tham số `captureElement(el)` gọi thẳng. Không còn vòng `saveScreenshot` gọi lại chính nó.
- **`__bdViewerOpen` (3.25, 4.13)** thành `state.capturing`. Bản cũ chỉ ảnh đè kiểm cờ này. Bản mới chặn ở `routeKey` cho mọi công cụ (spec §9: "Khi UI chụp/sửa ảnh mở, các công cụ trên trang tạm dừng").
- **Nút Chụp luôn mở thanh chế độ.** Ở khung top luôn có bd, nên nhánh "chụp thẳng khi không có `__bdTools`" của 4.04/4.05 chỉ còn đi qua nút "Phần tử đang chọn". Ảnh chụp phần tử mở trình sửa ảnh (đúng `bdShowScreenshotPreview` ở khung top), kèm flash.
- **Ẩn UI khi chụp:**
  - chụp vùng / màn hình / cả trang: ẩn cả host chính (dock, panel, popover, layer);
  - chụp phần tử: khi `includeHighlights !== false` thì giữ painter `inspector` (highlight, tag, margin), ẩn mọi thứ khác. Đúng 4.05 "giữ tag + margin nếu bật".
- **Ảnh đè thiết kế, `<style>` X-Ray** nằm trong DOM trang nên vẫn vào ảnh, như bản cũ (`hideCapUi` không đụng tới). Xem Quyết định đã chốt #2.
- **Giao diện chụp theo token §7 và theme của extension** (`data-theme`). Không theo `prefers-color-scheme` như `CAPTURE_CSS` cũ. Icon SVG tay đổi sang Lucide (bảng ở Task 4). Màu cố định của nội dung chụp giữ nguyên bản cũ: nền tối 45%, viền nét đứt trắng 2px, tay nắm trắng 11px viền `#222`, nền trình sửa `rgba(0,0,0,.72)`, ghi chú viền `#F0A03C`. Spec §7 "không nét đứt" chỉ áp cho gióng; §4.7 ghi rõ "viền nét đứt trắng".
- **Trình sửa ảnh không có animation fade** (spec §9). Thanh chế độ giữ `bd-in` 0.15s như bản cũ.
- **Chữ trong ảnh (công cụ Text)** giữ font `600 …px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif` như bản cũ: chữ được đốt vào ảnh, không phải UI. Xem Quyết định đã chốt #4.
- **"Nhớ công cụ dùng cuối" (4.12):** biến module, sống theo phiên trang như `let markTool` cũ. Không lưu storage.
- **Lưu ảnh** dùng `<a download>` với blob URL, như `saveCanvas` cũ. Không cần quyền `downloads`.
- **Copy ảnh:**
  - `navigator.clipboard.write(ClipboardItem)`;
  - lỗi thì xin `clipboardWrite` qua `request_clipboard_permission` rồi thử lại một lần (cùng đường với `copyText`);
  - vẫn lỗi thì nút hiện T("Failed", "Lỗi");
  - trên trang không phải secure context, nút Copy hiện `capture.copyNeedsHttps` ngay, Lưu vẫn chạy. Xem Quyết định đã chốt #1.

## Global Constraints

- **Giữ mọi ràng buộc của Đợt 0–2:**
  - phiên bản ghim chính xác; không thêm dependency;
  - manifest không có `host_permissions` / `content_scripts`;
  - `debugger` đã có trong `permissions`; `downloads`, `clipboardWrite` vẫn optional; **không thêm quyền**;
  - chỉ `en` và `vi`;
  - không sửa `unpacked/` và `legacy-src/`;
  - commit kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`;
  - mọi lệnh chạy ở gốc repo bằng Git Bash.
- **Chuỗi giao diện:**
  - chỉ qua `i18n.t()`, khoá lồng nhau trong `src/locales/{en,vi}.json`, nhóm `capture.*`;
  - chuỗi `T(en, vi)` của `unpacked/scripts/bd/capture/*.js` chép nguyên văn cả hai bản;
  - chuỗi `_locales` (DOCK_TAKE_SCREENSHOT) chép nguyên văn;
  - chuỗi có tham số (`Fast capture failed ($1)…`) dùng substitution của `@wxt-dev/i18n`.
- **Đơn vị trong trang:** chỉ `px`. Lớp che chụp cả trang dùng `innerWidth` / `innerHeight` bằng px, **không** dùng `vh`: vh đổi khi viewport bị nới.
- **Token §7** lấy từ `src/ui/theme.css`. Thanh của UI chụp dùng lại kiểu nút của `DockButton` (cao 32px, `rounded-btn`). Không thêm khối CSS tay theo màn hình.
- **Đường chạy liên tục:** kéo vùng chọn, vẽ bút, preview hình gom theo rAF hoặc vẽ thẳng lên canvas trong `pointermove`. Không ghi `$state` trong `pointermove`.
  - Bút chỉ vẽ đoạn mới.
  - Hình được preview trên canvas cỡ màn hình và chỉ vẽ vào ảnh khi thả (spec §9).
- **Canvas đi thẳng vào trình sửa ảnh,** không vòng qua PNG (spec §9). `openCaptureEditor(src: string | HTMLCanvasElement, …)`.
- **Listener:** mọi listener gắn `{ signal }` của phiên chụp, và signal đó gộp với `sessionSignal()` qua `AbortSignal.any`. Host chụp / lớp che, `transform` trên `<html>`, `data-iodob-scroll`, `visibility` của phần tử fixed/sticky đều phải gỡ trong `finally` và trong `onStop`.
- **Khoá storage giữ đúng tên bản cũ:** `screenshotPreferences` = `{ includePadding: boolean; includeHighlights: boolean }` trong `storage.local`, mặc định `null` (nghĩa là cả hai `true`).
- **Thông điệp background giữ tên bản cũ:** `capture_tab`, `full_capture`; mã lỗi `INVALID_URL`, `CAPTURE_FAILED`. Riêng kênh nội bộ đi qua `sendToBackground` có kiểu (`target: 'background'`). Không giữ `target: "bd"`.
- **`pnpm check` và `pnpm build`** phải qua ở cuối mỗi task.

## Review Focus

1. **Copy ảnh trên trang `http://` (không secure context) và khi chưa cấp `clipboardWrite`.**
   - Mong đợi: nút Copy hiện "Lỗi" 1,5s rồi trở lại; Lưu vẫn tải được PNG; không lỗi chưa bắt trong console.
   - Kiểm bằng: `clipboard.test.ts` (Task 3: `copyImage` trả `false` khi `isSecureContext === false`, gọi `request_clipboard_permission` đúng một lần khi `write` ném); `capture.test.ts` (Task 4: `capAction` lỗi thì nhãn "Failed").
2. **Chụp cả trang khi DevTools đang mở ở tab** (`debugger.attach` ném lỗi), **và trang cuộn trong container.**
   - Mong đợi: chuyển sang cuộn-ghép; ghi chú lý do có `e.message`; vị trí cuộn (window hoặc container) trả về chỗ cũ; `<html>` không còn `transform`; không còn `[data-iodob-scroll]`; phần tử fixed/sticky hiện lại.
   - Kiểm bằng: `background.test.ts` (Task 2: `finally` luôn gọi `clearDeviceMetricsOverride`, `restore`, `detach` kể cả khi `captureScreenshot` ném); `fullpage.test.ts` (Task 6: script `after` trả `transform` cũ kèm priority; `pickScroller`).
3. **Gõ trong ô chữ của công cụ Text, và phím khi UI chụp mở.**
   - Mong đợi: gõ `p`/`a`/`r` không đổi công cụ; Esc chỉ huỷ ô chữ, không đóng trình sửa; số `2`…`7`, `O`/`M`/`A`, mũi tên không chạm công cụ trang (ảnh đè không dịch); Ctrl+Z hoàn tác; Ctrl+Q thoát sạch.
   - Kiểm bằng: `keys.test.ts` (Task 3: `state.capturing` chặn item và `addKeyHandler`, vẫn cho quit); `editor.test.ts` (Task 5: phím từ `<input>` trong shadow chụp không đổi công cụ).
4. **Thoát (Ctrl+Q / bấm icon) giữa lúc đang chụp cả trang hoặc đang mở trình sửa ảnh.**
   - Mong đợi: không còn host `iodob-capture` / `iodob-cover`; `state.capturing === false`; trang không kẹt `transform`, không kẹt ẩn fixed; background vẫn detach debugger (nhờ `finally`). Bật lại thì chụp được ngay.
   - Kiểm bằng: test `onStop` trong `session.test.ts` của capture (Task 4) và `fullpage` (Task 6).
5. **Bấm phím 8 liên tục, và cuộn-ghép trang dài** (giới hạn ~2 lần/giây của `captureVisibleTab`).
   - Mong đợi: không lỗi `MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND`; phím 8 khi phiên chụp đang mở thì bị bỏ qua (không mở hai phiên).
   - Kiểm bằng: `capture-bg.test.ts` (`nextCaptureDelay`), `background.test.ts` (hai `capture_tab` liền nhau cách ≥550ms bằng fake timers) (Task 2); test "đang capturing thì `openCaptureBar` không làm gì" (Task 4).
6. **Kéo vùng chọn / vẽ chú thích rồi thả, khi inspector đang bật.**
   - Mong đợi: trang không nhận click, vùng chọn của inspector không đổi, không hover-inspect sau khi đóng UI chụp.
   - Kiểm bằng: `inspector.test.ts` (Task 3: `state.capturing` thì `mousemove`/`click` không đổi `hovered`/`selected`); host chụp nằm trong `ownNodes`.

---

### Task 1: Logic thuần của chụp — vùng chọn, vùng phần tử, tên file

**Files:**

- Create: `src/lib/capture.ts`, `src/lib/capture.test.ts`

**Interfaces:**

- Produces (`src/lib/capture.ts`):
  - `type SelRect = { x: number; y: number; w: number; h: number }` (CSS px theo viewport).
  - `type Handle = 't' | 'b' | 'l' | 'r' | 'tl' | 'tr' | 'bl' | 'br' | 'move'`
  - `EDGE = 8`, `MIN_SEL = 4`.
  - `CURSORS: Record<Handle, string>`: chép nguyên bảng `CURSORS` (`capture.js:248`).
  - `hitSel(r: SelRect | null, x: number, y: number, edge = EDGE): Handle | null`: port `hitSel` (`capture.js:250`). Thứ tự ghép chuỗi giữ y hệt: `t`/`b` trước, rồi `l`/`r`.
  - `dragSel(mode: Handle | null, o: SelRect | null, x0: number, y0: number, cx: number, cy: number, vw: number, vh: number): SelRect`: port thân `mv` (`capture.js:271`).
    - toạ độ chuột kẹp `[0, vw]` × `[0, vh]`;
    - `null` thì vẽ mới; `move` thì dời, kẹp trong viewport; cạnh/góc thì co giãn, có chuẩn hoá khi kéo qua cạnh đối diện.
  - `isValidSel(r: SelRect | null): boolean`: `w >= 4 && h >= 4`.
  - `placeSelBar(r: SelRect, bw: number, bh: number, vw: number, vh: number): { top: number; left: number }`: port `placeBar` (`capture.js:236`). Đặt dưới vùng, không vừa thì trên, không vừa nữa thì trong mép dưới; `top ≥ 8`; `left = min(max(8, r.x + r.w - bw), vw - bw - 8)`.
  - `cropSource(r: SelRect, imgW: number, vw: number): { sx: number; sy: number; w: number; h: number }`: `k = imgW / vw`; `w`, `h` = `max(1, round(r.w * k))`…; `sx`, `sy` = `round(r.x * k)`… (`crop` `capture.js:213`).
  - `elementCaptureRect(rects: DOMRectReadOnly[], vw: number, vh: number, dpr: number): { left: number; top: number; right: number; bottom: number }`: port `calculateElementCoordinates` (`legacy-src/content.js:45410`).
    - lấy hợp các rect; nới 50px mỗi phía, kẹp trong viewport; nhân `dpr`;
    - danh sách rỗng thì trả cả viewport × `dpr`.
  - `screenshotName(hostname: string, now: Date): string`: `` `${hostname || 'screenshot'}-${now.toISOString().replace(/[:.]/g, '-')}.png` `` (4.09).
  - `isFullyVisible(r: DOMRectReadOnly, vw: number, vh: number): boolean`: hàm `a` trong `saveScreenshot` (`:46705`).

- [ ] **Step 1: Viết test fail** (`capture.test.ts`):
  - `hitSel(null, 5, 5)` → `null`.
  - Với `r = {x:100,y:100,w:200,h:100}`:
    - `hitSel(r, 100, 100)` → `'tl'`
    - `(r, 200, 96)` → `'t'`
    - `(r, 305, 200)` → `'br'`
    - `(r, 200, 150)` → `'move'`
    - `(r, 50, 50)` → `null`
  - `dragSel(null, null, 50, 50, 10, 20, 800, 600)` → `{x:10,y:20,w:40,h:30}` (kéo ngược).
  - `dragSel('move', r, 200, 150, 900, 150, 800, 600)` → `x === 600` (kẹp `vw - w`).
  - `dragSel('l', r, 100, 150, 350, 150, 800, 600)` → `{x:300,w:50,...}` (kéo qua cạnh phải thì đảo).
  - `isValidSel({x:0,y:0,w:3,h:50}) === false`.
  - `placeSelBar`:
    - `r = {x:100,y:100,w:200,h:100}`, `bw=240`, `bh=42`, `vh=600` → `top 208`, `left 60`;
    - `r.y = 520` → đặt trên (`top = 520 - 42 - 8 = 470`);
    - `r = {x:0,y:10,w:100,h:585}` → đặt trong (`top = 10 + 585 - 42 - 8`).
  - `cropSource({x:10,y:20,w:30,h:40}, 1600, 800)` → `{sx:20,sy:40,w:60,h:80}`.
  - `elementCaptureRect`:
    - `([{left:100,top:100,right:200,bottom:150}], 800, 600, 2)` → `{left:100,top:100,right:500,bottom:400}`;
    - `[]` → `{left:0,top:0,right:1600,bottom:1200}`.
  - `screenshotName('', new Date('2026-11-03T10:20:30.456Z'))` → `'screenshot-2026-11-03T10-20-30-456Z.png'`.
  - Run: `pnpm vitest run src/lib/capture.test.ts`. Expected: FAIL (module chưa có).
- [ ] **Step 2: Viết `capture.ts`** theo Interfaces.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: pure capture geometry — selection, element rect, file name" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 2: Background — `capture_tab`, `full_capture`, giãn cách `captureVisibleTab`

**Files:**

- Create: `src/lib/capture-bg.ts`, `src/lib/capture-bg.test.ts`
- Modify:
  - `src/lib/messaging.ts` (thêm vào `BackgroundApi`)
  - `src/entrypoints/background.ts`
  - `src/background.test.ts`

**Interfaces:**

- Consumes: `handleMessages`, `isInjectable` (`src/lib/tabs.ts`, cùng danh sách chặn với `De` và thêm store Edge).
- Produces:
  - Kiểu cho `BackgroundApi`:
    ```ts
    type DeviceRect = { left: number; top: number; right: number; bottom: number }; // device px
    type CaptureResult =
      | { success: true; dataUrl: string }
      | { success: false; error: 'INVALID_URL' | 'CAPTURE_FAILED' };
    interface FullCaptureOpts {
      width: number; height: number; dpr: number; chunk: number; shift: number;
      before?: string; after?: string; restore?: string;
    }
    type FullCaptureResult = { ok: true; parts: string[] } | { ok: false; error: string };
    // BackgroundApi:
    capture_tab(rect: DeviceRect | null): CaptureResult;
    full_capture(opts: FullCaptureOpts): FullCaptureResult;
    ```
  - `src/lib/capture-bg.ts`:
    - `CAPTURE_GAP = 550`
    - `nextCaptureDelay(last: number, now: number, gap = CAPTURE_GAP): number` → `max(0, last + gap - now)`.
    - `cropBox(r: DeviceRect): { x: number; y: number; w: number; h: number }`: `w = max(1, round(right - left))`, `h = max(1, round(bottom - top))`, `x = left`, `y = top` (port `$e` `:5743`).
    - `chunkClips(height: number, chunk: number, shift: number, width: number): Array<{ x: 0; y: number; width: number; height: number; scale: 1 }>`: vòng `for (y = 0; y < height; y += chunk)` của `bdFullCapture`; `y` của clip = `y + shift`.
  - `background.ts`:
    - `captureVisible(windowId)`: hàng đợi promise nối đuôi; mỗi lần gọi `browser.tabs.captureVisibleTab(windowId, { format: 'png' })` sau khi chờ `nextCaptureDelay`.
    - `capture_tab(rect, sender)`:
      - `!isInjectable(sender.tab?.url)` → `{ success: false, error: 'INVALID_URL' }`;
      - chụp; có `rect` thì `fetch(dataUrl) → blob → createImageBitmap → OffscreenCanvas(w, h).drawImage(bmp, x, y, w, h, 0, 0, w, h) → convertToBlob(png) → dataURL`;
      - cắt lỗi thì trả ảnh nguyên (4.01); chụp lỗi thì `CAPTURE_FAILED`.
    - `full_capture(opts, sender)`: port `bdFullCapture` (`bd-background.js:31`) từng dòng:
      - `browser.debugger.attach({ tabId }, '1.3')`;
      - `Emulation.setDeviceMetricsOverride { width, height: height + shift, deviceScaleFactor: dpr, mobile: false }`;
      - `before` (nếu có), chờ 300ms;
      - với mỗi clip của `chunkClips`: `Page.captureScreenshot { format: 'png', captureBeyondViewport: false, optimizeForSpeed: true, clip }`;
      - `finally`: `after` → `clearDeviceMetricsOverride` → `restore` → `detach`; mỗi bước `.catch(() => {})`;
      - lỗi thì `{ ok: false, error: String(e?.message ?? e) }`.
  - Bỏ qua khi không có `sender.tab` (bản cũ `!sender.tab` → return false): trả `{ ok: false, error: 'no tab' }`.

- [ ] **Step 1: Viết test fail.**
  - `capture-bg.test.ts`:
    - `nextCaptureDelay(1000, 1200)` → `350`; `nextCaptureDelay(0, 5000)` → `0`;
    - `cropBox({left:10.4,top:0,right:10.6,bottom:0})` → `{x:10.4,y:0,w:1,h:1}`;
    - `chunkClips(20000, 8000, 900, 1280)` → 3 clip; clip cuối `{y: 16900, height: 4000}`.
  - `background.test.ts` (`fakeBrowser`; `browser.debugger` không có thì gán stub bằng `vi.fn()` trên `fakeBrowser`):
    - `capture_tab(null)` từ tab `chrome://settings` → `{ success: false, error: 'INVALID_URL' }`;
    - `captureVisibleTab` ném → `CAPTURE_FAILED`;
    - `vi.useFakeTimers()`: hai `capture_tab(null)` liền nhau → lần gọi `captureVisibleTab` thứ hai chỉ chạy sau `advanceTimersByTime(550)`;
    - `full_capture` với `sendCommand` ném ở `Page.captureScreenshot` → trả `{ ok: false }`, và đã gọi `Emulation.clearDeviceMetricsOverride`, `Runtime.evaluate(restore)`, `detach` (Review Focus 2);
    - thứ tự lệnh khi thành công: `setDeviceMetricsOverride`, `Runtime.evaluate(before)`, n × `captureScreenshot`, `Runtime.evaluate(after)`, `clearDeviceMetricsOverride`, `Runtime.evaluate(restore)`.
  - Run: `pnpm vitest run src/lib/capture-bg.test.ts src/background.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Cắt ảnh (OffscreenCanvas, `createImageBitmap`) để trong một hàm `crop(dataUrl, rect)` riêng của `background.ts`, test stub qua `vi.stubGlobal`. Không có trong happy-dom thì nhánh lỗi trả ảnh nguyên, và nhánh này cũng được test.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: background capture_tab and debugger full_capture with call spacing" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 3: Khung cho chụp — `state.capturing`, ẩn UI, host riêng, settings, copy ảnh

**Files:**

- Modify:
  - `src/content/core/state.svelte.ts` (`capturing: false`)
  - `src/content/core/session.ts` (`sessionCtx()`, `hideUi`, `stopSession` đặt lại `capturing`)
  - `src/content/core/keys.ts`, `src/content/core/keys.test.ts`
  - `src/content/core/drag.ts`, `src/content/core/drag.test.ts`
  - `src/content/core/overlay.ts` (gắn `data-painter` cho box)
  - `src/content/tools/inspector/index.ts`, `src/content/tools/inspector/inspector.test.ts`
  - `src/ui/mount.ts`, `src/ui/mount.test.ts` (tham số `name`)
  - `src/ui/theme.css` (`:host([data-capture])`)
  - `src/lib/settings.ts`, `src/lib/settings.test.ts`
  - `src/lib/clipboard.ts`; Create `src/lib/clipboard.test.ts`

**Interfaces:**

- Consumes: `mountUi`, `ownNodes` (Đợt 2), `layer`, `sendToBackground('request_clipboard_permission')`.
- Produces:
  - `state.capturing: boolean`.
  - `routeKey`:
    - sau quit và trước `shouldIgnoreKey`: `if (state.capturing) return captureKey?.(e)`;
    - `setCaptureKeyHandler(fn | null)` trong `keys.ts`; chỉ phiên chụp đặt;
    - **vẫn** bỏ qua khi phím đến từ `<input>` (ô chữ của công cụ Text), giống `onCapKeydown` cũ (`capture.js:80`);
    - không kiểm `state.paused`: phiên chụp chỉ mở khi không pause.
  - `startDrag`: `if (state.capturing) return`. Handler `mousemove` / `block` / `click` của inspector: thêm `state.capturing` vào điều kiện bỏ qua.
  - `mountUi(ctx, component, props?, opts?: { name?: string })`: mặc định `'iodob-ui'`. Host mới:
    - thêm `data-iodob` (để X-Ray không vẽ viền lên nó: `xray.ts` đã loại `[data-iodob]`);
    - có `data-theme = state.theme`;
    - được `ownNodes.add` / `delete` bởi người gọi.
  - `sessionCtx(): ContentScriptContext` (lưu ở `start`).
  - `hideUi(mode: 'all' | 'keepHighlight' | null): void` trong `session.ts`, đặt `host.dataset.capture`. Trong `theme.css`:
    ```css
    :host([data-capture='all']) { visibility: hidden !important; }
    :host([data-capture='keepHighlight']) > :not(.bd-layer),
    :host([data-capture='keepHighlight']) [data-painter]:not([data-painter='inspector']) { visibility: hidden !important; }
    ```
    `layer` có class `bd-layer`. `addPainter` gắn `box.dataset.painter = id`.
  - `screenshotPrefs = storage.defineItem<{ includePadding?: boolean; includeHighlights?: boolean } | null>('local:screenshotPreferences', { fallback: null })` và `includeHighlights(p): boolean` (`p?.includeHighlights !== false`). Phần capture đọc lúc chụp và `watch` vào biến module (9.29, 9.33).
  - `copyImage(blob: Blob | Promise<Blob>): Promise<boolean>` trong `clipboard.ts`:
    - `!isSecureContext` → `false`;
    - `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])`;
    - ném thì `request_clipboard_permission` rồi thử lại một lần;
    - không có fallback `execCommand` cho ảnh.

- [ ] **Step 1: Viết test fail.**
  - `keys.test.ts`:
    - `state.capturing = true`, item `key: '2'`, một `addKeyHandler` → nhấn `2` và `ArrowLeft`: không chạy cái nào; handler chụp nhận cả hai;
    - Ctrl+Q vẫn gọi `quit.run`;
    - keydown `p` từ `<input>` trong một shadow root → handler chụp không chạy.
  - `drag.test.ts`: `state.capturing = true` → `startDrag` không gọi `onMove`.
  - `inspector.test.ts`: `state.capturing = true`, `mousemove` lên `<p>` → `state.hovered === null`; `click` → `state.selected` không đổi.
  - `settings.test.ts`:
    - storage rỗng → `screenshotPrefs.getValue() === null`, `includeHighlights(null) === true`;
    - `{ includeHighlights: false }` → `false`.
  - `clipboard.test.ts`:
    - `isSecureContext = false` → `copyImage` trả `false`, không gọi `write`;
    - `write` ném lần đầu, `sendToBackground` trả `true`, lần hai thành công → `true`, `request_clipboard_permission` gọi đúng 1 lần.
  - `mount.test.ts`: `mountUi(ctx, C, {}, { name: 'iodob-capture' })` → host `localName === 'iodob-capture'`, có `data-iodob`.
  - Run: `pnpm vitest run src/content/core src/content/tools/inspector src/lib/settings.test.ts src/lib/clipboard.test.ts src/ui`. Expected: FAIL.
- [ ] **Step 2: Viết code** theo Interfaces.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: capture scaffolding — capturing flag, ui hiding, named hosts, image copy" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 4: Phiên chụp, thanh chế độ, chụp vùng (8)

**Files:**

- Create:
  - `src/content/tools/capture/index.ts`: `initCapture()`, mục registry
  - `src/content/tools/capture/session.ts`: `openCaptureBar`, `closeCapture`, `withHiddenUi`, `grabVisible`, `capAction`, `copyCanvas`, `saveCanvas`
  - `src/content/tools/capture/area.ts`: shade, vùng chọn, 8 tay nắm (TS thuần)
  - `src/content/tools/capture/CaptureRoot.svelte`: thanh chế độ và thanh vùng chọn
  - `src/content/tools/capture/CapButton.svelte`
  - `src/content/tools/capture/capture.test.ts`
- Modify: `src/content/tools/index.ts`, `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: Task 1 (`hitSel`, `dragSel`, `placeSelBar`, `cropSource`, `screenshotName`), Task 2 (`capture_tab`), Task 3 (`state.capturing`, `hideUi`, `mountUi`, `sessionCtx`, `setCaptureKeyHandler`, `copyImage`, `ownNodes`).
- Produces (`session.ts`, port `capture.js`):
  - `openCaptureBar(opts?: { element?: () => void }): Promise<void>` (4.07):
    - đang `capturing` thì return;
    - `state.capturing = true`; `hideUi('all')`; chờ 2 rAF; `grabVisible()`;
    - lỗi thì `hideUi(null)`, `capturing = false`, thôi;
    - được ảnh thì dựng host `iodob-capture` (fixed, inset 0, `pointer-events:none`; thanh/shade `auto`), view `bar`, chế độ vùng bật ngay.
  - `closeCapture(): void`: gỡ host, `setCaptureKeyHandler(null)`, `hideUi(null)`, `capturing = false`. Đăng ký vào `onStop`.
  - `grabVisible(): Promise<string>`: `sendToBackground('capture_tab', null)`, không `success` thì ném `new Error('capture failed')`.
  - `withHiddenUi<T>(fn: () => Promise<T>): Promise<T>` (port `capture.js:132`): ẩn host chụp (`display:none`), `hideUi('all')`, 2 rAF, `fn`; `finally` trả lại đúng trạng thái trước.
  - `capAction(set: (label: string | null, disabled: boolean) => void, fn, doneKey, close)` (port `capture.js:167`):
    - thành công: hiện `done`; `close` thì `closeCapture` sau 700ms, không thì trả nhãn sau 1200ms;
    - lỗi: `capture.failed`, trả sau 1500ms;
    - nút bị `disabled` trong lúc chạy.
  - `copyCanvas(c)`: `copyImage(toBlob(c))`; `false` thì ném. `saveCanvas(c)`: blob URL + `<a download={screenshotName(location.hostname, new Date())}>`, thu hồi URL sau 10000ms (4.09).
  - Phím của phiên: Esc → `closeCapture` (4.07). Các phím khác chuyển cho handler của view (trình sửa ảnh, Task 5).
- `area.ts` (4.08, 4.14; port `startAreaSelect` `capture.js:204`):
  - `<img>` đóng băng `width/height = innerWidth/innerHeight px`;
  - shade `rgba(0,0,0,.45)`, con trỏ theo `CURSORS[hitSel]`;
  - gợi ý `capture.dragHint` ở giữa;
  - `.sel`: `outline: 2px dashed #fff; box-shadow: 0 0 0 100vmax rgba(0,0,0,.45)`, 8 `.hd` 11px trắng viền `1.5px #222`;
  - `pointerdown` (nút trái) + `setPointerCapture`; `pointermove` gọi `dragSel` và ghi thẳng `style`;
  - lần đầu `isValidSel` thì gọi `onDrawn` để gỡ thanh chế độ (4.14);
  - thả mà vùng không hợp lệ thì xoá; hợp lệ thì hiện thanh vùng ở `placeSelBar`;
  - `crop()`: `loadImg(snap)` → canvas `cropSource`.
- Thanh chế độ (`CaptureRoot.svelte`): fixed, `top:16px`, giữa ngang, bề mặt token §7, bo `rounded-panel`, `bd-in` 0.15s. Thứ tự nút:
  1. `[Phần tử đang chọn]` (chỉ khi có `opts.element`)
  2. `[Chụp vùng]` (on)
  3. `[Chụp màn hình]` → `openCaptureEditor(snap)` (Task 5)
  4. `[Chụp cả trang]` → `closeCapture(); captureFullPage(snap)` (Task 6)
  5. `|`
  6. `[✕]` có title `capture.close`
- Thanh vùng: `[Copy] [Lưu] [Vẽ chú thích] | [✕]`. Copy/Lưu chạy `capAction(..., close = true)`. Vẽ chú thích → `openCaptureEditor(await crop(), true)`.
- Mục registry:

| id | key | group | icon Lucide | label | Hành vi |
| --- | --- | --- | --- | --- | --- |
| `capture` | `8` | utilities (sau `find`) | `Camera` | `dock.capture` | 4.04, 1.39: `run` = `openCaptureBar({ element: state.selected ? () => captureElement(state.selected!) : undefined })`; `isDisabled` = `state.capturing` |

- Icon Lucide trong UI chụp:

| Cũ (`ICONS`) | Lucide |
| --- | --- |
| area | `Scan` |
| screen | `Monitor` |
| full | `ScrollText` |
| element | `MousePointer2` |
| copy | `Copy` |
| save | `Download` |
| markup (pen) | `Pencil` |
| arrow | `MoveUpRight` |
| rect | `Square` |
| hl | `Highlighter` |
| text | `Type` |
| undo | `Undo2` |
| ✕ | `X` |

- Khoá i18n mới (đã chép nguyên văn từ `T()` / `_locales`):

| Khoá | en | vi |
| --- | --- | --- |
| `dock.capture` | Capture Screenshot | Chụp Màn hình |
| `capture.area` | Capture area | Chụp vùng |
| `capture.element` | Selected element | Phần tử đang chọn |
| `capture.visible` | Capture visible area | Chụp màn hình |
| `capture.fullPage` | Capture full page | Chụp cả trang |
| `capture.close` | Close (Esc) | Đóng (Esc) |
| `capture.dragHint` | Drag to select an area · Esc to cancel | Kéo chuột để chọn vùng · Esc để huỷ |
| `capture.copy` | Copy | Copy |
| `capture.save` | Save | Lưu |
| `capture.markupCapture` | Markup capture | Vẽ chú thích |
| `capture.copied` | Copied | Đã copy |
| `capture.saved` | Saved | Đã lưu |
| `capture.failed` | Failed | Lỗi |
| `capture.copyNeedsHttps` | Copy needs HTTPS — use Save | Copy cần HTTPS — hãy dùng Lưu |

- [ ] **Step 1: Viết test fail** (`capture.test.ts`; stub `sendToBackground` và `loadImg`):
  - `openCaptureBar()` khi `capture_tab` trả `{success:false}` → không có host `iodob-capture`, `state.capturing === false`, host chính không còn `data-capture`;
  - thành công → có host, `state.capturing === true`, host chính có `data-capture='all'`, thanh có 4 nút + đóng (không có "Phần tử đang chọn"); có `element` thì 5;
  - gọi `openCaptureBar()` lần hai khi đang mở → `capture_tab` chỉ gọi 1 lần (Review Focus 5);
  - keydown Escape (qua `routeKey`) → host bị gỡ, `capturing === false`;
  - `stopSession()` khi đang mở → host bị gỡ, `capturing === false` (Review Focus 4);
  - `capAction`: `fn` ném → nhãn `capture.failed`, `disabled`; `advanceTimersByTime(1500)` → nhãn cũ, không `disabled`;
  - kéo trên shade `(50,50)→(150,120)` → thanh chế độ bị gỡ, thanh vùng hiện; kéo `(50,50)→(52,52)` rồi thả → không có `.sel` hiện.
  - Run: `pnpm vitest run src/content/tools/capture`. Expected: FAIL.
- [ ] **Step 2: Viết code.** `initCapture()` thêm vào `initTools()` sau `initFind()`. Host chụp: `ownNodes.add(host)` khi dựng, `delete` khi gỡ. `host.shadowRoot.addEventListener('keydown', routeKey)` (isolateEvents chặn keydown ở shadow root, giống `session.ts`).
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: capture mode bar and frozen-screen area select" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 5: Trình sửa ảnh và vẽ chú thích

**Files:**

- Create:
  - `src/lib/markup.ts`, `src/lib/markup.test.ts`
  - `src/content/tools/capture/editor.ts`: canvas, vẽ, ô chữ (TS thuần)
  - `src/content/tools/capture/EditorBar.svelte`
  - `src/content/tools/capture/editor.test.ts`
- Modify: `src/content/tools/capture/session.ts`, `CaptureRoot.svelte`, `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `capAction`, `copyCanvas`, `saveCanvas`, `setCaptureKeyHandler` (Task 3–4).
- Produces:
  - `src/lib/markup.ts` (port `editor.js`):
    - `MARK_COLORS = ['#FF3B30','#FFCC00','#34C759','#0A84FF','#111111','#FFFFFF']`, `MARK_SIZES = [2, 4, 8]`;
    - `MARK_TOOLS = [{id:'pen',key:'p'},{id:'arrow',key:'a'},{id:'rect',key:'r'},{id:'hl',key:'h'},{id:'text',key:'t'}] as const` (nhãn qua i18n);
    - `type MarkItem = { tool; color; size; k; pts: [number, number][]; text?: string; fs?: number }` (px ảnh);
    - `drawItem(c: CanvasRenderingContext2D, s: MarkItem, from = 1): void`: port từng nhánh `drawItem` (`editor.js:30`):
      - bút vẽ từ `from - 1`, một chấm khi chỉ có 1 điểm;
      - mũi tên: `head = size*3 + 8*k`, thân dừng ở `0.6*head`, cánh ±0.45 rad;
      - khung `strokeRect`; tô sáng `globalAlpha 0.35` + `fillRect`;
      - chữ `600 ${fs}px system-ui,…`, `textBaseline = 'middle'`;
    - `isTooSmall(a, z, k): boolean`: `!z || hypot(...) < 4 * k`;
    - `textFontCss(size): number`: `10 + size * 3`;
    - `editorCanvasStyle(imgW, imgH, dpr): string`: `tall = imgH / imgW > 2`; `max-width:min(100%, ${imgW/dpr}px);max-height:${tall ? 'none' : 'calc(100vh - 100px)'}` (4.11).
  - `openCaptureEditor(src: string | HTMLCanvasElement, markup = false, note: string | null = null): Promise<void>` (3.24, 4.11; port `editor.js:24`):
    - nếu phiên chụp chưa mở (từ chụp phần tử, cả trang): tự đặt `capturing`, `hideUi('all')`, dựng host;
    - thay view hiện có (thanh chế độ / vùng) bằng view editor, giữ ảnh đóng băng bên dưới cho tới khi editor vẽ xong (không nháy);
    - nền `rgba(0,0,0,.72)`, **không fade**;
    - ghi chú (nếu có) phía trên;
    - ảnh trong `.stage` cuộn được;
    - thanh **dưới** ảnh: `[Copy] [Lưu] [Vẽ chú thích] (công cụ… màu… cỡ… Hoàn tác) | [✕]`;
    - Copy/Lưu chạy `commitText()` trước, rồi `capAction(..., close = false)`.
  - Vẽ (`editor.ts`, port `editor.js:120`):
    - `pointerdown` trên canvas khi đang vẽ: đang gõ chữ thì `commitText`; công cụ chữ thì mở ô `<input>` ở con trỏ;
    - bút: vẽ thẳng vào canvas ảnh từng đoạn;
    - hình: canvas preview `position:fixed` cỡ `innerWidth*dpr` × `innerHeight*dpr`, `setTransform(dpr/k,0,0,dpr/k,b.left*dpr,b.top*dpr)`; khi thả, `isTooSmall` thì bỏ, không thì vẽ vào ảnh;
    - `undo`: `items.pop()`, vẽ lại cả ảnh; nút Hoàn tác `disabled` khi rỗng.
  - Phím (handler của view editor):
    - Ctrl/⌘+Z → undo;
    - khi đang vẽ, không ctrl/meta/alt: `p a r h t` đổi công cụ;
    - phím từ ô chữ không vào đây (Task 3);
    - trong ô chữ: Enter ghi, Esc huỷ (listener trên ô), blur ghi.
  - `markTool` ở cấp module, mặc định `'arrow'`, nhớ giữa các lần mở trong phiên trang (4.12).
- Khoá i18n mới:

| Khoá | en | vi |
| --- | --- | --- |
| `capture.markup` | Markup | Vẽ chú thích |
| `capture.pen` | Pen | Bút |
| `capture.arrow` | Arrow | Mũi tên |
| `capture.rect` | Rectangle | Khung |
| `capture.highlight` | Highlight | Tô sáng |
| `capture.text` | Text | Chữ |
| `capture.undo` | Undo (Ctrl+Z) | Hoàn tác (Ctrl+Z) |

  Tooltip công cụ: `` `${i18n.t(label)} (${key.toUpperCase()})` ``. Tooltip màu: mã hex. Tooltip cỡ: `${n}px`.

- [ ] **Step 1: Viết test fail.**
  - `markup.test.ts` (context giả ghi lệnh):
    - mũi tên `a=[0,0]`, `b=[100,0]`, `size=4`, `k=1` → `lineTo` của thân tại `x = 100 - 20*0.6 = 88`; tam giác có 3 đỉnh, gọi `fill`;
    - `hl` → `globalAlpha === 0.35` lúc `fillRect`;
    - bút 1 điểm → `lineTo(x + 0.01, y)`;
    - `isTooSmall([0,0],[2,2],1) === true`; `([0,0],[10,0],2) === false`;
    - `textFontCss(4) === 22`;
    - `editorCanvasStyle(1000, 2500, 2)` chứa `max-height:none`; `(1000, 1500, 2)` chứa `calc(100vh - 100px)`.
  - `editor.test.ts`:
    - `openCaptureEditor(canvas)` khi phiên chưa mở → `capturing === true`, có host, nút Hoàn tác `disabled`;
    - bật vẽ, nhấn `r` → công cụ Khung `on`; nhấn `r` từ ô `<input class=txt>` → không đổi;
    - Ctrl+Z khi có 1 item → `disabled` trở lại;
    - mở editor lần hai → công cụ mặc định là công cụ dùng cuối.
  - Run: `pnpm vitest run src/lib/markup.test.ts src/content/tools/capture`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Nút "Chụp màn hình" ở thanh chế độ giờ gọi `openCaptureEditor(snap)`.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: capture editor with pen, arrow, rectangle, highlight and text markup" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 6: Chụp cả trang — debugger, lớp che, cuộn-ghép dự phòng

**Files:**

- Create:
  - `src/lib/fullpage.ts`, `src/lib/fullpage.test.ts`
  - `src/content/tools/capture/fullpage.ts`
  - `src/content/tools/capture/Cover.svelte`
  - `src/content/tools/capture/fullpage.test.ts`
- Modify: `src/content/tools/capture/session.ts`, `src/ui/theme.css`, `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `full_capture`, `capture_tab` (Task 2), `withHiddenUi`, `grabVisible`, `openCaptureEditor` (Task 4–5), `mountUi` + `name: 'iodob-cover'`.
- Produces:
  - `src/lib/fullpage.ts`:
    - `MAX_CANVAS = 32000`, `CHUNK = 8000`, `STITCH_MAX = 60`.
    - `pickScroller(cands: Array<{ el: T; clientH: number; scrollH: number; clientW: number; overflowY: string }>): T | null`: port `findScroller` (`fullpage.js:22`): `clientH ≥ 100`, `scrollH > clientH + 1`, overflowY ∈ `auto | scroll | overlay`, lấy diện tích lớn nhất.
    - `fullPagePlan(p: { winTotal: number; ih: number; iw: number; dpr: number; scroller: { scrollH: number; clientH: number } | null }): { width: number; height: number; chunk: number; shift: number }`:
      - `height = round(scroller ? ih + scrollH - clientH : winTotal)`, rồi `min(height, floor(32000 / dpr))`;
      - `chunk = floor(8000 / dpr)`; `shift = ih`;
      - chỉ dùng scroller khi `winTotal - ih < 50` (`fullpage.js:63`).
    - `beforeScript(ih)`, `afterScript()`, `restoreScript(o: { x: number; y: number } | { scrollTop: number })`: chép nguyên văn biểu thức của `fullpage.js:78–85`, đổi `[data-bd-cover]` → `iodob-cover`, `[data-bd-scroll]` → `[data-iodob-scroll]`. Lớp che dời bằng biến CSS (xem dưới), không bằng `style.top`.
    - `stitchHeight(ih, VH, total, k): number`: `min(round((ih - VH + total) * k), 32000)`.
    - `stitchDone(top, VH, total, Tp, k): boolean`: `top + VH >= total - 1 || (Tp + top + VH) * k >= 32000`.
  - **Lớp che dời bằng biến:** `theme.css` có rule `:host(iodob-cover) { top: var(--bd-cover-top, 0px) !important; width: …; height: … }`. Lý do: rule `:host { top: 0 !important }` thắng `style.top` inline. Script đặt `c.style.setProperty('--bd-cover-top', '-${ih}px')` và `after` đặt lại `0px`. Thuộc tính custom không bị `all: initial` reset.
  - `captureFullPage(snap: string): Promise<void>` (4.10; port `fullpage.js:102`):
    - giữ `state.capturing`;
    - `showCover(snap)`: host `iodob-cover`, rộng/cao bằng px; ảnh `brightness(.55)`; thẻ 260px có `capture.fullPageBusy` và thanh chạy `bd-load` 1s;
    - `withHiddenUi(fullPageViaDebugger)`:
      - lỗi thì `note = i18n.t('capture.fastFailed', [e.message])`;
      - thành công thì `openCaptureEditor(canvas, false, note)` **trước**, rồi mới gỡ lớp che (spec §9);
      - thất bại thì gỡ lớp che trước, `stitchFullPage()`, rồi mở editor kèm note.
  - `fullPageViaDebugger()` (`fullpage.js:60`):
    - đánh dấu scroller `data-iodob-scroll`; gửi `full_capture` với `fullPagePlan` + 3 script;
    - ghép các phần theo chiều dọc vào một canvas;
    - `finally`: trả cuộn, gỡ attr.
  - `stitchFullPage()` (`fullpage.js:127`): port từng dòng:
    - ≤60 lần; `frames()` mỗi lần; từ lần thứ hai chờ 550ms;
    - nền trắng; vẽ vùng cuộn;
    - sau lát đầu, nếu cuộn window thì `hideFixed()` (fixed/sticky → `visibility:hidden !important`, lưu giá trị cũ cùng priority);
    - phần dưới container lấy từ ảnh cuối;
    - `finally`: trả `visibility` và vị trí cuộn.
- Khoá i18n mới:

| Khoá | en | vi |
| --- | --- | --- |
| `capture.fullPageBusy` | Capturing full page… | Đang chụp cả trang… |
| `capture.fastFailed` | Fast capture failed ($1), used scroll & stitch instead. Close DevTools on this tab if it is open. | Không chụp nhanh được ($1), đã chuyển sang cuộn để chụp. Nếu đang mở DevTools ở tab này thì đóng lại rồi thử lại. |

- [ ] **Step 1: Viết test fail.**
  - `fullpage.test.ts` (lib):
    - `pickScroller`: phần tử `clientH 80` bị loại; `overflowY 'visible'` bị loại; hai ứng viên thì chọn diện tích lớn hơn;
    - `fullPagePlan({winTotal:50000, ih:900, iw:1280, dpr:2, scroller:null})` → `{height:16000, chunk:4000, shift:900}`;
    - `winTotal: 920` (lệch < 50) + `scroller {scrollH: 5000, clientH: 800}` → `height === 900 + 4200`;
    - `afterScript()` trả `transform` bằng `setProperty(t[0], t[1])` (giữ priority); `beforeScript(900)` chứa `translateY(900px)` và `--bd-cover-top`;
    - `stitchDone(4100, 900, 5000, 0, 1) === true`.
  - `fullpage.test.ts` (content):
    - `full_capture` trả `{ok:false, error:'Another debugger is already attached'}` → `grabVisible` được gọi (cuộn-ghép), editor mở với note chứa `Another debugger is already attached`;
    - sau đó: không còn host `iodob-cover`; không phần tử nào giữ `visibility: hidden` do mình đặt; `scrollY` về giá trị cũ (Review Focus 2);
    - `stopSession()` giữa lúc chờ `full_capture` → host cover bị gỡ, `capturing === false` (Review Focus 4).
  - Run: `pnpm vitest run src/lib/fullpage.test.ts src/content/tools/capture`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Nút "Chụp cả trang" gọi `closeCapture()` rồi `captureFullPage(snap)`. Để giữ `capturing` liên tục, `closeCapture({ keepCapturing: true })` không bật lại UI chính (bản cũ `withHiddenUi` lại ẩn ngay; bản mới tránh nháy).
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: full-page capture via debugger with scroll-and-stitch fallback" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 7: Chụp phần tử đang chọn, flash, kênh `save_screenshot`, sửa ảnh đè

**Files:**

- Create: `src/content/tools/capture/element.ts`
- Modify:
  - `src/content/tools/capture/index.ts`, `capture.test.ts`
  - `src/lib/messaging.ts` (`ContentApi.save_screenshot(): void`)
  - `src/entrypoints/content/index.ts`
  - `src/content/tools/overlay/index.ts`, `src/content/tools/overlay/overlay.test.ts`

**Interfaces:**

- Consumes: `elementCaptureRect`, `isFullyVisible` (Task 1), `capture_tab` (Task 2), `hideUi('keepHighlight' | 'all')`, `screenshotPrefs` (Task 3), `openCaptureEditor` (Task 5).
- Produces:
  - `captureElement(el: Element): Promise<void>` (4.05; port `saveScreenshot` `:46700`–`:46870`):
    1. `state.capturing = true`; lưu `scrollX` / `scrollY`;
    2. phần tử không nằm trọn trong màn hình thì `scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' })` (lỗi thì `scrollIntoView()`);
    3. `hideUi(includeHighlights(prefs) ? 'keepHighlight' : 'all')`;
    4. `rects` = rect của `el` + (nếu giữ highlight) rect của các box trong painter `inspector` (tag, margin);
    5. chờ 2 rAF; `capture_tab(elementCaptureRect(rects, innerWidth, innerHeight, devicePixelRatio || 1))`;
    6. thành công thì `openCaptureEditor(dataUrl)` + `flash()`;
    7. `finally`: nếu chưa mở editor thì `hideUi(null)` và `capturing = false`; trả cuộn nếu đã đổi.
    - `includePadding` không gửi đi: bản cũ gửi nhưng background bỏ qua.
  - `flash()` (port `animateScreenshotEffect` `:47765`): một `div` nền `#fff` phủ trong host chụp; sau 100ms chuyển `background-color 0.25s ease` về `transparent`, rồi gỡ.
  - Nút "Phần tử đang chọn" ở thanh chế độ: `closeCapture({ keepCapturing: true })` rồi `captureElement(state.selected)`.
  - `ContentApi.save_screenshot` (9.39): ở khung top, `openCaptureBar(...)` như phím 8. Đang pause hoặc đang capturing thì bỏ qua.
  - Ảnh đè (3.25): không cần sửa logic, vì `routeKey` đã chặn khi `capturing` (Task 3). Chỉ thêm test hồi quy.
- [ ] **Step 1: Viết test fail.**
  - `capture.test.ts`:
    - `captureElement(p)` với `getBoundingClientRect` stub `{left:100,top:100,right:200,bottom:150}`, `devicePixelRatio = 2`, prefs `null` → `capture_tab` nhận `{left:100,top:100,right:500,bottom:400}`; host chính `data-capture='keepHighlight'` lúc gọi;
    - prefs `{ includeHighlights: false }` → `data-capture='all'`;
    - `capture_tab` trả lỗi → `capturing === false`, không còn `data-capture`, `scrollTo` về chỗ cũ;
    - handler `save_screenshot` → mở thanh chế độ.
  - `overlay.test.ts`: một ảnh đè được chọn, `state.capturing = true`, `ArrowLeft` → `x` không đổi.
  - Run: `pnpm vitest run src/content/tools/capture src/content/tools/overlay`. Expected: FAIL.
- [ ] **Step 2: Viết code.**
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: selected-element capture, flash and save_screenshot channel" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 8: Đổi nhãn kiểm kê, thử tay trên Edge

**Files:**

- Modify: `docs/inventory.md`

- [ ] **Step 1: Đổi nhãn theo bảng "Phạm vi"** ở đầu plan.
  - Dòng chỉ dời một phần thì tách thành dòng mới, đánh số tiếp cuối mục (4.15, 4.16…; 9.42…), ghi `(tách từ X)`, giữ nguyên tham chiếu code cũ:
    - 4.05: phần chế độ sửa → `đợt 5`;
    - 4.13: thẻ preview + trình xem → `đợt 6`;
    - 4.02: nhánh "gửi dataUrl lên" → `đợt 6`;
    - 9.29 / 9.33: công tắc ở trang cài đặt → `đợt 7`.
  - 4.06 đổi `đợt 3` thành `đợt 6`. 9.36 đánh `[x]` với ghi chú "không có trong bản cũ — không áp dụng".
  - Run: `pnpm vitest run docs/inventory.test.ts`. Expected: PASS (không mất tên nào).
- [ ] **Step 2: Build và đưa checklist cho chủ dự án.** Controller **trình bày danh sách dưới đây rồi đi tiếp, không chờ kết quả**. Chủ dự án tự đánh `[x]` sau khi thử.
  1. `pnpm build`, reload `.output/chrome-mv3` trong `edge://extensions`, không có lỗi đỏ (cả service worker).
  2. Dock có nút Chụp (camera) ở nhóm tiện ích, tooltip `(8)`. Pause thì nút bị khoá.
  3. Phím `8` trên một trang https:
     - dock, panel, popover biến mất, không nháy;
     - màn hình đóng băng (cuộn chuột không đổi ảnh);
     - thanh chế độ ở giữa trên, "Chụp vùng" bật.
  4. Kéo vùng:
     - thanh chế độ mất ngay khi vùng ≥4px;
     - viền nét đứt trắng, nền ngoài tối, 8 tay nắm;
     - kéo giữa dời được, kéo cạnh/góc co giãn được, con trỏ đổi đúng;
     - thanh Copy/Lưu/Vẽ chú thích nằm dưới vùng; vùng sát đáy thì thanh lên trên.
  5. Copy → nút "Đã copy" rồi đóng; dán vào Paint ra đúng vùng (sắc nét, đúng DPR). Lưu → file `hostname-2026-…png`.
  6. **Trang http** (vd. `http://neverssl.com`): Copy hiện "Lỗi" rồi trở lại; Lưu vẫn tải được.
  7. "Vẽ chú thích":
     - mở trình sửa với Bút bật;
     - P/A/R/H/T đổi công cụ; đủ 6 màu, 3 cỡ;
     - mũi tên/khung/tô sáng kéo mượt; click không kéo thì không để lại hình;
     - Chữ: gõ "pa" không đổi công cụ; Enter ghi; Esc chỉ huỷ ô chữ;
     - Ctrl+Z hoàn tác;
     - đóng rồi mở lại thì vẫn là công cụ dùng cuối.
  8. "Chụp màn hình": trình sửa hiện ngay ảnh đóng băng, không có hiệu ứng fade lộ trang.
  9. "Chụp cả trang" trên một trang dài (vd. developer.mozilla.org):
     - lớp che mờ + "Đang chụp cả trang…";
     - không thấy trang nhảy;
     - Edge hiện thanh "đang gỡ lỗi" một lúc;
     - ảnh đủ trang, không lặp ô;
     - xong thì vị trí cuộn như cũ.
  10. Mở DevTools ở tab đó rồi chụp cả trang: chuyển sang cuộn (chậm). Header fixed chỉ xuất hiện một lần. Trình sửa có ghi chú lý do. Header hiện lại sau khi xong.
  11. Trang cuộn trong khung riêng (vd. Gmail hoặc một app full-height): ảnh cả trang chứa đủ nội dung khung cuộn.
  12. Inspector bật, chọn một phần tử, phím `8`:
      - có nút "Phần tử đang chọn";
      - bấm thì ảnh quanh phần tử (+50px) mở trong trình sửa, có highlight + tag;
      - đặt `chrome.storage.local.set({screenshotPreferences:{includeHighlights:false}})` trong console SW rồi chụp lại thì không có highlight.
  13. Trong lúc UI chụp mở:
      - phím `2`…`7`, `O`/`M`/`A` không làm gì;
      - có ảnh đè thì mũi tên không dời ảnh;
      - Esc đóng; đóng xong dock và công cụ trở lại đúng trạng thái.
  14. Ctrl+Q khi đang mở trình sửa, và khi đang chụp cả trang:
      - DevTools không còn `iodob-capture` / `iodob-cover`;
      - `<html>` không còn `transform`;
      - bật lại thì chụp được ngay.
  15. Bấm `8` / Esc liên tục 5–6 lần: không có lỗi quota `captureVisibleTab` trong console SW.
  16. Theme sáng/tối của extension: thanh chụp và trình sửa đổi theo. Trang có `html { font-size: 10px }`: thanh không co.
- [ ] **Step 3: Commit nhãn mới.** `git commit -am "docs: retag deferred phase-3 inventory lines" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

## Xong khi

- `pnpm check` và `pnpm build` qua.
- Checklist thử tay ở Task 8 đã chuyển cho chủ dự án.
- Mọi dòng `đợt 3` trong `docs/inventory.md` hoặc đã đổi nhãn theo bảng Phạm vi, hoặc chờ chủ dự án đánh `[x]` sau khi thử tay.

## Ghi chú cho các đợt sau

- **Ẩn UI khi chụp:** UI mới trong host chính tự ẩn theo `data-capture`. Painter nào **nên** vào ảnh chụp phần tử thì phải là painter `inspector`, hoặc sửa danh sách giữ lại trong `theme.css`.
- **Phím:** công cụ mới không cần tự kiểm `state.capturing`, vì `routeKey` đã chặn. Kéo mới vẫn dùng `startDrag`, và nó cũng đã chặn.
- **Đợt 5:** chụp phần tử khi đang ở chế độ sửa thì ẩn cả highlight (dòng tách từ 4.05). Vào chế độ sửa thì `closeCapture()`.
- **Đợt 6:**
  - chụp trong iframe responsive (4.06): snapshot DOM, `screenshot_flash` báo khung cha;
  - thẻ preview 8s + trình xem toàn màn hình (tách từ 4.13);
  - nhánh `capture_tab` / `download_image` nhận `dataUrl` gửi lên (tách từ 4.02);
  - `save_screenshot` ở responsive chuyển xuống iframe (`sendToIframe`).
- **Đợt 7:** trang cài đặt có công tắc `includePadding` / `includeHighlights`, ghi vào `screenshotPreferences`. Content đã nghe sẵn.
- **Đợt 8:** MCP `get_screenshot` dùng lại `capture_tab` (và `full_capture` nếu cần ảnh cả trang). Không viết đường chụp thứ hai.

## Quyết định đã chốt (chủ dự án, 2026-11-03)

1. Copy ảnh trên trang không phải secure context: thêm chuỗi `capture.copyNeedsHttps` (en "Copy needs HTTPS — use Save" / vi "Copy cần HTTPS — hãy dùng Lưu") thay cho "Lỗi". Task 3 thêm key vào `src/locales/{en,vi}.json`.
2. Vào ảnh chụp: theo bản cũ (ảnh đè và X-Ray vào ảnh; lưới, gióng, khung đo ẩn; chụp phần tử chỉ giữ highlight inspector).
3. Gộp `download_image` vào `capture_tab(null)`; đợt 6 thêm lại nếu cần.
4. Chữ chú thích đốt vào ảnh giữ font `system-ui` như bản cũ.
5. Giữ giãn cách `captureVisibleTab` 550ms ở background.
6. Thanh "đang gỡ lỗi" của Edge khi chụp cả trang là hành vi trình duyệt, không coi là lỗi.
