<script lang="ts">
  import { browser } from '#imports';
  import { i18n } from '#i18n';
  import { panel, toPage } from './store.svelte';

  let btn: HTMLButtonElement | undefined = $state();
  $effect(() => {
    btn?.scrollIntoView?.({ block: 'nearest' });
    btn?.focus();
  });

  /** Same flow as the cross-origin CSS grant; onAdded in the background reloads the frames. */
  async function grant() {
    // permissions.request must be the first call in the click
    const ok = await browser.permissions.request({ origins: ['<all_urls>'] }).catch(() => false);
    if (!ok) return;
    panel.hostGrant = false;
    await toPage('enable_cross_origin_styles');
  }
</script>

<div data-host-grant class="m-2 flex items-center gap-2 rounded-md bg-accent/10 p-2 text-xs">
  <span class="flex-1"
    >{i18n.t('responsive.frameBlockedBody', { br: '\n', grant: '' }).split('\n')[0]}</span
  >
  <button
    bind:this={btn}
    type="button"
    class="font-medium text-accent hover:underline"
    onclick={grant}>{i18n.t('responsive.frameBlockedGrant')}</button
  >
</div>
