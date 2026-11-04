<script lang="ts">
  import { i18n } from '#i18n';
  import type { RulePayload } from '../../../lib/edit/types';
  import { command } from './edit-store.svelte';

  let { payload }: { payload: RulePayload } = $props();
</script>

{#if payload.availableStates.length}
  <select
    class="h-7 rounded-btn border bg-surface px-1.5 font-mono text-[11px] outline-none {payload.forcedState
      ? 'border-accent text-accent'
      : 'border-line text-fg-muted'}"
    value={payload.forcedState ?? ''}
    data-state-select
    onchange={(e) => void command('force_element_state', e.currentTarget.value || null)}
  >
    <option value="">{i18n.t('edit.stateDefault')}</option>
    {#each payload.availableStates as s (s)}
      <option value={s}>{s}</option>
    {/each}
  </select>
{/if}
