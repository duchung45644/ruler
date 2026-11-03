<script lang="ts">
  import { i18n } from '#i18n';
  import Section from '../Section.svelte';
  import CopyButton from './CopyButton.svelte';

  let { text }: { text: string } = $props();
</script>

<Section id="textContent" title={i18n.t('panel.textContent')}>
  {#snippet actions()}<CopyButton {text} />{/snippet}
  <p
    class="max-h-40 overflow-auto rounded-btn border border-line px-2.5 py-2 leading-relaxed break-words whitespace-pre-wrap"
    data-text
  >
    {text}
  </p>
</Section>
