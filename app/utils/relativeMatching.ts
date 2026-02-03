// DNA Relative Matching Algorithms
// Functions for finding and analyzing genetic relatives

import type { 
  SNP, 
  GenomeData 
} from '~/types/genetics';
import type { 
  RelativeMatch, 
  SharedDNAResult, 
  IBD_Segment, 
  RelationshipPrediction,
  RelationshipType,
  GenomeComparison,
  ChromosomeComparison,
  ConfidenceLevel,
} from '~/types/relatives';
import { 
  RELATIONSHIP_RANGES, 
  getRelationshipByCM, 
  calculateConfidence,
  CHROMOSOME_LENGTHS_CM,
  CHROMOSOME_LENGTHS_BP,
  IBD_THRESHOLDS,
  CONFIDENCE_THRESHOLDS,
} from '~/data/relationshipData';

// ============================================================================
// Constants
// ============================================================================

/** Average cM per million base pairs (approximate genome-wide average) */
const CM_PER_BP = 0.000001;

/** Minimum SNPs required for reliable comparison */
const MIN_SNPS_FOR_COMPARISON = 10000;

/** Default cM conversion factor (approximate) */
const DEFAULT_CM_CONVERSION = 0.7;

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Find relatives in a database of genomes that match the user's genome
 * 
 * @param userGenome - The user's genome data
 * @param allGenomes - Array of all genomes to compare against
 * @param options - Optional configuration for matching
 * @returns Array of relative matches sorted by shared DNA (descending)
 */
export function findRelatives(
  userGenome: GenomeData,
  allGenomes: GenomeData[],
  options: {
    minSharedCM?: number;
    requireOptIn?: boolean;
    maxResults?: number;
  } = {}
): RelativeMatch[] {
  const { 
    minSharedCM = IBD_THRESHOLDS.MIN_TOTAL_CM, 
    requireOptIn = true,
    maxResults = 1000 
  } = options;

  const matches: RelativeMatch[] = [];

  for (const otherGenome of allGenomes) {
    // Skip self-comparison
    if (otherGenome.id === userGenome.id || otherGenome.userId === userGenome.userId) {
      continue;
    }

    // Check opt-in status (would come from user settings in real implementation)
    if (requireOptIn) {
      // In a real implementation, this would check the user's privacy settings
      // For now, assume all genomes in the database have opted in
    }

    // Compare genomes
    const comparison = compareGenomes(userGenome, otherGenome);

    // Filter by minimum shared cM
    if (comparison.sharedDNA.centimorgans >= minSharedCM) {
      const match: RelativeMatch = {
        relativeId: hashIdentifier(otherGenome.userId),
        relativeName: generateAnonymousName(otherGenome.userId),
        sharedDNA: comparison.sharedDNA,
        predictedRelationship: comparison.predictedRelationship,
        ibdSegments: comparison.sharedDNA.ibdSegments,
        optInStatus: true,
        isVisible: true,
        isHidden: false,
        hasContacted: false,
        matchedAt: new Date(),
        side: 'unknown',
      };

      matches.push(match);
    }
  }

  // Sort by shared DNA (descending)
  matches.sort((a, b) => b.sharedDNA.centimorgans - a.sharedDNA.centimorgans);

  // Limit results
  return matches.slice(0, maxResults);
}

/**
 * Calculate shared DNA between two sets of SNPs
 * 
 * @param genomeA - SNPs from first genome
 * @param genomeB - SNPs from second genome
 * @returns Shared DNA result with segments and statistics
 */
