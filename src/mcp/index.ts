import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (never stdout — breaks MCP JSON-RPC)
  console.error('ScreenLook MCP server started');
}

main().catch((err) => {
  console.error('Failed to start ScreenLook MCP server:', err);
  process.exit(1);
});
