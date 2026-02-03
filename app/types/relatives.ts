// DNA Relative Matching System Types

import type { SNP, GenomeData } from './genetics';

/**
 * Relationship Type - Categories of genetic relationships
 */
export type RelationshipType =
  | 'identical_twin'
  | 'parent_child'
  | 'full_sibling'
  | 'grandparent'
  | 'half_sibling'
  | 'aunt_uncle'
  | 'first_cousin'
  | 'first_cousin_once_removed'
  | 'second_cousin'
  | 'second_cousin_once_removed'
  | 'third_cousin'
  | 'distant_cousin'
  | 'unrelated';

/**
 * Confidence Level - Indicates reliability of relationship prediction
 */
export type ConfidenceLevel = 'very_high' | 'high' | 'medium' | 'low' | 'very_low';

/**
 * IBD (Identity by Descent) Segment - A shared DNA segment
 * inherited from a common ancestor
 */
export interface IBD_Segment {
  /** Chromosome number (1-22, X, Y) */
  chromosome: string;
  /** Start position on the chromosome */
  start: number;
  /** End position on the chromosome */
  end: number;
  /** Length in base pairs */
  lengthBP: number;
  /** Length in centimorgans (cM) */
  centimorgans: number;
  /** Number of SNPs in this segment */
  snpCount: number;
}

/**
 * Shared DNA Result - Summary of shared genetic material
 */
export interface SharedDNAResult {
  /** Percentage of DNA shared (0-100) */
  percentage: number;
  /** Total shared DNA in centimorgans */
  centimorgans: number;
  /** Number of shared IBD segments */
  segments: number;
  /** Largest single segment in cM */
  largestSegment: number;
  /** Average segment size in cM */
  averageSegment: number;
  /** Detailed IBD segments */
  ibdSegments: IBD_Segment[];
  /** Number of shared SNPs */
  sharedSNPs: number;
  /** Total SNPs compared */
  totalSNPsCompared: number;
}

/**
 * Relationship Prediction - Predicted relationship based on shared DNA
 */
export interface RelationshipPrediction {
  /** Primary predicted relationship type */
  type: RelationshipType;
  /** Display name for the relationship */
  displayName: string;
  /** Confidence level of the prediction */
  confidence: ConfidenceLevel;
  /** Possible alternative relationships */
  possibleRelationships: string[];
  /** Probability scores for each possible relationship (0-1) */
  probabilities?: Record<string, number>;
  /** Expected range of shared cM for this relationship */
  expectedRange: {
    min: number;
    max: number;
    average: number;
  };
}

/**
 * Relative Match - A matched relative with all details
 */
export interface RelativeMatch {
  /** Unique identifier for the relative (hashed) */
  relativeId: string;
  /** Display name or identifier */
  relativeName: string;
  /** Avatar URL or initials */
  avatar?: string;
  /** Shared DNA summary */
  sharedDNA: SharedDNAResult;
  /** Predicted relationship */
  predictedRelationship: RelationshipPrediction;
  /** IBD segments */
  ibdSegments: IBD_Segment[];
  /** Whether the user has opted in to matching */
  optInStatus: boolean;
  /** Whether the match is visible to the user */
  isVisible: boolean;
  /** Whether the user has hidden this match */
  isHidden: boolean;
  /** Whether the match has been contacted */
  hasContacted: boolean;
  /** Match timestamp */
  matchedAt: Date;
  /** Last activity timestamp */
  lastActivityAt?: Date;
  /** User's ancestry regions/ethnicity estimate (if shared) */
  ancestryRegions?: string[];
  /** Maternal or paternal side hint (if determined) */
  side?: 'maternal' | 'paternal' | 'both' | 'unknown';
  /** Common ancestors (if identified) */
  commonAncestors?: Array<{
    name: string;
    relationship: string;
    confidence: ConfidenceLevel;
  }>;
}

/**
 * Genome Comparison - Detailed comparison between two genomes
 */