export function calculateSharedDNA(
  genomeA: SNP[],
  genomeB: SNP[]
): SharedDNAResult {
  // Find overlapping SNPs
  const snpMapB = new Map(genomeB.map(snp => [`${snp.rsid}_${snp.position}`, snp]));
  
  const sharedSNPs: Array<{ snpA: SNP; snpB: SNP }> = [];
  
  for (const snpA of genomeA) {
    const key = `${snpA.rsid}_${snpA.position}`;
    const snpB = snpMapB.get(key);
    if (snpB) {
      sharedSNPs.push({ snpA, snpB });
    }
  }

  if (sharedSNPs.length < MIN_SNPS_FOR_COMPARISON) {
    return {
      percentage: 0,
      centimorgans: 0,
      segments: 0,
      largestSegment: 0,
      averageSegment: 0,
      ibdSegments: [],
      sharedSNPs: 0,
      totalSNPsCompared: sharedSNPs.length,
    };
  }

  // Identify IBD segments
  const ibdSegments = identifyIBDSegments(genomeA, genomeB);

  // Calculate statistics
  const totalSharedCM = ibdSegments.reduce((sum, seg) => sum + seg.centimorgans, 0);
  const largestSegment = ibdSegments.length > 0 
    ? Math.max(...ibdSegments.map(seg => seg.centimorgans))
    : 0;
  const averageSegment = ibdSegments.length > 0
    ? totalSharedCM / ibdSegments.length
    : 0;

  // Calculate percentage (assuming ~7000 cM is 100% sharing)
  const percentage = (totalSharedCM / 7000) * 100;

  return {
    percentage: Math.min(percentage, 100),
    centimorgans: Math.round(totalSharedCM * 10) / 10,
    segments: ibdSegments.length,
    largestSegment: Math.round(largestSegment * 10) / 10,
    averageSegment: Math.round(averageSegment * 10) / 10,
    ibdSegments,
    sharedSNPs: countIdenticalByState(sharedSNPs),
    totalSNPsCompared: sharedSNPs.length,
  };
}

/**
 * Identify IBD (Identity by Descent) segments between two genomes
 * 
 * IBD segments are stretches of DNA that are identical because they were
 * inherited from a common ancestor without any recombination.
 * 
 * @param genomeA - SNPs from first genome
 * @param genomeB - SNPs from second genome
 * @returns Array of IBD segments
 */
export function identifyIBDSegments(
  genomeA: SNP[],
  genomeB: SNP[]
): IBD_Segment[] {
  const segments: IBD_Segment[] = [];
  
  // Create a map of genomeB for quick lookup
  const snpMapB = new Map(genomeB.map(snp => [`${snp.rsid}_${snp.position}`, snp]));
  
  // Group SNPs by chromosome
  const chromosomes = new Map<string, SNP[]>();
  
  for (const snpA of genomeA) {
    const key = `${snpA.rsid}_${snpA.position}`;
    const snpB = snpMapB.get(key);
    if (!snpB) continue;

    const chr = snpA.chromosome;
    if (!chromosomes.has(chr)) {
      chromosomes.set(chr, []);
    }
    chromosomes.get(chr)!.push(snpA);
  }

  // Process each chromosome
  for (const [chromosome, chrSNPsA] of chromosomes) {
    // Sort by position
    chrSNPsA.sort((a, b) => a.position - b.position);
    
    let currentSegment: {
      start: number;
      end: number;
      snps: SNP[];
    } | null = null;

    for (const snpA of chrSNPsA) {
      const key = `${snpA.rsid}_${snpA.position}`;
      const snpB = snpMapB.get(key);
      if (!snpB) continue;

      // Check if genotypes match (IBS - Identity by State)
      const isMatch = compareGenotypes(snpA.genotype, snpB.genotype);

      if (isMatch) {
        if (!currentSegment) {
          currentSegment = {
            start: snpA.position,
            end: snpA.position,
            snps: [snpA],
          };
        } else {
          currentSegment.end = snpA.position;
          currentSegment.snps.push(snpA);
        }
      } else {
        // End of segment
        if (currentSegment) {
          const segment = finalizeSegment(chromosome, currentSegment);
          if (segment.centimorgans >= IBD_THRESHOLDS.MIN_SEGMENT_CM) {
            segments.push(segment);
          }
          currentSegment = null;
        }
      }
    }

    // Don't forget the last segment
    if (currentSegment) {
      const segment = finalizeSegment(chromosome, currentSegment);
      if (segment.centimorgans >= IBD_THRESHOLDS.MIN_SEGMENT_CM) {
        segments.push(segment);
      }
    }
  }

  // Merge nearby segments on the same chromosome
  return mergeNearbySegments(segments);
}

/**
 * Predict relationship based on shared DNA in centimorgans
 * 
 * @param sharedCm - Total shared DNA in centimorgans
 * @returns Relationship prediction with confidence and alternatives
 */
