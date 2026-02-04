/**
 * Genome Quality Assessment Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateQualityMetrics, compareGenomeQuality, getQualitySummary } from './genomeQuality';
import type { SNP } from './genomeParser';

describe('Genome Quality', () => {
  describe('calculateQualityMetrics', () => {
    const createSnp = (rsid: string, chromosome: string, position: number): SNP => ({
      rsid,
      chromosome,
      position,
      genotype: 'AT',
    });

    it('should calculate metrics for high-quality genome', () => {
      const snps: SNP[] = [];
      
      // Add SNPs across all autosomal chromosomes
      for (let chr = 1; chr <= 22; chr++) {
        for (let i = 0; i < 50000; i++) {
          snps.push(createSnp(`rs${chr}${i}`, chr.toString(), i * 1000));
        }
      }

      const metrics = calculateQualityMetrics(snps);
      
      expect(metrics.totalSnps).toBe(snps.length);
      expect(metrics.coverage.autosomal).toBeGreaterThan(50);
      expect(metrics.qualityScore).toBeGreaterThan(50);
    });

    it('should detect health-related SNPs', () => {
      const snps: SNP[] = [
        { rsid: 'rs1042522', chromosome: '1', position: 1000, genotype: 'GG' },
        { rsid: 'rs1801133', chromosome: '1', position: 2000, genotype: 'AA' },
        { rsid: 'rs429358', chromosome: '19', position: 45411941, genotype: 'TT' },
        { rsid: 'rs7412', chromosome: '19', position: 45412079, genotype: 'CC' },
      ];

      const metrics = calculateQualityMetrics(snps);
      
      expect(metrics.healthSnps).toBeGreaterThan(0);
    });

    it('should calculate resolution correctly', () => {
      const snps: SNP[] = [];
      for (let i = 0; i < 700000; i++) {
        snps.push(createSnp(`rs${i}`, '1', i * 100));
      }

      const metrics = calculateQualityMetrics(snps);
      
      // 700k SNPs / 3200 Mbp ≈ 218 SNPs/Mbp
      expect(metrics.resolution).toBeGreaterThan(100);
    });
  });

  describe('compareGenomeQuality', () => {
    const baseMetrics = {
      totalSnps: 600000,
      coverage: { autosomal: 85, x: 80, y: 0, mt: 95 },
      resolution: 187,
      healthSnps: 15,
      ancestrySnps: 10,
      completeness: 80,
      qualityScore: 75,
    };

    it('should detect upgrade', () => {
      const newMetrics = {
        ...baseMetrics,
        totalSnps: 750000,
        qualityScore: 85,
      };

      const comparison = compareGenomeQuality(baseMetrics, newMetrics);
      
      expect(comparison.isUpgrade).toBe(true);
      expect(comparison.isSignificantUpgrade).toBe(true);
      expect(comparison.recommendation).toBe('upgrade');
    });

    it('should detect downgrade', () => {
      const newMetrics = {
        ...baseMetrics,
        totalSnps: 300000,
        qualityScore: 50,
      };

      const comparison = compareGenomeQuality(baseMetrics, newMetrics);
      
      expect(comparison.isUpgrade).toBe(false);
      expect(comparison.recommendation).toBe('downgrade');
      expect(comparison.warnings.length).toBeGreaterThan(0);
    });

    it('should detect similar quality', () => {
      const comparison = compareGenomeQuality(baseMetrics, baseMetrics);
      
      expect(comparison.isUpgrade).toBe(false);
      expect(comparison.isSignificantUpgrade).toBe(false);
      expect(comparison.recommendation).toBe('similar');
    });

    it('should flag for review with mixed signals', () => {
      const newMetrics = {
        ...baseMetrics,
        totalSnps: 200000, // Much lower
        healthSnps: 20,    // But more health SNPs
        qualityScore: 65,
      };

      const comparison = compareGenomeQuality(baseMetrics, newMetrics);
      
      expect(comparison.recommendation).toBe('review');
    });
  });

  describe('getQualitySummary', () => {
    it('should format summary correctly', () => {
      const metrics = {
        totalSnps: 650000,
        coverage: { autosomal: 85, x: 80, y: 0, mt: 95 },
        resolution: 203,
        healthSnps: 12,
        ancestrySnps: 8,
        completeness: 82,
        qualityScore: 78,
      };

      const summary = getQualitySummary(metrics);
      
      expect(summary).toContain('650,000');
      expect(summary).toContain('85.0%');
      expect(summary).toContain('12 health variants');
      expect(summary).toContain('78/100');
    });

    it('should omit health SNPs when zero', () => {
      const metrics = {
        totalSnps: 1000,
        coverage: { autosomal: 10, x: 0, y: 0, mt: 0 },
        resolution: 0.3,
        healthSnps: 0,
        ancestrySnps: 0,
        completeness: 5,
        qualityScore: 10,
      };

      const summary = getQualitySummary(metrics);
      
      expect(summary).not.toContain('health');
    });
  });
});
