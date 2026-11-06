/** CLI arguments and environment. */
import { readFileSync } from 'node:fs';
import { MCP_PORT, TOKEN_RE } from './protocol.gen.ts';

export const EXTENSION_ID_RE = /^[a-p]{32}$/;

export interface CliConfig {
  token: string;
  extensionId: string;
  port: number;
}

/** Parse argv + env; throws a message for the user. */
export function parseConfig(argv: string[], env: NodeJS.ProcessEnv): CliConfig {
  const arg = (name: string): string | undefined => {
    const i = argv.indexOf(name);
    if (i >= 0) return argv[i + 1];
    const eq = argv.find((a) => a.startsWith(`${name}=`));
    return eq?.slice(name.length + 1);
  };
  const extensionId = arg('--extension-id') ?? '';
  if (!EXTENSION_ID_RE.test(extensionId))
    throw new Error('--extension-id <32 letters a-p> is required (copy it from Bo doi).');
  const token = env.BODOI_MCP_TOKEN ?? '';
  if (!TOKEN_RE.test(token))
    throw new Error('Environment variable BODOI_MCP_TOKEN must hold the token copied from Bo doi.');
  const portRaw = arg('--port');
  const port = portRaw === undefined ? MCP_PORT : Number(portRaw);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error('--port must be 1-65535.');
  return { token, extensionId, port };
}

export const VERSION: string = (
  JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as {
    version: string;
  }
).version;
