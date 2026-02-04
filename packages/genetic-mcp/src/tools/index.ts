/**
 * Tools Module - MCP tool execution
 */

import * as client from './api/client';

export async function executeTool(name: string, args: Record<string, unknown>) {
  const formatText = (text: string) => [{ type: 'text', text }];

  switch (name) {
    case 'genome_summary': {
      const response = await client.getGenomeSummary();
      if (!response.success || !response.data) return formatText(`Error: ${response.error}`);
      const g = response.data;
      return formatText(`Genome Summary\n\nFile: ${g.filename}\nSNPs: ${g.snpCount.toLocaleString()}\nStatus: ${g.status}`);
    }
    case 'genome_stats':
      return formatText('Genome Statistics\n\nCoverage and quality metrics...');
    case 'search_snps': {
      const response = await client.searchSnp(String(args.query));
      if (!response.success || !response.data) return formatText(`Not found: ${response.error}`);
      const s = response.data;
      return formatText(`SNP: ${s.rsid}\nChromosome: ${s.chromosome}\nPosition: ${s.position}\nGenotype: ${s.genotype || 'N/A'}`);
    }
    case 'health_profile':
      return formatText('Health Profile\n\nGenetic traits and wellness information...');
    case 'carrier_status':
      return formatText('Carrier Status\n\nCarrier screening results...');
    case 'ancestry_composition': {
      const response = await client.getAncestryComposition();
      if (!response.success || !response.data) return formatText(`Error: ${response.error}`);
      const a = response.data;
      const pops = a.populations?.map((p: any) => `${p.name}: ${p.percentage.toFixed(1)}%`).join('\n') || 'No ancestry data';
      return formatText(`Ancestry Composition\n\n${pops}`);
    }
    default:
      return formatText(`Unknown tool: ${name}`);
  }
}
