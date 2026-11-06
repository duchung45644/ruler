# iodob — viết lại extension (thiết kế)

Ngày: 2026-11-01 · Trạng thái: chờ duyệt

## 1. Mục đích

iodob là extension Chromium (MV3) để đo, soi và chỉnh giao diện web, dùng cá nhân trên Edge (và Chrome).
Đây là bản dùng riêng của **Screen Ruler** — extension của chính chủ dự án (axoliz), đã xác nhận quyền tái dùng code gốc.
Bản hiện tại trong `unpacked/` chạy tương đối ổn định nhưng chỉ còn **bản build** (source gốc không còn):
`scripts/content.js` 48k dòng, `sidepanel/main.js` 11k, `background.js` 3,7k, `options/main.js` 1,8k,
`scripts/detect-technologies.js` 2,5k — code Babel (async thành máy trạng thái `switch/case`), tên biến rút gọn,
đã bị vá trực tiếp nhiều chỗ (các hàm `bd...`). Phần tính năng thêm gần đây nằm riêng trong `unpacked/scripts/bd/`
và `unpacked/bd-background.js` (đã là module, code dễ đọc).

Viết lại để: có source đọc được, ít code hơn nhiều, một style thống nhất, mỗi tính năng ở một chỗ, không lặp code (DRY),
giao diện mới — **mà không đánh mất hành vi đang chạy ổn và các lỗi đã sửa**.

## 2. Mục tiêu / không làm / tuyệt đối tránh

### Mục tiêu

- Giữ toàn bộ tính năng ở mục 4 (trừ phần bị bỏ).
- Source TypeScript + Svelte, module theo tính năng; logic dùng chung nằm ở một chỗ.
- Giao diện mới theo mục 7.
- Ít code hơn rõ rệt (định hướng: < 20k dòng tự viết cho toàn bộ, so với ~68k dòng build hiện tại).
- Tái dùng logic cũ: chuyển từ bản build sang code hiện đại, chỉ thay khi có cách rõ ràng tốt hơn.

### Không làm

- Không thêm tính năng mới trong đợt viết lại (ngoài những gì cần cho cấu trúc mới).
- Không giữ 20 ngôn ngữ — chỉ tiếng Việt và tiếng Anh.
- Không phát hành lên store; dùng bản unpacked.
- Không chuyển dữ liệu cũ (cài đặt, chỉnh sửa CSS đã lưu) sang bản mới.

### Tuyệt đối tránh

- Lỗi đã sửa tái phát (danh sách ở mục 9).
- Mất tính năng mà không ai để ý — mọi tính năng ở mục 4 phải có trong checklist đối chiếu.
- Framework/đồng bộ trạng thái nằm trên đường chạy liên tục (rê chuột, cuộn, kéo) gây giật.
- Đưa lại gọi mạng ra ngoài, license, gói trả phí.
- "Big bang": bản cũ phải dùng được hằng ngày cho tới khi bản mới đạt đủ checklist.

## 3. Ràng buộc

- Chromium MV3; Edge là trình duyệt chính, Chrome phải chạy được.
- Quyền giữ như hiện tại + `debugger` (chụp cả trang). Không có `host_permissions` cố định: quyền host xin khi cần (`optional_host_permissions: <all_urls>`), `downloads`, `clipboardWrite` là optional.
- Content script được inject theo lệnh (bấm icon / phím tắt), không khai báo chạy sẵn trên mọi trang.
- Manifest `commands` chỉ cho tối đa 4 phím gợi ý (hiện dùng 3: mở extension Alt+Shift+S, chọn cha Alt+Shift+↑, chọn con Alt+Shift+↓).
- Giao diện chèn vào trang phải nằm trong shadow DOM; CSS trang không được ảnh hưởng và ngược lại.
- Trong trang, `rem` đi theo cỡ chữ của trang → giao diện chèn vào trang dùng `px`.
- `chrome.tabs.captureVisibleTab` giới hạn ~2 lần/giây; canvas cao tối đa ~32 767px; clipboard ảnh cần secure context (https/localhost).
- MV3 cấm code từ xa: mọi thứ (Tailwind, font, icon) đóng gói sẵn.

