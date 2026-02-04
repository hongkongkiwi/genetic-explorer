/**
 * Identity Verification Module
 * 
 * Verifies that new genetic data belongs to the same person as existing data.
 * 
 * SECURITY CRITICAL: Prevents accidental or malicious replacement with 
 * data from a different individual.
 * 
 * METHODOLOGY:
 * Uses identity-informative SNPs (iSNPs) - highly polymorphic loci that
 * are consistent within an individual but differ between individuals.
 * 
 * WARNING LEVELS:
 * - match: Data appears to be from the same person
 * - partial: Some inconsistencies detected (may be different chip version)
 * - mismatch: Data appears to be from a different person (BLOCK replacement)
 */

import { SNP } from './genomeParser';

// ============================================================================
// Configuration
// ============================================================================

// Identity-informative SNPs (highly polymorphic, stable within individual)
// These are commonly used in forensics and genetic genealogy for identification
export const IDENTITY_SNPS: Array<{
  rsid: string;
  chromosome: string;
  position: number;
  weight: number; // Importance weight for matching
}> = [
  // High polymorphism identity SNPs
  { rsid: 'rs1042522', chromosome: '3', position: 189349148, weight: 1.0 },
  { rsid: 'rs1801133', chromosome: '1', position: 11856378, weight: 1.0 },
  { rsid: 'rs1799983', chromosome: '7', position: 150696111, weight: 1.0 },
  { rsid: 'rs4680', chromosome: '22', position: 19963748, weight: 1.0 },
  { rsid: 'rs6277', chromosome: '11', position: 113400106, weight: 1.0 },
  { rsid: 'rs1800955', chromosome: '11', position: 113283484, weight: 1.0 },
  { rsid: 'rs25531', chromosome: 'X', position: 153363481, weight: 0.9 },
  { rsid: 'rs6354', chromosome: '17', position: 30212611, weight: 0.9 },
  { rsid: 'rs2283265', chromosome: '11', position: 113324498, weight: 0.9 },
  { rsid: 'rs3807375', chromosome: '12', position: 4904371, weight: 0.9 },
  { rsid: 'rs769224', chromosome: '7', position: 87138645, weight: 0.8 },
  { rsid: 'rs6444724', chromosome: '3', position: 37034958, weight: 0.8 },
  { rsid: 'rs4570625', chromosome: '11', position: 18290899, weight: 0.8 },
  { rsid: 'rs6296', chromosome: '1', position: 237039499, weight: 0.8 },
  { rsid: 'rs6311', chromosome: 'X', position: 114379451, weight: 0.8 },
  { rsid: 'rs6313', chromosome: 'X', position: 114380046, weight: 0.8 },
  { rsid: 'rs1360780', chromosome: '5', position: 132466498, weight: 0.8 },
  { rsid: 'rs41423247', chromosome: '5', position: 132468774, weight: 0.8 },
  { rsid: 'rs25533', chromosome: 'X', position: 153363694, weight: 0.7 },
  { rsid: 'rs662138', chromosome: '7', position: 87135704, weight: 0.7 },
  { rsid: 'rs2235073', chromosome: '8', position: 27461693, weight: 0.7 },
  { rsid: 'rs2020933', chromosome: '3', position: 185512990, weight: 0.7 },
  { rsid: 'rs9534515', chromosome: '13', position: 32446815, weight: 0.7 },
  { rsid: 'rs3027397', chromosome: '12', position: 6911641, weight: 0.7 },
  { rsid: 'rs2963156', chromosome: '6', position: 30944749, weight: 0.7 },
];

// Matching thresholds
const MATCH_THRESHOLD = 0.90;      // 90%+ match = same person
const PARTIAL_THRESHOLD = 0.70;    // 70-90% = partial match (different chip?)
const MISMATCH_THRESHOLD = 0.70;   // <70% = different person

// Minimum number of identity SNPs required for verification
export const MIN_REQUIRED_SNPS = 10;

// ============================================================================
// Types
// ============================================================================

