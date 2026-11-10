# Đo đạc

## Thước trang và đường gióng

Nhấn `6` hoặc bấm **Thước Trang** để hiện thước đo pixel dọc cạnh trên và cạnh trái cửa sổ. Trên mỗi thước có một vạch chữ thập chạy theo con trỏ. PixelLens nhớ thước đang bật hay tắt.

Tạo đường gióng:

- Kéo từ thước trên xuống để tạo đường gióng dọc.
- Kéo từ thước trái sang để tạo đường gióng ngang.
- Kéo từ góc giao nhau của hai thước để tạo cả hai cùng lúc.

Trong lúc kéo, đường gióng tự bắt vào các cạnh và tâm của phần tử dưới con trỏ. Mỗi đường gióng hiện vị trí của nó tính theo pixel của trang, và khoảng cách giữa hai đường gióng kề nhau được ghi ở giữa chúng.

Sửa và xoá đường gióng:

- Kéo một đường gióng để di chuyển (con trỏ đổi hình khi bạn đứng trên nó).
- Kéo đường gióng trở lại thước nơi nó được tạo ra để xoá.
- Bấm đúp vào đường gióng để xoá.
- Bấm vào đường gióng để chọn, rồi nhấn `Delete` hoặc `Backspace`. Nhấn `Esc` hoặc bấm chỗ khác để bỏ chọn.

Đường gióng được giữ suốt thời gian PixelLens bật trên tab, nhưng chỉ hiện khi thước đang bật.

## Đo vùng

Nhấn `7` hoặc bấm **Kéo vùng để đo**, rồi kéo chuột trên trang để vẽ khung. Khung hiện kích thước (`W × H`) và vị trí `x` / `y` trên trang.

- Kéo bên trong khung để di chuyển; kéo một góc để đổi kích thước.
- Phím mũi tên dịch khung 1px (`Shift`: 10px), `Ctrl+mũi tên` nới rộng, `Ctrl+Alt+mũi tên` thu hẹp.
- `Esc` xoá khung.

Bảng **Đo vùng** cho phép nhập số chính xác:

- **Trái / Trên**: vị trí khung tính từ cạnh trái và cạnh trên của trang.
- **Cách mép phải / dưới**: khoảng cách từ khung tới cạnh phải và cạnh dưới của trang.
- Trong ô số, `Shift+↑` / `Shift+↓` tăng giảm 10.
- **Màu khung đo** đổi màu khung.
- **Đường gióng** kéo dài các cạnh khung ra toàn trang.
- **Xoá khung** bỏ khung đi.

Màu khung và tuỳ chọn đường gióng được ghi nhớ.

## Lưới bố cục

Nhấn `4` hoặc bấm **Lưới Bố cục** để hiện lưới cột trên trang cùng bảng cài đặt. Nhấn lần nữa (hoặc đóng bảng) để tắt lưới.

| Tuỳ chọn              | Khoảng giá trị                 | Mặc định  |
| --------------------- | ------------------------------ | --------- |
| **Cột**               | 1 đến 24                       | 8         |
| **Chiều rộng Tối đa** | số px, hoặc để trống là `auto` | `auto`    |
| **Khoảng cách**       | 0 đến 100 px                   | 20        |
| **Margin**            | 0 đến 350 px                   | 40        |
| **Màu sắc**           | bảng chọn màu hoặc mã hex      | `#FC48FF` |
| **Độ mờ**             | 5% đến 100%                    | 30%       |

Lưới được canh giữa cửa sổ. Cài đặt được lưu lại, và nếu bạn để lưới bật thì lần sau bật PixelLens lưới sẽ hiện lại.

## Breakpoint

Nhấn `B` để hiện các breakpoint của trang: mỗi độ rộng dùng trong media query `min-width` hoặc `max-width` là một đường dọc, có nhãn `≥768px`, `≤767px`… Đường xanh lá là `min-width`, xanh lơ là `max-width`, màu hổ phách là độ rộng được dùng cho cả hai.

Công cụ quét lại mỗi lần bật và mỗi khi trang tải thêm stylesheet. Stylesheet lấy từ nguồn khác (CDN) chỉ đọc được sau khi bạn cho phép truy cập mọi trang; xem [Quyền riêng tư và quyền truy cập](privacy-permissions.md).

Ngoài chế độ responsive, Breakpoints không có nút riêng trên dock. Trong [chế độ responsive](responsive.md#breakpoint), thanh công cụ có nút **Breakpoints** và phím `B` sẽ dựng mỗi breakpoint một khung.
