# Dock và phím tắt

## Các nút trên dock

Các nút được xếp theo nhóm công dụng, từ trái sang phải:

| Nút                                   | Phím          | Chức năng                                                                                                    |
| ------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| **Chọn Phần tử Cha**                  | `Alt+Shift+↑` | Chuyển vùng chọn lên phần tử cha. Chỉ hiện khi đang chọn một phần tử.                                        |
| **Chọn Phần tử Con**                  | `Alt+Shift+↓` | Chuyển vùng chọn xuống phần tử con. Chỉ hiện khi đang chọn một phần tử.                                      |
| **Trình kiểm tra**                    | `1`           | Bật/tắt kiểm tra khi rê chuột. Xem [Kiểm tra phần tử](inspect.md).                                           |
| **Tìm Phần tử**                       | `2`           | Mở ô tìm phần tử theo bộ chọn CSS.                                                                           |
| **Chế độ X-Ray**                      | `3`           | Vẽ viền quanh mọi phần tử trên trang.                                                                        |
| **Lưới Bố cục**                       | `4`           | Hiện lưới cột trên trang kèm bảng cài đặt. Xem [Đo đạc](measure.md#luoi-bo-cuc).                             |
| **Chế độ Responsive · B: breakpoint** | `5`           | Hiện trang trong nhiều khung thiết bị cạnh nhau. Xem [Chế độ responsive](responsive.md).                     |
| **Thước Trang**                       | `6`           | Hiện thước ở cạnh trên và cạnh trái để kéo đường gióng. Xem [Đo đạc](measure.md#thuoc-trang-va-duong-giong). |
| **Kéo vùng để đo**                    | `7`           | Vẽ khung đo. Xem [Đo đạc](measure.md#do-vung).                                                               |
| **Chụp Màn hình**                     | `8`           | Chụp ảnh màn hình. Xem [Chụp màn hình](capture.md).                                                          |
| **Thêm công cụ** (⋯)                  | `9`           | Mở menu các công cụ ít dùng.                                                                                 |
| **Bật/Tắt Bảng Bên**                  | `0`           | Mở hoặc đóng bảng bên. Xem [Bảng bên](side-panel.md).                                                        |
| **Tiếp tục**                          | `H`           | Chỉ hiện khi đang tạm dừng.                                                                                  |
| **Thoát**                             | `Ctrl+Q`      | Tắt PixelLens trên tab này.                                                                                  |

Nút **Thêm công cụ** sáng lên khi một công cụ trong menu đang bật, và có chấm báo khi AI agent đang kết nối.

## Menu Thêm công cụ

| Mục                       | Phím              | Chức năng                                                                                                                                          |
| ------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Đè ảnh thiết kế**       | `O`               | Đặt ảnh thiết kế đè lên trang. Xem [Đè ảnh thiết kế](design-overlay.md).                                                                           |
| **Màu & font của trang**  | `A`               | Liệt kê mọi màu, font và giá trị khoảng cách trên trang. Xem [Kiểm tra chất lượng](quality.md#mau-va-font-cua-trang).                              |
| **Chọn Màu**              | `C`               | Lấy màu ở bất kỳ đâu trên màn hình và copy lại.                                                                                                    |
| **Mô phỏng thị lực**      | `Y`               | Xem trang như người bị mù màu hoặc nhìn mờ.                                                                                                        |
| **Thứ tự focus bằng Tab** | `T`               | Đánh số các phần tử theo thứ tự phím Tab.                                                                                                          |
| **Core Web Vitals**       | `W`               | Hiện LCP, CLS và INP theo thời gian thực.                                                                                                          |
| **MCP**                   | —                 | Kết nối AI agent. Nhãn cho biết trạng thái: **Kết nối agent**, **Đang chờ agent**, **Đã kết nối MCP** hoặc **MCP đã lỗi thời**. Xem [MCP](mcp.md). |
| **Tạm dừng**              | `H`               | Tạm dừng PixelLens.                                                                                                                                |
| **Lệnh & phím tắt**       | `Ctrl+K` hoặc `?` | Mở bảng lệnh.                                                                                                                                      |

## Bảng lệnh

Nhấn `Ctrl+K` (`Cmd+K` trên macOS) hoặc `?` để mở bảng **Lệnh**. Bảng liệt kê mọi công cụ kèm phím tắt. Gõ để lọc (**Tìm công cụ…**); việc tìm không phân biệt dấu, nên gõ "mau" vẫn ra "Màu", và cũng khớp các chữ cái theo đúng thứ tự. Dùng `↑` `↓` để chọn, `Enter` để chạy, `Esc` để đóng.

## Tất cả phím

### Công cụ

| Phím           | Tác dụng                                                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `1` … `9`, `0` | Các nút trên dock, như bảng ở trên                                                                                                       |
| `B`            | **Breakpoints**: kẻ đường ở các độ rộng dùng trong media query của trang. Trong chế độ responsive, chuyển sang mỗi breakpoint một khung. |
| `O`            | **Đè ảnh thiết kế**                                                                                                                      |
| `A`            | **Màu & font của trang**                                                                                                                 |
| `C`            | **Chọn Màu**                                                                                                                             |
| `Y`            | Bật (Deuteranopia) hoặc tắt mô phỏng thị lực. Bấm mục trong menu để chọn chế độ khác.                                                    |
| `T`            | **Thứ tự focus bằng Tab**                                                                                                                |
| `W`            | **Core Web Vitals**                                                                                                                      |
| `H`            | **Tạm dừng** / **Tiếp tục**                                                                                                              |
| `Ctrl+K`, `?`  | Bảng lệnh                                                                                                                                |
| `Ctrl+Q`       | **Thoát**                                                                                                                                |
| `Esc`          | Bỏ chọn; nếu không có gì đang chọn thì đóng popover đang mở                                                                              |

### Vùng chọn

| Phím                          | Tác dụng                                              |
| ----------------------------- | ----------------------------------------------------- |
| `Alt+Shift+↑`                 | Chọn phần tử cha                                      |
| `Alt+Shift+↓`                 | Chọn phần tử con (đi xuống lại đúng nhánh vừa đi lên) |
| `Alt+Shift+←` / `Alt+Shift+→` | Chọn phần tử anh em liền trước / liền sau             |
| `Space`                       | Ghim bảng thông tin nổi của trình kiểm tra            |

`Ctrl+Shift+F`, `Alt+Shift+↑` và `Alt+Shift+↓` là phím tắt của trình duyệt. Bạn đổi được chúng ở `edge://extensions/shortcuts` (`chrome://extensions/shortcuts` trên Chrome).

### Sửa trang

Các phím này tác động lên phần tử đang chọn khi PixelLens bật. Trên macOS dùng `Cmd` thay cho `Ctrl`.

| Phím                           | Tác dụng                                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Sao chép, cắt, dán phần tử đang chọn (khi đang bôi đen chữ trên trang, copy và cắt vẫn là của trình duyệt) |
| `Ctrl+D`                       | Nhân bản phần tử đang chọn                                                                                 |
| `Delete` / `Backspace`         | Xóa phần tử đang chọn                                                                                      |
| `Ctrl+Z`                       | Hoàn tác                                                                                                   |
| `Ctrl+Shift+Z`, `Ctrl+Y`       | Làm lại                                                                                                    |

Xem [Chỉnh sửa](editing.md) để biết hoàn tác áp dụng cho những gì.

### Trong từng công cụ

- Khung đo: phím mũi tên dịch 1px (`Shift`: 10px), `Ctrl+mũi tên` nới rộng, `Ctrl+Alt+mũi tên` thu hẹp, `Esc` xoá khung.
- Đè ảnh thiết kế: phím mũi tên dịch ảnh đang chọn 1px (`Shift`: 10px).
- Thước trang: `Delete` hoặc `Backspace` xoá đường gióng vừa bấm chọn.
- Chụp màn hình: `Esc` để đóng; khi vẽ chú thích, `P` `A` `R` `H` `T` chọn công cụ và `Ctrl+Z` để hoàn tác.

## Khi nào phím bị bỏ qua

- Khi bạn đang gõ trong ô nhập, ô chọn hay vùng soạn thảo, PixelLens không bắt phím.
- Khi tạm dừng, mọi phím đều chuyển cho trang, trừ `H` (tiếp tục) và `Ctrl+Q` (thoát). Trang giữ nguyên `Ctrl+K` và `?` của riêng nó.
- Khi **Sửa văn bản** đang bật, trên dock chỉ còn dùng được **Trình kiểm tra**, **Bật/Tắt Bảng Bên** và **Thoát**.
- Trong lúc chụp màn hình, phím chuyển cho công cụ chụp, trừ `Ctrl+Q`.
