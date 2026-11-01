# legacy-src

## Nguồn

5 file build trong `unpacked/` tại commit `3a54e1c`, gỡ build bằng wakaru 1.15.0.

## Cách tạo lại

```bash
mkdir -p legacy-src
W="pnpm dlx @wakaru/cli@1.15.0"
$W unpacked/scripts/content.js --level aggressive --formatter -o legacy-src/content.js
$W unpacked/background.js --level aggressive --formatter -o legacy-src/background.js
$W unpacked/sidepanel/main.js --level aggressive --formatter -o legacy-src/sidepanel.js
$W unpacked/options/main.js --level aggressive --formatter -o legacy-src/options.js
$W unpacked/scripts/detect-technologies.js --level aggressive --formatter -o legacy-src/detect-technologies.js
```

Sau đó thay mỗi U+0000 thô bằng 4 ký tự `\x00`:

```bash
node -e "const fs=require('fs');for(const f of fs.readdirSync('legacy-src'))if(f.endsWith('.js')){const p='legacy-src/'+f;fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll(String.fromCharCode(0),String.fromCharCode(92)+'x00'))}"
```

## Cách dùng

Chỉ để đọc khi port. Không build, không lint, không sửa. Xoá ở Đợt 9.

## Cách đọc async

Máy trạng thái `X().mark(function e() { return X().wrap(function (e) { switch (e.prev = e.next) { case N: ... } }) })`:

- `e.next = N; return P;` nghĩa là `await P`; kết quả nằm ở `e.sent` trong `case N`.
- `e.abrupt("return", v)` nghĩa là `return v`.
- `e.prev` / `e.t0 = e.catch(...)` nghĩa là `try/catch`.

## Cách đọc class

Mảng `{ key: "tên", value: function }` truyền cho helper ngay sau hàm khởi tạo.

## Mốc (tìm bằng `rg`)

`key: "handleAction"` (đầu controller), `"sidePanelAction"`, `"onDocumentKeydown"`, `"executeShortcut"`, `"destroy"`, và `get_element_matched_rules` (MCP, cả background và content).
