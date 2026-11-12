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
    <div
      class="ml-auto hidden items-center gap-6 border-r border-line-soft pr-6 text-sm text-muted md:flex"
    >
      <a class="hover:text-strong" href="./features.html">{t().nav.features}</a>
      <a class="hover:text-strong" href="./ai.html">{t().nav.ai}</a>
      <a class="hover:text-strong" href="./docs.html">{t().nav.docs}</a>
      <a class="hover:text-strong" href="./faq.html">{t().nav.faq}</a>
    </div>
    <!-- one quiet control group: theme + language, set off from the links by a hairline -->
    <div
      class="ml-auto flex items-center gap-0.5 rounded-lg bg-tint p-0.5 text-xs md:ml-0"
      role="group"
      aria-label="Display"
    >
      <button
        type="button"
        class="flex size-7 items-center justify-center rounded-md text-subtle transition-colors hover:bg-tint-strong hover:text-strong"
        title={themeLabel}
        aria-label={themeLabel}
        onclick={cycleTheme}><ThemeIcon size={15} /></button
      >
      <span class="mx-0.5 h-4 w-px bg-line" aria-hidden="true"></span>
      {#each ['en', 'vi'] as const as code (code)}
        <button
          type="button"
          class="h-7 rounded-md px-2 font-medium uppercase transition-colors {lang.code === code
            ? 'bg-page text-strong shadow-sm'
            : 'text-subtle hover:text-fg'}"
          aria-pressed={lang.code === code}
          aria-label={code === 'en' ? 'English' : 'Tiếng Việt'}
          onclick={() => setLang(code)}>{code}</button
        >
      {/each}
    </div>
  </nav>
</header>
