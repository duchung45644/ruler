<script lang="ts">
  import ChevronLeft from '@lucide/svelte/icons/chevron-left';
  import ChevronRight from '@lucide/svelte/icons/chevron-right';
  import Menu from '@lucide/svelte/icons/menu';
  import Search from '@lucide/svelte/icons/search';
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import { lang } from './lang.svelte';
  import { render, slugify, type Rendered } from './markdown';
  import order from '../docs/index.json';

  /** One chunk per language, loaded when that language is shown. */
  const LOADERS = {
    en: () => import('./docs-en'),
    vi: () => import('./docs-vi'),
  } as const;
  let texts = $state<Partial<Record<'en' | 'vi', Record<string, string>>>>({});
  $effect(() => {
    const code = lang.code;
    if (!texts[code]) void LOADERS[code]().then((m) => (texts[code] = m.default));
  });

  type Entry = { slug: string; group: string };
  const entries = order as Entry[];

  /** `page.md#x` → `#page/x`; `privacy-policy` → the privacy page; external links stay. */
  const link = (href: string) => {
    if (/^https?:/.test(href)) return href;
    if (href.startsWith('privacy-policy')) return './privacy.html';
    const [file, anchor] = href.split('#');
    if (!file) return `#${current}/${anchor}`;
    return `#${file.replace(/\.md$/, '')}${anchor ? `/${anchor}` : ''}`;
  };

  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- cache, never rendered directly
  const cache = new Map<string, Rendered>();
  function page(code: 'en' | 'vi', slug: string): Rendered {
    const md = texts[code]?.[slug];
    if (md === undefined) return { title: '', html: '', headings: [] }; // still loading
    const key = `${code}/${slug}`;
    let r = cache.get(key);
    if (!r) cache.set(key, (r = render(md, link)));
    return r;
  }

  const parseHash = () => {
    const [slug, anchor] = decodeURIComponent(location.hash.slice(1)).split('/');
    return {
      slug: entries.some((e) => e.slug === slug) ? slug : entries[0].slug,
      anchor: anchor ?? '',
    };
  };

  let current = $state(parseHash().slug);
  let anchor = $state(parseHash().anchor);
  let query = $state('');
  let navOpen = $state(false);
  let article: HTMLElement | undefined = $state();

  const doc = $derived(page(lang.code, current));
  const index = $derived(entries.findIndex((e) => e.slug === current));
  const prev = $derived(entries[index - 1]);
  const next = $derived(entries[index + 1]);

  const GROUPS_VI: Record<string, string> = {
    Basics: 'Cơ bản',
    Tools: 'Công cụ',
    'Side panel and editing': 'Side panel và chỉnh sửa',
    'More tools': 'Công cụ khác',
    'AI agents': 'AI agent',
    Reference: 'Tham khảo',
  };
  const groupName = (g: string) => (lang.code === 'vi' ? (GROUPS_VI[g] ?? g) : g);

  /** Sidebar: pages grouped, filtered by title or heading text (accent-insensitive). */
  const groups = $derived.by(() => {
    const q = slugify(query);
    const out: { name: string; items: { slug: string; title: string; hits: string[] }[] }[] = [];
    for (const e of entries) {
      const p = page(lang.code, e.slug);
      const hits = q ? p.headings.filter((h) => slugify(h.text).includes(q)).map((h) => h.id) : [];
      if (q && !slugify(p.title).includes(q) && !hits.length) continue;
      let g = out.find((x) => x.name === e.group);
      if (!g) out.push((g = { name: e.group, items: [] }));
      g.items.push({ slug: e.slug, title: p.title, hits });
    }
    return out;
  });

  const label = $derived(
    lang.code === 'vi'
      ? {
          search: 'Tìm trong tài liệu',
          onPage: 'Trên trang này',
          prev: 'Trước',
          next: 'Tiếp',
          menu: 'Mục lục',
          none: 'Không tìm thấy',
        }
      : {
          search: 'Search the docs',
          onPage: 'On this page',
          prev: 'Previous',
          next: 'Next',
          menu: 'Contents',
          none: 'No results',
        },
  );

  $effect(() => {
    const onHash = () => {
      const h = parseHash();
      current = h.slug;
      anchor = h.anchor;
      navOpen = false;
    };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  });

  // scroll to the anchor (or top) after the page renders
  $effect(() => {
    void doc;
    const a = anchor;
    queueMicrotask(() => {
      const el = a ? article?.querySelector(`#${CSS.escape(a)}`) : null;
      if (el) el.scrollIntoView();
      else scrollTo({ top: 0 });
    });
  });

  $effect(() => {
    document.title = `${doc.title} · PixelLens Docs`;
  });

  /** Heading links inside the article become `#page/anchor` routes. */
  const headingHref = (id: string) => `#${current}/${id}`;
