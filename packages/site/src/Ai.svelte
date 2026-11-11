<script lang="ts">
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import PageIntro from './PageIntro.svelte';
  import { t } from './lang.svelte';
  import Ai from './sections/Ai.svelte';
</script>

<Header />
<main>
  <PageIntro title={t().nav.ai} lead={t().pages.ai} />
  <Ai />
</main>
<Footer />
