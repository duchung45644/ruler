# PixelLens — Đợt 2: Đo & căn chỉnh — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bản mới có đủ bộ đo và căn chỉnh của bản cũ: thước + chữ thập, gióng kéo từ thước, đo vùng + panel, lưới layout, breakpoints, X-Ray, đè ảnh thiết kế, tìm phần tử, hút màu, màu & font của trang; phím 2–7, O/M/A; bật lại công cụ theo lần trước.

**Architecture:**
- **Mọi công cụ là một mục registry** (`registerItem`) trong `src/content/tools/<tên>/`. Dock, phím số, phím chữ đều đọc từ registry. Không có `switch` theo id.
- **Một cơ chế kéo dùng chung** (`src/content/core/drag.ts`). Ghim inspector, gióng, khung đo, ảnh đè và thanh tiêu đề panel đều kéo qua nó. Cờ "đang kéo / vừa kéo" chặn click sau khi thả và chặn hover-inspect.
- **Vẽ trên trang:**
  - gióng, khung đo, highlight của tìm/màu & font, vạch breakpoint, lưới: painter trên lớp overlay có sẵn (`addPainter`);
  - thước: một khối DOM bền, dựng lại khi đổi kích thước, chữ thập cập nhật thẳng theo `mousemove`;
  - X-Ray và ảnh đè nằm **trong DOM của trang** (giống bản cũ): `<style>` cần áp vào phần tử trang, và `mix-blend-mode: difference` không trộn được xuyên qua host (host là stacking context riêng).
- **Panel công cụ** (đo vùng, đè ảnh, màu & font) dùng chung một vỏ `ToolPanel.svelte`. **Popover dock** (grid, tìm) dùng chung `Popover.svelte`, chỉ một cái mở một lúc.
- **Logic thuần** (hình học khung đo, hít gióng, breakpoint, X-Ray, ảnh đè, quét style, tìm) ở `src/lib/`, có unit test.

**Tech Stack:** Giữ nguyên stack Đợt 1: WXT 0.21.5, Svelte 5, Tailwind 4, `@lucide/svelte`, `@wxt-dev/i18n`, Vitest + happy-dom 21.0.3. **Không thêm dependency.**

**Spec:** `docs/superpowers/specs/2026-11-01-pixellens-rewrite-design.md`. Các mục liên quan:
- §3 Ràng buộc
- §4.1 (phím số, X-Ray, tìm, hút màu), §4.2 Đo và căn chỉnh
- §6.3 DRY, §6.4 Đường chạy liên tục
- §7 Giao diện mới
- §8 Đợt 2
- §9 "Inspector / chọn", "Đo / đè ảnh", "Giao diện trong trang"
- §11 Để người làm tự quyết

**Checklist hành vi:** các dòng `đợt 2` trong `docs/inventory.md` (26 dòng: 1.31, 1.38, 1.43, 1.45, 3.02–3.20, 9.24, 9.27, 9.35). **Code cần port:**
- `unpacked/scripts/bd/{core,measure-guides,overlay,audit}.js`: code của chủ dự án. Port sát, giữ nguyên hành vi, số, chuỗi.
- `legacy-src/content.js`: chỉ đọc đoạn theo số dòng ghi trên từng dòng kiểm kê (grep tên hàm). Không đọc cả file.

## Phạm vi — phần dời sang đợt khác và quyết định

Theo quy tắc "Dòng gộp" của `docs/inventory.md`, Task 11 tách các phần sau thành dòng mới (đánh số tiếp cuối mục, ghi `(tách từ X)`):

| Dòng | Phần dời | Sang |
| --- | --- | --- |
| 3.02 | X-Ray tắt khi vào chế độ sửa | 5 |
| 3.06 | Breakpoints ở responsive bật chế độ khung theo mốc | 6 |
| 3.07 | Copy màu theo `colorFormat` (đợt này chỉ HEX, như 2.10) | 4 |
| 3.12 | `openCaptureBar`, `openCaptureEditor` | 3 |
| 3.15 | "không khi xem ảnh chụp" (`__bdViewerOpen`) | 3 |
| 1.31 | Popover MCP | 8 |
| 9.24 | Hộp thoại trong trang: không công cụ đợt 2 nào dùng; nơi dùng đầu tiên là 2.16 / 2.20 | 4 |
| 9.35 | Hoạ tiết/icon `scripts/patterns/*`: thay bằng Lucide và CSS, không cần `web_accessible_resources`. Đánh `[x]` với ghi chú "thay bằng Lucide/CSS — không áp dụng" | — |

**Quyết định khi spec, kiểm kê và code cũ lệch nhau:**
- **Gióng và khung đo vẽ nét liền** (spec §7: "không có đường gióng nét đứt"). Bản cũ dùng nét đứt cho "Đường gióng" của khung đo. Màu, nhãn và số giữ như bản cũ.
- **Nhãn của gióng và khung đo giữ dạng chip có nền như bản cũ.** Chúng nằm trên nội dung tuỳ ý nên cần nền để đọc được. Font đổi sang Geist Mono. Kiểu C (không nền) chỉ áp cho số đo của inspector.
- **Panel công cụ theo theme của extension** (`data-theme`, token §7), không theo `prefers-color-scheme` như `PANEL_CSS` cũ.
- **Chuỗi của công cụ bd đi qua `i18n.t()`** (spec §6.3). `@wxt-dev/i18n` cũng chọn ngôn ngữ theo giao diện trình duyệt, nên hành vi `T()` của 9.27 giữ nguyên.
- **`__bdTools`** (3.12) thay bằng registry: `toggle` là `run`, `isActive` là `isActive`, `onChange` là trạng thái nút do Svelte tự vẽ, `destroy` là `onStop`.
- **Pause:** công cụ đợt 2 không nhận chuột/phím khi `state.paused` (lớp overlay đã ẩn). Ảnh đè trong DOM trang cũng ẩn khi pause, để "tạm dừng" nghĩa là trang sạch.

## Global Constraints

