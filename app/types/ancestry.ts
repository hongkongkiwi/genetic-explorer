/**
 * Ancestry Analysis Types
 * 
 * Type definitions for ancestry analysis including ethnicity estimation,
 * haplogroup determination, and ancestry reports.
 */

import type { SNP, GenomeData } from './genetics';

/**
 * Major population groups for ancestry analysis
 */
export type PopulationGroup =
  | 'European'
  | 'African'
  | 'East Asian'
  | 'South Asian'
  | 'Native American'
  | 'Middle Eastern'
  | 'Oceanian'
  | 'Central Asian'
  | 'Southeast Asian';

/**
 * Confidence level for ancestry estimates
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'very_low';

/**
 * Individual population estimate with percentage and confidence
 */
export interface PopulationEstimate {
  /** Population group name */
  population: PopulationGroup;
  /** Estimated percentage (0-100) */
  percentage: number;
  /** Confidence level for this estimate */
  confidence: ConfidenceLevel;
  /** Geographic region description */
  region?: string;
  /** Sub-populations within this group */
  subPopulations?: SubPopulationEstimate[];
}

/**
 * Sub-population estimate (e.g., Northern European within European)
 */
export interface SubPopulationEstimate {
  /** Sub-population name */
  name: string;
  /** Estimated percentage within parent population (0-100) */
  percentage: number;
  /** Geographic region */
  region: string;
  /** Description of this sub-population */
  description?: string;
}

/**
 * Y-DNA haplogroup result
 */
export interface YHaplogroupResult {
  /** Haplogroup designation (e.g., 'R1b1a2', 'E1b1b1a') */
  haplogroup: string;
  /** Human-readable name */
  name: string;
  /** Detailed description */
  description: string;
  /** Geographic origin */
  origin: string;
  /** Time of origin (years before present) */
  timeDepth: string;
  /** Migration path description */
  migrationPath: string;
  /** Defining SNPs found */
  definingSnps: string[];
  /** Confidence in assignment */
  confidence: ConfidenceLevel;
  /** Subclade information */
  subclade?: string;
  /** Famous members with this haplogroup */
  notableMembers?: string[];
}

/**
 * mtDNA haplogroup result
 */
export interface MtHaplogroupResult {
  /** Haplogroup designation (e.g., 'H1', 'U5b2a') */
  haplogroup: string;
  /** Human-readable name */
  name: string;
  /** Detailed description */
  description: string;
  /** Geographic origin */
  origin: string;
  /** Time of origin (years before present) */
  timeDepth: string;
  /** Migration path description */
  migrationPath: string;
  /** Defining variants found */
  definingVariants: string[];
  /** Confidence in assignment */
  confidence: ConfidenceLevel;
  /** Subclade information */
  subclade?: string;
  /** Regional distribution */
  distribution?: string;
}

/**
 * Combined haplogroup result
 */
export interface HaplogroupResult {
  /** Y-DNA haplogroup (for males only) */
  yHaplogroup?: YHaplogroupResult;
  /** mtDNA haplogroup */
  mtHaplogroup: MtHaplogroupResult;
  /** Whether Y-DNA analysis was performed */
  hasYdna: boolean;
}

/**
 * Ancestry-informative marker (AIM)
 */
export interface AIM {
  /** RSID of the SNP */
  rsid: string;
  /** Chromosome location */
  chromosome: string;
  /** Position on chromosome */
  position: number;
  /** Reference allele */
  refAllele: string;
  /** Alternate allele */
  altAllele: string;
  /** Gene (if known) */
  gene?: string;
  /** Allele frequencies by population */
  frequencies: Record<PopulationGroup, number>;
  /** Discrimination power (0-1) */
  informativeness: number;
  /** Phenotypic effect (if any) */
  phenotype?: string;
}

/**
 * Reference population data
 */
export interface ReferencePopulation {
  /** Population identifier */
  id: string;
  /** Population name */
  name: PopulationGroup;
  /** Geographic region */
  region: string;
  /** Sub-region or country */
  subRegion?: string;
  /** Population description */
  description: string;
  /** Sample size in reference panel */
  sampleSize: number;
  /** List of AIMs with frequencies for this population */
  alleleFrequencies: Record<string, number>;
  /** Representative samples (optional) */
  samples?: string[];
}

/**
 * Admixture analysis result
 */
export interface AdmixtureResult {
  /** Population estimates sorted by percentage */
  populations: PopulationEstimate[];
  /** Number of AIMs used in analysis */
  aimsUsed: number;
  /** Overall confidence score (0-1) */
  confidenceScore: number;
  /** Analysis method used */
  method: string;
}

/**
 * Chromosome painting segment
 */
export interface AncestrySegment {
  /** Chromosome number */
  chromosome: string;
  /** Start position */
  start: number;
  /** End position */
  end: number;
  /** Assigned population */
  population: PopulationGroup;
  /** Confidence in assignment */
  confidence: number;
  /** Segment length in centiMorgans (if calculated) */
  cM?: number;
  /** Number of SNPs in segment */
  snpCount: number;
}

/**
 * Main ancestry analysis result
 */
export interface AncestryResult {
  /** Ethnicity estimates (admixture analysis) */
  ethnicity: PopulationEstimate[];
  /** Y-DNA haplogroup (if available) */
  yHaplogroup?: YHaplogroupResult;
  /** mtDNA haplogroup */
  mtHaplogroup: MtHaplogroupResult;
  /** Overall confidence score (0-1) */
  confidence: number;
  /** Number of SNPs analyzed */
  snpsAnalyzed: number;
  /** Analysis timestamp */
  analyzedAt: Date;
  /** Analysis version */
  version: string;
}

