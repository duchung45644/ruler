<script lang="ts">
  import { easingPath, parseEasing } from '../../../lib/element/motion';

  let { easing }: { easing: string } = $props();
  const S = 64;
  const PAD = 8;
  const IN = S - 2 * PAD;
  const bez = $derived(parseEasing(easing));
  // back / overshoot control points leave 0..1 on y: the padding shows some, the svg clips the rest
  const pt = (x: number, y: number) => [PAD + x * IN, PAD + IN - y * IN] as const;
</script>

<svg
  width={S}
  height={S}
  viewBox="0 0 {S} {S}"
  class="shrink-0 overflow-hidden rounded-btn border border-line"
  aria-label={easing}
  data-easing={easing}
>
  {#if bez}
    {@const [x1, y1, x2, y2] = bez}
    <line
      x1={PAD}
      y1={PAD + IN}
      x2={PAD + IN}
      y2={PAD}
      class="stroke-line-strong"
      stroke-dasharray="2 2"
    />
    <line
      x1={pt(0, 0)[0]}
      y1={pt(0, 0)[1]}
      x2={pt(x1, y1)[0]}
      y2={pt(x1, y1)[1]}
      class="stroke-fg-muted"
    />
    <line
      x1={pt(1, 1)[0]}
      y1={pt(1, 1)[1]}
      x2={pt(x2, y2)[0]}
      y2={pt(x2, y2)[1]}
      class="stroke-fg-muted"
    />
    <path
      d={easingPath(bez, IN, IN)}
      transform="translate({PAD} {PAD})"
      fill="none"
      class="stroke-accent"
      stroke-width="2"
      stroke-linecap="round"
    />
    <circle cx={pt(x1, y1)[0]} cy={pt(x1, y1)[1]} r="2.5" class="fill-fg" />
    <circle cx={pt(x2, y2)[0]} cy={pt(x2, y2)[1]} r="2.5" class="fill-fg" />
  {:else}
    <!-- steps() and the like: no curve, a stair hint -->
    <path
      d="M{PAD} {PAD + IN} H24 V32 H40 V{PAD} H{PAD + IN}"
      fill="none"
      class="stroke-accent"
      stroke-width="2"
    />
  {/if}
</svg>
