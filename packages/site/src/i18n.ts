export type Lang = 'en' | 'vi';

/** Edge Add-ons listing; empty until the store approves it (then the button turns into a link). */
export const EDGE_URL = '';
export const REPO_URL = 'https://github.com/duchung45644/ruler';

const en = {
  nav: { features: 'Features', ai: 'AI agents', keys: 'Shortcuts', privacy: 'Privacy' },
  hero: {
    title: 'The All-in-One Toolkit for Web Inspection and Design',
    lead: "Hover any element to see how it's built, from size and spacing to styles and colors, then fine-tune it right on the page.",
    cta: 'Get it for Microsoft Edge',
    soon: 'Coming soon to Edge Add-ons',
    source: 'View source',
    meta: 'Free · No account · Nothing leaves your browser',
  },
  features: {
    title: 'Everything you open DevTools for, one hover away',
    items: [
      [
        'inspect',
        'Inspect',
        'Size, padding, margin, fonts, colors and contrast as you hover. Distances between elements, X-Ray outlines, find by selector or text.',
      ],
      [
        'measure',
        'Measure and align',
        'Rulers with draggable guides, a measure tool and a layout grid, all snapping to real element edges.',
      ],
      [
        'edit',
        'Edit live',
        'Change CSS and text in place, force :hover and :focus, edit CSS variables and watch the whole page follow.',
      ],
      [
        'export',
        'Export your changes',
        'Copy every tweak as CSS, Tailwind classes or a ready-to-paste prompt for your coding agent.',
      ],
      [
        'responsive',
        'Responsive preview',
        'Several device sizes side by side, with synced scrolling and the same tools in every frame.',
      ],
      [
        'compare',
        'Match the design',
        'Overlay a mockup with difference, onion skin or a before/after split to spot every pixel off.',
      ],
      [
        'a11y',
        'Accessibility',
        'Contrast checks with WCAG-passing color suggestions, color-blindness simulation and the real Tab order.',
      ],
      [
        'vitals',
        'Core Web Vitals',
        'See the LCP element, layout-shift sources and INP right on the page.',
      ],
      [
        'capture',
        'Capture',
        'Screenshot the view, a single element or the whole page, with annotations.',
      ],
    ],
  },
  ai: {
    eyebrow: 'Built for AI coding agents',
    title: 'Let your agent see the page you see',
    body: 'PixelLens ships a local MCP server. Claude Code, Cursor and other agents can inspect elements, read styles, check accessibility and take screenshots of the tab you have open. It talks only to 127.0.0.1, with a token, and only when you turn it on.',
    points: [
      'Inspect and select elements',
      'Read computed styles and matched rules',
      'Screenshots and full-page captures',
      'Accessibility and page audits',
    ],
  },
  keys: {
    title: 'Keyboard first',
    body: 'Every dock tool has a number key, and Ctrl+K finds everything else.',
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
      ['Ctrl K', 'Command palette'],
      ['H', 'Pause'],
    ],
  },
  privacy: {
    title: 'Private by design',
    body: 'No tracking, no analytics, no account. PixelLens runs only on the tab where you turn it on, and your data never leaves your browser.',
    link: 'Read the privacy policy',
  },
  footer: { made: 'Made for designers and developers.', home: 'Home' },
};

type Dict = typeof en;

const vi: Dict = {
  nav: { features: 'Tính năng', ai: 'AI agent', keys: 'Phím tắt', privacy: 'Quyền riêng tư' },
  hero: {
    title: 'Bộ công cụ tất cả trong một để kiểm tra và thiết kế web',
    lead: 'Rê chuột lên một phần tử để thấy nó được dựng ra sao, từ kích thước, khoảng cách đến style và màu, rồi chỉnh ngay trên trang.',
    cta: 'Cài cho Microsoft Edge',
    soon: 'Sắp có trên Edge Add-ons',
    source: 'Xem mã nguồn',
    meta: 'Miễn phí · Không cần tài khoản · Không dữ liệu nào rời trình duyệt',
  },
  features: {
    title: 'Mọi thứ bạn mở DevTools để xem, giờ chỉ cần rê chuột',
    items: [
      [
        'inspect',
        'Kiểm tra',
        'Kích thước, padding, margin, font, màu và độ tương phản hiện ngay khi rê chuột. Khoảng cách giữa các phần tử, X-Ray, tìm theo selector hoặc nội dung.',
      ],
      [
        'measure',
        'Đo và căn chỉnh',
        'Thước với đường gióng kéo được, công cụ đo và lưới layout, tất cả bám theo cạnh thật của phần tử.',
      ],
      [
        'edit',
        'Chỉnh trực tiếp',
        'Sửa CSS và chữ ngay trên trang, ép :hover và :focus, sửa biến CSS và thấy cả trang đổi theo.',
      ],
      [
        'export',
        'Xuất thay đổi',
        'Copy mọi chỉnh sửa dạng CSS, class Tailwind hoặc prompt dán thẳng cho AI agent.',
      ],
      [
        'responsive',
        'Xem responsive',
        'Nhiều kích thước thiết bị cạnh nhau, cuộn đồng bộ, khung nào cũng dùng được đủ công cụ.',
      ],
      [
        'compare',
        'Khớp với thiết kế',
        'Chồng ảnh thiết kế với chế độ difference, onion skin hoặc thanh so trước/sau để thấy từng pixel lệch.',
      ],
      [
        'a11y',
        'Trợ năng',
        'Kiểm tra tương phản kèm gợi ý màu đạt WCAG, mô phỏng mù màu và thứ tự Tab thật.',
      ],
      [
        'vitals',
        'Core Web Vitals',
        'Thấy phần tử LCP, nguồn gây xô lệch layout và INP ngay trên trang.',
      ],
      ['capture', 'Chụp ảnh', 'Chụp khung nhìn, một phần tử hoặc cả trang, kèm chú thích.'],
    ],
  },
  ai: {
    eyebrow: 'Dành cho AI agent lập trình',
    title: 'Cho agent nhìn thấy đúng trang bạn đang xem',
    body: 'PixelLens có sẵn MCP server chạy trên máy. Claude Code, Cursor và các agent khác có thể kiểm tra phần tử, đọc style, kiểm tra trợ năng và chụp ảnh tab bạn đang mở. Nó chỉ nói chuyện với 127.0.0.1, có token, và chỉ khi bạn bật.',
    points: [
      'Kiểm tra và chọn phần tử',
      'Đọc style đã tính và rule CSS khớp',
      'Chụp màn hình và chụp cả trang',
      'Audit trợ năng và trang',
    ],
  },
  keys: {
    title: 'Ưu tiên bàn phím',
    body: 'Mỗi công cụ trên dock có một phím số, Ctrl+K tìm được mọi thứ còn lại.',
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
      ['Ctrl K', 'Bảng lệnh'],
      ['H', 'Tạm dừng'],
    ],
  },
  privacy: {
    title: 'Riêng tư ngay từ thiết kế',
    body: 'Không theo dõi, không analytics, không tài khoản. PixelLens chỉ chạy trên tab bạn bật, và dữ liệu không bao giờ rời trình duyệt.',
    link: 'Đọc chính sách quyền riêng tư',
  },
  footer: { made: 'Làm cho designer và developer.', home: 'Trang chủ' },
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
