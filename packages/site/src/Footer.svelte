<script lang="ts">
  import { REPO_URL } from './i18n';
  import { t } from './lang.svelte';
</script>

<footer class="border-t border-white/5">
  <div
    class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-zinc-500 sm:flex-row sm:items-center sm:px-6"
  >
    <div class="flex items-center gap-2">
      <img src="./logo.svg" alt="" class="size-5" />
      <span class="text-zinc-300">PixelLens</span>
      <span>· {t().footer.made}</span>
    </div>
    <div class="flex gap-5 sm:ml-auto">
      <a class="hover:text-zinc-300" href="./index.html">{t().footer.home}</a>
      <a class="hover:text-zinc-300" href="./privacy.html">{t().nav.privacy}</a>
      <a class="hover:text-zinc-300" href={REPO_URL}>GitHub</a>
    </div>
  </div>
</footer>
