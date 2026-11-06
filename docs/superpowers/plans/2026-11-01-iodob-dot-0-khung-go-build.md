# iodob — Đợt 0: Khung + gỡ build — Kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng project WXT mới build ra extension gần như rỗng, load được trên Edge (có một UI thử trong shadow DOM); gỡ build 5 file của bản cũ vào `legacy-src/`; lập `docs/inventory.md` — checklist hành vi cho các đợt sau.

**Architecture:** WXT đặt ở gốc repo (`srcDir: 'src'`), build ra `.output/chrome-mv3`; bản cũ `unpacked/` giữ nguyên. Content script đăng ký kiểu `runtime` (inject khi bấm icon); UI trên trang gắn qua `createShadowRootUi` của WXT. Một plugin PostCSS nhỏ (`build/shadow-dom-css.ts`) đổi `rem` → `px` và thay `@property` bằng giá trị mặc định, để Tailwind chạy đúng trong shadow DOM. Chuỗi giao diện qua `@wxt-dev/i18n` (chỉ en, vi). Độ đủ của bản kiểm kê được giữ bằng một test Vitest: test đối chiếu tên message và khoá i18n trong `legacy-src/` với `docs/inventory.md`.

**Tech Stack:** pnpm 11.7.0, Node ≥ 22.12, TypeScript 6.0.3, WXT 0.21.5 + Vite 8.3.5, Svelte 5.57.3, Tailwind CSS 4.3.3, @lucide/svelte 1.66.0, Vitest 5.0.5, ESLint 10 + typescript-eslint + eslint-plugin-svelte, Prettier 3.9.10, wakaru 1.15.0 (chỉ chạy một lần).

**Spec:** `docs/superpowers/specs/2026-11-01-iodob-rewrite-design.md` — mục 3 (ràng buộc), 6 (kiến trúc), 8 (Đợt 0), 9 (Giao diện trong trang).

**Phạm vi:** chỉ Đợt 0. Mỗi đợt sau có plan riêng, viết khi đợt trước xong, dựa trên `docs/inventory.md`.

**Lệch so với spec — cần chủ dự án xác nhận.** Spec ghi Đợt 0 xong khi "`legacy-src/` có code async/await, class thật". Đã chạy thử wakaru 1.15.0 trên đúng các file này:

- Unminify và format tốt.
- Không khôi phục được async/await: 90 hàm async trong `content.js` vẫn là máy trạng thái regenerator.
- Không khôi phục được class: vẫn là mảng `{ key, value }` của `_createClass`.

Nguyên nhân: helper Babel đã bị đổi tên khi minify. Plan này không viết bộ chuyển riêng, vì tốn công, dễ chuyển sai, và `legacy-src/` sẽ bị xoá ở Đợt 9. Thay vào đó, `legacy-src/README.md` ghi cách đọc hai dạng này. Async và class viết lại bằng tay khi port từng hàm (đúng rủi ro ở mục 10 của spec).

## Global Constraints

- **Phiên bản ghim chính xác** (`pnpm add -D -E`):
  - wxt 0.21.5, vite 8.3.5, @wxt-dev/i18n 0.2.8, @wxt-dev/module-svelte 2.0.5
  - svelte 5.57.3, svelte-check 4.7.7
  - tailwindcss 4.3.3, @tailwindcss/vite 4.3.3, postcss 8.5.32, @lucide/svelte 1.66.0
  - vitest 5.0.5, @types/node 22.20.5
  - typescript 6.0.3 (typescript-eslint chưa nhận TS 7)
  - eslint 10.14.0, @eslint/js 10.0.1, globals 17.14.0, typescript-eslint 8.72.1, eslint-plugin-svelte 3.23.1
  - prettier 3.9.10, prettier-plugin-svelte 4.1.1
- **Manifest giữ như `unpacked/manifest.json` (spec §3):**
  - permissions: `scripting`, `activeTab`, `contextMenus`, `storage`, `declarativeContent`, `sidePanel`, `declarativeNetRequestWithHostAccess`, `debugger`;
  - `optional_permissions`: `downloads`, `clipboardWrite`;
  - `optional_host_permissions`: `<all_urls>`;
  - `minimum_chrome_version`: `"116"`;
  - 3 commands (phím trên mac giống default): `_execute_action` Alt+Shift+S, `select_parent` Alt+Shift+Up, `select_child` Alt+Shift+Down.
- **Manifest không có `host_permissions` và `content_scripts`.** Content script chỉ được inject bằng `scripting.executeScript`.
- **Ngôn ngữ:** chỉ locale `en` và `vi`; `default_locale: "en"`. Chuỗi hiển thị lấy qua `i18n.t()`, không viết cứng.
- **UI trên trang:**
  - nằm trong shadow DOM;
  - kích thước Tailwind ra `px`;
  - không đăng ký `@property` lên trang (spec §3, §9).
- **Không gọi mạng ra ngoài.** Mọi tài nguyên đóng gói sẵn (MV3).
- **Không sửa `unpacked/`:** bản cũ vẫn dùng hằng ngày.
  - Bản mới load từ `.output/chrome-mv3`.
  - Version bản mới là `2.0.0`, để phân biệt với bản cũ `1.0.0` trong `edge://extensions`.