export function predictRelationship(sharedCm: number): RelationshipPrediction {
  const relationshipRange = getRelationshipByCM(sharedCm);
  const confidence = calculateConfidence(sharedCm);
  
  // Get possible alternative relationships
  const possibleRelationships = getAlternativeRelationships(sharedCm, relationshipRange.type);

  return {
    type: relationshipRange.type,
    displayName: relationshipRange.displayName,
    confidence,
    possibleRelationships,
    expectedRange: relationshipRange.cMRange,
  };
}

/**
 * Calculate approximate centimorgans from shared SNPs
 * 
 * This is a simplified calculation. Real cM calculations require
 * recombination maps and sophisticated algorithms.
 * 
 * @param sharedSNPs - Number of shared SNPs
 * @param totalSNPs - Total SNPs compared (optional, for better estimation)
 * @returns Estimated centimorgans
 */
export function calculateCentimorgans(sharedSNPs: number, totalSNPs?: number): number {
  if (!totalSNPs || totalSNPs === 0) {
    // Rough approximation: ~0.7 cM per 1000 shared SNPs
    return (sharedSNPs / 1000) * DEFAULT_CM_CONVERSION;
  }

  // Calculate based on proportion of genome covered
  // Human genome is approximately 3300 cM (autosomes only, excluding X)
  const proportion = sharedSNPs / totalSNPs;
  const estimatedCM = proportion * 3300;
  
  return Math.round(estimatedCM * 10) / 10;
}

/**
 * Compare two genomes and return detailed comparison results
 * 
 * @param genomeA - First genome data
 * @param genomeB - Second genome data
 * @returns Detailed genome comparison
 */
