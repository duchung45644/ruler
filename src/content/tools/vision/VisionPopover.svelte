<script lang="ts">
  import { i18n } from '#i18n';
  import { VISION_MODES } from '../../../lib/style/vision';
  import { state as app } from '../../core/state.svelte';
  import { setVision } from '.';
</script>

<div class="flex w-52 flex-col gap-1 font-sans text-[12px]" role="radiogroup">
  <div class="mb-1 font-semibold">{i18n.t('dock.vision')}</div>
  {#each VISION_MODES as mode (mode)}
    <label class="flex cursor-pointer items-center gap-2 rounded-btn px-1 py-0.5 hover:bg-line">
      <input
        type="radio"
        name="pixellens-vision"
        value={mode}
        checked={app.vision === mode}
        onchange={() => setVision(mode)}
      />
      {i18n.t(`vision.${mode}`)}
    </label>
  {/each}
</div>
