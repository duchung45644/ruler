# Khắc phục sự cố

## Bấm biểu tượng mà không có gì xảy ra

PixelLens không chạy được trên:

- trang của trình duyệt như `edge://` và `chrome://` (cài đặt, trang tab mới, trang tiện ích),
- trang của các tiện ích,
- trang Chrome Web Store và Edge Add-ons.

Tiện ích chạy trên các trang `http`, `https`, `ftp` và `file`. Ở những trang kể trên, biểu tượng và `Alt+Shift+S` đơn giản là không làm gì.

Tab đã bị trình duyệt cho "ngủ" (discarded) cần được tải lại trước.

## Tải lại trang thì PixelLens tắt

Đây là hành vi bình thường: PixelLens được bật theo từng lượt xem trang, nên tải lại hay chuyển trang đều làm nó tắt. Hãy bật lại; các công cụ bạn để bật sẽ hiện lại, và các chỉnh sửa CSS đã lưu được khôi phục.

## Tệp cục bộ (file://)

Muốn dùng PixelLens với tệp trên máy, hãy cho phép trong trình duyệt: mở `edge://extensions` (hoặc `chrome://extensions`), chọn **Details** (Chi tiết) ở PixelLens và bật **Allow access to file URLs** (Cho phép truy cập URL tệp). Chỉnh sửa đã lưu của tệp cục bộ được giữ theo đường dẫn tệp.

## Khung nhúng trên trang (iframe)

Trình kiểm tra và các công cụ khác làm việc trên trang mà bạn bật PixelLens; chúng không đi vào các iframe mà trang đó nhúng. Ngoại lệ là chế độ responsive: các khung xem trước của nó có đầy đủ công cụ.

## Bảng bên thiếu một số style

Stylesheet từ nguồn khác (ví dụ CDN) không đọc được nếu chưa có thêm quyền. Khi đó bảng bên cho biết bao nhiêu stylesheet bị ẩn, hoặc đánh dấu thuộc tính bằng **Bị ghi đè bởi một stylesheet PixelLens không đọc được**. Bấm **Cấp quyền truy cập** và đồng ý ở hộp thoại của trình duyệt để cho phép truy cập mọi trang. Công cụ breakpoint cũng cần quyền này để thấy breakpoint trong các stylesheet đó.

## Khung responsive trống trơn

Website không cho phép hiển thị bên trong khung. Bấm **Cấp quyền truy cập** trong khung và đồng ý; PixelLens sẽ gỡ các header chặn cho các khung xem trước của tab đó. Nếu khung báo **Trang làm điều này bằng một tập lệnh hoặc chính sách trong trang mà không thể loại bỏ**, website đó không xem trước được theo cách này. Xem [Chế độ responsive](responsive.md#trang-chan-ban-xem-truoc).

## Không copy được ảnh chụp

Sao chép ảnh cần trang an toàn (HTTPS). Ở các trang khác, hãy dùng **Lưu**.

## Chụp cả trang chậm hoặc hiện cảnh báo

Cách chụp nhanh không chạy được khi DevTools đang mở ở tab đó. Đóng DevTools rồi chụp lại; nếu không, PixelLens sẽ chuyển sang cuộn và ghép ảnh.

## Bấm phím không có tác dụng

- PixelLens có thể đang tạm dừng: khi đó dock chỉ còn **Tiếp tục** và **Thoát**. Nhấn `H`.
- Phím bị bỏ qua khi con trỏ đang ở trong ô nhập liệu.
- Khi **Sửa văn bản** đang bật, chỉ còn **Trình kiểm tra**, **Bật/Tắt Bảng Bên** và **Thoát** dùng được.
- Phím tắt của trình duyệt (`Alt+Shift+S`, `Alt+Shift+↑`, `Alt+Shift+↓`) có thể trùng với tiện ích khác. Kiểm tra ở `edge://extensions/shortcuts`.

## Công cụ chọn màu không hoạt động

Công cụ này cần EyeDropper API của trình duyệt, có sẵn trong Edge và Chrome bản hiện hành.

## Nút bảng bên bị vô hiệu

Trình duyệt của bạn không hỗ trợ bảng bên (**Bảng bên không được hỗ trợ trên trình duyệt này**).

## Đặt lại

- Chỉnh sửa CSS đã lưu: **Cài đặt** → **Chỉnh sửa đã lưu** → **Xóa**.
- Chỉnh sửa trên trang hiện tại: bảng bên → **Thay đổi** → **Xóa Tất cả Thay đổi**.
- Các khung responsive: **Đặt Lại Khung Nhìn** trên thanh công cụ responsive.
- Hướng dẫn nhanh: **Cài đặt** → **Hướng dẫn nhanh** → **Xem lại**.
- Mọi thứ khác: gỡ rồi cài lại tiện ích sẽ xoá toàn bộ dữ liệu đã lưu của nó.