export function compareGenomes(
  genomeA: GenomeData,
  genomeB: GenomeData
): GenomeComparison {
  // Calculate shared DNA
  const sharedDNA = calculateSharedDNA(genomeA.snps, genomeB.snps);

  // Predict relationship
  const predictedRelationship = predictRelationship(sharedDNA.centimorgans);

  // Generate chromosome-by-chromosome comparison
  const chromosomeComparisons = generateChromosomeComparisons(
    genomeA.snps,
    genomeB.snps,
    sharedDNA.ibdSegments
  );

  // Calculate similarity score (0-100)
  const similarityScore = Math.min(
    (sharedDNA.centimorgans / 3500) * 100,
    100
  );

  return {
    genomeA: {
      id: genomeA.id,
      name: genomeA.filename,
    },
    genomeB: {
      id: genomeB.id,
      name: genomeB.filename,
    },
    sharedDNA,
    predictedRelationship,
    chromosomeComparisons,
    comparedAt: new Date(),
    similarityScore: Math.round(similarityScore * 10) / 10,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Compare two genotypes to check if they match
 */
function compareGenotypes(genotypeA: string, genotypeB: string): boolean {
  // Normalize genotypes (handle both orderings, e.g., "AG" = "GA")
  const normalize = (g: string): string => {
    if (g.length !== 2) return g.toUpperCase();
    const chars = g.toUpperCase().split('').sort();
    return chars.join('');
  };

  const normA = normalize(genotypeA);
  const normB = normalize(genotypeB);

  // Check for half-match (one allele shared)
  if (normA.length === 2 && normB.length === 2) {
    // Full match (both alleles identical)
    if (normA === normB) return true;
    
    // For IBD detection, we need to be more sophisticated
    // This is a simplified version - real implementation would use phasing
    const shareOneAllele = normA[0] === normB[0] || 
                           normA[0] === normB[1] || 
                           normA[1] === normB[0] || 
                           normA[1] === normB[1];
    return shareOneAllele;
  }

  return normA === normB;
}

/**
 * Count SNPs that are identical by state
 */
function countIdenticalByState(
  sharedSNPs: Array<{ snpA: SNP; snpB: SNP }>
): number {
  let count = 0;
  for (const { snpA, snpB } of sharedSNPs) {
    if (compareGenotypes(snpA.genotype, snpB.genotype)) {
      count++;
    }
  }
  return count;
}

/**
 * Finalize an IBD segment with proper calculations
 */
function finalizeSegment(
  chromosome: string,
  segment: { start: number; end: number; snps: SNP[] }
): IBD_Segment {
  const lengthBP = segment.end - segment.start;
  
  // Calculate cM using chromosome-specific recombination rate
  const chrLengthCM = CHROMOSOME_LENGTHS_CM[chromosome] || 150;
  const chrLengthBP = CHROMOSOME_LENGTHS_BP[chromosome] || 150000000;
  
  // Proportional calculation
  const centimorgans = (lengthBP / chrLengthBP) * chrLengthCM;

  return {
    chromosome,
    start: segment.start,
    end: segment.end,
    lengthBP,
    centimorgans: Math.round(centimorgans * 10) / 10,
    snpCount: segment.snps.length,
  };
}

/**
 * Merge nearby segments on the same chromosome
 */
function mergeNearbySegments(segments: IBD_Segment[]): IBD_Segment[] {
  if (segments.length <= 1) return segments;

  // Sort by chromosome and start position
  const sorted = [...segments].sort((a, b) => {
    if (a.chromosome !== b.chromosome) {
      return a.chromosome.localeCompare(b.chromosome);
    }
    return a.start - b.start;
  });

  const merged: IBD_Segment[] = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    // Check if segments are on the same chromosome and close enough to merge
    const gapThreshold = 5000000; // 5 Mbp gap threshold
    
    if (current.chromosome === next.chromosome && 
        next.start - current.end < gapThreshold) {
      // Merge segments
      current = {
        ...current,
        end: next.end,
        lengthBP: next.end - current.start,
        centimorgans: current.centimorgans + next.centimorgans,
        snpCount: current.snpCount + next.snpCount,
      };
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  return merged;
}

/**
 * Generate chromosome-by-chromosome comparison
 */
function generateChromosomeComparisons(
  genomeA: SNP[],
  genomeB: SNP[],
  ibdSegments: IBD_Segment[]
): ChromosomeComparison[] {
  const comparisons: ChromosomeComparison[] = [];
  const chromosomes = Object.keys(CHROMOSOME_LENGTHS_BP);

  for (const chromosome of chromosomes) {
    const chrSegments = ibdSegments.filter(s => s.chromosome === chromosome);
    const sharedCM = chrSegments.reduce((sum, s) => sum + s.centimorgans, 0);
    
    const chrSNPsA = genomeA.filter(s => s.chromosome === chromosome);
    const chrSNPsB = genomeB.filter(s => s.chromosome === chromosome);
    
    // Count shared SNPs on this chromosome
    const snpMapB = new Map(chrSNPsB.map(s => [`${s.rsid}_${s.position}`, s]));
    let sharedSNPs = 0;
    for (const snpA of chrSNPsA) {
      const key = `${snpA.rsid}_${snpA.position}`;
      const snpB = snpMapB.get(key);
      if (snpB && compareGenotypes(snpA.genotype, snpB.genotype)) {
        sharedSNPs++;
      }
    }

    const totalSNPs = Math.max(chrSNPsA.length, chrSNPsB.length);
    const coverage = totalSNPs > 0 ? (sharedSNPs / totalSNPs) * 100 : 0;

    comparisons.push({
      chromosome,
      lengthBP: CHROMOSOME_LENGTHS_BP[chromosome],
      ibdSegments: chrSegments,
      sharedCM: Math.round(sharedCM * 10) / 10,
      sharedSNPs,
      totalSNPs,
      coverage: Math.round(coverage * 100) / 100,
    });
  }

  return comparisons;
}

/**
 * Get alternative relationships for a given shared cM amount
 */
function getAlternativeRelationships(
  sharedCm: number, 
  primaryType: RelationshipType
): string[] {
  const alternatives: string[] = [];
  
  // Check all relationship ranges that overlap with this cM value
  for (const range of RELATIONSHIP_RANGES) {
    if (range.type === primaryType) continue;
    
    // Include if within 20% of the range
    const rangeMin = range.cMRange.min * 0.8;
    const rangeMax = range.cMRange.max * 1.2;
    
    if (sharedCm >= rangeMin && sharedCm <= rangeMax) {
      alternatives.push(...range.possibleAlternatives);
    }
  }
  
  // Remove duplicates and limit
  return [...new Set(alternatives)].slice(0, 3);
}

/**
 * Hash an identifier for privacy
 */
function hashIdentifier(identifier: string): string {
  // Simple hash function for demonstration
  // In production, use a proper cryptographic hash
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `user-${Math.abs(hash).toString(16).substring(0, 8)}`;
}

/**
 * Generate an anonymous display name
 */
function generateAnonymousName(identifier: string): string {
  const adjectives = [
    'Curious', 'Brave', 'Bright', 'Swift', 'Wise', 'Kind', 
    'Bold', 'Calm', 'Keen', 'Warm', 'Cool', 'Gentle'
  ];
  const nouns = [
    'Explorer', 'Traveler', 'Seeker', 'Wanderer', 'Pioneer', 
    'Dreamer', 'Thinker', 'Creator', 'Builder', 'Guardian'
  ];
  
  // Deterministic pseudo-random based on identifier
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) - hash) + identifier.charCodeAt(i);
    hash = hash & hash;
  }
  
  const adjIndex = Math.abs(hash) % adjectives.length;
  const nounIndex = Math.abs(hash >> 8) % nouns.length;
  
  return `${adjectives[adjIndex]} ${nouns[nounIndex]}`;
}

