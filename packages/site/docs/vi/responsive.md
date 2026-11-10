# Chế độ responsive

Chế độ responsive hiện trang hiện tại trong nhiều khung kích thước khác nhau, đặt cạnh nhau, ngay trong cùng một tab. Các công cụ của PixelLens chạy trong mọi khung cùng lúc.

## Bật chế độ

Nhấn `5` hoặc bấm **Chế độ Responsive · B: breakpoint** trên dock. Nhấn lần nữa để thoát. Khi chế độ đang bật, video và âm thanh trên trang được tạm dừng.

Lần đầu bạn có ba khung: Phone (390×844), Tablet (768×1024) và Desktop (1280×800). PixelLens nhớ các khung, mức thu phóng, bố cục và tuỳ chọn đồng bộ cuộn cho lần sau.

Nếu bạn đang có chỉnh sửa style nội tuyến, HTML hoặc class, PixelLens sẽ hỏi trước: **Các thay đổi quy tắc CSS sẽ được giữ lại. Kiểu nội tuyến, chỉnh sửa mã và lớp sẽ bị loại bỏ.** Khi thoát cũng vậy. Lúc thoát, chỉnh sửa rule CSS và URL hiện tại của khung đầu tiên được đưa trở lại trang.

## Thanh công cụ

Thanh công cụ phía trên các khung gồm, từ trái sang phải:

- **Thu nhỏ**, **Thu phóng** (25% đến 200%; mặc định 65%) và **Phóng to**.
- **Tải lại**: tải lại mọi khung.
- URL của trang.
- **Đặt Lại Khung Nhìn**: quay về các khung mặc định, sau khi bạn xác nhận.
- **Đồng Bộ Cuộn**: cuộn một khung thì các khung khác cuộn theo. Nếu trang liên tục cuộn ngược lại, tính năng sẽ tự tắt và báo cho bạn.
- **Bố Cục Khung**: chuyển giữa xếp một hàng và cho các khung xuống nhiều hàng.
- **Breakpoints (B)**: mỗi breakpoint của trang một khung (xem bên dưới).
- **Thêm Khung Nhìn**: thêm khung từ danh sách thiết bị, hoặc **Custom** để tự nhập kích thước.

## Thiết bị và kích thước tuỳ chỉnh

**Thêm Khung Nhìn** liệt kê điện thoại (iPhone, Galaxy, Pixel, Xiaomi / Redmi, OPPO / vivo, các cỡ Android phổ biến), máy tính bảng (iPad, Galaxy Tab) và các cỡ laptop, desktop tới 4K, kèm chiều rộng và chiều cao. **Custom** mở hộp **Khung Nhìn Tùy Chỉnh** để nhập **Chiều rộng** và **Chiều cao** (từ 320 đến 3840 px).

Bạn có thể có tối đa 20 khung.

## Từng khung

Mỗi khung có phần đầu với:

- **Di Chuyển Sang Trái** / **Di Chuyển Sang Phải** để đổi thứ tự.
- Tên và kích thước khung.
- Biểu tượng cảnh báo khi **Nội dung tràn theo chiều ngang**.
- **Xoay**: đổi chỗ chiều rộng và chiều cao.
- **Chế Độ Màu**: lần lượt **Hệ thống**, **Sáng** và **Tối** (giá trị `prefers-color-scheme` mà khung nhận được).
- **Gỡ Bỏ Khung Nhìn**, sau khi bạn xác nhận.
- **Thêm Tác Vụ**: **Tải lại**, **Xoay**, **Chế Độ Màu** và **Gỡ Bỏ Khung Nhìn**.

Kéo cạnh phải, cạnh dưới hoặc góc dưới bên phải của khung để đổi kích thước.

## Công cụ trong các khung

Những công cụ bạn bật từ dock hoặc bằng phím sẽ chạy trong mọi khung: trình kiểm tra, X-Ray, lưới bố cục, thước, đo vùng, đè ảnh thiết kế và chọn màu. Bạn chọn phần tử ở khung nào thì bảng bên theo khung đó. **Tìm Phần tử** tìm trên mọi khung và cộng dồn số kết quả.

**Chụp Màn hình** chụp toàn bộ khung nhìn; chế độ **Phần tử** chụp phần tử đang chọn trong một khung. **Chụp cả trang** không dùng được khi xem responsive.

## Breakpoint

Khi công cụ breakpoint bật (phím `B`, hoặc nút **Breakpoints** trên thanh công cụ), các khung được dựng lại thành mỗi độ rộng breakpoint của trang một khung, có nhãn breakpoint (`≥768px`, `≤767px`). Nút bị vô hiệu nếu trang không khai báo breakpoint nào. Ở chế độ này không dùng được **Thêm Khung Nhìn**.

## Trang chặn bản xem trước

Nhiều website không cho phép hiển thị bên trong khung. Để vẫn tải được, PixelLens cần quyền truy cập mọi trang, và chỉ xin quyền này ở đây. Khung bị chặn sẽ hiện **Trang này chặn việc tải trong bản xem trước. Cấp quyền truy cập để hiển thị.** Bấm **Cấp quyền truy cập** và đồng ý ở hộp thoại của trình duyệt; các khung sẽ tải lại.

Khi có quyền đó, PixelLens gỡ các header chặn khỏi phản hồi, chỉ cho các khung xem trước của tab này và chỉ trong lúc chế độ responsive đang bật.

Một số website chặn bằng script hoặc chính sách trong trang mà không gỡ được. Khi đó khung hiện **Trang này chặn việc tải trong bản xem trước. Trang làm điều này bằng một tập lệnh hoặc chính sách trong trang mà không thể loại bỏ.** Khung không tải xong sẽ hiện **Trang này chưa tải xong.**
