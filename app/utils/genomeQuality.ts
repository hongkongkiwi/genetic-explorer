/**
 * Genome Quality Assessment Module
 * 
 * Compares genetic data quality to determine if replacement is an upgrade.
 * 
 * METRICS:
 * - SNP count (total variants detected)
 * - Coverage (chromosome coverage percentage)
 * - Resolution (average SNP density)
 * - Health-related SNPs (clinically relevant variants)
 * - Ancestry informative markers
 * - Data completeness
 */

import { SNP } from './genomeParser';

// ============================================================================
// Types
// ============================================================================

export interface GenomeQualityMetrics {
  totalSnps: number;
  coverage: {
    autosomal: number;  // Coverage of chromosomes 1-22
    x: number;          // X chromosome coverage
    y: number;          // Y chromosome coverage
    mt: number;         // Mitochondrial coverage
  };
  resolution: number;   // SNPs per million base pairs
  healthSnps: number;   // Clinically relevant SNPs
  ancestrySnps: number; // Ancestry informative markers
  completeness: number; // Percentage of expected SNPs present
  qualityScore: number; // 0-100 overall quality score
}

export interface QualityComparison {
  isUpgrade: boolean;
  isSignificantUpgrade: boolean; // >20% improvement
  metrics: {
    old: GenomeQualityMetrics;
    new: GenomeQualityMetrics;
  };
  improvements: string[];
  regressions: string[];
  warnings: string[];
  recommendation: 'upgrade' | 'downgrade' | 'similar' | 'review';
}

// ============================================================================
// Quality Calculation
// ============================================================================

// Clinically significant SNPs (health-related)
const HEALTH_SNPS = new Set([
  'rs429358', // APOE4 (Alzheimer's)
  'rs7412',   // APOE
  'rs1801133', // MTHFR
  'rs1801131', // MTHFR
  'rs6025',   // Factor V Leiden
  'rs1799950', // BRCA1
  'rs1799966', // BRCA2
  'rs7756992', // TCF7L2 (diabetes)
  'rs13266634', // SLC30A8 (diabetes)
  'rs9939609', // FTO (obesity)
  'rs1801282', // PPARG (diabetes)
  'rs5219',   // KCNJ11 (diabetes)
  'rs7903146', // TCF7L2
]);

// Ancestry informative markers (AIMs)
const ANCESTRY_SNPS = new Set([
  'rs1426654', // Skin pigmentation
  'rs16891982', // SLC45A2
  'rs28777',  // SLC45A2
  'rs1834640', // EDAR
  'rs3827760', // EDAR
  'rs12203592', // IRF4
  'rs12896399', // SLC24A4
  'rs16891982', // SLC45A2
  'rs1042602', // TYR
  'rs1800407', // OCA2
  'rs12913832', // HERC2
  'rs1545397', // OCA2
]);

// Expected SNPs per chromosome (for completeness calculation)
const EXPECTED_SNPS: Record<string, number> = {
  '1': 90000, '2': 95000, '3': 80000, '4': 75000, '5': 72000,
  '6': 70000, '7': 65000, '8': 60000, '9': 55000, '10': 58000,
  '11': 60000, '12': 58000, '13': 45000, '14': 42000, '15': 40000,
  '16': 38000, '17': 35000, '18': 34000, '19': 28000, '20': 27000,
  '21': 15000, '22': 16000, 'X': 35000, 'Y': 500, 'MT': 3000,
};

/**
 * Calculate quality metrics for a set of SNPs
 */