- **Lệnh và commit:**
  - Mọi lệnh chạy ở gốc repo `C:\Users\duchu\Downloads\screen-ruler-dev` (Git Bash).
  - Commit message kết thúc bằng dòng `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Trang đặt `html { font-size: 62.5% }` (10px).**
   - Mong đợi: UI trên trang không bị co — `text-sm` vẫn là 14px, `px-3` vẫn là 12px.
   - Kiểm bằng: test rem → px của `shadowDomCss`, cùng bước thử tay trên Edge (Task 3).
2. **Utility Tailwind dựa vào `@property` trong shadow root của Edge** (`shadow-*`, `ring-*`, `translate-*`, gradient).
   - Mong đợi: các utility này vẫn hiện; trang không bị chèn `@property`.
   - Kiểm bằng (Task 3):
     - test thay `@property` của `shadowDomCss`;
     - `content.css` sau build không còn `@property`;
     - thử tay: `box-shadow` khác `none`.
3. **Ai đó thêm `matches` cho content script, hoặc thêm `host_permissions`.**
   - Hậu quả nếu lọt: bản mới đòi quyền trên mọi trang.
   - Mong đợi: hook `build:manifestGenerated` làm build fail.
   - Kiểm bằng: bước cố ý gây fail (Task 1).
4. **Thiếu khoá dịch ở vi hoặc en.**
   - Hậu quả nếu lọt: giao diện hiện chuỗi rỗng, hoặc tiếng Việt lẫn tiếng Anh.
   - Kiểm bằng: `locales.test.ts` so hai bộ khoá (Task 1).
5. **Máy Windows có `core.autocrlf=true`.**
   - Hậu quả nếu lọt: Git đổi LF → CRLF khi checkout, `prettier --check` báo lỗi trên mọi file.
   - Kiểm bằng: `.gitattributes` với `eol=lf`, rồi kiểm `git ls-files --eol` (Task 2).

---

### Task 1: Khung WXT, manifest, i18n vi/en

**Files:**

- Create:
  - `package.json`, `wxt.config.ts`, `tsconfig.json`, `.gitattributes`
  - `src/entrypoints/background.ts`
  - `src/locales/en.json`, `src/locales/vi.json`, `src/locales/locales.test.ts`
  - `public/images/` — chép 6 file `unpacked/images/*.png`, giữ nguyên tên
- Modify: `.gitignore`

**Interfaces:**

- Produces:
  - `pnpm build` → `.output/chrome-mv3/`.
  - `pnpm test` = `vitest run`.
  - `i18n.t(key)` từ `#i18n`, với các khoá `extName`, `extNameShort`, `extDescription`, `cmdSelectParent`, `cmdSelectChild`.
  - Hook kiểm manifest trong `wxt.config.ts`. Các task sau chỉ thêm vào config, không bỏ hook.

- [ ] **Step 1: Tạo `.gitattributes`, sửa `.gitignore`, tạo `package.json`.**
  - `.gitattributes` có một dòng: `* text=auto eol=lf`.
  - `.gitignore`: thêm `node_modules/`, `.output/`, `.wxt/`; giữ ba dòng cũ.
  - `package.json`:

```json
{
  "name": "iodob",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.7.0",
  "engines": { "node": ">=22.12" },
  "scripts": {
    "dev": "wxt",
    "build": "wxt build",
    "test": "vitest run",
    "postinstall": "wxt prepare"
  }
}
```

- [ ] **Step 2: Viết `wxt.config.ts`, `tsconfig.json`, `background.ts`, hai file locale; chép icon.**

`wxt.config.ts` — giá trị manifest lấy nguyên từ spec:

```ts
import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/i18n/module'],
  webExt: { disabled: true }, // không tự mở Chrome; load .output/chrome-mv3-dev vào Edge một lần, WXT tự reload
  manifest: {
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    default_locale: 'en',
    minimum_chrome_version: '116',
    action: { default_title: '__MSG_extNameShort__' },
    icons: {
      16: 'images/icon16.png',
      24: 'images/icon24.png',
      32: 'images/icon32.png',
      48: 'images/icon48.png',
      128: 'images/icon128.png',
    },
    permissions: [
      'scripting',
      'activeTab',
      'contextMenus',
      'storage',
      'declarativeContent',
      'sidePanel',
      'declarativeNetRequestWithHostAccess',
      'debugger',
    ],
    optional_permissions: ['downloads', 'clipboardWrite'],
    optional_host_permissions: ['<all_urls>'],
    commands: {
      _execute_action: { suggested_key: { default: 'Alt+Shift+S', mac: 'Alt+Shift+S' } },
      select_parent: {
        description: '__MSG_cmdSelectParent__',
        suggested_key: { default: 'Alt+Shift+Up', mac: 'Alt+Shift+Up' },
      },
      select_child: {
        description: '__MSG_cmdSelectChild__',
        suggested_key: { default: 'Alt+Shift+Down', mac: 'Alt+Shift+Down' },
      },
    },
  },
  hooks: {
    'build:manifestGenerated': (_wxt, manifest) => {
      // guard — xem ghi chú dưới
    },
  },
});
```

**Hook `build:manifestGenerated`:** nếu `manifest.host_permissions` hoặc `manifest.content_scripts` có phần tử, ném lỗi với đúng nội dung `iodob: manifest không được có host_permissions/content_scripts — inject bằng scripting.executeScript (spec §3)`.

**Các file còn lại:**

- `tsconfig.json`:

```json
{
  "extends": "./.wxt/tsconfig.json",
  "exclude": [".output", "legacy-src", "unpacked"]
}
```

- `src/entrypoints/background.ts`: `export default defineBackground(() => {});`, với `defineBackground` import từ `#imports`.

`src/locales/*.json` là object phẳng, chuỗi lấy từ `unpacked/_locales/*/messages.json`:

| Khoá | en | vi |
| --- | --- | --- |
| `extName` | iodob - Measure and Inspect the Web | iodob - Đo và Kiểm tra Web |
| `extNameShort` | iodob | iodob |
| `extDescription` | Web inspector for designers & developers. Measure elements, extract CSS & colors, capture screenshots & more. | Công cụ kiểm tra web cho nhà thiết kế và lập trình viên. Đo phần tử, trích xuất CSS và màu sắc, chụp ảnh màn hình và nhiều hơn nữa. |
| `cmdSelectParent` | Move selection to parent element. | Chuyển vùng chọn lên phần tử cha. |
| `cmdSelectChild` | Move selection to child element. | Chuyển vùng chọn xuống phần tử con. |

- [ ] **Step 3: Cài dependency.**
  - Run: `pnpm add -D -E wxt@0.21.5 vite@8.3.5 @wxt-dev/i18n@0.2.8 vitest@5.0.5 typescript@6.0.3`
  - Expected: cài xong, có thư mục `.wxt/` (do postinstall chạy `wxt prepare`).
  - `wxt prepare` cần `src/locales/en.json` đã có — Step 2 đã tạo file này.

- [ ] **Step 4: Viết test so bộ khoá locale.**

`src/locales/locales.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import en from './en.json';
import vi from './vi.json';

