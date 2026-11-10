import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { setupTools } from './register-tools';

/**
 * Build a fresh MCP Server for every transport.
 *
 * Upstream cached one Server instance (issue #321), so `server.connect(transport)`
 * threw "Already connected to a transport" for every client after the first and
 * the endpoint stayed bricked until the native host restarted. A health check
 * such as `claude mcp list` counts as a client, so it could steal the only slot.
 * `setupTools` registers the handlers on the instance it is given, so a Server per
 * connection is self-contained. Same fix as the unmerged upstream PRs #301/#338/#354.
 */
export const getMcpServer = () => {
  const server = new Server(
    {
      name: 'ChromeMcpServer',
      // the bridge's package version, so a client can tell which build it is talking to
      version: require('../../package.json').version,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  setupTools(server);
  return server;
};
