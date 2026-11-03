<script lang="ts">
  import { i18n } from '#i18n';
  import type { Animation, Transition } from '../../../lib/element/types';
  import Section from '../Section.svelte';
  import EasingCurve from './EasingCurve.svelte';

  let { animations, transitions }: { animations: Animation[]; transitions: Transition[] } =
    $props();
  const pct = (o: number) => `${Math.round(o * 100)}%`;
</script>

{#snippet item(title: string, easing: string, rows: [string, string][], extra?: string[])}
  <div class="flex gap-3 rounded-btn border border-line p-2" data-motion={title}>
    <EasingCurve {easing} />
    <div class="min-w-0 flex-1">
      <div class="truncate font-mono font-semibold">{title}</div>
      <dl class="mt-1 grid grid-cols-[auto_1fr] gap-x-2 font-mono text-[10.5px]">
        {#each rows as [k, v] (k)}
          <dt class="text-fg-muted">{k}</dt>
          <dd class="truncate text-right" title={v}>{v}</dd>
        {/each}
      </dl>
      {#if extra?.length}
        <div class="mt-1 flex flex-wrap gap-1 font-mono text-[10px] text-fg-muted">
          {#each extra as e, n (n)}<span class="rounded bg-line px-1">{e}</span>{/each}
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#if animations.length}
  <Section
    id="animations"
    title={i18n.t(animations.length === 1 ? 'panel.animation' : 'panel.animations')}
    count={animations.length}
  >
    <div class="flex flex-col gap-1.5">
      {#each animations as a, n (n)}
        {@render item(
          a.name,
          a.timingFunction,
          [
            ['duration', a.duration],
            ['delay', a.delay],
            ['iteration', a.iterationCount],
            ['timing', a.timingFunction],
          ],
          a.keyframes.map((k) => pct(k.offset)),
        )}
      {/each}
    </div>
  </Section>
{/if}
{#if transitions.length}
  <Section
    id="transitions"
    title={i18n.t(transitions.length === 1 ? 'panel.transition' : 'panel.transitions')}
    count={transitions.length}
  >
    <div class="flex flex-col gap-1.5">
      {#each transitions as t, n (n)}
        {@render item(t.property, t.timingFunction, [
          ['duration', t.duration],
          ['delay', t.delay],
          ['timing', t.timingFunction],
        ])}
      {/each}
    </div>
  </Section>
{/if}
