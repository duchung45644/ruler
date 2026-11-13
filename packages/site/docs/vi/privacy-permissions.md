# Quyền riêng tư và quyền truy cập

PixelLens không thu thập, bán hay chia sẻ dữ liệu cá nhân. Không có phân tích, theo dõi, quảng cáo hay telemetry, không cần tài khoản và không có máy chủ nào do nhà phát triển vận hành. Dữ liệu trang (style, màu, font, ảnh chụp) được xử lý ngay trong trình duyệt và chỉ hiện cho bạn.

Toàn văn có trong [chính sách quyền riêng tư](privacy-policy).

## Khi nào PixelLens chạy

PixelLens chỉ chạy trên một tab sau khi bạn bật nó ở tab đó. Tiện ích không có quyền truy cập thường trực vào các website bạn ghé thăm: nó không khai báo sẵn quyền truy cập trang nào, và script của nó chỉ được thêm vào tab khi bạn bấm biểu tượng, nhấn `Ctrl+Shift+F` hoặc dùng menu chuột phải.

## Các quyền

| Quyền                                       | Lý do                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `activeTab`, `scripting`                    | Chạy bộ công cụ trên tab mà bạn bật                                                               |
| `storage`                                   | Lưu tuỳ chọn và các chỉnh sửa đã lưu                                                              |
| `sidePanel`                                 | Hiện chi tiết phần tử và trang trong bảng bên                                                     |
| `contextMenus`                              | Mục **PixelLens** trong menu chuột phải của trang và mục **Cài đặt** trên biểu tượng tiện ích     |
| `debugger`                                  | Chụp cả trang, chỉ khi bạn chụp; tháo ra ngay sau đó                                              |
| `declarativeNetRequestWithHostAccess`       | Chế độ responsive: cho trang hiện tại tải được trong các khung xem trước của chính nó trên tab đó |
| Tuỳ chọn: truy cập mọi trang (`<all_urls>`) | Chỉ xin khi dùng chế độ responsive và khi đọc stylesheet khác nguồn                               |
| Tuỳ chọn: `downloads`                       | Xin khi bạn tải tài nguyên hoặc ảnh xem trước mạng xã hội từ bảng bên                             |
| Tuỳ chọn: `clipboardWrite`                  | Chỉ xin khi trình duyệt từ chối một thao tác sao chép                                             |

Quyền tuỳ chọn chỉ được hỏi đúng lúc bạn dùng tính năng cần nó, và bạn có thể từ chối; phần còn lại của PixelLens vẫn hoạt động bình thường.

## Truy cập mạng

- Tính năng MCP (tuỳ chọn) chỉ kết nối tới `ws://127.0.0.1` trên chính máy bạn, và chỉ sau khi bạn bấm **Kết nối**. Kết nối được bảo vệ bằng mã ghép nối và origin của tiện ích. Xem [MCP](mcp.md#mo-hinh-bao-mat).
- Để đọc stylesheet của trang, PixelLens có thể tải lại chính các stylesheet đó từ website bạn đang xem (chỉ khi đã cấp quyền truy cập mọi trang).

## Dữ liệu được lưu

- **Tuỳ chọn** (chủ đề, cài đặt công cụ, bố cục bảng) được giữ trong bộ nhớ tiện ích của trình duyệt. Nếu bạn bật đồng bộ trình duyệt, trình duyệt sẽ đồng bộ chúng giữa các thiết bị; PixelLens không thấy và không điều khiển việc đồng bộ đó.
- **Chỉnh sửa CSS đã lưu** cho từng website chỉ nằm trên máy của bạn.
- **Mã MCP** chỉ nằm trên máy của bạn.

Không dữ liệu nào trong số này được gửi cho nhà phát triển hay bất kỳ ai khác. Chi tiết: [Cài đặt](settings.md#du-lieu-duoc-luu-o-dau).