const keys = (o: object, p = ''): string[] =>
  Object.entries(o)
    .flatMap(([k, v]) => (typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]))
    .sort();

describe('locales', () => {
  it('vi có đúng bộ khoá của en', () => {
    expect(keys(vi)).toEqual(keys(en));
  });
  it('en có các khoá manifest dùng', () => {
    expect(keys(en)).toEqual(
      expect.arrayContaining(['extName', 'extNameShort', 'extDescription', 'cmdSelectParent', 'cmdSelectChild']),
    );
  });
});
```

- [ ] **Step 5: Chạy test, rồi kiểm test bắt được lỗi.**
  - Chạy `pnpm vitest run src/locales`. Expected: PASS (2 tests).
  - Xoá tạm `cmdSelectChild` khỏi `vi.json`, chạy lại. Expected: FAIL, phần diff có `cmdSelectChild`.
  - Trả lại khoá đó, chạy lại. Expected: PASS.

- [ ] **Step 6: Build và kiểm manifest.**

Run:

```bash
pnpm build && node -e "const m=require('./.output/chrome-mv3/manifest.json');console.log(m.name,m.version,m.default_locale,m.permissions.length,m.host_permissions,m.content_scripts,Object.keys(m.commands).join())"
```

Expected:

- In ra `__MSG_extName__ 2.0.0 en 8 undefined undefined _execute_action,select_parent,select_child`.
- `.output/chrome-mv3/_locales/` chỉ có `en/` và `vi/`.

- [ ] **Step 7: Thử hook chặn.**
  - Thêm tạm `host_permissions: ['<all_urls>']` vào `manifest`, chạy `pnpm build`. Expected: FAIL với thông báo "iodob: manifest không được có host_permissions/content_scripts…".
  - Xoá dòng tạm, chạy lại `pnpm build`. Expected: PASS.

- [ ] **Step 8: Commit.**

```bash
git add .gitattributes .gitignore package.json pnpm-lock.yaml wxt.config.ts tsconfig.json src public
git commit -m "feat: scaffold WXT project with manifest guard and vi/en locales" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 2: Kiểm tra mã — svelte-check, ESLint, Prettier, `pnpm check`

**Files:**

- Create: `eslint.config.js`, `.prettierrc.json`, `.prettierignore`
- Modify: `package.json`

**Interfaces:**

- Consumes: project ở Task 1.
- Produces:
  - `pnpm check` = typecheck + lint + `prettier --check` + test. Đây là lệnh "xong" cho mọi task sau.
  - `pnpm format`.

- [ ] **Step 1: Cài dependency.**

Run:

```bash
pnpm add -D -E svelte@5.57.3 svelte-check@4.7.7 eslint@10.14.0 @eslint/js@10.0.1 globals@17.14.0 typescript-eslint@8.72.1 eslint-plugin-svelte@3.23.1 prettier@3.9.10 prettier-plugin-svelte@4.1.1
```

- [ ] **Step 2: Thêm script, viết config.**

Thêm vào `scripts` của `package.json`:

```json
"typecheck": "svelte-check --tsconfig ./tsconfig.json",
"lint": "eslint .",
"format": "prettier --write .",
"check": "pnpm typecheck && pnpm lint && prettier --check . && pnpm test"
```

`eslint.config.js`:

```js
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
  { ignores: ['.output/', '.wxt/', 'legacy-src/', 'unpacked/', '.superpowers/'] },
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  svelte.configs.prettier,
  { languageOptions: { globals: { ...globals.browser, ...globals.webextensions } } },
  { files: ['**/*.svelte', '**/*.svelte.ts'], languageOptions: { parserOptions: { parser: ts.parser } } },
);
```

`.prettierrc.json`:

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }]
}
```

`.prettierignore` gồm: `.output/`, `.wxt/`, `legacy-src/`, `unpacked/`, `.superpowers/`, `docs/**/*.md`, `pnpm-lock.yaml`.

- [ ] **Step 3: Kiểm lint bắt được lỗi.**
  - Thêm tạm `const unused = 1;` vào `background.ts`, chạy `pnpm lint`.
  - Expected: báo `'unused' is assigned a value but never used  @typescript-eslint/no-unused-vars`.
  - Xoá dòng đó.

- [ ] **Step 4: Format và chạy toàn bộ kiểm tra.**
  - Run: `pnpm format && pnpm check`
  - Expected:
    - svelte-check báo `0 errors`;
    - eslint không in gì;
    - prettier in `All matched files use Prettier code style!`;
    - vitest báo `2 passed`.

- [ ] **Step 5: Kiểm line ending.**
  - Run: `git add -A && git ls-files --eol | grep -c 'w/crlf'`
  - Expected: `0`.

- [ ] **Step 6: Commit.**

```bash
git add -A
git commit -m "chore: add svelte-check, ESLint, Prettier and pnpm check" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 3: Tailwind trong shadow DOM + Svelte + Lucide — UI thử trên trang

