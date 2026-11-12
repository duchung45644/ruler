export type Lang = 'en' | 'vi';

/** Edge Add-ons listing (live since 2026-11-12); empty would show the 'coming soon' badge instead. */
export const EDGE_URL =
  'https://microsoftedge.microsoft.com/addons/detail/pixellens-%E2%80%94-the-allinon/bkgdfebicmlicjnkgbemlidlnpbnaofh';
export const EXTENSION_ID = 'bkgdfebicmlicjnkgbemlidlnpbnaofh';
/** Chrome Web Store listing; empty until it exists (Chrome visitors then see a 'coming soon' note). */
export const CHROME_URL = '';
export const VERSION = '1.0.0';

/** Showcase rows: id → screenshot in public/img (null: no image, icon only). */
export const SHOWCASE_IMAGES: Record<string, string | null> = {
  inspect: 'shot-inspect',
  measure: 'shot-ruler',
  grid: 'shot-grid',
  responsive: 'shot-responsive',
  styles: 'shot-colors',
  palette: 'shot-palette',
  more: 'shot-more',
};

const en = {
  nav: {
    features: 'Features',
    how: 'How it works',
    ai: 'AI agents',
    keys: 'Shortcuts',
    faq: 'FAQ',
    docs: 'Docs',
    privacy: 'Privacy',
  },
  hero: {
    title: 'The All-in-One Toolkit for Web Inspection and Design',
    lead: "Hover any element to see how it's built, from size and spacing to styles and colors, then fine-tune it right on the page.",
    cta: 'Get it for Microsoft Edge',
    soon: 'Coming soon to Edge Add-ons',
    ctaChrome: 'Add to Chrome',
    slides: ['Inspect', 'Measure', 'Edit live'],
    chromeSoon: 'Coming soon to the Chrome Web Store',
    edgeAlt: 'Using Microsoft Edge?',
    edgeAltLink: 'Get it from Edge Add-ons',
  },
  stats: [
    ['30+', 'tools in one dock'],
    ['47', 'MCP commands for AI agents'],
    ['1.4 MB', 'total size, loads only when you turn it on'],
    ['0', 'trackers, accounts or servers'],
  ],
  how: {
    title: 'Start in three steps',
    steps: [
      [
        'Install',
        'Add PixelLens to Edge from the Add-ons store. No sign-up, nothing to configure.',
      ],
      [
        'Turn it on',
        'Click the toolbar icon or press Alt+Shift+S on any tab. A small dock appears at the bottom of the page.',
      ],
      [
        'Hover and tweak',
        'Press 1 and hover. Click to select, press 0 for the side panel, and use number keys to switch tools.',
      ],
    ],
  },
  showcase: {
    title: 'Everything you open DevTools for, one hover away',
    lead: 'PixelLens puts the tools designers and front-end developers reach for every day right on top of the page, without digging through panels.',
    rows: [
      {
        id: 'inspect',
        title: 'Inspect anything by hovering',
        body: 'Point at an element and read its real numbers instantly.',
        points: [
          'Size, padding, margin and box model drawn on the page',
          'Font family, size, weight, line height and colors with contrast ratio',
          'Distances to neighbouring elements as you move',
          'Press Space to pin, Alt+Shift+↑/↓ to walk up and down the tree',
          'X-Ray outlines every box; Find locates elements by selector or text',
        ],
      },
      {
        id: 'measure',
        title: 'Measure and align like in a design tool',
        body: 'Rulers, guides and a measuring tool that snap to real element edges.',
        points: [
          'Drag guides from the rulers; drag from the corner for two at once',
          'Gaps between guides are labelled; select a guide and press Delete',
          'Measure any area by dragging, with width, height and position',
          'Breakpoint overlay shows where the layout changes',
        ],
      },
      {
        id: 'grid',
        title: 'Layout grid and design overlay',
        body: 'Check the page against your design system and the original mockup.',
        points: [
          'Column grid with columns, gutter, margin, max width, color and opacity',
          'Overlay a design image and nudge it with the arrow keys',
          'Difference and onion-skin modes, plus a before/after split slider',
        ],
      },
      {
        id: 'edit',
        title: 'Edit live, then take the changes with you',
        body: 'Fine-tune the page in place, and never retype a tweak by hand.',
        points: [
          'Change CSS in matched rules or inline, edit text and HTML in place',
          'Force :hover, :focus, :focus-visible, :active and more',
          'Edit CSS variables and watch the whole page follow',
          'Undo and redo, and save your edits per site',
          'Copy all changes as CSS, Tailwind classes or an AI-ready prompt',
        ],
      },
      {
        id: 'responsive',
        title: 'Responsive preview, with every tool inside',
        body: 'See the page at several sizes side by side and inspect any of them.',
        points: [
          'Popular phones, tablets and desktops, or your own sizes',
          'Synced scrolling and zoom across frames',
          'Inspector, X-Ray, grid and ruler work inside every frame',
        ],
      },
      {
        id: 'styles',
        title: 'Page colors, fonts and the side panel',
        body: 'Understand a whole page or a single element in depth.',
        points: [
          'Every color and font used on the page, with usage counts',
          'Side panel: box model, matched CSS rules with specificity, fonts, colors, layout and assets',
          'Page info: meta and SEO tags, page weight, detected technologies',
          'Color picker that copies in HEX, RGB or HSL',
        ],
      },
      {
        id: 'quality',
        title: 'Accessibility and performance checks',
        body: 'Catch problems while you look at the page, not after release.',
        points: [
          'Contrast checks with a suggested color that passes WCAG AA or AAA',
          'Color-blindness and blurred-vision simulation',
          'Numbered Tab focus order across the page, shadow DOM included',
          'Core Web Vitals: the LCP element, layout-shift sources and INP',
        ],
      },
      {
        id: 'palette',
        title: 'Capture and command palette',
        body: 'Share what you see and reach any tool without the mouse.',
        points: [
          'Screenshot the view, one element or the whole page',
          'Annotate with arrows, boxes, pen, text and blur before saving or copying',
          'Ctrl+K finds and runs any tool by name, in English or Vietnamese',
        ],
      },
    ],
  },
  audience: {
    title: 'Made for the people who build the web',
    items: [
      [
        'Designers',
        'Check spacing, type and colors against your design without asking a developer to open DevTools.',
      ],
      [
        'Front-end developers',
        'Measure, tweak and export the exact CSS or Tailwind classes, then paste them into your code.',
      ],
      [
        'QA and accessibility',
        'Spot contrast issues, broken Tab order and layout shifts, and capture them for the ticket.',
      ],
      [
        'AI-assisted coding',
        'Let Claude Code, Cursor and other agents see the page you see through MCP.',
      ],
    ],
  },
  compare: {
    title: 'What PixelLens adds on top of DevTools',
    head: ['', 'Browser DevTools', 'PixelLens'],
    rows: [
      ['Size and spacing on hover', 'Partly', 'Yes'],
      ['Distance between any two elements', 'No', 'Yes'],
      ['Rulers and draggable guides', 'No', 'Yes'],
      ['Column grid and design overlay', 'No', 'Yes'],
      ['Several device sizes side by side', 'One at a time', 'Yes'],
      ['Export edits as CSS, Tailwind or AI prompt', 'No', 'Yes'],
      ['WCAG color suggestions and vision simulation', 'Partly', 'Yes'],
      ['Control from AI agents (MCP)', 'No', 'Yes'],
    ],
  },
  ai: {
    eyebrow: 'Built for AI coding agents',
    title: 'Let your agent see the page you see',
    body: 'PixelLens ships a local MCP server. Claude Code, Cursor and other MCP clients can inspect elements, read styles, edit CSS, switch responsive sizes and take screenshots of the tab you have open.',
    safe: 'It connects only to 127.0.0.1 on your computer, uses a token and checks the extension origin, and is off until you turn it on.',
    steps: [
      'Build the server: corepack pnpm --filter @pixellens/mcp-server build',
      'Open the More menu (9) → Connect agent to get your token and config',
      'Add the config to your agent, then ask it about the current page',
    ],
    groupsTitle: '47 commands, grouped',
    groups: [
      ['Page', 'Tabs, page info, meta and SEO, page weight, CSS variables, technologies'],
      ['Elements', 'Selection, details, outline tree, query selector, matched rules, specificity'],
      ['Design data', 'Typography, colors, assets, layout, Tailwind classes, accessibility issues'],
      ['Edits', 'Apply styles, add rules, change text, HTML and classes, revert'],
      ['Responsive', 'Enter and exit, set viewports, zoom, breakpoints'],
      ['Capture', 'Screenshots of the current view'],
    ],
  },
  keys: {
    title: 'Keyboard first',
    body: 'Every dock tool has a number key in dock order. Letters reach the rest, and Ctrl+K finds everything.',
    groups: [
      {
        name: 'Dock',
        list: [
          ['1', 'Inspect'],
          ['2', 'Find'],
          ['3', 'X-Ray'],
          ['4', 'Grid'],
          ['5', 'Responsive'],
          ['6', 'Ruler'],
          ['7', 'Measure'],
          ['8', 'Capture'],
          ['9', 'More tools'],
          ['0', 'Side panel'],
        ],
      },
      {
        name: 'More tools',
        list: [
          ['O', 'Design overlay'],
          ['A', 'Page colors & fonts'],
          ['C', 'Color picker'],
          ['B', 'Breakpoints'],
          ['Y', 'Vision simulator'],
          ['T', 'Tab focus order'],
          ['W', 'Core Web Vitals'],
        ],
      },
      {
        name: 'Session',
        list: [
          ['Alt Shift S', 'Turn on / off'],
          ['Ctrl K', 'Command palette'],
          ['H', 'Pause / resume'],
          ['Space', 'Pin the inspector'],
          ['Alt Shift ↑ ↓', 'Parent / child'],
          ['Ctrl Q', 'Quit'],
        ],
      },
    ],
  },
  faq: {
    title: 'Frequently asked questions',
    storeLink: 'PixelLens on Edge Add-ons',
    items: [
      ['Is PixelLens free?', 'Yes. All tools are free, with no account and no ads.'],
      [
        'Which browsers does it support?',
        'Microsoft Edge and other Chromium-based browsers version 116 or newer. Edge users can install it from Edge Add-ons; a Chrome Web Store listing is planned.',
      ],
      [
        'Does it change the website?',
        'Only in your browser tab. Edits disappear on reload unless you save them, and saved edits stay on your device for that site only.',
      ],
      [
        'Does it collect my data?',
        'No. There is no analytics, tracking or server. Settings sync through your browser account if you have sync turned on.',
      ],
      [
        'Why does it ask for the debugger permission?',
        'Only for full-page screenshots: it resizes the page to capture it in one image, then detaches right away.',
      ],
      [
        'Does it slow down pages?',
        'No. Nothing runs until you turn PixelLens on for a tab, and turning it off removes everything it added.',
      ],
      [
        'Does it work on localhost and local files?',
        'Yes on localhost. For file:// pages, turn on "Allow access to file URLs" for PixelLens in the extensions page.',
      ],
      [
        'How do I report a bug or suggest a feature?',
        'Leave a review or use the support link on the PixelLens page in Edge Add-ons:',
      ],
    ],
  },
  privacy: {
    title: 'Private by design',
    body: 'No tracking, no analytics, no account. PixelLens runs only on the tab where you turn it on, and your data never leaves your browser.',
    link: 'Read the privacy policy',
  },
  footer: {
    made: 'Made for designers and developers.',
    home: 'Home',
    version: `Version ${VERSION}`,
  },
  shotAlt: 'PixelLens screenshot',
  more: {
    allFeatures: 'See all features',
    aiTeaser:
      'Let Claude Code, Cursor and other agents inspect, edit and capture the page you have open, through a local MCP server.',
    aiLink: 'How it works with AI agents',
    faqLink: 'Read the FAQ',
  },
  pages: {
    features: 'Every tool in PixelLens, what it does and how to reach it.',
    ai: 'Connect your coding agent to the page in front of you.',
    faq: 'Answers to the questions people ask most.',
  },
};

