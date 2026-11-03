<script lang="ts">
  import { i18n } from '#i18n';
  import type { PageMeta } from '../../../lib/page/types';
  import CopyButton from '../element/CopyButton.svelte';
  import Section from '../Section.svelte';

  let { meta }: { meta: PageMeta['meta'] } = $props();

  /** One tag: [kind, attrName?, attrValue?, content]; kind decides the HTML shape. */
  type Line =
    | { tag: 'title'; value: string }
    | { tag: 'link'; value: string }
    | { tag: 'meta'; attr: 'name' | 'property'; key: string; value: string };

  const groups = $derived.by(() => {
    const seo: Line[] = [];
    const s = meta.seo;
    if (s.title) seo.push({ tag: 'title', value: s.title });
    for (const k of ['description', 'robots', 'viewport'] as const)
      if (s[k]) seo.push({ tag: 'meta', attr: 'name', key: k, value: s[k] });
    if (s.canonical) seo.push({ tag: 'link', value: s.canonical });
    const tags = (r: Record<string, string | null>, attr: 'name' | 'property'): Line[] =>
      Object.entries(r).flatMap(([key, value]) =>
        value ? [{ tag: 'meta' as const, attr, key, value }] : [],
      );
    return [
      { id: 'seo', label: i18n.t('page.metaSeo'), lines: seo },
      { id: 'og', label: i18n.t('page.metaOg'), lines: tags(meta.openGraph, 'property') },
      { id: 'twitter', label: i18n.t('page.metaTwitter'), lines: tags(meta.twitter, 'name') },
    ].filter((g) => g.lines.length);
  });

  const esc = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const html = (l: Line) =>
    l.tag === 'title'
      ? `<title>${l.value.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>`
      : l.tag === 'link'
        ? `<link rel="canonical" href="${esc(l.value)}">`
        : `<meta ${l.attr}="${l.key}" content="${esc(l.value)}">`;
</script>

{#snippet attr(name: string, value: string)}
  <span class="ml-[1ch] text-sky-300 light:text-sky-700">{name}</span>=<span
    class="text-amber-300 light:text-amber-700">"{value}"</span
  >
{/snippet}

{#if groups.length}
  <Section id="metaTags" title={i18n.t('page.metaTags')}>
    <div class="flex flex-col gap-2.5">
      {#each groups as g (g.id)}
        <div data-meta-group={g.id}>
          <div class="mb-1 flex items-center">
            <span class="flex-1 text-[10.5px] font-semibold text-fg-muted uppercase">{g.label}</span
            >
            <CopyButton text={() => g.lines.map(html).join('\n')} />
          </div>
          <ol
            class="overflow-x-auto rounded-btn border border-line bg-line/30 py-1 font-mono text-[10.5px] leading-[1.6]"
          >
            {#each g.lines as l, i (i)}
              <li class="flex">
                <span class="w-7 shrink-0 pr-2 text-right text-fg-muted/60 select-none tabular-nums"
                  >{i + 1}</span
                >
                <code class="pr-2 break-all">
                  <span class="text-rose-300 light:text-rose-600">&lt;{l.tag}</span
                  >{#if l.tag === 'title'}<span class="text-rose-300 light:text-rose-600">&gt;</span
                    >{l.value}<span class="text-rose-300 light:text-rose-600">&lt;/title&gt;</span
                    >{:else if l.tag === 'link'}{@render attr('rel', 'canonical')}{@render attr(
                      'href',
                      l.value,
                    )}<span class="text-rose-300 light:text-rose-600">&gt;</span
                    >{:else}{@render attr(l.attr, l.key)}{@render attr('content', l.value)}<span
                      class="text-rose-300 light:text-rose-600">&gt;</span
                    >{/if}
                </code>
              </li>
            {/each}
          </ol>
        </div>
      {/each}
    </div>
  </Section>
{/if}
