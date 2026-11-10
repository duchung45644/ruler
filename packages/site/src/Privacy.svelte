<!-- the {@html} blocks render our own policy file after esc(): no outside input -->
<script lang="ts">
  import Footer from './Footer.svelte';
  import Header from './Header.svelte';
  import { t } from './lang.svelte';
  import policy from '../../../docs/privacy-policy.md?raw';

  /** Tiny renderer for our own policy file: headings, paragraphs, bullet lists, one table, inline code. */
  type Block = { kind: 'h1' | 'h2' | 'p' | 'ul' | 'table'; lines: string[] };

  function blocks(md: string): Block[] {
    const out: Block[] = [];
    for (const chunk of md.trim().split(/\n\s*\n/)) {
      const lines = chunk.split('\n');
      if (lines[0].startsWith('# ')) out.push({ kind: 'h1', lines: [lines[0].slice(2)] });
      else if (lines[0].startsWith('## ')) out.push({ kind: 'h2', lines: [lines[0].slice(3)] });
      else if (lines[0].startsWith('- '))
        out.push({ kind: 'ul', lines: lines.map((l) => l.slice(2)) });
      else if (lines[0].startsWith('|'))
        out.push({ kind: 'table', lines: lines.filter((l) => !/^\|\s*-/.test(l)) });
      else out.push({ kind: 'p', lines: [lines.join(' ')] });
    }
    return out;
  }

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s: string) =>
    esc(s)
      .replace(
        /`([^`]+)`/g,
        '<code class="rounded bg-white/5 px-1 py-0.5 font-mono text-[0.9em] text-zinc-200">$1</code>',
      )
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-zinc-200">$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');
  const cells = (row: string) =>
    row
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());

  const doc = blocks(policy);
</script>

<Header />

<main class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
  <p class="text-sm text-indigo-300">{t().nav.privacy}</p>
  {#each doc as b, i (i)}
    {#if b.kind === 'h1'}
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {b.lines[0]}
      </h1>
    {:else if b.kind === 'h2'}
      <h2 class="mt-12 text-xl font-semibold text-white">{b.lines[0]}</h2>
    {:else if b.kind === 'ul'}
      <ul class="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-zinc-400 marker:text-zinc-600">
        {#each b.lines as line, j (j)}<li>
            {@html inline(line)}
          </li>{/each}
      </ul>
    {:else if b.kind === 'table'}
      <div class="mt-4 overflow-x-auto rounded-xl border border-white/10">
        <table class="w-full text-left text-sm">
          <thead class="bg-white/5 text-zinc-300">
            <tr
              >{#each cells(b.lines[0]) as c, j (j)}<th class="px-4 py-2.5 font-medium"
                  >{@html inline(c)}</th
                >{/each}</tr
            >
          </thead>
          <tbody class="divide-y divide-white/5 text-zinc-400">
            {#each b.lines.slice(1) as row, j (j)}
              <tr
                >{#each cells(row) as c, k (k)}<td class="px-4 py-2.5 align-top"
                    >{@html inline(c)}</td
                  >{/each}</tr
              >
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p class="mt-4 leading-relaxed text-zinc-400">
        {@html inline(b.lines[0])}
      </p>
    {/if}
  {/each}
</main>

<Footer />
