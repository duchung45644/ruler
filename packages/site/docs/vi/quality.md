# Kiểm tra chất lượng

Các công cụ để kiểm tra màu, font, trợ năng và hiệu năng của trang. Phần lớn nằm trong menu **Thêm công cụ**.

## Màu và font của trang

Chọn **Màu & font của trang** trong **Thêm công cụ**, hoặc nhấn `A`. Bảng **Màu & font của trang** quét toàn trang và có ba tab, mỗi tab kèm số lượng:

- **Màu**: mọi màu được dùng.
- **Font chữ**: mọi tổ hợp font được dùng.
- **Khoảng cách**: mọi giá trị khoảng cách được dùng. Giá trị không phải bội số của 4px được tô đỏ, kèm dòng cho biết có bao nhiêu giá trị như vậy.

Trong mỗi tab:

- Bấm một dòng để tô sáng các phần tử dùng giá trị đó (tối đa 400); trang tự cuộn tới phần tử đầu tiên.
- Nút copy trên mỗi dòng sao chép giá trị; **Tất cả** sao chép toàn bộ danh sách của tab.
- **Quét lại** đọc lại trang.

## Chọn màu

Chọn **Chọn Màu** trong **Thêm công cụ**, hoặc nhấn `C`. Giao diện PixelLens ẩn đi và công cụ lấy màu của trình duyệt mở ra: bấm vào bất kỳ đâu trên màn hình để lấy màu, hoặc nhấn `Esc` để huỷ. Màu được sao chép vào clipboard và hiện thoáng qua trên dock.

Màu được ghi theo định dạng chọn trong [Cài đặt](settings.md) (**Định dạng màu**):

| Định dạng | Ví dụ                |
| --------- | -------------------- |
| HEX/HEXA  | `#3B82F6`            |
| RGB/RGBA  | `rgb(59, 130, 246)`  |
| HSL/HSLA  | `hsl(217, 91%, 60%)` |
| HSB/HSBA  | `hsb(217, 76%, 96%)` |

Bảng thông tin của trình kiểm tra và bảng bên cũng dùng định dạng này. Công cụ chọn màu cần trình duyệt hỗ trợ EyeDropper API (Edge và Chrome đều có).

## Tương phản và gợi ý WCAG

Tương phản được kiểm tra ở hai chỗ:

- Bảng thông tin nổi của trình kiểm tra (**Trợ năng**) hiện tỉ lệ **Tương phản** của chữ đang rê chuột hoặc đang chọn và mức đạt được: AAA, AA, hoặc AA màu đỏ khi không đạt.
- Mục **Vấn đề** trong bảng bên liệt kê lỗi tương phản trong phần tử đang chọn và các phần tử con, kèm tỉ lệ đo được và tỉ lệ yêu cầu. Chữ thường cần 4.5:1 để đạt AA và 7:1 để đạt AAA; chữ lớn cần 3:1 và 4.5:1; biểu tượng và phần tử không phải chữ cần 3:1 (WCAG 1.4.11).

Cả hai đều có màu chữ **Gợi ý:** để đạt AA và AAA. Bấm vào một gợi ý để sao chép.

## Mô phỏng thị lực

Chọn **Mô phỏng thị lực** trong **Thêm công cụ** rồi chọn chế độ:

- **Thị lực bình thường**
- **Mù màu đỏ (Protanopia)**
- **Mù màu xanh lá (Deuteranopia)**
- **Mù màu xanh lam (Tritanopia)**
- **Mù màu hoàn toàn (Achromatopsia)**
- **Nhìn mờ**

Bộ lọc áp dụng cho toàn trang. Phím `Y` bật hoặc tắt nhanh **Mù màu xanh lá (Deuteranopia)**.

## Thứ tự focus bằng Tab

Chọn **Thứ tự focus bằng Tab** trong **Thêm công cụ**, hoặc nhấn `T`. Mọi phần tử đi tới được bằng phím `Tab` đều có viền và số thứ tự, nối với nhau bằng một đường nét đứt theo đúng thứ tự. Số tự cập nhật khi trang thay đổi.

## Core Web Vitals

Chọn **Core Web Vitals** trong **Thêm công cụ**, hoặc nhấn `W`. Một nhãn ở góc trên bên trái hiện các chỉ số theo thời gian thực, mỗi chỉ số tô màu theo mức đánh giá (xanh là tốt, cam là cần cải thiện, đỏ là kém):

| Chỉ số                          | Tốt         | Kém          |
| ------------------------------- | ----------- | ------------ |
| LCP (Largest Contentful Paint)  | tới 2500 ms | trên 4000 ms |
| CLS (Cumulative Layout Shift)   | tới 0,1     | trên 0,25    |
| INP (Interaction to Next Paint) | tới 200 ms  | trên 500 ms  |

Trên trang, phần tử LCP có viền nét đứt, và các phần tử bị xê dịch nhiều nhất (tối đa 30) cũng có viền kèm phần CLS của chúng. INP chỉ xuất hiện sau khi bạn thao tác với trang.
