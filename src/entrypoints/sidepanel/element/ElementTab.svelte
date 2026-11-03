<script lang="ts">
  import type { ElementDetails } from '../../../lib/element/types';
  import { panel } from '../store.svelte';
  import AssetsSection from './AssetsSection.svelte';
  import BoxModel from './BoxModel.svelte';
  import CodeSection from './CodeSection.svelte';
  import ColorsSection from './ColorsSection.svelte';
  import DocumentSection from './DocumentSection.svelte';
  import GradientsSection from './GradientsSection.svelte';
  import Header from './Header.svelte';
  import IssuesSection from './IssuesSection.svelte';
  import LayoutSection from './LayoutSection.svelte';
  import MotionSection from './MotionSection.svelte';
  import ShadowSection from './ShadowSection.svelte';
  import TextContent from './TextContent.svelte';
  import TypographySection from './TypographySection.svelte';
  import { clearHighlights } from './actions';

  let { el }: { el: ElementDetails } = $props();
  const issues = $derived(panel.issues ?? el.issues);
  const c = $derived(el.colors);
</script>

<!-- 6.36: leaving the panel or scrolling it drops page highlights -->
<svelte:window onscroll={clearHighlights} />

<!-- Order: what the element is, what is wrong with it, its geometry, its look, then code. -->
<div data-element-tab role="presentation" onmouseleave={clearHighlights}>
  <Header {el} />
  <DocumentSection {el} />
  {#if issues.length}<IssuesSection {issues} />{/if}
  <BoxModel {el} fps={panel.canvasFps} />
  {#if el.layout}<LayoutSection layout={el.layout} />{/if}
  {#if el.textContent}<TextContent text={el.textContent} />{/if}
  {#if c.text.length + c.backgrounds.length + c.borders.length}<ColorsSection colors={c} />{/if}
  {#if el.typography.length}<TypographySection styles={el.typography} />{/if}
  {#if el.gradients.length}<GradientsSection gradients={el.gradients} />{/if}
  {#if el.boxShadow.length}<ShadowSection shadows={el.boxShadow} />{/if}
  <MotionSection animations={el.animations} transitions={el.transitions} />
  {#if el.assets.length}<AssetsSection assets={el.assets} />{/if}
  <CodeSection {el} />
</div>
