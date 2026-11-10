# MCP (AI agent)

PixelLens có thể được điều khiển bởi một AI agent (Claude Code, Cursor hoặc bất kỳ ứng dụng nào hỗ trợ Model Context Protocol). Agent đọc được trang, kiểm tra phần tử, áp CSS, bật chế độ responsive và chụp màn hình, thông qua chính những công cụ bạn đang dùng.

## Cách hoạt động

```
agent ⇄ (stdio, MCP) ⇄ máy chủ MCP của PixelLens ⇄ (WebSocket) ⇄ tiện ích ⇄ tab
```

Máy chủ MCP là một chương trình Node nhỏ chạy trên máy bạn. Agent khởi động nó, và tiện ích kết nối tới nó qua `ws://127.0.0.1:47347/pixellens`. Không có gì rời khỏi máy của bạn.

## Build máy chủ

Máy chủ nằm trong repository ở `packages/mcp-server` (`@pixellens/mcp-server`), cần Node 18 trở lên. Từ bản checkout:

```sh
corepack pnpm install
corepack pnpm --filter @pixellens/mcp-server build
```

Chương trình sau khi build là `packages/mcp-server/dist/cli.js`.

## Kết nối

1. Bật PixelLens trên một tab.
2. Mở **Thêm công cụ** và chọn **Kết nối agent** (mục MCP).
3. Popover hiện dòng **Dán đoạn này vào AI agent để kết nối:** kèm một đoạn prompt soạn sẵn có chứa mã ghép nối (tạo một lần và chỉ lưu trên máy này). Sao chép bằng nút copy.
4. Bấm **Kết nối**.
5. Dán prompt vào agent, hoặc tự thêm máy chủ vào cấu hình của agent (ví dụ bên dưới).
6. Trong lúc PixelLens chờ, mục này ghi **Đang chờ agent** (trong popover là **Đang chờ agent kết nối…**). Khi máy chủ của agent đã chạy, mục chuyển thành **Đã kết nối MCP**, popover hiện tên và phiên bản của agent cùng phiên bản máy chủ, và nút **Thêm công cụ** có chấm báo.

**Ngắt kết nối** trong cùng popover sẽ đóng kết nối. Bạn cũng có thể kết nối và ngắt kết nối trong [Cài đặt](settings.md) (dòng **Máy chủ MCP** ở mục **AI Terminal**).

Prompt được sao chép có dạng:

```
Add the PixelLens MCP server to this agent. Command: npx -y @pixellens/mcp-server --extension-id bkgdfebicmlicjnkgbemlidlnpbnaofh
with environment variable PIXELLENS_MCP_TOKEN=<token> (stdio transport, requires Node 18 or newer).
After adding it, call its ping tool to verify the connection.
```

Máy chủ cần hai thông tin:

- `--extension-id`: ID của tiện ích PixelLens, là `bkgdfebicmlicjnkgbemlidlnpbnaofh` cho cả bản trên store lẫn bản build giải nén.
- `PIXELLENS_MCP_TOKEN`: mã ghép nối lấy từ prompt đã sao chép.

## Ví dụ cấu hình

### Claude Code (`.mcp.json`)

Dùng bản build cục bộ:

```json
{
  "mcpServers": {
    "PixelLens": {
      "command": "node",
      "args": [
        "/path/to/ruler/packages/mcp-server/dist/cli.js",
        "--extension-id",
        "bkgdfebicmlicjnkgbemlidlnpbnaofh"
      ],
      "env": { "PIXELLENS_MCP_TOKEN": "<token>" }
    }
  }
}
```

### Ứng dụng khác

Mọi ứng dụng MCP khởi động được máy chủ stdio đều dùng được. Cung cấp cho nó:

- lệnh: `node`
- tham số: `/path/to/ruler/packages/mcp-server/dist/cli.js --extension-id bkgdfebicmlicjnkgbemlidlnpbnaofh`
- biến môi trường: `PIXELLENS_MCP_TOKEN=<token>`

Sau khi thêm, hãy bảo agent gọi công cụ `ping` để kiểm tra kết nối.

## Mô hình bảo mật

- **Chỉ khi bạn bật**: tiện ích không mở kết nối nào cho tới khi bạn bấm **Kết nối**. **Ngắt kết nối** đóng ngay lập tức.
- **Chỉ trên máy**: máy chủ chỉ lắng nghe ở `127.0.0.1`.
- **Kiểm tra Origin**: máy chủ chỉ nhận kết nối đến từ origin của tiện ích PixelLens, thứ mà trang web không giả mạo được.
- **Mã ghép nối**: một mã ngẫu nhiên dài 43 ký tự, chỉ lưu trên máy này, giúp tiện ích chắc chắn đang nói chuyện với đúng máy chủ của bạn. Không bên nào ghi mã này vào log.
- **Giới hạn theo tab**: agent chỉ thấy những tab mà bạn đã bật PixelLens. Nó không tự bật PixelLens trên tab khác được.

## Chỉnh sửa do agent thực hiện

Chỉnh sửa của agent đi qua cùng đường với chỉnh sửa của bạn: chúng hiện trong danh sách **Thay đổi** của bảng bên và được lưu theo từng website. Chỉnh sửa HTML, chữ và class nằm trong lịch sử hoàn tác (`Ctrl+Z`); chỉnh sửa CSS được hoàn nguyên trong danh sách **Thay đổi** hoặc bằng `revert_css_change` / `revert_all_edits`.

## Danh sách lệnh

Máy chủ cung cấp mỗi lệnh một công cụ, cộng thêm `ping`. Mọi lệnh trừ `list_tabs` và `fetch_stylesheet` đều nhận `tabId` lấy từ `list_tabs`. Trong chế độ responsive, các lệnh về phần tử và chỉnh sửa nhận thêm `viewportId` (tuỳ chọn) để nhắm vào một khung.

