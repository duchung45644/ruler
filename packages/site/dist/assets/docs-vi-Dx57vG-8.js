var e = Object.fromEntries(
  Object.entries(
    Object.assign({
      '../docs/vi/capture.md': `# Chụp màn hình

Nhấn \`8\` hoặc bấm **Chụp Màn hình**. Màn hình được "đóng băng", giao diện PixelLens ẩn đi và một thanh chọn chế độ chụp hiện ở cạnh dưới. Nhấn \`Esc\` bất cứ lúc nào để đóng.

## Các chế độ

| Chế độ            | Chụp gì                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Phần tử**       | Chọn một phần tử bằng trình kiểm tra (bấm vào nó; \`Esc\` để huỷ). Ảnh được cắt đúng theo phần tử và mở ra với khung đệm sẵn. |
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
- **Khoảng đệm**: khung \`0\`, \`16\`, \`32\` hoặc \`64\` pixel quanh ảnh. Khi có khoảng đệm, chọn nền: hai kiểu chuyển màu, sáng hoặc tối.

Công cụ vẽ và phím tắt:

| Công cụ     | Phím |
| ----------- | ---- |
| **Bút**     | \`P\`  |
| **Mũi tên** | \`A\`  |
| **Khung**   | \`R\`  |
| **Tô sáng** | \`H\`  |
| **Chữ**     | \`T\`  |

Chọn một trong sáu màu và một trong ba độ dày nét. Với **Chữ**, bấm để đặt chữ, gõ, rồi nhấn \`Enter\`. **Hoàn tác (Ctrl+Z)** bỏ nét vẽ gần nhất.

Nút copy và lưu sẽ hiện **Đã copy**, **Đã lưu** hoặc **Lỗi** trong giây lát.

## Chụp cả trang

Trước tiên PixelLens thử cách chụp nhanh: dựng toàn bộ trang một lần qua giao diện gỡ lỗi của trình duyệt (quyền \`debugger\`). Tiện ích chỉ gắn vào trong lúc chụp và tháo ra ngay sau đó; trong lúc đó trình duyệt có thể hiện một thanh thông báo.

Nếu cách nhanh thất bại (thường là do DevTools đang mở ở tab đó), PixelLens chuyển sang cuộn trang và ghép từng phần, đồng thời cho biết lý do: **Không chụp nhanh được (…), đã chuyển sang cuộn để chụp. Nếu đang mở DevTools ở tab này thì đóng lại rồi thử lại.**

## Copy và lưu

- **Copy** cần trang an toàn (HTTPS). Ở các trang khác, nút sẽ ghi **Copy cần HTTPS — hãy dùng Lưu**. Nếu trình duyệt từ chối quyền clipboard, PixelLens sẽ xin quyền clipboard tuỳ chọn một lần.
- **Lưu** tải ảnh PNG về bằng cơ chế tải xuống thông thường của trình duyệt.
`,
      '../docs/vi/design-overlay.md': `# Đè ảnh thiết kế

Công cụ này đặt ảnh thiết kế của bạn (mockup, ảnh xuất từ công cụ thiết kế) đè lên trang thật để so từng pixel.

## Mở công cụ

Chọn **Đè ảnh thiết kế** trong menu **Thêm công cụ**, hoặc nhấn \`O\`.

## Thêm ảnh

Trong bảng điều khiển, ô **Thả, dán (Ctrl+V) hoặc bấm để chọn ảnh thiết kế** nhận ảnh theo ba cách:

- thả tệp ảnh vào ô,
- dán ảnh bằng \`Ctrl+V\` khi công cụ đang mở,
- hoặc bấm vào ô để chọn tệp.

Bạn giữ được tối đa 5 ảnh. Khi đã có ảnh, nút **+** (**Thêm ảnh khác…**) dùng để thêm tiếp. Ảnh nhỏ ở đầu bảng là danh sách các ảnh; bấm vào một ảnh nhỏ (hoặc vào chính ảnh trên trang) để chọn nó.

Ảnh không được lưu lại: chúng biến mất khi bạn tắt PixelLens.

## Di chuyển và co giãn

- Kéo phần giữa ảnh để di chuyển; kéo một góc để co giãn.
- Phím mũi tên dịch ảnh đang chọn 1px (giữ \`Shift\`: 10px).
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
`,
      '../docs/vi/dock-and-shortcuts.md':
        '# Dock và phím tắt\n\n## Các nút trên dock\n\nCác nút được xếp theo nhóm công dụng, từ trái sang phải:\n\n| Nút                                   | Phím          | Chức năng                                                                                                    |\n| ------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |\n| **Chọn Phần tử Cha**                  | `Alt+Shift+↑` | Chuyển vùng chọn lên phần tử cha. Chỉ hiện khi đang chọn một phần tử.                                        |\n| **Chọn Phần tử Con**                  | `Alt+Shift+↓` | Chuyển vùng chọn xuống phần tử con. Chỉ hiện khi đang chọn một phần tử.                                      |\n| **Trình kiểm tra**                    | `1`           | Bật/tắt kiểm tra khi rê chuột. Xem [Kiểm tra phần tử](inspect.md).                                           |\n| **Tìm Phần tử**                       | `2`           | Mở ô tìm phần tử theo bộ chọn CSS.                                                                           |\n| **Chế độ X-Ray**                      | `3`           | Vẽ viền quanh mọi phần tử trên trang.                                                                        |\n| **Lưới Bố cục**                       | `4`           | Hiện lưới cột trên trang kèm bảng cài đặt. Xem [Đo đạc](measure.md#luoi-bo-cuc).                             |\n| **Chế độ Responsive · B: breakpoint** | `5`           | Hiện trang trong nhiều khung thiết bị cạnh nhau. Xem [Chế độ responsive](responsive.md).                     |\n| **Thước Trang**                       | `6`           | Hiện thước ở cạnh trên và cạnh trái để kéo đường gióng. Xem [Đo đạc](measure.md#thuoc-trang-va-duong-giong). |\n| **Kéo vùng để đo**                    | `7`           | Vẽ khung đo. Xem [Đo đạc](measure.md#do-vung).                                                               |\n| **Chụp Màn hình**                     | `8`           | Chụp ảnh màn hình. Xem [Chụp màn hình](capture.md).                                                          |\n| **Thêm công cụ** (⋯)                  | `9`           | Mở menu các công cụ ít dùng.                                                                                 |\n| **Bật/Tắt Bảng Bên**                  | `0`           | Mở hoặc đóng bảng bên. Xem [Bảng bên](side-panel.md).                                                        |\n| **Tiếp tục**                          | `H`           | Chỉ hiện khi đang tạm dừng.                                                                                  |\n| **Thoát**                             | `Ctrl+Q`      | Tắt PixelLens trên tab này.                                                                                  |\n\nNút **Thêm công cụ** sáng lên khi một công cụ trong menu đang bật, và có chấm báo khi AI agent đang kết nối.\n\n## Menu Thêm công cụ\n\n| Mục                       | Phím              | Chức năng                                                                                                                                          |\n| ------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |\n| **Đè ảnh thiết kế**       | `O`               | Đặt ảnh thiết kế đè lên trang. Xem [Đè ảnh thiết kế](design-overlay.md).                                                                           |\n| **Màu & font của trang**  | `A`               | Liệt kê mọi màu, font và giá trị khoảng cách trên trang. Xem [Kiểm tra chất lượng](quality.md#mau-va-font-cua-trang).                              |\n| **Chọn Màu**              | `C`               | Lấy màu ở bất kỳ đâu trên màn hình và copy lại.                                                                                                    |\n| **Mô phỏng thị lực**      | `Y`               | Xem trang như người bị mù màu hoặc nhìn mờ.                                                                                                        |\n| **Thứ tự focus bằng Tab** | `T`               | Đánh số các phần tử theo thứ tự phím Tab.                                                                                                          |\n| **Core Web Vitals**       | `W`               | Hiện LCP, CLS và INP theo thời gian thực.                                                                                                          |\n| **MCP**                   | —                 | Kết nối AI agent. Nhãn cho biết trạng thái: **Kết nối agent**, **Đang chờ agent**, **Đã kết nối MCP** hoặc **MCP đã lỗi thời**. Xem [MCP](mcp.md). |\n| **Tạm dừng**              | `H`               | Tạm dừng PixelLens.                                                                                                                                |\n| **Lệnh & phím tắt**       | `Ctrl+K` hoặc `?` | Mở bảng lệnh.                                                                                                                                      |\n\n## Bảng lệnh\n\nNhấn `Ctrl+K` (`Cmd+K` trên macOS) hoặc `?` để mở bảng **Lệnh**. Bảng liệt kê mọi công cụ kèm phím tắt. Gõ để lọc (**Tìm công cụ…**); việc tìm không phân biệt dấu, nên gõ "mau" vẫn ra "Màu", và cũng khớp các chữ cái theo đúng thứ tự. Dùng `↑` `↓` để chọn, `Enter` để chạy, `Esc` để đóng.\n\n## Tất cả phím\n\n### Công cụ\n\n| Phím           | Tác dụng                                                                                                                                 |\n| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |\n| `1` … `9`, `0` | Các nút trên dock, như bảng ở trên                                                                                                       |\n| `B`            | **Breakpoints**: kẻ đường ở các độ rộng dùng trong media query của trang. Trong chế độ responsive, chuyển sang mỗi breakpoint một khung. |\n| `O`            | **Đè ảnh thiết kế**                                                                                                                      |\n| `A`            | **Màu & font của trang**                                                                                                                 |\n| `C`            | **Chọn Màu**                                                                                                                             |\n| `Y`            | Bật (Deuteranopia) hoặc tắt mô phỏng thị lực. Bấm mục trong menu để chọn chế độ khác.                                                    |\n| `T`            | **Thứ tự focus bằng Tab**                                                                                                                |\n| `W`            | **Core Web Vitals**                                                                                                                      |\n| `H`            | **Tạm dừng** / **Tiếp tục**                                                                                                              |\n| `Ctrl+K`, `?`  | Bảng lệnh                                                                                                                                |\n| `Ctrl+Q`       | **Thoát**                                                                                                                                |\n| `Esc`          | Bỏ chọn; nếu không có gì đang chọn thì đóng popover đang mở                                                                              |\n\n### Vùng chọn\n\n| Phím                          | Tác dụng                                              |\n| ----------------------------- | ----------------------------------------------------- |\n| `Alt+Shift+↑`                 | Chọn phần tử cha                                      |\n| `Alt+Shift+↓`                 | Chọn phần tử con (đi xuống lại đúng nhánh vừa đi lên) |\n| `Alt+Shift+←` / `Alt+Shift+→` | Chọn phần tử anh em liền trước / liền sau             |\n| `Space`                       | Ghim bảng thông tin nổi của trình kiểm tra            |\n\n`Alt+Shift+S`, `Alt+Shift+↑` và `Alt+Shift+↓` là phím tắt của trình duyệt. Bạn đổi được chúng ở `edge://extensions/shortcuts` (`chrome://extensions/shortcuts` trên Chrome).\n\n### Sửa trang\n\nCác phím này tác động lên phần tử đang chọn khi PixelLens bật. Trên macOS dùng `Cmd` thay cho `Ctrl`.\n\n| Phím                           | Tác dụng                                                                                                   |\n| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |\n| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Sao chép, cắt, dán phần tử đang chọn (khi đang bôi đen chữ trên trang, copy và cắt vẫn là của trình duyệt) |\n| `Ctrl+D`                       | Nhân bản phần tử đang chọn                                                                                 |\n| `Delete` / `Backspace`         | Xóa phần tử đang chọn                                                                                      |\n| `Ctrl+Z`                       | Hoàn tác                                                                                                   |\n| `Ctrl+Shift+Z`, `Ctrl+Y`       | Làm lại                                                                                                    |\n\nXem [Chỉnh sửa](editing.md) để biết hoàn tác áp dụng cho những gì.\n\n### Trong từng công cụ\n\n- Khung đo: phím mũi tên dịch 1px (`Shift`: 10px), `Ctrl+mũi tên` nới rộng, `Ctrl+Alt+mũi tên` thu hẹp, `Esc` xoá khung.\n- Đè ảnh thiết kế: phím mũi tên dịch ảnh đang chọn 1px (`Shift`: 10px).\n- Thước trang: `Delete` hoặc `Backspace` xoá đường gióng vừa bấm chọn.\n- Chụp màn hình: `Esc` để đóng; khi vẽ chú thích, `P` `A` `R` `H` `T` chọn công cụ và `Ctrl+Z` để hoàn tác.\n\n## Khi nào phím bị bỏ qua\n\n- Khi bạn đang gõ trong ô nhập, ô chọn hay vùng soạn thảo, PixelLens không bắt phím.\n- Khi tạm dừng, mọi phím đều chuyển cho trang, trừ `H` (tiếp tục) và `Ctrl+Q` (thoát). Trang giữ nguyên `Ctrl+K` và `?` của riêng nó.\n- Khi **Sửa văn bản** đang bật, trên dock chỉ còn dùng được **Trình kiểm tra**, **Bật/Tắt Bảng Bên** và **Thoát**.\n- Trong lúc chụp màn hình, phím chuyển cho công cụ chụp, trừ `Ctrl+Q`.\n',
      '../docs/vi/editing.md': `# Chỉnh sửa

PixelLens cho phép sửa CSS, chữ và cấu trúc HTML của trang ngay trong trình duyệt, rồi sao chép kết quả thành code. Các chỉnh sửa chỉ thay đổi trang trong trình duyệt của bạn, không động tới tệp của website.

Phần chỉnh sửa nằm ở tab **Phần tử** của bảng bên (nhấn \`0\`) và tác động lên phần tử đang chọn.

## Sửa CSS

Mục **CSS** liệt kê giống DevTools: \`element.style\` (style nội tuyến) trước, sau đó là các rule khớp theo thứ tự cascade, cuối cùng là rule kế thừa (**Kế thừa từ …**).

- Bấm vào tên thuộc tính hoặc giá trị để sửa. \`Enter\` ở ô thuộc tính sẽ chuyển sang ô giá trị; \`Enter\` ở ô giá trị sẽ áp dụng và xuống dòng kế tiếp; \`Esc\` để rời ô.
- Khi gõ tên thuộc tính sẽ có gợi ý: \`↑\` \`↓\` để chọn, \`Enter\` hoặc \`Tab\` để nhận.
- Với giá trị là số, \`↑\` / \`↓\` tăng giảm 1, giữ \`Shift\` là 10, giữ \`Alt\` là 0,1.
- Ô tích ở đầu mỗi dòng (**Bật/tắt thuộc tính này**) tắt dòng đó mà không xoá.
- Bộ chọn của rule sửa được nếu rule cho phép: \`Enter\` để áp dụng, \`Esc\` để khôi phục.
- **Lọc** chỉ giữ các rule có bộ chọn hoặc tên thuộc tính khớp.
- **Thêm quy tắc** (nút +) thêm một rule mới cho phần tử đang chọn.
- **.cls** (**Class**) hiện ô sửa class của phần tử, có gợi ý lấy từ các class trên trang.

Các dấu hiệu bên cạnh mỗi dòng:

- Chấm đỏ kèm **Thuộc tính không xác định** hoặc **Giá trị không hợp lệ** khi trình duyệt không chấp nhận.
- Gạch ngang kèm **Bị ghi đè bởi …** khi rule khác thắng.
- Mờ đi kèm **Không được kế thừa bởi phần tử này** với thuộc tính kế thừa nhưng không áp dụng.
- Chấm màu hổ phách kèm **Bị ghi đè bởi một stylesheet PixelLens không đọc được** khi một stylesheet khác nguồn thắng. Dùng **Cấp quyền truy cập** để PixelLens đọc được các stylesheet đó ("Một số kiểu có thể bị thiếu.").

## Ép trạng thái

Các chip **Ép trạng thái** ép một pseudo-class lên phần tử đang chọn: \`:hover\`, \`:focus\`, \`:focus-visible\`, \`:focus-within\`, \`:active\`, \`:visited\`. Chip bị mờ nghĩa là **Không có quy tắc nào dùng trạng thái này cho phần tử**. Bấm lại chip để thôi ép. Trạng thái bị ép sẽ tự bỏ khi bạn bỏ chọn phần tử.

## Sửa chữ

**Sửa văn bản** (nút T trên thanh sửa) biến chữ trên trang thành sửa được: bấm vào đâu đó và gõ. Bấm nút lần nữa để thôi. Trong lúc bật, các nút sửa khác bị vô hiệu, và trên dock chỉ còn dùng được **Trình kiểm tra**, **Bật/Tắt Bảng Bên** và **Thoát**.

## Sửa phần tử

Thanh sửa tác động lên phần tử đang chọn:

| Nút          | Phím                  | Tác dụng                                                          |
| ------------ | --------------------- | ----------------------------------------------------------------- |
| **Sao chép** | \`Ctrl+C\`              | Sao chép phần tử                                                  |
| **Cut**      | \`Ctrl+X\`              | Cắt phần tử                                                       |
| **Dán**      | \`Ctrl+V\`              | Dán phần tử đã sao chép (dùng được khi đã có gì đó được sao chép) |
| **Nhân bản** | \`Ctrl+D\`              | Nhân bản phần tử                                                  |
| **Xóa**      | \`Delete\`, \`Backspace\` | Xóa phần tử                                                       |

Trên macOS dùng \`Cmd\`. Khi đang bôi đen chữ trên trang, \`Ctrl+C\` và \`Ctrl+X\` vẫn giữ chức năng thông thường của trình duyệt.

## Hoàn tác và làm lại

**Hoàn tác** và **Làm lại** trên thanh sửa, hoặc \`Ctrl+Z\`, \`Ctrl+Shift+Z\` và \`Ctrl+Y\` (trên trang hay trong bảng bên đều được), đi qua lịch sử sửa chữ, sửa HTML và sửa class.

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
`,
      '../docs/vi/getting-started.md': `# Bắt đầu

PixelLens là bộ công cụ để kiểm tra, đo đạc và chỉnh sửa trang web ngay trên trang. Tiện ích chạy trên Microsoft Edge và các trình duyệt nhân Chromium khác, từ phiên bản 116 trở lên.

## Cài đặt

### Từ Edge Add-ons

PixelLens đang được đưa lên Edge Add-ons. Khi trang tiện ích đã có, mở nó trong Edge và chọn **Get** (Nhận). Trong lúc chờ, bạn có thể cài theo cách dành cho lập trình viên bên dưới.

### Nạp bản giải nén (cho lập trình viên)

Cần Node 22.12 trở lên và pnpm (qua corepack).

\`\`\`sh
corepack pnpm install
corepack pnpm build
\`\`\`

Bản build nằm ở \`.output/chrome-mv3\`. Sau đó:

1. Mở \`edge://extensions\` (hoặc \`chrome://extensions\`).
2. Bật **Developer mode** (Chế độ nhà phát triển).
3. Chọn **Load unpacked** (Tải tiện ích đã giải nén) và trỏ tới thư mục \`.output/chrome-mv3\`.

Bản build có sẵn khoá của Edge Add-ons nên ID tiện ích luôn là \`bkgdfebicmlicjnkgbemlidlnpbnaofh\`, trùng với bản trên store. ID này cần khi bạn kết nối AI agent (xem [MCP](mcp.md)).

## Bật PixelLens

PixelLens không làm gì trên một tab cho tới khi bạn bật nó ở tab đó. Có ba cách bật hoặc tắt cho tab hiện tại:

- Bấm biểu tượng PixelLens trên thanh công cụ trình duyệt. Biểu tượng có màu khi PixelLens đang bật ở tab đó và xám khi đang tắt.
- Nhấn \`Alt+Shift+S\`.
- Nhấp chuột phải vào trang và chọn **PixelLens** trong menu ngữ cảnh.

PixelLens tự tắt khi tab tải trang mới (tải lại hoặc chuyển trang). Bật lại để làm tiếp. Những công cụ bạn để bật, như trình kiểm tra, X-Ray, thước, breakpoint và lưới bố cục, sẽ tự bật lại ở lần sau.

PixelLens không chạy được trên trang của trình duyệt (\`edge://\`, \`chrome://\`), trang của tiện ích và các cửa hàng tiện ích. Xem [Khắc phục sự cố](troubleshooting.md).

## Thanh công cụ (dock)

Khi PixelLens bật, một thanh công cụ gọi là dock hiện ở giữa cạnh dưới trang. Mọi công cụ đều bắt đầu từ đây. Rê chuột lên một nút để xem tên và phím tắt của nó. Các công cụ ít dùng hơn nằm sau nút **Thêm công cụ** (⋯).

Danh sách đầy đủ các nút và phím có ở trang [Dock và phím tắt](dock-and-shortcuts.md).

## Tạm dừng và thoát

- **Tạm dừng** (trong menu **Thêm công cụ**, phím \`H\`) ẩn mọi thứ PixelLens vẽ lên trang và trả chuột, bàn phím lại cho trang mà không mất trạng thái đang làm. Khi tạm dừng, dock chỉ còn **Tiếp tục** và **Thoát**. Nhấn \`H\` hoặc bấm **Tiếp tục** để làm tiếp.
- **Thoát** (nút X ở đầu phải dock, hoặc \`Ctrl+Q\`) tắt PixelLens trên tab và đóng bảng bên của nó.

## Hướng dẫn nhanh

Lần đầu mở PixelLens, một hướng dẫn ngắn gồm bốn bước sẽ chỉ vào dock: **Thanh công cụ**, **Phím số**, **Thêm công cụ** và **Ctrl+K ở bất cứ đâu**. Bấm **Tiếp** để sang bước sau, **Bỏ qua** để đóng, và **Đã hiểu** ở bước cuối. Muốn xem lại, mở [Cài đặt](settings.md) và chọn **Xem lại** ở dòng **Hướng dẫn nhanh**.

## Mấy việc nên thử đầu tiên

- Nhấn \`1\` để bật **Trình kiểm tra**, rồi rê chuột trên trang: mỗi phần tử hiện kích thước, khoảng cách và một bảng thông tin nổi. Bấm để chọn phần tử. Xem [Kiểm tra phần tử](inspect.md).
- Nhấn \`Space\` khi bảng thông tin đang hiện để ghim nó lên trang.
- Nhấn \`Ctrl+K\` (hoặc \`?\`) để tìm mọi công cụ theo tên và chạy bằng \`Enter\`.
- Nhấn \`0\` để mở bảng bên với đầy đủ chi tiết về phần tử đang chọn và về trang. Xem [Bảng bên](side-panel.md).
- Nhấn \`Esc\` để bỏ chọn hoặc đóng popover đang mở.
`,
      '../docs/vi/inspect.md':
        '# Kiểm tra phần tử\n\n## Trình kiểm tra\n\nNhấn `1` hoặc bấm **Trình kiểm tra** để bật chế độ kiểm tra khi rê chuột. PixelLens nhớ lựa chọn này cho lần bật sau.\n\nKhi trình kiểm tra đang bật:\n\n- Rê chuột lên một phần tử sẽ thấy viền quanh nó, vùng margin (cam) và padding (xanh lá) được tô, chiều rộng và chiều cao, cùng nhãn `tag#id.class` ở bên dưới phần tử.\n- Các thao tác bấm, nhấn giữ và menu chuột phải trên trang bị chặn lại, để menu hay liên kết của trang không bị kích hoạt khi bạn đang kiểm tra.\n- Bấm vào một phần tử để chọn nó. Bấm lần nữa hoặc nhấn `Esc` để bỏ chọn.\n- Phần tử đang chọn có khung viền và các đường gióng kéo dài theo các cạnh của nó ra toàn trang.\n\nTắt trình kiểm tra thì vùng chọn vẫn được giữ (bảng bên vẫn dùng nó) nhưng không còn được vẽ, và mọi bảng đã ghim sẽ bị gỡ.\n\n## Bảng thông tin nổi\n\nCạnh phần tử đang rê chuột hoặc đang chọn có một bảng nổi gồm:\n\n- **Box Model**: `width`, `height`, `display`, `gap`, `margin`, `padding`, `box-sizing`.\n- **Giao diện**: `border-radius`, `background-color`, `color`, có ô màu minh hoạ.\n- **Văn bản**: `font-family` (font thực sự được hiển thị), `font-size`, `font-weight`, `line-height` (tính theo tỉ lệ với cỡ chữ), `letter-spacing`, `text-align`.\n- **Trợ năng**: với chữ, hiện tỉ lệ **Tương phản** kèm mẫu `Aa` và mức đạt được (AAA, AA, hoặc AA màu đỏ khi không đạt), cùng các màu chữ **Gợi ý:** cho AA và AAA. Bấm vào gợi ý để sao chép.\n- **Hình ảnh**: với ảnh, hiện **Kích thước gốc**, **Dung lượng** và **Định dạng**.\n\nCác giá trị mặc định (margin bằng 0, `letter-spacing` là `normal`…) được ẩn bớt. Màu hiển thị theo định dạng chọn trong [Cài đặt](settings.md).\n\nNút **Copy CSS** ở trên cùng sao chép CSS của phần tử.\n\n## Ghim bảng thông tin\n\nNhấn `Space` khi bảng nổi đang hiện để ghim nó. Bảng đã ghim nằm yên ở chỗ đó trên trang và cuộn theo trang, nhờ vậy bạn có thể so sánh nhiều phần tử cùng lúc:\n\n- Kéo phần đầu của bảng đã ghim để di chuyển; kéo góc để đổi kích thước.\n- Rê chuột lên bảng đã ghim sẽ tô sáng phần tử tương ứng trên trang.\n- Đóng bảng bằng nút đóng của nó.\n\nCho tới khi bạn ghim bảng đầu tiên, cuối bảng nổi luôn có dòng nhắc **Nhấn Space để ghim**.\n\n## Di chuyển vùng chọn\n\n- Nút **Chọn Phần tử Cha** / **Chọn Phần tử Con** trên dock, hoặc `Alt+Shift+↑` / `Alt+Shift+↓`. Đi xuống sau khi đi lên sẽ quay lại đúng nhánh cũ.\n- `Alt+Shift+←` / `Alt+Shift+→` chọn phần tử anh em liền trước và liền sau.\n- Phần đầu của bảng bên cũng có hai nút cha và con như vậy.\n\n## Khoảng cách\n\nKhi đã chọn một phần tử và trình kiểm tra đang bật, rê chuột lên phần tử khác: PixelLens vẽ các khoảng cách giữa hai phần tử, kèm số pixel trên từng đường.\n\n## Chế độ X-Ray\n\nNhấn `3` hoặc bấm **Chế độ X-Ray** để vẽ viền quanh mọi phần tử trên trang, mỗi cấp lồng nhau một màu. Phần tử bị ẩn và các thành phần bên trong SVG được bỏ qua. X-Ray cũng đi vào cả các shadow root mở. PixelLens nhớ X-Ray đang bật hay tắt.\n\n## Tìm Phần tử\n\nNhấn `2` hoặc bấm **Tìm Phần tử**, rồi gõ một **Bộ chọn CSS** như `.class`, `#id` hay `tag`. Kết quả hiện ngay khi bạn gõ, kể cả bên trong các shadow root mở:\n\n- Các phần tử khớp được tô sáng trên trang và trang tự cuộn tới kết quả hiện tại.\n- Tiêu đề cho biết vị trí, ví dụ `2/7`, và số kết quả bị ẩn (ví dụ `3 bị ẩn`).\n- **Trước** và **Sau** để đi qua từng kết quả.\n- Đóng ô tìm thì các vùng tô sáng biến mất. Nội dung tìm được giữ lại cho lần sau.\n\nBộ chọn không hợp lệ thì đơn giản là không tìm thấy gì. Trong chế độ responsive, việc tìm chạy trên mọi khung và cộng dồn số kết quả.\n',
      '../docs/vi/mcp.md':
        '# MCP (AI agent)\n\nPixelLens có thể được điều khiển bởi một AI agent (Claude Code, Cursor hoặc bất kỳ ứng dụng nào hỗ trợ Model Context Protocol). Agent đọc được trang, kiểm tra phần tử, áp CSS, bật chế độ responsive và chụp màn hình, thông qua chính những công cụ bạn đang dùng.\n\n## Cách hoạt động\n\n```\nagent ⇄ (stdio, MCP) ⇄ máy chủ MCP của PixelLens ⇄ (WebSocket) ⇄ tiện ích ⇄ tab\n```\n\nMáy chủ MCP là một chương trình Node nhỏ chạy trên máy bạn. Agent khởi động nó, và tiện ích kết nối tới nó qua `ws://127.0.0.1:47347/pixellens`. Không có gì rời khỏi máy của bạn.\n\n## Build máy chủ\n\nMáy chủ nằm trong repository ở `packages/mcp-server` (`@pixellens/mcp-server`), cần Node 18 trở lên. Từ bản checkout:\n\n```sh\ncorepack pnpm install\ncorepack pnpm --filter @pixellens/mcp-server build\n```\n\nChương trình sau khi build là `packages/mcp-server/dist/cli.js`.\n\n## Kết nối\n\n1. Bật PixelLens trên một tab.\n2. Mở **Thêm công cụ** và chọn **Kết nối agent** (mục MCP).\n3. Popover hiện dòng **Dán đoạn này vào AI agent để kết nối:** kèm một đoạn prompt soạn sẵn có chứa mã ghép nối (tạo một lần và chỉ lưu trên máy này). Sao chép bằng nút copy.\n4. Bấm **Kết nối**.\n5. Dán prompt vào agent, hoặc tự thêm máy chủ vào cấu hình của agent (ví dụ bên dưới).\n6. Trong lúc PixelLens chờ, mục này ghi **Đang chờ agent** (trong popover là **Đang chờ agent kết nối…**). Khi máy chủ của agent đã chạy, mục chuyển thành **Đã kết nối MCP**, popover hiện tên và phiên bản của agent cùng phiên bản máy chủ, và nút **Thêm công cụ** có chấm báo.\n\n**Ngắt kết nối** trong cùng popover sẽ đóng kết nối. Bạn cũng có thể kết nối và ngắt kết nối trong [Cài đặt](settings.md) (dòng **Máy chủ MCP** ở mục **AI Terminal**).\n\nPrompt được sao chép có dạng:\n\n```\nAdd the PixelLens MCP server to this agent. Command: npx -y @pixellens/mcp-server --extension-id bkgdfebicmlicjnkgbemlidlnpbnaofh\nwith environment variable PIXELLENS_MCP_TOKEN=<token> (stdio transport, requires Node 18 or newer).\nAfter adding it, call its ping tool to verify the connection.\n```\n\nMáy chủ cần hai thông tin:\n\n- `--extension-id`: ID của tiện ích PixelLens, là `bkgdfebicmlicjnkgbemlidlnpbnaofh` cho cả bản trên store lẫn bản build giải nén.\n- `PIXELLENS_MCP_TOKEN`: mã ghép nối lấy từ prompt đã sao chép.\n\n## Ví dụ cấu hình\n\n### Claude Code (`.mcp.json`)\n\nDùng bản build cục bộ:\n\n```json\n{\n  "mcpServers": {\n    "PixelLens": {\n      "command": "node",\n      "args": [\n        "/path/to/ruler/packages/mcp-server/dist/cli.js",\n        "--extension-id",\n        "bkgdfebicmlicjnkgbemlidlnpbnaofh"\n      ],\n      "env": { "PIXELLENS_MCP_TOKEN": "<token>" }\n    }\n  }\n}\n```\n\n### Ứng dụng khác\n\nMọi ứng dụng MCP khởi động được máy chủ stdio đều dùng được. Cung cấp cho nó:\n\n- lệnh: `node`\n- tham số: `/path/to/ruler/packages/mcp-server/dist/cli.js --extension-id bkgdfebicmlicjnkgbemlidlnpbnaofh`\n- biến môi trường: `PIXELLENS_MCP_TOKEN=<token>`\n\nSau khi thêm, hãy bảo agent gọi công cụ `ping` để kiểm tra kết nối.\n\n## Mô hình bảo mật\n\n- **Chỉ khi bạn bật**: tiện ích không mở kết nối nào cho tới khi bạn bấm **Kết nối**. **Ngắt kết nối** đóng ngay lập tức.\n- **Chỉ trên máy**: máy chủ chỉ lắng nghe ở `127.0.0.1`.\n- **Kiểm tra Origin**: máy chủ chỉ nhận kết nối đến từ origin của tiện ích PixelLens, thứ mà trang web không giả mạo được.\n- **Mã ghép nối**: một mã ngẫu nhiên dài 43 ký tự, chỉ lưu trên máy này, giúp tiện ích chắc chắn đang nói chuyện với đúng máy chủ của bạn. Không bên nào ghi mã này vào log.\n- **Giới hạn theo tab**: agent chỉ thấy những tab mà bạn đã bật PixelLens. Nó không tự bật PixelLens trên tab khác được.\n\n## Chỉnh sửa do agent thực hiện\n\nChỉnh sửa của agent đi qua cùng đường với chỉnh sửa của bạn: chúng hiện trong danh sách **Thay đổi** của bảng bên và được lưu theo từng website. Chỉnh sửa HTML, chữ và class nằm trong lịch sử hoàn tác (`Ctrl+Z`); chỉnh sửa CSS được hoàn nguyên trong danh sách **Thay đổi** hoặc bằng `revert_css_change` / `revert_all_edits`.\n\n## Danh sách lệnh\n\nMáy chủ cung cấp mỗi lệnh một công cụ, cộng thêm `ping`. Mọi lệnh trừ `list_tabs` và `fetch_stylesheet` đều nhận `tabId` lấy từ `list_tabs`. Trong chế độ responsive, các lệnh về phần tử và chỉnh sửa nhận thêm `viewportId` (tuỳ chọn) để nhắm vào một khung.\n\n| Lệnh                        | Chức năng                                                                                |\n| --------------------------- | ---------------------------------------------------------------------------------------- |\n| `list_tabs`                 | Liệt kê các tab đang bật PixelLens                                                       |\n| `focus_tab`                 | Đưa một tab PixelLens lên trước                                                          |\n| `fetch_stylesheet`          | Tải một stylesheet công khai theo URL (cần quyền truy cập mọi trang)                     |\n| `get_page_info`             | URL, tiêu đề, ngôn ngữ, meta, H1, viewport, kích thước trang, vị trí cuộn và tỉ lệ pixel |\n| `get_selected_element`      | Tóm tắt phần tử bạn đang chọn                                                            |\n| `get_element_details`       | Chi tiết một phần tử                                                                     |\n| `get_elements_details`      | Chi tiết tối đa 50 phần tử                                                               |\n| `get_element_outline`       | Cây cấu trúc của một phần tử hoặc của trang                                              |\n| `query_selector`            | Tìm phần tử theo bộ chọn CSS                                                             |\n| `get_element_matched_rules` | Các rule CSS khớp với phần tử, kèm style nội tuyến                                       |\n| `get_breakpoints`           | Các breakpoint media query của trang                                                     |\n| `get_seo_issues`            | Các vấn đề SEO của trang                                                                 |\n| `get_meta_tags`             | Các thẻ meta của trang                                                                   |\n| `get_page_weight`           | Dung lượng tải về theo loại tài nguyên                                                   |\n| `get_css_custom_properties` | Các biến CSS của trang                                                                   |\n| `detect_technologies`       | Framework và thư viện nhận diện được                                                     |\n| `get_typography`            | Kiểu chữ của một phần tử                                                                 |\n| `get_colors`                | Màu của một phần tử                                                                      |\n| `get_assets`                | Ảnh và SVG trong một phần tử                                                             |\n| `get_layout`                | Bố cục flex hoặc grid của một phần tử                                                    |\n| `get_tailwind`              | Class Tailwind tương ứng với CSS của phần tử                                             |\n| `calculate_specificity`     | Độ ưu tiên (specificity) của một bộ chọn                                                 |\n| `force_element_state`       | Ép một pseudo-class (`:hover` … `:visited`) hoặc bỏ ép                                   |\n| `get_a11y_issues`           | Các vấn đề trợ năng (tương phản), đã gom nhóm                                            |\n| `enter_responsive_mode`     | Bật chế độ responsive                                                                    |\n| `exit_responsive_mode`      | Tắt chế độ responsive                                                                    |\n| `get_viewport`              | Khung nhìn hiện tại                                                                      |\n| `set_viewport`              | Đặt chiều rộng và chiều cao của một khung                                                |\n| `set_viewports`             | Thay toàn bộ các khung (1 đến 20)                                                        |\n| `add_viewport`              | Thêm một khung                                                                           |\n| `remove_viewport`           | Gỡ một khung                                                                             |\n| `set_zoom`                  | Đặt mức thu phóng responsive (0,25 đến 2)                                                |\n| `set_breakpoints_mode`      | Bật hoặc tắt chế độ khung theo breakpoint                                                |\n| `get_my_edits`              | Mọi chỉnh sửa trên trang (thay đổi rule và HTML)                                         |\n| `set_text_content`          | Thay chữ của một phần tử                                                                 |\n| `set_inner_html`            | Thay HTML bên trong một phần tử (đã được làm sạch)                                       |\n| `insert_html`               | Chèn HTML trước, sau hoặc bên trong một phần tử (đã được làm sạch)                       |\n| `select_element`            | Chọn một phần tử trong trình kiểm tra                                                    |\n| `get_screenshot`            | Ảnh chụp tab dạng PNG (cạnh dài nhất tối đa 2000 px)                                     |\n| `apply_styles`              | Đặt CSS lên một rule khớp hoặc lên style nội tuyến của phần tử                           |\n| `add_rule`                  | Thêm một rule CSS                                                                        |\n| `set_rule_selector`         | Đổi bộ chọn của một rule                                                                 |\n| `revert_css_change`         | Hoàn nguyên một thay đổi CSS                                                             |\n| `revert_all_edits`          | Hoàn nguyên mọi chỉnh sửa và xoá các chỉnh sửa đã lưu của website                        |\n| `set_element_classes`       | Đặt class cho một phần tử                                                                |\n| `delete_element`            | Xoá một phần tử                                                                          |\n| `duplicate_element`         | Nhân bản một phần tử                                                                     |\n\nCấu trúc tham số đầy đủ của từng lệnh có trong `docs/mcp-protocol.md` của repository.\n\n## Khắc phục sự cố\n\n- **Cứ ở trạng thái Đang chờ agent**: máy chủ chưa chạy. Kiểm tra agent đã khởi động nó chưa (danh sách MCP hoặc log của agent), đường dẫn tới `cli.js` có đúng không và máy đã có Node 18 trở lên chưa.\n- **Máy chủ thoát ngay**: cổng 47347 đã bị chiếm (một bản máy chủ khác đang chạy), thiếu mã hoặc mã sai định dạng, hoặc thiếu `--extension-id`. Máy chủ sẽ in ra lý do.\n- **Kết nối bị từ chối**: mã trong cấu hình của agent không khớp với mã PixelLens đang hiện, hoặc sai ID tiện ích. Sao chép lại prompt và cập nhật cấu hình. Sau khi bị từ chối, bấm **Kết nối** lại.\n- **MCP đã lỗi thời**: máy chủ cũ hơn phiên bản tiện ích yêu cầu. Build lại hoặc khởi động lại agent để nó chạy bản mới.\n- **"PixelLens is not active on this tab."**: bật PixelLens trên tab đó; agent chỉ làm việc được với những tab đang bật PixelLens.\n',
      '../docs/vi/measure.md': `# Đo đạc

## Thước trang và đường gióng

Nhấn \`6\` hoặc bấm **Thước Trang** để hiện thước đo pixel dọc cạnh trên và cạnh trái cửa sổ. Trên mỗi thước có một vạch chữ thập chạy theo con trỏ. PixelLens nhớ thước đang bật hay tắt.

Tạo đường gióng:

- Kéo từ thước trên xuống để tạo đường gióng dọc.
- Kéo từ thước trái sang để tạo đường gióng ngang.
- Kéo từ góc giao nhau của hai thước để tạo cả hai cùng lúc.

Trong lúc kéo, đường gióng tự bắt vào các cạnh và tâm của phần tử dưới con trỏ. Mỗi đường gióng hiện vị trí của nó tính theo pixel của trang, và khoảng cách giữa hai đường gióng kề nhau được ghi ở giữa chúng.

Sửa và xoá đường gióng:

- Kéo một đường gióng để di chuyển (con trỏ đổi hình khi bạn đứng trên nó).
- Kéo đường gióng trở lại thước nơi nó được tạo ra để xoá.
- Bấm đúp vào đường gióng để xoá.
- Bấm vào đường gióng để chọn, rồi nhấn \`Delete\` hoặc \`Backspace\`. Nhấn \`Esc\` hoặc bấm chỗ khác để bỏ chọn.

Đường gióng được giữ suốt thời gian PixelLens bật trên tab, nhưng chỉ hiện khi thước đang bật.

## Đo vùng

Nhấn \`7\` hoặc bấm **Kéo vùng để đo**, rồi kéo chuột trên trang để vẽ khung. Khung hiện kích thước (\`W × H\`) và vị trí \`x\` / \`y\` trên trang.

- Kéo bên trong khung để di chuyển; kéo một góc để đổi kích thước.
- Phím mũi tên dịch khung 1px (\`Shift\`: 10px), \`Ctrl+mũi tên\` nới rộng, \`Ctrl+Alt+mũi tên\` thu hẹp.
- \`Esc\` xoá khung.

Bảng **Đo vùng** cho phép nhập số chính xác:

- **Trái / Trên**: vị trí khung tính từ cạnh trái và cạnh trên của trang.
- **Cách mép phải / dưới**: khoảng cách từ khung tới cạnh phải và cạnh dưới của trang.
- Trong ô số, \`Shift+↑\` / \`Shift+↓\` tăng giảm 10.
- **Màu khung đo** đổi màu khung.
- **Đường gióng** kéo dài các cạnh khung ra toàn trang.
- **Xoá khung** bỏ khung đi.

Màu khung và tuỳ chọn đường gióng được ghi nhớ.

## Lưới bố cục

Nhấn \`4\` hoặc bấm **Lưới Bố cục** để hiện lưới cột trên trang cùng bảng cài đặt. Nhấn lần nữa (hoặc đóng bảng) để tắt lưới.

| Tuỳ chọn              | Khoảng giá trị                 | Mặc định  |
| --------------------- | ------------------------------ | --------- |
| **Cột**               | 1 đến 24                       | 8         |
| **Chiều rộng Tối đa** | số px, hoặc để trống là \`auto\` | \`auto\`    |
| **Khoảng cách**       | 0 đến 100 px                   | 20        |
| **Margin**            | 0 đến 350 px                   | 40        |
| **Màu sắc**           | bảng chọn màu hoặc mã hex      | \`#FC48FF\` |
| **Độ mờ**             | 5% đến 100%                    | 30%       |

Lưới được canh giữa cửa sổ. Cài đặt được lưu lại, và nếu bạn để lưới bật thì lần sau bật PixelLens lưới sẽ hiện lại.

## Breakpoint

Nhấn \`B\` để hiện các breakpoint của trang: mỗi độ rộng dùng trong media query \`min-width\` hoặc \`max-width\` là một đường dọc, có nhãn \`≥768px\`, \`≤767px\`… Đường xanh lá là \`min-width\`, xanh lơ là \`max-width\`, màu hổ phách là độ rộng được dùng cho cả hai.

Công cụ quét lại mỗi lần bật và mỗi khi trang tải thêm stylesheet. Stylesheet lấy từ nguồn khác (CDN) chỉ đọc được sau khi bạn cho phép truy cập mọi trang; xem [Quyền riêng tư và quyền truy cập](privacy-permissions.md).

Ngoài chế độ responsive, Breakpoints không có nút riêng trên dock. Trong [chế độ responsive](responsive.md#breakpoint), thanh công cụ có nút **Breakpoints** và phím \`B\` sẽ dựng mỗi breakpoint một khung.
`,
      '../docs/vi/privacy-permissions.md': `# Quyền riêng tư và quyền truy cập

PixelLens không thu thập, bán hay chia sẻ dữ liệu cá nhân. Không có phân tích, theo dõi, quảng cáo hay telemetry, không cần tài khoản và không có máy chủ nào do nhà phát triển vận hành. Dữ liệu trang (style, màu, font, ảnh chụp) được xử lý ngay trong trình duyệt và chỉ hiện cho bạn.

Toàn văn có trong [chính sách quyền riêng tư](privacy-policy).

## Khi nào PixelLens chạy

PixelLens chỉ chạy trên một tab sau khi bạn bật nó ở tab đó. Tiện ích không có quyền truy cập thường trực vào các website bạn ghé thăm: nó không khai báo sẵn quyền truy cập trang nào, và script của nó chỉ được thêm vào tab khi bạn bấm biểu tượng, nhấn \`Alt+Shift+S\` hoặc dùng menu chuột phải.

## Các quyền

| Quyền                                       | Lý do                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| \`activeTab\`, \`scripting\`                    | Chạy bộ công cụ trên tab mà bạn bật                                                               |
| \`storage\`                                   | Lưu tuỳ chọn và các chỉnh sửa đã lưu                                                              |
| \`sidePanel\`                                 | Hiện chi tiết phần tử và trang trong bảng bên                                                     |
| \`contextMenus\`                              | Mục **PixelLens** trong menu chuột phải của trang và mục **Cài đặt** trên biểu tượng tiện ích     |
| \`debugger\`                                  | Chụp cả trang, chỉ khi bạn chụp; tháo ra ngay sau đó                                              |
| \`declarativeNetRequestWithHostAccess\`       | Chế độ responsive: cho trang hiện tại tải được trong các khung xem trước của chính nó trên tab đó |
| Tuỳ chọn: truy cập mọi trang (\`<all_urls>\`) | Chỉ xin khi dùng chế độ responsive và khi đọc stylesheet khác nguồn                               |
| Tuỳ chọn: \`downloads\`                       | Xin khi bạn tải tài nguyên hoặc ảnh xem trước mạng xã hội từ bảng bên                             |
| Tuỳ chọn: \`clipboardWrite\`                  | Chỉ xin khi trình duyệt từ chối một thao tác sao chép                                             |

Quyền tuỳ chọn chỉ được hỏi đúng lúc bạn dùng tính năng cần nó, và bạn có thể từ chối; phần còn lại của PixelLens vẫn hoạt động bình thường.

## Truy cập mạng

- Tính năng MCP (tuỳ chọn) chỉ kết nối tới \`ws://127.0.0.1\` trên chính máy bạn, và chỉ sau khi bạn bấm **Kết nối**. Kết nối được bảo vệ bằng mã ghép nối và origin của tiện ích. Xem [MCP](mcp.md#mo-hinh-bao-mat).
- Để đọc stylesheet của trang, PixelLens có thể tải lại chính các stylesheet đó từ website bạn đang xem (chỉ khi đã cấp quyền truy cập mọi trang).

## Dữ liệu được lưu

- **Tuỳ chọn** (chủ đề, cài đặt công cụ, bố cục bảng) được giữ trong bộ nhớ tiện ích của trình duyệt. Nếu bạn bật đồng bộ trình duyệt, trình duyệt sẽ đồng bộ chúng giữa các thiết bị; PixelLens không thấy và không điều khiển việc đồng bộ đó.
- **Chỉnh sửa CSS đã lưu** cho từng website chỉ nằm trên máy của bạn.
- **Mã MCP** chỉ nằm trên máy của bạn.

Không dữ liệu nào trong số này được gửi cho nhà phát triển hay bất kỳ ai khác. Chi tiết: [Cài đặt](settings.md#du-lieu-duoc-luu-o-dau).
`,
      '../docs/vi/quality.md': `# Kiểm tra chất lượng

Các công cụ để kiểm tra màu, font, trợ năng và hiệu năng của trang. Phần lớn nằm trong menu **Thêm công cụ**.

## Màu và font của trang

Chọn **Màu & font của trang** trong **Thêm công cụ**, hoặc nhấn \`A\`. Bảng **Màu & font của trang** quét toàn trang và có ba tab, mỗi tab kèm số lượng:

- **Màu**: mọi màu được dùng.
- **Font chữ**: mọi tổ hợp font được dùng.
- **Khoảng cách**: mọi giá trị khoảng cách được dùng. Giá trị không phải bội số của 4px được tô đỏ, kèm dòng cho biết có bao nhiêu giá trị như vậy.

Trong mỗi tab:

- Bấm một dòng để tô sáng các phần tử dùng giá trị đó (tối đa 400); trang tự cuộn tới phần tử đầu tiên.
- Nút copy trên mỗi dòng sao chép giá trị; **Tất cả** sao chép toàn bộ danh sách của tab.
- **Quét lại** đọc lại trang.

## Chọn màu

Chọn **Chọn Màu** trong **Thêm công cụ**, hoặc nhấn \`C\`. Giao diện PixelLens ẩn đi và công cụ lấy màu của trình duyệt mở ra: bấm vào bất kỳ đâu trên màn hình để lấy màu, hoặc nhấn \`Esc\` để huỷ. Màu được sao chép vào clipboard và hiện thoáng qua trên dock.

Màu được ghi theo định dạng chọn trong [Cài đặt](settings.md) (**Định dạng màu**):

| Định dạng | Ví dụ                |
| --------- | -------------------- |
| HEX/HEXA  | \`#3B82F6\`            |
| RGB/RGBA  | \`rgb(59, 130, 246)\`  |
| HSL/HSLA  | \`hsl(217, 91%, 60%)\` |
| HSB/HSBA  | \`hsb(217, 76%, 96%)\` |

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

Bộ lọc áp dụng cho toàn trang. Phím \`Y\` bật hoặc tắt nhanh **Mù màu xanh lá (Deuteranopia)**.

## Thứ tự focus bằng Tab

Chọn **Thứ tự focus bằng Tab** trong **Thêm công cụ**, hoặc nhấn \`T\`. Mọi phần tử đi tới được bằng phím \`Tab\` đều có viền và số thứ tự, nối với nhau bằng một đường nét đứt theo đúng thứ tự. Số tự cập nhật khi trang thay đổi.

## Core Web Vitals

Chọn **Core Web Vitals** trong **Thêm công cụ**, hoặc nhấn \`W\`. Một nhãn ở góc trên bên trái hiện các chỉ số theo thời gian thực, mỗi chỉ số tô màu theo mức đánh giá (xanh là tốt, cam là cần cải thiện, đỏ là kém):

| Chỉ số                          | Tốt         | Kém          |
| ------------------------------- | ----------- | ------------ |
| LCP (Largest Contentful Paint)  | tới 2500 ms | trên 4000 ms |
| CLS (Cumulative Layout Shift)   | tới 0,1     | trên 0,25    |
| INP (Interaction to Next Paint) | tới 200 ms  | trên 500 ms  |

Trên trang, phần tử LCP có viền nét đứt, và các phần tử bị xê dịch nhiều nhất (tối đa 30) cũng có viền kèm phần CLS của chúng. INP chỉ xuất hiện sau khi bạn thao tác với trang.
`,
      '../docs/vi/responsive.md': `# Chế độ responsive

Chế độ responsive hiện trang hiện tại trong nhiều khung kích thước khác nhau, đặt cạnh nhau, ngay trong cùng một tab. Các công cụ của PixelLens chạy trong mọi khung cùng lúc.

## Bật chế độ

Nhấn \`5\` hoặc bấm **Chế độ Responsive · B: breakpoint** trên dock. Nhấn lần nữa để thoát. Khi chế độ đang bật, video và âm thanh trên trang được tạm dừng.

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
- **Chế Độ Màu**: lần lượt **Hệ thống**, **Sáng** và **Tối** (giá trị \`prefers-color-scheme\` mà khung nhận được).
- **Gỡ Bỏ Khung Nhìn**, sau khi bạn xác nhận.
- **Thêm Tác Vụ**: **Tải lại**, **Xoay**, **Chế Độ Màu** và **Gỡ Bỏ Khung Nhìn**.

Kéo cạnh phải, cạnh dưới hoặc góc dưới bên phải của khung để đổi kích thước.

## Công cụ trong các khung

Những công cụ bạn bật từ dock hoặc bằng phím sẽ chạy trong mọi khung: trình kiểm tra, X-Ray, lưới bố cục, thước, đo vùng, đè ảnh thiết kế và chọn màu. Bạn chọn phần tử ở khung nào thì bảng bên theo khung đó. **Tìm Phần tử** tìm trên mọi khung và cộng dồn số kết quả.

**Chụp Màn hình** chụp toàn bộ khung nhìn; chế độ **Phần tử** chụp phần tử đang chọn trong một khung. **Chụp cả trang** không dùng được khi xem responsive.

## Breakpoint

Khi công cụ breakpoint bật (phím \`B\`, hoặc nút **Breakpoints** trên thanh công cụ), các khung được dựng lại thành mỗi độ rộng breakpoint của trang một khung, có nhãn breakpoint (\`≥768px\`, \`≤767px\`). Nút bị vô hiệu nếu trang không khai báo breakpoint nào. Ở chế độ này không dùng được **Thêm Khung Nhìn**.

## Trang chặn bản xem trước

Nhiều website không cho phép hiển thị bên trong khung. Để vẫn tải được, PixelLens cần quyền truy cập mọi trang, và chỉ xin quyền này ở đây. Khung bị chặn sẽ hiện **Trang này chặn việc tải trong bản xem trước. Cấp quyền truy cập để hiển thị.** Bấm **Cấp quyền truy cập** và đồng ý ở hộp thoại của trình duyệt; các khung sẽ tải lại.

Khi có quyền đó, PixelLens gỡ các header chặn khỏi phản hồi, chỉ cho các khung xem trước của tab này và chỉ trong lúc chế độ responsive đang bật.

Một số website chặn bằng script hoặc chính sách trong trang mà không gỡ được. Khi đó khung hiện **Trang này chặn việc tải trong bản xem trước. Trang làm điều này bằng một tập lệnh hoặc chính sách trong trang mà không thể loại bỏ.** Khung không tải xong sẽ hiện **Trang này chưa tải xong.**
`,
      '../docs/vi/settings.md': `# Cài đặt

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
`,
      '../docs/vi/side-panel.md': `# Bảng bên

Bảng bên hiện đầy đủ chi tiết của phần tử đang chọn và của trang, đồng thời chứa các công cụ chỉnh sửa.

## Mở bảng bên

Nhấn \`0\` hoặc bấm **Bật/Tắt Bảng Bên** trên dock. Nếu trình duyệt không hỗ trợ bảng bên, nút sẽ ghi **Bảng bên không được hỗ trợ trên trình duyệt này** và bị vô hiệu.

## Thanh trên cùng

- Ba tab: **Phần tử**, **Trang** và **Thay đổi**. Tab **Thay đổi** hiện số lượng khi bạn có chỉnh sửa.
- Nút bánh răng mở **Cài đặt**.
- **Mở trong cửa sổ** chuyển bảng ra một cửa sổ riêng; **Chuyển về bảng bên** đưa nó trở lại.

Mỗi mục đều thu gọn được bằng cách bấm vào tiêu đề. Ban đầu các mục đều đóng, và PixelLens nhớ những mục bạn đã mở.

## Tab Phần tử

Khi chưa chọn gì, tab hiện dòng **Chọn một phần tử trên trang để xem chi tiết** cùng các phím tắt **Bật/tắt tiện ích**, **Chọn phần tử cha**, **Chọn phần tử con**, **Bật/tắt bảng điều khiển** và **Bỏ chọn**.

Khi đã chọn một phần tử, từ trên xuống dưới có:

- **Thanh sửa**: **Sửa văn bản**, **Sao chép**, **Cut**, **Dán**, **Nhân bản**, **Xóa**, **Hoàn tác**, **Làm lại**. Xem [Chỉnh sửa](editing.md).
- Các chip **Ép trạng thái** (\`:hover\`, \`:focus\`, \`:focus-visible\`, \`:focus-within\`, \`:active\`, \`:visited\`). Xem [Chỉnh sửa](editing.md#ep-trang-thai).
- **Phần đầu**: tên phần tử, kèm nút **Chọn phần tử cha** và **Chọn phần tử con**. Bấm vào tên để cuộn trang tới phần tử.
- **Box Model**: kích thước margin, viền, padding và nội dung. Rê chuột lên từng phần sẽ tô sáng phần đó trên trang. Với \`<canvas>\`, mục **Canvas** cho biết **Kiểu Ngữ cảnh**, **Kích thước Canvas** và **Tỷ lệ Pixel**.
- **Vấn đề**: lỗi tương phản trong phần tử và các phần tử con, được gom nhóm, kèm tỉ lệ đo được, tỉ lệ yêu cầu và mức WCAG. **Trước** / **Sau** đi qua từng **Thể hiện** của một vấn đề và tô sáng nó trên trang. Biểu tượng được kiểm tra theo ngưỡng 3:1 cho phần tử không phải chữ (WCAG 1.4.11).
- **CSS**: các rule khớp với phần tử, sửa được. Xem [Chỉnh sửa](editing.md#sua-css).
- **Bố cục**: với container flex và grid, hiện giá trị \`display\`, kích thước lưới (cột × hàng) và các thuộc tính flex hoặc grid đang dùng.
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
- **Xem trước Mạng Xã hội**: liên kết trông thế nào khi chia sẻ lên **Facebook**, **X** và **LinkedIn**, có nút tải ảnh về. Chỉ hiện khi trang có \`og:image\`.
- **Meta Tags**: chia nhóm **SEO**, **Open Graph** và **Twitter Card**.
- **Công nghệ**: framework và thư viện nhận diện được trên trang.
- **Biến CSS**: các custom property khai báo trên \`:root\`, gom theo tiền tố, có ô **Lọc biến**. Bạn sửa được giá trị: nhấn \`Enter\` để áp dụng, \`Esc\` để huỷ; xoá trống giá trị thì quay về giá trị trong stylesheet. Biến màu có ô màu minh hoạ. Danh sách dài sẽ bị giới hạn; hãy lọc để thu hẹp.
- **Vấn đề SEO**: thiếu hoặc chưa tốt ở title, description, H1, link canonical, thẻ viewport, thuộc tính \`lang\`, \`noindex\`, văn bản \`alt\` của ảnh và các thẻ Open Graph, mỗi mục kèm khuyến nghị. Bấm vào một mục để tô sáng phần tử trên trang.
- **Dung lượng Trang**: dung lượng tải về theo loại: **Tài liệu**, **Scripts**, **Stylesheets**, **Hình ảnh**, **Font**, **Phương tiện**, **Fetch/XHR**, **Khác**. Tài nguyên cross-origin mà trình duyệt giấu dung lượng được đếm riêng.

## Tab Thay đổi

Danh sách mọi chỉnh sửa trên trang, có xuất và hoàn nguyên. Xem [Chỉnh sửa](editing.md#danh-sach-thay-doi).

## Trong chế độ responsive

Bảng bên theo khung đang chứa phần tử được chọn. Xem [Chế độ responsive](responsive.md).
`,
      '../docs/vi/troubleshooting.md': `# Khắc phục sự cố

## Bấm biểu tượng mà không có gì xảy ra

PixelLens không chạy được trên:

- trang của trình duyệt như \`edge://\` và \`chrome://\` (cài đặt, trang tab mới, trang tiện ích),
- trang của các tiện ích,
- trang Chrome Web Store và Edge Add-ons.

Tiện ích chạy trên các trang \`http\`, \`https\`, \`ftp\` và \`file\`. Ở những trang kể trên, biểu tượng và \`Alt+Shift+S\` đơn giản là không làm gì.

Tab đã bị trình duyệt cho "ngủ" (discarded) cần được tải lại trước.

## Tải lại trang thì PixelLens tắt

Đây là hành vi bình thường: PixelLens được bật theo từng lượt xem trang, nên tải lại hay chuyển trang đều làm nó tắt. Hãy bật lại; các công cụ bạn để bật sẽ hiện lại, và các chỉnh sửa CSS đã lưu được khôi phục.

## Tệp cục bộ (file://)

Muốn dùng PixelLens với tệp trên máy, hãy cho phép trong trình duyệt: mở \`edge://extensions\` (hoặc \`chrome://extensions\`), chọn **Details** (Chi tiết) ở PixelLens và bật **Allow access to file URLs** (Cho phép truy cập URL tệp). Chỉnh sửa đã lưu của tệp cục bộ được giữ theo đường dẫn tệp.

## Khung nhúng trên trang (iframe)

Trình kiểm tra và các công cụ khác làm việc trên trang mà bạn bật PixelLens; chúng không đi vào các iframe mà trang đó nhúng. Ngoại lệ là chế độ responsive: các khung xem trước của nó có đầy đủ công cụ.

## Bảng bên thiếu một số style

Stylesheet từ nguồn khác (ví dụ CDN) không đọc được nếu chưa có thêm quyền. Khi đó bảng bên cho biết bao nhiêu stylesheet bị ẩn, hoặc đánh dấu thuộc tính bằng **Bị ghi đè bởi một stylesheet PixelLens không đọc được**. Bấm **Cấp quyền truy cập** và đồng ý ở hộp thoại của trình duyệt để cho phép truy cập mọi trang. Công cụ breakpoint cũng cần quyền này để thấy breakpoint trong các stylesheet đó.

## Khung responsive trống trơn

Website không cho phép hiển thị bên trong khung. Bấm **Cấp quyền truy cập** trong khung và đồng ý; PixelLens sẽ gỡ các header chặn cho các khung xem trước của tab đó. Nếu khung báo **Trang làm điều này bằng một tập lệnh hoặc chính sách trong trang mà không thể loại bỏ**, website đó không xem trước được theo cách này. Xem [Chế độ responsive](responsive.md#trang-chan-ban-xem-truoc).

## Không copy được ảnh chụp

Sao chép ảnh cần trang an toàn (HTTPS). Ở các trang khác, hãy dùng **Lưu**.

## Chụp cả trang chậm hoặc hiện cảnh báo

Cách chụp nhanh không chạy được khi DevTools đang mở ở tab đó. Đóng DevTools rồi chụp lại; nếu không, PixelLens sẽ chuyển sang cuộn và ghép ảnh.

## Bấm phím không có tác dụng

- PixelLens có thể đang tạm dừng: khi đó dock chỉ còn **Tiếp tục** và **Thoát**. Nhấn \`H\`.
- Phím bị bỏ qua khi con trỏ đang ở trong ô nhập liệu.
- Khi **Sửa văn bản** đang bật, chỉ còn **Trình kiểm tra**, **Bật/Tắt Bảng Bên** và **Thoát** dùng được.
- Phím tắt của trình duyệt (\`Alt+Shift+S\`, \`Alt+Shift+↑\`, \`Alt+Shift+↓\`) có thể trùng với tiện ích khác. Kiểm tra ở \`edge://extensions/shortcuts\`.

## Công cụ chọn màu không hoạt động

Công cụ này cần EyeDropper API của trình duyệt, có sẵn trong Edge và Chrome bản hiện hành.

## Nút bảng bên bị vô hiệu

Trình duyệt của bạn không hỗ trợ bảng bên (**Bảng bên không được hỗ trợ trên trình duyệt này**).

## Đặt lại

- Chỉnh sửa CSS đã lưu: **Cài đặt** → **Chỉnh sửa đã lưu** → **Xóa**.
- Chỉnh sửa trên trang hiện tại: bảng bên → **Thay đổi** → **Xóa Tất cả Thay đổi**.
- Các khung responsive: **Đặt Lại Khung Nhìn** trên thanh công cụ responsive.
- Hướng dẫn nhanh: **Cài đặt** → **Hướng dẫn nhanh** → **Xem lại**.
- Mọi thứ khác: gỡ rồi cài lại tiện ích sẽ xoá toàn bộ dữ liệu đã lưu của nó.
`,
    }),
  ).map(([e, t]) => [e.slice(e.lastIndexOf(`/`) + 1, -3), t]),
);
export { e as default };
