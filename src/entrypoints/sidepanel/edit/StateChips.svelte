<script lang="ts">
  import { i18n } from '#i18n';
  import { FORCEABLE_STATES } from '../../../lib/css/states';
  import type { RulePayload } from '../../../lib/edit/types';
  import { command } from './edit-store.svelte';
  import { toggleState } from './states';

  let { payload }: { payload: RulePayload } = $props();
</script>

<!-- Forced pseudo-classes for the selected element; dimmed chips have no matching rule. -->
<div class="flex flex-wrap items-center gap-1 px-3 pb-2" role="group" data-state-chips>
  <span class="mr-0.5 text-[11px] text-fg-muted">{i18n.t('edit.forceState')}</span>
  {#each FORCEABLE_STATES as s (s)}
    {@const on = payload.forcedStates.includes(s)}
    {@const has = payload.availableStates.includes(s)}
    <button
      type="button"
      class="rounded-full border px-2 py-0.5 font-mono text-[11px] {on
        ? 'border-accent bg-accent/15 text-accent'
        : has
          ? 'border-line text-fg hover:border-line-strong'
          : 'border-line text-fg-muted opacity-60 hover:opacity-100'}"
      aria-pressed={on}
      data-state={s}
      title={has ? undefined : i18n.t('edit.stateNoRules')}
      onclick={() => void command('set_forced_states', toggleState(payload.forcedStates, s))}
      >{s}</button
    >
  {/each}
</div>
