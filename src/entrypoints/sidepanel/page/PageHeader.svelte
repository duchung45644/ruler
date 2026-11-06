<script lang="ts">
  import { i18n } from '#i18n';
  import RefreshCw from '@lucide/svelte/icons/refresh-cw';
  import { onDestroy, untrack } from 'svelte';
  import type { PageData } from '../../../lib/page/types';
  import { toPageData } from '../store.svelte';

  let { page }: { page: PageData | null } = $props();

  const short = $derived.by(() => {
    if (!page) return '';
    try {
      const u = new URL(page.url);
      return u.host + (u.pathname === '/' ? '' : u.pathname);
    } catch {
      return page.url;
    }
  });

  let spinning = $state(false);
  let started = 0;
  let minTimer: ReturnType<typeof setTimeout> | undefined;
  let maxTimer: ReturnType<typeof setTimeout> | undefined;
  const stop = () => {
    clearTimeout(minTimer);
    clearTimeout(maxTimer);
    spinning = false;
  };
  onDestroy(stop);

  function refresh() {
    stop();
    spinning = true;
    started = Date.now();
    maxTimer = setTimeout(stop, 5000);
    void toPageData('refresh_page_data');
  }

  $effect(() => {
    void page;
    untrack(() => {
      if (!spinning) return;
      clearTimeout(minTimer);
      minTimer = setTimeout(stop, Math.max(0, 600 - (Date.now() - started)));
    });
  });
</script>

<header class="flex items-start gap-2 border-b border-line px-3 py-2.5">
  <div class="min-w-0 flex-1">
    {#if page}
      <h1 class="truncate text-[13px] font-semibold" title={page.title} data-title>
        {page.title || i18n.t('page.untitled')}
      </h1>
      <a
        class="block truncate font-mono text-[10.5px] text-fg-muted hover:text-accent"
        href={page.url}
        target="_blank"
        rel="noopener"
        title={page.url}
        data-url>{short}</a
      >
    {/if}
  </div>
  <button
    type="button"
    class="grid size-6 shrink-0 place-items-center rounded-btn text-fg-muted hover:bg-line hover:text-fg"
    title={i18n.t('page.refresh')}
    aria-label={i18n.t('page.refresh')}
    data-refresh
    data-spinning={spinning || undefined}
    onclick={refresh}
  >
    <RefreshCw class="size-3.5 {spinning ? 'animate-spin' : ''}" />
  </button>
</header>
