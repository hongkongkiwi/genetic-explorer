// Traits Analysis System Types

/**
 * Trait Category - Organizes traits into logical groups
 */
export type TraitCategory =
  | 'physical'
  | 'sensory'
  | 'behavioral'
  | 'abilities'
  | 'miscellaneous';

/**
 * Confidence Level - Indicates reliability of trait prediction
 */
export type ConfidenceLevel = 'very-high' | 'high' | 'medium' | 'low';

/**
 * Genotype Mapping - Maps specific genotypes to phenotypes
 */
export interface GenotypeMapping {
  genotype: string;
  phenotype: string;
  description: string;
  frequency?: string;
}

/**
 * SNP Reference - Links trait to specific genetic variant(s)
 */
export interface SNPReference {
  rsid: string;
  chromosome?: string;
  position?: number;
  gene: string;
  geneName?: string;
}

/**
 * Trait Definition - Complete information about a genetic trait
 */
export interface Trait {
  id: string;
  name: string;
  description: string;
  category: TraitCategory;
  icon: string;
  snps: SNPReference[];
  genotypeMap: GenotypeMapping[];
  confidence: ConfidenceLevel;
  funFacts: string[];
  scientificDetails?: string;
  references?: string[];
}

/**
 * Trait Result - Analysis result for a specific trait
 */
export interface TraitResult {
  trait: Trait;
  userGenotype: string | null;
  predictedPhenotype: string;
  confidence: ConfidenceLevel;
  explanation: string;
  funFact: string;
  matchedGenotype?: GenotypeMapping;
}

/**
 * Category Summary - Summary statistics for a trait category
 */
export interface CategorySummary {
  category: TraitCategory;
  displayName: string;
  icon: string;
  totalTraits: number;
  analyzedTraits: number;
  traits: TraitResult[];
}

/**
 * Traits Report - Complete traits analysis report
 */
export interface TraitsReport {
  id: string;
  genomeId: string;
  generatedAt: Date;
  totalTraits: number;
  analyzedTraits: number;
  categories: CategorySummary[];
  highlights: {
    mostInteresting: TraitResult[];
    rareTraits: TraitResult[];
    sharedTraits: TraitResult[];
  };
  shareableSummary: string;
}

/**
 * Trait Share Data - Data for sharing a trait result
 */
export interface TraitShareData {
  traitName: string;
  result: string;
  funFact: string;
  emoji: string;
}

/**
 * Genome Data reference (from genetics.ts)
 */
export interface GenomeData {
  id: string;
  userId: string;
  filename: string;
  source: '23andme' | 'ancestry' | 'myheritage' | 'other';
  snpCount: number;
  processedAt: Date;
  snps: Array<{
    rsid: string;
    chromosome: string;
    position: number;
    genotype: string;
    gene?: string;
  }>;
}

/**
 * Trait Filter Options
 */
export interface TraitFilterOptions {
  category?: TraitCategory | 'all';
  confidence?: ConfidenceLevel | 'all';
  search?: string;
}

/**
 * Trait Comparison Result
 */
export interface TraitComparison {
  trait: Trait;
  genomeAResult: TraitResult;
  genomeBResult: TraitResult;
  samePhenotype: boolean;
  similarity: 'identical' | 'similar' | 'different';
}
