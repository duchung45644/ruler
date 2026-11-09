# Edge Add-ons — nội dung đăng

Gói: `corepack pnpm zip` → `.output/pixellens-<version>-chrome.zip`.

Ảnh:
- Logo store: `docs/store/logo-300.png` (300×300).
- Small promotional tile: `docs/store/tile-440x280.png`.
- Large promotional tile: `docs/store/tile-1400x560.png`.
- Screenshots: chụp tay, 1280×800 hoặc 640×480, 1–10 ảnh.

Category: **Developer tools**. Privacy policy URL: link công khai tới `docs/privacy-policy.md`.

---

## English

**Name:** PixelLens — The All-in-One Toolkit for Web Inspection and Design

**Short description:** Hover any element to see how it's built, from size and spacing to styles and colors, then fine-tune it right on the page.

**Description:**

PixelLens puts a full inspection and design toolkit on any web page. No DevTools digging, just hover, measure and tweak.

Inspect
• Hover to see size, padding, margin, font, colors and contrast
• Distances between elements, X-Ray outlines, find elements by selector or text
• Side panel with box model, matched CSS rules, fonts, colors, assets and page info

Measure and align
• Rulers with draggable guides, measure tool, layout grid overlay
• Overlay a design image with difference, onion skin and before/after split

Edit live
• Change CSS and text right on the page, force :hover / :focus states
• Edit CSS variables and watch the whole page update
• Copy all changes as CSS, Tailwind classes or a ready-to-paste AI prompt

Check quality
• Accessibility audit, WCAG contrast fixes, color-blindness simulation, tab focus order
• Core Web Vitals: LCP, CLS and INP shown on the page

Responsive and capture
• Preview several device sizes side by side, with synced scroll
• Screenshots of the view, an element, or the full page

For AI agents
• Optional local MCP server lets coding agents (Claude Code, Cursor…) inspect and capture the page you are on

Keyboard first: number keys 1–0 switch tools, Ctrl+K searches every command.

Private by design: no tracking, no account, nothing leaves your browser.

---

## Tiếng Việt

**Tên:** PixelLens — Bộ công cụ tất cả trong một để kiểm tra và thiết kế web

**Mô tả ngắn:** Rê chuột lên một phần tử để thấy nó được dựng ra sao, từ kích thước, khoảng cách đến style và màu, rồi chỉnh ngay trên trang.

**Mô tả:**

PixelLens mang cả bộ công cụ kiểm tra và thiết kế lên mọi trang web. Không cần lục DevTools, chỉ cần rê chuột, đo và chỉnh.

Kiểm tra
• Rê chuột để xem kích thước, padding, margin, font, màu và độ tương phản
• Khoảng cách giữa các phần tử, X-Ray, tìm phần tử theo selector hoặc nội dung
• Side panel với box model, rule CSS khớp, font, màu, tài nguyên và thông tin trang

Đo và căn chỉnh
• Thước kèm đường gióng kéo được, công cụ đo, lưới layout
• Chồng ảnh thiết kế lên trang với chế độ difference, onion skin và thanh so trước/sau

Chỉnh trực tiếp
• Sửa CSS và chữ ngay trên trang, ép trạng thái :hover / :focus
• Sửa biến CSS và thấy cả trang đổi theo
• Copy toàn bộ thay đổi dạng CSS, class Tailwind hoặc prompt dán thẳng cho AI

Kiểm tra chất lượng
• Audit trợ năng, gợi ý màu đạt WCAG, mô phỏng mù màu, thứ tự focus bằng Tab
• Core Web Vitals: LCP, CLS và INP hiện ngay trên trang

Responsive và chụp ảnh
• Xem nhiều kích thước thiết bị cạnh nhau, cuộn đồng bộ
• Chụp màn hình khung nhìn, một phần tử hoặc cả trang

Cho AI agent
• MCP server chạy trên máy (tuỳ chọn) cho phép agent lập trình (Claude Code, Cursor…) kiểm tra và chụp trang bạn đang mở

Ưu tiên bàn phím: phím số 1–0 chuyển công cụ, Ctrl+K tìm mọi lệnh.

Riêng tư: không theo dõi, không tài khoản, không dữ liệu nào rời khỏi trình duyệt.

---

## Ghi chú cho người kiểm duyệt (Notes for certification)

PixelLens has no content scripts in the manifest; it is injected with `scripting.executeScript` only when the user clicks the toolbar button on a tab. To test: open any page, click the PixelLens icon, a dock appears at the bottom; press 1 to inspect, hover elements. The `debugger` permission is used only for full-page screenshots (Capture → Full page) and is detached immediately. The MCP feature is optional and only connects to 127.0.0.1.
