#!/usr/bin/env node
/**
 * pixellens-mcp --extension-id <id> [--port 47347]   (token in env PIXELLENS_MCP_TOKEN)
 * stdio MCP server for the agent + WebSocket server on 127.0.0.1 for the PixelLens extension.
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Bridge } from './bridge.ts';
import { parseConfig, VERSION, type CliConfig } from './config.ts';
import { createMcpServer } from './mcp.ts';

async function main(): Promise<void> {
  const log = (m: string) => process.stderr.write(`[pixellens-mcp] ${m}\n`);
  let cfg: CliConfig;
  try {
    cfg = parseConfig(process.argv.slice(2), process.env);
  } catch (e) {
    log((e as Error).message);
    process.exit(2);
  }
  const bridge = new Bridge({ ...cfg, serverVersion: VERSION, log });
  try {
    await bridge.listen();
  } catch (e) {
    log((e as Error).message);
    process.exit(1);
  }
  log(`waiting for PixelLens on ws://127.0.0.1:${bridge.port}/pixellens`);
  const server = createMcpServer(bridge, VERSION);
  const stop = () => {
    void bridge.close().finally(() => process.exit(0));
  };
  server.onclose = stop;
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  process.stdin.on('end', stop); // the agent went away
  await server.connect(new StdioServerTransport());
}

void main();