// ============================================================================
// Additional Utility Functions
// ============================================================================

/**
 * Determine if a match is on the maternal or paternal side
 * This requires phased data or comparison with known relatives
 */
export function determineSide(
  matchSegments: IBD_Segment[],
  maternalSegments: IBD_Segment[],
  paternalSegments: IBD_Segment[]
): 'maternal' | 'paternal' | 'both' | 'unknown' {
  let maternalOverlap = 0;
  let paternalOverlap = 0;

  for (const matchSeg of matchSegments) {
    for (const matSeg of maternalSegments) {
      if (matchSeg.chromosome === matSeg.chromosome) {
        const overlap = calculateSegmentOverlap(matchSeg, matSeg);
        maternalOverlap += overlap;
      }
    }
    for (const patSeg of paternalSegments) {
      if (matchSeg.chromosome === patSeg.chromosome) {
        const overlap = calculateSegmentOverlap(matchSeg, patSeg);
        paternalOverlap += overlap;
      }
    }
  }

  const totalOverlap = maternalOverlap + paternalOverlap;
  if (totalOverlap === 0) return 'unknown';

  const maternalRatio = maternalOverlap / totalOverlap;
  const paternalRatio = paternalOverlap / totalOverlap;

  if (maternalRatio > 0.8) return 'maternal';
  if (paternalRatio > 0.8) return 'paternal';
  return 'both';
}

/**
 * Calculate overlap between two segments
 */
function calculateSegmentOverlap(segA: IBD_Segment, segB: IBD_Segment): number {
  if (segA.chromosome !== segB.chromosome) return 0;
  
  const start = Math.max(segA.start, segB.start);
  const end = Math.min(segA.end, segB.end);
  
  return Math.max(0, end - start);
}

/**
 * Estimate the number of generations to common ancestor
 */
export function estimateGenerations(sharedCm: number): number {
  if (sharedCm >= 3400) return 0; // Self or identical twin
  if (sharedCm >= 2600) return 1; // Parent/child or sibling
  if (sharedCm >= 1700) return 2; // Grandparent/aunt/uncle
  if (sharedCm >= 800) return 3; // First cousin
  if (sharedCm >= 200) return 4; // Second cousin
  if (sharedCm >= 50) return 5; // Third cousin
  if (sharedCm >= 20) return 6; // Fourth cousin
  if (sharedCm >= 6) return 7; // Fifth cousin or more distant
  return -1; // Unrelated
}

/**
 * Filter matches by relationship type
 */
export function filterMatchesByRelationship(
  matches: RelativeMatch[],
  types: RelationshipType[]
): RelativeMatch[] {
  return matches.filter(m => types.includes(m.predictedRelationship.type));
}

/**
 * Get close family matches (> 1300 cM)
 */
export function getCloseFamilyMatches(matches: RelativeMatch[]): RelativeMatch[] {
  return matches.filter(m => m.sharedDNA.centimorgans >= 1300);
}

/**
 * Get distant cousin matches (< 50 cM)
 */
export function getDistantMatches(matches: RelativeMatch[]): RelativeMatch[] {
  return matches.filter(m => m.sharedDNA.centimorgans < 50);
}

// ============================================================================
// Export default
// ============================================================================

export default {
  findRelatives,
  calculateSharedDNA,
  identifyIBDSegments,
  predictRelationship,
  calculateCentimorgans,
  compareGenomes,
  determineSide,
  estimateGenerations,
  filterMatchesByRelationship,
  getCloseFamilyMatches,
  getDistantMatches,
};
