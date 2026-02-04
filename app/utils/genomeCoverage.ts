/**
 * Genome Coverage Calculator
 * 
 * Calculates and visualizes what percentage of the genome is covered
 * by the uploaded raw data.
 * 
 * Based on:
 * - Total SNPs present
 * - Chromosome coverage
 * - Key gene coverage
 * - Clinically important regions
 */

import type { SNP } from './genomeParser';

// ============================================================================
// Reference Data
// ============================================================================

// Human genome statistics (GRCh37/hg19)
export const GENOME_STATS = {
  totalBasePairs: 3200000000, // ~3.2 billion
  totalSNPsKnown: 85000000,   // ~85 million known SNPs in dbSNP
  proteinCodingGenes: 20000,
  averageGeneSize: 10000,     // 10kb average
};

// Chromosome sizes (in base pairs)
export const CHROMOSOME_SIZES: Record<string, number> = {
  '1': 249250621, '2': 243199373, '3': 198022430, '4': 191154276,
  '5': 180915260, '6': 171115067, '7': 159138663, '8': 146364022,
  '9': 141213431, '10': 135534747, '11': 135006516, '12': 133851895,
  '13': 115169878, '14': 107349540, '15': 102531392, '16': 90354753,
  '17': 81195210, '18': 78077248, '19': 59128983, '20': 63025520,
  '21': 48129895, '22': 51304566, 'X': 155270560, 'Y': 59373566,
  'MT': 16569,
};

// Clinically important genes (ACMG 59 + additional)
export const CLINICALLY_IMPORTANT_GENES = new Set([
  // ACMG 59 actionable genes
  'APC', 'BRCA1', 'BRCA2', 'MLH1', 'MSH2', 'MSH6', 'PMS2', 'TP53',
  'RB1', 'CDH1', 'PALB2', 'PTEN', 'CDKN2A', 'STK11', 'BMPR1A', 'SMAD4',
  'MUTYH', 'ATM', 'CHEK2', 'NBN', 'BARD1', 'BRIP1', 'RAD51C', 'RAD51D',
  'TP53', 'CDKN2A', 'MLH1', 'MSH2', 'MSH6', 'PMS2', 'EPCAM',
  'RET', 'SDHB', 'SDHC', 'SDHD', 'TMEM127', 'MAX', 'VHL', 'MET',
  'FH', 'FLCN', 'MEN1', 'NF2', 'PPP6C', 'PTEN', 'RB1', 'SDHA',
  'TMEM127', 'TP53', 'TSC1', 'TSC2', 'WT1', 'CACNA1S', 'COL3A1',
  'FBN1', 'GLA', 'KCNQ1', 'KCNH2', 'LDLR', 'MYBPC3', 'MYH7',
  'MYH11', 'MYL2', 'MYL3', 'PKP2', 'PRKAG2', 'PTPN11', 'RYR1',
  'RYR2', 'SCN5A', 'SMAD3', 'TGFB2', 'TGFB3', 'TGFBR1', 'TGFBR2',
  'TNNI3', 'TNNC1', 'TNNT2', 'TPM1', 'TRDN', 'ACTC1', 'ACTA2',
  'APOB', 'DES', 'DSC2', 'DSG2', 'DSP', 'F5', 'HFE', 'HNF1A',
  'JAG1', 'KCNE1', 'KCNE2', 'LDLR', 'LMNA', 'OTC', 'PCSK9',
  'PKP2', 'PMM2', 'PSEN1', 'PSEN2', 'PTEN', 'RB1', 'RET', 'RPE65',
  'SCN5A', 'SDHAF2', 'SMAD4', 'STK11', 'TGFBR1', 'TGFBR2', 'TMEM43',
  'TNNI3', 'TPM1', 'TRDN', 'TTN', 'TTR', 'VHL', 'WAS', 'WT1',
  // Additional important genes
  'APOE', 'CYP2D6', 'CYP2C19', 'CYP3A4', 'CYP3A5', 'SLCO1B1',
  'VKORC1', 'CFTR', 'HBB', 'HBA1', 'HBA2', 'G6PD', 'F8', 'F9',
  'HLA-A', 'HLA-B', 'HLA-C', 'HLA-DRB1', 'HLA-DQB1',
]);

