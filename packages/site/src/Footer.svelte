<script lang="ts">
  import { t } from './lang.svelte';
</script>

<footer class="border-t border-line-soft">
  <div
    class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-subtle sm:flex-row sm:items-center sm:px-6"
  >
    <div class="flex items-center gap-2">
      <img src="./logo.svg" alt="" class="size-5" />
      <span class="text-fg">PixelLens</span>
      <span>· {t().footer.made}</span>
      <span class="text-subtle">{t().footer.version}</span>
    </div>
    <div class="flex gap-5 sm:ml-auto">
      <a class="hover:text-fg" href="./index.html">{t().footer.home}</a>
      <a class="hover:text-fg" href="./docs.html">{t().nav.docs}</a>
      <a class="hover:text-fg" href="./privacy.html">{t().nav.privacy}</a>
    </div>
  </div>
</footer>
