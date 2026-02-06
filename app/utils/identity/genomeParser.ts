/**
 * Genome Parser for Identity Verification
 * 
 * Re-exports from main genome parser with identity-specific utilities.
 */

import { parseGeneticData, validateGeneticData, getGenomeStats } from '~/utils/genomeParser';
import type { SNP } from '~/types/genetics';

export { SNP };
export { parseGeneticData, validateGeneticData, getGenomeStats };

export interface ParsedGenome {
  snps: SNP[];
  source: string;
  totalSnps: number;
}

/**
 * SNPs commonly used for identity verification
 * These have high heterozygosity rates across populations
 */
export const IDENTITY_SNPS = [
  'rs1421085',  // FTO - widely varying frequencies
  'rs1801133',  // MTHFR - C677T
  'rs662',      // PON1 - Q192R
  'rs7501331',  // BCO1 - rs7501331
  'rs2282679',  // GC - rs2282679
  'rs1799977',  // DRD2 - A1 allele
  'rs4680',     // COMT - Val158Met
  'rs6265',     // BDNF - Val66Met
  'rs1800955',  // DRD4 - 7R allele
  'rs25531',    // 5HTTLPR - long/short
];

/**
 * Parse genome specifically for identity verification
 */
export function parseGenomeForIdentity(content: string): ParsedGenome {
  const result = parseGeneticData(content, { maxSnps: 50000 });
  
  return {
    snps: result.snps,
    source: result.source,
    totalSnps: result.validSnps,
  };
}

/**
 * Extract SNPs used for identity verification
 */
export function extractIdentitySnps(snps: SNP[]): SNP[] {
  const identityRsidSet = new Set(IDENTITY_SNPS);
  return snps.filter(snp => identityRsidSet.has(snp.rsid));
}

/**
 * Calculate confidence score for identity verification
 * Compares uploaded SNPs against stored SNPs
 */
export function calculateIdentityConfidence(
  uploadedSnps: SNP[],
  storedSnps: SNP[]
): number {
  // Extract identity SNPs from both sets
  const uploadedIdentity = extractIdentitySnps(uploadedSnps);
  const storedIdentity = extractIdentitySnps(storedSnps);
  
  if (uploadedIdentity.length === 0 || storedIdentity.length === 0) {
    return 0;
  }
  
  // Create lookup maps
  const storedMap = new Map(storedIdentity.map(s => [s.rsid, s.genotype]));
  
  let matches = 0;
  let compared = 0;
  
  for (const uploaded of uploadedIdentity) {
    const stored = storedMap.get(uploaded.rsid);
    if (stored) {
      compared++;
      // Check for exact match or reverse complement
      if (uploaded.genotype === stored || 
          uploaded.genotype === reverseGenotype(stored)) {
        matches++;
      }
    }
  }
  
  if (compared === 0) return 0;
  
  // Calculate confidence based on match rate
  const matchRate = matches / compared;
  
  // Require minimum number of SNPs for high confidence
  if (compared < 5) {
    return matchRate * 0.5; // Reduced confidence with few SNPs
  }
  
  return matchRate;
}

/**
 * Reverse a genotype (for reverse strand comparison)
 */
function reverseGenotype(genotype: string): string {
  const complement: Record<string, string> = {
    'A': 'T',
    'T': 'A',
    'C': 'G',
    'G': 'C',
    '-': '-',
    '0': '0',
  };
  
  return genotype
    .split('')
    .map(base => complement[base] || base)
    .reverse()
    .join('');
}

/**
 * Get minimum required SNPs for identity verification
 */
export function getMinRequiredSnps(): number {
  return 5;
}

/**
 * Check if genome has enough SNPs for identity verification
 */
export function hasEnoughIdentitySnps(snps: SNP[]): boolean {
  const identitySnps = extractIdentitySnps(snps);
  return identitySnps.length >= getMinRequiredSnps();
}
