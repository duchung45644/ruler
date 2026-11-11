// Minimal MCP client for PixelLens: spawns the repo's server, waits for the extension, calls tools.
import { Client } from '/home/leanmac/Work_space/ruler/packages/mcp-server/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
import { StdioClientTransport } from '/home/leanmac/Work_space/ruler/packages/mcp-server/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js';
import { randomBytes } from 'crypto';
export const TOKEN = randomBytes(32).toString('base64url');
export async function mcp() {
  const t = new StdioClientTransport({ command: 'node', args: ['/home/leanmac/Work_space/ruler/packages/mcp-server/dist/cli.js', '--extension-id', 'bkgdfebicmlicjnkgbemlidlnpbnaofh'], env: { ...process.env, PIXELLENS_MCP_TOKEN: TOKEN }, stderr: 'ignore' });
  const c = new Client({ name: 'demo-agent', version: '1.0.0' }); await c.connect(t);
  const call = async (name, args = {}) => { const r = await c.callTool({ name, arguments: args }); const txt = r.content?.find(x => x.type === 'text')?.text; if (r.isError) throw new Error(name + ': ' + txt); try { return JSON.parse(txt); } catch { return txt; } };
  return { call, close: () => c.close() };
}
