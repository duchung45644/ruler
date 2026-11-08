export type DevicePreset = { key: string; name: string; width: number; height: number };

/** One group per menu section (separators between groups). Port of getDevicePresets (legacy-src/content.js:28672). */
export const DEVICE_GROUPS: DevicePreset[][] = [
  [
    { key: 'iphone-17-pro', name: 'iPhone 17 Pro', width: 402, height: 874 },
    { key: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', width: 440, height: 956 },
    { key: 'iphone-17', name: 'iPhone 17', width: 402, height: 874 },
    { key: 'iphone-air', name: 'iPhone Air', width: 420, height: 912 },
    { key: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', width: 440, height: 956 },
    { key: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', width: 430, height: 932 },
    { key: 'iphone-16', name: 'iPhone 16', width: 393, height: 852 },
    { key: 'iphone-16-plus', name: 'iPhone 16 Plus', width: 430, height: 932 },
    { key: 'iphone-12-15', name: 'iPhone 12-15', width: 390, height: 844 },
    { key: 'iphone-13-mini', name: 'iPhone 13 mini', width: 375, height: 812 },
    { key: 'iphone-11-xr', name: 'iPhone 11/XR', width: 414, height: 896 },
    { key: 'iphone-se', name: 'iPhone SE', width: 375, height: 667 },
  ],
  [
    { key: 'galaxy-s24-s25', name: 'Galaxy S24/S25', width: 360, height: 780 },
    { key: 'galaxy-s25-ultra', name: 'Galaxy S25 Ultra', width: 412, height: 883 },
    { key: 'galaxy-a-series', name: 'Galaxy A5x/A7x', width: 412, height: 915 },
    { key: 'galaxy-z-fold', name: 'Galaxy Z Fold (folded)', width: 344, height: 882 },
    { key: 'galaxy-z-flip', name: 'Galaxy Z Flip', width: 412, height: 1004 },
  ],
  [
    { key: 'pixel-9', name: 'Pixel 9', width: 412, height: 915 },
    { key: 'pixel-9-pro-xl', name: 'Pixel 9 Pro XL', width: 448, height: 997 },
    { key: 'pixel-7', name: 'Pixel 7', width: 412, height: 915 },
  ],
  [
    { key: 'xiaomi-redmi-note', name: 'Xiaomi / Redmi Note', width: 393, height: 873 },
    { key: 'oppo-vivo', name: 'OPPO / vivo', width: 360, height: 800 },
  ],
  [
    { key: 'android-compact', name: 'Android Compact', width: 360, height: 800 },
    { key: 'android-large', name: 'Android Large', width: 412, height: 915 },
  ],
  [
    { key: 'ipad-mini', name: 'iPad mini', width: 768, height: 1024 },
    { key: 'ipad-air-11', name: 'iPad Air 11"', width: 820, height: 1180 },
    { key: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194 },
    { key: 'ipad-pro-13', name: 'iPad Pro 13"', width: 1024, height: 1366 },
  ],
  [{ key: 'galaxy-tab-s', name: 'Galaxy Tab S', width: 800, height: 1280 }],
  [
    { key: 'laptop-1366x768', name: 'Laptop 1366x768', width: 1366, height: 768 },
    { key: 'laptop-1440x900', name: 'Laptop 1440x900', width: 1440, height: 900 },
    { key: 'laptop-1536x864', name: 'Laptop 1536x864', width: 1536, height: 864 },
    { key: 'desktop-1920x1080', name: 'Desktop 1920x1080', width: 1920, height: 1080 },
    { key: 'desktop-2560x1440', name: 'Desktop 2560x1440', width: 2560, height: 1440 },
    { key: 'desktop-4k', name: 'Desktop 4K', width: 3840, height: 2160 },
  ],
];

/** Opens the custom-size dialog; width/height are the dialog's initial values. */
export const CUSTOM_PRESET: DevicePreset = {
  key: 'custom',
  name: 'Custom',
  width: 390,
  height: 844,
};