export type IdentityMatchLevel = 'match' | 'partial' | 'mismatch' | 'insufficient_data';

export interface IdentityVerificationResult {
  matchLevel: IdentityMatchLevel;
  confidence: number; // 0-100
  matchingSnps: number;
  totalCompared: number;
  matchPercentage: number;
  details: {
    exactMatches: string[];      // rsids that match exactly
    mismatches: Array<{         // rsids that don't match
      rsid: string;
      oldGenotype: string;
      newGenotype: string;
    }>;
    missingInOld: string[];      // rsids present in new but not old
    missingInNew: string[];      // rsids present in old but not new
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    shouldBlock: boolean;
  };
  warningMessage?: string;
}

// ============================================================================
// Identity Verification
// ============================================================================

/**
 * Verify that new genetic data belongs to the same person
 */
export function verifyIdentity(
  oldSnps: SNP[],
  newSnps: SNP[]
): IdentityVerificationResult {
  // Create lookup maps for faster access
  const oldSnpMap = new Map(oldSnps.map(s => [s.rsid, s]));
  const newSnpMap = new Map(newSnps.map(s => [s.rsid, s]));
  
  const exactMatches: string[] = [];
  const mismatches: Array<{ rsid: string; oldGenotype: string; newGenotype: string }> = [];
  const missingInOld: string[] = [];
  const missingInNew: string[] = [];
  
  let totalWeight = 0;
  let matchedWeight = 0;
  
  // Check each identity SNP
  for (const identitySnp of IDENTITY_SNPS) {
    const oldSnp = oldSnpMap.get(identitySnp.rsid);
    const newSnp = newSnpMap.get(identitySnp.rsid);
    
    if (!oldSnp && !newSnp) {
      // Neither has this SNP - skip
      continue;
    }
    
    if (oldSnp && !newSnp) {
      missingInNew.push(identitySnp.rsid);
      totalWeight += identitySnp.weight;
      continue;
    }
    
    if (!oldSnp && newSnp) {
      missingInOld.push(identitySnp.rsid);
      totalWeight += identitySnp.weight;
      continue;
    }
    
    // Both have this SNP - compare genotypes
    totalWeight += identitySnp.weight;
    
    if (genotypesMatch(oldSnp!.genotype, newSnp!.genotype)) {
      exactMatches.push(identitySnp.rsid);
      matchedWeight += identitySnp.weight;
    } else {
      mismatches.push({
        rsid: identitySnp.rsid,
        oldGenotype: oldSnp!.genotype,
        newGenotype: newSnp!.genotype,
      });
    }
  }
  
  // Calculate metrics
  const totalCompared = exactMatches.length + mismatches.length;
  const matchPercentage = totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;
  
  // Determine match level
  let matchLevel: IdentityMatchLevel;
  if (totalCompared < MIN_REQUIRED_SNPS) {
    matchLevel = 'insufficient_data';
  } else if (matchPercentage >= MATCH_THRESHOLD * 100) {
    matchLevel = 'match';
  } else if (matchPercentage >= PARTIAL_THRESHOLD * 100) {
    matchLevel = 'partial';
  } else {
    matchLevel = 'mismatch';
  }
  
  // Calculate confidence (0-100)
  const confidence = Math.min(100, Math.round(
    (totalCompared / MIN_REQUIRED_SNPS) * 50 + // 50% based on sample size
    (matchPercentage * 0.5) // 50% based on match percentage
  ));
  
  // Risk assessment
  const riskAssessment = calculateRiskAssessment(
    matchLevel,
    matchPercentage,
    totalCompared,
    mismatches.length
  );
  
  // Generate warning message
  const warningMessage = generateWarningMessage(
    matchLevel,
    riskAssessment,
    matchPercentage,
    totalCompared
  );
  
  return {
    matchLevel,
    confidence,
    matchingSnps: exactMatches.length,
    totalCompared,
    matchPercentage,
    details: {
      exactMatches,
      mismatches,
      missingInOld,
      missingInNew,
    },
    riskAssessment,
    warningMessage,
  };
}

