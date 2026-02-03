/**
 * Ancestry Analysis Engine
 * 
 * Core ancestry analysis logic including:
 * - Ethnicity estimation using reference populations
 * - Admixture calculation algorithms
 * - Haplogroup determination
 * - Confidence scoring
 */

import type { 
  GenomeData, 
  SNP 
} from '~/types/genetics';
import type { 
  AncestryResult, 
  PopulationEstimate, 
  YHaplogroupResult, 
  MtHaplogroupResult,
  AIM,
  PopulationGroup,
  ConfidenceLevel 
} from '~/types/ancestry';
import { 
  ANCESTRY_INFORMATIVE_MARKERS, 
  getTopAIMs, 
  genotypeToAlleleFrequency,
  REFERENCE_POPULATIONS,
  POPULATION_SPECIFIC_MARKERS
} from '~/data/referencePopulations';
import { 
  determineYHaplogroup, 
  determineMtHaplogroup 
} from '~/data/haplogroups';

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_AIMS_REQUIRED = 20;
const CONFIDENCE_THRESHOLD_HIGH = 0.75;
const CONFIDENCE_THRESHOLD_MEDIUM = 0.50;
const POPULATION_GROUPS: PopulationGroup[] = [
  'European', 'African', 'East Asian', 'South Asian', 
  'Native American', 'Middle Eastern', 'Oceanian', 'Central Asian', 'Southeast Asian'
];

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Perform complete ancestry analysis on a genome
 */
export function analyzeAncestry(genome: GenomeData): AncestryResult {
  const snps = genome.snps;
  
  // Create lookup map for faster access
  const snpMap = new Map<string, SNP>(snps.map(s => [s.rsid.toLowerCase(), s]));
  
  // Estimate ethnicity proportions
  const ethnicity = estimateEthnicity(snps);
  
  // Determine haplogroups
  // Check for Y chromosome SNPs to determine if male
  const hasYChromosome = snps.some(s => 
    s.chromosome === 'Y' || s.chromosome === '24'
  );
  
  const yHaplogroup = hasYChromosome ? determineYHaplogroup(snps, true) : undefined;
  const mtHaplogroup = determineMtHaplogroup(snps);
  
  // Calculate overall confidence
  const confidence = calculateConfidence(ethnicity);
  
  return {
    ethnicity: ethnicity.sort((a, b) => b.percentage - a.percentage),
    yHaplogroup: yHaplogroup || undefined,
    mtHaplogroup,
    confidence,
    snpsAnalyzed: snps.length,
    analyzedAt: new Date(),
    version: '1.0.0',
  };
}

// ============================================================================
// ETHNICITY ESTIMATION
// ============================================================================

/**
 * Estimate ethnicity proportions using AIMs
 * Uses a simplified maximum likelihood approach
 */
export function estimateEthnicity(
  snps: SNP[], 
  snpMap?: Map<string, SNP>
): PopulationEstimate[] {
  const lookup = snpMap || new Map(snps.map(s => [s.rsid.toLowerCase(), s]));
  
  // Get top AIMs for analysis
  const aims = getTopAIMs(150);
  
  // Calculate likelihoods for each population
  const populationScores: Record<PopulationGroup, number> = {
    'European': 0,
    'African': 0,
    'East Asian': 0,
    'South Asian': 0,
    'Native American': 0,
    'Middle Eastern': 0,
    'Oceanian': 0,
    'Central Asian': 0,
    'Southeast Asian': 0,
  };
  
  const populationCounts: Record<PopulationGroup, number> = {
    'European': 0,
    'African': 0,
    'East Asian': 0,
    'South Asian': 0,
    'Native American': 0,
    'Middle Eastern': 0,
    'Oceanian': 0,
    'Central Asian': 0,
    'Southeast Asian': 0,
  };
  
  // Analyze each AIM
  for (const aim of aims) {
    const userSnp = lookup.get(aim.rsid.toLowerCase());
    if (!userSnp || userSnp.genotype === '--') {
      continue;
    }
    
    const userFreq = genotypeToAlleleFrequency(
      userSnp.genotype, 
      aim.refAllele, 
      aim.altAllele
    );
    
    // Calculate match score for each population
    for (const population of POPULATION_GROUPS) {
      const refFreq = aim.frequencies[population];
      const diff = Math.abs(userFreq - refFreq);
      // Inverse difference - closer match gets higher score
      const score = (1 - diff) * aim.informativeness;
      populationScores[population] += score;
      populationCounts[population]++;
    }
  }
  
  // Normalize scores to percentages
  const totalScore = Object.values(populationScores).reduce((a, b) => a + b, 0);
  
  if (totalScore === 0) {
    return POPULATION_GROUPS.map(pop => ({
      population: pop,
      percentage: 100 / POPULATION_GROUPS.length,
      confidence: 'very_low',
      region: getRegionForPopulation(pop),
    }));
  }
  
  // Calculate percentages and confidence
  const estimates: PopulationEstimate[] = [];
  
  for (const population of POPULATION_GROUPS) {
    const rawScore = populationScores[population];
    const count = populationCounts[population];
    const percentage = (rawScore / totalScore) * 100;
    
    if (percentage >= 1) {
      const confidence = determinePopulationConfidence(percentage, count);
      estimates.push({
        population,
        percentage: Math.round(percentage * 10) / 10,
        confidence,
        region: getRegionForPopulation(population),
      });
    }
  }
  
  // Normalize to ensure sum is 100%
  const sum = estimates.reduce((acc, e) => acc + e.percentage, 0);
  if (sum > 0 && Math.abs(sum - 100) > 0.1) {
    const factor = 100 / sum;
    for (const est of estimates) {
      est.percentage = Math.round(est.percentage * factor * 10) / 10;
    }
  }
  
  return estimates.sort((a, b) => b.percentage - a.percentage);
}

