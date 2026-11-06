import { expect, it } from 'vitest';
import { MCP_TYPES, tabIdError, validateCall } from '../src/protocol.gen.ts';
import { COMMAND_TOOLS } from '../src/schemas.ts';

it('has one tool per protocol command', () => {
  expect(COMMAND_TOOLS.map((t) => t.name)).toEqual([...MCP_TYPES]);
});

it('requires tabId exactly where the validator does', () => {
  for (const t of COMMAND_TOOLS) {
    const v = validateCall(t.name, {});
    const needsTab = !v.ok && v.error === tabIdError(t.name);
    expect(t.inputSchema.required?.includes('tabId') ?? false, t.name).toBe(needsTab);
  }
});

it('every other required field is one the validator rejects when missing', () => {
  for (const t of COMMAND_TOOLS) {
    for (const k of t.inputSchema.required ?? []) {
      if (k === 'tabId') continue;
      expect(t.inputSchema.properties, `${t.name}.${k}`).toHaveProperty(k);
      expect(validateCall(t.name, { tabId: 1 }).ok, `${t.name} without ${k}`).toBe(false);
    }
  }
});