// SNPs with clinical significance (ClinVar pathogenic/likely pathogenic)
export const CLINICAL_SNPS = new Set([
  'rs28934874', 'rs80356821', 'rs80357906', 'rs80357914', 'rs80357916',
  'rs80357924', 'rs80357926', 'rs80357932', 'rs80357936', 'rs80357946',
  'rs80357950', 'rs80357952', 'rs80357956', 'rs80357962', 'rs80357966',
  'rs80357972', 'rs80357976', 'rs80357982', 'rs80357986', 'rs80357992',
  'rs80357996', 'rs80358002', 'rs80358006', 'rs80358012', 'rs80358016',
  'rs429358', 'rs7412', 'rs28929474', 'rs28931584', 'rs104893727',
  // Add more as needed
]);

// ============================================================================
// Types
// ============================================================================

export interface GenomeCoverage {
  overall: {
    percentage: number;
    grade: 'excellent' | 'good' | 'fair' | 'limited';
    description: string;
  };
  snps: {
    total: number;
    known: number; // vs dbSNP
    percentage: number;
  };
  chromosomes: Array<{
    name: string;
    size: number;
    snpCount: number;
    coverage: number;
    grade: string;
  }>;
  clinical: {
    importantGenesCovered: number;
    clinicalSnpsPresent: number;
    pharmacogenomics: number;
    grade: string;
  };
  ancestry: {
    informativeMarkers: number;
    populationCoverage: string;
  };
  health: {
    actionableVariants: number;
    carrierStatusVariants: number;
    pharmacogenomics: number;
  };
  recommendations: string[];
}

export interface CoverageVisualization {
  chromosome: string;
  segments: Array<{
    start: number;
    end: number;
    density: 'high' | 'medium' | 'low' | 'none';
  }>;
  totalSNPs: number;
}

// ============================================================================
// Coverage Calculation
// ============================================================================

/**
 * Calculate comprehensive genome coverage statistics
 */
export function calculateGenomeCoverage(snps: SNP[]): GenomeCoverage {
  // Group SNPs by chromosome
  const byChromosome = new Map<string, SNP[]>();
  for (const snp of snps) {
    const chr = snp.chromosome.toUpperCase().replace('CHR', '');
    if (!byChromosome.has(chr)) {
      byChromosome.set(chr, []);
    }
    byChromosome.get(chr)!.push(snp);
  }

  // Calculate chromosome coverage
  const chromosomeCoverage: GenomeCoverage['chromosomes'] = [];
  let totalBasesWithSNPs = 0;

  for (const [chr, size] of Object.entries(CHROMOSOME_SIZES)) {
    const chrSnps = byChromosome.get(chr) || [];
    const snpCount = chrSnps.length;
    
    // Estimate coverage: assume each SNP covers ~100bp region
    const coveredBases = Math.min(snpCount * 100, size);
    const coverage = (coveredBases / size) * 100;
    
    totalBasesWithSNPs += coveredBases;

    chromosomeCoverage.push({
      name: chr,
      size,
      snpCount,
      coverage: Math.min(100, coverage),
      grade: getCoverageGrade(coverage),
    });
  }

  // Sort chromosomes naturally
  chromosomeCoverage.sort((a, b) => {
    const aNum = parseInt(a.name) || (a.name === 'X' ? 23 : a.name === 'Y' ? 24 : 25);
    const bNum = parseInt(b.name) || (b.name === 'X' ? 23 : b.name === 'Y' ? 24 : 25);
    return aNum - bNum;
  });

  // Calculate overall coverage
  const overallPercentage = (totalBasesWithSNPs / GENOME_STATS.totalBasePairs) * 100;
  const overallGrade = getOverallGrade(overallPercentage, snps.length);

  // Calculate clinical coverage
  const clinicalSnps = snps.filter(s => CLINICAL_SNPS.has(s.rsid));
  const clinicalCoverage = {
    importantGenesCovered: 0, // Would need gene annotation
    clinicalSnpsPresent: clinicalSnps.length,
    pharmacogenomics: snps.filter(s => 
      s.rsid.match(/rs1799853|rs1057910|rs28371706|rs3892097|rs4244285|rs4986893/)
    ).length,
    grade: clinicalSnps.length > 10 ? 'excellent' : clinicalSnps.length > 5 ? 'good' : 'limited',
  };

  // Ancestry markers
  const ancestrySnps = snps.filter(s => 
    s.rsid.match(/rs1426654|rs16891982|rs1834640|rs3827760|rs12203592/)
  );

  // Health/actionable variants
  const actionableSnps = snps.filter(s => 
    s.rsid.match(/rs429358|rs7412|rs1801133|rs6025/)
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    overallPercentage,
    snps.length,
    clinicalSnps.length,
    chromosomeCoverage
  );

  return {
    overall: {
      percentage: Math.min(100, overallPercentage),
      grade: overallGrade,
      description: getGradeDescription(overallGrade),
    },
    snps: {
      total: snps.length,
      known: snps.length, // Simplified - would check against dbSNP
      percentage: (snps.length / GENOME_STATS.totalSNPsKnown) * 100,
    },
    chromosomes: chromosomeCoverage,
    clinical: clinicalCoverage,
    ancestry: {
      informativeMarkers: ancestrySnps.length,
      populationCoverage: getPopulationCoverage(snps.length),
    },
    health: {
      actionableVariants: actionableSnps.length,
      carrierStatusVariants: clinicalSnps.filter(s => s.rsid.match(/rs113993960|rs768506929/)).length,
      pharmacogenomics: clinicalCoverage.pharmacogenomics,
    },
    recommendations,
  };
}

