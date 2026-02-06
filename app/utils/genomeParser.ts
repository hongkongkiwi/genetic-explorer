/**
 * Genome Parser
 * 
 * Parses genetic data from various DNA testing services.
 * Supports: 23andMe, AncestryDNA, MyHeritage, Living DNA
 */

import type { SNP } from '~/types/genetics';

export { SNP };

export interface ParseResult {
  snps: SNP[];
  source: '23andme' | 'ancestry' | 'myheritage' | 'livingdna' | 'other';
  totalLines: number;
  validSnps: number;
}

export interface ParseOptions {
  maxSnps?: number;
  onProgress?: (processed: number, total: number) => void;
}

/**
 * Detect the format of genetic data
 */
export function detectFormat(content: string): ParseResult['source'] {
  const firstLines = content.split('\n', 20).join('\n').toLowerCase();
  
  // 23andMe format indicators
  if (firstLines.includes('23andme') || 
      firstLines.match(/^rsid\s+chromosome\s+position\s+genotype/)) {
    return '23andme';
  }
  
  // AncestryDNA format indicators
  if (firstLines.includes('ancestrydna') || 
      firstLines.match(/^rsid,chromosome,position,allele/)) {
    return 'ancestry';
  }
  
  // MyHeritage format indicators
  if (firstLines.includes('myheritage') ||
      firstLines.match(/^rsid,\s*chromosome,\s*position,\s*genotype/)) {
    return 'myheritage';
  }
  
  // Living DNA format indicators
  if (firstLines.includes('living dna')) {
    return 'livingdna';
  }
  
  return 'other';
}

/**
 * Parse 23andMe format
 * Format: rsid<TAB>chromosome<TAB>position<TAB>genotype
 */
function parse23andMe(content: string, options: ParseOptions = {}): ParseResult {
  const snps: SNP[] = [];
  const lines = content.split('\n');
  const maxSnps = options.maxSnps || Infinity;
  let validSnps = 0;
  
  for (let i = 0; i < lines.length && snps.length < maxSnps; i++) {
    const line = lines[i].trim();
    
    // Skip comments and header
    if (!line || line.startsWith('#') || line.startsWith('rsid')) {
      continue;
    }
    
    const parts = line.split('\t');
    if (parts.length >= 4) {
      const [rsid, chromosome, position, genotype] = parts;
      
      if (rsid?.startsWith('rs') && chromosome && position) {
        snps.push({
          rsid: rsid.trim(),
          chromosome: normalizeChromosome(chromosome.trim()),
          position: parseInt(position.trim(), 10),
          genotype: genotype?.trim() || '--',
        });
        validSnps++;
      }
    }
    
    if (i % 10000 === 0 && options.onProgress) {
      options.onProgress(i, lines.length);
    }
  }
  
  return {
    snps,
    source: '23andme',
    totalLines: lines.length,
    validSnps,
  };
}

/**
 * Parse AncestryDNA format
 * Format: rsid,chromosome,position,allele1,allele2
 */
function parseAncestryDNA(content: string, options: ParseOptions = {}): ParseResult {
  const snps: SNP[] = [];
  const lines = content.split('\n');
  const maxSnps = options.maxSnps || Infinity;
  let validSnps = 0;
  
  for (let i = 0; i < lines.length && snps.length < maxSnps; i++) {
    const line = lines[i].trim();
    
    // Skip comments and header
    if (!line || line.startsWith('#') || line.startsWith('rsid')) {
      continue;
    }
    
    const parts = line.split(',');
    if (parts.length >= 5) {
      const [rsid, chromosome, position, allele1, allele2] = parts;
      
      if (rsid?.startsWith('rs') && chromosome && position) {
        const genotype = `${allele1?.trim() || '-'}${allele2?.trim() || '-'}`;
        snps.push({
          rsid: rsid.trim(),
          chromosome: normalizeChromosome(chromosome.trim()),
          position: parseInt(position.trim(), 10),
          genotype,
        });
        validSnps++;
      }
    }
    
    if (i % 10000 === 0 && options.onProgress) {
      options.onProgress(i, lines.length);
    }
  }
  
  return {
    snps,
    source: 'ancestry',
    totalLines: lines.length,
    validSnps,
  };
}

