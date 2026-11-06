// Build-time copy of the extension's protocol module (the single source of truth), so the
// published package is self-contained and there is no hand-written second copy.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const src = fileURLToPath(new URL('../../../src/lib/mcp/protocol.ts', import.meta.url));
const dst = fileURLToPath(new URL('../src/protocol.gen.ts', import.meta.url));
const body = readFileSync(src, 'utf8');
const header =
  '// GENERATED from src/lib/mcp/protocol.ts by scripts/copy-protocol.mjs. Do not edit.\n';
const next = header + body;
let prev = '';
try {
  prev = readFileSync(dst, 'utf8');
} catch {
  // first run
}
if (prev !== next) writeFileSync(dst, next);
