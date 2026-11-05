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

  // DevTools-style filter: a rule stays when its selector or one of its properties matches
  let filter = $state('');
  let showClasses = $state(false);
  const matches = (r: { selector: string; declarations: { property: string }[] }) => {
    const q = filter.trim().toLowerCase();
    return (
      !q ||
      r.selector.toLowerCase().includes(q) ||
      r.declarations.some((d) => d.property.toLowerCase().includes(q))
    );
  };
  const mediaOn = (wrappers: string[]) =>
    wrappers.every((w) => !w.startsWith('@media ') || (edit.mediaActive[w] ?? true));

  async function addRule() {
    const r = await command('rule_add');
    if (r?.ok) await refreshPayload();
  }
</script>

<div class="flex flex-col" data-css-editor>
  <div class="flex items-center gap-1 border-b border-line px-2 py-1">
    <input
      class="h-6 min-w-0 flex-1 rounded-sm bg-transparent px-1.5 font-mono text-[11px] outline-none placeholder:text-fg-muted focus:bg-line"
      placeholder={i18n.t('edit.filter')}
      bind:value={filter}
      spellcheck="false"
      data-filter
    />
    <button
      type="button"
      class="h-6 rounded-sm px-1.5 font-mono text-[11px] text-fg-muted hover:bg-line hover:text-fg"
      class:bg-line={showClasses}
      class:text-fg={showClasses}
      title={i18n.t('edit.showClasses')}
      aria-pressed={showClasses}
      data-action="toggle_classes"
      onclick={() => (showClasses = !showClasses)}>.cls</button
    >
    <button
      type="button"
      class="grid size-6 place-items-center rounded-sm text-fg-muted hover:bg-line hover:text-fg"
      title={i18n.t('edit.addRule')}
      aria-label={i18n.t('edit.addRule')}
      data-action="rule_add"
      onclick={addRule}><Plus class="size-3.5" /></button
    >
  </div>

  {#if payload.crossOriginMissing > 0 && !hostPermission}
    <div
      class="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-2 py-1.5"
      data-cross-origin
    >
      <span class="flex-1">{i18n.t('edit.crossOriginMissing')}</span>
      <button type="button" class="font-medium text-accent hover:underline" onclick={grant}
        >{i18n.t('panel.enableCrossOrigin')}</button
      >
    </div>
  {/if}

  {#if showClasses}
    <div class="border-b border-line px-2 py-1.5">
      {#key el.id}<ClassInput id={el.id} />{/key}
    </div>
  {/if}

  <!-- element.style first, then matched rules in cascade order, then inherited, like DevTools -->
  <div class="border-b border-line py-1.5 pr-2" data-inline>
    <div class="pl-2 font-mono text-[11px]">element.style {'{'}</div>
    {#key payload.paySeq}
      <DeclEditor
        decls={payload.inline}
        {vars}
        mark={inlineMark}
        memo={`inline|${el.id}`}
        oncommit={(text) => void command('inline_style_edit', el.id, text)}
      />
    {/key}
    <div class="pl-2 font-mono text-[11px]">}</div>
  </div>

  {#each rules as r, i (`${payload.paySeq}:${i}`)}
    {#if matches(r)}
      <RuleBlock
        rule={payload.rules[i]!}
        {vars}
        mark={ruleMark(i)}
        dim={!r.mediaActive || !mediaOn(r.wrappers)}
      />
    {/if}
  {/each}

  {#each edit.inherited as r, i (`${payload.paySeq}:i${i}`)}
    {#if matches(r)}
      {#if i === 0 || edit.inherited[i - 1]!.selector !== r.selector}
        <div
          class="truncate border-b border-line bg-line/40 px-2 py-1 text-[11px] text-fg-muted"
          title={r.selector}
        >
          {i18n.t('edit.inheritedFrom', [''])}<span class="font-mono text-fg">{r.selector}</span>
        </div>
      {/if}
      <RuleBlock rule={r} {vars} mark={inheritedMark} />
    {/if}
  {/each}
</div>