export type Dict = typeof en;

const vi: Dict = {
  nav: {
    features: 'Tính năng',
    how: 'Cách dùng',
    ai: 'AI agent',
    keys: 'Phím tắt',
    faq: 'Hỏi đáp',
    docs: 'Tài liệu',
    privacy: 'Quyền riêng tư',
  },
  hero: {
    title: 'Bộ công cụ tất cả trong một để kiểm tra và thiết kế web',
    lead: 'Rê chuột lên một phần tử để thấy nó được dựng ra sao, từ kích thước, khoảng cách đến style và màu, rồi chỉnh ngay trên trang.',
    cta: 'Cài cho Microsoft Edge',
    soon: 'Sắp có trên Edge Add-ons',
    ctaChrome: 'Thêm vào Chrome',
    slides: ['Soi CSS', 'Đo khoảng cách', 'Sửa trực tiếp'],
    chromeSoon: 'Sắp có trên Chrome Web Store',
    edgeAlt: 'Bạn dùng Microsoft Edge?',
    edgeAltLink: 'Cài từ Edge Add-ons',
  },
  stats: [
    ['30+', 'công cụ trong một dock'],
    ['47', 'lệnh MCP cho AI agent'],
    ['1,4 MB', 'tổng dung lượng, chỉ chạy khi bạn bật'],
    ['0', 'trình theo dõi, tài khoản hay máy chủ'],
  ],
  how: {
    title: 'Bắt đầu trong ba bước',
    steps: [
      [
        'Cài đặt',
        'Thêm PixelLens vào Edge từ Edge Add-ons. Không cần đăng ký, không cần cấu hình.',
      ],
      [
        'Bật lên',
        'Bấm icon trên thanh công cụ hoặc nhấn Alt+Shift+S ở tab bất kỳ. Một dock nhỏ hiện ở cuối trang.',
      ],
      [
        'Rê chuột và chỉnh',
        'Nhấn 1 rồi rê chuột. Bấm để chọn, nhấn 0 mở side panel, dùng phím số để chuyển công cụ.',
      ],
    ],
  },
  showcase: {
    title: 'Mọi thứ bạn mở DevTools để xem, giờ chỉ cần rê chuột',
    lead: 'PixelLens đặt những công cụ designer và front-end developer dùng hằng ngày ngay trên trang, không phải lục từng panel.',
    rows: [
      {
        id: 'inspect',
        title: 'Rê chuột là thấy cấu trúc',
        body: 'Trỏ vào phần tử và đọc ngay số liệu thật của nó.',
        points: [
          'Kích thước, padding, margin và box model vẽ ngay trên trang',
          'Font, cỡ chữ, độ đậm, line height và màu kèm tỉ lệ tương phản',
          'Khoảng cách tới các phần tử xung quanh khi di chuột',
          'Nhấn Space để ghim, Alt+Shift+↑/↓ để đi lên xuống cây phần tử',
          'X-Ray viền mọi khối; Find tìm phần tử theo selector hoặc nội dung',
        ],
      },
      {
        id: 'measure',
        title: 'Đo và căn chỉnh như trong phần mềm thiết kế',
        body: 'Thước, đường gióng và công cụ đo bám theo cạnh thật của phần tử.',
        points: [
          'Kéo đường gióng từ thước; kéo từ góc để có hai đường cùng lúc',
          'Khoảng cách giữa các đường được ghi số; chọn đường rồi nhấn Delete để xoá',
          'Kéo để đo vùng bất kỳ, có rộng, cao và vị trí',
          'Lớp breakpoint cho thấy chỗ layout thay đổi',
        ],
      },
      {
        id: 'grid',
        title: 'Lưới layout và chồng ảnh thiết kế',
        body: 'So trang với design system và bản thiết kế gốc.',
        points: [
          'Lưới cột chỉnh được số cột, gutter, margin, độ rộng tối đa, màu và độ mờ',
          'Chồng ảnh thiết kế lên trang và dịch bằng phím mũi tên',
          'Chế độ difference, onion skin và thanh so trước/sau',
        ],
      },
      {
        id: 'edit',
        title: 'Chỉnh trực tiếp, rồi mang thay đổi đi',
        body: 'Tinh chỉnh ngay trên trang, không phải gõ lại từng thay đổi.',
        points: [
          'Sửa CSS trong rule khớp hoặc inline, sửa chữ và HTML tại chỗ',
          'Ép :hover, :focus, :focus-visible, :active và các trạng thái khác',
          'Sửa biến CSS và thấy cả trang đổi theo',
          'Hoàn tác, làm lại và lưu thay đổi theo từng site',
          'Copy toàn bộ thay đổi dạng CSS, class Tailwind hoặc prompt cho AI',
        ],
      },
      {
        id: 'responsive',
        title: 'Xem responsive, đủ công cụ trong từng khung',
        body: 'Xem trang ở nhiều kích thước cạnh nhau và kiểm tra khung nào cũng được.',
        points: [
          'Điện thoại, máy tính bảng, máy tính phổ biến hoặc kích thước tự chọn',
          'Cuộn và zoom đồng bộ giữa các khung',
          'Inspector, X-Ray, lưới và thước dùng được trong mọi khung',
        ],
      },
      {
        id: 'styles',
        title: 'Màu, font của trang và side panel',
        body: 'Hiểu sâu cả trang hoặc một phần tử.',
        points: [
          'Mọi màu và font trang dùng, kèm số lần dùng',
          'Side panel: box model, rule CSS khớp kèm specificity, font, màu, layout và tài nguyên',
          'Thông tin trang: thẻ meta và SEO, dung lượng trang, công nghệ nhận diện được',
          'Chọn màu, copy dạng HEX, RGB hoặc HSL',
        ],
      },
      {
        id: 'quality',
        title: 'Kiểm tra trợ năng và hiệu năng',
        body: 'Bắt lỗi ngay khi đang xem trang, không đợi đến lúc phát hành.',
        points: [
          'Kiểm tra tương phản kèm màu gợi ý đạt WCAG AA hoặc AAA',
          'Mô phỏng mù màu và nhìn mờ',
          'Đánh số thứ tự focus bằng Tab trên cả trang, tính cả shadow DOM',
          'Core Web Vitals: phần tử LCP, nguồn xô lệch layout và INP',
        ],
      },
      {
        id: 'palette',
        title: 'Chụp ảnh và bảng lệnh',
        body: 'Chia sẻ thứ bạn thấy và gọi mọi công cụ không cần chuột.',
        points: [
          'Chụp khung nhìn, một phần tử hoặc cả trang',
          'Vẽ mũi tên, khung, nét bút, chữ và làm mờ trước khi lưu hoặc copy',
          'Ctrl+K tìm và chạy công cụ theo tên, bằng tiếng Việt hoặc tiếng Anh',
        ],
      },
    ],
  },
  audience: {
    title: 'Dành cho những người dựng nên web',
    items: [
      [
        'Designer',
        'Kiểm tra khoảng cách, chữ và màu so với thiết kế mà không phải nhờ developer mở DevTools.',
      ],
      ['Front-end developer', 'Đo, chỉnh rồi xuất đúng CSS hoặc class Tailwind để dán vào code.'],
      [
        'QA và trợ năng',
        'Phát hiện lỗi tương phản, thứ tự Tab sai, layout xô lệch và chụp lại cho ticket.',
      ],
      [
        'Lập trình cùng AI',
        'Cho Claude Code, Cursor và các agent khác thấy đúng trang bạn đang xem qua MCP.',
      ],
    ],
  },
  compare: {
    title: 'PixelLens bổ sung gì so với DevTools',
    head: ['', 'DevTools của trình duyệt', 'PixelLens'],
    rows: [
      ['Kích thước và khoảng cách khi rê chuột', 'Một phần', 'Có'],
      ['Khoảng cách giữa hai phần tử bất kỳ', 'Không', 'Có'],
      ['Thước và đường gióng kéo được', 'Không', 'Có'],
      ['Lưới cột và chồng ảnh thiết kế', 'Không', 'Có'],
      ['Nhiều kích thước thiết bị cạnh nhau', 'Từng cái một', 'Có'],
      ['Xuất thay đổi dạng CSS, Tailwind, prompt AI', 'Không', 'Có'],
      ['Gợi ý màu WCAG và mô phỏng thị lực', 'Một phần', 'Có'],
      ['Điều khiển từ AI agent (MCP)', 'Không', 'Có'],
    ],
  },
  ai: {
    eyebrow: 'Dành cho AI agent lập trình',
    title: 'Cho agent nhìn thấy đúng trang bạn đang xem',
    body: 'PixelLens có sẵn MCP server chạy trên máy. Claude Code, Cursor và các MCP client khác có thể kiểm tra phần tử, đọc style, sửa CSS, đổi kích thước responsive và chụp ảnh tab bạn đang mở.',
    safe: 'Nó chỉ kết nối tới 127.0.0.1 trên máy bạn, dùng token, kiểm tra origin của extension, và tắt cho đến khi bạn bật.',
    steps: [
      'Build server: corepack pnpm --filter @pixellens/mcp-server build',
      'Mở menu Thêm (9) → Kết nối agent để lấy token và cấu hình',
      'Thêm cấu hình vào agent, rồi hỏi nó về trang đang mở',
    ],
    groupsTitle: '47 lệnh, chia theo nhóm',
    groups: [
      ['Trang', 'Tab, thông tin trang, meta và SEO, dung lượng, biến CSS, công nghệ'],
      [
        'Phần tử',
        'Phần tử đang chọn, chi tiết, cây phần tử, query selector, rule khớp, specificity',
      ],
      ['Dữ liệu thiết kế', 'Chữ, màu, tài nguyên, layout, class Tailwind, lỗi trợ năng'],
      ['Chỉnh sửa', 'Áp style, thêm rule, sửa chữ, HTML và class, hoàn tác'],
      ['Responsive', 'Bật tắt, đặt kích thước khung, zoom, breakpoint'],
      ['Chụp ảnh', 'Chụp khung nhìn hiện tại'],
    ],
  },
  keys: {
    title: 'Ưu tiên bàn phím',
    body: 'Mỗi công cụ trên dock có một phím số theo đúng thứ tự. Phím chữ gọi các công cụ còn lại, Ctrl+K tìm được mọi thứ.',
    groups: [
      {
        name: 'Dock',
        list: [
          ['1', 'Kiểm tra'],
          ['2', 'Tìm'],
          ['3', 'X-Ray'],
          ['4', 'Lưới'],
          ['5', 'Responsive'],
          ['6', 'Thước'],
          ['7', 'Đo'],
          ['8', 'Chụp'],
          ['9', 'Thêm công cụ'],
          ['0', 'Side panel'],
        ],
      },
      {
        name: 'Thêm công cụ',
        list: [
          ['O', 'Chồng ảnh thiết kế'],
          ['A', 'Màu và font của trang'],
          ['C', 'Chọn màu'],
          ['B', 'Breakpoint'],
          ['Y', 'Mô phỏng thị lực'],
          ['T', 'Thứ tự focus Tab'],
          ['W', 'Core Web Vitals'],
        ],
      },
      {
        name: 'Phiên làm việc',
        list: [
          ['Alt Shift S', 'Bật / tắt'],
          ['Ctrl K', 'Bảng lệnh'],
          ['H', 'Tạm dừng / tiếp tục'],
          ['Space', 'Ghim inspector'],
          ['Alt Shift ↑ ↓', 'Phần tử cha / con'],
          ['Ctrl Q', 'Thoát'],
        ],
      },
    ],
  },
  faq: {
    title: 'Câu hỏi thường gặp',
    storeLink: 'PixelLens trên Edge Add-ons',
    items: [
      [
        'PixelLens có miễn phí không?',
        'Có. Mọi công cụ đều miễn phí, không cần tài khoản, không quảng cáo.',
      ],
      [
        'Dùng được trên trình duyệt nào?',
        'Microsoft Edge và các trình duyệt Chromium từ phiên bản 116. Người dùng Edge cài từ Edge Add-ons; bản trên Chrome Web Store đang được chuẩn bị.',
      ],
      [
        'Có làm thay đổi website không?',
        'Chỉ trong tab của bạn. Tải lại trang là mất, trừ khi bạn lưu; thay đổi đã lưu chỉ nằm trên máy bạn cho đúng site đó.',
      ],
      [
        'Có thu thập dữ liệu của tôi không?',
        'Không. Không analytics, không theo dõi, không máy chủ. Cài đặt đồng bộ qua tài khoản trình duyệt nếu bạn bật đồng bộ.',
      ],
      [
        'Vì sao cần quyền debugger?',
        'Chỉ để chụp cả trang: extension tạm phóng trang ra đủ chiều cao để chụp một ảnh, rồi ngắt ngay.',
      ],
      [
        'Có làm chậm trang không?',
        'Không. Không có gì chạy cho đến khi bạn bật PixelLens trên tab, và tắt đi là gỡ sạch mọi thứ nó thêm vào.',
      ],
      [
        'Dùng được với localhost và file trên máy không?',
        'Có với localhost. Với trang file://, bật "Allow access to file URLs" cho PixelLens trong trang quản lý extension.',
      ],
      [
        'Báo lỗi hoặc góp ý tính năng ở đâu?',
        'Để lại đánh giá hoặc dùng mục hỗ trợ trên trang PixelLens ở Edge Add-ons:',
      ],
    ],
  },
  privacy: {
    title: 'Riêng tư ngay từ thiết kế',
    body: 'Không theo dõi, không analytics, không tài khoản. PixelLens chỉ chạy trên tab bạn bật, và dữ liệu không bao giờ rời trình duyệt.',
    link: 'Đọc chính sách quyền riêng tư',
  },
  footer: {
    made: 'Làm cho designer và developer.',
    home: 'Trang chủ',
    version: `Phiên bản ${VERSION}`,
  },
  shotAlt: 'Ảnh chụp PixelLens',
  more: {
    allFeatures: 'Xem tất cả tính năng',
    aiTeaser:
      'Cho Claude Code, Cursor và các agent khác kiểm tra, sửa và chụp trang bạn đang mở, qua MCP server chạy trên máy.',
    aiLink: 'Cách PixelLens làm việc với AI agent',
    faqLink: 'Xem hỏi đáp',
  },
  pages: {
    features: 'Mọi công cụ trong PixelLens, làm được gì và gọi ra thế nào.',
    ai: 'Kết nối agent lập trình với đúng trang bạn đang xem.',
    faq: 'Giải đáp những câu hỏi thường gặp nhất.',
  },
};

export const dicts: Record<Lang, Dict> = { en, vi };

export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'vi') return saved;
  } catch {
    /* storage blocked: fall back to the browser language */
  }
  return navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem('lang', lang);
  } catch {
    /* not persisted, fine */
  }
  document.documentElement.lang = lang;
}
