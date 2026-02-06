/**
 * Genetic Traits Analysis
 * 
 * Analyzes SNPs to predict genetic traits and characteristics.
 */

import type { SNP } from '~/types/genetics';
import type { 
  Trait, 
  TraitResult, 
  TraitCategory, 
  ConfidenceLevel,
  TraitsReport,
  CategorySummary,
} from '~/types/traits';
import { findSNP } from './genome/parser';

export interface TraitComparison {
  trait: Trait;
  genomeAResult: TraitResult;
  genomeBResult: TraitResult;
  samePhenotype: boolean;
  similarity: 'identical' | 'similar' | 'different';
}

// Re-export types
export type { Trait, TraitResult, TraitCategory, ConfidenceLevel, TraitsReport };

// Trait database - well-researched genetic associations
const TRAITS_DATABASE: Trait[] = [
  // Nutrition
  {
    id: 'lactose-tolerance',
    name: 'Lactose Tolerance',
    description: 'Ability to digest lactose in adulthood',
    category: 'physical' as TraitCategory,
    icon: '🥛',
    confidence: 'high' as ConfidenceLevel,
    snps: [
      { rsid: 'rs4988235', gene: 'MCM6/LCT' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Lactose intolerant', description: 'Higher risk of lactose intolerance' },
      { genotype: 'AG', phenotype: 'Reduced lactase production', description: 'Intermediate lactase production' },
      { genotype: 'AA', phenotype: 'Lactose tolerant', description: 'Normal lactase production' },
    ],
    funFacts: [
      'Lactose tolerance evolved independently in different populations around 10,000 years ago.',
      'About 65% of the global population is lactose intolerant.',
      'Northern European populations have the highest rates of lactose tolerance.',
    ],
  },
  {
    id: 'caffeine-metabolism',
    name: 'Caffeine Metabolism',
    description: 'How quickly your body processes caffeine',
    category: 'physical' as TraitCategory,
    icon: '☕',
    confidence: 'high' as ConfidenceLevel,
    snps: [
      { rsid: 'rs762551', gene: 'CYP1A2' },
    ],
    genotypeMap: [
      { genotype: 'AA', phenotype: 'Fast metabolizer', description: 'Fast caffeine metabolism' },
      { genotype: 'AC', phenotype: 'Intermediate metabolizer', description: 'Intermediate caffeine metabolism' },
      { genotype: 'CC', phenotype: 'Slow metabolizer', description: 'Slow caffeine metabolism' },
    ],
    funFacts: [
      'Slow metabolizers may have increased heart attack risk with high caffeine intake.',
      'Caffeine half-life ranges from 2-10 hours depending on genetics.',
      'Smoking induces CYP1A2, causing faster caffeine metabolism.',
    ],
  },
  
  // Fitness
  {
    id: 'muscle-fiber-type',
    name: 'Muscle Fiber Composition',
    description: 'Predisposition toward endurance vs power sports',
    category: 'abilities' as TraitCategory,
    icon: '💪',
    confidence: 'medium' as ConfidenceLevel,
    snps: [
      { rsid: 'rs1815739', gene: 'ACTN3' },
    ],
    genotypeMap: [
      { genotype: 'RR', phenotype: 'Power/sprint advantage', description: 'Protective variant' },
      { genotype: 'RX', phenotype: 'Mixed muscle composition', description: 'Neutral variant' },
      { genotype: 'XX', phenotype: 'Endurance advantage', description: 'Neutral variant' },
    ],
    funFacts: [
      'The "sprinter gene" variant is rare in endurance athletes.',
      'About 18% of the population has the XX (endurance) variant.',
      'Elite power athletes almost always have at least one R allele.',
    ],
  },
  {
    id: 'vitamin-d-levels',
    name: 'Vitamin D Levels',
    description: 'Genetic predisposition to vitamin D levels',
    category: 'physical' as TraitCategory,
    icon: '☀️',
    confidence: 'medium' as ConfidenceLevel,
    snps: [
      { rsid: 'rs2282679', gene: 'GC' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Higher vitamin D levels', description: 'Protective variant' },
      { genotype: 'GT', phenotype: 'Moderate vitamin D levels', description: 'Neutral variant' },
      { genotype: 'TT', phenotype: 'Lower vitamin D levels', description: 'Risk variant' },
    ],
    funFacts: [
      'Vitamin D deficiency affects over 1 billion people worldwide.',
      'Your GC genotype affects vitamin D binding protein levels.',
      'People with darker skin need more sun exposure for adequate vitamin D.',
    ],
  },
  
  // Appearance
  {
    id: 'eye-color',
    name: 'Eye Color Prediction',
    description: 'Genetic prediction of eye color',
    category: 'physical' as TraitCategory,
    icon: '👁️',
    confidence: 'medium' as ConfidenceLevel,
    snps: [
      { rsid: 'rs12913832', gene: 'HERC2' },
      { rsid: 'rs16891982', gene: 'SLC45A2' },
    ],
    genotypeMap: [
      { genotype: 'GG', phenotype: 'Blue/grey eyes likely', description: 'Neutral variant' },
      { genotype: 'AG', phenotype: 'Green/hazel eyes possible', description: 'Neutral variant' },
      { genotype: 'AA', phenotype: 'Brown eyes likely', description: 'Neutral variant' },
    ],
    funFacts: [
      'Blue eyes result from low melanin in the iris.',
      'All blue-eyed people share a common ancestor from 6,000-10,000 years ago.',
      'Eye color can change slightly throughout life.',
    ],
  },
  {
    id: 'red-hair',
    name: 'Red Hair Carrier Status',
    description: 'Likelihood of having or carrying red hair genes',
    category: 'physical' as TraitCategory,
    icon: '🦰',
    confidence: 'high' as ConfidenceLevel,
    snps: [
      { rsid: 'rs1805007', gene: 'MC1R' },
    ],
    genotypeMap: [
      { genotype: 'TT', phenotype: 'Likely red hair carrier', description: 'Neutral variant' },
      { genotype: 'CT', phenotype: 'Possible carrier', description: 'Neutral variant' },
      { genotype: 'CC', phenotype: 'Not a red hair variant', description: 'Neutral variant' },
    ],
    funFacts: [
      'Red hair is the rarest natural hair color (1-2% of population).',
      'MC1R variants also affect pain sensitivity and anesthesia requirements.',
      'Redheads often have fair skin and freckles.',
    ],
  },
];

/**
 * Analyze a genome for genetic traits
 */
export function analyzeTraits(snps: SNP[]): TraitResult[] {
  const results: TraitResult[] = [];
  
  for (const trait of TRAITS_DATABASE) {
    // Find user's genotype for this trait
    let userGenotype: string | null = null;
    let matchedSnp: { rsid: string; gene: string; } | null = null;
    
    for (const snpRef of trait.snps) {
      const snp = findSNP(snps, snpRef.rsid);
      if (snp) {
        userGenotype = snp.genotype;
        matchedSnp = snpRef;
        break;
      }
    }
    
    // Map genotype to phenotype
    let phenotype = 'Unknown';
    let description = '';
    
    if (userGenotype) {
      const mapping = trait.genotypeMap.find(
        m => m.genotype === userGenotype || 
             m.genotype === normalizeGenotype(userGenotype)
      );
      if (mapping) {
        phenotype = mapping.phenotype;
        description = mapping.description || '';
      }
    }
    
    // Generate explanation
    const explanation = generateExplanation(trait, userGenotype, phenotype, description);
    
    // Pick a random fun fact
    const funFact = trait.funFacts[Math.floor(Math.random() * trait.funFacts.length)];
    
    results.push({
      trait,
      userGenotype,
      predictedPhenotype: phenotype,
      confidence: userGenotype ? trait.confidence : 'low',
      explanation,
      funFact,
    });
  }
  
  return results;
}

/**
 * Normalize genotype for comparison
 */
function normalizeGenotype(genotype: string): string {
  // Handle phased genotypes (e.g., A|G -> AG)
  return genotype.replace(/[|/]/g, '');
}

/**
 * Generate explanation for trait result
 */
function generateExplanation(
  trait: Trait,
  genotype: string | null,
  phenotype: string,
  description: string
): string {
  if (!genotype) {
    return `We couldn't find the relevant genetic marker for ${trait.name} in your data.`;
  }
  
  return `Your ${trait.snps[0]?.gene || 'genetic'} variant (${genotype}) suggests ${phenotype.toLowerCase()}.${description ? ' ' + description : ''}`;
}

/**
 * Get traits by category
 */
export function getTraitsByCategory(category: TraitCategory): Trait[] {
  return TRAITS_DATABASE.filter(t => t.category === category);
}

/**
 * Compare traits between two genomes
 */
export function compareTraits(
  genomeASnps: SNP[],
  genomeBSnps: SNP[]
): TraitComparison[] {
  const resultsA = analyzeTraits(genomeASnps);
  const resultsB = analyzeTraits(genomeBSnps);
  
  const comparisons: TraitComparison[] = [];
  
  for (let i = 0; i < TRAITS_DATABASE.length; i++) {
    const trait = TRAITS_DATABASE[i];
    const resultA = resultsA[i];
    const resultB = resultsB[i];
    
    const samePhenotype = resultA.predictedPhenotype === resultB.predictedPhenotype;
    
    let similarity: TraitComparison['similarity'] = 'different';
    if (samePhenotype) {
      similarity = 'identical';
    } else if (resultA.userGenotype && resultB.userGenotype) {
      // Check if they're in the same description category (using description as proxy for impact)
      const mapA = trait.genotypeMap.find(m => m.phenotype === resultA.predictedPhenotype);
      const mapB = trait.genotypeMap.find(m => m.phenotype === resultB.predictedPhenotype);
      if (mapA?.description && mapB?.description && 
          (mapA.description.includes('Protective') && mapB.description.includes('Protective') ||
           mapA.description.includes('Risk') && mapB.description.includes('Risk') ||
           mapA.description.includes('Neutral') && mapB.description.includes('Neutral'))) {
        similarity = 'similar';
      }
    }
    
    comparisons.push({
      trait,
      genomeAResult: resultA,
      genomeBResult: resultB,
      samePhenotype,
      similarity,
    });
  }
  
  return comparisons;
}

/**
 * Get shareable trait data (for comparison/sharing)
 */
export function getShareableTraitData(traitResult: TraitResult): {
  emoji: string;
  traitName: string;
  result: string;
  funFact: string;
} | null {
  if (!traitResult) return null;
  return {
    emoji: traitResult.trait.icon || '✨',
    traitName: traitResult.trait.name,
    result: traitResult.predictedPhenotype,
    funFact: traitResult.funFact,
  };
}

/**
 * Generate traits report (legacy compatibility)
 */
export function generateTraitsReport(snps: SNP[]): TraitResult[] {
  return analyzeTraits(snps);
}

/**
 * Filter trait results by criteria
 */
export function filterTraitResults(
  results: TraitResult[],
  filters: {
    category?: TraitCategory;
    confidence?: ConfidenceLevel;
    minConfidence?: ConfidenceLevel;
  }
): TraitResult[] {
  return results.filter(r => {
    if (filters.category && r.trait.category !== filters.category) return false;
    if (filters.confidence && r.confidence !== filters.confidence) return false;
    if (filters.minConfidence) {
      const levels = { low: 1, medium: 2, high: 3 };
      if (levels[r.confidence] < levels[filters.minConfidence]) return false;
    }
    return true;
  });
}

/**
 * Get analysis statistics
 */
export function getAnalysisStats(results: TraitResult[]): {
  total: number;
  analyzed: number;
  coverage: number;
  byCategory: Record<string, number>;
  byConfidence: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  const byConfidence: Record<string, number> = {};
  
  for (const r of results) {
    byCategory[r.trait.category] = (byCategory[r.trait.category] || 0) + 1;
    byConfidence[r.confidence] = (byConfidence[r.confidence] || 0) + 1;
  }
  
  const analyzed = results.filter(r => r.userGenotype).length;
  
  return {
    total: results.length,
    analyzed,
    coverage: results.length > 0 ? (analyzed / results.length) * 100 : 0,
    byCategory,
    byConfidence,
  };
}

/**
 * Get all available traits
 */
export function getAllTraits(): Trait[] {
  return [...TRAITS_DATABASE];
}

/**
 * Get trait categories
 */
export function getTraitCategories(): TraitCategory[] {
  return ['physical', 'sensory', 'behavioral', 'abilities', 'miscellaneous'];
}
