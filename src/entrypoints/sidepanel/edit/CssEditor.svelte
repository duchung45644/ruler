<script lang="ts">
  import { browser } from '#imports';
  import { i18n } from '#i18n';
  import Plus from '@lucide/svelte/icons/plus';
  import { declKey, inheritedProperty, overriddenDecls } from '../../../lib/css/matched';
  import type { EditableRule, RulePayload } from '../../../lib/edit/types';
  import type { ElementDetails } from '../../../lib/element/types';
  import { sendToBackground } from '../../../lib/messaging';
  import { toPage } from '../store.svelte';
  import ClassInput from './ClassInput.svelte';
  import DeclEditor, { type Mark } from './DeclEditor.svelte';
  import RuleBlock from './RuleBlock.svelte';
  import { command, edit, refreshPayload } from './edit-store.svelte';

  let { el, payload }: { el: ElementDetails; payload: RulePayload } = $props();

  const live = (r: EditableRule) =>
    r.wrappers.some((w) => w in edit.mediaActive)
      ? r.wrappers.every((w) => edit.mediaActive[w] ?? true)
      : r.mediaActive;
  const rules = $derived(payload.rules.map((r) => ({ ...r, mediaActive: live(r) })));
  const lost = $derived(overriddenDecls(rules));
  const inline = $derived(new Map(payload.inline.map((d) => [d.property, d])));

  let ghosts = $state(new Set<string>());
  let hostPermission = $state(true);
  $effect(() => {
    void payload.paySeq;
    void toPage('cascade_ghost_probe').then((r) => (ghosts = new Set(Array.isArray(r) ? r : [])));
  });
  $effect(() => {
    if (payload.crossOriginMissing > 0 || ghosts.size)
      void sendToBackground('has_host_permission').then(
        (ok) => (hostPermission = ok),
        () => (hostPermission = false),
      );
  });

  async function grant() {
    // permissions.request must be the first call in the click
    const ok = await browser.permissions.request({ origins: ['<all_urls>'] }).catch(() => false);
    if (!ok) return;
    hostPermission = true;
    await toPage('enable_cross_origin_styles');
  }

  const overriddenBy = (sel: string): Mark => ({
    kind: 'overridden',
    title: i18n.t('edit.overriddenBy', [sel]),
  });
  const winner = (prop: string) =>
    rules.find(
      (r, i) =>
        r.mediaActive &&
        r.declarations.some((d) => d.property === prop) &&
        !lost.has(declKey(i, prop)),
    );

  const ruleMark = (i: number) => (prop: string) => {
    const r = rules[i]!;
    const own = r.declarations.find((d) => d.property === prop);
    const style = inline.get(prop);
    if (style && (style.important || !own?.important)) return overriddenBy('element.style');
    if (lost.has(declKey(i, prop))) return overriddenBy(winner(prop)?.selector ?? '');
    if (ghosts.has(prop))
      return {
        kind: 'hidden' as const,
        title: i18n.t(hostPermission ? 'edit.overriddenHidden' : 'edit.overriddenHiddenGrant'),
      };
    return null;
  };
  const inlineMark = (prop: string) => {
    if (inline.get(prop)?.important) return null;
    const imp = rules.find(
      (r) => r.mediaActive && r.declarations.some((d) => d.property === prop && d.important),
    );
    return imp ? overriddenBy(imp.selector) : null;
  };
  const inheritedMark = (prop: string): Mark | null => {
    if (!inheritedProperty(prop))
      return { kind: 'not-inherited', title: i18n.t('edit.notInherited') };
    if (inline.has(prop)) return overriddenBy('element.style');
    const own = winner(prop);
    return own ? overriddenBy(own.selector) : null;
  };

  const vars = $derived([
    ...new Set(
      [...payload.rules, ...edit.inherited]
        .flatMap((r) => r.declarations)
        .concat(payload.inline)
        .map((d) => d.property)
        .filter((p) => p.startsWith('--')),
    ),
  ]);

  // rules keep their cascade order; each run of wrappers gets its own heading (6.40)
  const groups = $derived.by(() => {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity -- built fresh inside the derived
    const out = new Map<string, { wrappers: string[]; items: number[] }>([
      ['', { wrappers: [], items: [] }],
    ]);
    rules.forEach((r, i) => {
      const k = r.wrappers.join(' ');
      if (!out.has(k)) out.set(k, { wrappers: r.wrappers, items: [] });
      out.get(k)!.items.push(i);
    });
    return [...out.values()];
  });
  const mediaOn = (wrappers: string[]) =>
    wrappers.every((w) => !w.startsWith('@media ') || (edit.mediaActive[w] ?? true));

  async function addRule() {
    const r = await command('rule_add');
    if (r?.ok) await refreshPayload();
  }
</script>

{#snippet heading(label: string, title?: string, dim = false)}
  <h3
    class="mt-3 mb-1.5 flex items-center gap-1 truncate text-[10px] font-semibold tracking-wide text-fg-muted uppercase first:mt-0"
    class:opacity-50={dim}
    {title}
  >
    {label}
  </h3>
{/snippet}

<div class="flex flex-col gap-1.5 px-3 py-2.5" data-css-editor>
  {#if payload.crossOriginMissing > 0 && !hostPermission}
    <div
      class="flex items-center gap-2 rounded-btn border border-amber-500/30 bg-amber-500/10 px-2 py-1.5"
      data-cross-origin
    >
      <span class="flex-1">{i18n.t('edit.crossOriginMissing')}</span>
      <button type="button" class="font-medium text-accent hover:underline" onclick={grant}
        >{i18n.t('panel.enableCrossOrigin')}</button
      >
    </div>
  {/if}

  {#key el.id}<ClassInput id={el.id} />{/key}

  {@render heading(i18n.t('edit.effectiveStyles'))}
  <div class="rounded-btn border border-dashed border-line-strong py-1.5 pr-2" data-inline>
    <div class="mb-0.5 pl-3 font-mono text-[11px] text-fg-muted">element.style</div>
    {#key payload.paySeq}
      <DeclEditor
        decls={payload.inline}
        {vars}
        mark={inlineMark}
        oncommit={(text) => void command('inline_style_edit', el.id, text)}
      />
    {/key}
  </div>

  {#each groups as g (g.wrappers.join(' '))}
    {#if g.wrappers.length}
      {@render heading(g.wrappers.join(' '), g.wrappers.join(' '), !mediaOn(g.wrappers))}
    {:else}
      <div class="mt-3 mb-1.5 flex items-center">
        <h3 class="flex-1 text-[10px] font-semibold tracking-wide text-fg-muted uppercase">
          {i18n.t('edit.rules')}
        </h3>
        <button
          type="button"
          class="flex items-center gap-1 rounded-btn px-1.5 py-0.5 text-fg-muted hover:bg-line hover:text-fg"
          data-action="rule_add"
          onclick={addRule}><Plus class="size-3.5" />{i18n.t('edit.addRule')}</button
        >
      </div>
    {/if}
    {#each g.items as i (`${payload.paySeq}:${i}`)}
      <RuleBlock rule={payload.rules[i]!} {vars} mark={ruleMark(i)} dim={!rules[i]!.mediaActive} />
    {/each}
  {/each}

  {#each edit.inherited as r, i (`${payload.paySeq}:i${i}`)}
    {@render heading(i18n.t('edit.inheritedFrom', [r.selector]), r.selector)}
    <RuleBlock rule={r} {vars} mark={inheritedMark} />
  {/each}
</div>
