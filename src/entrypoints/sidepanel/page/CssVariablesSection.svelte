<script lang="ts">
  import { i18n } from '#i18n';
  import Section from '../Section.svelte';
  import CssVarList from './CssVarList.svelte';
</script>

<!-- the list mounts (and reads the page) only while the section is open -->
<Section id="cssVariables" title={i18n.t('page.cssVariables')}>
  <CssVarList />
</Section>