## 4. Kiểm kê tính năng

Ký hiệu: **giữ** (chuyển sang bản mới) · **bỏ**.

**Quy tắc phạm vi:** mọi hành vi bản cũ đang có đều **giữ**, trừ những gì ghi rõ là **bỏ** ở 4.8. Danh sách dưới đây là tóm tắt;
đợt 0 lập danh sách đầy đủ từ `legacy-src/` (`docs/inventory.md`) làm cơ sở cho checklist đối chiếu.

### 4.1 Chọn và soi phần tử (trên trang) — giữ

- Bật/tắt extension trên tab: bấm icon, Alt+Shift+S, menu chuột phải; Ctrl+Q thoát; Pause tạm dừng.
- Inspector: rê chuột → khung highlight + số đo; inspector nổi (tag, kích thước, font, màu, padding, radius…), nút Copy CSS; Space ghim nhiều inspector để so sánh.
- Click chọn phần tử; Esc bỏ chọn; chọn cha/con (Alt+Shift+↑/↓, nút trên dock); anh/em (Alt+Shift+←/→).
- Đo khoảng cách giữa phần tử đang chọn và phần tử đang rê.
- X-Ray: viền toàn bộ phần tử.
- Tìm phần tử theo CSS selector (đếm số khớp, số bị ẩn).
- Hút màu (EyeDropper API).
- Phím số: 1 Inspector · 2 X-Ray · 3 Grid · 4 Thước · 5 Breakpoints · 6 Hút màu · 7 Tìm · 8 Chụp · 9 Responsive · 0 Side panel; O Đè ảnh · M Đo vùng · A Màu & font.

### 4.2 Đo và căn chỉnh — giữ

- Thước mép trang + crosshair theo chuột.
- Đường gióng kéo từ thước (snap vào cạnh phần tử, thả về thước để xoá, double-click xoá), hiện khoảng cách giữa các đường.
- Đo vùng: kéo vẽ, kéo giữa để di chuyển, kéo góc để co giãn, Esc xoá; panel gõ W/H, trái/trên, cách mép phải/dưới trang (Shift+↑/↓ bước 10); phím mũi tên dịch 1px (Shift 10), Ctrl nới, Ctrl+Alt thu; đường gióng 4 cạnh; chọn màu (lưu lại).
- Lưới layout: số cột, max width, gutter, margin, độ mờ, màu.
- Breakpoints: vạch các mốc media query của trang.
- Đè ảnh thiết kế: nhiều ảnh (thả/dán/chọn file), chọn ảnh bằng click hoặc thumbnail, kéo giữa/kéo góc, mũi tên dịch ảnh đang chọn, độ mờ, Normal/Difference (2 nút, không dropdown), ẩn/hiện, ghim theo màn hình, ảnh @2x tự 50%.
- Màu & font của trang (phím A): **panel nổi trên trang** như hiện tại — màu/font/khoảng cách đang dùng, click để highlight phần tử, copy, cảnh báo spacing không chia hết 4.

### 4.3 Sửa trực tiếp — giữ

- Sửa CSS trực tiếp (rule có sẵn, inline, thêm rule, đổi selector), theo dõi thay đổi, hoàn tác từng thay đổi / tất cả.
- Sửa chữ; copy/cut/paste/nhân đôi/xoá phần tử; undo/redo (Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y).
- Nhớ CSS đã sửa theo từng site, tự áp lại khi bật extension ở site đó (toast báo); xoá trong trang cài đặt.
- **Đổi (2026-11-05):** không còn chế độ sửa riêng. Sửa luôn sẵn khi chọn phần tử; nút sửa (chữ, copy/cut/paste/nhân đôi/xoá, trạng thái :hover…, undo/redo) và mục CSS nằm ở tab Element của side panel; danh sách thay đổi ở tab Changes.