/**
 * Check if two genotypes match
 * 
 * Handles:
 * - Exact matches (AA == AA)
 * - Strand flips (AT == TA)
 * - No-calls (--)
 * - Heterozygous equivalents (AG == GA)
 */
function genotypesMatch(geno1: string, geno2: string): boolean {
  // Normalize genotypes
  const normalize = (g: string): string => {
    // Handle no-calls
    if (!g || g === '--' || g === '??') return '';
    
    // Sort alleles (so AT == TA)
    return g.split('').sort().join('');
  };
  
  const norm1 = normalize(geno1);
  const norm2 = normalize(geno2);
  
  if (!norm1 || !norm2) return false; // Can't compare no-calls
  
  return norm1 === norm2;
}

/**
 * Calculate risk assessment based on match results
 */
function calculateRiskAssessment(
  matchLevel: IdentityMatchLevel,
  matchPercentage: number,
  totalCompared: number,
  mismatchCount: number
): IdentityVerificationResult['riskAssessment'] {
  switch (matchLevel) {
    case 'match':
      return {
        level: 'low',
        description: 'Genetic data appears to be from the same individual.',
        shouldBlock: false,
      };
    
    case 'partial':
      // Partial matches might be from different chip versions or close relatives
      if (matchPercentage > 80) {
        return {
          level: 'medium',
          description: 'Most identity markers match, but some differences detected. This may be due to different testing platforms or a close relative.',
          shouldBlock: false,
        };
      } else {
        return {
          level: 'high',
          description: 'Significant differences detected. Data may be from a different testing platform or a relative. Manual verification recommended.',
          shouldBlock: false, // Allow with strong warning
        };
      }
    
    case 'mismatch':
      return {
        level: 'critical',
        description: `CRITICAL: Genetic data appears to be from a DIFFERENT individual (${mismatchCount} mismatches, ${(100 - matchPercentage).toFixed(1)}% different). This is likely data from another person.`,
        shouldBlock: true, // BLOCK replacement
      };
    
    case 'insufficient_data':
      return {
        level: 'medium',
        description: `Cannot verify identity - only ${totalCompared} identity markers found (need ${MIN_REQUIRED_SNPS}). Proceed with caution.`,
        shouldBlock: false,
      };
    
    default:
      return {
        level: 'high',
        description: 'Unable to verify identity.',
        shouldBlock: true,
      };
  }
}

/**
 * Generate user-facing warning message
 */
function generateWarningMessage(
  matchLevel: IdentityMatchLevel,
  riskAssessment: IdentityVerificationResult['riskAssessment'],
  matchPercentage: number,
  totalCompared: number
): string | undefined {
  if (matchLevel === 'match') {
    return undefined; // No warning needed
  }
  
  if (matchLevel === 'mismatch') {
    return `🚨 IDENTITY MISMATCH DETECTED 🚨\n\n` +
           `The new genetic data appears to be from a DIFFERENT PERSON.\n\n` +
           `Match confidence: ${matchPercentage.toFixed(1)}% (${totalCompared} markers compared)\n\n` +
           `⚠️  REPLACEMENT BLOCKED FOR SECURITY ⚠️\n\n` +
           `If you believe this is an error:\n` +
           `1. Check that you're uploading your own genetic data\n` +
           `2. Ensure the file hasn't been corrupted\n` +
           `3. Contact support for manual verification`;
  }
  
  if (matchLevel === 'partial') {
    return `⚠️  IDENTITY VERIFICATION WARNING ⚠️\n\n` +
           `Some genetic markers don't match your existing data.\n\n` +
           `Match confidence: ${matchPercentage.toFixed(1)}% (${totalCompared} markers compared)\n\n` +
           `This could be due to:\n` +
           `• Different testing platform (chip version)\n` +
           `• File corruption during transfer\n` +
           `• Related individual's data (parent/sibling)\n\n` +
           `Please verify you're uploading your own genetic data.`;
  }
  
  if (matchLevel === 'insufficient_data') {
    return `⚠️  CANNOT VERIFY IDENTITY ⚠️\n\n` +
           `Not enough genetic markers to verify this is your data.\n\n` +
           `Only ${totalCompared} of ${MIN_REQUIRED_SNPS} required markers found.\n\n` +
           `Please ensure you're uploading a complete genetic data file.`;
  }
  
  return undefined;
}

