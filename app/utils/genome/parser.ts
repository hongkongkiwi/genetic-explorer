import type { SNP } from '~/types/genetics';

// Re-export SNP type for backward compatibility
export type { SNP };

export interface ParseResult {
  snps: SNP[];
  source: '23andme' | 'ancestry' | 'myheritage' | 'other';
  totalLines: number;
  validSnps: number;
}

/**
 * Parse 23andMe raw data format
 * Format: rsid	chromosome	position	genotype
 */
function parse23andMe(content: string): SNP[] {
  const snps: SNP[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.startsWith('#') || line.startsWith('rsid') || !line.trim()) {
      continue;
    }

    const parts = line.split('\t');
    if (parts.length >= 4) {
      const [rsid, chromosome, position, genotype] = parts;
      if (rsid && rsid.startsWith('rs')) {
        snps.push({
          rsid: rsid.trim(),
          chromosome: chromosome.trim(),
          position: parseInt(position.trim(), 10),
          genotype: genotype.trim(),
        });
      }
    }
  }

  return snps;
}

/**
 * Parse AncestryDNA raw data format
 * Format: rsid,chromosome,position,allele1,allele2
 */
function parseAncestryDNA(content: string): SNP[] {
  const snps: SNP[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    if (line.startsWith('#') || line.startsWith('rsid') || !line.trim()) {
      continue;
    }

    const parts = line.split(',');
    if (parts.length >= 5) {
      const [rsid, chromosome, position, allele1, allele2] = parts;
      if (rsid && rsid.startsWith('rs')) {
        snps.push({
          rsid: rsid.trim(),
          chromosome: chromosome.trim(),
          position: parseInt(position.trim(), 10),
          genotype: (allele1.trim() + allele2.trim()).replace(/-/g, ''),
        });
      }
    }
  }

  return snps;
}

/**
 * Detect the source format of genetic data
 */
export function detectSource(content: string): '23andme' | 'ancestry' | 'myheritage' | 'other' {
  const firstLines = content.split('\n').slice(0, 20).join('\n');

  if (firstLines.includes('23andMe') || firstLines.includes('rsid\tchromosome\tposition\tgenotype')) {
    return '23andme';
  }
  if (firstLines.includes('AncestryDNA') || firstLines.includes('rsid,chromosome,position,allele1,allele2')) {
    return 'ancestry';
  }
  if (firstLines.includes('MyHeritage')) {
    return 'myheritage';
  }

  // Try to detect by format
  const lines = content.split('\n').filter(l => !l.startsWith('#') && l.trim());
  if (lines.length > 0) {
    const firstDataLine = lines.find(l => l.startsWith('rs'));
    if (firstDataLine) {
      if (firstDataLine.includes('\t')) return '23andme';
      if (firstDataLine.includes(',')) return 'ancestry';
    }
  }

  return 'other';
}

/**
 * Main parser function
 */
export function parseGeneticData(content: string): ParseResult {
  const source = detectSource(content);
  let snps: SNP[] = [];

  switch (source) {
    case '23andme':
      snps = parse23andMe(content);
      break;
    case 'ancestry':
      snps = parseAncestryDNA(content);
      break;
    case 'myheritage':
      // MyHeritage uses similar format to 23andMe
      snps = parse23andMe(content);
      break;
    default:
      // Try 23andMe format as default
      snps = parse23andMe(content);
  }

  // Sort by chromosome and position for easier processing
  snps.sort((a, b) => {
    const chrA = parseInt(a.chromosome.replace('X', '23').replace('Y', '24').replace('MT', '25'), 10) || 0;
    const chrB = parseInt(b.chromosome.replace('X', '23').replace('Y', '24').replace('MT', '25'), 10) || 0;
    if (chrA !== chrB) return chrA - chrB;
    return a.position - b.position;
  });

  return {
    snps,
    source,
    totalLines: content.split('\n').length,
    validSnps: snps.length,
  };
}

/**
 * Get SNPs by gene region (approximate)
 */
export function getSNPsByRegion(snps: SNP[], chromosome: string, startPos: number, endPos: number): SNP[] {
  return snps.filter(snp => 
    snp.chromosome === chromosome && 
    snp.position >= startPos && 
    snp.position <= endPos
  );
}

/**
 * Find specific SNP by rsid
 */
export function findSNP(snps: SNP[], rsid: string): SNP | undefined {
  return snps.find(snp => snp.rsid.toLowerCase() === rsid.toLowerCase());
}

/**
 * Get SNPs with specific genotypes
 */
export function getSNPsWithGenotype(snps: SNP[], genotype: string): SNP[] {
  return snps.filter(snp => snp.genotype === genotype);
}

/**
 * Validate genome data
 */
export function validateGenomeData(snps: SNP[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (snps.length === 0) {
    errors.push('No valid SNPs found in the file');
  }

  if (snps.length < 100000) {
    errors.push(`Low SNP count (${snps.length}). Expected at least 100,000 for genotyping data.`);
  }

  // Check for expected SNPs
  const expectedSnPs = ['rs1801133', 'rs662', 'rs1799983']; // Common SNPs that should be in most tests
  const foundExpected = expectedSnPs.filter(rsId => 
    snps.some(snp => snp.rsid === rsId)
  );

  if (foundExpected.length === 0 && snps.length > 0) {
    errors.push('Could not identify common SNPs. File may be corrupted or in an unexpected format.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get statistics about the genome data
 */
export function getGenomeStats(snps: SNP[]) {
  const chromosomeCounts: Record<string, number> = {};
  const genotypeCounts: Record<string, number> = {};

  for (const snp of snps) {
    chromosomeCounts[snp.chromosome] = (chromosomeCounts[snp.chromosome] || 0) + 1;
    genotypeCounts[snp.genotype] = (genotypeCounts[snp.genotype] || 0) + 1;
  }

  return {
    totalSNPs: snps.length,
    chromosomeCounts,
    genotypeCounts,
    uniqueChromosomes: Object.keys(chromosomeCounts).length,
  };
}
