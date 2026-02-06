/**
 * Traits Analysis Engine
 * 
 * Analyzes genome data against the traits database to generate
 * personalized trait predictions and reports.
 */

import type {
  GenomeData,
  Trait,
  TraitResult,
  TraitCategory,
  ConfidenceLevel,
  CategorySummary,
  TraitsReport,
  TraitComparison,
} from '~/types/traits';
import {
  TRAITS_DATABASE,
  getAllTraits,
  getTraitsByCategory,
  getRandomFunFact,
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_ICONS,
  CATEGORY_DESCRIPTIONS,
} from '~/data/traitsDatabase';

/**
 * Get the user's genotype for a specific SNP from their genome data
 */
export function getUserGenotype(
  genome: GenomeData,
  rsid: string
): string | null {
  const snp = genome.snps.find(s => s.rsid === rsid);
  return snp?.genotype || null;
}

/**
 * Find the best matching genotype mapping for a trait
 * Returns null if no match or if user has no data for the primary SNP
 */
export function findGenotypeMapping(
  trait: Trait,
  userGenotype: string
): typeof trait.genotypeMap[0] | null {
  if (!userGenotype) return null;
  
  // Normalize genotype (handle both "AT" and "TA" as same)
  const normalizedUser = normalizeGenotype(userGenotype);
  
  return (
    trait.genotypeMap.find(mapping => {
      const normalizedMapping = normalizeGenotype(mapping.genotype);
      return normalizedMapping === normalizedUser;
    }) || null
  );
}

/**
 * Normalize genotype for comparison (sort letters alphabetically)
 */
function normalizeGenotype(genotype: string): string {
  if (!genotype || genotype.length !== 2) return genotype;
  const chars = genotype.split('').sort();
  return chars.join('');
}

/**
 * Get a default/fallback mapping when no specific match is found
 */
function getDefaultMapping(trait: Trait): typeof trait.genotypeMap[0] {
  // Try to find the most common mapping (usually the middle one)
  const middleIndex = Math.floor(trait.genotypeMap.length / 2);
  return trait.genotypeMap[middleIndex] || trait.genotypeMap[0];
}

/**
 * Calculate trait confidence score based on:
 * - Number of SNPs available
 * - Trait's research confidence level
 * - Whether user's genotype was found
 */
export function calculateTraitConfidence(
  trait: Trait,
  userGenotype: string | null
): ConfidenceLevel {
  if (!userGenotype) {
    // Lower confidence if we don't have the user's data
    return demoteConfidence(trait.confidence);
  }
  
  // Base confidence from trait definition
  let confidence = trait.confidence;
  
  // Boost confidence if multiple SNPs are available for this trait
  if (trait.snps.length > 1) {
    confidence = promoteConfidence(confidence);
  }
  
  return confidence;
}

/**
 * Demote confidence level by one step
 */
function demoteConfidence(confidence: ConfidenceLevel): ConfidenceLevel {
  const levels: ConfidenceLevel[] = ['very-high', 'high', 'medium', 'low'];
  const index = levels.indexOf(confidence);
  return levels[Math.min(index + 1, levels.length - 1)];
}

/**
 * Promote confidence level by one step
 */
function promoteConfidence(confidence: ConfidenceLevel): ConfidenceLevel {
  const levels: ConfidenceLevel[] = ['low', 'medium', 'high', 'very-high'];
  const index = levels.indexOf(confidence);
  return levels[Math.max(index - 1, 0)];
}

/**
 * Generate explanation text based on trait and genotype
 */
function generateExplanation(
  trait: Trait,
  userGenotype: string | null,
  mapping: typeof trait.genotypeMap[0] | null
): string {
  if (!userGenotype) {
    return `We don't have your genetic data for the ${trait.snps[0]?.gene || 'relevant'} gene. This could be because your DNA test didn't cover this SNP.`;
  }
  
  if (!mapping) {
    return `Your genotype at ${trait.snps[0]?.rsid || 'the relevant SNP'} is ${userGenotype}, which is uncommon. Based on similar genotypes, ${getDefaultMapping(trait).description.toLowerCase()}.`;
  }
  
  const primarySnp = trait.snps[0];
  const geneName = primarySnp?.geneName || primarySnp?.gene || 'the relevant gene';
  
  return `Your genotype at ${primarySnp?.rsid} (${geneName}) is ${userGenotype}. This variant ${mapping.description.toLowerCase()}.`;
}

/**
 * Get a single trait result for a user
 */
