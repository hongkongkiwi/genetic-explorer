/**
 * Relative Matching Algorithm
 * 
 * Identifies DNA matches and predicts relationships.
 */

import type { SNP } from '~/types/genetics';

export interface DNAMatch {
  matchId: string;
  totalSharedCm: number;
  sharedSegments: number;
  largestSegment: number;
  predictedRelationship: string;
  confidence: 'high' | 'moderate' | 'low';
  sharedSnps: number;
  totalCompared: number;
}

export interface RelationshipPrediction {
  relationship: string;
  range: string;
  probability: number;
  sharedDNARange: string;
}

export interface Segment {
  chromosome: string;
  start: number;
  end: number;
  cM: number;
  snpCount: number;
}

// Relationship data based on ISOGG shared cM ranges
const RELATIONSHIP_RANGES: Array<{
  relationship: string;
  range: string;
  minCm: number;
  maxCm: number;
  probability: number;
}> = [
  { relationship: 'Identical Twin', range: 'Parent/Child', minCm: 3300, maxCm: 3700, probability: 0.99 },
  { relationship: 'Parent/Child', range: 'Full Sibling', minCm: 3300, maxCm: 3700, probability: 0.99 },
  { relationship: 'Full Sibling', range: 'Grandparent/Grandchild', minCm: 2300, maxCm: 2900, probability: 0.95 },
  { relationship: 'Grandparent/Grandchild', range: 'Half Sibling', minCm: 1300, maxCm: 2300, probability: 0.90 },
  { relationship: 'Half Sibling', range: 'Aunt/Uncle/Niece/Nephew', minCm: 1300, maxCm: 2300, probability: 0.85 },
  { relationship: 'Aunt/Uncle/Niece/Nephew', range: 'First Cousin', minCm: 1300, maxCm: 2200, probability: 0.90 },
  { relationship: 'First Cousin', range: 'First Cousin Once Removed', minCm: 396, maxCm: 1397, probability: 0.85 },
  { relationship: 'First Cousin Once Removed', range: 'Second Cousin', minCm: 141, maxCm: 851, probability: 0.80 },
  { relationship: 'Second Cousin', range: 'Second Cousin Once Removed', minCm: 46, maxCm: 515, probability: 0.75 },
  { relationship: 'Second Cousin Once Removed', range: 'Third Cousin', minCm: 0, maxCm: 316, probability: 0.70 },
  { relationship: 'Third Cousin', range: 'Fourth Cousin', minCm: 0, maxCm: 186, probability: 0.60 },
  { relationship: 'Fourth Cousin', range: 'Distant', minCm: 0, maxCm: 100, probability: 0.50 },
];

/**
 * Calculate shared DNA between two genomes
 */
