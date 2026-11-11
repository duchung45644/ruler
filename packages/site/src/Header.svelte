<script lang="ts">
  import Monitor from '@lucide/svelte/icons/monitor';
  import Moon from '@lucide/svelte/icons/moon';
  import Sun from '@lucide/svelte/icons/sun';
  import { lang, setLang, t } from './lang.svelte';
  import { cycleTheme, theme } from './theme.svelte';

  const THEME_ICON = { system: Monitor, light: Sun, dark: Moon };
  const themeLabel = $derived(
    lang.code === 'vi'
      ? { system: 'Giao diện: theo hệ thống', light: 'Giao diện: sáng', dark: 'Giao diện: tối' }[
          theme.value
        ]
      : { system: 'Theme: system', light: 'Theme: light', dark: 'Theme: dark' }[theme.value],
  );
  const ThemeIcon = $derived(THEME_ICON[theme.value]);
</script>

<header class="sticky top-0 z-20 border-b border-line-soft bg-page/80 backdrop-blur">
  <nav class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
    <a href="./index.html" class="flex items-center gap-2.5 font-semibold text-strong">
      <img src="./logo.svg" alt="" class="size-7" />
      PixelLens
    </a>
    <div class="ml-auto hidden items-center gap-6 text-sm text-muted md:flex">
      <a class="hover:text-strong" href="./features.html">{t().nav.features}</a>
      <a class="hover:text-strong" href="./ai.html">{t().nav.ai}</a>
      <a class="hover:text-strong" href="./docs.html">{t().nav.docs}</a>
      <a class="hover:text-strong" href="./faq.html">{t().nav.faq}</a>
    </div>
    <button
      type="button"
      class="ml-auto flex size-8 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:text-strong md:ml-0"
      title={themeLabel}
      aria-label={themeLabel}
      onclick={cycleTheme}><ThemeIcon size={16} /></button
    >
    <div
      class="flex rounded-lg border border-line p-0.5 text-xs"
      role="group"
      aria-label="Language"
    >
      {#each ['en', 'vi'] as const as code (code)}
        <button
          type="button"
          class="rounded-md px-2.5 py-1 font-medium uppercase transition-colors {lang.code === code
            ? 'bg-tint-strong text-strong'
            : 'text-subtle hover:text-fg'}"
          aria-pressed={lang.code === code}
          onclick={() => setLang(code)}>{code}</button
        >
      {/each}
    </div>
  </nav>
</header>
