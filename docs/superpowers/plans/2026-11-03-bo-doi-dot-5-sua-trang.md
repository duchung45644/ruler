# Bo doi — Đợt 5: Sửa trang — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bản mới sửa được trang như bản cũ:
- có **chế độ sửa** (dock: công tắc Soi / Sửa). Khi bật, side panel chuyển sang view sửa với hai tab **CSS** và **Thay đổi**;
- **engine sửa HTML** có copy / cut / paste / nhân đôi / xoá phần tử, sửa chữ trực tiếp, đổi class, sửa style inline và chèn HTML đã làm sạch. Có undo/redo tối đa 50 bước (Ctrl/⌘+Z, Ctrl/⌘+Shift+Z, Ctrl/⌘+Y);
- **bộ theo dõi sửa CSS** sửa được khai báo và selector của rule có sẵn, thêm rule mới và sửa style inline. Nó giữ danh sách thay đổi (trước/sau, nguồn, dòng) và hoàn tác được từng thay đổi hoặc tất cả;
- **ép trạng thái** `:hover` / `:focus` / … cho phần tử đang chọn;
- **lưu sửa CSS theo site**: tự lưu 800ms sau mỗi thay đổi và khi `pagehide`. Khi bật extension lại ở site đó thì tự áp lại và hiện toast báo.

**Architecture:**
- **Phía content: một module sửa** ở `src/content/edit/`, không nằm trong registry công cụ, trừ các nút dock của nhóm sửa:
  - `engine.ts`: class `HtmlEditor`, port lớp 37 hàm cũ (`content.js:14660–15600`). Lịch sử undo dùng `History` thuần ở `src/lib/edit/history.ts`;
  - `rules.ts`: class `RuleTracker`, port lớp 18 hàm cũ (`content.js:16813–17400`). Phần thuần (tách/ghép khai báo, địa chỉ rule, tuần tự hoá) nằm ở `src/lib/edit/rule-*.ts`;
  - `mode.svelte.ts`: vào/thoát chế độ sửa, nhóm dock `edit`, phím sửa, sửa chữ (`text.ts`);
  - `payload.ts`: payload rule cho trình sửa (mở rộng `getMatchedRules` của Đợt 4), `edit_payload_extras`, `media_activity`, `cascade_ghost_probe`;
  - `states.ts`: ép trạng thái bằng stylesheet riêng;
  - `persist.ts`: lưu và áp lại theo site, nghe `storage.onChanged`.
- **Kênh có kiểu:** không thêm `Target` mới. Các lệnh của `target: "editor"` / `"rule_editor"` cũ gộp vào `ContentApi`, có tiền tố `edit_` / `rule_` khi tên cũ dễ trùng. Các lệnh của `target: "editor_panel"` cũ gộp vào `SidePanelApi`. Mọi lệnh sửa trả kèm `EditState = { canUndo, canRedo, editCount }` để panel không phải hỏi lại.
- **Phía side panel:** view sửa là một nhánh của `App.svelte` (`src/entrypoints/sidepanel/edit/*`). Không có `editor.html` riêng như bản cũ (xem Quyết định D2).
- **Logic thuần ở `src/lib/edit/` và `src/lib/css/`, có unit test:**
  - `sanitize.ts`, `history.ts`, `changes.ts` (gom thay đổi HTML);
  - `decls.ts` (tách/ghép khai báo), `rule-address.ts`, `serialize.ts` (định dạng lưu);
  - `persist-key.ts`, `diff.ts` (diff dòng, nhận ra thay đổi chỉ có khoảng trắng);
  - `css/states.ts` (trạng thái có trong selector), `css/suggest.ts` (gợi ý thuộc tính / giá trị, tăng/giảm số).

**Mốc (milestones):** đợt lớn, nên chia ba mốc. Mỗi mốc build xanh và commit được:
- **M1 — Engine (Task 1–5):** logic thuần, kênh, engine HTML, bộ theo dõi CSS. Có test, chưa có UI;
- **M2 — Chế độ sửa trên trang (Task 6–9):** payload, ép trạng thái, chế độ sửa + dock + phím + sửa chữ, lưu theo site, nối kênh;
- **M3 — Side panel sửa (Task 10–14):** khung view sửa, trình sửa CSS, tab Thay đổi, hồi quy, kiểm kê.

**Tech Stack:** giữ nguyên stack Đợt 1–4: WXT 0.21.5, Svelte 5, Tailwind 4, `@lucide/svelte`, `@wxt-dev/i18n`, Vitest + happy-dom 21.0.3. **Không thêm dependency.**
- Làm sạch HTML dùng `DOMParser` có sẵn, không dùng DOMPurify.
- Danh sách thuộc tính CSS cho gợi ý lấy lúc chạy từ `getComputedStyle(document.documentElement)` (xem D7).
- Test chạy trên happy-dom. CSSOM của happy-dom hỗ trợ `insertRule` / `deleteRule` / `selectorText` / `style.cssText`, nhưng **không** tính cascade. Vì vậy test phần cascade dùng `KnownRule` giả, như Đợt 4.

**Spec:** `docs/superpowers/specs/2026-11-01-bo-doi-rewrite-design.md`. Các mục liên quan:
- §3 Ràng buộc: không có `host_permissions` cố định; `<all_urls>` optional;
- §4.3 Sửa trực tiếp; §6.2 bố cục repo; §6.3 DRY; §7 token giao diện; §8 Đợt 5;
- §9 Checklist chống tái phát: mục "Inspector / chọn" (gõ trong ô không kích hoạt phím, sự kiện panel không lọt xuống trang) và "Giao diện trong trang".

**Kiểm kê:** `docs/inventory.md`, các dòng `đợt 5`:
- 1.20, 1.35, 1.42, 1.44;
- 2.24, 2.27;
- 3.21;
- 4.16;
- 5.01–5.21;
- 6.38–6.47, 6.49, 6.50, 6.52;
- 9.15, 9.31, 9.44.

---

## Phạm vi — phần dời sang đợt khác và quyết định

Task 14 tách các phần sau thành dòng mới, theo quy tắc "Dòng gộp" của `docs/inventory.md` (đánh số tiếp cuối mục, ghi `(tách từ X)`):

| Dòng | Phần dời | Sang |
| --- | --- | --- |
| 5.01 | Toàn bộ: thoát responsive → `apply_pending_rule_edits`, `enterEditMode` → `set_edit_mode`. Đợt này chỉ làm **handler** `apply_pending_rule_edits(serialized)` phía content (5.21) để Đợt 6 gọi | 6 (giữ handler ở 5) |
| 5.02 | "ở responsive gửi xuống iframe" | 6 |
| 5.08 | "không ở iframe responsive". Đợt này chỉ kiểm khung top và origin khác `"null"`; cờ `inResponsiveFrame` để sẵn là `false` | 6 |
| 5.09 | "không hiện nếu vừa thoát responsive" (cờ đặt từ background ở Đợt 6). Đợt này luôn hiện toast | 6 |
| 5.19 | "mang sang responsive": đợt này chỉ làm `serialize` / `applySerialized` | 6 |
| 9.44 | Hộp thoại prompt / size (LABEL_WIDTH / LABEL_HEIGHT): chỉ responsive dùng. Đợt này làm **confirm** (DIALOG_CANCEL_BUTTON / DIALOG_CONFIRM) | 6 |
| §4.3 | "xoá trong trang cài đặt": trang cài đặt thuộc Đợt 7. Đợt này cố định định dạng khoá (9.15) và hàm `listPersistedEdits` / `clearPersistedEdits` trong `src/lib/edit/persist-key.ts` để Đợt 7 dùng | 7 |
| 5.17 / 5.20 | Phía MCP gọi `set_element_classes` / `set_text_content` / `insert_html`: đợt này chỉ làm API content, chưa nối MCP | 8 |

### Quyết định (spec / kiểm kê / bản cũ lệch nhau)

