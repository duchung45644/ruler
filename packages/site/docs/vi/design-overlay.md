# Đè ảnh thiết kế

Công cụ này đặt ảnh thiết kế của bạn (mockup, ảnh xuất từ công cụ thiết kế) đè lên trang thật để so từng pixel.

## Mở công cụ

Chọn **Đè ảnh thiết kế** trong menu **Thêm công cụ**, hoặc nhấn `O`.

## Thêm ảnh

Trong bảng điều khiển, ô **Thả, dán (Ctrl+V) hoặc bấm để chọn ảnh thiết kế** nhận ảnh theo ba cách:

- thả tệp ảnh vào ô,
- dán ảnh bằng `Ctrl+V` khi công cụ đang mở,
- hoặc bấm vào ô để chọn tệp.

Bạn giữ được tối đa 5 ảnh. Khi đã có ảnh, nút **+** (**Thêm ảnh khác…**) dùng để thêm tiếp. Ảnh nhỏ ở đầu bảng là danh sách các ảnh; bấm vào một ảnh nhỏ (hoặc vào chính ảnh trên trang) để chọn nó.

Ảnh không được lưu lại: chúng biến mất khi bạn tắt PixelLens.

## Di chuyển và co giãn

- Kéo phần giữa ảnh để di chuyển; kéo một góc để co giãn.
- Phím mũi tên dịch ảnh đang chọn 1px (giữ `Shift`: 10px).
- **Tỉ lệ %** đặt kích thước theo phần trăm so với kích thước gốc của ảnh.
- **Ghim theo màn hình** giữ ảnh đứng yên khi cuộn trang.
- **Đang hiện** / **Đang ẩn** bật hoặc tắt hiển thị ảnh đang chọn.
- **Xoá ảnh** bỏ ảnh đi.

## Chế độ hoà trộn

**Chế độ** quyết định ảnh đang chọn hoà với trang ra sao:

| Chế độ                     | Kết quả                                                                     |
| -------------------------- | --------------------------------------------------------------------------- |
| **Bình thường**            | Ảnh nằm trên trang, với **Độ mờ** bạn đặt.                                  |
| **Difference**             | Pixel giống nhau thành màu đen, nên chỗ lệch hiện rõ. Độ mờ cố định ở 100%. |
| **Onion skin (xuyên lớp)** | Một lớp nhìn xuyên qua, độ mờ tối đa 60%, kèm tông màu tuỳ chọn.            |

Với **Onion skin (xuyên lớp)**, chọn tông màu:

- **Bình thường**: giữ nguyên ảnh.
- **Đảo màu**: màu bị đảo ngược.
- **Hai tông màu**: ảnh thành một tông màu duy nhất, dễ phân biệt với trang.

Ảnh mới thêm sẽ dùng chế độ hoà trộn bạn chọn gần nhất.

## Chia đôi trước/sau

Bật **Chia đôi trước/sau** để hiện ảnh thiết kế ở một bên thanh chia và trang thật ở bên kia. Kéo thanh chia để so sánh. **Ảnh thiết kế bên trái** chọn bên nào hiện ảnh thiết kế.

Chế độ hoà trộn, tông onion skin, tuỳ chọn chia đôi, vị trí thanh chia và bên hiện ảnh đều được ghi nhớ cho lần sau.