### 4.4 Side panel — tab Phần tử — giữ

Document (cây phần tử, đi tới cha/con) · Text content · Box model · Computed · CSS rules gom theo file nguồn (stylesheet khác domain: xin quyền host rồi fetch qua background) · Effective styles (kế thừa, bị override) · Layout flex/grid · Typography · Màu · Background · Border · Gradient · Box shadow tách lớp · Animation/Transition + đường easing · Canvas (kích thước, context, bảng màu) · Asset (tải ảnh/SVG, tải tất cả) · Sinh class Tailwind · Lỗi contrast WCAG (AA/AAA, icon) — click lỗi để highlight phần tử.

**Đổi (2026-11-05):** thứ tự tab Element: thanh sửa · tên phần tử kèm cha/con · Box Model (kiểu DevTools, luôn mở, rê lên vòng nào thì tô phần đó trên trang) · Issue · CSS (kiểu Styles của DevTools: lọc, `.cls`, `+`, `selector { … }`, tick bật/tắt thuộc tính, ô màu) · Layout · Typography · Màu · Gradient · Shadow · Motion · Text · Asset · Code. Các mục đóng sẵn và nhớ lựa chọn.

### 4.5 Side panel — tab Trang — giữ

Meta tags (SEO / Open Graph / Twitter) · Xem trước khi share (Facebook, LinkedIn, X) · 16 kiểm tra SEO (title, description, H1, alt, canonical, lang, viewport, noindex, OG…) · Nhận diện >150 công nghệ (`detect-technologies.js` chạy MAIN world) · Dung lượng trang theo loại tài nguyên.

Side panel tách ra cửa sổ riêng / gắn lại được.

### 4.6 Responsive mode — giữ

Nhiều viewport cạnh nhau; thêm viewport tuỳ chỉnh, di chuyển, co giãn, xoá, reset; xoay, zoom, tải lại, đồng bộ cuộn;
chế độ breakpoints (mỗi mốc media query một khung); đổi sáng/tối từng khung; đổi bố cục khung; cảnh báo tràn ngang;
giữ các khung đồng bộ khi trang SPA chuyển trang; trang chặn iframe → gỡ header bằng `declarativeNetRequest` session rules
(xin quyền host); sửa CSS trong responsive mode áp vào frame.

### 4.7 Chụp màn hình — giữ

- Nút chụp / phím 8 → thanh chế độ, mặc định **Chụp vùng** (kéo được ngay); các chế độ khác: Chụp màn hình, Chụp cả trang, Phần tử đang chọn (kèm số đo, tuỳ chọn padding/highlight).
- Chụp vùng: màn hình đóng băng bằng ảnh chụp lúc bấm; kéo vẽ, kéo giữa di chuyển, kéo cạnh/góc co giãn (8 tay nắm tròn, viền nét đứt trắng); thanh chế độ ẩn khi bắt đầu vẽ; thanh Copy/Lưu/Vẽ chú thích cạnh vùng chọn.
- Trình sửa ảnh: thanh công cụ **dưới** ảnh, cả cụm căn giữa dọc; Copy/Lưu/Vẽ chú thích; công cụ Bút (P) · Mũi tên (A, mặc định) · Khung (R) · Tô sáng (H) · Chữ (T); 6 màu, 3 cỡ; Ctrl+Z; nhớ công cụ dùng lần cuối; ảnh dài cuộn trong khung.
- Chụp cả trang: xem mục 9.

### 4.8 Khác

