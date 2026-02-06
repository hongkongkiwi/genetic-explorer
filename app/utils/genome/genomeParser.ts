/**
 * Genome Parser - Re-export from main parser
 * 
 * This module re-exports genome parsing utilities from the main parser.
 */

import {
  parseGeneticData,
  validateGeneticData,
  getGenomeStats,
  detectFormat,
  type ParseResult,
  type ParseOptions,
} from '~/utils/genomeParser';

export {
  parseGeneticData,
  validateGeneticData,
  getGenomeStats,
  detectFormat,
  type ParseResult,
  type ParseOptions,
};

export type { SNP } from '~/types/genetics';

// Legacy compatibility exports
export interface ParsedGenome {
  snps: Array<{
    rsid: string;
    chromosome: string;
    position: number;
    genotype: string;
  }>;
  source: string;
  build: string;
}

export function parseGenomeFile(content: string): ParsedGenome {
  const result = parseGeneticData(content);
  return {
    snps: result.snps,
    source: result.source,
    build: 'GRCh37', // Default build
  };
}

export function validateGenomeFormat(content: string): { valid: boolean; error?: string } {
  const result = parseGeneticData(content);
  const validation = validateGeneticData(result);
  return {
    valid: validation.valid,
    error: validation.errors[0],
  };
}

export function detectGenomeSource(content: string): string {
  return detectFormat(content);
}
