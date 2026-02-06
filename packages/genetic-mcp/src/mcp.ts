#!/usr/bin/env node
/**
 * Genetic MCP Server
 *
 * MCP (Model Context Protocol) server for Genetic Explorer.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolRequest, ListToolsRequest } from '@modelcontextprotocol/sdk/types.js';
import { isAuthenticated } from './config';
import { executeTool } from './tools';

const server = new Server(
  {
    name: 'genetic-explorer-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler('tools/list' as any, async (_request: ListToolsRequest) => {
  return {
    tools: [
      {
        name: 'get_genome_summary',
        description: 'Get a summary of your uploaded genome data',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'get_genome_stats',
        description: 'Get detailed statistics about your genome coverage and quality',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'search_snps',
        description: 'Search for specific SNP variations by RSID or gene',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'RSID (e.g., rs12345) or gene symbol (e.g., BRCA1)' },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_health_profile',
        description: 'Get your health profile including genetic traits',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'get_carrier_status',
        description: 'Get your carrier status for genetic conditions',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
      {
        name: 'get_ancestry_composition',
        description: 'Get your ancestry composition breakdown',
        inputSchema: { type: 'object', properties: {}, required: [] },
      },
    ],
  };
});

// Handle tool call request
server.setRequestHandler('tools/call' as any, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;
  const result = await executeTool(name, args || {});
  return { content: result };
});

async function main() {
  if (!isAuthenticated()) {
    console.error('Error: Not authenticated. Run "genetic-mcp login" first.');
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Genetic Explorer MCP Server running...');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