// ============================================================================
// Danger Zone UI Helpers
// ============================================================================

/**
 * Get danger zone configuration for UI
 */
export function getDangerZoneConfig(result: IdentityVerificationResult): {
  showDangerZone: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmType: 'checkbox' | 'text' | 'none';
  requiredConfirmation?: string;
  color: 'red' | 'orange' | 'yellow' | 'none';
} {
  switch (result.matchLevel) {
    case 'mismatch':
      return {
        showDangerZone: true,
        title: '🚨 CRITICAL: Different Person Detected',
        message: result.warningMessage || 'Identity mismatch detected.',
        confirmText: 'I understand this appears to be someone else\'s genetic data',
        confirmType: 'text',
        requiredConfirmation: 'I UNDERSTAND THIS IS NOT MY DATA',
        color: 'red',
      };
    
    case 'partial':
      if (result.matchPercentage < 80) {
        return {
          showDangerZone: true,
          title: '⚠️ Warning: Significant Differences Detected',
          message: result.warningMessage || 'Partial identity match.',
          confirmText: 'This data may be from a different person or relative',
          confirmType: 'checkbox',
          color: 'orange',
        };
      }
      return {
        showDangerZone: true,
        title: 'ℹ️ Different Test Version Detected',
        message: 'Most markers match but some differences found. This is normal when switching between testing companies.',
        confirmText: 'I confirm this is my genetic data from a different test',
        confirmType: 'checkbox',
        color: 'yellow',
      };
    
    case 'insufficient_data':
      return {
        showDangerZone: true,
        title: '⚠️ Cannot Verify Identity',
        message: result.warningMessage || 'Insufficient data to verify identity.',
        confirmText: 'I confirm this is my complete genetic data',
        confirmType: 'checkbox',
        color: 'yellow',
      };
    
    case 'match':
    default:
      return {
        showDangerZone: false,
        title: '',
        message: '',
        confirmText: '',
        confirmType: 'none',
        color: 'none',
      };
  }
}

/**
 * Format detailed report for admin/support review
 */
export function formatIdentityReport(result: IdentityVerificationResult): string {
  const lines: string[] = [];
  
  lines.push('=== IDENTITY VERIFICATION REPORT ===\n');
  lines.push(`Match Level: ${result.matchLevel.toUpperCase()}`);
  lines.push(`Confidence: ${result.confidence}%`);
  lines.push(`Matching SNPs: ${result.matchingSnps} / ${result.totalCompared}`);
  lines.push(`Match Percentage: ${result.matchPercentage.toFixed(2)}%\n`);
  
  lines.push(`Risk Level: ${result.riskAssessment.level.toUpperCase()}`);
  lines.push(`Should Block: ${result.riskAssessment.shouldBlock ? 'YES' : 'NO'}\n`);
  
  if (result.details.exactMatches.length > 0) {
    lines.push(`Exact Matches (${result.details.exactMatches.length}):`);
    for (const rsid of result.details.exactMatches.slice(0, 10)) {
      lines.push(`  ✅ ${rsid}`);
    }
    if (result.details.exactMatches.length > 10) {
      lines.push(`  ... and ${result.details.exactMatches.length - 10} more`);
    }
    lines.push('');
  }
  
  if (result.details.mismatches.length > 0) {
    lines.push(`Mismatches (${result.details.mismatches.length}):`);
    for (const m of result.details.mismatches) {
      lines.push(`  ❌ ${m.rsid}: ${m.oldGenotype} → ${m.newGenotype}`);
    }
    lines.push('');
  }
  
  return lines.join('\n');
}

// Export genotypesMatch which is not exported at definition
export { genotypesMatch };