- Trang cài đặt — giữ: theme (Hệ thống / Sáng / Tối), định dạng màu, highlight + padding khi chụp, xoá chỉnh sửa đã lưu, kết nối MCP.
- MCP (AI agent) — **giữ, làm sau cùng**: ~50 lệnh (list_tabs, get_page_info, get_element_details, query_selector, get_element_matched_rules, apply_styles, add_rule, revert_*, set_text_content, get_screenshot, set_viewport…). Hiện kênh kết nối đã bị gỡ (`request_mcp_connect` → hàm rỗng), nên MCP không chạy.
- Ngôn ngữ: **chỉ vi + en**; bỏ 20 ngôn ngữ còn lại.
- **Bỏ**: gói Pro/Studio/Inspect, dùng thử (`screen-ruler-trial-end-*`), kiểm tra license, link mua (`axoliz.*/l/screen-ruler?variant=…`),
  đăng nhập kiểu cũ / khôi phục mua hàng, menu "enter_license", các màn hình giới thiệu/bán hàng (hero, so sánh gói, đánh giá,
  "trusted by", video, "unlock Pro"), link `www.iodob.com/*`, listener `onMessageExternal` (`install_timestamp`), các hàm stub còn sót.

## 5. Quyết định đã chốt (của chủ dự án)

1. Tái dùng logic cũ, chỉ đổi khi có cách tốt hơn; không viết lại từ số 0.
2. TypeScript; giao diện **Svelte 5**; **Tailwind** + icon **Lucide**.
3. Giao diện mới (mục 7): hướng A "tối, kính mờ" + cách hiện số đo trên trang của hướng C.
4. Chỉ tiếng Việt và tiếng Anh.
5. Giữ MCP cho tương lai; bỏ toàn bộ gói/mua/đăng nhập.
6. (2026-11-05) Bỏ chế độ sửa; sửa nằm trong tab Element của side panel (xem 4.3, 4.4).
7. (2026-11-05) Phím tắt dock là chữ cái: I inspect, X X-Ray, G grid, R thước, B breakpoints, M đo, C hút màu, F tìm, O đè ảnh, A audit, S chụp, P side panel. Dock 5 nhóm: ↑ ↓ Inspect Tìm | X-Ray Grid Breakpoint | Thước Đo Hút màu | Đè ảnh Audit Chụp | Panel Pause Quit. Bỏ nút ẩn dock.
8. (2026-11-05) Tắt inspector thì ẩn mọi thứ của inspector trên trang nhưng giữ phần tử chọn cho side panel.

## 6. Kiến trúc

### 6.1 Công cụ

- **WXT** (trên Vite) làm khung extension: entrypoint background / content (inject runtime) / sidepanel / options, build ra thư mục load unpacked, tự reload khi dev.
- pnpm, Node 22. ESLint + Prettier (typescript-eslint, eslint-plugin-svelte). Vitest cho logic thuần.
- Tailwind v4 qua plugin Vite; Lucide qua `@lucide/svelte` (UI Svelte) và `lucide` (chỗ vẽ bằng TS thuần).

### 6.2 Bố cục repo

```
/                       package.json, wxt.config.ts, tsconfig, eslint, prettier
src/
  entrypoints/
    background.ts       router message, commands, context menu, capture, chụp cả trang (debugger),
                        DNR responsive, side panel, fetch stylesheet, tech detection, MCP
    content/            entry content script: tạo shadow host, khởi động core
    sidepanel/          index.html + App.svelte
    options/            index.html + App.svelte
  lib/                  KHÔNG phụ thuộc UI: messaging (có kiểu), settings/storage, i18n, dom,
                        geometry, color, css (specificity, matched rules, tailwind),
                        page (seo, meta, weight), tech (signatures), capture helpers
  content/
    core/               controller: vòng đời, trạng thái chọn/hover, registry công cụ,
                        định tuyến sự kiện (capture phase), lớp vẽ overlay
    tools/<tên>/        mỗi công cụ một thư mục: inspector, xray, grid, breakpoints, ruler, guides,
                        measure, distance, overlay, find, eyedropper, edit, responsive, capture, audit
  ui/                   component Svelte dùng chung (Panel, Toolbar, Button, NumberField…),
                        theme Tailwind (token), icon
public/_locales/{en,vi} icons, fonts (Geist, Geist Mono — tái dùng từ unpacked/fonts, OFL)
legacy-src/             bản build đã "gỡ build" (đọc tham khảo, không đóng gói)
unpacked/               bản cũ, giữ nguyên tới khi chuyển xong
docs/                   spec, plan, checklist
```

