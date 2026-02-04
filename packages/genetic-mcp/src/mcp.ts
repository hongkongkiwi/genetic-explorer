#!/usr/bin/env node
/**
 * Genetic MCP Server
 *
 * MCP (Model Context Protocol) server for Genetic Explorer.
 */

import { StdioServerTransport } from '@anthropic-ai/sdk';
import { McpServer } from '@anthropic-ai/sdk';
import { loadConfig, isAuthenticated } from './config';
import { executeTool } from './tools';

const server = new McpServer({
  name: 'Genetic Explorer',
  version: '1.0.0',
  description: 'Query your genetic data from Genetic Explorer',
});

// Genome tools
server.tool('get_genome_summary', 'Get a summary of your uploaded genome data', {}, async () => executeTool('genome_summary', {}));
server.tool('get_genome_stats', 'Get detailed statistics about your genome coverage and quality', {}, async () => executeTool('genome_stats', {}));
server.tool('search_snps', 'Search for specific SNP variations by RSID or gene', { query: { type: 'string', description: 'RSID (e.g., rs12345) or gene symbol (e.g., BRCA1)' } }, async (args: any) => executeTool('search_snps', args));

// Health tools
server.tool('get_health_profile', 'Get your health profile including genetic traits', {}, async () => executeTool('health_profile', {}));
server.tool('get_carrier_status', 'Get your carrier status for genetic conditions', {}, async () => executeTool('carrier_status', {}));
server.tool('get_ancestry_composition', 'Get your ancestry composition breakdown', {}, async () => executeTool('ancestry_composition', {}));

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
