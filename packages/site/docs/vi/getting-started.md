# Bắt đầu

PixelLens là bộ công cụ để kiểm tra, đo đạc và chỉnh sửa trang web ngay trên trang. Tiện ích chạy trên Microsoft Edge và các trình duyệt nhân Chromium khác, từ phiên bản 116 trở lên.

## Cài đặt

### Từ Edge Add-ons

PixelLens đang được đưa lên Edge Add-ons. Khi trang tiện ích đã có, mở nó trong Edge và chọn **Get** (Nhận). Trong lúc chờ, bạn có thể cài theo cách dành cho lập trình viên bên dưới.

### Nạp bản giải nén (cho lập trình viên)

Cần Node 22.12 trở lên và pnpm (qua corepack).

```sh
corepack pnpm install
corepack pnpm build
```

Bản build nằm ở `.output/chrome-mv3`. Sau đó:

1. Mở `edge://extensions` (hoặc `chrome://extensions`).
2. Bật **Developer mode** (Chế độ nhà phát triển).
3. Chọn **Load unpacked** (Tải tiện ích đã giải nén) và trỏ tới thư mục `.output/chrome-mv3`.

Bản build có sẵn khoá của Edge Add-ons nên ID tiện ích luôn là `bkgdfebicmlicjnkgbemlidlnpbnaofh`, trùng với bản trên store. ID này cần khi bạn kết nối AI agent (xem [MCP](mcp.md)).

## Bật PixelLens

PixelLens không làm gì trên một tab cho tới khi bạn bật nó ở tab đó. Có ba cách bật hoặc tắt cho tab hiện tại:

- Bấm biểu tượng PixelLens trên thanh công cụ trình duyệt. Biểu tượng có màu khi PixelLens đang bật ở tab đó và xám khi đang tắt.
- Nhấn `Alt+Shift+S`.
- Nhấp chuột phải vào trang và chọn **PixelLens** trong menu ngữ cảnh.

PixelLens tự tắt khi tab tải trang mới (tải lại hoặc chuyển trang). Bật lại để làm tiếp. Những công cụ bạn để bật, như trình kiểm tra, X-Ray, thước, breakpoint và lưới bố cục, sẽ tự bật lại ở lần sau.

PixelLens không chạy được trên trang của trình duyệt (`edge://`, `chrome://`), trang của tiện ích và các cửa hàng tiện ích. Xem [Khắc phục sự cố](troubleshooting.md).

## Thanh công cụ (dock)

Khi PixelLens bật, một thanh công cụ gọi là dock hiện ở giữa cạnh dưới trang. Mọi công cụ đều bắt đầu từ đây. Rê chuột lên một nút để xem tên và phím tắt của nó. Các công cụ ít dùng hơn nằm sau nút **Thêm công cụ** (⋯).

Danh sách đầy đủ các nút và phím có ở trang [Dock và phím tắt](dock-and-shortcuts.md).

## Tạm dừng và thoát

- **Tạm dừng** (trong menu **Thêm công cụ**, phím `H`) ẩn mọi thứ PixelLens vẽ lên trang và trả chuột, bàn phím lại cho trang mà không mất trạng thái đang làm. Khi tạm dừng, dock chỉ còn **Tiếp tục** và **Thoát**. Nhấn `H` hoặc bấm **Tiếp tục** để làm tiếp.
- **Thoát** (nút X ở đầu phải dock, hoặc `Ctrl+Q`) tắt PixelLens trên tab và đóng bảng bên của nó.

## Hướng dẫn nhanh

Lần đầu mở PixelLens, một hướng dẫn ngắn gồm bốn bước sẽ chỉ vào dock: **Thanh công cụ**, **Phím số**, **Thêm công cụ** và **Ctrl+K ở bất cứ đâu**. Bấm **Tiếp** để sang bước sau, **Bỏ qua** để đóng, và **Đã hiểu** ở bước cuối. Muốn xem lại, mở [Cài đặt](settings.md) và chọn **Xem lại** ở dòng **Hướng dẫn nhanh**.

## Mấy việc nên thử đầu tiên

- Nhấn `1` để bật **Trình kiểm tra**, rồi rê chuột trên trang: mỗi phần tử hiện kích thước, khoảng cách và một bảng thông tin nổi. Bấm để chọn phần tử. Xem [Kiểm tra phần tử](inspect.md).
- Nhấn `Space` khi bảng thông tin đang hiện để ghim nó lên trang.
- Nhấn `Ctrl+K` (hoặc `?`) để tìm mọi công cụ theo tên và chạy bằng `Enter`.
- Nhấn `0` để mở bảng bên với đầy đủ chi tiết về phần tử đang chọn và về trang. Xem [Bảng bên](side-panel.md).
- Nhấn `Esc` để bỏ chọn hoặc đóng popover đang mở.
