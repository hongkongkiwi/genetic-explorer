/**
 * Identity Verification Tests
 */

import { describe, it, expect } from 'vitest';
import { verifyIdentity, genotypesMatch, getDangerZoneConfig } from './identityVerification';
import type { SNP } from './genomeParser';

describe('Identity Verification', () => {
  describe('genotypesMatch', () => {
    it('should match identical genotypes', () => {
      expect(genotypesMatch('AA', 'AA')).toBe(true);
      expect(genotypesMatch('CT', 'CT')).toBe(true);
    });

    it('should match strand-flipped genotypes', () => {
      expect(genotypesMatch('AT', 'TA')).toBe(true);
      expect(genotypesMatch('CG', 'GC')).toBe(true);
    });

    it('should not match different genotypes', () => {
      expect(genotypesMatch('AA', 'AT')).toBe(false);
      expect(genotypesMatch('CC', 'GG')).toBe(false);
    });

    it('should handle no-calls', () => {
      expect(genotypesMatch('AA', '--')).toBe(false);
      expect(genotypesMatch('--', '--')).toBe(false);
    });
  });

  describe('verifyIdentity', () => {
    const createSnp = (rsid: string, genotype: string): SNP => ({
      rsid,
      chromosome: '1',
      position: 1000,
      genotype,
    });

    it('should detect matching identity', () => {
      const oldSnps: SNP[] = [
        createSnp('rs1042522', 'GG'),
        createSnp('rs1801133', 'AA'),
        createSnp('rs1799983', 'TT'),
        createSnp('rs4680', 'AA'),
        createSnp('rs6277', 'CC'),
        createSnp('rs1800955', 'GG'),
        createSnp('rs25531', 'TT'),
        createSnp('rs6354', 'AA'),
        createSnp('rs2283265', 'GG'),
        createSnp('rs3807375', 'CC'),
        createSnp('rs769224', 'AA'),
        createSnp('rs6444724', 'TT'),
      ];

      // Same genotypes = match
      const result = verifyIdentity(oldSnps, oldSnps);
      
      expect(result.matchLevel).toBe('match');
      expect(result.confidence).toBeGreaterThan(80);
      expect(result.riskAssessment.shouldBlock).toBe(false);
    });

    it('should detect different identity', () => {
      const oldSnps: SNP[] = [
        createSnp('rs1042522', 'GG'),
        createSnp('rs1801133', 'AA'),
        createSnp('rs1799983', 'TT'),
        createSnp('rs4680', 'AA'),
        createSnp('rs6277', 'CC'),
        createSnp('rs1800955', 'GG'),
        createSnp('rs25531', 'TT'),
        createSnp('rs6354', 'AA'),
        createSnp('rs2283265', 'GG'),
        createSnp('rs3807375', 'CC'),
        createSnp('rs769224', 'AA'),
        createSnp('rs6444724', 'TT'),
      ];

      const newSnps: SNP[] = [
        createSnp('rs1042522', 'AA'), // Different!
        createSnp('rs1801133', 'GG'), // Different!
        createSnp('rs1799983', 'CC'), // Different!
        createSnp('rs4680', 'GG'),    // Different!
        createSnp('rs6277', 'TT'),    // Different!
        createSnp('rs1800955', 'AA'), // Different!
        createSnp('rs25531', 'AA'),   // Different!
        createSnp('rs6354', 'GG'),    // Different!
        createSnp('rs2283265', 'AA'), // Different!
        createSnp('rs3807375', 'GG'), // Different!
        createSnp('rs769224', 'TT'),  // Different!
        createSnp('rs6444724', 'GG'), // Different!
      ];

      const result = verifyIdentity(oldSnps, newSnps);
      
      expect(result.matchLevel).toBe('mismatch');
      expect(result.riskAssessment.shouldBlock).toBe(true);
      expect(result.riskAssessment.level).toBe('critical');
    });

    it('should handle partial matches', () => {
      const oldSnps: SNP[] = [
        createSnp('rs1042522', 'GG'),
        createSnp('rs1801133', 'AA'),
        createSnp('rs1799983', 'TT'),
        createSnp('rs4680', 'AA'),
        createSnp('rs6277', 'CC'),
        createSnp('rs1800955', 'GG'),
        createSnp('rs25531', 'TT'),
        createSnp('rs6354', 'AA'),
        createSnp('rs2283265', 'GG'),
        createSnp('rs3807375', 'CC'),
      ];

      const newSnps: SNP[] = [
        createSnp('rs1042522', 'GG'), // Match
        createSnp('rs1801133', 'AA'), // Match
        createSnp('rs1799983', 'TT'), // Match
        createSnp('rs4680', 'GG'),    // Different
        createSnp('rs6277', 'TT'),    // Different
        createSnp('rs1800955', 'GG'), // Match
        createSnp('rs25531', 'TT'),   // Match
        createSnp('rs6354', 'GG'),    // Different
        createSnp('rs2283265', 'AA'), // Different
        createSnp('rs3807375', 'CC'), // Match
      ];

      const result = verifyIdentity(oldSnps, newSnps);
      
      expect(result.matchLevel).toBe('partial');
      expect(result.matchPercentage).toBeGreaterThan(50);
      expect(result.matchPercentage).toBeLessThan(90);
    });

    it('should handle insufficient data', () => {
      const oldSnps: SNP[] = [
        createSnp('rs1042522', 'GG'),
        createSnp('rs1801133', 'AA'),
      ];

      const newSnps: SNP[] = [
        createSnp('rs1042522', 'GG'),
        createSnp('rs1801133', 'AA'),
      ];

      const result = verifyIdentity(oldSnps, newSnps);
      
      expect(result.matchLevel).toBe('insufficient_data');
    });
  });

  describe('getDangerZoneConfig', () => {
    it('should return red alert for mismatch', () => {
      const result = {
        matchLevel: 'mismatch' as const,
        matchPercentage: 45,
        confidence: 80,
        matchingSnps: 5,
        totalCompared: 12,
        riskAssessment: {
          level: 'critical' as const,
          description: 'Different person',
          shouldBlock: true,
        },
        details: { exactMatches: [], mismatches: [], missingInOld: [], missingInNew: [] },
        warningMessage: 'Identity mismatch!',
      };

      const config = getDangerZoneConfig(result);
      
      expect(config.showDangerZone).toBe(true);
      expect(config.color).toBe('red');
      expect(config.confirmType).toBe('text');
      expect(config.requiredConfirmation).toBeDefined();
    });

    it('should return orange for partial match', () => {
      const result = {
        matchLevel: 'partial' as const,
        matchPercentage: 75,
        confidence: 80,
        matchingSnps: 9,
        totalCompared: 12,
        riskAssessment: {
          level: 'high' as const,
          description: 'Partial match',
          shouldBlock: false,
        },
        details: { exactMatches: [], mismatches: [], missingInOld: [], missingInNew: [] },
        warningMessage: 'Partial match warning',
      };

      const config = getDangerZoneConfig(result);
      
      expect(config.showDangerZone).toBe(true);
      expect(config.color).toBe('orange');
    });

    it('should not show danger zone for match', () => {
      const result = {
        matchLevel: 'match' as const,
        matchPercentage: 95,
        confidence: 90,
        matchingSnps: 20,
        totalCompared: 21,
        riskAssessment: {
          level: 'low' as const,
          description: 'Same person',
          shouldBlock: false,
        },
        details: { exactMatches: [], mismatches: [], missingInOld: [], missingInNew: [] },
      };

      const config = getDangerZoneConfig(result);
      
      expect(config.showDangerZone).toBe(false);
    });
  });
});
