<script lang="ts">
  import { lang, setLang, t } from './lang.svelte';
</script>

<header class="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/80 backdrop-blur">
  <nav class="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
    <a href="./index.html" class="flex items-center gap-2.5 font-semibold text-white">
      <img src="./logo.svg" alt="" class="size-7" />
      PixelLens
    </a>
    <div class="ml-auto hidden items-center gap-6 text-sm text-zinc-400 md:flex">
      <a class="hover:text-white" href="./index.html#features">{t().nav.features}</a>
      <a class="hover:text-white" href="./index.html#ai">{t().nav.ai}</a>
      <a class="hover:text-white" href="./index.html#keys">{t().nav.keys}</a>
      <a class="hover:text-white" href="./privacy.html">{t().nav.privacy}</a>
    </div>
    <div
      class="ml-auto flex rounded-lg border border-white/10 p-0.5 text-xs md:ml-0"
      role="group"
      aria-label="Language"
    >
      {#each ['en', 'vi'] as const as code (code)}
        <button
          type="button"
          class="rounded-md px-2.5 py-1 font-medium uppercase transition-colors {lang.code === code
            ? 'bg-white/10 text-white'
            : 'text-zinc-500 hover:text-zinc-300'}"
          aria-pressed={lang.code === code}
          onclick={() => setLang(code)}>{code}</button
        >
      {/each}
    </div>
  </nav>
</header>
