# Chỉnh sửa

PixelLens cho phép sửa CSS, chữ và cấu trúc HTML của trang ngay trong trình duyệt, rồi sao chép kết quả thành code. Các chỉnh sửa chỉ thay đổi trang trong trình duyệt của bạn, không động tới tệp của website.

Phần chỉnh sửa nằm ở tab **Phần tử** của bảng bên (nhấn `0`) và tác động lên phần tử đang chọn.

## Sửa CSS

Mục **CSS** liệt kê giống DevTools: `element.style` (style nội tuyến) trước, sau đó là các rule khớp theo thứ tự cascade, cuối cùng là rule kế thừa (**Kế thừa từ …**).

- Bấm vào tên thuộc tính hoặc giá trị để sửa. `Enter` ở ô thuộc tính sẽ chuyển sang ô giá trị; `Enter` ở ô giá trị sẽ áp dụng và xuống dòng kế tiếp; `Esc` để rời ô.
- Khi gõ tên thuộc tính sẽ có gợi ý: `↑` `↓` để chọn, `Enter` hoặc `Tab` để nhận.
- Với giá trị là số, `↑` / `↓` tăng giảm 1, giữ `Shift` là 10, giữ `Alt` là 0,1.
- Ô tích ở đầu mỗi dòng (**Bật/tắt thuộc tính này**) tắt dòng đó mà không xoá.
- Bộ chọn của rule sửa được nếu rule cho phép: `Enter` để áp dụng, `Esc` để khôi phục.
- **Lọc** chỉ giữ các rule có bộ chọn hoặc tên thuộc tính khớp.
- **Thêm quy tắc** (nút +) thêm một rule mới cho phần tử đang chọn.
- **.cls** (**Class**) hiện ô sửa class của phần tử, có gợi ý lấy từ các class trên trang.

Các dấu hiệu bên cạnh mỗi dòng:

- Chấm đỏ kèm **Thuộc tính không xác định** hoặc **Giá trị không hợp lệ** khi trình duyệt không chấp nhận.
- Gạch ngang kèm **Bị ghi đè bởi …** khi rule khác thắng.
- Mờ đi kèm **Không được kế thừa bởi phần tử này** với thuộc tính kế thừa nhưng không áp dụng.
- Chấm màu hổ phách kèm **Bị ghi đè bởi một stylesheet PixelLens không đọc được** khi một stylesheet khác nguồn thắng. Dùng **Cấp quyền truy cập** để PixelLens đọc được các stylesheet đó ("Một số kiểu có thể bị thiếu.").

## Ép trạng thái

Các chip **Ép trạng thái** ép một pseudo-class lên phần tử đang chọn: `:hover`, `:focus`, `:focus-visible`, `:focus-within`, `:active`, `:visited`. Chip bị mờ nghĩa là **Không có quy tắc nào dùng trạng thái này cho phần tử**. Bấm lại chip để thôi ép. Trạng thái bị ép sẽ tự bỏ khi bạn bỏ chọn phần tử.

## Sửa chữ

**Sửa văn bản** (nút T trên thanh sửa) biến chữ trên trang thành sửa được: bấm vào đâu đó và gõ. Bấm nút lần nữa để thôi. Trong lúc bật, các nút sửa khác bị vô hiệu, và trên dock chỉ còn dùng được **Trình kiểm tra**, **Bật/Tắt Bảng Bên** và **Thoát**.

## Sửa phần tử

Thanh sửa tác động lên phần tử đang chọn:

| Nút          | Phím                  | Tác dụng                                                          |
| ------------ | --------------------- | ----------------------------------------------------------------- |
| **Sao chép** | `Ctrl+C`              | Sao chép phần tử                                                  |
| **Cut**      | `Ctrl+X`              | Cắt phần tử                                                       |
| **Dán**      | `Ctrl+V`              | Dán phần tử đã sao chép (dùng được khi đã có gì đó được sao chép) |
| **Nhân bản** | `Ctrl+D`              | Nhân bản phần tử                                                  |
| **Xóa**      | `Delete`, `Backspace` | Xóa phần tử                                                       |

Trên macOS dùng `Cmd`. Khi đang bôi đen chữ trên trang, `Ctrl+C` và `Ctrl+X` vẫn giữ chức năng thông thường của trình duyệt.

## Hoàn tác và làm lại

**Hoàn tác** và **Làm lại** trên thanh sửa, hoặc `Ctrl+Z`, `Ctrl+Shift+Z` và `Ctrl+Y` (trên trang hay trong bảng bên đều được), đi qua lịch sử sửa chữ, sửa HTML và sửa class.

Các chỉnh sửa rule CSS và style nội tuyến không nằm trong lịch sử đó. Muốn bỏ, hãy sửa lại giá trị hoặc hoàn nguyên trong danh sách **Thay đổi**.

## Lưu theo từng trang

PixelLens nhớ các chỉnh sửa rule CSS và style nội tuyến cho từng website (theo origin; với tệp cục bộ thì theo đường dẫn tệp) và áp lại vào lần sau bạn bật PixelLens ở đó. Một thông báo như **Đã khôi phục 3 chỉnh sửa đã lưu** sẽ xác nhận việc này. Chỉnh sửa chữ và HTML không được lưu.

Muốn xoá mọi chỉnh sửa đã lưu, mở [Cài đặt](settings.md) và bấm **Xóa** ở dòng **Chỉnh sửa đã lưu**.

## Danh sách thay đổi

Tab **Thay đổi** liệt kê mọi thay đổi trên trang, gom theo phần tử (**1 phần tử**, **3 phần tử**):

- Mỗi nhóm hiện phần tử và số rule đã đổi. Bấm vào phần tử để chọn nó trên trang.
- Mỗi rule đã đổi hiện tệp nguồn và phần so sánh trước/sau. Nút hoàn nguyên trên rule sẽ bỏ thay đổi đó.
- Nút thùng rác trên nhóm bỏ mọi thay đổi trên phần tử đó, sau khi bạn xác nhận.
- Thay đổi HTML cũng được liệt kê trong nhóm. Thay đổi chỉ dính tới khoảng trắng được đánh dấu **Chỉ thay đổi khoảng trắng**.
- **Xóa Tất cả Thay đổi** bỏ mọi thay đổi trên trang, sau khi bạn xác nhận.

Khi chưa có gì, tab hiện **Không tìm thấy thay đổi**.

## Sao chép tất cả

**Sao chép tất cả** sao chép mọi thay đổi thành code, theo định dạng chọn bên cạnh (**Định dạng xuất**):

- **CSS**: các rule đã đổi dưới dạng CSS.
- **Tailwind**: các thay đổi dưới dạng class Tailwind.
- **Prompt cho AI**: một prompt mô tả các thay đổi kèm URL trang, sẵn sàng dán vào trợ lý lập trình AI.