</script>

<Header />

<div class="mx-auto flex max-w-7xl gap-10 px-4 sm:px-6">
  <!-- sidebar -->
  <aside
    class="fixed inset-x-0 top-16 bottom-0 z-10 overflow-y-auto bg-page px-4 pt-6 pb-10 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:w-60 lg:shrink-0 lg:bg-transparent lg:px-0 {navOpen
      ? 'block'
      : 'hidden'}"
  >
    <label class="relative block">
      <Search size={15} class="pointer-events-none absolute top-2.5 left-3 text-subtle" />
      <input
        bind:value={query}
        type="search"
        placeholder={label.search}
        class="w-full rounded-lg border border-line bg-surface py-2 pr-3 pl-9 text-sm text-fg placeholder:text-subtle focus:border-indigo-400/50 focus:outline-none"
      />
    </label>
    <nav class="mt-6 space-y-6 text-sm">
      {#each groups as g (g.name)}
        <div>
          <h3 class="mb-2 text-xs font-medium tracking-wide text-subtle uppercase">
            {groupName(g.name)}
          </h3>
          <ul class="space-y-0.5">
            {#each g.items as item (item.slug)}
              <li>
                <a
                  href="#{item.slug}"
                  class="block rounded-md px-2.5 py-1.5 transition-colors {item.slug === current
                    ? 'bg-indigo-500/10 font-medium text-accent-fg-strong'
                    : 'text-muted hover:text-fg'}">{item.title}</a
                >
                {#if item.hits.length}
                  <ul class="mt-0.5 ml-3 border-l border-line">
                    {#each item.hits.slice(0, 5) as id (id)}
                      {@const h = page(lang.code, item.slug).headings.find((x) => x.id === id)}
                      <li>
                        <a
                          href="#{item.slug}/{id}"
                          class="block px-3 py-1 text-xs text-subtle hover:text-fg">{h?.text}</a
                        >
                      </li>
                    {/each}
                  </ul>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {:else}
        <p class="text-subtle">{label.none}</p>
      {/each}
    </nav>
  </aside>

  <!-- article -->
  <main class="min-w-0 flex-1 py-10 lg:py-14">
    <button
      type="button"
      class="mb-6 flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm text-fg lg:hidden"
      onclick={() => (navOpen = !navOpen)}
      aria-expanded={navOpen}
    >
      <Menu size={16} />
      {label.menu}
    </button>
    <p class="text-sm text-accent-fg">{groupName(entries[index].group)}</p>
    <h1 class="mt-2 text-3xl font-semibold tracking-tight text-strong sm:text-4xl">{doc.title}</h1>
    <article bind:this={article} class="doc mt-8">
      {@html doc.html}
    </article>

    <nav class="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
      {#if prev}
        <a
          href="#{prev.slug}"
          class="group rounded-xl border border-line p-4 hover:border-line-strong"
        >
          <span class="flex items-center gap-1 text-xs text-subtle"
            ><ChevronLeft size={14} />{label.prev}</span
          >
          <span class="mt-1 block font-medium text-fg group-hover:text-strong"
            >{page(lang.code, prev.slug).title}</span
          >
        </a>
      {:else}
        <span></span>
      {/if}
      {#if next}
        <a
          href="#{next.slug}"
          class="group rounded-xl border border-line p-4 text-right hover:border-line-strong"
        >
          <span class="flex items-center justify-end gap-1 text-xs text-subtle"
            >{label.next}<ChevronRight size={14} /></span
          >
          <span class="mt-1 block font-medium text-fg group-hover:text-strong"
            >{page(lang.code, next.slug).title}</span
          >
        </a>
      {/if}
    </nav>
  </main>

  <!-- on this page -->
  <aside
    class="sticky top-16 hidden h-[calc(100vh-4rem)] w-52 shrink-0 overflow-y-auto py-14 xl:block"
  >
    {#if doc.headings.length}
      <h3 class="text-xs font-medium tracking-wide text-subtle uppercase">{label.onPage}</h3>
      <ul class="mt-3 space-y-1.5 text-sm">
        {#each doc.headings as h (h.id)}
          <li class={h.level === 3 ? 'pl-3' : ''}>
            <a href={headingHref(h.id)} class="text-muted hover:text-fg">{h.text}</a>
          </li>
        {/each}
      </ul>
    {/if}
  </aside>
</div>

<Footer />
