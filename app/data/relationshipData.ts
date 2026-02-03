// DNA Relationship Data
// Expected shared DNA ranges and descriptions for various relationship types

import type { RelationshipRange, RelationshipType, ConfidenceLevel } from '~/types/relatives';

/**
 * Expected shared DNA ranges for each relationship type
 * Based on statistical averages from genetic genealogy research
 */
export const RELATIONSHIP_RANGES: RelationshipRange[] = [
  {
    type: 'identical_twin',
    displayName: 'Identical Twin',
    description: 'Genetically identical - shares 100% of DNA',
    cMRange: { min: 3400, max: 3700, average: 3500 },
    percentageRange: { min: 99.9, max: 100 },
    possibleAlternatives: [],
  },
  {
    type: 'parent_child',
    displayName: 'Parent or Child',
    description: 'Direct parent-child relationship - shares exactly 50% of DNA',
    cMRange: { min: 3300, max: 3700, average: 3500 },
    percentageRange: { min: 49, max: 51 },
    possibleAlternatives: ['Parent', 'Child'],
  },
  {
    type: 'full_sibling',
    displayName: 'Full Sibling',
    description: 'Shares both parents - on average 50% of DNA (range: 38-61%)',
    cMRange: { min: 2600, max: 3400, average: 2800 },
    percentageRange: { min: 38, max: 61 },
    possibleAlternatives: ['Full Sister', 'Full Brother'],
  },
  {
    type: 'grandparent',
    displayName: 'Grandparent',
    description: 'Grandparent or grandchild - shares approximately 25% of DNA',
    cMRange: { min: 1700, max: 2300, average: 1750 },
    percentageRange: { min: 17, max: 34 },
    possibleAlternatives: ['Grandmother', 'Grandfather', 'Grandchild'],
  },
  {
    type: 'half_sibling',
    displayName: 'Half Sibling',
    description: 'Shares one parent - on average 25% of DNA',
    cMRange: { min: 1300, max: 2300, average: 1750 },
    percentageRange: { min: 17, max: 34 },
    possibleAlternatives: ['Half Sister', 'Half Brother'],
  },
  {
    type: 'aunt_uncle',
    displayName: 'Aunt or Uncle',
    description: 'Parent\'s sibling or their child (niece/nephew) - ~25% DNA',
    cMRange: { min: 1700, max: 2600, average: 1750 },
    percentageRange: { min: 17, max: 34 },
    possibleAlternatives: ['Aunt', 'Uncle', 'Niece', 'Nephew'],
  },
  {
    type: 'first_cousin',
    displayName: 'First Cousin',
    description: 'Child of parent\'s sibling - shares ~12.5% of DNA on average',
    cMRange: { min: 680, max: 1300, average: 880 },
    percentageRange: { min: 7, max: 15 },
    possibleAlternatives: ['First Cousin', 'Great-Aunt/Uncle', 'Half-Aunt/Uncle'],
  },
  {
    type: 'first_cousin_once_removed',
    displayName: 'First Cousin Once Removed',
    description: 'First cousin\'s child or parent\'s first cousin - ~6.25% DNA',
    cMRange: { min: 340, max: 850, average: 440 },
    percentageRange: { min: 3, max: 8 },
    possibleAlternatives: ['First Cousin Once Removed', 'Half First Cousin'],
  },
  {
    type: 'second_cousin',
    displayName: 'Second Cousin',
    description: 'Shares great-grandparents - shares ~3.125% of DNA on average',
    cMRange: { min: 180, max: 550, average: 230 },
    percentageRange: { min: 1.5, max: 5 },
    possibleAlternatives: ['Second Cousin', 'First Cousin Twice Removed'],
  },
  {
    type: 'second_cousin_once_removed',
    displayName: 'Second Cousin Once Removed',
    description: 'Second cousin\'s child or parent\'s second cousin - ~1.56% DNA',
    cMRange: { min: 90, max: 300, average: 120 },
    percentageRange: { min: 0.7, max: 2.5 },
    possibleAlternatives: ['Second Cousin Once Removed', 'Half Second Cousin'],
  },
  {
    type: 'third_cousin',
    displayName: 'Third Cousin',
    description: 'Shares great-great-grandparents - shares ~0.78% of DNA on average',
    cMRange: { min: 30, max: 200, average: 74 },
    percentageRange: { min: 0.2, max: 1.5 },
    possibleAlternatives: ['Third Cousin', 'Second Cousin Twice Removed'],
  },
  {
    type: 'distant_cousin',
    displayName: 'Distant Cousin',
    description: 'More distant relationship - typically 4th cousins or further',
    cMRange: { min: 6, max: 50, average: 25 },
    percentageRange: { min: 0, max: 0.3 },
    possibleAlternatives: ['Fourth Cousin', 'Fifth Cousin', 'Distant Relative'],
  },
  {
    type: 'unrelated',
    displayName: 'Unrelated',
    description: 'No detectable shared DNA - likely not related within genealogical timeframe',
    cMRange: { min: 0, max: 6, average: 0 },
    percentageRange: { min: 0, max: 0.1 },
    possibleAlternatives: ['Not Related'],
  },
];

