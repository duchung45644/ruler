<script lang="ts">
  import type { ElementDetails } from '../../../lib/element/types';
  import { panel } from '../store.svelte';
  import AssetsSection from './AssetsSection.svelte';
  import BoxModel from './BoxModel.svelte';
  import CodeSection from './CodeSection.svelte';
  import ColorsSection from './ColorsSection.svelte';
  import GradientsSection from './GradientsSection.svelte';
  import Header from './Header.svelte';
  import IssuesSection from './IssuesSection.svelte';
  import LayoutSection from './LayoutSection.svelte';
  import MotionSection from './MotionSection.svelte';
  import ShadowSection from './ShadowSection.svelte';
  import TextContent from './TextContent.svelte';
  import TypographySection from './TypographySection.svelte';
  import { clearHighlights } from './actions';
  import CssRulesSection from '../edit/CssRulesSection.svelte';
  import EditToolbar from '../edit/EditToolbar.svelte';

  let { el }: { el: ElementDetails } = $props();
  const issues = $derived(panel.issues ?? el.issues);
  const c = $derived(el.colors);
</script>

<!-- 6.36: leaving the panel or scrolling it drops page highlights -->
<svelte:window onscroll={clearHighlights} />

<!-- Order: tools, what it is (and where), its box, what is wrong, editing, look, content, code. -->
<div data-element-tab role="presentation" onmouseleave={clearHighlights}>
  <EditToolbar />
  <Header {el} />
  <BoxModel {el} fps={panel.canvasFps} />
  {#if issues.length}<IssuesSection {issues} />{/if}
  <CssRulesSection {el} />
  {#if el.layout}<LayoutSection layout={el.layout} />{/if}
  {#if el.typography.length}<TypographySection styles={el.typography} />{/if}
  {#if c.text.length + c.backgrounds.length + c.borders.length}<ColorsSection colors={c} />{/if}
  {#if el.gradients.length}<GradientsSection gradients={el.gradients} />{/if}
  {#if el.boxShadow.length}<ShadowSection shadows={el.boxShadow} />{/if}
  <MotionSection animations={el.animations} transitions={el.transitions} />
  {#if el.textContent}<TextContent text={el.textContent} />{/if}
  {#if el.assets.length}<AssetsSection assets={el.assets} />{/if}
  <CodeSection {el} />
</div>
