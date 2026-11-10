<script lang="ts">
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import { render } from './markdown';
  import { t } from './lang.svelte';
  import policy from '../../../docs/privacy-policy.md?raw';

  const doc = render(policy);
</script>

<Header />

<main class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
  <p class="text-sm text-indigo-300">{t().nav.privacy}</p>
  <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{doc.title}</h1>
  <article class="doc mt-8">
    {@html doc.html}
  </article>
</main>

<Footer />