export function getTraitResult(
  trait: Trait,
  genome: GenomeData
): TraitResult {
  // Get genotype for primary SNP
  const primarySnp = trait.snps[0];
  const userGenotype = primarySnp 
    ? getUserGenotype(genome, primarySnp.rsid)
    : null;
  
  // Find matching genotype mapping
  const mapping = userGenotype 
    ? findGenotypeMapping(trait, userGenotype)
    : null;
  
  // Determine phenotype
  const predictedPhenotype = mapping 
    ? mapping.phenotype
    : getDefaultMapping(trait).phenotype;
  
  // Calculate confidence
  const confidence = calculateTraitConfidence(trait, userGenotype);
  
  // Generate explanation
  const explanation = generateExplanation(trait, userGenotype, mapping);
  
  // Get random fun fact
  const funFact = getRandomFunFact(trait);
  
  return {
    trait,
    userGenotype,
    predictedPhenotype,
    confidence,
    explanation,
    funFact,
    matchedGenotype: mapping || undefined,
  };
}

/**
 * Analyze all traits for a genome
 */
export function analyzeTraits(genome: GenomeData): TraitResult[] {
  const allTraits = getAllTraits();
  return allTraits.map(trait => getTraitResult(trait, genome));
}

/**
 * Get traits filtered by category
 */
export function getCategoryTraits(category: TraitCategory): Trait[] {
  return getTraitsByCategory(category);
}

/**
 * Analyze traits for a specific category
 */
export function analyzeCategoryTraits(
  genome: GenomeData,
  category: TraitCategory
): TraitResult[] {
  const traits = getCategoryTraits(category);
  return traits.map(trait => getTraitResult(trait, genome));
}

/**
 * Generate category summary
 */
function generateCategorySummary(
  genome: GenomeData,
  category: TraitCategory
): CategorySummary {
  const traits = analyzeCategoryTraits(genome, category);
  const analyzedTraits = traits.filter(t => t.userGenotype !== null).length;
  
  return {
    category,
    displayName: CATEGORY_DISPLAY_NAMES[category],
    icon: CATEGORY_ICONS[category],
    totalTraits: traits.length,
    analyzedTraits,
    traits,
  };
}

/**
 * Find the most interesting traits (unique or unexpected results)
 */
function findMostInteresting(results: TraitResult[]): TraitResult[] {
  // Score each result based on interestingness
  const scored = results.map(result => {
    let score = 0;
    
    // High confidence results are more interesting
    if (result.confidence === 'very-high') score += 3;
    if (result.confidence === 'high') score += 2;
    
    // Rare phenotypes are interesting
    if (result.matchedGenotype?.frequency?.includes('~1') ||
        result.matchedGenotype?.frequency?.includes('~5')) {
      score += 3;
    }
    
    // Results with data are more interesting
    if (result.userGenotype) score += 1;
    
    // Certain categories are inherently interesting
    if (result.trait.category === 'sensory') score += 1;
    if (result.trait.category === 'miscellaneous') score += 1;
    
    return { result, score };
  });
  
  // Sort by score and return top 5
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5).map(s => s.result);
}

/**
 * Find rare traits (uncommon phenotypes)
 */
function findRareTraits(results: TraitResult[]): TraitResult[] {
  return results.filter(result => {
    const freq = result.matchedGenotype?.frequency;
    if (!freq) return false;
    // Look for rare frequencies (< 15%)
    const match = freq.match(/~(\d+)/);
    if (match) {
      const percentage = parseInt(match[1], 10);
      return percentage < 15;
    }
    return false;
  }).slice(0, 5);
}

/**
 * Find shareable traits (fun, easy to understand)
 */
function findShareableTraits(results: TraitResult[]): TraitResult[] {
  return results
    .filter(result => result.userGenotype !== null)
    .filter(result => result.confidence === 'high' || result.confidence === 'very-high')
    .slice(0, 5);
}

/**
 * Generate shareable summary text
 */
function generateShareableSummary(
  results: TraitResult[],
  categories: CategorySummary[]
): string {
  const analyzedCount = results.filter(r => r.userGenotype !== null).length;
  const totalTraits = results.length;
  
  const interesting = findMostInteresting(results);
  const topTrait = interesting[0];
  
  let summary = `I analyzed ${analyzedCount} genetic traits! `;
  
  if (topTrait) {
    summary += `My most interesting finding: I'm likely to have ${topTrait.predictedPhenotype.toLowerCase()} (${topTrait.trait.name}). `;
  }
  
  const categoriesWithData = categories.filter(c => c.analyzedTraits > 0);
  if (categoriesWithData.length > 0) {
    summary += `Discovered insights across ${categoriesWithData.length} trait categories.`;
  }
  
  return summary;
}

/**
 * Generate complete traits report
 */
