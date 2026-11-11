<script lang="ts">
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import PageIntro from './PageIntro.svelte';
  import { t } from './lang.svelte';
  import Faq from './sections/Faq.svelte';
  import PrivacyBand from './sections/PrivacyBand.svelte';
</script>

<Header />
<main>
  <PageIntro title={t().faq.title} lead={t().pages.faq} />
  <div class="pt-20"><Faq /></div>
  <PrivacyBand />
</main>
<Footer />
