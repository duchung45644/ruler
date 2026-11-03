<script lang="ts">
  import type { Component } from 'svelte';

  let {
    icon: Icon,
    label,
    on = false,
    disabled = false,
    title,
    onclick,
  }: {
    icon: Component<{ size?: number }>;
    label?: string;
    on?: boolean;
    disabled?: boolean;
    title?: string;
    onclick?: () => void;
  } = $props();
</script>

<button
  type="button"
  class="inline-flex h-[32px] items-center gap-1.5 rounded-btn px-2.5 disabled:cursor-default disabled:opacity-50 {on
    ? 'bg-accent text-white'
    : 'hover:bg-line'} {label ? '' : 'w-[32px] justify-center px-0 text-fg-muted'}"
  {disabled}
  {title}
  aria-label={title ?? label}
  {onclick}
  ><Icon size={16} />{#if label}<span>{label}</span>{/if}</button
>
