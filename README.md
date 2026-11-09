# PixelLens

Extension Chromium (MV3) để đo và kiểm tra trang web: inspector, thước, đo khoảng cách, grid, X-Ray, tìm phần tử, audit, chụp ảnh, sửa CSS/HTML ngay trên trang, chế độ responsive nhiều khung, và điều khiển qua MCP từ AI agent.

Viết bằng WXT + Svelte 5 + Tailwind 4 + TypeScript; test bằng Vitest + happy-dom.

## Chạy

Cần Node ≥ 22.12 và pnpm (qua corepack).

```sh
corepack pnpm install
corepack pnpm build        # ra .output/chrome-mv3
corepack pnpm dev          # bản dev, tự reload: .output/chrome-mv3-dev
```

Nạp vào Edge/Chrome: `edge://extensions` → bật Developer mode → **Load unpacked** → chọn `.output/chrome-mv3`.

Bản build có `key` của Edge Add-ons nên ID luôn là `bkgdfebicmlicjnkgbemlidlnpbnaofh` (trùng bản trên store). Gói nộp store: `corepack pnpm zip` (bỏ `key`), nội dung đăng ở `docs/store/`.

## Kiểm tra

```sh
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm exec prettier --check src
corepack pnpm exec vitest run src
```

## Cấu trúc

| Thư mục                | Nội dung                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| `src/entrypoints/`     | background, content script, side panel, trang cài đặt                    |
| `src/content/`         | công cụ trên trang (`tools/`), sửa (`edit/`), responsive, MCP phía trang |
| `src/background/`      | xử lý phía service worker: panel, responsive, MCP                        |
| `src/lib/`             | logic thuần dùng chung, chia theo nhóm (xem bảng dưới)                   |
| `src/ui/`              | component và theme dùng chung                                            |
| `src/locales/`         | chuỗi `en` / `vi`                                                        |
| `packages/mcp-server/` | MCP server cục bộ (`@pixellens/mcp-server`)                              |
| `docs/`                | spec, plan từng đợt, kiểm kê hành vi (`inventory.md`), giao thức MCP     |

`src/lib/`:

| Thư mục       | Nội dung                                                             |
| ------------- | -------------------------------------------------------------------- |
| `ext/`        | API extension: messaging, settings, tabs, clipboard, panel, phím     |
| `dom/`        | DOM, selector, hình học, đơn vị viewport, a11y                       |
| `style/`      | màu, theme, định dạng số                                             |
| `tools/`      | logic của từng công cụ trên trang (đo, gióng, X-Ray, tìm, thống kê…) |
| `capture/`    | chụp màn hình, chụp cả trang, khung, vẽ chú thích                    |
| `css/`        | rule CSS khớp, specificity, trạng thái, gợi ý, Tailwind              |
| `edit/`       | sửa CSS: thay đổi, diff, lịch sử, lưu                                |
| `element/`    | dữ liệu phần tử cho side panel (box, màu, font, layout…)             |
| `page/`       | dữ liệu trang: meta, SEO, dung lượng                                 |
| `responsive/` | thiết bị, viewport, zoom, đồng bộ cuộn                               |
| `tech/`       | nhận diện công nghệ                                                  |
| `mcp/`        | giao thức MCP                                                        |

Manifest không có `host_permissions` hay `content_scripts`: content script được chèn bằng `scripting.executeScript` khi người dùng bật extension trên tab.

## MCP

Extension nối tới server trên máy (`ws://127.0.0.1:47347/pixellens`) chỉ khi người dùng bật, xác thực bằng token và Origin của extension. Chi tiết: [docs/mcp-protocol.md](docs/mcp-protocol.md).

```sh
corepack pnpm --filter @pixellens/mcp-server build
```

Cấu hình AI agent (ví dụ `.mcp.json`); `<id>` là `bkgdfebicmlicjnkgbemlidlnpbnaofh`; `<token>` lấy từ đoạn hướng dẫn ở nút MCP trên dock:

```json
{
  "mcpServers": {
    "PixelLens": {
      "command": "node",
      "args": ["<repo>/packages/mcp-server/dist/cli.js", "--extension-id", "<id>"],
      "env": { "PIXELLENS_MCP_TOKEN": "<token>" }
    }
  }
}
```

## Bản cũ

Bản cũ (`unpacked/`, `legacy-src/`) đã xoá; tag git `legacy-final` giữ nguyên. Các vị trí `file:dòng` trong `docs/inventory.md` tính theo tag đó.

## Giấy phép bên thứ ba

Xem [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