### 6.3 Nguyên tắc DRY (bắt buộc)

- **Registry công cụ là nguồn sự thật duy nhất**: mỗi công cụ khai báo `{ id, icon, nhãn i18n, phím tắt, nhóm dock, activate(), deactivate() }`.
  Dock, phím số, menu, side panel bật/tắt, MCP đều đọc từ registry — không còn các `switch` lặp lại như bản cũ
  (`handleAction`, `executeShortcut`, danh sách dock, `onMessage` mỗi nơi một kiểu).
- **Một kênh message có kiểu** (request/response định nghĩa một lần) cho content ↔ background ↔ side panel ↔ options.
- **Một lớp settings** có schema + giá trị mặc định, đọc/ghi qua một API, phát sự kiện khi đổi.
- **Một cơ chế i18n** (vi/en), không có chuỗi giao diện viết cứng trong component.
- **Một lớp vẽ overlay** trên trang: công cụ đăng ký hàm vẽ; render gom theo `requestAnimationFrame`.
- **Một helper gắn UI Svelte vào shadow root** (kèm CSS Tailwind) dùng cho dock, panel nổi, capture, editor.
- **Token giao diện** (màu, bo góc, blur, font, khoảng cách) định nghĩa một lần trong theme Tailwind; không có khối CSS viết tay theo từng màn hình.
- Logic thuần (màu, hình học, CSS, SEO…) ở `lib/` và có unit test.

### 6.4 Đường chạy liên tục

Rê chuột, cuộn, kéo (highlight, số đo, thước, gióng, khung đo, preview vẽ chú thích) viết TypeScript thuần,
thao tác DOM/canvas trực tiếp, gom theo rAF. Svelte chỉ cho panel/toolbar/side panel/options.

## 7. Giao diện mới

- **Bề mặt nổi trên trang** (dock, inspector, panel, toolbar): tối, trong mờ — nền ~`rgba(24,24,27,.9)`, `backdrop-blur` ~8px,
  viền trắng 8–14%, bo góc 12–14 (panel), 8–9 (nút), bóng đổ đậm. Chữ zinc-200/400. Màu nhấn **indigo** (`#6366f1`) cho trạng thái bật.
- **Số đo trên trang** (kiểu C): số font mono ~10px đậm, không nền: chiều rộng giữa phía trên cạnh trên, chiều cao trong cạnh phải
  (giữa theo chiều dọc), khoảng cách tới phần tử bên cạnh ở hai bên ngoài. Viền phần tử nét liền 1.5px + nền nhấn ~7%.
  Không có đường gióng nét đứt.
- **Màu số đo đổi theo nền trang**: trang sáng → indigo-600 `#4f46e5`; trang tối → indigo-300 `#a5b4fc` (đo độ sáng nền trang như `bdDetectPageIsDark` cũ).
- Theme: Hệ thống (tương phản với trang — hành vi `bdResolveTheme` cũ) / Sáng / Tối; mỗi bề mặt có bản sáng tương ứng (trắng, viền zinc-200).
- Font: Geist cho chữ, Geist Mono cho số (đóng gói sẵn).
- Mockup đã duyệt: `.superpowers/brainstorm/*/content/visual-style-v2.html`. Màn hình chi tiết (side panel, options, các panel) thiết kế theo token này trong từng đợt; chỉnh sau khi dùng thử.

## 8. Cách chuyển đổi và các đợt

### Đợt 0 — Khung + gỡ build

