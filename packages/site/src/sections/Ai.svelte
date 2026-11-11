<script lang="ts">
  import Bot from '@lucide/svelte/icons/bot';
  import ShieldCheck from '@lucide/svelte/icons/shield-check';
  import { EXTENSION_ID } from '../i18n';
  import { t } from '../lang.svelte';
</script>

<!-- AI -->
<section id="ai" class="border-y border-line-soft bg-band">
  <div class="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
    <div>
      <p class="flex items-center gap-2 text-sm font-medium text-accent-fg">
        <Bot size={16} />
        {t().ai.eyebrow}
      </p>
      <h2 class="mt-3 text-3xl font-semibold tracking-tight text-balance text-strong sm:text-4xl">
        {t().ai.title}
      </h2>
      <p class="mt-5 leading-relaxed text-muted">{t().ai.body}</p>
      <p class="mt-4 flex gap-3 text-sm leading-relaxed text-muted">
        <ShieldCheck size={18} class="mt-0.5 shrink-0 text-ok" />
        {t().ai.safe}
      </p>
      <ol class="mt-8 space-y-3">
        {#each t().ai.steps as step, i (step)}
          <li class="flex gap-3 text-sm text-fg">
            <span
              class="flex size-6 shrink-0 items-center justify-center rounded-full border border-line-strong font-mono text-xs"
              >{i + 1}</span
            >
            <span class="pt-0.5">{step}</span>
          </li>
        {/each}
      </ol>
    </div>
    <div class="min-w-0 space-y-6">
      <pre
        class="overflow-x-auto rounded-2xl border border-line bg-page p-6 font-mono text-[13px] leading-relaxed text-muted"><code
          ><span class="text-subtle">// .mcp.json</span>
&#123;
<span class="text-accent-fg">"mcpServers"</span>: &#123;
  <span class="text-accent-fg">"PixelLens"</span>: &#123;
    <span class="text-accent-fg">"command"</span>: <span class="text-code-str">"node"</span>,
    <span class="text-accent-fg">"args"</span>: [
      <span class="text-code-str">"…/mcp-server/dist/cli.js"</span>,
      <span class="text-code-str">"--extension-id"</span>,
      <span class="text-code-str">"{EXTENSION_ID}"</span>
    ],
    <span class="text-accent-fg">"env"</span>: &#123; <span class="text-accent-fg"
            >"PIXELLENS_MCP_TOKEN"</span
          >: <span class="text-code-str">"…"</span> &#125;
  &#125;
&#125;
&#125;</code
        ></pre>
      <div class="rounded-2xl border border-line p-6">
        <h3 class="font-medium text-strong">{t().ai.groupsTitle}</h3>
        <dl class="mt-4 space-y-3 text-sm">
          {#each t().ai.groups as [name, body] (name)}
            <div class="grid gap-1 sm:grid-cols-[8rem_1fr]">
              <dt class="font-medium text-fg">{name}</dt>
              <dd class="text-muted">{body}</dd>
            </div>
          {/each}
        </dl>
      </div>
    </div>
  </div>
</section>
