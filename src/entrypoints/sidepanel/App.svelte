<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import { forwardKey } from '../../lib/panel-keys';
  import EmptyElement from './EmptyElement.svelte';
  import TabBar from './TabBar.svelte';
  import { panel, startPanel, takePendingScroll, toPage } from './store.svelte';

  const ac = new AbortController();
  onMount(() => {
    void startPanel(ac.signal).then(async () => {
      const top = takePendingScroll();
      if (top === null) return;
      await tick();
      requestAnimationFrame(() => {
        (document.scrollingElement ?? document.documentElement).scrollTop = top;
      });
    });
  });
  onDestroy(() => ac.abort());

  // 7.10: page weight streams only while the Page tab is on screen (legacy Ti)
  const weighing = $derived(panel.selectedTab === 'page' && panel.visible && panel.tabId !== null);
  $effect(() => {
    if (!weighing) return;
    void toPage('page_weight_subscribe');
    return () => void toPage('page_weight_unsubscribe');
  });

  function onkeydown(e: KeyboardEvent) {
    const key = forwardKey(e);
    if (key === null) return;
    e.preventDefault();
    void toPage('keyboard_shortcut', key);
  }
</script>

<svelte:window {onkeydown} />

<TabBar />
<main>
  {#if panel.selectedTab === 'element'}
    {#if panel.element}
      <div class="p-3 font-mono" data-element>{panel.element.name}</div>
    {:else}
      <EmptyElement />
    {/if}
  {:else}
    <div class="p-3" data-page>{panel.page?.title ?? ''}</div>
  {/if}
</main>
