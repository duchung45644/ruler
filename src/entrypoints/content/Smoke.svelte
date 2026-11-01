<script lang="ts">
  import Ruler from '@lucide/svelte/icons/ruler';
  import { i18n } from '#i18n';
</script>

<div
  class="fixed top-3 right-3 z-[2147483647] flex items-center gap-2 rounded-xl bg-zinc-900/90 px-3 py-2 font-sans text-sm text-zinc-200 shadow-lg ring-1 ring-white/10 backdrop-blur-md"
>
  <Ruler size={16} />
  {i18n.t('extNameShort')}
</div>
```