/**
 * Get relationship range by type
 */
export function getRelationshipRange(type: RelationshipType): RelationshipRange | undefined {
  return RELATIONSHIP_RANGES.find(r => r.type === type);
}

/**
 * Get relationship type by shared cM
 * Returns the most likely relationship type based on shared centimorgans
 */
export function getRelationshipByCM(cM: number): RelationshipRange {
  // Check for exact matches first
  for (const range of RELATIONSHIP_RANGES) {
    if (cM >= range.cMRange.min && cM <= range.cMRange.max) {
      return range;
    }
  }
  
  // Handle edge cases
  if (cM > 3700) {
    return RELATIONSHIP_RANGES[0]; // Identical twin
  }
  if (cM < 6) {
    return RELATIONSHIP_RANGES[RELATIONSHIP_RANGES.length - 1]; // Unrelated
  }
  
  // Find closest match
  let closest = RELATIONSHIP_RANGES[0];
  let minDistance = Math.abs(cM - closest.cMRange.average);
  
  for (const range of RELATIONSHIP_RANGES) {
    const distance = Math.abs(cM - range.cMRange.average);
    if (distance < minDistance) {
      minDistance = distance;
      closest = range;
    }
  }
  
  return closest;
}

/**
 * Get all possible relationships for a given cM range
 */
export function getPossibleRelationships(cM: number): RelationshipRange[] {
  return RELATIONSHIP_RANGES.filter(
    r => cM >= r.cMRange.min * 0.8 && cM <= r.cMRange.max * 1.2
  );
}

/**
 * Relationship descriptions for user display
 */
export const RELATIONSHIP_DESCRIPTIONS: Record<RelationshipType, string> = {
  identical_twin: 'You and this match share virtually 100% of your DNA, indicating you are identical twins.',
  parent_child: 'You share approximately 50% of your DNA with this match, consistent with a parent-child relationship.',
  full_sibling: 'You share about 50% of your DNA with this match on average, indicating you are full siblings who share both parents.',
  grandparent: 'You share approximately 25% of your DNA with this match, consistent with a grandparent-grandchild relationship.',
  half_sibling: 'You share about 25% of your DNA with this match, indicating you are half-siblings who share one biological parent.',
  aunt_uncle: 'You share approximately 25% of your DNA with this match, consistent with an aunt/uncle-niece/nephew relationship.',
  first_cousin: 'You share about 12.5% of your DNA with this match, indicating you are first cousins (your parents are siblings).',
  first_cousin_once_removed: 'You share approximately 6.25% of your DNA with this match, consistent with a first cousin once removed relationship.',
  second_cousin: 'You share about 3.125% of your DNA with this match, indicating you are second cousins (share great-grandparents).',
  second_cousin_once_removed: 'You share approximately 1.56% of your DNA with this match, consistent with a second cousin once removed relationship.',
  third_cousin: 'You share about 0.78% of your DNA with this match, indicating you are third cousins (share great-great-grandparents).',
  distant_cousin: 'You share a small amount of DNA with this match (less than 0.5%), indicating a distant cousin relationship (4th cousin or more distant).',
  unrelated: 'You do not share a significant amount of DNA with this match, suggesting you are not related within the genealogical timeframe.',
};

/**
 * Confidence thresholds for relationship predictions
 */
export const CONFIDENCE_THRESHOLDS: Record<ConfidenceLevel, { minCM: number; description: string }> = {
  very_high: {
    minCM: 1300,
    description: 'The relationship prediction is highly reliable based on the amount of shared DNA.',
  },
  high: {
    minCM: 500,
    description: 'The relationship prediction is reliable, though some ambiguity may exist between similar relationships.',
  },
  medium: {
    minCM: 90,
    description: 'The relationship prediction is reasonably likely, but there is some uncertainty due to DNA variability.',
  },
  low: {
    minCM: 30,
    description: 'The relationship prediction is tentative. More distant relationships are harder to distinguish.',
  },
  very_low: {
    minCM: 6,
    description: 'The relationship prediction is highly uncertain. These small DNA segments may be coincidental matches.',
  },
};

/**
 * Calculate confidence level based on shared cM
 */