/**
 * Calculate confidence score for ancestry estimates
 */
export function calculateConfidence(
  estimates: PopulationEstimate[],
  snpMap?: Map<string, SNP> | null
): number {
  let confidence = 0.5; // Base confidence
  
  // Factor 1: Number of significant populations detected
  const significantPops = estimates.filter(e => e.percentage >= 5);
  confidence += Math.min(significantPops.length * 0.05, 0.15);
  
  // Factor 2: Clear majority population (indicates less admixture)
  const topEstimate = estimates[0];
  if (topEstimate) {
    if (topEstimate.percentage > 80) {
      confidence += 0.15;
    } else if (topEstimate.percentage > 50) {
      confidence += 0.10;
    } else if (topEstimate.percentage > 30) {
      confidence += 0.05;
    }
  }
  
  // Factor 3: Confidence levels of individual estimates
  const highConfCount = estimates.filter(e => e.confidence === 'high').length;
  const mediumConfCount = estimates.filter(e => e.confidence === 'medium').length;
  confidence += highConfCount * 0.05;
  confidence += mediumConfCount * 0.02;
  
  // Factor 4: Number of AIMs available (if snpMap provided)
  if (snpMap) {
    const aims = getTopAIMs(150);
    const matchingAims = aims.filter(aim => snpMap.has(aim.rsid.toLowerCase()));
    const aimRatio = matchingAims.length / aims.length;
    confidence += aimRatio * 0.15;
  }
  
  // Cap at 0.95 (never 100% certain)
  return Math.min(Math.round(confidence * 100) / 100, 0.95);
}

// ============================================================================
// ADDITIONAL ETHNICITY ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Detect fine-scale ancestry within a major population
 */