export interface GenomeComparison {
  /** First genome */
  genomeA: {
    id: string;
    name: string;
  };
  /** Second genome */
  genomeB: {
    id: string;
    name: string;
  };
  /** Shared DNA summary */
  sharedDNA: SharedDNAResult;
  /** Predicted relationship */
  predictedRelationship: RelationshipPrediction;
  /** Chromosome-by-chromosome comparison */
  chromosomeComparisons: ChromosomeComparison[];
  /** Comparison timestamp */
  comparedAt: Date;
  /** Overall similarity score (0-100) */
  similarityScore: number;
}

/**
 * Chromosome Comparison - Comparison for a single chromosome
 */
export interface ChromosomeComparison {
  /** Chromosome number */
  chromosome: string;
  /** Chromosome length in base pairs */
  lengthBP: number;
  /** IBD segments on this chromosome */
  ibdSegments: IBD_Segment[];
  /** Total shared cM on this chromosome */
  sharedCM: number;
  /** Number of shared SNPs */
  sharedSNPs: number;
  /** Total SNPs on this chromosome */
  totalSNPs: number;
  /** Percentage of chromosome shared */
  coverage: number;
}

/**
 * Match Filter Options - Options for filtering relative matches
 */
export interface MatchFilterOptions {
  /** Filter by relationship type */
  relationshipType?: RelationshipType | 'all';
  /** Filter by minimum shared cM */
  minSharedCM?: number;
  /** Filter by maximum shared cM */
  maxSharedCM?: number;
  /** Filter by confidence level */
  minConfidence?: ConfidenceLevel;
  /** Search by name */
  search?: string;
  /** Show only opted-in matches */
  optInOnly?: boolean;
  /** Show hidden matches */
  includeHidden?: boolean;
  /** Filter by side (maternal/paternal) */
  side?: 'maternal' | 'paternal' | 'both' | 'unknown';
}

/**
 * Match Sort Options - Sorting options for relative matches
 */
export type MatchSortField = 
  | 'sharedCM' 
  | 'relationship' 
  | 'name' 
  | 'matchedAt' 
  | 'largestSegment';

export interface MatchSortOptions {
  field: MatchSortField;
  direction: 'asc' | 'desc';
}

/**
 * Privacy Settings for Relative Matching
 */
export interface RelativeMatchingPrivacy {
  /** Whether the user has opted in to relative matching */
  optIn: boolean;
  /** Whether to show ancestry regions to matches */
  showAncestry: boolean;
  /** Whether to allow contact from matches */
  allowContact: boolean;
  /** Whether to show real name or just identifier */
  showRealName: boolean;
  /** Whether to share ethnicity estimate */
  shareEthnicity: boolean;
  /** Specific matches to hide */
  hiddenMatches: string[];
  /** Whether to show side predictions */
  showSidePredictions: boolean;
}

/**
 * Match List Response - Paginated list of relative matches
 */
export interface MatchListResponse {
  matches: RelativeMatch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalMatches: number;
    closeMatches: number; // > 200 cM
    distantMatches: number; // < 50 cM
    pendingContact: number;
  };
}

/**
 * Relationship Range - Expected DNA sharing range for a relationship
 */
export interface RelationshipRange {
  type: RelationshipType;
  displayName: string;
  description: string;
  cMRange: {
    min: number;
    max: number;
    average: number;
  };
  percentageRange: {
    min: number;
    max: number;
  };
  possibleAlternatives: string[];
}

/**
 * Contact Request - Request to contact a match
 */
export interface ContactRequest {
  id: string;
  matchId: string;
  fromUserId: string;
  toUserId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  respondedAt?: Date;
}

/**
 * Shared Ancestor Hint - Hint about potential common ancestors
 */
export interface SharedAncestorHint {
  confidence: ConfidenceLevel;
  relationshipPath: string;
  suggestedGeneration: number;
  sharedMatches: string[];
}