- Tạo project WXT (TS, Svelte 5, Tailwind v4 + px + `:host` defaults cho `@property`, Lucide, i18n vi/en, ESLint/Prettier, Vitest).
- Chạy công cụ gỡ build (ví dụ `wakaru`; không được thì `webcrack`/thủ công) trên 5 file build → `legacy-src/` để đọc và chuyển logic. Không đóng gói.
- Lập `docs/inventory.md`: danh sách đầy đủ hành vi từ `legacy-src/` (theo dock, phím tắt, message, mục side panel, cài đặt),
  mỗi mục ghi đợt sẽ chuyển và vị trí code cũ. Đây là checklist đối chiếu cho các đợt sau.
- Xong khi: extension rỗng build và load được trên Edge, lint/test chạy; `legacy-src/` có code async/await, class thật; có `docs/inventory.md`.

### Đợt 1 — Lõi + Inspector

Kích hoạt/thoát/pause, shadow host, registry, dock, settings, messaging, lớp overlay, theme;
inspector (hover, số đo kiểu C, inspector nổi, ghim Space), chọn/bỏ chọn, cha/con/anh/em, đo khoảng cách.

### Đợt 2 — Đo & căn chỉnh

Thước, gióng, đo vùng + panel, grid, breakpoints, X-Ray, đè ảnh, tìm phần tử, hút màu, style audit
(chuyển từ `unpacked/scripts/bd/` — đây là code mình viết, giữ nguyên hành vi).

### Đợt 3 — Chụp

Thanh chế độ, chụp vùng/màn hình/cả trang/phần tử, trình sửa ảnh (chuyển từ `scripts/bd/capture/` + `bd-background.js`).

### Đợt 4 — Side panel

Tab Phần tử, tab Trang, tách/gắn cửa sổ.

### Đợt 5 — Sửa trang

Engine sửa HTML + undo/redo (class 37 hàm cũ), theo dõi thay đổi CSS (class 18 hàm cũ), lưu theo site.

### Đợt 6 — Responsive mode

Toàn bộ mục 4.6.

### Đợt 7 — Trang cài đặt

Các mục cài đặt ở 4.8.

### Đợt 8 — MCP

Chuyển các lệnh; thiết kế lại kênh kết nối tới MCP server cục bộ (quyết định trong đợt này).

### Đợt 9 — Chuyển hẳn

Checklist đạt hết → xoá `unpacked/`, `legacy-src/`.

Mỗi đợt xong khi: `tsc`, lint, unit test qua; load unpacked trên Edge; các mục checklist của đợt (mục 9 + tính năng mục 4) đạt khi thử tay; commit.
Bản cũ vẫn dùng song song; bản mới load từ thư mục build riêng.

## 9. Checklist chống tái phát (bắt buộc kiểm mỗi đợt liên quan)

### Inspector / chọn

- Inspector tắt → cuộn trang không highlight phần tử, không bật lớp chặn click.
- Chọn con/anh/em bỏ qua node của extension và thẻ không hiển thị (`script`, `style`, `link`, `meta`, `noscript`, `template`).
- Đang gõ trong ô nhập (input/textarea/select/contentEditable, kể cả trong shadow DOM) → không kích hoạt phím tắt.
- Sự kiện trong panel của extension không lọt xuống inspector.
- Kéo (gióng, khung đo, ảnh) không gây click lên trang (chặn click ngay sau thả, cờ tự xoá ~50ms); không hover-inspect trong lúc kéo.
- Khi UI chụp/sửa ảnh mở, các công cụ trên trang tạm dừng.

### Đo / đè ảnh

- Mũi tên dịch ảnh đè bỏ qua tổ hợp có Alt (để Alt+Shift+←/→ chọn anh/em).
- Ghim ảnh theo màn hình đổi toạ độ trang ↔ màn hình, ảnh không nhảy.

### Chụp

