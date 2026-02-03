// Carrier Status Types

import type { SNP } from './genetics';

/**
 * Inheritance patterns for genetic conditions
 */
export enum InheritancePattern {
  AUTOSOMAL_RECESSIVE = 'autosomal_recessive',
  AUTOSOMAL_DOMINANT = 'autosomal_dominant',
  X_LINKED_RECESSIVE = 'x_linked_recessive',
  X_LINKED_DOMINANT = 'x_linked_dominant',
  Y_LINKED = 'y_linked',
  MITOCHONDRIAL = 'mitochondrial',
  MULTIFACTORIAL = 'multifactorial',
}

/**
 * Clinical significance levels for carrier findings
 */
export enum ClinicalSignificance {
  DEFINITIVE = 'definitive',
  STRONG = 'strong',
  MODERATE = 'moderate',
  LIMITED = 'limited',
  UNCERTAIN = 'uncertain',
}

/**
 * Carrier status types
 */
export type CarrierStatus = 'carrier' | 'not_carrier' | 'affected' | 'uncertain' | 'not_tested';

/**
 * Risk level for passing condition to offspring
 */
export type OffspringRisk = 'high' | 'moderate' | 'low' | 'negligible' | 'depends_on_partner';

/**
 * Pathogenic variant definition
 */
export interface PathogenicVariant {
  /** Variant identifier (e.g., rsID or HGVS notation) */
  id: string;
  /** Human-readable variant name */
  name: string;
  /** Genotype that indicates carrier/affected status */
  pathogenicGenotypes: string[];
  /** Associated SNP rsID if applicable */
  rsid?: string;
  /** Chromosome position if available */
  position?: number;
  /** Reference allele */
  ref?: string;
  /** Alternate allele */
  alt?: string;
  /** Variant frequency in general population */
  frequency?: Record<string, number>;
}

/**
 * Carrier condition definition
 */
export interface CarrierCondition {
  /** Unique identifier */
  id: string;
  /** Condition name */
  name: string;
  /** Gene symbol(s) associated with condition */
  gene: string;
  /** Full gene name */
  geneFullName?: string;
  /** Chromosome location */
  chromosome?: string;
  /** Inheritance pattern */
  inheritance: InheritancePattern;
  /** Condition description */
  description: string;
  /** Symptoms and effects */
  symptoms: string[];
  /** Treatment options */
  treatments: string[];
  /** Pathogenic variants to check */
  pathogenicVariants: PathogenicVariant[];
  /** Related SNPs that may indicate carrier status */
  associatedSNPs: string[];
  /** Population prevalence by ethnicity */
  prevalence: Record<string, string>;
  /** Clinical significance of testing */
  clinicalSignificance: ClinicalSignificance;
  /** Severity level */
  severity: 'critical' | 'high' | 'moderate' | 'low';
  /** Recommended actions if carrier */
  recommendations: string[];
  /** Educational resources */
  resources: Array<{
    title: string;
    url: string;
    type: 'website' | 'article' | 'support_group' | 'clinical';
  }>;
  /** Category of condition */
  category: string;
  /** Age of onset if known */
  ageOfOnset?: string;
  /** Whether prenatal testing is available */
  prenatalTestingAvailable: boolean;
  /** Whether newborn screening is available */
  newbornScreeningAvailable: boolean;
}

/**
 * Individual carrier result
 */
export interface CarrierResult {
  /** The condition tested */
  condition: CarrierCondition;
  /** Carrier status */
  status: CarrierStatus;
  /** Specific variants found in user's genome */
  variantsFound: PathogenicVariant[];
  /** User's genotype at the relevant SNPs */
  userGenotypes: Array<{
    rsid: string;
    genotype: string;
  }>;
  /** Explanation of findings */
  explanation: string;
  /** Risk to offspring */
  riskToOffspring: OffspringRisk;
  /** Detailed risk explanation */
  riskExplanation: string;
  /** Recommended actions based on results */
  recommendations: string[];
  /** Educational resources */
  resources: Array<{
    title: string;
    url: string;
    type: 'website' | 'article' | 'support_group' | 'clinical';
  }>;
  /** Timestamp of analysis */
  analyzedAt: Date;
  /** Whether genetic counseling is recommended */
  counselingRecommended: boolean;
  /** Urgency level */
  urgency: 'immediate' | 'high' | 'moderate' | 'low' | 'none';
}

/**
 * Complete carrier status report
 */
export interface CarrierReport {
  /** Report ID */
  id: string;
  /** Associated genome ID */
  genomeId: string;
  /** User ID */
  userId: string;
  /** Report generation timestamp */
  generatedAt: Date;
  /** Report version */
  version: string;
  /** Summary statistics */
  summary: {
    totalConditionsTested: number;
    carrierCount: number;
    affectedCount: number;
    uncertainCount: number;
    notCarrierCount: number;
    highRiskConditions: number;
    moderateRiskConditions: number;
    conditionsByCategory: Record<string, number>;
  };
  /** Detailed results */
  results: CarrierResult[];
  /** Results requiring immediate attention */
  criticalFindings: CarrierResult[];
  /** Results requiring genetic counseling */
  counselingRecommended: CarrierResult[];
  /** Overall recommendations */
  recommendations: string[];
  /** Important medical disclaimer */
  disclaimer: string;
  /** Next steps */
  nextSteps: string[];
}

/**
 * Partner carrier screening result (for risk calculation)
 */
export interface PartnerCarrierResult {
  /** Condition ID */
  conditionId: string;
  /** Partner's carrier status */
  isCarrier: boolean;
  /** Variants found in partner */
  variants?: string[];
}

/**
 * Combined risk calculation for couples
 */
export interface CombinedCarrierRisk {
  /** The condition */
  condition: CarrierCondition;
  /** User's carrier status */
  userStatus: CarrierStatus;
  /** Partner's carrier status */
  partnerStatus: CarrierStatus;
  /** Risk of child being affected */
  childRisk: number;
  /** Risk explanation */
  explanation: string;
  /** Recommended actions */
  recommendations: string[];
  /** Prenatal testing options */
  prenatalOptions: string[];
}

/**
 * Filter options for carrier results
 */
export interface CarrierFilterOptions {
  status?: CarrierStatus[];
  severity?: ('critical' | 'high' | 'moderate' | 'low')[];
  inheritance?: InheritancePattern[];
  category?: string[];
  counselingRequired?: boolean;
  search?: string;
}

/**
 * Genome data reference (minimal for carrier analysis)
 */
export interface GenomeData {
  id: string;
  userId: string;
  snps: SNP[];
}
