<script lang="ts">
  import ChangesTab from './ChangesTab.svelte';
  import { edit, loadChanges } from './edit-store.svelte';

  $effect(() => {
    if (edit.changes === null) void loadChanges();
  });
</script>

<div data-changes-view>
  {#if edit.changes}<ChangesTab changes={edit.changes} />{/if}
</div>