- **D1 — Xoá phần tử là ẩn, không gỡ khỏi DOM.** Spec §4.3 chỉ ghi "xoá". Bản cũ (`deleteElement` `:14716`) đặt `display: none !important` và giữ `{value, priority}` cũ để hoàn tác. **Theo bản cũ:** cách này giữ được tham chiếu của framework trang, và hoàn tác không cần dựng lại node.
- **D2 — Không có `editor.html` riêng.** Bản cũ tải `sidepanel/editor.html` vào `edit-view` (6.38). Bản mới dùng một app Svelte: `App.svelte` đổi giữa `ElementTab` và `EditView` theo `store.mode`. Thông tin và hành vi giữ nguyên; bố cục được làm lại theo §7 (chủ dự án đã cho phép).
- **D3 — Ba kênh cũ gộp vào kênh có kiểu.** `target: "editor"`, `"rule_editor"`, `"editor_panel"` không thành `Target` mới. Tên lệnh giữ nguyên chữ khi không trùng (`rule_edit`, `rule_add`, `revert_rule_change`, …). Các lệnh trùng tên thì đổi như sau:
  - `undo` / `redo` của editor → `edit_undo` / `edit_redo`;
  - `copy_element` → `edit_copy`, và tương tự cho các lệnh cùng nhóm.
  Inventory vẫn đánh `[x]`, kèm ghi chú tên mới.
