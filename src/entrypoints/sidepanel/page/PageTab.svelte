<script lang="ts">
  import { i18n } from '#i18n';
  import { panel } from '../store.svelte';
  import MetaTags from './MetaTags.svelte';
  import PageHeader from './PageHeader.svelte';
  import PageWeight from './PageWeight.svelte';
  import SeoSection from './SeoSection.svelte';
  import SocialPreview from './SocialPreview.svelte';
  import TechSection from './TechSection.svelte';
</script>

<PageHeader page={panel.page} />
{#if panel.page}
  {@const page = panel.page}
  {#if page.ogImage}<SocialPreview {page} />{/if}
  <MetaTags meta={page.meta} />
  {#if panel.technologies?.length}<TechSection techs={panel.technologies} />{/if}
  {#if page.seoIssues.length}<SeoSection issues={page.seoIssues} />{/if}
  {#if panel.weight ?? page.pageWeight}
    <PageWeight weight={(panel.weight ?? page.pageWeight)!} />
  {/if}
{:else}
  <p class="px-3 py-8 text-center text-fg-muted" data-no-info>{i18n.t('page.noInfo')}</p>
{/if}
