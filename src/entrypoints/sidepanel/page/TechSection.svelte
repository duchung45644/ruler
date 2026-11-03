<script lang="ts">
  import { browser } from '#imports';
  import { i18n } from '#i18n';
  import type { Technology } from '../../../lib/page/types';
  import Section from '../Section.svelte';

  let { techs }: { techs: Technology[] } = $props();
  let failed = $state<Record<string, true>>({});
  const href = (t: Technology) =>
    t.url ?? `https://www.google.com/search?q=${encodeURIComponent(t.name)}`;
</script>

<Section
  id="technologies"
  title={i18n.t(techs.length === 1 ? 'page.technology' : 'page.technologies')}
  count={techs.length}
>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-1.5">
    {#each techs as t (t.id)}
      <a
        class="flex min-w-0 items-center gap-2 rounded-btn border border-line px-2 py-1.5 hover:border-line-strong"
        href={href(t)}
        target="_blank"
        rel="noopener"
        title={t.version ? `${t.name} ${t.version}` : t.name}
        data-tech={t.id}
      >
        {#if t.icon && !failed[t.id]}
          <img
            class="size-4 shrink-0 object-contain"
            src={browser.runtime.getURL(`/logos/${t.icon}.svg` as '/logos/react.svg')}
            alt=""
            onerror={() => (failed[t.id] = true)}
          />
        {:else}
          <span
            class="grid size-4 shrink-0 place-items-center rounded bg-line text-[10px] font-semibold"
            data-initial>{t.name.charAt(0).toUpperCase()}</span
          >
        {/if}
        <span class="truncate">{t.name}</span>
        {#if t.version}
          <span class="ml-auto shrink-0 font-mono text-[10px] text-fg-muted">{t.version}</span>
        {/if}
      </a>
    {/each}
  </div>
</Section>
