<script lang="ts">
  let {
    items,
    active,
    onpick,
  }: { items: string[]; active: number; onpick: (item: string) => void } = $props();
</script>

<ul
  class="max-h-48 min-w-40 overflow-auto rounded-btn border border-line-strong bg-surface py-0.5 font-mono text-[11px] shadow-lg"
  role="listbox"
  data-suggest
>
  {#each items as item, i (item)}
    <li
      role="option"
      aria-selected={i === active}
      class="cursor-pointer truncate px-2 py-0.5 {i === active
        ? 'bg-accent text-white'
        : 'hover:bg-line'}"
      onmousedown={(e) => {
        // keep focus in the field that opened the list
        e.preventDefault();
        onpick(item);
      }}
    >
      {item}
    </li>
  {/each}
</ul>