export function detectSubPopulation(
  snps: SNP[],
  majorPopulation: PopulationGroup
): { name: string; percentage: number; confidence: ConfidenceLevel }[] {
  const subPopulations: Record<PopulationGroup, Array<{ name: string; markers: string[] }>> = {
    'European': [
      { name: 'Northwest European', markers: ['rs12913832', 'rs1426654', 'rs16891982'] },
      { name: 'Mediterranean', markers: ['rs1805007', 'rs1805008'] },
      { name: 'Eastern European', markers: ['rs3827760', 'rs17822931'] },
      { name: 'Ashkenazi Jewish', markers: ['rs1426654', 'rs12913832'] },
    ],
    'African': [
      { name: 'West African', markers: ['rs1424584', 'rs2470102'] },
      { name: 'East African', markers: ['rs6058017', 'rs13289'] },
      { name: 'Central African', markers: ['rs885479', 'rs1042602'] },
      { name: 'Southern African', markers: ['rs885479', 'rs1042602'] },
    ],
    'East Asian': [
      { name: 'Northern Chinese', markers: ['rs3827760', 'rs17822931'] },
      { name: 'Southern Chinese', markers: ['rs3827760', 'rs10756819'] },
      { name: 'Japanese', markers: ['rs3827760', 'rs17822931'] },
      { name: 'Korean', markers: ['rs3827760', 'rs17822931'] },
    ],
    'South Asian': [
      { name: 'North Indian', markers: ['rs1426654', 'rs2470101'] },
      { name: 'South Indian', markers: ['rs2470101', 'rs183671'] },
      { name: 'Pakistani', markers: ['rs1426654', 'rs183671'] },
    ],
    'Native American': [
      { name: 'North American', markers: ['rs3827760', 'rs1876482'] },
      { name: 'Central American', markers: ['rs3827760', 'rs870347'] },
      { name: 'South American', markers: ['rs3827760', 'rs730570'] },
    ],
    'Middle Eastern': [
      { name: 'Arabian', markers: ['rs1393350', 'rs1426654'] },
      { name: 'Levantine', markers: ['rs1426654', 'rs1800407'] },
      { name: 'Iranian', markers: ['rs1426654', 'rs35264875'] },
    ],
    'Oceanian': [
      { name: 'Melanesian', markers: ['rs3811804', 'rs1126809'] },
      { name: 'Polynesian', markers: ['rs3811804', 'rs4405410'] },
    ],
    'Central Asian': [
      { name: 'Kazakh', markers: ['rs183671', 'rs2238006'] },
      { name: 'Uzbek', markers: ['rs183671', 'rs26548'] },
    ],
    'Southeast Asian': [
      { name: 'Thai', markers: ['rs17822931', 'rs3827760'] },
      { name: 'Vietnamese', markers: ['rs10756819', 'rs3827760'] },
      { name: 'Indonesian', markers: ['rs17822931', 'rs10756819'] },
    ],
  };
  
  const candidates = subPopulations[majorPopulation] || [];
  const snpMap = new Map(snps.map(s => [s.rsid.toLowerCase(), s]));
  const results: { name: string; percentage: number; confidence: ConfidenceLevel }[] = [];
  
  for (const candidate of candidates) {
    let matchCount = 0;
    let totalCount = 0;
    
    for (const marker of candidate.markers) {
      const snp = snpMap.get(marker.toLowerCase());
      if (snp && snp.genotype !== '--') {
        totalCount++;
        // Check if variant allele is present
        const aim = ANCESTRY_INFORMATIVE_MARKERS.find(a => a.rsid.toLowerCase() === marker.toLowerCase());
        if (aim && snp.genotype.includes(aim.altAllele)) {
          matchCount++;
        }
      }
    }
    
    if (totalCount > 0) {
      const percentage = (matchCount / totalCount) * 100;
      const confidence: ConfidenceLevel = percentage > 70 ? 'high' : percentage > 40 ? 'medium' : 'low';
      results.push({
        name: candidate.name,
        percentage: Math.round(percentage),
        confidence,
      });
    }
  }
  
  return results.sort((a, b) => b.percentage - a.percentage);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Determine confidence level for a population estimate
 */
function determinePopulationConfidence(
  percentage: number, 
  aimCount: number
): ConfidenceLevel {
  if (percentage >= 15 && aimCount >= 20) {
    return 'high';
  } else if (percentage >= 5 && aimCount >= 10) {
    return 'medium';
  } else if (percentage >= 1 && aimCount >= 5) {
    return 'low';
  }
  return 'very_low';
}

/**
 * Get geographic region for a population
 */
function getRegionForPopulation(population: PopulationGroup): string {
  const regions: Record<PopulationGroup, string> = {
    'European': 'Europe',
    'African': 'Africa',
    'East Asian': 'East Asia',
    'South Asian': 'South Asia',
    'Native American': 'Americas',
    'Middle Eastern': 'Middle East',
    'Oceanian': 'Oceania',
    'Central Asian': 'Central Asia',
    'Southeast Asian': 'Southeast Asia',
  };
  return regions[population];
}

/**
 * Get description for a population
 */
function getDescriptionForPopulation(population: PopulationGroup): string {
  const descriptions: Record<PopulationGroup, string> = {
    'European': 'Ancestry from European populations, including Western, Eastern, Southern, and Northern European subgroups.',
    'African': 'Ancestry from African populations, representing the deepest human genetic diversity.',
    'East Asian': 'Ancestry from East Asian populations, including Chinese, Japanese, and Korean peoples.',
    'South Asian': 'Ancestry from the Indian subcontinent, including Indian, Pakistani, and Bangladeshi populations.',
    'Native American': 'Indigenous ancestry from the Americas, representing the first human inhabitants of these continents.',
    'Middle Eastern': 'Ancestry from Middle Eastern populations, connecting Africa, Europe, and Asia.',
    'Oceanian': 'Indigenous ancestry from Australia, New Guinea, and Pacific Islands.',
    'Central Asian': 'Ancestry from Central Asian steppe populations, often showing mixed East Asian and European heritage.',
    'Southeast Asian': 'Ancestry from Southeast Asian populations, including Thai, Vietnamese, and Indonesian peoples.',
  };
  return descriptions[population];
}

// ============================================================================
// ANALYSIS RESULT HELPERS
// ============================================================================

/**
 * Get the dominant ancestry population
 */
export function getDominantAncestry(estimates: PopulationEstimate[]): PopulationEstimate | undefined {
  return estimates.length > 0 ? estimates[0] : undefined;
}

/**
 * Check if ancestry indicates mixed heritage
 */
export function isMixedAncestry(estimates: PopulationEstimate[]): boolean {
  if (estimates.length < 2) return false;
  
  const topTwo = estimates.slice(0, 2);
  const ratio = topTwo[0].percentage / topTwo[1].percentage;
  
  // If top two are within 3:1 ratio, considered mixed
  return ratio < 3;
}

/**
 * Get the number of distinct ancestry components above a threshold
 */
export function countAncestryComponents(
  estimates: PopulationEstimate[], 
  threshold: number = 5
): number {
  return estimates.filter(e => e.percentage >= threshold).length;
}

/**
 * Format ancestry results for display
 */
export function formatAncestryResults(result: AncestryResult): string {
  const lines: string[] = [];
  
  lines.push('=== Ancestry Analysis Results ===');
  lines.push('');
  
  lines.push('Ethnicity Estimates:');
  for (const est of result.ethnicity) {
    if (est.percentage >= 1) {
      lines.push(`  ${est.population}: ${est.percentage}% (${est.confidence} confidence)`);
    }
  }
  
  lines.push('');
  lines.push(`Overall Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  lines.push(`SNPs Analyzed: ${result.snpsAnalyzed}`);
  
  if (result.yHaplogroup) {
    lines.push('');
    lines.push(`Y-DNA Haplogroup: ${result.yHaplogroup.haplogroup}`);
    lines.push(`  Origin: ${result.yHaplogroup.origin}`);
    lines.push(`  Time Depth: ${result.yHaplogroup.timeDepth}`);
  }
  
  lines.push('');
  lines.push(`mtDNA Haplogroup: ${result.mtHaplogroup.haplogroup}`);
  lines.push(`  Origin: ${result.mtHaplogroup.origin}`);
  lines.push(`  Time Depth: ${result.mtHaplogroup.timeDepth}`);
  
  return lines.join('\n');
}

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Calculate genetic distance between two populations
 * Using FST approximation based on AIM frequencies
 */
export function calculateGeneticDistance(
  pop1: PopulationGroup, 
  pop2: PopulationGroup
): number {
  let sumSquaredDiff = 0;
  let count = 0;
  
  for (const aim of ANCESTRY_INFORMATIVE_MARKERS) {
    const freq1 = aim.frequencies[pop1];
    const freq2 = aim.frequencies[pop2];
    sumSquaredDiff += Math.pow(freq1 - freq2, 2);
    count++;
  }
  
  return Math.sqrt(sumSquaredDiff / count);
}

/**
 * Get similar populations based on genetic distance
 */
export function getSimilarPopulations(
  targetPop: PopulationGroup, 
  threshold: number = 0.3
): PopulationGroup[] {
  const similar: PopulationGroup[] = [];
  
  for (const pop of POPULATION_GROUPS) {
    if (pop === targetPop) continue;
    
    const distance = calculateGeneticDistance(targetPop, pop);
    if (distance < threshold) {
      similar.push(pop);
    }
  }
  
  return similar.sort((a, b) => 
    calculateGeneticDistance(targetPop, a) - calculateGeneticDistance(targetPop, b)
  );
}

// ============================================================================
// QUALITY CONTROL
// ============================================================================

/**
 * Check if genome data has sufficient coverage for ancestry analysis
 */
export function hasSufficientCoverage(snps: SNP[]): { 
  sufficient: boolean; 
  coverage: number;
  missingAims: number;
  recommendations: string[];
} {
  const aims = getTopAIMs(100);
  const snpMap = new Map(snps.map(s => [s.rsid.toLowerCase(), s]));
  
  let foundAims = 0;
  const missingAimIds: string[] = [];
  
  for (const aim of aims) {
    if (snpMap.has(aim.rsid.toLowerCase())) {
      foundAims++;
    } else {
      missingAimIds.push(aim.rsid);
    }
  }
  
  const coverage = foundAims / aims.length;
  const sufficient = coverage >= 0.3; // Need at least 30% of AIMs
  
  const recommendations: string[] = [];
  if (!sufficient) {
    recommendations.push('Consider uploading data from a different testing provider with better ancestry coverage.');
    recommendations.push(`Missing ${missingAimIds.length} key ancestry markers.`);
  }
  if (coverage < 0.5) {
    recommendations.push('Results may have reduced accuracy due to limited marker coverage.');
  }
  
  return {
    sufficient,
    coverage: Math.round(coverage * 100) / 100,
    missingAims: missingAimIds.length,
    recommendations,
  };
}

console.log('Ancestry analysis engine loaded');