export function calculateSharedDNA(
  genomeA: SNP[],
  genomeB: SNP[]
): {
  sharedSnps: number;
  totalCompared: number;
  sharedSegments: Segment[];
  totalSharedCm: number;
} {
  // Create lookup for genome B
  const genomeBMap = new Map(genomeB.map(s => [`${s.rsid}:${s.position}`, s]));
  
  let sharedSnps = 0;
  const segments: Segment[] = [];
  let currentSegment: Partial<Segment> | null = null;
  let lastPosition = 0;
  
  // Sort genome A by chromosome and position
  const sortedA = [...genomeA].sort((a, b) => {
    const chrA = normalizeChromosome(a.chromosome);
    const chrB = normalizeChromosome(b.chromosome);
    if (chrA !== chrB) return chrA.localeCompare(chrB);
    return a.position - b.position;
  });
  
  for (const snpA of sortedA) {
    const key = `${snpA.rsid}:${snpA.position}`;
    const snpB = genomeBMap.get(key);
    
    if (snpB) {
      // Check for matching alleles (half match or full match)
      const matchType = calculateMatchType(snpA.genotype, snpB.genotype);
      
      if (matchType > 0) {
        sharedSnps++;
        
        // Build segments
        const currentChr = normalizeChromosome(snpA.chromosome);
        
        if (!currentSegment || currentSegment.chromosome !== currentChr) {
          // Start new segment
          if (currentSegment && currentSegment.snpCount && currentSegment.snpCount >= 100) {
            segments.push(currentSegment as Segment);
          }
          currentSegment = {
            chromosome: currentChr,
            start: snpA.position,
            end: snpA.position,
            snpCount: 1,
          };
        } else {
          // Continue segment if close enough
          if (snpA.position - lastPosition < 1000000) { // Within 1MB
            currentSegment.end = snpA.position;
            currentSegment.snpCount = (currentSegment.snpCount || 0) + 1;
          } else {
            // Gap too large, finalize segment and start new one
            if (currentSegment.snpCount && currentSegment.snpCount >= 100) {
              segments.push(currentSegment as Segment);
            }
            currentSegment = {
              chromosome: currentChr,
              start: snpA.position,
              end: snpA.position,
              snpCount: 1,
            };
          }
        }
        
        lastPosition = snpA.position;
      }
    }
  }
  
  // Don't forget the last segment
  if (currentSegment && currentSegment.snpCount && currentSegment.snpCount >= 100) {
    segments.push(currentSegment as Segment);
  }
  
  // Calculate cM for segments
  const segmentsWithCm = segments.map(s => ({
    ...s,
    cM: calculateCentimorgans(s.chromosome, s.start, s.end),
  }));
  
  const totalSharedCm = segmentsWithCm.reduce((sum, s) => sum + s.cM, 0);
  
  return {
    sharedSnps,
    totalCompared: Math.min(genomeA.length, genomeB.length),
    sharedSegments: segmentsWithCm,
    totalSharedCm,
  };
}

/**
 * Calculate match type between two genotypes
 */
function calculateMatchType(genotypeA: string, genotypeB: string): number {
  if (!genotypeA || !genotypeB || genotypeA === '--' || genotypeB === '--') {
    return 0;
  }
  
  const allelesA = genotypeA.split('').sort();
  const allelesB = genotypeB.split('').sort();
  
  // Full match (identical genotypes)
  if (allelesA[0] === allelesB[0] && allelesA[1] === allelesB[1]) {
    return 2;
  }
  
  // Half match (one allele shared)
  if (allelesA[0] === allelesB[0] || 
      allelesA[0] === allelesB[1] || 
      allelesA[1] === allelesB[0] || 
      allelesA[1] === allelesB[1]) {
    return 1;
  }
  
  return 0;
}

/**
 * Calculate centimorgans for a segment
 */
function calculateCentimorgans(
  chromosome: string,
  start: number,
  end: number
): number {
  // Approximate cM calculation
  // Average 1 cM ≈ 1 million base pairs (varies by chromosome)
  const chrLengths: Record<string, number> = {
    '1': 286, '2': 269, '3': 223, '4': 215, '5': 204,
    '6': 192, '7': 187, '8': 168, '9': 166, '10': 181,
    '11': 174, '12': 177, '13': 126, '14': 120, '15': 115,
    '16': 104, '17': 103, '18': 96, '19': 88, '20': 81,
    '21': 62, '22': 76, 'X': 198, 'Y': 20, 'MT': 0,
  };
  
  const chrLength = chrLengths[chromosome] || 150;
  const basePairs = end - start;
  
  // Very rough approximation
  return (basePairs / 1000000) * (chrLength / 100);
}

/**
 * Normalize chromosome string
 */
function normalizeChromosome(chrom: string): string {
  const num = parseInt(chrom, 10);
  if (!isNaN(num)) return String(num);
  return chrom.toUpperCase();
}

/**
 * Predict relationship from shared DNA
 */
