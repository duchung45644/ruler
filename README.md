# iodob

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
| `src/lib/`             | logic thuần dùng chung (CSS, màu, đo, giao thức MCP…)                    |
| `src/ui/`              | component và theme dùng chung                                            |
| `src/locales/`         | chuỗi `en` / `vi`                                                        |
| `packages/mcp-server/` | MCP server cục bộ (`@iodob/mcp-server`)                                  |
| `docs/`                | spec, plan từng đợt, kiểm kê hành vi (`inventory.md`), giao thức MCP     |

Manifest không có `host_permissions` hay `content_scripts`: content script được chèn bằng `scripting.executeScript` khi người dùng bật extension trên tab.

## MCP

Extension nối tới server trên máy (`ws://127.0.0.1:47347/iodob`) chỉ khi người dùng bật, xác thực bằng token và Origin của extension. Chi tiết: [docs/mcp-protocol.md](docs/mcp-protocol.md).

```sh
corepack pnpm --filter @iodob/mcp-server build
```

Cấu hình AI agent (ví dụ `.mcp.json`); `<id>` và `<token>` lấy từ đoạn hướng dẫn ở nút MCP trên dock:

```json
{
  "mcpServers": {
    "iodob": {
      "command": "node",
      "args": ["<repo>/packages/mcp-server/dist/cli.js", "--extension-id", "<id>"],
      "env": { "IODOB_MCP_TOKEN": "<token>" }
    }
  }
}
```

## Bản cũ

Bản cũ (`unpacked/`, `legacy-src/`) đã xoá; tag git `legacy-final` giữ nguyên. Các vị trí `file:dòng` trong `docs/inventory.md` tính theo tag đó.

## Giấy phép bên thứ ba

Xem [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