/**
 * Detailed ancestry report
 */
export interface AncestryReport {
  /** Report ID */
  id: string;
  /** Associated genome ID */
  genomeId: string;
  /** Report generation timestamp */
  generatedAt: Date;
  /** Main ancestry result */
  ancestry: AncestryResult;
  /** Chromosome painting data (if available) */
  chromosomePainting?: AncestrySegment[];
  /** Recent ancestor locations (if inferred) */
  recentAncestorLocations?: RecentAncestorLocation[];
  /** Neanderthal ancestry estimate */
  neanderthalAncestry?: NeanderthalAncestry;
  /** Denisovan ancestry estimate */
  denisovanAncestry?: DenisovanAncestry;
  /** Population matches in reference database */
  populationMatches?: PopulationMatch[];
  /** Health insights related to ancestry */
  healthInsights?: AncestryHealthInsight[];
}

/**
 * Recent ancestor location
 */
export interface RecentAncestorLocation {
  /** Geographic location */
  location: string;
  /** Country/Region */
  country: string;
  /** Confidence level */
  confidence: ConfidenceLevel;
  /** Estimated timeframe */
  timeframe: string;
  /** Match strength (0-1) */
  matchStrength: number;
}

/**
 * Neanderthal ancestry estimate
 */
export interface NeanderthalAncestry {
  /** Percentage of Neanderthal ancestry */
  percentage: number;
  /** Number of Neanderthal variants found */
  variantCount: number;
  /** Comparison to population average */
  comparisonToAverage: 'higher' | 'average' | 'lower';
  /** Notable Neanderthal variants */
  notableVariants?: string[];
}

/**
 * Denisovan ancestry estimate
 */
export interface DenisovanAncestry {
  /** Percentage of Denisovan ancestry */
  percentage: number;
  /** Number of Denisovan variants found */
  variantCount: number;
  /** Comparison to population average */
  comparisonToAverage: 'higher' | 'average' | 'lower';
}

/**
 * Population match in reference database
 */
export interface PopulationMatch {
  /** Population name */
  population: string;
  /** Region */
  region: string;
  /** Genetic distance */
  geneticDistance: number;
  /** Similarity score (0-1) */
  similarity: number;
  /** Sample size of reference */
  sampleSize: number;
}

/**
 * Health insight related to ancestry
 */
export interface AncestryHealthInsight {
  /** Category of insight */
  category: string;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Related populations */
  relatedPopulations: PopulationGroup[];
  /** Risk level if applicable */
  riskLevel?: 'high' | 'moderate' | 'low' | 'protective';
  /** Recommendations */
  recommendations?: string[];
}

/**
 * Y-DNA haplogroup definition
 */
export interface YHaplogroupDefinition {
  /** Haplogroup name */
  haplogroup: string;
  /** Parent haplogroup */
  parent?: string;
  /** Defining SNPs */
  definingSnps: string[];
  /** ISOGG or YTree position */
  position?: string;
  /** Geographic origin */
  origin: string;
  /** Time estimate */
  timeEstimate: string;
  /** Description */
  description: string;
}

/**
 * mtDNA haplogroup definition
 */
export interface MtHaplogroupDefinition {
  /** Haplogroup name */
  haplogroup: string;
  /** Parent haplogroup */
  parent?: string;
  /** Defining variants (HGVS notation) */
  definingVariants: string[];
  /** Reference genome positions */
  positions: number[];
  /** Geographic origin */
  origin: string;
  /** Time estimate */
  timeEstimate: string;
  /** Description */
  description: string;
}

/**
 * Ancestry analysis options
 */
export interface AncestryAnalysisOptions {
  /** Minimum confidence threshold for reporting */
  minConfidence?: number;
  /** Whether to include sub-population analysis */
  includeSubPopulations?: boolean;
  /** Whether to perform chromosome painting */
  includeChromosomePainting?: boolean;
  /** Whether to analyze Neanderthal variants */
  includeNeanderthal?: boolean;
  /** Reference population set to use */
  referenceSet?: 'global' | 'european' | 'asian' | 'african';
  /** Analysis algorithm to use */
  algorithm?: 'admixture' | 'pca' | 'matching';
}

/**
 * Ancestry analysis progress
 */
export interface AncestryAnalysisProgress {
  /** Current stage */
  stage: 'preparing' | 'quality_control' | 'admixture' | 'haplogroups' | 'chromosome_painting' | 'finalizing';
  /** Progress percentage (0-100) */
  progress: number;
  /** Status message */
  message: string;
  /** Details about current step */
  details?: string;
}

/**
 * Quality control metrics for ancestry analysis
 */
export interface AncestryQCMetrics {
  /** Total SNPs in sample */
  totalSnps: number;
  /** SNPs overlapping with reference panel */
  overlappingSnps: number;
  /** SNPs used in analysis */
  usedSnps: number;
  /** Call rate (fraction of non-missing genotypes) */
  callRate: number;
  /** Whether sample passes QC */
  passesQC: boolean;
  /** QC warnings */
  warnings?: string[];
}

/**
 * Haplogroup prediction result with probabilities
 */
export interface HaplogroupPrediction {
  /** Predicted haplogroup */
  haplogroup: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Alternative possibilities */
  alternatives: Array<{
    haplogroup: string;
    confidence: number;
  }>;
  /** Supporting SNPs found */
  supportingSnps: string[];
  /** Contradictory SNPs found */
  contradictorySnps: string[];
  /** Missing expected SNPs */
  missingSnps: string[];
}
