<script lang="ts">
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import PageIntro from './PageIntro.svelte';
  import { t } from './lang.svelte';
  import Audience from './sections/Audience.svelte';
  import Compare from './sections/Compare.svelte';
  import Keys from './sections/Keys.svelte';
  import Showcase from './sections/Showcase.svelte';
</script>

<Header />
<main>
  <PageIntro title={t().nav.features} lead={t().pages.features} />
  <div class="pt-20"><Showcase /></div>
  <Audience />
  <Compare />
  <Keys />
</main>
<Footer />
