export type Theme = 'system' | 'light' | 'dark';
const ORDER: Theme[] = ['system', 'light', 'dark'];

function read(): Theme {
  try {
    const v = localStorage.getItem('theme');
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* storage blocked */
  }
  return 'system';
}

export const theme = $state<{ value: Theme }>({ value: read() });

/** Same rule as the inline script in each page's <head> (which runs before paint). */
export function applyTheme(t: Theme): void {
  if (t === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
}

export function cycleTheme(): void {
  const next = ORDER[(ORDER.indexOf(theme.value) + 1) % ORDER.length];
  theme.value = next;
  applyTheme(next);
  try {
    if (next === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', next);
  } catch {
    /* not persisted */
  }
}
