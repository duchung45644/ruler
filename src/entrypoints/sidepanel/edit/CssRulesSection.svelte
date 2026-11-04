<script lang="ts">
  import { i18n } from '#i18n';
  import type { ElementDetails } from '../../../lib/element/types';
  import Section from '../Section.svelte';
  import CssEditor from './CssEditor.svelte';
  import { edit } from './edit-store.svelte';

  let { el }: { el: ElementDetails } = $props();
</script>

{#if edit.payload}
  <Section id="cssRules" title={i18n.t('edit.css')}>
    <div class="-mx-3 -mb-3"><CssEditor {el} payload={edit.payload} /></div>
  </Section>
{/if}
