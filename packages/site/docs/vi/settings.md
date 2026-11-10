# Cài đặt

## Mở trang Cài đặt

- Nhấp chuột phải vào biểu tượng PixelLens trên thanh công cụ trình duyệt và chọn **Cài đặt**.
- Hoặc bấm nút bánh răng ở đầu bảng bên.

## Giao diện

**Chủ đề** quyết định màu của dock, các bảng và popover của PixelLens:

- **Hệ thống**: chọn tông ngược với trang để giao diện nổi bật (giao diện sáng trên trang tối, giao diện tối trên trang sáng). Khi không đọc được màu của trang, nó theo cài đặt của hệ điều hành.
- **Sáng** hoặc **Tối**: luôn dùng chủ đề đó.

## Tiện ích

- **Định dạng màu** (Được dùng bởi trình kiểm tra và bộ chọn màu): **HEX/HEXA**, **RGB/RGBA**, **HSL/HSLA** hoặc **HSB/HSBA**. Lựa chọn này cũng áp dụng cho các giá trị màu trong bảng bên; đổi định dạng ở mục **Màu sắc** của bảng bên cũng đổi luôn ở đây.
- **Hướng dẫn nhanh** (Phần giới thiệu thanh công cụ hiện ra ở lần đầu bạn mở PixelLens): **Xem lại** cho nó hiện lại; nút sẽ đổi thành **Sẽ hiện lần tới**.
- **Chỉnh sửa đã lưu** (PixelLens nhớ các sửa CSS theo từng trang và áp lại vào lần sau): **Xóa** bỏ các chỉnh sửa đã ghi nhớ của mọi trang, sau khi bạn xác nhận.

## AI Terminal

**Máy chủ MCP** (Cho phép AI agent xem và sửa trang qua PixelLens): **Kết nối** hoặc **Ngắt kết nối**. Trong lúc đang kết nối, prompt để dán vào agent cũng hiện ở đây. Máy chủ đã cũ được đánh dấu bằng biểu tượng cảnh báo (**Máy chủ MCP đã lỗi thời. Cập nhật qua ứng dụng AI của bạn.**). Xem [MCP](mcp.md).

## Dữ liệu được lưu ở đâu

PixelLens lưu mọi thứ trong bộ nhớ dành cho tiện ích của trình duyệt. Không có gì được gửi cho nhà phát triển.

Được đồng bộ theo tài khoản trình duyệt (khi bạn bật đồng bộ):

- chủ đề và định dạng màu,
- trạng thái các công cụ được bật lại ở lần sau: trình kiểm tra, X-Ray, thước, breakpoint, lưới bố cục và cài đặt của lưới,
- các khung, mức thu phóng, bố cục khung và đồng bộ cuộn của chế độ responsive,
- màu khung đo và tuỳ chọn đường gióng,
- tuỳ chọn đè ảnh thiết kế (chế độ hoà trộn, tông onion skin, chia đôi),
- tuỳ chọn bảng bên (mục nào đang mở, kiểu xem mã, mạng xã hội xem trước),
- việc bạn đã xem xong hướng dẫn nhanh và dòng nhắc ghim.

Tuỳ chọn nào quá lớn để đồng bộ, hoặc bị trình duyệt từ chối đồng bộ, sẽ được giữ trên máy này.

Chỉ trên máy này:

- các chỉnh sửa CSS đã lưu theo từng website,
- mã MCP và trạng thái bật/tắt MCP,
- kích thước và vị trí cửa sổ bảng bên khi bạn mở nó trong cửa sổ riêng.

Không bao giờ lưu: ảnh thiết kế đè lên trang (mất đi khi bạn tắt PixelLens) và ảnh chụp màn hình (trừ khi bạn tự lưu).