- **Giữ mọi ràng buộc của Đợt 0–1:**
  - phiên bản ghim chính xác; không thêm dependency;
  - manifest không có `host_permissions` / `content_scripts`;
  - chỉ `en` và `vi`;
  - không sửa `unpacked/` và `legacy-src/`;
  - commit kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`;
  - mọi lệnh chạy ở gốc repo bằng Git Bash.
- **Chuỗi giao diện:**
  - chỉ qua `i18n.t()`, khoá lồng nhau trong `src/locales/{en,vi}.json`;
  - chuỗi có ở `unpacked/_locales/{en,vi}/messages.json` thì chép nguyên văn;
  - chuỗi `T(en, vi)` của `unpacked/scripts/bd/*.js` thì chép nguyên văn cả hai bản;
  - bảng khoá mới cho trong từng task.
- **Đơn vị trong trang:** chỉ `px`. Không đăng ký `@property` lên trang.
- **Token §7** dùng từ `src/ui/theme.css`. Không thêm khối CSS tay theo màn hình.
- **Đường chạy liên tục** (kéo, rê, cuộn, chữ thập) viết TS thuần, gom theo rAF. Không đọc/ghi `$state` Svelte trong `pointermove`, trừ khi panel cần hiện số đang đổi (ô X/Y, W/H). Khi đó ghi một lần mỗi frame trong painter.
- **Listener:** mọi listener gắn `{ signal: sessionSignal() }`. Thứ gì công cụ chèn vào DOM trang (style X-Ray, ảnh đè, `cursor` trên `<html>`) phải gỡ trong `onStop`.
- **Khoá storage giữ đúng tên bản cũ:** `settings.xrayModeIsOn`, `settings.rulerIsOn`, `settings.breakpointsIsOn`, `settings.layoutGrid.*`, `bdMeasureColor`, `bdMeasureGuides`.
- **`pnpm check` và `pnpm build`** phải qua ở cuối mỗi task.

## Review Focus

1. **Kéo (ghim, gióng, khung đo, ảnh) rồi thả trên link/nút của trang, khi inspector đang bật.**
   - Mong đợi: trang không nhận click; vùng chọn không đổi; không hover-inspect trong lúc kéo.
   - Kiểm bằng: `drag.test.ts` và test hồi quy trong `inspector.test.ts` (Task 1).
2. **Gõ trong ô của panel/popover** (W/H của đo vùng, ô selector của tìm, ô hex của grid).
   - Mong đợi: số không bật công cụ, mũi tên không dời khung/ảnh, Esc không xoá khung.
   - Kiểm bằng: test `addKeyHandler` bỏ qua phím từ `<input>` trong shadow (Task 3); test mũi tên từ ô W (Task 7).
3. **Trang có stylesheet khác domain** (đọc `cssRules` ném `SecurityError`) **hoặc có shadow root.**
   - Mong đợi: breakpoints bỏ qua sheet lỗi, không văng; X-Ray và tìm phủ cả shadow root mở.
   - Kiểm bằng: `breakpoints.test.ts`, `xray.test.ts` (Task 4), `find.test.ts` (Task 9).
4. **Selector sai cú pháp trong ô tìm** (`div[`, `>>`).
   - Mong đợi: im lặng, tiêu đề về `FIND_ELEMENT`, không lỗi console, highlight cũ bị xoá.
   - Kiểm bằng: `find.test.ts` (Task 9).
5. **Thoát (Ctrl+Q / bấm icon) khi X-Ray, ảnh đè, thước, khung đo đang bật.**
   - Mong đợi: trang sạch hoàn toàn: không còn `<style>` X-Ray (kể cả trong shadow root), không còn `<img>` ảnh đè, `<html>` không còn `cursor`. Bật lại thì công cụ có lưu trạng thái (X-Ray/grid/thước/breakpoints) tự bật lại.
   - Kiểm bằng: test `onStop` trong `xray.test.ts` (Task 4), `overlay-image` (Task 8); test khôi phục (Task 3).

---

### Task 1: Cờ kéo dùng chung — sửa hồi quy click sau khi kéo ghim

**Lỗi:** `PinnedInspector.svelte:45` thêm listener nuốt `click` (window capture, `once`) **lúc thả chuột**. Listener `click` của inspector cũng ở window capture, đăng ký sớm hơn, và gọi `stopImmediatePropagation`. Kết quả: thả ghim trên trang thì click chọn/bỏ chọn phần tử thay vì bị nuốt.

**Files:**

- Create: `src/content/core/drag.ts`, `src/content/core/drag.test.ts`
- Modify:
  - `src/content/core/session.ts` (gắn guard đầu tiên trong `start`, trước mọi công cụ)
  - `src/content/tools/inspector/index.ts` (hover, `block` và `click` hỏi cờ)
  - `src/content/tools/inspector/PinnedInspector.svelte` (dùng `startDrag`, bỏ swallow tự chế)
  - `src/content/tools/inspector/pins.svelte.ts` (bỏ `pinUi.dragging`)
  - `src/content/tools/inspector/inspector.test.ts`

**Interfaces:**

- Consumes: `sessionSignal`, `onStop` (Đợt 1).
- Produces (`src/content/core/drag.ts`):
  - `startDrag(e: PointerEvent, onMove: (m: PointerEvent) => void, onEnd?: (u: PointerEvent) => void): void`
    - `preventDefault` + `stopImmediatePropagation` trên `e`;
    - gắn `pointermove` / `pointerup` lên `window` (capture) bằng `AbortController` riêng, tự abort khi thả hoặc khi phiên dừng;
    - trong lúc kéo: `isDragging() === true`;
    - khi thả: gọi `onEnd`, rồi bật cờ "vừa kéo", tự xoá sau 50ms (spec §9).
  - `isDragging(): boolean`: đang kéo **hoặc** vừa kéo (≤50ms).
  - `swallowAfterDrag(e: Event): boolean`: nếu `isDragging()` thì `preventDefault` + `stopImmediatePropagation`. Với `click`, nó xoá luôn cờ "vừa kéo". Trả `true` nếu đã nuốt.
  - `installDragGuard(signal: AbortSignal): void`: gắn `swallowAfterDrag` cho `mousedown`, `mouseup`, `click`, `mousemove` trên `window` capture. Gọi **trước** mọi công cụ trong `start()` của `session.ts`, nên luôn chạy trước listener của inspector.
  - `resetDrag(): void` (đăng ký vào `onStop`).
- Inspector: dòng đầu của handler `mousemove`, `block` và `click` là `if (isDragging()) return;`. Guard vẫn nuốt, inspector chỉ không xử lý thêm. Thay `pinUi.dragging` bằng `isDragging()`.

- [ ] **Step 1: Viết test fail.**
  - `drag.test.ts` (happy-dom, `vi.useFakeTimers()`):
    - `installDragGuard(signal)`; một listener `click` trên `document` đếm số lần;
    - `startDrag(pointerdown)`; `isDragging() === true`; dispatch `pointermove` thì `onMove` được gọi;
    - dispatch `pointerup` thì `onEnd` được gọi; dispatch `click` ngay sau đó thì bộ đếm vẫn `0`;
    - kéo lần nữa, thả, `vi.advanceTimersByTime(60)`, rồi `click` thì bộ đếm là `1`: cờ đã tự xoá;
    - abort `signal` giữa lúc kéo thì `pointermove` sau đó không gọi `onMove`.
  - `inspector.test.ts`, test hồi quy:
    - `installDragGuard` trước `initInspector()`, `state.inspectOn = true`, `state.selected = null`;
    - giả lập kéo bằng `startDrag` rồi `pointerup`, sau đó `click` lên một `<p>` (stub `elementsFromPoint` trả `[p]`);
    - kỳ vọng `state.selected === null`.
  - Run: `pnpm vitest run src/content/core/drag.test.ts src/content/tools/inspector`. Expected: FAIL (module chưa có; test hồi quy chọn `<p>`).
- [ ] **Step 2: Viết `drag.ts`**, gắn guard trong `session.ts`, sửa inspector và `PinnedInspector.svelte` (`drag` gọi `startDrag(e, move)`; kẹp toạ độ giữ như cũ).
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "fix: shared drag guard swallows the click after any drag" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 2: Dock — `alwaysEnabled`, nhóm mới, popover

**Files:**

- Create: `src/ui/Popover.svelte`
- Modify:
  - `src/content/core/registry.svelte.ts`, `src/content/core/state.svelte.ts`
  - `src/content/core/keys.ts`, `src/content/core/keys.test.ts`
  - `src/lib/geometry.ts`, `src/lib/geometry.test.ts`
  - `src/ui/Dock.svelte`, `src/ui/DockButton.svelte`

**Interfaces:**

- Consumes: `items`, `registerItem`, `setPaused`, `state` (Đợt 1).
- Produces:
  - `DOCK_GROUPS = ['selections', 'inspectTools', 'utilities', 'environment', 'designTools', 'quit']` (1.16 + 1.45, thứ tự của `getControlBar` `:30105`). Nhóm rỗng không vẽ.
  - `DockItem` thêm ba trường:
    - `alwaysEnabled?: boolean`: không khoá khi pause. `pause` và `quit` đặt `true`; xoá mảng `ALWAYS_ON` trong `Dock.svelte`.
    - `popover?: Component`: Dock vẽ component này phía trên nút khi `state.popover === item.id`.
    - `runKey?(): void`: phím tắt gọi hàm này thay `run` (grid: phím 3 bật/tắt lưới, nút mở popover).
  - `state.popover: string | null` (mặc định `null`; `stopSession` đặt lại).
  - `togglePopover(id: string): void` trong `registry.svelte.ts`: mở cái này thì đóng cái khác (1.31; `closeOtherPopovers` `:38452`).
  - `popoverLeft(btn: Rect, dock: Rect, width: number): number` trong `geometry.ts`. Port `positionPopover` (`:38491`):
    ```ts
    clamp(btn.x + btn.width / 2 - dock.x - width / 2, 0, dock.width - width)
    ```
- Hành vi:
  - đóng mọi popover khi thu dock (1.19), khi pause (1.17), và khi Esc mà không có phần tử chọn (`executeShortcut` `:47540`);
  - tooltip của nút đang mở popover bị ẩn (1.31);
  - `routeKey` so phím không phân biệt hoa thường (`e.key.toLowerCase() === item.key`). Tooltip in hoa phím chữ: `(O)`, `(M)`, `(A)`.
- Popover đóng thì component bị huỷ. Công cụ dùng `onDestroy` của popover để dọn (ví dụ tìm: nhớ truy vấn, xoá highlight). Không cần API "on close" riêng.

- [ ] **Step 1: Viết test fail.**
  - `geometry.test.ts`:
    - `popoverLeft({x:100,y:0,width:26,height:26}, {x:50,y:0,width:400,height:34}, 200)` → `0` (kẹp trái);
    - nút ở giữa: `popoverLeft({x:250,y:0,width:26,height:26}, dock, 100)` → `163`;
    - nút sát phải: `popoverLeft({x:430,y:0,width:26,height:26}, dock, 200)` → `200` (`dock.width - width`).
  - `keys.test.ts`:
    - item `key: 'o'` chạy khi nhấn `O` (Shift+o) và `o`;
    - item có `runKey` thì phím gọi `runKey`, không gọi `run`;
    - `state.popover = 'find'`, không có phần tử chọn, nhấn Esc → `state.popover === null`.
  - Run: `pnpm vitest run src/lib/geometry.test.ts src/content/core/keys.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code** theo Interfaces. `Popover.svelte`: bề mặt token §7, bo `rounded-panel`, đặt `bottom: 100% + 8px` so với dock, `left` = `popoverLeft(...)` đo bằng `getBoundingClientRect` khi mở.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: dock popovers, alwaysEnabled items and new dock groups" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 3: Khung cho công cụ — settings, khôi phục, panel, phím, node của mình

**Files:**

- Create:
  - `src/ui/ToolPanel.svelte`
  - `src/content/tools/index.ts`: `initTools()`
- Modify:
  - `src/lib/settings.ts`, `src/lib/settings.test.ts`
  - `src/lib/dom.ts`, `src/lib/dom.test.ts`
  - `src/content/core/events.ts`, `src/content/core/events.test.ts`
  - `src/content/core/keys.ts`, `src/content/core/keys.test.ts`
  - `src/content/core/session.ts` (`resize` → `requestPaint`)
  - `src/ui/mount.ts`
  - `src/entrypoints/content/index.ts` (`start` gọi `initTools()` **trước** `initInspector()`)
  - `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `startDrag` (Task 1), `sessionSignal`, `onStop`, `layer`.
- Produces:
  - `Settings` thêm trường. Mặc định theo `legacy-src/content.js:26936`:
    ```ts
    xrayModeIsOn: boolean;     // false
    rulerIsOn: boolean;        // false
    breakpointsIsOn: boolean;  // false
    layoutGrid: { isOn: boolean; columns: number; maxWidth: 'auto' | number; gutter: number; margin: number; color: string; opacity: number };
    // { isOn: false, columns: 8, maxWidth: 'auto', gutter: 20, margin: 40, color: '#FC48FF', opacity: 0.3 }
    ```
    `updateSettings` vẫn trộn nông, nên người gọi luôn ghi cả object `layoutGrid`.
  - `measureColor = storage.defineItem<string>('local:bdMeasureColor', { fallback: '#FF3B6B' })` và `measureGuides = storage.defineItem<boolean>('local:bdMeasureGuides', { fallback: false })` (9.27).
  - `shadowRoots(root: Document | ShadowRoot, isOwn: (el: Element) => boolean, depth = 0): ShadowRoot[]` trong `dom.ts`: mọi shadow root **mở**, lồng nhau, theo thứ tự cây (bản `oe(document)` cũ). Dùng cho X-Ray, breakpoints, tìm.
  - `ownNodes: Set<Element>` trong `events.ts`. `isOwnEvent` và `pageElementAt` coi phần tử trong set (và con của nó) là của extension, giống `ownNodes()` cũ ở `core.js`. Ảnh đè tự thêm/xoá mình.
  - `addKeyHandler(fn: (e: KeyboardEvent) => boolean): () => void` trong `keys.ts`.
    - `routeKey` chạy các handler theo thứ tự đăng ký, **sau** quit và `shouldIgnoreKey`, **trước** Esc mặc định và phím item.
    - Handler đầu tiên trả `true` thì dừng, và `preventDefault`.
    - Thứ tự đăng ký trong `initTools()`: đè ảnh trước đo vùng (bản cũ: overlay nạp trước để thắng phím mũi tên, 1.02 / 3.15).
  - `mountInShadow(shadow: ShadowRoot, component: Component, props?: Record<string, unknown>): () => void` trong `src/ui/mount.ts`: gắn vào một `div` mới trong shadow root, trả hàm gỡ.
  - `ToolPanel.svelte` (3.11, port `makePanel` `core.js:218`):
    - props: `{ title: string; onclose: () => void; actions?: Snippet; children: Snippet }`;
    - `fixed`, góc phải trên `16px`, rộng `300px`, `max-height: calc(100vh - 120px)`, thân cuộn được;
    - kéo bằng thanh tiêu đề qua `startDrag` (không ra khỏi mép trái/trên);
    - nút đóng có `aria-label` / `title` là `common.close`;
    - bề mặt token §7.
  - `initTools(): Promise<void>` gọi theo thứ tự: `initXray`, `initBreakpoints`, `initGrid`, `initRuler`, `initOverlayImages`, `initMeasure`, `initFind`, `initEyedropper`, `initAudit`. Mỗi task sau thêm một dòng.
  - **Khôi phục lúc khởi động (1.43):** mỗi `init*` đọc `getSettings()` và, nếu cờ bật, gọi cùng hàm bật như khi bấm nút. Không thêm cơ chế khôi phục chung.

- [ ] **Step 1: Viết test fail.**
  - `settings.test.ts`:
    - storage rỗng → `layoutGrid.columns === 8`, `layoutGrid.color === '#FC48FF'`, `rulerIsOn === false`;
    - `measureColor.getValue()` → `'#FF3B6B'`; `measureGuides.getValue()` → `false`.
  - `dom.test.ts`: `div > host1(shadow: span > host2(shadow: b))` → `shadowRoots(document, isOwn)` có 2 phần tử; shadow `closed` không được tính.
  - `events.test.ts`: `<img>` trong `ownNodes`, event từ nó → `isOwnEvent === true`.
  - `keys.test.ts`:
    - hai handler, cái đầu trả `true` → cái sau không chạy, `defaultPrevented`;
    - keydown `ArrowLeft` từ `<input>` trong một shadow root → handler không chạy (Review Focus 2).
  - Run: `pnpm vitest run src/lib src/content/core`. Expected: FAIL.
- [ ] **Step 2: Viết code** theo Interfaces.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: tool scaffolding — settings, tool panel, key handlers, own nodes" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 4: X-Ray (2), Breakpoints (5), Hút màu (6)

**Files:**

- Create:
  - `src/lib/xray.ts`, `src/lib/xray.test.ts`
  - `src/lib/breakpoints.ts`, `src/lib/breakpoints.test.ts`
  - `src/content/tools/xray/index.ts`
  - `src/content/tools/breakpoints/index.ts`
  - `src/content/tools/eyedropper/index.ts`
- Modify:
  - `src/content/tools/index.ts`
  - `src/content/core/state.svelte.ts`, `src/ui/DockButton.svelte` (thông báo trên nút)
  - `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `registerItem`, `shadowRoots`, `getSettings` / `updateSettings`, `addPainter`, `copyText` (`src/lib/clipboard.ts`), `toHex` / `parseColor`.
- Produces:
  - `XRAY_COLORS = ['#FF3F25','#EF8400','#CB9800','#999999','#A5D8FF','#304CFF','#339AF0','#2B7FCC','#1E6FB8','#155FA3','#0D4F8F']`
  - `xraySheet(scope: 'body' | ':host', depth: number): string`. Port `buildXraySheet` (`:41863`):
    - mức `i` (0…10) dùng màu `XRAY_COLORS[min(i + depth, 10)]`;
    - selector `scope > * > …` (`i + 1` lần), riêng mức cuối là `scope *`;
    - `outline: 1px solid <màu> !important` (bỏ `--ui-scale`, đợt 6);
    - kèm khối loại trừ: svg con, ẩn, `head`, … và node của extension (`pixellens-ui`, `[data-pixellens]`) → `outline:none!important`.
  - `xrayDepth(host: Element): number`: số tổ tiên tới `body`, đi xuyên shadow host (`xrayDepthOfHost`).
  - `type Breakpoint = { width: number; kind: 'min' | 'max' | 'both' }`
  - `parseBreakpoints(conditions: string[]): Breakpoint[]`. Port `getPageBreakpoints` (`:48891`):
    - regex `/(min|max)-width:\s*([\d.]+)(px|em|rem)/g`, em/rem ×16;
    - gộp theo `Math.round`; `min` lấy `ceil`, `max` lấy `floor`; trùng kiểu khác nhau → `both`;
    - sắp tăng dần.
  - `mediaConditions(roots: (Document | ShadowRoot)[]): string[]`: duyệt `styleSheets` + `adoptedStyleSheets`; sheet nào ném lỗi khi đọc `cssRules` thì bỏ qua.
  - `breakpointLabel(b: Breakpoint): string`: `≥768px` / `≤767px` / `768px` (port `xv` `:26709`).
  - `state.dockNotice: { id: string; color: string; text: string } | null`: `DockButton` của item có `id` trùng thì hiện ô màu + mã trong 1500ms (`showButtonNotification` `:34691`).
- Mục registry:

| id | key | group | icon Lucide | label | Hành vi |
| --- | --- | --- | --- | --- | --- |
| `xray` | `2` | inspectTools | `ScanEye` | `dock.xray` | 3.02: chèn một `<style data-pixellens>` vào `document.head` (scope `body`) và vào mỗi shadow root mở (scope `:host`, `depth = xrayDepth(host)`); lưu `xrayModeIsOn`; `onStop` gỡ hết |
| `breakpoints` | `5` | inspectTools | `RulerDimensionLine` | `dock.breakpoints` | 3.06: painter vẽ vạch dọc 1px ở `left = width - scrollX`, độ mờ 0.6, nhãn chip trắng chữ ở `top: 8px`; màu `min` `#008C21`, `max` `#0891B2`, `both` `#E8A23D`; lưu `breakpointsIsOn`. Quét lại mỗi lần bật |
| `eyedropper` | `6` | utilities | `Pipette` | `dock.eyedropper` | 3.07: không có `EyeDropper` thì bỏ qua; ẩn host (`visibility:hidden`) và hover; đợi 2 rAF rồi `open()`; chọn xong thì hiện lại host, `copyText(hex)` (HEX in hoa như `toHex` cũ), `state.dockNotice` 1500ms; huỷ (Esc) thì chỉ hiện lại host. Sau 300ms, `pointerdown`/`keydown` đầu tiên cũng hiện lại host (port `:34586`) |

- Khoá i18n mới:

| Khoá | en | vi |
| --- | --- | --- |
| `dock.xray` | X-Ray Mode | Chế độ X-Ray |
| `dock.breakpoints` | Breakpoints | Breakpoints |
| `dock.eyedropper` | Color Picker | Chọn Màu |

- [ ] **Step 1: Viết test fail.**
  - `xray.test.ts`:
    - `xraySheet('body', 0)` chứa `body > *{outline:1px solid #FF3F25!important;}` và `body *{outline:1px solid #0D4F8F!important;}`;
    - `xraySheet(':host', 3)` có mức 0 màu `#999999`;
    - bật X-Ray trên trang có một shadow root mở → 2 thẻ `style[data-pixellens]`; `stopSession()` → 0 (Review Focus 5).
  - `breakpoints.test.ts`:
    - `parseBreakpoints(['(min-width: 768px)', '(max-width: 767.98px)', '(min-width: 48em)'])` → `[{width:767,kind:'max'},{width:768,kind:'min'}]`;
    - `'(min-width: 600px) and (max-width: 600px)'` → `[{width:600,kind:'both'}]`;
    - `mediaConditions` với một sheet giả có `cssRules` getter ném `DOMException('SecurityError')` → không ném, bỏ sheet đó (Review Focus 3);
    - `breakpointLabel({width:768,kind:'min'}) === '≥768px'`.
  - Run: `pnpm vitest run src/lib/xray.test.ts src/lib/breakpoints.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Ba `init*` thêm vào `initTools()`; X-Ray và breakpoints bật lại theo settings (1.43).
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: X-Ray, breakpoints and eyedropper tools" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 5: Lưới layout (3) và popover grid

**Files:**

- Create:
  - `src/content/tools/grid/index.ts`, `src/content/tools/grid/grid.test.ts`
  - `src/content/tools/grid/GridPopover.svelte`
- Modify: `src/content/tools/index.ts`, `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `togglePopover`, `DockItem.popover` / `runKey` (Task 2), `Settings.layoutGrid` (Task 3), `addPainter`.
- Produces:
  - `parseMaxWidth(v: string): 'auto' | number`: `''`, `'0'`, `'auto'`, số không hợp lệ hoặc ≤0 → `'auto'`; còn lại `parseInt` (port `updateMaxWidth` `:42695`).
  - `setGrid(patch: Partial<Settings['layoutGrid']>): void`: trộn, lưu cả `layoutGrid`, `requestPaint`.
  - Mục registry `grid`:
    - `key: '3'`, group `inspectTools`, icon `LayoutGrid`, label `dock.grid`;
    - `run` = `togglePopover('grid')`; `runKey` = `setGrid({ isOn: !isOn })` (3.03);
    - `isActive` = `layoutGrid.isOn`.
  - Painter `grid` (3.04, port `toggleGrid` `:42389`): một `div` `position:fixed; inset:0; margin:auto; display:grid; grid-template-columns:repeat(N,1fr); gap; padding-inline: margin; max-width; opacity`, N cột nền `color`.
  - `GridPopover.svelte` (3.03):
    - tiêu đề `dock.grid`, công tắc bật/tắt, nút đóng;
    - `grid.columns` `<select>` 2/3/4/6/8/12/16/24;
    - `grid.maxWidth` ô chữ, blur thì `parseMaxWidth` và hiện `auto`;
    - `grid.gutter` 0–100, `grid.margin` 0–350;
    - `grid.color` `<input type=color>` + ô hex 6 ký tự;
    - `grid.opacity` range 0.1–0.9 bước 0.1.
- Khoá i18n mới (chép từ `_locales`):

| Khoá | en | vi |
| --- | --- | --- |
| `dock.grid` | Layout Grid | Lưới Bố cục |
| `grid.columns` | Columns | Cột |
| `grid.maxWidth` | Max Width | Chiều rộng Tối đa |
| `grid.gutter` | Gutter | Khoảng cách |
| `grid.margin` | Margin | Margin |
| `grid.color` | Color | Màu sắc |
| `grid.opacity` | Opacity | Độ mờ |

- [ ] **Step 1: Viết test fail** (`grid.test.ts`):
  - `parseMaxWidth('')`, `('0')`, `('abc')`, `('-5')` → `'auto'`; `('1200')` → `1200`;
  - `setGrid({ columns: 12 })` rồi `getSettings()` → `layoutGrid.columns === 12` và `layoutGrid.color` vẫn `'#FC48FF'`;
  - `routeKey('3')` khi `isOn` false → `isOn` true, `state.popover` vẫn `null`.
  - Run: `pnpm vitest run src/content/tools/grid`. Expected: FAIL.
- [ ] **Step 2: Viết code.** `initGrid` bật lại theo `layoutGrid.isOn` (1.43).
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: layout grid with dock popover" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 6: Thước + chữ thập (4) và gióng

**Files:**

- Create:
  - `src/lib/guides.ts`, `src/lib/guides.test.ts`
  - `src/content/tools/ruler/index.ts`: thước, chữ thập, gióng
- Modify: `src/content/tools/index.ts`, `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `startDrag`, `isDragging` (Task 1), `pageElementAt`, `ownNodes` (Task 3), `addPainter`, `Settings.rulerIsOn`.
- Produces:
  - `RULER = 20`, `SNAP = 6`, `GRAB = 5` (bán kính bắt gióng, `nearGuide` cũ).
  - `type Guide = { axis: 'h' | 'v'; pos: number }`: toạ độ trang.
  - `snapPos(pos: number, edges: number[], snap = SNAP): number`: cạnh đầu tiên trong `±snap`, rồi `Math.round` (`snapGuide` `measure-guides.js:106`; `edges` = đầu, cuối, giữa của phần tử dưới chuột, theo trang).
  - `nearestGuide(guides: Guide[], cx: number, cy: number, scroll: {x: number; y: number}): Guide | null`: gần nhất trong `< GRAB`.
  - `guideGaps(positions: number[]): Array<{ mid: number; value: number }>`: khoảng giữa các gióng cùng trục liền nhau, đã sắp.
  - `ticks(length: number): Array<{ at: number; kind: 'major' | 'medium' | 'minor' }>`: mỗi 10px; `major` khi chia hết 100, `medium` khi chia hết 50 (`createHorizontalRuler` `:48166`).
  - Mục registry `ruler`: `key: '4'`, group `inspectTools`, icon `Ruler`, label `dock.ruler`; lưu `rulerIsOn`; bật/tắt cả gióng (3.05).
- Hành vi:
  - **Thước** (3.05): hai dải `20px` (ngang trên, dọc trái), nền token surface, viền `line`; vạch 8/6/4px; số mono 9px ở vạch major (dọc xoay −90°); dựng lại khi `resize`; không là painter.
  - **Chữ thập:** vạch 1px màu accent trên mỗi dải, theo `mousemove` (gán `style.left` / `style.top` trực tiếp).
  - **Gióng** (3.16, port `measure-guides.js`):
    - `pointerdown` (window capture, nút trái, không phải own event): gần gióng thì kéo gióng đó; trong dải trên (`cy < 20`) thì tạo gióng **dọc**; trong dải trái thì tạo gióng **ngang**;
    - đang kéo: `snapPos` theo phần tử dưới chuột;
    - thả trên dải thước gốc thì xoá; `dblclick` gần gióng thì xoá;
    - không kéo mà rê gần gióng thì `cursor: move` trên `<html>` (gỡ khi tắt / `onStop`).
  - **Painter gióng:**
    - đường 1px `#00B3FF`; gióng đang kéo `#FF3B6B`;
    - chip toạ độ: gióng ngang ở `left: RULER + 22`, gióng dọc ở `top: RULER + 10`;
    - chip khoảng cách nền `#1f1f1f`: ngang ở giữa màn hình theo X, dọc ở giữa theo Y;
    - dải 20px tô `rgba(0,179,255,.08)` khi thước bật.
- Khoá i18n mới:

| Khoá | en | vi |
| --- | --- | --- |
| `dock.ruler` | Page Rulers | Thước Trang |

- [ ] **Step 1: Viết test fail** (`guides.test.ts`):
  - `snapPos(103, [100, 200, 150])` → `100`; `snapPos(107, [100])` → `107`;
  - `nearestGuide([{axis:'h',pos:300}], 50, 296, {x:0,y:0})` → gióng đó; ở `cy = 290` → `null`; `scroll.y = 100`, `cy = 200` → gióng đó;
  - `guideGaps([300, 100, 180])` → `[{mid:140,value:80},{mid:240,value:120}]`;
  - `ticks(100)` có 11 phần tử; `at 0` và `at 100` là `major`, `at 50` là `medium`, `at 10` là `minor`.
  - Run: `pnpm vitest run src/lib/guides.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code.** Listener chuột đăng ký trong `initRuler`, gọi trước inspector (thứ tự `initTools`), nên `startDrag` chặn được `block` của inspector. Bật lại theo `rulerIsOn` (1.43).
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: page rulers, crosshair and draggable guides" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 7: Đo vùng (M) và panel

**Files:**

- Create:
  - `src/lib/measure.ts`, `src/lib/measure.test.ts`
  - `src/content/tools/measure/index.ts`, `src/content/tools/measure/MeasurePanel.svelte`
- Modify: `src/content/tools/index.ts`, `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `startDrag`, `addKeyHandler`, `ToolPanel`, `mountInShadow`, `measureColor` / `measureGuides` (Task 3), `addPainter`.
- Produces (`src/lib/measure.ts`, port `measure-guides.js`):
  - `type Box = { l: number; t: number; r: number; b: number }`: toạ độ trang, luôn `l ≤ r`, `t ≤ b`.
  - `normBox(x1: number, y1: number, x2: number, y2: number): Box`
  - `hitBox(box: Box, cx: number, cy: number, scroll: {x: number; y: number}, corner = 10): { mode: 'move' } | { mode: 'resize'; corner: 'tl' | 'tr' | 'bl' | 'br' } | null`: thứ tự tl, tr, bl, br, rồi `move` khi ở trong (`hitMeasure` `:91`).
  - `resizeBox(orig: Box, corner: 'tl' | 'tr' | 'bl' | 'br', px: number, py: number): Box`
  - `nudgeBox(box: Box, e: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>): Box | null`:
    - `null` nếu không phải mũi tên, có `metaKey`, hoặc Alt mà không Ctrl (Alt+Shift để chọn anh/em);
    - bước 1, Shift 10; không Ctrl thì dời; Ctrl thì nới cạnh theo hướng; Ctrl+Alt thì thu.
  - `type Field = 'w' | 'h' | 'l' | 't' | 'r' | 'b'`
  - `applyField(box: Box | null, k: Field, v: number, page: {width: number; height: number}, view: {x: number; y: number; width: number; height: number}): Box`: `box` null thì bắt đầu từ khung 100×100 giữa màn hình; `r` / `b` là khoảng cách tới mép phải / dưới trang (`applyMeasureInput` `:287`).
  - `fieldValues(box: Box, page: {width: number; height: number}): Record<Field, number>`
  - Mục registry `measure`: `key: 'm'`, group `designTools`, icon `SquareDashed`, label `dock.measure`. Bật thì mở panel; tắt thì đóng panel và xoá khung (3.10, 3.17).
- Hành vi (3.17, 3.18):
  - `pointerdown` window capture khi công cụ bật, không phải own event, và không có gióng nào đã bắt chuột trước (thước đăng ký trước nên tự `stopImmediatePropagation`):
    - trúng khung thì dời / co giãn bằng `startDrag`;
    - không trúng thì vẽ mới; thả mà nhỏ hơn 2×2 thì bỏ khung;
  - rê không kéo thì `cursor` theo `hitBox` (`move` / `nwse-resize` / `nesw-resize`);
  - `addKeyHandler`: Esc xoá khung (chỉ khi có khung); `nudgeBox`;
  - painter:
    - khung viền 1px màu `measureColor`, nền màu đó 12%;
    - chip `W × H` giữa, dưới đáy `+14px`; chip `x {l}  y {t}` nền `#1f1f1f` ở góc trái trên `-14px`;
    - bật "Đường gióng" thì 4 đường liền dài toàn màn hình, độ mờ 0.7 (quyết định nét liền ở đầu plan).
  - `MeasurePanel.svelte`:
    - 3 hàng ô số (`W / H`, `measure.leftTop`, `measure.toEdge`); Shift+↑/↓ bước 10;
    - ô đang focus không bị ghi đè khi vẽ lại;
    - `<input type=color>` (`measure.boxColor`), nút bật/tắt `measure.edgeGuides` (title `measure.edgeGuidesTitle`), nút `measure.clear`, dòng gợi ý `measure.hint`;
    - đổi màu / đường gióng thì lưu `bdMeasureColor` / `bdMeasureGuides`.
- Khoá i18n mới (chép từ `T()`):

| Khoá | en | vi |
| --- | --- | --- |
| `dock.measure` | Measure area (drag) | Kéo vùng để đo |
| `measure.title` | Measure | Đo vùng |
| `measure.leftTop` | Left / Top | Trái / Trên |
| `measure.toEdge` | To right / bottom edge | Cách mép phải / dưới |
| `measure.boxColor` | Box color | Màu khung đo |
| `measure.edgeGuides` | Edge guides | Đường gióng |
| `measure.edgeGuidesTitle` | Extend the box edges across the page | Kéo dài các cạnh khung ra toàn trang |
| `measure.clear` | Clear | Xoá khung |
| `measure.hint` | Drag to draw. Arrows move 1px (Shift: 10px), Ctrl+arrows expand, Ctrl+Alt+arrows shrink. Shift+↑/↓ in a field steps 10. Esc clears. | Kéo chuột để vẽ. Mũi tên dịch 1px (Shift: 10px), Ctrl+mũi tên nới rộng, Ctrl+Alt+mũi tên thu hẹp. Trong ô số, Shift+↑/↓ tăng giảm 10. Esc để xoá. |

- [ ] **Step 1: Viết test fail.**
  - `measure.test.ts`:
    - `hitBox({l:100,t:100,r:200,b:200}, 105, 95, {x:0,y:0})` → `{mode:'resize',corner:'tl'}`; `(150,150)` → `{mode:'move'}`; `(300,300)` → `null`; `scroll.y = 50` và `cy = 100` → trúng như `cy = 150`;
    - `nudgeBox(box, {key:'ArrowRight', shiftKey:true})` → dời `+10` cả `l` và `r`;
    - `{key:'ArrowLeft', ctrlKey:true}` → `l - 1`; `{key:'ArrowLeft', ctrlKey:true, altKey:true}` → `l + 1`;
    - `{key:'ArrowLeft', altKey:true, shiftKey:true}` → `null`;
    - `applyField(null, 'w', 300, page, {x:0,y:0,width:1000,height:800})` → `{l:450,t:350,r:750,b:450}`;
    - `applyField(box, 'r', 0, {width:1200,height:3000}, view)` → `r === 1200`.
  - Test tích hợp (happy-dom): bật `measure`, có khung; keydown `ArrowLeft` dispatch từ ô W trong shadow root của panel → khung không đổi (Review Focus 2).
  - Run: `pnpm vitest run src/lib/measure.test.ts src/content/tools/measure`. Expected: FAIL.
- [ ] **Step 2: Viết code** theo Interfaces.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: measure area tool with panel" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 8: Đè ảnh thiết kế (O)

**Files:**

- Create:
  - `src/lib/overlay-image.ts`, `src/lib/overlay-image.test.ts`
  - `src/content/tools/overlay/index.ts`, `src/content/tools/overlay/OverlayPanel.svelte`
- Modify: `src/content/tools/index.ts`, `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `startDrag`, `addKeyHandler`, `ownNodes`, `ToolPanel`, `mountInShadow`, `addPainter`, `isOwnEvent`.
- Produces (`src/lib/overlay-image.ts`, port `overlay.js`):
  - `type OverlayImage = { src: string; x: number; y: number; scale: number; opacity: number; mode: 'normal' | 'difference'; visible: boolean; fixed: boolean }`. `x/y` là toạ độ trang, hoặc toạ độ màn hình khi `fixed`.
  - `initialPlacement(nat: {width: number; height: number}, view: {x: number; y: number; width: number; height: number}): Pick<OverlayImage, 'x' | 'y' | 'scale'>`: `scale = nat.width >= view.width * 1.8 ? 50 : 100`; căn giữa màn hình theo toạ độ trang, `Math.round` (`loadOverlayFile` `:125`).
  - `cornerAt(size: {width: number; height: number}, lx: number, ly: number, c = 14): 'tl' | 'tr' | 'bl' | 'br' | null`
  - `resizeFromCorner(o: OverlayImage, nat: {width: number; height: number}, corner: 'tl' | 'tr' | 'bl' | 'br', cx: number, cy: number, scroll: {x: number; y: number}): Pick<OverlayImage, 'x' | 'y' | 'scale'>`: giữ tỉ lệ; rộng tối thiểu 20; `scale` tối thiểu 2; neo góc đối diện (`startOverlayResize` `:76`).
  - `togglePinned(o: OverlayImage, scroll: {x: number; y: number}): Pick<OverlayImage, 'x' | 'y' | 'fixed'>`: đổi trang ↔ màn hình để ảnh không nhảy (spec §9).
  - `nudgeDelta(e: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'ctrlKey' | 'metaKey' | 'altKey'>): {dx: number; dy: number} | null`: `null` khi có Ctrl / Meta / **Alt** (spec §9) hoặc không phải mũi tên; bước 1, Shift 10.
  - Mục registry `overlay`: `key: 'o'`, group `designTools`, icon `Images`, label `dock.overlay`.
- Hành vi (3.13–3.15):
  - **Nạp ảnh:**
    - thả vào ô thả, bấm chọn file (nhiều ảnh), hoặc dán (`paste` window capture khi công cụ bật, lấy file `image/*`);
    - đọc bằng `FileReader` ra data URL như bản cũ;
    - ảnh mới thành ảnh đang chọn.
  - **`<img>` nằm trong DOM trang:**
    - thêm vào `document.documentElement`, có `data-pixellens`, nằm trong `ownNodes`;
    - `position:fixed`, `z-index: 2147483646` (dưới host), `pointer-events:auto`, `all:initial` rồi các style của `positionOverlay` (`:115`);
    - bóng đổ khi `normal`; Difference thì `opacity: 1` và bỏ bóng;
    - nhiều ảnh thì ảnh đang chọn có `outline: 2px solid #5B5BF0`;
    - painter `overlay` cập nhật `left/top/width` mỗi frame. Tắt công cụ, ẩn ảnh, hoặc pause thì `display:none`.
  - **Chuột trên ảnh:** `pointerdown` chọn ảnh; góc 14px thì co giãn, còn lại thì dời, qua `startDrag`; `pointermove` không kéo thì đổi `cursor` của ảnh.
  - **Phím:** `addKeyHandler` với `nudgeDelta` cho ảnh đang chọn. Đăng ký trước đo vùng (Task 3).
  - **`OverlayPanel.svelte`:**
    - hàng thumbnail (title `overlay.image`, ảnh ẩn mờ 0.4); ô thả (`overlay.drop` / `overlay.addAnother`);
    - các điều khiển cho ảnh đang chọn: `overlay.opacity` range 0–100 (mặc định 50); `overlay.blend` 2 nút `overlay.normal` / `Difference`; X / Y; `overlay.scale`; nút `overlay.visible` / `overlay.hidden`; `overlay.pin` (title `overlay.pinTitle`); `overlay.remove`; gợi ý `overlay.hint`.
  - **Tắt công cụ:** đóng panel, ẩn ảnh, giữ danh sách. **`onStop`:** gỡ mọi `<img>`, xoá khỏi `ownNodes`, xoá danh sách (`destroy` cũ).
- Khoá i18n mới (chép từ `T()`):

| Khoá | en | vi |
| --- | --- | --- |
| `dock.overlay` | Design overlay | Đè ảnh thiết kế |
| `overlay.image` | Image {0} | Ảnh {0} |
| `overlay.drop` | Drop, paste or click to choose design images | Thả, dán (Ctrl+V) hoặc bấm để chọn ảnh thiết kế |
| `overlay.addAnother` | Add another image… | Thêm ảnh khác… |
| `overlay.opacity` | Opacity | Độ mờ |
| `overlay.blend` | Blend | Chế độ |
| `overlay.normal` | Normal | Bình thường |
| `overlay.scale` | Scale % | Tỉ lệ % |
| `overlay.visible` | Visible | Đang hiện |
| `overlay.hidden` | Hidden | Đang ẩn |
| `overlay.pin` | Pin to screen | Ghim theo màn hình |
| `overlay.pinTitle` | Keep the image fixed while scrolling | Ảnh đứng yên khi cuộn trang |
| `overlay.remove` | Remove | Xoá ảnh |
| `overlay.hint` | Click an image (or its thumbnail) to select it. Drag the middle to move, a corner to resize. Arrow keys nudge the selected image 1px (Shift: 10px). | Bấm vào ảnh (hoặc ảnh nhỏ ở trên) để chọn. Kéo giữa ảnh để di chuyển, kéo góc để co giãn. Phím mũi tên dịch ảnh đang chọn 1px (giữ Shift: 10px). |

`{0}` là cú pháp tham số của `@wxt-dev/i18n`. Nếu bản đang dùng khác cú pháp, theo cú pháp của nó.

- [ ] **Step 1: Viết test fail** (`overlay-image.test.ts`):
  - `initialPlacement({width:2880,height:2000}, {x:0,y:500,width:1440,height:900})` → `scale 50`, `x 0`, `y 450`;
  - `initialPlacement({width:400,height:300}, {x:0,y:0,width:1440,height:900})` → `scale 100`, `x 520`, `y 300`;
  - `togglePinned({x:100,y:1500,fixed:false,…}, {x:0,y:1000})` → `{x:100,y:500,fixed:true}`; gọi lại → về `{x:100,y:1500,fixed:false}`;
  - `nudgeDelta({key:'ArrowRight',shiftKey:true})` → `{dx:10,dy:0}`; `{key:'ArrowLeft',altKey:true,shiftKey:true}` → `null` (spec §9);
  - `resizeFromCorner` góc `br` kéo tới rộng 10px → `scale` ứng với rộng 20 (tối thiểu);
  - tích hợp: thêm ảnh rồi `stopSession()` → không còn `img[data-pixellens]`, `ownNodes.size === 0` (Review Focus 5).
  - Run: `pnpm vitest run src/lib/overlay-image.test.ts src/content/tools/overlay`. Expected: FAIL.
- [ ] **Step 2: Viết code** theo Interfaces.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: design overlay images" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 9: Tìm phần tử (7) — popover

**Files:**

- Create:
  - `src/lib/find.ts`, `src/lib/find.test.ts`
  - `src/content/tools/find/index.ts`, `src/content/tools/find/FindPopover.svelte`
- Modify: `src/content/tools/index.ts`, `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `togglePopover`, `DockItem.popover` (Task 2), `shadowRoots` (Task 3), `isRendered`, `addPainter`.
- Produces:
  - `findAll(selector: string, isVisible: (el: Element) => boolean): { found: Element[]; hidden: number }`:
    - `querySelectorAll` trên `document` rồi từng `shadowRoots(document, isOwn)`;
    - selector rỗng hoặc sai cú pháp → `{ found: [], hidden: 0 }`, không ném (`findElement` `:38503`).
  - `isVisible(el: Element): boolean`: port `isElementVisible` (`:44420`): đi lên shadow host ngoài cùng, phải nằm trong `body`; `offsetParent === null` mà không `fixed`/`sticky` thì ẩn; kèm `isRendered`.
  - `findTitle(index: number, count: number, hidden: number, t: typeof i18n.t): string`: `i/n`, hoặc `0` khi chỉ có phần tử ẩn, hoặc `t('find.title')`; có `hidden` thì thêm ` (${t('find.hidden', [hidden])})` (`updateFindTitle` `:38901`).
  - Mục registry `find`: `key: '7'`, group `utilities`, icon `TextSearch`, label `dock.find`, `run` = `togglePopover('find')`, `isActive` = có truy vấn đang khớp (3.08).
- Hành vi (3.08, 3.09):
  - `FindPopover.svelte`:
    - tiêu đề `findTitle(...)`; ô `<input>` placeholder `.class, #id, tag`, `aria-label` `find.selector`;
    - gõ trễ 150ms; nút trước / sau (`ChevronUp` / `ChevronDown`, khoá khi < 2 kết quả) và nút đóng;
    - mở thì điền truy vấn trước, chạy lại, focus và chọn chữ;
    - `onDestroy`: nhớ truy vấn, xoá highlight (1.31).
  - Kết quả đầu tiên cuộn `scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })`. Trước / sau xoay vòng `(i + d + n) % n` và cuộn tới.
  - Painter `find`: khung nền accent 20% cho mọi kết quả, kết quả hiện tại 45%; bỏ kết quả hết `isRendered`.
- Khoá i18n mới (chép từ `_locales`):

| Khoá | en | vi |
| --- | --- | --- |
| `dock.find` | Find Element | Tìm Phần tử |
| `find.title` | Find Element | Tìm Phần tử |
| `find.selector` | CSS Selector | Bộ chọn CSS |
| `find.hidden` | {0} hidden | {0} bị ẩn |

- [ ] **Step 1: Viết test fail** (`find.test.ts`):
  - `<p class=a></p><p class=a style="display:none"></p>` + host có shadow chứa `<p class=a>` → `findAll('.a', isVisible)` có `found` 2 và `hidden` 1. Nếu happy-dom không tính `offsetParent`, stub `isVisible` bằng `el => !el.hasAttribute('style')` và ghi lại;
  - `findAll('div[', …)` và `findAll('', …)` → `{found: [], hidden: 0}`, không ném (Review Focus 4);
  - `findTitle(0, 3, 0, t)` → `'1/3'`; `findTitle(0, 0, 2, t)` → `'0 (find.hidden)'` với `t` giả trả khoá; `findTitle(0, 0, 0, t)` → `'find.title'`.
  - Run: `pnpm vitest run src/lib/find.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code** theo Interfaces.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: find element popover" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 10: Màu & font của trang (A)

**Files:**

- Create:
  - `src/lib/audit.ts`, `src/lib/audit.test.ts`
  - `src/content/tools/audit/index.ts`, `src/content/tools/audit/AuditPanel.svelte`
- Modify: `src/content/tools/index.ts`, `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `ToolPanel`, `mountInShadow`, `ownNodes`, `copyText`, `toHex` / `parseColor`, `addPainter`.
- Produces (`src/lib/audit.ts`, port `audit.js` `scanPage`):
  - `type AuditRow = { key: string; els: Set<Element>; uses?: Set<string>; variants?: Set<string>; size?: number }`
  - `scanStyles(root: Element, isOwn: (el: Element) => boolean, limit = 8000): { colors: AuditRow[]; fonts: AuditRow[]; spacing: AuditRow[] }`:
    - duyệt `html`, `body` và mọi con của `body`, dừng sau `limit`;
    - bỏ node của extension, `SCRIPT` / `STYLE` / `NOSCRIPT` / `TEMPLATE` / `META` / `LINK` / `BR`, hộp 0×0, `visibility:hidden`, `display:none`;
    - **màu:** chữ (chỉ khi có text node trực tiếp), nền, viền trên (khi rộng > 0 và style khác `none`), `fill` / `stroke` của SVG. HEX in hoa; alpha 0 thì bỏ. `uses` ghi `text` / `bg` / `border` / `fill` / `stroke`;
    - **font:** một dòng mỗi họ (phần đầu `font-family`, bỏ dấu nháy); `variants` dạng `${size}px / ${weight} / ${lh}`;
    - **khoảng cách:** margin / padding 4 phía, `row-gap`, `column-gap` khi > 0, làm tròn 0,1;
    - **sắp:** màu theo số phần tử giảm dần; font theo `size` lớn nhất giảm dần rồi số phần tử; khoảng cách tăng dần.
  - `offGrid(rows: AuditRow[]): number`: số giá trị `key % 4 !== 0`.
  - Mục registry `audit`: `key: 'a'`, group `designTools`, icon `Palette`, label `dock.audit`.
- Hành vi (3.19, 3.20):
  - **Header của `AuditPanel.svelte`:** nút `⧉ audit.all` (title `audit.allTitle`) và `↻` (title `audit.rescan`) cạnh nút đóng.
  - **3 tab** `audit.colors` / `audit.fonts` / `audit.spacing`, mỗi tab kèm `(n)`.
  - **Mỗi dòng:**
    - ô màu (tab màu), giá trị, số phần tử, nút copy (title `audit.copy`);
    - tooltip: cách dùng (màu), danh sách variants (font);
    - tab khoảng cách: giá trị lệch lưới 4 tô đỏ `#E5484D`; đầu tab có dòng `audit.offGrid`;
    - rỗng thì `audit.empty`.
  - **Bấm dòng:** chọn / bỏ chọn; highlight ≤400 phần tử (painter: `outline 2px #7C4DFF`, nền `rgba(124,77,255,.12)`); cuộn phần tử đầu `{ block: 'center', behavior: 'smooth' }`.
  - **Đổi tab, quét lại hoặc tắt công cụ** thì xoá highlight.
- Khoá i18n mới (chép từ `T()`):

| Khoá | en | vi |
| --- | --- | --- |
| `dock.audit` | Page colors & fonts | Màu & font của trang |
| `audit.title` | Page styles | Màu & font của trang |
| `audit.colors` | Colors | Màu |
| `audit.fonts` | Typography | Font chữ |
| `audit.spacing` | Spacing | Khoảng cách |
| `audit.offGrid` | {0} value(s) are not multiples of 4px (shown in red). | {0} giá trị không phải bội số của 4px (tô đỏ). |
| `audit.highlight` | Click to highlight elements | Bấm để highlight các phần tử dùng giá trị này |
| `audit.copy` | Copy | Copy |
| `audit.rescan` | Rescan | Quét lại |
| `audit.all` | All | Tất cả |
| `audit.allTitle` | Copy all rows in this tab | Copy toàn bộ danh sách của tab này |
| `audit.empty` | Nothing found. | Không tìm thấy. |

- [ ] **Step 1: Viết test fail** (`audit.test.ts`, happy-dom, style inline; stub `getBoundingClientRect` trả 10×10 nếu cần):
  - `<p style="color:rgb(255,0,0);margin:6px">x</p><div style="background:rgb(0,0,255);padding:8px"></div>` → `colors` có `#FF0000` (`uses` gồm `text`) và `#0000FF` (`bg`); `spacing` có `6` và `8`; `offGrid(spacing) === 1`;
  - phần tử `isOwn` và `<p style="display:none">` không được tính;
  - `limit = 1` thì chỉ quét `html` và `body`, không ném.
  - Run: `pnpm vitest run src/lib/audit.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code** theo Interfaces. Quét lúc bật và khi bấm `↻`. Không quét lại khi cuộn.
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: page colors, fonts and spacing audit panel" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 11: Đổi nhãn kiểm kê, thử tay trên Edge

**Files:**

- Modify: `docs/inventory.md`

- [ ] **Step 1: Đổi nhãn theo bảng "Phạm vi"** ở đầu plan.
  - Dòng chỉ dời một phần thì tách thành dòng mới, đánh số tiếp cuối mục, ghi `(tách từ X)`, giữ nguyên tham chiếu code cũ.
  - 9.24 đổi `đợt 2` thành `đợt 4`. 9.35 đánh `[x]` với ghi chú.
  - Run: `pnpm vitest run docs/inventory.test.ts`. Expected: PASS (không mất tên nào).
- [ ] **Step 2: Build và đưa checklist cho chủ dự án.** Controller **trình bày danh sách dưới đây rồi đi tiếp, không chờ kết quả**. Chủ dự án tự đánh `[x]` sau khi thử.
  1. `pnpm build`, reload `.output/chrome-mv3` trong `edge://extensions`, không có lỗi đỏ.
  2. Dock có đủ nút mới, đúng nhóm. Tooltip có phím: `(2)`…`(7)`, `(O)`, `(M)`, `(A)`. Pause khoá mọi nút trừ Pause/Quit.
  3. Phím `2`: X-Ray viền nhiều màu, cả trong web component; tắt thì sạch.
  4. Phím `3`: lưới hiện. Nút Grid mở popover cạnh nút; đổi cột, max width (`0` → `auto`), gutter, margin, màu, độ mờ thì lưới đổi ngay. Mở popover Tìm thì popover Grid đóng.
  5. Phím `4`: thước + chữ thập theo chuột. Kéo từ thước trên ra gióng dọc, hít vào cạnh phần tử, có số khoảng cách giữa hai gióng. Thả về thước thì gióng mất; double-click cũng xoá.
  6. **Hồi quy:** inspector bật, kéo một gióng / một ghim inspector rồi thả trên một link. Link không mở, vùng chọn không đổi.
  7. Phím `5`: vạch breakpoint có nhãn `≥768px`… trên một trang có media query (vd. getbootstrap.com).
  8. Phím `6`: dock ẩn khi hút màu; chọn xong thì dock hiện mã màu 1,5s; dán ra đúng HEX.
  9. Phím `7`: gõ `a`, thấy `1/n`, trước/sau xoay vòng và cuộn tới. Gõ `div[` thì không lỗi. Đóng rồi mở lại thì còn truy vấn.
  10. Phím `M`: vẽ khung, kéo giữa để dời, kéo góc để co giãn. Mũi tên / Ctrl / Ctrl+Alt đúng; Alt+Shift+← vẫn chọn anh/em. Gõ W trong panel thì khung đổi, mũi tên trong ô không dời khung. Màu và "Đường gióng" còn sau khi tải lại trang. Esc xoá khung.
  11. Phím `O`: dán một ảnh @2x thì hiện 50% giữa màn hình. Kéo, co góc, mũi tên dịch, Difference, ẩn/hiện, xoá. Ghim theo màn hình rồi cuộn: ảnh đứng yên, bỏ ghim không nhảy.
  12. Phím `A`: panel 3 tab có số đếm; bấm dòng thì highlight và cuộn tới; copy và "Tất cả" dán ra được; spacing lệch 4px tô đỏ.
  13. Bật X-Ray, grid, thước, breakpoints rồi tải lại trang và bật extension: cả bốn tự bật lại.
  14. Ctrl+Q khi mọi công cụ đang bật: DevTools không còn `style[data-pixellens]`, `img[data-pixellens]`; `<html>` không có `cursor`.
  15. Trang tối và `document.documentElement.style.fontSize = '10px'`: panel, popover và thước không co, theme đúng.
- [ ] **Step 3: Commit nhãn mới.** `git commit -am "docs: retag deferred phase-2 inventory lines" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

## Xong khi

- `pnpm check` và `pnpm build` qua.
- Checklist thử tay ở Task 11 đã chuyển cho chủ dự án.
- Mọi dòng `đợt 2` trong `docs/inventory.md` hoặc đã đổi nhãn theo bảng Phạm vi, hoặc chờ chủ dự án đánh `[x]` sau khi thử tay.

## Ghi chú cho các đợt sau

- **Kéo:** mọi thao tác kéo mới (vùng chụp, vẽ chú thích, khung responsive) dùng `startDrag`. Không tự viết swallow click.
- **Đợt 3:** `isDragging()` và các `addKeyHandler` cần bỏ qua khi UI chụp/sửa ảnh mở (spec §9 "các công cụ trên trang tạm dừng"). Thêm cờ `state.capturing` và kiểm ở `routeKey` cùng `startDrag`.
- **Đợt 4:** copy màu theo `colorFormat` (hút màu, màu & font, inspector) dùng chung một hàm format trong `src/lib/color.ts`. Hộp thoại trong trang (9.24) làm cùng 2.16.
- **Đợt 6:** breakpoints ở responsive mode, `--ui-scale` của X-Ray.