export function calculateQualityMetrics(snps: SNP[]): GenomeQualityMetrics {
  // Total SNP count
  const totalSnps = snps.length;
  
  // Chromosome coverage
  const chromosomes = new Map<string, Set<string>>();
  const positions = new Map<string, number[]>();
  
  for (const snp of snps) {
    if (!chromosomes.has(snp.chromosome)) {
      chromosomes.set(snp.chromosome, new Set());
      positions.set(snp.chromosome, []);
    }
    chromosomes.get(snp.chromosome)!.add(snp.rsid);
    positions.get(snp.chromosome)!.push(snp.position);
  }
  
  // Calculate coverage for each chromosome type
  const autosomalChromosomes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'];
  
  const autosomalCoverage = calculateChromosomeCoverage(
    autosomalChromosomes,
    chromosomes
  );
  
  const xCoverage = chromosomes.has('X') 
    ? Math.min(100, (chromosomes.get('X')!.size / EXPECTED_SNPS['X']) * 100)
    : 0;
  
  const yCoverage = chromosomes.has('Y')
    ? Math.min(100, (chromosomes.get('Y')!.size / EXPECTED_SNPS['Y']) * 100)
    : 0;
  
  const mtCoverage = chromosomes.has('MT')
    ? Math.min(100, (chromosomes.get('MT')!.size / EXPECTED_SNPS['MT']) * 100)
    : 0;
  
  // Calculate resolution (SNPs per million base pairs)
  // Human genome is ~3.2 billion base pairs
  const resolution = (totalSnps / 3200);
  
  // Count health-related SNPs
  let healthSnps = 0;
  for (const snp of snps) {
    if (HEALTH_SNPS.has(snp.rsid)) {
      healthSnps++;
    }
  }
  
  // Count ancestry SNPs
  let ancestrySnps = 0;
  for (const snp of snps) {
    if (ANCESTRY_SNPS.has(snp.rsid)) {
      ancestrySnps++;
    }
  }
  
  // Calculate completeness
  let totalExpected = 0;
  let totalPresent = 0;
  for (const [chr, expected] of Object.entries(EXPECTED_SNPS)) {
    totalExpected += expected;
    totalPresent += chromosomes.get(chr)?.size || 0;
  }
  const completeness = (totalPresent / totalExpected) * 100;
  
  // Calculate overall quality score (0-100)
  // Weighted average of various factors
  const qualityScore = Math.min(100, Math.round(
    (Math.min(40, totalSnps / 1500)) +  // SNP count (max 40 points)
    (autosomalCoverage * 0.2) +          // Coverage (max 20 points)
    (Math.min(20, resolution * 2)) +     // Resolution (max 20 points)
    (healthSnps * 2) +                   // Health SNPs (max ~30 points)
    (completeness * 0.1)                 // Completeness (max 10 points)
  ));
  
  return {
    totalSnps,
    coverage: {
      autosomal: autosomalCoverage,
      x: xCoverage,
      y: yCoverage,
      mt: mtCoverage,
    },
    resolution,
    healthSnps,
    ancestrySnps,
    completeness,
    qualityScore,
  };
}

/**
 * Calculate coverage percentage for a set of chromosomes
 */
function calculateChromosomeCoverage(
  targetChromosomes: string[],
  actualChromosomes: Map<string, Set<string>>
): number {
  let totalCoverage = 0;
  let chromosomesWithData = 0;
  
  for (const chr of targetChromosomes) {
    const snps = actualChromosomes.get(chr);
    if (snps && snps.size > 0) {
      const expected = EXPECTED_SNPS[chr] || 50000;
      const coverage = Math.min(100, (snps.size / expected) * 100);
      totalCoverage += coverage;
      chromosomesWithData++;
    }
  }
  
  return chromosomesWithData > 0 
    ? totalCoverage / targetChromosomes.length 
    : 0;
}

// ============================================================================
// Quality Comparison
// ============================================================================

/**
 * Compare two genome quality metrics
 */
