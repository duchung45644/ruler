# Chụp màn hình

Nhấn `8` hoặc bấm **Chụp Màn hình**. Màn hình được "đóng băng", giao diện PixelLens ẩn đi và một thanh chọn chế độ chụp hiện ở cạnh dưới. Nhấn `Esc` bất cứ lúc nào để đóng.

## Các chế độ

| Chế độ            | Chụp gì                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Phần tử**       | Chọn một phần tử bằng trình kiểm tra (bấm vào nó; `Esc` để huỷ). Ảnh được cắt đúng theo phần tử và mở ra với khung đệm sẵn. |
| **Chụp vùng**     | Bật sẵn ngay khi mở: kéo chuột để chọn vùng.                                                                                |
| **Chụp màn hình** | Phần trang đang nhìn thấy.                                                                                                  |
| **Chụp cả trang** | Toàn bộ trang từ trên xuống dưới. Không dùng được khi xem responsive.                                                       |

## Sau khi chọn vùng

Một thanh nhỏ cạnh vùng chọn có:

- **Copy**: sao chép ảnh vào clipboard.
- **Lưu**: tải ảnh về dạng tệp PNG.
- **Vẽ chú thích**: mở ảnh trong trình chỉnh sửa để ghi chú.

## Trình chỉnh sửa

Ảnh chụp màn hình, chụp cả trang và chụp phần tử mở thẳng trong trình chỉnh sửa. Thanh công cụ của nó có:

- **Copy** và **Lưu**.
- **Vẽ chú thích**: bật hoặc tắt các công cụ vẽ.
- **Khoảng đệm**: khung `0`, `16`, `32` hoặc `64` pixel quanh ảnh. Khi có khoảng đệm, chọn nền: hai kiểu chuyển màu, sáng hoặc tối.

Công cụ vẽ và phím tắt:

| Công cụ     | Phím |
| ----------- | ---- |
| **Bút**     | `P`  |
| **Mũi tên** | `A`  |
| **Khung**   | `R`  |
| **Tô sáng** | `H`  |
| **Chữ**     | `T`  |

Chọn một trong sáu màu và một trong ba độ dày nét. Với **Chữ**, bấm để đặt chữ, gõ, rồi nhấn `Enter`. **Hoàn tác (Ctrl+Z)** bỏ nét vẽ gần nhất.

Nút copy và lưu sẽ hiện **Đã copy**, **Đã lưu** hoặc **Lỗi** trong giây lát.

## Chụp cả trang

Trước tiên PixelLens thử cách chụp nhanh: dựng toàn bộ trang một lần qua giao diện gỡ lỗi của trình duyệt (quyền `debugger`). Tiện ích chỉ gắn vào trong lúc chụp và tháo ra ngay sau đó; trong lúc đó trình duyệt có thể hiện một thanh thông báo.

Nếu cách nhanh thất bại (thường là do DevTools đang mở ở tab đó), PixelLens chuyển sang cuộn trang và ghép từng phần, đồng thời cho biết lý do: **Không chụp nhanh được (…), đã chuyển sang cuộn để chụp. Nếu đang mở DevTools ở tab này thì đóng lại rồi thử lại.**

## Copy và lưu

- **Copy** cần trang an toàn (HTTPS). Ở các trang khác, nút sẽ ghi **Copy cần HTTPS — hãy dùng Lưu**. Nếu trình duyệt từ chối quyền clipboard, PixelLens sẽ xin quyền clipboard tuỳ chọn một lần.
- **Lưu** tải ảnh PNG về bằng cơ chế tải xuống thông thường của trình duyệt.