export function generateTraitsReport(
  genome: GenomeData,
  reportId?: string
): TraitsReport {
  const allResults = analyzeTraits(genome);
  const analyzedCount = allResults.filter(r => r.userGenotype !== null).length;
  
  // Generate category summaries
  const categories: CategorySummary[] = [
    generateCategorySummary(genome, 'physical'),
    generateCategorySummary(genome, 'sensory'),
    generateCategorySummary(genome, 'behavioral'),
    generateCategorySummary(genome, 'abilities'),
    generateCategorySummary(genome, 'miscellaneous'),
  ];
  
  return {
    id: reportId || `traits-${genome.id}-${Date.now()}`,
    genomeId: genome.id,
    generatedAt: new Date(),
    totalTraits: allResults.length,
    analyzedTraits: analyzedCount,
    categories,
    highlights: {
      mostInteresting: findMostInteresting(allResults),
      rareTraits: findRareTraits(allResults),
      sharedTraits: findShareableTraits(allResults),
    },
    shareableSummary: generateShareableSummary(allResults, categories),
  };
}

/**
 * Compare traits between two genomes
 */
export function compareTraits(
  genomeA: GenomeData,
  genomeB: GenomeData
): TraitComparison[] {
  const allTraits = getAllTraits();
  
  return allTraits.map(trait => {
    const resultA = getTraitResult(trait, genomeA);
    const resultB = getTraitResult(trait, genomeB);
    
    // Determine similarity
    let similarity: 'identical' | 'similar' | 'different';
    if (resultA.predictedPhenotype === resultB.predictedPhenotype) {
      similarity = 'identical';
    } else if (
      resultA.trait.category === 'physical' &&
      arePhenotypesSimilar(resultA.predictedPhenotype, resultB.predictedPhenotype)
    ) {
      similarity = 'similar';
    } else {
      similarity = 'different';
    }
    
    return {
      trait,
      genomeAResult: resultA,
      genomeBResult: resultB,
      samePhenotype: resultA.predictedPhenotype === resultB.predictedPhenotype,
      similarity,
    };
  });
}

/**
 * Check if two phenotypes are similar (for comparison purposes)
 */
function arePhenotypesSimilar(phenotypeA: string, phenotypeB: string): boolean {
  const similarGroups = [
    ['Blue eyes', 'Green eyes', 'Hazel eyes'],
    ['Brown eyes', 'Dark brown eyes'],
    ['Straight hair', 'Wavy hair'],
    ['Curly hair', 'Coily hair'],
    ['Morning person', 'Intermediate'],
    ['Night owl', 'Intermediate'],
  ];
  
  return similarGroups.some(group => 
    group.includes(phenotypeA) && group.includes(phenotypeB)
  );
}

/**
 * Get statistics about the analysis
 */
export function getAnalysisStats(results: TraitResult[]) {
  const total = results.length;
  const analyzed = results.filter(r => r.userGenotype !== null).length;
  
  const byConfidence = results.reduce((acc, result) => {
    acc[result.confidence] = (acc[result.confidence] || 0) + 1;
    return acc;
  }, {} as Record<ConfidenceLevel, number>);
  
  const byCategory = results.reduce((acc, result) => {
    const cat = result.trait.category;
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<TraitCategory, number>);
  
  return {
    total,
    analyzed,
    coverage: total > 0 ? Math.round((analyzed / total) * 100) : 0,
    byConfidence,
    byCategory,
  };
}

/**
 * Format confidence level for display
 */
export function formatConfidence(confidence: ConfidenceLevel): string {
  const labels: Record<ConfidenceLevel, string> = {
    'very-high': 'Very High',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
  };
  return labels[confidence];
}

/**
 * Get confidence badge color
 */
export function getConfidenceColor(confidence: ConfidenceLevel): string {
  const colors: Record<ConfidenceLevel, string> = {
    'very-high': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    'high': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'medium': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'low': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  };
  return colors[confidence];
}

/**
 * Export shareable trait data
 */
export function getShareableTraitData(result: TraitResult) {
  return {
    traitName: result.trait.name,
    result: result.predictedPhenotype,
    funFact: result.funFact,
    emoji: result.trait.icon,
  };
}

/**
 * Filter trait results
 */
export function filterTraitResults(
  results: TraitResult[],
  options: {
    category?: TraitCategory | 'all';
    confidence?: ConfidenceLevel | 'all';
    search?: string;
    hasData?: boolean;
  }
): TraitResult[] {
  return results.filter(result => {
    // Filter by category
    if (options.category && options.category !== 'all') {
      if (result.trait.category !== options.category) return false;
    }
    
    // Filter by confidence
    if (options.confidence && options.confidence !== 'all') {
      if (result.confidence !== options.confidence) return false;
    }
    
    // Filter by search term
    if (options.search) {
      const query = options.search.toLowerCase();
      const matchesSearch =
        result.trait.name.toLowerCase().includes(query) ||
        result.trait.description.toLowerCase().includes(query) ||
        result.predictedPhenotype.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    // Filter by data availability
    if (options.hasData !== undefined) {
      const hasData = result.userGenotype !== null;
      if (hasData !== options.hasData) return false;
    }
    
    return true;
  });
}

// Export for debugging
// Traits Analysis Engine loaded (no console output in production)
