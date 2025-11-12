/**
 * Local MCP Server Runner
 *
 * Runs the MCP server locally with STDIO transport for development/testing.
 * Use this instead of the Smithery-deployed server when testing locally.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import createServer, { configSchema } from './index.js';

// Parse config from environment or use defaults
const config = {
  JOEAPI_BASE_URL: process.env.JOEAPI_BASE_URL || 'http://localhost:8080'
};

// Validate config
const validatedConfig = configSchema.parse(config);

// Create server instance
const server = createServer({ config: validatedConfig });

// Connect with STDIO transport for local use
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error('Server connection error:', error);
  process.exit(1);
});

console.error('JoeAPI MCP Server running locally');
console.error('Connecting to JoeAPI at:', validatedConfig.JOEAPI_BASE_URL);