- Mở chế độ chụp: ẩn dock/panel, chụp 1 lần, phủ ảnh đóng băng; Copy/Lưu/Vẽ chú thích cắt từ ảnh đó → không nháy.
- Trình sửa ảnh không có hiệu ứng fade làm lộ trang.
- Vẽ hình (mũi tên/khung/tô sáng) preview trên lớp cỡ màn hình, vẽ vào ảnh khi thả → không giật với ảnh dài.
- Đưa canvas thẳng vào trình sửa ảnh, không đi vòng PNG.
- Copy ảnh lỗi trên trang http → báo lỗi rõ, Lưu vẫn dùng được.

### Chụp cả trang

- Dùng `chrome.debugger`: phóng viewport (`Emulation.setDeviceMetricsOverride`) bằng cả trang — `captureBeyondViewport` một mình làm lặp ảnh.
- Đọc ảnh theo khúc ≤ ~8000px thiết bị (một lần chụp vượt texture GPU ~16384px sẽ lặp ô).
- Trang cuộn trong khung riêng: tìm khung cuộn dọc lớn nhất, phóng viewport thêm `scrollHeight − clientHeight`.
- Che màn hình bằng ảnh đóng băng + thanh loading; trang đẩy xuống 1 màn (`transform` trên `<html>`, viewport cao thêm đúng chừng đó) để lớp che nằm ngoài vùng chụp; bật/tắt trong phiên debugger.
- Trả vị trí cuộn trong phiên debugger trước khi tháo; mở trình sửa ảnh trước khi gỡ lớp che.
- Giới hạn chiều cao theo canvas (~32 000px thiết bị).
- Debugger lỗi (vd. DevTools đang mở) → cuộn-ghép dự phòng (cách nhau ≥550ms; ẩn `fixed`/`sticky` sau đoạn đầu) + ghi chú lý do trong trình sửa ảnh.

### Giao diện trong trang

- Tailwind trong shadow DOM: kích thước theo `px`; giá trị mặc định của biến `@property` khai báo trong `:host`.

## 10. Rủi ro

- Công cụ gỡ build không xử lý hết → phần còn lại chuyển tay, chậm hơn ở đợt đầu của mỗi phần lớn.
- Class điều khiển 443 hàm có nhiều phụ thuộc chéo → tách dần theo registry; giữ hành vi bằng checklist.
- Responsive mode và sửa CSS là phần phức tạp nhất (iframe, DNR, đồng bộ chỉnh sửa) → để đợt sau, khi lõi đã ổn.
- MCP chưa có kênh kết nối → có thể phải thiết kế mới hoàn toàn ở đợt 8.

## 11. Để người làm tự quyết

- Chia module chi tiết bên dưới bố cục 6.2; cách cài messaging có kiểu (tự viết hay thư viện nhỏ), store Svelte.
- Cấu hình Tailwind/ESLint cụ thể; cách test bổ sung ngoài Vitest.
- Thời điểm hiện số khoảng cách hai bên (bám theo hành vi đo khoảng cách hiện tại).

### Lựa chọn của người viết tài liệu (chưa hỏi chủ dự án — kiểm khi duyệt)

- Phạm vi: mọi hành vi bản cũ giữ trừ mục "Bỏ"; danh sách đầy đủ lập ở đợt 0.
- Màu & font của trang (phím A) giữ là panel nổi trên trang, làm ở đợt 2.
- Màn hình giới thiệu/bán hàng trong side panel bỏ cùng các gói.
- Giữ tên iodob.
- WXT làm khung; pnpm.
- Font Geist / Geist Mono tái dùng từ `unpacked/fonts`.
- Không chuyển dữ liệu đã lưu; extension mới có ID khác bản cũ.
- Theme giữ 3 lựa chọn như cũ, "Hệ thống" = tương phản với trang.
- `legacy-src/` commit vào repo để đọc/tìm, xoá ở đợt 9.
- Thứ tự đợt như mục 8.