/**
 * Get coverage grade for a percentage
 */
function getCoverageGrade(percentage: number): string {
  if (percentage >= 80) return 'excellent';
  if (percentage >= 60) return 'good';
  if (percentage >= 40) return 'fair';
  if (percentage >= 20) return 'limited';
  return 'minimal';
}

/**
 * Get overall coverage grade
 */
function getOverallGrade(percentage: number, snpCount: number): GenomeCoverage['overall']['grade'] {
  // Whole genome sequencing (30x) = ~99.9%
  if (percentage > 80 || snpCount > 1000000) return 'excellent';
  // Dense microarray or low-pass WGS
  if (percentage > 50 || snpCount > 500000) return 'good';
  // Standard microarray
  if (percentage > 20 || snpCount > 200000) return 'fair';
  return 'limited';
}

/**
 * Get grade description
 */
function getGradeDescription(grade: GenomeCoverage['overall']['grade']): string {
  switch (grade) {
    case 'excellent':
      return 'Whole genome or near-complete coverage. Excellent for all analyses.';
    case 'good':
      return 'High-density coverage. Good for health and ancestry analysis.';
    case 'fair':
      return 'Standard microarray coverage. Suitable for ancestry and basic health insights.';
    case 'limited':
      return 'Limited coverage. May miss important variants. Consider upgrading.';
  }
}

/**
 * Get population coverage estimate
 */
function getPopulationCoverage(snpCount: number): string {
  if (snpCount > 1000000) return 'Global (all major populations)';
  if (snpCount > 600000) return 'Global (optimized for European, African, Asian)';
  if (snpCount > 400000) return 'Primarily European with some global coverage';
  return 'Limited population diversity';
}

/**
 * Generate recommendations based on coverage
 */
function generateRecommendations(
  percentage: number,
  snpCount: number,
  clinicalSnps: number,
  chromosomeCoverage: GenomeCoverage['chromosomes']
): string[] {
  const recommendations: string[] = [];

  if (percentage < 20) {
    recommendations.push('Consider upgrading to a higher-density test (700K+ SNPs) for better coverage');
  }

  if (clinicalSnps < 5) {
    recommendations.push('Limited clinical SNPs detected. Consider a health-focused test like 23andMe Health or Nebula Genomics');
  }

  // Check for missing chromosomes
  const missingChrs = chromosomeCoverage.filter(c => c.snpCount === 0 && c.name !== 'Y');
  if (missingChrs.length > 0) {
    recommendations.push(`No SNPs detected on chromosome(s): ${missingChrs.map(c => c.name).join(', ')}. This may affect related analyses.`);
  }

  if (snpCount > 1000000) {
    recommendations.push('Excellent coverage! You have whole genome or exome data - suitable for advanced research');
  }

  if (chromosomeCoverage.find(c => c.name === 'MT')?.snpCount === 0) {
    recommendations.push('No mitochondrial DNA coverage. Consider a test with mtDNA analysis for maternal lineage');
  }

  return recommendations;
}

// ============================================================================
// Visualization Data
// ============================================================================

/**
 * Generate data for chromosome coverage visualization
 */
