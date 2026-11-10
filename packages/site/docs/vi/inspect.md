# Kiểm tra phần tử

## Trình kiểm tra

Nhấn `1` hoặc bấm **Trình kiểm tra** để bật chế độ kiểm tra khi rê chuột. PixelLens nhớ lựa chọn này cho lần bật sau.

Khi trình kiểm tra đang bật:

- Rê chuột lên một phần tử sẽ thấy viền quanh nó, vùng margin (cam) và padding (xanh lá) được tô, chiều rộng và chiều cao, cùng nhãn `tag#id.class` ở bên dưới phần tử.
- Các thao tác bấm, nhấn giữ và menu chuột phải trên trang bị chặn lại, để menu hay liên kết của trang không bị kích hoạt khi bạn đang kiểm tra.
- Bấm vào một phần tử để chọn nó. Bấm lần nữa hoặc nhấn `Esc` để bỏ chọn.
- Phần tử đang chọn có khung viền và các đường gióng kéo dài theo các cạnh của nó ra toàn trang.

Tắt trình kiểm tra thì vùng chọn vẫn được giữ (bảng bên vẫn dùng nó) nhưng không còn được vẽ, và mọi bảng đã ghim sẽ bị gỡ.

## Bảng thông tin nổi

Cạnh phần tử đang rê chuột hoặc đang chọn có một bảng nổi gồm:

- **Box Model**: `width`, `height`, `display`, `gap`, `margin`, `padding`, `box-sizing`.
- **Giao diện**: `border-radius`, `background-color`, `color`, có ô màu minh hoạ.
- **Văn bản**: `font-family` (font thực sự được hiển thị), `font-size`, `font-weight`, `line-height` (tính theo tỉ lệ với cỡ chữ), `letter-spacing`, `text-align`.
- **Trợ năng**: với chữ, hiện tỉ lệ **Tương phản** kèm mẫu `Aa` và mức đạt được (AAA, AA, hoặc AA màu đỏ khi không đạt), cùng các màu chữ **Gợi ý:** cho AA và AAA. Bấm vào gợi ý để sao chép.
- **Hình ảnh**: với ảnh, hiện **Kích thước gốc**, **Dung lượng** và **Định dạng**.

Các giá trị mặc định (margin bằng 0, `letter-spacing` là `normal`…) được ẩn bớt. Màu hiển thị theo định dạng chọn trong [Cài đặt](settings.md).

Nút **Copy CSS** ở trên cùng sao chép CSS của phần tử.

## Ghim bảng thông tin

Nhấn `Space` khi bảng nổi đang hiện để ghim nó. Bảng đã ghim nằm yên ở chỗ đó trên trang và cuộn theo trang, nhờ vậy bạn có thể so sánh nhiều phần tử cùng lúc:

- Kéo phần đầu của bảng đã ghim để di chuyển; kéo góc để đổi kích thước.
- Rê chuột lên bảng đã ghim sẽ tô sáng phần tử tương ứng trên trang.
- Đóng bảng bằng nút đóng của nó.

Cho tới khi bạn ghim bảng đầu tiên, cuối bảng nổi luôn có dòng nhắc **Nhấn Space để ghim**.

## Di chuyển vùng chọn

- Nút **Chọn Phần tử Cha** / **Chọn Phần tử Con** trên dock, hoặc `Alt+Shift+↑` / `Alt+Shift+↓`. Đi xuống sau khi đi lên sẽ quay lại đúng nhánh cũ.
- `Alt+Shift+←` / `Alt+Shift+→` chọn phần tử anh em liền trước và liền sau.
- Phần đầu của bảng bên cũng có hai nút cha và con như vậy.

## Khoảng cách

Khi đã chọn một phần tử và trình kiểm tra đang bật, rê chuột lên phần tử khác: PixelLens vẽ các khoảng cách giữa hai phần tử, kèm số pixel trên từng đường.

## Chế độ X-Ray

Nhấn `3` hoặc bấm **Chế độ X-Ray** để vẽ viền quanh mọi phần tử trên trang, mỗi cấp lồng nhau một màu. Phần tử bị ẩn và các thành phần bên trong SVG được bỏ qua. X-Ray cũng đi vào cả các shadow root mở. PixelLens nhớ X-Ray đang bật hay tắt.

## Tìm Phần tử

Nhấn `2` hoặc bấm **Tìm Phần tử**, rồi gõ một **Bộ chọn CSS** như `.class`, `#id` hay `tag`. Kết quả hiện ngay khi bạn gõ, kể cả bên trong các shadow root mở:

- Các phần tử khớp được tô sáng trên trang và trang tự cuộn tới kết quả hiện tại.
- Tiêu đề cho biết vị trí, ví dụ `2/7`, và số kết quả bị ẩn (ví dụ `3 bị ẩn`).
- **Trước** và **Sau** để đi qua từng kết quả.
- Đóng ô tìm thì các vùng tô sáng biến mất. Nội dung tìm được giữ lại cho lần sau.

Bộ chọn không hợp lệ thì đơn giản là không tìm thấy gì. Trong chế độ responsive, việc tìm chạy trên mọi khung và cộng dồn số kết quả.