export function predictRelationship(sharedCm: number): RelationshipPrediction {
  // Find matching range
  for (const range of RELATIONSHIP_RANGES) {
    if (sharedCm >= range.minCm && sharedCm <= range.maxCm) {
      return {
        relationship: range.relationship,
        range: range.range,
        probability: range.probability,
        sharedDNARange: `${range.minCm}-${range.maxCm} cM`,
      };
    }
  }
  
  // Very distant or no match
  if (sharedCm < 10) {
    return {
      relationship: 'No Match',
      range: 'Not Related',
      probability: 0,
      sharedDNARange: '< 10 cM',
    };
  }
  
  return {
    relationship: 'Distant Cousin',
    range: 'Fifth Cousin or More Distant',
    probability: 0.4,
    sharedDNARange: `${sharedCm.toFixed(1)} cM`,
  };
}

/**
 * Find DNA matches between a genome and a database
 */
export function findMatches(
  genome: SNP[],
  database: Array<{ id: string; snps: SNP[] }>,
  minSharedCm: number = 20
): DNAMatch[] {
  const matches: DNAMatch[] = [];
  
  for (const entry of database) {
    if (entry.id === 'self') continue; // Skip self
    
    const shared = calculateSharedDNA(genome, entry.snps);
    
    if (shared.totalSharedCm >= minSharedCm) {
      const prediction = predictRelationship(shared.totalSharedCm);
      
      matches.push({
        matchId: entry.id,
        totalSharedCm: shared.totalSharedCm,
        sharedSegments: shared.sharedSegments.length,
        largestSegment: Math.max(...shared.sharedSegments.map(s => s.cM), 0),
        predictedRelationship: prediction.relationship,
        confidence: prediction.probability > 0.8 ? 'high' : 
                   prediction.probability > 0.5 ? 'moderate' : 'low',
        sharedSnps: shared.sharedSnps,
        totalCompared: shared.totalCompared,
      });
    }
  }
  
  // Sort by shared cM (descending)
  return matches.sort((a, b) => b.totalSharedCm - a.totalSharedCm);
}

/**
 * Estimate degree of relationship
 */
export function estimateDegree(sharedCm: number): number {
  if (sharedCm >= 3400) return 0; // Parent/child or identical twin
  if (sharedCm >= 2200) return 1; // Full sibling
  if (sharedCm >= 1300) return 2; // Grandparent/half-sibling
  if (sharedCm >= 400) return 3;  // First cousin
  if (sharedCm >= 140) return 4;  // Second cousin
  if (sharedCm >= 40) return 5;   // Third cousin
  if (sharedCm >= 15) return 6;   // Fourth cousin
  return 7; // Distant
}

/**
 * Get relationship description
 */
export function getRelationshipDescription(match: DNAMatch): string {
  const segments = match.sharedSegments === 1 
    ? '1 segment' 
    : `${match.sharedSegments} segments`;
  
  return `${match.predictedRelationship} · ${match.totalSharedCm.toFixed(1)} cM across ${segments}`;
}

/**
 * Find relatives in database (legacy compatibility)
 */
export function findRelatives(
  genome: SNP[],
  database: Array<{ id: string; snps: SNP[] }>,
  minSharedCm: number = 20
): DNAMatch[] {
  return findMatches(genome, database, minSharedCm);
}

/**
 * Filter matches by relationship type
 */
export function filterMatchesByRelationship(
  matches: DNAMatch[],
  relationshipType: string
): DNAMatch[] {
  return matches.filter(m => 
    m.predictedRelationship.toLowerCase().includes(relationshipType.toLowerCase())
  );
}

/**
 * Compare two genomes (legacy compatibility)
 */
export function compareGenomes(
  genomeA: SNP[],
  genomeB: SNP[]
): {
  sharedDNA: number;
  sharedSegments: number;
  predictedRelationship: string;
  confidence: 'high' | 'moderate' | 'low';
} {
  const shared = calculateSharedDNA(genomeA, genomeB);
  const prediction = predictRelationship(shared.totalSharedCm);
  
  return {
    sharedDNA: shared.totalSharedCm,
    sharedSegments: shared.sharedSegments.length,
    predictedRelationship: prediction.relationship,
    confidence: prediction.probability > 0.8 ? 'high' : 
                prediction.probability > 0.5 ? 'moderate' : 'low',
  };
}