- **D4 — CSS không vào ngăn undo.** Bản cũ: Ctrl+Z chỉ lùi lịch sử của engine HTML (gồm cả đổi class và style inline qua `set_element_styles`). Sửa rule hoàn tác bằng `revert_rule_change` ở tab Thay đổi. **Giữ như cũ.** Hợp nhất hai lịch sử để ở "Quyết định mở" Q1.
- **D5 — Chỉ lưu sửa CSS theo site, không lưu sửa HTML.** Spec §4.3 "Nhớ CSS đã sửa" khớp với bản cũ (`serializeRuleEdits`). Sửa HTML mất khi tải lại trang.
- **D6 — Khoá lưu giữ nguyên tên cũ** `persistedRuleEdits:<origin>` (`file://<pathname>` cho trang file), giá trị `{ edits, updatedAt }` (9.15). Đợt 9 không cần chuyển dữ liệu nếu chủ dự án muốn mang dữ liệu cũ sang (chốt #3).
- **D7 — Gợi ý thuộc tính CSS lấy lúc chạy.** Bản cũ có danh sách cứng. Bản mới lấy từ `getComputedStyle(document.documentElement)` (khoảng 500 tên, kể cả tiền tố trình duyệt), lọc bỏ tên có tiền tố trừ `-webkit-` phổ biến, rồi sắp theo bảng ưu tiên nhỏ (khoảng 30 thuộc tính hay dùng) trong `src/lib/css/suggest.ts`. Không thêm file dữ liệu lớn.
- **D8 — Sửa chữ dùng `contentEditable` trên `body` như cũ** (5.06), kể cả các shadow root mở. Không đổi sang sửa từng phần tử, vì phải giữ hành vi chặn click/submit và Enter chèn `<br>`.
- **D9 — Clipboard phần tử là nội bộ** (một node clone trong engine), không ghi clipboard hệ thống. Bản cũ cũng vậy. Phím ⌘/Ctrl+C trong chế độ sửa chỉ chặn mặc định khi có phần tử chọn và không có vùng chữ được bôi đen.
- **D10 — Toast là bề mặt mới trong trang** (`src/ui/Toast.svelte` + `src/content/core/toast.ts`), theo token §7 (nền tối trong mờ, bo 12). Đặt giữa phía trên, cách dock. Đợt 6 và Đợt 7 dùng lại.

---

## Global Constraints

- **Giữ mọi ràng buộc của Đợt 0–4:**
  - phiên bản ghim chính xác; **không thêm dependency**;
  - manifest không có `host_permissions` / `content_scripts`; **không thêm quyền** (`storage` đã có; `<all_urls>` vẫn optional);
  - chỉ `en` và `vi`;
  - không sửa `unpacked/` và `legacy-src/`;
  - commit kết thúc bằng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`;
  - mọi lệnh chạy ở gốc repo bằng Git Bash.
- **Chuỗi giao diện:**
  - chỉ qua `i18n.t()`; khoá lồng nhau trong `src/locales/{en,vi}.json`; nhóm mới `edit.*`, `changes.*`, `toast.*`; hộp thoại vào `dialog.*`;
  - chuỗi lấy từ `unpacked/_locales/{en,vi}/messages.json` và chép **nguyên văn**; placeholder `$X$` → `$1…`;
  - lỗi kỹ thuật trả về panel (`"Cannot delete <html>."`, `"Invalid selector"`) giữ tiếng Anh như bản cũ, vì chúng không hiện trực tiếp cho người dùng.
- **Giao diện:**
  - theo token §7: chữ zinc, nhấn indigo `#6366f1`; side panel theo theme panel của Đợt 4;
  - code / khai báo CSS dùng Geist Mono;
  - trong trang (toast, confirm, nút dock) kích thước tính bằng `px` (§9 "Giao diện trong trang").
- **An toàn:**
  - mọi HTML từ panel/MCP đi qua `sanitizeHtml` trước khi chạm DOM; không có `innerHTML` nào nhận chuỗi chưa làm sạch;
  - thẻ `<style>` sửa rule mang id `sr-rule-edits-<extId>`, chỉ chứa text extension tự ghép. Selector người dùng nhập phải qua `CSS.supports('selector(…)')` hoặc thử `insertRule` trong `try`; lỗi trả `"Invalid selector"`.
- **Phần tử của extension:** engine bỏ qua node của host extension (`isOwn`) trong mọi thao tác chọn kế/cha/anh-em; không xoá, copy hay chèn quanh host.
- **Id phần tử:** dùng chung `ID_ATTR` / `ensureElementId` / `resolveElementById` của Đợt 4 (`src/lib/selector.ts`). Không tạo cơ chế id thứ hai (§6.3 DRY).
- **Test:** `fakeBrowser` từ `wxt/testing` cho storage và messaging; `vi.useFakeTimers()` cho 600ms / 800ms / 5s.
- **Kiểm tra mỗi task:** `pnpm vitest run <file>` → `pnpm check && pnpm build` PASS trước commit.

## Review Focus

Người duyệt mỗi task kiểm các điểm sau:
1. **Hoàn tác đúng tuyệt đối.** Sau chuỗi thao tác bất kỳ rồi undo hết, `document.body.innerHTML` (bỏ thuộc tính id của extension) bằng ban đầu. Riêng 2.24: id gắn cho phần tử đã sửa bị xoá khi hoàn tác hết.
2. **Không có XSS qua chèn HTML.** `sanitizeHtml` bỏ đủ danh sách thẻ / thuộc tính của `content.js:14228–14270` và kiểm URL như `_d` `:14454`. Test có các mẫu `<img onerror>`, `<a href="javascript:">`, `<svg><script>`, `srcdoc`, `formaction`, `data:text/html`.
3. **Định vị rule bền.** Khoá gồm stylesheet + selector + wrappers + thứ tự xuất hiện (`occ`) + `scopeAddress`. Khi trang đổi stylesheet thì `reapplyAll` không sửa nhầm rule khác; rule không định vị được thì vào danh sách *dormant* và vẫn được lưu (5.08).
4. **Không rò rỉ:** `onStop` và thoát chế độ sửa phải gỡ sạch:
   - `contentEditable`, các listener chặn click;
   - stylesheet ép trạng thái, `MutationObserver` / `matchMedia` của `media_activity`;
   - timer lưu (lưu ngay trước khi gỡ).
   Thẻ `sr-rule-edits` **ở lại** khi thoát chế độ sửa (sửa vẫn áp), và chỉ gỡ khi `revert_all`.
5. **Phím:** ở chế độ sửa chỉ phím `8` và `0` còn tác dụng (1.42). Phím sửa không chạy khi đang gõ trong ô hay trong `contentEditable` của chế độ sửa chữ (§9); ngoại lệ là Ctrl+Z, vì trình duyệt tự lo undo khi đang sửa chữ.
6. **Kênh:** mọi lệnh sửa trả `EditState`; panel không gửi `get_history_state` sau mỗi lệnh. `refresh_changes` gom bằng microtask, không bắn một tin cho mỗi khai báo.
7. **Lưu:** chỉ ở khung top, origin khác `"null"`; danh sách rỗng thì xoá khoá. Ghi storage tối đa một lần mỗi 800ms.

---

### Task 1: Logic thuần — làm sạch HTML, lịch sử undo, gom thay đổi HTML

**Files:**

- Create:
  - `src/lib/edit/sanitize.ts`, `sanitize.test.ts`
  - `src/lib/edit/history.ts`, `history.test.ts`
  - `src/lib/edit/changes.ts`, `changes.test.ts`

**Interfaces:**

- Produces:
  - `sanitize.ts` (port `Fh` `:16375`, các tập `cd` `:14228`, `ud` `:14250`, `dd` `:14259`, `_d` `:14454`):
    - `BLOCKED_TAGS`, `BLOCKED_ATTRS`, `URL_ATTRS`: `Set<string>` chép đúng bản cũ;
    - `isSafeUrl(v: string): boolean`: chỉ cho http / https / mailto / tel / đường dẫn tương đối / `data:image/*` (trừ `data:image/svg+xml`, nếu bản cũ cũng chặn: đối chiếu `_d`);
    - `sanitizeHtml(html: string, doc?: Document): DocumentFragment`: parse bằng `DOMParser`, gỡ thẻ cấm, gỡ `on*` và thuộc tính cấm, gỡ URL không an toàn;
    - `PROTECTED_TAGS = new Set(['html','head','body'])` (`nd` `:14221`).
  - `history.ts` (port `pushAction` `:14812`, `undo` `:14823`, `redo` `:14908`, `getHistoryState` `:14949`):
    - `interface Action { undo(): Element | null; redo(): Element | null; elementIds: string[]; coalesceKey?: string; at: number }`;
    - `class History { constructor(max = 50); push(a); undo(); redo(); state(): { canUndo; canRedo }; clear(); coalesce(key, at, windowMs = 600): Action | null }`. `push` xoá redo; quá `max` thì bỏ bước cũ nhất; `coalesce` trả action cuối nếu cùng key và trong 600ms (5.14).
  - `changes.ts` (định dạng của `getHtmlChanges` `:15197`, `getAllChanges` `:15503`):
    - `HtmlChange = { id; selector; cssSelector; kind: 'class'|'text'|'html'|'style'|'delete'|'insert'|'duplicate'|'paste'; before: string; after: string }`;
    - `type ChangeLog = Map<string, ChangeRecord>` với `ChangeRecord = { original: Snapshot; count: number; kinds: Set<...> }`;
    - `recordChange(log, id, snapshot, kind)`, `dropRecord(log, id)`, `changeCount(log, id)`, `toHtmlChanges(log, current: (id) => Snapshot | null): HtmlChange[]` (bỏ bản ghi mà before === after).

- [ ] **Step 1: Viết test fail.**
  - `sanitize.test.ts`:
    - `<p onclick="x">a<script>1</script></p>` → `<p>a</p>`;
    - `<a href="javascript:alert(1)">` → không còn `href`; `<a href="https://x">` giữ;
    - `<img src="data:image/png;base64,AA">` giữ; `<iframe srcdoc>` bị gỡ; `<button formaction>` mất `formaction`; `<div style="x">` mất `style`;
    - `<svg><script/></svg>` → không còn script.
  - `history.test.ts`:
    - 51 lần push → `undo` 50 lần thì `canUndo` false;
    - push sau undo → `canRedo` false;
    - `coalesce('cls:a', t)` trong 600ms trả action, ở 601ms trả `null`.
  - `changes.test.ts`: ghi 2 lần cùng id → `count` 2; snapshot sau bằng trước → không có trong `toHtmlChanges`.
  - Run: `pnpm vitest run src/lib/edit`. Expected: FAIL.
- [ ] **Step 2: Viết code.**
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: html sanitizer, bounded undo history and html change log" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 2: Logic thuần — khai báo CSS, địa chỉ rule, tuần tự hoá, khoá lưu, diff, trạng thái, gợi ý

**Files:**

- Create:
  - `src/lib/edit/decls.ts`, `rule-address.ts`, `serialize.ts`, `persist-key.ts`, `diff.ts` (+ `*.test.ts`)
  - `src/lib/css/states.ts`, `src/lib/css/suggest.ts` (+ `*.test.ts`)

**Interfaces:**

- Consumes: `KnownRule`, `collectRules`, `sourceName` (`src/lib/css/matched.ts`), `specificity` (Đợt 4).
- Produces:
  - `decls.ts`:
    - `parseDecls(text): Decl[]` với `Decl = { property; value; important }`; tách theo `;`, bỏ qua `;` trong ngoặc / chuỗi;
    - `serializeDecls(d: Decl[]): string`;
    - `mergeDecls(base, patch)`: dùng cho `merge_rule_styles` và `set_element_styles`; giá trị rỗng nghĩa là xoá.
  - `rule-address.ts` (port `locateEntry` `:16845`, `scopeRootFor` `:17387`):
    - `RuleAddress = { stylesheet: string; selector: string; wrappers: string[]; occ: number; scopeAddress: string | null }`;
    - `addressOf(rule: KnownRule, all: KnownRule[], scopeAddress): RuleAddress`: `occ` là thứ tự xuất hiện của cặp (stylesheet, selector, wrappers) trong `all`;
    - `locate(addr, all): KnownRule | null`;
    - `scopeAddressOf(root: Document | ShadowRoot): string | null`: `null` cho document; với shadow root thì lấy `shadowHostPath` của host, nối bằng `>>>`.
  - `serialize.ts` (port `serializeChanges` `:17158`, `applySerializedChanges` `:17203`):
    - `SerializedEdit` là union `{ own: false; stylesheet; scopeAddress; wrappers; occ; originalSelector; selector; declsText } | { own: true; recordId; wrappers; scopePath; scopeAddress; selector; declsText }`;
    - `isSerializedEdit(x): x is SerializedEdit` (kiểm dữ liệu đọc từ storage);
    - `PersistedEdits = { edits: SerializedEdit[]; updatedAt: number }`.
  - `persist-key.ts` (port `persistedEditsKey` `:34975`, 9.15):
    - `persistKey(loc: Pick<Location,'protocol'|'origin'|'pathname'>): string | null`: trả `null` khi origin là `"null"` và không phải trang file;
    - `PERSIST_PREFIX = 'persistedRuleEdits:'`;
    - `listPersistedEdits()` / `clearPersistedEdits(key)` qua `browser.storage.local` (cho Đợt 7).
  - `diff.ts`: `lineDiff(before, after): { kind: '='|'-'|'+'; text; line: number }[]` (LCS theo dòng); `whitespaceOnly(before, after): boolean` (6.44).
  - `css/states.ts` (port `getAvailableStates` `:32540`):
    - `FORCEABLE_STATES = [':hover',':focus',':focus-visible',':focus-within',':active',':visited']`;
    - `statesInSelector(sel): string[]`;
    - `rewriteForState(sel, state): string | null`: thay `:hover` bằng `[data-sr-force-hover-<extId>]`, để stylesheet ép dùng (đối chiếu `rebuildStateOverrideStylesheet` `:34406`).
  - `css/suggest.ts` (6.41):
    - `suggestProperties(prefix, all: string[]): string[]`;
    - `suggestValues(property, prefix, vars: string[]): string[]`: từ khoá chung (`inherit`, `initial`, `unset`, …), từ khoá theo thuộc tính (bảng nhỏ: `display`, `position`, `flex-direction`, `justify-content`, `align-items`, …), và `var(--x)`;
    - `stepNumber(value, caret, delta): string | null`: ↑/↓ = ±1, Shift ±10, Alt ±0.1; giữ đơn vị.

- [ ] **Step 1: Viết test fail.**
  - `parseDecls('color:red; background:url("a;b") !important')` → 2 khai báo, khai báo thứ hai có `important: true`;
  - `addressOf`: hai rule `.a` cùng file → `occ` 0 và 1, `locate` trả đúng rule;
  - `persistKey({protocol:'file:', pathname:'/x.html'})` → `persistedRuleEdits:file:///x.html`; origin `"null"` (khác file) → `null`;
  - `lineDiff('a\nb','a\nc')` → `=a`, `-b`, `+c`; `whitespaceOnly('a {x}', 'a{ x }')` → true;
  - `statesInSelector('.btn:hover > span:focus-visible')` → `[':hover', ':focus-visible']`;
  - `stepNumber('10px', 1, 1)` → `11px`; `stepNumber('auto', 1, 1)` → `null`;
  - `isSerializedEdit({own:true})` → false.
  - Run: `pnpm vitest run src/lib/edit src/lib/css/states.test.ts src/lib/css/suggest.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code.**
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: css declaration parsing, rule addressing, edit serialization and diff helpers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 3: Kênh có kiểu cho chế độ sửa, hộp thoại confirm, toast

**Files:**

- Modify: `src/lib/messaging.ts`, `messaging.test.ts`, `src/content/core/dialog.ts`, `src/ui/Dialog.svelte`, `src/content/core/state.svelte.ts`, `src/locales/{en,vi}.json`
- Create: `src/lib/edit/types.ts`, `src/ui/Toast.svelte`, `src/content/core/toast.ts`, `src/content/core/toast.test.ts`

**Interfaces:**

- Produces:
  - `src/lib/edit/types.ts`:
    - `EditState = { canUndo: boolean; canRedo: boolean; editCount: number; hasClipboard: boolean }`;
    - `EditResult = EditState & { ok: boolean; error?: string; selectedId?: string }`;
    - `RulePayload` gồm:
      - `rules: EditableRule[]`: `MatchedRule` của Đợt 4, thêm `address`, `editable`, `wrappers`, `mediaActive`, `line`;
      - `inline`, `availableStates`, `forcedState`, `paySeq`, `crossOriginMissing: number`;
    - `RuleChange = { recordId; address; source; line; before; after; elementIds }`.
  - `ContentApi` thêm (5.17, 5.20, 5.21, 6.43, 6.45):
    - lệnh sửa HTML: `edit_undo()`, `edit_redo()`, `edit_copy()`, `edit_cut()`, `edit_paste()`, `edit_duplicate()`, `edit_delete()`, `get_history_state()`; tất cả trả `EditResult`;
    - lệnh phần tử: `set_element_styles(id, decls: Decl[])`, `set_element_classes(id, classes: string)`, `get_page_classes(): string[]`;
    - lệnh nội dung: `set_text_content(id, text)`, `set_inner_html(id, html)`, `insert_html(id, pos, html)`;
    - lệnh rule: `get_rule_edit_payload(): RulePayload | null`, `cascade_ghost_probe(): string[]`, `rule_edit(addr, declsText)`, `inline_style_edit(id, declsText)`, `merge_rule_styles(addr, decls)`, `rule_selector_edit(addr, selector)`, `rule_add(selector?)`;
    - lệnh danh sách và hoàn tác: `get_rule_changes()`, `get_all_flattened_changes()`, `get_html_changes()`, `revert_rule_change(recordId)`, `revert_all_rule_changes()`, `revert_all_edits()`, `clear_elements_by_ids(ids, scope: 'all'|'html'|'css')`, `clear_changes()`;
    - lệnh điều khiển: `force_element_state(state: string | null)`, `apply_pending_rule_edits(edits: SerializedEdit[])`, `set_edit_mode(on: boolean)`, `select_edited_element(id): boolean`.
  - `SidePanelApi` thêm (6.39, 6.50):
    - `set_mode(mode: 'edit'|'inspect')`, `edit_payload_extras(paySeq, inherited)`, `media_activity(active: Record<string, boolean>)`;
    - `refresh_changes()`, `page_updated()`, `edit_state(s: EditState)`.
    - `select_element(d)`: `ElementDetails` thêm trường tuỳ chọn `edit?: { payload: RulePayload; editCount: number }` (6.49).
  - `dialog.ts`: `confirmDialog(title, message, confirmKey = 'dialog.confirm'): Promise<boolean>` (9.44). Nút DIALOG_CANCEL_BUTTON / DIALOG_CONFIRM; Esc = huỷ; Enter = xác nhận. `Dialog.svelte` nhận thêm prop `buttons`.
  - `toast.ts`: `showToast(text, ms = 5000)`; tối đa một toast, toast mới thay toast cũ; gỡ trong `onStop`.
  - `state` thêm: `editOn: false`, `textEditOn: false`, `editState: EditState`.
- Khoá i18n mới:
  - DIALOG_CANCEL_BUTTON, DIALOG_CONFIRM → `dialog.*`;
  - TOAST_EDITS_RESTORED_ONE, TOAST_EDITS_RESTORED_MANY → `toast.*`.

- [ ] **Step 1: Viết test fail.**
  - `messaging.test.ts`: `sendToTab('rule_edit', …)` tới handler `content` trả đúng kiểu (fakeBrowser);
  - `toast.test.ts`: gọi `showToast` hai lần → 1 node; sau 5000ms → 0 node;
  - dialog: `confirmDialog` + bấm Huỷ → `false`; `state.dialog` trở về false.
  - Run: `pnpm vitest run src/lib/messaging.test.ts src/content/core`. Expected: FAIL.
- [ ] **Step 2: Viết code.**
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: typed edit channel, confirm dialog and in-page toast" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 4: Engine sửa HTML (`HtmlEditor`)

**Files:**

- Create: `src/content/edit/engine.ts`, `src/content/edit/engine.test.ts`

**Interfaces:**

- Consumes: `History`, `sanitizeHtml`, `PROTECTED_TAGS`, `recordChange` / `toHtmlChanges` (Task 1); `mergeDecls` (Task 2); `ensureElementId`, `uniquePath`, `displaySelector` (Đợt 4); `siblingOf`, `parentOf`, `isRendered` (`src/lib/dom.ts`).
- Produces: `class HtmlEditor` (port lớp 37 hàm `content.js:14660–15600`):
  - `constructor(opts: { isOwn(el): boolean; select(el: Element | null): void; onChange(): void })`;
  - `copy()`, `cut()`, `paste()`, `duplicate()`, `delete()`, `undo()`, `redo()`: trả `EditResult`. Các ràng buộc (5.12, 5.13):
    - không áp cho `PROTECTED_TAGS`; lỗi `Cannot duplicate <body>.` / `Cannot delete <html>.`;
    - xoá bằng `display: none !important` và giữ `{value, priority}` cũ; sau xoá chọn phần tử kế (anh/em sau, rồi trước, rồi cha);
    - cut = copy + xoá; clipboard xoá sau một lần dán;
    - paste chèn vào **cuối** phần tử chọn; duplicate chèn **ngay sau**;
    - sau undo/redo chọn lại theo thứ tự: phần tử action trả về → phần tử cũ nếu còn trong DOM → anh/em → cha.
  - `setClasses(el, cls)` (5.14): gộp các đổi trên cùng phần tử trong 600ms (`coalesce('cls:'+id)`); ghi class gốc và class mới;
  - `setStyles(el, decls)` (5.17): merge vào style inline; khai báo có `state` / `media` / `pseudo` bị từ chối với lỗi;
  - `setText(el, t)`, `setInnerHtml(el, html)`, `insertHtml(el, pos, html)` (5.15): `before` / `after` không áp cho `PROTECTED_TAGS`;
  - `snapshotForTextEdit(el)` / `commitTextEdit(el)`: chế độ sửa chữ (5.06) ghi một action cho mỗi phần tử bị sửa;
  - `changeCount(el)`, `htmlChanges(): HtmlChange[]` (5.16);
  - `clearByIds(ids, scope)`, `clearAll()`: trả class, display và nội dung gốc; xoá lịch sử của các phần tử đó;
  - `historyState(): EditState`;
  - `dispose()`.
  - 2.24: khi `changeCount` của phần tử về 0 sau undo hoặc clear, gỡ thuộc tính `ID_ATTR` nếu chính engine đã gắn nó. Engine giữ `Set` các id do nó tạo.

- [ ] **Step 1: Viết test fail** (`engine.test.ts`, DOM happy-dom):
  - `<ul><li>a</li><li>b</li></ul>`: chọn `li:first-child` → `delete` → `li` có `display:none !important`, phần tử chọn là `li` b; `undo` → `display` trở về giá trị cũ, chọn lại `li` a;
  - `delete` trên `body` → `{ ok:false, error:'Cannot delete <body>.' }`;
  - `cut` rồi `paste` vào `ul` → `li` mới ở cuối; `paste` lần hai → `ok:false`;
  - `duplicate` → bản sao nằm ngay sau; undo → bản sao bị gỡ;
  - `setClasses` 3 lần trong 500ms → `undo` một lần trả class gốc;
  - `insertHtml(el,'after','<img src=x onerror=alert(1)>')` → `img` không có `onerror`;
  - chuỗi copy/paste/delete/setText rồi undo hết → `body.innerHTML` bằng ban đầu, không còn `data-sr-id-*` (2.24);
  - `clearAll()` → `htmlChanges()` rỗng.
  - Run: `pnpm vitest run src/content/edit/engine.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code.**
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: html edit engine with copy/cut/paste/duplicate/delete and 50-step undo" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 5: Bộ theo dõi sửa CSS (`RuleTracker`)

**Files:**

- Create: `src/content/edit/rules.ts`, `src/content/edit/rules.test.ts`
- Modify: `src/content/sidepanel/rules.ts` (dùng chung `collectRules` cache)

**Interfaces:**

- Consumes: `collectRules`, `sheetsOf`, `sourceName` (Đợt 4); `addressOf`, `locate`, `scopeAddressOf`, `parseDecls`, `serializeDecls`, `SerializedEdit` (Task 2).
- Produces: `class RuleTracker` (port lớp 18 hàm `content.js:16813–17400`, 5.18, 5.19):
  - `constructor(extId, onChange)`;
  - `editRule(addr, declsText): RuleChange | { error }`: tìm rule bằng `locate`; stylesheet không đọc/ghi được (khác domain, `constructed` chỉ đọc) → `{ error: 'Rule is not editable' }`; ghi `record.original` ở lần sửa đầu;
  - `editSelector(addr, selector)`: sửa `selectorText`; nếu không đổi được thì xoá rồi chèn lại ở cùng index. Selector sai → `{ error: 'Invalid selector' }`;
  - `addRule(scopeRoot, selector, wrappers?)`: chèn vào `<style id="sr-rule-edits-<extId>">` của scope root (document hoặc từng shadow root; tạo khi cần); `own: true`, `recordId`;
  - `editInlineStyle(el, declsText)`;
  - `flattened(): RuleChange[]` (có `source`, `line`, trước/sau); `hasChanges()`;
  - `serialize(): SerializedEdit[]`, `applySerialized(list): { applied: number; dormant: SerializedEdit[] }`; khi serialize, các edit dormant được giữ nguyên (5.08);
  - `revert(recordId)`, `revertAll()`: `revertAll` gỡ cả thẻ `sr-rule-edits-*`;
  - `reapplyAll()`: gọi khi trang thêm/đổi stylesheet (`MutationObserver` trên `<head>` và `adoptedStyleSheets` poll nhẹ khi đang sửa), và thử lại các edit dormant;
  - `refreshOwnRules()`.
- Ghi chú: số dòng (`line`) đọc từ text stylesheet đã fetch ở Đợt 4 (`fetch_stylesheet` cache) khi có; không có thì để `null`.

- [ ] **Step 1: Viết test fail** (`rules.test.ts`, `<style>.a{color:red}.a{color:blue}</style>`):
  - `editRule({…selector:'.a', occ:1}, 'color: green')` → rule thứ hai đổi, rule thứ nhất giữ nguyên;
  - `editSelector(addr, '..bad')` → `Invalid selector`;
  - `addRule(document, '.b')` → có `style#sr-rule-edits-test` chứa `.b {}`;
  - `serialize` → `applySerialized` trên DOM mới (cùng CSS) → kết quả giống; với DOM thiếu rule → `dormant.length === 1`, và `serialize()` vẫn chứa edit đó;
  - `revert(id)` → khai báo trở về `color: blue`; `revertAll` → không còn thẻ own;
  - shadow root mở có `<style>` riêng → `scopeAddress` khác `null` và áp lại đúng.
  - Run: `pnpm vitest run src/content/edit/rules.test.ts`. Expected: FAIL.
- [ ] **Step 2: Viết code.**
- [ ] **Step 3: Chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: css rule edit tracker with serialization, dormant edits and revert" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

**— Hết M1. —**

### Task 6: Payload trình sửa, rule kế thừa, `media_activity`, `cascade_ghost_probe`, ép trạng thái

**Files:**

- Create: `src/content/edit/payload.ts`, `src/content/edit/states.ts`, `src/content/edit/payload.test.ts`
- Modify: `src/content/sidepanel/rules.ts`

**Interfaces:**

- Consumes: `getMatchedRules`, `enableCrossOriginStyles` (Đợt 4); `RuleTracker` (Task 5); `statesInSelector`, `rewriteForState` (Task 2).
- Produces:
  - `payload.ts` (port `getRuleEditPayload` `:32625`, `scheduleEditExtras` `:33679`, `setupMediaActivityWatch` `:33713`; 5.10):
    - `buildPayload(el, tracker): RulePayload`. Rule khớp gồm cả shadow, `@media` / `@supports` / `@layer` và nested; có specificity, nguồn + dòng, `editable`, `address`. `paySeq` tăng mỗi lần;
    - `scheduleExtras(el, paySeq)`: `requestIdleCallback` (dự phòng `setTimeout` 0) gom rule kế thừa của các tổ tiên, gửi `edit_payload_extras(paySeq, inherited)`;
    - `watchMedia(rules)`: `matchMedia` cho mỗi điều kiện `@media` duy nhất; khi đổi thì gửi `media_activity`; huỷ khi đổi phần tử hoặc thoát chế độ sửa;
    - `ghostProbe(el)`: so `getComputedStyle` với giá trị thắng theo cascade đã biết; khai báo mà kết quả tính ra khác thì coi là bị đè bởi stylesheet không đọc được (6.42).
  - `states.ts` (port `forceState` `:34379`, `rebuildStateOverrideStylesheet` `:34406`; 5.11):
    - `availableStates(el, rules)`: hợp các `statesInSelector` của rule khớp, kể cả khi bỏ trạng thái thì phần tử mới khớp;
    - `forceState(el, state | null)`: gắn thuộc tính `data-sr-force-<state>-<extId>`, dựng `<style>` riêng gồm các rule có `:state` viết lại; `null` thì gỡ.

- [ ] **Step 1: Viết test fail:**
  - `.btn:hover{color:red}` + `<button class="btn">` → `availableStates` = `[':hover']`; `forceState(':hover')` → stylesheet ép có `.btn[data-sr-force-hover-test]{color:red}`; `forceState(null)` → stylesheet bị gỡ;
  - `buildPayload` hai lần → `paySeq` tăng; `@media (min-width:1px)` → `mediaActive: true`;
  - `scheduleExtras` với `paySeq` cũ → panel bỏ qua (test nằm ở Task 10).
  - Run: `pnpm vitest run src/content/edit/payload.test.ts`. Expected: FAIL.
- [ ] **Step 2–3: Viết code, chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: rule edit payload, inherited extras, media activity and forced states" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 7: Chế độ sửa trên trang — vào/thoát, dock, phím, sửa chữ

**Files:**

- Create: `src/content/edit/mode.svelte.ts`, `src/content/edit/text.ts`, `src/content/edit/index.ts`, `src/content/edit/mode.test.ts`
- Modify:
  - `src/content/core/registry.svelte.ts` (thêm nhóm `edit` vào `DOCK_GROUPS` sau `selections`, hiện chỉ khi `state.editOn`)
  - `src/content/core/keys.ts`, `src/content/tools/index.ts`
  - `src/content/tools/xray/index.ts`, `src/content/tools/capture/element.ts`
  - `src/locales/{en,vi}.json`

**Interfaces:**

- Produces:
  - `setEditMode(on)` (port `setEditMode` `:34709`, `updateEditModeUiOnly` `:34774`, `ensureEditorEngine` `:34806`; 5.05, 1.35):
    - khi vào: tắt sửa chữ, inspector nổi (ghim), X-Ray (3.21), popover, kết quả Tìm;
    - tạo `HtmlEditor` + `RuleTracker` (một lần cho mỗi phiên);
    - `sendToBackground('open_side_panel')` **trước**;
    - gửi `set_mode('edit')`, rồi gửi lại phần tử đang chọn.
    - khi thoát: lưu ngay, huỷ engine HTML (lịch sử mất), giữ `RuleTracker` để sửa CSS vẫn áp; gửi `set_mode('inspect')`.
  - Dock (1.20, 1.44, 5.02, 5.04):
    - nút `modeToggle` có hai trạng thái DOCK_INSPECT_MODE / DOCK_EDIT_MODE; nút đang bật tô nhấn;
    - nhóm `edit`: DOCK_EDIT_TEXT, DOCK_COPY, DOCK_CUT, DOCK_PASTE, DOCK_DUPLICATE, DOCK_DELETE, DOCK_UNDO, DOCK_REDO, với `isDisabled` theo `state.editState` và `state.selected`. Copy / cut / dup / delete cần có phần tử chọn; paste cần có chọn và có clipboard.
  - Phím (5.03, 1.42), qua `addKeyHandler`; ⌘ trên mac, Ctrl ở nơi khác:
    - Z = undo; Shift+Z hoặc Y = redo;
    - khi có chọn: C / X / V / D (không Shift) = copy / cut / paste / duplicate; Backspace / Delete = xoá;
    - ở chế độ sửa, phím số chỉ còn `8` và `0`;
    - không chạy khi `shouldIgnoreKey` (đang gõ trong ô); trong sửa chữ để trình duyệt tự xử lý undo chữ.
  - `text.ts` (port `toggleTextEditMode` `:42022`, `enterTextEditMode` `:42044`, `exitTextEditMode` `:42271`; 5.06):
    - khi bật: `body.contentEditable = 'true'` và đặt cho mọi shadow root mở (`shadowRoots`); `spellcheck=false`;
    - chặn ở capture: `click`, `submit`, `pointerdown` trên link/nút; `beforeinput` có `inputType` bắt đầu bằng `format`; Enter → `insertLineBreak`;
    - lần `beforeinput` đầu trên một phần tử → `engine.snapshotForTextEdit(el)`; khi thoát → `commitTextEdit` cho từng phần tử;
    - ẩn highlight, grid, thước; `setPaused`-style khoá mọi nút dock trừ sửa chữ, thoát, mở dock, side panel, responsive.
  - 4.16: `capture/element.ts` ẩn cả highlight khi `state.editOn`.
- Khoá i18n mới: DOCK_INSPECT_MODE, DOCK_EDIT_MODE, DOCK_EDIT_TEXT, DOCK_COPY, DOCK_CUT, DOCK_PASTE, DOCK_DUPLICATE, DOCK_DELETE, DOCK_UNDO, DOCK_REDO → `dock.*`, nguyên văn.

- [ ] **Step 1: Viết test fail** (`mode.test.ts`, fakeBrowser):
  - `setEditMode(true)` → `open_side_panel` được gửi trước `set_mode('edit')`; `state.xrayOn` false;
  - ở chế độ sửa: phím `3` không có tác dụng, phím `8` vẫn chạy;
  - Ctrl+Z khi focus nằm trong `<input>` → engine không undo;
  - bật sửa chữ → `body.isContentEditable`; click `<a href>` bị `preventDefault`; thoát → thuộc tính bị gỡ;
  - `setEditMode(false)` → listener bị gỡ (đếm qua spy `removeEventListener`), thẻ `sr-rule-edits` vẫn còn.
  - Run: `pnpm vitest run src/content/edit/mode.test.ts src/content/tools`. Expected: FAIL.
- [ ] **Step 2–3: Viết code, chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: edit mode with dock edit group, edit shortcuts and text editing" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 8: Lưu sửa CSS theo site, áp lại khi mở trang, toast

**Files:**

- Create: `src/content/edit/persist.ts`, `src/content/edit/persist.test.ts`
- Modify: `src/content/core/session.ts` (gọi `restorePersisted` khi `startSession`), `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `persistKey`, `isSerializedEdit` (Task 2), `RuleTracker.serialize` / `applySerialized`, `showToast` (Task 3).
- Produces (port `schedulePersistRuleEdits` `:34984`, `persistRuleEditsNow` `:34996`, `restorePersistedRuleEdits` `:35074`, `showEditsRestoredToast` `:35160`):
  - `eligible()`: `window === window.top`, `persistKey(location) !== null`, và `!inResponsiveFrame` (luôn false ở đợt này);
  - `schedulePersist()`: debounce 800ms; `persistNow()` cũng chạy khi `pagehide`, khi thoát chế độ sửa và trong `onStop`. Nếu danh sách rỗng thì `storage.local.remove(key)`, không thì `set({ edits, updatedAt: Date.now() })`;
  - `restorePersisted()`: đọc khoá, lọc bằng `isSerializedEdit`, gọi `applySerialized`. Nếu `applied > 0` thì hiện toast TOAST_EDITS_RESTORED_ONE / TOAST_EDITS_RESTORED_MANY (`$1` = số), 5s;
  - 9.31: `browser.storage.onChanged`: khoá của trang bị xoá (từ trang cài đặt) → `tracker.revertAll()` và xoá các edit chờ, không ghi lại.

- [ ] **Step 1: Viết test fail** (fakeBrowser, fake timers):
  - 3 lần sửa trong 500ms → sau 800ms có đúng 1 lần `storage.local.set`;
  - `revertAll` → khoá bị xoá;
  - storage có 2 edit hợp lệ + 1 rác → áp 2, toast "MANY" với `2`;
  - trong iframe (`window.top !== window`) → không ghi;
  - xoá khoá từ ngoài → sửa trên trang bị gỡ.
  - Run: `pnpm vitest run src/content/edit/persist.test.ts`. Expected: FAIL.
- [ ] **Step 2–3: Viết code, chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: persist css edits per site and restore them with a toast" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 9: Nối kênh phía content — handler sửa, `refresh_changes`, `select_element` mode edit

**Files:**

- Modify: `src/content/sidepanel/bridge.svelte.ts`, `bridge.test.ts`, `src/content/sidepanel/details.ts`, `src/content/sidepanel/highlight.ts`
- Create: `src/content/edit/handlers.ts`, `src/content/edit/handlers.test.ts`

**Interfaces:**

- Produces:
  - `editHandlers(): Handlers<ContentApi>` (phần sửa), gộp vào `handleMessages('content', …)` của bridge. Port `Wg` editor `:21606`, rule_editor `:21940`, trang `:23760–23868`; ứng với 5.17, 5.20, 5.21;
  - các lệnh sửa trả `EditResult`, rồi gọi chung `notifyChanged()`. Port `notifyChangesInvalidated` `:27608`, 5.07:
    - gom bằng `queueMicrotask` rồi gửi `refresh_changes` và `edit_state`;
    - `schedulePersist()`;
    - vẽ lại highlight của phần tử chọn.
  - `revert_all_edits`: `revertAll` + `engine.clearAll()`; id phần tử bị gỡ;
  - `select_edited_element(id)`: `resolveElementById` → chọn + cuộn tới; không thấy → `false`;
  - `force_element_state`: ép rồi gửi lại phần tử;
  - `apply_pending_rule_edits(edits)`: `applySerialized` + `schedulePersist`.
  - Bridge (6.49, 2.27): khi `state.editOn`, `select_element` mang `edit: { payload, editCount }` và gọi `scheduleExtras`; bỏ chọn ở chế độ sửa thì gửi `clear` và huỷ `watchMedia`.
  - `get_page_classes`: tập class trên trang, tối đa 2000, sắp xếp.

- [ ] **Step 1: Viết test fail** (`handlers.test.ts`, fakeBrowser):
  - `edit_delete` → kết quả có `canUndo: true`; panel nhận đúng một `refresh_changes` dù handler gọi `notifyChanged` hai lần;
  - `rule_selector_edit(addr, '..')` → `{ error: 'Invalid selector' }`;
  - `revert_all_edits` → không còn `data-sr-id-*` trên phần tử đã sửa;
  - `select_element` ở chế độ sửa có `edit.payload.rules.length > 0`;
  - bỏ chọn → panel nhận `clear`.
  - Run: `pnpm vitest run src/content/edit src/content/sidepanel`. Expected: FAIL.
- [ ] **Step 2–3: Viết code, chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: wire edit and rule-editor commands through the typed content channel" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

**— Hết M2. —**

### Task 10: Side panel — khung view sửa, `set_mode`, tab CSS / Thay đổi, trạng thái trống

**Files:**

- Create:
  - `src/entrypoints/sidepanel/edit/EditView.svelte`, `EditHeader.svelte`, `EditEmpty.svelte`
  - `src/entrypoints/sidepanel/edit/edit-store.svelte.ts`, `edit.test.ts`
- Modify: `src/entrypoints/sidepanel/App.svelte`, `store.svelte.ts`, `TabBar.svelte`, `src/locales/{en,vi}.json`

**Interfaces:**

- Produces:
  - `store.mode: 'inspect' | 'edit'`. `set_mode` chỉ nhận tin từ frame 0 (6.50); `App` đổi giữa `ElementTab` / `PageTab` và `EditView`;
  - `edit-store`:
    - `payload`, `paySeq`, `inherited`, `mediaActive`, `editState`, `tab: 'css' | 'changes'`;
    - `select_element` mode edit đến khi view sửa chưa mount thì giữ lại để vẽ sau (6.50);
    - `edit_payload_extras` có `paySeq` cũ thì bỏ;
    - `page_updated` xoá danh sách thay đổi; `refresh_changes` → nếu tab Thay đổi đang mở thì tải lại (6.39).
  - `EditHeader` (6.38, 6.47):
    - tên phần tử: click → `go_to_tab` + `go_to_selected_element`;
    - số sửa EDIT_COUNT_NONE / EDIT_COUNT_ONE / EDIT_COUNT_OTHER;
    - ô chọn trạng thái (Task 11);
    - nút undo/redo theo `editState`.
  - `EditEmpty`: EMPTY_MESSAGE_EDIT + danh sách phím SHORTCUT_TOGGLE_RULER, SHORTCUT_UNDO, SHORTCUT_REDO, SHORTCUT_COPY, SHORTCUT_PASTE (⌘ hoặc Ctrl theo `navigator.platform`).
  - Hai tab LABEL_CSS / LABEL_CHANGES; tab đang mở được nhớ trong `sessionStorage` của panel.
- Khoá i18n mới (nguyên văn): LABEL_CSS, LABEL_CHANGES, EMPTY_MESSAGE_EDIT, SHORTCUT_TOGGLE_RULER, SHORTCUT_UNDO, SHORTCUT_REDO, SHORTCUT_COPY, SHORTCUT_PASTE, EDIT_COUNT_NONE, EDIT_COUNT_ONE, EDIT_COUNT_OTHER → `edit.*`.

- [ ] **Step 1: Viết test fail** (`edit.test.ts`, render Svelte trong happy-dom):
  - `set_mode('edit')` từ frame 0 → có `EditView`; từ frame khác → không đổi;
  - `select_element` mode edit đến trước khi mount → sau khi mount thì vẫn vẽ;
  - `edit_payload_extras(1, …)` khi `paySeq` = 2 → bị bỏ;
  - `editCount` 1 → hiện chuỗi EDIT_COUNT_ONE.
  - Run: `pnpm vitest run src/entrypoints/sidepanel`. Expected: FAIL.
- [ ] **Step 2–3: Viết code, chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: side panel edit view shell with mode switch and empty state" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 11: Side panel — trình sửa CSS, ô khai báo, ô class, ô trạng thái

**Files:**

- Create:
  - `src/entrypoints/sidepanel/edit/CssEditor.svelte`, `RuleBlock.svelte`, `DeclEditor.svelte`, `Suggest.svelte`
  - `src/entrypoints/sidepanel/edit/ClassInput.svelte`, `StateSelect.svelte`, `css-editor.test.ts`
- Modify: `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `RulePayload`, `overriddenDecls` (Đợt 4), `suggestProperties` / `suggestValues` / `stepNumber` (Task 2).
- Produces (6.40–6.43, 6.52):
  - `CssEditor`:
    - thẻ LABEL_EFFECTIVE_STYLES;
    - nhóm rule theo wrappers; rule `@media` không áp thì mờ (`mediaActive`, cập nhật qua `media_activity`);
    - nhóm kế thừa LABEL_INHERITED_FROM;
    - nhóm LABEL_RULES có nút LABEL_ADD_RULE → `rule_add`.
  - `RuleBlock`: selector sửa được (Enter / blur → `rule_selector_edit`; lỗi thì viền đỏ và trả về giá trị cũ); rule không sửa được thì chỉ đọc;
  - `DeclEditor` (ô `contentEditable`):
    - gợi ý tên / giá trị / `var(--x)`: ↑/↓ chọn, Enter/Tab nhận, Esc đóng;
    - ↑/↓ trên số thì tăng/giảm;
    - commit có trễ 150ms → `rule_edit` / `inline_style_edit`;
    - nhãn TITLE_INVALID_PROPERTY / TITLE_INVALID_VALUE (`CSS.supports`), TITLE_OVERRIDDEN_BY, TITLE_NOT_INHERITED;
    - TITLE_OVERRIDDEN_HIDDEN / TITLE_OVERRIDDEN_HIDDEN_GRANT từ `cascade_ghost_probe`;
    - thiếu stylesheet khác domain → EDITOR_CROSS_ORIGIN_MISSING + nút ENABLE_CROSS_ORIGIN, dùng lại luồng `enable_cross_origin_styles` của Đợt 4.
  - `ClassInput`:
    - gợi ý từ `get_page_classes` (cache theo tab);
    - gõ xong 300ms → `set_element_classes` → cập nhật số sửa và selector;
    - ⌘/Ctrl+Z, Shift+Z trong ô → `edit_undo` / `edit_redo`.
  - `StateSelect`: Default + `availableStates`; trạng thái đang ép thì tô nhấn → `force_element_state`.
- Khoá i18n mới (nguyên văn): LABEL_EFFECTIVE_STYLES, LABEL_INHERITED_FROM, LABEL_RULES, LABEL_ADD_RULE, TITLE_INVALID_PROPERTY, TITLE_INVALID_VALUE, TITLE_OVERRIDDEN_BY, TITLE_NOT_INHERITED, TITLE_OVERRIDDEN_HIDDEN, TITLE_OVERRIDDEN_HIDDEN_GRANT, EDITOR_CROSS_ORIGIN_MISSING, ENABLE_CROSS_ORIGIN (nếu Đợt 4 chưa có).

- [ ] **Step 1: Viết test fail** (`css-editor.test.ts`, fakeBrowser stub `sendToTab`):
  - gõ `colo` → gợi ý đầu là `color`; Tab → nhận; Esc → đóng;
  - ↑ trên `10px` → gửi `rule_edit` với `11px`;
  - `foo: bar` → nhãn TITLE_INVALID_PROPERTY (stub `CSS.supports`);
  - selector sai → lỗi `Invalid selector` → ô trả về giá trị cũ;
  - Ctrl+Z trong ClassInput → gửi `edit_undo`, không gửi `set_element_classes`;
  - chọn `:hover` → gửi `force_element_state(':hover')`.
  - Run: `pnpm vitest run src/entrypoints/sidepanel/edit`. Expected: FAIL.
- [ ] **Step 2–3: Viết code, chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: side panel css editor with autocomplete, cascade markers, classes and forced states" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 12: Side panel — tab Thay đổi, diff, hoàn tác

**Files:**

- Create: `src/entrypoints/sidepanel/edit/ChangesTab.svelte`, `ChangeGroup.svelte`, `DiffView.svelte`, `ConfirmDialog.svelte`, `changes.test.ts`
- Modify: `src/locales/{en,vi}.json`

**Interfaces:**

- Consumes: `lineDiff`, `whitespaceOnly` (Task 2).
- Produces (6.44–6.46):
  - tải song song `get_rule_changes`, `get_all_flattened_changes`, `get_html_changes`;
  - nhóm theo phần tử (ELEMENTS_COUNT_ONE / _OTHER, RULES_COUNT_ONE / _OTHER);
  - diff có số dòng; nếu chỉ đổi khoảng trắng thì hiện LABEL_WHITESPACE_ONLY_CHANGE; rỗng thì NO_CHANGES_MESSAGE;
  - tương tác:
    - click selector → `select_edited_element`;
    - hover → `highlight_hovered` / `remove_highlight_hovered`;
    - không thấy phần tử → hộp thoại DIALOG_TITLE_ELEMENT_NOT_FOUND / ALERT_NO_SELECTED_ELEMENT;
    - tin gửi lỗi → DIALOG_TITLE_TAB_UNAVAILABLE / ALERT_COULDNT_COMMUNICATE_WITH_TAB;
  - hoàn tác:
    - BUTTON_CLEAR_CHANGES trên từng rule → `revert_rule_change`;
    - từng phần tử: hỏi DIALOG_TITLE_CLEAR_ELEMENT / CONFIRM_CLEAR_ELEMENT → `clear_elements_by_ids`;
    - tất cả: hỏi DIALOG_TITLE_CLEAR_ALL_CHANGES / CONFIRM_CLEAR_ALL_CHANGES → `revert_all_rule_changes` + `clear_changes`;
  - `ConfirmDialog` là hộp thoại trong panel, theo token theme panel; dùng chung khoá `dialog.*` với Task 3.
- Khoá i18n mới (nguyên văn): ELEMENTS_COUNT_ONE, ELEMENTS_COUNT_OTHER, RULES_COUNT_ONE, RULES_COUNT_OTHER, LABEL_WHITESPACE_ONLY_CHANGE, NO_CHANGES_MESSAGE, BUTTON_CLEAR_CHANGES, DIALOG_TITLE_CLEAR_ELEMENT, CONFIRM_CLEAR_ELEMENT, DIALOG_TITLE_CLEAR_ALL_CHANGES, CONFIRM_CLEAR_ALL_CHANGES, DIALOG_TITLE_ELEMENT_NOT_FOUND, ALERT_NO_SELECTED_ELEMENT, DIALOG_TITLE_TAB_UNAVAILABLE, ALERT_COULDNT_COMMUNICATE_WITH_TAB → `changes.*` / `dialog.*`.

- [ ] **Step 1: Viết test fail:**
  - 2 rule đổi trên cùng phần tử → 1 nhóm, hiện "2 rules";
  - diff chỉ khác khoảng trắng → nhãn whitespace;
  - Huỷ ở confirm "xoá tất cả" → không gửi gì; Xác nhận → gửi đúng 2 lệnh theo thứ tự;
  - `select_edited_element` trả `false` → có hộp thoại not-found; `sendToTab` reject → hộp thoại tab-unavailable.
  - Run: `pnpm vitest run src/entrypoints/sidepanel/edit`. Expected: FAIL.
- [ ] **Step 2–3: Viết code, chạy test.** Expected: PASS. `pnpm check && pnpm build` PASS.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "feat: side panel changes tab with grouped diffs and revert" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 13: Ghép nối và hồi quy

**Files:**

- Modify: `src/content/edit/*.test.ts`, `src/entrypoints/sidepanel/app.test.ts`, `src/content/tools/tools.test.ts`

- [ ] **Step 1: Viết test hồi quy:**
  - luồng đầy đủ (fakeBrowser nối content ↔ panel):
    - vào chế độ sửa → chọn phần tử → `rule_edit`;
    - tab Thay đổi có 1 mục, storage có khoá;
    - `stopSession` → `startSession` → sửa được áp lại và có toast;
  - panel tách ra cửa sổ rời (Đợt 4) vẫn giữ `mode: 'edit'` khi handoff;
  - hai tab: sửa ở tab A không gửi `refresh_changes` sang panel của tab B (`accept(sender)`);
  - §9: phím sửa không chạy khi gõ trong `<input>` trong shadow DOM của trang; sự kiện trong panel / dock không đi vào sửa chữ.
- [ ] **Step 2: Sửa lỗi lộ ra.** Chạy `pnpm vitest run`, `pnpm check && pnpm build`. Expected: PASS hết.
- [ ] **Step 3: Commit.** `git add -A && git commit -m "test: edit mode end-to-end, persistence and multi-tab regressions" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 14: Đổi nhãn kiểm kê, thử tay trên Edge

**Files:**

- Modify: `docs/inventory.md`

- [ ] **Step 1: Tách dòng** theo bảng "Phạm vi" (các dòng mới `đợt 6` / `đợt 7` / `đợt 8`, ghi `(tách từ X)`), và sửa phần mô tả của dòng gốc cho khớp.
- [ ] **Step 2: Đánh `[x]`** mọi dòng `đợt 5` đã làm. Với dòng có tên lệnh mới (D3), thêm ghi chú `— bản mới: edit_undo, …`. Dòng 6.38 ghi "không có editor.html riêng (D2)".
- [ ] **Step 3: Thử tay trên Edge** (`pnpm build`, nạp `.output/chrome-mv3`), trên một trang tĩnh, một trang SPA (React) và một trang có shadow DOM:
  - [ ] Dock: công tắc Soi / Sửa; side panel tự mở; nhóm sửa hiện; nút copy / dup / xoá mờ khi chưa chọn.
  - [ ] Xoá → phần tử ẩn, phần tử kế được chọn; Ctrl+Z hiện lại; Ctrl+Shift+Z và Ctrl+Y redo; 51 lần xoá → chỉ undo được 50.
  - [ ] Cut / paste vào phần tử khác; paste lần hai không làm gì; duplicate nằm ngay sau; `html` / `body` không xoá được.
  - [ ] Sửa chữ: gõ trên trang, click link không điều hướng, Ctrl+B không in đậm, Enter xuống dòng; thoát rồi undo trả chữ gốc.
  - [ ] Đổi class trong panel: gõ liên tục rồi một lần Ctrl+Z trả class gốc; số sửa cập nhật.
  - [ ] Sửa khai báo: gợi ý, ↑/↓ đổi số, thuộc tính sai có nhãn; sửa selector sai báo lỗi; thêm rule mới áp ngay.
  - [ ] Rule `@media` không áp bị mờ; kéo hẹp cửa sổ thì cập nhật. Trang có CSS khác domain hiện nút cấp quyền.
  - [ ] Ô trạng thái: `:hover` ép được; về Default thì gỡ.
  - [ ] Tab Thay đổi: nhóm, diff, hover tô phần tử, click chọn, hoàn tác từng mục / từng phần tử / tất cả (có hỏi).
  - [ ] Tải lại trang → bật extension → sửa CSS áp lại, toast "… edits restored" 5s; hoàn tác tất cả → tải lại → không còn toast.
  - [ ] Ở chế độ sửa: phím 3 / 5 không có tác dụng; 8 và 0 chạy; X-Ray tắt khi vào chế độ sửa; chụp phần tử không lộ highlight.
  - [ ] Theme sáng / tối của panel và toast; tiếng Việt và tiếng Anh.
- [ ] **Step 4: Commit.** `git add -A && git commit -m "docs: retag phase-5 inventory lines" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

**— Hết M3. —**

---

## Xong khi

- Mọi dòng `đợt 5` trong `docs/inventory.md` đã là `[x]` hoặc được tách sang đợt khác, có ghi chú.
- `pnpm vitest run`, `pnpm check`, `pnpm build` PASS; manifest không thêm quyền; không có dependency mới.
- Checklist thử tay Task 14 qua hết trên Edge (trang tĩnh, SPA, shadow DOM).
- Undo hết trả DOM về ban đầu, không còn id của extension (test Task 4 và Task 13).
- Sửa CSS sống qua tải lại trang và có toast; khoá rỗng thì bị xoá.

## Ghi chú cho các đợt sau

- **Đợt 6 (Responsive):**
  - gọi `apply_pending_rule_edits(serialize())` khi vào/thoát iframe responsive; đặt `inResponsiveFrame` trong `persist.ts`; thêm cờ "vừa thoát responsive" để bỏ toast (5.09);
  - chuyển tiếp lệnh dock sửa xuống iframe (5.02); `responsive_mode_ready` (6.51);
  - hộp thoại prompt / size (9.44 phần tách) dùng `Dialog.svelte` có prop `buttons` / ô nhập của Task 3.
- **Đợt 7 (Cài đặt):** liệt kê / xoá sửa đã lưu bằng `listPersistedEdits` / `clearPersistedEdits`. Content tự gỡ sửa nhờ `storage.onChanged` (9.31).
- **Đợt 8 (MCP):** MCP gọi thẳng `set_element_classes`, `set_element_styles`, `set_text_content`, `set_inner_html`, `insert_html`, `rule_edit`. Mọi HTML đã qua `sanitizeHtml`; MCP không được có đường vòng.
- **Đợt 9:** nếu chủ dự án chọn giữ dữ liệu cũ (chốt #3), khoá `persistedRuleEdits:*` đã cùng định dạng, nên không cần migrate.
- Toast (`src/content/core/toast.ts`) và `confirmDialog` là hạ tầng chung; các đợt sau dùng lại, không tạo bản mới.

## Quyết định đã chốt (chủ dự án, 2026-11-03)

Đồng ý toàn bộ khuyến nghị:

1. Ctrl+Z không lùi sửa CSS (như bản cũ); sửa rule hoàn tác ở tab Thay đổi.
2. Xoá phần tử = ẩn (`display:none`), như bản cũ.
3. Giữ khoá lưu `persistedRuleEdits:<origin>` và định dạng cũ.
4. Không lưu sửa HTML theo site.
5. Gộp view sửa vào app side panel (không có `editor.html` riêng).
6. Gợi ý thuộc tính CSS lấy lúc chạy + bảng ưu tiên nhỏ.
7. Toast "đã khôi phục sửa" chỉ có chữ.

Bố cục giao diện được thiết kế lại tự do (như Đợt 4), miễn giữ đủ thông tin và hành vi.