export function calculateConfidence(cM: number): ConfidenceLevel {
  if (cM >= CONFIDENCE_THRESHOLDS.very_high.minCM) return 'very_high';
  if (cM >= CONFIDENCE_THRESHOLDS.high.minCM) return 'high';
  if (cM >= CONFIDENCE_THRESHOLDS.medium.minCM) return 'medium';
  if (cM >= CONFIDENCE_THRESHOLDS.low.minCM) return 'low';
  return 'very_low';
}

/**
 * DNA inheritance probability - probability of sharing DNA at different cousin levels
 */
export const INHERITANCE_PROBABILITY: Record<string, number> = {
  'first_cousin': 100,
  'second_cousin': 99,
  'third_cousin': 90,
  'fourth_cousin': 45,
  'fifth_cousin': 15,
  'sixth_cousin': 5,
};

/**
 * Chromosome lengths in centimorgans (approximate)
 * Used for calculating segment significance
 */
export const CHROMOSOME_LENGTHS_CM: Record<string, number> = {
  '1': 286,
  '2': 269,
  '3': 223,
  '4': 214,
  '5': 204,
  '6': 192,
  '7': 187,
  '8': 168,
  '9': 166,
  '10': 181,
  '11': 156,
  '12': 174,
  '13': 126,
  '14': 119,
  '15': 141,
  '16': 134,
  '17': 128,
  '18': 117,
  '19': 107,
  '20': 108,
  '21': 62,
  '22': 72,
  'X': 198,
  'Y': 0, // Y chromosome doesn't recombine for matching purposes
  'MT': 0, // Mitochondrial DNA handled separately
};

/**
 * Chromosome lengths in base pairs (GRCh37/hg19 reference)
 */
export const CHROMOSOME_LENGTHS_BP: Record<string, number> = {
  '1': 249250621,
  '2': 243199373,
  '3': 198022430,
  '4': 191154276,
  '5': 180915260,
  '6': 171115067,
  '7': 159138663,
  '8': 146364022,
  '9': 141213431,
  '10': 135534747,
  '11': 135006516,
  '12': 133851895,
  '13': 115169878,
  '14': 107349540,
  '15': 102531392,
  '16': 90354753,
  '17': 81195210,
  '18': 78077248,
  '19': 59128983,
  '20': 63025520,
  '21': 48129895,
  '22': 51304566,
  'X': 155270560,
  'Y': 59373566,
  'MT': 16569,
};

/**
 * Minimum segment thresholds for IBD detection
 */
export const IBD_THRESHOLDS = {
  /** Minimum segment size to be considered IBD (in cM) */
  MIN_SEGMENT_CM: 7,
  /** Minimum SNPs per segment for reliability */
  MIN_SNPS_PER_SEGMENT: 100,
  /** Minimum total shared cM for a match */
  MIN_TOTAL_CM: 6,
  /** Minimum largest segment for distant matches */
  MIN_LARGEST_SEGMENT_CM: 6,
};

/**
 * Get all relationship types sorted by closeness
 */
export function getRelationshipTypesByCloseness(): RelationshipType[] {
  return [
    'identical_twin',
    'parent_child',
    'full_sibling',
    'grandparent',
    'half_sibling',
    'aunt_uncle',
    'first_cousin',
    'first_cousin_once_removed',
    'second_cousin',
    'second_cousin_once_removed',
    'third_cousin',
    'distant_cousin',
    'unrelated',
  ];
}

/**
 * Check if a relationship is considered "close family"
 */
export function isCloseFamily(type: RelationshipType): boolean {
  const closeTypes: RelationshipType[] = [
    'identical_twin',
    'parent_child',
    'full_sibling',
    'grandparent',
    'half_sibling',
    'aunt_uncle',
  ];
  return closeTypes.includes(type);
}

/**
 * Check if a relationship is considered "immediate family"
 */
export function isImmediateFamily(type: RelationshipType): boolean {
  const immediateTypes: RelationshipType[] = [
    'identical_twin',
    'parent_child',
    'full_sibling',
  ];
  return immediateTypes.includes(type);
}

/**
 * Default export with all relationship data
 */
export default {
  RELATIONSHIP_RANGES,
  RELATIONSHIP_DESCRIPTIONS,
  CONFIDENCE_THRESHOLDS,
  INHERITANCE_PROBABILITY,
  CHROMOSOME_LENGTHS_CM,
  CHROMOSOME_LENGTHS_BP,
  IBD_THRESHOLDS,
  getRelationshipRange,
  getRelationshipByCM,
  getPossibleRelationships,
  calculateConfidence,
  getRelationshipTypesByCloseness,
  isCloseFamily,
  isImmediateFamily,
};