**Files:**

- Create:
  - `build/shadow-dom-css.ts`, `build/shadow-dom-css.test.ts`
  - `src/entrypoints/content/index.ts`, `src/entrypoints/content/Smoke.svelte`, `src/entrypoints/content/style.css`
- Modify: `wxt.config.ts`, `src/entrypoints/background.ts`, `package.json`

**Interfaces:**

- Consumes:
  - `i18n.t('extNameShort')` (Task 1);
  - `pnpm check` (Task 2).
- Produces:
  - `shadowDomCss(): Plugin` (postcss) trong `build/shadow-dom-css.ts`, gắn vào Vite qua `css.postcss.plugins`.
  - Content script build ra `/content-scripts/content.js` và `/content-scripts/content.css`; background inject nó khi bấm icon.
  - Host shadow là thẻ `<iodob-ui>`.
  - Đợt 1 thay `Smoke.svelte` bằng dock thật, giữ nguyên cách gắn.

- [ ] **Step 1: Cài dependency.**

Run:

```bash
pnpm add -D -E tailwindcss@4.3.3 @tailwindcss/vite@4.3.3 postcss@8.5.32 @wxt-dev/module-svelte@2.0.5 @lucide/svelte@1.66.0
```

- [ ] **Step 2: Viết test fail.**

`build/shadow-dom-css.test.ts`:

```ts
import postcss, { type AtRule, type Rule } from 'postcss';
import { describe, expect, it } from 'vitest';
import { shadowDomCss } from './shadow-dom-css';

const run = (css: string, plugin = shadowDomCss()) =>
  postcss([plugin]).process(css, { from: undefined }).root;

describe('shadowDomCss', () => {
  it('đổi rem sang px trong giá trị khai báo', () => {
    expect(
      run('.a{margin:.25rem;padding:-0.5rem 1.5rem;--spacing:0.25rem;width:calc(1.125rem + 2px)}').toString(),
    ).toBe('.a{margin:4px;padding:-8px 24px;--spacing:4px;width:calc(18px + 2px)}');
  });

  it('giữ nguyên rem trong điều kiện @media', () => {
    expect(run('@media (width>=40rem){.a{color:red}}').toString()).toContain('40rem');
  });

  it('thay @property bằng giá trị mặc định ở layer thấp nhất', () => {
    const root = run(
      '@layer theme, base, components, utilities;' +
        '@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}' +
        '@property --tw-ring-inset{syntax:"*";inherits:false}.a{color:red}',
    );
    expect(root.toString()).not.toContain('@property');
    const first = root.first as AtRule;
    expect([first.name, first.params, first.nodes]).toEqual(['layer', 'properties', undefined]);
    const last = root.last as AtRule;
    expect([last.name, last.params]).toEqual(['layer', 'properties']);
    const rule = last.first as Rule;
    expect(rule.selector).toBe(':host, *, ::before, ::after, ::backdrop');
    expect(rule.nodes.map(String)).toEqual(['--tw-shadow: 0 0 #0000']);
  });

  it('không thêm gì khi không có @property', () => {
    expect(run('.a{color:red}').toString()).toBe('.a{color:red}');
  });

  it('mỗi file một trạng thái riêng', () => {
    const plugin = shadowDomCss();
    run('@property --x{syntax:"*";inherits:false;initial-value:1px}', plugin);
    expect(run('.a{color:red}', plugin).toString()).toBe('.a{color:red}');
  });
});
```

- [ ] **Step 3: Chạy test, xác nhận fail.**
  - Run: `pnpm vitest run build/shadow-dom-css.test.ts`
  - Expected: FAIL với `Failed to resolve import "./shadow-dom-css"`.

- [ ] **Step 4: Viết `shadowDomCss(): Plugin` trong `build/shadow-dom-css.ts`.**
  - `postcssPlugin: 'iodob-shadow-dom-css'`.
  - **Trạng thái theo từng file:** dùng `prepare()`, vì Vite dùng một instance plugin cho mọi file CSS.
  - **`Declaration`:** thay mọi khớp `/(-?\d*\.?\d+)rem\b/g` trong `decl.value` bằng `${Number((n * 16).toFixed(4))}px`. Không đụng params của `@media`.
  - **`AtRule` tên `property`:**
    - nếu có khai báo `initial-value`, ghi lại cặp `[tên, giá trị]`;
    - xoá at-rule trong mọi trường hợp, để `createShadowRootUi` không đưa nó lên `<head>` của trang.
  - **`OnceExit`:** nếu đã ghi được ít nhất một giá trị:
    - chèn `@layer properties;` lên đầu file — layer khai báo đầu tiên có ưu tiên thấp nhất, nên utilities vẫn đè được;
    - thêm vào cuối file `@layer properties { :host, *, ::before, ::after, ::backdrop { <tên>: <giá trị>; … } }`.

- [ ] **Step 5: Chạy test, xác nhận pass.**
  - Run: `pnpm vitest run build/shadow-dom-css.test.ts`
  - Expected: PASS (5 tests).

- [ ] **Step 6: Gắn vào `wxt.config.ts`.**
  - `modules: ['@wxt-dev/module-svelte', '@wxt-dev/i18n/module']`.
  - `vite: () => ({ plugins: [tailwindcss()], css: { postcss: { plugins: [shadowDomCss()] } } })`.
  - Thêm vào manifest: `web_accessible_resources: [{ resources: ['content-scripts/content.css'], matches: ['<all_urls>'] }]`.
    - Lý do: WXT tự thêm một mục với `matches: []` cho content script không có `matches`, và mục đó không cho trang nào tải CSS.
    - Nếu Edge báo lỗi vì mục rỗng đó: xoá nó trong hook `build:manifestGenerated`.