export function generateCoverageVisualization(
  snps: SNP[],
  chromosome: string,
  segmentSize: number = 1000000 // 1MB segments
): CoverageVisualization {
  const chrSnps = snps.filter(s => 
    s.chromosome.toUpperCase().replace('CHR', '') === chromosome.toUpperCase()
  );

  const chrSize = CHROMOSOME_SIZES[chromosome] || 100000000;
  const numSegments = Math.ceil(chrSize / segmentSize);
  const segments: CoverageVisualization['segments'] = [];

  for (let i = 0; i < numSegments; i++) {
    const start = i * segmentSize;
    const end = Math.min((i + 1) * segmentSize, chrSize);
    
    const snpsInSegment = chrSnps.filter(s => s.position >= start && s.position < end);
    const density = snpsInSegment.length / segmentSize;

    let densityLevel: 'high' | 'medium' | 'low' | 'none';
    if (density > 0.001) densityLevel = 'high';
    else if (density > 0.0005) densityLevel = 'medium';
    else if (density > 0) densityLevel = 'low';
    else densityLevel = 'none';

    segments.push({
      start,
      end,
      density: densityLevel,
    });
  }

  return {
    chromosome,
    segments,
    totalSNPs: chrSnps.length,
  };
}

/**
 * Get coverage heatmap data for all chromosomes
 */
export function getGenomeHeatmap(snps: SNP[]): Array<{
  chromosome: string;
  coverage: number;
  color: string;
}> {
  const byChromosome = new Map<string, SNP[]>();
  for (const snp of snps) {
    const chr = snp.chromosome.toUpperCase().replace('CHR', '');
    if (!byChromosome.has(chr)) {
      byChromosome.set(chr, []);
    }
    byChromosome.get(chr)!.push(snp);
  }

  return Object.entries(CHROMOSOME_SIZES).map(([chr, size]) => {
    const chrSnps = byChromosome.get(chr) || [];
    const coveredBases = Math.min(chrSnps.length * 100, size);
    const coverage = (coveredBases / size) * 100;

    let color: string;
    if (coverage >= 80) color = '#22c55e'; // green-500
    else if (coverage >= 60) color = '#84cc16'; // lime-500
    else if (coverage >= 40) color = '#eab308'; // yellow-500
    else if (coverage >= 20) color = '#f97316'; // orange-500
    else color = '#ef4444'; // red-500

    return {
      chromosome: chr,
      coverage: Math.min(100, coverage),
      color,
    };
  });
}

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format coverage percentage for display
 */
export function formatCoverage(percentage: number): string {
  if (percentage < 0.01) {
    return `${(percentage * 100).toFixed(2)}%`;
  }
  return `${percentage.toFixed(2)}%`;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Get coverage icon/emoji
 */
export function getCoverageIcon(grade: string): string {
  switch (grade) {
    case 'excellent': return '✨';
    case 'good': return '✅';
    case 'fair': return '⚠️';
    case 'limited': return '❗';
    case 'minimal': return '📉';
    default: return '❓';
  }
}

/**
 * Get comparison between two coverage results
 */
export function compareCoverage(
  old: GenomeCoverage,
  new_: GenomeCoverage
): {
  improved: boolean;
  changes: string[];
} {
  const changes: string[] = [];

  const snpDiff = new_.snps.total - old.snps.total;
  if (snpDiff > 50000) {
    changes.push(`+${formatNumber(snpDiff)} SNPs added`);
  } else if (snpDiff < -50000) {
    changes.push(`${formatNumber(snpDiff)} SNPs lost`);
  }

  const coverageDiff = new_.overall.percentage - old.overall.percentage;
  if (coverageDiff > 5) {
    changes.push(`+${coverageDiff.toFixed(1)}% better coverage`);
  }

  const clinicalDiff = new_.clinical.clinicalSnpsPresent - old.clinical.clinicalSnpsPresent;
  if (clinicalDiff > 0) {
    changes.push(`+${clinicalDiff} clinically important variants`);
  }

  return {
    improved: snpDiff > 0 || coverageDiff > 0,
    changes,
  };
}

export default {
  calculateGenomeCoverage,
  generateCoverageVisualization,
  getGenomeHeatmap,
  formatCoverage,
  formatNumber,
  getCoverageIcon,
  compareCoverage,
  CHROMOSOME_SIZES,
  GENOME_STATS,
  CLINICALLY_IMPORTANT_GENES,
  CLINICAL_SNPS,
};
