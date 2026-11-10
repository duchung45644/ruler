# Bảng bên

Bảng bên hiện đầy đủ chi tiết của phần tử đang chọn và của trang, đồng thời chứa các công cụ chỉnh sửa.

## Mở bảng bên

Nhấn `0` hoặc bấm **Bật/Tắt Bảng Bên** trên dock. Nếu trình duyệt không hỗ trợ bảng bên, nút sẽ ghi **Bảng bên không được hỗ trợ trên trình duyệt này** và bị vô hiệu.

## Thanh trên cùng

- Ba tab: **Phần tử**, **Trang** và **Thay đổi**. Tab **Thay đổi** hiện số lượng khi bạn có chỉnh sửa.
- Nút bánh răng mở **Cài đặt**.
- **Mở trong cửa sổ** chuyển bảng ra một cửa sổ riêng; **Chuyển về bảng bên** đưa nó trở lại.

Mỗi mục đều thu gọn được bằng cách bấm vào tiêu đề. Ban đầu các mục đều đóng, và PixelLens nhớ những mục bạn đã mở.

## Tab Phần tử

Khi chưa chọn gì, tab hiện dòng **Chọn một phần tử trên trang để xem chi tiết** cùng các phím tắt **Bật/tắt tiện ích**, **Chọn phần tử cha**, **Chọn phần tử con**, **Bật/tắt bảng điều khiển** và **Bỏ chọn**.

Khi đã chọn một phần tử, từ trên xuống dưới có:

- **Thanh sửa**: **Sửa văn bản**, **Sao chép**, **Cut**, **Dán**, **Nhân bản**, **Xóa**, **Hoàn tác**, **Làm lại**. Xem [Chỉnh sửa](editing.md).
- Các chip **Ép trạng thái** (`:hover`, `:focus`, `:focus-visible`, `:focus-within`, `:active`, `:visited`). Xem [Chỉnh sửa](editing.md#ep-trang-thai).
- **Phần đầu**: tên phần tử, kèm nút **Chọn phần tử cha** và **Chọn phần tử con**. Bấm vào tên để cuộn trang tới phần tử.
- **Box Model**: kích thước margin, viền, padding và nội dung. Rê chuột lên từng phần sẽ tô sáng phần đó trên trang. Với `<canvas>`, mục **Canvas** cho biết **Kiểu Ngữ cảnh**, **Kích thước Canvas** và **Tỷ lệ Pixel**.
- **Vấn đề**: lỗi tương phản trong phần tử và các phần tử con, được gom nhóm, kèm tỉ lệ đo được, tỉ lệ yêu cầu và mức WCAG. **Trước** / **Sau** đi qua từng **Thể hiện** của một vấn đề và tô sáng nó trên trang. Biểu tượng được kiểm tra theo ngưỡng 3:1 cho phần tử không phải chữ (WCAG 1.4.11).
- **CSS**: các rule khớp với phần tử, sửa được. Xem [Chỉnh sửa](editing.md#sua-css).
- **Bố cục**: với container flex và grid, hiện giá trị `display`, kích thước lưới (cột × hàng) và các thuộc tính flex hoặc grid đang dùng.
- **Kiểu Chữ**: các kiểu chữ dùng trong phần tử, kèm thuộc tính font của từng kiểu.
- **Màu sắc**: màu chữ, màu **Nền** và màu **Viền**. Các nút **HEX** / **RGB** / **HSL** / **HSB** đổi định dạng; bấm vào một giá trị để sao chép.
- **Gradient** và **Box Shadow**, nếu phần tử có.
- **Hoạt ảnh** và **Hiệu ứng chuyển**: animation và transition của phần tử, kèm hình minh hoạ đường cong easing.
- **Nội dung Văn bản**: chữ bên trong phần tử.
- **Tài nguyên**: ảnh, ảnh nền và SVG nội tuyến trong phần tử, có ảnh xem trước, nút **Tải về** cho từng cái và **Tải Tất cả**.
- **Mã**: CSS của phần tử theo ba kiểu xem: **Đã tính** (computed), **Nguồn** (các rule khớp đúng như được viết) và **Tailwind** (class Tailwind chuyển từ CSS đã tính).

Khi một số stylesheet đến từ nguồn khác, bảng sẽ cho biết bao nhiêu stylesheet bị ẩn và có nút **Cấp quyền truy cập** để PixelLens đọc được chúng. Xem [Quyền riêng tư và quyền truy cập](privacy-permissions.md).

## Tab Trang

- **Phần đầu**: tiêu đề và URL của trang, nút **Tải lại** để đọc lại trang.
- **Xem trước Mạng Xã hội**: liên kết trông thế nào khi chia sẻ lên **Facebook**, **X** và **LinkedIn**, có nút tải ảnh về. Chỉ hiện khi trang có `og:image`.
- **Meta Tags**: chia nhóm **SEO**, **Open Graph** và **Twitter Card**.
- **Công nghệ**: framework và thư viện nhận diện được trên trang.
- **Biến CSS**: các custom property khai báo trên `:root`, gom theo tiền tố, có ô **Lọc biến**. Bạn sửa được giá trị: nhấn `Enter` để áp dụng, `Esc` để huỷ; xoá trống giá trị thì quay về giá trị trong stylesheet. Biến màu có ô màu minh hoạ. Danh sách dài sẽ bị giới hạn; hãy lọc để thu hẹp.
- **Vấn đề SEO**: thiếu hoặc chưa tốt ở title, description, H1, link canonical, thẻ viewport, thuộc tính `lang`, `noindex`, văn bản `alt` của ảnh và các thẻ Open Graph, mỗi mục kèm khuyến nghị. Bấm vào một mục để tô sáng phần tử trên trang.
- **Dung lượng Trang**: dung lượng tải về theo loại: **Tài liệu**, **Scripts**, **Stylesheets**, **Hình ảnh**, **Font**, **Phương tiện**, **Fetch/XHR**, **Khác**. Tài nguyên cross-origin mà trình duyệt giấu dung lượng được đếm riêng.

## Tab Thay đổi

Danh sách mọi chỉnh sửa trên trang, có xuất và hoàn nguyên. Xem [Chỉnh sửa](editing.md#danh-sach-thay-doi).

## Trong chế độ responsive

Bảng bên theo khung đang chứa phần tử được chọn. Xem [Chế độ responsive](responsive.md).