- [ ] **Step 7: Viết content script, UI thử, background.**

`src/entrypoints/content/style.css`: `@import 'tailwindcss';`

`src/entrypoints/content/index.ts`:

- Khai báo: `defineContentScript({ registration: 'runtime', cssInjectionMode: 'ui', async main(ctx) { … } })`.
- Không có `matches`. Import `./style.css`.
- Ghi chú trong code: `// ponytail: UI thử của Đợt 0 — Đợt 1 thay bằng dock + vòng đời thật`.
- `main`:
  - Nếu trang đã có `<iodob-ui>`: xoá nó và dừng (bấm icon lần 2 = tắt).
  - Nếu chưa: gọi `createShadowRootUi(ctx, { name: 'iodob-ui', position: 'inline', anchor: 'body', onMount: (container) => mount(Smoke, { target: container }), onRemove: (app) => app && unmount(app) })`, rồi `ui.mount()`.

`src/entrypoints/content/Smoke.svelte` — các class này là vật thử của Review Focus 1–2, giữ nguyên:

```svelte
<script lang="ts">
  import Ruler from '@lucide/svelte/icons/ruler';
  import { i18n } from '#i18n';
</script>

<div
  class="fixed top-3 right-3 z-[2147483647] flex items-center gap-2 rounded-xl bg-zinc-900/90 px-3 py-2 font-sans text-sm text-zinc-200 shadow-lg ring-1 ring-white/10 backdrop-blur-md"
>
  <Ruler size={16} />
  {i18n.t('extNameShort')}
</div>
```

`src/entrypoints/background.ts`:

- `browser.action.onClicked` gọi `browser.scripting.executeScript({ target: { tabId }, files: ['/content-scripts/content.js'] })`.
- Nuốt lỗi bằng `.catch(() => {})`, cho các trang không inject được (`edge://`, store).

- [ ] **Step 8: Build và kiểm CSS.**

Run:

```bash
pnpm build && node -e "const c=require('fs').readFileSync('.output/chrome-mv3/content-scripts/content.css','utf8');console.log({rem:/\drem/.test(c),property:c.includes('@property'),defaults:/:host,\s*\*/.test(c)})"
```

Expected:

- In ra `{ rem: false, property: false, defaults: true }`.
- Build không bị hook chặn.
- Nếu ra `rem: true, defaults: false` (plugin PostCSS chạy trước Tailwind): thay `@tailwindcss/vite` bằng `@tailwindcss/postcss@4.3.3`, đặt trước `shadowDomCss()` trong `css.postcss.plugins`.

- [ ] **Step 9: Chạy toàn bộ kiểm tra.**
  - Run: `pnpm check`
  - Expected: pass; vitest báo `7 passed`.

- [ ] **Step 10: Thử tay trên Edge (chủ dự án làm).**
  1. Mở `edge://extensions`, bật Developer mode, Load unpacked, chọn `.output/chrome-mv3`. Expected:
     - không có lỗi đỏ;
     - phiên bản `2.0.0`;
     - tên là "iodob - Đo và Kiểm tra Web" (Edge tiếng Việt) hoặc bản tiếng Anh.
  2. Mở `https://example.com`. Trong DevTools Console chạy `document.documentElement.style.fontSize = '10px'`.
  3. Bấm icon iodob (bản mới). Expected:
     - góc trên phải hiện viên tối có icon thước và chữ "iodob";
     - trong DevTools chọn `<iodob-ui>` → `#shadow-root` → `div`; tab Computed có `font-size: 14px`, `padding: 8px 12px`, và `box-shadow` khác `none`.
  4. Trong Console chạy `document.querySelector('style[wxt-shadow-root-document-styles]')`. Expected: `null` — không có `@property` nào bị đưa lên trang.
  5. Bấm icon lần nữa. Expected: viên tối biến mất.
  6. Nếu bản cũ đang giữ Alt+Shift+S: Edge không gán phím trùng, nên bản mới không có phím tắt. Đó là bình thường.

- [ ] **Step 11: Commit.**

