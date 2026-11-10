import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['.output/', '.wxt/', '.superpowers/', 'packages/*/dist/', 'packages/*/src/*.gen.ts'],
  },
  js.configs.recommended,
  ts.configs.recommended,
  svelte.configs.recommended,
  svelte.configs.prettier,
  { languageOptions: { globals: { ...globals.browser, ...globals.webextensions } } },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
  // render our own Markdown (docs/privacy-policy.md, packages/site/docs) after escaping it
  {
    files: ['packages/site/src/Privacy.svelte', 'packages/site/src/Docs.svelte'],
    rules: { 'svelte/no-at-html-tags': 'off' },
  },
);