export function compareGenomeQuality(
  oldMetrics: GenomeQualityMetrics,
  newMetrics: GenomeQualityMetrics
): QualityComparison {
  const improvements: string[] = [];
  const regressions: string[] = [];
  const warnings: string[] = [];
  
  // Compare SNP count
  const snpDiff = newMetrics.totalSnps - oldMetrics.totalSnps;
  const snpDiffPercent = (snpDiff / oldMetrics.totalSnps) * 100;
  
  if (snpDiff > 1000) {
    improvements.push(`+${snpDiff.toLocaleString()} SNPs (${snpDiffPercent.toFixed(1)}% increase)`);
  } else if (snpDiff < -1000) {
    regressions.push(`${snpDiff.toLocaleString()} SNPs (${snpDiffPercent.toFixed(1)}% decrease)`);
    warnings.push('New data has significantly fewer SNPs - may be lower resolution');
  }
  
  // Compare coverage
  const coverageDiff = newMetrics.coverage.autosomal - oldMetrics.coverage.autosomal;
  if (coverageDiff > 5) {
    improvements.push(`+${coverageDiff.toFixed(1)}% chromosome coverage`);
  } else if (coverageDiff < -5) {
    regressions.push(`${coverageDiff.toFixed(1)}% chromosome coverage`);
    warnings.push('New data has reduced chromosome coverage');
  }
  
  // Compare resolution
  const resDiff = newMetrics.resolution - oldMetrics.resolution;
  if (resDiff > 10) {
    improvements.push(`Higher resolution (+${resDiff.toFixed(1)} SNPs/Mbp)`);
  } else if (resDiff < -10) {
    regressions.push(`Lower resolution (${resDiff.toFixed(1)} SNPs/Mbp)`);
  }
  
  // Compare health SNPs
  const healthDiff = newMetrics.healthSnps - oldMetrics.healthSnps;
  if (healthDiff > 0) {
    improvements.push(`+${healthDiff} clinically relevant SNPs`);
  } else if (healthDiff < 0) {
    regressions.push(`${healthDiff} clinically relevant SNPs`);
    warnings.push('New data is missing some health-related variants');
  }
  
  // Compare quality score
  const scoreDiff = newMetrics.qualityScore - oldMetrics.qualityScore;
  
  // Determine recommendation
  let recommendation: QualityComparison['recommendation'];
  
  if (scoreDiff >= 10) {
    recommendation = 'upgrade';
  } else if (scoreDiff <= -10) {
    recommendation = 'downgrade';
    warnings.push('New data appears to be lower quality than current data');
  } else if (improvements.length > regressions.length) {
    recommendation = 'upgrade';
  } else if (regressions.length > improvements.length) {
    recommendation = 'downgrade';
  } else {
    recommendation = 'similar';
  }
  
  // Flag for review if significant regressions
  if (regressions.length >= 2 || snpDiff < -5000) {
    recommendation = 'review';
  }
  
  const isUpgrade = recommendation === 'upgrade';
  const isSignificantUpgrade = isUpgrade && scoreDiff >= 20;
  
  return {
    isUpgrade,
    isSignificantUpgrade,
    metrics: {
      old: oldMetrics,
      new: newMetrics,
    },
    improvements,
    regressions,
    warnings,
    recommendation,
  };
}

/**
 * Get a human-readable quality summary
 */
export function getQualitySummary(metrics: GenomeQualityMetrics): string {
  const parts: string[] = [];
  
  parts.push(`${metrics.totalSnps.toLocaleString()} SNPs`);
  parts.push(`${metrics.coverage.autosomal.toFixed(1)}% coverage`);
  
  if (metrics.healthSnps > 0) {
    parts.push(`${metrics.healthSnps} health variants`);
  }
  
  parts.push(`Quality score: ${metrics.qualityScore}/100`);
  
  return parts.join(' • ');
}

/**
 * Format quality comparison for display
 */
export function formatQualityComparison(comparison: QualityComparison): string {
  const lines: string[] = [];
  
  lines.push('=== Genome Quality Comparison ===\n');
  
  lines.push(`Current:  ${getQualitySummary(comparison.metrics.old)}`);
  lines.push(`New:      ${getQualitySummary(comparison.metrics.new)}\n`);
  
  if (comparison.improvements.length > 0) {
    lines.push('Improvements:');
    for (const imp of comparison.improvements) {
      lines.push(`  ✅ ${imp}`);
    }
    lines.push('');
  }
  
  if (comparison.regressions.length > 0) {
    lines.push('Regressions:');
    for (const reg of comparison.regressions) {
      lines.push(`  ⚠️  ${reg}`);
    }
    lines.push('');
  }
  
  if (comparison.warnings.length > 0) {
    lines.push('Warnings:');
    for (const warn of comparison.warnings) {
      lines.push(`  ⚠️  ${warn}`);
    }
    lines.push('');
  }
  
  const recEmoji = comparison.recommendation === 'upgrade' ? '✅' :
                   comparison.recommendation === 'downgrade' ? '❌' :
                   comparison.recommendation === 'review' ? '⚠️' : 'ℹ️';
  
  lines.push(`Recommendation: ${recEmoji} ${comparison.recommendation.toUpperCase()}`);
  
  return lines.join('\n');
}

export default {
  calculateQualityMetrics,
  compareGenomeQuality,
  getQualitySummary,
  formatQualityComparison,
  HEALTH_SNPS,
  ANCESTRY_SNPS,
};