```bash
git add -A
git commit -m "feat: add shadow-DOM Tailwind pipeline and in-page smoke UI" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 4: Gỡ build bản cũ vào `legacy-src/`

**Files:**

- Create:
  - `legacy-src/content.js`, `legacy-src/background.js`, `legacy-src/sidepanel.js`
  - `legacy-src/options.js`, `legacy-src/detect-technologies.js`
  - `legacy-src/README.md`

**Interfaces:**

- Produces:
  - `legacy-src/*.js` đọc được và tìm được bằng ripgrep.
  - Số dòng cố định. Bản kiểm kê trỏ tới vị trí dạng `legacy-src/<file>:<dòng>`.

- [ ] **Step 1: Gỡ build 5 file.**

Run:

```bash
mkdir -p legacy-src
W="pnpm dlx @wakaru/cli@1.15.0"
$W unpacked/scripts/content.js --level aggressive --formatter -o legacy-src/content.js
$W unpacked/background.js --level aggressive --formatter -o legacy-src/background.js
$W unpacked/sidepanel/main.js --level aggressive --formatter -o legacy-src/sidepanel.js
$W unpacked/options/main.js --level aggressive --formatter -o legacy-src/options.js
$W unpacked/scripts/detect-technologies.js --level aggressive --formatter -o legacy-src/detect-technologies.js
```

- [ ] **Step 2: Thay byte NUL thô.**

Lý do: wakaru 1.15 in ký tự U+0000 thô trong template literal (1 chỗ trong `content.js`, 2 chỗ trong `sidepanel.js`), nên ripgrep coi hai file đó là binary và bỏ qua khi tìm trong thư mục.

Thay mỗi U+0000 bằng chuỗi 4 ký tự `\x00`. Dùng `String.fromCharCode` để khỏi lỗi escape của shell:

```bash
node -e "const fs=require('fs');for(const f of fs.readdirSync('legacy-src'))if(f.endsWith('.js')){const p='legacy-src/'+f;fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll(String.fromCharCode(0),String.fromCharCode(92)+'x00'))}"
```

- [ ] **Step 3: Kiểm kết quả.**

Run:

```bash
wc -l legacy-src/*.js
node -e "const fs=require('fs');for(const f of fs.readdirSync('legacy-src'))if(fs.readFileSync('legacy-src/'+f).includes(0))console.log('NUL',f)"
rg -l 'key: "handleAction"' legacy-src
```

Expected:

- Số dòng xấp xỉ: `content.js` 49 865, `sidepanel.js` 18 430, `background.js` 5 795, `detect-technologies.js` 3 236, `options.js` 2 934.
- Lệnh `node` không in gì.
- `rg` in ra `legacy-src/content.js`.

- [ ] **Step 4: Viết `legacy-src/README.md`.**

Nội dung (ngắn):

- **Nguồn:** 5 file build trong `unpacked/` tại commit `3a54e1c`.
- **Cách tạo lại:** lệnh ở Step 1, cộng bước thay NUL ở Step 2.
- **Cách dùng:** chỉ để đọc khi port; không build, không lint, không sửa; xoá ở Đợt 9.
- **Cách đọc async** — máy trạng thái `X().mark(function e() { return X().wrap(function (e) { switch (e.prev = e.next) { case N: … } }) })`:
  - `e.next = N; return P;` nghĩa là `await P`; kết quả nằm ở `e.sent` trong `case N`;
  - `e.abrupt("return", v)` nghĩa là `return v`;
  - `e.prev` / `e.t0 = e.catch(...)` nghĩa là `try/catch`.
- **Cách đọc class:** mảng `{ key: "tên", value: function }` truyền cho helper ngay sau hàm khởi tạo.
- **Mốc** (tìm bằng `rg`): `key: "handleAction"` (đầu controller), `"sidePanelAction"`, `"onDocumentKeydown"`, `"executeShortcut"`, `"destroy"`, và `get_element_matched_rules` (MCP, cả background và content).

- [ ] **Step 5: Kiểm lại toàn bộ.**
  - Run: `pnpm check`
  - Expected: vẫn pass. `legacy-src/` không bị lint, format hay typecheck.

- [ ] **Step 6: Commit.**

```bash
git add legacy-src
git commit -m "chore: add de-built legacy sources for reference" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 5: Kiểm kê — khung, test đối chiếu, phần nền + cài đặt

**Files:**

- Create: `docs/inventory.md`, `docs/inventory.test.ts`
- Modify: `package.json` (thêm `@types/node`)

**Interfaces:**

- Consumes:
  - `legacy-src/*.js` (Task 4);
  - `unpacked/_locales/en/messages.json`;
  - `unpacked/**/*.html`.
- Produces:
  - Định dạng dòng kiểm kê.
  - Bảng `AREAS` trong `docs/inventory.test.ts`. Task 6, 7, 8 mỗi task thêm đúng một vùng.

#### Định dạng `docs/inventory.md`

**Đầu file:**

- nguồn: `unpacked/` tại commit `3a54e1c`, đọc qua `legacy-src/`, `unpacked/scripts/bd/`, `unpacked/bd-background.js`, `unpacked/**/*.html`, `unpacked/manifest.json`;
- định dạng dòng;
- quy tắc: đánh `[x]` khi bản mới đạt mục đó lúc thử tay, trong đợt tương ứng.

**Các mục, theo thứ tự:**

1. Kích hoạt, vòng đời, phím tắt, menu
2. Chọn & soi phần tử
3. Đo & căn chỉnh
4. Chụp màn hình
5. Sửa trực tiếp
6. Side panel — tab Phần tử
7. Side panel — tab Trang, cửa sổ riêng
8. Responsive mode
9. Cài đặt, dữ liệu lưu, kênh nền
10. MCP
11. Bỏ

**Dòng:** `- [ ] <mục>.<nn> · đợt <1–8|bỏ> · <hành vi người dùng thấy, hoặc quy tắc ngầm> — <file:dòng> (<hàm/case>) · <tên liên quan>`.

- Cột đợt theo spec §8: inspector/chọn = 1; đo, X-Ray, tìm, hút màu, đè ảnh, màu & font = 2; chụp = 3; side panel = 4; sửa = 5; responsive = 6; trang cài đặt = 7; MCP = 8.
- Mục 9 ghi mọi khoá storage kèm giá trị mặc định (dùng cho lớp settings ở Đợt 1).
- Mục 11 ghi mọi thứ thuộc danh sách "Bỏ" của spec §4.8, kèm vị trí, để không ai port nhầm.

Ví dụ: `- [ ] 1.03 · đợt 1 · Alt+Shift+↑ chọn phần tử cha (lệnh manifest chuyển xuống content) — legacy-src/background.js:812 (commands.onCommand) · select_parent`.

#### Quy tắc của test

**Tên lấy từ mỗi nguồn** (cả file, hoặc một khoảng dòng):

- mọi `action: "x"` (regex `/action: "([A-Za-z_]+)"/g`);
- mọi `case "x":`, chỉ với file tên `background.js`, bỏ qua `end`;
- mọi khoá K của `unpacked/_locales/en/messages.json` mà văn bản nguồn có chuỗi `"K"`. Cách này bắt cả khoá dùng gián tiếp, như `textKey: "…"` hay `data-i18n="…"`.

**Một tên được coi là đã ghi** khi `docs/inventory.md` khớp `\b<tên>\b`.

**Khoảng dòng của nguồn:**

- `from`: tính từ dòng đầu tiên chứa chuỗi này (lấy cả dòng đó);
- `to`: dừng trước dòng đầu tiên chứa chuỗi này.

Khung test:

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Source = { file: string; from?: string; to?: string };

const AREAS: Record<string, Source[]> = {
  'nền + cài đặt': [
    { file: 'legacy-src/background.js' },
    { file: 'legacy-src/options.js' },
    { file: 'unpacked/options/index.html' },
  ],
};

// sliceSource(src: Source): string
// namesIn(text: string, file: string): string[]
// missing(sources: Source[]): string[]   — tên chưa có trong docs/inventory.md, đã sắp xếp

describe('docs/inventory.md', () => {
  it.each(Object.entries(AREAS))('ghi đủ tên từ vùng %s', (_, sources) => {
    expect(missing(sources)).toEqual([]);
  });
});
```