| Lệnh                        | Chức năng                                                                                |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `list_tabs`                 | Liệt kê các tab đang bật PixelLens                                                       |
| `focus_tab`                 | Đưa một tab PixelLens lên trước                                                          |
| `fetch_stylesheet`          | Tải một stylesheet công khai theo URL (cần quyền truy cập mọi trang)                     |
| `get_page_info`             | URL, tiêu đề, ngôn ngữ, meta, H1, viewport, kích thước trang, vị trí cuộn và tỉ lệ pixel |
| `get_selected_element`      | Tóm tắt phần tử bạn đang chọn                                                            |
| `get_element_details`       | Chi tiết một phần tử                                                                     |
| `get_elements_details`      | Chi tiết tối đa 50 phần tử                                                               |
| `get_element_outline`       | Cây cấu trúc của một phần tử hoặc của trang                                              |
| `query_selector`            | Tìm phần tử theo bộ chọn CSS                                                             |
| `get_element_matched_rules` | Các rule CSS khớp với phần tử, kèm style nội tuyến                                       |
| `get_breakpoints`           | Các breakpoint media query của trang                                                     |
| `get_seo_issues`            | Các vấn đề SEO của trang                                                                 |
| `get_meta_tags`             | Các thẻ meta của trang                                                                   |
| `get_page_weight`           | Dung lượng tải về theo loại tài nguyên                                                   |
| `get_css_custom_properties` | Các biến CSS của trang                                                                   |
| `detect_technologies`       | Framework và thư viện nhận diện được                                                     |
| `get_typography`            | Kiểu chữ của một phần tử                                                                 |
| `get_colors`                | Màu của một phần tử                                                                      |
| `get_assets`                | Ảnh và SVG trong một phần tử                                                             |
| `get_layout`                | Bố cục flex hoặc grid của một phần tử                                                    |
| `get_tailwind`              | Class Tailwind tương ứng với CSS của phần tử                                             |
| `calculate_specificity`     | Độ ưu tiên (specificity) của một bộ chọn                                                 |
| `force_element_state`       | Ép một pseudo-class (`:hover` … `:visited`) hoặc bỏ ép                                   |
| `get_a11y_issues`           | Các vấn đề trợ năng (tương phản), đã gom nhóm                                            |
| `enter_responsive_mode`     | Bật chế độ responsive                                                                    |
| `exit_responsive_mode`      | Tắt chế độ responsive                                                                    |
| `get_viewport`              | Khung nhìn hiện tại                                                                      |
| `set_viewport`              | Đặt chiều rộng và chiều cao của một khung                                                |
| `set_viewports`             | Thay toàn bộ các khung (1 đến 20)                                                        |
| `add_viewport`              | Thêm một khung                                                                           |
| `remove_viewport`           | Gỡ một khung                                                                             |
| `set_zoom`                  | Đặt mức thu phóng responsive (0,25 đến 2)                                                |
| `set_breakpoints_mode`      | Bật hoặc tắt chế độ khung theo breakpoint                                                |
| `get_my_edits`              | Mọi chỉnh sửa trên trang (thay đổi rule và HTML)                                         |
| `set_text_content`          | Thay chữ của một phần tử                                                                 |
| `set_inner_html`            | Thay HTML bên trong một phần tử (đã được làm sạch)                                       |
| `insert_html`               | Chèn HTML trước, sau hoặc bên trong một phần tử (đã được làm sạch)                       |
| `select_element`            | Chọn một phần tử trong trình kiểm tra                                                    |
| `get_screenshot`            | Ảnh chụp tab dạng PNG (cạnh dài nhất tối đa 2000 px)                                     |
| `apply_styles`              | Đặt CSS lên một rule khớp hoặc lên style nội tuyến của phần tử                           |
| `add_rule`                  | Thêm một rule CSS                                                                        |
| `set_rule_selector`         | Đổi bộ chọn của một rule                                                                 |
| `revert_css_change`         | Hoàn nguyên một thay đổi CSS                                                             |
| `revert_all_edits`          | Hoàn nguyên mọi chỉnh sửa và xoá các chỉnh sửa đã lưu của website                        |
| `set_element_classes`       | Đặt class cho một phần tử                                                                |
| `delete_element`            | Xoá một phần tử                                                                          |
| `duplicate_element`         | Nhân bản một phần tử                                                                     |

Cấu trúc tham số đầy đủ của từng lệnh có trong `docs/mcp-protocol.md` của repository.

## Khắc phục sự cố

- **Cứ ở trạng thái Đang chờ agent**: máy chủ chưa chạy. Kiểm tra agent đã khởi động nó chưa (danh sách MCP hoặc log của agent), đường dẫn tới `cli.js` có đúng không và máy đã có Node 18 trở lên chưa.
- **Máy chủ thoát ngay**: cổng 47347 đã bị chiếm (một bản máy chủ khác đang chạy), thiếu mã hoặc mã sai định dạng, hoặc thiếu `--extension-id`. Máy chủ sẽ in ra lý do.
- **Kết nối bị từ chối**: mã trong cấu hình của agent không khớp với mã PixelLens đang hiện, hoặc sai ID tiện ích. Sao chép lại prompt và cập nhật cấu hình. Sau khi bị từ chối, bấm **Kết nối** lại.
- **MCP đã lỗi thời**: máy chủ cũ hơn phiên bản tiện ích yêu cầu. Build lại hoặc khởi động lại agent để nó chạy bản mới.
- **"PixelLens is not active on this tab."**: bật PixelLens trên tab đó; agent chỉ làm việc được với những tab đang bật PixelLens.