/**
 * Parse MyHeritage format
 * Format: rsid, chromosome, position, genotype
 */
function parseMyHeritage(content: string, options: ParseOptions = {}): ParseResult {
  const snps: SNP[] = [];
  const lines = content.split('\n');
  const maxSnps = options.maxSnps || Infinity;
  let validSnps = 0;
  
  for (let i = 0; i < lines.length && snps.length < maxSnps; i++) {
    const line = lines[i].trim();
    
    if (!line || line.startsWith('#') || line.toLowerCase().startsWith('rsid')) {
      continue;
    }
    
    const parts = line.split(',').map(p => p.trim());
    if (parts.length >= 4) {
      const [rsid, chromosome, position, genotype] = parts;
      
      if (rsid?.startsWith('rs') && chromosome && position) {
        snps.push({
          rsid,
          chromosome: normalizeChromosome(chromosome),
          position: parseInt(position, 10),
          genotype: genotype || '--',
        });
        validSnps++;
      }
    }
    
    if (i % 10000 === 0 && options.onProgress) {
      options.onProgress(i, lines.length);
    }
  }
  
  return {
    snps,
    source: 'myheritage',
    totalLines: lines.length,
    validSnps,
  };
}

/**
 * Normalize chromosome format
 */
function normalizeChromosome(chrom: string): string {
  const lower = chrom.toLowerCase().replace(/^chr/, '');
  
  // Standardize MT to M
  if (lower === 'mt') return 'MT';
  
  // Keep X, Y, MT as-is (uppercase)
  if (['x', 'y', 'm'].includes(lower)) {
    return lower.toUpperCase();
  }
  
  // Return numeric chromosomes
  const num = parseInt(lower, 10);
  if (!isNaN(num) && num >= 1 && num <= 22) {
    return String(num);
  }
  
  return chrom;
}

/**
 * Parse genetic data from any supported format
 */
export function parseGeneticData(
  content: string, 
  options: ParseOptions = {}
): ParseResult {
  const format = detectFormat(content);
  
  switch (format) {
    case '23andme':
      return parse23andMe(content, options);
    case 'ancestry':
      return parseAncestryDNA(content, options);
    case 'myheritage':
      return parseMyHeritage(content, options);
    default:
      // Try 23andMe format as default
      return parse23andMe(content, options);
  }
}

/**
 * Validate parsed genetic data
 */
export function validateGeneticData(result: ParseResult): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (result.snps.length === 0) {
    errors.push('No valid SNPs found in file');
  }
  
  if (result.snps.length < 1000) {
    errors.push(`Low SNP count (${result.snps.length}). File may be incomplete.`);
  }
  
  // Check for common SNPs to validate format
  const commonSnps = ['rs1801133', 'rs662', 'rs1799983'];
  const hasCommonSnp = commonSnps.some(rs => 
    result.snps.some(snp => snp.rsid === rs)
  );
  
  if (!hasCommonSnp && result.snps.length < 100000) {
    errors.push('Could not identify common SNPs. File format may be unrecognized.');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get genome statistics from parsed data
 */
export function getGenomeStats(snps: SNP[]): {
  totalSnps: number;
  chromosomeCounts: Record<string, number>;
  genotypeDistribution: Record<string, number>;
} {
  const chromosomeCounts: Record<string, number> = {};
  const genotypeDistribution: Record<string, number> = {};
  
  for (const snp of snps) {
    chromosomeCounts[snp.chromosome] = (chromosomeCounts[snp.chromosome] || 0) + 1;
    genotypeDistribution[snp.genotype] = (genotypeDistribution[snp.genotype] || 0) + 1;
  }
  
  return {
    totalSnps: snps.length,
    chromosomeCounts,
    genotypeDistribution,
  };
}