- [ ] **Step 1: Cài `@types/node`.**
  - Run: `pnpm add -D -E @types/node@22.20.5`

- [ ] **Step 2: Viết khung.**
  - `docs/inventory.md`: phần đầu file và 11 mục, chưa có dòng nào.
  - `docs/inventory.test.ts`: đầy đủ, với một vùng `nền + cài đặt`.

- [ ] **Step 3: Chạy test, xác nhận fail.**
  - Run: `pnpm vitest run docs/inventory.test.ts`
  - Expected: FAIL; danh sách thiếu có `capture_tab`, `fetch_stylesheet`, `THEME_SYSTEM`.

- [ ] **Step 4: Viết các dòng kiểm kê từ các nguồn sau.**
  - **`legacy-src/background.js`:**
    - mọi `case` của message;
    - `commands.onCommand`, `contextMenus`, `action.onClicked`, `runtime.onInstalled`;
    - `declarativeContent`, `declarativeNetRequest`, `debugger`, `sidePanel`, `onMessageExternal`;
    - router MCP (tìm `get_element_matched_rules`).
  - **`unpacked/bd-background.js`:** chụp cả trang bằng debugger → mục 4.
  - **`legacy-src/options.js` và `unpacked/options/index.html`:** mỗi cài đặt một dòng — khoá, mặc định, điều khiển, tác dụng.
  - **Mặc định storage:** các khối `storage.local.get({` trong cả `options.js`, `content.js`, `sidepanel.js`.
  - **`unpacked/manifest.json`:** quyền, `web_accessible_resources` (mỗi nhóm tài nguyên dùng vào việc gì).

- [ ] **Step 5: Chạy test, xác nhận pass.**
  - Run: `pnpm vitest run docs/inventory.test.ts`
  - Expected: PASS.

- [ ] **Step 6: Kiểm toàn bộ và commit.**
  - Run: `pnpm check`. Expected: pass.
  - Commit:

```bash
git add docs/inventory.md docs/inventory.test.ts package.json pnpm-lock.yaml
git commit -m "docs: start legacy behaviour inventory with coverage test" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

### Task 6: Kiểm kê — `content.js` phần controller

**Files:**

- Modify:
  - `docs/inventory.md`;
  - `docs/inventory.test.ts` — thêm vùng `'content: controller': [{ file: 'legacy-src/content.js', from: 'key: "handleAction"' }]`.

**Interfaces:**

- Consumes: định dạng dòng và `AREAS` (Task 5).

**Nguồn cần quét:**

- `handleAction`: mỗi nút dock một dòng.
- `onDocumentKeydown` và `executeShortcut`: mỗi phím một dòng, ghi cả điều kiện bỏ qua (đang gõ trong ô nhập, node của extension…).
- Các method của:
  - chọn / hover / inspector nổi / ghim Space;
  - đo khoảng cách, X-Ray, grid, thước, breakpoints;
  - tìm phần tử, hút màu.
- `saveScreenshot` và các hàm chụp.
- Responsive mode: danh sách thiết bị (`iphone-17-pro`…), khung, đồng bộ.
- `sidePanelAction`: mỗi action gửi sang side panel.
- Pause / thoát / `destroy`, `setUIScale`, toast, cài đặt đọc lúc khởi động.
- Các hook của bd trong `content.js` (danh sách ở `unpacked/scripts/bd/README.md`).

- [ ] **Step 1: Thêm vùng vào test, xác nhận fail.**
  - Run: `pnpm vitest run docs/inventory.test.ts`
  - Expected: FAIL ở vùng `content: controller`, khoảng 160 tên thiếu.
- [ ] **Step 2: Viết các dòng từ những nguồn trên** vào các mục 1–4, 6–8 và 11.
- [ ] **Step 3: Chạy lại test.**
  - Run: `pnpm vitest run docs/inventory.test.ts`
  - Expected: PASS, cả 2 vùng.
- [ ] **Step 4: Kiểm toàn bộ và commit.**
  - Run: `pnpm check`
  - `git add docs && git commit -m "docs: inventory legacy content controller" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 7: Kiểm kê — `content.js` phần trước controller, cùng phần bd

**Files:**

- Modify:
  - `docs/inventory.md`;
  - `docs/inventory.test.ts` — thêm vùng `'content: trước controller': [{ file: 'legacy-src/content.js', to: 'key: "handleAction"' }]`.

**Interfaces:**

- Consumes: định dạng dòng và `AREAS` (Task 5).

**Nguồn cần quét:**

- **Class sửa HTML:** `undoStack`, `getHistoryState`, khoảng 37 method.
- **Class theo dõi thay đổi CSS:** khoảng 18 method.
- **Lưu / áp CSS theo site.**
- **Lệnh MCP phía trang:** tìm `get_element_matched_rules`, `ruleRef`. Ghi đủ tên từng lệnh vào mục 10.
- **Helper** (sinh class Tailwind, contrast, định dạng màu…): chỉ ghi khi người dùng thấy được kết quả.
- **Phần bd:** `unpacked/scripts/bd/**` và `unpacked/bd-background.js`.
  - Mỗi hành vi một dòng: đè ảnh, đo vùng, gióng, màu & font, chụp vùng / màn hình / cả trang / phần tử, trình sửa ảnh.
  - Ghi kèm chuỗi `T(en, vi)` để đợt sau đưa vào locale.

- [ ] **Step 1: Thêm vùng vào test, xác nhận fail.**
  - Run: `pnpm vitest run docs/inventory.test.ts`
  - Expected: FAIL ở vùng `content: trước controller`.
- [ ] **Step 2: Viết các dòng** vào các mục 2–5, 9 và 10.
- [ ] **Step 3: Chạy lại test.**
  - Run: `pnpm vitest run docs/inventory.test.ts`
  - Expected: PASS, cả 3 vùng.
- [ ] **Step 4: Kiểm toàn bộ và commit.**
  - Run: `pnpm check`
  - `git add docs && git commit -m "docs: inventory legacy edit engine, MCP handlers and bd tools" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

### Task 8: Kiểm kê — side panel, nhận diện công nghệ; chốt

**Files:**

- Modify:
  - `docs/inventory.md`;
  - `docs/inventory.test.ts` — thêm vùng `'side panel'` với 5 nguồn: `legacy-src/sidepanel.js`, `legacy-src/detect-technologies.js`, `unpacked/sidepanel/index.html`, `unpacked/sidepanel/editor.html`, `unpacked/sidepanel/box-model.html`.

**Interfaces:**

- Consumes: định dạng dòng và `AREAS` (Task 5).

**Nguồn cần quét:**

- Mọi mục của tab Phần tử (spec §4.4) và tab Trang (spec §4.5).
- Tách / gắn cửa sổ: `PANEL_DOCK`, `PANEL_UNDOCK`, `detach_panel`, `dock_panel`.
- Các màn hình giới thiệu / bán hàng → ghi vào mục 11 (Bỏ).
- `detect-technologies.js`: số chữ ký nhận diện, cách chạy trong MAIN world, cách trả kết quả.

- [ ] **Step 1: Thêm vùng vào test, xác nhận fail.**
  - Run: `pnpm vitest run docs/inventory.test.ts`
  - Expected: FAIL ở vùng `side panel`.
- [ ] **Step 2: Viết các dòng** vào các mục 6, 7 và 11.
- [ ] **Step 3: Chạy lại test.**
  - Run: `pnpm vitest run docs/inventory.test.ts`
  - Expected: PASS, cả 4 vùng.
- [ ] **Step 4: Đối chiếu với spec §4.**
  - Mỗi gạch đầu dòng ở §4.1–4.8 phải có ít nhất một dòng kiểm kê.
  - Thêm dòng cho gạch nào còn thiếu.
  - Ghi danh sách các gạch đã bổ sung vào commit message.
- [ ] **Step 5: Kiểm toàn bộ và commit.**
  - Run: `pnpm check`
  - `git add docs && git commit -m "docs: inventory legacy side panel and finish phase 0 checklist" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"`

## Đợt 0 xong khi

- `pnpm check` pass, và `pnpm build` không bị hook chặn.
- Bước thử tay ở Task 3 đạt trên Edge.
- `legacy-src/` có đủ 5 file và README, tìm được bằng ripgrep.
- `docs/inventory.md` có đủ 11 mục; test đối chiếu pass cả 4 vùng; mọi gạch đầu dòng ở spec §4 có dòng tương ứng.

## Ghi chú cho các đợt sau (phát hiện khi lập plan)

- **Font trong shadow DOM (Đợt 1).** `createShadowRootUi` của WXT đưa `@property` và `@font-face` từ CSS của shadow root lên `<head>` của trang. `shadowDomCss` đã bỏ `@property`, nhưng `@font-face` (font Geist) vẫn sẽ lên trang. Vì vậy:
  - đặt tên họ font riêng (ví dụ `Iodob Geist`, `Iodob Geist Mono`), để không đè font Geist của chính trang (các site Vercel dùng Geist);
  - thêm `fonts/*.woff2` vào `web_accessible_resources`.
- **Sự kiện không lọt xuống inspector (Đợt 1).** `createShadowRootUi` có tuỳ chọn `isolateEvents` — ứng viên cho quy tắc "sự kiện trong panel không lọt xuống inspector".
- **Test cần `browser`.** Dùng `wxt/testing/wxt-vitest-plugin` (`WxtVitest`) và `wxt/testing/fake-browser`. Thêm khi có test đầu tiên cần đến.
- **Mốc trong `legacy-src/content.js`** (số dòng xấp xỉ, theo lần chạy thử; kiểm lại bằng `rg`):
  - class sửa HTML và class theo dõi CSS: 14 683–17 387;
  - lệnh MCP phía trang: 21 000–22 300;
  - controller: 26 968 (`handleAction`) – 49 052;
  - danh sách thiết bị responsive: khoảng 28 676.
- **Mốc trong `legacy-src/background.js`:** router MCP khoảng dòng 2 361–2 561.
